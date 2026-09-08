const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/summary', dashboardController.summary);
router.get('/top-products', dashboardController.topProducts);
router.get('/low-stock', dashboardController.lowStock);

module.exports = router;
