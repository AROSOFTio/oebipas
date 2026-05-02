import { createContext, useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

export const AuthContext = createContext(null);

export const getRoleName = roleInput => {
  if (!roleInput) return '';
  if (typeof roleInput === 'string') return roleInput;
  if (typeof roleInput === 'object') {
    if (roleInput.role) return getRoleName(roleInput.role);
    return roleInput.name || roleInput.role_name || '';
  }
  return '';
};

const getHomePath = role => {
  const roleName = getRoleName(role);
  if (roleName === 'System administrators') return '/manager';
  if (roleName === 'Billing officers') return '/staff';
  return '/customer';
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
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
        const currentUser = response.data.user;
        setUser(currentUser);
        setRole(getRoleName(currentUser));
      } catch (error) {
        localStorage.removeItem('oebipas_token');
        setUser(null);
        setRole('');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('oebipas_token', token);
    setUser(userData);
    setRole(getRoleName(userData));
  };

  const logout = () => {
    localStorage.removeItem('oebipas_token');
    setUser(null);
    setRole('');
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, getHomePath }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
