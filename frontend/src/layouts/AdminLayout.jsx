import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import {
  LayoutDashboard, Users, FileText, Settings, LogOut, Briefcase, Zap, Activity,
  Menu, X, Receipt, Tag, ShieldAlert, CreditCard, FileCheck, MessageSquare,
  BarChart2, History, ChevronDown, TrendingUp, AlertTriangle, UserX
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const REPORT_LINKS = [
  { to: '/admin/reports?type=monthly-billing', label: 'Monthly Billing' },
  { to: '/admin/reports?type=daily-revenue', label: 'Daily Revenue' },
  { to: '/admin/reports?type=outstanding-balances', label: 'Outstanding Balances' },
  { to: '/admin/reports?type=overdue-customers', label: 'Overdue Accounts' },
];

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(location.pathname.includes('/admin/reports'));

  const handleLogout = () => { logout(); };

  const isActive = (path) => location.pathname === path;
  const isReportsActive = location.pathname.includes('/admin/reports');

  const navItemClass = (path) => `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
    isActive(path) ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
  }`;

  const close = () => setIsMobileOpen(false);

  return (
    <div className="flex h-screen bg-background relative overflow-hidden">

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-sidebar text-white flex flex-col shadow-2xl md:shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-light/20">
          <div className="flex items-center space-x-2">
            <div className="w-14 h-14 rounded-full bg-white shrink-0 flex items-center justify-center p-0.5">
              <img src="/logo.png" alt="OEBIPAS" className="w-full h-full object-contain"/>
            </div>
            <div>
              <div className="text-base font-bold tracking-wide leading-tight">OEBIPAS</div>
              <div className="text-[10px] font-medium text-blue-300 uppercase tracking-widest leading-tight">{user?.role}</div>
            </div>
          </div>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={close}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">

          <Link to="/admin" onClick={close} className={navItemClass('/admin')}>
            <LayoutDashboard size={20}/><span>Dashboard</span>
          </Link>

          {/* --- Customers & Connections --- */}
          <div className="pt-2 pb-1 px-3 text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Field Operations</div>
          <Link to="/admin/customers" onClick={close} className={navItemClass('/admin/customers')}>
            <Users size={20}/><span>Customers</span>
          </Link>
          <Link to="/admin/connections" onClick={close} className={navItemClass('/admin/connections')}>
            <Zap size={20}/><span>Connections</span>
          </Link>
          <Link to="/admin/meters" onClick={close} className={navItemClass('/admin/meters')}>
            <Activity size={20}/><span>Meters</span>
          </Link>
          <Link to="/admin/consumption" onClick={close} className={navItemClass('/admin/consumption')}>
            <FileText size={20}/><span>Consumption</span>
          </Link>

          {/* --- Billing --- */}
          <div className="pt-3 pb-1 px-3 text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Billing & Finance</div>
          <Link to="/admin/tariffs" onClick={close} className={navItemClass('/admin/tariffs')}>
            <Tag size={20}/><span>Tariff Rules</span>
          </Link>
          <Link to="/admin/bills" onClick={close} className={navItemClass('/admin/bills')}>
            <Receipt size={20}/><span>Bills</span>
          </Link>
          <Link to="/admin/penalties" onClick={close} className={navItemClass('/admin/penalties')}>
            <ShieldAlert size={20}/><span>Penalties</span>
          </Link>
          <Link to="/admin/payments" onClick={close} className={navItemClass('/admin/payments')}>
            <CreditCard size={20}/><span>Payments</span>
          </Link>
          <Link to="/admin/receipts" onClick={close} className={navItemClass('/admin/receipts')}>
            <FileCheck size={20}/><span>Receipts</span>
          </Link>

          {/* --- CRM --- */}
          <div className="pt-3 pb-1 px-3 text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Support</div>
          <Link to="/admin/feedback" onClick={close} className={navItemClass('/admin/feedback')}>
            <MessageSquare size={20}/><span>Support Tickets</span>
          </Link>

          {/* --- Reports Dropdown --- */}
          <div className="pt-3 pb-1 px-3 text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Analytics</div>
          <button
            onClick={() => setReportsOpen(p => !p)}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
              isReportsActive ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="flex items-center space-x-3"><BarChart2 size={20}/><span>Reports</span></span>
            <ChevronDown size={16} className={`transition-transform duration-200 ${reportsOpen ? 'rotate-180' : ''}`}/>
          </button>
          {reportsOpen && (
            <div className="ml-4 pl-4 border-l border-white/10 space-y-1 mt-1">
              <Link
                to="/admin/reports?type=monthly-billing"
                onClick={() => { setReportsOpen(true); close(); }}
                className="flex items-center space-x-2 p-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <BarChart2 size={15}/><span>Monthly Billing</span>
              </Link>
              <Link
                to="/admin/reports?type=daily-revenue"
                onClick={() => { setReportsOpen(true); close(); }}
                className="flex items-center space-x-2 p-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <TrendingUp size={15}/><span>Daily Revenue</span>
              </Link>
              <Link
                to="/admin/reports?type=outstanding-balances"
                onClick={() => { setReportsOpen(true); close(); }}
                className="flex items-center space-x-2 p-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <AlertTriangle size={15}/><span>Outstanding Balances</span>
              </Link>
              <Link
                to="/admin/reports?type=overdue-customers"
                onClick={() => { setReportsOpen(true); close(); }}
                className="flex items-center space-x-2 p-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <UserX size={15}/><span>Overdue Accounts</span>
              </Link>
            </div>
          )}

          <Link to="/admin/audit-logs" onClick={close} className={navItemClass('/admin/audit-logs')}>
            <History size={20}/><span>Audit Logs</span>
          </Link>

          {/* --- Admin --- */}
          {user?.role === 'Super Admin' && (
            <>
              <div className="pt-3 pb-1 px-3 text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Administration</div>
              <Link to="/admin/users" onClick={close} className={navItemClass('/admin/users')}>
                <Briefcase size={20}/><span>System Users</span>
              </Link>
            </>
          )}
          <Link to="/admin/settings" onClick={close} className={navItemClass('/admin/settings')}>
            <Settings size={20}/><span>Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-sidebar-light/20">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-red-600/80 hover:text-white transition-colors">
            <LogOut size={20}/><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-border shadow-sm flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
          <div className="flex items-center">
            <button
              className="md:hidden p-2 -ml-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu size={24}/>
            </button>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="text-right flex flex-col justify-center">
              <span className="font-semibold text-gray-900 text-sm leading-tight">{user?.full_name || 'Admin'}</span>
              <span className="text-xs text-gray-500 leading-tight hidden sm:block">{user?.email || 'admin@local'}</span>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-inner">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <Outlet/>
        </div>
      </main>
    </div>
  );
}
