'use client';
import Image from "next/image";

import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import ProductCard from '../../components/ProductCard';
import { GridSkeleton } from '../../components/Skeleton';
import { ChevronDown, ChevronUp, LayoutGrid, List, Star } from 'lucide-react';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [shopBanners, setShopBanners] = useState([]);
  const [shopBannerMode, setShopBannerMode] = useState('static');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sort, setSort] = useState('popularity');
  const [view, setView] = useState('grid');
  
  // Accordion states
  const [openSections, setOpenSections] = useState({
    category: true,
    age: true,
    brand: true,
    price: true,
    rating: true,
    availability: true
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const [initialLoading, setInitialLoading] = useState(true);

  async function loadInitialData() {
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
      shopBannersOnly.sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0));
      setShopBanners(shopBannersOnly);
    }
    
    if (settingsRes.success) {
      const settings = settingsRes.data?.settings || settingsRes.data || {};
      if (settings.shop_banner_mode) {
        setShopBannerMode(settings.shop_banner_mode);
      }
    }
    setInitialLoading(false);
  }

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStock, setInStock] = useState(null); // true, false, or null
  const [minRating, setMinRating] = useState(null); // number or null

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialSearch = searchParams?.get('search') || '';

  async function loadProducts() {
    setLoading(true);
    const params = { limit: 24, sort };
    if (selectedCategories.length > 0) params.category_id = selectedCategories.join(',');
    if (selectedBrands.length > 0) params.brand_id = selectedBrands.join(',');
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (inStock !== null) params.in_stock = inStock;
    if (minRating !== null) params.min_rating = minRating;
    if (initialSearch) params.search = initialSearch;
    
    const prodRes = await api.get('/products', params);

    if (prodRes.success) {
      setProducts(prodRes.data?.products || prodRes.data || []);
      setTotal(prodRes.data?.pagination?.total || 0);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      const timer = setTimeout(() => {
        loadProducts();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [sort, selectedCategories, selectedBrands, minPrice, maxPrice, inStock, minRating, initialLoading]);

  useEffect(() => {
    if (shopBannerMode === 'carousel' && shopBanners.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % shopBanners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [shopBannerMode, shopBanners.length]);

  const toggleCategory = (id) => {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const toggleBrand = (id) => {
    setSelectedBrands(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMinPrice('');
    setMaxPrice('');
    setInStock(null);
    setMinRating(null);
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-12 font-sans">
      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm text-[#5F6872]">
        <Link href="/" className="hover:text-[#F51F2D]">Home</Link> <span className="mx-2">&gt;</span> <span className="text-[#17202A] font-medium">Shop</span>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="flex items-center justify-between pb-4">
            <h2 className="text-lg font-black text-[#17202A]">Filters</h2>
            <button onClick={clearAllFilters} className="text-sm font-semibold text-[#1877F2] hover:underline">Clear All</button>
          </div>

          <div className="space-y-6">
            {/* Category */}
            <div className="border-b border-[#E7EBEF] pb-6">
              <button onClick={() => toggleSection('category')} className="flex items-center justify-between w-full font-bold text-[#17202A] mb-4">
                Category
                {openSections.category ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {openSections.category && (
                <div className="space-y-2.5">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-4 h-4 rounded border border-[#C5CDD5] flex items-center justify-center group-hover:border-[#F51F2D]">
                        <input 
                          type="checkbox" 
                          checked={selectedCategories.includes(cat.id)}
                          onChange={() => toggleCategory(cat.id)}
                          className="appearance-none w-full h-full checked:bg-[#F51F2D] checked:border-[#F51F2D] rounded-[3px] transition-colors" 
                        />
                      </div>
                      <span className="text-sm text-[#5F6872] group-hover:text-[#17202A] flex-1">{cat.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="border-b border-[#E7EBEF] pb-6">
              <button onClick={() => toggleSection('rating')} className="flex items-center justify-between w-full font-bold text-[#17202A] mb-4">
                Rating
                {openSections.rating ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {openSections.rating && (
                <div className="space-y-3">
                  {[5,4,3,2,1].map(stars => (
                    <label key={stars} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-4 h-4 rounded border border-[#C5CDD5] flex items-center justify-center group-hover:border-[#F51F2D]">
                        <input 
                          type="checkbox" 
                          checked={minRating === stars}
                          onChange={() => setMinRating(prev => prev === stars ? null : stars)}
                          className="appearance-none w-full h-full checked:bg-[#F51F2D] checked:border-[#F51F2D] rounded-[3px]" 
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={14} className={s <= stars ? "fill-[#FFB800] text-[#FFB800]" : "fill-[#E7EBEF] text-[#E7EBEF]"} />
                        ))}
                      </div>
                      <span className="text-xs text-[#5F6872]">& above</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Availability */}
            <div>
              <button onClick={() => toggleSection('availability')} className="flex items-center justify-between w-full font-bold text-[#17202A] mb-4">
                Availability
                {openSections.availability ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {openSections.availability && (
                <div className="space-y-2.5">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-4 h-4 rounded border border-[#C5CDD5] flex items-center justify-center group-hover:border-[#F51F2D]">
                      <input 
                        type="checkbox" 
                        checked={inStock === true} 
                        onChange={() => setInStock(prev => prev === true ? null : true)}
                        className="appearance-none w-full h-full checked:bg-[#F51F2D] checked:border-[#F51F2D] rounded-[3px]" 
                      />
                    </div>
                    <span className="text-sm text-[#5F6872] flex-1">In Stock</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-4 h-4 rounded border border-[#C5CDD5] flex items-center justify-center group-hover:border-[#F51F2D]">
                      <input 
                        type="checkbox" 
                        checked={inStock === false} 
                        onChange={() => setInStock(prev => prev === false ? null : false)}
                        className="appearance-none w-full h-full checked:bg-[#F51F2D] checked:border-[#F51F2D] rounded-[3px]" 
                      />
                    </div>
                    <span className="text-sm text-[#5F6872] flex-1">Out of Stock</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Banner */}
          {shopBanners.length > 0 && (
            <div className="w-full rounded-[20px] overflow-hidden mb-6 relative">
              {shopBannerMode === 'carousel' && shopBanners.length > 1 ? (
                <div className="relative w-full">
                  <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                    {shopBanners.map((b, i) => (
                      <div key={b.id || i} className="w-full flex-shrink-0 relative">
                        {b.link_url ? (
                          <Link href={b.link_url} className="block w-full">
                            <Image width={1920} height={400} src={b.image_url} alt={b.title || "Shop Banner"} className="w-full h-auto object-cover" />
                          </Link>
                        ) : (
                          <Image width={1920} height={400} src={b.image_url} alt={b.title || "Shop Banner"} className="w-full h-auto object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Dots */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {shopBanners.map((_, i) => (
                      <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2 h-2 rounded-full ${currentSlide === i ? 'bg-white' : 'bg-white/50'}`}></button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full">
                   {shopBanners[0].link_url ? (
                     <Link href={shopBanners[0].link_url} className="block w-full">
                       <Image width={1920} height={400} src={shopBanners[0].image_url} alt={shopBanners[0].title || "Shop Banner"} className="w-full h-auto object-cover" />
                     </Link>
                   ) : (
                     <Image width={1920} height={400} src={shopBanners[0].image_url} alt={shopBanners[0].title || "Shop Banner"} className="w-full h-auto object-cover" />
                   )}
                </div>
              )}
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="text-sm text-[#5F6872]">
              Showing <span className="font-bold text-[#17202A]">1 - 24</span> of <span className="font-bold text-[#17202A]">{total}</span> products
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#5F6872]">Sort by:</span>
                <div className="relative">
                  <select 
                    value={sort} 
                    onChange={(e) => setSort(e.target.value)}
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
              
              <div className="flex items-center border border-[#C5CDD5] rounded-md overflow-hidden bg-white">
                <button 
                  onClick={() => setView('grid')}
                  className={`p-1.5 ${view === 'grid' ? 'bg-[#F51F2D] text-white' : 'text-[#5F6872] hover:bg-gray-50'}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <div className="w-px h-5 bg-[#C5CDD5]"></div>
                <button 
                  onClick={() => setView('list')}
                  className={`p-1.5 ${view === 'list' ? 'bg-[#F51F2D] text-white' : 'text-[#5F6872] hover:bg-gray-50'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <GridSkeleton count={8} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.length > 0 ? products.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                )) : (
                  <div className="col-span-full py-12 text-center bg-white rounded-[16px] border border-[#E7EBEF]">
                    <p className="text-gray-500">No products found.</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {products.length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#C5CDD5] bg-white text-[#5F6872] hover:bg-gray-50 transition-colors">
                    &lt;
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#F51F2D] text-white font-bold shadow-sm">
                    1
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#C5CDD5] bg-white text-[#17202A] font-medium hover:bg-gray-50 transition-colors">
                    2
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#C5CDD5] bg-white text-[#17202A] font-medium hover:bg-gray-50 transition-colors">
                    3
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#C5CDD5] bg-white text-[#17202A] font-medium hover:bg-gray-50 transition-colors">
                    4
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#C5CDD5] bg-white text-[#17202A] font-medium hover:bg-gray-50 transition-colors">
                    5
                  </button>
                  <span className="px-1 text-[#8792A2]">...</span>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#C5CDD5] bg-white text-[#17202A] font-medium hover:bg-gray-50 transition-colors">
                    22
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#C5CDD5] bg-white text-[#5F6872] hover:bg-gray-50 transition-colors">
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
