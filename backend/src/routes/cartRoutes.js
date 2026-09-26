const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const {
  getCart,
  addItemToCart,
  updateCartItemQty,
  removeCartItem
} = require('../controllers/cartController');

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All cart routes require authentication
router.use(protect);

// GET /api/cart
router.get('/', getCart);

// POST /api/cart/items
const addItemValidators = [
  body('productId')
    .notEmpty()
    .withMessage('productId is required')
    .isMongoId()
    .withMessage('productId must be a valid MongoDB ObjectId'),
  body('variantSku')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('variantSku is required'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('quantity must be a positive integer'),
  validate
];
router.post('/items', addItemValidators, addItemToCart);

// PATCH /api/cart/items/:itemId
const updateItemValidators = [
  param('itemId')
    .notEmpty()
    .withMessage('itemId is required')
    .isMongoId()
    .withMessage('itemId must be a valid MongoDB ObjectId'),
  body('quantity')
    .notEmpty()
    .withMessage('quantity is required')
    .isInt({ min: 1 })
    .withMessage('quantity must be a positive integer'),
  validate
];
router.patch('/items/:itemId', updateItemValidators, updateCartItemQty);

// DELETE /api/cart/items/:itemId
const removeItemValidators = [
  param('itemId')
    .notEmpty()
    .withMessage('itemId is required')
    .isMongoId()
    .withMessage('itemId must be a valid MongoDB ObjectId'),
  validate
];
router.delete('/items/:itemId', removeItemValidators, removeCartItem);

module.exports = router;
