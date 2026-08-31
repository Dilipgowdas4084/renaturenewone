const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Admin routes
router.get('/stats', verifyToken, requireRole('admin'), adminController.getStats);
router.get('/export/:eventId', verifyToken, requireRole('admin'), adminController.exportEventData);

module.exports = router;
