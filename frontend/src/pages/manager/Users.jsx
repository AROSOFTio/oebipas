import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';

const emptyForm = {
  id: '',
  role_id: '',
  full_name: '',
  username: '',
  email: '',
  phone: '',
  status: 'active',
  password: '',
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        axiosInstance.get('/users'),
        axiosInstance.get('/users/roles'),
      ]);
      setUsers(usersRes.data.data);
      setRoles(rolesRes.data.data);
    } catch (err) {
      setError('Failed to load system data.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateField = event => {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      if (form.id) {
        await axiosInstance.put(`/users/${form.id}`, form);
        setMessage('User updated successfully.');
      } else {
        await axiosInstance.post('/users', form);
        setMessage('New system user created.');
      }
      setForm(emptyForm);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to remove this system user?')) return;
    setError('');
    try {
      await axiosInstance.delete(`/users/${id}`);
      setMessage('User removed.');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove user.');
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <SectionCard title="Manage System User">
        {message && <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
        {error && <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[var(--text-strong)]">System Role (*)</span>
            <select
              name="role_id"
              value={form.role_id}
              onChange={updateField}
              required
              className="w-full rounded-xl border border-[var(--panel-soft)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--secondary)]"
            >
              <option value="">Select a role...</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </label>

          {[
            ['full_name', 'Full Name (*)', 'text', true],
            ['username', 'Username (*)', 'text', !form.id],
            ['email', 'Email Address (*)', 'email', true],
            ['phone', 'Phone Number', 'text', false],
          ].map(([name, label, type, required]) => (
            <label key={name} className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--text-strong)]">{label}</span>
              <input
                name={name}
                type={type}
                value={form[name]}
                onChange={updateField}
                required={required}
                disabled={name === 'username' && form.id}
                className="w-full rounded-xl border border-[var(--panel-soft)] px-4 py-3 text-sm outline-none transition focus:border-[var(--secondary)] bg-white disabled:bg-slate-50"
              />
            </label>
          ))}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[var(--text-strong)]">
              {form.id ? 'Change Password (Leave blank to keep current)' : 'Password (*)'}
            </span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              required={!form.id}
              className="w-full rounded-xl border border-[var(--panel-soft)] px-4 py-3 text-sm outline-none transition focus:border-[var(--secondary)] bg-white"
            />
          </label>

          {form.id && (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--text-strong)]">Account Status</span>
              <select
                name="status"
                value={form.status}
                onChange={updateField}
                className="w-full rounded-xl border border-[var(--panel-soft)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--secondary)]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" className="rounded-xl bg-[var(--panel-strong)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--secondary)]">
              {form.id ? 'Update User' : 'Create User'}
            </button>
            <button
              type="button"
              onClick={() => { setForm(emptyForm); setMessage(''); setError(''); }}
              className="rounded-xl border border-[var(--panel-soft)] px-6 py-3 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-strong)] transition bg-white"
            >
              Reset
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="System Personnel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--panel-soft)] text-[var(--text-muted)]">
                <th className="pb-3 pr-4 font-medium">User</th>
                <th className="pb-3 pr-4 font-medium">Role</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--panel-soft)]">
              {users.map(u => (
                <tr key={u.id} className="group transition hover:bg-slate-50">
                  <td className="py-4 pr-4">
                    <button
                      type="button"
                      className="text-left group-hover:text-[var(--panel-strong)]"
                      onClick={() => setForm({
                        id: u.id,
                        role_id: u.role_id,
                        full_name: u.full_name,
                        username: u.username,
                        email: u.email,
                        phone: u.phone || '',
                        status: u.status,
                        password: '', // Don't pre-fill password
                      })}
                    >
                      <p className="font-semibold text-[var(--text-strong)] transition uppercase tracking-tighter">{u.full_name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{u.email}</p>
                    </button>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="text-xs font-bold uppercase text-[var(--panel-strong)] bg-[var(--accent-soft)] px-2 py-1 rounded-md">
                      {u.role_name}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold capitalize tracking-wide ${
                      u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      type="button"
                      className="text-sm font-medium text-rose-600 hover:text-rose-800 transition px-2"
                      onClick={() => handleDelete(u.id)}
                    >
                      Delete
                    </button>
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
