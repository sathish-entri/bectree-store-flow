// Figma Section Header: "Grab the best deal on [Category]" with #008ECC underline

function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function SectionHeader({ categoryName = 'Products', onViewAll }) {
  const displayName = categoryName || 'All Products';

  return (
    <div className="section-header">
      <div className="section-header__title-wrap">
        <h2 className="section-header__title">
          Grab the best deal on{' '}
          <span className="section-header__title-highlight">
            {displayName}
            <div className="section-header__underline" />
          </span>
        </h2>
      </div>

      <button
        className="section-header__view-all"
        onClick={onViewAll}
        aria-label={`View all ${displayName}`}
      >
        <span>View All</span>
        <IconChevronRight />
      </button>
    </div>
  );
}
