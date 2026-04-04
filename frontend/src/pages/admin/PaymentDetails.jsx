import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { ArrowLeft, Print, CheckCircle, FileText } from 'lucide-react';

export default function PaymentDetails() {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const fetchPayment = async () => {
    try {
      const res = await axiosInstance.get(`/payments/${id}`);
      setPayment(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading || !payment) return <div className="p-6">Loading details...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-2">
        <Link to="/admin/payments" className="text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft size={24}/>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Payment {payment.payment_reference}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-border p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-b border-border pb-2 mb-4">Payment Overview</h2>
          <div className="flex justify-between items-center"><span className="text-gray-500 text-sm">Status:</span> 
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${payment.status === 'successful' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{payment.status.toUpperCase()}</span>
          </div>
          <div className="flex justify-between items-center"><span className="text-gray-500 text-sm">Amount:</span> <span className="font-bold text-lg">UGX {Number(payment.amount).toLocaleString()}</span></div>
          <div className="flex justify-between items-center"><span className="text-gray-500 text-sm">Method:</span> <span className="font-medium uppercase">{payment.payment_method.replace('_', ' ')}</span></div>
          <div className="flex justify-between items-center"><span className="text-gray-500 text-sm">Date:</span> <span className="font-medium">{new Date(payment.payment_date).toLocaleString()}</span></div>
          <div className="flex justify-between items-center"><span className="text-gray-500 text-sm">Gateway TX Ref:</span> <span className="font-medium text-gray-700">{payment.transaction_reference}</span></div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-b border-border pb-2 mb-4">Customer & Bill Info</h2>
          <div className="flex justify-between items-center"><span className="text-gray-500 text-sm">Customer Name:</span> <span className="font-medium">{payment.customer_name}</span></div>
          <div className="flex justify-between items-center"><span className="text-gray-500 text-sm">Customer #:</span> <span className="font-medium text-gray-700">{payment.customer_number}</span></div>
          {payment.bill_id ? (
            <div className="flex justify-between items-center"><span className="text-gray-500 text-sm">Applied to Bill:</span> <Link to={`/admin/bills/${payment.bill_id}`} className="font-medium text-primary hover:underline">{payment.bill_number}</Link></div>
          ) : (
            <div className="flex justify-between items-center"><span className="text-gray-500 text-sm">Applied to Bill:</span> <span className="font-medium text-red-500">Unlinked (Overpayment)</span></div>
          )}
        </div>

        {payment.reconciliation && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 md:col-span-2">
            <h2 className="text-lg font-bold text-blue-900 border-b border-blue-200 pb-2 mb-4 flex items-center space-x-2"><CheckCircle size={18} /><span>Reconciliation Record</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><span className="text-blue-700 text-sm block">Reconciled Amount</span><span className="font-semibold text-blue-900">UGX {Number(payment.reconciliation.reconciled_amount).toLocaleString()}</span></div>
              <div><span className="text-blue-700 text-sm block">Reconciled At</span><span className="font-medium text-blue-900">{new Date(payment.reconciliation.reconciled_at).toLocaleString()}</span></div>
              <div className="col-span-2"><span className="text-blue-700 text-sm block">Notes</span><span className="text-blue-900">{payment.reconciliation.notes}</span></div>
            </div>
          </div>
        )}

        {payment.receipt && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 md:col-span-2 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <FileText className="text-gray-400" size={32}/>
              <div>
                <h3 className="font-bold text-gray-800">System Receipt</h3>
                <p className="text-sm text-gray-500"># {payment.receipt.receipt_number}</p>
              </div>
            </div>
            <button className="flex items-center space-x-2 bg-white border border-border px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              <Print size={18}/><span>Print Receipt</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
