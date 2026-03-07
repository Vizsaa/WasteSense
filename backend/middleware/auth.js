const jwt = require('jsonwebtoken');

/**
 * Authentication middleware
 * Checks if user is logged in via session OR JWT
 */
const requireAuth = (req, res, next) => {
  // 1. Check for JWT Bearer Token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_wastesense_2026');
      req.user = decoded;
      // Mock session for backward compatibility with controllers that expect req.session.userId
      if (!req.session) req.session = {};
      req.session.userId = decoded.userId;
      req.session.role = decoded.role;
      req.session.barangay_id = decoded.barangay_id;
      return next();
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }
  }

  // 2. Fallback to existing Session Cookie
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required. Please log in.'
    });
  }
};

/**
 * Role-based access control middleware
 * @param {Array} allowedRoles - Array of allowed roles (e.g., ['admin', 'collector'])
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Rely on requireAuth having populated req.session.userId and req.session.role
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userRole = req.session.role;

    // Admin has access to everything
    if (userRole === 'admin') {
      return next();
    }

    if (allowedRoles.includes(userRole)) {
      return next();
    } else {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions. Access denied.'
      });
    }
  };
};

/**
 * Check if user is admin
 */
const requireAdmin = requireRole('admin');

/**
 * Check if user is collector or admin
 */
const requireCollector = requireRole('admin', 'collector');

/**
 * Check if user is resident or admin
 */
const requireResident = requireRole('admin', 'resident');

module.exports = {
  requireAuth,
  requireRole,
  requireAdmin,
  requireCollector,
  requireResident
};
