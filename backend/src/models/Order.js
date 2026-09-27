const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
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
    }
  },
  priceAtOrder: {
    type: Number,
    required: [true, 'Price at order time is required'],
    min: [0, 'Price must be non-negative']
  }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  items: {
    type: [orderItemSchema],
    validate: {
      validator: (items) => Array.isArray(items) && items.length > 0,
      message: 'Order must contain at least one item'
    }
  },
  total: {
    type: Number,
    required: [true, 'Order total is required'],
    min: [0, 'Order total must be non-negative']
  },
  status: {
    type: String,
    enum: ['confirmed', 'processing', 'completed', 'cancelled'],
    default: 'confirmed'
  }
}, {
  timestamps: true
});

// Compound index for efficient user order history retrieval sorted newest first
orderSchema.index({ user: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
