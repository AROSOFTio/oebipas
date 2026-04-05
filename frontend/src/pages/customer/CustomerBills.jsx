import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const MONTHS = ['', 'January','February','March','April','May','June','July','August','September','October','November','December'];

const STATUS_COLORS = {
  unpaid: 'bg-red-100 text-red-700',
  partially_paid: 'bg-orange-100 text-orange-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-200 text-red-800',
};

export default function CustomerBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const profileRes = await axiosInstance.get('/customers/my-profile');
        const customerId = profileRes.data.data.id;
        const res = await axiosInstance.get(`/bills/customer/${customerId}`);
        setBills(res.data.data || []);
      } catch (err) {
        console.error(err);
        setBills([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  const currentBill = bills[0];

  if (loading) return <div className="p-6">Loading your bills...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Bills</h1>

      {/* Current Bill Card */}
      {currentBill && (
        <div className="bg-sidebar text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full"/>
          <div className="absolute -right-4 -bottom-6 w-28 h-28 bg-white/5 rounded-full"/>
          <p className="text-blue-200 text-sm uppercase tracking-widest font-medium mb-1">Current Bill</p>
          <p className="text-4xl font-bold mt-1">UGX {Number(currentBill.total_amount).toLocaleString()}</p>
          <p className="text-blue-200 mt-2 text-sm">{MONTHS[currentBill.billing_month]} {currentBill.billing_year} — {currentBill.meter_number}</p>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-xs">Due Date</p>
              <p className="font-semibold">{new Date(currentBill.due_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-blue-200 text-xs">Balance Due</p>
              <p className={`font-semibold text-lg ${Number(currentBill.balance_due) > 0 ? 'text-red-300' : 'text-green-300'}`}>
                UGX {Number(currentBill.balance_due).toLocaleString()}
              </p>
            </div>
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium bg-white/20 backdrop-blur-sm text-white`}>
              {currentBill.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Bill History */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-x-auto">
        <div className="p-4 border-b border-border bg-gray-50 flex items-center space-x-2">
          <FileText size={16} className="text-gray-400"/>
          <h2 className="font-semibold text-gray-800">Billing History</h2>
        </div>
        <div className="divide-y divide-border">
          {bills.map(b => (
            <div key={b.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                {b.status === 'paid' ? <CheckCircle size={20} className="text-green-500"/> : <Clock size={20} className="text-red-400"/>}
                <div>
                  <p className="font-medium text-gray-900">{MONTHS[b.billing_month]} {b.billing_year}</p>
                  <p className="text-sm text-gray-500">{b.bill_number}</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="font-bold text-gray-900">UGX {Number(b.total_amount).toLocaleString()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[b.status]}`}>{b.status.replace('_', ' ').toUpperCase()}</span>
                </div>
                <button 
                  onClick={() => {
                    const token = localStorage.getItem('token');
                    const url = `${axiosInstance.defaults.baseURL}/reports/invoice/${b.id}?token=${token}`;
                    window.open(url, '_blank');
                  }}
                  className="p-2 text-gray-400 hover:text-primary transition-colors"
                  title="Download PDF Invoice"
                >
                  <FileText size={20}/>
                </button>
              </div>
            </div>
          ))}
          {bills.length === 0 && (
            <div className="p-12 text-center">
              <FileText size={48} className="mx-auto text-gray-300 mb-4"/>
              <p className="text-gray-500">No bills generated yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
