import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';

export default function MakePayment() {
  const [bills, setBills] = useState([]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    bill_id: '',
    amount: '',
  });

  const loadBills = async () => {
    const response = await axiosInstance.get('/bills/mine');
    setBills(response.data.data.filter(item => Number(item.balance_due) > 0));
  };

  useEffect(() => {
    loadBills();
  }, []);

  const handleSubmit = async event => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const initiate = await axiosInstance.post('/payments/initiate', {
        bill_id: form.bill_id,
        amount: form.amount,
      });

      setMessage('Redirecting you to Pesapal secure checkout...');
      window.location.href = initiate.data.data.redirect_url;
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to redirect to Pesapal.');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[2rem] bg-[var(--panel-strong)] p-6 text-white shadow-soft">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-200">Payment Gateway</p>
          <h2 className="mt-3 text-2xl font-semibold">Pesapal Only</h2>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            All customer payments now redirect to Pesapal secure checkout using your merchant consumer key and secret.
          </p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <p className="text-sm font-medium text-slate-500">Outstanding Bills</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{bills.length}</p>
          <p className="mt-2 text-xs text-slate-500">Only unpaid balances can be submitted to Pesapal.</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <p className="text-sm font-medium text-slate-500">Secure Return</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">Auto Verify</p>
          <p className="mt-2 text-xs text-slate-500">After payment, the system verifies Pesapal status and updates your bill automatically.</p>
        </div>
      </div>

      <SectionCard title="Pay Bill" subtitle="Redirect to Pesapal secure checkout and return for automatic verification">
        {message ? <div className="mb-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</div> : null}
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">Outstanding bill</span>
          <select
            value={form.bill_id}
            onChange={event => {
              const selected = bills.find(item => String(item.id) === event.target.value);
              setForm(current => ({
                ...current,
                bill_id: event.target.value,
                amount: selected ? selected.balance_due : '',
              }));
            }}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            required
          >
            <option value="">Select bill</option>
            {bills.map(bill => (
              <option key={bill.id} value={bill.id}>
                {bill.bill_number} - UGX {Number(bill.balance_due).toLocaleString()}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Amount</span>
          <input
            type="number"
            value={form.amount}
            onChange={event => setForm(current => ({ ...current, amount: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            min="1"
            required
          />
        </label>
        <div className="rounded-3xl border border-slate-200 bg-[var(--panel-soft)]/30 p-5 md:col-span-1">
          <p className="text-sm font-medium text-slate-500">Payment method</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">Pesapal</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">The customer will continue on the Pesapal hosted checkout page.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 md:col-span-2">
          <p className="text-sm font-medium text-slate-500">Before you continue</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Use the exact outstanding amount or a valid partial amount.</li>
            <li>Make sure your browser allows redirect to the Pesapal checkout page.</li>
            <li>After payment, you will be redirected back for verification.</li>
          </ul>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-2xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white md:col-span-2 disabled:opacity-60"
        >
          {submitting ? 'Connecting to Pesapal...' : 'Continue to Pesapal'}
        </button>
      </form>
    </SectionCard>
    </div>
  );
}
