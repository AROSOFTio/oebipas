import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { MessageSquare, Check, Clock } from 'lucide-react';

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [statusMap, setStatusMap] = useState({});

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await axiosInstance.get('/feedback');
      setFeedbacks(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (id, currentStatus) => {
    const newStatus = statusMap[id] || currentStatus;
    if (newStatus === currentStatus) return; // No change
    
    try {
      await axiosInstance.patch(`/feedback/${id}/status`, { status: newStatus });
      fetchFeedback(); // refresh
      setSelectedId(null);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'new': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">NEW</span>;
      case 'in_progress': return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-semibold">IN PROGRESS</span>;
      case 'resolved': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">RESOLVED</span>;
      case 'closed': return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">CLOSED</span>;
      default: return null;
    }
  };

  if (loading) return <div className="p-6">Loading tickets...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center"><MessageSquare className="mr-2 text-primary"/> Feedback & Support Review</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and update customer submitted tickets</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-border text-gray-500 text-sm">
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Subject / Message</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Update Status</th>
            </tr>
          </thead>
          <tbody>
             {feedbacks.map(f => (
                <tr key={f.id} className="border-b border-border hover:bg-gray-50 transition-colors text-sm">
                  <td className="p-4 align-top">
                    <span className="font-semibold text-gray-900">{f.customer_name}</span><br/>
                    <span className="text-xs text-gray-500">{f.customer_number}</span>
                  </td>
                  <td className="p-4 max-w-md align-top">
                    <span className="font-bold text-gray-800 block mb-1">{f.subject}</span>
                    <p className="text-gray-600 line-clamp-2">{f.message}</p>
                  </td>
                  <td className="p-4 text-gray-500 align-top">{new Date(f.created_at).toLocaleDateString()}</td>
                  <td className="p-4 align-top">{getStatusBadge(f.status)}</td>
                  <td className="p-4 align-top">
                    {f.status !== 'closed' && f.status !== 'resolved' ? (
                       <div className="flex space-x-2">
                         <select 
                           value={statusMap[f.id] || f.status} 
                           onChange={(e) => setStatusMap({...statusMap, [f.id]: e.target.value})}
                           className="border border-border rounded px-2 py-1 text-xs outline-none"
                         >
                           <option value="new">New</option>
                           <option value="in_progress">In Progress</option>
                           <option value="resolved">Resolved</option>
                         </select>
                         <button 
                           onClick={() => handleStatusUpdate(f.id, f.status)}
                           className="bg-primary text-white p-1.5 rounded hover:bg-primary-dark transition-colors"
                           title="Save Status"
                         >
                           <Check size={14}/>
                         </button>
                       </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Ticket Finished</span>
                    )}
                  </td>
                </tr>
             ))}
             {feedbacks.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500">No support tickets found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
