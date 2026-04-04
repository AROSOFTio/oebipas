import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { ShieldAlert, CheckCircle } from 'lucide-react';

const STATUS_COLORS = {
  active: 'bg-red-100 text-red-700',
  waived: 'bg-gray-100 text-gray-700',
  paid: 'bg-green-100 text-green-700',
};

export default function Penalties() {
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPenalties();
  }, []);

  const fetchPenalties = async () => {
    try {
      const res = await axiosInstance.get('/penalties');
      setPenalties(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleApplyPenalties = async () => {
    if (!window.confirm('Are you sure you want to apply penalties to all overdue bills?')) return;
    setApplying(true); setMessage('');
    try {
      const res = await axiosInstance.post('/penalties/apply');
      setMessage(`✅ ${res.data.message}`);
      fetchPenalties();
    } catch (err) {
      setMessage(`❌ Error: ${err.response?.data?.message || 'Failed to apply penalties'}`);
    } finally { setApplying(false); }
  };

  const handleWaive = async (id) => {
    if (!window.confirm('Waive this penalty?')) return;
    try {
      await axiosInstance.put(`/penalties/${id}/waive`);
      fetchPenalties();
    } catch (err) { alert('Failed to waive penalty'); }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Penalties Management</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage late payment fines</p>
        </div>
        <button 
          onClick={handleApplyPenalties} 
          disabled={applying}
          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          <ShieldAlert size={18}/><span>{applying ? 'Processing...' : 'Apply Overdue Penalties'}</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg font-medium ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border text-gray-500 text-sm">
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Bill #</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Amount (UGX)</th>
              <th className="p-4 font-medium">Applied Date</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {penalties.map(p => (
              <tr key={p.id} className="border-b border-border hover:bg-gray-50 transition-colors text-sm">
                <td className="p-4 text-gray-900 font-medium">{p.customer_name}<br/><span className="text-xs text-gray-400">{p.customer_number}</span></td>
                <td className="p-4 text-gray-600">{p.bill_number}</td>
                <td className="p-4 text-gray-600 uppercase text-xs font-semibold">{p.penalty_type}</td>
                <td className="p-4 font-bold text-red-600">{Number(p.penalty_amount).toLocaleString()}</td>
                <td className="p-4 text-gray-500">{new Date(p.applied_date).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[p.status]}`}>{p.status.toUpperCase()}</span>
                </td>
                <td className="p-4 text-right">
                  {p.status === 'active' && (
                    <button onClick={() => handleWaive(p.id)} className="text-gray-500 hover:text-green-600 transition-colors" title="Waive Penalty">
                      Waive
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {penalties.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-gray-500">No penalties recorded yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
