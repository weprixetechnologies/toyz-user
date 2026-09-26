'use client';

import Link from 'next/link';
import ProductCard from '../../../components/ProductCard';
import { GridSkeleton } from '../../../components/Skeleton';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../../context/WishlistContext';
import { useEffect } from 'react';

export default function WishlistPage() {
  const { wishlist, loading, fetchWishlist } = useWishlist();

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
          <Heart className="text-red-500" fill="currentColor" size={28} /> My Saved Wishlist
        </h1>
        <p className="text-sm text-gray-500">Products saved for later purchases</p>
      </div>

      {loading ? (
        <GridSkeleton count={4} />
      ) : wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <ProductCard key={item.id || item.product_id} product={item.product || item} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 space-y-3">
          <Heart size={36} className="text-gray-300 mx-auto" />
          <p className="text-gray-500 text-sm">Your wishlist is currently empty.</p>
          <Link href="/products" className="inline-block bg-sky-600 text-white font-bold text-xs px-5 py-2.5 rounded-lg hover:bg-sky-700">
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
}
