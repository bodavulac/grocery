const request = require('supertest');
const app = require('../server');

describe('Health Check', () => {
  test('GET /api/health returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});

describe('Menu API', () => {
  test('GET /api/menu returns array of seed items', async () => {
    const res = await request(app).get('/api/menu');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(8);
  });

  test('POST /api/menu creates a new item with valid data', async () => {
    const newItem = { name: 'Bread', category: 'Grains', price: 35, description: 'Fresh bread' };
    const res = await request(app).post('/api/menu').send(newItem);
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Bread');
    expect(res.body).toHaveProperty('id');
  });

  test('POST /api/menu returns 400 for missing fields', async () => {
    const res = await request(app).post('/api/menu').send({ name: 'Test' });
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/menu returns 400 for negative price', async () => {
    const res = await request(app).post('/api/menu').send({ name: 'Bad', category: 'Fruits', price: -10 });
    expect(res.statusCode).toBe(400);
  });

  test('PUT /api/menu/:id updates an item', async () => {
    const menuRes = await request(app).get('/api/menu');
    const itemId = menuRes.body[0].id;
    const res = await request(app).put(`/api/menu/${itemId}`).send({ price: 999 });
    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(999);
  });

  test('PUT /api/menu/:id returns 404 for invalid id', async () => {
    const res = await request(app).put('/api/menu/nonexistent-id').send({ price: 10 });
    expect(res.statusCode).toBe(404);
  });

  test('DELETE /api/menu/:id deletes an item', async () => {
    const menuRes = await request(app).get('/api/menu');
    const lastItem = menuRes.body[menuRes.body.length - 1];
    const res = await request(app).delete(`/api/menu/${lastItem.id}`);
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /api/menu/:id returns 404 for invalid id', async () => {
    const res = await request(app).delete('/api/menu/nonexistent-id');
    expect(res.statusCode).toBe(404);
  });
});

describe('Orders API', () => {
  let createdOrderId;

  test('POST /api/orders creates an order with valid data', async () => {
    const menuRes = await request(app).get('/api/menu');
    const firstItem = menuRes.body[0];
    const order = {
      customerName: 'Test Customer',
      customerMobile: '9876543210',
      items: [{ menuItemId: firstItem.id, name: firstItem.name, quantity: 2, price: firstItem.price }],
      totalAmount: firstItem.price * 2
    };
    const res = await request(app).post('/api/orders').send(order);
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('pending');
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('orderDate');
    createdOrderId = res.body.id;
  });

  test('POST /api/orders returns 400 for missing customer name', async () => {
    const res = await request(app).post('/api/orders').send({ customerMobile: '9876543210' });
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/orders returns 400 for empty items array', async () => {
    const res = await request(app).post('/api/orders').send({
      customerName: 'Test',
      customerMobile: '9876543210',
      items: [],
      totalAmount: 0
    });
    expect(res.statusCode).toBe(400);
  });

  test('GET /api/orders returns array of orders', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /api/orders/:id returns a single order', async () => {
    const res = await request(app).get(`/api/orders/${createdOrderId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.customerName).toBe('Test Customer');
  });

  test('GET /api/orders/:id returns 404 for invalid id', async () => {
    const res = await request(app).get('/api/orders/nonexistent-id');
    expect(res.statusCode).toBe(404);
  });

  test('PUT /api/orders/:id/status updates status to preparing', async () => {
    const res = await request(app)
      .put(`/api/orders/${createdOrderId}/status`)
      .send({ status: 'preparing' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('preparing');
  });

  test('PUT /api/orders/:id/status updates status to ready', async () => {
    const res = await request(app)
      .put(`/api/orders/${createdOrderId}/status`)
      .send({ status: 'ready' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ready');
  });

  test('PUT /api/orders/:id/status updates status to delivered', async () => {
    const res = await request(app)
      .put(`/api/orders/${createdOrderId}/status`)
      .send({ status: 'delivered' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('delivered');
  });

  test('PUT /api/orders/:id/status returns 400 for invalid status', async () => {
    const res = await request(app)
      .put(`/api/orders/${createdOrderId}/status`)
      .send({ status: 'invalid' });
    expect(res.statusCode).toBe(400);
  });

  test('PUT /api/orders/:id/status returns 404 for invalid order id', async () => {
    const res = await request(app)
      .put('/api/orders/nonexistent-id/status')
      .send({ status: 'ready' });
    expect(res.statusCode).toBe(404);
  });
});
