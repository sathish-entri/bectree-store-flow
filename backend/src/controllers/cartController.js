const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { calculateLiveCart } = require('../services/cartService');

/**
 * ============================================================================
 * CART CONTROLLER - Clean, Readable Endpoints for Server-Side Cart
 * ============================================================================
 * 
 * All actions are strictly isolated to the logged-in user via `req.user._id`.
 * User A can never view or modify User B's cart.
 */

// @desc    Get logged-in user's cart (with live prices & stale item alerts)
// @route   GET /api/cart
// @access  Private (JWT Required)
const getCart = async (req, res, next) => {
  try {
    // 1. Find cart belonging strictly to the authenticated user
    const cart = await Cart.findOne({ user: req.user._id });

    // 2. Compute authoritative live prices, stock counts, and stale flags
    const liveCart = await calculateLiveCart(cart);

    res.status(200).json({
      success: true,
      data: liveCart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add an item to the cart (or increment quantity if already present)
// @route   POST /api/cart/items
// @access  Private (JWT Required)
const addItemToCart = async (req, res, next) => {
  try {
    const { productId, variantSku } = req.body;
    const quantity = parseInt(req.body.quantity, 10) || 1;

    // Guard: Quantity must be at least 1
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Step 1: Verify the Product exists in the database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Step 2: Locate the requested variant (case-insensitive SKU matching)
    const normalizedSku = variantSku.trim().toUpperCase();
    const variant = product.variants.find(v => v.sku.toUpperCase() === normalizedSku);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found for this product'
      });
    }

    // Step 3: Check requested quantity against current stock in MongoDB
    if (quantity > variant.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${quantity}) exceeds available stock (${variant.stock})`
      });
    }

    // Step 4: Find or create the user's cart document
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: []
      });
    }

    // Step 5: Check if this variant is already inside the cart
    const existingIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.variantSku.toUpperCase() === normalizedSku
    );

    if (existingIndex > -1) {
      // If item is already in cart, calculate combined quantity
      const combinedQty = cart.items[existingIndex].quantity + quantity;

      // Reject if combined quantity exceeds total available stock
      if (combinedQty > variant.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${quantity} more. Combined quantity (${combinedQty}) exceeds available stock (${variant.stock})`
        });
      }

      // Increment quantity
      cart.items[existingIndex].quantity = combinedQty;
    } else {
      // If it is a new item, push into items array with priceAtAdd snapshot
      cart.items.push({
        product: product._id,
        variantSku: variant.sku,
        quantity,
        priceAtAdd: variant.price
      });
    }

    // Step 6: Save cart and return formatted live cart
    await cart.save();
    const liveCart = await calculateLiveCart(cart);

    res.status(201).json({
      success: true,
      data: liveCart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quantity of an existing item in the cart
// @route   PATCH /api/cart/items/:itemId
// @access  Private (JWT Required)
const updateCartItemQty = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const quantity = parseInt(req.body.quantity, 10);

    // Guard: Quantity must be at least 1 (to delete, use DELETE endpoint)
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer greater than or equal to 1'
      });
    }

    // Step 1: Find user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Step 2: Locate the item inside this user's cart
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found in your cart'
      });
    }

    // Step 3: Fetch live Product & Variant to check live stock
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product no longer exists'
      });
    }

    const variant = product.variants.find(v => v.sku.toUpperCase() === item.variantSku.toUpperCase());
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant no longer exists'
      });
    }

    // Step 4: Ensure requested quantity doesn't exceed live stock
    if (quantity > variant.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${quantity}) exceeds available stock (${variant.stock})`,
        availableStock: variant.stock
      });
    }

    // Step 5: Update quantity and save
    item.quantity = quantity;
    await cart.save();

    const liveCart = await calculateLiveCart(cart);

    res.status(200).json({
      success: true,
      data: liveCart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove an item from the cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private (JWT Required)
const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    // Step 1: Find user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Step 2: Find the item index in user's cart
    const itemIndex = cart.items.findIndex(i => i._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found in your cart'
      });
    }

    // Step 3: Remove item from array and save
    cart.items.splice(itemIndex, 1);
    await cart.save();

    // Step 4: Recalculate live cart and return
    const liveCart = await calculateLiveCart(cart);

    res.status(200).json({
      success: true,
      data: liveCart
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItemQty,
  removeCartItem
};
