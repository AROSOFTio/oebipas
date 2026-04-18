import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';

const emptyForm = {
  customer_id: '',
  billing_month: '',
  billing_year: '',
  units_consumed: '',
  reading_date: '',
};

export default function Consumption() {
  const [customers, setCustomers] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');

  const loadPage = async () => {
    const [customerResponse, recordResponse] = await Promise.all([
      axiosInstance.get('/customers'),
      axiosInstance.get('/consumption'),
    ]);
    setCustomers(customerResponse.data.data);
    setRecords(recordResponse.data.data);
  };

  useEffect(() => {
    loadPage();
  }, []);

  const handleSubmit = async event => {
    event.preventDefault();
    const response = await axiosInstance.post('/consumption', form);
    setMessage(`${response.data.message} Bill number: ${response.data.data.bill.bill_number}`);
    setForm(emptyForm);
    loadPage();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <SectionCard title="Enter Consumption" subtitle="Billing entry automatically generates a bill">
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
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['billing_month', 'Billing month'],
              ['billing_year', 'Billing year'],
              ['units_consumed', 'Units consumed'],
              ['reading_date', 'Reading date'],
            ].map(([name, label]) => (
              <label key={name} className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
                <input
                  type={name === 'reading_date' ? 'date' : 'number'}
                  value={form[name]}
                  onChange={event => setForm(current => ({ ...current, [name]: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                  required
                />
              </label>
            ))}
          </div>
          <button type="submit" className="rounded-2xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white">
            Save consumption
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Consumption Records" subtitle="Manual staff entries used for automated billing">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Period</th>
                <th className="pb-3">Units</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id} className="border-t border-slate-100">
                  <td className="py-3">
                    <p className="font-medium text-slate-900">{record.customer_name}</p>
                    <p className="text-slate-500">{record.customer_number}</p>
                  </td>
                  <td className="py-3">
                    {record.billing_month}/{record.billing_year}
                  </td>
                  <td className="py-3">{record.units_consumed} kWh</td>
                  <td className="py-3">{record.reading_date?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
