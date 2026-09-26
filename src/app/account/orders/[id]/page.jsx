'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../lib/api';
import StatusBadge from '../../../../components/StatusBadge';
import { Package, Download, Truck, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.success && res.data) {
        setOrderData(res.data);
      }
      setLoading(false);
    }
    if (id) loadDetail();
  }, [id]);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-gray-400">Loading order detail...</div>;
  }

  if (!orderData || !orderData.order) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-gray-500">Order not found.</div>;
  }

  const { order, items = [], shipments = [], rejected_items = [] } = orderData;

  const handleDownloadInvoice = async () => {
    window.open(`http://72.60.219.181:98111/api/v1/orders/${order.id}/invoice`, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900">{order.order_number}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Placed on {new Date(order.created_at || Date.now()).toLocaleString('en-IN')} | Payment: <span className="font-bold uppercase">{order.payment_method}</span>
          </p>
        </div>

        <button
          onClick={handleDownloadInvoice}
          className="bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-sky-600 transition flex items-center gap-2 w-fit"
        >
          <Download size={16} /> Download Tax Invoice
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Purchased Items</h3>
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{item.product_name}</h4>
                    <p className="text-xs text-gray-400">SKU: {item.sku} | Qty Ordered: {item.qty_ordered}</p>
                    {item.qty_approved !== null && item.qty_approved < item.qty_ordered && (
                      <p className="text-xs text-amber-600 font-semibold">Approved: {item.qty_approved} pcs</p>
                    )}
                  </div>
                  <div className="text-right font-bold text-sm text-slate-900">
                    ₹{parseFloat(item.line_total || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* §6.3 Split Shipments Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <Truck className="text-sky-600" size={20} /> Shipment Packages & Tracking
            </h3>

            {shipments && shipments.length > 0 ? (
              <div className="space-y-4">
                {shipments.map((s, idx) => (
                  <div key={s.id || idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-slate-900">Package #{idx + 1} — {s.tracking_carrier || 'Express Delivery'}</span>
                      <StatusBadge status={s.status || 'shipped'} />
                    </div>
                    {s.tracking_number && (
                      <p className="text-xs text-gray-600 font-mono">Tracking No: <span className="font-bold text-sky-600">{s.tracking_number}</span></p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 py-2">No shipments dispatched yet for this order.</p>
            )}

            {/* Separate Unfulfilled / Rejected Section */}
            {rejected_items && rejected_items.length > 0 && (
              <div className="pt-4 border-t border-red-100 bg-red-50/50 p-4 rounded-xl border border-red-200 space-y-2">
                <div className="font-bold text-sm text-red-800 flex items-center gap-1.5">
                  <AlertCircle size={16} /> Unfulfilled / Rejected Items
                </div>
                {rejected_items.map((rj) => (
                  <div key={rj.id} className="text-xs text-red-700">
                    • <span className="font-bold">{rj.product_name}</span> (Rejected Qty: {rj.qty_rejected || rj.qty_ordered}) — Reason: {rj.admin_note || 'Out of warehouse stock'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 h-fit space-y-6">
          <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">Delivery & Payment</h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-gray-400 block font-bold uppercase">Shipping Address:</span>
              <p className="text-gray-800 font-semibold mt-1">{order.shipping_name}</p>
              <p className="text-gray-600">{order.shipping_line1}, {order.shipping_city}, {order.shipping_state} - {order.shipping_pin}</p>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between text-gray-600 mb-1">
                <span>Subtotal</span>
                <span>₹{parseFloat(order.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600 mb-1">
                <span>Shipping Fee</span>
                <span>₹{parseFloat(order.shipping_cost || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Grand Total</span>
                <span className="text-sky-600">₹{parseFloat(order.grand_total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
