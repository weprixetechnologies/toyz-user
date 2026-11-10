'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { CheckCircle, AlertTriangle, Clock, RefreshCw, Package, ArrowRight, ShoppingCart } from 'lucide-react';

function VerifyPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get('order_id') || searchParams.get('orderId');
  const merchantOrderId = searchParams.get('merchant_order_id') || searchParams.get('merchantOrderId') || searchParams.get('order_id');
  const gateway = searchParams.get('gateway') || 'phonepe';

  const [state, setState] = useState('loading'); // 'loading' | 'success' | 'pending' | 'failed'
  const [errorMessage, setErrorMessage] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [retrying, setRetrying] = useState(false);

  async function checkPaymentStatus() {
    if (!orderId) {
      setState('failed');
      setErrorMessage('Missing order reference identifier in callback redirect.');
      return;
    }

    setRetrying(true);
    try {
      // Gather all query params to pass as raw payload to backend verify
      const payload = {
        merchant_order_id: merchantOrderId,
        order_id: orderId
      };
      searchParams.forEach((val, key) => {
        payload[key] = val;
      });

      const res = await api.post('/payments/verify', {
        order_id: orderId,
        gateway_key: gateway,
        payload
      });

      if (res.success) {
        const payStatus = res.data?.payment_status;
        setOrderDetails(res.data);
        if (payStatus === 'paid') {
          setState('success');
        } else if (payStatus === 'pending') {
          setState('pending');
        } else {
          setState('failed');
          setErrorMessage(res.message || 'Payment was not marked successful.');
        }
      } else {
        setState('failed');
        setErrorMessage(res.message || res.error || 'Payment verification failed on PhonePe.');
      }
    } catch (err) {
      setState('failed');
      setErrorMessage(err.message || 'Error communicating with verification service.');
    } finally {
      setRetrying(false);
    }
  }

  useEffect(() => {
    checkPaymentStatus();
  }, [orderId]);

  const handleRetryPayment = async () => {
    if (!orderId) {
      router.push('/checkout');
      return;
    }

    setRetrying(true);
    setErrorMessage('');
    try {
      const initRes = await api.post('/payments/initiate', {
        order_id: orderId,
        gateway_key: gateway
      });

      if (initRes.success && (initRes.data?.redirect_url || initRes.data?.checkout_url)) {
        window.location.href = initRes.data.redirect_url || initRes.data.checkout_url;
      } else {
        setErrorMessage(initRes.message || 'Unable to initiate retry. Please return to checkout.');
        setRetrying(false);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to retry payment initiation.');
      setRetrying(false);
    }
  };

  if (state === 'loading') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900">Verifying Payment with PhonePe...</h2>
        <p className="text-sm text-gray-500">
          Please wait while we confirm your transaction securely with PhonePe. Do not close or refresh this page.
        </p>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center bg-white p-8 rounded-2xl border border-emerald-100 shadow-xl space-y-6 my-8">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle size={38} />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
            Verified via PhonePe
          </span>
          <h1 className="text-3xl font-black text-gray-900">Payment Confirmed!</h1>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Your transaction has been confirmed and your order is now officially placed and processing.
          </p>
          {orderId && (
            <p className="text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-full inline-block text-slate-700 font-bold mt-2">
              Order ID: #{orderId} {orderDetails?.transaction_id && `• Ref: ${orderDetails.transaction_id}`}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 border-t border-gray-100">
          <Link
            href="/account/orders"
            className="bg-slate-900 text-white text-xs font-bold px-6 py-3.5 rounded-xl hover:bg-sky-600 transition flex items-center justify-center gap-2"
          >
            <Package size={16} /> View Order Status
          </Link>
          <Link
            href="/products"
            className="bg-gray-100 text-gray-700 text-xs font-bold px-6 py-3.5 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            Continue Shopping <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  if (state === 'pending') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center bg-white p-8 rounded-2xl border border-amber-200 shadow-xl space-y-6 my-8">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <Clock size={38} />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider">
            Awaiting Confirmation
          </span>
          <h1 className="text-3xl font-black text-gray-900">Payment Pending Confirmation</h1>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Your payment attempt was recorded, but PhonePe has not yet returned a final confirmation.
            Our webhook will update your order status as soon as the bank settles the funds.
          </p>
          {orderId && (
            <p className="text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-full inline-block text-slate-700 font-bold">
              Order Reference: #{orderId}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 border-t border-gray-100">
          <button
            onClick={checkPaymentStatus}
            disabled={retrying}
            className="bg-amber-600 text-white text-xs font-bold px-6 py-3.5 rounded-xl hover:bg-amber-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={16} className={retrying ? 'animate-spin' : ''} />
            {retrying ? 'Checking Status...' : 'Check Status Again'}
          </button>
          <Link
            href="/account/orders"
            className="bg-slate-100 text-slate-700 text-xs font-bold px-6 py-3.5 rounded-xl hover:bg-slate-200 transition flex items-center justify-center gap-2"
          >
            <Package size={16} /> View My Orders
          </Link>
        </div>
      </div>
    );
  }

  // Failed state
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center bg-white p-8 rounded-2xl border border-red-200 shadow-xl space-y-6 my-8">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
        <AlertTriangle size={38} />
      </div>

      <div className="space-y-2">
        <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full uppercase tracking-wider">
          Transaction Incomplete
        </span>
        <h1 className="text-3xl font-black text-gray-900">Payment Failed or Cancelled</h1>
        <p className="text-sm text-red-600 max-w-md mx-auto font-medium">
          {errorMessage || 'Your transaction could not be processed by the gateway or was cancelled.'}
        </p>
        <p className="text-xs text-gray-500">
          No funds were debited, or any deducted funds will be refunded by your bank within 3-5 business days.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 border-t border-gray-100">
        <button
          onClick={handleRetryPayment}
          disabled={retrying}
          className="bg-sky-600 text-white text-xs font-bold px-6 py-3.5 rounded-xl hover:bg-sky-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={16} className={retrying ? 'animate-spin' : ''} />
          {retrying ? 'Initiating Retry...' : 'Retry Payment on PhonePe'}
        </button>
        <Link
          href="/checkout"
          className="bg-slate-900 text-white text-xs font-bold px-6 py-3.5 rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2"
        >
          Change Payment Method
        </Link>
        <Link
          href="/cart"
          className="bg-gray-100 text-gray-700 text-xs font-bold px-6 py-3.5 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2"
        >
          <ShoppingCart size={16} /> Return to Cart
        </Link>
      </div>
    </div>
  );
}

export default function VerifyPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto px-4 py-20 text-center font-bold text-gray-500">
          Loading verification status...
        </div>
      }
    >
      <VerifyPaymentContent />
    </Suspense>
  );
}
