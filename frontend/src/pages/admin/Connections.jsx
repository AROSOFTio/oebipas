import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Plus, Zap, MapPin } from 'lucide-react';

export default function Connections() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const res = await axiosInstance.get('/service-connections');
      setConnections(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading connections...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Service Connections</h1>
        <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          <Plus size={18} />
          <span>New Connection</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border text-gray-500 text-sm">
              <th className="p-4 font-medium">Conn #</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Location</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {connections.map((c) => (
              <tr key={c.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-sidebar flex items-center space-x-2">
                  <Zap size={16} className="text-yellow-500"/>
                  <span>{c.connection_number}</span>
                </td>
                <td className="p-4 text-gray-900">
                  {c.customer_name} <span className="text-xs text-gray-400 block">{c.customer_number}</span>
                </td>
                <td className="p-4 text-gray-500">{c.connection_type}</td>
                <td className="p-4 text-gray-500 flex items-center space-x-1">
                  <MapPin size={14}/><span>{c.location || 'N/A'}</span>
                </td>
                <td className="p-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {c.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
            {connections.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">No service connections found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
