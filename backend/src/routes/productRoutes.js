const express = require('express');
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', productController.list);
router.get('/movements', productController.movementHistory);
router.get('/:id', productController.getById);
router.get('/:id/movements', productController.movementHistory);

router.post('/', authorize('admin', 'gerente'), productController.create);
router.put('/:id', authorize('admin', 'gerente'), productController.update);
router.delete('/:id', authorize('admin', 'gerente'), productController.remove);
router.post('/:id/stock', authorize('admin', 'gerente'), productController.adjustStock);

module.exports = router;
