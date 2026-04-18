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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Revenue" value={`UGX ${Number(summary.total_revenue || 0).toLocaleString()}`} />
        <MetricCard title="Outstanding Balances" value={`UGX ${Number(summary.outstanding_balances || 0).toLocaleString()}`} />
        <MetricCard title="Total Customers" value={Number(summary.total_customers || 0).toLocaleString()} />
        <MetricCard
          title={user?.role === 'Branch Manager' ? 'Overdue Bills' : 'Recent Payments'}
          value={Number(summary.overdue_bills || (data?.recentPayments?.length || 0)).toLocaleString()}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Recent Activity" subtitle="Latest automated billing and payment actions">
          <div className="space-y-3">
            {(data?.recentActivity || []).map(item => (
              <div key={`${item.activity_type}-${item.reference}-${item.created_at}`} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
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
