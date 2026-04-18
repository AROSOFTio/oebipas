import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';

const initialForm = {
  rate_per_unit: '',
  fixed_charge: '',
  penalty_type: 'percentage',
  penalty_value: '',
  due_days: '14',
};

export default function Tariffs() {
  const [tariffs, setTariffs] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');

  const loadTariffs = async () => {
    const response = await axiosInstance.get('/tariffs');
    setTariffs(response.data.data);
  };

  useEffect(() => {
    loadTariffs();
  }, []);

  const handleSubmit = async event => {
    event.preventDefault();
    const response = await axiosInstance.post('/tariffs', form);
    setMessage(response.data.message);
    setForm(initialForm);
    loadTariffs();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <SectionCard title="Simple Tariff Setup" subtitle="Units multiplied by tariff plus fixed charge">
        {message ? <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {[
            ['rate_per_unit', 'Rate per unit (UGX)'],
            ['fixed_charge', 'Fixed charge (UGX)'],
            ['penalty_value', 'Penalty value'],
            ['due_days', 'Due days'],
          ].map(([name, label]) => (
            <label key={name} className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
              <input
                type="number"
                value={form[name]}
                onChange={event => setForm(current => ({ ...current, [name]: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                required
              />
            </label>
          ))}
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Penalty type</span>
            <select
              value={form.penalty_type}
              onChange={event => setForm(current => ({ ...current, penalty_type: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </label>
          <button type="submit" className="rounded-2xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white">
            Save tariff
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Tariff History" subtitle="Latest active tariff is used during automated billing">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3">Effective from</th>
                <th className="pb-3">Rate</th>
                <th className="pb-3">Fixed charge</th>
                <th className="pb-3">Penalty</th>
                <th className="pb-3">Active</th>
              </tr>
            </thead>
            <tbody>
              {tariffs.map(tariff => (
                <tr key={tariff.id} className="border-t border-slate-100">
                  <td className="py-3">{tariff.effective_from?.slice(0, 10)}</td>
                  <td className="py-3">UGX {Number(tariff.rate_per_unit).toLocaleString()}</td>
                  <td className="py-3">UGX {Number(tariff.fixed_charge).toLocaleString()}</td>
                  <td className="py-3">
                    {Number(tariff.penalty_value).toLocaleString()} {tariff.penalty_type === 'percentage' ? '%' : 'UGX'}
                  </td>
                  <td className="py-3">{tariff.is_active ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
