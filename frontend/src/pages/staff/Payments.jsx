import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';

export default function Payments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    axiosInstance.get('/payments').then(response => setPayments(response.data.data));
  }, []);

  return (
    <SectionCard title="Payment Monitoring" subtitle="Track payment progress and callback outcomes">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-3">Reference</th>
              <th className="pb-3">Customer</th>
              <th className="pb-3">Bill</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Method</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id} className="border-t border-slate-100">
                <td className="py-3">
                  <p className="font-medium text-slate-900">{payment.payment_reference}</p>
                  <p className="text-slate-500">{payment.transaction_reference}</p>
                </td>
                <td className="py-3">{payment.customer_name}</td>
                <td className="py-3">{payment.bill_number}</td>
                <td className="py-3">UGX {Number(payment.amount).toLocaleString()}</td>
                <td className="py-3 capitalize">{payment.payment_method.replace('_', ' ')}</td>
                <td className="py-3 capitalize">{payment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
