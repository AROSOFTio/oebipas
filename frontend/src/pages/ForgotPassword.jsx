import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [tokenPreview, setTokenPreview] = useState('');

  const handleSubmit = async event => {
    event.preventDefault();
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    setMessage(response.data.message);
    setTokenPreview(response.data.reset_token || '');
  };

  return (
    <div className="min-h-screen bg-[var(--page-bg)] px-4 py-10">
      <div className="mx-auto max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Forgot password</h1>
        <p className="mt-2 text-sm text-slate-500">A tokenised reset link is sent through the notification system for email verification.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--panel-strong)]"
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
            />
          </label>
          <button type="submit" className="w-full rounded-2xl bg-[var(--panel-strong)] px-4 py-3 text-sm font-semibold text-white">
            Send reset link
          </button>
        </form>

        {message ? <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</div> : null}
        {tokenPreview ? (
          <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Demo reset token: <span className="font-mono">{tokenPreview}</span>
          </div>
        ) : null}

        <Link to="/login" className="mt-6 inline-block text-sm font-medium text-[var(--panel-strong)]">
          Return to login
        </Link>
      </div>
    </div>
  );
}
