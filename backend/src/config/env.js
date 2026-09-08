require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

const sequelizeConfig = isTest
  ? {
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    }
  : {
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'bar_inventory',
      logging: false,
    };

module.exports = {
  sequelizeConfig,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  lowStockThreshold: Number(process.env.LOW_STOCK_THRESHOLD || 10),
};
