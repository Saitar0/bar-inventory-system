const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { lowStockThreshold } = require('../config/env');

const CATEGORIES = ['bebida', 'alimento', 'outros'];

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM(...CATEGORIES),
    allowNull: false,
    defaultValue: 'bebida',
  },
  sku: {
    type: DataTypes.STRING,
    unique: true,
  },
  costPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  salePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  lowStockThreshold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: lowStockThreshold,
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'products',
  timestamps: true,
});

Product.CATEGORIES = CATEGORIES;

module.exports = Product;
