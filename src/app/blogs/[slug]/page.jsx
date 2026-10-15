'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar, Clock, Eye, User, Share2, Copy, Check, ChevronRight,
  ArrowRight, Facebook, Twitter, MessageCircle, Tag, ShoppingCart,
  Star, Heart, HelpCircle, Sparkles, BookOpen, Car, Compass, Bell,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { BlogDetailSkeleton } from '@/components/BlogSkeleton';
import NewsletterBox from '@/components/NewsletterBox';

const CATEGORY_ICONS = {
  'rc-cars': Car,
  'toy-guides': Compass,
  'play-ideas': Sparkles,
  'parent-tips': Heart,
  'educational-toys': BookOpen,
  'news-updates': Bell
};

export default function BlogDetailPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadArticle() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch Article Detail
        const res = await api.get(`/blogs/${slug}`);
        if (res && res.success && res.data?.blog) {
          setBlog(res.data.blog);
          setRelatedBlogs(res.data.relatedBlogs || []);
          setRecommendedProducts(res.data.recommendedProducts || []);
        } else {
          setError(res?.message || 'Article not found');
        }

        // 2. Fetch Categories for sidebar
        const catRes = await api.get('/blogs/categories');
        if (catRes && catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
      } catch (err) {
        console.error('Failed to load blog:', err);
        setError(err.message || 'Error loading article');
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [slug]);

  // Share handlers
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = blog?.title || 'ToyWorld Blog';

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const handleNativeShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: shareTitle,
        url: currentUrl
      }).catch(() => {});
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (_) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="bg-[#F8F9FA] min-h-screen">
        <BlogDetailSkeleton />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="bg-[#F8F9FA] min-h-screen py-20 font-sans">
        <div className="max-w-lg mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-red-50 text-[#F51F2D] rounded-full flex items-center justify-center mx-auto text-3xl">
            🧸
          </div>
          <h2 className="text-2xl font-black text-gray-900">Article Not Found</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            The blog article you are looking for may have been moved, updated, or does not exist.
          </p>
          <div className="pt-2">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#F51F2D] hover:bg-[#c41522] text-white text-xs font-bold rounded-xl shadow transition"
            >
              <span>Back to All Blogs</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.excerpt,
    image: blog.featured_image ? [blog.featured_image] : undefined,
    datePublished: blog.published_at || blog.created_at,
    dateModified: blog.updated_at || blog.published_at || blog.created_at,
    author: {
      '@type': 'Person',
      name: blog.author_name || 'ToyWorld Team'
    },
    publisher: {
      '@type': 'Organization',
      name: 'ToyWorld',
      logo: {
        '@type': 'ImageObject',
        url: 'https://provokeplaytech.com/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': currentUrl
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-24 font-sans">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── 4.2 Breadcrumb Navigation ────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 text-xs text-gray-500 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Link href="/" className="text-[#1877F2] hover:underline whitespace-nowrap">Home</Link>
          <ChevronRight size={12} className="text-gray-400 flex-shrink-0" />
          <Link href="/blogs" className="hover:text-gray-900 whitespace-nowrap">Blogs</Link>
          {blog.category_name && (
            <>
              <ChevronRight size={12} className="text-gray-400 flex-shrink-0" />
              <Link
                href={`/blogs?category=${blog.category_slug}`}
                className="hover:text-gray-900 whitespace-nowrap"
              >
                {blog.category_name}
              </Link>
            </>
          )}
          <ChevronRight size={12} className="text-gray-400 flex-shrink-0" />
          <span className="text-gray-900 font-semibold truncate max-w-xs sm:max-w-md">
            {blog.title}
          </span>
        </div>
      </nav>

      {/* Main Grid Viewport */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* ── Left Column: Main Article (70%) ────────────────────────────── */}
          <main className="lg:col-span-8 space-y-8">
            <article className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-sm space-y-8">

              {/* ── 4.3 Article Hero Image ─────────────────────────────────── */}
              {blog.featured_image && (
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                  <img
                    src={blog.featured_image}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                  {blog.category_name && (
                    <div className="absolute top-4 left-4">
                      <Link
                        href={`/blogs?category=${blog.category_slug}`}
                        className="inline-block px-3.5 py-1.5 bg-[#F51F2D] hover:bg-[#c41522] text-white text-xs font-black uppercase tracking-wider rounded-full shadow-md transition"
                      >
                        {blog.category_name}
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* ── 4.4 Title, Introduction & Meta ─────────────────────────── */}
              <div className="space-y-4 border-b border-gray-100 pb-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#17202A] tracking-tight leading-snug">
                  {blog.title}
                </h1>

                {blog.excerpt && (
                  <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed">
                    {blog.excerpt}
                  </p>
                )}

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-gray-500 font-medium">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1.5 text-gray-800 font-semibold">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-[#F51F2D] flex items-center justify-center text-[10px] font-black">
                        {blog.author_name ? blog.author_name.charAt(0) : 'T'}
                      </div>
                      <span>{blog.author_name || 'ToyWorld Team'}</span>
                    </span>

                    <span className="text-gray-300">•</span>

                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-gray-400" />
                      <span>{formatDate(blog.published_at || blog.created_at)}</span>
                    </span>

                    {blog.reading_time && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-gray-400" />
                          <span>{blog.reading_time}</span>
                        </span>
                      </>
                    )}

                    {blog.views_count > 0 && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1">
                          <Eye size={13} className="text-gray-400" />
                          <span>{blog.views_count} views</span>
                        </span>
                      </>
                    )}
                  </div>

                  {/* ── 4.5 Social Share Controls ─────────────────────────── */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs font-semibold mr-1">Share:</span>

                    {/* Facebook */}
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Share on Facebook"
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#1877F2] hover:text-white text-gray-600 flex items-center justify-center transition"
                    >
                      <Facebook size={14} />
                    </a>

                    {/* WhatsApp */}
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + currentUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Share on WhatsApp"
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#25D366] hover:text-white text-gray-600 flex items-center justify-center transition"
                    >
                      <MessageCircle size={14} />
                    </a>

                    {/* Twitter / X */}
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(currentUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Share on X"
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-black hover:text-white text-gray-600 flex items-center justify-center transition"
                    >
                      <Twitter size={14} />
                    </a>

                    {/* Copy Link */}
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      aria-label="Copy article link"
                      className="relative w-8 h-8 rounded-full bg-gray-100 hover:bg-[#F51F2D] hover:text-white text-gray-600 flex items-center justify-center transition"
                      title="Copy link"
                    >
                      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      {copied && (
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                          Copied!
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* ── 4.6 Structured Article Content ─────────────────────────── */}
              <div
                className="article-body prose prose-lg max-w-none text-gray-700 leading-relaxed font-sans
                  [&>h2]:text-2xl [&>h2]:font-black [&>h2]:text-[#17202A] [&>h2]:tracking-tight [&>h2]:mt-8 [&>h2]:mb-4
                  [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-[#17202A] [&>h3]:mt-6 [&>h3]:mb-3
                  [&>p]:my-4 [&>p]:leading-relaxed
                  [&>ul]:my-4 [&>ul]:space-y-2 [&>ul]:list-disc [&>ul]:pl-6
                  [&>ol]:my-4 [&>ol]:space-y-2 [&>ol]:list-decimal [&>ol]:pl-6
                  [&>li]:leading-relaxed
                  [&>strong]:text-gray-900 [&>strong]:font-bold"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              {/* ── 4.7 Recommended Products Section ("Our Top Picks") ─────── */}
              {recommendedProducts && recommendedProducts.length > 0 && (
                <div className="pt-8 border-t border-gray-100 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#F51F2D] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={13} className="text-yellow-500" /> Featured Gear
                      </span>
                      <h3 className="text-xl font-black text-gray-900 mt-1">
                        Our Top Picks For You
                      </h3>
                    </div>
                    <Link
                      href="/products"
                      className="text-xs font-bold text-[#1877F2] hover:underline flex items-center gap-1"
                    >
                      <span>Browse Store</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {recommendedProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md hover:border-[#F51F2D]/30 transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 relative">
                            {prod.primary_image ? (
                              <img
                                src={prod.primary_image}
                                alt={prod.name}
                                className="w-full h-full object-contain p-2 hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ShoppingCart size={24} />
                              </div>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">
                            {prod.name}
                          </h4>
                        </div>

                        <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between">
                          <div>
                            <span className="text-sm font-black text-[#17202A]">
                              ₹{prod.sale_price || prod.base_price}
                            </span>
                            {prod.sale_price && (
                              <span className="text-[10px] text-gray-400 line-through ml-1.5">
                                ₹{prod.base_price}
                              </span>
                            )}
                          </div>
                          <Link
                            href={`/products/${prod.slug}`}
                            className="px-2.5 py-1 bg-sky-50 text-[#1877F2] hover:bg-[#1877F2] hover:text-white rounded-lg text-xs font-bold transition"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Share & Navigation Footer */}
              <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Enjoyed this guide?
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Share2 size={13} />
                    <span>{copied ? 'Link Copied!' : 'Share with Friends'}</span>
                  </button>
                </div>

                <Link
                  href="/blogs"
                  className="text-xs font-bold text-[#F51F2D] hover:underline flex items-center gap-1"
                >
                  <span>&larr; Back to all articles</span>
                </Link>
              </div>
            </article>
          </main>

          {/* ── Right Column: Sidebar (30%) ────────────────────────────────── */}
          <aside className="lg:col-span-4 space-y-8">

            {/* ── 4.8 Related Blogs Card ───────────────────────────────────── */}
            {relatedBlogs && relatedBlogs.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-black text-gray-900 tracking-tight">
                    Related Blogs
                  </h3>
                  <Link
                    href="/blogs"
                    className="text-xs font-bold text-[#F51F2D] hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="space-y-4">
                  {relatedBlogs.map((rel) => (
                    <Link
                      key={rel.id || rel.slug}
                      href={`/blogs/${rel.slug}`}
                      className="group flex items-start gap-3.5 p-2 rounded-xl hover:bg-gray-50 transition"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                        {rel.featured_image ? (
                          <img
                            src={rel.featured_image}
                            alt={rel.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Tag size={16} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#F51F2D] transition-colors line-clamp-2 leading-snug">
                          {rel.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                          <span>{formatDate(rel.published_at)}</span>
                          {rel.reading_time && (
                            <>
                              <span>•</span>
                              <span>{rel.reading_time}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ── 4.9 Blog Categories Sidebar ──────────────────────────────── */}
            {categories && categories.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-black text-gray-900 tracking-tight border-b border-gray-100 pb-3">
                  Blog Categories
                </h3>

                <div className="space-y-1.5">
                  {categories.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat.slug] || Tag;
                    const isSelected = blog.category_slug === cat.slug;
                    return (
                      <Link
                        key={cat.id || cat.slug}
                        href={`/blogs?category=${cat.slug}`}
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition ${
                          isSelected
                            ? 'bg-red-50 text-[#F51F2D]'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon size={14} className={isSelected ? 'text-[#F51F2D]' : 'text-gray-400'} />
                          <span>{cat.name}</span>
                        </div>
                        {cat.article_count > 0 && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                            {cat.article_count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 4.10 Newsletter Subscription Widget ──────────────────────── */}
            <NewsletterBox source={`blog_detail_${blog.slug}`} />

          </aside>
        </div>
      </div>
    </div>
  );
}
