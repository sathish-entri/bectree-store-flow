const { test, describe } = require('node:test');
const assert = require('node:assert');

const BASE_URL = 'http://localhost:5000/api/products';

describe('Product Module Unit & Integration Tests', () => {
  test('GET /api/products - Returns paginated list of products', async () => {
    const res = await fetch(`${BASE_URL}?page=1&limit=12`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.length, 12);
    assert.strictEqual(data.pagination.page, 1);
    assert.strictEqual(data.pagination.total, 30);
    assert.strictEqual(data.pagination.pages, 3);
  });

  test('GET /api/products?category=Electronics - Filters correctly by category', async () => {
    const res = await fetch(`${BASE_URL}?category=Electronics`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.length, 6);
    assert.ok(data.data.every(p => p.category === 'Electronics'));
  });

  test('GET /api/products?minPrice=50&maxPrice=100 - Filters using $elemMatch variant price', async () => {
    const res = await fetch(`${BASE_URL}?minPrice=50&maxPrice=100`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.ok(data.data.length > 0);
    assert.ok(data.data.every(p => p.variants.some(v => v.price >= 50 && v.price <= 100)));
  });

  test('GET /api/products?q=keyboard - Exact keyword search', async () => {
    const res = await fetch(`${BASE_URL}?q=keyboard`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.ok(data.data.length >= 1);
    assert.ok(data.data.some(p => p.name.includes('Keyboard')));
  });

  test('GET /api/products?q=SoundSphe - Substring/partial search works', async () => {
    const res = await fetch(`${BASE_URL}?q=SoundSphe`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.ok(data.data.length >= 1);
    assert.ok(data.data.some(p => p.name.includes('SoundSphere')));
  });

  test('GET /api/products?sort=price_asc - Sorts by lowest variant price ascending', async () => {
    const res = await fetch(`${BASE_URL}?sort=price_asc&limit=10`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    const minPrices = data.data.map(p => p.minVariantPrice);
    for (let i = 1; i < minPrices.length; i++) {
      assert.ok(minPrices[i - 1] <= minPrices[i], `Expected ${minPrices[i - 1]} <= ${minPrices[i]}`);
    }
  });

  test('GET /api/products?sort=price_desc - Sorts by highest variant price descending', async () => {
    const res = await fetch(`${BASE_URL}?sort=price_desc&limit=10`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    const maxPrices = data.data.map(p => p.maxVariantPrice);
    for (let i = 1; i < maxPrices.length; i++) {
      assert.ok(maxPrices[i - 1] >= maxPrices[i], `Expected ${maxPrices[i - 1]} >= ${maxPrices[i]}`);
    }
  });

  test('GET /api/products/categories - Returns unique categories with counts', async () => {
    const res = await fetch(`${BASE_URL}/categories`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.length, 5);
  });

  test('GET /api/products/:slug - Fetches single product detail by slug', async () => {
    const res = await fetch(`${BASE_URL}/aerowave-pro-wireless-headphones`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.slug, 'aerowave-pro-wireless-headphones');
    assert.strictEqual(data.data.variants.length, 3);
  });

  test('GET /api/products/:slug - Returns 404 for non-existent slug', async () => {
    const res = await fetch(`${BASE_URL}/non-existent-product-slug-xyz`);
    assert.strictEqual(res.status, 404);
  });

  test('GET /api/products - Route validation rejects minPrice > maxPrice with 400', async () => {
    const res = await fetch(`${BASE_URL}?minPrice=200&maxPrice=50`);
    assert.strictEqual(res.status, 400);
  });

  test('GET /api/products - Route validation rejects page < 1 with 400', async () => {
    const res = await fetch(`${BASE_URL}?page=-1`);
    assert.strictEqual(res.status, 400);
  });
});
