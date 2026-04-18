import { createContext, useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

export const AuthContext = createContext(null);

const getHomePath = role => {
  if (role === 'Branch Manager') return '/manager';
  if (role === 'Billing Staff') return '/staff';
  return '/customer';
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('oebipas_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem('oebipas_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('oebipas_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('oebipas_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getHomePath }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
