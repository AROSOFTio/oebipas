import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { History, ShieldAlert, ArrowRight } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axiosInstance.get('/audit-logs');
        setLogs(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="p-6">Loading audit logs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
          <History size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Audit Logs</h1>
          <p className="text-gray-500 text-sm">Review historical administrative and system actions</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-border text-gray-500 text-sm">
                <th className="p-4 font-medium">Timestamp</th>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Action</th>
                <th className="p-4 font-medium">Module / Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border hover:bg-gray-50">
                  <td className="p-4 text-gray-500 text-sm whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 font-medium text-gray-900 text-sm">
                    {log.user_name || 'System'} <br />
                    <span className="text-xs text-gray-400 font-normal">@{log.username || 'auto'}</span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                       <span className="font-bold text-sidebar text-sm">{log.module}</span>
                       <ArrowRight size={12} className="text-gray-400"/>
                       <span className="text-sm text-gray-600">{log.details}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">No logs generated yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
