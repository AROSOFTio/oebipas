import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Download, FileText, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

export default function Reports() {
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [monthlyBilling, setMonthlyBilling] = useState([]);
  const [outstanding, setOutstanding] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resRev, resBill, resOut] = await Promise.all([
        axiosInstance.get('/reports/daily-revenue'),
        axiosInstance.get('/reports/monthly-billing'),
        axiosInstance.get('/reports/outstanding-balances')
      ]);
      setDailyRevenue(resRev.data.data);
      setMonthlyBilling(resBill.data.data);
      setOutstanding(resOut.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      if (type === 'pdf') setExportingPdf(true);
      else setExportingCsv(true);

      const response = await axiosInstance.get(`/reports/export/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `oebipas_report.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed', error);
      alert('Export failed. Please try again.');
    } finally {
      setExportingPdf(false);
      setExportingCsv(false);
    }
  };

  if (loading) return <div className="p-6">Generating reports...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Reports & Analytics</h1>
          <p className="text-gray-500">Comprehensive overview of financial and operational metrics</p>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={() => handleExport('csv')}
            disabled={exportingCsv}
            className="flex items-center space-x-2 bg-white border border-border px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <Download size={18} />
            <span>{exportingCsv ? 'Exporting...' : 'Export CSV'}</span>
          </button>
          <button 
            onClick={() => handleExport('pdf')}
            disabled={exportingPdf}
            className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50"
          >
            <FileText size={18} />
            <span>{exportingPdf ? 'Exporting...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Daily Revenue (Last 30 Days)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{fontSize: 12}} tickMargin={10} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                <YAxis tick={{fontSize: 12}} tickFormatter={(val) => `UGX ${(val/1000)}k`} />
                <Tooltip formatter={(value) => [`UGX ${Number(value).toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="total_revenue" stroke="#2563EB" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Billing vs Collection */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Billed vs Collected</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBilling}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="period" tick={{fontSize: 12}} tickMargin={10}/>
                <YAxis tick={{fontSize: 12}} tickFormatter={(val) => `UGX ${(val/1000)}k`}/>
                <Tooltip formatter={(value) => [`UGX ${Number(value).toLocaleString()}`, 'Amount']} />
                <Bar dataKey="total_billed" name="Billed" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total_collected" name="Collected" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Outstanding Balances Table */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <AlertCircle size={20} className="text-red-500 mr-2"/> Top Outstanding Balances
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-border text-gray-500 text-sm">
                <th className="p-4 font-medium">Customer Name</th>
                <th className="p-4 font-medium">Customer Number</th>
                <th className="p-4 font-medium text-right">Total Due (UGX)</th>
              </tr>
            </thead>
            <tbody>
              {outstanding.map((row, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{row.customer_name}</td>
                  <td className="p-4 text-gray-500 text-sm">{row.customer_number}</td>
                  <td className="p-4 font-bold text-red-600 text-right">{Number(row.total_due).toLocaleString()}</td>
                </tr>
              ))}
              {outstanding.length === 0 && (
                <tr><td colSpan="3" className="p-8 text-center text-gray-500">No outstanding balances.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
