const db = require('../config/db.config');

class Location {
  /**
   * Get all locations
   * @returns {Promise<Array>} Array of location objects
   */
  static async findAll() {
    const sql = 'SELECT * FROM locations ORDER BY barangay_name, municipality';
    const [rows] = await db.query(sql);
    return rows;
  }

  /**
   * Find location by ID
   * @param {number} locationId - Location ID
   * @returns {Promise<Object|null>} Location object or null
   */
  static async findById(locationId) {
    const sql = 'SELECT * FROM locations WHERE location_id = ?';
    const [rows] = await db.query(sql, [locationId]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Create new location
   * @param {Object} locationData - Location data
   * @returns {Promise<Object>} Created location object
   */
  static async create(locationData) {
    const { barangay_name, municipality, province, zone_or_street } = locationData;
    const sql = `
      INSERT INTO locations (barangay_name, municipality, province, zone_or_street)
      VALUES (?, ?, ?, ?)
    `;
    const params = [barangay_name, municipality, province, zone_or_street || null];
    
    try {
      const result = await db.execute(sql, params);
      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update location
   * @param {number} locationId - Location ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated location object
   */
  static async update(locationId, updateData) {
    const allowedFields = ['barangay_name', 'municipality', 'province', 'zone_or_street'];
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

    values.push(locationId);
    const sql = `UPDATE locations SET ${updates.join(', ')} WHERE location_id = ?`;
    
    await db.query(sql, values);
    return await this.findById(locationId);
  }

  /**
   * Delete location
   * @param {number} locationId - Location ID
   * @returns {Promise<boolean>} True if deleted
   */
  static async delete(locationId) {
    const sql = 'DELETE FROM locations WHERE location_id = ?';
    await db.query(sql, [locationId]);
    return true;
  }
}

module.exports = Location;
