const db = require('../config/db.config');

class PerformanceTracking {
  /**
   * Create a performance tracking entry
   */
  static async create({ schedule_id, collector_id = null, planned_date, actual_date = null, status, notes = null }) {
    const sql = `
      INSERT INTO performance_tracking (schedule_id, collector_id, planned_date, actual_date, status, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [schedule_id, collector_id, planned_date, actual_date, status, notes];
    const [result] = await db.execute(sql, params);
    return this.findById(result.insertId);
  }

  /**
   * Find performance entry by ID
   */
  static async findById(id) {
    const sql = `
      SELECT tracking_id, schedule_id, collector_id, planned_date, actual_date, status, notes, created_at
      FROM performance_tracking
      WHERE tracking_id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Get simple summary counts by status
   */
  static async getSummary() {
    const sql = `
      SELECT status, COUNT(*) as count
      FROM performance_tracking
      GROUP BY status
    `;
    const [rows] = await db.query(sql);
    return rows;
  }
}

module.exports = PerformanceTracking;

