const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const BASE_URL = 'http://localhost:5000/api';
const connectDB = require('../src/config/db');
const Product = require('../src/models/Product');
const Cart = require('../src/models/Cart');
const Order = require('../src/models/Order');
const User = require('../src/models/User');

describe('Order Module - ACID Transactions, Atomic Stock Decrement & Concurrency Tests', () => {
  let tokenA = '';
  let tokenB = '';
  let userAId = '';
  let userBId = '';

  let testProduct = null;
  let singleStockProduct = null;
  let multiItemProduct = null;
  let createdOrderId = '';

  before(async () => {
    // Ensure DB is connected for direct DB assertions
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    // Register User A
    const resA = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Order Tester A',
        email: `order_user_a_${Date.now()}@storeflow.com`,
        password: 'password123'
      })
    }).then(r => r.json());
    tokenA = resA.token;
    userAId = resA.user._id;

    // Register User B
    const resB = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Order Tester B',
        email: `order_user_b_${Date.now()}@storeflow.com`,
        password: 'password123'
      })
    }).then(r => r.json());
    tokenB = resB.token;
    userBId = resB.user._id;

    // Create a standard test product
    testProduct = await Product.create({
      name: `Order Test Product ${Date.now()}`,
      slug: `order-test-product-${Date.now()}`,
      description: 'Test product for order operations',
      category: 'Apparel',
      images: ['https://example.com/item.jpg'],
      variants: [
        { sku: `ORD-STD-${Date.now()}-S`, size: 'S', colour: 'Black', price: 50, stock: 10 },
        { sku: `ORD-STD-${Date.now()}-M`, size: 'M', colour: 'White', price: 60, stock: 2 }
      ]
    });

    // Create a product specifically for the Stock=1 Concurrency race condition test
    singleStockProduct = await Product.create({
      name: `Single Stock Product ${Date.now()}`,
      slug: `single-stock-prod-${Date.now()}`,
      description: 'Exclusive limited edition single stock item',
      category: 'Electronics',
      images: ['https://example.com/single.jpg'],
      variants: [
        { sku: `CONCUR-SKU-${Date.now()}`, size: 'Standard', colour: 'Midnight', price: 199, stock: 1 }
      ]
    });

    // Create a product for multi-item partial failure rollback test
    multiItemProduct = await Product.create({
      name: `Multi Item Product ${Date.now()}`,
      slug: `multi-item-prod-${Date.now()}`,
      description: 'Multi-variant item for transaction rollback tests',
      category: 'Footwear',
      images: ['https://example.com/multi.jpg'],
      variants: [
        { sku: `MULTI-A-${Date.now()}`, size: 'UK 9', colour: 'Blue', price: 80, stock: 5 },
        { sku: `MULTI-B-${Date.now()}`, size: 'UK 10', colour: 'Red', price: 90, stock: 1 }
      ]
    });
  });

  after(async () => {
    // Cleanup created test data
    if (testProduct) await Product.findByIdAndDelete(testProduct._id);
    if (singleStockProduct) await Product.findByIdAndDelete(singleStockProduct._id);
    if (multiItemProduct) await Product.findByIdAndDelete(multiItemProduct._id);

    if (userAId) {
      await User.findByIdAndDelete(userAId);
      await Cart.deleteOne({ user: userAId });
      await Order.deleteMany({ user: userAId });
    }
    if (userBId) {
      await User.findByIdAndDelete(userBId);
      await Cart.deleteOne({ user: userBId });
      await Order.deleteMany({ user: userBId });
    }

    await mongoose.disconnect();
  });

  // 1. Missing Token
  test('POST /api/orders - Returns 401 Unauthorized when token is missing', async () => {
    const res = await fetch(`${BASE_URL}/orders`, { method: 'POST' });
    const data = await res.json();

    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
  });

  // 2. Empty Cart Check
  test('POST /api/orders - Returns 400 Bad Request when cart is empty', async () => {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const data = await res.json();

    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.match(data.message, /Cannot place an order with an empty cart/i);
  });

  // 3. Successful Order Creation + Stock Decrement + Cart Clearance
  test('POST /api/orders - Successfully places order, decrements stock atomically, and clears cart', async () => {
    const variant = testProduct.variants[0]; // stock: 10, price: 50
    const initialStock = variant.stock;
    const orderQty = 3;

    // Add item to User A's cart
    await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        productId: testProduct._id.toString(),
        variantSku: variant.sku,
        quantity: orderQty
      })
    });

    // Place order
    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const orderData = await orderRes.json();

    assert.strictEqual(orderRes.status, 201);
    assert.strictEqual(orderData.success, true);
    assert.ok(orderData.data._id);
    assert.strictEqual(orderData.data.status, 'confirmed');
    assert.strictEqual(orderData.data.items.length, 1);
    assert.strictEqual(orderData.data.items[0].variantSku, variant.sku);
    assert.strictEqual(orderData.data.items[0].quantity, orderQty);
    assert.strictEqual(orderData.data.items[0].priceAtOrder, variant.price);
    assert.strictEqual(orderData.data.total, variant.price * orderQty);

    createdOrderId = orderData.data._id;

    // Verify cart is now empty
    const cartRes = await fetch(`${BASE_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const cartData = await cartRes.json();
    assert.strictEqual(cartData.data.items.length, 0);
    assert.strictEqual(cartData.data.grandTotal, 0);

    // Verify stock is decremented in MongoDB
    const updatedProd = await Product.findById(testProduct._id);
    const updatedVar = updatedProd.variants.find(v => v.sku === variant.sku);
    assert.strictEqual(updatedVar.stock, initialStock - orderQty); // 10 - 3 = 7
  });

  // 4. Stale / Insufficient Stock Rejection
  test('POST /api/orders - Returns 409 Conflict when requested quantity exceeds stock', async () => {
    const variantM = testProduct.variants[1]; // stock: 2, price: 60

    // Add 2 items to cart
    await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        productId: testProduct._id.toString(),
        variantSku: variantM.sku,
        quantity: 2
      })
    });

    // Artificially reduce stock in DB to 1 to simulate a stale cart condition
    await Product.updateOne(
      { _id: testProduct._id, 'variants.sku': variantM.sku },
      { $set: { 'variants.$.stock': 1 } }
    );

    // Attempt to checkout with cart qty = 2 when stock = 1
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const data = await res.json();

    assert.strictEqual(res.status, 409);
    assert.strictEqual(data.success, false);
    assert.match(data.message, /Insufficient stock/i);

    // Stale cart item must NOT be silently removed
    const cartRes = await fetch(`${BASE_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const cartData = await cartRes.json();
    assert.strictEqual(cartData.data.items.length, 1);
    assert.strictEqual(cartData.data.items[0].variantSku, variantM.sku);

    // Clean up cart item
    await fetch(`${BASE_URL}/cart/items/${cartData.data.items[0]._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
  });

  // 5. Multi-item Atomic Rollback on Partial Failure
  test('POST /api/orders - Multi-item order rolls back all stock changes if one item fails', async () => {
    const varA = multiItemProduct.variants[0]; // stock: 5
    const varB = multiItemProduct.variants[1]; // stock: 1

    // Add 2 of Var A (valid) and 3 of Var B (invalid, stock is only 1)
    await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        productId: multiItemProduct._id.toString(),
        variantSku: varA.sku,
        quantity: 2
      })
    });

    // Directly insert second item into cart document to test multi-item cart checkout validation
    const cart = await Cart.findOne({ user: userAId });
    cart.items.push({
      product: multiItemProduct._id,
      variantSku: varB.sku,
      quantity: 3,
      priceAtAdd: varB.price
    });
    await cart.save();

    // Attempt checkout
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const data = await res.json();

    assert.strictEqual(res.status, 409);
    assert.strictEqual(data.success, false);

    // CRITICAL: Var A stock must STILL be 5 (not decremented to 3)!
    const prodAfter = await Product.findById(multiItemProduct._id);
    const varAAfter = prodAfter.variants.find(v => v.sku === varA.sku);
    assert.strictEqual(varAAfter.stock, 5, 'Variant A stock must remain untouched due to atomic rollback');

    // Clean up User A cart
    cart.items = [];
    await cart.save();
  });

  // 6. REAL Concurrency Test (Promise.all race condition with Stock = 1)
  test('POST /api/orders - Concurrency: Exactly one order succeeds when two users race for stock = 1', async () => {
    const concurVar = singleStockProduct.variants[0]; // stock is exactly 1

    // Ensure stock is exactly 1 before the race
    await Product.updateOne(
      { _id: singleStockProduct._id, 'variants.sku': concurVar.sku },
      { $set: { 'variants.$.stock': 1 } }
    );

    // Prepare User A cart with qty = 1
    await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        productId: singleStockProduct._id.toString(),
        variantSku: concurVar.sku,
        quantity: 1
      })
    });

    // Prepare User B cart with qty = 1
    await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenB}`
      },
      body: JSON.stringify({
        productId: singleStockProduct._id.toString(),
        variantSku: concurVar.sku,
        quantity: 1
      })
    });

    // 🚀 EXECUTE CONCURRENT CHECKOUTS SIMULTANEOUSLY USING Promise.all()
    const [responseA, responseB] = await Promise.all([
      fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokenA}` }
      }),
      fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokenB}` }
      })
    ]);

    const statusCodes = [responseA.status, responseB.status].sort();

    // Exactly one must be 201 (Created) and exactly one must be 409 (Conflict)
    assert.deepStrictEqual(
      statusCodes,
      [201, 409],
      `Expected one 201 and one 409, but got ${responseA.status} and ${responseB.status}`
    );

    // Check final stock in MongoDB: MUST be strictly 0, NEVER negative (-1)
    const finalProduct = await Product.findById(singleStockProduct._id);
    const finalVar = finalProduct.variants.find(v => v.sku === concurVar.sku);
    assert.strictEqual(finalVar.stock, 0, 'Final stock must be strictly 0');
  });

  // 7. GET /api/orders - Order History Isolation
  test('GET /api/orders - Returns order history for current user only, sorted newest first', async () => {
    const resA = await fetch(`${BASE_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const dataA = await resA.json();

    assert.strictEqual(resA.status, 200);
    assert.strictEqual(dataA.success, true);
    assert.ok(Array.isArray(dataA.data));
    assert.ok(dataA.data.length >= 1);

    // Verify all orders in list belong to User A
    for (const order of dataA.data) {
      assert.strictEqual(order.user.toString(), userAId.toString());
    }

    // Verify sorted newest first
    if (dataA.data.length > 1) {
      const date1 = new Date(dataA.data[0].createdAt).getTime();
      const date2 = new Date(dataA.data[1].createdAt).getTime();
      assert.ok(date1 >= date2, 'Orders must be sorted with newest first');
    }
  });

  // 8. GET /api/orders/:orderId - Ownership and Access Isolation
  test('GET /api/orders/:orderId - Allows owner to view order, but returns 404 for another user', async () => {
    assert.ok(createdOrderId, 'A created order ID is required for this test');

    // Owner (User A) can view the order
    const ownerRes = await fetch(`${BASE_URL}/orders/${createdOrderId}`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const ownerData = await ownerRes.json();
    assert.strictEqual(ownerRes.status, 200);
    assert.strictEqual(ownerData.data._id, createdOrderId);

    // Non-owner (User B) must NOT be able to view User A's order -> 404 Not Found
    const intruderRes = await fetch(`${BASE_URL}/orders/${createdOrderId}`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert.strictEqual(intruderRes.status, 404);
  });

  // 9. GET /api/orders/:orderId - Invalid ObjectId validation
  test('GET /api/orders/:orderId - Returns 400 for invalid ObjectId format', async () => {
    const res = await fetch(`${BASE_URL}/orders/invalid-mongo-id`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
  });
});
