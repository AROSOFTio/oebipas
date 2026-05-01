import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export default function CustomerBills() {
  const [bills, setBills] = useState([]);
  const [selectedBillIds, setSelectedBillIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBills = async () => {
      const response = await axiosInstance.get('/bills/mine');
      const loadedBills = response.data.data;
      setBills(loadedBills);
      setSelectedBillIds(current =>
        current.filter(id => loadedBills.some(bill => String(bill.id) === id && Number(bill.balance_due) > 0))
      );
    };

    loadBills();
    return subscribeToPaymentSync(loadBills);
  }, []);

  const outstandingBills = bills.filter(bill => Number(bill.balance_due) > 0);
  const selectedTotal = bills
    .filter(bill => selectedBillIds.includes(String(bill.id)))
    .reduce((sum, bill) => sum + Number(bill.balance_due || 0), 0);

  const toggleBill = billId => {
    const id = String(billId);
    setSelectedBillIds(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    );
  };

  const paySelected = () => {
    if (!selectedBillIds.length) return;
    navigate('/customer/pay', {
      state: {
        mode: 'select',
        bill_ids: selectedBillIds.map(Number),
      },
    });
  };

  const payAllOutstanding = () => {
    if (!outstandingBills.length) return;
    navigate('/customer/pay', {
      state: {
        mode: 'pay_all',
        bill_ids: outstandingBills.map(bill => bill.id),
      },
    });
  };

  return (
    <SectionCard title="My Bills" subtitle="Current bills, balances and payment status">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Selected total: <span className="font-semibold text-slate-900">UGX {Number(selectedTotal).toLocaleString()}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={paySelected}
            disabled={!selectedBillIds.length}
            className="rounded-full bg-[var(--panel-strong)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            Pay Selected
          </button>
          <button
            type="button"
            onClick={payAllOutstanding}
            disabled={!outstandingBills.length}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
          >
            Pay All Outstanding
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-3 pr-4 font-medium text-slate-500"></th>
              <th className="pb-3 pr-4 font-medium text-slate-500">Bill Number</th>
              <th className="pb-3 pr-4 font-medium text-slate-500">Period</th>
              <th className="pb-3 pr-4 font-medium text-slate-500">Total</th>
              <th className="pb-3 pr-4 font-medium text-slate-500">Balance</th>
              <th className="pb-3 pr-4 font-medium text-slate-500">Status</th>
              <th className="pb-3 pr-4 font-medium text-slate-500">Due Date</th>
              <th className="pb-3 font-medium text-slate-500"></th>
            </tr>
          </thead>
          <tbody>
            {bills.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-slate-400">No bills found.</td>
              </tr>
            )}
            {bills.map(bill => (
              <tr key={bill.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                <td className="py-3 pr-4">
                  {Number(bill.balance_due) > 0 ? (
                    <input
                      type="checkbox"
                      checked={selectedBillIds.includes(String(bill.id))}
                      onChange={() => toggleBill(bill.id)}
                      className="h-4 w-4 rounded border-slate-300 text-[var(--panel-strong)] focus:ring-[var(--panel-strong)]"
                      aria-label={`Select ${bill.bill_number}`}
                    />
                  ) : null}
                </td>
                <td className="py-3 pr-4 font-medium text-slate-900">{bill.bill_number}</td>
                <td className="py-3 pr-4 text-slate-600">{bill.billing_month}/{bill.billing_year}</td>
                <td className="py-3 pr-4 text-slate-600">UGX {Number(bill.total_amount).toLocaleString()}</td>
                <td className="py-3 pr-4 font-medium text-slate-900">UGX {Number(bill.balance_due).toLocaleString()}</td>
                <td className="py-3 pr-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusBadge(bill.status)}`}>
                    {bill.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 pr-4 text-slate-600">{bill.due_date?.slice(0, 10)}</td>
                <td className="py-3">
                  {Number(bill.balance_due) > 0 && (
                    <Link
                      to="/customer/pay"
                      state={{ mode: 'select', bill_ids: [bill.id] }}
                      className="rounded-full bg-[var(--panel-strong)] px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Pay now
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
