import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';

const initialForm = {
  id: '',
  rate_per_unit: '',
  fixed_charge: '',
  penalty_value: '',
  due_days: '14',
  is_active: 1,
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
    const payload = {
      rate_per_unit: form.rate_per_unit,
      fixed_charge: form.fixed_charge,
      penalty_value: form.penalty_value,
      due_days: form.due_days,
      is_active: form.is_active,
    };

    const response = form.id
      ? await axiosInstance.put(`/tariffs/${form.id}`, payload)
      : await axiosInstance.post('/tariffs', payload);
    setMessage(response.data.message);
    setForm(initialForm);
    loadTariffs();
  };

  const editTariff = tariff => {
    setForm({
      id: tariff.id,
      rate_per_unit: tariff.rate_per_unit,
      fixed_charge: tariff.fixed_charge,
      penalty_value: tariff.penalty_value,
      due_days: tariff.due_days,
      is_active: tariff.is_active,
    });
  };

  const deleteTariff = async id => {
    const response = await axiosInstance.delete(`/tariffs/${id}`);
    setMessage(response.data.message);
    if (String(form.id) === String(id)) {
      setForm(initialForm);
    }
    loadTariffs();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <SectionCard title="Simple Tariff Setup" subtitle="Branch Manager can create, edit and delete tariff settings">
        {message ? <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {[
            ['rate_per_unit', 'Rate per unit (UGX)'],
            ['fixed_charge', 'Fixed charge (UGX)'],
            ['penalty_value', 'Penalty percentage (%)'],
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
          <div className="rounded-3xl border border-slate-200 bg-[var(--panel-soft)]/30 p-5">
            <p className="text-sm font-medium text-slate-700">Penalty policy</p>
            <p className="mt-2 text-sm text-slate-600">Penalty is percentage-based only. Fixed-amount penalties are not allowed.</p>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Status</span>
            <select
              value={String(form.is_active)}
              onChange={event => setForm(current => ({ ...current, is_active: Number(event.target.value) }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="rounded-2xl bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white">
              {form.id ? 'Update tariff' : 'Create tariff'}
            </button>
            <button type="button" onClick={() => setForm(initialForm)} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
              Clear form
            </button>
          </div>
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
                <th className="pb-3">Penalty %</th>
                <th className="pb-3">Active</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tariffs.map(tariff => (
                <tr key={tariff.id} className="border-t border-slate-100">
                  <td className="py-3">{tariff.effective_from?.slice(0, 10)}</td>
                  <td className="py-3">UGX {Number(tariff.rate_per_unit).toLocaleString()}</td>
                  <td className="py-3">UGX {Number(tariff.fixed_charge).toLocaleString()}</td>
                  <td className="py-3">{Number(tariff.penalty_value).toLocaleString()}%</td>
                  <td className="py-3">{tariff.is_active ? 'Yes' : 'No'}</td>
                  <td className="py-3">
                    <div className="flex gap-3">
                      <button type="button" className="text-[var(--panel-strong)]" onClick={() => editTariff(tariff)}>
                        Edit
                      </button>
                      <button type="button" className="text-rose-600" onClick={() => deleteTariff(tariff.id)}>
                        Delete
                      </button>
                    </div>
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
