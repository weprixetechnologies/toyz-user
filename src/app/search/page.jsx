'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Skeleton from '@/components/Skeleton';
import api from '@/lib/api';

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function searchProducts() {
      setLoading(true);
      try {
        const res = await api.get(`/products?q=${encodeURIComponent(q)}`);
        if (res.success) {
          setProducts(res.data?.products || res.data || []);
        }
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }
    searchProducts();
  }, [q]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">
          Search Results for &ldquo;{q}&rdquo;
        </h1>
        <p className="text-slate-500 mt-1">{products.length} products found</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-72 w-full rounded-lg" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-500 font-medium">No results found matching your search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <Suspense fallback={<div className="p-8 text-center">Loading search results...</div>}>
          <SearchContent />
        </Suspense>
      </div>
    </div>
  );
}
