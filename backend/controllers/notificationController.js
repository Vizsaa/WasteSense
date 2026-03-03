const Notification = require('../models/Notification');
const Schedule = require('../models/Schedule');

/**
 * Get current user's notifications
 */
const getMyNotifications = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.session.userId;
    const rawLimit = req.query?.limit;
    let limit = 20;
    if (rawLimit !== undefined) {
      const parsed = parseInt(rawLimit, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, 50);
      }
    }

    const notifications = await Notification.findForUser(userId, limit);

    res.json({
      status: 'success',
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get notifications'
    });
  }
};

/**
 * Generate reminder notifications for the current user's upcoming schedules.
 * This is called by the frontend on dashboard load to avoid needing a background job.
 */
const generateScheduleReminders = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.session.userId;
    const schedules = await Schedule.getUpcomingForUser(userId);

    // Create reminders for schedules happening today or tomorrow (if not already sent today)
    const now = new Date();
    const todayIso = now.toISOString().split('T')[0];
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowIso = tomorrow.toISOString().split('T')[0];

    let createdCount = 0;

    for (const s of schedules || []) {
      const nextDate = s.next_collection_date;
      if (!nextDate) continue;

      if (nextDate !== todayIso && nextDate !== tomorrowIso) continue;

      const already = await Notification.reminderExistsForDay(userId, s.schedule_id, todayIso);
      if (already) continue;

      const whenText = nextDate === todayIso ? 'today' : 'tomorrow';
      const wasteType = s.waste_category_name || s.waste_type || 'waste';
      const area = s.barangay_name ? `${s.barangay_name}${s.municipality ? ', ' + s.municipality : ''}` : 'your area';

      await Notification.create({
        user_id: userId,
        schedule_id: s.schedule_id,
        notification_type: 'reminder',
        message: `Reminder: ${wasteType} collection is scheduled ${whenText} for ${area}.`
      });
      createdCount += 1;
    }

    return res.json({
      status: 'success',
      data: { created: createdCount }
    });
  } catch (error) {
    console.error('Generate schedule reminders error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to generate reminders'
    });
  }
};

/**
 * Mark a notification as read
 */
const markNotificationRead = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.session.userId;
    const { id } = req.params;

    const updated = await Notification.markRead(id, userId);

    res.json({
      status: 'success',
      data: updated
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update notification'
    });
  }
};

module.exports = {
  getMyNotifications,
  markNotificationRead,
  generateScheduleReminders
};

