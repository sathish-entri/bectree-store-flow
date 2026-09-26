const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: [true, 'Variant SKU is required'],
    trim: true,
    uppercase: true
  },
  size: {
    type: String,
    required: [true, 'Variant size is required'],
    trim: true
  },
  colour: {
    type: String,
    required: [true, 'Variant colour is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Variant price is required'],
    min: [0, 'Price must be positive']
  },
  stock: {
    type: Number,
    required: [true, 'Variant stock is required'],
    min: [0, 'Stock cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Stock must be an integer'
    }
  }
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Product slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true
  },
  images: [{
    type: String,
    required: true
  }],
  variants: {
    type: [variantSchema],
    required: [true, 'At least one variant is required'],
    validate: [
      {
        validator: function (variants) {
          return Array.isArray(variants) && variants.length > 0;
        },
        message: 'Product must have at least one variant'
      },
      {
        validator: function (variants) {
          const skus = variants.map(v => v.sku);
          return new Set(skus).size === skus.length;
        },
        message: 'Variant SKUs must be unique within the same product'
      }
    ]
  }
}, {
  timestamps: true
});

// Indexes for query performance and uniqueness guarantees
productSchema.index({ category: 1 });
productSchema.index({ "variants.price": 1 });
productSchema.index({ "variants.sku": 1 }, { unique: true });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
