-- ==============================================================================
-- KIBO360 ENTERPRISE ERP - INITIAL PRODUCTION POSTGRESQL SCHEMA (001)
-- Multi-Tenant Publishing & Financial Accounting Schema
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. COMPANIES & BRANCHES
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(64) PRIMARY KEY,
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    gstin VARCHAR(15) UNIQUE NOT NULL,
    pan VARCHAR(10) NOT NULL,
    cin VARCHAR(21),
    registered_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS branches (
    id VARCHAR(64) PRIMARY KEY,
    company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    gstin VARCHAR(15) NOT NULL,
    invoice_prefix VARCHAR(16) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    is_headquarters BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, code)
);

-- 2. USERS, ROLES & PERMISSIONS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
    branch_id VARCHAR(64) REFERENCES branches(id),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    failed_login_attempts INT DEFAULT 0,
    lockout_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. CHART OF ACCOUNTS (GROUPS & LEDGERS)
CREATE TABLE IF NOT EXISTS account_groups (
    id VARCHAR(64) PRIMARY KEY,
    company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
    parent_group_id VARCHAR(64) REFERENCES account_groups(id),
    code VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    classification VARCHAR(20) NOT NULL CHECK (classification IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
    is_system_group BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS account_ledgers (
    id VARCHAR(64) PRIMARY KEY,
    company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
    group_id VARCHAR(64) REFERENCES account_groups(id),
    code VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    classification VARCHAR(20) NOT NULL,
    opening_balance NUMERIC(15, 2) DEFAULT 0.00,
    current_balance NUMERIC(15, 2) DEFAULT 0.00,
    is_debit_balance BOOLEAN DEFAULT TRUE,
    is_bank_or_cash BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, code)
);

-- 4. GENERAL LEDGER VOUCHERS & TRANSACTIONS
CREATE TABLE IF NOT EXISTS journal_vouchers (
    id VARCHAR(64) PRIMARY KEY,
    company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
    branch_id VARCHAR(64) REFERENCES branches(id),
    voucher_number VARCHAR(64) UNIQUE NOT NULL,
    voucher_type VARCHAR(32) NOT NULL CHECK (voucher_type IN ('JOURNAL', 'PAYMENT', 'RECEIPT', 'CONTRA', 'SALES', 'PURCHASE', 'CREDIT_NOTE', 'DEBIT_NOTE')),
    voucher_date DATE NOT NULL,
    financial_year VARCHAR(16) NOT NULL,
    narration TEXT NOT NULL,
    total_debit NUMERIC(15, 2) NOT NULL,
    total_credit NUMERIC(15, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'POSTED' CHECK (status IN ('DRAFT', 'POSTED', 'CANCELLED', 'REVERSED')),
    created_by VARCHAR(64) REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dr_cr_equilibrium CHECK (total_debit = total_credit)
);

CREATE TABLE IF NOT EXISTS journal_voucher_items (
    id VARCHAR(64) PRIMARY KEY,
    voucher_id VARCHAR(64) REFERENCES journal_vouchers(id) ON DELETE CASCADE,
    ledger_id VARCHAR(64) REFERENCES account_ledgers(id),
    debit_amount NUMERIC(15, 2) DEFAULT 0.00,
    credit_amount NUMERIC(15, 2) DEFAULT 0.00,
    narration VARCHAR(255),
    cost_centre_id VARCHAR(64),
    CONSTRAINT check_item_entry CHECK ((debit_amount > 0 AND credit_amount = 0) OR (credit_amount > 0 AND debit_amount = 0))
);

-- 5. BOOKS, AUTHORS, PUBLISHING & INVENTORY
CREATE TABLE IF NOT EXISTS authors (
    id VARCHAR(64) PRIMARY KEY,
    company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    pen_name VARCHAR(255),
    email VARCHAR(255),
    pan VARCHAR(10) NOT NULL,
    bank_account_number VARCHAR(50),
    bank_ifsc VARCHAR(11),
    standard_royalty_percentage NUMERIC(5, 2) DEFAULT 10.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS book_titles (
    id VARCHAR(64) PRIMARY KEY,
    company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
    author_id VARCHAR(64) REFERENCES authors(id),
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    isbn10 VARCHAR(10),
    isbn13 VARCHAR(13) UNIQUE NOT NULL,
    sku VARCHAR(64) UNIQUE NOT NULL,
    barcode VARCHAR(64),
    edition VARCHAR(50) DEFAULT '1st Edition',
    language VARCHAR(50) DEFAULT 'English',
    subject VARCHAR(100),
    category VARCHAR(100),
    number_of_pages INT NOT NULL,
    binding_type VARCHAR(50) DEFAULT 'Paperback',
    hsn_sac_code VARCHAR(10) DEFAULT '4901',
    tax_rate NUMERIC(5, 2) DEFAULT 0.00,
    mrp NUMERIC(10, 2) NOT NULL,
    wholesale_price NUMERIC(10, 2) NOT NULL,
    dealer_price NUMERIC(10, 2) NOT NULL,
    purchase_cost NUMERIC(10, 2) NOT NULL,
    current_stock INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. STATUTORY AUDIT LOGS (IMMUTABLE)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id),
    action VARCHAR(64) NOT NULL,
    entity VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64),
    description TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    severity VARCHAR(20) DEFAULT 'INFO',
    status VARCHAR(20) DEFAULT 'SUCCESS',
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_vouchers_date ON journal_vouchers(company_id, voucher_date);
CREATE INDEX IF NOT EXISTS idx_vouchers_fy ON journal_vouchers(company_id, financial_year);
CREATE INDEX IF NOT EXISTS idx_voucher_items_ledger ON journal_voucher_items(ledger_id);
CREATE INDEX IF NOT EXISTS idx_books_isbn13 ON book_titles(isbn13);
CREATE INDEX IF NOT EXISTS idx_books_sku ON book_titles(sku);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(company_id, timestamp);
