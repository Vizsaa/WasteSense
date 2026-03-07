const db = require('../config/db.config');

/**
 * Check for barangays that have pending submissions but NO active collectors assigned
 */
const getBarangayCoverage = async (req, res) => {
    try {
        if (!req.session || req.session.role !== 'admin') {
            return res.status(403).json({ status: 'error', message: 'Admin access required' });
        }

        const sql = `
      SELECT 
        l.location_id, 
        l.barangay_name,
        l.municipality,
        COUNT(ws.submission_id) as pending_submissions
      FROM locations l
      JOIN waste_submissions ws ON l.location_id = ws.barangay_id AND ws.collection_status = 'pending'
      LEFT JOIN users u ON u.role = 'collector' AND u.barangay_id = l.location_id AND u.is_active = 1
      WHERE l.is_active = 1 AND u.user_id IS NULL
      GROUP BY l.location_id
      HAVING pending_submissions > 0
    `;

        const [rows] = await db.query(sql);

        res.json({
            status: 'success',
            data: rows
        });
    } catch (error) {
        console.error('getBarangayCoverage error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to get barangay coverage details' });
    }
};

module.exports = {
    getBarangayCoverage
};
