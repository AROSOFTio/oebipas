-- SQL dump for OEBIPAS (Online Electricity Billing and Payment System)
-- Creates database, tables and seed data

CREATE DATABASE IF NOT EXISTS oebipas;
USE oebipas;

-- --------------------------------------------------------
-- Table: roles
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255)
);

-- --------------------------------------------------------
-- Table: users
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: user_roles
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT,
  role_id INT,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Table: customers
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  customer_number VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  category ENUM('residential', 'commercial', 'industrial') DEFAULT 'residential',
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- --------------------------------------------------------
-- Table: service_connections
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_connections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  connection_number VARCHAR(50) UNIQUE NOT NULL,
  connection_type VARCHAR(50),
  location TEXT,
  status ENUM('active', 'inactive', 'disconnected') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Table: meters
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS meters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  service_connection_id INT NOT NULL,
  meter_number VARCHAR(50) UNIQUE NOT NULL,
  installation_date DATE,
  status ENUM('active', 'faulty', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (service_connection_id) REFERENCES service_connections(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Table: consumption_records
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS consumption_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  meter_id INT NOT NULL,
  billing_month INT NOT NULL,
  billing_year INT NOT NULL,
  units_consumed DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  reading_date DATE NOT NULL,
  entered_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (meter_id) REFERENCES meters(id) ON DELETE CASCADE,
  FOREIGN KEY (entered_by) REFERENCES users(id) ON DELETE SET NULL
);

-- --------------------------------------------------------
-- Table: tariff_rules
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS tariff_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_category ENUM('residential', 'commercial', 'industrial') NOT NULL,
  rate_per_unit DECIMAL(10,2) NOT NULL,
  service_charge DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  penalty_type ENUM('fixed', 'percentage') DEFAULT 'percentage',
  penalty_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  effective_from DATE NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: bills
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS bills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bill_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INT NOT NULL,
  meter_id INT NOT NULL,
  billing_month INT NOT NULL,
  billing_year INT NOT NULL,
  units_consumed DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  energy_charge DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  service_charge DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  penalty_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  previous_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  balance_due DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  due_date DATE NOT NULL,
  status ENUM('unpaid', 'partially_paid', 'paid', 'overdue') DEFAULT 'unpaid',
  generated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (meter_id) REFERENCES meters(id) ON DELETE CASCADE,
  FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- --------------------------------------------------------
-- Table: bill_items
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS bill_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bill_id INT NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  item_type VARCHAR(50),
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Table: penalties
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS penalties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bill_id INT NOT NULL,
  customer_id INT NOT NULL,
  penalty_type VARCHAR(50),
  penalty_amount DECIMAL(10,2) NOT NULL,
  reason VARCHAR(255),
  applied_date DATE NOT NULL,
  status ENUM('active', 'waived', 'paid') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Table: payments
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_reference VARCHAR(50) UNIQUE NOT NULL,
  customer_id INT NOT NULL,
  bill_id INT,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash', 'mobile_money', 'bank_transfer', 'card') NOT NULL,
  transaction_reference VARCHAR(100),
  status ENUM('pending', 'successful', 'failed', 'reversed') DEFAULT 'pending',
  payment_date DATETIME NOT NULL,
  recorded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE SET NULL,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- --------------------------------------------------------
-- Table: payment_reconciliations
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_reconciliations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id INT NOT NULL,
  bill_id INT NOT NULL,
  reconciled_amount DECIMAL(10,2) NOT NULL,
  reconciled_by INT,
  reconciled_at DATETIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
  FOREIGN KEY (reconciled_by) REFERENCES users(id) ON DELETE SET NULL
);

-- --------------------------------------------------------
-- Table: receipts
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS receipts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  payment_id INT NOT NULL,
  customer_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  issued_at DATETIME NOT NULL,
  issued_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL
);

-- --------------------------------------------------------
-- Table: notifications
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  type VARCHAR(50),
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  channel ENUM('email', 'sms', 'in-app') DEFAULT 'in-app',
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  sent_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Table: feedback
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  subject VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'in_progress', 'resolved', 'closed') DEFAULT 'new',
  admin_response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Table: audit_logs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(100) NOT NULL,
  entity_id INT,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- --------------------------------------------------------
-- Table: settings
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(100) UNIQUE NOT NULL,
  value_text TEXT,
  updated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ========================================================
-- SEED DATA
-- ========================================================

