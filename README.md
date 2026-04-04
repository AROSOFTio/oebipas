# OEBIPAS — Online Electricity Billing & Payment System

> A full-stack, production-grade utility management platform for billing, payments, consumption tracking, customer management, and analytics.

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, recharts, lucide-react |
| Backend | Node.js, Express.js |
| Database | MySQL 8.0 |
| Auth | JWT (Role-Based Access Control) |
| Infrastructure | Docker, Docker Compose, Nginx |
| Admin DB UI | phpMyAdmin |

---

## 📋 Features

- **RBAC**: Super Admin, Billing Officer, Finance Officer, Customer roles
- **Customer Management**: Profiles, connections, meters
- **Consumption Engine**: Monthly readings with kWh tracking
- **Smart Billing Engine**: Auto-calculates energy, service charges, VAT, penalties from previous balances
- **Payments**: Record cash/mobile payments, auto-reconciliation, receipt generation
- **Penalties**: Automatic late fee application on bill generation
- **Dashboards**: KPI cards + charts via recharts (Admin & Customer)
- **Reports**: Daily revenue, monthly billing vs collection, outstanding balances, PDF & CSV export
- **Notifications**: In-app alerts triggered on bill generation and payment receipt
- **Support Tickets**: Customer submission + Admin workflow (New → In Progress → Resolved)
- **Audit Logs**: Immutable action trail for all admin operations
- **Settings**: Super Admin-only system configuration panel

---

## 🚀 Deployment on Contabo / Ubuntu VPS

### 1. Install Prerequisites
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose git curl
sudo systemctl enable docker && sudo systemctl start docker
```

### 2. Clone Repository
```bash
mkdir -p /www/wwwroot/oebipas.yourdomain.com
cd /www/wwwroot/oebipas.yourdomain.com
git clone https://github.com/AROSOFTio/oebipas.git .
```

### 3. Configure Environment
```bash
cp .env.example .env
nano .env
```
> ⚠️ **Change DB passwords and JWT_SECRET to strong, unique values before going live!**

### 4. Build & Launch
```bash
docker-compose build --no-cache
docker-compose up -d
```

### 5. Verify Containers
```bash
docker ps
docker-compose logs -f backend
```

### 6. Access the Application
| Service | URL |
|---|---|
| Main App (Frontend + API) | `http://YOUR_SERVER_IP:8083` |
| phpMyAdmin (Database Admin) | `http://YOUR_SERVER_IP:8084` |
| API Health Check | `http://YOUR_SERVER_IP:8083/health` |

### 7. Reverse Proxy (Optional, Recommended)
Point your web server (e.g. Nginx/CyberPanel/AAPanel) to reverse-proxy traffic from port `80`/`443` to `localhost:8083` for custom domain + SSL support.

---

## 🔑 Default Login Credentials

> ⚠️ **Change these passwords immediately after first login in production.**

| Role | Username | Email | Password |
|---|---|---|---|
| Super Admin | `Benjamin` | `benjamin@oebipas.local` | `password123` |
| Super Admin | `winnie` | `winnie@local` | `password123` |
| Billing Officer | `billing` | `billing@oebipas.local` | `password123` |
| Finance Officer | `finance` | `finance@oebipas.local` | `password123` |
| Customer | `johndoe` | `john@example.com` | `password123` |

---

## 🛠️ phpMyAdmin Database Access

1. Navigate to `http://YOUR_SERVER_IP:8084`
2. Login with:
   - **Server**: `db`
   - **Username**: `root`
   - **Password**: `rootpassword` (or your `.env` `DB_ROOT_PASSWORD`)
3. Select the `oebipas` database

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 20+
- MySQL 8.0 (or Docker)

### Backend
```bash
cd backend
npm install
# Create .env from example and update DB_HOST to 'localhost'
cp ../.env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔧 Troubleshooting

**Issue: Blank screen after deploy / "Database Connection Failed"**
```bash
# MySQL may need time to initialize volumes on first run
docker restart oebipas_backend
# Or wait 30 seconds and retry
```

**Issue: `no such service: oebipas_frontend`**
```bash
# Use the service name, not container name
docker-compose up -d --build frontend
```

**Issue: Port 8083 or 8084 already in use**
```bash
# Edit docker-compose.yml ports, e.g. change "8083:80" to "9000:80"
```

**Issue: Frontend build fails with Vite error**
```bash
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

**Issue: PDF export not working**
> `pdfkit` and `pdfkit-table` must be installed in the backend image. They are listed in `package.json` and will install automatically via `npm install` during Docker build.

---

## 🔐 Production Security Checklist

- [ ] Change all default passwords in `.env`
- [ ] Generate a strong `JWT_SECRET` (64+ random chars)
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Setup SSL certificate (Let's Encrypt / Certbot) on your reverse proxy
- [ ] Restrict phpMyAdmin (port 8084) access via firewall in production
- [ ] Enable automatic Docker container restart (`restart: unless-stopped` — already configured)
- [ ] Setup automated DB backups via `mysqldump` cron job

---

## 📁 Project Structure

```
oebipas/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Business logic
│   │   ├── routes/        # API routing
│   │   ├── middlewares/   # Auth & RBAC
│   │   ├── services/      # AuditLogger
│   │   └── config/        # DB connection
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/         # Admin & Customer pages
│   │   ├── layouts/       # AdminLayout, CustomerLayout
│   │   ├── components/    # ProtectedRoute, shared UI
│   │   ├── context/       # AuthContext
│   │   └── utils/         # axiosInstance
│   ├── nginx.conf         # Frontend internal Nginx config
│   └── Dockerfile
├── nginx/
│   └── nginx.conf         # Reverse proxy config
├── db/
│   └── init.sql           # Full schema + seed data
├── docker-compose.yml
├── .env.example
└── README.md
```
