import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';

export default function CustomerPaymentHistory() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    axiosInstance.get('/payments/mine').then(response => setPayments(response.data.data));
  }, []);

  return (
    <SectionCard title="Payment History" subtitle="Track Pesapal payment attempts and confirmed account updates">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-3">Reference</th>
              <th className="pb-3">Bill</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Method</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id} className="border-t border-slate-100">
                <td className="py-3">{payment.payment_reference}</td>
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
