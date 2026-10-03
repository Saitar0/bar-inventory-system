const { sequelize, Product, Sale, SaleItem, StockMovement } = require('../models');

async function create(req, res, next) {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'A venda deve conter ao menos um item.' });
  }

  const t = await sequelize.transaction();

  try {
    let total = 0;
    const saleItemsData = [];
    const movements = [];

    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        throw Object.assign(new Error('Item de venda inválido.'), { status: 400 });
      }

      const product = await Product.findByPk(productId, { transaction: t, lock: t.LOCK.UPDATE });

      if (!product || !product.active) {
        throw Object.assign(new Error(`Produto ${productId} não encontrado.`), { status: 404 });
      }

      if (product.quantity < quantity) {
        throw Object.assign(
          new Error(`Estoque insuficiente para o produto "${product.name}".`),
          { status: 400 }
        );
      }

      const previousQuantity = product.quantity;
      const newQuantity = previousQuantity - quantity;
      const subtotal = Number(product.salePrice) * quantity;
      total += subtotal;

      await product.update({ quantity: newQuantity }, { transaction: t });

      saleItemsData.push({
        productId: product.id,
        productName: product.name,
        unitPrice: product.salePrice,
        quantity,
        subtotal,
      });

      movements.push({
        productId: product.id,
        type: 'saida',
        reason: 'venda',
        quantity,
        previousQuantity,
        newQuantity,
        userId: req.user && req.user.id,
      });
    }

    const sale = await Sale.create(
      { total, userId: req.user && req.user.id },
      { transaction: t }
    );

    await SaleItem.bulkCreate(
      saleItemsData.map((data) => ({ ...data, saleId: sale.id })),
      { transaction: t }
    );

    await StockMovement.bulkCreate(movements, { transaction: t });

    await t.commit();

    const created = await Sale.findByPk(sale.id, { include: [{ association: 'items' }] });
    return res.status(201).json(created);
  } catch (error) {
    await t.rollback();
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    const where = {};

    if (startDate || endDate) {
      const { Op } = require('sequelize');
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const sales = await Sale.findAll({
      where,
      include: [{ association: 'items' }],
      order: [['createdAt', 'DESC']],
      limit: 200,
    });

    return res.json(sales);
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    const sale = await Sale.findByPk(req.params.id, { include: [{ association: 'items' }] });
    if (!sale) {
      return res.status(404).json({ message: 'Venda não encontrada.' });
    }
    return res.json(sale);
  } catch (error) {
    return next(error);
  }
}

module.exports = { create, list, getById };
