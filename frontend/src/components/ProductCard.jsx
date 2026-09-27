import { Link } from 'react-router-dom';

/**
 * ProductCard — Exact Figma Anatomy:
 * 1. Image container: #F5F5F7, 175px height, radius 15px 15px 0 0, centered image with padding.
 * 2. Top-right discount badge: #008ECC with radius 0 15px 0 15px, "XX% / OFF".
 * 3. Product title: 14px, 2 lines clamp, #222222.
 * 4. Price row: current price (15px bold #222222) + original price (12px strikethrough #888888).
 * 5. Thin separator line (#F0F0F0).
 * 6. Savings row: Figma Savings Green (#249B3E), "Save - ₹XXX" or "✓ In Stock • Free Delivery".
 */
export default function ProductCard({ product }) {
  if (!product) return null;

  const { name, slug, images, variants } = product;

  // Real backend variant price analysis
  const prices = variants?.map(v => v.price).filter(p => typeof p === 'number') ?? [];
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const hasPriceRange = minPrice > 0 && maxPrice > minPrice;

  // Real backend stock analysis
  const totalStock = variants?.reduce((sum, v) => sum + (v.stock ?? 0), 0) ?? 0;
  const isOutOfStock = totalStock === 0;
  const isLowStock = !isOutOfStock && totalStock <= 3;

  // Image source
  const image = images?.[0];

  // Price calculations
  // If variant prices differ, calculate savings from max to min
  const priceDifference = hasPriceRange ? maxPrice - minPrice : 0;
  const discountPercent = hasPriceRange ? Math.round((priceDifference / maxPrice) * 100) : 0;

  return (
    <Link
      to={`/products/${slug}`}
      className="product-card"
      id={`product-card-${slug}`}
      aria-label={`${name} — ₹${minPrice}`}
    >
      {/* 1. Image container — #F5F5F7, centered with padding */}
      <div className="product-card__image-container">
        {image ? (
          <img
            src={image}
            alt={name}
            className="product-card__img"
            loading="lazy"
            onError={e => { e.currentTarget.style.opacity = '0.3'; }}
          />
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No image</div>
        )}

        {/* 2. Top-Right Corner Badge — Figma signature #008ECC curved badge */}
        {isOutOfStock ? (
          <div className="product-card__discount-badge product-card__discount-badge--out">
            <span className="product-card__discount-val">OUT</span>
            <span className="product-card__discount-unit">OF STOCK</span>
          </div>
        ) : discountPercent > 0 ? (
          <div className="product-card__discount-badge">
            <span className="product-card__discount-val">{discountPercent}%</span>
            <span className="product-card__discount-unit">OFF</span>
          </div>
        ) : isLowStock ? (
          <div className="product-card__discount-badge" style={{ backgroundColor: '#F59E0B' }}>
            <span className="product-card__discount-val">ONLY</span>
            <span className="product-card__discount-unit">{totalStock} LEFT</span>
          </div>
        ) : (
          <div className="product-card__discount-badge">
            <span className="product-card__discount-val">BEST</span>
            <span className="product-card__discount-unit">DEAL</span>
          </div>
        )}
      </div>

      {/* 3. Product Information */}
      <div className="product-card__info">
        {/* Product Title */}
        <h3 className="product-card__title" title={name}>{name}</h3>

        {/* Price Row: current price + original strikethrough price if available */}
        <div className="product-card__price-row">
          <span className="product-card__price-current">
            ₹{minPrice.toLocaleString('en-IN')}
          </span>
          {hasPriceRange && (
            <span className="product-card__price-original">
              ₹{maxPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* 4. Thin horizontal divider line from Figma */}
        <hr className="product-card__divider" />

        {/* 5. Savings Row in Figma Savings Green (#249B3E) */}
        {isOutOfStock ? (
          <div className="product-card__savings product-card__savings--out">
            Currently Unavailable
          </div>
        ) : priceDifference > 0 ? (
          <div className="product-card__savings">
            Save - ₹{priceDifference.toFixed(0)}
          </div>
        ) : (
          <div className="product-card__savings">
            ✓ In Stock • Free Delivery
          </div>
        )}
      </div>
    </Link>
  );
}
