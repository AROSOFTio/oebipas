import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';

const emptyForm = {
  id: '',
  full_name: '',
  username: '',
  email: '',
  phone: '',
  address: '',
  meter_number: '',
  connection_status: 'active',
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
        setMessage('Customer updated successfully.');
      } else {
        await axiosInstance.post('/customers', form);
        setMessage('Customer created. Default password: Password123!');
      }
      setForm(emptyForm);
      loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Remove this customer record?')) return;
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
      <SectionCard title="Customer Record" subtitle="Create or update customer accounts">
        {message && <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
        {error && <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Personal Info */}
          <p className="text-xs uppercase tracking-widest text-slate-400">Personal Information</p>
          {[
            ['full_name', 'Full name', true],
            ['username', 'Username', !form.id],
            ['email', 'Email', true],
            ['phone', 'Phone', false],
          ].map(([name, label, required]) => (
            <label key={name} className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
              <input
                name={name}
                value={form[name]}
                onChange={updateField}
                disabled={Boolean(form.id) && name === 'username'}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--panel-strong)] disabled:bg-slate-50"
                required={required}
              />
            </label>
          ))}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Address</span>
            <textarea
              name="address"
              value={form.address}
              onChange={updateField}
              className="min-h-20 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--panel-strong)]"
              required
            />
          </label>

          {/* Account / Meter Settings */}
          <p className="pt-2 text-xs uppercase tracking-widest text-slate-400">Account Settings</p>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Meter number <span className="text-slate-400 font-normal">(staff-assigned)</span>
            </span>
            <input
              name="meter_number"
              value={form.meter_number}
              onChange={updateField}
              placeholder="Assign after registration if needed"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--panel-strong)]"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Connection status</span>
            <select
              name="connection_status"
              value={form.connection_status}
              onChange={updateField}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--panel-strong)]"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <div className="flex gap-3 pt-1">
            <button type="submit" className="rounded-2xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white">
              {form.id ? 'Update customer' : 'Create customer'}
            </button>
            <button
              type="button"
              onClick={() => { setForm(emptyForm); setMessage(''); setError(''); }}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm text-slate-700"
            >
              Clear
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Customer List" subtitle="Click a row to load it into the form">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 pr-4 font-medium text-slate-500">Customer</th>
                <th className="pb-3 pr-4 font-medium text-slate-500">Meter</th>
                <th className="pb-3 pr-4 font-medium text-slate-500">Status</th>
                <th className="pb-3 font-medium text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-slate-400">No customers found.</td>
                </tr>
              )}
              {customers.map(customer => (
                <tr key={customer.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                  <td className="py-3 pr-4">
                    <button
                      type="button"
                      className="text-left"
                      onClick={() =>
                        setForm({
                          id: customer.id,
                          full_name: customer.full_name,
                          username: customer.email.split('@')[0],
                          email: customer.email,
                          phone: customer.phone || '',
                          address: customer.address || '',
                          meter_number: customer.meter_number || '',
                          connection_status: customer.connection_status || 'active',
                        })
                      }
                    >
                      <p className="font-medium text-slate-900">{customer.full_name}</p>
                      <p className="text-xs text-slate-400">{customer.customer_number}</p>
                    </button>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">
                    {customer.meter_number || <span className="text-slate-400 italic">Not assigned</span>}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                        customer.connection_status === 'active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {customer.connection_status}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      className="text-sm text-rose-600 hover:underline"
                      onClick={() => handleDelete(customer.id)}
                    >
                      Remove
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
