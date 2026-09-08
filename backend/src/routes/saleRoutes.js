const express = require('express');
const saleController = require('../controllers/saleController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', saleController.list);
router.get('/:id', saleController.getById);
router.post('/', saleController.create);

module.exports = router;