-- Insert Roles
INSERT INTO roles (name, description) VALUES 
('Super Admin', 'Full system access'),
('Billing Officer', 'Manage customers, usage, bills, penalties'),
('Finance Officer', 'Manage payments, reconciliation, receipts, reports'),
('Customer', 'Only own account access'),
('Viewer', 'Read-only access to reports and logs');

-- Insert Initial Admin User (password is 'password123' bcrypt hash unless specified)
INSERT INTO users (full_name, username, email, password, phone, status) VALUES 
('Winnie Nafuna', 'winnie', 'winnie@local', '$2b$10$wY.u9f/N4X7qLd/5h8Nn/OU8MvXNXY3Z/oXMyC0YVn4/2f8WkUfN.', '0700000000', 'active'),
('Benjamin Angella', 'Benjamin', 'benjamin@oebipas.local', '$2a$12$Ow4YSw3e52pdBG6cRg4uTeXFPAIEJVjRvbQXeTrTc/Qu3pKXIh58q', '0700000000', 'active'),
('System Admin', 'admin', 'admin@oebipas.local', '$2b$10$wY.u9f/N4X7qLd/5h8Nn/OU8MvXNXY3Z/oXMyC0YVn4/2f8WkUfN.', '0700000000', 'active'),
('Billing Staff', 'billing', 'billing@oebipas.local', '$2b$10$wY.u9f/N4X7qLd/5h8Nn/OU8MvXNXY3Z/oXMyC0YVn4/2f8WkUfN.', '0700000001', 'active'),
('Finance Staff', 'finance', 'finance@oebipas.local', '$2b$10$wY.u9f/N4X7qLd/5h8Nn/OU8MvXNXY3Z/oXMyC0YVn4/2f8WkUfN.', '0700000002', 'active');

-- Assign Roles
INSERT INTO user_roles (user_id, role_id) VALUES 
(1, 1), -- Winnie -> Super Admin
(2, 1), -- Benjamin -> Super Admin
(3, 1), -- System Admin -> Super Admin
(4, 2), -- Billing Staff -> Billing Officer
(5, 3); -- Finance Staff -> Finance Officer

-- Insert Basic Settings
INSERT INTO settings (key_name, value_text) VALUES 
('company_name', 'UEDCL Demo OEBIPAS'),
('currency', 'UGX'),
('tax_rate', '18'), -- 18% VAT
('default_due_days', '14');

-- Insert Sample Tariff Rules
INSERT INTO tariff_rules (customer_category, rate_per_unit, service_charge, tax_percent, penalty_type, penalty_value, effective_from) VALUES 
('residential', 250.00, 3000.00, 18.00, 'percentage', 5.00, '2025-01-01'),
('commercial', 450.00, 10000.00, 18.00, 'percentage', 5.00, '2025-01-01'),
('industrial', 350.00, 25000.00, 18.00, 'percentage', 5.00, '2025-01-01');

-- Sample Customers
INSERT INTO users (full_name, username, email, password, phone, status) VALUES 
('John Doe', 'johndoe', 'john@example.com', '$2b$10$wY.u9f/N4X7qLd/5h8Nn/OU8MvXNXY3Z/oXMyC0YVn4/2f8WkUfN.', '0701111111', 'active');

INSERT INTO user_roles (user_id, role_id) VALUES (6, 4); -- Customer role

INSERT INTO customers (user_id, customer_number, full_name, email, phone, address, category) VALUES 
(6, 'CUST-000001', 'John Doe', 'john@example.com', '0701111111', 'Plot 10, Kampala Road', 'residential');

-- Sample Connection & Meter
INSERT INTO service_connections (customer_id, connection_number, connection_type, location) VALUES 
(1, 'CONN-000001', 'Single Phase', 'Plot 10, Kampala Road');

INSERT INTO meters (customer_id, service_connection_id, meter_number, installation_date) VALUES 
(1, 1, 'MTR-12345678', '2025-01-15');

-- Sample Consumption Data
INSERT INTO consumption_records (customer_id, meter_id, billing_month, billing_year, units_consumed, reading_date, entered_by) VALUES 
(1, 1, 3, 2026, 120.50, '2026-03-31', 2);

-- Sample Bill
INSERT INTO bills (bill_number, customer_id, meter_id, billing_month, billing_year, units_consumed, energy_charge, service_charge, tax_amount, total_amount, balance_due, due_date, status, generated_by) VALUES 
('INV-202603-00001', 1, 1, 3, 2026, 120.50, 30125.00, 3000.00, 5962.50, 39087.50, 39087.50, '2026-04-14', 'unpaid', 2);
