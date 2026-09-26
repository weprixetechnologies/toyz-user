'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center bg-white p-8 rounded-2xl border border-emerald-100 shadow-xl space-y-6 my-8">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle size={36} />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-gray-900">Order Placed Successfully!</h1>
        <p className="text-sm text-gray-500">
          Thank you for your purchase. We have received your order and an SMS confirmation has been dispatched.
        </p>
        {orderId && (
          <p className="text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-full inline-block text-slate-700 font-bold">
            Order Reference ID: #{orderId}
          </p>
        )}
      </div>

      <div className="flex justify-center gap-4 pt-4 border-t border-gray-100">
        <Link href="/account/orders" className="bg-slate-900 text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-sky-600 transition flex items-center gap-2">
          <Package size={16} /> Track My Orders
        </Link>
        <Link href="/products" className="bg-gray-100 text-gray-700 text-xs font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading order confirmation...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
