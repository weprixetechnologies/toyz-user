'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { GridSkeleton } from '@/components/Skeleton';
import { Briefcase } from 'lucide-react';

export default function ResellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResellerCatalog() {
      setLoading(true);
      const res = await api.get('/reseller/products');
      if (res.success) {
        setProducts(res.data?.products || res.data || []);
      }
      setLoading(false);
    }
    loadResellerCatalog();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full inline-flex items-center gap-1 mb-2">
          <Briefcase size={12} /> B2B Wholesale Pricing
        </span>
        <h1 className="text-3xl font-black text-gray-900">Reseller Wholesale Catalog</h1>
        <p className="text-sm text-gray-500">Products with special reseller rates, bulk volume tiers, and MOQ requirements</p>
      </div>

      {loading ? (
        <GridSkeleton count={8} />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-200">
          <p className="text-gray-500 text-sm">No wholesale products configured.</p>
        </div>
      )}
    </div>
  );
}
