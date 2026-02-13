const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');
const { requireAdmin } = require('../middleware/auth');

// Admin only
router.post('/', requireAdmin, performanceController.createPerformanceEntry);
router.get('/summary', requireAdmin, performanceController.getPerformanceSummary);

module.exports = router;

