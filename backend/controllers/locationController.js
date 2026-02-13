const Location = require('../models/Location');

/**
 * Get all locations (barangays)
 */
const getLocations = async (req, res) => {
  try {
    const locations = await Location.findAll();
    res.json({
      status: 'success',
      data: locations
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get locations',
      error: error.message
    });
  }
};

/**
 * Get location by ID
 */
const getLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findById(id);

    if (!location) {
      return res.status(404).json({
        status: 'error',
        message: 'Location not found'
      });
    }

    res.json({
      status: 'success',
      data: location
    });
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get location',
      error: error.message
    });
  }
};

/**
 * Create new location (Admin only)
 */
const createLocation = async (req, res) => {
  try {
    if (!req.session || req.session.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const { barangay_name, municipality, province, zone_or_street } = req.body;

    if (!barangay_name || !municipality || !province) {
      return res.status(400).json({
        status: 'error',
        message: 'Barangay name, municipality, and province are required'
      });
    }

    const location = await Location.create({
      barangay_name,
      municipality,
      province,
      zone_or_street
    });

    res.status(201).json({
      status: 'success',
      message: 'Location created successfully',
      data: location
    });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create location',
      error: error.message
    });
  }
};

/**
 * Update location (Admin only)
 */
const updateLocation = async (req, res) => {
  try {
    if (!req.session || req.session.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const location = await Location.update(id, updateData);

    res.json({
      status: 'success',
      message: 'Location updated successfully',
      data: location
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update location',
      error: error.message
    });
  }
};

/**
 * Delete location (Admin only)
 */
const deleteLocation = async (req, res) => {
  try {
    if (!req.session || req.session.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const { id } = req.params;
    await Location.delete(id);

    res.json({
      status: 'success',
      message: 'Location deleted successfully'
    });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete location',
      error: error.message
    });
  }
};

module.exports = {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation
};
