import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { CreditCard, Wallet, Smartphone, ShieldCheck, AlertCircle, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const PAYMENT_METHODS = [
  { id: 'mobile_money_mtn', label: 'MTN Mobile Money', icon: Smartphone, color: 'bg-[#FFCC00]', text: 'text-black', brand: 'MTN' },
  { id: 'mobile_money_airtel', label: 'Airtel Money', icon: Smartphone, color: 'bg-[#FF0000]', text: 'text-white', brand: 'Airtel' },
  { id: 'card', label: 'Visa / Mastercard', icon: CreditCard, color: 'bg-sidebar', text: 'text-white', brand: 'Card' },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: Wallet, color: 'bg-blue-600', text: 'text-white', brand: 'Bank' },
];

export default function MakePayment() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('mobile_money_mtn');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUnpaidBills();
  }, []);

  const fetchUnpaidBills = async () => {
    try {
      const profileRes = await axiosInstance.get('/customers/my-profile');
      if (!profileRes.data.linked) {
          setError('No customer profile linked to your account. You cannot make payments yet.');
          setLoading(false);
          return;
      }
      const myProfile = profileRes.data.data;
      const billsRes = await axiosInstance.get(`/bills/customer/${myProfile.id}`);
      const unpaid = billsRes.data.data.filter(b => b.balance_due > 0);
      setBills(unpaid);
    } catch (err) { 
        console.error(err); 
        setError('Failed to fetch billing information.');
    } finally { setLoading(false); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!selectedBill || !amount || !method) {
      setError('Please select a bill and payment method'); return;
    }

    try {
      setProcessing(true); setError('');
      const profileRes = await axiosInstance.get('/customers/my-profile');
      const myProfile = profileRes.data.data;
      
      await axiosInstance.post('/payments', {
        customer_id: myProfile.id,
        bill_id: selectedBill,
        amount: amount,
        payment_method: method.startsWith('mobile_money') ? 'mobile_money' : method,
        transaction_reference: `EXT-${method.toUpperCase()}-${Date.now()}`
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/customer/payments');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (success) return (
    <div className="max-w-md mx-auto py-20 text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
            <CheckCircle2 size={56} className="animate-bounce" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Payment Received!</h1>
        <p className="text-gray-500 font-medium">Your account has been updated successfully. Redirecting you to your receipt history...</p>
        <div className="mt-8 overflow-hidden h-1.5 w-full bg-gray-100 rounded-full">
            <div className="h-full bg-green-500 animate-progress origin-left"></div>
        </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Secure Payment Portal</h1>
        <p className="text-gray-500 font-medium mt-1">Settle your outstanding electricity bills securely</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl flex items-center shadow-sm animate-in slide-in-from-top duration-300">
                    <AlertCircle className="mr-3 shrink-0" size={20}/>
                    <span className="text-sm font-bold">{error}</span>
                </div>
            )}

            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-border p-8">
                <form onSubmit={handlePayment} className="space-y-8">
                <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-4">1. Select Bill to Settlement</label>
                    <div className="space-y-3">
                        {bills.map(b => (
                            <label key={b.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedBill == b.id ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'}`}>
                                <div className="flex items-center space-x-4">
                                    <input 
                                        type="radio" 
                                        name="selectedBill" 
                                        value={b.id} 
                                        checked={selectedBill == b.id} 
                                        onChange={() => {
                                            setSelectedBill(b.id);
                                            setAmount(b.balance_due);
                                        }}
                                        className="w-5 h-5 text-primary border-gray-300 focus:ring-primary ring-offset-2"
                                    />
                                    <div>
                                        <p className="font-black text-gray-900 leading-tight">Invoice #{b.bill_number}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Due: {new Date(b.due_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-primary text-lg">UGX {Number(b.balance_due).toLocaleString()}</p>
                                </div>
                            </label>
                        ))}
                        {bills.length === 0 && !error && (
                            <div className="text-center py-10 bg-green-50 rounded-2xl border border-green-100">
                                <CheckCircle2 size={48} className="mx-auto text-green-500 mb-2 opacity-50"/>
                                <p className="font-black text-green-800 text-lg">Zero Balance</p>
                                <p className="text-green-600 text-sm">All your bills are settled. Excellent work!</p>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-4">2. Payment Method</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {PAYMENT_METHODS.map(m => (
                            <label key={m.id} className={`group cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3 transition-all relative overflow-hidden ${method === m.id ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-gray-100 hover:border-gray-200'}`}>
                                <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="hidden" />
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${m.color} ${m.text} shadow-md`}>
                                    <m.icon size={24} />
                                </div>
                                <span className={`font-black text-[10px] uppercase tracking-widest text-center ${method === m.id ? 'text-primary' : 'text-gray-500'}`}>{m.brand}</span>
                                {method === m.id && (
                                    <div className="absolute top-1 right-1">
                                        <div className="w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center shadow-sm">
                                            <ShieldCheck size={10}/>
                                        </div>
                                    </div>
                                )}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={processing || bills.length === 0} 
                        className="w-full bg-sidebar text-white py-5 rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl hover:shadow-black/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center group"
                    >
                        {processing ? (
                            <div className="flex items-center space-x-4">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Verifying Transaction...</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <span>COMPLETE PAYMENT</span>
                                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                            </div>
                        )}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-4 flex items-center justify-center space-x-2">
                        <ShieldCheck size={12}/>
                        <span>Encrypted SSL Secure Payment System</span>
                    </p>
                </div>
                </form>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8 text-primary">
                <h3 className="font-black text-lg mb-4 flex items-center tracking-tight">
                    <Zap size={20} className="mr-3"/>
                    Summary
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between border-b border-primary/10 pb-4">
                        <span className="text-sm font-bold opacity-70">Payable Amount</span>
                        <span className="font-black">UGX {amount ? Number(amount).toLocaleString() : '0'}</span>
                    </div>
                    <div className="flex justify-between border-b border-primary/10 pb-4">
                        <span className="text-sm font-bold opacity-70">Surcharge</span>
                        <span className="font-black">UGX 0</span>
                    </div>
                    <div className="flex justify-between pt-2">
                        <span className="text-base font-black">Total Due</span>
                        <span className="text-2xl font-black underline decoration-4 decoration-primary/20 underline-offset-4">UGX {amount ? Number(amount).toLocaleString() : '0'}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-border rounded-[2rem] p-8">
                <h3 className="font-black text-sm text-gray-900 mb-4 uppercase tracking-[0.1em]">Instant Verification</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    Once you click pay, a prompt will be sent to your mobile device if you've selected Mobile Money. 
                    <br/><br/>
                    Cards and bank transfers are processed through our secure PCI-DSS compliant partner gateway.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
