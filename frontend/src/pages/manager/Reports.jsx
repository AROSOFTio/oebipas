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
      <SectionCard title="Daily Revenue" subtitle="Basic report required in the proposal">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {dailyRevenue.map(item => (
            <div key={item.report_date} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
              <p className="font-medium text-slate-900">{item.report_date?.slice(0, 10)}</p>
              <p className="text-slate-500">UGX {Number(item.total_revenue).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Monthly Billing Summary" subtitle="Bills generated and paid by month">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3">Period</th>
                <th className="pb-3">Bills</th>
                <th className="pb-3">Total billed</th>
                <th className="pb-3">Total paid</th>
              </tr>
            </thead>
            <tbody>
              {monthlyBilling.map(item => (
                <tr key={`${item.billing_year}-${item.billing_month}`} className="border-t border-slate-100">
                  <td className="py-3">
                    {item.billing_month}/{item.billing_year}
                  </td>
                  <td className="py-3">{item.bills_generated}</td>
                  <td className="py-3">UGX {Number(item.total_billed).toLocaleString()}</td>
                  <td className="py-3">UGX {Number(item.total_paid).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Outstanding Payments" subtitle="Open balances for follow-up">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Bill</th>
                <th className="pb-3">Balance</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {outstanding.map(item => (
                <tr key={`${item.customer_number}-${item.bill_number}`} className="border-t border-slate-100">
                  <td className="py-3">{item.customer_name}</td>
                  <td className="py-3">{item.bill_number}</td>
                  <td className="py-3">UGX {Number(item.balance_due).toLocaleString()}</td>
                  <td className="py-3 capitalize">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
