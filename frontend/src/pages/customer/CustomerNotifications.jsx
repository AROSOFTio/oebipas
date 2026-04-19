import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';
import { subscribeToPaymentSync } from '../../utils/paymentSync';

export default function CustomerNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = async () => {
      const response = await axiosInstance.get('/notifications');
      setNotifications(response.data.data);
    };

    loadNotifications();
    return subscribeToPaymentSync(loadNotifications);
  }, []);

  return (
    <SectionCard title="Notifications">
      <div className="space-y-3">
        {notifications.length === 0 && (
          <p className="text-sm text-slate-400">No notifications yet.</p>
        )}
        {notifications.map(item => (
          <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
            <div className="flex items-start justify-between gap-4">
              <p className="font-medium text-slate-900">{item.title}</p>
              <span className="shrink-0 text-xs text-slate-400">{item.created_at?.slice(0, 10)}</span>
            </div>
            <p className="mt-1.5 text-slate-600">{item.message}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
