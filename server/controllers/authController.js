const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../db');

const JWT_SECRET         = process.env.JWT_SECRET         || 'renature-jwt-secret-2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'renature-refresh-secret-2026';

const generateAccessToken  = (user) => jwt.sign({ id: user.id, role: user.role }, JWT_SECRET,         { expiresIn: '15m' });
const generateRefreshToken = (user) => jwt.sign({ id: user.id, role: user.role }, JWT_REFRESH_SECRET, { expiresIn: '7d'  });

const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// ─── register ─────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, usn, phone, department, year } = req.body;
    // Trimmed, matching how login reads it, so stray spaces can't lock an account out.
    const password = String(req.body.password || '').trim();
    const rawEmail = (req.body.collegeEmail || req.body.email || '').trim().toLowerCase();

    // Enforce strict @nmamit.in domain restriction
    const emailParts = rawEmail.split('@');
    if (emailParts.length !== 2 || emailParts[1] !== 'nmamit.in') {
      return res.status(400).json({
        error: 'Registration is restricted to NMAMIT institutional email addresses (@nmamit.in).'
      });
    }

    if (!PASSWORD_POLICY.test(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters with an uppercase letter, lowercase letter, and a number',
      });
    }

    const exists = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [rawEmail]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, usn, phone, password_hash, role, department, year) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, name, email, role, department, year',
      [
        name,
        rawEmail,
        usn ? usn.trim().toUpperCase() : null,
        phone ? phone.trim() : null,
        passwordHash,
        'member',
        department || 'Computer Science',
        year || '1st Year'
      ]
    );

    const user          = result.rows[0];
    const token         = generateAccessToken(user);
    const refreshToken  = generateRefreshToken(user);

    res.status(201).json({ token, refreshToken, user });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// ─── login ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const rawPassword = String(req.body.password || '');
    const password = rawPassword.trim();
    const rawEmail = (req.body.collegeEmail || req.body.email || '').trim().toLowerCase();

    if (!rawEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let result = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [rawEmail]);
    let user = result.rows.length > 0 ? result.rows[0] : null;

    if (!user && !pool.hasPostgres() && pool.memoryDb && pool.memoryDb.users) {
      user = pool.memoryDb.users.find(u => (u.email || '').toLowerCase().trim() === rawEmail);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Google-only accounts do not have a password_hash; password login must never authenticate them
    if (!user.password_hash) {
      return res.status(401).json({
        error: 'This account was registered using Google Sign-In. Please sign in with Google.'
      });
    }

    let valid = false;
    if (user.password_hash) {
      try {
        valid = await bcrypt.compare(rawPassword, user.password_hash)
          || (rawPassword !== password && await bcrypt.compare(password, user.password_hash));
      } catch (bErr) {
        console.warn('bcrypt compare error:', bErr.message);
      }
    }

    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token        = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      token,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// ─── refresh ──────────────────────────────────────────────────────────────────
const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token provided' });

  jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired refresh token' });
    const token = generateAccessToken({ id: decoded.id, role: decoded.role });
    res.json({ token });
  });
};

// ─── me ───────────────────────────────────────────────────────────────────────
const me = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, usn, phone, role FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      if (req.user.role === 'admin') {
        return res.json({
          user: {
            id: req.user.id || 1,
            name: 'renature Admin',
            email: 'renature.nmamit.nitte@gmail.com',
            usn: '1RN22CS001',
            phone: '+91 8258 281263',
            role: 'admin'
          }
        });
      }
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('me error:', err);
    res.status(500).json({ error: 'Server error fetching user profile' });
  }
};

const {
  sendPasswordResetOTP,
  verifyOTP,
  claimResetToken,
  releaseResetToken,
  isOTPVerified,
  clearOTP
} = require('../utils/emailService');

