import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';

export default function MakePayment() {
  const [bills, setBills] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    bill_id: '',
    amount: '',
    payment_method: 'mobile_money',
    demo_status: 'successful',
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
    const initiate = await axiosInstance.post('/payments/initiate', {
      bill_id: form.bill_id,
      amount: form.amount,
      payment_method: form.payment_method,
    });

    await axiosInstance.post('/payments/callback', {
      transaction_reference: initiate.data.data.transaction_reference,
      status: form.demo_status,
    });

    setMessage(`Payment ${form.demo_status}. Callback handled for ${initiate.data.data.payment_reference}.`);
    setForm({ bill_id: '', amount: '', payment_method: 'mobile_money', demo_status: 'successful' });
    loadBills();
  };

  return (
    <SectionCard title="Pay Bill" subtitle="Demonstrates payment initiation, callback handling and automatic balance update">
      {message ? <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
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
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Payment method</span>
          <select
            value={form.payment_method}
            onChange={event => setForm(current => ({ ...current, payment_method: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
          >
            <option value="mobile_money">Mobile money</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="card">Card</option>
            <option value="pesapal">Pesapal</option>
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">Demo callback result</span>
          <select
            value={form.demo_status}
            onChange={event => setForm(current => ({ ...current, demo_status: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3"
          >
            <option value="successful">Successful callback</option>
            <option value="failed">Failed callback</option>
          </select>
        </label>
        <button type="submit" className="rounded-2xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white md:col-span-2">
          Submit payment
        </button>
      </form>
    </SectionCard>
  );
}
