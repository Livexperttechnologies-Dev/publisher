-- KIBO360 Enterprise ERP - Database Initial Seed Data
-- Publishers, Wholesalers, Distributors, Bookstores & Institutional Suppliers

-- 1. Insert Default Roles
INSERT INTO roles (id, name, "roleType", description, permissions, "createdAt", "updatedAt")
VALUES
('role_super_admin', 'Super Administrator', 'SUPER_ADMIN', 'Full unrestricted enterprise control', '["*"]'::json, NOW(), NOW()),
('role_controller', 'Financial Controller', 'FINANCIAL_CONTROLLER', 'Full general ledger, audit, and voucher approvals', '["accounting:*", "reports:*", "vouchers:*"]'::json, NOW(), NOW()),
('role_accountant', 'Senior Accountant', 'ACCOUNTANT', 'Voucher entry, invoices, bills, reconciliations', '["accounting:write", "vouchers:write"]'::json, NOW(), NOW()),
('role_auditor', 'Statutory Auditor', 'AUDITOR', 'Read-only audit inspection and trial balance review', '["reports:read", "audit:read"]'::json, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Default Publisher Company
INSERT INTO companies (id, name, code, "legalName", "businessType", "taxId", pan, currency, "currencySymbol", "fiscalYearStart", email, phone, address, city, state, country, "isActive", "createdAt", "updatedAt")
VALUES
('cmp_default_publisher', 'Apex Educational Publishers & Distributors Ltd.', 'AEPD-01', 'Apex Educational Publishers & Distributors Ltd.', 'BOOK_PUBLISHER', '07AAAAA0000A1Z5', 'AAACA1234D', 'INR', '₹', 4, 'finance@apexpublishers.com', '+91 11 4567 8900', 'Publishers Enclave, Daryaganj', 'New Delhi', 'Delhi', 'India', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Main Branch
INSERT INTO branches (id, "companyId", name, code, "isMain", address, city, state, country, phone, email, gstin, "isActive", "createdAt", "updatedAt")
VALUES
('brn_main_hq', 'cmp_default_publisher', 'Headquarters & Central Depot', 'HQ-DELHI', true, 'Daryaganj Central Godown', 'New Delhi', 'Delhi', 'India', '+91 11 4567 8901', 'depot@apexpublishers.com', '07AAAAA0000A1Z5', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Fiscal Year
INSERT INTO fiscal_years (id, "companyId", name, "startDate", "endDate", "isClosed", "isCurrent", "createdAt", "updatedAt")
VALUES
('fy_2026_2027', 'cmp_default_publisher', 'FY 2026-2027', '2026-04-01T00:00:00Z', '2027-03-31T23:59:59Z', false, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Super Admin User (Password: Admin@123)
INSERT INTO users (id, "companyId", "branchId", "roleId", email, username, "passwordHash", "fullName", phone, "isActive", "createdAt", "updatedAt")
VALUES
('usr_enterprise_super_admin', 'cmp_default_publisher', 'brn_main_hq', 'role_super_admin', 'admin@kibo360.com', 'admin', '$2a$10$eE0m7h2xZ4m6F/fP90F3u.bFw9tq0k9F7PZ3q9F7PZ3q9F7PZ3q9F', 'KIBO360 Principal Administrator', '+91 98765 43210', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
