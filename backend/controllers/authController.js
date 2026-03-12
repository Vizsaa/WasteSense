const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { email, password, confirm_password, full_name, role, phone_number, address, barangay_id } = req.body;

    // Validation
    if (!email || !password || !full_name) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, password, and full name are required'
      });
    }

    if (!barangay_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Please select a valid barangay'
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        status: 'error',
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Public registration is restricted to 'resident' and 'collector' roles.
    // Admin accounts can only be created by an admin.
    let assignedRole = 'resident';
    if (role && (role === 'resident' || role === 'collector')) {
      assignedRole = role;
    } else if (role === 'admin') {
      if (req.session && req.session.userId && req.session.role === 'admin') {
        assignedRole = 'admin';
      } else {
        return res.status(403).json({
          status: 'error',
          message: 'Unauthorized role assignment'
        });
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }

    // Check if email already exists (including deactivated accounts)
    const emailTaken = await User.emailExists(email.trim().toLowerCase());
    if (emailTaken) {
      return res.status(409).json({
        status: 'error',
        message: 'Email already registered'
      });
    }

    // Check if barangay exists and is active
    const db = require('../config/db.config');
    const [locRows] = await db.query('SELECT is_active FROM locations WHERE location_id = ?', [barangay_id]);
    if (locRows.length === 0 || locRows[0].is_active === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Please select a valid barangay'
      });
    }

    // Create user
    const isActive = assignedRole === 'collector' ? 0 : 1;

    const user = await User.create({
      email: email.trim().toLowerCase(),
      password,
      full_name: full_name.trim(),
      role: assignedRole,
      phone_number: phone_number ? phone_number.trim() : null,
      address: address ? address.trim() : null,
      barangay_id: barangay_id || null,
      is_active: isActive
    });

    if (assignedRole === 'collector') {
      const PasswordResetRequest = require('../models/PasswordResetRequest');
      await PasswordResetRequest.create({
        user_id: user.user_id,
        email: user.email,
        request_type: 'become_collector',
        description: 'System generated: New collector registration pending verification.',
        metadata: null
      });
    }

    res.status(201).json({
      status: 'success',
      message: assignedRole === 'collector'
        ? 'Registration recorded. Your collector account is pending LGU admin verification.'
        : 'User registered successfully',
      data: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Registration failed'
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }

    // Find user
    const user = await User.findByEmail(email.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    if (!user.is_active) {
      // Check if they are pending collector approval
      if (user.role === 'collector') {
        const PasswordResetRequest = require('../models/PasswordResetRequest');
        const latestReq = await PasswordResetRequest.findLatestByEmail(user.email);

        if (latestReq && latestReq.request_type === 'become_collector' && latestReq.status === 'pending') {
          return res.status(401).json({
            status: 'error',
            code: 'pending_verification',
            message: 'Your collector account is pending admin verification.'
          });
        }
      }

      return res.status(401).json({
        status: 'error',
        code: 'account_deactivated',
        message: 'Account is deactivated. Contact admin.'
      });
    }

    // Check forced password change BEFORE verifying password
    // This allows users whose password was reset by an admin to bypass the old password check
    if (user.force_password_change === 1) {
      const crypto = require('crypto');
      const limitedToken = crypto.randomUUID();

      req.session.limited_token = limitedToken;
      req.session.password_change_user_id = user.user_id;

      return res.status(200).json({
        force_password_change: true,
        limited_token: limitedToken,
        message: 'Your password was reset by an administrator. You must create a new password before continuing.'
      });
    }

    // Now check password if not in force reset mode
    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password is required'
      });
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Create standard session
    req.session.userId = user.user_id;
    req.session.email = user.email;
    req.session.role = user.role;
    req.session.full_name = user.full_name;
    req.session.barangay_id = user.barangay_id;

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role, barangay_id: user.barangay_id },
      process.env.JWT_SECRET || 'super_secret_jwt_key_wastesense_2026',
      { expiresIn: '24h' }
    );

    res.json({
      status: 'success',
      message: 'Login successful',
      token: token,
      data: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed'
    });
  }
};

/**
 * Logout user
 */
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Logout failed'
      });
    }
    res.clearCookie('connect.sid');
    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  });
};

/**
 * Get current logged-in user
 */
const getCurrentUser = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }

    const user = await User.findById(req.session.userId);
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
    console.error('Get current user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user information'
    });
  }
};

/**
 * Check if a user is flagged for a forced password change
 */
const checkForcedReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Email is required' });
    }

    const user = await User.findByEmail(email.trim().toLowerCase());
    if (!user) {
      // For security, return negative even if user doesn't exist
      return res.json({ force_password_change: false });
    }

    if (user.force_password_change === 1 && user.is_active) {
      // Same logic as login to generate a limited token
      const crypto = require('crypto');
      const limitedToken = crypto.randomUUID();

      req.session.limited_token = limitedToken;
      req.session.password_change_user_id = user.user_id;

      return res.json({
        force_password_change: true,
        limited_token: limitedToken,
        message: 'Your password was reset by an administrator. You must create a new password before continuing.'
      });
    }

    return res.json({ force_password_change: false });
  } catch (error) {
    console.error('Check forced reset error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

/**
 * Set New Password after forced reset
 */
const setNewPassword = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ status: 'error', message: 'No token provided.' });

    const token = authHeader.split(' ')[1];
    if (token !== req.session.limited_token || !req.session.password_change_user_id) {
      return res.status(401).json({ status: 'error', message: 'Session expired or invalid scope. Please log in again.' });
    }

    const { new_password, confirm_password } = req.body;
    if (!new_password || new_password.length < 8) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 8 characters.' });
    }
    if (new_password !== confirm_password) {
      return res.status(400).json({ status: 'error', message: 'Passwords do not match.' });
    }

    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash(new_password, 10);

    const db = require('../config/db.config');
    await db.query(
      "UPDATE users SET password_hash = ?, force_password_change = 0 WHERE user_id = ?",
      [hash, req.session.password_change_user_id]
    );

    const user = await User.findById(req.session.password_change_user_id);

    // Clear limited scope
    delete req.session.limited_token;
    delete req.session.password_change_user_id;

    // Create standard session
    req.session.userId = user.user_id;
    req.session.email = user.email;
    req.session.role = user.role;
    req.session.full_name = user.full_name;

    res.json({
      status: 'success',
      message: 'Password updated successfully.',
      data: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Set New Password error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to set password.' });
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  checkForcedReset,
  setNewPassword
};
