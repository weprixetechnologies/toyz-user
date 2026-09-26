'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', ref_code: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await api.post('/auth/register', formData);
    if (res.success && res.data) {
      const token = res.data.tokens?.accessToken || res.data.tokens?.access_token;
      login(token, res.data.user);
      router.push('/account');
    } else {
      setError(res.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-gray-200 shadow-lg space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-gray-900">Create Account</h1>
        <p className="text-xs text-gray-500">Join WePrixe Store for retail & reseller benefits</p>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2.5 mt-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-2.5 mt-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
          <input
            type="text"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full p-2.5 mt-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full p-2.5 mt-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Referral Code (Optional)</label>
          <input
            type="text"
            value={formData.ref_code}
            onChange={(e) => setFormData({ ...formData, ref_code: e.target.value })}
            className="w-full p-2.5 mt-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sky-600 text-white font-bold py-3 rounded-xl hover:bg-sky-700 transition"
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <p className="text-xs text-center text-gray-500">
        Already registered? <Link href="/login" className="text-sky-600 font-bold hover:underline">Log In</Link>
      </p>
    </div>
  );
}
