import { Link } from 'react-router-dom';
import { CreditCard, FileText, Gauge, Zap } from 'lucide-react';
import MetricCard from '../../components/MetricCard';
import DashboardLayout, { DashboardPanel, EmptyState } from './DashboardLayout';
import StatusBadge from './StatusBadge';
import useDashboardData from './useDashboardData';

const iconTile = Icon => (
  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--panel-strong)]">
    <Icon size={19} />
  </div>
);

export default function BillingDashboard() {
  const data = useDashboardData();
  const summary = data?.summary || {};

  return (
    <DashboardLayout variant="billing">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Bills"
          value={Number(summary.total_bills || 0)}
          note="Generated records"
          color="white"
          icon={iconTile(FileText)}
          className="role-metric-card"
        />
        <MetricCard
          title="Consumption"
          value={Number(summary.total_customers || 0)}
          note="Accounts to monitor"
          color="white"
          icon={iconTile(Zap)}
          className="role-metric-card"
        />
        <MetricCard
          title="Payments"
          value={Number(data?.recentPayments?.length || 0)}
          note="Recent payment checks"
          color="white"
          icon={iconTile(CreditCard)}
          className="role-metric-card"
        />
        <MetricCard
          title="Overdue"
          value={Number(summary.overdue_bills || 0)}
          note="Needs follow-up"
          color="white"
          icon={iconTile(Gauge)}
          className="role-metric-card"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Bills', to: '/staff/bills', desc: 'Review generated balances', icon: FileText },
          { label: 'Consumption', to: '/staff/consumption', desc: 'Capture meter readings', icon: Zap },
          { label: 'Payments', to: '/staff/payments', desc: 'Track payment activity', icon: CreditCard },
        ].map(item => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-start gap-4 rounded-2xl border border-[var(--panel-soft)] bg-white px-5 py-4 transition hover:border-[var(--secondary)] hover:shadow-sm"
            >
              <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--panel-strong)]">
                <Icon size={18} />
              </span>
              <span>
                <span className="block font-bold text-[var(--panel-strong)]">{item.label}</span>
                <span className="mt-1 block text-sm text-[var(--text-muted)]">{item.desc}</span>
              </span>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DashboardPanel title="Billing Work Queue" subtitle="Recent bills with operational statuses">
          <div className="space-y-3">
            {(data?.recentBills || []).length === 0 ? <EmptyState>No bills generated yet.</EmptyState> : null}
            {(data?.recentBills || []).map(bill => (
              <div key={bill.bill_number} className="flex items-center justify-between gap-4 rounded-xl border border-[var(--panel-soft)] bg-white px-4 py-3.5 transition hover:border-[var(--secondary)]">
                <div>
                  <p className="font-semibold text-[var(--text-strong)]">{bill.bill_number}</p>
                  <p className="mt-0.5 text-sm text-[var(--text-muted)]">Balance: UGX {Number(bill.balance_due).toLocaleString()}</p>
                </div>
                <StatusBadge status={bill.status} />
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel title="Payment Operations" subtitle="Recent payment confirmations">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--panel-soft)] text-[var(--text-muted)]">
                  <th className="pb-3 pr-4 font-medium">Reference</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--panel-soft)]">
                {(data?.recentPayments || []).length === 0 ? (
                  <tr>
                    <td colSpan={3}><EmptyState>No transactions recorded.</EmptyState></td>
                  </tr>
                ) : null}
                {(data?.recentPayments || []).map(payment => (
                  <tr key={payment.payment_reference} className="group transition hover:bg-slate-50">
                    <td className="py-3 pr-4 font-semibold text-[var(--text-strong)] group-hover:text-[var(--panel-strong)]">{payment.payment_reference}</td>
                    <td className="py-3 pr-4 text-[var(--text-muted)]">UGX {Number(payment.amount).toLocaleString()}</td>
                    <td className="py-3"><StatusBadge status={payment.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardPanel>
      </div>
    </DashboardLayout>
  );
}
