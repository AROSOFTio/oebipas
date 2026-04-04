import { Outlet, Link, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Briefcase, Zap, Activity, Menu, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const navItemClass = (path) => `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
    location.pathname === path ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
  }`;

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
        className={`fixed md:static inset-y-0 left-0 w-64 bg-sidebar text-white flex flex-col shadow-2xl md:shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-light/20">
          <div className="flex items-center space-x-2.5">
            {/* Cropped circular logo - scale up to remove white padding */}
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-white/10">
              <img
                src="/logo.png"
                alt="OEBIPAS"
                className="w-full h-full object-cover scale-125"
                style={{ objectPosition: 'center 40%' }}
              />
            </div>
            <div>
              <div className="text-lg font-bold tracking-wide leading-tight">OEBIPAS</div>
              <div className="text-[10px] font-medium text-blue-300 uppercase tracking-widest leading-tight">{user?.role}</div>
            </div>
          </div>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsMobileOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <Link to="/admin" onClick={() => setIsMobileOpen(false)} className={navItemClass('/admin')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/customers" onClick={() => setIsMobileOpen(false)} className={navItemClass('/admin/customers')}>
            <Users size={20} />
            <span>Customers</span>
          </Link>
          <Link to="/admin/connections" onClick={() => setIsMobileOpen(false)} className={navItemClass('/admin/connections')}>
            <Zap size={20} />
            <span>Connections</span>
          </Link>
          <Link to="/admin/meters" onClick={() => setIsMobileOpen(false)} className={navItemClass('/admin/meters')}>
            <Activity size={20} />
            <span>Meters</span>
          </Link>
          <Link to="/admin/consumption" onClick={() => setIsMobileOpen(false)} className={navItemClass('/admin/consumption')}>
            <FileText size={20} />
            <span>Consumption</span>
          </Link>
          {user?.role === 'Super Admin' && (
            <Link to="/admin/users" onClick={() => setIsMobileOpen(false)} className={navItemClass('/admin/users')}>
              <Briefcase size={20} />
              <span>System Users</span>
            </Link>
          )}
          <Link to="/admin/settings" onClick={() => setIsMobileOpen(false)} className={navItemClass('/admin/settings')}>
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-sidebar-light/20">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-accent-red hover:text-white transition-colors">
            <LogOut size={20} />
            <span>Logout</span>
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
              <Menu size={24} />
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
          <Outlet />
        </div>
      </main>
    </div>
  );
}
