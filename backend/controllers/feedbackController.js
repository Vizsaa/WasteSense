const Feedback = require('../models/Feedback');

/**
 * Resident: submit feedback
 */
const submitFeedback = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ status: 'error', message: 'Authentication required' });
    }

    const message = String(req.body?.message || '').trim();
    if (!message) {
      return res.status(400).json({ status: 'error', message: 'Feedback message is required' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ status: 'error', message: 'Feedback message is too long (max 2000 characters)' });
    }

    const likert_responses = req.body?.likert_responses || null;

    const created = await Feedback.create({
      user_id: req.session.userId,
      message,
      likert_responses
    });

    return res.status(201).json({
      status: 'success',
      message: 'Feedback submitted',
      data: created
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to submit feedback' });
  }
};

/**
 * Admin: list feedback entries
 */
const listFeedback = async (req, res) => {
  try {
    if (!req.session || req.session.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Admin access required' });
    }

    const limit = req.query.limit;
    const rows = await Feedback.listLatest(limit || 50);

    return res.json({ status: 'success', data: rows });
  } catch (error) {
    console.error('List feedback error:', error);

    if (error && error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        status: 'error',
        message: 'Database table "feedback" does not exist. Please run the database setup script (node database/setup.js) or update your database schema.'
      });
    }

    return res.status(500).json({ status: 'error', message: 'Failed to load feedback' });
  }
};

module.exports = {
  submitFeedback,
  listFeedback
};
