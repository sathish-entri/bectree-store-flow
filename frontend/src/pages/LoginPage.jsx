import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/products';
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password);
      } else {
        try {
          await login(email.trim(), password);
        } catch (loginErr) {
          // Auto-provision demo account if not created yet
          if (loginErr.status === 401 && email.trim() === 'john@example.com') {
            await register('John Doe', 'john@example.com', 'password123');
          } else {
            throw loginErr;
          }
        }
      }
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pdp-page-wrapper">
      <Navbar />

      <main className="app-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 16px' }}>
        <div className="login-card">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)', marginBottom: '8px' }}>
              {isRegister ? 'Create an Account' : 'Sign In to StoreFlow'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              {isRegister ? 'Join StoreFlow to manage your cart and orders.' : 'Access your cart and complete your purchases.'}
            </p>
          </div>

          {error && (
            <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isRegister && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Your Name"
                  className="login-input"
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="login-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="login-input"
              />
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="login-submit-btn"
            >
              {loading ? (isRegister ? 'Creating Account...' : 'Signing In...') : (isRegister ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(null); }}
              className="login-toggle-btn"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #F1F5F9', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Demo credentials pre-filled for evaluation.</span>
            <div style={{ marginTop: '8px' }}>
              <Link to="/products" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                ← Continue as Guest
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
