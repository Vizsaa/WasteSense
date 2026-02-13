const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Public route to get schedules by location (with authorization checks)
router.get('/by-location/:locationId', scheduleController.getSchedulesByLocation);

// Authenticated routes
router.use(requireAuth);

// User routes - get their own schedules
router.get('/upcoming', scheduleController.getUpcomingSchedules);
router.get('/', scheduleController.getSchedulesByUser);

// Admin only routes
router.post('/', requireAdmin, scheduleController.createSchedule);
router.put('/:id', requireAdmin, scheduleController.updateSchedule);
router.delete('/:id', requireAdmin, scheduleController.deleteSchedule);

module.exports = router;