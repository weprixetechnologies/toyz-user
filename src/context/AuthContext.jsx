'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken, getUserProfile, setUserProfile, setRefreshToken } from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    const savedUser = getUserProfile();
    if (savedUser) setUser(savedUser);

    if (token) {
      api.get('/auth/me').then((res) => {
        if (res.success && res.data?.user) {
          setUser(res.data.user);
          setUserProfile(res.data.user);
        } else if (res.status === 401) {
          logout();
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData, refreshToken) => {
    if (refreshToken) setRefreshToken(refreshToken);
    setAuthToken(token);
    setUser(userData);
    setUserProfile(userData);
  };

  const logout = () => {
    setRefreshToken('');
    setAuthToken('');
    setUserProfile(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isReseller: user?.role === 'retailer' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
