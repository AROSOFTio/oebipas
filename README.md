# OEBIPAS - Online Electricity Billing and Payment System

OEBIPAS is a complete, production-ready, web-based system for managing electricity consumers, billing cycles, payments, and reporting, tailored for a utility company context (similar to UEDCL).

## Project Overview
This phase provides the foundational architecture:
- **Backend:** Node.js, Express, MySQL connection pool
- **Frontend:** React (Vite), Tailwind CSS, Lucide Icons, React Router
- **Database:** MySQL 8
- **Infrastructure:** Docker, Docker Compose, Nginx Reverse Proxy, phpMyAdmin

## System Modules (To Be Implemented Fully)
1. Authentication & Authorization (JWT & Role-based)
2. Customer & Meter Management
3. Consumption Data & Tariff Rules
4. Automation Bill Calculation & Penalties
5. Payment & Reconciliation
6. Analytics & Audit Logs

## Local Setup (Docker)
1. Copy `.env.example` to `.env`.
   ```bash
   cp .env.example .env
   ```
2. Build and start the services.
   ```bash
   docker-compose up -d --build
   ```
3. Access the interfaces:
   - **Frontend Application:** `http://localhost/`
   - **Backend API Base Unit:** `http://localhost/api/v1/health`
   - **phpMyAdmin:** `http://localhost:8080/` (User: root / Pass: rootpassword)

## Login Seed Credentials (Demo)
- **System Admin:** admin@oebipas.local / password123
- **Billing Officer:** billing@oebipas.local / password123
- **Finance Officer:** finance@oebipas.local / password123
- **Customer:** john@example.com / password123

## How Billing Calculation Works (Concept)
- Energy Charge = `Units Consumed` x `Rate Per Unit` (from Tariff Rules)
- Total = `Energy Charge` + `Service Charge` + `Tax (VAT)` + `Penalties` + `Previous Arrears`.

## Deployment Guide (Ubuntu / Contabo VPS)
1. Install Docker & Docker Compose on your instance.
2. Clone this repository (or copy it over).
3. Update `.env` with secure, production-grade variables.
4. Run `docker-compose up -d --build` to launch infrastructure.
5. Setup a domain record A pointing to your VPS IP address.
6. Either expose the built-in Nginx securely or use an external Nginx with Certbot/LetsEncrypt to proxy to the Docker stack.
