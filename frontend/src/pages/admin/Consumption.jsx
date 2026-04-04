import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Plus, Eye, Calendar, X, Save, Search, Activity, Zap, User } from 'lucide-react';
import { Link } from 'react-router-dom';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-border">
        <div className="flex justify-between items-center p-8 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 transition-colors"><X size={20}/></button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}

export default function Consumption() {
  const [records, setRecords] = useState([]);
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ 
    meter_id: '', billing_month: new Date().getMonth() + 1, billing_year: new Date().getFullYear(), 
    units_consumed: '', reading_date: new Date().toISOString().split('T')[0] 
  });

  useEffect(() => {
    fetchRecords();
    fetchMeters();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await axiosInstance.get('/consumption');
      setRecords(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchMeters = async () => {
    try {
      const res = await axiosInstance.get('/meters');
      setMeters(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.meter_id) return setError('Please select a meter');
    setSaving(true); setError('');
    try {
      const selectedMeter = meters.find(m => m.id === parseInt(form.meter_id));
      await axiosInstance.post('/consumption', {
        ...form,
        customer_id: selectedMeter.customer_id
      });
      setShowAdd(false);
      setForm({ 
        meter_id: '', billing_month: new Date().getMonth() + 1, billing_year: new Date().getFullYear(), 
        units_consumed: '', reading_date: new Date().toISOString().split('T')[0] 
      });
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log reading');
    } finally { setSaving(false); }
  };

  const filtered = records.filter(r => 
    r.meter_number.toLowerCase().includes(search.toLowerCase()) ||
    r.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-10 flex items-center justify-center h-full"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Consumption Intel</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Audit meter readings and energy utilization</p>
        </div>
        <button 
          onClick={() => { setShowAdd(true); setError(''); }}
          className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-all shadow-md font-bold"
        >
          <Plus size={20} />
          <span>Log Reading</span>
        </button>
      </div>

      <div className="flex items-center space-x-6 bg-white p-6 rounded-[2rem] border border-border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black" size={20}/>
          <input 
            type="text" 
            placeholder="Search by meter # or consumer..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 font-medium transition-all"
          />
        </div>
        <div className="px-4 py-2 bg-primary/5 rounded-lg text-xs font-bold text-primary uppercase tracking-wider">
           {filtered.length} Readings Logged
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-border text-gray-500 text-xs">
              <th className="p-4 font-bold uppercase tracking-wider pl-8">Meter #</th>
              <th className="p-4 font-bold uppercase tracking-wider">Customer</th>
              <th className="p-4 font-bold uppercase tracking-wider">Billing Period</th>
              <th className="p-4 font-bold uppercase tracking-wider">Units (kWh)</th>
              <th className="p-4 font-bold uppercase tracking-wider">Reading Date</th>
              <th className="p-4 font-bold uppercase tracking-wider text-right pr-8">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((r) => (
              <tr key={r.id} className="group hover:bg-gray-50/30 transition-colors">
                <td className="p-6 pl-10">
                   <div className="flex items-center space-x-3">
                      <Activity size={16} className="text-blue-500 animate-pulse"/>
                      <span className="font-bold text-gray-900">{r.meter_number}</span>
                   </div>
                </td>
                <td className="p-6">
                   <div className="font-black text-gray-900 tracking-tight">{r.customer_name}</div>
                   <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{r.customer_number}</div>
                </td>
                <td className="p-6">
                  <div className="flex items-center space-x-2 text-xs font-black text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg w-fit">
                    <Calendar size={14} className="text-gray-400"/>
                    <span className="tracking-tighter">{`${r.billing_month.toString().padStart(2, '0')}/${r.billing_year}`}</span>
                  </div>
                </td>
                <td className="p-6">
                  <div className="text-lg font-black text-primary tabular-nums">
                    {Number(r.units_consumed).toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </div>
                </td>
                <td className="p-6 text-gray-500 font-medium text-xs">
                  {new Date(r.reading_date).toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'})}
                </td>
                <td className="p-4 text-right">
                   <div className="flex items-center justify-end space-x-2">
                      <Link to={`/admin/consumption/${r.id}`} className="p-2 bg-sidebar text-white hover:bg-sidebar-dark rounded transition-all shadow text-xs font-bold flex items-center space-x-1.5 px-3">
                         <Eye size={14}/>
                         <span>Details</span>
                      </Link>
                   </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="p-20 text-center text-gray-400">
                  <Zap size={64} className="mx-auto mb-4 opacity-10" />
                  <p className="font-black text-lg tracking-tight">No Consumption Records Found</p>
                  <p className="text-sm font-medium opacity-60">Initialize field operations to begin data collection</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title="Log High-Precision Reading" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleCreate} className="space-y-6">
            {error && <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-xs font-black uppercase tracking-wider">{error}</div>}
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Select Target Meter</label>
                <div className="relative">
                  <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                  <select required value={form.meter_id} onChange={e => setForm({...form, meter_id: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold text-gray-900 transition-all text-xs">
                    <option value="">Choose meter from inventory...</option>
                    {meters.map(m => <option key={m.id} value={m.id}>{m.meter_number} — {m.customer_name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Billing Month</label>
                  <select value={form.billing_month} onChange={e => setForm({...form, billing_month: e.target.value})} className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold text-gray-900 transition-all text-xs">
                    {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', {month: 'long'})}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Billing Year</label>
                  <select value={form.billing_year} onChange={e => setForm({...form, billing_year: e.target.value})} className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold text-gray-900 transition-all text-xs">
                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Energy Utilization (Units / kWh)</label>
                <div className="relative">
                  <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                  <input required type="number" step="0.01" value={form.units_consumed} onChange={e => setForm({...form, units_consumed: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-black text-lg text-primary transition-all pr-12" placeholder="0.00"/>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase tracking-widest">kWh</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Reading Audit Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                  <input required type="date" value={form.reading_date} onChange={e => setForm({...form, reading_date: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold text-gray-900 transition-all text-xs"/>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex space-x-4">
              <button 
                type="button" 
                onClick={() => setShowAdd(false)}
                className="flex-1 py-3 bg-gray-100 rounded-lg font-bold text-gray-600 hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="flex-1 py-3 bg-primary text-white rounded-lg font-bold flex items-center justify-center space-x-2 shadow-md hover:bg-primary-dark transition-all disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={18}/>
                    <span>Log Reading</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
