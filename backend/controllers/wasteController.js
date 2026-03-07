const WasteSubmission = require('../models/WasteSubmission');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { analyzeImage: analyzeImageUtil, predictCategory } = require('../utils/imageRecognition');
const path = require('path');
const fs = require('fs');

/**
 * Submit waste with image
 */
const submitWaste = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.session.userId;
    let imagePath = null;
    let absoluteImagePath = null;

    // Handle file upload
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
      absoluteImagePath = req.file.path;
    }

    // Get form data
    const {
      predicted_category,
      confidence_score,
      confirmed_category,
      waste_types, // Array of selected waste types
      waste_adjective,
      waste_adjectives, // Array of selected waste adjectives
      waste_description,
      latitude,
      longitude,
      address_description
    } = req.body;

    // Fetch user profile to enforce auto-tagging
    const currentUser = await User.findById(userId);
    if (!currentUser || !currentUser.barangay_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Your account is not assigned to a barangay. Please update your profile first.'
      });
    }
    const residentBarangayId = currentUser.barangay_id;

    // Parse waste_types if it's a string
    let wasteTypesArray = [];
    if (waste_types) {
      if (typeof waste_types === 'string') {
        try {
          wasteTypesArray = JSON.parse(waste_types);
        } catch (e) {
          // If it's comma-separated, split it
          wasteTypesArray = waste_types.split(',').map(t => t.trim()).filter(t => t);
        }
      } else if (Array.isArray(waste_types)) {
        wasteTypesArray = waste_types;
      }
    }

    // Parse waste_adjectives if it's a string
    let wasteAdjectivesArray = [];
    if (waste_adjectives) {
      if (typeof waste_adjectives === 'string') {
        try {
          wasteAdjectivesArray = JSON.parse(waste_adjectives);
        } catch (e) {
          // If it's comma-separated, split it
          wasteAdjectivesArray = waste_adjectives.split(',').map(a => a.trim()).filter(a => a);
        }
      } else if (Array.isArray(waste_adjectives)) {
        wasteAdjectivesArray = waste_adjectives;
      }
    } else if (waste_adjective) {
      // Fallback to single adjective
      wasteAdjectivesArray = [waste_adjective];
    }

    // If no predicted_category from the frontend, run server-side analysis
    let serverPrediction = null;
    if (!predicted_category && absoluteImagePath) {
      try {
        serverPrediction = await analyzeImageUtil(absoluteImagePath);
        console.log('[WasteController] Server-side recognition:', serverPrediction);
      } catch (err) {
        console.error('[WasteController] Server analysis error:', err.message);
      }
    }

    // Create submission
    const submission = await WasteSubmission.create({
      user_id: userId,
      image_path: imagePath,
      predicted_category: predicted_category || (serverPrediction ? serverPrediction.category : null),
      confidence_score: confidence_score || (serverPrediction ? serverPrediction.confidence : null),
      confirmed_category: confirmed_category || null,
      waste_types: wasteTypesArray.length > 0 ? wasteTypesArray : null,
      waste_adjective: waste_adjective || null,
      waste_adjectives: wasteAdjectivesArray.length > 0 ? wasteAdjectivesArray : null,
      waste_description: waste_description || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      address_description: address_description || null,
      barangay_id: residentBarangayId
    });

    res.status(201).json({
      status: 'success',
      message: 'Waste submission created successfully',
      data: submission
    });
  } catch (error) {
    console.error('Submit waste error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit waste',
      error: error.message
    });
  }
};

/**
 * Admin: Get all submissions (any status) with optional filters
 */
const getAllSubmissionsAdmin = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (req.session.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    const status = req.query.status ? String(req.query.status).toLowerCase() : null;
    const allowedStatuses = ['pending', 'scheduled', 'collected'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status filter'
      });
    }

    const barangay_id = req.query.barangay_id ? parseInt(req.query.barangay_id, 10) : null;
    if (req.query.barangay_id !== undefined && (Number.isNaN(barangay_id) || barangay_id < 1)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid barangay_id filter'
      });
    }

    const from_date = req.query.from_date ? String(req.query.from_date) : null;
    const to_date = req.query.to_date ? String(req.query.to_date) : null;

    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;

    const submissions = await WasteSubmission.listAllForAdmin({
      status,
      barangay_id,
      from_date,
      to_date,
      limit,
      offset
    });

    return res.json({
      status: 'success',
      data: submissions
    });
  } catch (error) {
    console.error('Get all submissions (admin) error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get submissions'
    });
  }
};

/**
 * Analyze image and predict category
 * Uses real TensorFlow.js + MobileNet image analysis
 */
const analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided'
      });
    }

    // Call real image analysis
    const result = await analyzeImageUtil(req.file.path);

    // Optionally clean up temp file for analyze-only endpoint
    // (submissions keep the file, but analyze is just a preview)
    try {
      fs.unlinkSync(req.file.path);
    } catch (e) { /* non-critical */ }

    res.json({
      status: 'success',
      data: {
        predicted_category: result.category,
        confidence_score: result.confidence,
        adjective: result.adjective,
        description: result.description,
        raw_labels: result.rawLabels || []
      }
    });
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to analyze image',
      error: error.message
    });
  }
};

