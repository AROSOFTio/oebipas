import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { ArrowLeft, Printer, CheckCircle, FileText, X, Download, ShieldCheck } from 'lucide-react';

function ReceiptPreview({ receipt, payment, onClose, onDownload }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-green-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg"><FileText size={24}/></div>
            <div>
              <h2 className="text-xl font-bold">Receipt Preview</h2>
              <p className="text-green-100 text-xs font-medium">#{receipt.receipt_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="flex flex-col items-center justify-center py-4 border-b border-gray-100 space-y-2">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-2">
              <ShieldCheck size={32} />
            </div>
            <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">Amount Paid</span>
            <h1 className="text-4xl font-black text-gray-900">UGX {Number(receipt.amount).toLocaleString()}</h1>
          </div>

          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div className="space-y-1">
              <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Customer</span>
              <p className="font-bold text-gray-800">{receipt.customer_name}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Account</span>
              <p className="font-bold text-gray-800">{receipt.customer_number}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Method</span>
              <p className="font-bold text-gray-800 uppercase">{payment.payment_method.replace('_', ' ')}</p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Date</span>
              <p className="font-bold text-gray-800">{new Date(receipt.issued_at).toLocaleString()}</p>
            </div>
            <div className="col-span-2 space-y-1 pt-2 border-t border-gray-50">
              <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Payment Reference</span>
              <p className="font-mono text-xs text-gray-600">{payment.payment_reference}</p>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button onClick={onClose} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">Close</button>
            <button onClick={onDownload} className="flex-[2] flex items-center justify-center space-x-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100">
              <Download size={18}/>
              <span>Export as PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentDetails() {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);

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

  const handleDownloadReceipt = () => {
    if (!payment.receipt) return;
    const token = localStorage.getItem('oebipas_token');
    const url = `${axiosInstance.defaults.baseURL}/reports/receipt/${payment.receipt.id}?token=${token}`;
    window.open(url, '_blank');
  };

  if (loading || !payment) return <div className="p-6">Loading details...</div>;

  return (
    <div className="space-y-6">
      {showReceiptPreview && (
        <ReceiptPreview 
          receipt={payment.receipt} 
          payment={payment} 
          onClose={() => setShowReceiptPreview(false)} 
          onDownload={handleDownloadReceipt}
        />
      )}
      
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
            <div className="flex items-center space-x-2">
              <button onClick={() => setShowReceiptPreview(true)} className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition-colors shadow-sm">
                <FileText size={18}/><span>View Receipt</span>
              </button>
              <button onClick={() => window.print()} className="flex items-center space-x-2 bg-white border border-border px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                <Printer size={18}/><span>Print Page</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
