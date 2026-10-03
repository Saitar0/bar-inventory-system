const request = require('supertest');
const createApp = require('../src/app');

const app = createApp();

function authHeader(token) {
  return 'Bearer ' + token;
}

async function registerAndLogin(role) {
  role = role || 'admin';
  const email = role + '-' + Date.now() + '-' + Math.random() + '@bar.com';
  await request(app).post('/api/auth/register').send({
    name: 'Usuario ' + role,
    email,
    password: '123456',
    role,
  });

  const res = await request(app).post('/api/auth/login').send({ email, password: '123456' });
  return res.body.token;
}

describe('Dashboard', () => {
  test('returns summary metrics', async () => {
    const token = await registerAndLogin('admin');

    const productRes = await request(app)
      .post('/api/products')
      .set('Authorization', authHeader(token))
      .send({ name: 'Produto Dashboard', salePrice: 10, quantity: 5, lowStockThreshold: 10 });

    await request(app)
      .post('/api/sales')
      .set('Authorization', authHeader(token))
      .send({ items: [{ productId: productRes.body.id, quantity: 1 }] });

    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('dailyRevenue');
    expect(res.body).toHaveProperty('lowStockCount');
    expect(res.body.salesToday).toBeGreaterThanOrEqual(1);
  });

  test('returns low stock products', async () => {
    const token = await registerAndLogin('admin');

    await request(app)
      .post('/api/products')
      .set('Authorization', authHeader(token))
      .send({ name: 'Produto Critico', salePrice: 10, quantity: 1, lowStockThreshold: 10 });

    const res = await request(app)
      .get('/api/dashboard/low-stock')
      .set('Authorization', authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.some((p) => p.name === 'Produto Critico')).toBe(true);
  });

  test('returns top products', async () => {
    const token = await registerAndLogin('admin');

    const productRes = await request(app)
      .post('/api/products')
      .set('Authorization', authHeader(token))
      .send({ name: 'Produto Top', salePrice: 10, quantity: 50, lowStockThreshold: 5 });

    await request(app)
      .post('/api/sales')
      .set('Authorization', authHeader(token))
      .send({ items: [{ productId: productRes.body.id, quantity: 5 }] });

    const res = await request(app)
      .get('/api/dashboard/top-products')
      .set('Authorization', authHeader(token));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
