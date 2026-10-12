require('./loadEnv');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/*
 * Secure OTP and Password Reset Token store.
 *
 * Structure per email key:
 * {
 *   otpHash:              string | null, // bcrypt hash of 6-digit OTP — never plaintext
 *   expiresAt:            number,        // epoch ms for OTP validity
 *   attempts:             number,        // failed attempts against current OTP
 *   genCount:             number,        // how many OTPs generated this window
 *   windowEnd:            number,        // epoch ms when rate-limit window resets
 *   resetToken:           string | null, // cryptographically random single-use token
 *   resetTokenExpiresAt:  number | null, // epoch ms for reset token validity
 *   isResetting:          boolean,       // atomic in-progress lock during password update
 * }
 *
 * Plaintext OTP exists exclusively on the call stack of sendPasswordResetOTP
 * long enough to be dispatched via SMTP, then is immediately discarded.
 */
const otpStore = new Map();

const OTP_TTL_MS          = 10 * 60 * 1000;  // 10 minutes for OTP verification
const RESET_TOKEN_TTL_MS  = 10 * 60 * 1000;  // 10 minutes to complete password reset
const MAX_ATTEMPTS        = 5;               // incorrect guesses before OTP is invalidated
const RATE_WINDOW_MS      = 10 * 60 * 1000;  // rolling window for generation rate-limit
const MAX_GEN_PER_WINDOW   = 3;               // max new OTPs per email per window

// ---------------------------------------------------------------------------
// Build the nodemailer transporter dynamically from environment variables.
// Supported configurations (checked in order):
//   1. Generic SMTP:  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE
//   2. Gmail helper:  GMAIL_USER, GMAIL_APP_PASSWORD
// ---------------------------------------------------------------------------
let cachedTransporter = null;

function buildTransporter() {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
      port:   parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return null;
}

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  cachedTransporter = buildTransporter();
  return cachedTransporter;
}

