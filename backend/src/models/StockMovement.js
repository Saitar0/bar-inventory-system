const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Movimentações de estoque: entrada (compra/ajuste) ou saída (venda/perda/ajuste)
const MOVEMENT_TYPES = ['entrada', 'saida'];
const MOVEMENT_REASONS = ['compra', 'venda', 'ajuste', 'perda'];

const StockMovement = sequelize.define('StockMovement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM(...MOVEMENT_TYPES),
    allowNull: false,
  },
  reason: {
    type: DataTypes.ENUM(...MOVEMENT_REASONS),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  previousQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  newQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  note: {
    type: DataTypes.STRING,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'stock_movements',
  timestamps: true,
});

StockMovement.TYPES = MOVEMENT_TYPES;
StockMovement.REASONS = MOVEMENT_REASONS;

module.exports = StockMovement;
