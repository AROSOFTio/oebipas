import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import MetricCard from '../../components/MetricCard';
import SectionCard from '../../components/SectionCard';

const statusBadge = status => {
  const map = {
    paid: 'bg-emerald-100 text-emerald-700',
    overdue: 'bg-rose-100 text-rose-700',
    partially_paid: 'bg-amber-100 text-amber-700',
    unpaid: 'bg-slate-100 text-slate-600',
    pending: 'bg-slate-100 text-slate-600',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
};

const paymentBadge = status => {
  const map = {
    successful: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-rose-100 text-rose-700',
    pending: 'bg-amber-100 text-amber-700',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
};

export default function CustomerDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axiosInstance.get('/dashboard').then(response => setData(response.data.data));
  }, []);

  const summary = data?.summary || {};

  return (
    <div className="space-y-6">
      {/* Metric Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Outstanding Balance"
          value={`UGX ${Number(summary.outstanding_balance || 0).toLocaleString()}`}
          tone="strong"
        />
        <MetricCard title="Total Bills" value={Number(summary.total_bills || 0)} />
        <MetricCard
          title="Recent Payments"
          value={Number(data?.recentPayments?.length || 0)}
          tone="accent"
        />
        <MetricCard title="Notifications" value={Number(data?.notifications?.length || 0)} />
      </div>

      {/* Quick Links */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'View Bills', to: '/customer/bills', desc: 'Check balances & due dates' },
          { label: 'Pay Bill', to: '/customer/pay', desc: 'Secure Pesapal checkout' },
          { label: 'Payment History', to: '/customer/payments', desc: 'Track confirmed payments' },
        ].map(item => (
          <Link
            key={item.to}
            to={item.to}
            className="rounded-[1.5rem] border border-[var(--panel-soft)] bg-white px-5 py-4 text-sm hover:border-[var(--panel-strong)] hover:shadow-sm transition"
          >
            <p className="font-semibold text-[var(--panel-strong)]">{item.label}</p>
            <p className="mt-1 text-slate-500">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Data Sections */}
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Recent Bills">
          <div className="space-y-2">
            {(data?.recentBills || []).length === 0 && (
              <p className="text-sm text-slate-400">No bills generated yet.</p>
            )}
            {(data?.recentBills || []).map(bill => (
              <div key={bill.bill_number} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{bill.bill_number}</p>
                  <p className="mt-0.5 text-slate-500">Balance: UGX {Number(bill.balance_due).toLocaleString()}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusBadge(bill.status)}`}>
                  {bill.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Notifications">
          <div className="space-y-2">
            {(data?.notifications || []).length === 0 && (
              <p className="text-sm text-slate-400">No notifications yet.</p>
            )}
            {(data?.notifications || []).map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="rounded-2xl bg-slate-50 px-4 py-3 text-sm"
              >
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="mt-1 text-slate-500">{item.message}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Recent Payments */}
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
                  <td colSpan={3} className="py-4 text-slate-400">No payments yet.</td>
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
  );
}
