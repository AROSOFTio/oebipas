import { useContext, useMemo, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Bell,
  ChartColumn,
  CreditCard,
  FileText,
  Gauge,
  Home,
  LogOut,
  Menu,
  User,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const navConfig = {
  'Branch Manager': [
    { to: '/manager', label: 'Dashboard', icon: Home },
    { to: '/manager/customers', label: 'Customers', icon: Users },
    { to: '/manager/consumption', label: 'Consumption', icon: Zap },
    { to: '/manager/bills', label: 'Bills', icon: FileText },
    { to: '/manager/payments', label: 'Payments', icon: CreditCard },
    { to: '/manager/reports', label: 'Reports', icon: ChartColumn },
    { to: '/manager/notifications', label: 'Notifications', icon: Bell },
    { to: '/manager/tariffs', label: 'Tariffs', icon: Gauge },
  ],
  'Billing Staff': [
    { to: '/staff', label: 'Dashboard', icon: Home },
    { to: '/staff/consumption', label: 'Consumption', icon: Zap },
    { to: '/staff/bills', label: 'Bills', icon: FileText },
    { to: '/staff/payments', label: 'Payments', icon: CreditCard },
  ],
  Customer: [
    { to: '/customer', label: 'Dashboard', icon: Home },
    { to: '/customer/profile', label: 'My Profile', icon: User },
    { to: '/customer/bills', label: 'My Bills', icon: FileText },
    { to: '/customer/pay', label: 'Pay Bill', icon: Wallet },
    { to: '/customer/payments', label: 'Payment History', icon: CreditCard },
    { to: '/customer/notifications', label: 'Notifications', icon: Bell },
  ],
};

const pageTitle = {
  'Branch Manager': 'Branch Manager Workspace',
  'Billing Staff': 'Billing Staff Workspace',
  Customer: 'Customer Portal',
};

export default function PortalLayout() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = useMemo(() => navConfig[user?.role] || [], [user?.role]);

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        {mobileOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-20 bg-slate-900/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 border-r border-white/20 bg-[var(--panel-strong)] px-6 py-8 text-white transition-transform lg:static lg:translate-x-0 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-200">UEDCL</p>
            <h1 className="mt-3 text-2xl font-semibold leading-tight">{pageTitle[user?.role] || 'Workspace'}</h1>
            <p className="mt-2 text-sm text-slate-200">{user?.full_name}</p>
          </div>

          <nav className="mt-8 space-y-2">
            {items.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                    active ? 'bg-white text-[var(--panel-strong)] shadow-sm' : 'text-slate-100 hover:bg-white/10'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={logout}
            className="mt-8 flex w-full items-center gap-3 rounded-2xl border border-white/15 px-4 py-3 text-sm text-slate-100 transition hover:bg-white/10"
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </aside>

        <main className="flex-1 px-4 py-4 sm:px-6 lg:px-10 lg:py-8">
          <header className="mb-6 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded-2xl border border-slate-200 p-2 text-slate-600 lg:hidden"
                  onClick={() => setMobileOpen(true)}
                >
                  <Menu size={18} />
                </button>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Online Electricity Billing and Payment System</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">Development of an Online Electricity Billing and Payment System: A Case Study of UEDCL</h2>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{user?.role}</p>
                <p className="text-sm font-medium text-slate-700">{user?.email}</p>
              </div>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
