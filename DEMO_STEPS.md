# Demo Steps

## 1. Show the approved roles
- Log in as `manager` / `password123`
- Show Branch Manager modules: Dashboard, Customers, Consumption, Bills, Payments, Reports, Notifications, Tariffs
- Log out and sign in as `billing` / `password123`
- Show Billing Staff modules: Dashboard, Consumption, Bills, Payments
- Log out and sign in as `customer` / `password123`
- Show Customer modules: My Profile, My Bills, Pay Bill, Payment History, Notifications

## 2. Demonstrate automated billing
- Sign in as Billing Staff
- Open `Consumption`
- Enter a new reading for a customer
- Submit the form
- Show the success message confirming that the bill was generated automatically
- Open `Bills` and show the new bill record

## 3. Demonstrate automatic penalty logic
- Open a bill whose due date is already passed
- Refresh the `Bills` or `Reports` page
- Show that the bill status becomes `overdue` and the penalty has been added automatically without manual action

## 4. Demonstrate payment workflow
- Sign in as Customer
- Open `Pay Bill`
- Select an outstanding bill and choose a demo callback result
- Submit payment
- Explain the two-step demo flow:
  - payment initiation creates a pending transaction
  - callback updates the payment result
- Show `Payment History` and `My Bills` to confirm automatic balance update

## 5. Demonstrate notifications
- Open `Notifications` as Customer
- Show notifications for:
  - bill generated
  - payment confirmed
  - payment overdue
- Sign in as Branch Manager and show manual notification sending

## 6. Demonstrate password reset
- Open `Forgot Password`
- Submit the customer email
- Show the generated demo reset token
- Open `Reset Password`
- Use the token to set a new password

## 7. Demonstrate reports and dashboard
- Sign in as Branch Manager
- Show dashboard cards for revenue, outstanding balances, customers, and overdue bills
- Open `Reports`
- Show daily revenue, monthly billing summary, and outstanding payments
