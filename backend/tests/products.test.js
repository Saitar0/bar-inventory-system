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

describe('Products', () => {
  test('admin can create a product', async () => {
    const token = await registerAndLogin('admin');

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', authHeader(token))
      .send({ name: 'Cerveja Teste', category: 'bebida', salePrice: 8, costPrice: 3, quantity: 50, lowStockThreshold: 10 });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Cerveja Teste');
    expect(res.body.quantity).toBe(50);
  });

  test('vendedor cannot create a product', async () => {
    const token = await registerAndLogin('vendedor');

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', authHeader(token))
      .send({ name: 'Produto Negado', salePrice: 5 });

    expect(res.status).toBe(403);
  });

  test('lists products and filters low stock items', async () => {
    const token = await registerAndLogin('admin');

    await request(app)
      .post('/api/products')
      .set('Authorization', authHeader(token))
      .send({ name: 'Estoque Baixo', salePrice: 5, quantity: 2, lowStockThreshold: 10 });

    await request(app)
      .post('/api/products')
      .set('Authorization', authHeader(token))
      .send({ name: 'Estoque Ok', salePrice: 5, quantity: 100, lowStockThreshold: 10 });

    const res = await request(app)
      .get('/api/products?lowStock=true')
      .set('Authorization', authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.some((p) => p.name === 'Estoque Baixo')).toBe(true);
    expect(res.body.some((p) => p.name === 'Estoque Ok')).toBe(false);
  });

  test('adjusts stock and records movement history', async () => {
    const token = await registerAndLogin('admin');

    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', authHeader(token))
      .send({ name: 'Produto Ajuste', salePrice: 5, quantity: 10, lowStockThreshold: 5 });

    const productId = createRes.body.id;

    const adjustRes = await request(app)
      .post('/api/products/' + productId + '/stock')
      .set('Authorization', authHeader(token))
      .send({ type: 'entrada', quantity: 20, reason: 'compra', note: 'Reposição' });

    expect(adjustRes.status).toBe(201);
    expect(adjustRes.body.product.quantity).toBe(30);

    const historyRes = await request(app)
      .get('/api/products/' + productId + '/movements')
      .set('Authorization', authHeader(token));

    expect(historyRes.status).toBe(200);
    expect(historyRes.body.length).toBeGreaterThanOrEqual(1);
  });

  test('rejects stock output greater than available quantity', async () => {
    const token = await registerAndLogin('admin');

    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', authHeader(token))
      .send({ name: 'Produto Sem Estoque', salePrice: 5, quantity: 5, lowStockThreshold: 5 });

    const productId = createRes.body.id;

    const adjustRes = await request(app)
      .post('/api/products/' + productId + '/stock')
      .set('Authorization', authHeader(token))
      .send({ type: 'saida', quantity: 100, reason: 'ajuste' });

    expect(adjustRes.status).toBe(400);
  });
});
