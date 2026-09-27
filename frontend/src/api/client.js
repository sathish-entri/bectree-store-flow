// Centralized API client for StoreFlow backend
// In dev, Vite proxies /api/* → http://localhost:5000. In prod, set VITE_API_URL.
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

/**
 * Core fetch wrapper — attaches JWT token if present, standardizes errors
 */
async function request(path, options = {}) {
  const token = localStorage.getItem('sf_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // For non-2xx responses, throw a structured error
  if (!res.ok) {
    let body = {};
    try { body = await res.json(); } catch (_) { /* ignore */ }
    const err = new Error(body.message || `Request failed with status ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return res.json();
}

// ─── Product APIs ────────────────────────────────────────────

/**
 * GET /api/products
 * All filtering, sorting, search, and pagination is server-side.
 * @param {Object} params - { category, minPrice, maxPrice, sort, q, page, limit }
 */
export function getProducts(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) qs.set(k, v);
  });
  const query = qs.toString();
  return request(`/products${query ? `?${query}` : ''}`);
}

/**
 * GET /api/products/categories
 * Returns distinct categories with product counts.
 */
export function getCategories() {
  return request('/products/categories');
}

/**
 * GET /api/products/:slug
 * Returns full product detail including all variants.
 */
export function getProductBySlug(slug) {
  return request(`/products/${slug}`);
}

// ─── Auth APIs ───────────────────────────────────────────────

export function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(name, email, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export function getMe() {
  return request('/auth/me');
}

// ─── Cart APIs ───────────────────────────────────────────────

export function getCart() {
  return request('/cart');
}

export function addToCart(productId, variantSku, quantity = 1) {
  return request('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, variantSku, quantity }),
  });
}

export function updateCartItem(itemId, quantity) {
  return request(`/cart/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(itemId) {
  return request(`/cart/items/${itemId}`, { method: 'DELETE' });
}

// ─── Order APIs ──────────────────────────────────────────────

export function createOrder() {
  return request('/orders', { method: 'POST' });
}

export function getOrders() {
  return request('/orders');
}

export function getOrderById(orderId) {
  return request(`/orders/${orderId}`);
}