// ─── send OTP to Gmail / College Email ────────────────────────────────────────
const sendOtp = async (req, res) => {
  try {
    const rawEmail = (req.body.collegeEmail || req.body.email || '').trim().toLowerCase();
    const usn = (req.body.usn || '').trim().toUpperCase();

    if (!rawEmail) {
      return res.status(400).json({ error: 'Please enter your registered email address.' });
    }

    let result = await pool.query('SELECT id, name, email, usn FROM users WHERE LOWER(email) = $1', [rawEmail]);
    let user = result.rows.length > 0 ? result.rows[0] : null;

    if (!user && !pool.hasPostgres() && pool.memoryDb && pool.memoryDb.users) {
      user = pool.memoryDb.users.find(u => (u.email || '').toLowerCase().trim() === rawEmail);
      if (user) user = { id: user.id, name: user.name, email: user.email, usn: user.usn };
    }

    // If an account is found in the authoritative store:
    if (user) {
      const storedUsn = (user.usn || '').trim().toUpperCase();

      // If a USN was supplied, validate that it matches the account's registered USN
      if (usn) {
        if (!storedUsn || storedUsn !== usn) {
          return res.status(400).json({
            error: 'The provided USN does not match the USN associated with this account. Please enter the correct USN.',
          });
        }
      }

      // sendPasswordResetOTP throws with statusCode 503 (unconfigured) or 502 (SMTP failure)
      await sendPasswordResetOTP(user.email, user.name);

      return res.json({
        success: true,
        dispatched: true,
        message: 'Verification code dispatched to your email. Please check your inbox and spam folder.',
      });
    }

    // Anti-enumeration: Return generic success for unknown accounts so
    // we never reveal whether an email address is registered in our database.
    // dispatched: false ensures the frontend never claims an email was dispatched.
    return res.json({
      success: true,
      dispatched: false,
      message: 'If an account with that email exists, a verification code may have been sent. Please check your inbox and spam folder.',
    });
  } catch (err) {
    const status = err.statusCode || 500;
    const message = (status === 429 || status === 503 || status === 502)
      ? err.message
      : 'Server error while sending verification code.';
    console.error('sendOtp error:', err.message);
    res.status(status).json({ error: message });
  }
};

// ─── verify OTP ───────────────────────────────────────────────────────────────
const verifyOtp = async (req, res) => {
  try {
    const rawEmail = (req.body.collegeEmail || req.body.email || '').trim().toLowerCase();
    const otp = (req.body.otp || '').toString().trim();

    if (!rawEmail || !otp) {
      return res.status(400).json({ error: 'Email and 6-digit OTP code are required' });
    }

    const verification = verifyOTP(rawEmail, otp);
    if (!verification.valid) {
      return res.status(400).json({ error: verification.error });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully! Please set your new password.',
      email: rawEmail,
      resetToken: verification.resetToken,
    });
  } catch (err) {
    console.error('verifyOtp error:', err);
    res.status(500).json({ error: 'Server error while verifying OTP' });
  }
};

