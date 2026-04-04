import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Plus, Eye, CheckCircle, XCircle, X, Save, Edit, Search, User, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-border">
        <div className="flex justify-between items-center p-6 border-b border-gray-50 bg-white">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"><X size={20}/></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [showAdd, setShowAdd] = useState(false);
  const [editCust, setEditCust] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ 
    full_name: '', email: '', phone: '', address: '', category: 'residential', customer_number: '' 
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axiosInstance.get('/customers');
      setCustomers(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = { ...form };
      if (!payload.customer_number) payload.customer_number = `CUST-${Date.now().toString().slice(-6)}`;
      await axiosInstance.post('/customers', payload);
      setShowAdd(false);
      setForm({ full_name: '', email: '', phone: '', address: '', category: 'residential', customer_number: '' });
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create customer');
    } finally { setSaving(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await axiosInstance.put(`/customers/${editCust.id}`, form);
      setEditCust(null);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update customer');
    } finally { setSaving(false); }
  };

  const openEdit = (c) => {
    setEditCust(c);
    setForm({ 
      full_name: c.full_name, email: c.email || '', phone: c.phone || '', 
      address: c.address || '', category: c.category || 'residential' 
    });
    setError('');
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    if (!confirm(`Set customer status to ${newStatus.toUpperCase()}?`)) return;
    try {
      await axiosInstance.patch(`/customers/${id}/status`, { status: newStatus });
      fetchCustomers();
    } catch (err) { alert('Failed to update status'); }
  };

  const filtered = customers.filter(c => 
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.customer_number.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-10 flex items-center justify-center h-full"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customer Database</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Manage power consumers and account statuses</p>
        </div>
        <button 
          onClick={() => { setShowAdd(true); setError(''); setForm({ full_name: '', email: '', phone: '', address: '', category: 'residential', customer_number: '' }); }}
          className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-all shadow-md font-bold"
        >
          <Plus size={20} />
          <span>New Customer</span>
        </button>
      </div>

      <div className="flex items-center space-x-6 bg-white p-6 rounded-[2rem] border border-border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black" size={20}/>
          <input 
            type="text" 
            placeholder="Search by name or account #..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 font-medium transition-all"
          />
        </div>
        <div className="px-4 py-2 bg-primary/5 rounded-lg text-xs font-bold text-primary uppercase tracking-wider">
           {filtered.length} Customers Found
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-border text-gray-500 text-xs">
              <th className="p-4 font-bold uppercase tracking-wider pl-8">Customer #</th>
              <th className="p-4 font-bold uppercase tracking-wider">Name & Contact</th>
              <th className="p-4 font-bold uppercase tracking-wider">Category</th>
              <th className="p-4 font-bold uppercase tracking-wider">Status</th>
              <th className="p-4 font-bold uppercase tracking-wider text-right pr-8">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <tr key={c.id} className="group hover:bg-gray-50/30 transition-colors">
                <td className="p-4 pl-8">
                   <div className="font-bold text-sidebar">{c.customer_number}</div>
                </td>
                <td className="p-4">
                   <div className="font-bold text-gray-900">{c.full_name}</div>
                   <div className="text-xs text-gray-500">{c.email || 'No email'}</div>
                </td>
                <td className="p-6">
                  <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest rounded-lg border border-primary/10">
                    {c.category}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center space-x-1.5 text-xs font-bold uppercase px-3 py-1 rounded-full ${
                    c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {c.status === 'active' ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                    <span>{c.status}</span>
                  </span>
                </td>
                <td className="p-4 pr-8 text-right space-x-2">
                   <button onClick={() => openEdit(c)} className="p-2 text-gray-400 hover:text-primary transition-colors"><Edit size={18}/></button>
                   <button onClick={() => toggleStatus(c.id, c.status)} className={`p-2 transition-colors ${c.status === 'active' ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'} rounded`}>{c.status === 'active' ? <User size={18}/> : <User size={18}/>}</button>
                   <Link to={`/admin/customers/${c.id}`} className="p-2 text-primary hover:text-primary-dark transition-colors inline-block"><Eye size={18}/></Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="p-20 text-center text-gray-400">
                  <User size={64} className="mx-auto mb-4 opacity-10" />
                  <p className="font-black text-lg tracking-tight">No Consumers Indexed</p>
                  <p className="text-sm font-medium opacity-60">Adjust search parameters or create a new entry</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(showAdd || editCust) && (
        <Modal 
          title={showAdd ? "Index New Consumer" : "Modify Consumer Intel"} 
          onClose={() => { setShowAdd(false); setEditCust(null); }}
        >
          <form onSubmit={showAdd ? handleCreate : handleUpdate} className="space-y-6">
            {error && <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-xs font-black uppercase tracking-wider">{error}</div>}
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-2 ml-1">Full Identity Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18}/>
                  <input required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} type="text" className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 font-medium text-gray-900 transition-all placeholder:text-gray-400" placeholder="Enter full legal name..."/>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-2 ml-1">Electronic Mail</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18}/>
                    <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 font-medium text-gray-900 transition-all text-sm placeholder:text-gray-400" placeholder="name@domain.com"/>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-2 ml-1">Cellular Contact</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18}/>
                    <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} type="text" className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 font-medium text-gray-900 transition-all text-sm placeholder:text-gray-400" placeholder="+256..."/>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-2 ml-1">Physical Installation Address</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18}/>
                  <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} type="text" className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 font-medium text-gray-900 transition-all placeholder:text-gray-400" placeholder="Plot, Street, City..."/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-2 ml-1">Plan Classification</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 font-semibold text-gray-900 transition-all text-sm">
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                  </select>
                </div>
                {showAdd && (
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-2 ml-1">Account Ref (Optional)</label>
                    <input value={form.customer_number} onChange={e => setForm({...form, customer_number: e.target.value})} type="text" className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 font-medium text-gray-900 transition-all text-sm placeholder:text-gray-400" placeholder="Leave blank to auto-gen"/>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex space-x-4">
              <button 
                type="button" 
                onClick={() => { setShowAdd(false); setEditCust(null); }}
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
                    <span>Save Customer</span>
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
