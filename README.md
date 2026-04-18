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
- Successful payment callbacks update balances automatically
- Notifications are sent automatically for bill generation, payment success, and overdue bills
- Password reset uses a token-based flow with email verification logic

## Default Demo Accounts

All seeded passwords are `password123`.

| Role | Username | Email |
| --- | --- | --- |
| Branch Manager | `manager` | `manager@uedcl.local` |
| Billing Staff | `billing` | `billing@uedcl.local` |
| Customer | `customer` | `customer@uedcl.local` |

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
