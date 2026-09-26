'use client';
import Image from "next/image";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Skeleton from '@/components/Skeleton';
import api from '@/lib/api';

export default function BrandProductsPage() {
  const { slug } = useParams();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadBrandData() {
      setLoading(true);
      try {
        const brandRes = await api.get(`/brands/${slug}`);
        if (brandRes.success && brandRes.data?.brand) {
          setBrand(brandRes.data.brand);
          const prodRes = await api.get(`/products?brand_id=${brandRes.data.brand.id}`);
          if (prodRes.success) {
            setProducts(prodRes.data?.products || prodRes.data || []);
          }
        } else {
          setError('Brand not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load brand products');
      } finally {
        setLoading(false);
      }
    }
    if (slug) loadBrandData();
  }, [slug]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <main className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div>
              <div className="h-12 bg-white rounded-lg shadow-sm mb-6 animate-pulse p-4"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-72 w-full rounded-lg" />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-6 rounded-lg text-center font-medium">
              {error}
            </div>
          ) : (
            <div>
              <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-slate-200 flex items-center gap-4">
                {brand?.logo_url && (
                  <Image width={800} height={800} src={brand.logo_url} alt={brand.name} className="w-16 h-16 object-contain rounded" />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 mb-1">{brand?.name}</h1>
                  <p className="text-slate-600">{brand?.description || 'Browse items from this brand'}</p>
                </div>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
                  <p className="text-slate-500 font-medium">No products found for this brand.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
