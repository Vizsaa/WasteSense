const db = require('../config/db.config');

class Notification {
  /**
   * Create a new notification
   */
  static async create({ user_id, schedule_id = null, notification_type, message }) {
    const sql = `
      INSERT INTO notifications (user_id, schedule_id, notification_type, message)
      VALUES (?, ?, ?, ?)
    `;
    const params = [user_id, schedule_id, notification_type, message];
    const result = await db.execute(sql, params);
    return await this.findById(result.insertId);
  }

  /**
   * Find notification by ID
   */
  static async findById(id) {
    const sql = `
      SELECT notification_id, user_id, schedule_id, notification_type, message, is_read, sent_at
      FROM notifications
      WHERE notification_id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Get notifications for a user (most recent first)
   */
  static async findForUser(userId, limit = 20) {
    const sql = `
      SELECT notification_id, user_id, schedule_id, notification_type, message, is_read, sent_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY sent_at DESC
      LIMIT ?
    `;
    const [rows] = await db.query(sql, [userId, limit]);
    return rows;
  }

  /**
   * Mark a notification as read for a user
   */
  static async markRead(notificationId, userId) {
    const sql = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE notification_id = ? AND user_id = ?
    `;
    await db.query(sql, [notificationId, userId]);
    return this.findById(notificationId);
  }

  /**
   * Check whether a reminder notification already exists for a given user + schedule on a given day.
   * @param {number} userId
   * @param {number} scheduleId
   * @param {string} isoDay - YYYY-MM-DD
   * @returns {Promise<boolean>}
   */
  static async reminderExistsForDay(userId, scheduleId, isoDay) {
    const sql = `
      SELECT notification_id
      FROM notifications
      WHERE user_id = ?
        AND schedule_id = ?
        AND notification_type = 'reminder'
        AND DATE(sent_at) = ?
      LIMIT 1
    `;
    const [rows] = await db.query(sql, [userId, scheduleId, isoDay]);
    return rows && rows.length > 0;
  }
}

module.exports = Notification;

