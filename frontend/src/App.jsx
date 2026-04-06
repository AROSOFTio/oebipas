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
import GlobalSearch from './pages/admin/GlobalSearch';
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
          <Route element={<ProtectedRoute allowedRoles={['General Manager', 'Branch Manager', 'Finance Officer', 'IT Officer', 'Operation Officer', 'Field Officer', 'Help Desk']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="search" element={<GlobalSearch />} />
              <Route path="feedback" element={<AdminFeedback />} />
              
              {/* Field Operations */}
              <Route path="customers" element={<ProtectedRoute allowedRoles={['General Manager', 'Branch Manager', 'Operation Officer', 'Field Officer']}><Customers /></ProtectedRoute>} />
              <Route path="customers/:id" element={<ProtectedRoute allowedRoles={['General Manager', 'Branch Manager', 'Operation Officer', 'Field Officer']}><CustomerDetails /></ProtectedRoute>} />
              <Route path="connections" element={<ProtectedRoute allowedRoles={['General Manager', 'Branch Manager', 'Operation Officer', 'Field Officer']}><Connections /></ProtectedRoute>} />
              <Route path="meters" element={<ProtectedRoute allowedRoles={['General Manager', 'Branch Manager', 'Operation Officer', 'Field Officer']}><Meters /></ProtectedRoute>} />
              <Route path="consumption" element={<ProtectedRoute allowedRoles={['General Manager', 'Branch Manager', 'Operation Officer', 'Field Officer']}><Consumption /></ProtectedRoute>} />
              <Route path="consumption/:id" element={<ProtectedRoute allowedRoles={['General Manager', 'Branch Manager', 'Operation Officer', 'Field Officer']}><ConsumptionDetails /></ProtectedRoute>} />

              {/* Financial Engine */}
              <Route path="tariffs" element={<ProtectedRoute allowedRoles={['General Manager', 'Branch Manager', 'Finance Officer', 'Operation Officer']}><Tariffs /></ProtectedRoute>} />
              <Route path="bills" element={<ProtectedRoute allowedRoles={['General Manager', 'Branch Manager', 'Finance Officer', 'Operation Officer']}><Bills /></ProtectedRoute>} />
              <Route path="bills/:id" element={<ProtectedRoute allowedRoles={['General Manager', 'Branch Manager', 'Finance Officer', 'Operation Officer']}><BillDetails /></ProtectedRoute>} />
              <Route path="penalties" element={<ProtectedRoute allowedRoles={['General Manager', 'Branch Manager', 'Finance Officer', 'Operation Officer']}><Penalties /></ProtectedRoute>} />
              
              <Route path="payments" element={<ProtectedRoute allowedRoles={['General Manager', 'Branch Manager', 'Finance Officer']}><Payments /></ProtectedRoute>} />
              <Route path="payments/:id" element={<ProtectedRoute allowedRoles={['General Manager', 'Branch Manager', 'Finance Officer']}><PaymentDetails /></ProtectedRoute>} />
              <Route path="receipts" element={<ProtectedRoute allowedRoles={['General Manager', 'Branch Manager', 'Finance Officer']}><Receipts /></ProtectedRoute>} />
              
              {/* Analytics & Support */}
              <Route path="reports" element={<ProtectedRoute allowedRoles={['General Manager', 'Branch Manager', 'Finance Officer']}><Reports /></ProtectedRoute>} />
              
              {/* Administration */}
              <Route path="users" element={<ProtectedRoute allowedRoles={['General Manager', 'IT Officer']}><Users /></ProtectedRoute>} />
              <Route path="audit-logs" element={<ProtectedRoute allowedRoles={['General Manager', 'IT Officer']}><AuditLogs /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute allowedRoles={['General Manager', 'IT Officer']}><Settings /></ProtectedRoute>} />
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
