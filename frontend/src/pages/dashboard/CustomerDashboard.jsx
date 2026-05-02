import { Link } from 'react-router-dom';
import { Bell, CreditCard, FileText, Wallet } from 'lucide-react';
import MetricCard from '../../components/MetricCard';
import DashboardLayout, { DashboardPanel, EmptyState } from './DashboardLayout';
import StatusBadge from './StatusBadge';
import useDashboardData from './useDashboardData';

const softIcon = Icon => (
  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--panel-strong)]">
    <Icon size={18} />
  </div>
);

export default function CustomerDashboard() {
  const data = useDashboardData();
  const summary = data?.summary || {};
  const currentBill = data?.recentBills?.[0];
  const totalBills = Number(summary.total_bills || 0);
  const paidBills = Number(summary.paid_bills || 0);
  const usageProgress = totalBills > 0 ? Math.round((paidBills / totalBills) * 100) : 0;

  return (
    <DashboardLayout variant="customer">
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <DashboardPanel
          title="Current Bill"
          subtitle="Simple account summary"
          className="customer-focus-panel"
          action={
            <Link to="/customer/pay" className="rounded-full bg-[var(--panel-strong)] px-4 py-2 text-xs font-semibold text-white">
              Pay Bill
            </Link>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[var(--accent-soft)] px-5 py-5">
              <p className="text-sm font-semibold text-[var(--panel-strong)]">Outstanding Balance</p>
              <p className="mt-3 text-3xl font-bold text-slate-950">UGX {Number(summary.outstanding_balance || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-[var(--panel-soft)] bg-white px-5 py-5">
              <p className="text-sm font-semibold text-slate-600">Latest Bill</p>
              <p className="mt-3 text-xl font-bold text-slate-950">{currentBill?.bill_number || 'No bill yet'}</p>
              {currentBill ? (
                <div className="mt-3">
                  <StatusBadge status={currentBill.status} />
                </div>
              ) : null}
            </div>
          </div>
        </DashboardPanel>

        <DashboardPanel title="Usage Progress" subtitle="Paid billing cycles">
          <div className="rounded-2xl border border-[var(--panel-soft)] bg-white px-5 py-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Usage completion</span>
              <span className="text-sm font-bold text-[var(--panel-strong)]">{usageProgress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[var(--accent-soft)]">
              <div className="h-full rounded-full bg-[var(--panel-strong)] transition-all" style={{ width: `${usageProgress}%` }} />
            </div>
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              {paidBills} of {totalBills} billing cycles are fully cleared.
            </p>
          </div>
        </DashboardPanel>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Balance"
          value={`UGX ${Number(summary.outstanding_balance || 0).toLocaleString()}`}
          color="white"
          icon={softIcon(Wallet)}
          className="role-metric-card"
        />
        <MetricCard title="Bills" value={totalBills} color="white" icon={softIcon(FileText)} className="role-metric-card" />
        <MetricCard
          title="Payments"
          value={Number(data?.recentPayments?.length || 0)}
          color="white"
          icon={softIcon(CreditCard)}
          className="role-metric-card"
        />
        <MetricCard
          title="Alerts"
          value={Number(data?.notifications?.length || 0)}
          color="white"
          icon={softIcon(Bell)}
          className="role-metric-card"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardPanel title="Recent Bills">
          <div className="space-y-3">
            {(data?.recentBills || []).length === 0 ? <EmptyState>No bills generated yet.</EmptyState> : null}
            {(data?.recentBills || []).map(bill => (
              <div key={bill.bill_number} className="flex items-center justify-between rounded-xl border border-[var(--panel-soft)] bg-white px-4 py-3.5 transition hover:border-[var(--secondary)]">
                <div>
                  <p className="font-semibold text-[var(--text-strong)]">{bill.bill_number}</p>
                  <p className="mt-0.5 text-sm text-[var(--text-muted)]">Balance: UGX {Number(bill.balance_due).toLocaleString()}</p>
                </div>
                <StatusBadge status={bill.status} />
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel title="Notifications">
          <div className="space-y-3">
            {(data?.notifications || []).length === 0 ? <EmptyState>No notifications yet.</EmptyState> : null}
            {(data?.notifications || []).map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="rounded-xl border border-[var(--panel-soft)] bg-white px-4 py-3.5"
              >
                <p className="font-semibold text-[var(--text-strong)]">{item.title}</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{item.message}</p>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>
    </DashboardLayout>
  );
}
