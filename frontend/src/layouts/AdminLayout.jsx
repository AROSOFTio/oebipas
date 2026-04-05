import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import {
  LayoutDashboard, Users, FileText, Settings, LogOut, Briefcase, Zap, Activity,
  Menu, X, Receipt, Tag, ShieldAlert, CreditCard, FileCheck, MessageSquare,
  BarChart2, History, ChevronDown, TrendingUp, AlertTriangle, UserX, Shield,
  Search, Bell, User, Map, Wallet, PieChart, Lock
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(location.pathname.includes('/admin/reports'));
  const [fieldOpsOpen, setFieldOpsOpen] = useState(['/admin/customers', '/admin/connections', '/admin/meters', '/admin/consumption'].includes(location.pathname));
  const [financeOpen, setFinanceOpen] = useState(['/admin/tariffs', '/admin/bills', '/admin/payments', '/admin/receipts', '/admin/penalties'].includes(location.pathname));
  const [analyticsOpen, setAnalyticsOpen] = useState(location.pathname.includes('/admin/reports') || location.pathname === '/admin/feedback');
  const [adminOpen, setAdminOpen] = useState(['/admin/users', '/admin/audit-logs', '/admin/settings'].includes(location.pathname));

  const handleLogout = () => { logout(); };
  const isActive = (path) => location.pathname === path;
  const isReportsActive = location.pathname.includes('/admin/reports');

  const close = () => setIsMobileOpen(false);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navItemClass = (path) => `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
    isActive(path) 
    ? 'bg-primary text-white shadow-md font-bold' 
    : 'text-blue-100/70 hover:bg-white/10 hover:text-white font-medium'
  } ${isCollapsed ? 'justify-center mx-2' : ''}`;

  const subNavItemClass = (path) => `flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 text-sm ${
    isActive(path) 
    ? 'bg-primary text-white shadow-md font-bold' 
    : 'text-blue-100/70 hover:bg-white/5 hover:text-white font-medium'
  } ${isCollapsed ? 'justify-center mx-2' : ''}`;


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

      <aside
        className={`fixed md:static inset-y-0 left-0 bg-sidebar text-white flex flex-col shadow-2xl z-50 transform transition-all duration-500 ease-in-out border-r border-white/5 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'w-24' : 'w-72'} rounded-r-[2.5rem]`}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/5 bg-sidebar-dark/20 relative">
          {!isCollapsed && (
             <div className="flex items-center space-x-3 w-full bg-white/5 hover:bg-white/10 transition-colors p-2 rounded-xl border border-white/10">
               <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain bg-white rounded-lg p-1"/>
               <div className="flex flex-col overflow-hidden">
                 <span className="text-sm font-bold text-white tracking-wide truncate">UEDCL OEBIPAS</span>
                 <div className="flex items-center space-x-2 mt-1">
                   <span className="w-2 h-2 rounded-full bg-green-500"></span>
                   <span className="text-[10px] font-medium text-blue-200 uppercase tracking-widest truncate">{role}</span>
                 </div>
               </div>
             </div>
          )}
          {isCollapsed && (
             <img src="/logo.png" alt="Logo" className="h-10 w-10 mx-auto object-contain bg-white rounded-lg p-1"/>
          )}
        </div>

        <nav className="flex-1 p-6 space-y-1 overflow-y-auto custom-scrollbar scroll-smooth">
          
          <Link to="/admin" onClick={close} className={navItemClass('/admin')}>
            <LayoutDashboard size={20}/>{!isCollapsed && <span>Overview</span>}
          </Link>

          {/* --- Field Operations (Billing/Super) --- */}
          {canShowFieldOps && (
            <div className="pt-2">
              <button onClick={() => { if(isCollapsed) setIsCollapsed(false); setFieldOpsOpen(p => !p); }} className={`w-full flex items-center ${isCollapsed ? 'justify-center mx-2' : 'justify-between'} p-3 rounded-lg transition-all duration-200 ${fieldOpsOpen ? 'bg-white/10 text-white font-bold' : 'text-blue-100/70 hover:bg-white/5 hover:text-white font-medium'}`}>
                <div className="flex items-center space-x-3"><Map size={20}/>{!isCollapsed && <span>Field Operations</span>}</div>
                {!isCollapsed && <ChevronDown size={14} className={`transition-transform duration-300 ${fieldOpsOpen ? 'rotate-180' : ''}`}/>}
              </button>
              {fieldOpsOpen && !isCollapsed && (
                <div className="ml-4 pl-4 border-l border-white/5 space-y-1 mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link to="/admin/customers" onClick={close} className={subNavItemClass('/admin/customers')}>
                    <Users size={18}/><span>Customers</span>
                  </Link>
                  <Link to="/admin/connections" onClick={close} className={subNavItemClass('/admin/connections')}>
                    <Zap size={18}/><span>Connections</span>
                  </Link>
                  <Link to="/admin/meters" onClick={close} className={subNavItemClass('/admin/meters')}>
                    <Activity size={18}/><span>Meters Hardware</span>
                  </Link>
                  <Link to="/admin/consumption" onClick={close} className={subNavItemClass('/admin/consumption')}>
                    <FileText size={18}/><span>Unit Consumption</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* --- Billing & Finance --- */}
          {canShowBilling && (
            <div className="pt-2">
              <button onClick={() => { if(isCollapsed) setIsCollapsed(false); setFinanceOpen(p => !p); }} className={`w-full flex items-center ${isCollapsed ? 'justify-center mx-2' : 'justify-between'} p-3 rounded-lg transition-all duration-200 ${financeOpen ? 'bg-white/10 text-white font-bold' : 'text-blue-100/70 hover:bg-white/5 hover:text-white font-medium'}`}>
                <div className="flex items-center space-x-3"><Wallet size={20}/>{!isCollapsed && <span>Financial Engine</span>}</div>
                {!isCollapsed && <ChevronDown size={14} className={`transition-transform duration-300 ${financeOpen ? 'rotate-180' : ''}`}/>}
              </button>
              {financeOpen && !isCollapsed && (
                <div className="ml-4 pl-4 border-l border-white/5 space-y-1 mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link to="/admin/tariffs" onClick={close} className={subNavItemClass('/admin/tariffs')}>
                    <Tag size={18}/><span>Tariff Rules</span>
                  </Link>
                  <Link to="/admin/bills" onClick={close} className={subNavItemClass('/admin/bills')}>
                    <Receipt size={18}/><span>All Invoices</span>
                  </Link>
                  {canShowFinance && (
                    <>
                      <Link to="/admin/payments" onClick={close} className={subNavItemClass('/admin/payments')}>
                        <CreditCard size={18}/><span>Payments</span>
                      </Link>
                      <Link to="/admin/receipts" onClick={close} className={subNavItemClass('/admin/receipts')}>
                        <FileCheck size={18}/><span>Receipts</span>
                      </Link>
                    </>
                  )}
                  <Link to="/admin/penalties" onClick={close} className={subNavItemClass('/admin/penalties')}>
                    <ShieldAlert size={18}/><span>Penalties</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* --- Analytics & Support --- */}
          <div className="pt-2">
            <button onClick={() => { if(isCollapsed) setIsCollapsed(false); setAnalyticsOpen(p => !p); }} className={`w-full flex items-center ${isCollapsed ? 'justify-center mx-2' : 'justify-between'} p-3 rounded-lg transition-all duration-200 ${analyticsOpen ? 'bg-white/10 text-white font-bold' : 'text-blue-100/70 hover:bg-white/5 hover:text-white font-medium'}`}>
              <div className="flex items-center space-x-3"><PieChart size={20}/>{!isCollapsed && <span>Analytics & Support</span>}</div>
              {!isCollapsed && <ChevronDown size={14} className={`transition-transform duration-300 ${analyticsOpen ? 'rotate-180' : ''}`}/>}
            </button>
            {analyticsOpen && !isCollapsed && (
              <div className="ml-4 pl-4 border-l border-white/5 space-y-1 mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <Link to="/admin/feedback" onClick={close} className={subNavItemClass('/admin/feedback')}>
                  <MessageSquare size={18}/><span>Support Tickets</span>
                </Link>
                
                {canShowReports && (
                  <>
                    <button
                      onClick={() => setReportsOpen(p => !p)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200 text-sm ${
                        isReportsActive ? 'bg-white/10 text-white font-bold' : 'text-blue-100/70 hover:bg-white/5 hover:text-white font-medium'
                      }`}
                    >
                      <span className="flex items-center space-x-3"><BarChart2 size={18}/><span>Intel Reports</span></span>
                      <ChevronDown size={14} className={`transition-transform duration-300 ${reportsOpen ? 'rotate-180' : ''}`}/>
                    </button>
                    {reportsOpen && (
                      <div className="ml-6 pl-4 border-l border-white/5 space-y-1 mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                        <Link to="/admin/reports?type=monthly-billing" onClick={close} className="block p-2 text-xs text-blue-200/50 hover:text-white">Monthly Billing</Link>
                        <Link to="/admin/reports?type=daily-revenue" onClick={close} className="block p-2 text-xs text-blue-200/50 hover:text-white">Daily Revenue</Link>
                        <Link to="/admin/reports?type=outstanding-balances" onClick={close} className="block p-2 text-xs text-blue-200/50 hover:text-white">Outstanding Balances</Link>
                        <Link to="/admin/reports?type=overdue-customers" onClick={close} className="block p-2 text-xs text-blue-200/50 hover:text-white">Overdue Accounts</Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* --- Administration (Strict Super Admin) --- */}
          {canShowAdmin && (
            <div className="pt-2">
              <button onClick={() => { if(isCollapsed) setIsCollapsed(false); setAdminOpen(p => !p); }} className={`w-full flex items-center ${isCollapsed ? 'justify-center mx-2' : 'justify-between'} p-3 rounded-lg transition-all duration-200 ${adminOpen ? 'bg-white/10 text-white font-bold' : 'text-blue-100/70 hover:bg-white/5 hover:text-white font-medium'}`}>
                <div className="flex items-center space-x-3"><Lock size={20}/>{!isCollapsed && <span>Administration</span>}</div>
                {!isCollapsed && <ChevronDown size={14} className={`transition-transform duration-300 ${adminOpen ? 'rotate-180' : ''}`}/>}
              </button>
              {adminOpen && !isCollapsed && (
                <div className="ml-4 pl-4 border-l border-white/5 space-y-1 mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link to="/admin/users" onClick={close} className={subNavItemClass('/admin/users')}>
                    <Briefcase size={18}/><span>System Users</span>
                  </Link>
                  <Link to="/admin/audit-logs" onClick={close} className={subNavItemClass('/admin/audit-logs')}>
                    <History size={18}/><span>Audit Master Logs</span>
                  </Link>
                  <Link to="/admin/settings" onClick={close} className={subNavItemClass('/admin/settings')}>
                    <Settings size={18}/><span>Global Settings</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button onClick={handleLogout} className={`w-full flex items-center ${isCollapsed ? 'justify-center mx-2' : 'space-x-3 p-3'} rounded-lg text-blue-100/60 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold text-sm`}>
            <LogOut size={18}/>{!isCollapsed && <span>Security Sign Out</span>}
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
            <button className="hidden md:block p-2 ml-0 mr-4 text-gray-600 hover:bg-gray-100 rounded-xl transition-all" onClick={() => setIsCollapsed(!isCollapsed)}>
              <Menu size={24}/>
            </button>
            <div className="hidden sm:flex items-center space-x-3">
               <img src="/logo.png" alt="UEDCL Logo" className="h-8 object-contain" />
               <div>
                  <h3 className="text-lg font-bold text-gray-900">UEDCL Command Center</h3>
                  <p className="text-xs text-gray-400 font-medium">UEDCL - OEBIPAS Operations</p>
               </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 w-72 focus-within:w-96 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
              <Search size={18} className="text-gray-400 mr-2"/>
              <input 
                type="text" 
                placeholder="Search customers, bills..." 
                className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400 focus:ring-0" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
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
