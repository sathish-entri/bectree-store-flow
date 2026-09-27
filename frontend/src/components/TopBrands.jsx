// Figma "Top Electronics Brands" section (Apple iPhone, Realme, Xiaomi)

export default function TopBrands({ onSelectCategory }) {
  return (
    <div style={{ margin: '40px 0 20px' }}>
      <div className="section-header" style={{ margin: '0 0 16px' }}>
        <div className="section-header__title-wrap">
          <h2 className="section-header__title">
            Top{' '}
            <span className="section-header__title-highlight">
              Electronics Brands
              <div className="section-header__underline" />
            </span>
          </h2>
        </div>
        <button
          className="section-header__view-all"
          onClick={() => onSelectCategory('Electronics')}
          aria-label="View all brands"
        >
          <span>View All</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="top-brands-grid">
        {/* Brand Card 1: Apple iPhone */}
        <div className="brand-card brand-card--apple" onClick={() => onSelectCategory('Electronics')}>
          <div className="brand-card__content">
            <span className="brand-card__tag">IPHONE</span>
            <div className="brand-card__logo-wrap">
              {/* Apple SVG Logo */}
              <svg width="32" height="32" viewBox="0 0 170 170" fill="#FFFFFF">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.02-7.6-7.79-11.71-14.31-7.14-11.3-12.87-24.38-17.18-39.26-4.31-14.88-6.47-28.58-6.47-41.09 0-16.14 4.14-29.68 12.43-40.63 8.28-10.95 18.73-16.54 31.34-16.77 5.01 0 10.74 1.34 17.18 4.02 6.44 2.68 10.51 4.08 12.21 4.2 2.36-.34 6.72-1.87 13.09-4.58 6.36-2.71 11.95-3.9 16.76-3.57 14.16.89 25.43 6.07 33.8 15.54-12.54 7.6-18.66 17.88-18.36 30.85.3 10.94 4.48 19.98 12.54 27.12 4.13 3.69 8.78 6.42 13.97 8.19-3.21 9.59-7.44 19.04-12.68 28.36zM119.22 33.15c0-7.36 2.64-14.28 7.92-20.76 5.28-6.48 11.92-10.87 19.92-13.17.47 1.34.71 2.68.71 4.02 0 7.36-2.73 14.36-8.19 21.01-5.46 6.64-12.16 11.02-20.1 13.14-.12-1.45-.26-2.87-.26-4.24z"/>
              </svg>
            </div>
            <p className="brand-card__offer">UP to 80% OFF</p>
          </div>
          <div className="brand-card__image-box">
            <img
              src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80"
              alt="Apple iPhone"
              className="brand-card__img"
            />
          </div>
        </div>

        {/* Brand Card 2: Realme */}
        <div className="brand-card brand-card--realme" onClick={() => onSelectCategory('Electronics')}>
          <div className="brand-card__content">
            <span className="brand-card__tag" style={{ color: '#8F6600', backgroundColor: 'rgba(255,201,21,0.3)' }}>
              REALME
            </span>
            <div className="brand-card__realme-badge">
              <span>realme</span>
            </div>
            <p className="brand-card__offer" style={{ color: '#222222' }}>UP to 80% OFF</p>
          </div>
          <div className="brand-card__image-box">
            <img
              src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80"
              alt="Realme Narzo"
              className="brand-card__img"
            />
          </div>
        </div>

        {/* Brand Card 3: Xiaomi */}
        <div className="brand-card brand-card--xiaomi" onClick={() => onSelectCategory('Electronics')}>
          <div className="brand-card__content">
            <span className="brand-card__tag" style={{ color: '#C84D00', backgroundColor: 'rgba(255,103,0,0.2)' }}>
              XIAOMI
            </span>
            <div className="brand-card__xiaomi-badge">
              <span>mi</span>
            </div>
            <p className="brand-card__offer" style={{ color: '#222222' }}>UP to 80% OFF</p>
          </div>
          <div className="brand-card__image-box">
            <img
              src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80"
              alt="Xiaomi Smartphone"
              className="brand-card__img"
            />
          </div>
        </div>
      </div>

      {/* Brand carousel indicator dots */}
      <div className="hero-dots" style={{ justifyContent: 'center', marginTop: '16px' }}>
        <span className="hero-dot hero-dot--active" style={{ backgroundColor: '#008ECC' }} />
        <span className="hero-dot" style={{ backgroundColor: '#CBD5E1' }} />
        <span className="hero-dot" style={{ backgroundColor: '#CBD5E1' }} />
        <span className="hero-dot" style={{ backgroundColor: '#CBD5E1' }} />
        <span className="hero-dot" style={{ backgroundColor: '#CBD5E1' }} />
        <span className="hero-dot" style={{ backgroundColor: '#CBD5E1' }} />
      </div>
    </div>
  );
}
