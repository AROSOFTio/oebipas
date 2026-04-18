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
    if (form.id) {
      await axiosInstance.put(`/customers/${form.id}`, form);
      setMessage('Customer updated successfully.');
    } else {
      await axiosInstance.post('/customers', form);
      setMessage('Customer created successfully.');
    }
    setForm(emptyForm);
    loadCustomers();
  };

  const handleDelete = async id => {
    await axiosInstance.delete(`/customers/${id}`);
    setMessage('Customer removed successfully.');
    loadCustomers();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard title="Manage Customers" subtitle="Branch Manager control for customer records">
        {message ? <div className="mb-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</div> : null}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {[
            ['full_name', 'Full name'],
            ['username', 'Username'],
            ['email', 'Email'],
            ['phone', 'Phone'],
            ['meter_number', 'Meter number'],
          ].map(([name, label]) => (
            <label key={name} className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
              <input
                name={name}
                value={form[name]}
                onChange={updateField}
                disabled={Boolean(form.id) && name === 'username'}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--panel-strong)]"
                required={name !== 'phone'}
              />
            </label>
          ))}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Address</span>
            <textarea
              name="address"
              value={form.address}
              onChange={updateField}
              className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[var(--panel-strong)]"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Connection status</span>
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

          <div className="flex gap-3">
            <button type="submit" className="rounded-2xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white">
              {form.id ? 'Update customer' : 'Create customer'}
            </button>
            <button type="button" onClick={() => setForm(emptyForm)} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm">
              Clear form
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Customer List" subtitle="Click a row to edit customer details">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Meter</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id} className="border-t border-slate-100">
                  <td className="py-3">
                    <button type="button" className="text-left" onClick={() => setForm({ ...customer, username: customer.email.split('@')[0] })}>
                      <p className="font-medium text-slate-900">{customer.full_name}</p>
                      <p className="text-slate-500">{customer.customer_number}</p>
                    </button>
                  </td>
                  <td className="py-3">{customer.meter_number}</td>
                  <td className="py-3 capitalize">{customer.connection_status}</td>
                  <td className="py-3">
                    <button type="button" className="text-rose-600" onClick={() => handleDelete(customer.id)}>
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
