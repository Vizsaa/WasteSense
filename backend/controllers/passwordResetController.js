const User = require('../models/User');
const PasswordResetRequest = require('../models/PasswordResetRequest');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

/**
 * Public: create a password reset request (Change Password)
 */
const createRequest = async (req, res) => {
  try {
    const { email, type, description, metadata } = req.body || {};
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !type) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and request type are required'
      });
    }

    const validTypes = [
      'forgot_password',
      'become_collector',
      'request_admin_access',
      'reactivate_account',
      'update_email',
      'report_issue'
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request type'
      });
    }

    if (type === 'update_email') {
      const newEmail = normalizeEmail(metadata?.new_email);
      if (!newEmail) {
        return res.status(400).json({
          status: 'error',
          message: 'New email address is required'
        });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid new email format'
        });
      }

      const existing = await User.findByEmail(newEmail);
      if (existing) {
        return res.status(400).json({
          status: 'error',
          message: 'That email is already registered to another account.'
        });
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }

    const user = await User.findByEmail(normalizedEmail);
    // Even if user is not found, we still create the request so admin can see it.
    // This handles cases where users might have typos in their email or are new users requesting help.
    
    const safeDescription = description
      ? String(description).trim().slice(0, 500)
      : '';

    await PasswordResetRequest.create({
      user_id: user ? user.user_id : null,
      email: normalizedEmail,
      request_type: type,
      description: safeDescription,
      metadata: metadata || null
    });

    return res.json({
      status: 'success',
      message: 'Sent to admin, please wait.'
    });
  } catch (error) {
    console.error('Create password reset request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create password reset request'
    });
  }
};

/**
 * Public: get status of latest password reset request for an email
 */
const getStatusByEmail = async (req, res) => {
  try {
    const email = normalizeEmail(req.query.email || req.body?.email);
    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }

    const latest = await PasswordResetRequest.findLatestByEmail(email);
    if (!latest) {
      return res.json({
        status: 'success',
        data: { status: 'none' }
      });
    }

    return res.json({
      status: 'success',
      data: { status: latest.status, request_type: latest.request_type }
    });
  } catch (error) {
    console.error('Get password reset status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get status'
    });
  }
};

/**
 * Public: reset password when request has been accepted
 */
const resetApprovedPassword = async (req, res) => {
  try {
    const { email, new_password, confirm_password } = req.body || {};
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !new_password || !confirm_password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, new password, and confirmation are required'
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        status: 'error',
        message: 'Passwords do not match'
      });
    }

    if (String(new_password).length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long'
      });
    }

    const user = await User.findByEmail(normalizedEmail);
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'No approved password reset request found'
      });
    }

    const latest = await PasswordResetRequest.findLatestByEmail(normalizedEmail);
    if (!latest || latest.request_type !== 'forgot_password') {
      return res.status(400).json({
        status: 'error',
        message: 'No approved password reset request found'
      });
    }

    if (latest.status === 'denied') {
      return res.status(400).json({
        status: 'error',
        message: 'Request Denied'
      });
    }

    if (latest.status !== 'accepted') {
      return res.status(400).json({
        status: 'error',
        message: 'No approved password reset request found'
      });
    }

    await User.setPassword(user.user_id, String(new_password));
    await PasswordResetRequest.setStatus(latest.request_id, 'completed');

    return res.json({
      status: 'success',
      message: 'Password has been reset. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset approved password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset password'
    });
  }
};

/**
 * Admin: list pending password reset requests
 */
const listRequests = async (req, res) => {
  try {
    const rows = await PasswordResetRequest.listPending(50);
    res.json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('List password reset requests error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to list password reset requests'
    });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await PasswordResetRequest.findById(id);

    if (!request) {
      return res.status(404).json({ status: 'error', message: 'Request not found' });
    }

    const db = require('../config/db.config'); // Ensure db is available here

    switch (request.request_type) {
      case 'forgot_password':
        // Flag user to force password change on next login
        await db.query(
          "UPDATE users SET force_password_change = 1, updated_at = NOW() WHERE email = ?",
          [request.email]
        );
        break;

      // 2. become_collector - Requires admin approval
      // ----------------------------------------------------------------------
      case 'become_collector':
        await db.query(
          "UPDATE users SET role = 'collector', is_active = 1, updated_at = NOW() WHERE email = ?",
          [request.email]
        );
        break;

      // 3. request_admin_access - Requires admin approval and verification
      // ----------------------------------------------------------------------
      case 'request_admin_access':
        await db.query(
          "UPDATE users SET role = 'admin', updated_at = NOW() WHERE email = ?",
          [request.email]
        );
        break;

      case 'reactivate_account':
        await db.query(
          "UPDATE users SET is_active = 1, updated_at = NOW() WHERE email = ?",
          [request.email]
        );
        break;

      case 'update_email':
        const meta = typeof request.metadata === 'string' ? JSON.parse(request.metadata) : request.metadata;
        const newEmail = meta?.new_email;
        if (newEmail) {
          await db.query(
            "UPDATE users SET email = ?, updated_at = NOW() WHERE email = ?",
            [newEmail, request.email]
          );
        }
        break;

      case 'report_issue':
        // No user data change needed
        break;
    }

    // Mark as completed instead of just accepted if it's an action we automatically perform. 
    // Except for forgot_password, which needs to remain 'accepted' for the user to finish the flow.
    let newStatus = 'completed';
    if (request.request_type === 'forgot_password') {
      newStatus = 'accepted';
    }

    const updated = await PasswordResetRequest.setStatus(id, newStatus);
    res.json({
      status: 'success',
      message: 'Request accepted',
      data: updated
    });
  } catch (error) {
    console.error('Accept password reset request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to accept request'
    });
  }
};

/**
 * Admin: deny request
 */
const denyRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await PasswordResetRequest.setStatus(id, 'denied');
    res.json({
      status: 'success',
      message: 'Request denied',
      data: updated
    });
  } catch (error) {
    console.error('Deny password reset request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to deny request'
    });
  }
};

module.exports = {
  createRequest,
  getStatusByEmail,
  resetApprovedPassword,
  listRequests,
  acceptRequest,
  denyRequest
};

