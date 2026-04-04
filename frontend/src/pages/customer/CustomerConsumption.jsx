import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { Activity, Zap } from 'lucide-react';

export default function CustomerConsumption() {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Note: The `user.id` is the user ID, not the customer profile ID directly.
    // In our architecture, the backend endpoint can look up the customer_id based on req.user.id via DB join if needed.
    // For Phase 3, we'll pass user.id to the route, and the backend routes might need tweaking if customer_id diverges.
    // However, given our schema, users(customer) map 1:1, so we'll simulate fetching for the current user ID.
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    try {
      // In reality, we'd fetch the specific customer's ID tied to this logged-in auth user.
      const res = await axiosInstance.get(`/consumption/customer/${user.id}`);
      setRecords(res.data.data || []);
    } catch (err) {
      console.error(err);
      // Fallback empty array if the user doesn't have a linked customer profile yet.
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading your usage history...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
          <Zap size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Electricity Usage</h1>
          <p className="text-gray-500 text-sm">Track your historical meter readings and consumption</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border text-gray-500 text-sm">
              <th className="p-4 font-medium">Billing Period</th>
              <th className="p-4 font-medium">Meter Number</th>
              <th className="p-4 font-medium">Units (kWh)</th>
              <th className="p-4 font-medium">Reading Date</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900">{`${r.billing_month}/${r.billing_year}`}</td>
                <td className="p-4 text-gray-600 flex items-center space-x-2">
                  <Activity size={14} className="text-blue-500"/>
                  <span>{r.meter_number}</span>
                </td>
                <td className="p-4 font-bold text-primary">{Number(r.units_consumed).toFixed(2)}</td>
                <td className="p-4 text-gray-500 text-sm">{new Date(r.reading_date).toLocaleDateString()}</td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan="4" className="p-12 text-center">
                  <div className="inline-flex flex-col items-center justify-center text-gray-400">
                    <Activity size={48} className="mb-4 opacity-50" />
                    <p className="text-lg font-medium text-gray-500">No consumption records found.</p>
                    <p className="text-sm mt-1">Check back after your first meter reading.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
