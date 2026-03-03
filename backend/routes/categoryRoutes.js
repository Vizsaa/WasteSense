const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Public: active categories (used by resident submission UI)
router.get('/', categoryController.getActiveCategories);

// Admin: manage categories
router.get('/all', requireAuth, requireAdmin, categoryController.getAllCategories);
router.post('/', requireAuth, requireAdmin, categoryController.createCategory);
router.put('/:id', requireAuth, requireAdmin, categoryController.updateCategory);

module.exports = router;

