const db = require('../config/db.config');

class PasswordResetRequest {
  static async create({ user_id, email, request_type, description, metadata }) {
    const sql = `
      INSERT INTO password_reset_requests (user_id, email, request_type, description, metadata)
      VALUES (?, ?, ?, ?, ?)
    `;
    const metaStr = metadata ? JSON.stringify(metadata) : null;
    const result = await db.execute(sql, [
      user_id || null,
      email,
      request_type,
      description,
      metaStr
    ]);
    return await this.findById(result.insertId);
  }

  static async findById(id) {
    const sql = `
      SELECT
        request_id,
        user_id,
        email,
        request_type,
        description,
        metadata,
        status,
        created_at,
        updated_at,
        resolved_at
      FROM password_reset_requests
      WHERE request_id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async findLatestByEmail(email) {
    const sql = `
      SELECT
        request_id,
        user_id,
        email,
        request_type,
        description,
        metadata,
        status,
        created_at,
        updated_at,
        resolved_at
      FROM password_reset_requests
      WHERE email = ?
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const [rows] = await db.query(sql, [email]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async listRecent(limit = 20) {
    const sql = `
      SELECT
        pr.*,
        u.full_name,
        u.is_active
      FROM password_reset_requests pr
      LEFT JOIN users u ON pr.user_id = u.user_id
      ORDER BY pr.created_at DESC
      LIMIT ?
    `;
    const [rows] = await db.query(sql, [limit]);
    return rows;
  }

  static async listPending(limit = 50) {
    const sql = `
      SELECT
        pr.*,
        u.full_name,
        u.is_active
      FROM password_reset_requests pr
      LEFT JOIN users u ON pr.user_id = u.user_id
      WHERE pr.status = 'pending'
      ORDER BY pr.created_at ASC
      LIMIT ?
    `;
    const [rows] = await db.query(sql, [limit]);
    return rows;
  }

  static async setStatus(id, status) {
    const allowed = ['pending', 'accepted', 'denied', 'completed'];
    if (!allowed.includes(status)) {
      throw new Error('Invalid status');
    }
    const sql = `
      UPDATE password_reset_requests
      SET status = ?, resolved_at = CASE WHEN ? IN ('accepted','denied','completed') THEN NOW() ELSE resolved_at END
      WHERE request_id = ?
    `;
    await db.query(sql, [status, status, id]);
    return await this.findById(id);
  }
}

module.exports = PasswordResetRequest;

