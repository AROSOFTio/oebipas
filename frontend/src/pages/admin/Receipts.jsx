import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Printer } from 'lucide-react';

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const res = await axiosInstance.get('/payments/receipts/all');
      setReceipts(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
          <p className="text-gray-500 text-sm mt-1">Automatically generated receipts for all successful payments</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border text-gray-500 text-sm">
              <th className="p-4 font-medium">Receipt #</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Payment Ref</th>
              <th className="p-4 font-medium">Amount (UGX)</th>
              <th className="p-4 font-medium">Issued At</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map(r => (
              <tr key={r.id} className="border-b border-border hover:bg-gray-50 transition-colors text-sm">
                <td className="p-4 font-medium text-sidebar">{r.receipt_number}</td>
                <td className="p-4 text-gray-900">{r.customer_name}</td>
                <td className="p-4 text-gray-600">
                  {r.payment_reference} <br/><span className="text-xs uppercase bg-gray-100 rounded px-1">{r.payment_method}</span>
                </td>
                <td className="p-4 font-bold">{Number(r.amount).toLocaleString()}</td>
                <td className="p-4 text-gray-500">{new Date(r.issued_at).toLocaleString()}</td>
                <td className="p-4 text-right">
                  <button className="inline-flex items-center text-primary hover:text-primary-dark font-medium" onClick={() => window.print()}>
                    <Printer size={16} className="mr-1"/> Print
                  </button>
                </td>
              </tr>
            ))}
            {receipts.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-gray-500">No receipts found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
