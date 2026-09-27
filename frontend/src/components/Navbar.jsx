import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// ─── SVG Icons from Figma ────────────────────────────────────

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function IconOffer() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg className="main-header__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconFilterSlider() {
  return (
    <svg className="main-header__search-filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <circle cx="16" cy="6" r="2.5" fill="currentColor" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <circle cx="9" cy="12" r="2.5" fill="currentColor" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="17" cy="18" r="2.5" fill="currentColor" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export default function Navbar({ onSearch, searchValue, onToggleMobileFilter }) {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [localSearch, setLocalSearch] = useState(searchValue ?? '');

  useEffect(() => {
    setLocalSearch(searchValue ?? '');
  }, [searchValue]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setLocalSearch(val);
    onSearch?.(val);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch?.(localSearch.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch?.(localSearch.trim());
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* 1. Top Utility Bar — Figma: Light grey #F5F5F7 */}
      <div className="topbar">
        <div className="topbar__inner">
          <div className="topbar__left">
            <span>Welcome to worldwide StoreFlow!</span>
          </div>
          <div className="topbar__right">
            <div className="topbar__item">
              <IconPin />
              <span>Deliver to <strong>423651</strong></span>
            </div>
            <span className="topbar__divider">|</span>
            <div className="topbar__item">
              <IconTruck />
              <span>Track your order</span>
            </div>
            <span className="topbar__divider">|</span>
            <div className="topbar__item">
              <IconOffer />
              <span>All Offers</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Header — Figma: White #FFFFFF with center search */}
      <header className="main-header" role="banner">
        <div className="main-header__inner">
          {/* Left: Hamburger + StoreFlow Logo */}
          <div className="main-header__left">
            <button
              className="main-header__hamburger"
              aria-label="Toggle Navigation Menu"
              onClick={onToggleMobileFilter}
            >
              <span className="main-header__hamburger-bar" />
              <span className="main-header__hamburger-bar" />
              <span className="main-header__hamburger-bar" />
            </button>

            <Link to="/" className="main-header__logo" aria-label="StoreFlow Home">
              StoreFlow
            </Link>
          </div>

          {/* Center: Search Bar with #F3F9FB background & search icon */}
          <div className="main-header__search">
            <form onSubmit={handleSearchSubmit} role="search">
              <div className="main-header__search-box">
                <IconSearch />
                <input
                  id="global-search-input"
                  className="main-header__search-input"
                  type="search"
                  placeholder="Search essentials, groceries and more..."
                  value={localSearch}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                  aria-label="Search essentials, groceries and more"
                />
                <button
                  type="button"
                  onClick={onToggleMobileFilter}
                  aria-label="Search filter options"
                  title="Filter options"
                >
                  <IconFilterSlider />
                </button>
              </div>
            </form>
          </div>

          {/* Right: User + Cart */}
          <div className="main-header__right">
            {user ? (
              <button
                className="main-header__btn"
                onClick={handleLogout}
                title={`Logged in as ${user.name}. Click to logout.`}
              >
                <IconUser />
                <span>{user.name.split(' ')[0]}</span>
              </button>
            ) : (
              <Link to="/login" className="main-header__btn" id="nav-signin-btn">
                <IconUser />
                <span>Sign Up/Sign In</span>
              </Link>
            )}

            <div className="main-header__divider" />

            <Link to="/cart" className="main-header__btn" id="nav-cart-btn" aria-label="Cart">
              <IconCart />
              {cartCount > 0 && (
                <span className="main-header__cart-badge">{cartCount}</span>
              )}
              <span>Cart</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
