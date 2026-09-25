const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Admin routes
router.get('/stats', verifyToken, requireRole('admin'), adminController.getStats);
router.get('/export/:eventId', verifyToken, requireRole('admin'), adminController.exportEventData);

// Members & Points Management
router.get('/members', verifyToken, requireRole('admin'), adminController.getMembers);
router.post('/points/award', verifyToken, requireRole('admin'), adminController.awardPoints);

// User & Member Directory CRUD
router.get('/users', verifyToken, requireRole('admin'), adminController.getUsers);
router.post('/users', verifyToken, requireRole('admin'), adminController.createUser);
router.put('/users/:id', verifyToken, requireRole('admin'), adminController.updateUser);
router.delete('/users/:id', verifyToken, requireRole('admin'), adminController.deleteUser);
router.post('/users/:id/points', verifyToken, requireRole('admin'), adminController.setUserPoints);

// Leaderboard Admin Operations
router.put('/leaderboard/:studentId', verifyToken, requireRole('admin'), adminController.updateLeaderboardEntry);
router.post('/leaderboard/entry', verifyToken, requireRole('admin'), adminController.addLeaderboardEntry);
router.delete('/leaderboard/:studentId', verifyToken, requireRole('admin'), adminController.deleteLeaderboardEntry);

// Site Content CMS (About, Contact, Home)
router.get('/site-content', adminController.getSiteContent);
router.put('/site-content', verifyToken, requireRole('admin'), adminController.updateSiteContent);

module.exports = router;
