# Standard Operating Procedure

## 1. Purpose

This system supports the final year project titled:

**Development of an Online Electricity Billing and Payment System: A Case Study of UEDCL**

It is intentionally limited to the approved scope so every feature is easy to explain during academic defense.

## 2. Roles

| Role | Main Access |
| --- | --- |
| Branch Manager | Full branch-level control |
| Billing Staff | Consumption, bills, and payment monitoring |
| Customer | Personal bills, payments, notifications, and profile |

## 3. Core Workflow

### Customer Management
- Branch Manager creates and updates customer records
- Customer can update only personal profile details

### Consumption Entry
- Billing Staff or Branch Manager enters monthly units consumed
- The system automatically generates the bill immediately after saving consumption

### Billing
- Billing formula: `units consumed x rate per unit + fixed charge`
- Previous unpaid balance is carried forward automatically

### Penalties
- If the due date passes and a balance still exists, the system automatically marks the bill overdue
- A penalty is applied automatically using the active tariff settings

### Payments
- Customer initiates payment from the portal
- The system records a pending transaction
- A callback updates the payment to successful or failed
- On successful callback, the account balance updates automatically

### Notifications
- Bill generated
- Payment successful
- Payment overdue
- Password reset request

## 4. Reports

The system provides only these basic reports:

- Daily revenue
- Monthly billing summary
- Outstanding payments

## 5. Password Reset

- User requests reset with email
- System creates a time-limited reset token
- User submits token and new password
- System updates password and confirms verification

## 6. Demo Guidance

Use the following sequence during presentation:

1. Show role-based access with the three approved roles
2. Enter consumption and show automatic bill generation
3. Show overdue bill and automatic penalty
4. Process a payment and show callback handling
5. Show notification records
6. Show the three basic reports

## 7. Scope Discipline

Do not present removed modules such as feedback, audit logs, global search, service connections, advanced settings, or full meter management, because they are outside the approved proposal.
