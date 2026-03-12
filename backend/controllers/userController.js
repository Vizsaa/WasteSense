const User = require('../models/User');
const db = require('../config/db.config');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/profiles');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with user ID and timestamp
    const userId = req.session.userId;
    const ext = path.extname(file.originalname);
    const filename = `profile_${userId}_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Create upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.session.userId;
    const updateData = req.body;

    // Validate input data
    const allowedFields = ['full_name', 'phone_number', 'address', 'barangay_id'];
    const filteredData = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        // Basic validation
        if (field === 'phone_number' && updateData[field]) {
          // Simple phone number validation (Philippine format)
          const phoneRegex = /^(\+63|0)(\d{10}|\d{3}-\d{3}-\d{4}|\d{2}-\d{3}-\d{4})$/;
          if (!phoneRegex.test(updateData[field].trim())) {
            return res.status(400).json({
              status: 'error',
              message: 'Invalid phone number format. Use Philippine format (e.g., +639123456789)'
            });
          }
          filteredData[field] = updateData[field].trim();
        } else if (field === 'full_name' && updateData[field]) {
          if (updateData[field].trim().length < 2) {
            return res.status(400).json({
              status: 'error',
              message: 'Full name must be at least 2 characters long'
            });
          }
          filteredData[field] = updateData[field].trim();
        } else if (field === 'address') {
          // Allow empty address, but trim if provided
          filteredData[field] = updateData[field] ? updateData[field].trim() : null;
        } else if (field === 'barangay_id') {
          // Validate barangay_id is a number if provided
          if (updateData[field] !== null && updateData[field] !== '') {
            const parsedId = parseInt(updateData[field]);
            if (isNaN(parsedId)) {
              return res.status(400).json({
                status: 'error',
                message: 'Invalid barangay ID'
              });
            }
            filteredData[field] = parsedId;
          } else {
            filteredData[field] = null;
          }
        } else {
          filteredData[field] = updateData[field];
        }
      }
    }

    // Check if there's a profile picture in the request
    if (req.file) {
      filteredData.profile_picture = `/uploads/profiles/${req.file.filename}`;
    }

    // Check if any valid fields to update
    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid fields to update'
      });
    }

    // Update the user
    const updatedUser = await User.update(userId, filteredData);

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user_id: updatedUser.user_id,
        email: updatedUser.email,
        full_name: updatedUser.full_name,
        role: updatedUser.role,
        phone_number: updatedUser.phone_number,
        address: updatedUser.address,
        barangay_id: updatedUser.barangay_id,
        profile_picture: updatedUser.profile_picture,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update profile'
    });
  }
};

/**
 * Update user profile with profile picture upload
 */
const updateProfileWithPicture = [
  upload.single('profile_picture'),
  async (req, res, next) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      const userId = req.session.userId;
      const updateData = req.body;

      // Validate input data
      const allowedFields = ['full_name', 'phone_number', 'address', 'barangay_id'];
      const filteredData = {};

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          // Basic validation
          if (field === 'phone_number' && updateData[field]) {
            // Simple phone number validation (Philippine format)
            const phoneRegex = /^(\+63|0)(\d{10}|\d{3}-\d{3}-\d{4}|\d{2}-\d{3}-\d{4})$/;
            if (!phoneRegex.test(updateData[field].trim())) {
              return res.status(400).json({
                status: 'error',
                message: 'Invalid phone number format. Use Philippine format (e.g., +639123456789)'
              });
            }
            filteredData[field] = updateData[field].trim();
          } else if (field === 'full_name' && updateData[field]) {
            if (updateData[field].trim().length < 2) {
              return res.status(400).json({
                status: 'error',
                message: 'Full name must be at least 2 characters long'
              });
            }
            filteredData[field] = updateData[field].trim();
          } else if (field === 'address') {
            // Allow empty address, but trim if provided
            filteredData[field] = updateData[field] ? updateData[field].trim() : null;
          } else if (field === 'barangay_id') {
            // Validate barangay_id is a number if provided
            if (updateData[field] !== null && updateData[field] !== '') {
              const parsedId = parseInt(updateData[field]);
              if (isNaN(parsedId)) {
                return res.status(400).json({
                  status: 'error',
                  message: 'Invalid barangay ID'
                });
              }
              filteredData[field] = parsedId;
            } else {
              filteredData[field] = null;
            }
          } else {
            filteredData[field] = updateData[field];
          }
        }
      }

      // Check if there's a profile picture in the request
      if (req.file) {
        filteredData.profile_picture = `/uploads/profiles/${req.file.filename}`;
      }

      // Check if any valid fields to update
      if (Object.keys(filteredData).length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'No valid fields to update'
        });
      }

      // Update the user
      const updatedUser = await User.update(userId, filteredData);

      res.json({
        status: 'success',
        message: 'Profile updated successfully',
        data: {
          user_id: updatedUser.user_id,
          email: updatedUser.email,
          full_name: updatedUser.full_name,
          role: updatedUser.role,
          phone_number: updatedUser.phone_number,
          address: updatedUser.address,
          barangay_id: updatedUser.barangay_id,
          profile_picture: updatedUser.profile_picture,
          created_at: updatedUser.created_at,
          updated_at: updatedUser.updated_at
        }
      });
    } catch (error) {
      console.error('Update profile with picture error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to update profile'
      });
    }
  }
];

/**
 * Get user profile by ID
 */
const getUserProfile = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.session.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user profile'
    });
  }
};

/**
 * Get all users (admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    if (!req.session || req.session.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const users = await User.findAll();

    res.json({
      status: 'success',
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get users'
    });
  }
};

/**
 * Admin: create a new user account (resident/collector/admin)
 */
const createUserAdmin = async (req, res) => {
  try {
    if (!req.session || req.session.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const {
      email,
      password,
      full_name,
      role,
      phone_number,
      address,
      barangay_id
    } = req.body;

    if (!email || !password || !full_name || !role) {
      return res.status(400).json({
        status: 'error',
        message: 'email, password, full_name, and role are required'
      });
    }

    const roleTrimmed = String(role).trim().toLowerCase();
    const validRoles = ['resident', 'collector', 'admin'];
    if (!validRoles.includes(roleTrimmed)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role. Must be resident, collector, or admin.'
      });
    }

    const emailTrimmed = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long'
      });
    }

    const emailTaken = await User.emailExists(emailTrimmed);
    if (emailTaken) {
      return res.status(409).json({
        status: 'error',
        message: 'Email already registered'
      });
    }

    const parsedBarangay = barangay_id === null || barangay_id === '' || barangay_id === undefined
      ? null
      : parseInt(barangay_id, 10);
    if (parsedBarangay !== null && Number.isNaN(parsedBarangay)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid barangay_id'
      });
    }

    const user = await User.create({
      email: emailTrimmed,
      password: String(password),
      full_name: String(full_name).trim(),
      role: roleTrimmed,
      phone_number: phone_number ? String(phone_number).trim() : null,
      address: address ? String(address).trim() : null,
      barangay_id: parsedBarangay
    });

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create user'
    });
  }
};

/**
 * Admin: update user role / active status
 */
const updateUserAdmin = async (req, res) => {
  try {
    if (!req.session || req.session.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const { id } = req.params;
    const { role, is_active, full_name, phone_number, address, barangay_id } = req.body;
    const targetUserId = parseInt(id, 10);
    if (Number.isNaN(targetUserId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user id'
      });
    }

    const updateData = {};

    if (role !== undefined) {
      const validRoles = ['resident', 'collector', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid role. Must be resident, collector, or admin.'
        });
      }
      updateData.role = role;
    }

    if (is_active !== undefined) {
      updateData.is_active = Boolean(is_active);
    }

    if (full_name !== undefined) {
      const nameTrimmed = String(full_name).trim();
      if (nameTrimmed.length < 2) {
        return res.status(400).json({
          status: 'error',
          message: 'Full name must be at least 2 characters long'
        });
      }
      updateData.full_name = nameTrimmed;
    }

    if (phone_number !== undefined) {
      updateData.phone_number = phone_number ? String(phone_number).trim() : null;
    }

    if (address !== undefined) {
      updateData.address = address ? String(address).trim() : null;
    }

    if (barangay_id !== undefined) {
      const parsedBarangay = barangay_id === null || barangay_id === '' ? null : parseInt(barangay_id, 10);
      if (parsedBarangay !== null && Number.isNaN(parsedBarangay)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid barangay_id'
        });
      }
      updateData.barangay_id = parsedBarangay;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid fields to update'
      });
    }

    // Prevent admin from accidentally locking themselves out
    if (targetUserId === req.session.userId) {
      if (updateData.is_active === false) {
        return res.status(400).json({
          status: 'error',
          message: 'You cannot deactivate your own account.'
        });
      }
      if (updateData.role && updateData.role !== 'admin') {
        return res.status(400).json({
          status: 'error',
          message: 'You cannot change your own role away from admin.'
        });
      }
    }

    const updated = await User.updateAdminFull(targetUserId, updateData);

    res.json({
      status: 'success',
      message: 'User updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user'
    });
  }
};

/**
 * Admin: reset password for any user
 */
const resetUserPasswordAdmin = async (req, res) => {
  try {
    if (!req.session || req.session.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const { id } = req.params;
    const userId = parseInt(id, 10);
    if (Number.isNaN(userId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user id'
      });
    }

    const { new_password } = req.body;
    if (!new_password || String(new_password).length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'new_password is required and must be at least 6 characters'
      });
    }

    const updated = await User.setPassword(userId, String(new_password));

    // Also resolve any pending password_reset_requests for this user (FR-AA-3.8)
    try {
      await db.query(
        `UPDATE password_reset_requests SET status = 'completed', resolved_at = NOW() WHERE user_id = ? AND status IN ('pending', 'accepted')`,
        [userId]
      );
    } catch (e) {
      console.error('Failed to resolve password reset requests:', e.message);
      // Non-fatal: password was already reset successfully
    }

    res.json({
      status: 'success',
      message: 'Password reset successfully',
      data: updated
    });
  } catch (error) {
    console.error('Admin reset password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset password'
    });
  }
};

/**
 * Admin: Assign a barangay specifically to a collector
 */
const assignCollectorBarangay = async (req, res) => {
  try {
    if (!req.session || req.session.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Admin access required' });
    }

    const { id } = req.params;
    const { barangay_id } = req.body;

    const targetUserId = parseInt(id, 10);
    if (Number.isNaN(targetUserId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid user id' });
    }

    const parsedBarangay = barangay_id === null || barangay_id === '' ? null : parseInt(barangay_id, 10);
    if (parsedBarangay !== null && Number.isNaN(parsedBarangay)) {
      return res.status(400).json({ status: 'error', message: 'Invalid barangay_id' });
    }

    // Verify user is a collector
    const targetUser = await User.findByIdAdmin(targetUserId);
    if (!targetUser || targetUser.role !== 'collector') {
      return res.status(400).json({ status: 'error', message: 'Target user is not a collector' });
    }

    // Verify barangay exists and is active
    if (parsedBarangay !== null) {
      const [locRows] = await db.query('SELECT is_active FROM locations WHERE location_id = ?', [parsedBarangay]);
      if (locRows.length === 0 || locRows[0].is_active === 0) {
        return res.status(400).json({ status: 'error', message: 'Please select a valid active barangay' });
      }
    }

    const updated = await User.updateAdminFull(targetUserId, { barangay_id: parsedBarangay });

    res.json({
      status: 'success',
      message: 'Collector barangay assigned successfully',
      data: updated
    });
  } catch (error) {
    console.error('Assign collector barangay error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to assign barangay' });
  }
};

/**
 * Admin: Delete a user
 */
const deleteUserAdmin = async (req, res) => {
  try {
    if (!req.session || req.session.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Admin access required' });
    }

    const { id } = req.params;
    const targetUserId = parseInt(id, 10);
    if (Number.isNaN(targetUserId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid user id' });
    }

    // Prevent admin from deleting themselves
    if (targetUserId === req.session.userId) {
      return res.status(400).json({ status: 'error', message: 'You cannot delete your own account.' });
    }

    const deleted = await User.delete(targetUserId);
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete user' });
  }
};

module.exports = {
  updateProfile,
  updateProfileWithPicture,
  getUserProfile,
  getAllUsers,
  createUserAdmin,
  updateUserAdmin,
  resetUserPasswordAdmin,
  assignCollectorBarangay,
  deleteUserAdmin
};