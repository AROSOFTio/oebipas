import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';

export default function Bills() {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    axiosInstance.get('/bills').then(response => setBills(response.data.data));
  }, []);

  return (
    <SectionCard title="Bills" subtitle="Automatically generated from consumption records">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-3">Bill</th>
              <th className="pb-3">Customer</th>
              <th className="pb-3">Total</th>
              <th className="pb-3">Balance</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Due date</th>
            </tr>
          </thead>
          <tbody>
            {bills.map(bill => (
              <tr key={bill.id} className="border-t border-slate-100">
                <td className="py-3">{bill.bill_number}</td>
                <td className="py-3">{bill.customer_name}</td>
                <td className="py-3">UGX {Number(bill.total_amount).toLocaleString()}</td>
                <td className="py-3">UGX {Number(bill.balance_due).toLocaleString()}</td>
                <td className="py-3 capitalize">{bill.status}</td>
                <td className="py-3">{bill.due_date?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
