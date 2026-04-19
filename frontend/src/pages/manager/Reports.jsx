import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';

export default function Reports() {
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [monthlyBilling, setMonthlyBilling] = useState([]);
  const [outstanding, setOutstanding] = useState([]);

  useEffect(() => {
    Promise.all([
      axiosInstance.get('/reports/daily-revenue'),
      axiosInstance.get('/reports/monthly-billing-summary'),
      axiosInstance.get('/reports/outstanding-payments'),
    ]).then(([daily, monthly, outstandingResponse]) => {
      setDailyRevenue(daily.data.data);
      setMonthlyBilling(monthly.data.data);
      setOutstanding(outstandingResponse.data.data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <SectionCard title="Daily Revenue">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {dailyRevenue.length === 0 && <p className="text-sm text-slate-400">No data available.</p>}
          {dailyRevenue.map(item => (
            <div key={item.report_date} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">{item.report_date?.slice(0, 10)}</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                UGX {Number(item.total_revenue).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Monthly Billing Summary">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 pr-4 font-medium text-slate-500">Period</th>
                <th className="pb-3 pr-4 font-medium text-slate-500">Bills</th>
                <th className="pb-3 pr-4 font-medium text-slate-500">Total Billed</th>
                <th className="pb-3 font-medium text-slate-500">Total Paid</th>
              </tr>
            </thead>
            <tbody>
              {monthlyBilling.length === 0 && (
                <tr><td colSpan={4} className="py-6 text-slate-400">No billing data yet.</td></tr>
              )}
              {monthlyBilling.map(item => (
                <tr key={`${item.billing_year}-${item.billing_month}`} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-3 pr-4 text-slate-700">{item.billing_month}/{item.billing_year}</td>
                  <td className="py-3 pr-4 text-slate-700">{item.bills_generated}</td>
                  <td className="py-3 pr-4 font-medium text-slate-900">UGX {Number(item.total_billed).toLocaleString()}</td>
                  <td className="py-3 text-emerald-700 font-medium">UGX {Number(item.total_paid).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Outstanding Payments">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 pr-4 font-medium text-slate-500">Customer</th>
                <th className="pb-3 pr-4 font-medium text-slate-500">Bill</th>
                <th className="pb-3 pr-4 font-medium text-slate-500">Balance</th>
                <th className="pb-3 font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {outstanding.length === 0 && (
                <tr><td colSpan={4} className="py-6 text-slate-400">No outstanding payments.</td></tr>
              )}
              {outstanding.map(item => (
                <tr key={`${item.customer_number}-${item.bill_number}`} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-3 pr-4 text-slate-700">{item.customer_name}</td>
                  <td className="py-3 pr-4 text-slate-700">{item.bill_number}</td>
                  <td className="py-3 pr-4 font-medium text-slate-900">UGX {Number(item.balance_due).toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      item.status === 'overdue' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status.replace('_', ' ')}
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
