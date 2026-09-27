'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { KeyRound, Phone, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [mode, setMode] = useState('password'); // 'password' or 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      const token = res.data.tokens?.accessToken || res.data.tokens?.access_token;
      const refreshToken = res.data.tokens?.refreshToken || res.data.tokens?.refresh_token;
      login(token, res.data.user, refreshToken);
      router.push('/account');
    } else {
      setError(res.message || 'Invalid email or password');
    }
    setLoading(false);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await api.post('/auth/send-otp', { phone });
    if (res.success) {
      setOtpSent(true);
    } else {
      setError(res.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await api.post('/auth/verify-otp', { phone, otp });
    if (res.success && res.data) {
      const token = res.data.tokens?.accessToken || res.data.tokens?.access_token;
      login(token, res.data.user);
      router.push('/account');
    } else {
      setError(res.message || 'Invalid OTP code');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-gray-200 shadow-lg space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-gray-900">Welcome Back</h1>
        <p className="text-xs text-gray-500">Sign in to your WePrixe account</p>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setMode('password')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
            mode === 'password' ? 'bg-white text-slate-900 shadow' : 'text-gray-500'
          }`}
        >
          Password Login
        </button>
        <button
          onClick={() => setMode('otp')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
            mode === 'otp' ? 'bg-white text-slate-900 shadow' : 'text-gray-500'
          }`}
        >
          OTP Verification
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-lg">{error}</div>}

      {mode === 'password' ? (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2.5 mt-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
              <Link href="/forgot-password" className="text-xs text-sky-600 hover:underline">Forgot?</Link>
            </div>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-sky-600 transition"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      ) : (
        <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
            <input
              type="text"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={otpSent}
              required
              className="w-full p-2.5 mt-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          {otpSent && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">6-digit OTP Code</label>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full p-2.5 mt-1 border border-gray-300 rounded-lg text-sm text-center font-mono tracking-widest focus:outline-none focus:border-sky-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-sky-600 transition"
          >
            {loading ? 'Processing...' : (otpSent ? 'Verify OTP & Login' : 'Send OTP')}
          </button>
        </form>
      )}

      <p className="text-xs text-center text-gray-500">
        Don't have an account? <Link href="/register" className="text-sky-600 font-bold hover:underline">Register Now</Link>
      </p>
    </div>
  );
}
