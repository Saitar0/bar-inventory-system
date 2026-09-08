const createApp = require('./app');
const sequelize = require('./config/database');
require('./models');

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Conexão com o banco de dados estabelecida.');

    const app = createApp();
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Não foi possível iniciar o servidor:', error);
    process.exit(1);
  }
}

start();
