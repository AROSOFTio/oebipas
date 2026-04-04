import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const storedToken = localStorage.getItem('oebipas_token');
      if (storedToken) {
        try {
          const res = await axiosInstance.get('/auth/me');
          setUser(res.data.user);
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem('oebipas_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkUser();
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
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
