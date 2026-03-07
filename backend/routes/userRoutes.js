const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(requireAuth);

// Current user's profile
router.put('/update-profile', userController.updateProfile);
router.put('/update-profile-picture', ...userController.updateProfileWithPicture);
router.get('/profile', userController.getUserProfile);

// Admin: list all users
router.get('/', requireAdmin, userController.getAllUsers);
router.post('/', requireAdmin, userController.createUserAdmin);
router.put('/:id', requireAdmin, userController.updateUserAdmin);
router.post('/:id/reset-password', requireAdmin, userController.resetUserPasswordAdmin);
router.put('/:id/assign-barangay', requireAdmin, userController.assignCollectorBarangay);

module.exports = router;