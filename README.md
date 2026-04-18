# UEDCL Online Electricity Billing and Payment System

This project has been rebuilt as a proposal-aligned final year project for:

**Development of an Online Electricity Billing and Payment System: A Case Study of UEDCL**

## Project Scope

The system keeps only the academically justified modules:

- Authentication
- Customer management
- Consumption entry
- Automated bill generation
- Payment processing with callback handling
- Automatic penalty calculation
- Notifications
- Dashboard
- Basic reports

## Approved Roles

- `Branch Manager`
- `Billing Staff`
- `Customer`

Backend and frontend both enforce this role structure.

## Automation Demonstrated

- Bill generation occurs automatically after consumption entry
- Overdue penalties are applied automatically after due date
- Successful Pesapal callbacks and IPN updates balances automatically
- Notifications are sent automatically for bill generation, payment success, and overdue bills
- Password reset uses a token-based flow with email verification logic

## Pesapal Configuration

Set these values in `.env` before deployment:

- `PESAPAL_CONSUMER_KEY`
- `PESAPAL_CONSUMER_SECRET`
- `PESAPAL_ENV`
- `FRONTEND_URL`
- `BACKEND_PUBLIC_URL`

The implementation follows Pesapal API 3.0 token generation, IPN registration, order submission, and transaction status verification:
- Authentication: https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/authentication
- Register IPN URL: https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/registeripnurl
- Submit Order Request: https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/submitorderrequest
- Get Transaction Status: https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/gettransactionstatus

## Live Notification Configuration

The system now attempts live delivery through both email and SMS whenever a bill is generated, a payment succeeds, an overdue balance is detected, or a password reset link is requested.

Set these values in `.env`:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`
- `AFRICASTALKING_USERNAME`
- `AFRICASTALKING_API_KEY`
- `AFRICASTALKING_SENDER_ID`

Implementation references:
- Nodemailer SMTP transport: https://nodemailer.com/smtp
- Africa's Talking SMS getting started: https://help.africastalking.com/en/articles/2258472-how-do-i-start-sending-messages

## Tariff Rules

- Branch Manager can create, edit, and delete tariff records
- Penalty is percentage-only
- Fixed-amount penalties are not allowed

## Default Demo Accounts

The seed now contains the three requested users below. The database stores the exact bcrypt hashes provided for them.

Note: bcrypt hashes are one-way. That means the original plain-text passwords cannot be read back from the hashes.

| Role | Username | Email |
| --- | --- | --- |
| Branch Manager | `winnie` | `winniemarkie@gmail.com` |
| Billing Staff | `sylon` | `nsylon256@gmail.com` |
| Customer | `benjamin` | `bangella23@gmail.com` |

## Main Documents

- [Project Scope Plan](./PROJECT_SCOPE_PLAN.md)
- [Removed Features Log](./REMOVED_FEATURES_LOG.md)
- [Feature to Proposal Mapping](./FEATURE_TO_PROPOSAL_MAPPING.md)
- [Demo Steps](./DEMO_STEPS.md)

## Local Structure

- `backend/` API, RBAC, automation, and business logic
- `frontend/` proposal-aligned user interface
- `db/init.sql` cleaned schema and seed data

## Validation Note

I could not execute `node` or `npm` in the current environment because those commands are unavailable here, so runtime validation must be completed on a machine with Node.js installed.
