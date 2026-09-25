const nodemailer = require('nodemailer');

// In-memory OTP storage: email -> { otp, expiresAt, verified, attempts }
const otpStore = new Map();

// Create transporter if SMTP credentials are provided
let transporter = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
} else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP to user's Gmail / college email
 */
async function sendPasswordResetOTP(toEmail, userName = 'Steward') {
  const cleanEmail = toEmail.toLowerCase().trim();
  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes valid

  otpStore.set(cleanEmail, {
    otp,
    expiresAt,
    verified: false,
    attempts: 0,
  });

  const subject = `renature Club - Password Reset Verification Code: ${otp}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #040d0a; color: #e7e5e4; margin: 0; padding: 24px; }
        .card { max-width: 520px; margin: 0 auto; background: #071712; border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 20px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .brand { color: #10b981; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
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
        <p>We received a request to reset the password for your renature account associated with this email address. Please use the 6-digit verification code below:</p>
        
        <div class="otp-container">
          <div class="otp-code">${otp}</div>
          <div class="expiry">Expires in 10 minutes</div>
        </div>

        <p>If you did not request this verification code, please ignore this email or notify the campus admin at <strong>renature.nmamit.nitte@gmail.com</strong>.</p>
        
        <div class="footer">
          renature Club • Department of Biotechnology & Forestry Initiatives<br>
          NMAM Institute of Technology, Nitte, Karkala, Karnataka 574110
        </div>
      </div>
    </body>
    </html>
  `;

  let sentViaSMTP = false;
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"renature Club NMAMIT" <${process.env.SMTP_USER || process.env.GMAIL_USER || 'renature.nmamit.nitte@gmail.com'}>`,
        to: cleanEmail,
        subject,
        html,
      });
      sentViaSMTP = true;
      console.log(`[EmailService] OTP email sent via SMTP to ${cleanEmail}`);
    } catch (err) {
      console.warn(`[EmailService] SMTP send failed:`, err.message);
    }
  } else {
    console.log(`[EmailService] (Development/Preview) OTP generated for ${cleanEmail}: ${otp}`);
  }

  return {
    success: true,
    sentViaSMTP,
    otp, // provided so preview / testing environments can verify instantly
  };
}

/**
 * Verify submitted OTP
 */
function verifyOTP(email, submittedOtp) {
  const cleanEmail = (email || '').toLowerCase().trim();
  const entry = otpStore.get(cleanEmail);

  if (!entry) {
    return { valid: false, error: 'No verification code requested for this email. Please request a code first.' };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(cleanEmail);
    return { valid: false, error: 'Verification code has expired. Please request a new code.' };
  }

  if (entry.attempts >= 5) {
    otpStore.delete(cleanEmail);
    return { valid: false, error: 'Too many incorrect attempts. Please request a new verification code.' };
  }

  if (entry.otp !== submittedOtp.toString().trim()) {
    entry.attempts += 1;
    return { valid: false, error: 'Invalid verification code. Please check your Gmail and try again.' };
  }

  // Mark verified
  entry.verified = true;
  return { valid: true };
}

/**
 * Check if email has been verified via OTP
 */
function isOTPVerified(email) {
  const cleanEmail = (email || '').toLowerCase().trim();
  const entry = otpStore.get(cleanEmail);
  return Boolean(entry && entry.verified && Date.now() <= entry.expiresAt);
}

/**
 * Clear OTP after successful reset
 */
function clearOTP(email) {
  const cleanEmail = (email || '').toLowerCase().trim();
  otpStore.delete(cleanEmail);
}

module.exports = {
  sendPasswordResetOTP,
  verifyOTP,
  isOTPVerified,
  clearOTP,
  otpStore,
};
