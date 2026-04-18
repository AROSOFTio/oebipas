CREATE DATABASE IF NOT EXISTS oebipas;
USE oebipas;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS penalties;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS consumption_records;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS tariffs;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  status ENUM('active', 'inactive') DEFAULT 'active',
  email_verified_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  customer_number VARCHAR(50) NOT NULL UNIQUE,
  meter_number VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  connection_status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tariffs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rate_per_unit DECIMAL(12,2) NOT NULL,
  fixed_charge DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  penalty_type ENUM('fixed', 'percentage') NOT NULL DEFAULT 'percentage',
  penalty_value DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  due_days INT NOT NULL DEFAULT 14,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  effective_from DATE NOT NULL,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tariffs_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE consumption_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  billing_month INT NOT NULL,
  billing_year INT NOT NULL,
  units_consumed DECIMAL(12,2) NOT NULL,
  reading_date DATE NOT NULL,
  entered_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_consumption_period (customer_id, billing_month, billing_year),
  CONSTRAINT fk_consumption_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_consumption_user FOREIGN KEY (entered_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE bills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bill_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  consumption_record_id INT NOT NULL UNIQUE,
  tariff_id INT NOT NULL,
  billing_month INT NOT NULL,
  billing_year INT NOT NULL,
  units_consumed DECIMAL(12,2) NOT NULL,
  rate_per_unit DECIMAL(12,2) NOT NULL,
  fixed_charge DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  bill_amount DECIMAL(12,2) NOT NULL,
  previous_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  penalty_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(12,2) NOT NULL,
  amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  balance_due DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  status ENUM('unpaid', 'partially_paid', 'paid', 'overdue') DEFAULT 'unpaid',
  generated_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bills_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_bills_consumption FOREIGN KEY (consumption_record_id) REFERENCES consumption_records(id) ON DELETE CASCADE,
  CONSTRAINT fk_bills_tariff FOREIGN KEY (tariff_id) REFERENCES tariffs(id) ON DELETE RESTRICT,
  CONSTRAINT fk_bills_user FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE penalties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bill_id INT NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  penalty_type ENUM('fixed', 'percentage') NOT NULL,
  penalty_amount DECIMAL(12,2) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  applied_date DATE NOT NULL,
  status ENUM('active', 'cleared') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_penalties_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
  CONSTRAINT fk_penalties_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_reference VARCHAR(50) NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  bill_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_method ENUM('pesapal', 'mobile_money', 'bank_transfer', 'card') NOT NULL,
  transaction_reference VARCHAR(100) NOT NULL UNIQUE,
  provider VARCHAR(50) NOT NULL DEFAULT 'simulated',
  status ENUM('pending', 'successful', 'failed') DEFAULT 'pending',
  callback_status ENUM('pending', 'received') DEFAULT 'pending',
  payment_date DATETIME NULL,
  initiated_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_user FOREIGN KEY (initiated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  customer_id INT NULL,
  notification_type ENUM('bill_generated', 'payment_successful', 'payment_overdue', 'password_reset', 'manual') NOT NULL,
  channel ENUM('email', 'sms', 'in_app') NOT NULL DEFAULT 'email',
  title VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  recipient_email VARCHAR(100) NULL,
  recipient_phone VARCHAR(20) NULL,
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  sent_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  email VARCHAR(100) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_password_resets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO roles (name, description) VALUES
('Branch Manager', 'Full control over the branch billing system'),
('Billing Staff', 'Operational role for consumption, billing and payment monitoring'),
('Customer', 'End user role for bills, payments and profile access');

INSERT INTO users (role_id, full_name, username, email, password, phone, status, email_verified_at) VALUES
(1, 'Winnie Nafuna', 'winnie', 'winniemarkie@gmail.com', '$2a$12$REqtjRP0X4Vg3GnlhuZUA.e7ldPtEtZM2W7OOjnz.HRyIwgAdTH6K', '0700000001', 'active', NOW()),
(2, 'Nimusiima Sylon', 'sylon', 'nsylon256@gmail.com', '$2a$12$sJC0dn3l1zebBRlhLt.Q6eFgqr85mGCOIeKn5Y.0I6GTg9Ea83AFi', '0700000002', 'active', NOW()),
(3, 'Benjamin Angella', 'benjamin', 'bangella23@gmail.com', '$2a$12$LeJt4UjUiJwU/J5xFj1EMeV5.peFF2GUeAqEaPf.vEy8Fyx5UojJq', '0700000003', 'active', NOW());

INSERT INTO customers (user_id, customer_number, meter_number, full_name, email, phone, address, connection_status) VALUES
(3, 'UEDCL-0001', 'MTR-0001', 'Benjamin Angella', 'bangella23@gmail.com', '0700000003', 'Kampala Central Division', 'active');

INSERT INTO tariffs (rate_per_unit, fixed_charge, penalty_type, penalty_value, due_days, is_active, effective_from, created_by) VALUES
(850.00, 5000.00, 'percentage', 5.00, 14, 1, '2026-01-01', 1);

INSERT INTO consumption_records (customer_id, billing_month, billing_year, units_consumed, reading_date, entered_by) VALUES
(1, 3, 2026, 120.00, '2026-03-31', 2);

INSERT INTO bills (
  bill_number, customer_id, consumption_record_id, tariff_id, billing_month, billing_year, units_consumed,
  rate_per_unit, fixed_charge, bill_amount, previous_balance, penalty_amount, total_amount,
  amount_paid, balance_due, due_date, status, generated_by
) VALUES
('BILL-202603-0001', 1, 1, 1, 3, 2026, 120.00, 850.00, 5000.00, 107000.00, 0.00, 0.00, 107000.00, 0.00, 107000.00, '2026-04-14', 'overdue', 2);

INSERT INTO penalties (bill_id, customer_id, penalty_type, penalty_amount, reason, applied_date, status) VALUES
(1, 1, 'percentage', 5350.00, 'Automatic overdue penalty after due date.', '2026-04-15', 'active');

UPDATE bills
SET penalty_amount = 5350.00, total_amount = 112350.00, balance_due = 112350.00
WHERE id = 1;

INSERT INTO notifications (
  user_id, customer_id, notification_type, channel, title, message, recipient_email, recipient_phone, status, sent_at
) VALUES
(3, 1, 'bill_generated', 'email', 'Bill Generated', 'Your March 2026 electricity bill has been generated.', 'bangella23@gmail.com', '0700000003', 'sent', NOW()),
(3, 1, 'payment_overdue', 'email', 'Payment Overdue', 'Your electricity bill is overdue and now includes an automatic penalty.', 'bangella23@gmail.com', '0700000003', 'sent', NOW());
