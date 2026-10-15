'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ShoppingCart, Heart, User, Search, Menu, X, Gift, Truck, Star, Phone, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import Image from 'next/image';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isReseller } = useAuth();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [headerData, setHeaderData] = useState({
    logo_url: '',
    logo_text: '',
    logo_tagline: '',
    logo_width: 200,
    logo_width_mobile: 150,
    show_tagline: false,
    announcement_bar: {
      enabled: true,
      shipping_text: 'Free Shipping on Orders Above ₹999',
      discount_text: 'Get 10% OFF on First Order | Use Code: TOY10',
      returns_text: 'Easy Returns | 100% Original Products'
    }
  });
  const [loadingLogo, setLoadingLogo] = useState(true);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    try {
      const cached = localStorage.getItem('ecom_header_config') || sessionStorage.getItem('ecom_header_config');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          setHeaderData(prev => ({ ...prev, ...parsed }));
          if (parsed.logo_url) {
            setLoadingLogo(false);
          }
        }
      }
    } catch (_) {}

    async function loadHeader() {
      try {
        let res = await api.get('/header');
        if (!res.success || !res.data) {
          const setRes = await api.get('/settings');
          if (setRes.success && setRes.data?.settings?.header_settings) {
            const raw = setRes.data.settings.header_settings;
            res = { success: true, data: typeof raw === 'string' ? JSON.parse(raw) : raw };
          }
        }
        if (isMounted && res.success && res.data) {
          setHeaderData(prev => ({
            ...prev,
            ...res.data,
            announcement_bar: {
              ...prev.announcement_bar,
              ...(res.data.announcement_bar || {})
            }
          }));
          try {
            localStorage.setItem('ecom_header_config', JSON.stringify(res.data));
            sessionStorage.setItem('ecom_header_config', JSON.stringify(res.data));
          } catch (_) {}
        }
      } catch (_) {
      } finally {
        if (isMounted) {
          setLoadingLogo(false);
        }
      }
    }
    loadHeader();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const res = await api.get('/products', { search: searchQuery.trim(), limit: 5 });
      if (res.success) {
        setSearchResults(res.data?.products || res.data || []);
      }
      setIsSearching(false);
    };

    const timer = setTimeout(() => fetchResults(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const desktopWidth = Math.max(200, Number(headerData.logo_width) || 200);
  const mobileWidth = Number(headerData.logo_width_mobile) || Math.min(160, Math.round(desktopWidth * 0.75));

  return (
    <header className="sticky top-0 z-50 bg-white font-sans border-b border-gray-100 shadow-sm">
      {/* Top Announcement Bar */}
      {headerData.announcement_bar?.enabled !== false && (
        <div className="bg-[#071C2B] text-white text-[11px] font-medium py-2 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">🚚</span>
              <span>{headerData.announcement_bar?.shipping_text || 'Free Shipping on Orders Above ₹999'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-pink-400">🎁</span>
              <span>{headerData.announcement_bar?.discount_text || 'Get 10% OFF on First Order | Use Code: TOY10'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span>{headerData.announcement_bar?.returns_text || 'Easy Returns | 100% Original Products'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Middle Bar */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-6">

        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-900" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Brand Logo */}
        <Link href="/" className="flex flex-col flex-shrink-0" aria-label="Home">
          {loadingLogo ? (
            /* Skeleton Loader */
            <div
              className="h-9 sm:h-11 bg-gray-200/80 animate-pulse rounded-lg flex items-center justify-center flex-shrink-0 w-[var(--logo-w-mobile)] md:w-[var(--logo-w-desktop)] md:min-w-[200px]"
              style={{
                '--logo-w-mobile': `${mobileWidth}px`,
                '--logo-w-desktop': `${desktopWidth}px`
              }}
              aria-label="Loading logo"
            />
          ) : headerData.logo_url && !logoError ? (
            <div className="flex items-center flex-shrink-0">
              <img
                src={headerData.logo_url}
                alt={headerData.logo_text || 'Store Logo'}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                onError={() => setLogoError(true)}
                className="h-auto object-contain block max-w-full w-[var(--logo-w-mobile)] md:w-[var(--logo-w-desktop)] md:min-w-[200px] transition-all"
                style={{
                  '--logo-w-mobile': `${mobileWidth}px`,
                  '--logo-w-desktop': `${desktopWidth}px`
                }}
              />
            </div>
          ) : headerData.logo_text ? (
            <div className="flex flex-col flex-shrink-0">
              <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none">
                {headerData.logo_text}
              </div>
              {headerData.show_tagline !== false && headerData.logo_tagline && (
                <div className="text-[9px] font-bold text-gray-500 tracking-widest mt-0.5 uppercase">
                  {headerData.logo_tagline}
                </div>
              )}
            </div>
          ) : (
            <div
              className="h-9 sm:h-11 bg-gray-100 rounded-lg flex-shrink-0 w-[var(--logo-w-mobile)] md:w-[var(--logo-w-desktop)] md:min-w-[200px]"
              style={{
                '--logo-w-mobile': `${mobileWidth}px`,
                '--logo-w-desktop': `${desktopWidth}px`
              }}
            />
          )}
        </Link>

        {/* Search Bar */}
        <div ref={searchRef} className="flex-1 max-w-2xl hidden md:block relative">
          <form onSubmit={handleSearch} className="flex w-full border border-gray-200 rounded-lg overflow-hidden focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-gray-100 transition-all shadow-sm">
            <input
              type="text"
              placeholder="Search for toys, RC cars, brands..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full px-4 py-2.5 text-sm focus:outline-none text-gray-700"
            />
            <button type="submit" className="bg-[#F51F2D] text-white px-6 hover:bg-[#d41828] transition flex items-center justify-center">
              <Search size={20} />
            </button>
          </form>
          {showSearchDropdown && searchQuery.trim().length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-100 rounded-lg shadow-lg z-50 overflow-hidden max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-sm text-gray-500 text-center">Searching...</div>
              ) : searchResults.length > 0 ? (
                <div>
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => {
                        setShowSearchDropdown(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-4 p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                    >
                      <div className="w-12 h-12 relative flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                        {product.primary_image ? (
                          <Image src={product.primary_image} alt={product.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingCart size={16} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate">{product.name}</div>
                        <div className="text-xs text-gray-500">₹{product.sale_price || product.base_price}</div>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={handleSearch}
                    className="w-full p-3 text-sm text-center text-[#F51F2D] font-bold hover:bg-gray-50"
                  >
                    View all results
                  </button>
                </div>
              ) : (
                <div className="p-4 text-sm text-gray-500 text-center">No products found</div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Icons */}
        <div className="flex items-center gap-6 md:gap-8 ml-auto">
          {user ? (
            <div className="hidden md:flex flex-col items-end group relative cursor-pointer">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <User size={22} className="text-gray-700" />
                <div className="flex flex-col items-start leading-none gap-1">
                  <span className="text-xs text-gray-900 font-bold">{user.name || 'Account'}</span>
                  <span className="text-[10px] text-gray-500 font-medium">My Account</span>
                </div>
              </div>
              <div className="absolute top-full right-0 pt-2 w-48 hidden group-hover:block z-50">
                <div className="bg-white border border-gray-100 rounded-lg shadow-lg py-2">
                  <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Dashboard</Link>
                  <Link href="/account/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Orders</Link>
                  {user?.role === 'admin' && (
                    <Link href="http://72.60.219.181:3001" className="block px-4 py-2 text-sm text-sky-700 font-bold hover:bg-sky-50">Admin Panel</Link>
                  )}
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-[#F51F2D] font-bold hover:bg-gray-50">Logout</button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login" className="hidden md:flex items-center gap-2">
              <User size={24} className="text-gray-700" />
              <div className="flex flex-col leading-none gap-0.5">
                <span className="text-[11px] font-bold text-gray-900">Login / Sign Up</span>
                <span className="text-[10px] text-gray-500 font-medium">My Account</span>
              </div>
            </Link>
          )}

          <Link href="/account/wishlist" className="flex flex-col items-center gap-1 group relative">
            <div className="relative">
              <Heart size={24} className="text-gray-700 group-hover:text-[#F51F2D] transition" />
              {wishlist?.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#F51F2D] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {wishlist.length}
                </span>
              )}
            </div>
            <span className="hidden md:block text-[10px] font-bold text-gray-600">Wishlist</span>
          </Link>

          <Link href="/cart" className="flex flex-col items-center gap-1 group relative">
            <div className="relative">
              <ShoppingCart size={24} className="text-gray-700 group-hover:text-[#F51F2D] transition" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#F51F2D] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden md:block text-[10px] font-bold text-gray-600">Cart</span>
          </Link>
        </div>
      </div>

      {/* Bottom Category Bar */}
      <div className="hidden md:block border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 py-2.5">
          <Link href="/" className={`text-sm font-bold transition ${pathname === '/' ? 'text-[#F51F2D]' : 'text-gray-800 hover:text-[#F51F2D]'}`}>Home</Link>
          <Link href="/products" className={`text-sm font-bold transition ${pathname?.startsWith('/products') ? 'text-[#F51F2D]' : 'text-gray-800 hover:text-[#F51F2D]'}`}>Shop</Link>
          <Link href="/categories" className={`text-sm font-bold transition ${pathname?.startsWith('/categories') ? 'text-[#F51F2D]' : 'text-gray-800 hover:text-[#F51F2D]'}`}>Categories</Link>
          <Link href="/offers" className={`text-sm font-bold transition ${pathname?.startsWith('/offers') ? 'text-[#F51F2D]' : 'text-gray-800 hover:text-[#F51F2D]'}`}>Offers</Link>
          <Link href="/blogs" className={`text-sm font-bold transition ${pathname?.startsWith('/blogs') ? 'text-[#F51F2D]' : 'text-gray-800 hover:text-[#F51F2D]'}`}>Blogs</Link>

          <div className="ml-auto flex items-center gap-6">
            {isReseller && (
              <Link href="/reseller" className="relative flex items-center gap-1.5 text-sm font-black text-emerald-800 px-4 py-1.5 rounded-full overflow-hidden group shadow-sm hover:shadow-md transition-all hover:scale-105">
                {/* Moving Gradient Border Layer */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 animate-moving-gradient"></div>

                {/* 20% Opacity Fill Layer */}
                <div className="absolute inset-[2px] bg-white rounded-full"></div>
                <div className="absolute inset-[2px] bg-emerald-500/20 rounded-full"></div>

                <Gift size={14} className="relative z-10 text-emerald-600 group-hover:rotate-12 transition-transform" />
                <span className="relative z-10 tracking-wide uppercase text-[11px]">Discount Panel</span>
              </Link>
            )}
            <a href="tel:+919999999999" className="flex items-center gap-1.5 text-sm font-bold text-gray-800 hover:text-[#F51F2D] transition">
              <Phone size={14} className="text-[#1877F2]" />
              Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white p-4 space-y-4">
          <div className="relative">
            <form onSubmit={handleSearch} className="flex w-full border border-gray-200 rounded-lg overflow-hidden">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                className="flex-1 px-4 py-2 text-sm focus:outline-none"
              />
              <button type="submit" className="bg-[#F51F2D] text-white px-4 flex items-center justify-center">
                <Search size={18} />
              </button>
            </form>
            {showSearchDropdown && searchQuery.trim().length > 0 && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-100 rounded-lg shadow-lg z-50 overflow-hidden max-h-64 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-sm text-gray-500 text-center">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div>
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                          setMenuOpen(false);
                        }}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                      >
                        <div className="w-10 h-10 relative flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                          {product.primary_image ? (
                            <Image src={product.primary_image} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ShoppingCart size={12} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-800 truncate">{product.name}</div>
                          <div className="text-xs text-gray-500">₹{product.sale_price || product.base_price}</div>
                        </div>
                      </Link>
                    ))}
                    <button
                      onClick={(e) => {
                        handleSearch(e);
                        setMenuOpen(false);
                      }}
                      className="w-full p-3 text-sm text-center text-[#F51F2D] font-bold hover:bg-gray-50"
                    >
                      View all results
                    </button>
                  </div>
                ) : (
                  <div className="p-4 text-sm text-gray-500 text-center">No products found</div>
                )}
              </div>
            )}
          </div>
          <nav className="flex flex-col gap-3 font-bold text-gray-800">
            <Link href="/" onClick={() => setMenuOpen(false)} className={pathname === '/' ? 'text-[#F51F2D]' : 'hover:text-[#F51F2D]'}>Home</Link>
            <Link href="/products" onClick={() => setMenuOpen(false)} className={pathname?.startsWith('/products') ? 'text-[#F51F2D]' : 'hover:text-[#F51F2D]'}>Shop</Link>
            <Link href="/categories" onClick={() => setMenuOpen(false)} className={pathname?.startsWith('/categories') ? 'text-[#F51F2D]' : 'hover:text-[#F51F2D]'}>Categories</Link>
            <Link href="/offers" onClick={() => setMenuOpen(false)} className={pathname?.startsWith('/offers') ? 'text-[#F51F2D]' : 'hover:text-[#F51F2D]'}>Offers</Link>
            <Link href="/blogs" onClick={() => setMenuOpen(false)} className={pathname?.startsWith('/blogs') ? 'text-[#F51F2D]' : 'hover:text-[#F51F2D]'}>Blogs</Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)} className={pathname?.startsWith('/contact') ? 'text-[#F51F2D]' : 'hover:text-[#F51F2D]'}>Contact Us</Link>
          </nav>
        </div>
      )}

    </header>
  );
}
