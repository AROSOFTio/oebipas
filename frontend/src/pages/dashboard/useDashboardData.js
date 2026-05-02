import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { subscribeToPaymentSync } from '../../utils/paymentSync';

export default function useDashboardData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      const response = await axiosInstance.get('/dashboard');
      setData(response.data.data);
    };

    loadDashboard();
    return subscribeToPaymentSync(loadDashboard);
  }, []);

  return data;
}
