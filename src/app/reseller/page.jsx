'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { GridSkeleton } from '@/components/Skeleton';
import {
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  Star,
  SlidersHorizontal,
  X,
  Search,
  Check,
  Flame,
  Sparkles,
  Percent,
  BadgePercent,
  Tag,
  Gift,
  Zap,
  TrendingDown,
  Truck
} from 'lucide-react';

export default function ResellerShopPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialDiscountPercent, setSpecialDiscountPercent] = useState(null);

  // Filter & listing state
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStock, setInStock] = useState(null);
  const [minRating, setMinRating] = useState(null);
  const [sort, setSort] = useState('discount_desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [view, setView] = useState('grid');
  const limit = 24;

  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Accordion state
  const [openSections, setOpenSections] = useState({
    category: true,
    brand: true,
    price: true,
    rating: true,
    availability: true
  });

  const productsTopRef = useRef(null);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prodRes, catRes, brandRes] = await Promise.all([
          api.get('/reseller/products'),
          api.get('/categories'),
          api.get('/brands')
        ]);

        let prods = [];
        let specialPct = null;

        if (prodRes?.success && (prodRes.data?.products?.length || prodRes.data?.length)) {
          prods = prodRes.data?.products || prodRes.data || [];
          specialPct = prodRes.data?.special_discount_percent ?? null;
        } else {
          // Fallback to general products with calculated reseller pricing
          const fallback = await api.get('/products');
          if (fallback?.success) {
            prods = (fallback.data?.products || fallback.data || []).map((p) => {
              const base = parseFloat(p.sale_price || p.base_price || 0);
              return {
                ...p,
                reseller_price: Math.round(base * 0.82),
                original_price: base,
                moq: p.moq || 1
              };
            });
          }
        }
        setAllProducts(prods);

        // If not explicitly provided, calculate maximum discount from current user's products
        if (!specialPct && prods.length > 0) {
          const maxP = Math.max(
            ...prods.map((p) => {
              const orig = parseFloat(p.original_price || p.base_price || 0);
              const pr = parseFloat(p.reseller_price || p.sale_price || p.base_price || 0);
              return orig > pr ? Math.round(((orig - pr) / orig) * 100) : 0;
            }),
            0
          );
          if (maxP > 0) specialPct = maxP;
        }
        setSpecialDiscountPercent(specialPct);

        if (catRes?.success) {
          setCategories(catRes.data?.categories || catRes.data || []);
        }
        if (brandRes?.success) {
          setBrands(brandRes.data?.brands || brandRes.data || []);
        }
      } catch (err) {
        console.error('Failed to load reseller shop data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter toggles
  const toggleCategory = (catId) => {
    setCurrentPage(1);
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const toggleBrand = (brandId) => {
    setCurrentPage(1);
    setSelectedBrands((prev) =>
      prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId]
    );
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
    setSort('discount_desc');
  };

  // Compute filtered products
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.category_name?.toLowerCase().includes(q)
      );
    }

    // Categories
    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category_id));
    }

    // Brands
    if (selectedBrands.length > 0) {
      list = list.filter((p) => selectedBrands.includes(p.brand_id));
    }

    // Price range
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) {
      list = list.filter((p) => {
        const pr = parseFloat(p.reseller_price || p.sale_price || p.base_price || 0);
        return pr >= min;
      });
    }
    if (!isNaN(max)) {
      list = list.filter((p) => {
        const pr = parseFloat(p.reseller_price || p.sale_price || p.base_price || 0);
        return pr <= max;
      });
    }

    // Stock availability
    if (inStock === true) {
      list = list.filter((p) => p.stock > 0 || p.track_inventory === 0 || p.in_stock === 1);
    } else if (inStock === false) {
      list = list.filter((p) => p.stock <= 0 && p.track_inventory === 1);
    }

    // Rating
    if (minRating !== null) {
      list = list.filter((p) => (parseFloat(p.avg_rating) || 0) >= minRating);
    }

    // Sorting
    list.sort((a, b) => {
      const priceA = parseFloat(a.reseller_price || a.sale_price || a.base_price || 0);
      const priceB = parseFloat(b.reseller_price || b.sale_price || b.base_price || 0);
      const origA = parseFloat(a.original_price || a.base_price || priceA);
      const origB = parseFloat(b.original_price || b.base_price || priceB);
      const discA = origA > priceA ? (origA - priceA) / origA : 0;
      const discB = origB > priceB ? (origB - priceB) / origB : 0;

      if (sort === 'discount_desc') return discB - discA;
      if (sort === 'price_low') return priceA - priceB;
      if (sort === 'price_high') return priceB - priceA;
      if (sort === 'newest') return (b.id || 0) - (a.id || 0);
      if (sort === 'popularity') return (b.review_count || 0) - (a.review_count || 0);
      return 0;
    });

    return list;
  }, [allProducts, searchQuery, selectedCategories, selectedBrands, minPrice, maxPrice, inStock, minRating, sort]);

  // Pagination calculation
  const total = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return filteredProducts.slice(start, start + limit);
  }, [filteredProducts, currentPage, limit]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    if (productsTopRef.current) {
      productsTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedBrands.length +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (inStock !== null ? 1 : 0) +
    (minRating !== null ? 1 : 0) +
    (searchQuery ? 1 : 0);

  // Floating discount elements configuration
  const floatingIcons = [
    {
      type: 'badge',
      text: specialDiscountPercent ? `${specialDiscountPercent}% OFF` : 'SPECIAL DISCOUNT',
      icon: Zap,
      top: '4%',
      left: '3%',
      anim: 'animate-float-1',
      color: 'from-amber-400 to-yellow-500'
    },
    { type: 'badge', text: 'WHOLESALE', icon: Tag, top: '8%', right: '4%', anim: 'animate-float-2', color: 'from-rose-500 to-red-600' },
    { type: 'icon', icon: Percent, top: '16%', left: '7%', anim: 'animate-float-3', size: 36, color: 'text-amber-400' },
    { type: 'badge', text: 'MEGA MARGINS', icon: Flame, top: '24%', right: '6%', anim: 'animate-float-4', color: 'from-orange-500 to-amber-500' },
    { type: 'badge', text: '-50% OFF', icon: BadgePercent, top: '34%', left: '4%', anim: 'animate-float-2', color: 'from-red-500 to-rose-600' },
    { type: 'icon', icon: Gift, top: '44%', right: '5%', anim: 'animate-float-1', size: 38, color: 'text-yellow-400' },
    { type: 'badge', text: 'BULK PRICING', icon: TrendingDown, top: '54%', left: '5%', anim: 'animate-float-3', color: 'from-emerald-500 to-teal-500' },
    { type: 'badge', text: '-60% OFF', icon: Zap, top: '64%', right: '4%', anim: 'animate-float-4', color: 'from-amber-500 to-orange-600' },
    { type: 'icon', icon: Sparkles, top: '74%', left: '6%', anim: 'animate-float-1', size: 40, color: 'text-amber-300' },
    { type: 'badge', text: 'FACTORY DEALS', icon: Tag, top: '84%', right: '5%', anim: 'animate-float-2', color: 'from-rose-600 to-pink-600' },
    { type: 'badge', text: '-40% OFF', icon: BadgePercent, top: '94%', left: '5%', anim: 'animate-float-4', color: 'from-red-600 to-orange-500' }
  ];

  // Reusable Sidebar Filter Content (styled for the premium dark theme)
  const filterContent = (
    <div className="space-y-6">
      {/* Category Section */}
      <div className="border-b border-slate-800 pb-5">
        <button
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full font-bold text-white mb-3 text-left"
        >
          <span>Category</span>
          {openSections.category ? <ChevronUp size={16} className="text-amber-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {openSections.category && (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
            {categories.length > 0 ? (
              categories.map((cat) => {
                const checked = selectedCategories.includes(cat.id);
                return (
                  <label key={cat.id} className="flex items-center gap-3 cursor-pointer group select-none">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        checked ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-700 group-hover:border-amber-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCategory(cat.id)}
                        className="sr-only"
                      />
                      {checked && <Check size={12} className="stroke-[3]" />}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-300 group-hover:text-amber-300 flex-1 truncate">{cat.name}</span>
                  </label>
                );
              })
            ) : (
              <div className="text-xs text-gray-500">Loading categories...</div>
            )}
          </div>
        )}
      </div>

      {/* Brands Section */}
      {brands.length > 0 && (
        <div className="border-b border-slate-800 pb-5">
          <button
            onClick={() => toggleSection('brand')}
            className="flex items-center justify-between w-full font-bold text-white mb-3 text-left"
          >
            <span>Brand</span>
            {openSections.brand ? <ChevronUp size={16} className="text-amber-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          {openSections.brand && (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
              {brands.map((b) => {
                const checked = selectedBrands.includes(b.id);
                return (
                  <label key={b.id} className="flex items-center gap-3 cursor-pointer group select-none">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        checked ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-700 group-hover:border-amber-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleBrand(b.id)}
                        className="sr-only"
                      />
                      {checked && <Check size={12} className="stroke-[3]" />}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-300 group-hover:text-amber-300 flex-1 truncate">{b.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Price Range */}
      <div className="border-b border-slate-800 pb-5">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full font-bold text-white mb-3 text-left"
        >
          <span>Price Range</span>
          {openSections.price ? <ChevronUp size={16} className="text-amber-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {openSections.price && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-slate-950/80 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-slate-950/80 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div className="border-b border-slate-800 pb-5">
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full font-bold text-white mb-3 text-left"
        >
          <span>Rating</span>
          {openSections.rating ? <ChevronUp size={16} className="text-amber-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {openSections.rating && (
          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const checked = minRating === stars;
              return (
                <label key={stars} className="flex items-center gap-3 cursor-pointer group select-none">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      checked ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-700 group-hover:border-amber-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setCurrentPage(1);
                        setMinRating((prev) => (prev === stars ? null : stars));
                      }}
                      className="sr-only"
                    />
                    {checked && <Check size={12} className="stroke-[3]" />}
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        className={s <= stars ? 'fill-[#FFB800] text-[#FFB800]' : 'fill-slate-800 text-slate-800'}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">& above</span>
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
          className="flex items-center justify-between w-full font-bold text-white mb-3 text-left"
        >
          <span>Availability</span>
          {openSections.availability ? <ChevronUp size={16} className="text-amber-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {openSections.availability && (
          <div className="space-y-2.5">
            <label className="flex items-center gap-3 cursor-pointer group select-none">
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  inStock === true ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-700 group-hover:border-amber-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={inStock === true}
                  onChange={() => {
                    setCurrentPage(1);
                    setInStock((prev) => (prev === true ? null : true));
                  }}
                  className="sr-only"
                />
                {inStock === true && <Check size={12} className="stroke-[3]" />}
              </div>
              <span className="text-xs sm:text-sm text-gray-300 flex-1">In Stock Only</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group select-none">
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  inStock === false ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-700 group-hover:border-amber-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={inStock === false}
                  onChange={() => {
                    setCurrentPage(1);
                    setInStock((prev) => (prev === false ? null : false));
                  }}
                  className="sr-only"
                />
                {inStock === false && <Check size={12} className="stroke-[3]" />}
              </div>
              <span className="text-xs sm:text-sm text-gray-300 flex-1">Out of Stock</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#07090F] text-slate-100 font-sans pb-16 overflow-hidden">
      
      {/* ── Ambient Glow Backdrops ────────────────────────────────────────── */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-10 w-[550px] h-[550px] bg-orange-500/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* ── Floating Discount Icons & Badges ─────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        {floatingIcons.map((item, idx) => (
          <div
            key={idx}
            className={`absolute ${item.anim} transition-all duration-1000 hidden md:block`}
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              opacity: 0.28
            }}
          >
            {item.type === 'badge' ? (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${item.color} text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.2)] border border-white/30 backdrop-blur-sm`}
              >
                <item.icon size={12} className="text-slate-950" />
                <span>{item.text}</span>
              </div>
            ) : (
              <div className={`p-2 rounded-2xl bg-white/5 border border-white/10 ${item.color} backdrop-blur-md shadow-[0_0_25px_rgba(245,158,11,0.18)]`}>
                <item.icon size={item.size || 32} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 text-xs sm:text-sm text-gray-400">
        <Link href="/" className="hover:text-amber-400 transition">Home</Link>
        <span className="mx-2 text-gray-600">&gt;</span>
        <span className="text-amber-400 font-semibold">Reseller Wholesale Store</span>
      </div>

      {/* ── Main Container: Sidebar + Products ────────────────────────────── */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        
        {/* ── Desktop Sidebar Filters ─────────────────────────────────────── */}
        <aside className="w-full lg:w-64 flex-shrink-0 hidden lg:block">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md sticky top-28 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </h2>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>
            {filterContent}
          </div>
        </aside>

        {/* ── Mobile Filter Drawer ────────────────────────────────────────── */}
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 lg:hidden ${
            mobileDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer sheet */}
          <div
            className={`fixed inset-y-0 left-0 w-[85%] max-w-xs bg-[#0B0F19] border-r border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out z-10 ${
              mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Filters</h3>
                {activeFilterCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              {filterContent}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2.5 px-3 border border-slate-700 rounded-lg text-xs font-bold text-gray-300 hover:bg-slate-900"
              >
                Clear All
              </button>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="flex-1 py-2.5 px-3 bg-amber-500 text-slate-950 rounded-lg text-xs font-black shadow-sm hover:bg-amber-400"
              >
                View ({total})
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Products Area ──────────────────────────────────────────── */}
        <main className="flex-1 min-w-0" ref={productsTopRef}>
          
          {/* ── Sleek, Reduced-Height HEAVY DISCOUNT STORE Banner ─────────── */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#111726]/90 to-slate-900/90 border border-amber-500/30 px-5 py-3.5 sm:py-4 mb-6 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-widest">
                <Flame size={12} className="text-amber-400 animate-pulse" />
                <span>VIP WHOLESALE UNLOCKED</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>HEAVY</span>
                <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  DISCOUNT STORE
                </span>
              </h1>
              <p className="text-xs text-gray-300 font-medium line-clamp-1">
                Exclusive B2B wholesale rates, bulk tiers & maximum margins on authentic inventory.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-bold">
                <Tag size={12} className="text-amber-400" />
                <span>
                  {specialDiscountPercent
                    ? `${specialDiscountPercent}% Special Discount`
                    : 'Special Wholesale Rates'}
                </span>
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-bold">
                <Truck size={12} className="text-amber-400" />
                <span>Priority Dispatch</span>
              </span>
            </div>
          </div>

          {/* ── Active Search Pill ─────────────────────────────────────────── */}
          {searchQuery && (
            <div className="flex items-center gap-2 mb-4 bg-slate-900/80 border border-slate-800 p-3 rounded-xl backdrop-blur-md">
              <Search size={16} className="text-amber-400" />
              <span className="text-xs sm:text-sm text-gray-200">
                Searching for: <strong className="text-white">"{searchQuery}"</strong>
              </span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="ml-auto text-xs bg-slate-800 hover:bg-slate-700 text-gray-300 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold"
              >
                Clear Search <X size={12} />
              </button>
            </div>
          )}

          {/* ── Controls Bar (Replicating User Shop Products Page) ────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center justify-between sm:justify-start gap-3">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold text-white hover:border-amber-400 shadow-sm"
              >
                <SlidersHorizontal size={15} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 text-[11px] font-black px-1.5 py-0.2 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="text-xs sm:text-sm text-gray-400">
                Showing <span className="font-bold text-white">
                  {total === 0 ? 0 : (currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, total)}
                </span> of <span className="font-bold text-white">{total}</span> wholesale products
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-400 hidden xs:inline">Sort by:</span>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 pr-8 text-xs sm:text-sm font-bold text-white outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="discount_desc" className="bg-slate-900 text-white">Highest Discount</option>
                    <option value="popularity" className="bg-slate-900 text-white">Popularity</option>
                    <option value="newest" className="bg-slate-900 text-white">Newest Arrivals</option>
                    <option value="price_low" className="bg-slate-900 text-white">Price: Low to High</option>
                    <option value="price_high" className="bg-slate-900 text-white">Price: High to Low</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Grid / List View Toggle */}
              <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden bg-slate-900">
                <button
                  onClick={() => setView('grid')}
                  className={`p-1.5 transition ${view === 'grid' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-gray-400 hover:text-white'}`}
                  title="Grid view"
                >
                  <LayoutGrid size={16} />
                </button>
                <div className="w-px h-4 bg-slate-700" />
                <button
                  onClick={() => setView('list')}
                  className={`p-1.5 transition ${view === 'list' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-gray-400 hover:text-white'}`}
                  title="List view"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Product Grid Section ───────────────────────────────────────── */}
          {loading ? (
            <GridSkeleton count={8} />
          ) : (
            <>
              <div
                className={
                  view === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'grid grid-cols-1 gap-4'
                }
              >
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((prod, idx) => (
                    <div
                      key={prod.id || idx}
                      className="transition-transform duration-300 hover:-translate-y-1"
                    >
                      <ProductCard product={prod} priority={idx < 4} forceReseller={true} />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                    <p className="text-gray-400 font-medium">No wholesale products found matching your current filters.</p>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="inline-block text-xs sm:text-sm font-bold text-amber-400 hover:underline"
                      >
                        Reset all filters
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* ── Numbered Pagination ────────────────────────────────────── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-xs sm:text-sm font-bold transition ${
                      currentPage === 1 ? 'text-slate-600 border-slate-800 cursor-not-allowed' : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                    }`}
                    aria-label="Previous Page"
                  >
                    &lt;
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const isCurrent = p === currentPage;
                    return (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-sm font-black transition-all ${
                          isCurrent
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'border border-slate-700 bg-slate-900 text-gray-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-xs sm:text-sm font-bold transition ${
                      currentPage === totalPages ? 'text-slate-600 border-slate-800 cursor-not-allowed' : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                    }`}
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
