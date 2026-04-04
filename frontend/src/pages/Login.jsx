import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);

      if (res.data.user.role === 'Customer') {
        navigate('/customer');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 space-y-6">
        
        {/* Logo — full image, no crop, white bg for transparency */}
        <div className="text-center">
          <div className="mx-auto mb-2 w-36 h-36 bg-white rounded-full flex items-center justify-center">
            <img
              src="/logo.png"
              alt="OEBIPAS Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-gray-500 text-sm">Sign in to your account</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email / Username</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary outline-none transition-colors"
              placeholder="admin@oebipas.local"
            />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Sign In
          </button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-500">Don't have an account? </span>
          <Link to="/register" className="text-primary hover:underline">Register</Link>
        </div>
      </div>
    </div>
  );
}
