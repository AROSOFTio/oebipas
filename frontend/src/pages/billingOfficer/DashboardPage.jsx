import { useEffect, useState } from 'react';
import AlertMessage from '../../components/common/AlertMessage';
import DataTable from '../../components/common/DataTable';
import LoadingState from '../../components/common/LoadingState';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { fetchBills } from '../../services/billingService';
import { fetchCustomers } from '../../services/customerService';
import { fetchMeters } from '../../services/meterService';
import { fetchPayments } from '../../services/paymentService';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters';

const columns = [
  { key: 'bill_number', label: 'Bill Number' },
  { key: 'customer', label: 'Customer', render: (bill) => bill.customer?.name || '-' },
  { key: 'total_amount', label: 'Amount', render: (bill) => formatCurrency(bill.total_amount) },
  { key: 'due_date', label: 'Due Date', render: (bill) => formatDate(bill.due_date) },
  { key: 'status', label: 'Status', type: 'status' },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({ customers: [], meters: [], bills: [], payments: [] });

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError('');

      try {
        const [customers, meters, bills, payments] = await Promise.all([
          fetchCustomers(),
          fetchMeters(),
          fetchBills(),
          fetchPayments(),
        ]);

        setSummary({ customers, meters, bills, payments });
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingState message="Loading billing dashboard..." />;
  }

  const todayPayments = summary.payments
    .filter((payment) => String(payment.paid_at || '').slice(0, 10) === new Date().toISOString().slice(0, 10))
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  return (
    <>
      <PageHeader
        title="Billing Officer Dashboard"
        subtitle="Manage customer registration, meter operations, bill generation, and payment posting."
      />
      <AlertMessage tone="error">{error}</AlertMessage>
      <div className="card-grid">
        <StatCard label="Customers" value={formatNumber(summary.customers.length)} helper="Registered customer accounts" icon="people" />
        <StatCard label="Active Meters" value={formatNumber(summary.meters.filter((meter) => meter.status === 'active').length)} helper="Meters in service" icon="speed" />
        <StatCard label="Unpaid Bills" value={formatNumber(summary.bills.filter((bill) => bill.status !== 'paid').length)} helper="Bills needing follow-up" icon="receipt_long" />
        <StatCard label="Payments Today" value={formatCurrency(todayPayments)} helper="Posted across all payment methods" icon="payments" />
      </div>
      <section className="table-card">
        <PageHeader title="Recent Bills" subtitle="Latest generated bills visible to the billing operations team." />
        <DataTable columns={columns} rows={summary.bills.slice(0, 6)} />
      </section>
    </>
  );
}