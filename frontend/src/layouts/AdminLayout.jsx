import { Outlet, Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Briefcase } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const navItemClass = (path) => `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
    location.pathname === path ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
  }`;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-white flex flex-col shadow-xl z-10">
        <div className="p-6 text-2xl font-bold border-b border-sidebar-light/20 tracking-wide">
          OEBIPAS <span className="block text-xs font-medium text-blue-300 mt-1 uppercase tracking-widest">{user?.role}</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link to="/admin" className={navItemClass('/admin')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/customers" className={navItemClass('/admin/customers')}>
            <Users size={20} />
            <span>Customers</span>
          </Link>
          <Link to="/admin/bills" className={navItemClass('/admin/bills')}>
            <FileText size={20} />
            <span>Bills</span>
          </Link>
          {user?.role === 'Super Admin' && (
            <Link to="/admin/users" className={navItemClass('/admin/users')}>
              <Briefcase size={20} />
              <span>System Users</span>
            </Link>
          )}
          <Link to="/admin/settings" className={navItemClass('/admin/settings')}>
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
      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-border shadow-sm flex items-center justify-end px-6 z-0">
          <div className="flex items-center space-x-4">
            <div className="text-right flex flex-col justify-center">
              <span className="font-semibold text-gray-900 text-sm leading-tight">{user?.full_name || 'Admin'}</span>
              <span className="text-xs text-gray-500 leading-tight">{user?.email || 'admin@local'}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-inner">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
