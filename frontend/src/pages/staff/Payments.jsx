import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';
import { subscribeToPaymentSync } from '../../utils/paymentSync';

const paymentBadge = status => {
  const map = {
    successful: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-rose-100 text-rose-700',
    pending: 'bg-amber-100 text-amber-700',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
};

export default function Payments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const loadPayments = async () => {
      const response = await axiosInstance.get('/payments');
      setPayments(response.data.data);
    };

    loadPayments();
    return subscribeToPaymentSync(loadPayments);
  }, []);

  return (
    <SectionCard title="Payment Monitoring" subtitle="Pesapal payments — reference, verification and settlement status">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-3 pr-4 font-medium text-slate-500">Reference</th>
              <th className="pb-3 pr-4 font-medium text-slate-500">Customer</th>
              <th className="pb-3 pr-4 font-medium text-slate-500">Bill</th>
              <th className="pb-3 pr-4 font-medium text-slate-500">Amount</th>
              <th className="pb-3 pr-4 font-medium text-slate-500">Method</th>
              <th className="pb-3 font-medium text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-slate-400">No payments recorded yet.</td>
              </tr>
            )}
            {payments.map(payment => (
              <tr key={payment.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                <td className="py-3 pr-4">
                  <p className="font-medium text-slate-900">{payment.payment_reference}</p>
                  <p className="text-xs text-slate-400">{payment.transaction_reference}</p>
                </td>
                <td className="py-3 pr-4 text-slate-600">{payment.customer_name}</td>
                <td className="py-3 pr-4 text-slate-600">{payment.bill_number}</td>
                <td className="py-3 pr-4 font-medium text-slate-900">UGX {Number(payment.amount).toLocaleString()}</td>
                <td className="py-3 pr-4 capitalize text-slate-600">{payment.payment_method.replace('_', ' ')}</td>
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
  );
}