/**
 * Get pending submissions (for collectors, with filters)
 */
const getPendingSubmissions = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (req.session.role !== 'collector' && req.session.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Collector access required'
      });
    }

    const filters = {
      waste_types: req.query.waste_types ? (Array.isArray(req.query.waste_types) ? req.query.waste_types : [req.query.waste_types]) : null,
      waste_adjectives: req.query.waste_adjectives ? (Array.isArray(req.query.waste_adjectives) ? req.query.waste_adjectives : [req.query.waste_adjectives]) : null,
      barangay_id: req.query.barangay_id ? parseInt(req.query.barangay_id) : null
    };

    if (req.session.role === 'collector') {
      const User = require('../models/User');
      const me = await User.findById(req.session.userId);
      if (!me || !me.barangay_id) {
        return res.json({ status: 'success', data: [], warning: 'No barangay assigned. Please contact admin.' });
      }
      // Force scope to collector's barangay
      filters.barangay_id = me.barangay_id;
    }

    const submissions = await WasteSubmission.findPending(filters);

    res.json({
      status: 'success',
      data: submissions
    });
  } catch (error) {
    console.error('Get pending submissions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get pending submissions',
      error: error.message
    });
  }
};

/**
 * Get user's waste submissions
 */
const getUserSubmissions = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const userId = req.session.userId;
    const submissions = await WasteSubmission.findByUserId(userId);

    res.json({
      status: 'success',
      data: submissions
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get submissions',
      error: error.message
    });
  }
};

/**
 * Get submission by ID
 */
const getSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await WasteSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({
        status: 'error',
        message: 'Submission not found'
      });
    }

    res.json({
      status: 'success',
      data: submission
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get submission',
      error: error.message
    });
  }
};

/**
 * Update submission
 */
const updateSubmission = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const submission = await WasteSubmission.update(id, updateData);

    res.json({
      status: 'success',
      message: 'Submission updated successfully',
      data: submission
    });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update submission',
      error: error.message
    });
  }
};

/**
 * Delete submission
 */
const deleteSubmission = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const { id } = req.params;
    const submission = await WasteSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({
        status: 'error',
        message: 'Submission not found'
      });
    }

    // Only allow residents to delete/cancel their OWN pending submissions.
    // Admins can still delete any submission if needed.
    const isOwner = submission.user_id === req.session.userId;
    const isAdmin = req.session.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this submission'
      });
    }

    // Residents can only cancel pending submissions
    if (isOwner && !isAdmin && submission.collection_status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Only pending submissions can be cancelled'
      });
    }

    // Delete image file if exists
    if (submission.image_path) {
      const imagePath = path.join(__dirname, '../../', submission.image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await WasteSubmission.delete(id);

    res.json({
      status: 'success',
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete submission',
      error: error.message
    });
  }
};

/**
 * Collector accepts a pending submission for pickup
 */
const acceptSubmission = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const role = req.session.role;
    if (role !== 'collector' && role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Only collectors or admins can accept submissions'
      });
    }

    const { id } = req.params;
    const submissionId = parseInt(id, 10);
    const existing = await WasteSubmission.findById(submissionId);

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Submission not found'
      });
    }

    if (existing.collection_status !== 'pending') {
      return res.status(409).json({
        status: 'error',
        message: 'This submission has already been accepted.'
      });
    }

    if (role === 'collector') {
      const User = require('../models/User');
      const me = await User.findById(req.session.userId);
      if (!me || me.barangay_id !== existing.barangay_id) {
        return res.status(403).json({
          status: 'error',
          message: 'You can only accept submissions from your assigned barangay'
        });
      }
    }

    // Atomically claim this pending submission for the current collector
    const updated = await WasteSubmission.claimPendingForCollector(submissionId, req.session.userId);

    if (!updated) {
      // Another collector claimed this submission first
      return res.status(409).json({
        status: 'error',
        message: 'This submission has already been accepted by another collector.'
      });
    }

    // Notify resident that their request was accepted
    try {
      await Notification.create({
        user_id: existing.user_id,
        schedule_id: null,
        notification_type: 'schedule_change',
        message: 'Your waste collection request has been accepted and scheduled.'
      });
    } catch (e) {
      console.error('Notification create error (acceptSubmission):', e.message);
    }

    res.json({
      status: 'success',
      message: 'Submission accepted for pickup',
      data: updated
    });
  } catch (error) {
    console.error('Accept submission error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to accept submission',
      error: error.message
    });
  }
};

/**
 * Get submissions assigned to the logged-in collector
 */
const getAssignedSubmissions = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const role = req.session.role;
    if (role !== 'collector' && role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Only collectors or admins can view assigned submissions'
      });
    }

    const collectorId = req.session.userId;

    if (role === 'collector') {
      const User = require('../models/User');
      const me = await User.findById(collectorId);
      if (!me || !me.barangay_id) {
        return res.json({ status: 'success', data: [], warning: 'No barangay assigned. Please contact admin.' });
      }
    }

    const submissions = await WasteSubmission.findAssignedToCollector(collectorId);

    res.json({
      status: 'success',
      data: submissions
    });
  } catch (error) {
    console.error('Get assigned submissions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get assigned submissions',
      error: error.message
    });
  }
};

