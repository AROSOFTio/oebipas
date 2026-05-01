import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';
import { AuthContext } from '../../context/AuthContext';

export default function CustomerProfile() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    customer_number: '',
    meter_number: '',
  });
  const [message, setMessage] = useState('');
  const [deactivateError, setDeactivateError] = useState('');
  const [outstandingTotal, setOutstandingTotal] = useState(0);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    axiosInstance.get('/customers/me').then(response => {
      setForm(current => ({ ...current, ...response.data.data }));
    });
  }, []);

  const handleSubmit = async event => {
    event.preventDefault();
    const response = await axiosInstance.put('/customers/me', form);
    setMessage(response.data.message);
  };

  const handleDeactivate = async () => {
    const confirmed = window.confirm('Deactivate your account? You will be signed out if the account has no outstanding bills.');
    if (!confirmed) return;

    setDeactivating(true);
    setDeactivateError('');
    setOutstandingTotal(0);

    try {
      await axiosInstance.post('/customers/me/deactivate');
      logout();
      navigate('/login', { replace: true });
    } catch (err) {
      const total = Number(err.response?.data?.total_outstanding || 0);
      setOutstandingTotal(total);
      setDeactivateError(
        total > 0
          ? `You cannot deactivate because you have outstanding bills totaling UGX ${total.toLocaleString()}.`
          : err.response?.data?.message || 'Unable to deactivate account.'
      );
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard title="My Profile" subtitle="Update your personal contact details">
        {message ? <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Customer number</span>
            <input value={form.customer_number || ''} disabled className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Meter number</span>
            <input value={form.meter_number || ''} disabled className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
            <input
              value={form.full_name || ''}
              onChange={event => setForm(current => ({ ...current, full_name: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Phone</span>
            <input
              value={form.phone || ''}
              onChange={event => setForm(current => ({ ...current, phone: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Address</span>
            <textarea
              value={form.address || ''}
              onChange={event => setForm(current => ({ ...current, address: event.target.value }))}
              className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3"
              required
            />
          </label>
          <button type="submit" className="rounded-2xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white md:col-span-2">
            Update profile
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Deactivate / Unsubscribe" subtitle="Close access after all balances are cleared">
        {deactivateError ? (
          <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{deactivateError}</div>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleDeactivate}
            disabled={deactivating}
            className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {deactivating ? 'Checking account...' : 'Deactivate / Unsubscribe'}
          </button>
          {outstandingTotal > 0 ? (
            <button
              type="button"
              onClick={() => navigate('/customer/bills')}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Pay Outstanding Bills
            </button>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}
