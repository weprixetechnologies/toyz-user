import Image from "next/image";
import Link from 'next/link';
import { ArrowRight, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductCarousel from '../components/ProductCarousel';
import HeroCarousel from '../components/HeroCarousel';

export const revalidate = 60; // ISR revalidate every 60 seconds

async function fetchHomepageData() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://72.60.219.181:98111/api/v1';

    const [catRes, bannerRes, sectionRes] = await Promise.all([
      fetch(`${API_URL}/categories`, { next: { revalidate: 60 } }).then(res => res.json()),
      fetch(`${API_URL}/banners`, { next: { revalidate: 60 } }).then(res => res.json()),
      fetch(`${API_URL}/homepage/sections`, { next: { revalidate: 60 } }).then(res => res.json())
    ]);

    let categories = catRes?.data?.categories || catRes?.data || [];
    if (categories.length === 0) {
      categories = [
        { id: 1, name: 'RC Cars', slug: 'rc-cars', icon: '🏎️' },
        { id: 2, name: 'Action Figures', slug: 'action-figures', icon: '🦸‍♂️' },
        { id: 3, name: 'Building Blocks', slug: 'building-blocks', icon: '🧱' },
        { id: 4, name: 'Dolls & Playsets', slug: 'dolls', icon: '🧸' },
        { id: 5, name: 'Educational Toys', slug: 'educational', icon: '📚' },
        { id: 6, name: 'Outdoor Play', slug: 'outdoor', icon: '⚽' },
        { id: 7, name: 'Puzzle & Games', slug: 'puzzles', icon: '🧩' },
        { id: 8, name: 'Art & Craft', slug: 'art', icon: '🎨' },
      ];
    }

    const banners = bannerRes?.data?.banners || [];
    const heroBanners = banners.filter(b => b.type === 'hero');
    const sections = sectionRes?.data || [];

    return { categories, heroBanners, sections };
  } catch (error) {
    console.error("Failed to fetch homepage data:", error);
    return { categories: [], heroBanners: [], sections: [] };
  }
}

export default async function HomePage() {
  const { categories, heroBanners, sections } = await fetchHomepageData();

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20">

      {/* Hero Carousel */}
      <HeroCarousel banners={heroBanners} />




      {/* Square Categories */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-12 border-t border-gray-100">
        <h2 className="text-3xl font-black text-[#17202A] font-serif text-center mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.slice(0, 11).map((cat, i) => (
            <Link key={cat.id || i} href={`/categories/${cat.slug}`} className="flex flex-col items-center group">
              <div className="w-full aspect-square bg-gray-50 rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center group-hover:shadow-md group-hover:border-red-200 transition-all group-hover:-translate-y-1 relative">
                {cat.image ? (
                  <Image width={800} height={800} src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <span className="text-4xl">{cat.icon || '🧸'}</span>
                )}
              </div>
              <span className="text-sm font-bold text-[#17202A] mt-3 text-center leading-tight group-hover:text-[#F51F2D]">{cat.name}</span>
            </Link>
          ))}
          <Link href="/categories" className="flex flex-col items-center group">
            <div className="w-full aspect-square bg-gray-50 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 group-hover:shadow-md group-hover:border-red-200 transition-all group-hover:-translate-y-1">
              <div className="flex flex-col gap-1 items-center">
                <div className="grid grid-cols-2 gap-1 w-8 h-8"><div className="bg-current rounded-sm"></div><div className="bg-current rounded-sm"></div><div className="bg-current rounded-sm"></div><div className="bg-current rounded-sm"></div></div>
              </div>
            </div>
            <span className="text-sm font-bold text-[#17202A] mt-3 text-center leading-tight group-hover:text-[#F51F2D]">View All</span>
          </Link>
        </div>
      </section>
      {/* DYNAMIC MASTER SECTIONS */}
      {sections.map(section => {

        if (section.type === 'custom_block') {
          return (
            <section key={section.id} className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row gap-6 w-full">
                {(section.config_data || []).map((col, idx) => (
                  <div key={idx}
                    style={section.layout_style === 'auto' ? { '--col-flex': col.aspect_ratio || 1 } : { '--col-width': `${col.width_percentage}%` }}
                    className={`w-full ${section.layout_style === 'auto' ? 'block-col-auto' : 'block-col flex-grow-0 flex-shrink-0'}`}>
                    {col.link_url ? (
                      <Link href={col.link_url} className="block w-full h-full">
                        {col.image_url && <Image width={800} height={800} src={col.image_url} className="w-full h-auto object-cover rounded-[20px] shadow-sm hover:shadow-md transition" alt={`Block ${idx}`} />}
                      </Link>
                    ) : (
                      <div className="w-full h-full">
                        {col.image_url && <Image width={800} height={800} src={col.image_url} className="w-full h-auto object-cover rounded-[20px] shadow-sm" alt={`Block ${idx}`} />}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (section.type === 'product_section') {
          return (
            <section key={section.id} className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col items-center justify-center text-center mb-10 gap-2 border-b border-gray-100 pb-6">
                <h2 className="text-3xl lg:text-4xl font-bold text-[#17202A] font-serif">{section.title}</h2>
                {section.subtitle && <p className="text-sm md:text-base text-gray-500 font-medium tracking-wide uppercase">{section.subtitle}</p>}
              </div>

              {section.layout_style === 'scrollable' ? (
                <ProductCarousel products={section.products || []} />
              ) : (
                <div className={`grid grid-cols-2 gap-4 md:gap-6 ${section.layout_style === 'grid-2' ? 'lg:grid-cols-2' :
                    section.layout_style === 'grid-3' ? 'lg:grid-cols-3' :
                      section.layout_style === 'grid-4' ? 'lg:grid-cols-4' :
                        section.layout_style === 'grid-5' ? 'lg:grid-cols-5' :
                          section.layout_style === 'grid-6' ? 'lg:grid-cols-6' :
                            'lg:grid-cols-4'
                  }`}>
                  {(section.products || []).map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                  {(!section.products || section.products.length === 0) && (
                    <div className="text-gray-400 text-sm py-4 col-span-full">No products assigned yet.</div>
                  )}
                </div>
              )}
            </section>
          );
        }

        return null;
      })}

    </div>
  );
}

// Force recompilation