const express = require('express');
const pool = require('../data/db');

const router = express.Router();

// GET /api/menu - List all menu items
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, category, price::float, description, available FROM menu_items ORDER BY name');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// POST /api/menu - Create a new menu item
router.post('/', async (req, res) => {
  try {
    const { name, category, price, description, available } = req.body;

    if (!name || !category || price === undefined || price === null) {
      return res.status(400).json({ error: 'Name, category, and price are required' });
    }

    if (typeof name !== 'string' || typeof category !== 'string') {
      return res.status(400).json({ error: 'Name and category must be strings' });
    }

    const trimmedName = name.trim();
    const trimmedCategory = category.trim();

    if (!trimmedName || !trimmedCategory) {
      return res.status(400).json({ error: 'Name and category cannot be empty' });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'Price must be a non-negative number' });
    }

    if (description !== undefined && typeof description !== 'string') {
      return res.status(400).json({ error: 'Description must be a string' });
    }

    if (available !== undefined && typeof available !== 'boolean') {
      return res.status(400).json({ error: 'Available must be a boolean' });
    }

    const { rows } = await pool.query(
      'INSERT INTO menu_items (name, category, price, description, available) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, category, price::float, description, available',
      [trimmedName, trimmedCategory, price, description ? description.trim() : '', available !== undefined ? available : true]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// PUT /api/menu/:id - Update a menu item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, description, available } = req.body;

    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({ error: 'Price must be a non-negative number' });
    }

    if (name !== undefined && typeof name !== 'string') {
      return res.status(400).json({ error: 'Name must be a string' });
    }
    if (category !== undefined && typeof category !== 'string') {
      return res.status(400).json({ error: 'Category must be a string' });
    }

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) { fields.push(`name = $${paramCount++}`); values.push(name.trim()); }
    if (category !== undefined) { fields.push(`category = $${paramCount++}`); values.push(category.trim()); }
    if (price !== undefined) { fields.push(`price = $${paramCount++}`); values.push(price); }
    if (description !== undefined) { fields.push(`description = $${paramCount++}`); values.push(description); }
    if (available !== undefined) { fields.push(`available = $${paramCount++}`); values.push(available); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE menu_items SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, name, category, price::float, description, available`,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// DELETE /api/menu/:id - Delete a menu item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'DELETE FROM menu_items WHERE id = $1 RETURNING id, name, category, price::float, description, available',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.status(200).json({ message: 'Menu item deleted', item: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

module.exports = router;
