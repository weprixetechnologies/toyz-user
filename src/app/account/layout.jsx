'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { 
  Package, MapPin, User, Heart, Star, Bell, Settings, LogOut, CreditCard
} from 'lucide-react';

export default function AccountLayout({ children }) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    router.push('/login');
  };

  const MENU_ITEMS = [
    { label: 'My Account', icon: User, href: '/account' },
    { label: 'Orders', icon: Package, href: '/account/orders' },
    { label: 'Wishlist', icon: Heart, href: '/account/wishlist' },
    { label: 'Addresses', icon: MapPin, href: '/account/addresses' },
    { label: 'My Reviews', icon: Star, href: '/account/reviews' },
    { label: 'Logout', icon: LogOut, href: '#', onClick: handleLogout },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* LEFT SIDEBAR (Desktop Only) */}
        <div className="hidden md:block w-64 flex-shrink-0 space-y-1">
          {MENU_ITEMS.map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={idx} 
                href={item.href}
                onClick={item.onClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 min-w-0">
          {children}
        </div>

      </div>
    </div>
  );
}
