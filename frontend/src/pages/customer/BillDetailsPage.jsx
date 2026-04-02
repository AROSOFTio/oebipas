import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AlertMessage from '../../components/common/AlertMessage';
import DataTable from '../../components/common/DataTable';
import DetailGrid from '../../components/common/DetailGrid';
import LoadingState from '../../components/common/LoadingState';
import PageHeader from '../../components/common/PageHeader';
import { fetchBill, initiatePesapalPayment } from '../../services/billingService';
import { formatCurrency, formatDate, formatDateTime, formatNumber, titleCase } from '../../utils/formatters';

const columns = [
  { key: 'payment_number', label: 'Payment Number' },
  {
    key: 'payment_method',
    label: 'Method',
    render: (payment) => titleCase(payment.payment_method),
  },
  {
    key: 'amount',
    label: 'Amount',
    render: (payment) => formatCurrency(payment.amount),
  },
  {
    key: 'paid_at',
    label: 'Paid At',
    render: (payment) => formatDateTime(payment.paid_at),
  },
  { key: 'status', label: 'Status', type: 'status' },
];

export default function BillDetailsPage() {
  const { billId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bill, setBill] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function loadBill() {
      setLoading(true);
      setError('');

      try {
        const response = await fetchBill(billId);
        setBill(response);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadBill();
  }, [billId]);

  if (loading) {
    return <LoadingState message="Loading bill details..." />;
  }

  async function handlePaymentInitiation() {
    setProcessing(true);
    setError('');
    
    try {
      const response = await initiatePesapalPayment(billId);
      if (response.redirect_url) {
        window.location.href = response.redirect_url;
      } else {
        throw new Error("Invalid payment gateway response. Missing redirect URL.");
      }
    } catch (paymentError) {
      setError(paymentError.message || "Failed to initiate payment. Ensure your settings are configured.");
      setProcessing(false);
    }
  }

  return (
    <div className="list-stack">
      <PageHeader
        title="Bill Details"
        subtitle="Full breakdown of the generated customer bill and linked payment activity."
        action={
          bill?.status !== 'paid' && (
            <button
              className="button"
              onClick={handlePaymentInitiation}
              disabled={processing}
            >
              {processing ? 'Connecting to Pesapal...' : 'Pay Online via Pesapal'}
            </button>
          )
        }
      />
      <AlertMessage tone="error">{error}</AlertMessage>
      {bill ? (
        <section className="section-card list-stack">
          <DetailGrid
            items={[
              { label: 'Bill Number', value: bill.bill_number },
              { label: 'Billing Cycle', value: bill.billing_cycle },
              { label: 'Meter Number', value: bill.meter?.meter_number },
              { label: 'Tariff', value: bill.tariff?.name },
              { label: 'Previous Reading', value: formatNumber(bill.previous_reading) },
              { label: 'Current Reading', value: formatNumber(bill.current_reading) },
              { label: 'Units Consumed', value: formatNumber(bill.units_consumed) },
              { label: 'Tariff Rate', value: formatCurrency(bill.tariff_rate) },
              { label: 'Fixed Charge', value: formatCurrency(bill.fixed_charge) },
              { label: 'Energy Charge', value: formatCurrency(bill.energy_charge) },
              { label: 'Total Bill', value: formatCurrency(bill.total_amount) },
              { label: 'Due Date', value: formatDate(bill.due_date) },
              { label: 'Status', value: titleCase(bill.status) },
            ]}
          />
          <div className="table-card">
            <PageHeader
              title="Payments on This Bill"
              subtitle="Payment records posted against the selected bill."
            />
            <DataTable
              columns={columns}
              rows={bill.payments || []}
              emptyTitle="No payments recorded"
              emptyMessage="Payments will appear here after successful posting by the billing office."
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}