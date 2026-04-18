# Project Scope Plan

## Keep
- Authentication: login, register, forgot password, reset password
- Customer management
- Consumption entry
- Bill generation
- Payment processing
- Penalty calculation
- Notifications
- Basic reports
- Dashboard

## Remove
- Feedback system
- Audit logs
- Global search
- Service connections
- Full meter management module
- Advanced settings
- Receipts module as a separate feature set
- User administration outside the three approved roles
- Enterprise analytics, forecasting, and unrelated support tools

## Simplify
- Tariff handling: one active simple tariff with `rate_per_unit`, `fixed_charge`, `penalty_type`, `penalty_value`, and `due_days`
- Payment integration: simulated gateway with initiation, callback, success, and failure flow; supports `pesapal` as a method label for demo use
- Notifications: email required, SMS optional and simulated through the same notification workflow
- Reports: daily revenue, monthly billing summary, outstanding payments only
- Consumption: manual staff entry only

## Add
- Strict RBAC with only `Branch Manager`, `Billing Staff`, and `Customer`
- Automatic bill generation immediately after consumption entry
- Automatic penalty application after due date
- Automatic balance update after successful payment callback
- Token-based password reset with email-verification flow
- Proposal-aligned dashboard and demo-ready portal structure
