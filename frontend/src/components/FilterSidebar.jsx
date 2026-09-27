import { useState, useEffect } from 'react';

/**
 * FilterSidebar — Figma-matching clean card filter sidebar.
 * Controls: Categories list with badge counts, price min/max inputs with Apply button.
 * Server-side filtering driven by API.
 */
export default function FilterSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  minPrice,
  maxPrice,
  onPriceApply,
  hasActiveFilters,
  onClearAll,
  isDrawer = false,
}) {
  const [localMin, setLocalMin] = useState(minPrice ?? '');
  const [localMax, setLocalMax] = useState(maxPrice ?? '');

  // Synchronize when parent resets
  useEffect(() => { setLocalMin(minPrice ?? ''); }, [minPrice]);
  useEffect(() => { setLocalMax(maxPrice ?? ''); }, [maxPrice]);

  const handlePriceApply = (e) => {
    e.preventDefault();
    const min = localMin === '' ? '' : Number(localMin);
    const max = localMax === '' ? '' : Number(localMax);
    onPriceApply?.(min === '' ? '' : min, max === '' ? '' : max);
  };

  const handleCategoryClick = (cat) => {
    onCategoryChange?.(cat === selectedCategory ? '' : cat);
  };

  const content = (
    <>
      <div className="filter-sidebar__header">
        <h3 className="filter-sidebar__heading">Filters</h3>
        {hasActiveFilters && (
          <button
            className="filter-sidebar__clear-btn"
            onClick={onClearAll}
            id="filter-clear-all"
            type="button"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Category Section */}
      <div className="filter-sidebar__section">
        <div className="filter-sidebar__label">Category</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {categories.map(({ category, count }) => (
            <button
              key={category}
              id={`filter-cat-${category.toLowerCase().replace(/\s+/g, '-')}`}
              className={`filter-category-item${selectedCategory === category ? ' filter-category-item--active' : ''}`}
              onClick={() => handleCategoryClick(category)}
              type="button"
            >
              <span>{category}</span>
              <span className="filter-category-badge">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Section */}
      <div className="filter-sidebar__section">
        <div className="filter-sidebar__label">Price Range</div>
        <form onSubmit={handlePriceApply}>
          <div className="filter-price-row">
            <input
              id="filter-price-min"
              className="filter-price-input"
              type="number"
              min="0"
              placeholder="Min ₹"
              value={localMin}
              onChange={e => setLocalMin(e.target.value)}
              aria-label="Minimum price"
            />
            <span className="filter-price-sep">–</span>
            <input
              id="filter-price-max"
              className="filter-price-input"
              type="number"
              min="0"
              placeholder="Max ₹"
              value={localMax}
              onChange={e => setLocalMax(e.target.value)}
              aria-label="Maximum price"
            />
          </div>
          <button
            type="submit"
            className="filter-price-btn"
            id="filter-price-apply-btn"
          >
            Apply Price
          </button>
        </form>
      </div>
    </>
  );

  if (isDrawer) {
    return <div>{content}</div>;
  }

  return (
    <aside className="filter-sidebar" aria-label="Product filters">
      {content}
    </aside>
  );
}
