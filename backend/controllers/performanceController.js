const PerformanceTracking = require('../models/PerformanceTracking');

/**
 * Admin: create a performance tracking entry for a schedule
 */
const createPerformanceEntry = async (req, res) => {
  try {
    if (!req.session || req.session.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const { schedule_id, planned_date, actual_date, status, notes } = req.body;

    if (!schedule_id || !planned_date || !status) {
      return res.status(400).json({
        status: 'error',
        message: 'schedule_id, planned_date, and status are required'
      });
    }

    const validStatuses = ['completed', 'missed', 'delayed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be completed, missed, or delayed.'
      });
    }

    const entry = await PerformanceTracking.create({
      schedule_id,
      collector_id: req.body.collector_id || null,
      planned_date,
      actual_date: actual_date || null,
      status,
      notes: notes || null
    });

    res.status(201).json({
      status: 'success',
      message: 'Performance entry created',
      data: entry
    });
  } catch (error) {
    console.error('Create performance entry error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create performance entry'
    });
  }
};

/**
 * Admin: get performance summary
 */
const getPerformanceSummary = async (req, res) => {
  try {
    if (!req.session || req.session.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const summary = await PerformanceTracking.getSummary();

    res.json({
      status: 'success',
      data: summary
    });
  } catch (error) {
    console.error('Get performance summary error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get performance summary'
    });
  }
};

module.exports = {
  createPerformanceEntry,
  getPerformanceSummary
};

