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
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

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

  const openDeactivateModal = () => {
    setDeactivateError('');
    setShowDeactivateModal(true);
  };

  const closeDeactivateModal = () => {
    if (deactivating) return;
    setShowDeactivateModal(false);
  };

  const handleDeactivate = async () => {
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
      setDeactivateError(err.response?.data?.message || 'Unable to deactivate account.');
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
            onClick={openDeactivateModal}
            disabled={deactivating}
            className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            Deactivate / Unsubscribe
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

      {showDeactivateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="deactivate-account-title"
            className="w-full max-w-md animate-slide-up-fade rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.22)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              </svg>
            </div>
            <h3 id="deactivate-account-title" className="mt-5 text-xl font-bold text-slate-950">
              Deactivate / Unsubscribe Account
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Your account can only be deactivated if you have no outstanding bills.
            </p>
            {deactivateError ? (
              <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                <p>{deactivateError}</p>
                {outstandingTotal > 0 ? (
                  <p className="mt-1 text-rose-600">Outstanding balance: UGX {outstandingTotal.toLocaleString()}</p>
                ) : null}
              </div>
            ) : null}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeactivateModal}
                disabled={deactivating}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={deactivating}
                className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 disabled:opacity-60"
              >
                {deactivating ? 'Checking account...' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
