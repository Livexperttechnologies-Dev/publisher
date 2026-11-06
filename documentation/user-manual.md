# KIBO360 – Publishing ERP & Financial Accounting User Manual

## Welcome to KIBO360

**KIBO360** is an enterprise-grade ERP built specifically for the book publishing and book distribution industry. It unifies publishing operations, print production, author royalties, inventory, wholesale distribution, retail POS, and double-entry financial accounting into a single interface.

---

## 1. Getting Started

### 1.1 Logging In
1. Navigate to your KIBO360 portal: `https://erp.kibo360.com` (or `http://localhost:5173` in development).
2. Enter your corporate email (`admin@kibo360.com`) or assigned username.
3. Enter your password. Accounts lock automatically for 15 minutes after 5 consecutive failed attempts.
4. Click **Sign In to ERP**.

### 1.2 Navigating the System
- **Sidebar**: Access all 18 core modules on the left panel (Chart of Accounts, Journal, Catalogue, Publishing, Inventory, Sales, Royalties, Distributors, Banking, Taxes, Reports, Security).
- **Company & Branch Switcher**: Located in the top header. Switch branches (e.g. Delhi HQ, Mumbai Depot) without re-logging.
- **Global Search (`Ctrl + K`)**: Instantly search by ISBN-13, Book Title, Voucher Number, or Customer Name.

---

## 2. Business Workflow Guides

### Workflow A: Book Publishers (Editorial to Finished Goods)
1. **Create Title**:
   - Go to **Book Catalogue & ISBN** (`/catalogue`) -> Click **Add New Title**.
   - Enter Title, Subtitle, ISBN-10, ISBN-13, SKU, Author, Publisher, MRP, and Wholesale Rate.
   - Click **Save Title**.
2. **Launch Production Order**:
   - Go to **Publishing & Production** (`/publishing`) -> Click **Create Production Order**.
   - Select the Title, specify Print Run (e.g. 3,000 copies), Paper GSM (80 GSM Maplitho), Binding (Section Sewn Paperback).
   - Assign press vendor and binding vendor.
3. **Receive Finished Stock (GRN)**:
   - When printing is complete, go to **Inventory & Godowns** (`/inventory`) -> **Stock Inward**.
   - Enter Reference Number (`PRD-GRN-...`) and select Central Depot. The inventory is automatically available for sale.
4. **Author Royalty Accounting**:
   - Go to **Author Royalties** (`/royalties`).
   - Create Accrual Period (e.g. `Q2 FY26-27`).
   - Click **Calculate Royalty**. The system deducts returns and unadjusted advances, and auto-posts a balanced Journal Voucher:
     $$\text{Dr: Royalty Expense (4010)}, \quad \text{Cr: Royalty Payable (2020)}$$

---

### Workflow B: Book Wholesalers & Distributors
1. **Purchasing Stock**:
   - Go to **Purchases & Bills** (`/purchases`) -> Click **New Purchase Order**.
   - Select Publisher/Paper Mill, specify quantities and agreed trade discount.
   - Upon dock arrival, click **Create GRN** and record accepted and rejected quantities.
2. **Wholesale Invoicing**:
   - Go to **Sales & Invoicing** (`/sales`) -> Click **New Tax Invoice**.
   - Select Dealer/Bookstore, add titles, and select payment terms (e.g. Net 30).
   - Upon submission, the system generates a balanced Sales Voucher:
     $$\text{Dr: Trade Debtors (1010)}, \quad \text{Cr: Book Sales (3001)}$$
3. **Consignment Stock Management**:
   - Go to **Distributors & Dealers** (`/distributors`) -> **Consignment Stock**.
   - Issue stock to regional dealers without booking revenue (`CSG/2026/...`).
   - Monthly, record sales from consignment to convert into formal tax invoices with auto-GL posting.

---

### Workflow C: Retail Bookstores & POS Counters
1. **Opening Cashier Shift**:
   - Go to **Sales & Invoicing** (`/sales`) -> **POS Terminal**.
   - Enter opening float cash (e.g. ₹5,000.00). Click **Open Shift**.
2. **Fast Checkout & Barcode Scanning**:
   - Scan book barcode or type SKU. Items appear instantly with MRP, discount, and GST exemption (0% under HSN 4901).
   - Choose payment channel: Cash, UPI, Card, or Split Payment.
   - Click **Complete Sale**. An 80mm ESC/POS thermal receipt renders instantly.
3. **Day-End Shift Closing**:
   - Go to **Banking & Cash** (`/banking`) -> **Cashier Closing**.
   - Enter counted physical cash denominations (₹500, ₹200, ₹100, ₹50).
   - Click **Reconcile Shift**. If discrepancy is zero, the shift is marked `RECONCILED`.

---

## 3. Financial Statements & MIS Reports

- **Trial Balance** (`/reports` or `/accounts`): View live double-entry trial balance. Total Debits strictly equals Total Credits.
- **Profit & Loss**: View Gross Profit, direct printing costs, author royalties, and operating net margins.
- **Balance Sheet**: Assets equal Total Liabilities plus Equity.
- **Customer & Supplier Ageing**: Drill down into 0-30, 31-60, 61-90, and 90+ day overdue buckets.
- **Statutory Audit Log Export**: External auditors can download RFC-4180 CSV logs capturing all voucher creation, approvals, and diffs.
