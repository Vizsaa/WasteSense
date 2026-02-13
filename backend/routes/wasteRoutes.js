const express = require('express');
const router = express.Router();
const wasteController = require('../controllers/wasteController');
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');

// All routes require authentication
router.use(requireAuth);

// Submit waste with image upload
router.post('/submit', upload.single('image'), wasteController.submitWaste);

// Analyze image (for server-side analysis)
router.post('/analyze', upload.single('image'), wasteController.analyzeImage);

// Get user's submissions
router.get('/my-submissions', wasteController.getUserSubmissions);

// Get pending submissions (for collectors, with filters)
router.get('/pending', wasteController.getPendingSubmissions);

// Get submissions assigned to the logged-in collector
router.get('/assigned', wasteController.getAssignedSubmissions);

// Get submission by ID
router.get('/:id', wasteController.getSubmission);

// Update submission
router.put('/:id', wasteController.updateSubmission);

// Collector actions
router.post('/:id/accept', wasteController.acceptSubmission);
router.post('/:id/complete', wasteController.completeSubmission);

// Delete submission
router.delete('/:id', wasteController.deleteSubmission);

module.exports = router;
