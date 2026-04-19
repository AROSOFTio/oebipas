import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const initialForm = {
  full_name: '',
  username: '',
  email: '',
  password: '',
  phone: '',
  address: '',
};

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const updateField = event => {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const response = await axiosInstance.post('/auth/register', form);
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--page-bg)] px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Customer Registration</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Create customer account</h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter your personal details. Your meter will be assigned by our billing staff.
        </p>

        {message ? <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        {error ? <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          {[
            ['full_name', 'Full name', 'text', true],
            ['username', 'Username', 'text', true],
            ['email', 'Email', 'email', true],
            ['phone', 'Phone number', 'text', false],
            ['password', 'Password', 'password', true],
          ].map(([name, label, type, required]) => (
            <label key={name} className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
              <input
                name={name}
                type={type}
                value={form[name]}
                onChange={updateField}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--panel-strong)]"
                required={required}
              />
            </label>
          ))}

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Address</span>
            <textarea
              name="address"
              value={form.address}
              onChange={updateField}
              className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--panel-strong)]"
              required
            />
          </label>

          <div className="md:col-span-2 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-[var(--panel-strong)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
            <Link to="/login" className="text-sm font-medium text-[var(--panel-strong)]">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
