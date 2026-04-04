import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login for phase 1
    navigate('/admin'); 
  };

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Please sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email/Account Number</label>
            <input 
              type="text" 
              className="mt-1 block w-full px-4 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary outline-none transition-colors" 
              placeholder="admin@oebipas.local"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
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
          <Link to="/" className="text-primary hover:underline">Return Home</Link>
        </div>
      </div>
    </div>
  );
}
