import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { CreditCard, Bell, Activity, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      // get profile first
      const custRes = await axiosInstance.get('/customers');
      const myProfile = custRes.data.data.find(c => c.user_id === user.id);
      
      if (myProfile) {
        const res = await axiosInstance.get(`/dashboard/customer-summary/${myProfile.id}`);
        setData(res.data.data);
      } else {
         setError("No customer profile strictly linked to your account.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  const { kpis, recent_payments, recent_notifications, consumption_trend } = data;
  const { total_due, current_bill } = kpis;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Current Bill Prompt */}
        <div className="md:col-span-2 bg-gradient-to-r from-primary to-blue-600 rounded-2xl shadow-md p-8 text-white flex flex-col justify-between">
           <div>
             <h2 className="text-blue-100 font-medium tracking-wide uppercase text-sm mb-1">Total Outstanding Balance</h2>
             <div className="text-4xl sm:text-5xl font-bold mb-4">UGX {Number(total_due).toLocaleString()}</div>
             {current_bill && (
               <div className="bg-white/10 rounded-lg p-3 inline-block backdrop-blur-sm">
                 <p className="text-sm"><span className="text-blue-200">Next due by:</span> <strong className="ml-1 text-white">{new Date(current_bill.due_date).toLocaleDateString()}</strong></p>
                 <p className="text-sm"><span className="text-blue-200">Latest Bill:</span> <strong className="ml-1 text-white">{current_bill.bill_number}</strong></p>
               </div>
             )}
           </div>
           
           <div className="mt-8 flex items-center space-x-4">
             <Link to="/customer/pay" className="bg-white text-primary px-6 py-2.5 rounded-full font-bold shadow hover:bg-gray-50 flex items-center transition-transform hover:scale-105 active:scale-95">
               <CreditCard size={18} className="mr-2"/> Pay Now
             </Link>
             <Link to="/customer/bills" className="text-white hover:text-blue-100 font-medium underline-offset-4 hover:underline">
               View All Bills
             </Link>
           </div>
        </div>

        {/* Notifications Quick View */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 flex flex-col">
           <div className="flex justify-between items-center mb-4">
             <h2 className="font-bold text-gray-800 flex items-center"><Bell size={18} className="mr-2 text-yellow-500"/> Alerts</h2>
             <Link to="/customer/notifications" className="text-xs text-primary font-medium hover:underline">View All</Link>
           </div>
           <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2 max-h-[220px]">
             {recent_notifications.map(n => (
               <div key={n.id} className="relative pl-3 border-l-2 border-primary/40">
                 <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                 <p className="text-xs text-gray-500 truncate">{n.message}</p>
                 <span className="text-[10px] text-gray-400 mt-0.5 block">{new Date(n.created_at).toLocaleDateString()}</span>
               </div>
             ))}
             {recent_notifications.length === 0 && <p className="text-sm text-gray-400">No recent alerts.</p>}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consumption Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border">
          <h2 className="font-bold text-gray-800 mb-6 flex items-center"><Activity size={18} className="mr-2 text-green-500"/> 6-Month Usage History</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumption_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10}/>
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F3F4F6'}} formatter={(val) => `${val} Units`} />
                <Bar dataKey="units" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center"><Clock size={18} className="mr-2 text-primary"/> Recent Payments</h2>
          <div className="space-y-4">
             {recent_payments.map((p, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{p.payment_reference}</p>
                    <p className="text-xs text-gray-500">{new Date(p.payment_date).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold block text-green-600">+UGX {Number(p.amount).toLocaleString()}</span>
                    <span className={`text-[10px] uppercase font-bold ${p.status === 'successful' ? 'text-green-600' : 'text-orange-500'}`}>{p.status}</span>
                  </div>
                </div>
              ))}
              {recent_payments.length === 0 && <p className="text-gray-500 text-sm">No recent payments logged.</p>}
          </div>
        </div>
      </div>

    </div>
  );
}