/**
 * Collector marks an assigned submission as collected
 */
const completeSubmission = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const role = req.session.role;
    const { id } = req.params;

    const submission = await WasteSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({
        status: 'error',
        message: 'Submission not found'
      });
    }

    // Only the assigned collector or an admin can complete
    const isAssignedCollector = submission.collector_id === req.session.userId;
    const isAdmin = role === 'admin';

    if (!isAssignedCollector && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to complete this submission'
      });
    }

    if (submission.collection_status !== 'scheduled') {
      return res.status(400).json({
        status: 'error',
        message: 'Only scheduled submissions can be marked as collected'
      });
    }

    const { collector_notes } = req.body;

    const updated = await WasteSubmission.update(id, {
      collection_status: 'collected',
      collected_at: new Date(),
      ...(collector_notes && { collector_notes })
    });

    // Notify resident that their request was completed
    try {
      await Notification.create({
        user_id: submission.user_id,
        schedule_id: null,
        notification_type: 'system',
        message: 'Your waste collection request has been marked as collected. Thank you for participating!'
      });
    } catch (e) {
      console.error('Notification create error (completeSubmission):', e.message);
    }

    res.json({
      status: 'success',
      message: 'Submission marked as collected',
      data: updated
    });
  } catch (error) {
    console.error('Complete submission error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to complete submission',
      error: error.message
    });
  }
}

/**
 * Report a problem with an assigned submission
 */
const reportProblem = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ status: 'error', message: 'Authentication required' });
    }

    const role = req.session.role;
    const { id } = req.params;
    const { problem_type, problem_description } = req.body;

    if (!problem_type) {
      return res.status(400).json({ status: 'error', message: 'problem_type is required' });
    }

    const submission = await WasteSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({ status: 'error', message: 'Submission not found' });
    }

    const isAssignedCollector = submission.collector_id === req.session.userId;
    const isAdmin = role === 'admin';

    if (!isAssignedCollector && !isAdmin) {
      return res.status(403).json({ status: 'error', message: 'Not authorized to report issue for this submission' });
    }

    const updated = await WasteSubmission.update(id, {
      has_problem: 1,
      problem_type,
      problem_description: problem_description || null
    });

    // Notify Admin
    try {
      await Notification.create({
        user_id: 1, // Assumes Admin user_id is 1. If dynamic, look up first admin.
        schedule_id: null,
        notification_type: 'system',
        message: `Collector reported a problem with submission #${id}: ${problem_type}`
      });
    } catch (e) {
      console.error('Admin Notification block error:', e.message);
    }

    res.json({
      status: 'success',
      message: 'Problem reported successfully',
      data: updated
    });

  } catch (error) {
    console.error('Report problem error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to report problem' });
  }
};

/**
 * Get collector historical completed tasks
 */
const getCollectorHistory = async (req, res) => {
  try {
    if (!req.session || !req.session.userId || (req.session.role !== 'collector' && req.session.role !== 'admin')) {
      return res.status(403).json({ status: 'error', message: 'Collector access required' });
    }

    if (req.session.role === 'collector') {
      const User = require('../models/User');
      const me = await User.findById(req.session.userId);
      if (!me || !me.barangay_id) {
        return res.json({ status: 'success', data: [], warning: 'No barangay assigned. Please contact admin.' });
      }
    }

    const history = await WasteSubmission.getCollectorHistory(req.session.userId);
    res.json({ status: 'success', data: history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get collector history' });
  }
};

/**
 * Get collector summary stats
 */
const getCollectorStats = async (req, res) => {
  try {
    if (!req.session || !req.session.userId || (req.session.role !== 'collector' && req.session.role !== 'admin')) {
      return res.status(403).json({ status: 'error', message: 'Collector access required' });
    }

    let barangayId = null;
    if (req.session.role === 'collector') {
      const User = require('../models/User');
      const me = await User.findById(req.session.userId);
      if (!me || !me.barangay_id) {
        return res.json({
          status: 'success',
          data: {
            total_collected: 0,
            total_weight_kg: 0,
            today_collected: 0,
            issues_reported: 0
          },
          warning: 'No barangay assigned. Please contact admin.'
        });
      }
      barangayId = me.barangay_id;
    }

    const stats = await WasteSubmission.getCollectorStats(req.session.userId, barangayId);
    res.json({ status: 'success', data: stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get collector stats' });
  }
};

module.exports = {
  submitWaste,
  analyzeImage,
  getPendingSubmissions,
  getUserSubmissions,
  getAllSubmissionsAdmin,
  getSubmission,
  updateSubmission,
  deleteSubmission,
  acceptSubmission,
  getAssignedSubmissions,
  completeSubmission,
  reportProblem,
  getCollectorHistory,
  getCollectorStats
};
