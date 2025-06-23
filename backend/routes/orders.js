const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  cancelOrder,
  getMyOrders
} = require('../controllers/orders');

// User-specific routes
router.use(protect);

router.get('/myorders', getMyOrders);
router.route('/:id')
  .get(getOrder)

// Checkout  
router.post('/checkout', createOrder);

// Admin/Seller routes  
router.use(authorize('admin', 'seller'));

router.route('/')
  .get(getOrders)
  
router.route('/:id')
  .put(updateOrder)
  .delete(cancelOrder)

module.exports = router;