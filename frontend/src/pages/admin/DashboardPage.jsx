import { useEffect, useState } from 'react';
import AlertMessage from '../../components/common/AlertMessage';
import DataTable from '../../components/common/DataTable';
import LoadingState from '../../components/common/LoadingState';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { fetchReportSummary } from '../../services/reportService';
import { fetchTariffs } from '../../services/tariffService';
import { formatCurrency, formatNumber } from '../../utils/formatters';

const columns = [
  { key: 'name', label: 'Tariff Name' },
  { key: 'unit_price', label: 'Unit Price', render: (tariff) => formatCurrency(tariff.unit_price) },
  { key: 'fixed_charge', label: 'Fixed Charge', render: (tariff) => formatCurrency(tariff.fixed_charge) },
  { key: 'status', label: 'Status', type: 'status' },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [tariffs, setTariffs] = useState([]);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError('');

      try {
        const [reportResponse, tariffResponse] = await Promise.all([fetchReportSummary(), fetchTariffs()]);
        setSummary(reportResponse.data);
        setTariffs(tariffResponse);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingState message="Loading admin dashboard..." />;
  }

  return (
    <>
      <PageHeader title="Dashboard" />
      <AlertMessage tone="error">{error}</AlertMessage>
      {summary ? (
        <div className="card-grid compact-dashboard-grid">
          <StatCard label="Customers" value={formatNumber(summary.total_customers)} helper="Accounts" icon="people" />
          <StatCard label="Meters" value={formatNumber(summary.total_meters)} helper="Installed" icon="electric_meter" />
          <StatCard label="Unpaid Bills" value={formatNumber(summary.total_unpaid_bills)} helper="Due" icon="receipt_long" />
          <StatCard label="Open Complaints" value={formatNumber(summary.unresolved_complaints)} helper="Cases" icon="report_problem" />
        </div>
      ) : null}
      <section className="table-card">
        <PageHeader title="Active Tariffs" />
        <DataTable columns={columns} rows={tariffs} />
      </section>
    </>
  );
}