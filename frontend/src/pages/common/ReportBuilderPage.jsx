import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchCustomReport } from '../../services/reportService';
import { exportDynamicReportPdf } from '../../utils/exporters';
import { formatCurrency, formatDateTime, formatNumber, titleCase } from '../../utils/formatters';
import AlertMessage from '../../components/common/AlertMessage';
import DataTable from '../../components/common/DataTable';
import PageHeader from '../../components/common/PageHeader';
import AppIcon from '../../components/common/AppIcon';

export default function ReportBuilderPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const reportTypeFromUrl = searchParams.get('type') || 'billing_history';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);
  
  const [filters, setFilters] = useState({
    report_type: reportTypeFromUrl,
    start_date: '',
    end_date: '',
    status: 'all',
  });

  useEffect(() => {
    setFilters(prev => ({ ...prev, report_type: reportTypeFromUrl }));
    setReportData(null); // Reset when navigating between reports
  }, [reportTypeFromUrl]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const generateReport = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setReportData(null);

    try {
      const payload = {
        report_type: filters.report_type,
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
      };

      const response = await fetchCustomReport(payload);
      setReportData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!reportData) return;
    try {
      await exportDynamicReportPdf(filters.report_type, reportData, filters);
    } catch (err) {
      setError('PDF Generation Failed: ' + err.message);
    }
  };

  let columns = [];
  if (reportData && reportData.length > 0) {
    if (filters.report_type === 'billing_history') {
      columns = [
        { key: 'bill_number', label: 'Bill Number' },
        { key: 'date', label: 'Date', render: (row) => formatDateTime(row.created_at) },
        { key: 'customer', label: 'Customer', render: (row) => row.customer?.name || '-' },
        { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.total_amount) },
        { key: 'status', label: 'Status', render: (row) => titleCase(row.status) },
      ];
    } else if (filters.report_type === 'payment_history') {
      columns = [
        { key: 'payment_number', label: 'Payment Ref' },
        { key: 'date', label: 'Date', render: (row) => formatDateTime(row.paid_at) },
        { key: 'method', label: 'Method', render: (row) => titleCase(row.payment_method) },
        { key: 'bill', label: 'Bill Number', render: (row) => row.bill?.bill_number || '-' },
        { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount) },
      ];
    } else if (filters.report_type === 'complaint_log') {
      columns = [
        { key: 'id', label: 'Log ID' },
        { key: 'date', label: 'Date', render: (row) => formatDateTime(row.created_at) },
        { key: 'category', label: 'Category', render: (row) => titleCase(row.category) },
        { key: 'subject', label: 'Subject' },
        { key: 'status', label: 'Status', render: (row) => titleCase(row.status) },
      ];
    } else if (filters.report_type === 'revenue_summary') {
      columns = [
        { key: 'metric', label: 'Financial Metric' },
        { key: 'value', label: 'Reported Value', render: (row) => typeof row.value === 'number' ? (row.metric.includes('Count') ? formatNumber(row.value) : formatCurrency(row.value)) : row.value },
      ];
    }
  }

  const humanReadableTitle = filters.report_type.split('_').map(titleCase).join(' ');

  return (
    <div className="list-stack">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '8px' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', margin: 0, color: 'var(--color-text)' }}>{humanReadableTitle}</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>Parametrize and extract real-time records.</p>
        </div>
        {reportData && (
          <button type="button" className="button" onClick={downloadPdf} style={{ display: 'inline-flex', gap: '8px' }}>
            <AppIcon name="download" /> Export to PDF
          </button>
        )}
      </div>

      <section className="form-card" style={{ padding: '24px', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--color-text)', fontWeight: '600' }}>
          <AppIcon name="filter_list" />
          <span>Active Filters</span>
        </div>

        <form onSubmit={generateReport} style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-end' }}>
          <div className="field" style={{ flex: '1 1 200px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Status Constraint</label>
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{ height: '44px', background: 'var(--color-surface-hover)' }}
            >
              <option value="all">Any Status</option>
              {['active', 'inactive', 'paid', 'unpaid', 'overdue', 'resolved', 'pending', 'success', 'failed'].map(s => (
                <option key={s} value={s}>{titleCase(s)}</option>
              ))}
            </select>
          </div>

          <div className="field" style={{ flex: '1 1 200px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Date From</label>
            <input 
              type="date" 
              value={filters.start_date} 
              onChange={(e) => handleFilterChange('start_date', e.target.value)} 
              style={{ height: '44px', background: 'var(--color-surface-hover)' }}
            />
          </div>

          <div className="field" style={{ flex: '1 1 200px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Date To</label>
            <input 
              type="date" 
              value={filters.end_date} 
              onChange={(e) => handleFilterChange('end_date', e.target.value)} 
              style={{ height: '44px', background: 'var(--color-surface-hover)' }}
            />
          </div>

          <div style={{ flex: '0 0 auto' }}>
            <button type="submit" className="button" disabled={loading} style={{ height: '44px', minWidth: '160px' }}>
              {loading ? 'Querying...' : 'Run Extraction'}
            </button>
          </div>
        </form>

        {error && <div style={{ marginTop: '20px' }}><AlertMessage tone="error">{error}</AlertMessage></div>}
      </section>

      {reportData !== null && (
        <section className="table-card" style={{ marginTop: '32px' }}>
          <PageHeader title="Result Data" subtitle={`Discovered ${reportData.length} records matching your parameters.`} />
          <div style={{ marginTop: '20px' }}>
            {reportData.length > 0 ? (
              <DataTable columns={columns} rows={reportData} />
            ) : (
              <div className="empty-state" style={{ padding: '40px', textAlign: 'center', background: 'var(--color-surface)', border: '1px dashed var(--color-border-strong)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', margin: 0 }}>No matching records found for the selected extract window.</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
