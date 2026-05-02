import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import BillingDashboard from './BillingDashboard';
import CustomerDashboard from './CustomerDashboard';

export default function RoleDashboard() {
  const { role } = useContext(AuthContext);

  if (role === 'System administrators') return <AdminDashboard />;
  if (role === 'Billing officers') return <BillingDashboard />;
  if (role === 'Electricity consumers') return <CustomerDashboard />;

  return <CustomerDashboard />;
}
