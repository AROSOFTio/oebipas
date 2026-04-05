# OEBIPAS Standard Operating Procedure (SOP)

Welcome to the **OEBIPAS (Online Electricity Billing, Integrated Payment, and Analytics System)**. This document is a comprehensive "A to Z" guide designed for absolute beginners and advanced professional users.

---

## 1. System Overview
OEBIPAS is a mission-critical utility billing engine designed to automate the lifecycle of electricity consumers—from meter installation and consumption tracking to automated billing and professional revenue collection.

### Core Architecture
- **Financial Engine**: Handles tariffs, standing charges, and automated bill generation.
- **Payment Portal**: Supports MTN Mobile Money, Airtel Money, Visa/Mastercard, and PesaPal.
- **Analytics Hub**: Provides real-time KPIs on revenue, outstanding debt, and system health.

---

## 2. User Roles & Access Control (RBAC)
The system enforces strict security levels to ensure data integrity:

| Role | Access Level | Responsibilities |
| :--- | :--- | :--- |
| **Super Admin** | Full System Access | User management, system settings, audit logs, and tariff overrides. |
| **Billing Officer** | Field & Billing Ops | Customer onboarding, meter readings, and manual bill generation. |
| **Finance Officer** | Financial Control | Payment verification, receipting, and financial reporting. |
| **Support/Viewer** | Read-Only | Viewing dashboards and responding to support tickets. |
| **Customer** | Portal Access | Viewing bills, usage history, and making secure payments. |

---

## 3. Administration & Setup (A-Z)

### [A] Administrative Dashboard
- **Dashboard**: High-level view of Total Revenue, Active Customers, and Pending Bills.
- **System Users**: Create, edit, or delete staff accounts.
- **Audit Logs**: Track every action taken by staff (who did what and when).
- **Settings**: Configure the global system name and technical gateway keys.

### [B] Billing & Invoicing
- **Bill Search**: Locate bills by Number, Account, or Date.
- **Professional Invoices**: Click "Download PDF" on any bill to generate a branded, professional tax invoice.
- **Zero Balance Logic**: Customers with no debt are clearly notified, reducing support queries.

### [C] Customer Management
- **Connections**: Every customer can have multiple connections (e.g., House 1, Shop 2).
- **Meters**: Link physical meters to connections to track consumption accurately.

### [F] Finance & Payments
- **Payment Verification**: Finance officers must verify manual bank transfers.
- **Smart Receipts**: Automated professional receipts are generated for every payment.
- **PesaPal**: Integrated for automated settlement without human intervention.

---

## 4. Operational Workflows (Step-by-Step)

### Workflow 1: Onboarding a New Customer
1. Navigate to **Customers** -> **Add New Customer**.
2. Enter the legal name, contact details, and location.
3. Once created, click on the customer to **Add Connection**.
4. Link a **Meter Number** and set the initial reading to 0.

### Workflow 2: The Monthly Billing Cycle
1. **Meter Readings**: Enter the current reading for each meter.
2. **Billing Engine**: The system calculates: `(Current Reading - Previous Reading) * Tariff Rate + Standing Charge`.
3. **Generation**: Click "Generate Bill" to create the legal invoice.
4. **Notification**: The system automatically updates the customer's portal.

### Workflow 3: Processing Payments
1. **Mobile Money**: Customer selects MTN or Airtel on the portal, enters their 10-digit number, and confirms the prompt.
2. **Manual Settlement**: If a customer pays via bank, the Finance Officer goes to **Payments** -> **Add Payment** to reconcile the account manually.
3. **Receipting**: Click "Download Receipt" to provide the customer with a branded PDF proof of payment.

---

## 5. Technical Maintenance (Pro Guide)

### Docker & VPS Commands
The system runs in isolated containers. Use these commands on your VPS:
- **View Container Status**: `docker ps`
- **Restart System**: `docker-compose restart`
- **Rebuild (After Code Updates)**:
  ```bash
  git pull origin main
  docker-compose build --no-cache
  docker-compose up -d
  ```

### Database Management (DBA)
- Access the database via **phpMyAdmin** at: `http://your-vps-ip:8084`
- **Credentials**: Root user with your configured database password.
- **Backups**: Standard MySQL dumps are stored in the `db_data` volume.

### Environment Variables (`.env`)
Found in the `backend/` and `docker-compose.yml` files:
- `JWT_SECRET`: The security key for logging in.
- `DB_PASSWORD`: The root password for the database.
- `PESAPAL_KEYS`: Integration keys for automated payments.

---

## 6. Troubleshooting
- **White Screen**: Usually means the backend container is down or the `JWT_SECRET` is missing. Check logs with `docker logs oebipas_backend`.
- **"Zero Balance" Error**: Ensure the customer actually has an unpaid bill in the system before they attempt to pay.
- **Logo Not Showing on PDF**: This requires a clean rebuild (`--no-cache`) to ensure the asset is bundled into the container.

---
**Standard Operating Procedure Version 1.0**
*Prepared for AROSOFT.IO / OEBIPAS Deployment*
