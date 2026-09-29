import Link from 'next/link';
import { Gift, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#17202A] text-white pt-16 pb-8 border-t-[8px] border-[#F51F2D] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Col */}
          <div className="space-y-6">
            <Link href="/" className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <Gift size={32} className="text-[#F51F2D]" /> ToyWorld
            </Link>
            <p className="text-[#E7EBEF] text-sm font-medium leading-relaxed">
              Bringing joy to kids of all ages with premium toys, next-level RC cars, and educational games. Playtime never stops!
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#F51F2D] transition-colors"><Facebook size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#F51F2D] transition-colors"><Twitter size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#F51F2D] transition-colors"><Instagram size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#F51F2D] transition-colors"><Youtube size={18} /></a>
            </div>
          </div>

          {/* Shop Col */}
          <div>
            <h4 className="text-lg font-black mb-6 text-white uppercase tracking-wider">Shop</h4>
            <ul className="space-y-4 text-sm font-medium text-[#E7EBEF]">
              <li><Link href="/categories/rc-cars" className="hover:text-[#F51F2D] transition-colors">RC Cars & Trucks</Link></li>
              <li><Link href="/categories/action-figures" className="hover:text-[#F51F2D] transition-colors">Action Figures</Link></li>
              <li><Link href="/categories/puzzles" className="hover:text-[#F51F2D] transition-colors">Puzzles & Games</Link></li>
              <li><Link href="/categories/educational" className="hover:text-[#F51F2D] transition-colors">Educational Toys</Link></li>
              <li><Link href="/categories/toddler" className="hover:text-[#F51F2D] transition-colors">Baby & Toddler</Link></li>
              <li><Link href="/account/apply-reseller" className="hover:text-[#F51F2D] transition-colors text-amber-400">Apply as Reseller</Link></li>
            </ul>
          </div>

          {/* Customer Care Col */}
          <div>
            <h4 className="text-lg font-black mb-6 text-white uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-4 text-sm font-medium text-[#E7EBEF]">
              <li><Link href="/account/orders" className="hover:text-[#F51F2D] transition-colors">Track Your Order</Link></li>
              <li><Link href="/shipping-returns" className="hover:text-[#F51F2D] transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/faq" className="hover:text-[#F51F2D] transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-[#F51F2D] transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="text-lg font-black mb-6 text-white uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-4 text-sm font-medium text-[#E7EBEF]">
              <li>Email: hello@toyworld.com</li>
              <li>Phone: +1 (800) TOY-WORLD</li>
              <li>Address: 123 Playtime Avenue, Fun City, TX 75001</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-[#5F6872]">
            © {new Date().getFullYear()} ToyWorld Inc. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm font-medium text-[#5F6872]">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
