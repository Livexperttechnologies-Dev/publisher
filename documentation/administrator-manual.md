# KIBO360 – Enterprise System Administrator Manual

## 1. System Administration Overview

This manual provides instructions for System Administrators, IT Security Officers, and Chief Financial Controllers managing **KIBO360**.

---

## 2. User Provisioning & 14 Enterprise Roles

KIBO360 implements strict Role-Based Access Control (RBAC) across 14 publishing-specific personas:

| Role Code | Role Name | Scope & Authority |
| :--- | :--- | :--- |
| `SUPER_ADMIN` | Super Administrator | Full cross-tenant configuration, user provisioning, system security |
| `FINANCE_CONTROLLER`| Chief Financial Controller | High-value voucher approval (> ₹50,000), period locking, BRS approval |
| `SENIOR_ACCOUNTANT` | Senior Accountant | Voucher posting, General Ledger reconciliation, tax returns |
| `JUNIOR_ACCOUNTANT` | Junior Accountant | Voucher drafting, invoice entry, journal recording |
| `PUBLISHING_EDITOR` | Commissioning Editor | Manuscript management, ISBN allocation, title metadata |
| `PRODUCTION_MGR`   | Production Manager | Press orders, paper requisition, binding job work, QC inspection |
| `ROYALTY_OFFICER`   | Royalty Officer | Author agreement terms, advance recovery, royalty statement generation |
| `SALES_MANAGER`     | Wholesale Sales Head | Credit limit overrides, wholesale discounts, dealer agreements |
| `DISTRIBUTOR_MGR`   | Distribution Manager | Territory planning, consignment stock issuance, commissions |
| `PURCHASE_OFFICER`  | Procurement Specialist| Purchase requisitions, PO issuance, supplier quote comparison |
| `WAREHOUSE_KEEPER`  | Depot Warehouse Keeper | Inward GRN, rack & shelf bin cards, inter-depot transfers, cycle counts |
| `POS_CASHIER`       | Retail Store Cashier | Retail POS counter billing, barcode scanning, shift cash closing |
| `STATUTORY_AUDITOR` | External Auditor | Read-only access to Trial Balance, ledgers, and statutory audit trail |
| `DATA_ANALYST`      | Business MIS Analyst | Executive dashboard KPIs, book profitability, inventory stock velocity |

### User Management Actions (`/users`)
- **Create User**: Assign username, corporate email, role, company, and branch godown.
- **Toggle Active Status**: Temporarily deactivate user accounts without deleting transaction history.
- **Reset Password**: Issues secure single-use cryptographic token expiring in 1 hour.

---

## 3. Financial Period Locking

To satisfy statutory compliance and prevent back-dated alterations:
1. Navigate to **Company & Branches** (`/company-config`).
2. Select the current Financial Year (`FY 2026-2027`).
3. Click **Lock Month** (e.g. `04/2026`).
4. Once locked, no transactions or voucher modifications can be posted in that month without Super Admin unlock.

---

## 4. Disaster Recovery & Database Maintenance

### 4.1 On-Demand Backup Generation
1. Navigate to **Security & Audit** (`/security`) -> **Database Snapshots**.
2. Click **Create Encrypted Backup**.
3. The system generates an AES-256 encrypted snapshot (`kibo360_db_snapshot_....sql.gz`) with a 64-character SHA-256 hash digest.

### 4.2 Verifying Backup Integrity
- In the Backups table, click **Verify Integrity**.
- The server recomputes the SHA-256 digest on disk and compares it to the recorded metadata, marking it `VERIFIED`.

### 4.3 Point-In-Time Recovery (PITR) Drill
- To restore the database to an exact historical state:
  1. Click **Point-in-Time Recovery Drill**.
  2. Select target recovery timestamp (e.g. `2026-11-06T00:00:00.000Z`).
  3. Enter reason for audit log compliance.
  4. Click **Execute Recovery**.
  5. The system replays transactions up to the timestamp and verifies double-entry Trial Balance equality ($\sum \text{Debit} \equiv \sum \text{Credit}$, Variance ₹0.00) before confirming restoration.

---

## 5. Security & Statutory Audit Trail Inspection

Navigate to **Security & Audit** (`/security`) to review:
- **Application Firewall**: Real-time status of rate limiting, SQL injection defense, XSS payload filtering, and MIME upload validator.
- **Statutory Audit Log**: View before/after diffs (`oldValues` vs `newValues`) for every financial voucher, period lock, or user modification.
- **Export to CSV**: Click **Export Audit Trail** to download the official audit log for external statutory auditors.
