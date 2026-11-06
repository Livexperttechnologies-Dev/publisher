# KIBO360 Enterprise Publishing & Financial ERP
## Master User Operation Guide & Standard Operating Procedures (SOP)

---

## 1. Executive Overview & Problem-Solution Matrix

### 1.1 The Industry Challenge
Book publishers and book distributors face unique operational and statutory bottlenecks that traditional generic accounting packages (Tally, QuickBooks, Zoho) fail to address:
- **Disjointed Publishing Workflows**: Manuscript contracting, ISBN registration, press print orders, and paper mill allocations run in separate spreadsheets from financial ledgers.
- **Complex Author Royalties**: Dynamic tier structures (e.g. 7.5% on first 2,000 copies, 10% on next 3,000, 12.5% thereafter), advance recoupment, and statutory Indian Section 194J TDS deductions require tedious manual calculations.
- **Consignment Stock Risk**: Books shipped on consignment or sale-or-return terms across regional distributors distort revenue and inventory accuracy.
- **Retail vs. Wholesale Bifurcation**: Operating retail bookstore counters with 80mm thermal receipts alongside high-volume wholesale distributor credit invoicing.

### 1.2 The KIBO360 Unified Solution
**KIBO360** eliminates departmental silos by marrying end-to-end publishing lifecycle logistics directly with an audit-sealed, double-entry General Ledger.

Every operational action—from receiving 5,000 copies of a textbook to discounting damaged customer returns—automatically posts balanced debit-credit entries into the General Ledger.

---

## 2. User Roles & Permission Personas

KIBO360 includes 14 granular publishing roles with row-level data scope isolation:

| Persona | Primary Modules | Key Daily Tasks |
| :--- | :--- | :--- |
| **Managing Director / Board** | Dashboard (`/`), MIS Reports (`/reports`), Security (`/security`) | Executive turnover monitoring, profit margins, company health, audit logs |
| **Chief Financial Controller (CFC)** | Chart of Accounts (`/accounts`), Journal (`/vouchers`), Taxes (`/taxation`) | Approving high-value vouchers (> ₹50k), locking accounting periods, signing tax returns |
| **Senior Accountant** | Vouchers (`/vouchers`), Banking (`/banking`), Expenses (`/expenses`) | Double-entry voucher entry, bank statement reconciliation (BRS), asset depreciation |
| **Editorial & Royalty Manager** | Catalogue (`/catalogue`), Royalties (`/royalties`) | Author onboarding, royalty tier setup, quarterly royalty calculations, Form 16A certificates |
| **Press & Production Manager** | Production (`/publishing`), Purchases (`/purchases`), Inventory (`/inventory`) | Print job scheduling, paper GSM procurement, press variances, proofing sign-offs |
| **Warehouse & Depot Supervisor** | Inventory (`/inventory`), Returns (`/returns`) | Stock inward (GRN), delivery challans, quarantine bin audits, godown transfers |
| **Wholesale Sales Executive** | Sales (`/sales`), Distributors (`/distributors`) | Wholesale tax invoices, distributor credit monitoring, debtor aging follow-ups |
| **Retail POS Cashier** | POS Counter (`/pos`), Banking (`/banking`) | Barcode scanning, split payment tendering (Cash/UPI/Card), shift cash denomination closing |
| **Statutory / Tax Auditor** | Security (`/security`), Reports (`/reports`), Taxation (`/taxation`) | RFC-4180 audit trail review, Trial Balance verification, GSTR-1/3B reconciliation |

---

## 3. Step-by-Step Module Walkthroughs

### Module 1: Financial Operations Dashboard (`/`)
- **Purpose**: Real-time high-level visibility over working capital, cash balances, sales velocity, and pending operational approvals.
- **Key Actions**:
  1. **Review KPIs**: Check Current Working Capital, Liquid Cash & Bank, Net Invoiced Turnover, and Overdue Trade Debtors.
  2. **Approval Action Center**: Review expense claims and credit notes requiring manager sign-off (> ₹50,000). Click **Approve** or **Reject**.
  3. **Trend Analysis**: Monitor monthly revenue versus expenditure trends through the interactive visualizer.

