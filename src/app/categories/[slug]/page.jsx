'use client';
import Image from "next/image";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { GridSkeleton } from '@/components/Skeleton';
import api from '@/lib/api';
import { ChevronDown, ChevronUp, Star, LayoutGrid, List } from 'lucide-react';

export default function CategoryProductsPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  // Filter & Sort state
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStock, setInStock] = useState(null);
  const [minRating, setMinRating] = useState(null);
  const [sort, setSort] = useState('popularity');
  const [view, setView] = useState('grid');

  // Accordion open sections
  const [openSections, setOpenSections] = useState({
    brand: true,
    price: true,
    rating: true,
    availability: true
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Initial category & brands data fetch
  useEffect(() => {
    async function loadCategoryAndBrands() {
      setLoading(true);
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get(`/categories/${slug}`),
          api.get('/brands')
        ]);

        if (catRes.success && catRes.data?.category) {
          setCategory(catRes.data.category);
        } else {
          setError('Category not found');
        }

        if (brandRes.success) {
          setBrands(brandRes.data?.brands || brandRes.data || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load category details');
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadCategoryAndBrands();
  }, [slug]);

  // Load products when filters or category change
  async function loadProducts() {
    if (!category?.id) return;
    setProductsLoading(true);
    
    const params = {
      category_id: category.id,
      limit: 24,
      sort
    };

    if (selectedBrands.length > 0) params.brand_id = selectedBrands.join(',');
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (inStock !== null) params.in_stock = inStock;
    if (minRating !== null) params.min_rating = minRating;

    try {
      const prodRes = await api.get('/products', params);
      if (prodRes.success) {
        setProducts(prodRes.data?.products || prodRes.data || []);
        setTotal(prodRes.data?.pagination?.total || (prodRes.data?.products ? prodRes.data.products.length : 0));
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setProductsLoading(false);
    }
  }

  useEffect(() => {
    if (category?.id) {
      const timer = setTimeout(() => {
        loadProducts();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [category?.id, sort, selectedBrands, minPrice, maxPrice, inStock, minRating]);

  const toggleBrand = (id) => {
    setSelectedBrands(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setMinPrice('');
    setMaxPrice('');
    setInStock(null);
    setMinRating(null);
  };

  if (loading) {
    return (
      <div className="bg-[#F8F9FA] min-h-screen py-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 bg-white rounded-xl mb-6 animate-pulse" />
          <GridSkeleton count={8} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#F8F9FA] min-h-screen py-16 flex justify-center items-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl font-medium text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16 font-sans">
      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm text-[#5F6872]">
        <Link href="/" className="hover:text-[#F51F2D]">Home</Link>
        <span className="mx-2">&gt;</span>
        <Link href="/categories" className="hover:text-[#F51F2D]">Categories</Link>
        <span className="mx-2">&gt;</span>
        <span className="text-[#17202A] font-medium">{category?.name}</span>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Header Banner */}
        {category?.banner_image ? (
          <div className="w-full rounded-[20px] overflow-hidden shadow-sm mb-8 border border-[#E7EBEF]">
            <Image width={1920} height={400} 
              src={category.banner_image} 
              alt={category.name} 
              className="w-full h-auto block"
            />
          </div>
        ) : (
          <div className="bg-white p-6 sm:p-8 rounded-[20px] shadow-sm mb-8 border border-[#E7EBEF]">
            <h1 className="text-3xl sm:text-4xl font-black text-[#17202A] mb-2">{category?.name}</h1>
            <p className="text-[#5F6872]">{category?.description || 'Explore products in this category'}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white p-5 rounded-[20px] border border-[#E7EBEF] shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-[#E7EBEF] mb-6">
                <h2 className="text-lg font-black text-[#17202A]">Filters</h2>
                <button 
                  onClick={clearAllFilters} 
                  className="text-sm font-semibold text-[#1877F2] hover:underline"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {/* Brand Filter */}
                {brands.length > 0 && (
                  <div className="border-b border-[#E7EBEF] pb-6">
                    <button 
                      onClick={() => toggleSection('brand')} 
                      className="flex items-center justify-between w-full font-bold text-[#17202A] mb-4"
                    >
                      Brand
                      {openSections.brand ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {openSections.brand && (
                      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                        {brands.map((brand) => (
                          <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-4 h-4 rounded border border-[#C5CDD5] flex items-center justify-center group-hover:border-[#F51F2D]">
                              <input 
                                type="checkbox" 
                                checked={selectedBrands.includes(brand.id)}
                                onChange={() => toggleBrand(brand.id)}
                                className="appearance-none w-full h-full checked:bg-[#F51F2D] checked:border-[#F51F2D] rounded-[3px]" 
                              />
                            </div>
                            <span className="text-sm text-[#5F6872] flex-1">{brand.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Price Range Filter */}
                <div className="border-b border-[#E7EBEF] pb-6">
                  <button 
                    onClick={() => toggleSection('price')} 
                    className="flex items-center justify-between w-full font-bold text-[#17202A] mb-4"
                  >
                    Price Range
                    {openSections.price ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {openSections.price && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center border border-[#C5CDD5] rounded-md px-2 py-1.5 bg-white">
                        <span className="text-[#8792A2] text-sm">₹</span>
                        <input 
                          type="number" 
                          value={minPrice} 
                          onChange={(e) => setMinPrice(e.target.value)} 
                          placeholder="Min"
                          className="w-full bg-transparent text-sm text-[#17202A] text-center outline-none" 
                        />
                      </div>
                      <span className="text-[#8792A2]">-</span>
                      <div className="flex-1 flex items-center border border-[#C5CDD5] rounded-md px-2 py-1.5 bg-white">
                        <span className="text-[#8792A2] text-sm">₹</span>
                        <input 
                          type="number" 
                          value={maxPrice} 
                          onChange={(e) => setMaxPrice(e.target.value)} 
                          placeholder="Max"
                          className="w-full bg-transparent text-sm text-[#17202A] text-center outline-none" 
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Rating Filter */}
                <div className="border-b border-[#E7EBEF] pb-6">
                  <button 
                    onClick={() => toggleSection('rating')} 
                    className="flex items-center justify-between w-full font-bold text-[#17202A] mb-4"
                  >
                    Rating
                    {openSections.rating ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {openSections.rating && (
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map(stars => (
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
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} size={14} className={s <= stars ? "fill-[#FFB800] text-[#FFB800]" : "fill-[#E7EBEF] text-[#E7EBEF]"} />
                            ))}
                          </div>
                          <span className="text-xs text-[#5F6872]">& above</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Availability Filter */}
                <div>
                  <button 
                    onClick={() => toggleSection('availability')} 
                    className="flex items-center justify-between w-full font-bold text-[#17202A] mb-4"
                  >
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
            </div>
          </aside>

          {/* Main Product Grid Content */}
          <main className="flex-1">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-[16px] border border-[#E7EBEF] shadow-sm">
              <div className="text-sm text-[#5F6872]">
                Showing <span className="font-bold text-[#17202A]">{products.length}</span> of <span className="font-bold text-[#17202A]">{total}</span> products
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
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
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
            {productsLoading ? (
              <GridSkeleton count={8} />
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-[16px] border border-[#E7EBEF] shadow-sm">
                <p className="text-[#5F6872] font-medium text-lg mb-2">No products match your selected filters.</p>
                <button 
                  onClick={clearAllFilters}
                  className="text-sm text-[#F51F2D] font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className={view === 'grid' ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
