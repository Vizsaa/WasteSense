const db = require('../config/db.config');

class WasteSubmission {
  /**
   * Create a new waste submission
   * @param {Object} submissionData - Submission data object
   * @returns {Promise<Object>} Created submission object
   */
  static async create(submissionData) {
    const {
      user_id,
      image_path,
      predicted_category,
      confidence_score,
      confirmed_category,
      waste_types, // Array of waste types
      waste_adjective,
      waste_adjectives, // Array of waste adjectives
      waste_description,
      latitude,
      longitude,
      address_description,
      barangay_id
    } = submissionData;

    // Convert waste_types array to JSON string
    const wasteTypesJson = waste_types && Array.isArray(waste_types) && waste_types.length > 0
      ? JSON.stringify(waste_types)
      : null;

    // Convert waste_adjectives array to JSON string
    const wasteAdjectivesJson = waste_adjectives && Array.isArray(waste_adjectives) && waste_adjectives.length > 0
      ? JSON.stringify(waste_adjectives)
      : null;

    const sql = `
      INSERT INTO waste_submissions 
      (user_id, image_path, predicted_category, confidence_score, confirmed_category, waste_types, waste_adjective, waste_adjectives, waste_description, latitude, longitude, address_description, barangay_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      user_id,
      image_path || null,
      predicted_category || null,
      confidence_score != null ? parseFloat(confidence_score) : null,
      confirmed_category || null,
      wasteTypesJson,
      waste_adjective || null,
      wasteAdjectivesJson,
      waste_description || null,
      latitude || null,
      longitude || null,
      address_description || null,
      barangay_id || null
    ];

    try {
      const result = await db.execute(sql, params);
      return await this.findById(result.insertId);
    } catch (error) {
      console.error('Error creating waste submission:', error);
      throw error;
    }
  }

  /**
   * Find submission by ID
   * @param {number} submissionId - Submission ID
   * @returns {Promise<Object|null>} Submission object or null
   */
  static async findById(submissionId) {
    const sql = `
      SELECT 
        ws.*,
        u.full_name,
        u.email,
        l.barangay_name,
        l.municipality,
        l.province
      FROM waste_submissions ws
      LEFT JOIN users u ON ws.user_id = u.user_id
      LEFT JOIN locations l ON ws.barangay_id = l.location_id
      WHERE ws.submission_id = ?
    `;
    const [rows] = await db.query(sql, [submissionId]);
    if (rows.length > 0) {
      const submission = rows[0];
      // Parse waste_types JSON if exists
      if (submission.waste_types) {
        try {
          submission.waste_types = JSON.parse(submission.waste_types);
        } catch (e) {
          submission.waste_types = [];
        }
      } else {
        submission.waste_types = [];
      }
      // Parse waste_adjectives JSON if exists
      if (submission.waste_adjectives) {
        try {
          submission.waste_adjectives = JSON.parse(submission.waste_adjectives);
        } catch (e) {
          submission.waste_adjectives = [];
        }
      } else if (submission.waste_adjective) {
        submission.waste_adjectives = [submission.waste_adjective];
      } else {
        submission.waste_adjectives = [];
      }
      return submission;
    }
    return null;
  }

  /**
   * Get all submissions by user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of submission objects
   */
  static async findByUserId(userId) {
    const sql = `
      SELECT 
        ws.*,
        l.barangay_name,
        l.municipality,
        l.province
      FROM waste_submissions ws
      LEFT JOIN locations l ON ws.barangay_id = l.location_id
      WHERE ws.user_id = ?
      ORDER BY ws.created_at DESC
    `;
    const [rows] = await db.query(sql, [userId]);
    // Parse waste_types JSON for each row
    return rows.map(row => {
      if (row.waste_types) {
        try {
          row.waste_types = JSON.parse(row.waste_types);
        } catch (e) {
          row.waste_types = [];
        }
      } else {
        row.waste_types = [];
      }
      return row;
    });
  }

  /**
   * Get all pending submissions
   * @returns {Promise<Array>} Array of pending submissions
   */
  static async findPending(filters = {}) {
    let sql = `
      SELECT 
        ws.*,
        u.full_name,
        u.email,
        u.phone_number,
        l.barangay_name,
        l.municipality,
        l.province
      FROM waste_submissions ws
      LEFT JOIN users u ON ws.user_id = u.user_id
      LEFT JOIN locations l ON ws.barangay_id = l.location_id
      WHERE ws.collection_status = 'pending'
    `;
    
    const params = [];
    
    // Filter by waste types if provided
    if (filters.waste_types && Array.isArray(filters.waste_types) && filters.waste_types.length > 0) {
      // Filter using JSON_CONTAINS for MySQL
      // Check if any of the waste_types array contains any of the filter types
      const typeConditions = [];
      filters.waste_types.forEach(type => {
        typeConditions.push(`JSON_CONTAINS(ws.waste_types, ?)`);
        params.push(JSON.stringify(type)); // JSON_CONTAINS expects JSON string
      });
      sql += ` AND (${typeConditions.join(' OR ')})`;
    }

    // Filter by waste adjectives if provided
    if (filters.waste_adjectives && Array.isArray(filters.waste_adjectives) && filters.waste_adjectives.length > 0) {
      const adjectiveConditions = [];
      filters.waste_adjectives.forEach(adjective => {
        adjectiveConditions.push(`JSON_CONTAINS(ws.waste_adjectives, ?)`);
        params.push(JSON.stringify(adjective));
      });
      sql += ` AND (${adjectiveConditions.join(' OR ')})`;
    }
    
    // Filter by barangay if provided
    if (filters.barangay_id) {
      sql += ` AND ws.barangay_id = ?`;
      params.push(filters.barangay_id);
    }
    
    sql += ` ORDER BY ws.created_at DESC`;
    
    const [rows] = await db.query(sql, params);
    // Parse waste_types and waste_adjectives JSON for each row
    return rows.map(row => {
      if (row.waste_types) {
        try {
          row.waste_types = JSON.parse(row.waste_types);
        } catch (e) {
          row.waste_types = [];
        }
      } else {
        row.waste_types = [];
      }
      // Parse waste_adjectives
      if (row.waste_adjectives) {
        try {
          row.waste_adjectives = JSON.parse(row.waste_adjectives);
        } catch (e) {
          row.waste_adjectives = [];
        }
      } else if (row.waste_adjective) {
        row.waste_adjectives = [row.waste_adjective];
      } else {
        row.waste_adjectives = [];
      }
      return row;
    });
  }

  /**
   * Get submissions assigned to a specific collector
   * @param {number} collectorId
   * @returns {Promise<Array>}
   */
  static async findAssignedToCollector(collectorId) {
    const sql = `
      SELECT
        ws.*,
        u.full_name,
        u.email,
        u.phone_number,
        l.barangay_name,
        l.municipality,
        l.province
      FROM waste_submissions ws
      LEFT JOIN users u ON ws.user_id = u.user_id
      LEFT JOIN locations l ON ws.barangay_id = l.location_id
      WHERE ws.collector_id = ?
        AND ws.collection_status IN ('scheduled', 'collected')
      ORDER BY ws.created_at DESC
    `;

    const [rows] = await db.query(sql, [collectorId]);
    return rows.map(row => {
      if (row.waste_types) {
        try {
          row.waste_types = JSON.parse(row.waste_types);
        } catch (e) {
          row.waste_types = [];
        }
      } else {
        row.waste_types = [];
      }
      if (row.waste_adjectives) {
        try {
          row.waste_adjectives = JSON.parse(row.waste_adjectives);
        } catch (e) {
          row.waste_adjectives = [];
        }
      } else if (row.waste_adjective) {
        row.waste_adjectives = [row.waste_adjective];
      } else {
        row.waste_adjectives = [];
      }
      return row;
    });
  }

  /**
   * Get today's routes for a specific collector
   * @param {number} collectorId
   * @returns {Promise<Array>}
   */
  static async getTodaysRoutes(collectorId) {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    const sql = `
      SELECT
        ws.*,
        u.full_name,
        u.email,
        u.phone_number,
        l.barangay_name,
        l.municipality,
        l.province
      FROM waste_submissions ws
      LEFT JOIN users u ON ws.user_id = u.user_id
      LEFT JOIN locations l ON ws.barangay_id = l.location_id
      WHERE ws.collector_id = ?
        AND DATE(ws.scheduled_date) = ?
        AND ws.collection_status = 'scheduled'
      ORDER BY ws.scheduled_date ASC, ws.created_at ASC
    `;

    const [rows] = await db.query(sql, [collectorId, today]);
    return rows.map(row => {
      if (row.waste_types) {
        try {
          row.waste_types = JSON.parse(row.waste_types);
        } catch (e) {
          row.waste_types = [];
        }
      } else {
        row.waste_types = [];
      }
      if (row.waste_adjectives) {
        try {
          row.waste_adjectives = JSON.parse(row.waste_adjectives);
        } catch (e) {
          row.waste_adjectives = [];
        }
      } else if (row.waste_adjective) {
        row.waste_adjectives = [row.waste_adjective];
      } else {
        row.waste_adjectives = [];
      }
      return row;
    });
  }

  /**
   * Get upcoming scheduled collections for a specific collector
   * @param {number} collectorId
   * @returns {Promise<Array>}
   */
  static async getUpcomingCollections(collectorId) {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    const sql = `
      SELECT
        ws.*,
        u.full_name,
        u.email,
        u.phone_number,
        l.barangay_name,
        l.municipality,
        l.province
      FROM waste_submissions ws
      LEFT JOIN users u ON ws.user_id = u.user_id
      LEFT JOIN locations l ON ws.barangay_id = l.location_id
      WHERE ws.collector_id = ?
        AND ws.collection_status = 'scheduled'
        AND DATE(ws.scheduled_date) >= ?
      ORDER BY ws.scheduled_date ASC, ws.created_at ASC
      LIMIT 10
    `;

    const [rows] = await db.query(sql, [collectorId, today]);
    return rows.map(row => {
      if (row.waste_types) {
        try {
          row.waste_types = JSON.parse(row.waste_types);
        } catch (e) {
          row.waste_types = [];
        }
      } else {
        row.waste_types = [];
      }
      if (row.waste_adjectives) {
        try {
          row.waste_adjectives = JSON.parse(row.waste_adjectives);
        } catch (e) {
          row.waste_adjectives = [];
        }
      } else if (row.waste_adjective) {
        row.waste_adjectives = [row.waste_adjective];
      } else {
        row.waste_adjectives = [];
      }
      return row;
    });
  }

  /**
   * Update submission
   * @param {number} submissionId - Submission ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated submission object
   */
  static async update(submissionId, updateData) {
    const allowedFields = [
      'confirmed_category',
      'confidence_score',
      'waste_types',
      'waste_adjective',
      'waste_adjectives',
      'waste_description',
      'address_description',
      'barangay_id',
      'latitude',
      'longitude',
      'collection_status',
      'scheduled_date',
      'collector_id',
      'collected_at'
    ];

    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if ((field === 'waste_types' || field === 'waste_adjectives') && Array.isArray(updateData[field])) {
          updates.push(`${field} = ?`);
          values.push(JSON.stringify(updateData[field]));
        } else {
          updates.push(`${field} = ?`);
          values.push(updateData[field]);
        }
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(submissionId);
    const sql = `UPDATE waste_submissions SET ${updates.join(', ')} WHERE submission_id = ?`;

    await db.query(sql, values);
    return await this.findById(submissionId);
  }

  /**
   * Delete submission
   * @param {number} submissionId - Submission ID
   * @returns {Promise<boolean>} True if deleted
   */
  static async delete(submissionId) {
    const sql = 'DELETE FROM waste_submissions WHERE submission_id = ?';
    await db.query(sql, [submissionId]);
    return true;
  }
}

module.exports = WasteSubmission;
