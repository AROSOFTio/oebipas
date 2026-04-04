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

import CustomerConsumption from './pages/customer/CustomerConsumption';
import CustomerBills from './pages/customer/CustomerBills';

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
              <Route index element={<div className="p-6 text-xl font-medium text-gray-700">Customer Dashboard Placeholder</div>} />
              <Route path="consumption" element={<CustomerConsumption />} />
              <Route path="bills" element={<CustomerBills />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Super Admin', 'Billing Officer', 'Finance Officer']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<div className="p-6 text-xl font-medium text-gray-700">Admin Dashboard Placeholder</div>} />
              <Route path="users" element={<Users />} />
              <Route path="customers" element={<Customers />} />
              <Route path="customers/:id" element={<CustomerDetails />} />
              <Route path="connections" element={<Connections />} />
              <Route path="meters" element={<Meters />} />
              <Route path="consumption" element={<Consumption />} />
              <Route path="consumption/:id" element={<ConsumptionDetails />} />
              <Route path="tariffs" element={<Tariffs />} />
              <Route path="bills" element={<Bills />} />
              <Route path="bills/:id" element={<BillDetails />} />
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
