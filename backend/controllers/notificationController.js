const Notification = require('../models/Notification');

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
    const notifications = await Notification.findForUser(userId, 20);

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
  markNotificationRead
};

