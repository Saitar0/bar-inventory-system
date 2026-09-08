const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const { User, Product } = require('../models');

async function seed() {
  try {
    await sequelize.sync();

    const passwordHash = await bcrypt.hash('admin123', 10);
    const [admin] = await User.findOrCreate({
      where: { email: 'admin@bar.com' },
      defaults: { name: 'Administrador', passwordHash, role: 'admin' },
    });

    const sampleProducts = [
      { name: 'Cerveja Long Neck', category: 'bebida', sku: 'CERV-001', costPrice: 3.5, salePrice: 8, quantity: 100, lowStockThreshold: 20 },
      { name: 'Refrigerante Lata', category: 'bebida', sku: 'REFR-001', costPrice: 2, salePrice: 6, quantity: 80, lowStockThreshold: 15 },
      { name: 'Porção de Batata Frita', category: 'alimento', sku: 'ALIM-001', costPrice: 8, salePrice: 22, quantity: 30, lowStockThreshold: 10 },
      { name: 'Água Mineral', category: 'bebida', sku: 'AGUA-001', costPrice: 1, salePrice: 4, quantity: 5, lowStockThreshold: 10 },
    ];

    for (const productData of sampleProducts) {
      await Product.findOrCreate({ where: { sku: productData.sku }, defaults: productData });
    }

    console.log(`Usuário admin: ${admin.email} / senha: admin123`);
    console.log('Seed concluído com sucesso.');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  }
}

seed();
