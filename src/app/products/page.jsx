'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { api } from '../../lib/api';
import ProductCard from '../../components/ProductCard';
import { GridSkeleton } from '../../components/Skeleton';
import {
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  Star,
  SlidersHorizontal,
  X,
  Search,
  Check
} from 'lucide-react';

function ShopLoadingShell() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-12 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm text-[#5F6872]">
        <Link href="/" className="hover:text-[#F51F2D]">Home</Link> <span className="mx-2">&gt;</span> <span className="text-[#17202A] font-medium">Shop</span>
      </div>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 flex-shrink-0 hidden lg:block">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="space-y-4">
            <div className="h-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-40 bg-gray-200 rounded animate-pulse" />
          </div>
        </aside>
        <main className="flex-1">
          <GridSkeleton count={8} />
        </main>
      </div>
    </div>
  );
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Products & listing state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [shopBanners, setShopBanners] = useState([]);
  const [shopBannerMode, setShopBannerMode] = useState('static');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const limit = 24;

  // Mobile filter drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Initialize filters from URL search params
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const cat = searchParams.get('category') || searchParams.get('category_id');
    return cat ? cat.split(',').map(Number).filter(Boolean) : [];
  });
  const [selectedBrands, setSelectedBrands] = useState(() => {
    const br = searchParams.get('brand') || searchParams.get('brand_id');
    return br ? br.split(',').map(Number).filter(Boolean) : [];
  });
  const [minPrice, setMinPrice] = useState(() => searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get('max_price') || '');
  const [inStock, setInStock] = useState(() => {
    const stock = searchParams.get('in_stock');
    if (stock === 'true' || stock === '1') return true;
    if (stock === 'false' || stock === '0') return false;
    return null;
  });
  const [minRating, setMinRating] = useState(() => {
    const r = searchParams.get('min_rating');
    return r ? Number(r) : null;
  });
  const [sort, setSort] = useState(() => searchParams.get('sort') || 'popularity');
  const [currentPage, setCurrentPage] = useState(() => {
    const p = searchParams.get('page');
    return p ? Math.max(1, parseInt(p, 10)) : 1;
  });
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [view, setView] = useState('grid');

  // Accordion state
  const [openSections, setOpenSections] = useState({
    category: true,
    brand: true,
    price: true,
    rating: true,
    availability: true
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // AbortController ref to cancel obsolete in-flight requests
  const abortControllerRef = useRef(null);
  const isInitialMount = useRef(true);
  const productsTopRef = useRef(null);

  // Sync state to URL
  const updateUrlParams = useCallback((newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.categories?.length > 0) params.set('category', newFilters.categories.join(','));
    if (newFilters.brands?.length > 0) params.set('brand', newFilters.brands.join(','));
    if (newFilters.minPrice) params.set('min_price', newFilters.minPrice);
    if (newFilters.maxPrice) params.set('max_price', newFilters.maxPrice);
    if (newFilters.inStock !== null && newFilters.inStock !== undefined) params.set('in_stock', String(newFilters.inStock));
    if (newFilters.minRating) params.set('min_rating', String(newFilters.minRating));
    if (newFilters.sort && newFilters.sort !== 'popularity') params.set('sort', newFilters.sort);
    if (newFilters.page && newFilters.page > 1) params.set('page', String(newFilters.page));
    if (newFilters.search) params.set('search', newFilters.search);

    const qs = params.toString();
    const targetUrl = qs ? `${pathname}?${qs}` : pathname;
    router.replace(targetUrl, { scroll: false });
  }, [pathname, router]);

  // Load products with cancellation
  const fetchProducts = useCallback(async (opts = {}) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);

    const activeCategories = opts.categories ?? selectedCategories;
    const activeBrands = opts.brands ?? selectedBrands;
    const activeMinPrice = opts.minPrice ?? minPrice;
    const activeMaxPrice = opts.maxPrice ?? maxPrice;
    const activeInStock = opts.inStock ?? inStock;
    const activeMinRating = opts.minRating ?? minRating;
    const activeSort = opts.sort ?? sort;
    const activePage = opts.page ?? currentPage;
    const activeSearch = opts.search ?? searchQuery;

    const queryParams = {
      limit,
      page: activePage,
      sort: activeSort
    };

    if (activeCategories.length > 0) queryParams.category_id = activeCategories.join(',');
    if (activeBrands.length > 0) queryParams.brand_id = activeBrands.join(',');
    if (activeMinPrice) queryParams.min_price = activeMinPrice;
    if (activeMaxPrice) queryParams.max_price = activeMaxPrice;
    if (activeInStock !== null && activeInStock !== undefined) queryParams.in_stock = activeInStock;
    if (activeMinRating !== null && activeMinRating !== undefined) queryParams.min_rating = activeMinRating;
    if (activeSearch) queryParams.search = activeSearch;

    try {
      const prodRes = await api.get('/products', queryParams, { signal: controller.signal });
      if (prodRes?.aborted) return;

      if (prodRes.success) {
        setProducts(prodRes.data?.products || prodRes.data || []);
        setTotal(prodRes.data?.pagination?.total || 0);
      }
    } catch (e) {
      if (e?.name !== 'AbortError') {
        console.error('Failed to load products:', e);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, [selectedCategories, selectedBrands, minPrice, maxPrice, inStock, minRating, sort, currentPage, searchQuery]);

  // Initial metadata loading (categories, brands, banners, settings)
  useEffect(() => {
    async function loadMetadata() {
      const [catRes, brandRes, bannerRes, settingsRes] = await Promise.all([
        api.get('/categories'),
        api.get('/brands'),
        api.get('/banners'),
        api.get('/settings')
      ]);

      if (catRes.success) setCategories(catRes.data?.categories || catRes.data || []);
      if (brandRes.success) setBrands(brandRes.data?.brands || brandRes.data || []);

      if (bannerRes.success) {
        const allBanners = bannerRes.data?.banners || bannerRes.data || [];
        const shopBannersOnly = allBanners.filter(b => b.type === 'shop_page_banner' && b.is_active === 1);
        shopBannersOnly.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        setShopBanners(shopBannersOnly);
      }

      if (settingsRes.success) {
        const settings = settingsRes.data?.settings || settingsRes.data || {};
        if (settings.shop_banner_mode) {
          setShopBannerMode(settings.shop_banner_mode);
        }
      }
    }

    loadMetadata();
    // Trigger initial product fetch in parallel without waiting for metadata waterfall
    fetchProducts();
  }, []); // Run on mount

  // Watch filter/search/sort changes and re-fetch with 300ms debounce
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetchProducts();
      updateUrlParams({
        categories: selectedCategories,
        brands: selectedBrands,
        minPrice,
        maxPrice,
        inStock,
        minRating,
        sort,
        page: currentPage,
        search: searchQuery
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedCategories, selectedBrands, minPrice, maxPrice, inStock, minRating, sort, currentPage, searchQuery]);

  // Sync state if user navigates back/forward via browser history
  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || '';
    if (searchFromUrl !== searchQuery) {
      setSearchQuery(searchFromUrl);
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Banner carousel rotation timer
  useEffect(() => {
    if (shopBannerMode === 'carousel' && shopBanners.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % shopBanners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [shopBannerMode, shopBanners.length]);

  // Filter handlers
  const toggleCategory = (id) => {
    setCurrentPage(1);
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const toggleBrand = (id) => {
    setCurrentPage(1);
    setSelectedBrands(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMinPrice('');
    setMaxPrice('');
    setInStock(null);
    setMinRating(null);
    setSearchQuery('');
    setCurrentPage(1);
    setSort('popularity');
    router.replace(pathname, { scroll: false });
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    if (productsTopRef.current) {
      productsTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Generate numbered pagination items
  const renderPaginationItems = () => {
    const items = [];
    const maxVisible = 5;

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      items.push(1);
      if (startPage > 2) items.push('ellipsis-start');
    }

    for (let p = startPage; p <= endPage; p++) {
      items.push(p);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) items.push('ellipsis-end');
      items.push(totalPages);
    }

    return items;
  };

  // Active filter count for mobile badge
  const activeFilterCount =
    selectedCategories.length +
    selectedBrands.length +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (inStock !== null ? 1 : 0) +
    (minRating !== null ? 1 : 0) +
    (searchQuery ? 1 : 0);

  // Reusable Filter Sidebar Content
  const filterContent = (
    <div className="space-y-6">
      {/* Category Section */}
      <div className="border-b border-[#E7EBEF] pb-6">
        <button
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full font-bold text-[#17202A] mb-4 text-left"
        >
          <span>Category</span>
          {openSections.category ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {openSections.category && (
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {categories.length > 0 ? (
              categories.map((cat) => {
                const checked = selectedCategories.includes(cat.id);
                return (
                  <label key={cat.id} className="flex items-center gap-3 cursor-pointer group select-none">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-[#F51F2D] border-[#F51F2D]' : 'border-[#C5CDD5] group-hover:border-[#F51F2D]'}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCategory(cat.id)}
                        className="sr-only"
                      />
                      {checked && <Check size={12} className="text-white stroke-[3]" />}
                    </div>
                    <span className="text-sm text-[#5F6872] group-hover:text-[#17202A] flex-1">{cat.name}</span>
                  </label>
                );
              })
            ) : (
              <div className="text-xs text-gray-400">Loading categories...</div>
            )}
          </div>
        )}
      </div>

      {/* Brands Section (if available) */}
      {brands.length > 0 && (
        <div className="border-b border-[#E7EBEF] pb-6">
          <button
            onClick={() => toggleSection('brand')}
            className="flex items-center justify-between w-full font-bold text-[#17202A] mb-4 text-left"
          >
            <span>Brand</span>
            {openSections.brand ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {openSections.brand && (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {brands.map((b) => {
                const checked = selectedBrands.includes(b.id);
                return (
                  <label key={b.id} className="flex items-center gap-3 cursor-pointer group select-none">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-[#F51F2D] border-[#F51F2D]' : 'border-[#C5CDD5] group-hover:border-[#F51F2D]'}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleBrand(b.id)}
                        className="sr-only"
                      />
                      {checked && <Check size={12} className="text-white stroke-[3]" />}
                    </div>
                    <span className="text-sm text-[#5F6872] group-hover:text-[#17202A] flex-1">{b.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Price Range */}
      <div className="border-b border-[#E7EBEF] pb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full font-bold text-[#17202A] mb-4 text-left"
        >
          <span>Price Range</span>
          {openSections.price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {openSections.price && (
          <form onSubmit={handlePriceApply} className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                className="w-full px-2.5 py-1.5 text-sm border border-[#C5CDD5] rounded-md focus:outline-none focus:border-[#F51F2D]"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                className="w-full px-2.5 py-1.5 text-sm border border-[#C5CDD5] rounded-md focus:outline-none focus:border-[#F51F2D]"
              />
            </div>
          </form>
        )}
      </div>

      {/* Rating Filter */}
      <div className="border-b border-[#E7EBEF] pb-6">
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full font-bold text-[#17202A] mb-4 text-left"
        >
          <span>Rating</span>
          {openSections.rating ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {openSections.rating && (
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((stars) => {
              const checked = minRating === stars;
              return (
                <label key={stars} className="flex items-center gap-3 cursor-pointer group select-none">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-[#F51F2D] border-[#F51F2D]' : 'border-[#C5CDD5] group-hover:border-[#F51F2D]'}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setCurrentPage(1);
                        setMinRating(prev => (prev === stars ? null : stars));
                      }}
                      className="sr-only"
                    />
                    {checked && <Check size={12} className="text-white stroke-[3]" />}
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= stars ? 'fill-[#FFB800] text-[#FFB800]' : 'fill-[#E7EBEF] text-[#E7EBEF]'}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#5F6872]">& above</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Availability Filter */}
      <div>
        <button
          onClick={() => toggleSection('availability')}
          className="flex items-center justify-between w-full font-bold text-[#17202A] mb-4 text-left"
        >
          <span>Availability</span>
          {openSections.availability ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {openSections.availability && (
          <div className="space-y-2.5">
            <label className="flex items-center gap-3 cursor-pointer group select-none">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${inStock === true ? 'bg-[#F51F2D] border-[#F51F2D]' : 'border-[#C5CDD5] group-hover:border-[#F51F2D]'}`}>
                <input
                  type="checkbox"
                  checked={inStock === true}
                  onChange={() => {
                    setCurrentPage(1);
                    setInStock(prev => (prev === true ? null : true));
                  }}
                  className="sr-only"
                />
                {inStock === true && <Check size={12} className="text-white stroke-[3]" />}
              </div>
              <span className="text-sm text-[#5F6872] flex-1">In Stock</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group select-none">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${inStock === false ? 'bg-[#F51F2D] border-[#F51F2D]' : 'border-[#C5CDD5] group-hover:border-[#F51F2D]'}`}>
                <input
                  type="checkbox"
                  checked={inStock === false}
                  onChange={() => {
                    setCurrentPage(1);
                    setInStock(prev => (prev === false ? null : false));
                  }}
                  className="sr-only"
                />
                {inStock === false && <Check size={12} className="text-white stroke-[3]" />}
              </div>
              <span className="text-sm text-[#5F6872] flex-1">Out of Stock</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-12 font-sans">
      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm text-[#5F6872]">
        <Link href="/" className="hover:text-[#F51F2D]">Home</Link> <span className="mx-2">&gt;</span> <span className="text-[#17202A] font-medium">Shop</span>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0 hidden lg:block">
          <div className="flex items-center justify-between pb-4">
            <h2 className="text-lg font-black text-[#17202A]">Filters</h2>
            {activeFilterCount > 0 && (
              <button onClick={clearAllFilters} className="text-sm font-semibold text-[#1877F2] hover:underline">
                Clear All
              </button>
            )}
          </div>
          {filterContent}
        </aside>

        {/* Mobile Filter Drawer / Sheet (60 FPS CSS Transitions) */}
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 lg:hidden ${mobileDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          {/* Backdrop overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer content */}
          <div
            className={`fixed inset-y-0 left-0 w-[85%] max-w-xs bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out z-10 ${mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#17202A]">Filters</h3>
                {activeFilterCount > 0 && (
                  <span className="bg-[#F51F2D] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              {filterContent}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2.5 px-3 border border-[#C5CDD5] rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear All
              </button>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="flex-1 py-2.5 px-3 bg-[#F51F2D] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-[#D41825]"
              >
                View ({total})
              </button>
            </div>
          </div>
        </div>

        {/* Main Products Area */}
        <main className="flex-1 min-w-0" ref={productsTopRef}>
          {/* Shop Banner */}
          {shopBanners.length > 0 && (
            <div className="w-full rounded-[20px] overflow-hidden mb-6 relative">
              {shopBannerMode === 'carousel' && shopBanners.length > 1 ? (
                <div className="relative w-full">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {shopBanners.map((b, i) => (
                      <div key={b.id || i} className="w-full flex-shrink-0 relative">
                        {b.link_url ? (
                          <Link href={b.link_url} className="block w-full">
                            <Image
                              width={1920}
                              height={400}
                              src={b.image_url}
                              alt={b.title || 'Shop Banner'}
                              priority={i === 0}
                              className="w-full h-auto object-cover"
                            />
                          </Link>
                        ) : (
                          <Image
                            width={1920}
                            height={400}
                            src={b.image_url}
                            alt={b.title || 'Shop Banner'}
                            priority={i === 0}
                            className="w-full h-auto object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Dots */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {shopBanners.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${currentSlide === i ? 'bg-white' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  {shopBanners[0].link_url ? (
                    <Link href={shopBanners[0].link_url} className="block w-full">
                      <Image
                        width={1920}
                        height={400}
                        src={shopBanners[0].image_url}
                        alt={shopBanners[0].title || 'Shop Banner'}
                        priority
                        className="w-full h-auto object-cover"
                      />
                    </Link>
                  ) : (
                    <Image
                      width={1920}
                      height={400}
                      src={shopBanners[0].image_url}
                      alt={shopBanners[0].title || 'Shop Banner'}
                      priority
                      className="w-full h-auto object-cover"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Active Search & Filter Pills */}
          {searchQuery && (
            <div className="flex items-center gap-2 mb-4 bg-white p-3 rounded-xl border border-gray-100">
              <Search size={16} className="text-[#F51F2D]" />
              <span className="text-sm text-gray-700">
                Searching for: <strong>"{searchQuery}"</strong>
              </span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="ml-auto text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold"
              >
                Clear Search <X size={12} />
              </button>
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center justify-between sm:justify-start gap-3">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-white border border-[#C5CDD5] rounded-md px-3 py-1.5 text-sm font-bold text-[#17202A] hover:border-[#F51F2D] shadow-2xs"
              >
                <SlidersHorizontal size={16} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-[#F51F2D] text-white text-[11px] font-black px-1.5 py-0.2 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="text-sm text-[#5F6872]">
                Showing <span className="font-bold text-[#17202A]">
                  {total === 0 ? 0 : (currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, total)}
                </span> of <span className="font-bold text-[#17202A]">{total}</span> products
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#5F6872] hidden xs:inline">Sort by:</span>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-white border border-[#C5CDD5] rounded-md px-3 py-1.5 pr-8 text-sm font-medium text-[#17202A] outline-none focus:border-[#F51F2D]"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5F6872] pointer-events-none" />
                </div>
              </div>

              {/* Grid / List view toggle */}
              <div className="flex items-center border border-[#C5CDD5] rounded-md overflow-hidden bg-white">
                <button
                  onClick={() => setView('grid')}
                  className={`p-1.5 ${view === 'grid' ? 'bg-[#F51F2D] text-white' : 'text-[#5F6872] hover:bg-gray-50'}`}
                  title="Grid view"
                >
                  <LayoutGrid size={18} />
                </button>
                <div className="w-px h-5 bg-[#C5CDD5]" />
                <button
                  onClick={() => setView('list')}
                  className={`p-1.5 ${view === 'list' ? 'bg-[#F51F2D] text-white' : 'text-[#5F6872] hover:bg-gray-50'}`}
                  title="List view"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid / Skeleton */}
          {loading ? (
            <GridSkeleton count={8} />
          ) : (
            <>
              <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'grid grid-cols-1 gap-4'}>
                {products.length > 0 ? (
                  products.map((prod, idx) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      priority={idx < 4}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center bg-white rounded-[16px] border border-[#E7EBEF] space-y-3">
                    <p className="text-gray-500 font-medium">No products found matching your current filters.</p>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="inline-block text-sm font-bold text-[#F51F2D] hover:underline"
                      >
                        Reset all filters
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic Chunked Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg border border-[#C5CDD5] bg-white font-medium transition-colors ${currentPage === 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-[#5F6872] hover:bg-gray-50'}`}
                    aria-label="Previous Page"
                  >
                    &lt;
                  </button>

                  {renderPaginationItems().map((item, idx) => {
                    if (typeof item === 'string') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 text-[#8792A2] select-none">
                          ...
                        </span>
                      );
                    }

                    const isCurrent = item === currentPage;
                    return (
                      <button
                        key={`page-${item}`}
                        onClick={() => handlePageChange(item)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all ${
                          isCurrent
                            ? 'bg-[#F51F2D] text-white shadow-sm'
                            : 'border border-[#C5CDD5] bg-white text-[#17202A] hover:bg-gray-50'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg border border-[#C5CDD5] bg-white font-medium transition-colors ${currentPage === totalPages ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-[#5F6872] hover:bg-gray-50'}`}
                    aria-label="Next Page"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ShopLoadingShell />}>
      <ProductsContent />
    </Suspense>
  );
}
