import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';
import { CheckCircle, Clock, FileText, X, Download, ShieldCheck } from 'lucide-react';

function ReceiptPreview({ receipt, onClose, onDownload }) {
  if (!receipt) return null;
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
              <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Date Issued</span>
              <p className="font-bold text-gray-800">{new Date(receipt.payment_date).toLocaleDateString()}</p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Method</span>
              <p className="font-bold text-gray-800 uppercase">{receipt.payment_method?.replace('_', ' ')}</p>
            </div>
            <div className="col-span-2 space-y-1 pt-2 border-t border-gray-50">
              <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Reference</span>
              <p className="font-mono text-xs text-gray-600 truncate">{receipt.payment_reference}</p>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button onClick={onClose} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">Close</button>
            <button onClick={onDownload} className="flex-[2] flex items-center justify-center space-x-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100">
              <Download size={18}/>
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerPaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const profileRes = await axiosInstance.get('/customers/my-profile');
      const pRes = await axiosInstance.get(`/customers/${profileRes.data.data.id}/payments`);
      setPayments(pRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDownload = () => {
    if (!selectedReceipt) return;
    const token = localStorage.getItem('oebipas_token');
    const url = `${axiosInstance.defaults.baseURL}/reports/receipt/${selectedReceipt.receipt_id || selectedReceipt.id}?token=${token}`;
    window.open(url, '_blank');
  };

  if (loading) return <div className="p-6">Loading history...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
      
      {selectedReceipt && (
        <ReceiptPreview 
          receipt={selectedReceipt} 
          onClose={() => setSelectedReceipt(null)} 
          onDownload={handleDownload}
        />
      )}

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
                  <td className="p-4">
                    {p.receipt_number ? (
                      <button 
                        onClick={() => setSelectedReceipt(p)}
                        className="text-primary font-medium hover:underline flex items-center"
                      >
                        <FileText size={14} className="mr-1"/> {p.receipt_number}
                      </button>
                    ) : 'N/A'}
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
