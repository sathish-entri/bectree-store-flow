// Figma "Shop From Top Categories" 7 circular items from Image 2

const FIGMA_TOP_CATEGORIES = [
  { name: 'Electronics', label: 'Mobile', img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&q=80', activeRing: true },
  { name: 'Beauty', label: 'Cosmetics', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&q=80' },
  { name: 'Electronics', label: 'Electronics', img: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=300&q=80' },
  { name: 'Home & Living', label: 'Furniture', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80' },
  { name: 'Accessories', label: 'Watches', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80' },
  { name: 'Home & Living', label: 'Decor', img: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300&q=80' },
  { name: 'Accessories', label: 'Accessories', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&q=80' },
];

export default function TopCategories({ onSelectCategory }) {
  return (
    <div style={{ margin: '40px 0 20px' }}>
      <div className="section-header" style={{ margin: '0 0 16px' }}>
        <div className="section-header__title-wrap">
          <h2 className="section-header__title">
            Shop From{' '}
            <span className="section-header__title-highlight">
              Top Categories
              <div className="section-header__underline" />
            </span>
          </h2>
        </div>
        <button
          className="section-header__view-all"
          onClick={() => onSelectCategory('')}
          aria-label="View all categories"
        >
          <span>View All</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="top-categories-grid">
        {FIGMA_TOP_CATEGORIES.map((cat, idx) => (
          <div
            key={idx}
            className="category-circle-item"
            onClick={() => onSelectCategory(cat.name)}
            role="button"
            tabIndex={0}
          >
            <div className={`category-circle-avatar${cat.activeRing ? ' category-circle-avatar--active' : ''}`}>
              <img src={cat.img} alt={cat.label} loading="lazy" />
            </div>
            <span className="category-circle-label">{cat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
