import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, getHomePath } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async event => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
      navigate(getHomePath(response.data.user.role));
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--page-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-[var(--panel-soft)] bg-white p-10 shadow-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--accent-soft)]">
          <img src="/logo.png" alt="UEDCL logo" className="h-10 w-10 object-contain" />
        </div>
        
        <h1 className="mt-6 text-2xl font-bold text-[var(--text-strong)]">Welcome Back</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Sign in to your account</p>

        {error ? <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 text-left">{error}</div> : null}

        <form className="mt-8 space-y-5 text-left" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[var(--text-strong)]">Email or username</span>
            <input
              className="w-full rounded-xl border border-[var(--panel-soft)] bg-[var(--page-bg)] px-4 py-3 text-sm outline-none transition focus:border-[var(--secondary)] focus:bg-white"
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
              placeholder="Enter your credentials"
            />
          </label>
          <label className="block">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--text-strong)]">Password</span>
              <Link to="/forgot-password" className="text-sm font-medium text-[var(--secondary)] hover:text-[var(--panel-strong)] transition">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              className="w-full rounded-xl border border-[var(--panel-soft)] bg-[var(--page-bg)] px-4 py-3 text-sm outline-none transition focus:border-[var(--secondary)] focus:bg-white"
              value={password}
              onChange={event => setPassword(event.target.value)}
              required
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-[var(--panel-strong)] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--secondary)] disabled:opacity-60"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-sm text-[var(--text-muted)]">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-[var(--secondary)] hover:text-[var(--panel-strong)] transition">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
