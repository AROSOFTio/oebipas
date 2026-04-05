import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Plus, Tag, Edit3, Trash2, X, Save } from 'lucide-react';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-border bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors"><X size={20}/></button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Tariffs() {
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTariff, setEditingTariff] = useState(null);
  const [form, setForm] = useState({ customer_category: 'residential', rate_per_unit: '', service_charge: '', tax_percent: '', penalty_type: 'percentage', penalty_value: '', effective_from: '', status: 'active' });
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
      if (editingTariff) {
        await axiosInstance.put(`/tariffs/${editingTariff.id}`, form);
      } else {
        await axiosInstance.post('/tariffs', form);
      }
      setShowForm(false);
      setEditingTariff(null);
      setForm({ customer_category: 'residential', rate_per_unit: '', service_charge: '', tax_percent: '', penalty_type: 'percentage', penalty_value: '', effective_from: '', status: 'active' });
      fetchTariffs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save tariff');
    } finally { setSaving(false); }
  };

  const handleEdit = (t) => {
    setEditingTariff(t);
    setForm({
      customer_category: t.customer_category,
      rate_per_unit: t.rate_per_unit,
      service_charge: t.service_charge,
      tax_percent: t.tax_percent,
      penalty_type: t.penalty_type,
      penalty_value: t.penalty_value,
      effective_from: t.effective_from.split('T')[0],
      status: t.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this tariff rule? This may affect future bill calculations.')) return;
    try {
      await axiosInstance.delete(`/tariffs/${id}`);
      fetchTariffs();
    } catch (err) {
      alert('Failed to delete tariff');
    }
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
        <Modal title={editingTariff ? `Edit Tariff: ${editingTariff.customer_category}` : "Create New Tariff Rule"} onClose={() => { setShowForm(false); setEditingTariff(null); }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 animate-in slide-in-from-top duration-300">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Customer Category</label>
                <select disabled={!!editingTariff} value={form.customer_category} onChange={e => setForm({...form, customer_category: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:border-primary bg-gray-50/50 font-semibold disabled:opacity-50">
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Rate per Unit (UGX)</label>
                <input type="number" step="0.01" required value={form.rate_per_unit} onChange={e => setForm({...form, rate_per_unit: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:border-primary font-bold text-primary" placeholder="e.g. 250.00"/>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Service Charge (UGX)</label>
                <input type="number" step="0.01" value={form.service_charge} onChange={e => setForm({...form, service_charge: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:border-primary font-semibold" placeholder="e.g. 5000"/>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Tax / VAT (%)</label>
                <input type="number" step="0.01" value={form.tax_percent} onChange={e => setForm({...form, tax_percent: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:border-primary font-semibold" placeholder="e.g. 18"/>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Penalty Type</label>
                <select value={form.penalty_type} onChange={e => setForm({...form, penalty_type: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:border-primary font-semibold">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Penalty Value</label>
                <input type="number" step="0.01" value={form.penalty_value} onChange={e => setForm({...form, penalty_value: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:border-primary font-semibold" placeholder="e.g. 5 or 10000"/>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Effective From</label>
                <input type="date" required value={form.effective_from} onChange={e => setForm({...form, effective_from: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:border-primary font-semibold"/>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-3 border border-border rounded-xl outline-none focus:border-primary font-semibold">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-4 pt-4 border-t border-border">
              <button type="button" onClick={() => { setShowForm(false); setEditingTariff(null); }} className="flex-1 px-4 py-3 rounded-xl border border-border text-gray-600 font-bold hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="flex-2 flex items-center justify-center space-x-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
                <Save size={18}/>
                <span>{saving ? 'Processing...' : (editingTariff ? 'Save Changes' : 'Create Tariff')}</span>
              </button>
            </div>
          </form>
        </Modal>
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
              <th className="p-4 font-medium text-right">Actions</th>
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
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button onClick={() => handleEdit(t)} className="p-2 rounded-lg text-gray-500 hover:bg-primary/10 hover:text-primary transition-colors" title="Edit tariff">
                      <Edit3 size={16}/>
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete tariff">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {tariffs.length === 0 && <tr><td colSpan="8" className="p-8 text-center text-gray-500">No tariff rules found. Add one to get started.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
