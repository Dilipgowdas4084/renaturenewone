const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Admin routes
router.post('/', verifyToken, requireRole('admin'), attendanceController.markAttendance);
router.put('/:id', verifyToken, requireRole('admin'), attendanceController.updateAttendance);
router.get('/event/:eventId', verifyToken, requireRole('admin'), attendanceController.getEventAttendance);

module.exports = router;
