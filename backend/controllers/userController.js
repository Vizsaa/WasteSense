const User = require('../models/User');
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
    const { role, is_active } = req.body;

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

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid fields to update'
      });
    }

    const updated = await User.updateAdmin(id, updateData);

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

module.exports = {
  updateProfile,
  updateProfileWithPicture,
  getUserProfile,
  getAllUsers,
  updateUserAdmin
};