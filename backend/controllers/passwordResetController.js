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
    const { email, type, description } = req.body || {};
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !type) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and request type are required'
      });
    }

    if (type !== 'change_password') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request type'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }

    const user = await User.findByEmail(normalizedEmail);
    if (!user) {
      // For security, do not reveal if email exists
      return res.json({
        status: 'success',
        message: 'Sent to admin, please wait.'
      });
    }

    const safeDescription = description
      ? String(description).trim().slice(0, 500)
      : '';

    await PasswordResetRequest.create({
      user_id: user.user_id,
      email: normalizedEmail,
      request_type: 'change_password',
      description: safeDescription
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
      data: { status: latest.status }
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
    if (!latest || latest.request_type !== 'change_password') {
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

/**
 * Admin: accept request
 */
const acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await PasswordResetRequest.setStatus(id, 'accepted');
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

