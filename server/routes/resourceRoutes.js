const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Public route
router.get('/', resourceController.listResources);

// Admin routes
router.post('/', verifyToken, requireRole('admin'), resourceController.createResource);
router.put('/:id', verifyToken, requireRole('admin'), resourceController.updateResource);
router.delete('/:id', verifyToken, requireRole('admin'), resourceController.deleteResource);

module.exports = router;