// ─── reset password ─────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const rawEmail = (req.body.collegeEmail || req.body.email || '').trim().toLowerCase();
    const resetToken = (req.body.resetToken || '').trim();
    const newPassword = (req.body.newPassword || req.body.password || '').trim();

    if (!rawEmail) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required.' });
    }

    if (!PASSWORD_POLICY.test(newPassword)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters with an uppercase letter, a lowercase letter, and a number.',
      });
    }

    // Atomically claim the single-use reset token and lock out concurrent reset attempts
    const claim = claimResetToken(rawEmail, resetToken);
    if (!claim.valid) {
      return res.status(403).json({ error: claim.error });
    }

    try {
      let result = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [rawEmail]);
      let user = result.rows.length > 0 ? result.rows[0] : null;

      if (!user && !pool.hasPostgres() && pool.memoryDb && pool.memoryDb.users) {
        user = pool.memoryDb.users.find(u => (u.email || '').toLowerCase().trim() === rawEmail);
      }

      if (!user) {
        // Clear authorization if account is missing
        clearOTP(rawEmail);
        return res.status(404).json({ error: 'Account not found.' });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      const updateResult = await pool.query(
        'UPDATE users SET password_hash = $1 WHERE LOWER(email) = $2 RETURNING id',
        [passwordHash, rawEmail]
      );

      // Verify that the persistent update actually succeeded
      if (!updateResult.rows || updateResult.rows.length === 0) {
        throw new Error('Database update failed: user record not updated in persistent store.');
      }

      if (pool.memoryDb && pool.memoryDb.users) {
        const memUser = pool.memoryDb.users.find(u => (u.email || '').toLowerCase().trim() === rawEmail);
        if (memUser) {
          memUser.password_hash = passwordHash;
        }
      }

      // Password update succeeded! Permanently invalidate authorization
      clearOTP(rawEmail);

      res.json({
        success: true,
        message: 'Password reset successful! You can now sign in with your new credentials.',
      });
    } catch (innerErr) {
      // Release lock so the user can retry with their valid token if database write failed
      releaseResetToken(rawEmail);
      throw innerErr;
    }
  } catch (err) {
    console.error('resetPassword error:', err);
    res.status(500).json({ error: 'Server error during password reset.' });
  }
};

