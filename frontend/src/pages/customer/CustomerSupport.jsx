import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';

const categories = ['complaint', 'feedback', 'billing', 'payment', 'technical', 'other'];

const statusBadge = status => {
  const map = {
    open: 'bg-slate-100 text-slate-600',
    in_progress: 'bg-amber-100 text-amber-700',
    resolved: 'bg-emerald-100 text-emerald-700',
    closed: 'bg-slate-200 text-slate-700',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
};

export default function CustomerSupport() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ subject: '', category: 'complaint', message: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTickets = async () => {
    const response = await axiosInstance.get('/support/tickets/mine');
    setTickets(response.data.data);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSubmit = async event => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const response = await axiosInstance.post('/support/tickets', form);
      setMessage(response.data.message);
      setForm({ subject: '', category: 'complaint', message: '' });
      await loadTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit support ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Support" subtitle="Submit questions, complaints or billing concerns">
        {message ? <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        {error ? <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Subject</span>
            <input
              value={form.subject}
              onChange={event => setForm(current => ({ ...current, subject: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Category</span>
            <select
              value={form.category}
              onChange={event => setForm(current => ({ ...current, category: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Message</span>
            <textarea
              value={form.message}
              onChange={event => setForm(current => ({ ...current, message: event.target.value }))}
              className="min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3"
              required
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white md:col-span-2 disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Ticket History" subtitle="Status and staff responses">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 pr-4 font-medium text-slate-500">Subject</th>
                <th className="pb-3 pr-4 font-medium text-slate-500">Category</th>
                <th className="pb-3 pr-4 font-medium text-slate-500">Status</th>
                <th className="pb-3 pr-4 font-medium text-slate-500">Response</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-slate-400">No support tickets yet.</td>
                </tr>
              )}
              {tickets.map(ticket => (
                <tr key={ticket.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                  <td className="py-3 pr-4 font-medium text-slate-900">{ticket.subject}</td>
                  <td className="py-3 pr-4 capitalize text-slate-600">{ticket.category.replace('_', ' ')}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusBadge(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{ticket.staff_response || 'Pending response'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
