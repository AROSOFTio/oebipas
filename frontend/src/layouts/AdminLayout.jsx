import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import {
  LayoutDashboard, Users, FileText, Settings, LogOut, Briefcase, Zap, Activity,
  Menu, X, Receipt, Tag, ShieldAlert, CreditCard, FileCheck, MessageSquare,
  BarChart2, History, ChevronDown, TrendingUp, AlertTriangle, UserX, Shield,
  Search, Bell, User
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

  const navItemClass = (path) => `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
    isActive(path) 
    ? 'bg-primary text-white shadow-md font-bold' 
    : 'text-blue-100/70 hover:bg-white/10 hover:text-white font-medium'
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
        className={`fixed md:static inset-y-0 left-0 w-72 bg-sidebar text-white flex flex-col shadow-2xl z-50 transform transition-transform duration-500 ease-in-out border-r border-white/5 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-8 flex flex-col items-center border-b border-white/5">
          <div className="w-full bg-white rounded-xl p-3 shadow-lg flex flex-col items-center space-y-2">
            <img src="/logo.png" alt="Logo" className="h-10 object-contain"/>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">OEBIPAS SYSTEM</div>
            <div className="px-3 py-1 bg-sidebar text-white text-[10px] font-bold rounded-full uppercase tracking-widest border border-white/10">
              {role.split(' ')[0]}
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-1 overflow-y-auto custom-scrollbar scroll-smooth">
          
          <Link to="/admin" onClick={close} className={navItemClass('/admin')}>
            <LayoutDashboard size={20}/><span>Overview</span>
          </Link>

          {/* --- Field Operations (Billing/Super) --- */}
          {canShowFieldOps && (
            <div className="pt-6">
              <div className="pb-2 px-3 text-[10px] uppercase tracking-widest text-blue-200/40 font-bold">Field Operations</div>
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
            <div className="pt-6">
              <div className="pb-2 px-3 text-[10px] uppercase tracking-widest text-blue-200/40 font-bold">Financial Engine</div>
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
          <div className="pt-6">
            <div className="pb-2 px-3 text-[10px] uppercase tracking-widest text-blue-200/40 font-bold">Analytics & Support</div>
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
            <div className="pt-6">
              <div className="pb-2 px-3 text-[10px] uppercase tracking-widest text-blue-200/40 font-bold">Administration</div>
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

        <div className="p-6 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 p-3 rounded-lg text-blue-100/60 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold text-sm">
            <LogOut size={18}/><span>Security Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        {/* Topbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-10 z-10 shrink-0 sticky top-0">
          <div className="flex items-center">
            <button className="md:hidden p-2 -ml-2 mr-4 text-gray-600 hover:bg-gray-100 rounded-xl" onClick={() => setIsMobileOpen(true)}>
              <Menu size={24}/>
            </button>
            <div className="hidden sm:block">
               <h3 className="text-lg font-bold text-gray-900">System Monitor</h3>
               <p className="text-xs text-gray-400 font-medium">Monitoring OEBIPAS Operations</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 w-72 transition-all">
              <Search size={18} className="text-gray-400 mr-2"/>
              <input type="text" placeholder="Systems Query..." className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400 focus:ring-0" />
            </div>

            {/* Notification */}
            <div className="relative p-2 text-gray-400 cursor-pointer hover:bg-gray-100 rounded-full transition-colors ml-2">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </div>

            {/* Profile */}
            <div className="flex items-center space-x-3 pl-2 sm:pl-4 border-l border-gray-200 ml-2">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
                  <User size={20} />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white"></span>
              </div>
              <div className="hidden sm:flex flex-col justify-center">
                <span className="font-bold text-gray-900 text-sm leading-tight">{user?.full_name || 'Admin User'}</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">{role}</span>
              </div>
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
