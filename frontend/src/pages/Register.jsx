import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

export default function Register() {
  const [formData, setFormData] = useState({ full_name: '', username: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      await axiosInstance.post('/auth/register', formData);
      setSuccess("Account created successfully! You can now log in.");
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-500 mt-2">Sign up to access the customer portal</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm text-center">{success}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input 
              type="text" required
              value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="mt-1 block w-full px-4 py-2 border border-border rounded-lg outline-none focus:border-primary" 
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input 
              type="text" required
              value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="mt-1 block w-full px-4 py-2 border border-border rounded-lg outline-none focus:border-primary" 
              placeholder="johndoe123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input 
              type="email" required
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="mt-1 block w-full px-4 py-2 border border-border rounded-lg outline-none focus:border-primary" 
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input 
              type="tel" 
              value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="mt-1 block w-full px-4 py-2 border border-border rounded-lg outline-none focus:border-primary" 
              placeholder="0700000000"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input 
                type="password" required
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="mt-1 block w-full px-4 py-2 border border-border rounded-lg outline-none focus:border-primary" 
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm</label>
              <input 
                type="password" required
                value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="mt-1 block w-full px-4 py-2 border border-border rounded-lg outline-none focus:border-primary" 
                placeholder="••••••••"
              />
            </div>
          </div>
          <button 
            type="submit"
            className="w-full py-2.5 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Create Account
          </button>
        </form>
        
        <div className="text-center text-sm">
          <span className="text-gray-500">Already have an account? </span>
          <Link to="/login" className="text-primary hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
