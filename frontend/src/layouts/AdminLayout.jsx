import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-sidebar-light/20">
          OEBIPAS
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
            <Users size={20} />
            <span>Customers</span>
          </Link>
          <Link to="/admin" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
            <FileText size={20} />
            <span>Bills</span>
          </Link>
          <Link to="/admin" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-sidebar-light/20">
          <Link to="/login" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent-red transition-colors">
            <LogOut size={20} />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-end px-6">
          <div className="flex items-center space-x-4">
            <span className="font-medium">System Admin</span>
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
