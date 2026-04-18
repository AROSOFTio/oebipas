import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const initialToken = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async event => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axiosInstance.post('/auth/reset-password', {
        token,
        new_password: newPassword,
      });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--page-bg)] px-4 py-10">
      <div className="mx-auto max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Reset password</h1>
        <p className="mt-2 text-sm text-slate-500">Use the token from the reset email to complete verification and set a new password.</p>

        {message ? <div className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        {error ? <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Reset token</span>
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--panel-strong)]"
              value={token}
              onChange={event => setToken(event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">New password</span>
            <input
              type="password"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--panel-strong)]"
              value={newPassword}
              onChange={event => setNewPassword(event.target.value)}
              required
            />
          </label>
          <button type="submit" className="w-full rounded-2xl bg-[var(--panel-strong)] px-4 py-3 text-sm font-semibold text-white">
            Reset password
          </button>
        </form>
      </div>
    </div>
  );
}
