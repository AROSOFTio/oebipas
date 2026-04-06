import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Users, FileText, CreditCard, AlertCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AuthContext } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const canSeeMoney = ['General Manager', 'Branch Manager', 'Finance Officer'].includes(user?.role);
  const isITRole = ['General Manager', 'IT Officer'].includes(user?.role);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axiosInstance.get('/dashboard/admin-summary');
      setData(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading dashboard metrics...</div>;
  if (!data) return <div className="p-6 text-red-500">Failed to load dashboard</div>;

  const { kpis, recent_bills, recent_payments, recent_audit_logs, revenue_trend } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
      
      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Users size={24}/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Customers</p>
            <h3 className="text-2xl font-bold text-gray-900">{kpis.total_customers}</h3>
          </div>
        </div>
        
        {canSeeMoney && (
          <>
            <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><FileText size={24}/></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Billed</p>
                <h3 className="text-2xl font-bold text-gray-900">UGX {Number(kpis.total_billed).toLocaleString()}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-lg text-green-600"><CreditCard size={24}/></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Received</p>
                <h3 className="text-2xl font-bold text-gray-900">UGX {Number(kpis.total_payments).toLocaleString()}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center space-x-4">
              <div className="bg-red-100 p-3 rounded-lg text-red-600"><AlertCircle size={24}/></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Outstanding Bal</p>
                <h3 className="text-2xl font-bold text-gray-900">UGX {Number(kpis.outstanding_balances).toLocaleString()}</h3>
                <p className="text-xs text-red-500 mt-1">{kpis.overdue_accounts} accounts overdue</p>
              </div>
            </div>
          </>
        )}

        {(!canSeeMoney && isITRole) && (
          <>
            <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center space-x-4">
              <div className="bg-orange-100 p-3 rounded-lg text-orange-600"><Users size={24}/></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">System Users</p>
                <h3 className="text-2xl font-bold text-gray-900">{kpis.total_users || 0}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center space-x-4">
              <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600"><AlertCircle size={24}/></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Active Tickets</p>
                <h3 className="text-2xl font-bold text-gray-900">{kpis.active_tickets || 0}</h3>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        {canSeeMoney ? (
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-border p-6 flex flex-col">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center"><TrendingUp size={18} className="mr-2 text-primary"/> Revenue Trend (6 Months)</h2>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10}/>
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(val) => `UGX ${(val/1000000).toFixed(1)}M`}/>
                  <Tooltip cursor={{fill: '#F3F4F6'}} formatter={(val) => `UGX ${Number(val).toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : isITRole ? (
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-border p-6 flex flex-col">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center">Recent Audit Activity</h2>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Action</th>
                    <th className="pb-3 font-medium">Module</th>
                  </tr>
                </thead>
                <tbody>
                  {(recent_audit_logs || []).map(log => (
                    <tr key={log.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-900">{log.user_name || 'System'}</td>
                      <td className="py-3"><span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">{log.action}</span></td>
                      <td className="py-3 text-gray-600">{log.module}</td>
                    </tr>
                  ))}
                  {(!recent_audit_logs || recent_audit_logs.length === 0) && (
                    <tr><td colSpan="3" className="py-4 text-gray-500">No recent audit logs.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 border border-dashed border-gray-300 rounded-xl flex items-center justify-center p-12 text-gray-400">
            Welcome to the OEBIPAS Operations Center.
          </div>
        )}

        {/* Recent Lists Column Side */}
        <div className="space-y-6">
          {canSeeMoney && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-border p-5">
                <h2 className="font-bold text-gray-800 mb-4">Recent Payments</h2>
                <div className="space-y-3">
                  {recent_payments.map(p => (
                    <div key={p.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-gray-900">{p.customer_name}</p>
                        <p className="text-gray-500 text-xs">{p.payment_reference}</p>
                      </div>
                      <span className="font-bold text-green-600">+{Number(p.amount).toLocaleString()}</span>
                    </div>
                  ))}
                  {recent_payments.length === 0 && <p className="text-gray-500 text-sm">No recent payments.</p>}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-border p-5">
                <h2 className="font-bold text-gray-800 mb-4">Recent Bills Generated</h2>
                <div className="space-y-3">
                  {recent_bills.map(b => (
                    <div key={b.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-gray-900">{b.customer_name}</p>
                        <p className="text-gray-500 text-xs">{b.bill_number}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold block text-gray-700">{Number(b.total_amount).toLocaleString()}</span>
                        <span className={`text-[10px] uppercase font-bold ${b.status === 'paid' ? 'text-green-600' : 'text-red-500'}`}>{b.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  ))}
                  {recent_bills.length === 0 && <p className="text-gray-500 text-sm">No recent bills.</p>}
                </div>
              </div>
            </>
          )}

          {(!canSeeMoney && isITRole) && (
            <div className="bg-white rounded-xl shadow-sm border border-border p-5">
              <h2 className="font-bold text-gray-800 mb-4">System Status</h2>
              <div className="flex items-center space-x-3 text-green-600 font-bold mb-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span>All Systems Operational</span>
              </div>
              <p className="text-gray-500 text-xs">No active critical alerts or server downtime reported. Latest backup executed successfully.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
