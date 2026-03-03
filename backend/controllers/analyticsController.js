const db = require('../config/db.config');

/**
 * Admin: get heatmap points + temporal patterns for submissions
 * Query params:
 * - days: number of days to look back (default 30, max 365)
 */
const getHeatmapAndTemporal = async (req, res) => {
  try {
    if (!req.session || req.session.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const rawDays = req.query.days;
    let days = 30;
    if (rawDays !== undefined) {
      const parsed = parseInt(rawDays, 10);
      if (Number.isNaN(parsed) || parsed < 1) {
        return res.status(400).json({ status: 'error', message: 'Invalid days parameter' });
      }
      days = Math.min(parsed, 365);
    }

    const pointsSql = `
      SELECT
        submission_id,
        latitude,
        longitude,
        collection_status,
        waste_types,
        confirmed_category,
        predicted_category,
        created_at
      FROM waste_submissions
      WHERE latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND created_at >= (NOW() - INTERVAL ? DAY)
      ORDER BY created_at DESC
      LIMIT 5000
    `;

    const [pointRows] = await db.query(pointsSql, [days]);

    const points = (pointRows || [])
      .filter(r => Number.isFinite(Number(r.latitude)) && Number.isFinite(Number(r.longitude)))
      .map(r => ({
        lat: Number(r.latitude),
        lng: Number(r.longitude),
        weight: 1,
        submission_id: r.submission_id,
        created_at: r.created_at,
        collection_status: r.collection_status,
        category: r.confirmed_category || r.predicted_category || null,
        waste_types: r.waste_types || null
      }));

    const dailySql = `
      SELECT
        DATE(created_at) AS day,
        COUNT(*) AS count
      FROM waste_submissions
      WHERE created_at >= (NOW() - INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `;

    const [dailyRows] = await db.query(dailySql, [days]);

    const hourlySql = `
      SELECT
        HOUR(created_at) AS hour,
        COUNT(*) AS count
      FROM waste_submissions
      WHERE created_at >= (NOW() - INTERVAL ? DAY)
      GROUP BY HOUR(created_at)
      ORDER BY hour ASC
    `;

    const [hourlyRows] = await db.query(hourlySql, [days]);

    res.json({
      status: 'success',
      data: {
        range_days: days,
        points,
        temporal: {
          daily: dailyRows || [],
          hourly: hourlyRows || []
        }
      }
    });
  } catch (error) {
    console.error('Analytics heatmap/temporal error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to load analytics'
    });
  }
};

module.exports = {
  getHeatmapAndTemporal
};
