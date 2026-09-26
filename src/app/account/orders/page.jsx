'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import StatusBadge from '../../../components/StatusBadge';
import { Package, Search } from 'lucide-react';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      const res = await api.get('/orders');
      if (res.success) {
        setOrders(res.data?.orders || res.data || []);
      }
      setLoading(false);
    }
    loadOrders();
  }, []);

  const filteredOrders = orders.filter(
    (o) => o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) || o.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">My Order History</h1>
          <p className="text-sm text-gray-500">Track and inspect all your past purchases</p>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search order number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs w-64 focus:outline-none focus:border-sky-500"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading order history...</div>
      ) : filteredOrders.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
          {filteredOrders.map((o) => (
            <div key={o.id} className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-slate-50 transition">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900 text-base">{o.order_number}</span>
                  <StatusBadge status={o.status} />
                </div>
                
                {o.items && o.items.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {o.items.slice(0, 4).map((item, idx) => (
                      <Link key={idx} href={`/products/${item.slug || item.product_id}`} title={item.product_name} className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden group">
                        {item.product_image ? (
                           <img src={item.product_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">Img</div>
                        )}
                      </Link>
                    ))}
                    {o.items.length > 4 && (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                        +{o.items.length - 4}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 pt-1">
                  Placed: {new Date(o.created_at || Date.now()).toLocaleDateString('en-IN')} | Payment Method: <span className="font-semibold uppercase">{o.payment_method || 'COD'}</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-gray-400">Grand Total</div>
                  <div className="text-lg font-black text-slate-900">₹{parseFloat(o.grand_total || 0).toLocaleString('en-IN')}</div>
                </div>

                <Link href={`/account/orders/${o.id}`} className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition">
                  View Order Detail
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 space-y-3">
          <Package size={36} className="text-gray-300 mx-auto" />
          <p className="text-gray-500 text-sm">No orders found.</p>
        </div>
      )}
    </div>
  );
}
