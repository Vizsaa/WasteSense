const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Public route - get all locations
router.get('/', locationController.getLocations);

// Get location by ID
router.get('/:id', locationController.getLocation);

// Admin only routes
router.post('/', requireAuth, requireAdmin, locationController.createLocation);
router.put('/:id', requireAuth, requireAdmin, locationController.updateLocation);
router.delete('/:id', requireAuth, requireAdmin, locationController.deleteLocation);

module.exports = router;
