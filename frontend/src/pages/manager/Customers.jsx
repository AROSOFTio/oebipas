import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';

const emptyForm = {
  id: '',
  full_name: '',
  email: '',
  phone: '',
  address: '',
  meter_number: '',
  connection_status: 'pending',
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadCustomers = async () => {
    const response = await axiosInstance.get('/customers');
    setCustomers(response.data.data);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const updateField = event => {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      if (form.id) {
        await axiosInstance.put(`/customers/${form.id}`, form);
        setMessage('Customer record updated successfully.');
      } else {
        await axiosInstance.post('/customers', form);
        setMessage('Customer created and customer number assigned.');
      }
      setForm(emptyForm);
      loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Remove this customer record entirely?')) return;
    setError('');
    try {
      await axiosInstance.delete(`/customers/${id}`);
      setMessage('Customer removed.');
      loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove customer.');
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard title="Customer Record">
        {message && <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
        {error && <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--panel-strong)]">Personal Information</p>
          {[
            ['full_name', 'Full name (*)', true],
            ['email', 'Email Address (*)', true],
            ['phone', 'Phone Number (*)', true],
          ].map(([name, label, required]) => (
            <label key={name} className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--text-strong)]">{label}</span>
              <input
                name={name}
                value={form[name]}
                onChange={updateField}
                className="w-full rounded-xl border border-[var(--panel-soft)] px-4 py-3 text-sm outline-none transition focus:border-[var(--secondary)] bg-white"
                required={required}
              />
            </label>
          ))}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[var(--text-strong)]">Address</span>
            <textarea
              name="address"
              value={form.address}
              onChange={updateField}
              className="min-h-[80px] w-full rounded-xl border border-[var(--panel-soft)] px-4 py-3 text-sm outline-none transition focus:border-[var(--secondary)] bg-white"
              required
            />
          </label>

          <p className="pt-2 text-xs font-bold uppercase tracking-widest text-[var(--panel-strong)]">System Settings</p>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[var(--text-strong)]">
              Meter Number
            </span>
            <input
              name="meter_number"
              value={form.meter_number || ''}
              onChange={updateField}
              placeholder="e.g. MTR-9002 (Leave blank if pending)"
              className="w-full rounded-xl border border-[var(--panel-soft)] bg-[var(--page-bg)] px-4 py-3 text-sm outline-none transition focus:border-[var(--secondary)] focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[var(--text-strong)]">Connection status</span>
            <select
              name="connection_status"
              value={form.connection_status}
              onChange={updateField}
              className="w-full rounded-xl border border-[var(--panel-soft)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--secondary)]"
            >
              <option value="pending">Pending setup</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="rounded-xl bg-[var(--panel-strong)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--secondary)]">
              {form.id ? 'Save Changes' : 'Create Customer'}
            </button>
            <button
              type="button"
              onClick={() => { setForm(emptyForm); setMessage(''); setError(''); }}
              className="rounded-xl border border-[var(--panel-soft)] px-6 py-3 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-strong)] transition bg-white"
            >
              Clear Form
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Customer Directory">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--panel-soft)] text-[var(--text-muted)]">
                <th className="pb-3 pr-4 font-medium">Customer</th>
                <th className="pb-3 pr-4 font-medium">Meter</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--panel-soft)]">
              {customers.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-[var(--text-muted)]">No customers recorded.</td>
                </tr>
              )}
              {customers.map(customer => (
                <tr key={customer.id} className="group transition hover:bg-slate-50">
                  <td className="py-3.5 pr-4">
                    <button
                      type="button"
                      className="text-left flex flex-col group-hover:text-[var(--panel-strong)]"
                      onClick={() =>
                        setForm({
                          id: customer.id,
                          full_name: customer.full_name,
                          email: customer.email,
                          phone: customer.phone || '',
                          address: customer.address || '',
                          meter_number: customer.meter_number || '',
                          connection_status: customer.connection_status || 'pending',
                        })
                      }
                    >
                      <span className="font-semibold text-[var(--text-strong)] group-hover:text-[var(--panel-strong)] transition">{customer.full_name}</span>
                      <span className="text-xs font-mono text-[var(--text-muted)] mt-0.5">{customer.customer_number}</span>
                    </button>
                  </td>
                  <td className="py-3.5 pr-4">
                    {customer.meter_number ? (
                      <span className="text-[var(--text-strong)]">{customer.meter_number}</span>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Pending</span>
                    )}
                  </td>
                  <td className="py-3.5 pr-4">
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold capitalize tracking-wide ${
                        customer.connection_status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : customer.connection_status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {customer.connection_status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      type="button"
                      className="text-sm font-medium text-rose-600 hover:text-rose-800 transition px-2"
                      onClick={() => handleDelete(customer.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
