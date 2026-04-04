import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Plus, Activity, AlertCircle } from 'lucide-react';

export default function Meters() {
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeters();
  }, []);

  const fetchMeters = async () => {
    try {
      const res = await axiosInstance.get('/meters');
      setMeters(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'active') return <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">ACTIVE</span>;
    if (status === 'faulty') return <span className="bg-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-full font-medium flex inline-flex items-center space-x-1"><AlertCircle size={12}/><span>FAULTY</span></span>;
    return <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">INACTIVE</span>;
  };

  if (loading) return <div className="p-6">Loading meters...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Meters Hardware</h1>
        <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          <Plus size={18} />
          <span>Register Meter</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border text-gray-500 text-sm">
              <th className="p-4 font-medium">Meter #</th>
              <th className="p-4 font-medium">Connection #</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Installed</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {meters.map((m) => (
              <tr key={m.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-sidebar flex items-center space-x-2">
                  <Activity size={16} className="text-blue-500"/>
                  <span>{m.meter_number}</span>
                </td>
                <td className="p-4 text-gray-700">{m.connection_number}</td>
                <td className="p-4 text-gray-900 text-sm">
                  {m.customer_name}
                </td>
                <td className="p-4 text-gray-500 text-sm">{new Date(m.installation_date).toLocaleDateString()}</td>
                <td className="p-4">
                  {getStatusBadge(m.status)}
                </td>
              </tr>
            ))}
            {meters.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">No meters found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
