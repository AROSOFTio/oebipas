import { useContext, useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import MetricCard from '../../components/MetricCard';
import SectionCard from '../../components/SectionCard';

export default function StaffDashboard() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);

  useEffect(() => {
    axiosInstance.get('/dashboard').then(response => setData(response.data.data));
  }, []);

  const summary = data?.summary || {};

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] bg-[var(--panel-strong)] p-7 text-white shadow-soft">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-200">Operations Dashboard</p>
          <h1 className="mt-4 text-3xl font-semibold">{user?.role === 'Branch Manager' ? 'Branch revenue, bills and customer control' : 'Billing operations and payment monitoring'}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200">
            This dashboard keeps the project focused on billing automation, accurate balances, customer records, and secure payment follow-up.
          </p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-soft">
          <p className="text-sm font-medium text-slate-500">System Focus</p>
          <div className="mt-4 grid gap-3">
            {['Automated bill generation', 'Automatic overdue penalties', 'Pesapal payment verification'].map(item => (
              <div key={item} className="rounded-2xl bg-[var(--panel-soft)]/35 px-4 py-3 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Revenue" value={`UGX ${Number(summary.total_revenue || 0).toLocaleString()}`} tone="strong" />
        <MetricCard title="Outstanding Balances" value={`UGX ${Number(summary.outstanding_balances || 0).toLocaleString()}`} />
        <MetricCard title="Total Customers" value={Number(summary.total_customers || 0).toLocaleString()} tone="accent" />
        <MetricCard
          title={user?.role === 'Branch Manager' ? 'Overdue Bills' : 'Recent Payments'}
          value={Number(summary.overdue_bills || (data?.recentPayments?.length || 0)).toLocaleString()}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Recent Activity" subtitle="Latest automated billing and payment actions">
          <div className="space-y-3">
            {(data?.recentActivity || []).map(item => (
              <div key={`${item.activity_type}-${item.reference}-${item.created_at}`} className="rounded-2xl bg-[var(--panel-soft)]/30 px-4 py-3 text-sm">
                <p className="font-medium text-slate-900">{item.activity_type}</p>
                <p className="text-slate-500">{item.reference}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent Payments" subtitle="Monitored payment activity">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-3">Reference</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentPayments || []).map(payment => (
                  <tr key={payment.payment_reference} className="border-t border-slate-100">
                    <td className="py-3">{payment.payment_reference}</td>
                    <td className="py-3">UGX {Number(payment.amount).toLocaleString()}</td>
                    <td className="py-3 capitalize">{payment.status}</td>
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
