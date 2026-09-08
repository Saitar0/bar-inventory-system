const request = require('supertest');
const createApp = require('../src/app');

const app = createApp();

describe('Auth', () => {
  test('registers a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Vendedor Teste',
      email: 'vendedor@bar.com',
      password: '123456',
      role: 'vendedor',
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('vendedor@bar.com');
    expect(res.body.user.role).toBe('vendedor');
  });

  test('rejects duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Duplicado',
      email: 'dup@bar.com',
      password: '123456',
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Duplicado 2',
      email: 'dup@bar.com',
      password: '123456',
    });

    expect(res.status).toBe(409);
  });

  test('logs in with valid credentials', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login Teste',
      email: 'login@bar.com',
      password: 'senha123',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'login@bar.com',
      password: 'senha123',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('rejects login with invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'naoexiste@bar.com',
      password: 'errada',
    });

    expect(res.status).toBe(401);
  });

  test('rejects access to protected route without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
