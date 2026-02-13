/**
 * Authentication middleware
 * Checks if user is logged in via session
 */
const requireAuth = (req, res, next) => {
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