function resetTransporter() {
  cachedTransporter = null;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Generate a cryptographically secure 6-digit numeric OTP.
 * Uses crypto.randomInt so the output is uniformly distributed and unpredictable.
 */
function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Constant-time string equality check to prevent timing attacks.
 */
function timingSafeEqualStr(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Synchronously checks and reserves an OTP generation slot for an email.
 * This runs atomically in a single event-loop turn with NO await calls,
 * preventing concurrent requests from racing past the rate limit.
 */
function reserveRateLimitSlot(cleanEmail) {
  const now = Date.now();
  let entry = otpStore.get(cleanEmail);

  if (!entry) {
    entry = {
      genCount: 1,
      windowEnd: now + RATE_WINDOW_MS,
    };
    otpStore.set(cleanEmail, entry);
    return true;
  }

  // Reset rate window if it has passed
  if (now > (entry.windowEnd || 0)) {
    entry.genCount = 1;
    entry.windowEnd = now + RATE_WINDOW_MS;
    return true;
  }

  if ((entry.genCount || 0) >= MAX_GEN_PER_WINDOW) {
    return false;
  }

  entry.genCount = (entry.genCount || 0) + 1;
  return true;
}

/**
 * Rolls back a reserved rate-limit slot if email delivery fails.
 */
function releaseRateLimitSlot(cleanEmail) {
  const entry = otpStore.get(cleanEmail);
  if (entry && typeof entry.genCount === 'number' && entry.genCount > 0) {
    entry.genCount -= 1;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a secure OTP, store its bcrypt hash, and email it to the user.
 *
 * @returns {{ success: boolean, sentViaSMTP: boolean }}
 *   Never returns the OTP itself. Throws on SMTP failure or rate-limit.
 */
async function sendPasswordResetOTP(toEmail, userName = 'Steward') {
  const cleanEmail = toEmail.toLowerCase().trim();

  // 1. Verify transporter availability first
  const activeTransporter = getTransporter();
  if (!activeTransporter) {
    const err = new Error(
      'Email delivery is not configured on this server. ' +
      'Please ask the administrator to set GMAIL_USER and GMAIL_APP_PASSWORD (or SMTP_USER / SMTP_PASS) in the server environment.'
    );
    err.statusCode = 503;
    throw err;
  }

  // 2. Synchronously check & reserve rate-limit slot BEFORE any async work
  if (!reserveRateLimitSlot(cleanEmail)) {
    const err = new Error('Too many verification code requests. Please wait a few minutes before trying again.');
    err.statusCode = 429;
    throw err;
  }

  // 3. Generate and immediately hash the OTP
  let otp;
  let otpHash;
  try {
    otp = generateOTP();
    otpHash = await bcrypt.hash(otp, 10);
  } catch (hashErr) {
    releaseRateLimitSlot(cleanEmail);
    throw hashErr;
  }

  const now = Date.now();
  const entry = otpStore.get(cleanEmail);
  entry.otpHash = otpHash;
  entry.expiresAt = now + OTP_TTL_MS;
  entry.attempts = 0;
  // Clear any existing reset token because a new OTP was issued
  entry.resetToken = null;
  entry.resetTokenExpiresAt = null;
  entry.isResetting = false;

  // 4. Build and send the email
  const subject = 'renature Club – Password Reset Verification Code';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #040d0a; color: #e7e5e4; margin: 0; padding: 24px; }
        .card { max-width: 520px; margin: 0 auto; background: #071712; border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 20px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .brand { color: #10b981; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
        h1 { color: #ffffff; font-size: 24px; margin-top: 0; margin-bottom: 12px; }
        p { color: #a8a29e; font-size: 14px; line-height: 1.6; margin-bottom: 20px; }
        .otp-container { background: #040d0a; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 18px; text-align: center; margin: 24px 0; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; color: #34d399; letter-spacing: 8px; }
        .expiry { color: #f59e0b; font-size: 12px; font-weight: 600; margin-top: 8px; }
        .footer { font-size: 11px; color: #78716c; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="brand">🌿 renature NMAMIT</div>
        <h1>Password Reset Request</h1>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>We received a request to reset the password for your renature account. Please use the 6-digit verification code below:</p>

        <div class="otp-container">
          <div class="otp-code">${otp}</div>
          <div class="expiry">Expires in 10 minutes</div>
        </div>

        <p>If you did not request this code, please ignore this email or notify campus admin at <strong>renature.nmamit.nitte@gmail.com</strong>.</p>

        <div class="footer">
          renature Club • NMAM Institute of Technology, Nitte, Karkala, Karnataka 574110<br>
          This is an automated message — do not reply.
        </div>
      </div>
    </body>
    </html>
  `;

  const fromAddress = process.env.SMTP_USER || process.env.GMAIL_USER || 'renature.nmamit.nitte@gmail.com';

  try {
    await activeTransporter.sendMail({
      from: `"renature Club NMAMIT" <${fromAddress}>`,
      to:   cleanEmail,
      subject,
      html,
    });
    // Log only that an email was dispatched — never log the OTP
    console.log(`[EmailService] Password reset email dispatched to ${cleanEmail}`);
  } catch (smtpErr) {
    console.warn(`[EmailService] SMTP send failed for ${cleanEmail}:`, smtpErr.message);
    // Roll back rate-limit slot on infrastructure failure so user is not penalized
    releaseRateLimitSlot(cleanEmail);
    const err = new Error('Failed to send the verification email. Please try again later or contact support.');
    err.statusCode = 502;
    throw err;
  }

  // The plaintext OTP goes out of scope here — never returned to the caller
  return { success: true, sentViaSMTP: true };
}

/**
 * Verify a submitted OTP against the stored bcrypt hash.
 * Enforces expiry, attempt limits, and single-use.
 * On success, issues a single-use cryptographically random reset token.
 */
function verifyOTP(email, submittedOtp) {
  const cleanEmail = (email || '').toLowerCase().trim();
  const entry = otpStore.get(cleanEmail);

  if (!entry || !entry.otpHash) {
    return { valid: false, error: 'Invalid or expired verification code. Please request a new code.' };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(cleanEmail);
    return { valid: false, error: 'Verification code has expired. Please request a new code.' };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(cleanEmail);
    return { valid: false, error: 'Too many incorrect attempts. Please request a new verification code.' };
  }

  // Synchronous bcrypt compare — runs atomically without yielding
  const isMatch = bcrypt.compareSync(submittedOtp.toString().trim(), entry.otpHash);

  if (!isMatch) {
    entry.attempts += 1;
    const remaining = MAX_ATTEMPTS - entry.attempts;
    const hint = remaining > 0 ? ` ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` : '';
    return { valid: false, error: `Invalid verification code.${hint}` };
  }

  // Invalidate OTP hash immediately so it can never be verified again
  entry.otpHash = null;

  // Issue a cryptographically random, single-use reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const now = Date.now();

  entry.resetToken = resetToken;
  entry.resetTokenExpiresAt = now + RESET_TOKEN_TTL_MS;
  entry.isResetting = false;

  return { valid: true, resetToken };
}

/**
 * Atomically validates and claims a reset token for a password update.
 * If another request is currently resetting the password with this token,
 * it is rejected, preventing concurrent execution.
 */
function claimResetToken(email, token) {
  const cleanEmail = (email || '').toLowerCase().trim();
  const entry = otpStore.get(cleanEmail);

  if (!entry || !entry.resetToken) {
    return { valid: false, error: 'Identity verification required. Please complete the OTP step first.' };
  }

  if (Date.now() > (entry.resetTokenExpiresAt || 0)) {
    otpStore.delete(cleanEmail);
    return { valid: false, error: 'Verification session has expired. Please request a new verification code.' };
  }

  if (!token || !timingSafeEqualStr(entry.resetToken, token.trim())) {
    return { valid: false, error: 'Invalid verification token. Please verify your OTP again.' };
  }

  if (entry.isResetting) {
    return { valid: false, error: 'A password reset is already in progress for this account. Please wait a moment.' };
  }

  // Atomically claim authorization for this reset execution
  entry.isResetting = true;
  return { valid: true };
}

/**
 * Releases the reset lock in case of an error during password update
 * (e.g. database error), allowing the caller to retry with their valid token.
 */
function releaseResetToken(email) {
  const cleanEmail = (email || '').toLowerCase().trim();
  const entry = otpStore.get(cleanEmail);
  if (entry) {
    entry.isResetting = false;
  }
}

/**
 * Returns true only if this email has a live, verified reset token.
 */
function isOTPVerified(email) {
  const cleanEmail = (email || '').toLowerCase().trim();
  const entry = otpStore.get(cleanEmail);
  return Boolean(entry && entry.resetToken && Date.now() <= (entry.resetTokenExpiresAt || 0));
}

/**
 * Invalidate and remove all OTP / reset state for an email.
 */
function clearOTP(email) {
  const cleanEmail = (email || '').toLowerCase().trim();
  otpStore.delete(cleanEmail);
}

module.exports = {
  sendPasswordResetOTP,
  verifyOTP,
  claimResetToken,
  releaseResetToken,
  isOTPVerified,
  clearOTP,
  getTransporter,
  resetTransporter,
  otpStore,
};
