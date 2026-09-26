'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await api.post('/auth/forgot-password', { phone });
      if (res.success) {
        setMsg('OTP sent to your phone number!');
        setStep(2);
      } else {
        setErr(res.message || 'Failed to send OTP');
      }
    } catch (error) {
      setErr(error.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await api.post('/auth/reset-password', { phone, otp, new_password: newPassword });
      if (res.success) {
        setMsg('Password reset successfully! You can now log in.');
        setStep(3);
      } else {
        setErr(res.message || 'Failed to reset password');
      }
    } catch (error) {
      setErr(error.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <main className="max-w-md mx-auto px-4 py-12">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-800 text-center mb-6">Reset Password</h1>

            {msg && <div className="bg-emerald-50 text-emerald-700 p-3 rounded mb-4 text-sm border border-emerald-200">{msg}</div>}
            {err && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm border border-red-200">{err}</div>}

            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Enter Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-slate-800"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white font-medium py-2 rounded hover:bg-indigo-700"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter received OTP"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-slate-800"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white font-medium py-2 rounded hover:bg-indigo-700"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>
            )}

            {step === 3 && (
              <div className="text-center pt-4">
                <Link href="/login" className="inline-block bg-indigo-600 text-white font-medium px-6 py-2 rounded hover:bg-indigo-700">
                  Go to Login
                </Link>
              </div>
            )}

            <div className="mt-6 text-center text-sm">
              <Link href="/login" className="text-indigo-600 hover:underline">
                Back to Login
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
