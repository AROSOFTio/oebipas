import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import MetricCard from '../../components/MetricCard';
import SectionCard from '../../components/SectionCard';

export default function CustomerDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axiosInstance.get('/dashboard').then(response => setData(response.data.data));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Outstanding Balance" value={`UGX ${Number(data?.summary?.outstanding_balance || 0).toLocaleString()}`} />
        <MetricCard title="Total Bills" value={Number(data?.summary?.total_bills || 0).toLocaleString()} />
        <MetricCard title="Recent Payments" value={Number(data?.recentPayments?.length || 0).toLocaleString()} />
        <MetricCard title="Notifications" value={Number(data?.notifications?.length || 0).toLocaleString()} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Recent Bills" subtitle="Your latest bills and balances">
          <div className="space-y-3">
            {(data?.recentBills || []).map(bill => (
              <div key={bill.bill_number} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{bill.bill_number}</p>
                  <span className="capitalize text-slate-500">{bill.status}</span>
                </div>
                <p className="mt-2 text-slate-600">Balance due: UGX {Number(bill.balance_due).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent Notifications" subtitle="Automatic system alerts">
          <div className="space-y-3">
            {(data?.notifications || []).map(item => (
              <div key={`${item.title}-${item.created_at}`} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="mt-2 text-slate-600">{item.message}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
