import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import SectionCard from '../../components/SectionCard';

export default function CustomerNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    axiosInstance.get('/notifications').then(response => setNotifications(response.data.data));
  }, []);

  return (
    <SectionCard title="Notifications" subtitle="Bill generation, payment confirmation and overdue alerts">
      <div className="space-y-3">
        {notifications.map(item => (
          <div key={item.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-slate-900">{item.title}</p>
              <span className="capitalize text-slate-500">{item.channel.replace('_', ' ')}</span>
            </div>
            <p className="mt-2 text-slate-600">{item.message}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
