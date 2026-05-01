import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const initialForm = {
  meter_number: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  password: '',
};

export default function Register() {
  const [form, setForm] = useState({ ...initialForm });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [lookupMessage, setLookupMessage] = useState('');
  const [lookupStatus, setLookupStatus] = useState('idle');
  const [meterRegistered, setMeterRegistered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const updateField = event => {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
    if (event.target.name === 'meter_number') {
      setMeterRegistered(false);
      setLookupMessage('');
    }
  };

  useEffect(() => {
    const meterNumber = form.meter_number.trim();

    if (!meterNumber) {
      setLookupStatus('idle');
      setLookupMessage('');
      setMeterRegistered(false);
      return undefined;
    }

    setLookupStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const response = await axiosInstance.get(`/auth/meter-lookup/${encodeURIComponent(meterNumber)}`);
        const { found, registered, customer } = response.data;

        if (found && registered) {
          setMeterRegistered(true);
          setLookupMessage('This meter is already registered. Please login.');
          setLookupStatus('registered');
          return;
        }

        if (found) {
          setMeterRegistered(false);
          setLookupMessage('Meter found. Complete registration.');
          setLookupStatus('found');
          setForm(current => ({
            ...current,
            name: customer?.full_name || current.name,
            email: customer?.email || current.email,
            phone: customer?.phone || current.phone,
            address: customer?.address || current.address,
          }));
          return;
        }

        setMeterRegistered(false);
        setLookupMessage('');
        setLookupStatus('not_found');
      } catch (err) {
        setMeterRegistered(false);
        setLookupMessage(err.response?.data?.message || 'Unable to look up meter number.');
        setLookupStatus('error');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form.meter_number]);

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const response = await axiosInstance.post('/auth/register', {
        meter_number: form.meter_number,
        full_name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        password: form.password,
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

        {message ? <div className="mb-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        {error ? <div className="mb-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        {lookupMessage ? (
          <div className={`mb-5 rounded-2xl px-4 py-3 text-sm ${meterRegistered ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {lookupMessage}
          </div>
        ) : null}

        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block md:col-span-2">
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
            {lookupStatus === 'checking' ? <p className="mt-1.5 text-xs text-[var(--text-muted)]">Checking meter number...</p> : null}
          </label>

          {[
            ['name', 'Name (*)', 'text'],
            ['email', 'Email Address (*)', 'email'],
            ['phone', 'Phone Number (*)', 'text'],
            ['password', 'Password (*)', 'password'],
          ].map(([name, label, type]) => (
            <label key={name} className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--text-strong)]">{label}</span>
              <input
                name={name}
                type={type}
                value={form[name]}
                onChange={updateField}
                required
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
              disabled={submitting || meterRegistered || lookupStatus === 'checking'}
              className="w-full sm:w-auto rounded-xl bg-[var(--panel-strong)] px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--secondary)] disabled:opacity-60"
            >
              {submitting ? 'Processing...' : 'Create Account'}
            </button>
            <div className="text-sm text-[var(--text-muted)]">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-[var(--secondary)] hover:text-[var(--panel-strong)] transition">
                Login
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
