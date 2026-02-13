const db = require('../config/db.config');

class Schedule {
  /**
   * Get schedules for a specific location
   * @param {number} locationId - Location ID
   * @returns {Promise<Array>} Array of schedule objects
   */
  static async getByLocation(locationId) {
    const sql = `
      SELECT 
        s.*,
        l.barangay_name,
        l.municipality,
        l.province
      FROM schedules s
      LEFT JOIN locations l ON s.location_id = l.location_id
      WHERE s.location_id = ? AND s.is_active = TRUE
      ORDER BY s.collection_day
    `;
    
    const [rows] = await db.query(sql, [locationId]);
    return rows;
  }

  /**
   * Get schedules for a user's location
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of schedule objects
   */
  static async getByUser(userId) {
    const sql = `
      SELECT 
        s.*,
        l.barangay_name,
        l.municipality,
        l.province
      FROM schedules s
      LEFT JOIN locations l ON s.location_id = l.location_id
      LEFT JOIN users u ON u.barangay_id = l.location_id
      WHERE u.user_id = ? AND s.is_active = TRUE
      ORDER BY s.collection_day
    `;
    
    const [rows] = await db.query(sql, [userId]);
    return rows;
  }

  /**
   * Get upcoming schedules for a user (next week)
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of upcoming schedule objects
   */
  static async getUpcomingForUser(userId) {
    const sql = `
      SELECT 
        s.*,
        l.barangay_name,
        l.municipality,
        l.province
      FROM schedules s
      LEFT JOIN locations l ON s.location_id = l.location_id
      LEFT JOIN users u ON u.barangay_id = l.location_id
      WHERE u.user_id = ? 
        AND s.is_active = TRUE
      ORDER BY 
        CASE s.collection_day
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
          WHEN 'Sunday' THEN 7
        END
    `;
    
    const [rows] = await db.query(sql, [userId]);
    
    // Calculate next dates for each schedule
    const today = new Date();
    const todayDay = today.toLocaleDateString('en-US', { weekday: 'long' });
    const result = rows.map(schedule => {
      let nextDate = new Date(today);
      
      // Find the next occurrence of the collection day
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDayIndex = daysOfWeek.indexOf(todayDay);
      const targetDayIndex = daysOfWeek.indexOf(schedule.collection_day);
      
      let daysUntilTarget = targetDayIndex - currentDayIndex;
      if (daysUntilTarget <= 0) {
        daysUntilTarget += 7; // Next week
      }
      
      nextDate.setDate(today.getDate() + daysUntilTarget);
      
      return {
        ...schedule,
        next_collection_date: nextDate.toISOString().split('T')[0],
        next_collection_datetime: nextDate
      };
    });
    
    // Sort by next collection date
    result.sort((a, b) => new Date(a.next_collection_datetime) - new Date(b.next_collection_datetime));
    
    return result;
  }

  /**
   * Create a new schedule
   * @param {Object} scheduleData - Schedule data object
   * @returns {Promise<Object>} Created schedule object
   */
  static async create(scheduleData) {
    const {
      location_id,
      collection_day,
      collection_time,
      waste_type,
      created_by
    } = scheduleData;

    const sql = `
      INSERT INTO schedules
      (location_id, collection_day, collection_time, waste_type, created_by)
      VALUES (?, ?, ?, ?, ?)
    `;

    const params = [
      location_id,
      collection_day,
      collection_time,
      waste_type || 'mixed',
      created_by
    ];

    const result = await db.execute(sql, params);
    return await this.getById(result.insertId);
  }

  /**
   * Get schedule by ID
   * @param {number} scheduleId - Schedule ID
   * @returns {Promise<Object|null>} Schedule object or null
   */
  static async getById(scheduleId) {
    const sql = `
      SELECT 
        s.*,
        l.barangay_name,
        l.municipality,
        l.province
      FROM schedules s
      LEFT JOIN locations l ON s.location_id = l.location_id
      WHERE s.schedule_id = ?
    `;
    const [rows] = await db.query(sql, [scheduleId]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Update schedule
   * @param {number} scheduleId - Schedule ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated schedule object
   */
  static async update(scheduleId, updateData) {
    const allowedFields = [
      'location_id',
      'collection_day',
      'collection_time',
      'waste_type',
      'is_active'
    ];

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

    values.push(scheduleId);
    const sql = `UPDATE schedules SET ${updates.join(', ')} WHERE schedule_id = ?`;

    await db.query(sql, values);
    return await this.getById(scheduleId);
  }

  /**
   * Delete schedule
   * @param {number} scheduleId - Schedule ID
   * @returns {Promise<boolean>} True if deleted
   */
  static async delete(scheduleId) {
    const sql = 'DELETE FROM schedules WHERE schedule_id = ?';
    await db.query(sql, [scheduleId]);
    return true;
  }
}

module.exports = Schedule;