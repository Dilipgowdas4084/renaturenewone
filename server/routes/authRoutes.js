const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refresh,
  me,
  sendOtp,
  verifyOtp,
  resetPassword,
  googleAuth,
  linkGoogleAccount
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/forgot-password', resetPassword);
router.post('/google', googleAuth);
router.post('/google/link', verifyToken, linkGoogleAccount);
router.get('/me', verifyToken, me);

module.exports = router;
