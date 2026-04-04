import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { Download, FileText, BarChart2, TrendingUp, AlertTriangle, Users, RefreshCw, Calendar, Filter } from 'lucide-react';
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

  // Filters
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Sync with URL param when user clicks sidebar dropdown links
  useEffect(() => {
    const type = searchParams.get('type');
    if (type && type !== activeReport) {
      setActiveReport(type);
    }
  }, [searchParams, activeReport]);

  const fetchReport = useCallback(async (reportId) => {
    setLoading(true);
    setReportData(null);
    try {
      const res = await axiosInstance.get(`/reports/${reportId}?startDate=${startDate}&endDate=${endDate}`);
      setReportData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchReport(activeReport);
  }, [activeReport, fetchReport]);

  const handleExport = async (type) => {
    try {
      if (type === 'pdf') setExportingPdf(true);
      else setExportingCsv(true);
      const response = await axiosInstance.get(`/reports/export/${type}?reportId=${activeReport}&startDate=${startDate}&endDate=${endDate}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `oebipas_${activeReport}_${startDate}_to_${endDate}.${type}`);
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
    if (!reportData || !Array.isArray(reportData) || reportData.length === 0) return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-400">
        <BarChart2 size={48} className="mb-2 opacity-20"/>
        <p>No visualization data available for this range</p>
      </div>
    );

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
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-end gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Select a report type and filter by date range</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-xl border border-border shadow-sm">
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-400"/>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Range:</span>
          </div>
          <div className="flex items-center space-x-2">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-1.5 focus:border-primary outline-none text-gray-700"/>
            <span className="text-gray-400">to</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-1.5 focus:border-primary outline-none text-gray-700"/>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block"/>
          <button onClick={() => fetchReport(activeReport)} className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 text-primary px-4 py-1.5 rounded-lg text-sm font-medium transition-colors border border-primary/20">
            <Filter size={14}/><span>Apply Filters</span>
          </button>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => handleExport('csv')}
            disabled={exportingCsv}
            className="flex items-center space-x-2 bg-white border border-border px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium disabled:opacity-50"
          >
            <Download size={16}/><span>{exportingCsv ? 'Saving...' : 'Export CSV'}</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exportingPdf}
            className="flex items-center space-x-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition-colors shadow-sm text-sm font-medium disabled:opacity-50"
          >
            <FileText size={16}/><span>{exportingPdf ? 'Exporting...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {REPORT_TYPES.map(rt => {
          const Icon = rt.icon;
          const isActive = activeReport === rt.id;
          return (
            <button
              key={rt.id}
              onClick={() => setActiveReport(rt.id)}
              className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${isActive ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-border bg-white hover:border-gray-300 hover:shadow-lg'}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                <Icon size={24} />
              </div>
              <p className={`font-bold text-base ${isActive ? 'text-primary' : 'text-gray-900 font-semibold'}`}>{rt.label}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{rt.description}</p>
              {isActive && (
                <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full animate-pulse"/>
              )}
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center space-x-4">
            <div className={`p-2.5 rounded-lg ${currentType?.color?.replace('text-', 'bg-')?.replace('-600', '-100')} ${currentType?.color}`}>
              {currentType && <currentType.icon size={22}/>}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg leading-tight">{currentType?.label}</h2>
              <p className="text-xs text-gray-500 mt-0.5">Showing records from {startDate} to {endDate}</p>
            </div>
          </div>
          <button onClick={() => fetchReport(activeReport)} disabled={loading} className="p-2 text-gray-400 hover:text-primary transition-colors disabled:opacity-50 hover:bg-white rounded-lg border border-transparent hover:border-border shadow-none hover:shadow-sm">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''}/>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-500 font-medium">Generating report for you...</p>
              <p className="text-xs text-gray-400 mt-1 italic">This may take a few seconds for large datasets</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
              {/* Chart Column */}
              <div className="xl:col-span-3">
                <div className="bg-gray-50/50 rounded-2xl p-4 border border-border/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest flex items-center space-x-2">
                       <TrendingUp size={14}/><span>Trend Visualization</span>
                    </h3>
                  </div>
                  {activeReport !== 'overdue-customers' ? renderChart() : (
                    <div className="h-80 flex flex-col items-center justify-center text-gray-400">
                      <Users size={64} className="opacity-20 mb-4"/>
                      <p className="text-sm font-medium">Overdue accounts are strictly list-based</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Data Table Column */}
              <div className="xl:col-span-2">
                <div className="border border-border rounded-2xl overflow-hidden h-full flex flex-col">
                  <div className="p-4 bg-gray-50 border-b border-border shrink-0">
                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest flex items-center space-x-2">
                      <FileText size={14}/><span>Detailed Breakdown</span>
                    </h3>
                  </div>
                  <div className="overflow-y-auto max-h-[460px] flex-1 custom-scrollbar">
                    {renderTable()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audit Note */}
      <div className="text-center">
        <p className="text-xs text-gray-400 flex items-center justify-center space-x-2">
          <ShieldAlert size={12}/>
          <span>System generated reports — Confidential & For Internal Use Only</span>
        </p>
      </div>
    </div>
  );
}

import { ShieldAlert } from 'lucide-react';
