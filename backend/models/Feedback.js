const db = require('../config/db.config');

class Feedback {
  static async create({ user_id, message }) {
    const sql = `INSERT INTO feedback (user_id, message) VALUES (?, ?)`;
    const safeMessage = String(message || '').trim();

    const result = await db.execute(sql, [user_id, safeMessage]);
    return await this.findById(result.insertId);
  }

  static async findById(feedbackId) {
    const sql = `
      SELECT f.*, u.full_name, u.email
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.user_id
      WHERE f.feedback_id = ?
    `;
    const [rows] = await db.query(sql, [feedbackId]);
    return rows && rows.length > 0 ? rows[0] : null;
  }

  static async listLatest(limit = 50) {
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
    const sql = `
      SELECT f.*, u.full_name, u.email
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.user_id
      ORDER BY f.created_at DESC
      LIMIT ${safeLimit}
    `;
    const [rows] = await db.query(sql);
    return rows;
  }
}

module.exports = Feedback;
