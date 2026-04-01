import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AlertMessage from '../../components/common/AlertMessage';
import DataTable from '../../components/common/DataTable';
import LoadingState from '../../components/common/LoadingState';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { fetchComplaints } from '../../services/complaintService';
import { formatDateTime, formatNumber, titleCase } from '../../utils/formatters';

const columns = [
  { key: 'complaint_number', label: 'Complaint Number' },
  { key: 'customer', label: 'Customer', render: (complaint) => complaint.customer?.name || '-' },
  { key: 'category', label: 'Category', render: (complaint) => titleCase(complaint.category) },
  { key: 'status', label: 'Status', type: 'status' },
  { key: 'created_at', label: 'Created', render: (complaint) => formatDateTime(complaint.created_at) },
  {
    key: 'actions',
    label: 'Action',
    render: (complaint) => (
      <Link className="link-button" to={`/helpdesk/complaints/${complaint.id}`}>
        Open Case
      </Link>
    ),
  },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError('');

      try {
        const response = await fetchComplaints();
        setComplaints(response);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingState message="Loading helpdesk dashboard..." />;
  }

  return (
    <>
      <PageHeader
        title="Helpdesk Dashboard"
        subtitle="Monitor service complaints, respond to customers, and close resolved cases."
      />
      <AlertMessage tone="error">{error}</AlertMessage>
      <div className="card-grid">
        <StatCard label="Open Complaints" value={formatNumber(complaints.filter((item) => item.status !== 'resolved').length)} helper="Pending and in-progress cases" icon="support_agent" />
        <StatCard label="Resolved Complaints" value={formatNumber(complaints.filter((item) => item.status === 'resolved').length)} helper="Closed service cases" icon="check_circle" />
        <StatCard label="Pending Review" value={formatNumber(complaints.filter((item) => item.status === 'pending').length)} helper="Awaiting first helpdesk action" icon="pending_actions" />
      </div>
      <section className="table-card">
        <PageHeader title="Recent Complaints" subtitle="Latest complaint queue for helpdesk triage and response." />
        <DataTable columns={columns} rows={complaints.slice(0, 6)} />
      </section>
    </>
  );
}