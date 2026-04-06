import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Activity, Zap, BarChart as ChartIcon, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function CustomerConsumption() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('6m');
  const [profile, setProfile] = useState(null);

  useEffect(() => { 
    fetchHistory(); 
  }, []);

  const fetchHistory = async (newPeriod = '6m') => {
    try {
      setPeriod(newPeriod);
      let customerId = profile?.id;
      if (!customerId) {
        const profileRes = await axiosInstance.get('/customers/my-profile');
        customerId = profileRes.data.data.id;
        setProfile(profileRes.data.data);
      }
      const res = await axiosInstance.get(`/consumption/customer/${customerId}?period=${newPeriod}`);
      setRecords(res.data.data || []);
    } catch (err) {
      console.error(err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // Format data for chart
  const chartData = [...records].reverse().map(r => ({
    period: `${r.billing_month}/${r.billing_year}`,
    units: parseFloat(r.units_consumed)
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <Zap size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Usage Analysis</h1>
            <p className="text-gray-500 font-medium text-sm">Detailed breakdown of your electricity consumption</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-border shadow-sm">
          {['6m', '1y', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => fetchHistory(p)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                period === p ? 'bg-sidebar text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p === '6m' ? '6 Months' : p === '1y' ? '1 Year' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Usage Graph Card */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-black text-xl text-gray-900 tracking-tight flex items-center">
              <ChartIcon size={20} className="mr-3 text-primary" /> Consumption Trend
            </h2>
            <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest space-x-4">
               <span className="flex items-center"><div className="w-2 h-2 bg-primary rounded-full mr-2"></div> kWh Billed</span>
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9"/>
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}} dy={15}/>
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}} dx={-10} />
                <Tooltip 
                  cursor={{fill: '#F8FAFC', radius: [10, 10, 0, 0]}} 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px'}}
                  itemStyle={{fontWeight: 950, color: '#3B82F6'}}
                  formatter={(val) => [`${val} kWh`, 'Billed Units']} 
                />
                <Bar dataKey="units" fill="#3B82F6" radius={[10, 10, 5, 5]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-border overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
           <h2 className="font-black text-xl text-gray-900 tracking-tight flex items-center">
              <Calendar size={20} className="mr-3 text-primary" /> Monthly Readings
           </h2>
           <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">Showing {records.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-border">
                <th className="px-8 py-5">Period</th>
                <th className="px-8 py-5">Meter Details</th>
                <th className="px-8 py-5 text-right">Units (kWh)</th>
                <th className="px-8 py-5 text-right">Reading Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-blue-50/30 transition-all group">
                  <td className="px-8 py-6">
                    <span className="font-black text-gray-900 text-lg">{`${r.billing_month}/${r.billing_year}`}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                        <Activity size={16}/>
                      </div>
                      <span className="text-sm font-bold text-gray-600">MTR-{r.meter_number}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-xl font-black text-primary">{(Number(r.units_consumed) || 0).toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-sm font-bold text-gray-400">{new Date(r.reading_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <div className="inline-flex flex-col items-center justify-center text-gray-300">
                      <Activity size={64} className="mb-4 opacity-20" />
                      <p className="text-xl font-black text-gray-400 tracking-tight">No consumption history</p>
                      <p className="text-sm font-bold mt-1 max-w-[250px] mx-auto text-gray-400">Records will appear here once your meter has its first reading.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
