const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/auth');

// All notification routes require authentication
router.use(requireAuth);

// Get current user's notifications
router.get('/', notificationController.getMyNotifications);

// Mark a notification as read
router.post('/:id/read', notificationController.markNotificationRead);

module.exports = router;

