import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { CreditCard, Wallet, Smartphone, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MakePayment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('mobile_money');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Mock PESAPAL Integration Details Note
  const showPesapalNote = true;

  useEffect(() => {
    fetchUnpaidBills();
  }, []);

  const fetchUnpaidBills = async () => {
    try {
      // In a real scenario we'd query by logged in customer ID
      // Assuming user has a customer profile linked. 
      // We will fetch customer info first. For simplicity, assume customer profile is fetched
      const res = await axiosInstance.get('/customers');
      const myProfile = res.data.data.find(c => c.user_id === user.id);
      
      if (myProfile) {
        const billsRes = await axiosInstance.get(`/customers/${myProfile.id}/bills`);
        const unpaid = billsRes.data.data.filter(b => b.balance_due > 0);
        setBills(unpaid);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!selectedBill || !amount || !method) {
      setError('Please fill all fields'); return;
    }

    try {
      setProcessing(true); setError('');
      
      // Get customer id
      const res = await axiosInstance.get('/customers');
      const myProfile = res.data.data.find(c => c.user_id === user.id);
      
      if (!myProfile) throw new Error("Customer profile not found");

      await axiosInstance.post('/payments', {
        customer_id: myProfile.id,
        bill_id: selectedBill,
        amount: amount,
        payment_method: method
      });

      // Redirect to history after success
      navigate('/customer/payments');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Make a Payment</h1>
      
      {showPesapalNote && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex items-start space-x-3">
          <ShieldCheck className="text-blue-500 mt-0.5 flex-shrink-0" size={20}/>
          <div>
            <h3 className="font-bold">Student-Safe Demo Payment Mode</h3>
            <p className="text-sm mt-1">
              Currently running in developer/demo mode. Your payment will be processed instantly without contacting the live PESAPAL gateway. 
              The backend IPN (Instant Payment Notification) listener is configured and ready at <code className="bg-blue-100 px-1 rounded">/api/v1/payments/ipn</code> to receive live callbacks when the gateway is switched on.
            </p>
          </div>
        </div>
      )}

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center"><AlertCircle className="mr-2" size={18}/>{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-border p-6">
        <form onSubmit={handlePayment} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Select Outstanding Bill</label>
            <select 
              required 
              value={selectedBill} 
              onChange={e => {
                setSelectedBill(e.target.value);
                const b = bills.find(x => x.id == e.target.value);
                if (b) setAmount(b.balance_due);
              }} 
              className="w-full px-4 py-3 border border-border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            >
              <option value="">-- Choose a bill to pay --</option>
              {bills.map(b => (
                 <option key={b.id} value={b.id}>
                   Bill {b.bill_number} — Due: UGX {Number(b.balance_due).toLocaleString()}
                 </option>
              ))}
            </select>
            {bills.length === 0 && <p className="text-sm text-green-600 mt-2">You have no outstanding bills!</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Amount to Pay (UGX)</label>
            <input 
              type="number" 
              required 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              className="w-full px-4 py-3 border border-border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-bold text-lg"
              placeholder="0"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-3">Payment Method</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center space-y-2 transition-all ${method === 'mobile_money' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-gray-50'}`}>
                <input type="radio" name="method" value="mobile_money" checked={method === 'mobile_money'} onChange={() => setMethod('mobile_money')} className="hidden" />
                <Smartphone size={28} className={method === 'mobile_money' ? 'text-primary' : 'text-gray-400'}/>
                <span className={`font-medium text-sm ${method === 'mobile_money' ? 'text-primary' : 'text-gray-600'}`}>Mobile Money</span>
              </label>

              <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center space-y-2 transition-all ${method === 'card' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-gray-50'}`}>
                <input type="radio" name="method" value="card" checked={method === 'card'} onChange={() => setMethod('card')} className="hidden" />
                <CreditCard size={28} className={method === 'card' ? 'text-primary' : 'text-gray-400'}/>
                <span className={`font-medium text-sm ${method === 'card' ? 'text-primary' : 'text-gray-600'}`}>Credit/Debit Card</span>
              </label>

              <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center space-y-2 transition-all ${method === 'bank_transfer' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-gray-50'}`}>
                <input type="radio" name="method" value="bank_transfer" checked={method === 'bank_transfer'} onChange={() => setMethod('bank_transfer')} className="hidden" />
                <Wallet size={28} className={method === 'bank_transfer' ? 'text-primary' : 'text-gray-400'}/>
                <span className={`font-medium text-sm ${method === 'bank_transfer' ? 'text-primary' : 'text-gray-600'}`}>Bank Transfer</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={processing || bills.length === 0} 
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {processing ? <span>Processing...</span> : <><span>Pay UGX {amount ? Number(amount).toLocaleString() : '0'}</span><ShieldCheck size={20}/></>}
          </button>
        </form>
      </div>
    </div>
  );
}
