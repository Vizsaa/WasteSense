const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Resident (any authenticated user) submit feedback
router.post('/', requireAuth, feedbackController.submitFeedback);

// Admin list feedback
router.get('/', requireAuth, requireAdmin, feedbackController.listFeedback);

module.exports = router;
