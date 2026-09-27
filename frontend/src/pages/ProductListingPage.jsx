import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CategoryNav from '../components/CategoryNav';
import HeroBanner from '../components/HeroBanner';
import SectionHeader from '../components/SectionHeader';
import ProductCard from '../components/ProductCard';
import TopCategories from '../components/TopCategories';
import TopBrands from '../components/TopBrands';
import DailyEssentials from '../components/DailyEssentials';
import Pagination from '../components/Pagination';
import SkeletonGrid from '../components/SkeletonGrid';
import Footer from '../components/Footer';
import { getProducts } from '../api/client';

const DEBOUNCE_MS = 300;
const PAGE_SIZE = 10; // 5 columns x 2 rows in Figma grid

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State synchronized with URL parameters
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [page, setPage] = useState(Number(searchParams.get('page') ?? 1));

  // Data State
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounced search input
  const searchDebounceRef = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, DEBOUNCE_MS);
    return () => clearTimeout(searchDebounceRef.current);
  }, [search]);

  // Synchronize URL parameters
  useEffect(() => {
    const params = {};
    if (debouncedSearch) params.q = debouncedSearch;
    if (category) params.category = category;
    if (page > 1) params.page = page;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, category, page, setSearchParams]);

  // Fetch products from server (100% server-side search, category filter, and pagination)
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        limit: PAGE_SIZE,
        page,
        ...(debouncedSearch ? { q: debouncedSearch } : {}),
        ...(category ? { category } : {}),
      };
      const res = await getProducts(params);
      setProducts(res?.data ?? []);
      setTotalPages(res?.pagination?.totalPages ?? res?.pages ?? 1);
    } catch (err) {
      setError(err.message ?? 'Failed to load products.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handlers
  const handleSearch = useCallback((val) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((cat) => {
    setCategory(cat);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Header with Topbar & Centered Search */}
      <Navbar
        onSearch={handleSearch}
        searchValue={search}
      />

      {/* 2. Figma Horizontal Category Navigation Pills */}
      <CategoryNav
        selectedCategory={category}
        onSelectCategory={handleCategoryChange}
      />

      {/* Main Container — Full Width matching Figma */}
      <main className="app-container" style={{ flex: 1 }}>
        {/* 3. Figma Scrollable Hero Carousel Banner (Smart Wearable) */}
        {!search && !category && <HeroBanner />}

        {/* 4. Figma Section Header: "Grab the best deal on Smartphones" */}
        <SectionHeader
          categoryName={category || (search ? `Results for "${search}"` : 'Smartphones')}
          onViewAll={() => handleCategoryChange('')}
        />

        {/* 5. Figma 5-Column Product Grid (NO sidebar) */}
        <div className="product-grid" role="list" aria-busy={loading}>
          {loading ? (
            <SkeletonGrid count={PAGE_SIZE} />
          ) : error ? (
            <div style={{ gridColumn: '1 / -1', padding: '48px 0', textAlign: 'center' }}>
              <p style={{ color: 'var(--error)', marginBottom: '16px', fontSize: '15px' }}>{error}</p>
              <button
                className="category-pill category-pill--active"
                onClick={fetchProducts}
              >
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '64px 0', textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No products found</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                No items match your criteria.
              </p>
              <button
                className="category-pill category-pill--active"
                onClick={() => { setSearch(''); setCategory(''); setPage(1); }}
              >
                Show All Products
              </button>
            </div>
          ) : (
            products.map(product => (
              <div key={product._id} role="listitem">
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>

        {/* 6. Figma "Shop From Top Categories" 7 Circular Items */}
        <TopCategories onSelectCategory={handleCategoryChange} />

        {/* 7. Figma "Top Electronics Brands" (Apple, Realme, Xiaomi) */}
        <TopBrands onSelectCategory={handleCategoryChange} />

        {/* 8. Figma "Daily Essentials" 6 Items */}
        <DailyEssentials />

        {/* 9. Pagination Controls */}
        {!loading && !error && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      {/* 10. Exact Figma MegaMart Blue Footer */}
      <Footer />
    </div>
  );
}
