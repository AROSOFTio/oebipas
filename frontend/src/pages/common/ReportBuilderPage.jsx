import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchCustomReport } from '../../services/reportService';
import { exportDynamicReportPdf } from '../../utils/exporters';
import { formatCurrency, formatDateTime, formatNumber, titleCase } from '../../utils/formatters';
import AlertMessage from '../../components/common/AlertMessage';
import DataTable from '../../components/common/DataTable';
import PageHeader from '../../components/common/PageHeader';

export default function ReportBuilderPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);
  
  const [filters, setFilters] = useState({
    report_type: 'billing_history',
    start_date: '',
    end_date: '',
    status: 'all',
  });

  const getAvailableReportTypes = () => {
    switch (user?.role) {
      case 'administrator':
        return [
          { value: 'revenue_summary', label: 'Revenue Summary' },
          { value: 'billing_history', label: 'Billing History' },
          { value: 'payment_history', label: 'Payment Ledger' },
          { value: 'complaint_log', label: 'Complaint Log' },
        ];
      case 'billing_officer':
        return [
          { value: 'billing_history', label: 'Billing Run History' },
          { value: 'payment_history', label: 'Collections Ledger' },
        ];
      case 'helpdesk_officer':
        return [
          { value: 'complaint_log', label: 'Service Complaint Log' },
        ];
      case 'customer':
        return [
          { value: 'billing_history', label: 'My Billing History' },
          { value: 'payment_history', label: 'My Payment Ledger' },
          { value: 'complaint_log', label: 'My Complaint Log' },
        ];
      default:
        return [];
    }
  };

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

  return (
    <div className="list-stack">
      <section className="form-card">
        <PageHeader 
          title="Custom Report Builder" 
          subtitle="Generate parameterized PDF exports." 
          actions={
            reportData ? (
              <button type="button" className="button" onClick={downloadPdf}>
                Download Professional PDF
              </button>
            ) : null
          }
        />
        
        <form onSubmit={generateReport} className="form-grid" style={{ marginTop: '24px' }}>
          <div className="field">
            <label>Report Type</label>
            <select 
              value={filters.report_type} 
              onChange={(e) => handleFilterChange('report_type', e.target.value)}
              required
            >
              {getAvailableReportTypes().map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div className="field">
            <label>Status</label>
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Statuses</option>
              {['active', 'inactive', 'paid', 'unpaid', 'overdue', 'resolved', 'pending', 'success', 'failed'].map(s => (
                <option key={s} value={s}>{titleCase(s)}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Start Date</label>
            <input 
              type="date" 
              value={filters.start_date} 
              onChange={(e) => handleFilterChange('start_date', e.target.value)} 
            />
          </div>

          <div className="field">
            <label>End Date</label>
            <input 
              type="date" 
              value={filters.end_date} 
              onChange={(e) => handleFilterChange('end_date', e.target.value)} 
            />
          </div>

          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="button-outline" disabled={loading} style={{ width: 'fit-content' }}>
              {loading ? 'Executing Query...' : 'Preview Data Extract'}
            </button>
          </div>
        </form>

        {error && <AlertMessage tone="error">{error}</AlertMessage>}
      </section>

      {reportData !== null && (
        <section className="table-card">
          <PageHeader title="Extract Preview" subtitle={`Found ${reportData.length} records matching parameters.`} />
          {reportData.length > 0 ? (
            <DataTable columns={columns} rows={reportData} />
          ) : (
            <div className="empty-state">
              <p>No data found for the given parameters.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
