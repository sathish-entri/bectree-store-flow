export default function SkeletonGrid({ count = 10 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i} aria-hidden="true">
          <div className="skeleton-card__img-box">
            <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }} />
          </div>
          <div className="skeleton-card__body">
            <div className="skeleton-shimmer" style={{ height: 16, width: '85%' }} />
            <div className="skeleton-shimmer" style={{ height: 18, width: '50%', marginTop: 6 }} />
            <div style={{ height: 1, backgroundColor: '#F0F0F0', margin: '4px 0' }} />
            <div className="skeleton-shimmer" style={{ height: 12, width: '60%' }} />
          </div>
        </div>
      ))}
    </>
  );
}
