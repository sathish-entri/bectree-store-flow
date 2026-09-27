const SORT_OPTIONS = [
  { value: '',           label: 'Relevance' },
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function SortDropdown({ value, onChange }) {
  return (
    <div className="sort-box">
      <label htmlFor="sort-select" className="sort-box__label">Sort by:</label>
      <select
        id="sort-select"
        className="sort-box__select"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        aria-label="Sort products"
      >
        {SORT_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
