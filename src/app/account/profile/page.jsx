'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Camera, Save, User, Mail, Phone, Lock, Edit3 } from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: '',
    cover_image: ''
  });

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        cover_image: user.cover_image || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading('Uploading image...');
    try {
      const form = new FormData();
      form.append('image', file);
      
      const res = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.success && res.data?.url) {
        setFormData(prev => ({ ...prev, [type]: res.data.url }));
        toast.success('Image uploaded successfully', { id: toastId });
      } else {
        throw new Error(res.message || 'Failed to upload');
      }
    } catch (err) {
      toast.error(err.message || 'Image upload failed', { id: toastId });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', formData);
      if (res.success) {
        toast.success('Profile updated successfully!');
        // Ideally reload user context here. We can just mutate what we have:
        if (setUser) {
          setUser({ ...user, ...formData });
        }
      } else {
        toast.error(res.message || 'Failed to update profile');
      }
    } catch (err) {
      toast.error('An error occurred while saving.');
    }
    setLoading(false);
  };

  if (!user) return <div className="animate-pulse h-96 bg-gray-50 rounded-2xl"></div>;

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500">Manage your personal information and profile appearance.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        
        {/* COVER IMAGE */}
        <div className="h-48 md:h-64 bg-slate-800 relative group">
          {formData.cover_image ? (
            <img src={formData.cover_image} className="w-full h-full object-cover opacity-80" alt="Cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white/20 font-bold text-2xl tracking-widest uppercase">No Cover Image</span>
            </div>
          )}
          
          <button 
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-gray-900 px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-white transition flex items-center gap-2 z-10"
          >
            <Camera size={16} /> <span className="hidden sm:inline">Change Cover</span>
          </button>
          <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover_image')} />
        </div>

        <div className="px-6 md:px-10 pb-10 relative">
          
          {/* AVATAR */}
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white bg-indigo-100 -mt-16 mb-6 shadow-md overflow-hidden group flex-shrink-0 z-10 flex items-center justify-center">
            {formData.avatar ? (
              <img src={formData.avatar} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              <span className="text-4xl font-black text-indigo-600">{formData.name?.charAt(0) || 'U'}</span>
            )}
            
            <button 
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera size={24} className="text-white" />
            </button>
            <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
          </div>

          {/* EDIT FORM */}
          <form onSubmit={handleSaveProfile} className="max-w-2xl space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={16} className="text-gray-400" />
                  </div>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 font-medium"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Email Address (Read-only)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-400" />
                  </div>
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    disabled
                    className="w-full pl-10 pr-3 py-3 border border-gray-100 bg-gray-50 rounded-xl text-gray-500 font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Role</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    value={user?.role?.toUpperCase() || 'CUSTOMER'} 
                    disabled
                    className="w-full pl-10 pr-3 py-3 border border-gray-100 bg-gray-50 rounded-xl text-indigo-600 font-black cursor-not-allowed"
                  />
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
              </button>
            </div>
            
          </form>

        </div>
      </div>
    </div>
  );
}
