import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance';
import { Shield, UserPlus, Edit, Power, X, Save, Trash2 } from 'lucide-react';

const ROLES = [
  { id: 1, name: 'Super Admin' },
  { id: 2, name: 'Billing Officer' },
  { id: 3, name: 'Finance Officer' },
  { id: 4, name: 'Customer' },
  { id: 5, name: 'Viewer' },
];

const ROLE_COLORS = {
  'Super Admin': 'bg-purple-100 text-purple-700',
  'Billing Officer': 'bg-blue-100 text-blue-700',
  'Finance Officer': 'bg-green-100 text-green-700',
  'Customer': 'bg-gray-100 text-gray-700',
  'Viewer': 'bg-yellow-100 text-yellow-700',
};

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors"><X size={20}/></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function Users() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [addForm, setAddForm] = useState({ full_name: '', username: '', email: '', password: '', phone: '', role_id: '4' });
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', status: 'active', role_id: '' });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await axiosInstance.post('/users', addForm);
      setShowAdd(false);
      setAddForm({ full_name: '', username: '', email: '', password: '', phone: '', role_id: '4' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (u) => {
    setEditUser(u);
    const roleId = ROLES.find(r => r.name === u.role)?.id || 4;
    setEditForm({ full_name: u.full_name, phone: u.phone || '', status: u.status, role_id: String(roleId) });
    setError('');
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await axiosInstance.put(`/users/${editUser.id}`, editForm);
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (u) => {
    const newStatus = u.status === 'active' ? 'inactive' : 'active';
    if (!confirm(`Set ${u.full_name} as ${newStatus}?`)) return;
    try {
      await axiosInstance.put(`/users/${u.id}`, {
        full_name: u.full_name,
        phone: u.phone,
        status: newStatus,
        role_id: String(ROLES.find(r => r.name === u.role)?.id || 4)
      });
      fetchUsers();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteUser = async (u) => {
    if (user && u.id === user.id) {
        alert('You cannot delete your own account.');
        return;
    }
    if (!confirm(`Are you sure you want to PERMANENTLY delete user ${u.full_name}? This cannot be undone.`)) return;
    try {
      await axiosInstance.delete(`/users/${u.id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) return <div className="p-6">Loading users...</div>;

  return (
    <div className="space-y-6">
      {showAdd && (
        <Modal title="Add New User" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAddUser} className="space-y-4">
            {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name*</label>
                <input required value={addForm.full_name} onChange={e => setAddForm({...addForm, full_name: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" placeholder="John Doe"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Username*</label>
                <input required value={addForm.username} onChange={e => setAddForm({...addForm, username: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" placeholder="johndoe"/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email*</label>
              <input required type="email" value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" placeholder="john@example.com"/>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password*</label>
              <input required type="password" value={addForm.password} onChange={e => setAddForm({...addForm, password: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Min 6 characters"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                <input value={addForm.phone} onChange={e => setAddForm({...addForm, phone: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" placeholder="07XXXXXXXX"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role*</label>
                <select required value={addForm.role_id} onChange={e => setAddForm({...addForm, role_id: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary">
                  {ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex space-x-3 pt-2">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 border border-border py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark text-sm font-medium disabled:opacity-50 flex items-center justify-center space-x-2">
                <Save size={16}/><span>{saving ? 'Creating...' : 'Create User'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {editUser && (
        <Modal title={`Edit: ${editUser.full_name}`} onClose={() => setEditUser(null)}>
          <form onSubmit={handleEditUser} className="space-y-4">
            {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name*</label>
              <input required value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"/>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select value={editForm.role_id} onChange={e => setEditForm({...editForm, role_id: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary">
                  {ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex space-x-3 pt-2">
              <button type="button" onClick={() => setEditUser(null)} className="flex-1 border border-border py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark text-sm font-medium disabled:opacity-50 flex items-center justify-center space-x-2">
                <Save size={16}/><span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Users</h1>
          <p className="text-gray-500 text-sm">{users.length} registered users</p>
        </div>
        <button onClick={() => { setShowAdd(true); setError(''); }} className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors shadow-sm">
          <UserPlus size={18} />
          <span>Add User</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border text-gray-500 text-sm">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {u.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{u.full_name}</p>
                      <p className="text-xs text-gray-400">@{u.username}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full w-max font-medium ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-700'}`}>
                    <Shield size={12}/><span>{u.role || 'Unassigned'}</span>
                  </span>
                </td>
                <td className="p-4 text-gray-500 text-sm">{u.email}</td>
                <td className="p-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    u.status === 'active' ? 'bg-green-100 text-green-700' : 
                    u.status === 'suspended' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {u.status?.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button onClick={() => openEdit(u)} className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Edit user">
                      <Edit size={16}/>
                    </button>
                    <button onClick={() => handleToggleStatus(u)} className={`p-2 rounded-lg transition-colors ${u.status === 'active' ? 'text-gray-500 hover:bg-red-50 hover:text-red-600' : 'text-gray-500 hover:bg-green-50 hover:text-green-600'}`} title={u.status === 'active' ? 'Deactivate' : 'Activate'}>
                      <Power size={16}/>
                    </button>
                    {user && u.id !== user.id && (
                        <button onClick={() => handleDeleteUser(u)} className="p-2 rounded-lg text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors" title="Delete user">
                            <Trash2 size={16}/>
                        </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
