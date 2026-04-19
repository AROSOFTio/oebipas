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
      setState({ loading: false, success: false, message: 'No order tracking ID returned from Pesapal.' });
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
              ? 'Payment confirmed. Your bill has been marked as paid and your account is updated.'
              : `Payment status: ${paymentStatus}. If money was deducted, the system will reconcile automatically.`,
          });
        })
        .catch(error => {
          setState({
            loading: false,
            success: false,
            message: error.response?.data?.message || 'Payment verification could not be completed. Please check your payment history.',
          });
        });
    };

    verify();

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [searchParams]);

  return (
    <SectionCard title="Payment Return">
      <div
        className={`rounded-3xl border px-5 py-5 text-sm ${
          state.loading
            ? 'border-slate-200 bg-slate-50 text-slate-600'
            : state.success
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-amber-200 bg-amber-50 text-amber-800'
        }`}
      >
        {state.loading ? (
          <div className="flex items-center gap-3">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
            Verifying payment with Pesapal...
          </div>
        ) : (
          <>
            <p className="font-semibold">{state.success ? '✓ Payment Successful' : '⚠ Payment Pending'}</p>
            <p className="mt-1">{state.message}</p>
          </>
        )}
      </div>

      {!state.loading && (
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/customer/bills"
            className="rounded-full bg-[var(--panel-strong)] px-5 py-3 text-sm font-semibold text-white"
          >
            View bills
          </Link>
          <Link
            to="/customer/payments"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
          >
            Payment history
          </Link>
        </div>
      )}
    </SectionCard>
  );
}
