'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductCarousel({ products }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [products]);

  const scrollByAmount = (amount) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) {
    return <div className="text-gray-400 text-sm py-4">No products assigned yet.</div>;
  }


  // Mouse Drag to Scroll
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const handleMouseLeave = () => {
    setIsDragging(false);
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="relative group">
      {/* Scrollable Container */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex overflow-x-auto gap-6 pb-4 scrollbar-hide items-stretch ${isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab snap-x'}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map(p => (
          <div key={p.id} className="w-[240px] md:w-[280px] flex-shrink-0 snap-start">
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {canScrollLeft && (
        <button 
          onClick={() => scrollByAmount(-300)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-red-500 hover:scale-110 transition-all z-10 opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      
      {canScrollRight && (
        <button 
          onClick={() => scrollByAmount(300)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-red-500 hover:scale-110 transition-all z-10 opacity-0 group-hover:opacity-100"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Inject a tiny style tag to hide webkit scrollbar just in case scrollbar-hide isn't enough */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
