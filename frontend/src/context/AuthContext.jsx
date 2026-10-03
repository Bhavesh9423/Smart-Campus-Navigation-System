import React, { createContext, useContext, useState, useEffect } from 'react';
import { campusService } from '../services/campusService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campusnav_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('campusnav_token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await campusService.login(username, password);
      setToken(data.access_token);
      const userInfo = { username: data.username, role: data.role };
      setUser(userInfo);
      localStorage.setItem('campusnav_token', data.access_token);
      localStorage.setItem('campusnav_user', JSON.stringify(userInfo));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Please check credentials.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('campusnav_token');
    localStorage.removeItem('campusnav_user');
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
