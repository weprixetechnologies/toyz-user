'use client';

import { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, Sparkles, Send } from 'lucide-react';
import api from '@/lib/api';

export default function NewsletterBox({ source = 'blog_sidebar', compact = false }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus({ type: 'error', message: 'Please enter your email address.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await api.post('/newsletter/subscribe', {
        email: email.trim(),
        source
      });

      if (res && res.success) {
        setStatus({
          type: 'success',
          message: res.message || 'You are now subscribed to ToyWorld updates!'
        });
        setEmail('');
      } else {
        setStatus({
          type: 'error',
          message: res?.message || 'Subscription failed. Please try again later.'
        });
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.message || 'Network error occurred. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-red-500 via-[#F51F2D] to-orange-500 text-white rounded-2xl p-6 sm:p-7 shadow-lg relative overflow-hidden font-sans">
      {/* Decorative background shapes */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold tracking-wide">
          <Sparkles size={13} className="text-yellow-300" />
          <span>Stay Updated</span>
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            Never Miss a Toy Drop!
          </h3>
          <p className="text-xs sm:text-sm text-red-50 font-medium leading-relaxed mt-1.5">
            Get exclusive play tips, RC car guides, and early access to discounts directly in your inbox.
          </p>
        </div>

        {/* Feedback Messages */}
        {status.type === 'success' ? (
          <div className="p-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl flex items-start gap-2.5 text-xs font-semibold animate-fadeIn">
            <CheckCircle2 size={16} className="text-yellow-300 flex-shrink-0 mt-0.5" />
            <span>{status.message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail size={16} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                placeholder="Enter your email address"
                aria-label="Email address for newsletter"
                className="w-full pl-10 pr-4 py-3 bg-white text-gray-900 rounded-xl text-xs sm:text-sm font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-inner"
              />
            </div>

            {status.type === 'error' && (
              <div className="p-2.5 bg-black/30 rounded-lg flex items-center gap-2 text-[11px] font-semibold text-yellow-200">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{status.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-5 bg-[#17202A] hover:bg-black text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Subscribing...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Subscribe Now</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-red-100 text-center">
              🔒 No spam ever. Unsubscribe at any time with 1 click.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
