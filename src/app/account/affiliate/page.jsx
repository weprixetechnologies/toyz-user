'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Award, Link as LinkIcon, DollarSign, Copy, Check } from 'lucide-react';

export default function AffiliatePortalPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadAffiliateData() {
      setLoading(true);
      const res = await api.get('/affiliate/dashboard');
      if (res.success && res.data) {
        setDashboard(res.data);
      }
      setLoading(false);
    }
    loadAffiliateData();
  }, []);

  const handleRegister = async () => {
    setRegistering(true);
    const res = await api.post('/affiliate/register', {});
    if (res.success) {
      const updated = await api.get('/affiliate/dashboard');
      if (updated.success) setDashboard(updated.data);
    } else {
      alert(res.message || 'Affiliate registration failed');
    }
    setRegistering(false);
  };

  const handleCopy = () => {
    if (dashboard?.ref_link) {
      navigator.clipboard.writeText(dashboard.ref_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-gray-400">Loading affiliate details...</div>;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-8 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-400/30">
            Partner Referral Program
          </span>
          <h1 className="text-3xl font-black mt-2">Affiliate Dashboard</h1>
        </div>

        {!dashboard && (
          <button
            onClick={handleRegister}
            disabled={registering}
            className="bg-purple-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-purple-400 transition"
          >
            {registering ? 'Joining Program...' : 'Join Affiliate Program'}
          </button>
        )}
      </div>

      {dashboard ? (
        <div className="space-y-8">
          {/* Referral Link Box */}
          <div className="bg-white p-6 rounded-2xl border border-purple-200 shadow-md space-y-3">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Your Unique Referral Link</h3>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={dashboard.ref_link || `http://localhost:3000/affiliate/ref/${dashboard.ref_code}`}
                className="flex-1 p-3 bg-slate-50 border border-gray-300 rounded-xl font-mono text-xs"
              />
              <button
                onClick={handleCopy}
                className="bg-purple-600 text-white font-bold text-xs px-5 py-3 rounded-xl hover:bg-purple-700 transition flex items-center gap-1.5"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Total Clicks</span>
              <div className="text-3xl font-black text-slate-900">{dashboard.total_clicks || 0}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Conversions</span>
              <div className="text-3xl font-black text-emerald-600">{dashboard.conversions || 0}</div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Total Earned Commission</span>
              <div className="text-3xl font-black text-purple-600">₹{parseFloat(dashboard.total_earnings || 0).toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 space-y-4">
          <Award size={48} className="text-purple-400 mx-auto" />
          <h3 className="text-xl font-bold text-gray-900">Become an Affiliate Partner</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Earn high commission percentages on every customer purchase referred through your link.
          </p>
          <button
            onClick={handleRegister}
            disabled={registering}
            className="bg-purple-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-purple-700 transition"
          >
            Activate My Referral Link
          </button>
        </div>
      )}
    </div>
  );
}
