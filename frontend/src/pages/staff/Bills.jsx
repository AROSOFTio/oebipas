import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
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

export default function Bills() {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const loadBills = async () => {
      const response = await axiosInstance.get('/bills');
      setBills(response.data.data);
    };

    loadBills();
    return subscribeToPaymentSync(loadBills);
  }, []);

  return (
    <SectionCard title="Bills" subtitle="All generated bills from consumption records">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-3 pr-4 font-medium text-slate-500">Bill</th>
              <th className="pb-3 pr-4 font-medium text-slate-500">Customer</th>
              <th className="pb-3 pr-4 font-medium text-slate-500">Total</th>
              <th className="pb-3 pr-4 font-medium text-slate-500">Balance</th>
              <th className="pb-3 pr-4 font-medium text-slate-500">Status</th>
              <th className="pb-3 font-medium text-slate-500">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {bills.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-slate-400">No bills found.</td>
              </tr>
            )}
            {bills.map(bill => (
              <tr key={bill.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                <td className="py-3 pr-4 font-medium text-slate-900">{bill.bill_number}</td>
                <td className="py-3 pr-4 text-slate-600">{bill.customer_name}</td>
                <td className="py-3 pr-4 text-slate-600">UGX {Number(bill.total_amount).toLocaleString()}</td>
                <td className="py-3 pr-4 font-medium text-slate-900">UGX {Number(bill.balance_due).toLocaleString()}</td>
                <td className="py-3 pr-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusBadge(bill.status)}`}>
                    {bill.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 text-slate-600">{bill.due_date?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