---

### Module 2: Chart of Accounts & General Ledger (`/accounts`)
- **Purpose**: Manage the 5-tier hierarchical Chart of Accounts (Assets, Liabilities, Equity, Income, Expenses).
- **Key Actions**:
  1. **Drill Down into Ledgers**: Expand parent heads (e.g. `1000 Assets` -> `1010 Current Assets` -> `1012 Trade Debtors`) to view sub-accounts.
  2. **Create New Account**: Click **Add General Ledger Account**, select Parent Group, enter Code, Account Name, and opening balance.
  3. **Verify Ledger Balances**: Check live Dr/Cr balance calculations updated in real-time from posted journal entries.

---

### Module 3: Journal & Vouchers Management (`/vouchers`)
- **Purpose**: Create and audit double-entry transactions across 7 voucher types (Journal `JV`, Sales `SV`, Purchase `PV`, Receipt `RV`, Payment `PV`, Credit Note `CN`, Debit Note `DN`).
- **Key Actions**:
  1. **Draft a Voucher**: Click **New Journal Voucher**, select Voucher Type and posting date.
  2. **Add Debit/Credit Legs**: Select GL accounts, enter debit and credit amounts, and add line narration.
  3. **Strict Equilibrium Validation**: The system blocks posting if `Total Debits != Total Credits`.
  4. **Post to Ledger**: Click **Post Balanced Voucher**. Once posted, the voucher is sealed and recorded in the audit trail.

---

### Module 4: Book Catalogue & ISBN Management (`/catalogue`)
- **Purpose**: Master repository of publishing assets, metadata, imprint branding, and stock valuation.
- **Key Actions**:
  1. **Register Title**: Click **Add New Title**, enter Title, Subtitle, ISBN-10, ISBN-13, SKU, Author, Edition, and Page Count.
  2. **Set Commercial Pricing**: Configure MRP, Wholesale Trade Discount Rate, and Author Royalty Contract.
  3. **Imprint Assignment**: Categorize under your corporate imprints (Academic, School K-12, Literary, Trade).
  4. **Inventory Valuation**: Displays live stock count and total inventory valuation based on FIFO / Weighted Average.

---

### Module 5: Publishing & Production Management (`/publishing`)
- **Purpose**: Manage the manufacturing lifecycle from manuscript proofing to press print runs and binderies.
- **Key Actions**:
  1. **Issue Print Production Order**: Select Title, define Print Quantity (e.g. 5,000 copies), Paper Specs (80 GSM Maplitho, 300 GSM Art Card cover), and assign Press Vendor.
  2. **Track Job Stages**: Progress orders across status boards (`PLANNED` -> `PRE_PRESS` -> `PRINTING` -> `BINDING` -> `COMPLETED`).
  3. **Press Variance & Cost Audit**: Compare planned unit cost versus actual press invoice to capture cost overruns.

---

### Module 6: Inventory & Godowns Management (`/inventory`)
- **Purpose**: Multi-depot stock control, bin allocations, stock adjustments, and inter-godown transfers.
- **Key Actions**:
  1. **Goods Receipt Note (GRN)**: When printed books arrive from press, click **Stock Inward (GRN)**, select Depot, and record accepted count.
  2. **Inter-Godown Transfer**: Move stock between Central Depot and Regional Depots with Delivery Challans (`DC/2026/...`).
  3. **Physical Stock Audit**: Record stocktaking reconciliations and book shrinkage adjustments automatically to GL Account `5020 (Inventory Shrinkage Expense)`.

---

