'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Gift } from 'lucide-react';
import { api } from '../lib/api';
import ProductCard from './ProductCard';

export default function YouMightAlsoLike({ excludeIds = [] }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/products', { limit: 10, sort: 'created_at_desc' }).then((res) => {
      if (res.success) {
        const excluded = new Set(excludeIds.map(Number));
        const list = res.data?.products || res.data || [];
        setProducts(list.filter(product => !excluded.has(Number(product.id))).slice(0, 5));
      }
    });
  }, [JSON.stringify(excludeIds)]);

  if (!products.length) return null;

  return (
    <section className="bg-blue-50/60 rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><Gift className="text-violet-600" size={22} /> You Might Also Like</h2>
        <Link href="/products" className="text-sm font-black text-sky-600 flex items-center gap-1">See All <ArrowRight size={16} /></Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {products.map(product => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
