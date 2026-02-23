const express = require('express');
const pool = require('../data/db');

const router = express.Router();

const VALID_STATUSES = ['pending', 'preparing', 'ready', 'delivered'];

// GET /api/orders - List all orders (newest first)
router.get('/', async (req, res) => {
  try {
    const { rows: orders } = await pool.query(`
      SELECT id, customer_name AS "customerName", customer_mobile AS "customerMobile",
             total_amount::float AS "totalAmount", status, order_date AS "orderDate"
      FROM orders ORDER BY order_date DESC
    `);

    for (const order of orders) {
      const { rows: items } = await pool.query(
        'SELECT menu_item_id AS "menuItemId", name, quantity, price::float FROM order_items WHERE order_id = $1',
        [order.id]
      );
      order.items = items;
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/orders - Create a new order
router.post('/', async (req, res) => {
  try {
    const { customerName, customerMobile, items, totalAmount } = req.body;

    if (!customerName || !customerMobile) {
      return res.status(400).json({ error: 'Customer name and mobile are required' });
    }

    if (typeof customerName !== 'string' || typeof customerMobile !== 'string') {
      return res.status(400).json({ error: 'Customer name and mobile must be strings' });
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(customerMobile.trim())) {
      return res.status(400).json({ error: 'Mobile must be a valid 10-digit number starting with 6-9' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required' });
    }

    if (totalAmount === undefined || typeof totalAmount !== 'number' || totalAmount < 0) {
      return res.status(400).json({ error: 'Valid total amount is required' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `INSERT INTO orders (customer_name, customer_mobile, total_amount, status, order_date)
         VALUES ($1, $2, $3, 'pending', NOW()) RETURNING id, customer_name AS "customerName",
         customer_mobile AS "customerMobile", total_amount::float AS "totalAmount", status, order_date AS "orderDate"`,
        [customerName.trim(), customerMobile.trim(), totalAmount]
      );
      const newOrder = rows[0];

      for (const item of items) {
        await client.query(
          'INSERT INTO order_items (order_id, menu_item_id, name, quantity, price) VALUES ($1, $2, $3, $4, $5)',
          [newOrder.id, item.menuItemId, item.name, item.quantity, item.price]
        );
      }

      await client.query('COMMIT');

      newOrder.items = items;
      res.status(201).json(newOrder);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /api/orders/:id - Get a single order
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(`
      SELECT id, customer_name AS "customerName", customer_mobile AS "customerMobile",
             total_amount::float AS "totalAmount", status, order_date AS "orderDate"
      FROM orders WHERE id = $1
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = rows[0];
    const { rows: items } = await pool.query(
      'SELECT menu_item_id AS "menuItemId", name, quantity, price::float FROM order_items WHERE order_id = $1',
      [order.id]
    );
    order.items = items;

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const { rows } = await pool.query(`
      UPDATE orders SET status = $1 WHERE id = $2
      RETURNING id, customer_name AS "customerName", customer_mobile AS "customerMobile",
                total_amount::float AS "totalAmount", status, order_date AS "orderDate"
    `, [status, id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = rows[0];
    const { rows: items } = await pool.query(
      'SELECT menu_item_id AS "menuItemId", name, quantity, price::float FROM order_items WHERE order_id = $1',
      [order.id]
    );
    order.items = items;

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
