const sequelize = require('./database');
require('../models');

async function migrate() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('Migração concluída com sucesso.');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao migrar o banco de dados:', error);
    process.exit(1);
  }
}

migrate();
