import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import MetricCard from '../../components/MetricCard';
import SectionCard from '../../components/SectionCard';
import { subscribeToPaymentSync } from '../../utils/paymentSync';

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
    const loadDashboard = async () => {
      const response = await axiosInstance.get('/dashboard');
      setData(response.data.data);
    };

    loadDashboard();
    return subscribeToPaymentSync(loadDashboard);
  }, []);

  const summary = data?.summary || {};

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Outstanding Balance"
          value={`UGX ${Number(summary.outstanding_balance || 0).toLocaleString()}`}
          color="yellow"
        />
        <MetricCard title="Total Bills" value={Number(summary.total_bills || 0)} color="slate" />
        <MetricCard
          title="Recent Payments"
          value={Number(data?.recentPayments?.length || 0)}
          color="green"
        />
        <MetricCard title="Notifications" value={Number(data?.notifications?.length || 0)} color="purple" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'View Bills', to: '/customer/bills', desc: 'Check balances & due dates' },
          { label: 'Pay Bill', to: '/customer/pay', desc: 'Secure Pesapal checkout' },
          { label: 'Payment History', to: '/customer/payments', desc: 'Track confirmed payments' },
        ].map(item => (
          <Link
            key={item.to}
            to={item.to}
            className="flex flex-col justify-center rounded-2xl border border-[var(--panel-soft)] bg-white px-6 py-5 hover:border-[var(--secondary)] hover:shadow-sm transition"
          >
            <p className="font-bold text-[var(--panel-strong)] text-base">{item.label}</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{item.desc}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Recent Bills">
          <div className="space-y-3">
            {(data?.recentBills || []).length === 0 && (
              <p className="text-sm text-[var(--text-muted)] py-4 text-center">No bills generated yet.</p>
            )}
            {(data?.recentBills || []).map(bill => (
              <div key={bill.bill_number} className="flex items-center justify-between rounded-xl border border-[var(--panel-soft)] bg-white px-4 py-3.5 transition hover:border-[var(--secondary)]">
                <div>
                  <p className="font-semibold text-[var(--text-strong)]">{bill.bill_number}</p>
                  <p className="mt-0.5 text-sm text-[var(--text-muted)]">Balance: UGX {Number(bill.balance_due).toLocaleString()}</p>
                </div>
                <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold capitalize tracking-wide ${statusBadge(bill.status)}`}>
                  {bill.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Notifications">
          <div className="space-y-3">
            {(data?.notifications || []).length === 0 && (
              <p className="text-sm text-[var(--text-muted)] py-4 text-center">No notifications yet.</p>
            )}
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
        </SectionCard>
      </div>

      <SectionCard title="Recent Payments">
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
                  <td colSpan={3} className="py-6 text-center text-[var(--text-muted)]">No payments yet.</td>
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
  );
}
