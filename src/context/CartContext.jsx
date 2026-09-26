'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    const res = await api.get('/cart');
    if (res.success && res.data) {
      if (res.data.guest_token && typeof window !== 'undefined') {
        localStorage.setItem('guest_token', res.data.guest_token);
      }
      setCart(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1, variantId = null) => {
    setLoading(true);
    const qtyVal = parseInt(quantity, 10) || 1;
    const res = await api.post('/cart/items', { product_id: productId, qty: qtyVal, quantity: qtyVal, variant_id: variantId });
    if (res.success) {
      if (res.data?.guest_token && typeof window !== 'undefined') {
        localStorage.setItem('guest_token', res.data.guest_token);
      }
      await fetchCart();
    }
    setLoading(false);
    return res;
  };

  const updateQuantity = async (itemId, quantity) => {
    setLoading(true);
    const qtyVal = parseInt(quantity, 10) || 1;
    const res = await api.put(`/cart/items/${itemId}`, { qty: qtyVal, quantity: qtyVal });
    if (res.success) {
      await fetchCart();
    }
    setLoading(false);
    return res;
  };

  const removeFromCart = async (itemId) => {
    setLoading(true);
    const res = await api.delete(`/cart/items/${itemId}`);
    if (res.success) {
      await fetchCart();
    }
    setLoading(false);
    return res;
  };

  const clearCart = async () => {
    setLoading(true);
    const res = await api.delete('/cart');
    if (res.success) {
      setCart({ items: [], subtotal: 0, grand_total: 0 });
    }
    setLoading(false);
    return res;
  };

  const itemCount = cart?.items ? cart.items.reduce((sum, item) => sum + (item.qty || item.quantity || 1), 0) : 0;

  return (
    <CartContext.Provider value={{ cart, itemCount, loading, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
