import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { 
  Users, FileText, CreditCard, AlertCircle, TrendingUp, 
  Cpu, Server, Activity, Wrench, MessageSquare, CheckCircle, Clock, Link as LinkIcon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AuthContext } from '../../context/AuthContext';

// --- Shared Components ---
const KPICard = ({ title, value, icon, color, subtext }) => {
  const bgColors = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-indigo-100 text-indigo-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    teal: 'bg-teal-100 text-teal-600',
  };
  return (
    <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center space-x-4 transition-all hover:shadow-md">
      <div className={`${bgColors[color] || bgColors.blue} p-3 rounded-lg`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 line-clamp-1">{value}</h3>
        {subtext && <p className={`text-xs mt-1 ${color === 'red' ? 'text-red-500 font-medium' : 'text-gray-500'}`}>{subtext}</p>}
      </div>
    </div>
  );
};

// --- Role Specific Views ---

const FinanceView = ({ data }) => {
  const { kpis, recent_bills, recent_payments, revenue_trend } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Total Billed" value={`UGX ${Number(kpis?.total_billed || 0).toLocaleString()}`} icon={<FileText size={24}/>} color="purple" />
        <KPICard title="Total Received" value={`UGX ${Number(kpis?.total_payments || 0).toLocaleString()}`} icon={<CreditCard size={24}/>} color="green" />
        <KPICard title="Outstanding Bal" value={`UGX ${Number(kpis?.outstanding_balances || 0).toLocaleString()}`} icon={<AlertCircle size={24}/>} color="red" subtext={`${kpis?.overdue_accounts || 0} accounts overdue`} />
        {kpis?.my_active_tasks > 0 && <KPICard title="My Active Tasks" value={kpis.my_active_tasks} icon={<MessageSquare size={24}/>} color="orange" subtext="Assigned to you" />}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-border p-5">
            <h2 className="font-bold text-gray-800 mb-4">Recent Payments</h2>
            <div className="space-y-3">
              {(recent_payments || []).map(p => (
                <div key={p.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{p.customer_name}</p>
                    <p className="text-gray-500 text-xs">{p.payment_reference}</p>
                  </div>
                  <span className="font-bold text-green-600">+{Number(p.amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ITView = ({ data }) => {
  const { kpis, recent_audit_logs } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Total System Users" value={kpis?.total_users || 0} icon={<Users size={24}/>} color="blue" />
        <KPICard title="Automation Engine" value="Active" icon={<Activity size={24}/>} color="green" subtext="Invoicing & Penalties" />
        <KPICard title="My Active Tasks" value={kpis?.my_active_tasks || 0} icon={<MessageSquare size={24}/>} color="orange" subtext="Action required" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-border p-6 flex flex-col">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center">System Audit Logs</h2>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="pb-3 font-medium">User / Actor</th>
                  <th className="pb-3 font-medium">Action</th>
                  <th className="pb-3 font-medium">Module</th>
                </tr>
              </thead>
              <tbody>
                {(recent_audit_logs || []).map(log => (
                  <tr key={log.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="py-3 font-medium">
                      {log.user_name ? (
                        <span className="text-gray-900">{log.user_name}</span>
                      ) : (
                        <span className="text-primary font-black bg-primary/5 px-2 py-0.5 rounded text-[10px] uppercase border border-primary/10">System Auto</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-tight ${log.action.includes('AUTO') ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600 font-medium">{log.module}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-border p-5 h-fit">
          <h2 className="font-bold text-gray-800 mb-4 flex-col items-center">
            <div className="flex items-center mb-1"><Cpu size={18} className="mr-2 text-primary"/> Automation Status</div>
          </h2>
          <div className="space-y-4">
             <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-xs font-bold text-gray-600 uppercase">Penalty Engine</span>
                   <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed">Running category check intervals for overdue accounts (Res/Com/Ind).</p>
             </div>
             <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-xs font-bold text-gray-600 uppercase">Auto-Invoicing</span>
                   <span className="text-[10px] font-black text-primary">INSTANT</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed">Generation triggered immediately upon valid consumption log.</p>
             </div>
          </div>
        </div>

        {/* My Tasks Section */}
        {data.my_assigned_tickets?.length > 0 && (
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-border p-6 font-sans mt-6">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center text-orange-600 uppercase tracking-widest text-xs">
              <MessageSquare size={16} className="mr-2"/> My Pending Tasks ({data.my_assigned_tickets.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 uppercase text-[10px] font-black">
                    <th className="pb-3">Ticket ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Subject</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.my_assigned_tickets.map(t => (
                    <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-orange-50/30 transition-all">
                      <td className="py-4 font-black text-gray-400 text-xs">#{t.id.toString().padStart(5, '0')}</td>
                      <td className="py-4 font-bold text-gray-900">{t.customer_name}</td>
                      <td className="py-4 text-gray-700">{t.subject}</td>
                      <td className="py-4"><span className="text-[10px] px-2 py-1 bg-gray-100 rounded-md font-bold uppercase">{t.category}</span></td>
                      <td className="py-4 text-gray-400 text-xs">{new Date(t.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-50 text-right">
              <a href="/admin/feedback" className="text-xs font-black text-primary hover:underline uppercase tracking-widest">Go to Ticket Command Center →</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const OperationsView = ({ data }) => {
  const { kpis, recent_connections, recent_readings } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Total Connections" value={kpis?.total_connections || 0} icon={<LinkIcon size={24}/>} color="blue" />
        <KPICard title="Inactive Connections" value={kpis?.inactive_connections || 0} icon={<Clock size={24}/>} color="orange" subtext="Require field attention" />
        {kpis?.my_active_tasks > 0 ? (
          <KPICard title="My Active Tasks" value={kpis.my_active_tasks} icon={<MessageSquare size={24}/>} color="red" subtext="Action required" />
        ) : (
          <KPICard title="Meters Installed" value={kpis?.meters_installed || 0} icon={<Wrench size={24}/>} color="teal" />
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-border p-6 font-sans">
          <h2 className="font-bold text-gray-800 mb-4">Recent Connection Requests</h2>
          <div className="space-y-4">
            {(recent_connections || []).map(conn => (
              <div key={conn.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-bold text-gray-900">{conn.customer_name}</p>
                  <p className="text-gray-500 text-xs">{conn.connection_number}</p>
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${conn.status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>{conn.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-border p-6 font-sans">
          <h2 className="font-bold text-gray-800 mb-4">Recent Meter Readings</h2>
          <div className="space-y-4">
            {(recent_readings || []).map(r => (
              <div key={r.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-bold text-gray-900">{r.customer_name}</p>
                  <p className="text-gray-500 text-xs text-mono">Meter: {r.meter_number}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{r.units_consumed} Units</p>
                  <p className="text-gray-400 text-xs">{new Date(r.reading_date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SupportView = ({ data }) => {
  const { kpis, recent_feedback } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Active Customers" value={kpis?.total_customers || 0} icon={<Users size={24}/>} color="blue" />
        <KPICard title="Open Tickets" value={kpis?.active_tickets || 0} icon={<MessageSquare size={24}/>} color="yellow" subtext="Requires attention" />
        <KPICard title="Resolved Tickets" value={kpis?.resolved_tickets || 0} icon={<CheckCircle size={24}/>} color="green" />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-border p-6">
        <h2 className="font-bold text-gray-800 mb-4">Recent Support Tickets</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Subject</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(recent_feedback || []).map(f => (
                <tr key={f.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-900">{f.customer_name}</td>
                  <td className="py-3 text-gray-600">{f.subject}</td>
                  <td className="py-3 text-gray-500 text-xs">{new Date(f.created_at).toLocaleDateString()}</td>
                  <td className="py-3">
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${f.status === 'resolved' || f.status === 'closed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>{f.status.replace('_', ' ')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ExecutiveView = ({ data }) => {
  const { kpis } = data;
  return (
    <div className="space-y-6">
      <div className="mb-4">
         <h2 className="text-xl font-bold text-gray-800">Executive Summary</h2>
         <p className="text-gray-500 text-sm">Cross-departmental organizational overview</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Core Financial */}
        <KPICard title="Total Billed" value={`UGX ${Number(kpis?.total_billed || 0).toLocaleString()}`} icon={<FileText size={24}/>} color="purple" />
        <KPICard title="Total Received" value={`UGX ${Number(kpis?.total_payments || 0).toLocaleString()}`} icon={<CreditCard size={24}/>} color="green" />
        <KPICard title="Outstanding Bal" value={`UGX ${Number(kpis?.outstanding_balances || 0).toLocaleString()}`} icon={<AlertCircle size={24}/>} color="red" />
        
        {/* Operational */}
        <KPICard title="Active Customers" value={kpis?.total_customers || 0} icon={<Users size={24}/>} color="blue" />
        <KPICard title="Total Connections" value={kpis?.total_connections || 0} icon={<LinkIcon size={24}/>} color="teal" />
        <KPICard title="Meters Installed" value={kpis?.meters_installed || 0} icon={<Wrench size={24}/>} color="orange" />
        
        {/* Support & Internal */}
        <KPICard title="Active Tickets" value={kpis?.active_tickets || 0} icon={<MessageSquare size={24}/>} color="yellow" />
        <KPICard title="System Users" value={kpis?.total_users || 0} icon={<Cpu size={24}/>} color="blue" />
      </div>
    </div>
  );
};

// --- Staff View (Fallback for any role NOT explicitly mapped) ---
const StaffView = ({ data, role }) => {
  const { kpis } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KPICard title="My Active Tasks" value={kpis?.my_active_tasks || 0} icon={<MessageSquare size={24}/>} color="orange" subtext="Tickets requiring your attention" />
        <KPICard title="Current Status" value="Active" icon={<Activity size={24}/>} color="green" subtext={`Logged in as ${role}`} />
      </div>
      
      {data.my_assigned_tickets?.length > 0 && (
         <div className="bg-white rounded-xl shadow-sm border border-border p-6 font-sans">
         <h2 className="font-bold text-gray-800 mb-4 flex items-center text-primary uppercase tracking-widest text-xs">
           <MessageSquare size={16} className="mr-2"/> Your Pending Assignments ({data.my_assigned_tickets.length})
         </h2>
         <div className="overflow-x-auto">
           <table className="w-full text-left text-sm">
             <thead>
               <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] font-black">
                 <th className="pb-3">Ticket ID</th>
                 <th className="pb-3">Customer</th>
                 <th className="pb-3">Subject</th>
                 <th className="pb-3">Date</th>
               </tr>
             </thead>
             <tbody>
               {data.my_assigned_tickets.map(t => (
                 <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-primary/5 transition-all">
                   <td className="py-4 font-black text-gray-300 text-xs">#{t.id.toString().padStart(5, '0')}</td>
                   <td className="py-4 font-bold text-gray-900">{t.customer_name}</td>
                   <td className="py-4 text-gray-700">{t.subject}</td>
                   <td className="py-4 text-gray-400 text-xs">{new Date(t.created_at).toLocaleDateString()}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
         <div className="mt-6 pt-4 border-t border-gray-50 text-right">
           <a href="/admin/feedback" className="text-xs font-black text-primary hover:underline uppercase tracking-widest">Open Support Tickets →</a>
         </div>
       </div>
      )}
    </div>
  );
};

// --- Main Container ---

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return (
    <div className="p-12 text-center">
       <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
       <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Command Center...</p>
    </div>
  );
  if (!data) return <div className="p-6 text-red-500 font-black">System unreachable. Please refresh.</div>;

  const role = (user?.role || '').toLowerCase();
  const userName = user?.full_name?.split(' ')[0] || 'Officer';

  // Role categorization for UI routing
  const isExecutive = ['super admin', 'general manager', 'regional manager', 'branch manager'].includes(role);
  const isFinance = ['finance officer', 'accounts officer'].includes(role);
  const isIT = ['it officer', 'system admin', 'it admin'].includes(role);
  const isOperations = ['operation officer', 'field officer', 'technician', 'operations officer'].includes(role);
  const isSupport = ['help desk', 'customer support', 'helpdesk'].includes(role);

  return (
    <div className="space-y-6 font-sans p-1 sm:p-2 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 mb-8">
         <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
              Welcome back, {userName}
              <span className="ml-3 flex h-3 w-3 rounded-full bg-green-500 border-2 border-white shadow-sm"></span>
            </h1>
            <p className="text-gray-500 mt-1 font-medium capitalize">{user?.role} Control Panel</p>
         </div>
         <div className="bg-white border border-gray-200 px-5 py-3 rounded-2xl shadow-sm text-xs font-black text-gray-500 uppercase tracking-widest flex items-center">
            <Clock size={14} className="mr-2 text-primary"/>
            {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
         </div>
      </div>
      
      {/* Route the role to specific component (Case-insensitive & Robust) */}
      {isExecutive && <ExecutiveView data={data} />}
      {isFinance && <FinanceView data={data} />}
      {isIT && <ITView data={data} />}
      {isOperations && <OperationsView data={data} />}
      {isSupport && <SupportView data={data} />}
      
      {/* Fallback View for any staff role not explicitly caught above */}
      {!isExecutive && !isFinance && !isIT && !isOperations && !isSupport && (
        <StaffView data={data} role={user?.role} />
      )}
    </div>
  );
}
