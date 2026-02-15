const db = require('../config/db.config');
const bcrypt = require('bcrypt');

class User {
  /**
   * Create a new user
   * @param {Object} userData - User data object
   * @returns {Promise<Object>} Created user object (without password)
   */
  static async create(userData) {
    const { email, password, full_name, role, phone_number, address, barangay_id } = userData;
    
    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const sql = `
      INSERT INTO users (email, password_hash, full_name, role, phone_number, address, barangay_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [email, password_hash, full_name, role, phone_number || null, address || null, barangay_id || null];
    
    try {
      const result = await db.execute(sql, params);
      return await this.findById(result.insertId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  /**
   * Get all users (for admin dashboards)
   * @returns {Promise<Array>} Array of user objects
   */
  static async findAll() {
    const sql = `
      SELECT 
        user_id,
        email,
        full_name,
        role,
        phone_number,
        address,
        barangay_id,
        is_active,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  /**
   * Admin: update role / active status
   * @param {number} userId
   * @param {{ role?: string, is_active?: boolean }} updateData
   */
  static async updateAdmin(userId, updateData) {
    const allowedFields = ['role', 'is_active'];
    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(updateData[field]);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid admin fields to update');
    }

    values.push(userId);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`;

    await db.query(sql, values);
    // Return basic admin view of user (including is_active)
    const sqlSelect = `
      SELECT 
        user_id,
        email,
        full_name,
        role,
        phone_number,
        address,
        barangay_id,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE user_id = ?
    `;
    const [rows] = await db.query(sqlSelect, [userId]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Find user by email (active users only, used for login)
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE';
    const [rows] = await db.query(sql, [email]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Check if an email already exists (active or inactive, used for registration)
   * @param {string} email - User email
   * @returns {Promise<boolean>} True if email exists
   */
  static async emailExists(email) {
    const sql = 'SELECT user_id FROM users WHERE email = ?';
    const [rows] = await db.query(sql, [email]);
    return rows.length > 0;
  }

  /**
   * Find user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  static async findById(userId) {
    const sql = 'SELECT user_id, email, full_name, role, phone_number, address, barangay_id, profile_picture, created_at, updated_at FROM users WHERE user_id = ? AND is_active = TRUE';
    const [rows] = await db.query(sql, [userId]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Verify user password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>} True if password matches
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update user information
   * @param {number} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user object
   */
  static async update(userId, updateData) {
    const allowedFields = ['full_name', 'phone_number', 'address', 'barangay_id', 'profile_picture'];
    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(updateData[field]);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(userId);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`;

    await db.query(sql, values);
    return await this.findById(userId);
  }

  /**
   * Get all users by role
   * @param {string} role - User role
   * @returns {Promise<Array>} Array of user objects
   */
  static async findByRole(role) {
    const sql = 'SELECT user_id, email, full_name, role, phone_number, address, barangay_id, created_at FROM users WHERE role = ? AND is_active = TRUE';
    const [rows] = await db.query(sql, [role]);
    return rows;
  }
}

module.exports = User;
