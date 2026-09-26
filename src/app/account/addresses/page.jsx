'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pin_code: '',
    is_default: false
  });
  const [saving, setSaving] = useState(false);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/addresses');
      if (res.success) {
        const data = res.data;
        const addrs = Array.isArray(data) ? data : (data?.addresses || Object.values(data || {}));
        setAddresses(Array.isArray(addrs) ? addrs : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/users/addresses', form);
      if (res.success) {
        setShowModal(false);
        setForm({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pin_code: '', is_default: false });
        fetchAddresses();
      }
    } catch (err) {
      alert(err.message || 'Failed to add address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await api.delete(`/users/addresses/${id}`);
      if (res.success) fetchAddresses();
    } catch (err) {
      alert(err.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await api.post(`/users/addresses/${id}/default`);
      if (res.success) fetchAddresses();
    } catch (err) {
      alert(err.message || 'Failed to set default address');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800">Saved Addresses</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              + Add New Address
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-white rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <div className="bg-white p-8 rounded-lg text-center border border-slate-200">
              <p className="text-slate-500">No addresses saved yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm relative">
                  {addr.is_default && (
                    <span className="absolute top-4 right-4 text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                  <p className="font-bold text-slate-800">{addr.name}</p>
                  <p className="text-sm text-slate-600 mt-1">{addr.line1}, {addr.line2}</p>
                  <p className="text-sm text-slate-600">{addr.city}, {addr.state} - {addr.pin_code}</p>
                  <p className="text-sm text-slate-500 mt-2">Phone: {addr.phone}</p>
                  <div className="flex gap-4 mt-4 text-sm font-medium border-t pt-3">
                    {!addr.is_default && (
                      <button onClick={() => handleSetDefault(addr.id)} className="text-indigo-600 hover:underline">
                        Set Default
                      </button>
                    )}
                    <button onClick={() => handleDelete(addr.id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-slate-800">Add Address</h2>
                <form onSubmit={handleSave} className="space-y-3">
                  <input
                    placeholder="Full Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                    required
                  />
                  <input
                    placeholder="Phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                    required
                  />
                  <input
                    placeholder="Address Line 1"
                    value={form.line1}
                    onChange={(e) => setForm({ ...form, line1: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                    required
                  />
                  <input
                    placeholder="Address Line 2"
                    value={form.line2}
                    onChange={(e) => setForm({ ...form, line2: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="City"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full border rounded px-3 py-2 text-sm"
                      required
                    />
                    <input
                      placeholder="State"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="w-full border rounded px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <input
                    placeholder="Pincode"
                    value={form.pin_code}
                    onChange={(e) => setForm({ ...form, pin_code: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                    required
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="def"
                      checked={form.is_default}
                      onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                    />
                    <label htmlFor="def" className="text-sm text-slate-700">Set as default address</label>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border text-slate-600 rounded text-sm hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                    >
                      {saving ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
