'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api, downloadFile } from '../../../../lib/api';
import StatusBadge from '../../../../components/StatusBadge';
import { Package, Download, Truck, MapPin, AlertCircle, CheckCircle, CreditCard, ExternalLink, Calendar } from 'lucide-react';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

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

  const { order, items = [], shipments = [], rejected_items = [], payments = [], payment_summary = {} } = orderData;
  const isPayInAdvance = order.payment_method === 'pay_in_advance';
  const totalPaid = payment_summary.total_paid !== undefined ? payment_summary.total_paid : (payments || []).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const pendingAmount = payment_summary.payment_pending !== undefined ? payment_summary.payment_pending : Math.max(0, parseFloat(order.grand_total || 0) - totalPaid);

  const handleDownloadInvoice = async () => {
    try {
      setDownloading(true);
      await downloadFile(`/orders/${order.id}/invoice`, `Invoice-${order.order_number || order.id}.pdf`);
    } catch (err) {
      alert(err.message || 'Failed to download invoice. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black text-gray-900">{order.order_number}</h1>
            <StatusBadge status={order.status} />
            <StatusBadge status={order.payment_status || 'pending'} />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Placed on {new Date(order.created_at || Date.now()).toLocaleString('en-IN')} | Payment: <span className="font-bold uppercase">{order.payment_method?.replace(/_/g, ' ')}</span>
          </p>
        </div>

        <button
          onClick={handleDownloadInvoice}
          disabled={downloading}
          className="bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-sky-600 transition flex items-center gap-2 w-fit disabled:opacity-50"
        >
          <Download size={16} /> {downloading ? 'Downloading...' : 'Download Tax Invoice (PDF)'}
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

          {/* Payment Tracker Section (for Pay In Advance / Split Payments) */}
          {(isPayInAdvance || payments.length > 0) && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    <CreditCard className="text-indigo-600" size={20} /> Payment Tracker
                  </h3>
                  <p className="text-xs text-gray-500">
                    Payments made outside the website (Bank Transfer / NEFT / RTGS / UPI) recorded by store.
                  </p>
                </div>
                <div className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 w-fit">
                  Method: <span className="uppercase">{order.payment_method?.replace(/_/g, ' ') || 'Pay in Advance'}</span>
                </div>
              </div>

              {/* 3 Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Order Value</span>
                  <span className="text-lg font-black text-slate-900 mt-1 block">
                    ₹{parseFloat(order.grand_total || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Payment Made</span>
                  <span className="text-lg font-black text-emerald-700 mt-1 block">
                    ₹{totalPaid.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className={`p-4 rounded-xl border ${pendingAmount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${pendingAmount > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                    Payment Pending
                  </span>
                  <span className={`text-lg font-black mt-1 block ${pendingAmount > 0 ? 'text-amber-800' : 'text-slate-700'}`}>
                    ₹{pendingAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Splits List */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Recorded Payment Splits ({payments.length})
                </h4>

                {payments.length > 0 ? (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/40">
                    {payments.map((p, idx) => (
                      <div key={p.id || idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">Split #{idx + 1}</span>
                            <span className="text-slate-400 font-mono flex items-center gap-1">
                              <Calendar size={12} /> {new Date(p.payment_date).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                          {p.admin_remarks && (
                            <p className="text-slate-600">
                              <span className="font-semibold text-slate-700">Remarks:</span> {p.admin_remarks}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 sm:text-right">
                          <span className="text-base font-black text-emerald-700 block">
                            ₹{parseFloat(p.amount || 0).toLocaleString('en-IN')}
                          </span>
                          {p.proof_url && (
                            <a
                              href={p.proof_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 font-bold text-[11px] flex items-center gap-1 transition"
                            >
                              <ExternalLink size={12} /> Proof
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic py-2">
                    No payment splits recorded yet. The store will contact you and log payment records here once received.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Split Shipments Section */}
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

            <div className="pt-3 border-t border-gray-100 space-y-1.5">
              <div className="flex justify-between text-gray-600">
                <span>Payment Method</span>
                <span className="font-bold text-slate-800 uppercase">{order.payment_method?.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Payment Status</span>
                <StatusBadge status={order.payment_status || 'pending'} />
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{parseFloat(order.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee</span>
                <span>₹{parseFloat(order.shipping_cost || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Grand Total</span>
                <span className="text-sky-600">₹{parseFloat(order.grand_total || 0).toLocaleString('en-IN')}</span>
              </div>
              {totalPaid > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold pt-1">
                  <span>Paid So Far</span>
                  <span>₹{totalPaid.toLocaleString('en-IN')}</span>
                </div>
              )}
              {pendingAmount > 0 && (
                <div className="flex justify-between text-amber-700 font-bold pt-1">
                  <span>Pending Balance</span>
                  <span>₹{pendingAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
