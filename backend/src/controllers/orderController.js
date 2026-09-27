const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * ============================================================================
 * ORDER CONTROLLER - Atomic Checkout, Stock Guard & Concurrency Protection
 * ============================================================================
 * 
 * CORE ARCHITECTURAL PRINCIPLE:
 * 1. Uses a MongoDB ACID Transaction for all stock decrements, Order creation,
 *    and Cart clearance.
 * 2. Uses atomic `findOneAndUpdate` with `$elemMatch: { stock: { $gte: qty } }`
 *    and `$inc: { "variants.$.stock": -qty }` to prevent race conditions.
 * 3. Never allows overselling (stock cannot drop below zero).
 * 4. Computes authoritative total on the server from live Product variant prices.
 */

// @desc    Create a new order from current cart (ACID Transaction + Atomic Stock Guard)
// @route   POST /api/orders
// @access  Private (JWT Required)
const createOrder = async (req, res, next) => {
  // Step 1: Fetch the user's cart (project only items and user)
  const cart = await Cart.findOne({ user: req.user._id }).select('items user');

  // Guard: Empty cart cannot be ordered
  if (!cart || !cart.items || cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot place an order with an empty cart'
    });
  }

  // Step 2: Fetch only variant pricing & stock (strip descriptions, images, categories)
  const productIds = [...new Set(cart.items.map(item => item.product.toString()))];
  const products = await Product.find({ _id: { $in: productIds } })
    .select('variants')
    .lean();
  const productMap = new Map(products.map(p => [p._id.toString(), p]));

  let orderTotal = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const product = productMap.get(item.product.toString());

    // Check if product still exists
    if (!product) {
      return res.status(409).json({
        success: false,
        message: 'A product in your cart is no longer available'
      });
    }

    const normalizedSku = item.variantSku.trim().toUpperCase();
    const variant = product.variants ? product.variants.find(v => v.sku.toUpperCase() === normalizedSku) : null;

    // Check if variant still exists
    if (!variant) {
      return res.status(409).json({
        success: false,
        message: `Variant ${item.variantSku} is no longer available`
      });
    }

    // Check if current stock satisfies requested quantity
    if (variant.stock < item.quantity) {
      return res.status(409).json({
        success: false,
        message: `Insufficient stock for variant ${variant.sku}. Requested: ${item.quantity}, Available: ${variant.stock}`
      });
    }

    const priceAtOrder = variant.price;
    const lineTotal = Math.round(priceAtOrder * item.quantity * 100) / 100;
    orderTotal += lineTotal;

    orderItems.push({
      product: product._id,
      variantSku: variant.sku,
      quantity: item.quantity,
      priceAtOrder: priceAtOrder
    });
  }

  orderTotal = Math.round(orderTotal * 100) / 100;

  // Step 3: Execute in MongoDB ACID Transaction
  const session = await mongoose.startSession();
  let createdOrder = null;

  try {
    await session.withTransaction(async () => {
      // Step 4: Atomically decrement stock for every item inside the transaction
      for (const item of cart.items) {
        const normalizedSku = item.variantSku.trim().toUpperCase();

        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item.product,
            variants: {
              $elemMatch: {
                sku: normalizedSku,
                stock: { $gte: item.quantity } // 🔒 Atomic guard: only updates if stock >= requested qty
              }
            }
          },
          {
            $inc: { 'variants.$.stock': -item.quantity } // Atomically decrement stock
          },
          {
            select: '_id',
            new: true,
            returnDocument: 'after',
            session
          }
        );

        // If update returned null, a concurrent order purchased the stock first!
        if (!updatedProduct) {
          const stockError = new Error(`Insufficient stock for variant ${item.variantSku}. Order could not be completed.`);
          stockError.statusCode = 409;
          throw stockError;
        }
      }

      // Step 5: Create the Order document inside the transaction
      const [order] = await Order.create(
        [
          {
            user: req.user._id,
            items: orderItems,
            total: orderTotal,
            status: 'confirmed'
          }
        ],
        { session }
      );

      // Step 6: Clear the user's cart inside the transaction
      cart.items = [];
      await cart.save({ session });

      createdOrder = order.toObject ? order.toObject() : order;
      delete createdOrder.__v;
    });

    return res.status(201).json({
      success: true,
      data: createdOrder
    });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  } finally {
    session.endSession();
  }
};

// @desc    Get order history for logged-in user
// @route   GET /api/orders
// @access  Private (JWT Required)
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .select('-__v')
      .sort({ createdAt: -1 })
      .populate('items.product', 'name slug images')
      .lean()
      .exec();

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID (with ownership check)
// @route   GET /api/orders/:orderId
// @access  Private (JWT Required)
const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .select('-__v')
      .populate('items.product', 'name slug images')
      .lean()
      .exec();

    // Check existence and verify ownership (User A cannot view User B's order)
    if (!order || order.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById
};
