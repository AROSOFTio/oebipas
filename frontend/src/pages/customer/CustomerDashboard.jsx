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
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] bg-[var(--panel-strong)] p-7 text-white shadow-soft">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-200">Customer Dashboard</p>
          <h1 className="mt-4 text-3xl font-semibold">Manage bills, pay securely with Pesapal, and track alerts in one place</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200">
            Your portal is focused on easy billing access, secure online payment, and clear notification updates after every billing event.
          </p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-soft">
          <p className="text-sm font-medium text-slate-500">Quick Actions</p>
          <div className="mt-4 grid gap-3">
            {['View generated bills', 'Pay through Pesapal', 'Track payment confirmations'].map(item => (
              <div key={item} className="rounded-2xl bg-[var(--panel-soft)]/35 px-4 py-3 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Outstanding Balance" value={`UGX ${Number(data?.summary?.outstanding_balance || 0).toLocaleString()}`} tone="strong" />
        <MetricCard title="Total Bills" value={Number(data?.summary?.total_bills || 0).toLocaleString()} />
        <MetricCard title="Recent Payments" value={Number(data?.recentPayments?.length || 0).toLocaleString()} tone="accent" />
        <MetricCard title="Notifications" value={Number(data?.notifications?.length || 0).toLocaleString()} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Recent Bills" subtitle="Your latest bills and balances">
          <div className="space-y-3">
            {(data?.recentBills || []).map(bill => (
              <div key={bill.bill_number} className="rounded-2xl bg-[var(--panel-soft)]/30 px-4 py-3 text-sm">
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
              <div key={`${item.title}-${item.created_at}`} className="rounded-2xl bg-[var(--panel-soft)]/30 px-4 py-3 text-sm">
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
