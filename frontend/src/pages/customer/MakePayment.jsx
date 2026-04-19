import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';
import { subscribeToPaymentSync } from '../../utils/paymentSync';

export default function MakePayment() {
  const [bills, setBills] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ bill_id: '', amount: '' });

  useEffect(() => {
    const loadBills = async () => {
      const response = await axiosInstance.get('/bills/mine');
      setBills(response.data.data.filter(item => Number(item.balance_due) > 0));
    };

    loadBills();
    return subscribeToPaymentSync(loadBills);
  }, []);

  const handleBillChange = event => {
    const selected = bills.find(item => String(item.id) === event.target.value);
    setForm(current => ({
      ...current,
      bill_id: event.target.value,
      amount: selected ? selected.balance_due : '',
    }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      const response = await axiosInstance.post('/payments/initiate', {
        bill_id: form.bill_id,
        amount: form.amount,
      });
      setMessage('Redirecting to Pesapal secure checkout...');
      window.location.href = response.data.data.redirect_url;
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to redirect to Pesapal.');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[2rem] bg-[var(--panel-strong)] px-6 py-5 text-white shadow-soft">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-200">Payment Gateway</p>
          <h2 className="mt-1 text-xl font-semibold">Pesapal Secure Checkout</h2>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-5 shadow-soft">
          <p className="text-sm text-slate-500">Outstanding Bills</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{bills.length}</p>
        </div>
      </div>

      {/* Payment Form */}
      <SectionCard title="Pay Bill">
        {message && (
          <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>
        )}
        {error && (
          <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Outstanding bill</span>
            <select
              value={form.bill_id}
              onChange={handleBillChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--panel-strong)]"
              required
            >
              <option value="">Select bill</option>
              {bills.map(bill => (
                <option key={bill.id} value={bill.id}>
                  {bill.bill_number} — UGX {Number(bill.balance_due).toLocaleString()}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Amount (UGX)</span>
            <input
              type="number"
              value={form.amount}
              onChange={event => setForm(current => ({ ...current, amount: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--panel-strong)]"
              min="1"
              required
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? 'Connecting to Pesapal...' : 'Continue to Pesapal'}
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
