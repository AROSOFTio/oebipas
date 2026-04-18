import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState({ loading: true, success: false, message: '' });

  useEffect(() => {
    const orderTrackingId = searchParams.get('OrderTrackingId') || searchParams.get('orderTrackingId');

    if (!orderTrackingId) {
      setState({ loading: false, success: false, message: 'Pesapal did not return an order tracking ID.' });
      return;
    }

    let attempts = 0;
    let timer = null;

    const verify = () => {
      axiosInstance
        .get(`/payments/verify?orderTrackingId=${encodeURIComponent(orderTrackingId)}`)
        .then(response => {
          const paymentStatus = response.data.data?.payment_status_description || 'Pending';
          const normalized = response.data.data?.payment_status || 'pending';
          const success = normalized === 'successful';

          if (normalized === 'pending' && attempts < 4) {
            attempts += 1;
            timer = window.setTimeout(verify, 2500);
            return;
          }

          setState({
            loading: false,
            success,
            message: success
              ? 'Your Pesapal payment was confirmed, your bill balance is now updated, and notifications have been sent.'
              : `Pesapal returned a payment status of ${paymentStatus}.`,
          });
        })
        .catch(error => {
          setState({
            loading: false,
            success: false,
            message: error.response?.data?.message || 'We could not verify the Pesapal payment yet.',
          });
        });
    };

    verify();

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [searchParams]);

  return (
    <SectionCard title="Pesapal Payment Return" subtitle="Payment verification after redirect from Pesapal">
      <div className={`rounded-3xl border px-5 py-4 text-sm ${state.success ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
        {state.loading ? 'Verifying payment with Pesapal...' : state.message}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/customer/payments" className="rounded-full bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white">
          View payment history
        </Link>
        <Link to="/customer/bills" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">
          Back to bills
        </Link>
      </div>
    </SectionCard>
  );
}
