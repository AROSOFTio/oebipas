import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { Plus, Eye, Calendar } from 'lucide-react';

export default function Consumption() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await axiosInstance.get('/consumption');
      setRecords(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading consumption records...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Meter Readings & Consumption</h1>
        <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          <Plus size={18} />
          <span>Log Reading</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border text-gray-500 text-sm">
              <th className="p-4 font-medium">Meter #</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Billing Period</th>
              <th className="p-4 font-medium">Units (kWh)</th>
              <th className="p-4 font-medium">Reading Date</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-sidebar">{r.meter_number}</td>
                <td className="p-4 text-gray-900 text-sm">
                  {r.customer_name} <br/><span className="text-xs text-gray-500">{r.customer_number}</span>
                </td>
                <td className="p-4 text-gray-600 flex items-center space-x-2">
                  <Calendar size={14}/>
                  <span>{`${r.billing_month}/${r.billing_year}`}</span>
                </td>
                <td className="p-4 font-bold text-primary">{Number(r.units_consumed).toFixed(2)}</td>
                <td className="p-4 text-gray-500 text-sm">{new Date(r.reading_date).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <Link 
                    to={`/admin/consumption/${r.id}`}
                    className="inline-flex items-center text-primary hover:text-primary-dark font-medium text-sm"
                  >
                    <Eye size={16} className="mr-1"/> Details
                  </Link>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">No consumption records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
