import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';
import { CheckCircle, Clock } from 'lucide-react';

export default function CustomerPaymentHistory() {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const custRes = await axiosInstance.get('/customers');
      const myProfile = custRes.data.data.find(c => c.user_id === user.id);
      
      if (myProfile) {
        const pRes = await axiosInstance.get(`/customers/${myProfile.id}/payments`);
        setPayments(pRes.data.data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="p-6">Loading history...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-x-auto">
        {payments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">You haven't made any payments yet.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-border text-gray-500 text-sm">
                <th className="p-4 font-medium">Reference</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Method</th>
                <th className="p-4 font-medium">Bill #</th>
                <th className="p-4 font-medium">Amount (UGX)</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-b border-border hover:bg-gray-50 transition-colors text-sm">
                  <td className="p-4 font-medium text-gray-800">{p.payment_reference}</td>
                  <td className="p-4 text-gray-600">{new Date(p.payment_date).toLocaleDateString()}</td>
                  <td className="p-4 uppercase text-xs font-semibold text-gray-500">{p.payment_method.replace('_', ' ')}</td>
                  <td className="p-4 text-gray-600">{p.bill_number || 'N/A'}</td>
                  <td className="p-4 font-bold text-gray-900">{Number(p.amount).toLocaleString()}</td>
                  <td className="p-4">
                    {p.status === 'successful' ? (
                      <span className="flex items-center text-green-600 font-medium bg-green-50 px-2 py-1 rounded w-fit text-xs">
                        <CheckCircle size={14} className="mr-1"/> Successful
                      </span>
                    ) : (
                      <span className="flex items-center text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded w-fit text-xs">
                        <Clock size={14} className="mr-1"/> Pending
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-primary font-medium hover:underline cursor-pointer">
                    {p.receipt_number ? p.receipt_number : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
