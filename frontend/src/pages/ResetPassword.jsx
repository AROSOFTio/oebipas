import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  
  // Real app would extract token from URL query params
  const token = 'simulated-token'; 

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/auth/reset-password', { token, new_password: password });
      setMessage(res.data.message);
    } catch (err) {
      setMessage('Failed to reset password.');
    }
  };

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-gray-500 mt-2">Enter your new password below.</p>
        </div>

        {message && <div className="bg-blue-50 text-blue-600 p-3 rounded-lg text-sm text-center">{message}</div>}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input 
              type="password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-border rounded-lg outline-none focus:border-primary" 
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            className="w-full py-2.5 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Update Password
          </button>
        </form>
        
        <div className="text-center text-sm">
          <Link to="/login" className="text-primary hover:underline">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
