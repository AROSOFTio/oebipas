import { useContext, useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import MetricCard from '../../components/MetricCard';
import SectionCard from '../../components/SectionCard';

const paymentBadge = status => {
  const map = {
    successful: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-rose-100 text-rose-700',
    pending: 'bg-amber-100 text-amber-700',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
};

export default function StaffDashboard() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);

  useEffect(() => {
    axiosInstance.get('/dashboard').then(response => setData(response.data.data));
  }, []);

  const summary = data?.summary || {};
  const isManager = user?.role === 'System administrators';

  return (
    <div className="space-y-6">

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={`UGX ${Number(summary.total_revenue || 0).toLocaleString()}`}
          color="purple"
        />
        <MetricCard
          title="Outstanding Balances"
          value={`UGX ${Number(summary.outstanding_balances || 0).toLocaleString()}`}
          color="slate"
        />
        <MetricCard title="Active Customers" value={Number(summary.total_customers || 0)} color="green" />
        <MetricCard
          title={isManager ? 'Overdue Bills' : 'Recent Payments'}
          value={Number(isManager ? (summary.overdue_bills || 0) : (data?.recentPayments?.length || 0))}
          color="blue"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Recent Activity">
          <div className="space-y-3">
            {(data?.recentActivity || []).length === 0 && (
              <p className="text-sm text-[var(--text-muted)] py-4 text-center">No recent activity found.</p>
            )}
            {(data?.recentActivity || []).map((item, index) => (
              <div
                key={`${item.activity_type}-${item.reference}-${index}`}
                className="flex items-center justify-between rounded-xl border border-[var(--panel-soft)] bg-white px-4 py-3.5 transition hover:border-[var(--secondary)]"
              >
                <div>
                  <p className="font-semibold text-[var(--text-strong)]">{item.activity_type}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.reference}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent Transactions">
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
                {(data?.recentPayments || []).length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-[var(--text-muted)]">No transactions recorded.</td>
                  </tr>
                )}
                {(data?.recentPayments || []).map(payment => (
                  <tr key={payment.payment_reference} className="group transition hover:bg-slate-50">
                    <td className="py-3.5 pr-4 font-semibold text-[var(--text-strong)] group-hover:text-[var(--panel-strong)]">{payment.payment_reference}</td>
                    <td className="py-3.5 pr-4 text-[var(--text-muted)]">UGX {Number(payment.amount).toLocaleString()}</td>
                    <td className="py-3.5">
                      <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold capitalize tracking-wide ${paymentBadge(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
