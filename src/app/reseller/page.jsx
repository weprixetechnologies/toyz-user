'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { Briefcase, CreditCard, Package, ShoppingBag, ArrowRight } from 'lucide-react';

export default function ResellerDashboardPage() {
  const [credit, setCredit] = useState(null);
  const [resellerOrders, setResellerOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResellerData() {
      setLoading(true);
      const [credRes, ordRes] = await Promise.all([
        api.get('/reseller/credit'),
        api.get('/reseller/orders')
      ]);

      if (credRes.success) setCredit(credRes.data);
      if (ordRes.success) setResellerOrders(ordRes.data?.orders || ordRes.data || []);
      setLoading(false);
    }
    loadResellerData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-gradient-to-r from-slate-900 to-amber-950 text-white p-8 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            B2B Retailer Partner
          </span>
          <h1 className="text-3xl font-black mt-2">Wholesale Reseller Portal</h1>
        </div>

        <Link href="/reseller/products" className="bg-amber-500 text-slate-950 font-bold px-6 py-3 rounded-xl hover:bg-amber-400 transition flex items-center gap-2">
          <ShoppingBag size={18} /> Browse Wholesale Catalog
        </Link>
      </div>

      {/* Credit Summary & Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase">
            <span>Credit Limit</span>
            <CreditCard size={18} className="text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            ₹{parseFloat(credit?.credit_limit || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-emerald-600 font-semibold">
            Available: ₹{parseFloat(credit?.credit_available || 0).toLocaleString('en-IN')}
          </p>
        </div>

        <Link href="/reseller/products" className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-amber-500 transition block space-y-2">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit"><ShoppingBag size={24} /></div>
          <h4 className="font-bold text-gray-900">Place Wholesale Bulk Order</h4>
          <p className="text-xs text-gray-400">Order at discounted reseller prices with MOQ validation</p>
        </Link>

        <Link href="/reseller/orders" className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-amber-500 transition block space-y-2">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl w-fit"><Package size={24} /></div>
          <h4 className="font-bold text-gray-900">Pending Approvals & Proforma</h4>
          <p className="text-xs text-gray-400">Track admin per-item order decisions</p>
        </Link>
      </div>
    </div>
  );
}
