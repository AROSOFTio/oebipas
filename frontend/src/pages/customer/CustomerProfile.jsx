import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';

export default function CustomerProfile() {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    customer_number: '',
    meter_number: '',
  });
  const [message, setMessage] = useState('');

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

  return (
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
  );
}
