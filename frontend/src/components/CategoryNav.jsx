// Figma MegaMart Horizontal Category Pill Navigation matching Image 1

const FIGMA_NAV_PILLS = [
  { label: 'Groceries', category: 'Groceries' },
  { label: 'Premium Fruits', category: 'Fruits' },
  { label: 'Home & Kitchen', category: 'Home & Living' },
  { label: 'Fashion', category: 'Apparel' },
  { label: 'Electronics', category: 'Electronics' },
  { label: 'Beauty', category: 'Beauty' },
  { label: 'Home Improvement', category: 'Home & Living' },
  { label: 'Sports, Toys & Luggage', category: 'Accessories' },
];

function IconChevronDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function CategoryNav({ selectedCategory, onSelectCategory }) {
  return (
    <nav className="category-nav" aria-label="Category navigation">
      <div className="category-nav__inner">
        {/* All Products / Groceries pill */}
        <button
          className={`category-pill${!selectedCategory ? ' category-pill--active' : ''}`}
          onClick={() => onSelectCategory('')}
          id="cat-pill-all"
        >
          <span>All Categories</span>
          <IconChevronDown />
        </button>

        {/* Figma Exact Category Pills */}
        {FIGMA_NAV_PILLS.map((pill, idx) => {
          const isActive = selectedCategory === pill.category || selectedCategory === pill.label;
          return (
            <button
              key={idx}
              id={`cat-pill-${idx}`}
              className={`category-pill${isActive ? ' category-pill--active' : ''}`}
              onClick={() => onSelectCategory(pill.category)}
            >
              <span>{pill.label}</span>
              <IconChevronDown />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
