const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Admin routes
router.post('/', verifyToken, requireRole('admin'), resultController.addResult);
router.put('/:id', verifyToken, requireRole('admin'), resultController.updateResult);
router.get('/event/:eventId', verifyToken, requireRole('admin'), resultController.getEventResults);

module.exports = router;
