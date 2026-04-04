import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';
import { Plus, Eye, CheckCircle, XCircle } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axiosInstance.get('/customers');
      setCustomers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await axiosInstance.patch(`/customers/${id}/status`, { status: newStatus });
      fetchCustomers(); // refresh
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="p-6">Loading customers...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          <Plus size={18} />
          <span>New Customer</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border text-gray-500 text-sm">
              <th className="p-4 font-medium">Customer #</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-border hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-sidebar">{c.customer_number}</td>
                <td className="p-4 text-gray-900">{c.full_name}</td>
                <td className="p-4 text-gray-500 capitalize">{c.category}</td>
                <td className="p-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex inline-flex items-center space-x-1 ${
                    c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {c.status === 'active' ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                    <span>{c.status.toUpperCase()}</span>
                  </span>
                </td>
                <td className="p-4 text-right space-x-3">
                  <button 
                    onClick={() => toggleStatus(c.id, c.status)}
                    className="text-sm text-gray-500 hover:text-gray-900 underline"
                  >
                    {c.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <Link 
                    to={`/admin/customers/${c.id}`}
                    className="inline-flex items-center text-primary hover:text-primary-dark font-medium"
                  >
                    <Eye size={18} className="mr-1"/> View
                  </Link>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
