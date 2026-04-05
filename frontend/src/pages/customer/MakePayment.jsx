import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { CreditCard, Smartphone, ShieldCheck, AlertCircle, CheckCircle2, ChevronRight, Zap, Building2, Globe } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const PAYMENT_METHODS = [
  { id: 'mobile_money_mtn', label: 'MTN Mobile Money', icon: Smartphone, color: 'bg-[#FFCC00]', text: 'text-black', brand: 'MTN' },
  { id: 'mobile_money_airtel', label: 'Airtel Money', icon: Smartphone, color: 'bg-[#FF0000]', text: 'text-white', brand: 'Airtel' },
  { id: 'card', label: 'Visa / Mastercard', icon: CreditCard, color: 'bg-sidebar', text: 'text-white', brand: 'Card' },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: Building2, color: 'bg-blue-600', text: 'text-white', brand: 'Bank' },
  { id: 'pesapal', label: 'PesaPal Gateway', icon: Globe, color: 'bg-green-600', text: 'text-white', brand: 'PesaPal' },
];

const MTN_PREFIXES = ['076', '077', '078', '031', '039'];
const AIRTEL_PREFIXES = ['070', '074', '075'];

export default function MakePayment() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState('');
  const [amount, setAmount] = useState('0');
  const [method, setMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // New Validation States
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneWarning, setPhoneWarning] = useState('');
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [cardType, setCardType] = useState(null);

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
      const unpaid = billsRes.data.data.filter(b => Number(b.balance_due) > 0);
      setBills(unpaid);
    } catch (err) { 
        console.error(err); 
        setError('Failed to fetch billing information.');
    } finally { setLoading(false); }
  };

  const validatePhone = (num, currentMethod) => {
    if (!num) return '';
    if (num.length < 3) return '';
    const prefix = num.substring(0, 3);
    
    if (currentMethod === 'mobile_money_mtn') {
        if (!MTN_PREFIXES.includes(prefix)) {
            return `This is not an MTN number. Use: ${MTN_PREFIXES.join(', ')}`;
        }
    } else if (currentMethod === 'mobile_money_airtel') {
        if (!AIRTEL_PREFIXES.includes(prefix)) {
            return `This is not an Airtel number. Use: ${AIRTEL_PREFIXES.join(', ')}`;
        }
    }
    
    if (num.length > 10) return 'Max 10 digits';
    return '';
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(val);
    setPhoneWarning(validatePhone(val, method));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let finalVal = value;
    if (name === 'number') {
        finalVal = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
        if (finalVal.startsWith('4')) setCardType('visa');
        else if (/^5[1-5]/.test(finalVal)) setCardType('mastercard');
        else setCardType(null);
    }
    setCardData(prev => ({ ...prev, [name]: finalVal }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!selectedBill || !method) { setError('Select a bill and method'); return; }

    if (method.startsWith('mobile_money')) {
        if (phoneNumber.length !== 10) { setError('Enter a 10-digit number'); return; }
        const warn = validatePhone(phoneNumber, method);
        if (warn) { setError(warn); return; }
    }

    if (method === 'card') {
        if (cardData.number.replace(/\s/g, '').length < 16) { setError('Invalid card'); return; }
        if (!cardData.expiry || !cardData.cvv) { setError('Check card fields'); return; }
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
        transaction_reference: `EXT-${method.toUpperCase()}-${Date.now()}`,
        phone_number: phoneNumber,
        card_last_four: method === 'card' ? cardData.number.slice(-4) : null
      });
      
      setSuccess(true);
      setTimeout(() => { navigate('/customer/payments'); }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment failed');
    } finally { setProcessing(false); }
  };

  if (loading) return <div className="p-10 text-center">Loading portal...</div>;

  if (success) return (
    <div className="max-w-md mx-auto py-20 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Success!</h1>
        <p className="text-gray-500 font-medium">Payment received safely.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Secure Payment Portal</h1>
        <p className="text-gray-500 font-medium tracking-tight">Settle your outstanding electricity bills securely</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl flex items-center shadow-sm">
                    <AlertCircle className="mr-3 shrink-0" size={20}/>
                    <span className="text-sm font-bold">{error}</span>
                </div>
            )}

            <div className="bg-white rounded-[2rem] shadow-xl border border-border p-8">
                <form onSubmit={handlePayment} className="space-y-8">
                <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-4">1. Select Bill to Settlement</label>
                    <div className="space-y-3">
                        {bills.map(b => (
                            <div 
                                key={b.id} 
                                onClick={() => { setSelectedBill(b.id); setAmount(b.balance_due); }}
                                className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedBill === b.id ? 'border-primary bg-primary/5' : 'border-gray-50 bg-gray-50/30'}`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedBill === b.id ? 'border-primary bg-primary' : 'border-gray-300 bg-white'}`}>
                                        {selectedBill === b.id && <div className="w-2 h-2 bg-white rounded-full"/>}
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900">Invoice #{b.bill_number}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Due: {new Date(b.due_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <p className="font-black text-primary text-lg">UGX {Number(b.balance_due).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-4">2. Payment Method</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {PAYMENT_METHODS.map(m => (
                            <div 
                                key={m.id} 
                                onClick={() => { setMethod(m.id); setPhoneWarning(validatePhone(phoneNumber, m.id)); }}
                                className={`group cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3 transition-all relative overflow-hidden ${method === m.id ? 'border-primary bg-primary/5 shadow-lg' : 'border-gray-100 hover:border-gray-200'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.color} ${m.text} shadow-md`}>
                                    <m.icon size={20} />
                                </div>
                                <span className={`font-black text-[9px] uppercase tracking-widest text-center ${method === m.id ? 'text-primary' : 'text-gray-500'}`}>{m.brand}</span>
                                {method === m.id && (
                                    <div className="absolute top-1 right-1">
                                        <ShieldCheck size={14} className="text-primary"/>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- PHONE FIELD (MTN/AIRTEL) --- */}
                {(method === 'mobile_money_mtn' || method === 'mobile_money_airtel') && (
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">3. Enter Mobile Number</label>
                        <div className="relative">
                            <input 
                                type="text"
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                placeholder="07XXXXXXXX"
                                className={`w-full bg-white border-2 rounded-2xl px-5 py-4 font-black text-2xl outline-none transition-all ${phoneWarning ? 'border-red-300 text-red-500' : 'border-gray-200 focus:border-primary'}`}
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                <Smartphone className={phoneWarning ? 'text-red-400' : 'text-gray-300'} size={28}/>
                            </div>
                        </div>
                        {phoneWarning && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{phoneWarning}</p>}
                        {!phoneWarning && phoneNumber.length === 10 && <p className="text-green-600 text-[10px] font-black uppercase tracking-widest flex items-center">Valid {method === 'mobile_money_mtn' ? 'MTN' : 'Airtel'} Number</p>}
                    </div>
                )}

                {/* --- CARD FIELDS --- */}
                {method === 'card' && (
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">3. Card Details</label>
                        <div className="relative">
                            <input 
                                type="text"
                                name="number"
                                value={cardData.number}
                                onChange={handleCardChange}
                                placeholder="4000 0000 0000 0000"
                                className="w-full bg-white border-2 border-gray-200 focus:border-primary rounded-2xl px-5 py-4 font-black text-xl outline-none"
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                {cardType === 'visa' && <span className="text-blue-600 font-black italic">VISA</span>}
                                {cardType === 'mastercard' && <span className="text-red-600 font-black italic">MC</span>}
                                {!cardType && <CreditCard className="text-gray-300" size={24}/>}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" name="expiry" value={cardData.expiry} onChange={handleCardChange} placeholder="MM/YY" className="bg-white border-2 border-gray-200 focus:border-primary rounded-2xl px-5 py-4 font-black text-lg outline-none" />
                            <input type="password" name="cvv" value={cardData.cvv} onChange={handleCardChange} placeholder="CVV" className="bg-white border-2 border-gray-200 focus:border-primary rounded-2xl px-5 py-4 font-black text-lg outline-none" />
                        </div>
                        <input type="text" name="name" value={cardData.name} onChange={handleCardChange} placeholder="CARDHOLDER NAME" className="w-full bg-white border-2 border-gray-200 focus:border-primary rounded-2xl px-5 py-4 font-black text-lg outline-none uppercase" />
                    </div>
                )}

                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={processing || bills.length === 0 || !!phoneWarning || !method} 
                        className="w-full bg-sidebar text-white py-5 rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl hover:shadow-black/20 disabled:opacity-30 flex items-center justify-center group"
                    >
                        {processing ? <span>Processing...</span> : <span>COMPLETE PAYMENT</span>}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">Protected by Encrypted SSL Security</p>
                </div>
                </form>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-sidebar text-white rounded-[2rem] p-8">
                <h3 className="font-black text-lg mb-4 flex items-center"><Zap size={20} className="mr-3 text-primary"/>Summary</h3>
                <div className="space-y-4">
                    <div className="flex justify-between border-b border-white/10 pb-4">
                        <span className="text-sm font-bold opacity-60">Payable Amount</span>
                        <span className="font-black">UGX {amount ? Number(amount).toLocaleString() : '0'}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-4">
                        <span className="text-sm font-bold opacity-60">Surcharge</span>
                        <span className="font-black">UGX 0</span>
                    </div>
                    <div className="flex justify-between pt-2">
                        <span className="text-base font-black">Total Due</span>
                        <span className="text-2xl font-black text-primary underline underline-offset-4">UGX {amount ? Number(amount).toLocaleString() : '0'}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-border rounded-[2rem] p-8 shadow-sm">
                <h3 className="font-black text-sm text-gray-900 mb-4 uppercase tracking-widest">Instant Verification</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    Once you click pay, a prompt will be sent to your mobile device for mobile money. 
                    <br/><br/>
                    PesaPal, Cards and bank transfers are processed through our secure partner gateway.
                </p>
                {method === 'pesapal' && (
                    <div className="mt-6 pt-6 border-t border-gray-100 flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                        <p className="text-[10px] font-black text-green-600 uppercase">PesaPal Redirect Active</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
