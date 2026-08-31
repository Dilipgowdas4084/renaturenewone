const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET         = process.env.JWT_SECRET         || 'renature-jwt-secret-2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'renature-refresh-secret-2026';

const generateAccessToken  = (user) => jwt.sign({ id: user.id, role: user.role }, JWT_SECRET,         { expiresIn: '15m' });
const generateRefreshToken = (user) => jwt.sign({ id: user.id, role: user.role }, JWT_REFRESH_SECRET, { expiresIn: '7d'  });

const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// ─── register ─────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, collegeEmail, usn, phone, password } = req.body;

    if (!PASSWORD_POLICY.test(password || '')) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters with an uppercase letter, lowercase letter, and a number',
      });
    }

    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [collegeEmail]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, usn, phone, password_hash, role) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, email, role',
      [name, collegeEmail, usn || null, phone || null, passwordHash, 'member']
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
    const { collegeEmail, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [collegeEmail]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user  = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
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
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('me error:', err);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
};

module.exports = { register, login, refresh, me };
