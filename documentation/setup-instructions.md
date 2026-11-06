# KIBO360 – Phase 01 Setup & Execution Guide

## Overview
**KIBO360** is an enterprise-grade financial accounting and management system engineered specifically for book publishers, distributors, wholesalers, retailers, and educational suppliers.

---

## 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v24.x tested)
- **Package Manager**: npm v10+ or pnpm v9+
- **Database**: PostgreSQL 14+ with pgvector / standard relational extensions

---

## 2. Directory Structure

```text
kibo360/
├── frontend/               # React 18 + Vite + TypeScript + Tailwind CSS UI
├── backend/                # Node.js + Express + TypeScript + Prisma API
├── database/               # PostgreSQL schema, seed data & diagnostics
├── documentation/          # API docs, architecture guides & test reports
├── tests/                  # Integration and smoke test suites
└── package.json            # Monorepo scripts
```

---

## 3. Installation & Setup

### Step 1: Install Dependencies
From the repository root:
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Step 2: Configure Environment Variables
Copy the `.env.example` templates:
```bash
# In backend/
cp .env.example .env

# In frontend/
cp .env.example .env
```

Ensure your PostgreSQL `DATABASE_URL` in `backend/.env` matches your local database instance:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/kibo360_erp?schema=public"
```

### Step 3: Initialize Database & Seed Data
```bash
# Generate Prisma Client
npm run db:generate

# Test Database Connection & Schema
npm run db:test

# Run seed data
psql -U postgres -d kibo360_erp -f database/seed.sql
```

---

## 4. Running the Development Servers

### Option A: Monorepo Root Scripts
```bash
# Start backend in development mode (Port 5000)
npm run dev:backend

# Start frontend in development mode (Port 5173)
npm run dev:frontend
```

### Option B: Separate Terminal Tabs
**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# -> Server active at http://localhost:5000
# -> Swagger UI active at http://localhost:5000/api/docs
# -> Health check at http://localhost:5000/api/v1/health
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# -> Application active at http://localhost:5173
```

---

## 5. Default Enterprise Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Administrator** | `admin@kibo360.com` | `Admin@123` |
