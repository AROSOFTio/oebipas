import { useEffect, useState } from 'react';
import AlertMessage from '../../components/common/AlertMessage';
import DetailGrid from '../../components/common/DetailGrid';
import LoadingState from '../../components/common/LoadingState';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { fetchBills } from '../../services/billingService';
import { fetchComplaints } from '../../services/complaintService';
import { fetchMeters } from '../../services/meterService';
import { formatNumber, titleCase } from '../../utils/formatters';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [counts, setCounts] = useState({ meters: 0, bills: 0, complaints: 0 });

  useEffect(() => {
    async function loadProfileSummary() {
      setLoading(true);
      setError('');

      try {
        const [meters, bills, complaints] = await Promise.all([
          fetchMeters(),
          fetchBills(),
          fetchComplaints(),
        ]);

        setCounts({
          meters: meters.length,
          bills: bills.length,
          complaints: complaints.length,
        });
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfileSummary();
  }, []);

  if (loading) {
    return <LoadingState message="Loading customer profile..." />;
  }

  return (
    <>
      <PageHeader
        title="Profile"
        subtitle="Review the customer account and service details linked to your authenticated login."
      />
      <AlertMessage tone="error">{error}</AlertMessage>
      <section className="section-card list-stack">
        <DetailGrid
          items={[
            { label: 'Customer Name', value: user?.customer?.name || user?.name },
            { label: 'Account Number', value: user?.customer?.account_number },
            { label: 'Email', value: user?.email },
            { label: 'Phone', value: user?.customer?.phone || user?.phone },
            { label: 'National ID', value: user?.customer?.national_id },
            { label: 'Address', value: user?.customer?.address },
            { label: 'Status', value: titleCase(user?.customer?.status || user?.status) },
            { label: 'Role', value: user?.roleLabel },
          ]}
        />
        <div className="metric-strip">
          <div className="metric-box">
            <span style={{ marginRight: '6px', color: 'var(--color-text-muted)' }}>Meters:</span>
            <strong>{formatNumber(counts.meters)}</strong>
          </div>
          <div className="metric-box">
            <span style={{ marginRight: '6px', color: 'var(--color-text-muted)' }}>Bills:</span>
            <strong>{formatNumber(counts.bills)}</strong>
          </div>
          <div className="metric-box">
            <span style={{ marginRight: '6px', color: 'var(--color-text-muted)' }}>Complaints:</span>
            <strong>{formatNumber(counts.complaints)}</strong>
          </div>
        </div>
      </section>
    </>
  );
}