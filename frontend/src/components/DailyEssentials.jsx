// Figma "Daily Essentials" section with 6 cards and "UP to 50% OFF"

const ESSENTIALS = [
  { name: 'Daily Essentials', discount: 'UP to 50% OFF', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80' },
  { name: 'Vegetables', discount: 'UP to 50% OFF', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&q=80' },
  { name: 'Fruits', discount: 'UP to 50% OFF', img: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&q=80' },
  { name: 'Strawberry', discount: 'UP to 50% OFF', img: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&q=80' },
  { name: 'Mango', discount: 'UP to 50% OFF', img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&q=80' },
  { name: 'Cherry', discount: 'UP to 50% OFF', img: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=300&q=80' },
];

export default function DailyEssentials() {
  return (
    <div style={{ margin: '40px 0 20px' }}>
      <div className="section-header" style={{ margin: '0 0 16px' }}>
        <div className="section-header__title-wrap">
          <h2 className="section-header__title">
            Daily{' '}
            <span className="section-header__title-highlight">
              Essentials
              <div className="section-header__underline" />
            </span>
          </h2>
        </div>
        <button
          className="section-header__view-all"
          aria-label="View all daily essentials"
        >
          <span>View All</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="daily-essentials-grid">
        {ESSENTIALS.map((item, idx) => (
          <div key={idx} className="essential-card">
            <div className="essential-card__image-box">
              <img src={item.img} alt={item.name} loading="lazy" />
            </div>
            <p className="essential-card__name">{item.name}</p>
            <p className="essential-card__discount">{item.discount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
