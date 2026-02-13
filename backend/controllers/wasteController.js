const WasteSubmission = require('../models/WasteSubmission');
const Notification = require('../models/Notification');
const { predictCategory } = require('../utils/imageRecognition');
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

    // Handle file upload
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    // Get form data
    const {
      predicted_category,
      confirmed_category,
      waste_types, // Array of selected waste types
      waste_adjective,
      waste_adjectives, // Array of selected waste adjectives
      waste_description,
      latitude,
      longitude,
      address_description,
      barangay_id
    } = req.body;

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

    // Create submission
    const submission = await WasteSubmission.create({
      user_id: userId,
      image_path: imagePath,
      predicted_category: predicted_category || null,
      confirmed_category: confirmed_category || null,
      waste_types: wasteTypesArray.length > 0 ? wasteTypesArray : null,
      waste_adjective: waste_adjective || null,
      waste_adjectives: wasteAdjectivesArray.length > 0 ? wasteAdjectivesArray : null,
      waste_description: waste_description || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      address_description: address_description || null,
      barangay_id: barangay_id ? parseInt(barangay_id) : null
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
 * Analyze image and predict category
 * This endpoint can be used for server-side image analysis
 */
const analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided'
      });
    }

    // For now, return a basic prediction
    // In production, you would use TensorFlow.js or a cloud API here
    const prediction = predictCategory(['waste', 'trash']); // Placeholder

    res.json({
      status: 'success',
      data: {
        predicted_category: prediction.category,
        confidence: prediction.confidence,
        adjective: prediction.adjective,
        description: prediction.description
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
    const filters = {
      waste_types: req.query.waste_types ? (Array.isArray(req.query.waste_types) ? req.query.waste_types : [req.query.waste_types]) : null,
      waste_adjectives: req.query.waste_adjectives ? (Array.isArray(req.query.waste_adjectives) ? req.query.waste_adjectives : [req.query.waste_adjectives]) : null,
      barangay_id: req.query.barangay_id ? parseInt(req.query.barangay_id) : null
    };

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
    const submission = await WasteSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({
        status: 'error',
        message: 'Submission not found'
      });
    }

    if (submission.collection_status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'Only pending submissions can be accepted'
      });
    }

    // Assign to this collector and mark as scheduled
    const updated = await WasteSubmission.update(id, {
      collector_id: req.session.userId,
      collection_status: 'scheduled'
    });

    // Notify resident that their request was accepted
    try {
      await Notification.create({
        user_id: submission.user_id,
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

    const updated = await WasteSubmission.update(id, {
      collection_status: 'collected',
      collected_at: new Date()
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
};

module.exports = {
  submitWaste,
  analyzeImage,
  getPendingSubmissions,
  getUserSubmissions,
  getSubmission,
  updateSubmission,
  deleteSubmission,
  acceptSubmission,
  getAssignedSubmissions,
  completeSubmission
};
