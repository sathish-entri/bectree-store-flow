import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// ─── SVG Icons ───────────────────────────────────────────────

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function IconMinus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconAlertTriangle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconCheckCircle() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#249B3E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconShoppingBag() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

// ─── Main Cart Page Component ────────────────────────────────

export default function CartPage() {
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const {
    cartData,
    cartItems,
    cartCount,
    loading: cartLoading,
    syncCart,
    updateQuantity,
    removeItem,
    checkout,
  } = useCart();

  // Item-level busy map: { [itemId]: boolean }
  const [busyItems, setBusyItems] = useState({});
  // Item-level error map: { [itemId]: string }
  const [itemErrors, setItemErrors] = useState({});

  // Checkout flow state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Sync cart on mount if logged in
  useEffect(() => {
    if (isLoggedIn) {
      syncCart();
    }
  }, [isLoggedIn, syncCart]);

  const handleNavbarSearch = (query) => {
    navigate(`/products?q=${encodeURIComponent(query)}`);
  };

  // ─── Quantity Update ─────────────────────────────────────────

  const handleQuantityChange = async (item, newQty) => {
    if (newQty < 1) return;
    if (item.availableStock > 0 && newQty > item.availableStock) {
      setItemErrors(prev => ({
        ...prev,
        [item._id]: `Cannot exceed available stock (${item.availableStock})`,
      }));
      return;
    }

    setBusyItems(prev => ({ ...prev, [item._id]: true }));
    setItemErrors(prev => ({ ...prev, [item._id]: null }));
    setCheckoutError(null);

    try {
      await updateQuantity(item._id, newQty);
    } catch (err) {
      setItemErrors(prev => ({
        ...prev,
        [item._id]: err.message || 'Failed to update quantity',
      }));
      // If 409 or conflict, refresh cart to get latest authoritative values
      if (err.status === 409 || err.status === 400) {
        await syncCart();
      }
    } finally {
      setBusyItems(prev => ({ ...prev, [item._id]: false }));
    }
  };

  // ─── Remove Item ─────────────────────────────────────────────

  const handleRemoveItem = async (itemId) => {
    setBusyItems(prev => ({ ...prev, [itemId]: true }));
    setItemErrors(prev => ({ ...prev, [itemId]: null }));
    setCheckoutError(null);

    try {
      await removeItem(itemId);
    } catch (err) {
      setItemErrors(prev => ({
        ...prev,
        [itemId]: err.message || 'Failed to remove item',
      }));
      await syncCart();
    } finally {
      setBusyItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // ─── Checkout Flow ───────────────────────────────────────────

  const handleCheckout = async () => {
    if (isCheckingOut) return;
    if (!cartItems.length) return;

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const order = await checkout();
      setOrderSuccess(order);
    } catch (err) {
      // 409: Stale cart / insufficient stock
      if (err.status === 409) {
        setCheckoutError(
          err.message || 'Some items are no longer available or exceed available stock. Please review your cart.'
        );
        // Refresh cart to show updated stock & stale badges
        await syncCart();
      } else if (err.status === 401) {
        navigate('/login?redirect=/cart');
      } else {
        setCheckoutError(err.message || 'Unable to complete checkout. Please try again.');
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  // ─── Sub-views ───────────────────────────────────────────────

  // 1. Auth Loading State
  if (authLoading) {
    return (
      <div className="cart-page-wrapper">
        <Navbar onSearch={handleNavbarSearch} />
        <main className="app-container" style={{ padding: '60px 16px', textAlign: 'center' }}>
          <div className="cart-spinner" />
          <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading StoreFlow Cart...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // 2. Unauthenticated State
  if (!isLoggedIn) {
    return (
      <div className="cart-page-wrapper">
        <Navbar onSearch={handleNavbarSearch} />
        <main className="app-container" style={{ padding: '60px 16px' }}>
          <div className="cart-auth-gate">
            <IconShoppingBag />
            <h2 className="cart-auth-gate__title">Sign In to View Your Cart</h2>
            <p className="cart-auth-gate__text">
              Your cart items are saved to your account. Sign in to access your items, review quantities, and proceed to checkout.
            </p>
            <div className="cart-auth-gate__actions">
              <Link to="/login?redirect=/cart" className="cart-btn cart-btn--primary">
                Sign In to Your Account
              </Link>
              <Link to="/products" className="cart-btn cart-btn--outline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 3. Checkout Success State
  if (orderSuccess) {
    const orderId = orderSuccess._id ? orderSuccess._id.slice(-8).toUpperCase() : 'CONFIRMED';
    const totalAmount = orderSuccess.total ?? cartData?.grandTotal ?? 0;
    const itemCount = orderSuccess.items?.reduce((s, i) => s + i.quantity, 0) ?? cartCount;

    return (
      <div className="cart-page-wrapper">
        <Navbar onSearch={handleNavbarSearch} />
        <main className="app-container" style={{ padding: '60px 16px' }}>
          <div className="cart-success-card">
            <IconCheckCircle />
            <h1 className="cart-success-card__title">Order Placed Successfully!</h1>
            <p className="cart-success-card__sub">
              Thank you for shopping with StoreFlow. Your order has been placed and is being prepared.
            </p>

            <div className="cart-success-card__details">
              <div className="cart-success-row">
                <span className="cart-success-row__label">Order Reference:</span>
                <strong className="cart-success-row__val">#{orderId}</strong>
              </div>
              <div className="cart-success-row">
                <span className="cart-success-row__label">Total Amount:</span>
                <strong className="cart-success-row__val">₹{totalAmount.toLocaleString('en-IN')}</strong>
              </div>
              <div className="cart-success-row">
                <span className="cart-success-row__label">Total Items:</span>
                <span className="cart-success-row__val">{itemCount} items</span>
              </div>
              <div className="cart-success-row">
                <span className="cart-success-row__label">Payment Status:</span>
                <span className="cart-success-badge">Paid & Confirmed</span>
              </div>
            </div>

            <div className="cart-success-card__actions">
              <Link to="/products" className="cart-btn cart-btn--primary" id="btn-continue-shopping-success">
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Live cart summary values from authoritative backend response
  const grandTotal = cartData?.grandTotal ?? 0;
  const totalQuantity = cartData?.totalQuantity ?? cartCount;
  const hasStaleItems = Boolean(cartData?.hasStaleItems);

  return (
    <div className="cart-page-wrapper">
      <Navbar onSearch={handleNavbarSearch} />

      <main className="app-container cart-page">
        {/* Navigation Breadcrumb / Back Link */}
        <div className="cart-breadcrumb">
          <Link to="/products" className="cart-back-link" id="cart-back-to-shop">
            ← Continue Shopping
          </Link>
        </div>

        {/* Page Header */}
        <div className="cart-header">
          <div className="cart-header__title-row">
            <h1 className="cart-title">Shopping Cart</h1>
            {totalQuantity > 0 && (
              <span className="cart-count-pill" id="cart-item-count-pill">
                {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
        </div>

        {/* Stale Cart Top Alert Banner */}
        {hasStaleItems && (
          <div className="cart-banner cart-banner--warning" role="alert" id="cart-stale-banner">
            <IconAlertTriangle />
            <div className="cart-banner__content">
              <strong>Action required:</strong> Some items in your cart have updated stock or are no longer available. Please review quantities or remove unavailable items before placing your order.
            </div>
          </div>
        )}

        {/* Checkout Failure / Conflict Alert */}
        {checkoutError && (
          <div className="cart-banner cart-banner--error" role="alert" id="cart-checkout-error-banner">
            <IconAlertTriangle />
            <div className="cart-banner__content">
              <strong>Checkout Alert:</strong> {checkoutError}
            </div>
          </div>
        )}

        {/* Loading skeleton or Cart content */}
        {cartLoading && !cartData ? (
          <div className="cart-loading-box">
            <div className="cart-spinner" />
            <p>Loading your cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="cart-empty-state" id="cart-empty-view">
            <IconShoppingBag />
            <h2 className="cart-empty-state__title">Your cart is empty</h2>
            <p className="cart-empty-state__text">
              Looks like you haven&apos;t added any items to your cart yet. Explore our wide collection of electronics, gadgets, and daily essentials.
            </p>
            <Link to="/products" className="cart-btn cart-btn--primary" id="btn-empty-cart-shop">
              Explore Products
            </Link>
          </div>
        ) : (
          /* 2-Column Responsive Cart Layout */
          <div className="cart-layout">
            {/* Left Column: Cart Items List */}
            <section className="cart-items-section" aria-label="Cart items">
              <div className="cart-items-card">
                <div className="cart-items-header">
                  <span>Product Details</span>
                  <span className="cart-items-header__price-col">Price &amp; Quantity</span>
                </div>

                <div className="cart-items-list">
                  {cartItems.map((item) => {
                    const isBusy = busyItems[item._id];
                    const itemErr = itemErrors[item._id];
                    const isOut = Boolean(item.isOutOfStock || item.availableStock === 0);
                    const isInsufficient = Boolean(!isOut && !item.hasSufficientStock);
                    const productName = item.product?.name || 'StoreFlow Product';
                    const productSlug = item.product?.slug;
                    const productImage = item.product?.images?.[0];
                    const size = item.variantDetails?.size;
                    const colour = item.variantDetails?.colour;

                    return (
                      <article
                        key={item._id}
                        className={`cart-item ${isOut ? 'cart-item--out' : ''} ${isInsufficient ? 'cart-item--insufficient' : ''}`}
                        id={`cart-item-${item._id}`}
                      >
                        {/* 1. Product Image */}
                        <div className="cart-item__image-wrap">
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={productName}
                              className="cart-item__img"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="cart-item__no-img">No image</div>
                          )}
                        </div>

                        {/* 2. Product Information */}
                        <div className="cart-item__info">
                          {item.product?.category && (
                            <span className="cart-item__category">{item.product.category}</span>
                          )}

                          <h3 className="cart-item__name">
                            {productSlug ? (
                              <Link to={`/products/${productSlug}`} className="cart-item__link">
                                {productName}
                              </Link>
                            ) : (
                              <span>{productName}</span>
                            )}
                          </h3>

                          {/* Variant Details: Size, Colour, SKU */}
                          <div className="cart-item__variants">
                            {colour && (
                              <span className="cart-item__variant-badge">
                                Colour: <strong>{colour}</strong>
                              </span>
                            )}
                            {size && (
                              <span className="cart-item__variant-badge">
                                Size: <strong>{size}</strong>
                              </span>
                            )}
                            {item.variantSku && (
                              <span className="cart-item__sku">SKU: {item.variantSku}</span>
                            )}
                          </div>

                          {/* Stale / Stock Warning Badges */}
                          <div className="cart-item__stock-notice">
                            {isOut ? (
                              <span className="cart-stock-badge cart-stock-badge--out" id={`stock-out-${item._id}`}>
                                <IconAlertTriangle /> Out of stock
                              </span>
                            ) : isInsufficient ? (
                              <span className="cart-stock-badge cart-stock-badge--low" id={`stock-low-${item._id}`}>
                                <IconAlertTriangle /> Only {item.availableStock} available
                              </span>
                            ) : (
                              <span className="cart-stock-badge cart-stock-badge--in">
                                In Stock
                              </span>
                            )}
                          </div>

                          {/* Inline Item Error */}
                          {itemErr && (
                            <div className="cart-item__error" role="alert">
                              {itemErr}
                            </div>
                          )}

                          {/* Mobile-only Price & Subtotal */}
                          <div className="cart-item__mobile-pricing">
                            <span className="cart-item__unit-price">
                              ₹{item.currentPrice.toLocaleString('en-IN')} each
                            </span>
                          </div>
                        </div>

                        {/* 3. Quantity Controls & Line Pricing */}
                        <div className="cart-item__actions">
                          {/* Unit Price on Desktop */}
                          <div className="cart-item__unit-col">
                            <span className="cart-item__price-label">Price</span>
                            <span className="cart-item__price-val">
                              ₹{item.currentPrice.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Quantity Selector: [-] Qty [+] */}
                          <div className="cart-item__qty-wrap">
                            <span className="cart-item__price-label">Quantity</span>
                            <div className="cart-qty-control" aria-label={`Quantity for ${productName}`}>
                              <button
                                type="button"
                                className="cart-qty-btn"
                                onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                disabled={isBusy || item.quantity <= 1}
                                aria-label="Decrease quantity"
                                id={`qty-minus-${item._id}`}
                              >
                                <IconMinus />
                              </button>

                              <span className="cart-qty-value" id={`qty-val-${item._id}`}>
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                className="cart-qty-btn"
                                onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                disabled={
                                  isBusy ||
                                  isOut ||
                                  (item.availableStock > 0 && item.quantity >= item.availableStock)
                                }
                                aria-label="Increase quantity"
                                id={`qty-plus-${item._id}`}
                              >
                                <IconPlus />
                              </button>
                            </div>
                          </div>

                          {/* Line Total */}
                          <div className="cart-item__total-col">
                            <span className="cart-item__price-label">Total</span>
                            <span className="cart-item__line-total" id={`line-total-${item._id}`}>
                              ₹{item.lineTotal.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Remove Item Button */}
                          <div className="cart-item__remove-wrap">
                            <button
                              type="button"
                              className="cart-remove-btn"
                              onClick={() => handleRemoveItem(item._id)}
                              disabled={isBusy}
                              aria-label={`Remove ${productName} from cart`}
                              id={`remove-btn-${item._id}`}
                              title="Remove item"
                            >
                              <IconTrash />
                              <span className="cart-remove-btn__text">Remove</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Right Column: Order Summary */}
            <aside className="cart-summary-section" aria-label="Order summary">
              <div className="cart-summary-card">
                <h2 className="cart-summary-card__title">Order Summary</h2>

                <div className="cart-summary-rows">
                  <div className="cart-summary-row">
                    <span className="cart-summary-row__label">
                      Items Subtotal ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})
                    </span>
                    <span className="cart-summary-row__value" id="cart-summary-subtotal">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="cart-summary-row">
                    <span className="cart-summary-row__label">Standard Delivery</span>
                    <span className="cart-summary-row__value cart-summary-row__value--free">
                      FREE
                    </span>
                  </div>

                  {hasStaleItems && (
                    <div className="cart-summary-stale-notice">
                      <IconAlertTriangle />
                      <span>Review unavailable items before proceeding</span>
                    </div>
                  )}

                  <hr className="cart-summary-divider" />

                  <div className="cart-summary-row cart-summary-row--total">
                    <span className="cart-summary-row__label">Order Total</span>
                    <span className="cart-summary-row__value cart-summary-total-val" id="cart-summary-grandtotal">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Authoritative Checkout Button */}
                <button
                  type="button"
                  className="cart-btn cart-btn--checkout"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || cartItems.length === 0}
                  id="cart-checkout-btn"
                >
                  {isCheckingOut ? (
                    <span className="cart-btn-spinner-wrap">
                      <span className="cart-spinner cart-spinner--sm" />
                      Placing Order...
                    </span>
                  ) : (
                    `Checkout • ₹${grandTotal.toLocaleString('en-IN')}`
                  )}
                </button>

                {/* Trust and Assurance */}
                <div className="cart-summary-assurance">
                  <div className="cart-assurance-item">
                    <IconShield />
                    <span>Authoritative live pricing &amp; atomic stock reservation</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
