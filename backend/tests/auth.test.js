const { test, describe } = require('node:test');
const assert = require('node:assert');

const BASE_URL = 'http://localhost:5000/api/auth';

describe('Auth Module Unit & Integration Tests', () => {
  const uniqueEmail = `test_${Date.now()}@storeflow.com`;
  let authToken = '';

  test('POST /api/auth/register - Successfully registers a new user', async () => {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Runner',
        email: uniqueEmail,
        password: 'password123'
      })
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.token, 'Token should be returned');
    assert.strictEqual(data.user.email, uniqueEmail.toLowerCase());
    assert.strictEqual('password' in data.user, false, 'Password must never be returned');

    authToken = data.token;
  });

  test('POST /api/auth/register - Returns 409 Conflict for duplicate email', async () => {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Runner Duplicate',
        email: uniqueEmail,
        password: 'password123'
      })
    });

    const data = await res.json();
    assert.strictEqual(res.status, 409);
    assert.strictEqual(data.success, false);
  });

  test('POST /api/auth/register - Returns 400 for invalid email format', async () => {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Invalid Email',
        email: 'not-an-email',
        password: 'password123'
      })
    });

    assert.strictEqual(res.status, 400);
  });

  test('POST /api/auth/register - Returns 400 for password shorter than 6 characters', async () => {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Password',
        email: `short_${Date.now()}@storeflow.com`,
        password: '123'
      })
    });

    assert.strictEqual(res.status, 400);
  });

  test('POST /api/auth/login - Successfully logs in with valid credentials', async () => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password: 'password123'
      })
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.token, 'Token should be returned');
    assert.strictEqual('password' in data.user, false);
  });

  test('POST /api/auth/login - Returns 401 for incorrect password', async () => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password: 'wrongPassword999'
      })
    });

    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
  });

  test('POST /api/auth/login - Logs in successfully with seeded demo user', async () => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@storeflow.com',
        password: 'password123'
      })
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.user.email, 'demo@storeflow.com');
  });

  test('GET /api/auth/me - Returns current user profile with valid Bearer token', async () => {
    const res = await fetch(`${BASE_URL}/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.email, uniqueEmail.toLowerCase());
    assert.strictEqual('password' in data.user, false);
  });

  test('GET /api/auth/me - Returns 401 Unauthorized when token is omitted', async () => {
    const res = await fetch(`${BASE_URL}/me`);
    assert.strictEqual(res.status, 401);
  });

  test('GET /api/auth/me - Returns 401 Unauthorized for invalid/tampered token', async () => {
    const res = await fetch(`${BASE_URL}/me`, {
      headers: { 'Authorization': 'Bearer invalid.tampered.token' }
    });
    assert.strictEqual(res.status, 401);
  });
});
