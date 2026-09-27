const express = require('express');
const { param } = require('express-validator');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById
} = require('../controllers/orderController');

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All order routes require authentication
router.use(protect);

// POST /api/orders - Create an order with transaction & atomic stock decrement
router.post('/', createOrder);

// GET /api/orders - Get logged-in user's order history (sorted newest first)
router.get('/', getOrders);

// GET /api/orders/:orderId - Get single order details with ownership verification
const getOrderByIdValidators = [
  param('orderId')
    .notEmpty()
    .withMessage('orderId is required')
    .isMongoId()
    .withMessage('orderId must be a valid MongoDB ObjectId'),
  validate
];
router.get('/:orderId', getOrderByIdValidators, getOrderById);

module.exports = router;
