export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = buildPageRange(page, totalPages);

  return (
    <nav className="pagination-wrap" aria-label="Product pagination">
      <button
        id="pagination-prev"
        className="pagination-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        ← Prev
      </button>

      {pages.map((item, i) =>
        item === '...' ? (
          <span key={`ellipsis-${i}`} style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>
        ) : (
          <button
            key={item}
            id={`pagination-page-${item}`}
            className={`pagination-btn${page === item ? ' pagination-btn--active' : ''}`}
            onClick={() => onPageChange(item)}
            aria-label={`Page ${item}`}
            aria-current={page === item ? 'page' : undefined}
          >
            {item}
          </button>
        )
      )}

      <button
        id="pagination-next"
        className="pagination-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        Next →
      </button>
    </nav>
  );
}

function buildPageRange(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];
  const alwaysShow = new Set([1, 2, total - 1, total]);
  for (let i = Math.max(1, current - 1); i <= Math.min(total, current + 1); i++) {
    alwaysShow.add(i);
  }

  const sorted = Array.from(alwaysShow).sort((a, b) => a - b);
  let prev = null;
  for (const p of sorted) {
    if (prev !== null && p - prev > 1) pages.push('...');
    pages.push(p);
    prev = p;
  }

  return pages;
}