// ─── googleAuth ───────────────────────────────────────────────────────────────
const googleAuth = async (req, res) => {
  try {
    const idToken = req.body.idToken || req.body.credential;
    if (!idToken) {
      return res.status(400).json({ error: 'Google ID token is required.' });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      return res.status(503).json({ error: 'Google authentication is not configured on the server.' });
    }

    const client = new OAuth2Client(googleClientId);
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: googleClientId,
      });
      payload = ticket.getPayload();
    } catch (vErr) {
      console.warn('Google ID token verification failed:', vErr.message);
      return res.status(401).json({ error: 'Invalid or expired Google authentication token.' });
    }

    // 1. Verify issuer
    const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
    if (!validIssuers.includes(payload.iss)) {
      return res.status(401).json({ error: 'Invalid Google token issuer.' });
    }

    // 2. Verify email_verified is true
    if (!payload.email_verified) {
      return res.status(403).json({ error: 'Google email address is not verified by Google.' });
    }

    // 3. Verify stable subject identifier
    const googleId = payload.sub;
    if (!googleId) {
      return res.status(400).json({ error: 'Missing Google user identifier (sub).' });
    }

    // 4. Strict exact domain check: exactly 'nmamit.in' (case-insensitive)
    const email = String(payload.email || '').trim().toLowerCase();
    const domainParts = email.split('@');
    if (domainParts.length !== 2 || domainParts[1] !== 'nmamit.in') {
      return res.status(403).json({
        error: 'Google Sign-In is restricted to NMAMIT institutional accounts (@nmamit.in). Lookalike or other domains are not permitted.'
      });
    }

    // 5. Look up existing user by Google sub first
    let result = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
    let user = result.rows.length > 0 ? result.rows[0] : null;

    if (!user && !pool.hasPostgres() && pool.memoryDb && pool.memoryDb.users) {
      user = pool.memoryDb.users.find(u => u.google_id === googleId);
    }

    if (user) {
      // User is already linked with this Google identity. Authenticate them directly!
      const token = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      return res.json({
        token,
        refreshToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    }

    // 6. Check if an account already exists with this email
    let emailLookup = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [email]);
    let existingAccount = emailLookup.rows.length > 0 ? emailLookup.rows[0] : null;

    if (!existingAccount && !pool.hasPostgres() && pool.memoryDb && pool.memoryDb.users) {
      existingAccount = pool.memoryDb.users.find(u => (u.email || '').toLowerCase().trim() === email);
    }

    if (existingAccount) {
      // Security Policy: Never automatically link an existing account to Google merely because the email matches.
      return res.status(409).json({
        error: 'An account with this email address already exists. To protect your account security, automatic linking is disabled. Please sign in with your email and password.',
        code: 'ACCOUNT_LINKING_REQUIRED'
      });
    }

    // 7. Register new verified Google user
    // Role is ALWAYS 'member' - never grant admin based on Google identity or claims
    const name = (payload.name || email.split('@')[0] || 'NMAMIT Student').trim();
    const insertResult = await pool.query(
      `INSERT INTO users (name, email, role, department, year, google_id, auth_provider, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NULL)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, name, email, role, department, year`,
      [name, email, 'member', 'Computer Science', '1st Year', googleId, 'google']
    );

    let newUser = insertResult.rows.length > 0 ? insertResult.rows[0] : null;
    if (!newUser) {
      // In case of concurrent registration race condition
      const raceCheck = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [email]);
      newUser = raceCheck.rows.length > 0 ? raceCheck.rows[0] : null;
      if (!newUser || newUser.google_id !== googleId) {
        return res.status(409).json({
          error: 'An account with this email already exists.',
          code: 'ACCOUNT_LINKING_REQUIRED'
        });
      }
    }

    const token = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.status(201).json({
      token,
      refreshToken,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (err) {
    console.error('googleAuth error:', err);
    res.status(500).json({ error: 'Server error during Google authentication.' });
  }
};

// ─── linkGoogleAccount (requires existing authenticated session) ───────────────
const linkGoogleAccount = async (req, res) => {
  try {
    const idToken = req.body.idToken || req.body.credential;
    if (!idToken) {
      return res.status(400).json({ error: 'Google ID token is required.' });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      return res.status(503).json({ error: 'Google authentication is not configured on the server.' });
    }

    const client = new OAuth2Client(googleClientId);
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: googleClientId,
      });
      payload = ticket.getPayload();
    } catch (vErr) {
      return res.status(401).json({ error: 'Invalid or expired Google authentication token.' });
    }

    if (!payload.email_verified) {
      return res.status(403).json({ error: 'Google email address is not verified by Google.' });
    }

    const email = String(payload.email || '').trim().toLowerCase();
    const domainParts = email.split('@');
    if (domainParts.length !== 2 || domainParts[1] !== 'nmamit.in') {
      return res.status(403).json({
        error: 'Google Sign-In is restricted to NMAMIT institutional accounts (@nmamit.in).'
      });
    }

    // Verify current authenticated user's email matches Google token email
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const currentUser = userRes.rows.length > 0 ? userRes.rows[0] : null;
    if (!currentUser) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    if (currentUser.email.toLowerCase().trim() !== email) {
      return res.status(400).json({
        error: `Google account email (${email}) does not match your currently authenticated account email (${currentUser.email}).`
      });
    }

    const googleId = payload.sub;
    // Check if another account already linked this google_id
    const conflict = await pool.query('SELECT id FROM users WHERE google_id = $1 AND id <> $2', [googleId, req.user.id]);
    if (conflict.rows.length > 0) {
      return res.status(409).json({ error: 'This Google identity is already linked to another account.' });
    }

    await pool.query('UPDATE users SET google_id = $1, auth_provider = $2 WHERE id = $3', [googleId, 'google_linked', req.user.id]);

    if (pool.memoryDb && pool.memoryDb.users) {
      const memUser = pool.memoryDb.users.find(u => u.id === req.user.id);
      if (memUser) {
        memUser.google_id = googleId;
        memUser.auth_provider = 'google_linked';
      }
    }

    res.json({
      success: true,
      message: 'Google account linked successfully.'
    });
  } catch (err) {
    console.error('linkGoogleAccount error:', err);
    res.status(500).json({ error: 'Server error while linking Google account.' });
  }
};

module.exports = {
  register,
  login,
  refresh,
  me,
  sendOtp,
  verifyOtp,
  resetPassword,
  googleAuth,
  linkGoogleAccount
};
