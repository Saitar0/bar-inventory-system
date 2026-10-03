const { Op } = require('sequelize');
const { Product, StockMovement } = require('../models');

async function list(req, res, next) {
  try {
    const { category, lowStock, search } = req.query;
    const where = { active: true };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    const products = await Product.findAll({ where, order: [['name', 'ASC']] });

    const filtered = lowStock === 'true'
      ? products.filter((p) => p.quantity <= p.lowStockThreshold)
      : products;

    return res.json(filtered);
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    return res.json(product);
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const { name, category, sku, costPrice, salePrice, quantity, lowStockThreshold } = req.body;

    if (!name || salePrice === undefined) {
      return res.status(400).json({ message: 'Nome e preço de venda são obrigatórios.' });
    }

    const product = await Product.create({
      name,
      category,
      sku,
      costPrice: costPrice || 0,
      salePrice,
      quantity: quantity || 0,
      lowStockThreshold,
    });

    if (product.quantity > 0) {
      await StockMovement.create({
        productId: product.id,
        type: 'entrada',
        reason: 'compra',
        quantity: product.quantity,
        previousQuantity: 0,
        newQuantity: product.quantity,
        note: 'Estoque inicial',
        userId: req.user && req.user.id,
      });
    }

    return res.status(201).json(product);
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    const { name, category, sku, costPrice, salePrice, lowStockThreshold, active } = req.body;

    await product.update({
      name: name !== undefined ? name : product.name,
      category: category !== undefined ? category : product.category,
      sku: sku !== undefined ? sku : product.sku,
      costPrice: costPrice !== undefined ? costPrice : product.costPrice,
      salePrice: salePrice !== undefined ? salePrice : product.salePrice,
      lowStockThreshold: lowStockThreshold !== undefined ? lowStockThreshold : product.lowStockThreshold,
      active: active !== undefined ? active : product.active,
    });

    return res.json(product);
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    await product.update({ active: false });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

async function adjustStock(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    const { type, quantity, reason, note } = req.body;

    if (!['entrada', 'saida'].includes(type)) {
      return res.status(400).json({ message: 'Tipo de movimentação inválido.' });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantidade deve ser maior que zero.' });
    }

    const previousQuantity = product.quantity;
    let newQuantity;

    if (type === 'entrada') {
      newQuantity = previousQuantity + quantity;
    } else {
      if (previousQuantity < quantity) {
        return res.status(400).json({ message: 'Estoque insuficiente para esta saída.' });
      }
      newQuantity = previousQuantity - quantity;
    }

    await product.update({ quantity: newQuantity });

    const movement = await StockMovement.create({
      productId: product.id,
      type,
      reason: reason || 'ajuste',
      quantity,
      previousQuantity,
      newQuantity,
      note,
      userId: req.user && req.user.id,
    });

    return res.status(201).json({ product, movement });
  } catch (error) {
    return next(error);
  }
}

async function movementHistory(req, res, next) {
  try {
    const where = {};
    if (req.params.id) {
      where.productId = req.params.id;
    }

    const movements = await StockMovement.findAll({
      where,
      include: [{ association: 'product', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    return res.json(movements);
  } catch (error) {
    return next(error);
  }
}

module.exports = { list, getById, create, update, remove, adjustStock, movementHistory };
