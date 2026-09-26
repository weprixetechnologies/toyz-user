import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function LoginModal({ onSuccess, onClose }) {
  const [mode, setMode] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      const token = res.data.tokens?.accessToken || res.data.tokens?.access_token;
      const refreshToken = res.data.tokens?.refreshToken || res.data.tokens?.refresh_token;
      login(token, res.data.user, refreshToken);
      if (onSuccess) onSuccess();
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
    if (res.success) setOtpSent(true);
    else setError(res.message || 'Failed to send OTP');
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
      if (onSuccess) onSuccess();
    } else {
      setError(res.message || 'Invalid OTP code');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="max-w-sm w-full p-8 bg-white rounded-2xl border border-gray-200 shadow-2xl space-y-6 relative">
        {onClose && (
           <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 font-bold">
             ✕
           </button>
        )}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-gray-900">Sign In</h1>
          <p className="text-xs text-gray-500">Quick login to continue</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setMode('password')} className={`flex-1 py-2 text-[10px] uppercase tracking-wider font-bold rounded-lg transition \${mode === 'password' ? 'bg-white text-slate-900 shadow' : 'text-gray-500'}`}>Password</button>
          <button onClick={() => setMode('otp')} className={`flex-1 py-2 text-[10px] uppercase tracking-wider font-bold rounded-lg transition \${mode === 'otp' ? 'bg-white text-slate-900 shadow' : 'text-gray-500'}`}>OTP</button>
        </div>
        {error && <div className="p-3 bg-red-50 text-red-600 text-[10px] font-semibold rounded-lg">{error}</div>}
        {mode === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email Address" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500" />
            <button type="submit" disabled={loading} className="w-full bg-[#F51F2D] text-white font-bold py-3 rounded-xl hover:bg-[#D41825] transition text-sm">{loading ? 'Authenticating...' : 'Sign In'}</button>
          </form>
        ) : (
          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
            <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={otpSent} required className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-sky-500" />
            {otpSent && (
              <input type="text" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-center font-mono tracking-widest focus:outline-none focus:border-sky-500" />
            )}
            <button type="submit" disabled={loading} className="w-full bg-[#F51F2D] text-white font-bold py-3 rounded-xl hover:bg-[#D41825] transition text-sm">{loading ? 'Processing...' : (otpSent ? 'Verify OTP' : 'Send OTP')}</button>
          </form>
        )}
        <p className="text-[10px] text-center text-gray-500 pt-2">
          Don't have an account? <a href="/register" className="text-[#F51F2D] font-bold hover:underline">Sign up now</a>
        </p>
      </div>
    </div>
  );
}
