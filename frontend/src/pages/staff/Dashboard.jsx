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
  const isManager = user?.role === 'Branch Manager';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-[2rem] bg-[var(--panel-strong)] px-7 py-6 text-white shadow-soft">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-200">
          {isManager ? 'Branch Manager' : 'Billing Staff'} — Operations Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-semibold">
          {isManager ? 'Revenue, Billing & Customer Overview' : 'Billing & Payment Monitoring'}
        </h1>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={`UGX ${Number(summary.total_revenue || 0).toLocaleString()}`}
          tone="strong"
        />
        <MetricCard
          title="Outstanding Balances"
          value={`UGX ${Number(summary.outstanding_balances || 0).toLocaleString()}`}
        />
        <MetricCard title="Total Customers" value={Number(summary.total_customers || 0)} tone="accent" />
        <MetricCard
          title={isManager ? 'Overdue Bills' : 'Recent Payments'}
          value={Number(isManager ? (summary.overdue_bills || 0) : (data?.recentPayments?.length || 0))}
        />
      </div>

      {/* Data Sections */}
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Recent Activity">
          <div className="space-y-2">
            {(data?.recentActivity || []).length === 0 && (
              <p className="text-sm text-slate-400">No recent activity.</p>
            )}
            {(data?.recentActivity || []).map((item, index) => (
              <div
                key={`${item.activity_type}-${item.reference}-${index}`}
                className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.activity_type}</p>
                  <p className="mt-0.5 text-slate-500">{item.reference}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent Payments">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-3 pr-4">Reference</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentPayments || []).length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-slate-400">No payments recorded yet.</td>
                  </tr>
                )}
                {(data?.recentPayments || []).map(payment => (
                  <tr key={payment.payment_reference} className="border-t border-slate-100">
                    <td className="py-3 pr-4 font-medium text-slate-900">{payment.payment_reference}</td>
                    <td className="py-3 pr-4">UGX {Number(payment.amount).toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${paymentBadge(payment.status)}`}>
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
