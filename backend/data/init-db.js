const pool = require('./db');

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
        description TEXT DEFAULT '',
        available BOOLEAN DEFAULT true
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_name VARCHAR(255) NOT NULL,
        customer_mobile VARCHAR(15) NOT NULL,
        total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
        status VARCHAR(20) NOT NULL DEFAULT 'pending'
          CHECK (status IN ('pending', 'preparing', 'ready', 'delivered')),
        order_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        menu_item_id UUID,
        name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        price NUMERIC(10, 2) NOT NULL CHECK (price >= 0)
      )
    `);

    // Seed menu items only if table is empty
    const { rows } = await client.query('SELECT COUNT(*) FROM menu_items');
    if (parseInt(rows[0].count, 10) === 0) {
      const seedItems = [
        ['Tomato', 'Vegetables', 40, 'Fresh red tomatoes', true],
        ['Onion', 'Vegetables', 30, 'Premium quality onions', true],
        ['Potato', 'Vegetables', 25, 'Farm fresh potatoes', true],
        ['Apple', 'Fruits', 150, 'Crisp and juicy apples', true],
        ['Banana', 'Fruits', 50, 'Ripe yellow bananas', true],
        ['Milk', 'Dairy', 60, 'Full cream fresh milk', true],
        ['Curd', 'Dairy', 45, 'Thick and creamy curd', true],
        ['Rice', 'Grains', 80, 'Premium basmati rice', true]
      ];
      for (const [name, category, price, description, available] of seedItems) {
        await client.query(
          'INSERT INTO menu_items (name, category, price, description, available) VALUES ($1, $2, $3, $4, $5)',
          [name, category, price, description, available]
        );
      }
    }

    await client.query('COMMIT');
    console.log('Database initialized successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Database initialization failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = initializeDatabase;
