const { Sequelize } = require('sequelize');
const { sequelizeConfig } = require('./env');

const sequelize = new Sequelize(sequelizeConfig);

module.exports = sequelize;
