import { Outlet, Link, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import { LayoutDashboard, FileText, Settings, LogOut, Menu, X, Activity, CreditCard, Clock, Bell, MessageSquare } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function CustomerLayout() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const navItemClass = (path) => `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
    location.pathname === path ? 'bg-primary text-white shadow-md font-bold' : 'text-blue-100/70 hover:bg-white/10 hover:text-white font-medium'
  } ${isCollapsed ? 'justify-center mx-2' : ''}`;

  return (
    <div className="flex h-screen bg-background relative overflow-hidden">
      
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 bg-sidebar text-white flex flex-col shadow-2xl md:shadow-xl z-50 transform transition-all duration-500 ease-in-out border-r border-white/5 ${
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
                   <span className="text-[10px] font-medium text-blue-200 uppercase tracking-widest truncate">CUSTOMER</span>
                 </div>
               </div>
             </div>
          )}
          {isCollapsed && (
             <img src="/logo.png" alt="Logo" className="h-10 w-10 mx-auto object-contain bg-white rounded-lg p-1"/>
          )}
        </div>

        <nav className="flex-1 p-6 space-y-1 overflow-y-auto custom-scrollbar scroll-smooth">
          <Link to="/customer" onClick={() => setIsMobileOpen(false)} className={navItemClass('/customer')}>
            <LayoutDashboard size={20} />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>
          <Link to="/customer/bills" onClick={() => setIsMobileOpen(false)} className={navItemClass('/customer/bills')}>
            <FileText size={20} />
            {!isCollapsed && <span>My Bills</span>}
          </Link>
          <Link to="/customer/notifications" onClick={() => setIsMobileOpen(false)} className={navItemClass('/customer/notifications')}>
            <Bell size={20} />
            {!isCollapsed && <span>Notifications</span>}
          </Link>
          <Link to="/customer/feedback" onClick={() => setIsMobileOpen(false)} className={navItemClass('/customer/feedback')}>
            <MessageSquare size={20} />
            {!isCollapsed && <span>Support</span>}
          </Link>
          <Link to="/customer/consumption" onClick={() => setIsMobileOpen(false)} className={navItemClass('/customer/consumption')}>
            <Activity size={20} />
            {!isCollapsed && <span>My Usage</span>}
          </Link>
          <Link to="/customer/pay" onClick={() => setIsMobileOpen(false)} className={navItemClass('/customer/pay')}>
            <CreditCard size={20} />
            {!isCollapsed && <span>Make Payment</span>}
          </Link>
          <Link to="/customer/payments" onClick={() => setIsMobileOpen(false)} className={navItemClass('/customer/payments')}>
            <Clock size={20} />
            {!isCollapsed && <span>Payment History</span>}
          </Link>
        </nav>
        <div className="p-6 border-t border-white/5">
          <button onClick={handleLogout} className={`w-full flex items-center ${isCollapsed ? 'justify-center mx-2' : 'space-x-3 p-3'} rounded-lg text-blue-100/60 hover:bg-red-500/10 hover:text-red-400 transition-all font-bold text-sm`}>
            <LogOut size={18} />
            {!isCollapsed && <span>Secure Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 sm:px-10 z-10 shrink-0 sticky top-0">
          <div className="flex items-center">
            <button 
              className="md:hidden p-2 -ml-2 mr-4 text-gray-600 hover:bg-gray-100 rounded-xl"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu size={24} />
            </button>
            <button className="hidden md:block p-2 ml-0 mr-4 text-gray-600 hover:bg-gray-100 rounded-xl transition-all" onClick={() => setIsCollapsed(!isCollapsed)}>
              <Menu size={24}/>
            </button>
            <div className="hidden sm:flex items-center space-x-3">
               <img src="/logo.png" alt="UEDCL Logo" className="h-8 object-contain" />
               <div>
                  <h3 className="text-lg font-bold text-gray-900">UEDCL Customer Portal</h3>
                  <p className="text-xs text-gray-400 font-medium">UEDCL - OEBIPAS Operations</p>
               </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative p-2 text-gray-400 cursor-pointer hover:bg-gray-100 rounded-full transition-colors ml-2">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </div>

            <div className="flex items-center space-x-3 pl-2 sm:pl-4 border-l border-gray-200 ml-2">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-inner">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'C'}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white"></span>
              </div>
              <div className="hidden sm:flex flex-col justify-center text-left">
                <span className="font-bold text-gray-900 text-sm leading-tight">{user?.full_name || 'Customer'}</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">CUSTOMER</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
