import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Plus, Zap, MapPin, X, Save, Edit, Power, Search } from 'lucide-react';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function Connections() {
  const [connections, setConnections] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editConn, setEditConn] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [addForm, setAddForm] = useState({ customer_id: '', connection_number: '', connection_type: 'Single Phase', location: '' });
  const [editForm, setEditForm] = useState({ connection_type: '', location: '', status: '' });

  useEffect(() => {
    fetchConnections();
    fetchCustomers();
  }, []);

  const fetchConnections = async () => {
    try {
      const res = await axiosInstance.get('/service-connections');
      setConnections(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axiosInstance.get('/customers');
      setCustomers(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!addForm.customer_id) return setError('Please select a customer');
    setSaving(true); setError('');
    try {
      await axiosInstance.post('/service-connections', addForm);
      setShowAdd(false);
      setAddForm({ customer_id: '', connection_number: '', connection_type: 'Single Phase', location: '' });
      fetchConnections();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create connection');
    } finally { setSaving(false); }
  };

  const openEdit = (c) => {
    setEditConn(c);
    setEditForm({ connection_type: c.connection_type, location: c.location || '', status: c.status });
    setError('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await axiosInstance.put(`/service-connections/${editConn.id}`, editForm);
      setEditConn(null);
      fetchConnections();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update connection');
    } finally { setSaving(false); }
  };

  const toggleStatus = async (c) => {
    const newStatus = c.status === 'active' ? 'inactive' : 'active';
    if (!confirm(`Set connection ${c.connection_number} to ${newStatus}?`)) return;
    try {
      await axiosInstance.put(`/service-connections/${c.id}`, { ...c, status: newStatus });
      fetchConnections();
    } catch (err) { alert('Failed to update status'); }
  };

  const filtered = connections.filter(c => 
    c.connection_number.toLowerCase().includes(search.toLowerCase()) ||
    c.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-6">Loading connections...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Connections</h1>
          <p className="text-gray-500 text-sm">{connections.length} total connections logged</p>
        </div>
        <button onClick={() => { setShowAdd(true); setError(''); }} className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-all shadow-md">
          <Plus size={18} />
          <span>New Connection</span>
        </button>
      </div>

      <div className="flex items-center space-x-4 bg-white p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
          <input 
            type="text" 
            placeholder="Search by connection # or customer..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg outline-none focus:border-primary text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border text-gray-500 text-sm">
              <th className="p-4 font-medium">Conn #</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Location</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold text-sidebar flex items-center space-x-2">
                  <Zap size={16} className="text-yellow-500"/>
                  <span>{c.connection_number}</span>
                </td>
                <td className="p-4 text-gray-900">
                  <div className="font-medium">{c.customer_name}</div>
                  <div className="text-xs text-gray-400">{c.customer_number}</div>
                </td>
                <td className="p-4"><span className="text-sm px-2 py-1 bg-gray-100 rounded text-gray-600">{c.connection_type}</span></td>
                <td className="p-4 text-gray-500 text-sm"><MapPin size={14} className="inline mr-1 text-gray-400"/>{c.location || 'N/A'}</td>
                <td className="p-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-primary transition-colors hover:bg-gray-100 rounded-lg"><Edit size={16}/></button>
                    <button onClick={() => toggleStatus(c)} className={`p-1.5 transition-colors rounded-lg ${c.status === 'active' ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}`}><Power size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="6" className="p-12 text-center text-gray-400">No matching connections found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title="Create Service Connection" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && <p className="text-red-600 text-xs bg-red-50 p-2 rounded">{error}</p>}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer</label>
              <select required value={addForm.customer_id} onChange={e => setAddForm({...addForm, customer_id: e.target.value})} className="w-full border border-border rounded-lg p-2 text-sm">
                <option value="">Select Customer</option>
                {customers.map(cust => <option key={cust.id} value={cust.id}>{cust.full_name} ({cust.customer_number})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Connection Number</label>
              <input required placeholder="CONN-XXXXXX" value={addForm.connection_number} onChange={e => setAddForm({...addForm, connection_number: e.target.value})} className="w-full border border-border rounded-lg p-2 text-sm"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                <select value={addForm.connection_type} onChange={e => setAddForm({...addForm, connection_type: e.target.value})} className="w-full border border-border rounded-lg p-2 text-sm">
                  <option>Single Phase</option>
                  <option>Three Phase</option>
                  <option>Prepaid Industrial</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
                <input placeholder="Kampala, Zone X" value={addForm.location} onChange={e => setAddForm({...addForm, location: e.target.value})} className="w-full border border-border rounded-lg p-2 text-sm"/>
              </div>
            </div>
            <button type="submit" disabled={saving} className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Connection'}
            </button>
          </form>
        </Modal>
      )}

      {editConn && (
        <Modal title={`Edit: ${editConn.connection_number}`} onClose={() => setEditConn(null)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            {error && <p className="text-red-600 text-xs bg-red-50 p-2 rounded">{error}</p>}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
              <input required value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} className="w-full border border-border rounded-lg p-2 text-sm"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                <select value={editForm.connection_type} onChange={e => setEditForm({...editForm, connection_type: e.target.value})} className="w-full border border-border rounded-lg p-2 text-sm">
                  <option>Single Phase</option>
                  <option>Three Phase</option>
                  <option>Prepaid Industrial</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full border border-border rounded-lg p-2 text-sm">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="disconnected">Disconnected</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={saving} className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Update Connection'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
