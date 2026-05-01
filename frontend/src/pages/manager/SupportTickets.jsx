import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';

const statuses = ['open', 'in_progress', 'resolved', 'closed'];

const statusBadge = status => {
  const map = {
    open: 'bg-slate-100 text-slate-600',
    in_progress: 'bg-amber-100 text-amber-700',
    resolved: 'bg-emerald-100 text-emerald-700',
    closed: 'bg-slate-200 text-slate-700',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
};

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [status, setStatus] = useState('open');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadTickets = async () => {
    const response = await axiosInstance.get('/support/tickets');
    setTickets(response.data.data);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const selectTicket = ticket => {
    setSelectedTicket(ticket);
    setResponseText(ticket.staff_response || '');
    setStatus(ticket.status || 'open');
    setMessage('');
    setError('');
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (!selectedTicket) return;

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await axiosInstance.put(`/support/tickets/${selectedTicket.id}`, {
        status,
        staff_response: responseText,
      });
      setMessage(response.data.message);
      await loadTickets();
      setSelectedTicket(current => (current ? { ...current, status, staff_response: responseText } : current));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update support ticket.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Support Tickets" subtitle="Customer support requests and responses">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 pr-4 font-medium text-slate-500">Customer</th>
                <th className="pb-3 pr-4 font-medium text-slate-500">Subject</th>
                <th className="pb-3 pr-4 font-medium text-slate-500">Category</th>
                <th className="pb-3 pr-4 font-medium text-slate-500">Status</th>
                <th className="pb-3 font-medium text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-slate-400">No support tickets yet.</td>
                </tr>
              )}
              {tickets.map(ticket => (
                <tr key={ticket.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-slate-900">{ticket.customer_name}</p>
                    <p className="text-xs text-slate-400">{ticket.customer_number}</p>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{ticket.subject}</td>
                  <td className="py-3 pr-4 capitalize text-slate-600">{ticket.category.replace('_', ' ')}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusBadge(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => selectTicket(ticket)}
                      className="rounded-full bg-[var(--panel-strong)] px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Respond
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {selectedTicket ? (
        <SectionCard title="Ticket Response" subtitle={selectedTicket.subject}>
          {message ? <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
          {error ? <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          <div className="mb-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {selectedTicket.message}
          </div>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Status</span>
              <select
                value={status}
                onChange={event => setStatus(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              >
                {statuses.map(item => (
                  <option key={item} value={item}>
                    {item.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Response</span>
              <textarea
                value={responseText}
                onChange={event => setResponseText(event.target.value)}
                className="min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white md:col-span-2 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Update Ticket'}
            </button>
          </form>
        </SectionCard>
      ) : null}
    </div>
  );
}
