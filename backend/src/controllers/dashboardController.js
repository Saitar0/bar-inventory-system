const { Op, fn, col, literal } = require('sequelize');
const { Product, Sale, SaleItem } = require('../models');

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function summary(req, res, next) {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const monthStart = startOfMonth(now);

    const [dailyRevenue, monthlyRevenue, totalProducts, lowStockCount, salesToday] = await Promise.all([
      Sale.sum('total', { where: { createdAt: { [Op.gte]: todayStart } } }),
      Sale.sum('total', { where: { createdAt: { [Op.gte]: monthStart } } }),
      Product.count({ where: { active: true } }),
      Product.count({
        where: { active: true, quantity: { [Op.lte]: col('lowStockThreshold') } },
      }),
      Sale.count({ where: { createdAt: { [Op.gte]: todayStart } } }),
    ]);

    return res.json({
      dailyRevenue: dailyRevenue || 0,
      monthlyRevenue: monthlyRevenue || 0,
      totalProducts,
      lowStockCount,
      salesToday,
    });
  } catch (error) {
    return next(error);
  }
}

async function topProducts(req, res, next) {
  try {
    const limit = Number(req.query.limit) || 5;

    const results = await SaleItem.findAll({
      attributes: [
        'productId',
        'productName',
        [fn('SUM', col('quantity')), 'totalQuantity'],
        [fn('SUM', col('subtotal')), 'totalRevenue'],
      ],
      group: ['productId', 'productName'],
      order: [[literal('totalQuantity'), 'DESC']],
      limit,
    });

    return res.json(results);
  } catch (error) {
    return next(error);
  }
}

async function lowStock(req, res, next) {
  try {
    const products = await Product.findAll({
      where: { active: true, quantity: { [Op.lte]: col('lowStockThreshold') } },
      order: [['quantity', 'ASC']],
    });
    return res.json(products);
  } catch (error) {
    return next(error);
  }
}

module.exports = { summary, topProducts, lowStock };
