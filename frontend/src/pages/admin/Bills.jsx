import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { Plus, Eye, Zap } from 'lucide-react';

const STATUS_COLORS = {
  unpaid: 'bg-red-100 text-red-700',
  partially_paid: 'bg-orange-100 text-orange-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-200 text-red-800',
};

const MONTHS = ['', 'January','February','March','April','May','June','July','August','September','October','November','December'];

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [meters, setMeters] = useState([]);
  const [form, setForm] = useState({ customer_id: '', meter_id: '', billing_month: '', billing_year: '' });
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [genSuccess, setGenSuccess] = useState('');

  useEffect(() => {
    fetchBills();
    fetchCustomers();
    fetchMeters();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await axiosInstance.get('/bills');
      setBills(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axiosInstance.get('/customers');
      setCustomers(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchMeters = async () => {
    try {
      const res = await axiosInstance.get('/meters');
      setMeters(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleGenerate = async (e) => {
    e.preventDefault(); setGenError(''); setGenSuccess(''); setGenerating(true);
    try {
      const res = await axiosInstance.post('/bills/generate', { ...form, billing_month: parseInt(form.billing_month), billing_year: parseInt(form.billing_year), customer_id: parseInt(form.customer_id), meter_id: parseInt(form.meter_id) });
      setGenSuccess(`✅ Bill ${res.data.data.bill_number} generated — Total: UGX ${Number(res.data.data.total_amount).toLocaleString()}`);
      fetchBills();
    } catch (err) {
      setGenError(err.response?.data?.message || 'Generation failed');
    } finally { setGenerating(false); }
  };

  if (loading) return <div className="p-6">Loading bills...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Bills</h1>
        <button onClick={() => { setShowGenerate(!showGenerate); setGenError(''); setGenSuccess(''); }} className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          <Plus size={18}/><span>Generate Bill</span>
        </button>
      </div>

      {showGenerate && (
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2"><Zap size={18} className="text-yellow-500"/><span>Generate Monthly Bill</span></h2>
          {genError && <div className="mb-3 bg-red-50 text-red-600 p-3 rounded-lg text-sm">{genError}</div>}
          {genSuccess && <div className="mb-3 bg-green-50 text-green-700 p-3 rounded-lg text-sm font-medium">{genSuccess}</div>}
          <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Customer</label>
              <select required value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary">
                <option value="">Select customer...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.customer_number})</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Meter</label>
              <select required value={form.meter_id} onChange={e => setForm({...form, meter_id: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary">
                <option value="">Select meter...</option>
                {meters.map(m => <option key={m.id} value={m.id}>{m.meter_number} – {m.customer_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Billing Month</label>
              <select required value={form.billing_month} onChange={e => setForm({...form, billing_month: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary">
                <option value="">Select month...</option>
                {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Billing Year</label>
              <input type="number" required value={form.billing_year} onChange={e => setForm({...form, billing_year: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:border-primary" placeholder="e.g. 2026"/>
            </div>
            <div className="col-span-full flex justify-end space-x-3 pt-2">
              <button type="button" onClick={() => setShowGenerate(false)} className="px-4 py-2 rounded-lg border border-border text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={generating} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">{generating ? 'Generating...' : 'Generate Bill'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border text-gray-500 text-sm">
              <th className="p-4 font-medium">Bill #</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Period</th>
              <th className="p-4 font-medium">Total (UGX)</th>
              <th className="p-4 font-medium">Balance Due</th>
              <th className="p-4 font-medium">Due Date</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map(b => (
              <tr key={b.id} className="border-b border-border hover:bg-gray-50 transition-colors text-sm">
                <td className="p-4 font-medium text-sidebar">{b.bill_number}</td>
                <td className="p-4 text-gray-900">{b.customer_name}<br/><span className="text-xs text-gray-400">{b.customer_number}</span></td>
                <td className="p-4 text-gray-600">{MONTHS[b.billing_month]} {b.billing_year}</td>
                <td className="p-4 font-bold">{Number(b.total_amount).toLocaleString()}</td>
                <td className="p-4 text-red-600 font-semibold">{Number(b.balance_due).toLocaleString()}</td>
                <td className="p-4 text-gray-500">{new Date(b.due_date).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-600'}`}>{b.status.replace('_', ' ').toUpperCase()}</span>
                </td>
                <td className="p-4 text-right">
                  <Link to={`/admin/bills/${b.id}`} className="inline-flex items-center text-primary hover:text-primary-dark font-medium">
                    <Eye size={16} className="mr-1"/> View
                  </Link>
                </td>
              </tr>
            ))}
            {bills.length === 0 && <tr><td colSpan="8" className="p-8 text-center text-gray-500">No bills found. Generate the first one.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
