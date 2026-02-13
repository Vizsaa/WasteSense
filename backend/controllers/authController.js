const User = require('../models/User');

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { email, password, confirm_password, full_name, role, phone_number, address, barangay_id } = req.body;

    // Validation
    if (!email || !password || !full_name || !role) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, password, full name, and role are required'
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

    // Validate role
    const validRoles = ['resident', 'collector', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role. Must be one of: resident, collector, admin'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }

    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'Email already registered'
      });
    }

    // Create user
    const user = await User.create({
      email: email.trim().toLowerCase(),
      password,
      full_name: full_name.trim(),
      role,
      phone_number: phone_number ? phone_number.trim() : null,
      address: address ? address.trim() : null,
      barangay_id: barangay_id || null
    });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
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
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
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

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Create session
    req.session.userId = user.user_id;
    req.session.email = user.email;
    req.session.role = user.role;
    req.session.full_name = user.full_name;

    res.json({
      status: 'success',
      message: 'Login successful',
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

module.exports = {
  register,
  login,
  logout,
  getCurrentUser
};
