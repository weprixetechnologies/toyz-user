'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CheckoutFailedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <main className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
              ✕
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Order / Payment Failed</h1>
            <p className="text-slate-600 mb-6">
              We were unable to process your payment or complete your order placement. Please retry or pick a different payment method.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href="/checkout"
                className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition"
              >
                Return to Checkout & Retry
              </Link>
              <Link
                href="/cart"
                className="w-full bg-slate-100 text-slate-700 font-medium py-2.5 rounded-lg hover:bg-slate-200 transition"
              >
                View Cart
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
