const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passwordResetController = require('../controllers/passwordResetController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Simple in-memory rate limiter for login
const loginAttempts = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10;

function loginRateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { count: 0, first: now };

  if (now - entry.first > WINDOW_MS) {
    // window expired, reset
    entry.count = 0;
    entry.first = now;
  }

  entry.count += 1;
  loginAttempts.set(ip, entry);

  if (entry.count > MAX_ATTEMPTS) {
    return res.status(429).json({
      status: 'error',
      message: 'Too many login attempts. Please wait a few minutes and try again.'
    });
  }

  next();
}

// Public routes
router.post('/register', authController.register);
router.post('/login', loginRateLimiter, authController.login);
router.post('/logout', authController.logout);
router.post('/password-request', passwordResetController.createRequest);
router.get('/password-request/status', passwordResetController.getStatusByEmail);
router.post('/password-reset', passwordResetController.resetApprovedPassword);
router.post('/set-new-password', authController.setNewPassword);

// Admin-only password reset request management
router.get('/password-requests', requireAuth, requireAdmin, passwordResetController.listRequests);
router.post('/password-requests/:id/accept', requireAuth, requireAdmin, passwordResetController.acceptRequest);
router.post('/password-requests/:id/deny', requireAuth, requireAdmin, passwordResetController.denyRequest);

// Protected routes
router.get('/me', requireAuth, authController.getCurrentUser);

module.exports = router;
