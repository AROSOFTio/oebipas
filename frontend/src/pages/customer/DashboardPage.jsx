import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AlertMessage from '../../components/common/AlertMessage';
import DataTable from '../../components/common/DataTable';
import LoadingState from '../../components/common/LoadingState';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { fetchBills } from '../../services/billingService';
import { fetchComplaints } from '../../services/complaintService';
import { fetchMeters } from '../../services/meterService';
import { fetchNotifications } from '../../services/notificationService';
import { fetchPayments } from '../../services/paymentService';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters';

const columns = [
  { key: 'bill_number', label: 'Bill Number' },
  {
    key: 'total_amount',
    label: 'Amount',
    render: (bill) => formatCurrency(bill.total_amount),
  },
  {
    key: 'due_date',
    label: 'Due Date',
    render: (bill) => formatDate(bill.due_date),
  },
  { key: 'status', label: 'Status', type: 'status' },
  {
    key: 'actions',
    label: 'Action',
    render: (bill) => (
      <Link className="link-button" to={`/customer/bills/${bill.id}`}>
        View Bill
      </Link>
    ),
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({
    bills: [],
    payments: [],
    meters: [],
    complaints: [],
    notifications: [],
  });

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError('');

      try {
        const [bills, payments, meters, complaints, notifications] = await Promise.all([
          fetchBills(),
          fetchPayments(),
          fetchMeters(),
          fetchComplaints(),
          fetchNotifications(),
        ]);

        setSummary({ bills, payments, meters, complaints, notifications });
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingState message="Loading customer dashboard..." />;
  }

  const currentBill = summary.bills.find((bill) => bill.status !== 'paid') || summary.bills[0];
  const outstandingBills = summary.bills.filter((bill) => bill.status !== 'paid').length;
  const activeMeters = summary.meters.filter((meter) => meter.status === 'active').length;
  const openComplaints = summary.complaints.filter((complaint) => complaint.status !== 'resolved').length;

  return (
    <>
      <PageHeader
        title={`Welcome ${user?.name?.split(' ')[0]}!`}
        subtitle="Track bills, receipts, complaints, and notifications from one secure workspace."
      />
      <AlertMessage tone="error">{error}</AlertMessage>
      <div className="card-grid">
        <StatCard
          label="Current Bill"
          value={currentBill ? formatCurrency(currentBill.total_amount) : formatCurrency(0)}
          helper={currentBill ? `Due ${formatDate(currentBill.due_date)}` : 'No current bill available'}
          icon="receipt"
        />
        <StatCard
          label="Outstanding Bills"
          value={formatNumber(outstandingBills)}
          helper="Bills still awaiting payment"
          icon="warning"
        />
        <StatCard
          label="Active Meters"
          value={formatNumber(activeMeters)}
          helper="Meters linked to your account"
          icon="speed"
        />
        <StatCard
          label="Open Complaints"
          value={formatNumber(openComplaints)}
          helper={`${summary.notifications.length} notification records received`}
          icon="support_agent"
        />
      </div>
      <section className="table-card">
        <PageHeader
          title="Recent Bills"
          subtitle="Latest bill records available for your customer account."
        />
        <DataTable
          columns={columns}
          rows={summary.bills.slice(0, 5)}
          emptyTitle="No bills available"
          emptyMessage="Your generated bills will appear here once the billing cycle is processed."
        />
      </section>
    </>
  );
}