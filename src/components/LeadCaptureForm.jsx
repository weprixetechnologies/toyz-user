'use client';

import { useState } from 'react';
import { Send, CheckCircle2, Phone, User, MapPin, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';

export default function LeadCaptureForm({
  source = 'floating_widget',
  compact = false,
  title,
  subtitle,
  onSuccess
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    requirement: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const address = formData.address.trim();
    const requirement = formData.requirement.trim();

    if (!name || name.length < 2) {
      setError('Please provide your name (at least 2 characters).');
      return;
    }

    // Clean phone validation (digits only test)
    const digitsOnly = phone.replace(/[^0-9]/g, '');
    if (!phone || digitsOnly.length < 7 || digitsOnly.length > 15) {
      setError('Please enter a valid phone number (at least 7 digits).');
      return;
    }

    if (!requirement || requirement.length < 3) {
      setError('Please let us know your requirement or message.');
      return;
    }

    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.provokeplaytech.com/api/v1';
      const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          address: address || null,
          requirement,
          source
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        if (onSuccess) onSuccess(data);
      } else {
        setError(data.message || 'Failed to submit inquiry. Please try again.');
      }
    } catch (err) {
      console.error('Lead submit error:', err);
      setError('Network connection error. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ name: '', phone: '', address: '', requirement: '' });
    setSuccess(false);
    setError('');
  };

  if (success) {
    return (
      <div className={`text-center flex flex-col items-center justify-center ${compact ? 'py-6 px-4' : 'py-12 px-6'}`}>
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-sm animate-in zoom-in-75 duration-200">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Inquiry Received!</h3>
        <p className="text-xs text-slate-600 mt-2 max-w-sm leading-relaxed">
          Thank you, <span className="font-semibold text-slate-800">{formData.name}</span>. Our team will review your requirement and call you at{' '}
          <span className="font-semibold text-slate-800">{formData.phone}</span> shortly.
        </p>

        <button
          type="button"
          onClick={handleReset}
          className="mt-6 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition shadow-sm"
        >
          Send Another Inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? 'space-y-3' : 'space-y-4'}>
      {(title || subtitle) && (
        <div className="mb-2">
          {title && <h3 className={`font-bold text-slate-900 ${compact ? 'text-sm' : 'text-xl'}`}>{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>}
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 flex items-start gap-2">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          Full Name <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          />
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          Phone Number <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition font-mono"
          />
        </div>
      </div>

      {/* Address (Optional) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Address / City
          </label>
          <span className="text-[11px] text-slate-400 font-medium">(Optional)</span>
        </div>
        <div className="relative">
          <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="e.g. Bandra West, Mumbai"
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          />
        </div>
      </div>

      {/* Requirement / Message */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          Requirement / Message <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <textarea
            name="requirement"
            required
            rows={compact ? 3 : 4}
            value={formData.requirement}
            onChange={handleChange}
            placeholder="Describe the products, quantities, or assistance you need..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition leading-relaxed resize-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-md hover:shadow transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
      >
        {loading ? (
          <>
            <RefreshCw size={14} className="animate-spin" />
            <span>Sending Inquiry...</span>
          </>
        ) : (
          <>
            <Send size={14} />
            <span>Submit Inquiry</span>
          </>
        )}
      </button>
    </form>
  );
}
