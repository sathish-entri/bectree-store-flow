const express = require('express');
const { query, param } = require('express-validator');
const router = express.Router();
const {
  getProducts,
  getCategories,
  getProductBySlug
} = require('../controllers/productController');
const validate = require('../middleware/validate');

// Route validation rules for GET /api/products
const getProductsValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page parameter must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit parameter must be an integer between 1 and 100'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minPrice must be a valid non-negative number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('maxPrice must be a valid non-negative number')
    .custom((value, { req }) => {
      if (req.query.minPrice !== undefined && parseFloat(req.query.minPrice) > parseFloat(value)) {
        throw new Error('minPrice cannot be greater than maxPrice');
      }
      return true;
    }),
  query('sort')
    .optional()
    .isIn(['price_asc', 'price_desc', 'newest'])
    .withMessage('Invalid sort parameter. Allowed: price_asc, price_desc, newest'),
  query('category')
    .optional()
    .isString()
    .trim(),
  query('q')
    .optional()
    .isString()
    .trim(),
  validate
];

// Route validation rules for GET /api/products/:slug
const getProductBySlugValidators = [
  param('slug')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Product slug is required'),
  validate
];

// Categories endpoint (must precede /:slug to avoid parameter capture)
router.get('/categories', getCategories);

// Main listing endpoint with route validation
router.get('/', getProductsValidators, getProducts);

// Single product detail by slug with route validation
router.get('/:slug', getProductBySlugValidators, getProductBySlug);

module.exports = router;
