import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { Download, FileText, BarChart2, TrendingUp, AlertTriangle, Users, RefreshCw } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, PieChart, Pie, Cell
} from 'recharts';

const REPORT_TYPES = [
  { id: 'daily-revenue', label: 'Daily Revenue', icon: TrendingUp, color: 'text-blue-600', description: 'Revenue collected per day' },
  { id: 'monthly-billing', label: 'Monthly Billing Summary', icon: BarChart2, color: 'text-purple-600', description: 'Billed vs collected per month' },
  { id: 'outstanding-balances', label: 'Outstanding Balances', icon: AlertTriangle, color: 'text-red-600', description: 'Customers with unpaid balances' },
  { id: 'overdue-customers', label: 'Overdue Accounts', icon: Users, color: 'text-orange-600', description: 'Accounts past their due date' },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Reports() {
  const [searchParams] = useSearchParams();
  const [activeReport, setActiveReport] = useState(searchParams.get('type') || 'monthly-billing');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Sync with URL param when user clicks sidebar dropdown links
  useEffect(() => {
    const type = searchParams.get('type');
    if (type && type !== activeReport) {
      setActiveReport(type);
    }
  }, [searchParams]);

  const fetchReport = useCallback(async (reportId) => {
    setLoading(true);
    setReportData(null);
    try {
      const res = await axiosInstance.get(`/reports/${reportId}`);
      setReportData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(activeReport);
  }, [activeReport, fetchReport]);

  const handleExport = async (type) => {
    try {
      if (type === 'pdf') setExportingPdf(true);
      else setExportingCsv(true);
      const response = await axiosInstance.get(`/reports/export/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `oebipas_report.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Export failed. Please try again.');
    } finally {
      setExportingPdf(false);
      setExportingCsv(false);
    }
  };

  const currentType = REPORT_TYPES.find(r => r.id === activeReport);

  const renderChart = () => {
    if (!reportData) return null;

    if (activeReport === 'daily-revenue') {
      return (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={reportData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
              <XAxis dataKey="date" tick={{fontSize: 11}} tickFormatter={(v) => v.slice(5)}/>
              <YAxis tickFormatter={(v) => `UGX ${(v/1000).toFixed(0)}k`} tick={{fontSize: 11}}/>
              <Tooltip formatter={(v) => [`UGX ${Number(v).toLocaleString()}`, 'Revenue']}/>
              <Line type="monotone" dataKey="total_revenue" stroke="#3B82F6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (activeReport === 'monthly-billing') {
      return (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
              <XAxis dataKey="period" tick={{fontSize: 11}}/>
              <YAxis tickFormatter={(v) => `UGX ${(v/1000).toFixed(0)}k`} tick={{fontSize: 11}}/>
              <Tooltip formatter={(v) => [`UGX ${Number(v).toLocaleString()}`, '']}/>
              <Legend/>
              <Bar dataKey="total_billed" name="Total Billed" fill="#8B5CF6" radius={[4, 4, 0, 0]}/>
              <Bar dataKey="total_collected" name="Collected" fill="#10B981" radius={[4, 4, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (activeReport === 'outstanding-balances') {
      const top5 = (reportData || []).slice(0, 5);
      return (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={top5} dataKey="total_due" nameKey="customer_name" cx="50%" cy="50%" outerRadius={120} label={({name, percent}) => `${name?.split(' ')[0]} (${(percent*100).toFixed(0)}%)`}>
                {top5.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]}/>)}
              </Pie>
              <Tooltip formatter={(v) => [`UGX ${Number(v).toLocaleString()}`, 'Balance Due']}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return null;
  };

  const renderTable = () => {
    if (!reportData || !Array.isArray(reportData)) return null;

    if (activeReport === 'daily-revenue') {
      return (
        <table className="w-full text-left border-collapse text-sm">
          <thead><tr className="bg-gray-50 border-b border-border">
            <th className="p-3 font-medium text-gray-500">Date</th>
            <th className="p-3 font-medium text-gray-500 text-right">Revenue (UGX)</th>
          </tr></thead>
          <tbody>
            {reportData.map((r, i) => (
              <tr key={i} className="border-b border-border hover:bg-gray-50">
                <td className="p-3 text-gray-700">{r.date}</td>
                <td className="p-3 font-bold text-green-700 text-right">{Number(r.total_revenue).toLocaleString()}</td>
              </tr>
            ))}
            {reportData.length === 0 && <tr><td colSpan="2" className="p-6 text-center text-gray-400">No data for this period.</td></tr>}
          </tbody>
        </table>
      );
    }

    if (activeReport === 'monthly-billing') {
      return (
        <table className="w-full text-left border-collapse text-sm">
          <thead><tr className="bg-gray-50 border-b border-border">
            <th className="p-3 font-medium text-gray-500">Period</th>
            <th className="p-3 font-medium text-gray-500 text-right">Total Billed (UGX)</th>
            <th className="p-3 font-medium text-gray-500 text-right">Collected (UGX)</th>
            <th className="p-3 font-medium text-gray-500 text-right">Gap (UGX)</th>
          </tr></thead>
          <tbody>
            {reportData.map((r, i) => (
              <tr key={i} className="border-b border-border hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-800">{r.period}</td>
                <td className="p-3 text-purple-700 font-semibold text-right">{Number(r.total_billed).toLocaleString()}</td>
                <td className="p-3 text-green-700 font-semibold text-right">{Number(r.total_collected).toLocaleString()}</td>
                <td className="p-3 text-red-600 font-semibold text-right">{Number(r.total_billed - r.total_collected).toLocaleString()}</td>
              </tr>
            ))}
            {reportData.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-gray-400">No billing data found.</td></tr>}
          </tbody>
        </table>
      );
    }

    if (activeReport === 'outstanding-balances') {
      return (
        <table className="w-full text-left border-collapse text-sm">
          <thead><tr className="bg-gray-50 border-b border-border">
            <th className="p-3 font-medium text-gray-500">#</th>
            <th className="p-3 font-medium text-gray-500">Customer</th>
            <th className="p-3 font-medium text-gray-500">Customer No.</th>
            <th className="p-3 font-medium text-gray-500 text-right">Amount Due (UGX)</th>
          </tr></thead>
          <tbody>
            {reportData.map((r, i) => (
              <tr key={i} className="border-b border-border hover:bg-gray-50">
                <td className="p-3 text-gray-400 text-xs">{i + 1}</td>
                <td className="p-3 font-medium text-gray-900">{r.customer_name}</td>
                <td className="p-3 text-gray-500 font-mono text-xs">{r.customer_number}</td>
                <td className="p-3 font-bold text-red-600 text-right">{Number(r.total_due).toLocaleString()}</td>
              </tr>
            ))}
            {reportData.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-gray-400">No outstanding balances.</td></tr>}
          </tbody>
        </table>
      );
    }

    if (activeReport === 'overdue-customers') {
      return (
        <table className="w-full text-left border-collapse text-sm">
          <thead><tr className="bg-gray-50 border-b border-border">
            <th className="p-3 font-medium text-gray-500">Customer</th>
            <th className="p-3 font-medium text-gray-500">Phone</th>
            <th className="p-3 font-medium text-gray-500">Bill No.</th>
            <th className="p-3 font-medium text-gray-500 text-right">Balance Due</th>
            <th className="p-3 font-medium text-gray-500">Due Date</th>
          </tr></thead>
          <tbody>
            {reportData.map((r, i) => (
              <tr key={i} className="border-b border-border hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">{r.full_name} <br/><span className="text-xs text-gray-400 font-mono">{r.customer_number}</span></td>
                <td className="p-3 text-gray-600">{r.phone}</td>
                <td className="p-3 text-gray-500 font-mono text-xs">{r.bill_number}</td>
                <td className="p-3 font-bold text-red-600 text-right">{Number(r.balance_due).toLocaleString()}</td>
                <td className="p-3 text-orange-600 text-sm font-medium">{new Date(r.due_date).toLocaleDateString()}</td>
              </tr>
            ))}
            {reportData.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-gray-400">No overdue accounts.</td></tr>}
          </tbody>
        </table>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Select a report type to view detailed insights</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleExport('csv')}
            disabled={exportingCsv}
            className="flex items-center space-x-2 bg-white border border-border px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm text-sm disabled:opacity-50"
          >
            <Download size={16}/><span>{exportingCsv ? 'Exporting...' : 'CSV'}</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exportingPdf}
            className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors shadow-sm text-sm disabled:opacity-50"
          >
            <FileText size={16}/><span>{exportingPdf ? 'Generating...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {REPORT_TYPES.map(rt => {
          const Icon = rt.icon;
          const isActive = activeReport === rt.id;
          return (
            <button
              key={rt.id}
              onClick={() => setActiveReport(rt.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${isActive ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-white hover:border-gray-300 hover:shadow-sm'}`}
            >
              <Icon size={22} className={isActive ? 'text-primary' : rt.color}/>
              <p className={`font-semibold text-sm mt-2 ${isActive ? 'text-primary' : 'text-gray-800'}`}>{rt.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{rt.description}</p>
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {currentType && <currentType.icon size={20} className={currentType.color}/>}
            <h2 className="font-bold text-gray-900">{currentType?.label}</h2>
          </div>
          <button onClick={() => fetchReport(activeReport)} disabled={loading} className="text-gray-400 hover:text-primary transition-colors disabled:opacity-50">
            <RefreshCw size={17} className={loading ? 'animate-spin' : ''}/>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">Loading report...</p>
            </div>
          </div>
        ) : (
          <div>
            {activeReport !== 'overdue-customers' && renderChart() && (
              <div className="p-6 border-b border-border">
                {renderChart()}
              </div>
            )}
            <div className="overflow-x-auto">
              {renderTable()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