### Module 7: Sales & Invoicing / POS Counter (`/sales`, `/pos`)
- **Purpose**: Dual billing channels for high-volume wholesale distributor distribution and walk-in retail bookstores.
- **Wholesale Invoicing (`/sales`)**:
  1. Click **Create Tax Invoice**, select Customer/Distributor, payment terms (Net 30, Net 60), and line items.
  2. GST automatically calculates based on HSN (0% for printed books under HSN 4901; 18% for digital/merchandise).
  3. Click **Issue Invoice**: Auto-generates formal invoice PDF and posts Sales Voucher (`SV/2026/...`).
- **Retail POS Terminal (`/pos`)**:
  1. Enter cashier float cash and click **Open Shift**.
  2. Scan barcode or search title.
  3. Select Tender Type: Cash, Card, UPI, or Split Payment.
  4. Click **Complete Sale**: Renders instant 80mm ESC/POS thermal receipt.

---

### Module 8: Distributors, Wholesalers & Dealers (`/distributors`)
- **Purpose**: Credit management, trade discounts, regional distribution channels, and consignment stock.
- **Key Actions**:
  1. **Distributor Master Setup**: Configure credit limits (e.g. ₹5,00,000) and credit days (45 days).
  2. **Consignment Depots**: Track stock located at distributor premises without booking prematurely into revenue.
  3. **Debtor Aging Schedule**: Filter accounts by current, 30, 60, 90+ days overdue buckets.
  4. **Record Receipt**: Settle distributor payments directly against open invoices with cash discounts.

---

### Module 9: Author Royalties & Advances Management (`/royalties`)
- **Purpose**: Calculation, statement generation, advance recoupment, and statutory Indian Section 194J TDS compliance.
- **Key Actions**:
  1. **Author Contract Setup**: Configure tiered royalty rates (e.g. 7.5% up to 2k copies, 10% next 3k, 12.5% beyond).
  2. **Advance Disbursement**: Record non-returnable / recoupable advance vouchers.
  3. **Run Royalty Accrual**: Select fiscal quarter (e.g. `Q2 FY26-27`). System computes net eligible sales (Gross Invoiced less Returns), deducts unadjusted advances, and applies 10% TDS under Section 194J.
  4. **Auto-Voucher Posting**: Auto-posts Journal Voucher:
     Dr: Royalty Expense (4010) Cr: Royalty Payable (2020), Cr: TDS Payable 194J (2031)
  5. **Export Statements**: Print or email digital Royalty Statements to authors.

---

### Module 10: Purchases & Bills / Vendor Management (`/purchases`)
- **Purpose**: Procure raw materials (paper reels, binding cloth) and services (typesetting, plate making, printing).
- **Key Actions**:
  1. **Create Purchase Order (PO)**: Select Vendor/Paper Mill, specify delivery date, rates, and tax terms.
  2. **3-Way Matching**: Match PO against incoming GRN (physical quantity) and Vendor Invoice (bill value).
  3. **Book Vendor Bill**: Generates Purchase Voucher (`PV/2026/...`) crediting Trade Creditors (`2010`).
  4. **Vendor Settlement**: Disburse payment via bank transfer and generate Payment Voucher.

---

### Module 11: GST & Indian Taxation Engine (`/taxation`)
- **Purpose**: Automated compliance with Indian Goods & Services Tax (GST) and E-Invoicing standards.
- **Key Actions**:
  1. **GSTR-1 Statement**: View live outward B2B, B2C Large, B2C Small, and Nil-Rated (HSN 4901) summaries.
  2. **GSTR-3B Input Tax Credit (ITC)**: Reconcile eligible ITC on printing inputs against vendor bills.
  3. **E-Invoice IRN Simulator**: Generate 64-character SHA-256 Invoice Reference Numbers (IRN) and QR codes for high-turnover compliance.

---

### Module 12: Banking & Cash Management (`/banking`)
- **Purpose**: Centralized multi-bank ledger management, cash in hand, and Bank Reconciliation Statements (BRS).
- **Key Actions**:
  1. **Bank Statement Import**: Review uncredited cheques and unpresented payments.
  2. **Bank Reconciliation Statement (BRS)**: Match company books with bank balance to achieve zero variance.
  3. **Cashier Denomination Reconciliation**: Cashiers count physical notes (₹500, ₹200, ₹100, ₹50) and submit daily cash tallies.

