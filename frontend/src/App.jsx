import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';

/**
 * App root — React Router, Auth & Cart providers, route definitions.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Screen 1: Product Listing */}
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="/products" element={<ProductListingPage />} />

            {/* Screen 2: Product Detail (Step 9) */}
            <Route path="/products/:slug" element={<ProductDetailPage />} />

            {/* Screen 3: Cart (Step 10 stub) */}
            <Route
              path="/cart"
              element={
                <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Inter, system-ui' }}>
                  <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Cart</h2>
                  <p style={{ color: '#6b7280' }}>Coming in Step 10 — Cart items, quantity controls, checkout.</p>
                  <a href="/products" style={{ color: 'var(--primary)', marginTop: '1rem', display: 'inline-block' }}>
                    ← Continue Shopping
                  </a>
                </div>
              }
            />

            {/* Auth: Sign In */}
            <Route path="/login" element={<LoginPage />} />

            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/products" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
