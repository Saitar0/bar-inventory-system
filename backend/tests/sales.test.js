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

async function createProduct(overrides) {
  overrides = overrides || {};
  const adminToken = await registerAndLogin('admin');
  const res = await request(app)
    .post('/api/products')
    .set('Authorization', authHeader(adminToken))
    .send(Object.assign({ name: 'Produto Venda', salePrice: 10, costPrice: 5, quantity: 20, lowStockThreshold: 5 }, overrides));
  return res.body;
}

describe('Sales', () => {
  test('registers a sale and decrements product stock', async () => {
    const token = await registerAndLogin('vendedor');
    const product = await createProduct();

    const saleRes = await request(app)
      .post('/api/sales')
      .set('Authorization', authHeader(token))
      .send({ items: [{ productId: product.id, quantity: 3 }] });

    expect(saleRes.status).toBe(201);
    expect(Number(saleRes.body.total)).toBe(30);

    const productRes = await request(app)
      .get('/api/products/' + product.id)
      .set('Authorization', authHeader(token));

    expect(productRes.body.quantity).toBe(17);
  });

  test('rejects sale when stock is insufficient', async () => {
    const token = await registerAndLogin('vendedor');
    const product = await createProduct({ quantity: 2 });

    const saleRes = await request(app)
      .post('/api/sales')
      .set('Authorization', authHeader(token))
      .send({ items: [{ productId: product.id, quantity: 10 }] });

    expect(saleRes.status).toBe(400);
  });

  test('rejects sale without items', async () => {
    const token = await registerAndLogin('vendedor');

    const saleRes = await request(app)
      .post('/api/sales')
      .set('Authorization', authHeader(token))
      .send({ items: [] });

    expect(saleRes.status).toBe(400);
  });

  test('lists sale history', async () => {
    const token = await registerAndLogin('vendedor');
    const product = await createProduct();

    await request(app)
      .post('/api/sales')
      .set('Authorization', authHeader(token))
      .send({ items: [{ productId: product.id, quantity: 1 }] });

    const res = await request(app)
      .get('/api/sales')
      .set('Authorization', authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});