---

### Module 13: Expenses, Fixed Assets & Budgeting (`/expenses`)
- **Purpose**: Corporate expense vouchers, employee reimbursements, SLM/WDV asset depreciation, and budget variance.
- **Key Actions**:
  1. **Claim Expenses**: Staff log travel, exhibition, and courier claims with attached digital bills.
  2. **Manager Approval Gateway**: Expenses exceeding ₹50,000 trigger approval locks.
  3. **Run Asset Depreciation**: Compute monthly Straight-Line (SLM) or Written Down Value (WDV) depreciation on printing presses and computer hardware, auto-posting depreciation JV.
  4. **Budget vs. Actuals**: Track departmental burn rates against sanctioned fiscal budgets.

---

### Module 14: Returns, Damaged Stock & Financial Adjustments (`/returns`)
- **Purpose**: Customer return processing, credit notes, vendor debit notes, and damaged book quarantine.
- **Key Actions**:
  1. **Process Sales Return**: Inspect returned titles. Good copies return to active stock; damaged copies route to Quarantine Bin.
  2. **Issue Credit Note**: System issues Credit Note (`CN/2026/...`) reversing debtor balance.
  3. **Quarantine Stock Action**: Discard or scrap damaged book inventory with automatic write-off Journal Voucher.
  4. **Distributor Reconciliations**: Issue consignment reconciliation statements with net billing adjustments.

---

### Module 15: Financial Reports & MIS Statements (`/reports`)
- **Purpose**: Statutory financial statements, debtor aging, title profitability, and stock reorder intelligence.
- **Key Actions**:
  1. **Live Profit & Loss (P&L)**: Real-time Gross Profit, Production Costs, Royalty Burden, and Operating Margins.
  2. **Trial Balance & Cash Flow**: Real-time confirmation of zero Dr/Cr imbalance.
  3. **Title Profitability Matrix**: Discover high-margin bestsellers versus loss-making titles.
  4. **Critical Reorder Alerts**: Flag titles falling below safety threshold with recommended press print runs.

---

### Module 16: Company Settings, Users, Roles & Security (`/company-config`, `/users`, `/roles`, `/security`, `/notifications`)
- **Purpose**: Enterprise governance, branch depots, user administration, SOC-2 audit logs, and automated workflows.
- **Key Actions**:
  1. **Company & Fiscal Setup**: Manage corporate legal details, GSTIN, PAN, and lock closed accounting months.
  2. **User & Role Administration**: Manage staff logins, enforce two-factor authentication, and configure granular RBAC rights.
  3. **Statutory Audit Log**: Inspect every login, voucher posting, and permission adjustment with timestamps, user IP, and old/new state values. Export to CSV.
  4. **Automated Database Backups**: Trigger AES-256 encrypted snapshots and execute Point-in-Time Recovery (PITR) drills.
  5. **Automation Rules**: Manage automated overdue invoice reminders and inventory stock alerts via WhatsApp, SMS, and Email.

---

## 4. Security, Data Safety & Best Practices

1. **Daily Operational Discipline**:
   - Always verify that the Trial Balance is in equilibrium before closing accounting periods.
   - Lock completed accounting months in `/company-config` to prevent unauthorized backdated edits.
2. **Local Storage & Offline Resilience**:
   - The application maintains full state in encrypted browser storage (`localStorage`) ensuring complete offline continuity during network interruptions.
3. **Audit Readiness**:
   - Statutory auditors can be assigned the read-only `Auditor` role in `/users`, allowing them to inspect vouchers and download CSV audit logs without edit permissions.
4. **Disaster Recovery**:
   - Regularly trigger on-demand encrypted database snapshots in `/security`.

---
*KIBO360 Enterprise ERP &bull; Certified SOC-2 Statutory Compliant &bull; Powered by Double-Entry Ledger Engine*
