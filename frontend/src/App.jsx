import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PortalLayout from './layouts/PortalLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StaffDashboard from './pages/staff/Dashboard';
import Customers from './pages/manager/Customers';
import Reports from './pages/manager/Reports';
import Notifications from './pages/manager/Notifications';
import Tariffs from './pages/manager/Tariffs';
import Consumption from './pages/staff/Consumption';
import Bills from './pages/staff/Bills';
import Payments from './pages/staff/Payments';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerBills from './pages/customer/CustomerBills';
import MakePayment from './pages/customer/MakePayment';
import CustomerPaymentHistory from './pages/customer/CustomerPaymentHistory';
import CustomerNotifications from './pages/customer/CustomerNotifications';
import CustomerProfile from './pages/customer/CustomerProfile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<ProtectedRoute allowedRoles={['Branch Manager']} />}>
            <Route path="/manager" element={<PortalLayout />}>
              <Route index element={<StaffDashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="consumption" element={<Consumption />} />
              <Route path="bills" element={<Bills />} />
              <Route path="payments" element={<Payments />} />
              <Route path="reports" element={<Reports />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="tariffs" element={<Tariffs />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Billing Staff']} />}>
            <Route path="/staff" element={<PortalLayout />}>
              <Route index element={<StaffDashboard />} />
              <Route path="consumption" element={<Consumption />} />
              <Route path="bills" element={<Bills />} />
              <Route path="payments" element={<Payments />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Customer']} />}>
            <Route path="/customer" element={<PortalLayout />}>
              <Route index element={<CustomerDashboard />} />
              <Route path="profile" element={<CustomerProfile />} />
              <Route path="bills" element={<CustomerBills />} />
              <Route path="pay" element={<MakePayment />} />
              <Route path="payments" element={<CustomerPaymentHistory />} />
              <Route path="notifications" element={<CustomerNotifications />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
