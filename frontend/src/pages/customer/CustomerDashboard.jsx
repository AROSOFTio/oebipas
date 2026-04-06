import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Bell, Activity, Clock, AlertCircle, UserCheck, Zap, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function CustomerDashboard() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLinked, setIsLinked] = useState(false);
  const [period, setPeriod] = useState('6m');
  const [consumptionTrend, setConsumptionTrend] = useState([]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const profileRes = await axiosInstance.get('/customers/my-profile');
      if (profileRes.data.linked) {
        setIsLinked(true);
        const customerProfile = profileRes.data.data;
        setProfile(customerProfile);
        const res = await axiosInstance.get(`/dashboard/customer-summary/${customerProfile.id}`);
        setData(res.data.data);
        setConsumptionTrend(res.data.data.consumption_trend || []);
      } else {
        setIsLinked(false);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async (newPeriod) => {
    try {
      setPeriod(newPeriod);
      const res = await axiosInstance.get(`/consumption/customer/${profile.id}?period=${newPeriod}`);
      // Format the bar data properly for the dashboard chart
      const formatted = res.data.data.map(r => ({
        period: `${r.billing_month}/${r.billing_year}`,
        units: parseFloat(r.units_consumed)
      })).reverse(); // Reverse to show chronological order (left to right)
      setConsumptionTrend(formatted);
    } catch (err) {
      console.error('Fetch Usage Error:', err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Preparing your workspace...</p>
      </div>
    </div>
  );

  // Profile Setup Screen (for unlinked customers)
  if (!isLinked) return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-center">
      <div className="bg-white rounded-3xl shadow-xl border border-border p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sidebar/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="relative">
          <div className="w-24 h-24 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-8 animate-bounce transition-all duration-1000">
            <Sparkles size={48} />
          </div>
          
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Welcome to OEBIPAS, {user?.full_name?.split(' ')[0]}!</h1>
          <p className="text-gray-600 text-lg max-w-xl mx-auto mb-10 leading-relaxed font-medium">
            Your account is active, but we need to link your electricity account to get started. 
            Please contact our support team or an administrator to assign your <strong>Customer Number</strong>.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <div className="bg-gray-50 p-6 rounded-2xl border border-border text-left">
              <div className="flex items-center space-x-3 mb-2 text-primary font-bold">
                <Zap size={20}/>
                <span>Contact Admin</span>
              </div>
              <p className="text-xs text-gray-500">Provide them with your email: <br/><strong className="text-gray-800">{user?.email}</strong></p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-border text-left">
              <div className="flex items-center space-x-3 mb-2 text-primary font-bold">
                <UserCheck size={20}/>
                <span>Verify Info</span>
              </div>
              <p className="text-xs text-gray-500">Ensure your full name matches your bill ID: <br/><strong className="text-gray-800">{user?.full_name}</strong></p>
            </div>
          </div>
          
          <div className="mt-12 flex justify-center space-x-6">
             <Link to="/customer/feedback" className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-primary-dark transition-all transform hover:-translate-y-1">
               Open Support Ticket
             </Link>
             <button onClick={fetchSummary} className="text-gray-500 font-bold hover:text-primary transition-colors">
               I've been linked, refresh now
             </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start space-x-3 max-w-2xl mx-auto">
      <AlertCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
      <div>
        <h3 className="font-semibold text-red-800">Connection Error</h3>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button onClick={fetchSummary} className="mt-3 text-red-700 font-bold hover:underline text-sm">Try Again</button>
      </div>
    </div>
  );

  const { kpis, recent_payments, recent_notifications, consumption_trend } = data;
  const { total_due, current_bill } = kpis;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 font-medium text-sm mt-1 flex items-center">
            Account: <strong className="text-primary ml-1">{profile?.customer_number}</strong>
          </p>
        </div>
        <div className="hidden sm:flex bg-white px-4 py-2 rounded-xl border border-border shadow-sm items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-bold text-gray-600 uppercase tracking-widest leading-none">System Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Current Bill Hero */}
        <div className="lg:col-span-2 bg-sidebar rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col justify-between group p-1 sm:p-2 border border-white/10">
           <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[100px] transition-all duration-1000 group-hover:bg-primary/30"></div>
           
           <div className="relative p-8 sm:p-10 text-white">
             <h2 className="text-blue-200 font-bold tracking-widest uppercase text-xs mb-3 flex items-center">
               <span className="w-8 h-px bg-blue-200/50 mr-3"></span>
               Outstanding Account Balance
             </h2>
             <div className="flex items-baseline space-x-2">
                <span className="text-xl sm:text-2xl font-medium text-blue-200/80 mb-2">UGX</span>
                <div className="text-5xl sm:text-7xl font-black tracking-tighter">
                  {Number(total_due).toLocaleString()}
                </div>
             </div>

             <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {current_bill ? (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                    <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider mb-1 opacity-70">Latest Invoice</p>
                    <p className="text-lg font-bold">{current_bill.bill_number}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-blue-300">Due: <strong>{new Date(current_bill.due_date).toLocaleDateString()}</strong></p>
                      <span className="text-[10px] bg-primary/20 text-white px-2 py-0.5 rounded font-black uppercase tracking-tighter">Usage: {current_bill.units_consumed} kWh</span>
                    </div>
                  </div>
               ) : (
                 <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 backdrop-blur-md">
                   <p className="text-[10px] text-green-300 font-bold uppercase tracking-wider mb-1">Status</p>
                   <p className="text-lg font-bold">Account Paid</p>
                   <p className="text-xs text-green-400 font-medium italic">Thank you for your timely payment!</p>
                 </div>
               )}
               <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                 <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider mb-1 opacity-70">Category</p>
                 <p className="text-lg font-bold capitalize">{profile?.category}</p>
                 <p className="text-xs text-blue-300">Active Service Plan</p>
               </div>
             </div>
           </div>

           <div className="relative px-8 pb-8 sm:px-10 sm:pb-10 pt-4 flex items-center space-x-6">
             <Link to="/customer/pay" className="bg-white text-sidebar px-10 py-4 rounded-2xl font-black shadow-xl hover:shadow-primary/20 hover:bg-gray-50 flex items-center transition-all transform hover:-translate-y-1 active:translate-y-0 text-sm">
               <CreditCard size={20} className="mr-3"/> PAY BILL NOW
             </Link>
             <Link to="/customer/bills" className="text-white hover:text-blue-100 font-bold text-sm underline-offset-8 hover:underline decoration-white/30 decoration-2 transition-all">
               Billing History
             </Link>
           </div>
        </div>

        {/* Notifications Quick View */}
        <div className="bg-white rounded-[2rem] border border-border shadow-sm p-8 flex flex-col relative overflow-hidden h-full min-h-[400px]">
           <div className="flex justify-between items-center mb-8 shrink-0">
             <h2 className="font-black text-gray-900 text-xl tracking-tight flex items-center">
               <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center mr-4 text-yellow-500 border border-yellow-100">
                 <Bell size={22} className={recent_notifications.some(n => n.status === 'pending') ? 'animate-swing' : ''}/>
               </div>
               Alerts
             </h2>
             <Link to="/customer/notifications" className="text-xs text-primary font-black uppercase tracking-widest hover:underline px-3 py-1 bg-primary/5 rounded-lg">View All</Link>
           </div>
           <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
             {recent_notifications.map(n => (
               <div key={n.id} className="group relative">
                 <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-full transition-all group-hover:w-2 ${n.status === 'pending' ? 'bg-primary' : 'bg-gray-200'}`}></div>
                 <div className="pl-6">
                    <p className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed font-medium">{n.message}</p>
                    <span className="text-[10px] font-bold text-gray-400 mt-2 block uppercase tracking-wider">{new Date(n.created_at).toLocaleDateString()}</span>
                 </div>
               </div>
             ))}
             {recent_notifications.length === 0 && (
               <div className="text-center py-10 opacity-40">
                  <Bell size={48} className="mx-auto mb-4 text-gray-300"/>
                  <p className="text-sm font-bold text-gray-400 tracking-tight">No active alerts</p>
               </div>
             )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 space-y-4 sm:space-y-0">
            <h2 className="font-black text-xl text-gray-900 tracking-tight flex items-center">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mr-4 text-green-500 border border-green-100">
                <Activity size={22} />
              </div>
              Usage History
            </h2>
            <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
              {['6m', '1y'].map((p) => (
                <button
                  key={p}
                  onClick={() => fetchUsage(p)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    period === p ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {p === '6m' ? '6 Months' : '1 Year'}
                </button>
              ))}
            </div>
          </div>
          {consumptionTrend.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consumptionTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6"/>
                  <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 700}} dy={15}/>
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10, fontWeight: 700}} dx={-10} />
                  <Tooltip 
                    cursor={{fill: '#F9FAFB', radius: [8, 8, 0, 0]}} 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}}
                    itemStyle={{fontWeight: 950, color: '#10B981'}}
                    formatter={(val) => [`${val} kWh`, 'Consumption']} 
                  />
                  <Bar dataKey="units" fill="#10B981" radius={[8, 8, 4, 4]} barSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-gray-400">
               <Zap size={48} className="opacity-10 mb-4"/>
               <p className="text-sm font-bold tracking-tight">No consumption history logged</p>
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-border flex flex-col">
          <div className="flex justify-between items-center mb-8 shrink-0">
            <h2 className="font-black text-xl text-gray-900 tracking-tight flex items-center">
              <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center mr-4 text-primary border border-primary/10">
                <Clock size={22} />
              </div>
              Recent Payments
            </h2>
            <Link to="/customer/payments" className="text-xs text-primary font-black uppercase tracking-widest hover:underline px-3 py-1 bg-primary/5 rounded-lg">History</Link>
          </div>
          <div className="space-y-4 flex-1">
             {recent_payments.map((p, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100 hover:border-primary/20 transition-all group">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors border border-border group-hover:border-primary/20">
                      <Zap size={20}/>
                    </div>
                    <div>
                      <p className="font-black text-sm text-gray-900 tracking-tight">{p.payment_reference}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{new Date(p.payment_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black block text-gray-900 text-lg leading-none">UGX {Number(p.amount).toLocaleString()}</span>
                    <span className={`text-[9px] uppercase font-black tracking-widest mt-1.5 inline-block px-2 py-0.5 rounded-full ${p.status === 'successful' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{p.status}</span>
                  </div>
                </div>
              ))}
              {recent_payments.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-30">
                   <Clock size={48} className="text-gray-300 mb-4"/>
                   <p className="text-sm font-bold tracking-tight">No recent transactions</p>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
