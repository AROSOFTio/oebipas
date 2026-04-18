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
    <div className="min-h-screen bg-[var(--page-bg)] px-4 py-10">
      <div className="mx-auto max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Secure Access</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm text-slate-500">Use your Branch Manager, Billing Staff, or Customer credentials.</p>

        {error ? <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Email or username</span>
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--panel-strong)]"
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="block">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <Link to="/forgot-password" className="text-sm text-[var(--panel-strong)]">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--panel-strong)]"
              value={password}
              onChange={event => setPassword(event.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-[var(--panel-strong)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500">
          Need a customer account?{' '}
          <Link to="/register" className="font-medium text-[var(--panel-strong)]">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
