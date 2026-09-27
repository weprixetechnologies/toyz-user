'use client';
import Image from "next/image";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { api, tokenStore } from '../../lib/api';
import { Trash2, ShoppingBag, ArrowRight, Tag, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AuthModal from '../../components/AuthModal';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, clearCart, fetchCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!tokenStore.getAccess());
  }, []);

  const onAuthSuccess = async () => {
    setAuthModalOpen(false);
    setIsLoggedIn(true);
    try {
      await api.post('/cart/merge', { guestToken: localStorage.getItem('guest_token') });
      if (fetchCart) await fetchCart();
    } catch (err) {
      console.error('Failed to merge cart after login', err);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = await api.post('/cart/coupon', { code: couponCode.trim() });
    if (res.success) {
      setAppliedCoupon(couponCode.trim());
      setCouponMsg('Coupon applied successfully!');
    } else {
      setCouponMsg(res.message || 'Invalid coupon code');
    }
  };

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || items.reduce((sum, i) => sum + (parseFloat(i.price || i.unit_price || 0) * (i.qty || 1)), 0);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your Cart is Empty</h2>
        <p className="text-sm text-gray-500">Looks like you haven't added any products to your shopping cart yet.</p>
        <Link href="/products" className="inline-flex items-center gap-2 bg-sky-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-sky-700 transition">
          Browse Products <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-3xl font-black text-gray-900">Shopping Cart ({items.length} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
            {items.map((item) => {
              const itemPrice = parseFloat(item.price || item.unit_price || item.sale_price || item.base_price || 0);
              const lineTotal = itemPrice * (item.qty || 1);

              return (
                <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.image ? <Image width={800} height={800} src={item.image} alt={item.product_name} className="object-cover h-full w-full rounded-lg" /> : <ShoppingBag className="text-gray-400" size={24} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.product_name || item.name}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-400">Unit Price: ₹{itemPrice.toLocaleString('en-IN')}</p>
                        {item.original_price && item.discount_applied > 0 && (
                          <>
                            <span className="text-xs text-gray-400 line-through">₹{parseFloat(item.original_price).toLocaleString('en-IN')}</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                              {Math.round((item.discount_applied / item.original_price) * 100)}% OFF
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, (item.qty || 1) - 1))}
                        className="px-2.5 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-bold">{item.qty || 1}</span>
                      <button
                        onClick={() => updateQuantity(item.id, (item.qty || 1) + 1)}
                        className="px-2.5 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <span className="font-bold text-slate-900 text-sm">₹{lineTotal.toLocaleString('en-IN')}</span>
                    </div>

                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button onClick={clearCart} className="text-xs text-red-600 font-semibold hover:underline">
              Clear Shopping Cart
            </button>
            <Link href="/products" className="text-xs text-sky-600 font-semibold hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary & Coupon Sidebar */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 h-fit space-y-6">
          <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">Order Summary</h3>

          {/* Coupon Input */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
              <Tag size={12} /> Apply Promo / Coupon Code:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="PROMO10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg text-xs uppercase focus:outline-none focus:border-sky-500"
              />
              <button type="submit" className="bg-slate-900 text-white font-bold text-xs px-3 py-2 rounded-lg hover:bg-sky-600">
                Apply
              </button>
            </div>
            {couponMsg && (
              <p className={`text-xs ${appliedCoupon ? 'text-emerald-600 font-semibold' : 'text-red-600'}`}>{couponMsg}</p>
            )}
          </form>

          {/* Calculation */}
          <div className="space-y-2 text-sm pt-4 border-t border-gray-100">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated Shipping</span>
              <span className="text-emerald-600 font-semibold">Calculated at Checkout</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
              <span>Total Amount</span>
              <span className="text-sky-600">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {isLoggedIn ? (
            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-sky-600 text-white font-bold py-3.5 rounded-xl hover:bg-sky-700 transition flex items-center justify-center gap-2 shadow-lg"
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-lg"
            >
              Login to Checkout <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onSuccess={onAuthSuccess} 
      />
    </div>
  );
}
