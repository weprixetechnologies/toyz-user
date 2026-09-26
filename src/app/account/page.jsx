'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import { 
  Package, MapPin, User, Heart, Star, Bell, Settings, LogOut, 
  CreditCard, ChevronRight, Edit3, Home, Building, Plus, Lock, Shield, Trash2
} from 'lucide-react';

export default function AccountDashboardPage() {
  const { user } = useAuth();
  
  
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const [ordersRes, wishlistRes, addressesRes, reviewsRes] = await Promise.all([
          api.get('/orders', { limit: 3 }),
          api.get('/wishlist'),
          api.get('/users/addresses'),
          api.get('/user/reviews')
        ]);
        
        if (ordersRes.success) setOrders(ordersRes.data?.orders || ordersRes.data || []);
        if (wishlistRes.success) setWishlist((wishlistRes.data?.wishlist || wishlistRes.data || []).slice(0, 4));
        if (addressesRes.success) setAddresses((addressesRes.data?.addresses || addressesRes.data || []).slice(0, 2));
        if (reviewsRes.success) setReviews(reviewsRes.data?.reviews || reviewsRes.data || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    fetchDashboardData();
  }, []);


  return (
    <div className="space-y-8">
          
          {/* HERO BANNER */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
            {/* Anime Background Graphic */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none mix-blend-overlay">
              <img src="https://cly-pull-bunny.b-cdn.net/homepage/anime-bg-placeholder.jpg" className="w-full h-full object-cover object-right" alt="bg" onError={(e) => e.target.style.display = 'none'} />
            </div>

            <div className="flex items-center gap-5 relative z-10">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white/30 overflow-hidden bg-white/20 flex items-center justify-center shadow-inner flex-shrink-0">
                <span className="text-2xl font-black text-white">{user?.name?.charAt(0) || 'U'}</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black font-serif">Hello, {user?.name ? user.name.split(' ')[0] : 'Customer'}! 👋</h1>
                <p className="text-sm md:text-base text-indigo-100 mt-1 font-medium">Welcome to your ToyWorld account</p>
                <p className="text-xs text-indigo-200 mt-0.5 hidden md:block">Manage your orders, addresses, wishlist and more.</p>
              </div>
            </div>

            <Link href="/account/profile" className="relative z-10 bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-transform hover:scale-105 flex items-center gap-2 self-start md:self-auto">
              <User size={14} /> View Profile
            </Link>
          </div>

          {/* STATS ROW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex flex-col items-center justify-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center"><Package size={20}/></div>
              <div>
                <div className="text-xl font-black text-gray-900 leading-none">{orders.length || 0}</div>
                <div className="text-[10px] uppercase font-bold text-gray-500 mt-1 tracking-wider">Total Orders</div>
              </div>
            </div>
            <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 flex flex-col items-center justify-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center"><Heart size={20}/></div>
              <div>
                <div className="text-xl font-black text-gray-900 leading-none">{wishlist.length || 0}</div>
                <div className="text-[10px] uppercase font-bold text-gray-500 mt-1 tracking-wider">Wishlist Items</div>
              </div>
            </div>
            <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100 flex flex-col items-center justify-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center"><MapPin size={20}/></div>
              <div>
                <div className="text-xl font-black text-gray-900 leading-none">{addresses.length || 0}</div>
                <div className="text-[10px] uppercase font-bold text-gray-500 mt-1 tracking-wider">Saved Addresses</div>
              </div>
            </div>
            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex flex-col items-center justify-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center"><Star size={20} className="fill-amber-600"/></div>
              <div>
                <div className="text-xl font-black text-gray-900 leading-none">{reviews.length || 0}</div>
                <div className="text-[10px] uppercase font-bold text-gray-500 mt-1 tracking-wider">Reviews Given</div>
              </div>
            </div>
          </div>

          {/* RECENT ORDERS */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <h3 className="font-black text-gray-900 text-xl font-serif">Recent Orders</h3>
              <Link href="/account/orders" className="text-sm text-indigo-600 font-bold hover:underline flex items-center gap-1">View All <ChevronRight size={14}/></Link>
            </div>
            {loading ? (
              <div className="h-20 bg-gray-100 animate-pulse rounded-2xl"></div>
            ) : orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map(o => (
                  <Link key={o.id} href={`/account/orders/${o.id}`} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-indigo-500 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 text-gray-400 overflow-hidden relative">
                        {o.items && o.items.length > 0 && o.items[0].product_image ? (
                           <>
                             <img src={o.items[0].product_image} className="w-full h-full object-cover" />
                             {o.items.length > 1 && (
                               <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-tl-lg">
                                 +{o.items.length - 1}
                               </div>
                             )}
                           </>
                        ) : (
                           <Package size={24} />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">Order {o.order_number}</div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(o.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 md:gap-8">
                      <div className="hidden sm:block">
                        <StatusBadge status={o.status || o.order_status} />
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <span className="font-black text-gray-900">₹{parseFloat(o.grand_total || 0).toLocaleString('en-IN')}</span>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-indigo-600" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center text-sm text-gray-500">No recent orders found.</div>
            )}
          </div>

          {/* MY WISHLIST */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <h3 className="font-black text-gray-900 text-xl font-serif">My Wishlist</h3>
              <Link href="/account/wishlist" className="text-sm text-indigo-600 font-bold hover:underline flex items-center gap-1">View All <ChevronRight size={14}/></Link>
            </div>
            {loading ? (
              <div className="h-32 bg-gray-100 animate-pulse rounded-2xl"></div>
            ) : wishlist.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {wishlist.map(w => (
                  <Link key={w.id} href={`/products/${w.slug || w.product_id}`} className="bg-white p-3 rounded-2xl border border-gray-100 hover:shadow-md transition-all group relative block">
                    <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center z-10 text-red-500">
                      <Heart size={12} className="fill-red-500" />
                    </div>
                    <div className="aspect-square bg-gray-50 rounded-xl mb-3 overflow-hidden">
                      {w.primary_image ? <img src={w.primary_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <div className="w-full h-full flex items-center justify-center text-gray-300">Toy</div>}
                    </div>
                    <div className="font-bold text-xs text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{w.name}</div>
                    <div className="font-black text-sm text-gray-900 mt-1">₹{parseFloat(w.sale_price || w.base_price || 0).toLocaleString('en-IN')}</div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center text-sm text-gray-500">Your wishlist is empty.</div>
            )}
          </div>

          {/* SAVED ADDRESSES */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <h3 className="font-black text-gray-900 text-xl font-serif">Saved Addresses</h3>
              <Link href="/account/addresses" className="text-sm text-indigo-600 font-bold hover:underline flex items-center gap-1">Manage <ChevronRight size={14}/></Link>
            </div>
            {loading ? (
              <div className="h-24 bg-gray-100 animate-pulse rounded-2xl"></div>
            ) : addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map(addr => (
                  <div key={addr.id} className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-indigo-300 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          {addr.label?.toLowerCase() === 'office' ? <Building size={14}/> : <Home size={14}/>}
                        </div>
                        <span className="font-bold text-sm text-gray-900 capitalize">{addr.label || 'Home'}</span>
                      </div>
                      {addr.is_default === 1 && (
                        <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-2 py-1 rounded-md uppercase tracking-wide">Default</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1 mb-4">
                      <div className="font-bold text-gray-900">{addr.name}</div>
                      <div>{addr.line1} {addr.line2}</div>
                      <div>{addr.city}, {addr.state} - {addr.pin_code}</div>
                      <div>{addr.country}</div>
                      <div className="pt-1">{addr.phone}</div>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition">
                        <Edit3 size={12}/> Edit
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-red-100 text-xs font-bold text-red-500 hover:bg-red-50 transition">
                        <Trash2 size={12}/> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center text-sm text-gray-500">No saved addresses found.</div>
            )}
          </div>





    </div>
  );
}
