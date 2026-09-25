const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Public routes
router.get('/', eventController.listEvents);
router.get('/:id', eventController.getEvent);

// Admin routes
router.post('/', verifyToken, requireRole('admin'), eventController.createEvent);
router.put('/:id', verifyToken, requireRole('admin'), eventController.updateEvent);
router.delete('/:id', verifyToken, requireRole('admin'), eventController.deleteEvent);
router.post('/:id/duplicate', verifyToken, requireRole('admin'), eventController.duplicateEvent);
router.patch('/:id/status', verifyToken, requireRole('admin'), eventController.updateEventStatus);

module.exports = router;
