process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

const { sequelize } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});
