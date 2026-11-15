'use client';
import Image from "next/image";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroCarousel({ banners }) {
  const [activeHero, setActiveHero] = useState(0);
  const [mounted, setMounted] = useState(false);

  const nextHero = () => {
    setActiveHero((prev) => (prev + 1) % (banners.length || 1));
  };

  const prevHero = () => {
    setActiveHero((prev) => (prev - 1 + (banners.length || 1)) % (banners.length || 1));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(nextHero, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="relative rounded-3xl overflow-hidden shadow-2xl group bg-gray-100">
        {banners.map((banner, idx) => {
          if (idx !== 0 && !mounted) return null;

          let bannerLink = (banner.link_url || '').trim();
          if (bannerLink.includes('localhost')) {
            try {
              const parsed = new URL(bannerLink);
              bannerLink = parsed.pathname || '/products';
            } catch (_) {
              bannerLink = '/products';
            }
          }
          const hasLink = bannerLink.length > 0;
          const isExternal = bannerLink.startsWith('http://') || bannerLink.startsWith('https://');
          const isLcp = idx === 0;

          const imageContent = (
            <Image
              width={1920}
              height={500}
              src={banner.image_url}
              alt={banner.title || 'Promotional Banner'}
              priority={isLcp}
              loading={isLcp ? 'eager' : 'lazy'}
              fetchPriority={isLcp ? 'high' : 'auto'}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1440px"
              className="w-full h-auto block"
            />
          );

          return (
            <div
              key={banner.id}
              className={`w-full transition-opacity duration-1000 ${
                idx === activeHero ? 'relative opacity-100 z-10' : 'absolute top-0 left-0 opacity-0 z-0 pointer-events-none'
              }`}
            >
              {hasLink ? (
                isExternal ? (
                  <a
                    href={bannerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={banner.title || 'Promotional Banner'}
                    className="block w-full h-full"
                  >
                    {imageContent}
                  </a>
                ) : (
                  <Link
                    href={bannerLink}
                    prefetch={false}
                    aria-label={banner.title || 'Promotional Banner'}
                    className="block w-full h-full"
                  >
                    {imageContent}
                  </Link>
                )
              ) : (
                imageContent
              )}
            </div>
          );
        })}

        {banners.length > 1 && (
          <>
            <button
              onClick={prevHero}
              aria-label="Previous banner"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white z-20 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextHero}
              aria-label="Next banner"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white z-20 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
            >
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveHero(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className="p-1 focus:outline-none"
                >
                  <span
                    className={`block h-2 rounded-full transition-all duration-300 ${
                      idx === activeHero ? 'w-8 bg-[#F51F2D]' : 'w-2 bg-white/50 hover:bg-white/80'
                    }`}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
