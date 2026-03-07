const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.use(requireAuth);

router.get('/barangay-coverage', requireAdmin, adminController.getBarangayCoverage);

module.exports = router;
