import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import AdminLayout from './layouts/AdminLayout';
import CustomerLayout from './layouts/CustomerLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import Users from './pages/admin/Users';
import Customers from './pages/admin/Customers';
import CustomerDetails from './pages/admin/CustomerDetails';
import Connections from './pages/admin/Connections';
import Meters from './pages/admin/Meters';
import Consumption from './pages/admin/Consumption';
import ConsumptionDetails from './pages/admin/ConsumptionDetails';
import Tariffs from './pages/admin/Tariffs';
import Bills from './pages/admin/Bills';
import BillDetails from './pages/admin/BillDetails';
import Penalties from './pages/admin/Penalties';
import Payments from './pages/admin/Payments';
import PaymentDetails from './pages/admin/PaymentDetails';
import Receipts from './pages/admin/Receipts';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFeedback from './pages/admin/AdminFeedback';
import Reports from './pages/admin/Reports';
import AuditLogs from './pages/admin/AuditLogs';
import Settings from './pages/admin/Settings';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerNotifications from './pages/customer/CustomerNotifications';
import CustomerFeedback from './pages/customer/CustomerFeedback';

import CustomerConsumption from './pages/customer/CustomerConsumption';
import CustomerBills from './pages/customer/CustomerBills';
import MakePayment from './pages/customer/MakePayment';
import CustomerPaymentHistory from './pages/customer/CustomerPaymentHistory';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Customer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Customer']} />}>
            <Route path="/customer" element={<CustomerLayout />}>
              <Route index element={<CustomerDashboard />} />
              <Route path="notifications" element={<CustomerNotifications />} />
              <Route path="feedback" element={<CustomerFeedback />} />
              <Route path="consumption" element={<CustomerConsumption />} />
              <Route path="bills" element={<CustomerBills />} />
              <Route path="pay" element={<MakePayment />} />
              <Route path="payments" element={<CustomerPaymentHistory />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Super Admin', 'Billing Officer', 'Finance Officer']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="feedback" element={<AdminFeedback />} />
            <Route path="reports" element={<Reports />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="settings" element={<Settings />} />              <Route path="customers" element={<Customers />} />
              <Route path="customers/:id" element={<CustomerDetails />} />
              <Route path="connections" element={<Connections />} />
              <Route path="meters" element={<Meters />} />
              <Route path="consumption" element={<Consumption />} />
              <Route path="consumption/:id" element={<ConsumptionDetails />} />
              <Route path="tariffs" element={<Tariffs />} />
              <Route path="bills" element={<Bills />} />
              <Route path="bills/:id" element={<BillDetails />} />
              <Route path="penalties" element={<Penalties />} />
              <Route path="payments" element={<Payments />} />
              <Route path="payments/:id" element={<PaymentDetails />} />
              <Route path="receipts" element={<Receipts />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
