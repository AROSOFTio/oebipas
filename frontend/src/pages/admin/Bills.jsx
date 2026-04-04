import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { Plus, Eye, Zap, Search, Calendar, Receipt, CheckCircle, AlertCircle, X, ChevronRight, FileText, Smartphone } from 'lucide-react';

const STATUS_COLORS = {
  unpaid: 'bg-red-50 text-red-600 border-red-100',
  partially_paid: 'bg-amber-50 text-amber-600 border-amber-100',
  paid: 'bg-green-50 text-green-600 border-green-100',
  overdue: 'bg-red-100 text-red-800 border-red-200',
};

const MONTHS = ['', 'January','February','March','April','May','June','July','August','September','October','November','December'];

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-border">
        <div className="flex justify-between items-center p-6 border-b border-gray-50 bg-white">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"><X size={20}/></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Generation states
  const [showGenerate, setShowGenerate] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [meters, setMeters] = useState([]);
  const [form, setForm] = useState({ 
    customer_id: '', meter_id: '', 
    billing_month: new Date().getMonth() + 1, 
    billing_year: new Date().getFullYear() 
  });
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
    e.preventDefault(); 
    if (!form.customer_id || !form.meter_id) return setGenError('Please select a customer and meter');
    setGenError(''); setGenSuccess(''); setGenerating(true);
    try {
      const res = await axiosInstance.post('/bills/generate', { 
        ...form, 
        billing_month: parseInt(form.billing_month), 
        billing_year: parseInt(form.billing_year), 
        customer_id: parseInt(form.customer_id), 
        meter_id: parseInt(form.meter_id) 
      });
      setGenSuccess(`SUCCESS: Invoice ${res.data.data.bill_number} generated — Total: UGX ${Number(res.data.data.total_amount).toLocaleString()}`);
      fetchBills();
      // Don't close immediately so they can see success
      setTimeout(() => { if (res.data.success) setShowGenerate(false); }, 3000);
    } catch (err) {
      setGenError(err.response?.data?.message || 'Invoice generation procedure failed');
    } finally { setGenerating(false); }
  };

  const filtered = bills.filter(b => 
    b.bill_number.toLowerCase().includes(search.toLowerCase()) ||
    b.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-10 flex items-center justify-center h-full"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financial Ledger</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Audit invoices, balances, and revenue streams</p>
        </div>
        <button 
          onClick={() => { setShowGenerate(true); setGenError(''); setGenSuccess(''); }}
          className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-all shadow-md font-bold"
        >
          <Plus size={20} />
          <span>Generate Invoice</span>
        </button>
      </div>

      <div className="flex items-center space-x-6 bg-white p-6 rounded-[2rem] border border-border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black" size={20}/>
          <input 
            type="text" 
            placeholder="Search by invoice # or consumer..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 font-medium transition-all"
          />
        </div>
        <div className="px-4 py-2 bg-primary/5 rounded-lg text-xs font-bold text-primary uppercase tracking-wider">
           {filtered.length} Invoices Found
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-border text-gray-500 text-xs">
              <th className="p-4 font-bold uppercase tracking-wider pl-8">Invoice #</th>
              <th className="p-4 font-bold uppercase tracking-wider">Customer</th>
              <th className="p-4 font-bold uppercase tracking-wider">Period</th>
              <th className="p-4 font-bold uppercase tracking-wider">Total (UGX)</th>
              <th className="p-4 font-bold uppercase tracking-wider">Balance</th>
              <th className="p-4 font-bold uppercase tracking-wider">Status</th>
              <th className="p-4 font-bold uppercase tracking-wider text-right pr-8">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filtered.map(b => (
              <tr key={b.id} className="group hover:bg-gray-50/30 transition-colors">
                <td className="p-6 pl-10">
                   <div className="bg-gray-100 px-3 py-1.5 rounded-lg inline-block text-[11px] font-black text-gray-600 font-mono tracking-tighter">
                      {b.bill_number}
                   </div>
                </td>
                <td className="p-6 text-gray-900 font-black tracking-tight underline decoration-primary/10 underline-offset-4 decoration-2">
                   {b.customer_name}<br/><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest no-underline inline-block mt-0.5">{b.customer_number}</span>
                </td>
                <td className="p-6">
                   <div className="flex items-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <Calendar size={12}/>
                      <span>{MONTHS[b.billing_month]} {b.billing_year}</span>
                   </div>
                </td>
                <td className="p-6 font-black text-gray-900 tabular-nums">
                   <span className="text-[10px] text-gray-400 mr-1">UGX</span>
                   {Number(b.total_amount).toLocaleString()}
                </td>
                <td className="p-6">
                   <div className={`font-black tabular-nums ${b.balance_due > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      <span className="text-[10px] opacity-40 mr-1">UGX</span>
                      {Number(b.balance_due).toLocaleString()}
                   </div>
                </td>
                <td className="p-6">
                   <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest border ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-600'}`}>
                      {b.status.replace('_', ' ')}
                   </span>
                </td>
                <td className="p-4 pr-8 text-right">
                  <Link to={`/admin/bills/${b.id}`} className="p-2 bg-sidebar text-white hover:bg-sidebar-dark rounded transition-all shadow text-xs font-bold flex items-center space-x-1.5 px-3 w-fit ml-auto">
                    <Eye size={14}/>
                    <span>View Bill</span>
                  </Link>
                </td>
              </tr>
            ))}
            {bills.length === 0 && (
              <tr>
                <td colSpan="7" className="p-20 text-center text-gray-400">
                  <Receipt size={64} className="mx-auto mb-4 opacity-10" />
                  <p className="font-black text-lg tracking-tight">Zero Invoices Found</p>
                  <p className="text-sm font-medium opacity-60">Generate a bill to begin financial tracking</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showGenerate && (
        <Modal title="Secure Invoice Generation" onClose={() => setShowGenerate(false)}>
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start space-x-3 text-amber-800">
               <Zap size={20} className="mt-1 shrink-0"/>
               <div>
                  <p className="text-xs font-black uppercase tracking-widest mb-1">Fiscal Procedure</p>
                  <p className="text-xs font-medium leading-relaxed">This will calculate power utilization against current tariff rules and generate a legal tax invoice for the designated consumer.</p>
               </div>
            </div>

            {genError && <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-xs font-black uppercase tracking-wider flex items-center"><AlertCircle size={16} className="mr-2"/>{genError}</div>}
            {genSuccess && <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-xs font-black tracking-wider flex items-center shadow-sm"><CheckCircle size={16} className="mr-2"/>{genSuccess}</div>}

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-2 ml-1">Target Consumer Entity</label>
                <select required value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})} className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 font-semibold text-gray-900 transition-all text-sm">
                  <option value="">Select consumer from ledger...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.customer_number})</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-2 ml-1">Allocated Meter Hardware</label>
                <select required value={form.meter_id} onChange={e => setForm({...form, meter_id: e.target.value})} className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 font-semibold text-gray-900 transition-all text-sm">
                  <option value="">Select registered hardware...</option>
                  {meters.map(m => <option key={m.id} value={m.id}>{m.meter_number} — {m.customer_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-2 ml-1">Fiscal Month</label>
                  <select required value={form.billing_month} onChange={e => setForm({...form, billing_month: e.target.value})} className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 font-semibold text-gray-900 transition-all text-sm uppercase tracking-wider">
                    {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-2 ml-1">Fiscal Year</label>
                  <input type="number" required value={form.billing_year} onChange={e => setForm({...form, billing_year: e.target.value})} className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 font-semibold text-gray-900 transition-all text-sm" placeholder="e.g. 2026"/>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex space-x-4">
              <button 
                type="button" 
                onClick={() => setShowGenerate(false)}
                className="flex-1 py-3 bg-gray-100 rounded-lg font-bold text-gray-600 hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={generating}
                className="flex-1 py-3 bg-primary text-white rounded-lg font-bold flex items-center justify-center space-x-2 shadow-md hover:bg-primary-dark transition-all disabled:opacity-50"
              >
                {generating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FileText size={18}/>
                    <span>Generate Invoice</span>
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
