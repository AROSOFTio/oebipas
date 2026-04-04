import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Plus, Activity, AlertCircle, X, Save, Edit, Settings, Trash2, Search } from 'lucide-react';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-border text-sidebar">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors"><X size={20}/></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function Meters() {
  const [meters, setMeters] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editMeter, setEditMeter] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [addForm, setAddForm] = useState({ meter_number: '', service_connection_id: '', installation_date: new Date().toISOString().split('T')[0] });
  const [editForm, setEditForm] = useState({ status: '', installation_date: '' });

  useEffect(() => {
    fetchMeters();
    fetchConnections();
  }, []);

  const fetchMeters = async () => {
    try {
      const res = await axiosInstance.get('/meters');
      setMeters(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchConnections = async () => {
    try {
      const res = await axiosInstance.get('/service-connections');
      setConnections(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!addForm.service_connection_id) return setError('Please select a service connection');
    setSaving(true); setError('');
    try {
      // Logic for backend: service_connection_id already implies customer_id
      // We need to fetch customer_id from the selected connection
      const conn = connections.find(c => c.id === parseInt(addForm.service_connection_id));
      await axiosInstance.post('/meters', {
        ...addForm,
        customer_id: conn.customer_id
      });
      setShowAdd(false);
      setAddForm({ meter_number: '', service_connection_id: '', installation_date: new Date().toISOString().split('T')[0] });
      fetchMeters();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register meter');
    } finally { setSaving(false); }
  };

  const openEdit = (m) => {
    setEditMeter(m);
    setEditForm({ 
      status: m.status, 
      installation_date: m.installation_date ? new Date(m.installation_date).toISOString().split('T')[0] : '' 
    });
    setError('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await axiosInstance.put(`/meters/${editMeter.id}`, editForm);
      setEditMeter(null);
      fetchMeters();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update meter');
    } finally { setSaving(false); }
  };

  const getStatusBadge = (status) => {
    if (status === 'active') return <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">ACTIVE</span>;
    if (status === 'faulty') return <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex inline-flex items-center space-x-1"><AlertCircle size={10}/><span>FAULTY</span></span>;
    return <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded-full font-bold">INACTIVE</span>;
  };

  const filtered = meters.filter(m => 
    m.meter_number.toLowerCase().includes(search.toLowerCase()) ||
    m.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.connection_number?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-6">Loading meters...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meters Hardware</h1>
          <p className="text-gray-500 text-sm">{meters.length} physical meters tracked</p>
        </div>
        <button onClick={() => { setShowAdd(true); setError(''); }} className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-all shadow-md">
          <Plus size={18} />
          <span>Register Meter</span>
        </button>
      </div>

      <div className="flex items-center space-x-4 bg-white p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
          <input 
            type="text" 
            placeholder="Search by meter #, connection or customer..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg outline-none focus:border-primary text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border text-gray-500 text-sm text-sidebar">
              <th className="p-4 font-bold border-r border-border/50">Meter #</th>
              <th className="p-4 font-bold">Connection #</th>
              <th className="p-4 font-bold">Customer</th>
              <th className="p-4 font-bold">Installed</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold text-sidebar flex items-center space-x-2 border-r border-border/50">
                  <Activity size={16} className="text-blue-500"/>
                  <span>{m.meter_number}</span>
                </td>
                <td className="p-4"><span className="text-sm font-medium font-mono text-gray-600">{m.connection_number}</span></td>
                <td className="p-4 text-gray-900 font-medium text-sm">
                  {m.customer_name} <span className="text-xs text-gray-400 block">{m.customer_number}</span>
                </td>
                <td className="p-4 text-gray-500 text-xs">{new Date(m.installation_date).toLocaleDateString()}</td>
                <td className="p-4">
                  {getStatusBadge(m.status)}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button onClick={() => openEdit(m)} className="p-1.5 text-gray-400 hover:text-primary transition-colors hover:bg-gray-100 rounded-lg"><Edit size={16}/></button>
                    <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="6" className="p-12 text-center text-gray-400">No matching meters found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title="Register New Meter" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && <p className="text-red-600 text-xs bg-red-50 p-2 rounded">{error}</p>}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Meter Number</label>
              <input required placeholder="MTR-XXXXXXXX" value={addForm.meter_number} onChange={e => setAddForm({...addForm, meter_number: e.target.value})} className="w-full border border-border rounded-lg p-2 text-sm"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assign to Connection</label>
              <select required value={addForm.service_connection_id} onChange={e => setAddForm({...addForm, service_connection_id: e.target.value})} className="w-full border border-border rounded-lg p-2 text-sm">
                <option value="">Select Connection</option>
                {connections.map(c => <option key={c.id} value={c.id}>{c.connection_number} ({c.customer_name})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Installation Date</label>
              <input type="date" required value={addForm.installation_date} onChange={e => setAddForm({...addForm, installation_date: e.target.value})} className="w-full border border-border rounded-lg p-2 text-sm"/>
            </div>
            <button type="submit" disabled={saving} className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors disabled:opacity-50">
              {saving ? 'Registering...' : 'Register Meter'}
            </button>
          </form>
        </Modal>
      )}

      {editMeter && (
        <Modal title={`Manage Meter: ${editMeter.meter_number}`} onClose={() => setEditMeter(null)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            {error && <p className="text-red-600 text-xs bg-red-50 p-2 rounded">{error}</p>}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Installation Date</label>
              <input type="date" required value={editForm.installation_date} onChange={e => setEditForm({...editForm, installation_date: e.target.value})} className="w-full border border-border rounded-lg p-2 text-sm"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
              <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full border border-border rounded-lg p-2 text-sm">
                <option value="active">Active</option>
                <option value="faulty">Faulty</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button type="submit" disabled={saving} className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Update Meter'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
