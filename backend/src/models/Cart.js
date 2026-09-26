const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  variantSku: {
    type: String,
    required: [true, 'Variant SKU is required'],
    trim: true,
    uppercase: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be an integer'
    },
    default: 1
  },
  // priceAtAdd is a non-authoritative snapshot stored for UI reference/history.
  // NOTE: Server NEVER trusts this for order calculation. The final total is always computed from the Product document.
  priceAtAdd: {
    type: Number,
    required: [true, 'Price snapshot at add time is required'],
    min: [0, 'Price must be positive']
  }
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    unique: true,
    index: true
  },
  items: [cartItemSchema]
}, {
  timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
