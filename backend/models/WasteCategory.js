const db = require('../config/db.config');

class WasteCategory {
  static async findActive() {
    const sql = `
      SELECT
        category_id,
        category_key,
        display_name,
        description,
        is_active,
        created_at,
        updated_at
      FROM waste_categories
      WHERE is_active = TRUE
      ORDER BY display_name ASC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  static async findAll() {
    const sql = `
      SELECT
        category_id,
        category_key,
        display_name,
        description,
        is_active,
        created_by,
        created_at,
        updated_at
      FROM waste_categories
      ORDER BY display_name ASC
    `;
    const [rows] = await db.query(sql);
    return rows;
  }

  static async findById(categoryId) {
    const sql = `
      SELECT
        category_id,
        category_key,
        display_name,
        description,
        is_active,
        created_by,
        created_at,
        updated_at
      FROM waste_categories
      WHERE category_id = ?
    `;
    const [rows] = await db.query(sql, [categoryId]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async findByKey(categoryKey) {
    const sql = `
      SELECT
        category_id,
        category_key,
        display_name,
        description,
        is_active,
        created_by,
        created_at,
        updated_at
      FROM waste_categories
      WHERE category_key = ?
    `;
    const [rows] = await db.query(sql, [categoryKey]);
    return rows.length > 0 ? rows[0] : null;
  }

  static async create(categoryData) {
    const { category_key, display_name, description, created_by } = categoryData;
    const sql = `
      INSERT INTO waste_categories (category_key, display_name, description, created_by)
      VALUES (?, ?, ?, ?)
    `;
    try {
      const result = await db.execute(sql, [
        category_key,
        display_name,
        description || null,
        created_by || null
      ]);
      return await this.findById(result.insertId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Category key already exists');
      }
      throw error;
    }
  }

  static async update(categoryId, updateData) {
    const allowedFields = ['category_key', 'display_name', 'description', 'is_active'];
    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(updateData[field]);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(categoryId);
    const sql = `UPDATE waste_categories SET ${updates.join(', ')} WHERE category_id = ?`;
    await db.query(sql, values);
    return await this.findById(categoryId);
  }
}

module.exports = WasteCategory;

