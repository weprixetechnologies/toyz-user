'use client';
import Image from "next/image";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { api, tokenStore } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import AvailableOffers from '../../components/AvailableOffers';
import YouMightAlsoLike from '../../components/YouMightAlsoLike';
import { Trash2, ShoppingBag, ArrowRight, Tag, MapPin, Truck, ArrowLeft, Package, Star, Ticket, Copy, Info, Lock, ShieldCheck, RefreshCcw, CheckCircle2, HeadphonesIcon, ShoppingCart, Gift } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AuthModal from '../../components/AuthModal';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, clearCart, fetchCart } = useCart();
  const { isReseller } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedOfferIds, setSelectedOfferIds] = useState([]);
  const [offerEvaluation, setOfferEvaluation] = useState(null);
  const [pincode, setPincode] = useState('');
  const [shippingQuote, setShippingQuote] = useState(null);
  const [pincodeMessage, setPincodeMessage] = useState('');
  const [checkingPincode, setCheckingPincode] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!tokenStore.getAccess());
    try {
      const saved = JSON.parse(localStorage.getItem('selected_offer_ids') || '[]');
      setSelectedOfferIds(Array.isArray(saved) ? saved.map(String) : []);
    } catch (e) {
      setSelectedOfferIds([]);
    }
  }, []);

  const onAuthSuccess = async () => {
    setAuthModalOpen(false);
    setIsLoggedIn(true);
    try {
      await api.post('/cart/merge', { guestToken: localStorage.getItem('guest_token') });
      if (fetchCart) await fetchCart();
      router.push('/checkout');
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
  const subtotal = cart?.summary?.subtotal || items.reduce((sum, i) => sum + (parseFloat(i.price || i.unit_price || 0) * (i.qty || 1)), 0);

  useEffect(() => {
    if (subtotal <= 0) return;
    const ids = isReseller ? [] : selectedOfferIds;
    api.post('/offers/validate', { subtotal, selected_offer_ids: ids }).then((res) => {
      if (res.success) setOfferEvaluation(res.data);
    });
  }, [subtotal, selectedOfferIds, isReseller]);

  const toggleOffer = (id) => {
    if (isReseller) return;
    setSelectedOfferIds((current) => {
      const next = current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
      localStorage.setItem('selected_offer_ids', JSON.stringify(next));
      return next;
    });
  };

  const displayedSubtotal = offerEvaluation?.final_subtotal ?? subtotal;

  useEffect(() => {
    if (displayedSubtotal <= 0 || (!isLoggedIn && !pincode)) return;
    let active = true;
    api.get('/cart/shipping-options', {
      pin_code: pincode || undefined,
      subtotal: displayedSubtotal
    }).then((res) => {
      if (!active || !res.success) return;
      const options = res.data?.options || res.data || [];
      setShippingQuote(options[0] || null);
    });
    return () => { active = false; };
  }, [displayedSubtotal, isLoggedIn, pincode]);

  const checkPincode = async (event) => {
    event?.preventDefault();
    if (!/^\d{6}$/.test(pincode.trim())) {
      setPincodeMessage('Enter a valid 6-digit pincode.');
      return;
    }
    setCheckingPincode(true);
    const res = await api.get('/cart/shipping-options', { pin_code: pincode.trim(), subtotal: displayedSubtotal });
    if (res.success) {
      const options = res.data?.options || res.data || [];
      setShippingQuote(options[0] || null);
      setPincodeMessage(options[0]?.source === 'pincode' ? 'Pincode shipping rate applied.' : 'Pincode not configured. Fallback shipping rate applied.');
    } else {
      setShippingQuote(null);
      setPincodeMessage(res.message || 'Unable to check this pincode.');
    }
    setCheckingPincode(false);
  };

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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black text-slate-900">
            <div className="bg-red-50 p-2 rounded-xl text-red-500">
              <ShoppingCart size={32} />
            </div>
            Shopping Cart ({items.length} items)
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Review your items and proceed to checkout.</p>
        </div>
        <Link href="/products" className="bg-sky-50 text-sky-600 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-sky-100 transition">
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
            {items.map((item) => {
              const itemPrice = parseFloat(item.price || item.unit_price || item.sale_price || item.base_price || 0);
              const lineTotal = itemPrice * (item.qty || 1);

              return (
                <div key={item.id} className="p-4 flex items-center gap-4">
                  <div className="flex items-center">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500 border-gray-300 cursor-pointer" />
                  </div>
                  <div className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    {item.image ? <Image width={800} height={800} src={item.image} alt={item.product_name} className="object-cover h-full w-full rounded-xl" /> : <ShoppingBag className="text-gray-400" size={24} />}
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">Best Seller</span>
                    <h4 className="font-bold text-gray-900 text-sm line-clamp-2 mt-1">{item.product_name || item.name}</h4>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1 text-emerald-600 font-bold"><Package size={14}/> In Stock</span>
                      <span className="border-l border-gray-300 pl-3">Age 6+</span>
                      <span className="border-l border-gray-300 pl-3 flex items-center gap-1"><Star size={14} className="text-amber-400 fill-amber-400"/> 4.6 <span className="text-gray-400">(120 reviews)</span></span>
                    </div>
                  </div>

                  <div className="text-right min-w-[90px]">
                    {item.original_price && item.discount_applied > 0 && (
                      <div className="text-gray-400 line-through text-xs font-semibold">₹{parseFloat(item.original_price).toLocaleString('en-IN')}</div>
                    )}
                    <div className="font-bold text-red-600 text-lg">₹{itemPrice.toLocaleString('en-IN')}</div>
                    {item.original_price && item.discount_applied > 0 && (
                      <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                        {Math.round((item.discount_applied / item.original_price) * 100)}% OFF
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
                    <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, (item.qty || 1) - 1))}
                        className="px-3 py-1 text-lg font-medium text-gray-500 hover:bg-gray-50 rounded-l-lg"
                      >
                        −
                      </button>
                      <span className="px-3 text-sm font-bold border-x border-gray-200 text-center min-w-[40px] py-1">{item.qty || 1}</span>
                      <button
                        onClick={() => updateQuantity(item.id, (item.qty || 1) + 1)}
                        className="px-3 py-1 text-lg font-medium text-gray-500 hover:bg-gray-50 rounded-r-lg"
                      >
                        +
                      </button>
                    </div>

                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 flex justify-between items-center bg-gray-50 border-t border-gray-100 rounded-b-2xl">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500 border-gray-300 cursor-pointer" />
              Select All ({items.length} items)
            </label>
            <button className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600" onClick={clearCart}>
              <Trash2 size={16} /> Remove Selected
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-pink-50 rounded-2xl p-4 border border-pink-100 flex items-start gap-4">
            <div className="bg-pink-100 text-pink-600 p-2 rounded-lg flex-shrink-0">
              <Ticket size={24} className="rotate-45 text-pink-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-sm">10% Off on Min Order ₹1000</h4>
              <p className="text-xs text-gray-500 mt-0.5">Use code <span className="font-bold text-red-500">TOY10</span> at checkout</p>
            </div>
            <button className="bg-pink-100 text-pink-600 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-pink-200 transition">
              TOY10 <Copy size={14} />
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit space-y-6">
            <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">Order Summary</h3>

            <AvailableOffers
              offers={offerEvaluation?.available_offers || []}
              selectedIds={selectedOfferIds}
              onToggle={toggleOffer}
              isRetailer={isReseller}
            />

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
                  disabled={isReseller}
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-xs uppercase focus:outline-none focus:border-sky-500"
                />
                <button type="submit" disabled={isReseller} className="bg-slate-900 text-white font-bold text-xs px-3 py-2 rounded-lg hover:bg-sky-600 disabled:bg-gray-300">
                  Apply
                </button>
              </div>
              {couponMsg && (
                <p className={`text-xs ${appliedCoupon ? 'text-emerald-600 font-semibold' : 'text-red-600'}`}>{couponMsg}</p>
              )}
              {isReseller && <p className="text-[10px] text-gray-500 font-bold uppercase">RETAILER: Extra offers and coupons are unavailable</p>}
            </form>

            <div className="space-y-3 text-sm pt-4 border-t border-gray-100">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {offerEvaluation?.offer_discount > 0 && (
                <div className="flex justify-between text-emerald-600 text-sm">
                  <span>Discount (Offer)</span>
                  <span className="font-semibold">- ₹{offerEvaluation.offer_discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {!isLoggedIn && <form onSubmit={checkPincode} className="border-t border-gray-100 pt-4 space-y-2">
                <label className="text-xs font-black text-gray-700 flex items-center gap-1"><MapPin size={14} /> ENTER PINCODE</label>
                <div className="flex gap-2">
                  <input value={pincode} onChange={event => setPincode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit pincode" inputMode="numeric" className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm" />
                  <button type="submit" disabled={checkingPincode} className="bg-slate-900 text-white px-3 rounded-lg text-xs font-black disabled:opacity-50">{checkingPincode ? '...' : 'Check'}</button>
                </div>
                {pincodeMessage && <p className="text-[10px] text-gray-500">{pincodeMessage}</p>}
              </form>}
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1">Estimated Shipping <Info size={14} className="text-gray-400" /></span>
                <span className="text-gray-500">{shippingQuote ? `₹${parseFloat(shippingQuote.cost || 0).toLocaleString('en-IN')}` : 'Calculated at Checkout'}</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-gray-900 text-base pt-4 border-t border-gray-100">
              <span className="text-lg">Total Amount</span>
              <div className="text-right">
                <span className="text-sky-500 text-2xl font-black">₹{(displayedSubtotal + parseFloat(shippingQuote?.cost || 0)).toLocaleString('en-IN')}</span>
                <p className="text-[10px] text-gray-400 font-normal mt-1">Inclusive of all taxes</p>
              </div>
            </div>

            {isLoggedIn ? (
              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-[#E5202D] text-white font-bold py-3.5 rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-lg"
              >
                <Lock size={16} /> Proceed to Checkout <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!shippingQuote) {
                    setPincodeMessage('Enter and check your pincode before continuing.');
                    return;
                  }
                  setAuthModalOpen(true);
                }}
                className="w-full bg-[#E5202D] text-white font-bold py-3.5 rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-lg"
              >
                <Lock size={16} /> Proceed to Login <ArrowRight size={18} />
              </button>
            )}

            <div className="bg-emerald-50 rounded-xl p-3 flex items-center gap-3 border border-emerald-100">
              <Truck className="text-emerald-600" size={20} />
              <div>
                <p className="text-emerald-700 font-bold text-xs">You are eligible for FREE SHIPPING</p>
                <p className="text-emerald-600 text-[10px]">Add ₹1 more to get free shipping!</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-6 border-t border-gray-100">
              <div className="flex flex-col items-center gap-1 text-center">
                <ShieldCheck size={20} className="text-gray-700" />
                <span className="text-[10px] text-gray-500 font-semibold leading-tight">Secure<br/>Payments</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <RefreshCcw size={20} className="text-gray-700" />
                <span className="text-[10px] text-gray-500 font-semibold leading-tight">Easy<br/>Returns</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <CheckCircle2 size={20} className="text-gray-700" />
                <span className="text-[10px] text-gray-500 font-semibold leading-tight">100%<br/>Original</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <HeadphonesIcon size={20} className="text-gray-700" />
                <span className="text-[10px] text-gray-500 font-semibold leading-tight">Dedicated<br/>Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-8">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
          <Gift className="text-purple-500" size={24} /> You Might Also Like
        </h2>
        <YouMightAlsoLike excludeIds={items.map(item => item.product_id)} />
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onSuccess={onAuthSuccess} 
      />
    </div>
  );
}
