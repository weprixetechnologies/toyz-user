'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles, Search, X, ChevronRight, BookOpen,
  Filter, Tag, SlidersHorizontal, Flame, Compass, Heart,
  Car, Bell
} from 'lucide-react';
import api from '@/lib/api';
import BlogCard from '@/components/BlogCard';
import { BlogGridSkeleton } from '@/components/BlogSkeleton';
import NewsletterBox from '@/components/NewsletterBox';

const CATEGORY_ICONS = {
  'rc-cars': Car,
  'toy-guides': Compass,
  'play-ideas': Sparkles,
  'parent-tips': Heart,
  'educational-toys': BookOpen,
  'news-updates': Bell
};

function BlogsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Read filter params from URL
  const selectedCategory = searchParams.get('category') || 'all';
  const currentPage = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);
  const searchParam = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(searchParam);
  const limit = 9;

  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit,
          category: selectedCategory,
          search: searchParam
        };

        const res = await api.get('/blogs', params);
        if (res && res.success && res.data) {
          setBlogs(res.data.blogs || []);
          setTotal(res.data.total || 0);
          setTotalPages(res.data.totalPages || 1);
          if (res.data.categories && res.data.categories.length > 0) {
            setCategories(res.data.categories);
          }
        }
      } catch (err) {
        console.error('Failed to load blogs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, [selectedCategory, currentPage, searchParam]);

  // Update URL search parameters
  const updateParams = (newParams) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '' || v === 'all') {
        params.delete(k);
      } else {
        params.set(k, String(v));
      }
    });
    router.push(`/blogs?${params.toString()}`);
  };

  const handleCategoryChange = (slug) => {
    updateParams({ category: slug, page: 1 });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim(), page: 1 });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateParams({ search: '', page: 1 });
  };

  const handlePageChange = (p) => {
    if (p < 1 || p > totalPages || p === currentPage) return;
    updateParams({ page: p });
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-20 font-sans">
      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="text-[#1877F2] hover:underline">Home</Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-900 font-semibold">Our Blogs</span>
          {selectedCategory !== 'all' && (
            <>
              <ChevronRight size={12} className="text-gray-400" />
              <span className="text-[#F51F2D] font-bold capitalize">
                {selectedCategory.replace(/-/g, ' ')}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* ── 3.2 Wide Hero Banner ────────────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 border border-orange-100/70 p-8 sm:p-12 lg:p-14 shadow-sm">
          {/* Playful Floating Background Shapes */}
          <div className="absolute top-4 right-1/3 w-16 h-16 bg-yellow-300/30 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-4 left-1/4 w-24 h-24 bg-red-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-orange-300/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left Text Column */}
            <div className="md:col-span-7 space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-sm border border-red-100 text-xs font-bold text-[#F51F2D]">
                <Sparkles size={14} className="text-yellow-500" />
                <span>Provoke Playtech STORIES & GUIDES</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#17202A] tracking-tight leading-tight">
                Our Blogs
              </h1>

              <p className="text-base sm:text-lg text-gray-600 font-medium max-w-xl leading-relaxed">
                Tips, guides, and fun stories from the Provoke Playtech family! Explore expert RC car reviews, screen-free play ideas, and parenting advice.
              </p>

              {/* Quick Search in Hero */}
              <form onSubmit={handleSearchSubmit} className="pt-2 max-w-md mx-auto md:mx-0">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search articles by keyword or topic..."
                    className="w-full pl-11 pr-24 py-3 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F51F2D] text-gray-800"
                  />
                  <div className="absolute left-3.5 text-gray-400">
                    <Search size={18} />
                  </div>
                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-20 text-gray-400 hover:text-gray-600 p-1"
                      title="Clear"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="absolute right-1.5 px-4 py-2 bg-[#F51F2D] hover:bg-[#c41522] text-white text-xs font-bold rounded-xl shadow transition"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* Right Decorative Imagery Column */}
            <div className="md:col-span-5 flex justify-center md:justify-end">
              <div className="relative w-64 sm:w-72 md:w-80 aspect-square">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#F51F2D] to-yellow-400 rounded-3xl rotate-3 opacity-20 transform group-hover:rotate-6 transition-transform" />
                <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=80"
                    alt="Provoke Playtech kids playing with RC Cars"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 left-3 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-sm text-center">
                    <span className="text-[11px] font-black uppercase text-[#17202A] tracking-wider flex items-center justify-center gap-1.5">
                      🏎️ RC Cars • 🧸 Toys • 🧩 Puzzles
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3.3 Category Filter Chips ───────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {/* "All Posts" chip */}
            <button
              type="button"
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${selectedCategory === 'all'
                  ? 'bg-[#F51F2D] text-white shadow-md shadow-[#F51F2D]/20'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              <span>All Posts</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                {total}
              </span>
            </button>

            {/* Dynamic Category Chips */}
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.slug] || Tag;
              const isActive = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id || cat.slug}
                  type="button"
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${isActive
                      ? 'bg-[#F51F2D] text-white shadow-md shadow-[#F51F2D]/20'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                  <Icon size={13} className={isActive ? 'text-white' : 'text-gray-400'} />
                  <span>{cat.name}</span>
                  {cat.article_count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {cat.article_count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Search Indicator */}
          {searchParam && (
            <div className="flex items-center gap-2 text-xs text-gray-600 bg-white px-3 py-1.5 rounded-full border border-gray-200 self-start sm:self-auto">
              <span>Search: <strong>"{searchParam}"</strong></span>
              <button onClick={handleClearSearch} className="text-gray-400 hover:text-red-500">
                <X size={13} />
              </button>
            </div>
          )}
        </div>

        {/* ── 3.4 Blog Card Grid & States ─────────────────────────────────── */}
        {loading ? (
          <BlogGridSkeleton count={6} />
        ) : blogs.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 max-w-lg mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-red-50 text-[#F51F2D] rounded-full flex items-center justify-center mx-auto text-3xl">
              🧸
            </div>
            <h3 className="text-xl font-bold text-gray-900">No Articles Found</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              We couldn't find any blog posts matching your selected category or search keyword. Try selecting "All Posts" or searching with different terms.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                updateParams({ category: 'all', search: '', page: 1 });
              }}
              className="px-6 py-2.5 bg-[#F51F2D] hover:bg-[#c41522] text-white text-xs font-bold rounded-xl shadow transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog, idx) => (
                <BlogCard key={blog.id || blog.slug} blog={blog} priority={idx < 3} />
              ))}
            </div>

            {/* ── 3.6 Pagination Controls ─────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="pt-10 flex items-center justify-center gap-2">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous Page"
                  className={`w-10 h-10 flex items-center justify-center rounded-xl border border-gray-300 font-bold text-sm transition ${currentPage === 1
                      ? 'text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50'
                      : 'text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                >
                  &lt;
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const isCurrent = p === currentPage;
                  return (
                    <button
                      key={`page-${p}`}
                      type="button"
                      onClick={() => handlePageChange(p)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm transition-all ${isCurrent
                          ? 'bg-[#F51F2D] text-white shadow-md shadow-[#F51F2D]/20'
                          : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {p}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next Page"
                  className={`w-10 h-10 flex items-center justify-center rounded-xl border border-gray-300 font-bold text-sm transition ${currentPage === totalPages
                      ? 'text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50'
                      : 'text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                >
                  &gt;
                </button>
              </div>
            )}
          </>
        )}

        {/* Bottom Newsletter Feature */}
        <div className="pt-10">
          <NewsletterBox source="blogs_listing_footer" />
        </div>
      </div>
    </div>
  );
}

export default function BlogsPage() {
  return (
    <Suspense fallback={
      <div className="bg-[#F8F9FA] min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4">
          <BlogGridSkeleton count={6} />
        </div>
      </div>
    }>
      <BlogsContent />
    </Suspense>
  );
}
