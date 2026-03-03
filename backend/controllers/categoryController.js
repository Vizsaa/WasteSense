const WasteCategory = require('../models/WasteCategory');

function normalizeCategoryKey(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Public: list active waste categories
 */
const getActiveCategories = async (req, res) => {
  try {
    const categories = await WasteCategory.findActive();
    res.json({ status: 'success', data: categories });
  } catch (error) {
    console.error('Get active categories error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get categories' });
  }
};

/**
 * Admin: list all categories (active + inactive)
 */
const getAllCategories = async (req, res) => {
  try {
    if (!req.session || req.session.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Admin access required' });
    }
    const categories = await WasteCategory.findAll();
    res.json({ status: 'success', data: categories });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to get categories' });
  }
};

/**
 * Admin: create a category
 */
const createCategory = async (req, res) => {
  try {
    if (!req.session || req.session.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Admin access required' });
    }

    const { category_key, display_name, description } = req.body;
    if (!display_name) {
      return res.status(400).json({ status: 'error', message: 'display_name is required' });
    }

    const key = normalizeCategoryKey(category_key || display_name);
    if (!key || key.length < 2) {
      return res.status(400).json({ status: 'error', message: 'Invalid category key' });
    }

    const created = await WasteCategory.create({
      category_key: key,
      display_name: String(display_name).trim(),
      description: description ? String(description).trim() : null,
      created_by: req.session.userId
    });

    res.status(201).json({ status: 'success', message: 'Category created', data: created });
  } catch (error) {
    console.error('Create category error:', error);

    // Handle duplicate key error propagated from the model
    if (error.message === 'Category key already exists') {
      return res.status(409).json({
        status: 'error',
        message: 'Category key already exists'
      });
    }

    // Handle common database issues with clearer messages
    if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_ROW_IS_REFERENCED_2') {
      // Foreign key issue on created_by → users(user_id)
      return res.status(400).json({
        status: 'error',
        message: 'Invalid admin user for created_by. Please log out, log back in as an admin, and try again.'
      });
    }

    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        status: 'error',
        message: 'Database table "waste_categories" does not exist. Please run the database setup SQL script.'
      });
    }

    // Fallback: include the underlying message in development to aid debugging
    const baseMessage = 'Failed to create category';
    const detailedMessage =
      process.env.NODE_ENV === 'development' && error.message
        ? `${baseMessage}: ${error.message}`
        : baseMessage;

    res.status(500).json({
      status: 'error',
      message: detailedMessage
    });
  }
};

/**
 * Admin: update category
 */
const updateCategory = async (req, res) => {
  try {
    if (!req.session || req.session.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Admin access required' });
    }

    const { id } = req.params;
    const categoryId = parseInt(id, 10);
    if (Number.isNaN(categoryId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid category id' });
    }

    const { category_key, display_name, description, is_active } = req.body;
    const updateData = {};

    if (category_key !== undefined) {
      const key = normalizeCategoryKey(category_key);
      if (!key) {
        return res.status(400).json({ status: 'error', message: 'Invalid category key' });
      }
      updateData.category_key = key;
    }
    if (display_name !== undefined) {
      const name = String(display_name).trim();
      if (name.length < 2) {
        return res.status(400).json({ status: 'error', message: 'display_name is too short' });
      }
      updateData.display_name = name;
    }
    if (description !== undefined) {
      updateData.description = description ? String(description).trim() : null;
    }
    if (is_active !== undefined) {
      updateData.is_active = Boolean(is_active);
    }

    const updated = await WasteCategory.update(categoryId, updateData);
    res.json({ status: 'success', message: 'Category updated', data: updated });
  } catch (error) {
    console.error('Update category error:', error);
    const msg = error.message === 'Category key already exists' ? error.message : 'Failed to update category';
    res.status(error.message === 'Category key already exists' ? 409 : 500).json({ status: 'error', message: msg });
  }
};

module.exports = {
  getActiveCategories,
  getAllCategories,
  createCategory,
  updateCategory
};

