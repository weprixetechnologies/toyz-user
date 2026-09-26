'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/wishlist');
      if (res.success) {
        setWishlist(res.data?.items || res.data || []);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const addToWishlist = async (productId) => {
    if (!user) {
      alert("Please login to add to wishlist.");
      return { success: false, message: 'Not logged in' };
    }
    const res = await api.post('/wishlist', { product_id: productId });
    if (res.success) {
      await fetchWishlist();
    }
    return res;
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return { success: false, message: 'Not logged in' };
    const res = await api.delete(`/wishlist/${productId}`);
    if (res.success) {
      await fetchWishlist();
    }
    return res;
  };
  
  const toggleWishlist = async (productId) => {
    if (!user) {
      alert("Please login to add to wishlist.");
      return { success: false, message: 'Not logged in' };
    }
    const isInWishlist = wishlist.some(item => item.product_id === productId || item.id === productId);
    if (isInWishlist) {
      return removeFromWishlist(productId);
    } else {
      return addToWishlist(productId);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.product_id === productId || item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, loading, fetchWishlist, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
