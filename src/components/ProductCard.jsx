'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ShoppingCart, CheckCircle, Heart, Star } from 'lucide-react';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const { isReseller } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);

  // ── Prices ──────────────────────────────────────────────────────────────────
  const basePrice     = parseFloat(product.base_price  || 0);
  const salePrice     = product.sale_price ? parseFloat(product.sale_price) : null;
  const resellerPrice = isReseller && product.reseller_price ? parseFloat(product.reseller_price) : null;

  // The price displayed as the main (bold) figure
  const displayPrice  = resellerPrice ?? salePrice ?? basePrice;

  // The price that gets struck through
  // • Reseller view  → cross customer price (salePrice or basePrice)
  // • Customer view  → cross basePrice only when salePrice is lower
  const crossPrice    = resellerPrice !== null
    ? (salePrice ?? basePrice)
    : basePrice;

  // Discount % against the cross-price
  const discount = crossPrice > displayPrice
    ? Math.round(((crossPrice - displayPrice) / crossPrice) * 100)
    : 0;

  const moq = isReseller && product.moq ? product.moq : 1;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await addToCart(product.id, moq);
    if (res?.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-[16px] border border-[#E7EBEF] overflow-hidden hover:shadow-xl hover:border-[#F51F2D]/30 transition-all duration-300 group flex flex-col justify-between relative font-sans h-full w-full">

      {/* ── Top-left custom badge stack ──────────────────────────────────────── */}
      {product.badges && product.badges.length > 0 && (
        <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1 pointer-events-none">
          {product.badges.map(b => (
            <span
              key={b.id}
              className="text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm uppercase tracking-wide"
              style={{ backgroundColor: b.bg_color || '#ef4444', color: b.text_color || '#ffffff' }}
            >
              {b.badge_text}
            </span>
          ))}
        </div>
      )}

      {/* ── Wishlist button ──────────────────────────────────────────────────── */}
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
        className={`absolute top-3 right-3 p-1.5 rounded-full transition-colors z-10 shadow-sm ${
          isInWishlist(product.id) 
            ? 'bg-[#F51F2D] text-white hover:bg-[#D41825]' 
            : 'bg-white text-[#5F6872] hover:text-[#F51F2D] hover:bg-[#FFE0EA]'
        }`}
      >
        <Heart size={18} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
      </button>

      {/* ── Product image ────────────────────────────────────────────────────── */}
      <Link href={`/products/${product.slug || product.id}`} className="block relative">
        <div className="aspect-square bg-[#FFF0D6]/20 flex items-center justify-center overflow-hidden">
          {product.primary_image || product.image || product.images?.[0]?.url ? (
            <Image
              width={800}
              height={800}
              src={product.primary_image || product.image || product.images?.[0]?.url}
              alt={product.name}
              className="object-cover h-full w-full group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="text-[#5F6872] font-medium text-sm">Toy Image</div>
          )}
        </div>
      </Link>

      {/* ── Card body ────────────────────────────────────────────────────────── */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] text-[#5F6872] font-bold uppercase tracking-wider bg-[#F3F4F6] px-2 py-0.5 rounded-md">
            {product.category_name || 'Toys'}
          </span>
          {/* Product name — always clamped to 2 lines */}
          <Link
            href={`/products/${product.slug || product.id}`}
            className="block font-bold text-[#17202A] hover:text-[#F51F2D] mt-2 text-sm md:text-base leading-tight overflow-hidden"
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.5rem' }}
          >
            {product.name}
          </Link>
        </div>

        <div className="mt-2">
          {/* Star rating */}
          <div className="flex items-center gap-1 mt-1 mb-3">
            {[1, 2, 3, 4, 5].map(s => {
              const rating = parseFloat(product.avg_rating) || 0;
              const filled = s <= Math.floor(rating);
              const half   = !filled && s === Math.ceil(rating) && rating % 1 >= 0.5;
              return (
                <Star
                  key={s}
                  size={12}
                  className={filled || half ? 'fill-[#FFB800] text-[#FFB800]' : 'fill-[#E7EBEF] text-[#E7EBEF]'}
                />
              );
            })}
            {product.review_count > 0
              ? <span className="text-[11px] text-[#8792A2] ml-1">({product.review_count})</span>
              : <span className="text-[11px] text-[#8792A2] ml-1">No reviews</span>
            }
          </div>

          {/* ── Price row ─────────────────────────────────────────────────────── */}
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col gap-0.5">

              {/* Main price — big and bold */}
              <span className={`text-xl font-black leading-none ${isReseller ? 'text-[#E05A00]' : 'text-[#F51F2D]'}`}>
                &#8377;{displayPrice.toLocaleString('en-IN')}
              </span>

              {/* Strikethrough price + discount badge BESIDE it */}
              {crossPrice > displayPrice && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-[#8792A2] line-through">
                    &#8377;{crossPrice.toLocaleString('en-IN')}
                  </span>
                  {discount > 0 && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide leading-tight ${
                        isReseller
                          ? 'bg-[#FFF0E5] text-[#E05A00] border border-[#F7C99A]'
                          : 'bg-[#FFE0EA] text-[#E71927]'
                      }`}
                    >
                      {discount}% {isReseller ? 'off' : 'OFF'}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Add to cart button */}
            {product.product_type === 'variable' ? (
              <Link
                href={`/products/${product.slug || product.id}`}
                className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 bg-[#17202A] hover:bg-[#F51F2D] text-white shadow-sm hover:shadow-md"
                title="Select Options"
              >
                <ShoppingCart size={16} />
              </Link>
            ) : (
              <button
                onClick={handleAddToCart}
                className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  added
                    ? 'bg-[#18A957] text-white shadow-md'
                    : 'bg-[#F51F2D] hover:bg-[#D41825] text-white shadow-sm hover:shadow-md'
                }`}
              >
                {added ? <CheckCircle size={16} /> : <ShoppingCart size={16} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
