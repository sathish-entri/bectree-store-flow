const { test, describe, before } = require('node:test');
const assert = require('node:assert');

const BASE_URL = 'http://localhost:5000/api';

describe('Cart Module Unit & Integration Tests', () => {
  let tokenA = '';
  let tokenB = '';
  let sampleProduct = null;
  let sampleVariant = null;
  let cartItemId = '';

  before(async () => {
    // Register User A
    const resA = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Cart Tester A',
        email: `cart_tester_a_${Date.now()}@storeflow.com`,
        password: 'password123'
      })
    }).then(r => r.json());
    tokenA = resA.token;

    // Register User B
    const resB = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Cart Tester B',
        email: `cart_tester_b_${Date.now()}@storeflow.com`,
        password: 'password123'
      })
    }).then(r => r.json());
    tokenB = resB.token;

    // Fetch sample product
    const prodRes = await fetch(`${BASE_URL}/products?limit=1`).then(r => r.json());
    sampleProduct = prodRes.data[0];
    sampleVariant = sampleProduct.variants[0];
  });

  test('GET /api/cart - Returns empty cart structure for user with no items', async () => {
    const res = await fetch(`${BASE_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.items.length, 0);
    assert.strictEqual(data.data.grandTotal, 0);
    assert.strictEqual(data.data.hasStaleItems, false);
  });

  test('GET /api/cart - Returns 401 Unauthorized when token is missing', async () => {
    const res = await fetch(`${BASE_URL}/cart`);
    assert.strictEqual(res.status, 401);
  });

  test('POST /api/cart/items - Successfully adds item to cart', async () => {
    const res = await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        productId: sampleProduct._id,
        variantSku: sampleVariant.sku,
        quantity: 1
      })
    });
    const data = await res.json();

    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.items.length, 1);
    assert.strictEqual(data.data.items[0].quantity, 1);
    assert.strictEqual(data.data.items[0].currentPrice, sampleVariant.price);

    cartItemId = data.data.items[0]._id;
  });

  test('POST /api/cart/items - Increments quantity when same variant is added again', async () => {
    const res = await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        productId: sampleProduct._id,
        variantSku: sampleVariant.sku,
        quantity: 1
      })
    });
    const data = await res.json();

    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.data.items[0].quantity, 2);
    assert.strictEqual(data.data.items[0].lineTotal, Number((sampleVariant.price * 2).toFixed(2)));
  });

  test('POST /api/cart/items - Rejects quantity exceeding available stock with 400', async () => {
    const res = await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        productId: sampleProduct._id,
        variantSku: sampleVariant.sku,
        quantity: sampleVariant.stock + 50
      })
    });

    assert.strictEqual(res.status, 400);
  });

  test('PATCH /api/cart/items/:itemId - Successfully updates item quantity', async () => {
    const res = await fetch(`${BASE_URL}/cart/items/${cartItemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        quantity: 3
      })
    });
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.items[0].quantity, 3);
    assert.strictEqual(data.data.grandTotal, Number((sampleVariant.price * 3).toFixed(2)));
  });

  test('PATCH /api/cart/items/:itemId - Rejects quantity exceeding available stock with 400', async () => {
    const res = await fetch(`${BASE_URL}/cart/items/${cartItemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        quantity: sampleVariant.stock + 999
      })
    });

    assert.strictEqual(res.status, 400);
  });

  test('Cross-User Cart Isolation - User A cannot modify or delete User B cart item', async () => {
    // User B adds an item
    const resB = await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenB}`
      },
      body: JSON.stringify({
        productId: sampleProduct._id,
        variantSku: sampleVariant.sku,
        quantity: 1
      })
    }).then(r => r.json());

    const itemBId = resB.data.items[0]._id;

    // User A attempts to delete User B's cart item -> 404 (not in User A's cart)
    const attackRes = await fetch(`${BASE_URL}/cart/items/${itemBId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });

    assert.strictEqual(attackRes.status, 404);
  });

  test('DELETE /api/cart/items/:itemId - Successfully removes item from cart', async () => {
    const res = await fetch(`${BASE_URL}/cart/items/${cartItemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.items.length, 0);
    assert.strictEqual(data.data.grandTotal, 0);
  });
});
