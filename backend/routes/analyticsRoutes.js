const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Admin only
router.get('/heatmap', requireAuth, requireAdmin, analyticsController.getHeatmapAndTemporal);

module.exports = router;
