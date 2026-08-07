const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, orderController.createOrder);
router.get('/my-orders', authenticateToken, orderController.getUserOrders);
router.get('/admin/metrics', orderController.getDashboardMetrics);
router.patch('/:id/status', orderController.updateOrderStatus);
router.get('/:id', authenticateToken, orderController.getOrderById);

module.exports = router;
