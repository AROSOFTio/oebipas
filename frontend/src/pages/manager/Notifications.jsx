import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';

export default function Notifications() {
  const [customers, setCustomers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({
    customer_id: '',
    title: '',
    message: '',
    channel: 'email',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([axiosInstance.get('/customers'), axiosInstance.get('/notifications')]).then(([customersResponse, notificationsResponse]) => {
      setCustomers(customersResponse.data.data);
      setNotifications(notificationsResponse.data.data);
    });
  }, []);

  const handleSubmit = async event => {
    event.preventDefault();
    const response = await axiosInstance.post('/notifications', form);
    setMessage(response.data.message);
    const notificationsResponse = await axiosInstance.get('/notifications');
    setNotifications(notificationsResponse.data.data);
    setForm({ customer_id: '', title: '', message: '', channel: 'email' });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard title="Send Notification" subtitle="Email is required and SMS can be simulated">
        {message ? <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Customer</span>
            <select
              value={form.customer_id}
              onChange={event => setForm(current => ({ ...current, customer_id: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              required
            >
              <option value="">Select customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.customer_number} - {customer.full_name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Channel</span>
            <select
              value={form.channel}
              onChange={event => setForm(current => ({ ...current, channel: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Title</span>
            <input
              value={form.title}
              onChange={event => setForm(current => ({ ...current, title: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Message</span>
            <textarea
              value={form.message}
              onChange={event => setForm(current => ({ ...current, message: event.target.value }))}
              className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3"
              required
            />
          </label>
          <button type="submit" className="rounded-2xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white">
            Send notification
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Recent Notifications" subtitle="Automatic and manual notifications sent through the system">
        <div className="space-y-3">
          {notifications.map(item => (
            <div key={item.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-900">{item.title}</p>
                <span className="capitalize text-slate-500">{item.channel.replace('_', ' ')}</span>
              </div>
              <p className="mt-2 text-slate-600">{item.message}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
