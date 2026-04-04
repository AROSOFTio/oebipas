import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';
import { Bell, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CustomerNotifications() {
  const [customerId, setCustomerId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profileRes = await axiosInstance.get('/customers/my-profile');
      const cid = profileRes.data.data.id;
      setCustomerId(cid);
      fetchNotifications(cid);
    } catch (err) { console.error(err); setLoading(false); }
  };

  const fetchNotifications = async (cid) => {
    try {
      const res = await axiosInstance.get(`/notifications?customer_id=${cid}`);
      setNotifications(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleMarkAllRead = async () => {
    if (!customerId) return;
    try {
      setMarking(true);
      await axiosInstance.post('/notifications/mark-read', { customer_id: customerId });
      fetchNotifications(customerId);
    } catch (err) {
      alert('Failed to mark as read');
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <div className="p-6">Loading notifications...</div>;

  const unreadCount = notifications.filter(n => n.status === 'pending').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center"><Bell className="mr-2 text-primary"/> Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">You have {unreadCount} unread alerts</p>
        </div>
        {unreadCount > 0 && (
          <button 
            disabled={marking}
            onClick={handleMarkAllRead} 
            className="flex items-center space-x-2 bg-blue-50 text-primary px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 font-medium text-sm"
          >
            <CheckCircle2 size={18}/><span>Mark all as read</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.map(n => (
          <div key={n.id} className={`p-5 rounded-xl border flex items-start space-x-4 transition-colors ${n.status === 'pending' ? 'bg-blue-50 border-blue-100' : 'bg-white border-border'}`}>
            {n.type === 'overdue_alert' ? <AlertCircle className="text-red-500 mt-1 flex-shrink-0" size={24}/> : <Bell className={`mt-1 flex-shrink-0 ${n.status === 'pending' ? 'text-primary' : 'text-gray-400'}`} size={24}/> }
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className={`font-semibold ${n.status === 'pending' ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</h3>
                <span className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</span>
              </div>
              <p className={`text-sm mt-1 ${n.status === 'pending' ? 'text-gray-700' : 'text-gray-500'}`}>{n.message}</p>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="bg-white p-8 rounded-xl border border-border text-center text-gray-500 shadow-sm">
             You have no notifications yet.
          </div>
        )}
      </div>
    </div>
  );
}
