'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import StatusBadge from '../../../components/StatusBadge';
import { Briefcase, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function ApplyResellerPage() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ business_name: '', gstin: '', pan: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      const res = await api.get('/reseller/profile');
      if (res.success && res.data?.profile) {
        setProfile(res.data.profile);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    const res = await api.post('/reseller/apply', formData);
    if (res.success) {
      setMessage('Application submitted successfully! Our team will review your credentials.');
      const updated = await api.get('/reseller/profile');
      if (updated.success && updated.data?.profile) setProfile(updated.data.profile);
    } else {
      setMessage(res.message || 'Application failed');
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-gray-400">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <Briefcase size={24} />
        </div>
        <h1 className="text-3xl font-black text-gray-900">B2B Reseller & Wholesaler Program</h1>
        <p className="text-xs text-gray-500 max-w-lg mx-auto">
          Unlock wholesale pricing, volume bulk discounts, credit terms, and per-item order approval.
        </p>
      </div>

      {profile ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{profile.business_name}</h3>
              <p className="text-xs text-gray-400">GSTIN: {profile.gstin || 'N/A'}</p>
            </div>
            <StatusBadge status={profile.status} />
          </div>

          {profile.status === 'pending' && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
              <Clock size={16} /> Your application is under review by superadmin team.
            </div>
          )}

          {profile.status === 'approved' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold"><CheckCircle size={16} /> You are an active Wholesale Reseller!</span>
              <a href="/reseller" className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700">Go to Portal</a>
            </div>
          )}

          {profile.status === 'rejected' && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={16} /> Application Rejected: {profile.rejection_reason || 'Incomplete documentation'}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg space-y-4">
          {message && <div className="p-3 bg-sky-50 text-sky-700 text-xs font-bold rounded-lg">{message}</div>}

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Registered Business Name</label>
            <input
              type="text"
              required
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              className="w-full p-2.5 mt-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">GSTIN (Optional)</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full p-2.5 mt-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">PAN Number (Optional)</label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                className="w-full p-2.5 mt-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Business Operating Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 mt-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber-500 text-slate-950 font-bold py-3.5 rounded-xl hover:bg-amber-400 transition"
          >
            {submitting ? 'Submitting Application...' : 'Submit Reseller Application'}
          </button>
        </form>
      )}
    </div>
  );
}
