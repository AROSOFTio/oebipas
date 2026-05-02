import { Activity, CreditCard, FileText, Gauge, Server, Users } from 'lucide-react';
import MetricCard from '../../components/MetricCard';
import DashboardLayout, { DashboardPanel, EmptyState } from './DashboardLayout';
import StatusBadge from './StatusBadge';
import useDashboardData from './useDashboardData';

const outlineIcon = Icon => (
  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--panel-soft)] bg-white text-[var(--panel-strong)]">
    <Icon size={20} strokeWidth={1.8} />
  </div>
);

export default function AdminDashboard() {
  const data = useDashboardData();
  const summary = data?.summary || {};

  return (
    <DashboardLayout variant="admin">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Revenue"
          value={`UGX ${Number(summary.total_revenue || 0).toLocaleString()}`}
          note="Confirmed collections"
          color="white"
          icon={outlineIcon(CreditCard)}
          className="role-metric-card"
        />
        <MetricCard
          title="System Users"
          value={Number(summary.total_customers || 0)}
          note="Customer accounts"
          color="white"
          icon={outlineIcon(Users)}
          className="role-metric-card"
        />
        <MetricCard
          title="Active Meters"
          value={Number(summary.total_customers || 0)}
          note="Linked service meters"
          color="white"
          icon={outlineIcon(Gauge)}
          className="role-metric-card"
        />
        <MetricCard
          title="Overdue Bills"
          value={Number(summary.overdue_bills || 0)}
          note="Needs supervision"
          color="white"
          icon={outlineIcon(FileText)}
          className="role-metric-card"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <DashboardPanel title="System Activity Log" subtitle="Recent billing and payment events">
          <div className="space-y-3">
            {(data?.recentActivity || []).length === 0 ? <EmptyState>No recent activity found.</EmptyState> : null}
            {(data?.recentActivity || []).map((item, index) => (
              <div
                key={`${item.activity_type}-${item.reference}-${index}`}
                className="flex items-center justify-between rounded-xl border border-[var(--panel-soft)] bg-white px-4 py-3 transition hover:border-[var(--secondary)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--panel-strong)]">
                    <Activity size={17} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text-strong)]">{item.activity_type}</p>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">{item.reference}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel title="Control Summary" subtitle="High-level system posture">
          <div className="space-y-3">
            {[
              ['Outstanding Balances', `UGX ${Number(summary.outstanding_balances || 0).toLocaleString()}`],
              ['Total Bills', Number(summary.total_bills || 0).toLocaleString()],
              ['Recent Transactions', Number(data?.recentPayments?.length || 0).toLocaleString()],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-25 px-4 py-3">
                <span className="text-sm font-medium text-slate-600">{label}</span>
                <span className="text-sm font-bold text-slate-950">{value}</span>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>

      <DashboardPanel title="Recent Transactions" subtitle="Latest payment status checks">
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

      <DashboardPanel title="System Stats" subtitle="Revenue, users, meters and active workload">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Revenue', `UGX ${Number(summary.total_revenue || 0).toLocaleString()}`, Server],
            ['Users', Number(summary.total_customers || 0).toLocaleString(), Users],
            ['Active Meters', Number(summary.total_customers || 0).toLocaleString(), Gauge],
            ['Open Balances', `UGX ${Number(summary.outstanding_balances || 0).toLocaleString()}`, FileText],
          ].map(([label, value, Icon]) => (
            <div key={label} className="rounded-xl border border-[var(--panel-soft)] bg-white px-4 py-3">
              <div className="mb-3 flex items-center gap-2 text-[var(--panel-strong)]">
                <Icon size={16} strokeWidth={1.8} />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">{label}</span>
              </div>
              <p className="text-lg font-bold text-slate-950">{value}</p>
            </div>
          ))}
        </div>
      </DashboardPanel>
    </DashboardLayout>
  );
}
