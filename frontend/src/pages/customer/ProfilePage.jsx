import { useEffect, useState } from 'react';
import AlertMessage from '../../components/common/AlertMessage';
import DetailGrid from '../../components/common/DetailGrid';
import LoadingState from '../../components/common/LoadingState';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
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

      <div className="card-grid" style={{ marginBottom: '32px' }}>
        <StatCard
          label="Registered Meters"
          value={formatNumber(counts.meters)}
          helper="Total active physical assets tracked"
          icon="meter"
        />
        <StatCard
          label="Billing Records"
          value={formatNumber(counts.bills)}
          helper="Generated payment histories"
          icon="bills"
        />
        <StatCard
          label="Service Complaints"
          value={formatNumber(counts.complaints)}
          helper="Total tickets associated with account"
          icon="complaints"
        />
      </div>

      <DetailGrid
        items={[
          { label: 'Customer Name', value: user?.customer?.name || user?.name },
          { label: 'Account Number', value: user?.customer?.account_number },
          { label: 'Email', value: user?.email },
          { label: 'Phone', value: user?.customer?.phone || user?.phone },
          { label: 'National ID', value: user?.customer?.national_id },
          { label: 'Address', value: user?.customer?.address },
          { label: 'Status', value: titleCase(user?.customer?.status || user?.status) },
          { label: 'Security Role', value: user?.roleLabel },
        ]}
      />
    </>
  );
}