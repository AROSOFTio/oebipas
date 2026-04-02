export const APP_TITLE = 'Online Electricity Billing and Payment System for UEDCL';
export const APP_BRAND = 'UEDCL Service Portal';
export const APP_TAGLINE = 'Electricity billing, metering, payments, receipts, and customer service operations.';

export const roleLabels = {
  customer: 'Customer',
  billing_officer: 'Billing Officer',
  helpdesk_officer: 'Helpdesk Officer',
  administrator: 'Administrator',
};

export const homePathByRole = {
  customer: '/customer/dashboard',
  billing_officer: '/billing/dashboard',
  helpdesk_officer: '/helpdesk/dashboard',
  administrator: '/admin/dashboard',
};

export const demoCredentials = [
  {
    name: 'Admin User',
    email: 'admin@uedcl.local',
    password: 'password123',
    role: 'administrator',
  },
  {
    name: 'Billing Officer',
    email: 'billing@uedcl.local',
    password: 'password123',
    role: 'billing_officer',
  },
  {
    name: 'Helpdesk Officer',
    email: 'helpdesk@uedcl.local',
    password: 'password123',
    role: 'helpdesk_officer',
  },
  {
    name: 'Grace Nansubuga',
    email: 'customer@uedcl.local',
    password: 'password123',
    role: 'customer',
  },
];

export const navigationByRole = {
  customer: [
    { label: 'Dashboard', path: '/customer/dashboard', icon: 'dashboard' },
    { label: 'Profile', path: '/customer/profile', icon: 'profile' },
    { label: 'Meter Details', path: '/customer/meter-details', icon: 'meter' },
    { label: 'My Bills', path: '/customer/bills', icon: 'bills' },
    { label: 'Payments', path: '/customer/payments', icon: 'payments' },
    { label: 'Receipts', path: '/customer/receipts', icon: 'receipts' },
    { label: 'Notifications', path: '/customer/notifications', icon: 'notifications' },
    { label: 'Complaints', path: '/customer/complaints', icon: 'complaints' },
    {
      label: 'Reports',
      icon: 'reports',
      children: [
        { label: 'Billing History', path: '/customer/reports-builder?type=billing_history' },
        { label: 'Payment Ledger', path: '/customer/reports-builder?type=payment_history' },
        { label: 'Complaint Log', path: '/customer/reports-builder?type=complaint_log' },
      ],
    },
  ],
  billing_officer: [
    { label: 'Dashboard', path: '/billing/dashboard', icon: 'dashboard' },
    { label: 'Customers', path: '/billing/customers', icon: 'customers' },
    { label: 'Add Customer', path: '/billing/customers/new', icon: 'add-customer' },
    { label: 'Meters', path: '/billing/meters', icon: 'meter' },
    { label: 'Add Meter', path: '/billing/meters/new', icon: 'add-meter' },
    { label: 'Meter Readings', path: '/billing/meter-readings', icon: 'readings' },
    { label: 'Generate Bills', path: '/billing/generate-bills', icon: 'generate' },
    { label: 'Bills', path: '/billing/bills', icon: 'bills' },
    { label: 'Payments', path: '/billing/payments', icon: 'payments' },
    {
      label: 'Reports',
      icon: 'reports',
      children: [
        { label: 'Billing Run History', path: '/billing/reports-builder?type=billing_history' },
        { label: 'Collections Ledger', path: '/billing/reports-builder?type=payment_history' },
      ],
    },
  ],
  helpdesk_officer: [
    { label: 'Dashboard', path: '/helpdesk/dashboard', icon: 'dashboard' },
    { label: 'Complaints List', path: '/helpdesk/complaints', icon: 'complaints' },
    { label: 'Resolved Complaints', path: '/helpdesk/resolved', icon: 'resolved' },
    {
      label: 'Reports',
      icon: 'reports',
      children: [
        { label: 'Service Complaint Log', path: '/helpdesk/reports-builder?type=complaint_log' },
      ],
    },
  ],
  administrator: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Users', path: '/admin/users', icon: 'users' },
    { label: 'Add User', path: '/admin/users/new', icon: 'add-user' },
    { label: 'Tariffs', path: '/admin/tariffs', icon: 'tariffs' },
    { label: 'SMS Settings', path: '/admin/sms-settings', icon: 'sms' },
    { label: 'Executive Reports', path: '/admin/reports', icon: 'dashboard' },
    {
      label: 'Reports',
      icon: 'reports',
      children: [
        { label: 'Revenue Summary', path: '/admin/reports-builder?type=revenue_summary' },
        { label: 'Billing History', path: '/admin/reports-builder?type=billing_history' },
        { label: 'Payment Ledger', path: '/admin/reports-builder?type=payment_history' },
        { label: 'Complaint Log', path: '/admin/reports-builder?type=complaint_log' },
      ],
    },
    { label: 'Settings', path: '/admin/settings', icon: 'settings' },
  ],
};

export const complaintCategories = [
  { label: 'Billing', value: 'billing' },
  { label: 'Meter', value: 'meter' },
  { label: 'Outage', value: 'outage' },
  { label: 'Payment', value: 'payment' },
  { label: 'Service', value: 'service' },
  { label: 'Other', value: 'other' },
];

export const paymentMethods = [
  { label: 'Cash', value: 'cash' },
  { label: 'Mobile Money', value: 'mobile_money' },
  { label: 'Bank', value: 'bank' },
];

export const billStatuses = ['unpaid', 'paid', 'overdue', 'partially_paid'];
export const customerStatuses = ['active', 'inactive', 'pending'];
export const meterStatuses = ['active', 'inactive', 'faulty'];
export const complaintStatuses = ['pending', 'in_progress', 'resolved'];
export const userStatuses = ['active', 'inactive'];
export const tariffStatuses = ['active', 'inactive'];