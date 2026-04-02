import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import PublicLayout from '../components/layout/PublicLayout';
import ProtectedRoute from './ProtectedRoute';
import HomePage from '../pages/public/HomePage';
import AboutPage from '../pages/public/AboutPage';
import ContactPage from '../pages/public/ContactPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import NotFoundPage from '../pages/public/NotFoundPage';
import CustomerDashboardPage from '../pages/customer/DashboardPage';
import CustomerProfilePage from '../pages/customer/ProfilePage';
import CustomerMeterDetailsPage from '../pages/customer/MeterDetailsPage';
import CustomerBillsPage from '../pages/customer/BillsPage';
import CustomerBillDetailsPage from '../pages/customer/BillDetailsPage';
import CustomerPaymentsPage from '../pages/customer/PaymentsPage';
import CustomerReceiptsPage from '../pages/customer/ReceiptsPage';
import CustomerNotificationsPage from '../pages/customer/NotificationsPage';
import CustomerComplaintsPage from '../pages/customer/ComplaintsPage';
import BillingDashboardPage from '../pages/billingOfficer/DashboardPage';
import CustomersPage from '../pages/billingOfficer/CustomersPage';
import AddCustomerPage from '../pages/billingOfficer/AddCustomerPage';
import MetersPage from '../pages/billingOfficer/MetersPage';
import AddMeterPage from '../pages/billingOfficer/AddMeterPage';
import MeterReadingsPage from '../pages/billingOfficer/MeterReadingsPage';
import GenerateBillsPage from '../pages/billingOfficer/GenerateBillsPage';
import BillingBillsPage from '../pages/billingOfficer/BillsPage';
import BillingPaymentsPage from '../pages/billingOfficer/PaymentsPage';
import HelpdeskDashboardPage from '../pages/helpdesk/DashboardPage';
import ComplaintsListPage from '../pages/helpdesk/ComplaintsListPage';
import ComplaintDetailsPage from '../pages/helpdesk/ComplaintDetailsPage';
import ResolvedComplaintsPage from '../pages/helpdesk/ResolvedComplaintsPage';
import AdminDashboardPage from '../pages/admin/DashboardPage';
import UsersPage from '../pages/admin/UsersPage';
import AddUserPage from '../pages/admin/AddUserPage';
import TariffsPage from '../pages/admin/TariffsPage';
import SmsSettingsPage from '../pages/admin/SmsSettingsPage';
import ReportsPage from '../pages/admin/ReportsPage';
import SettingsPage from '../pages/admin/SettingsPage';
import ReportBuilderPage from '../pages/common/ReportBuilderPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={['customer']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="customer/dashboard" element={<CustomerDashboardPage />} />
          <Route path="customer/profile" element={<CustomerProfilePage />} />
          <Route path="customer/meter-details" element={<CustomerMeterDetailsPage />} />
          <Route path="customer/bills" element={<CustomerBillsPage />} />
          <Route path="customer/bills/:billId" element={<CustomerBillDetailsPage />} />
          <Route path="customer/payments" element={<CustomerPaymentsPage />} />
          <Route path="customer/receipts" element={<CustomerReceiptsPage />} />
          <Route path="customer/notifications" element={<CustomerNotificationsPage />} />
          <Route path="customer/complaints" element={<CustomerComplaintsPage />} />
          <Route path="customer/reports-builder" element={<ReportBuilderPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['billing_officer']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="billing/dashboard" element={<BillingDashboardPage />} />
          <Route path="billing/customers" element={<CustomersPage />} />
          <Route path="billing/customers/new" element={<AddCustomerPage />} />
          <Route path="billing/meters" element={<MetersPage />} />
          <Route path="billing/meters/new" element={<AddMeterPage />} />
          <Route path="billing/meter-readings" element={<MeterReadingsPage />} />
          <Route path="billing/generate-bills" element={<GenerateBillsPage />} />
          <Route path="billing/bills" element={<BillingBillsPage />} />
          <Route path="billing/payments" element={<BillingPaymentsPage />} />
          <Route path="billing/reports-builder" element={<ReportBuilderPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['helpdesk_officer']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="helpdesk/dashboard" element={<HelpdeskDashboardPage />} />
          <Route path="helpdesk/complaints" element={<ComplaintsListPage />} />
          <Route path="helpdesk/complaints/:complaintId" element={<ComplaintDetailsPage />} />
          <Route path="helpdesk/resolved" element={<ResolvedComplaintsPage />} />
          <Route path="helpdesk/reports-builder" element={<ReportBuilderPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['administrator']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="admin/users" element={<UsersPage />} />
          <Route path="admin/users/new" element={<AddUserPage />} />
          <Route path="admin/tariffs" element={<TariffsPage />} />
          <Route path="admin/sms-settings" element={<SmsSettingsPage />} />
          <Route path="admin/reports" element={<ReportsPage />} />
          <Route path="admin/reports-builder" element={<ReportBuilderPage />} />
          <Route path="admin/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="app" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
