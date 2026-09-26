const Product = require('../models/Product');

/**
 * ============================================================================
 * CART SERVICE - Live Price, Stock Calculation & Stale Cart Detection
 * ============================================================================
 * 
 * WHY THIS SERVICE EXISTS:
 * 1. The database is the ONLY source of truth for price and stock.
 * 2. Never trust 'priceAtAdd' for checkout or totals — always fetch live product data.
 * 3. Never silently delete stale items — flag them so the customer is notified.
 */

const calculateLiveCart = async (cart) => {
  // If user has no cart document or an empty cart, return clean default structure
  if (!cart || !cart.items || cart.items.length === 0) {
    return {
      _id: cart ? cart._id : null,
      items: [],
      totalQuantity: 0,
      grandTotal: 0,
      hasStaleItems: false
    };
  }

  // Step 1: Collect all unique Product IDs from cart items
  const productIds = [...new Set(cart.items.map(item => item.product.toString()))];

  // Step 2: Fetch current live products from MongoDB in a single query
  const liveProducts = await Product.find({ _id: { $in: productIds } }).lean().exec();

  // Create a quick lookup map (Key: productId -> Value: Product document)
  const productMap = new Map(liveProducts.map(p => [p._id.toString(), p]));

  let grandTotal = 0;
  let totalQuantity = 0;
  let hasStaleItems = false;

  // Step 3: Loop through every cart item and perform live cross-checks
  const calculatedItems = cart.items.map(item => {
    const product = productMap.get(item.product.toString());

    // Edge Case A: The product was deleted from database while in user's cart
    if (!product) {
      hasStaleItems = true;
      return {
        _id: item._id,
        productId: item.product,
        variantSku: item.variantSku,
        quantity: item.quantity,
        priceAtAdd: item.priceAtAdd,
        currentPrice: 0,
        lineTotal: 0,
        availableStock: 0,
        hasSufficientStock: false,
        isOutOfStock: true,
        isDeletedProduct: true,
        product: null,
        message: 'This product is no longer available in our store'
      };
    }

    // Step 4: Find the exact variant by SKU (case-insensitive for safety)
    const normalizedSku = item.variantSku.trim().toUpperCase();
    const variant = product.variants ? product.variants.find(v => v.sku.toUpperCase() === normalizedSku) : null;

    // Edge Case B: The specific variant (size/color) was removed by store admin
    if (!variant) {
      hasStaleItems = true;
      return {
        _id: item._id,
        productId: product._id,
        variantSku: item.variantSku,
        quantity: item.quantity,
        priceAtAdd: item.priceAtAdd,
        currentPrice: 0,
        lineTotal: 0,
        availableStock: 0,
        hasSufficientStock: false,
        isOutOfStock: true,
        isDeletedVariant: true,
        product: {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          images: product.images,
          category: product.category
        },
        message: 'This specific variant is no longer available'
      };
    }

    // Step 5: Authoritative live calculations from MongoDB
    const currentPrice = variant.price;
    const availableStock = variant.stock;
    const isOutOfStock = availableStock === 0;
    const hasSufficientStock = !isOutOfStock && availableStock >= item.quantity;

    // If stock is less than what the user wants to buy, mark cart as having stale items
    if (!hasSufficientStock) {
      hasStaleItems = true;
    }

    // Step 6: Calculate line total using exact currency rounding (2 decimal places)
    const lineTotal = Math.round(currentPrice * item.quantity * 100) / 100;
    grandTotal += lineTotal;
    totalQuantity += item.quantity;

    return {
      _id: item._id,
      productId: product._id,
      variantSku: variant.sku,
      variantDetails: {
        size: variant.size,
        colour: variant.colour
      },
      quantity: item.quantity,
      priceAtAdd: item.priceAtAdd, // Historical reference only
      currentPrice: currentPrice,  // Live authoritative price
      lineTotal: lineTotal,
      availableStock: availableStock,
      hasSufficientStock: hasSufficientStock,
      isOutOfStock: isOutOfStock,
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        images: product.images,
        category: product.category
      }
    };
  });

  return {
    _id: cart._id,
    items: calculatedItems,
    totalQuantity: totalQuantity,
    grandTotal: Math.round(grandTotal * 100) / 100,
    hasStaleItems: hasStaleItems
  };
};

module.exports = {
  calculateLiveCart
};
