const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Public routes
router.post('/', registrationController.registerForEvent);
router.get('/check/:eventId/:email', registrationController.checkDuplicate);

// Admin routes
router.get('/event/:eventId', verifyToken, requireRole('admin'), registrationController.getEventRegistrations);
router.patch('/:id/status', verifyToken, requireRole('admin'), registrationController.updateRegistrationStatus);

module.exports = router;
