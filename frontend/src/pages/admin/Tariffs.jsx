import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Plus, Tag } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Tariffs() {
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_category: 'residential', rate_per_unit: '', service_charge: '', tax_percent: '', penalty_type: 'percentage', penalty_value: '', effective_from: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchTariffs(); }, []);

  const fetchTariffs = async () => {
    try {
      const res = await axiosInstance.get('/tariffs');
      setTariffs(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await axiosInstance.post('/tariffs', form);
      setShowForm(false);
      setForm({ customer_category: 'residential', rate_per_unit: '', service_charge: '', tax_percent: '', penalty_type: 'percentage', penalty_value: '', effective_from: '' });
      fetchTariffs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save tariff');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-6">Loading tariffs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tariff Rules</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          <Plus size={18}/><span>Add Tariff</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h2 className="font-semibold text-gray-800 mb-4">New Tariff Rule</h2>
          {error && <div className="mb-3 bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Customer Category</label>
              <select value={form.customer_category} onChange={e => setForm({...form, customer_category: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary">
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Rate per Unit (UGX)</label>
              <input type="number" step="0.01" required value={form.rate_per_unit} onChange={e => setForm({...form, rate_per_unit: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary" placeholder="e.g. 250.00"/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Service Charge (UGX)</label>
              <input type="number" step="0.01" value={form.service_charge} onChange={e => setForm({...form, service_charge: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary" placeholder="e.g. 5000"/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Tax / VAT (%)</label>
              <input type="number" step="0.01" value={form.tax_percent} onChange={e => setForm({...form, tax_percent: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary" placeholder="e.g. 18"/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Penalty Type</label>
              <select value={form.penalty_type} onChange={e => setForm({...form, penalty_type: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Penalty Value</label>
              <input type="number" step="0.01" value={form.penalty_value} onChange={e => setForm({...form, penalty_value: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary" placeholder="e.g. 5 or 10000"/>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="text-sm font-medium text-gray-700 block mb-1">Effective From</label>
              <input type="date" required value={form.effective_from} onChange={e => setForm({...form, effective_from: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary"/>
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex justify-end space-x-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-border text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Save Tariff'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border text-gray-500 text-sm">
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Rate/Unit (UGX)</th>
              <th className="p-4 font-medium">Service Charge</th>
              <th className="p-4 font-medium">Tax %</th>
              <th className="p-4 font-medium">Penalty</th>
              <th className="p-4 font-medium">Effective From</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {tariffs.map(t => (
              <tr key={t.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                <td className="p-4 font-semibold capitalize flex items-center space-x-2 text-sidebar"><Tag size={15}/><span>{t.customer_category}</span></td>
                <td className="p-4 font-bold text-primary">{Number(t.rate_per_unit).toLocaleString()}</td>
                <td className="p-4 text-gray-600">{Number(t.service_charge).toLocaleString()}</td>
                <td className="p-4 text-gray-600">{t.tax_percent}%</td>
                <td className="p-4 text-gray-600">{t.penalty_type === 'percentage' ? `${t.penalty_value}%` : `UGX ${Number(t.penalty_value).toLocaleString()}`}</td>
                <td className="p-4 text-gray-500">{new Date(t.effective_from).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{t.status.toUpperCase()}</span>
                </td>
              </tr>
            ))}
            {tariffs.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-gray-500">No tariff rules found. Add one to get started.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
