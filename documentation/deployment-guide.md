# KIBO360 – Enterprise Production Deployment Guide

## 1. Overview & Architecture

KIBO360 is a containerized, cloud-native Enterprise Financial Accounting & ERP System designed specifically for Book Publishers, Distributors, Wholesalers, and Retail Bookstores.

### Production Topology
```
                     [ Internet Users & POS Terminals ]
                                     │
                                     ▼ (HTTPS Port 443 / TLS 1.3)
                       [ Nginx Reverse Proxy / WAF ]
                                     │
              ┌──────────────────────┴──────────────────────┐
              ▼ (Static SPA HTML/JS)                       ▼ (REST API /api/v1/)
    [ Frontend Web Server ]                      [ Node.js API Service ]
                                                            │
                                  ┌─────────────────────────┴─────────────────────────┐
                                  ▼                                                   ▼
                     [ PostgreSQL 16 Cluster ]                              [ Redis 7 Cluster ]
                    (ACID Financial Ledgers)                                (Session & Token Cache)
```

---

## 2. Server Prerequisites

### Hardware Requirements
- **Minimum Production Specs**: 4 vCPU, 8 GB RAM, 80 GB SSD (NVMe recommended).
- **High-Volume Enterprise Specs**: 8 vCPU, 16 GB RAM, 250 GB SSD (Multi-depot with 50+ POS counters).

### Supported Operating Systems
- Ubuntu 22.04 LTS / 24.04 LTS (Recommended)
- Debian 12 (Bookworm)
- Red Hat Enterprise Linux 9 / Rocky Linux 9

### Software Dependencies
- Docker Engine 25.0+ & Docker Compose v2.24+
- OpenSSL 3.0+
- Git 2.40+

---

## 3. Step-by-Step Deployment Procedure

### Step 3.1: Repository Setup & Environment Configuration
```bash
# Clone the repository
git clone https://github.com/your-org/kibo360.git /var/kibo360
cd /var/kibo360

# Create production environment file from template
cp deployment/env.production.example deployment/.env.production

# Edit secrets and connection strings
nano deployment/.env.production
```

Ensure the following critical variables are configured:
- `DATABASE_URL`: Production PostgreSQL connection string.
- `JWT_SECRET`: Minimum 64-character cryptographically secure secret.
- `BACKUP_ENCRYPTION_KEY`: 256-bit AES encryption master key.
- `CORS_ORIGIN`: Canonical frontend domain (e.g. `https://erp.kibo360.com`).

### Step 3.2: SSL/TLS Certificate Provisioning
For production domain `erp.kibo360.com`:
```bash
# Install Certbot
sudo apt update && sudo apt install -y certbot

# Obtain Let's Encrypt certificate
sudo certbot certonly --standalone -d erp.kibo360.com -d www.erp.kibo360.com

# Copy certificates to deployment directory
mkdir -p deployment/ssl
sudo cp /etc/letsencrypt/live/erp.kibo360.com/fullchain.pem deployment/ssl/
sudo cp /etc/letsencrypt/live/erp.kibo360.com/privkey.pem deployment/ssl/
sudo chmod 600 deployment/ssl/privkey.pem
```

### Step 3.3: Database Migrations & Initial Seeding
Execute database DDL migrations to instantiate the relational schema, foreign key constraints, and database-level accounting triggers:
```bash
# Apply schema and double-entry triggers
psql -h localhost -U kibo_admin -d kibo360_prod -f database/migrations/001_initial_schema.sql
psql -h localhost -U kibo_admin -d kibo360_prod -f database/migrations/002_accounting_triggers.sql
```

### Step 3.4: Container Build & Service Startup
```bash
cd /var/kibo360/deployment

# Build and start all services in detached mode
docker compose --env-file .env.production up --build -d

# Verify container health status
docker compose ps
```

All 4 services should report `healthy`:
- `kibo360-proxy` (Port 80, 443)
- `kibo360-api` (Port 5000)
- `kibo360-postgres` (Port 5432)
- `kibo360-redis` (Port 6379)

---

## 4. Verification & Health Monitoring

### Health Check Endpoint
```bash
curl -I https://erp.kibo360.com/api/v1/health
```
Expected response:
```http
HTTP/2 200
content-type: application/json; charset=utf-8
```

### Verification Test Suite
Run the Phase 19 verification test suite against the deployed staging/production environment:
```bash
node tests/phase19-e2e-reconciliation-perf-tests.js
```
Confirm all 24 checks pass 100%.

---

## 5. Automated Daily Backup & Retention Schedule

Configure cron to execute daily backups with AES-256 encryption and offsite S3 synchronization:
```bash
# Make script executable
chmod +x /var/kibo360/database/backup-schedule.sh

# Install daily midnight cron job
sudo crontab -e
```
Add the entry:
```cron
0 2 * * * /var/kibo360/database/backup-schedule.sh >> /var/log/kibo360-backup.log 2>&1
```

---

## 6. Zero-Downtime Rollback Procedure

In the event of an unexpected release regression or deployment anomaly:

### Step 6.1: Container Rollback
```bash
cd /var/kibo360/deployment

# Revert to previous release image tag
docker compose stop backend
docker compose up -d --no-deps backend
```

### Step 6.2: Point-In-Time Database Rollback (PITR)
If database state must be restored to a known healthy snapshot prior to the release window:
```bash
# Trigger Point-In-Time Recovery via API
curl -X POST https://erp.kibo360.com/api/v1/audit/backups/restore-pitr \
  -H "Authorization: Bearer <SUPER_ADMIN_JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "targetTimestamp": "2026-11-06T00:00:00.000Z",
    "reason": "Production hotfix rollback to pre-release state"
  }'
```
The recovery engine automatically verifies that $\sum \text{Debit} \equiv \sum \text{Credit}$ (zero variance) post-restoration before returning HTTP 200.
