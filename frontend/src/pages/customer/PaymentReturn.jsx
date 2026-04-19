import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SectionCard from '../../components/SectionCard';
import axiosInstance from '../../utils/axiosInstance';
import { markPaymentSync } from '../../utils/paymentSync';

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState({ loading: true, kind: 'loading', message: '' });

  useEffect(() => {
    const orderTrackingId = searchParams.get('OrderTrackingId') || searchParams.get('orderTrackingId');
    const orderMerchantReference =
      searchParams.get('OrderMerchantReference') || searchParams.get('orderMerchantReference');

    if (!orderTrackingId) {
      setState({ loading: false, kind: 'error', message: 'No order tracking ID returned from Pesapal.' });
      return;
    }

    let cancelled = false;

    const verify = () => {
      axiosInstance
        .get('/payments/verify', {
          params: {
            orderTrackingId,
            ...(orderMerchantReference ? { orderMerchantReference } : {}),
          },
        })
        .then(response => {
          if (cancelled) return;

          const paymentStatus = response.data.data?.payment_status_description || 'Pending';
          const normalized = response.data.data?.payment_status || 'pending';
          const billStatus = response.data.data?.bill_status || 'pending';
          const success = normalized === 'successful';

          if (success) {
            markPaymentSync();
          }

          setState({
            loading: false,
            kind: success ? 'success' : normalized === 'failed' ? 'error' : 'finalizing',
            message: success
              ? `Payment confirmed. Bill status is now ${billStatus.replace('_', ' ')} and your receipt has been sent automatically to your email.`
              : normalized === 'failed'
                ? `Payment failed: ${paymentStatus}.`
                : 'We are still finalizing your payment with Pesapal. Refresh this page in a few moments if it does not change automatically.',
          });
        })
        .catch(error => {
          if (cancelled) return;

          setState({
            loading: false,
            kind: 'error',
            message:
              error.response?.data?.message ||
              'Payment verification could not be completed. Please check your payment history.',
          });
        });
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <SectionCard title="Payment Return">
      <div
        className={`rounded-3xl border px-5 py-5 text-sm ${
          state.loading
            ? 'border-slate-200 bg-slate-50 text-slate-600'
            : state.kind === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : state.kind === 'finalizing'
                ? 'border-blue-200 bg-blue-50 text-blue-800'
                : 'border-amber-200 bg-amber-50 text-amber-800'
        }`}
      >
        {state.loading ? (
          <div className="flex items-center gap-3">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
            Finalizing payment with Pesapal...
          </div>
        ) : (
          <>
            <p className="font-semibold">
              {state.kind === 'success'
                ? 'Payment Successful'
                : state.kind === 'finalizing'
                  ? 'Finalizing Payment'
                  : 'Payment Error'}
            </p>
            <p className="mt-1">{state.message}</p>
          </>
        )}
      </div>

      {!state.loading && (
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/customer"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
          >
            Dashboard
          </Link>
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
