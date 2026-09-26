'use client';
import Image from "next/image";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { CarFront, Puzzle, Baby } from 'lucide-react';

export default function AllCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/categories');
        if (res.success) setCategories(res.data?.categories || res.data || []);
      } catch (err) {}
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center font-bold text-xl">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black text-[#17202A] mb-8 text-center">All Categories</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/categories/${cat.slug}`} className="bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-500/30 rounded-2xl p-4 text-center transition-all group flex flex-col items-center">
            <div className="w-full aspect-square bg-[#F3F4F6] group-hover:bg-[#FFF0D6] rounded-xl flex items-center justify-center mb-4 overflow-hidden transition-colors">
              {cat.image ? (
                <Image width={800} height={800} src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <span className="text-4xl font-black text-[#17202A] group-hover:text-red-500">
                  {cat.name.charAt(0)}
                </span>
              )}
            </div>
            <span className="font-bold text-[#17202A] group-hover:text-red-500">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
