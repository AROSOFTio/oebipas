import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import {
  LayoutDashboard, Users, FileText, Settings, LogOut, Briefcase, Zap, Activity,
  Menu, X, Receipt, Tag, ShieldAlert, CreditCard, FileCheck, MessageSquare,
  BarChart2, History, ChevronDown, TrendingUp, AlertTriangle, UserX, Shield
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(location.pathname.includes('/admin/reports'));

  const handleLogout = () => { logout(); };
  const isActive = (path) => location.pathname === path;
  const isReportsActive = location.pathname.includes('/admin/reports');

  const close = () => setIsMobileOpen(false);

  const navItemClass = (path) => `flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
    isActive(path) 
    ? 'bg-white/10 text-white shadow-lg shadow-black/20 font-bold' 
    : 'text-gray-400 hover:bg-white/5 hover:text-white font-medium'
  }`;

  // --- SERIOUS ACCESS CONTROL RULES ---
  const role = user?.role || 'Viewer';
  const isSuper = role === 'Super Admin';
  const isBilling = role === 'Billing Officer';
  const isFinance = role === 'Finance Officer';
  const isViewer = role === 'Viewer';

  const canShowFieldOps = isSuper || isBilling;
  const canShowBilling = isSuper || isBilling || isFinance;
  const canShowFinance = isSuper || isFinance;
  const canShowReports = isSuper || isFinance || isViewer;
  const canShowAdmin = isSuper;

  return (
    <div className="flex h-screen bg-gray-50 relative overflow-hidden font-sans">

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={close} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-72 bg-[#0F172A] text-white flex flex-col shadow-2xl z-50 transform transition-transform duration-500 ease-in-out border-r border-white/5 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-8 border-b border-white/5 bg-gradient-to-br from-[#1E293B] to-[#0F172A]">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-white shrink-0 flex items-center justify-center p-1.5 shadow-xl shadow-primary/20 rotate-3">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain"/>
            </div>
            <div>
              <div className="text-xl font-black tracking-tight leading-none text-white">OEBIPAS</div>
              <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1.5 flex items-center">
                <Shield size={10} className="mr-1"/> {role}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-1 overflow-y-auto custom-scrollbar scroll-smooth">
          
          <Link to="/admin" onClick={close} className={navItemClass('/admin')}>
            <LayoutDashboard size={20}/><span>Overview</span>
          </Link>

          {/* --- Field Operations (Billing/Super) --- */}
          {canShowFieldOps && (
            <div className="pt-6 animate-in slide-in-from-left duration-300">
              <div className="pb-3 px-3 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">Enterprise Ops</div>
              <div className="space-y-1">
                <Link to="/admin/customers" onClick={close} className={navItemClass('/admin/customers')}>
                  <Users size={20}/><span>Customers</span>
                </Link>
                <Link to="/admin/connections" onClick={close} className={navItemClass('/admin/connections')}>
                  <Zap size={20}/><span>Connections</span>
                </Link>
                <Link to="/admin/meters" onClick={close} className={navItemClass('/admin/meters')}>
                  <Activity size={20}/><span>Meters Hardware</span>
                </Link>
                <Link to="/admin/consumption" onClick={close} className={navItemClass('/admin/consumption')}>
                  <FileText size={20}/><span>Unit Consumption</span>
                </Link>
              </div>
            </div>
          )}

          {/* --- Billing & Finance --- */}
          {canShowBilling && (
            <div className="pt-6 animate-in slide-in-from-left duration-400">
              <div className="pb-3 px-3 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">Financial Engine</div>
              <div className="space-y-1">
                <Link to="/admin/tariffs" onClick={close} className={navItemClass('/admin/tariffs')}>
                  <Tag size={20}/><span>Tariff Rules</span>
                </Link>
                <Link to="/admin/bills" onClick={close} className={navItemClass('/admin/bills')}>
                  <Receipt size={20}/><span>All Invoices</span>
                </Link>
                {canShowFinance && (
                  <>
                    <Link to="/admin/payments" onClick={close} className={navItemClass('/admin/payments')}>
                      <CreditCard size={20}/><span>Payments</span>
                    </Link>
                    <Link to="/admin/receipts" onClick={close} className={navItemClass('/admin/receipts')}>
                      <FileCheck size={20}/><span>Receipts</span>
                    </Link>
                  </>
                )}
                <Link to="/admin/penalties" onClick={close} className={navItemClass('/admin/penalties')}>
                  <ShieldAlert size={20}/><span>Penalties</span>
                </Link>
              </div>
            </div>
          )}

          {/* --- Analytics & Support --- */}
          <div className="pt-6 animate-in slide-in-from-left duration-500">
            <div className="pb-3 px-3 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">Support & Intel</div>
            <div className="space-y-1">
              <Link to="/admin/feedback" onClick={close} className={navItemClass('/admin/feedback')}>
                <MessageSquare size={20}/><span>Support Tickets</span>
              </Link>
              
              {canShowReports && (
                <>
                  <button
                    onClick={() => setReportsOpen(p => !p)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                      isReportsActive ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white font-medium'
                    }`}
                  >
                    <span className="flex items-center space-x-3"><BarChart2 size={20}/><span>Intel Reports</span></span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${reportsOpen ? 'rotate-180' : ''}`}/>
                  </button>
                  {reportsOpen && (
                    <div className="ml-8 pl-4 border-l border-white/10 space-y-1 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Link to="/admin/reports?type=monthly-billing" onClick={close} className="block p-2 text-xs text-gray-500 hover:text-white">Monthly Billing</Link>
                      <Link to="/admin/reports?type=daily-revenue" onClick={close} className="block p-2 text-xs text-gray-500 hover:text-white">Daily Revenue</Link>
                      <Link to="/admin/reports?type=outstanding-balances" onClick={close} className="block p-2 text-xs text-gray-500 hover:text-white">Outstanding Balances</Link>
                      <Link to="/admin/reports?type=overdue-customers" onClick={close} className="block p-2 text-xs text-gray-500 hover:text-white">Overdue Accounts</Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* --- Administration (Strict Super Admin) --- */}
          {canShowAdmin && (
            <div className="pt-6 animate-in slide-in-from-left duration-600">
              <div className="pb-3 px-3 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">System Core</div>
              <div className="space-y-1">
                <Link to="/admin/users" onClick={close} className={navItemClass('/admin/users')}>
                  <Briefcase size={20}/><span>System Users</span>
                </Link>
                <Link to="/admin/audit-logs" onClick={close} className={navItemClass('/admin/audit-logs')}>
                  <History size={20}/><span>Audit Master Logs</span>
                </Link>
                <Link to="/admin/settings" onClick={close} className={navItemClass('/admin/settings')}>
                  <Settings size={20}/><span>Global Settings</span>
                </Link>
              </div>
            </div>
          )}
        </nav>

        <div className="p-8 border-t border-white/5 bg-[#0F172A]">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 p-4 rounded-2xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold">
            <LogOut size={20}/><span>Security Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
        {/* Topbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-10 z-10 shrink-0 sticky top-0">
          <div className="flex items-center">
            <button className="md:hidden p-2 -ml-2 mr-4 text-gray-600 hover:bg-gray-100 rounded-xl" onClick={() => setIsMobileOpen(true)}>
              <Menu size={24}/>
            </button>
            <div className="hidden sm:block">
               <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Command Center</h3>
               <p className="text-xs text-gray-500 font-medium">Monitoring OEBIPAS Operations</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right flex flex-col justify-center">
              <span className="font-black text-gray-900 text-sm tracking-tight">{user?.full_name}</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">{role}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-black text-lg shadow-xl shadow-black/10 ring-4 ring-gray-100 ring-offset-0">
              {user?.full_name ? user.full_name.charAt(0) : 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-10 custom-scrollbar scroll-smooth">
          <Outlet/>
        </div>
      </main>
    </div>
  );
}
