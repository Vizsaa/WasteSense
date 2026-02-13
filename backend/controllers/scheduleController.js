const Schedule = require('../models/Schedule');
const User = require('../models/User');

/**
 * Get user's upcoming schedules
 */
const getUpcomingSchedules = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.session.userId;
    const schedules = await Schedule.getUpcomingForUser(userId);

    res.json({
      status: 'success',
      data: schedules
    });
  } catch (error) {
    console.error('Get upcoming schedules error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get schedules',
      error: error.message
    });
  }
};

/**
 * Get all schedules for a user's location
 */
const getSchedulesByUser = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.session.userId;
    const schedules = await Schedule.getByUser(userId);

    res.json({
      status: 'success',
      data: schedules
    });
  } catch (error) {
    console.error('Get schedules by user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get schedules',
      error: error.message
    });
  }
};

/**
 * Get schedules by location
 */
const getSchedulesByLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    
    // Check if user is authorized to view this location's schedules
    // Residents can only view their own location's schedules
    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (user.role === 'resident' && user.barangay_id != locationId) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to view schedules for this location'
        });
      }
    }

    const schedules = await Schedule.getByLocation(locationId);

    res.json({
      status: 'success',
      data: schedules
    });
  } catch (error) {
    console.error('Get schedules by location error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get schedules',
      error: error.message
    });
  }
};

/**
 * Create a new schedule (admin only)
 */
const createSchedule = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (req.session.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Only administrators can create schedules'
      });
    }

    const scheduleData = {
      ...req.body,
      created_by: req.session.userId
    };

    const schedule = await Schedule.create(scheduleData);

    res.status(201).json({
      status: 'success',
      message: 'Schedule created successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create schedule',
      error: error.message
    });
  }
};

/**
 * Update a schedule (admin only)
 */
const updateSchedule = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (req.session.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Only administrators can update schedules'
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const schedule = await Schedule.update(id, updateData);

    res.json({
      status: 'success',
      message: 'Schedule updated successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update schedule',
      error: error.message
    });
  }
};

/**
 * Delete a schedule (admin only)
 */
const deleteSchedule = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (req.session.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Only administrators can delete schedules'
      });
    }

    const { id } = req.params;
    await Schedule.delete(id);

    res.json({
      status: 'success',
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete schedule',
      error: error.message
    });
  }
};

module.exports = {
  getUpcomingSchedules,
  getSchedulesByUser,
  getSchedulesByLocation,
  createSchedule,
  updateSchedule,
  deleteSchedule
};