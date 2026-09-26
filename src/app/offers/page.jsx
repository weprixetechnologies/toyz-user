'use client';
import Image from "next/image";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Tag, Percent, Sparkles, Copy, Check, Gift, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    async function loadOffers() {
      setLoading(true);
      try {
        const [offersRes, bannerRes] = await Promise.all([
          api.get('/offers'),
          api.get('/banners?type=offers_page_banner')
        ]);
        if (offersRes.success && offersRes.data) {
          const list = offersRes.data.offers || (Array.isArray(offersRes.data) ? offersRes.data : []);
          setOffers(list);
        }
        if (bannerRes.success && bannerRes.data?.banners?.length > 0) {
          setBanner(bannerRes.data.banners[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOffers();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  const sampleCoupons = [
    { code: 'WELCOME10', discount: '10% OFF', description: 'Applicable on your first store order above ₹499', minCart: 499 },
    { code: 'FESTIVE500', discount: '₹500 FLAT OFF', description: 'Flat ₹500 discount on mega carts above ₹4,999', minCart: 4999 },
    { code: 'B2BWHOLESALE', discount: 'EXTRA 15% OFF', description: 'Special bulk volume pricing tier for verified reseller accounts', minCart: 2000 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      {banner ? (
        <div className="w-full rounded-3xl overflow-hidden shadow-2xl">
          <Image width={800} height={800} src={banner.image_url} alt="Offers Banner" className="w-full h-auto block" />
        </div>
      ) : (
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl text-center md:text-left z-10">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3.5 py-1.5 rounded-full border border-amber-400/20 inline-flex items-center gap-1.5">
              <Sparkles size={14} /> Exclusive Promotions & Discounts
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Best Deals, Coupons & Wholesale Offers
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Save extra on every order! Explore active storewide discounts, tiered bulk volume deals, and promo coupon codes.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-center space-y-3 z-10 min-w-[240px]">
            <div className="text-3xl font-black text-amber-400">Up to 50% OFF</div>
            <p className="text-xs text-slate-300">Auto-applied at Checkout</p>
            <Link
              href="/products"
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg"
            >
              Shop Discounted Items <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
      {/* Featured Promo Coupon Codes */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-3 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Gift className="text-sky-600" size={24} /> Verified Promo Coupons
            </h2>
            <p className="text-xs text-gray-500">Copy coupon code and paste it in cart checkout</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleCoupons.map((c) => (
            <div key={c.code} className="bg-white p-6 rounded-2xl border border-dashed border-sky-300 hover:border-sky-500 shadow-sm transition flex flex-col justify-between space-y-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-sky-100 text-sky-700 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase">
                Coupon Code
              </div>

              <div className="space-y-2">
                <div className="text-2xl font-black text-slate-900">{c.discount}</div>
                <p className="text-xs text-gray-600 leading-relaxed">{c.description}</p>
                <p className="text-[11px] text-gray-400 font-medium">Min Cart Value: ₹{c.minCart.toLocaleString('en-IN')}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 tracking-wider">
                  {c.code}
                </span>
                <button
                  onClick={() => handleCopyCode(c.code)}
                  className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
                    copiedCode === c.code ? 'bg-emerald-600 text-white' : 'bg-slate-900 hover:bg-sky-600 text-white'
                  }`}
                >
                  {copiedCode === c.code ? <Check size={14} /> : <Copy size={14} />}
                  {copiedCode === c.code ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active System Offers List */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-3">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Percent className="text-amber-500" size={24} /> Active Store Promotional Offers
          </h2>
          <p className="text-xs text-gray-500">Live rules automatically evaluated in cart</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Loading active offers...</div>
        ) : offers.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 space-y-3">
            <Tag size={36} className="text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-900 text-base">No Custom Offer Rules Active Right Now</h3>
            <p className="text-xs text-gray-500">Check back soon for seasonal flash sales and new discount events!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((off) => (
              <div key={off.id} className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full uppercase">
                      {off.offer_type || 'Cart Promotion'}
                    </span>
                    {off.is_active && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Active Deal
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">{off.name}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{off.description || 'Automatic cart discount applied upon reaching order criteria.'}</p>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Discount Value:</span>
                    <span className="font-bold text-slate-900">
                      {off.discount_type === 'flat' ? `₹${off.discount_value}` : `${off.discount_value}% OFF`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Min Cart Requirement:</span>
                    <span className="font-bold text-slate-900">₹{parseFloat(off.min_cart_value || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
