import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { Eye, CreditCard } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-orange-100 text-orange-700',
  successful: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  reversed: 'bg-gray-100 text-gray-700',
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axiosInstance.get('/payments');
      setPayments(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 text-sm mt-1">Transaction history and reconciliations</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border text-gray-500 text-sm">
              <th className="p-4 font-medium">Reference</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Bill #</th>
              <th className="p-4 font-medium">Method</th>
              <th className="p-4 font-medium">Amount (UGX)</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} className="border-b border-border hover:bg-gray-50 transition-colors text-sm">
                <td className="p-4 font-medium text-sidebar">{p.payment_reference}</td>
                <td className="p-4 text-gray-900">{p.customer_name}<br/><span className="text-xs text-gray-400">{p.customer_number}</span></td>
                <td className="p-4 text-gray-600">{p.bill_number || 'Unlinked'}</td>
                <td className="p-4 text-gray-500 uppercase text-xs font-semibold flex items-center mt-3"><CreditCard size={14} className="mr-1"/> {p.payment_method.replace('_', ' ')}</td>
                <td className="p-4 font-bold">{Number(p.amount).toLocaleString()}</td>
                <td className="p-4 text-gray-500">{new Date(p.payment_date).toLocaleString()}</td>
                <td className="p-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[p.status]}`}>{p.status.toUpperCase()}</span>
                </td>
                <td className="p-4 text-right">
                  <Link to={`/admin/payments/${p.id}`} className="inline-flex items-center text-primary hover:text-primary-dark font-medium">
                    <Eye size={16} className="mr-1"/> Details
                  </Link>
                </td>
              </tr>
            ))}
            {payments.length === 0 && <tr><td colSpan="8" className="p-8 text-center text-gray-500">No payments found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
