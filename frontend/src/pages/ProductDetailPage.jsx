import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getProductBySlug, addToCart } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { syncCart } = useCart();

  // Data loading & error states
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Active product image index
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Variant selection & quantity state
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Add to cart feedback states
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [cartError, setCartError] = useState(null);

  // Fetch product from real backend API: GET /api/products/:slug
  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const res = await getProductBySlug(slug);
      const prod = res?.data;
      if (!prod) {
        setNotFound(true);
        return;
      }
      setProduct(prod);
      setActiveImageIdx(0);

      // Default variant selection: prefer first in-stock variant, otherwise first valid variant
      const variants = prod.variants || [];
      const inStockVariant = variants.find(v => (v.stock ?? 0) > 0) || variants[0] || null;
      setSelectedVariant(inStockVariant);
      setQuantity(1);
    } catch (err) {
      if (err.status === 404) {
        setNotFound(true);
      } else {
        setError(err.message || 'Failed to load product details.');
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Extract distinct dynamic attributes from product.variants
  const { availableSizes, availableColours } = useMemo(() => {
    if (!product?.variants) return { availableSizes: [], availableColours: [] };

    const sizes = [];
    const colours = [];
    const seenSizes = new Set();
    const seenColours = new Set();

    product.variants.forEach(v => {
      if (v.size && !seenSizes.has(v.size)) {
        seenSizes.add(v.size);
        sizes.push(v.size);
      }
      if (v.colour && !seenColours.has(v.colour)) {
        seenColours.add(v.colour);
        colours.push(v.colour);
      }
    });

    return { availableSizes: sizes, availableColours: colours };
  }, [product]);

  // Smart Variant Selection Handler
  // Ensures user selection always resolves to a REAL, valid backend variant
  const handleSelectSize = (newSize) => {
    if (!product?.variants || selectedVariant?.size === newSize) return;

    // Check if a variant with (newSize + current colour) exists
    let match = product.variants.find(
      v => v.size === newSize && v.colour === selectedVariant?.colour
    );

    // If that combination doesn't exist, pick the first variant with newSize (prefer in-stock)
    if (!match) {
      const candidates = product.variants.filter(v => v.size === newSize);
      match = candidates.find(v => v.stock > 0) || candidates[0];
    }

    if (match) {
      setSelectedVariant(match);
      // Revalidate quantity against new variant stock
      setQuantity(q => (match.stock > 0 ? Math.min(Math.max(1, q), match.stock) : 1));
      setCartSuccess(false);
      setCartError(null);
    }
  };

  const handleSelectColour = (newColour) => {
    if (!product?.variants || selectedVariant?.colour === newColour) return;

    // Check if a variant with (current size + newColour) exists
    let match = product.variants.find(
      v => v.colour === newColour && v.size === selectedVariant?.size
    );

    // If that combination doesn't exist, pick first variant with newColour (prefer in-stock)
    if (!match) {
      const candidates = product.variants.filter(v => v.colour === newColour);
      match = candidates.find(v => v.stock > 0) || candidates[0];
    }

    if (match) {
      setSelectedVariant(match);
      // Revalidate quantity against new variant stock
      setQuantity(q => (match.stock > 0 ? Math.min(Math.max(1, q), match.stock) : 1));
      setCartSuccess(false);
      setCartError(null);
    }
  };

  // Quantity Stepper Controls
  const handleIncrement = () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;
    setQuantity(prev => (prev < selectedVariant.stock ? prev + 1 : prev));
  };

  const handleDecrement = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  // Stock-Aware Add to Cart Action
  const handleAddToCart = async () => {
    if (!product || !selectedVariant || selectedVariant.stock <= 0) return;

    // Auth guard: If user is not logged in, navigate cleanly to login with return redirect
    if (!isLoggedIn) {
      navigate(`/login?redirect=/products/${slug}`);
      return;
    }

    setAddingToCart(true);
    setCartSuccess(false);
    setCartError(null);

    try {
      await addToCart(product._id, selectedVariant.sku, quantity);
      // Synchronize cart state to update navbar cart count badge
      await syncCart();
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3500);
    } catch (err) {
      if (err.status === 401) {
        navigate(`/login?redirect=/products/${slug}`);
      } else {
        setCartError(err.message || 'Unable to add item to cart. Please try again.');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  // Search handler from navbar on detail page redirects to product listing
  const handleNavbarSearch = (query) => {
    navigate(`/products?q=${encodeURIComponent(query)}`);
  };

  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;
  const currentPrice = selectedVariant?.price ?? 0;
  const images = product?.images?.length ? product.images : [];
  const currentImage = images[activeImageIdx] || images[0];

  return (
    <div className="pdp-page-wrapper">
      {/* Reusable MegaMart Header */}
      <Navbar onSearch={handleNavbarSearch} />

      <main className="app-container pdp-main">
        {/* Loading State */}
        {loading && (
          <div className="pdp-loading-container" aria-busy="true">
            <div className="pdp-grid">
              <div className="pdp-skeleton pdp-skeleton--image" />
              <div className="pdp-skeleton-info">
                <div className="pdp-skeleton pdp-skeleton--title" />
                <div className="pdp-skeleton pdp-skeleton--price" />
                <div className="pdp-skeleton pdp-skeleton--text" />
                <div className="pdp-skeleton pdp-skeleton--text" />
                <div className="pdp-skeleton pdp-skeleton--btn" />
              </div>
            </div>
          </div>
        )}

        {/* 404 Not Found State */}
        {!loading && notFound && (
          <div className="pdp-status-card" role="alert">
            <div className="pdp-status-icon">🔍</div>
            <h2 className="pdp-status-title">Product Not Found</h2>
            <p className="pdp-status-desc">
              We couldn&apos;t find any product matching &quot;{slug}&quot;. It may have been removed or the link is incorrect.
            </p>
            <Link to="/products" className="category-pill category-pill--active pdp-back-btn">
              ← Back to All Products
            </Link>
          </div>
        )}

        {/* API Error State */}
        {!loading && !notFound && error && (
          <div className="pdp-status-card pdp-status-card--error" role="alert">
            <div className="pdp-status-icon">⚠️</div>
            <h2 className="pdp-status-title">Unable to Load Product</h2>
            <p className="pdp-status-desc">{error}</p>
            <button onClick={fetchProduct} className="category-pill category-pill--active pdp-back-btn">
              Try Again
            </button>
          </div>
        )}

        {/* Product Detail Content */}
        {!loading && !notFound && !error && product && (
          <>
            {/* Simple Breadcrumb */}
            <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
              <Link to="/products">Home</Link>
              <span className="pdp-breadcrumb__separator">/</span>
              <Link to={`/products?category=${encodeURIComponent(product.category)}`}>
                {product.category}
              </Link>
              <span className="pdp-breadcrumb__separator">/</span>
              <span className="pdp-breadcrumb__current" aria-current="page">
                {product.name}
              </span>
            </nav>

            <div className="pdp-grid">
              {/* LEFT: Product Image Container */}
              <div className="pdp-image-section">
                <div className="pdp-image-box">
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt={`${product.name} preview`}
                      className="pdp-main-image"
                      onError={e => { e.currentTarget.style.opacity = '0.4'; }}
                    />
                  ) : (
                    <div className="pdp-no-image">No image available</div>
                  )}
                </div>

                {/* Multiple Image Thumbnail Selector (only if product has > 1 image) */}
                {images.length > 1 && (
                  <div className="pdp-thumbnail-strip" role="tablist" aria-label="Product image thumbnails">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        role="tab"
                        aria-selected={idx === activeImageIdx}
                        className={`pdp-thumbnail-btn${idx === activeImageIdx ? ' pdp-thumbnail-btn--active' : ''}`}
                        onClick={() => setActiveImageIdx(idx)}
                        aria-label={`View image ${idx + 1}`}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT: Product Information & Purchase Area */}
              <div className="pdp-info-section">
                {/* Category Tag */}
                <span className="pdp-category-tag">{product.category}</span>

                {/* Product Title */}
                <h1 className="pdp-title">{product.name}</h1>

                {/* Selected Variant Price */}
                <div className="pdp-price-row">
                  <span className="pdp-price">
                    ₹{currentPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="pdp-price-subtext">Inclusive of all taxes</span>
                </div>

                {/* Product Description */}
                <p className="pdp-description">{product.description}</p>

                <hr className="pdp-divider" />

                {/* Dynamic Variant Selectors */}
                {/* 1. Size Selector (only rendered if product has size attributes) */}
                {availableSizes.length > 0 && (
                  <div className="pdp-variant-group">
                    <label className="pdp-variant-label">
                      Size: <span className="pdp-variant-selected-val">{selectedVariant?.size || 'None'}</span>
                    </label>
                    <div className="pdp-variant-options" role="radiogroup" aria-label="Select size">
                      {availableSizes.map(size => {
                        const isSelected = selectedVariant?.size === size;
                        // Check if any variant with this size is currently in stock
                        const hasInStock = product.variants.some(v => v.size === size && v.stock > 0);

                        return (
                          <button
                            key={size}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            className={`pdp-option-btn${isSelected ? ' pdp-option-btn--active' : ''}${!hasInStock ? ' pdp-option-btn--dimmed' : ''}`}
                            onClick={() => handleSelectSize(size)}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Colour Selector (only rendered if product has colour attributes) */}
                {availableColours.length > 0 && (
                  <div className="pdp-variant-group">
                    <label className="pdp-variant-label">
                      Colour: <span className="pdp-variant-selected-val">{selectedVariant?.colour || 'None'}</span>
                    </label>
                    <div className="pdp-variant-options" role="radiogroup" aria-label="Select colour">
                      {availableColours.map(colour => {
                        const isSelected = selectedVariant?.colour === colour;
                        const hasInStock = product.variants.some(v => v.colour === colour && v.stock > 0);

                        return (
                          <button
                            key={colour}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            className={`pdp-option-btn${isSelected ? ' pdp-option-btn--active' : ''}${!hasInStock ? ' pdp-option-btn--dimmed' : ''}`}
                            onClick={() => handleSelectColour(colour)}
                          >
                            {colour}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stock Status Indicator */}
                <div className="pdp-stock-status">
                  {isOutOfStock ? (
                    <span className="pdp-stock-badge pdp-stock-badge--out">
                      ✕ Currently Out of Stock
                    </span>
                  ) : (
                    <span className="pdp-stock-badge pdp-stock-badge--in">
                      ✓ In Stock ({selectedVariant.stock} available)
                    </span>
                  )}
                </div>

                {/* Quantity Stepper & Add to Cart Controls */}
                <div className="pdp-actions-row">
                  {/* Quantity Stepper */}
                  <div className="pdp-quantity-stepper" aria-label="Select quantity">
                    <button
                      type="button"
                      className="pdp-qty-btn"
                      onClick={handleDecrement}
                      disabled={isOutOfStock || quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="pdp-qty-value" aria-live="polite">
                      {isOutOfStock ? 0 : quantity}
                    </span>
                    <button
                      type="button"
                      className="pdp-qty-btn"
                      onClick={handleIncrement}
                      disabled={isOutOfStock || quantity >= selectedVariant.stock}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    id="pdp-add-to-cart-btn"
                    className="pdp-add-cart-btn"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || addingToCart}
                  >
                    {addingToCart ? (
                      'Adding to Cart...'
                    ) : isOutOfStock ? (
                      'Out of Stock'
                    ) : (
                      'Add to Cart'
                    )}
                  </button>
                </div>

                {/* Inline Feedback Messages */}
                {cartSuccess && (
                  <div className="pdp-feedback pdp-feedback--success" role="status">
                    ✓ Added to cart successfully!
                  </div>
                )}
                {cartError && (
                  <div className="pdp-feedback pdp-feedback--error" role="alert">
                    {cartError}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Reusable MegaMart Footer */}
      <Footer />
    </div>
  );
}
