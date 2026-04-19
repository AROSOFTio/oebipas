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
  meter_number: '',
};

export default function Register() {
  const [customerType, setCustomerType] = useState('new');
  const [form, setForm] = useState({ ...initialForm });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const updateField = event => {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleToggle = type => {
    if (type !== customerType) {
      setCustomerType(type);
      setForm({ ...initialForm });
      setError('');
      setMessage('');
    }
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const response = await axiosInstance.post('/auth/register', {
        ...form,
        customer_type: customerType,
      });
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--page-bg)] px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-3xl border border-[var(--panel-soft)] bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--secondary)]">ELECTRICITY PORTAL</p>
          <h1 className="mt-2 text-3xl font-bold text-[var(--text-strong)]">Create Account</h1>
        </div>

        <div className="flex rounded-2xl bg-[var(--accent-soft)] p-1 w-full max-w-sm mx-auto mb-8 relative">
          <button
            type="button"
            onClick={() => handleToggle('new')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${
              customerType === 'new' ? 'bg-white text-[var(--panel-strong)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-strong)]'
            }`}
          >
            New Connection
          </button>
          <button
            type="button"
            onClick={() => handleToggle('existing')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${
              customerType === 'existing' ? 'bg-white text-[var(--panel-strong)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-strong)]'
            }`}
          >
            Existing Customer
          </button>
        </div>

        {message ? <div className="mb-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        {error ? <div className="mb-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          {customerType === 'existing' && (
            <div className="md:col-span-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[var(--text-strong)]">Meter Number</span>
                <input
                  name="meter_number"
                  type="text"
                  value={form.meter_number}
                  onChange={updateField}
                  required
                  placeholder="e.g. MTR-0001"
                  className="w-full rounded-xl border border-[var(--panel-soft)] bg-[var(--page-bg)] px-4 py-3 text-sm outline-none transition focus:border-[var(--secondary)] focus:bg-white"
                />
              </label>
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                Provide your existing meter number to link this web account to your electricity billing profile.
              </p>
            </div>
          )}

          {[
            ['full_name', 'Full Name (*)', 'text', true],
            ['username', 'Username (*)', 'text', true],
            ['email', 'Email Address (*)', 'email', true],
            ['phone', 'Phone Number (*)', 'text', true],
            ['password', 'Password (*)', 'password', true],
          ].map(([name, label, type, required]) => (
            <label key={name} className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--text-strong)]">{label}</span>
              <input
                name={name}
                type={type}
                value={form[name]}
                onChange={updateField}
                required={required}
                className="w-full rounded-xl border border-[var(--panel-soft)] bg-[var(--page-bg)] px-4 py-3 text-sm outline-none transition focus:border-[var(--secondary)] focus:bg-white"
              />
            </label>
          ))}

          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-medium text-[var(--text-strong)]">Physical Address</span>
            <textarea
              name="address"
              value={form.address}
              onChange={updateField}
              required
              className="min-h-[100px] w-full rounded-xl border border-[var(--panel-soft)] bg-[var(--page-bg)] px-4 py-3 text-sm outline-none transition focus:border-[var(--secondary)] focus:bg-white"
            />
          </label>

          <div className="md:col-span-2 mt-2 flex flex-col sm:flex-row items-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto rounded-xl bg-[var(--panel-strong)] px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--secondary)] disabled:opacity-60"
            >
              {submitting ? 'Processing...' : customerType === 'existing' ? 'Link Account' : 'Apply for Connection'}
            </button>
            <div className="text-sm text-[var(--text-muted)]">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[var(--secondary)] hover:text-[var(--panel-strong)] transition">
                Log in
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
