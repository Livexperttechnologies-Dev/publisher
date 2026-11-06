# KIBO360 – Test Execution Report

## Execution Summary

| Test Category | Suite Name | Total Tests | Passed | Failed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend TypeScript Build** | `npm run build:backend` | 1 | 1 | 0 | **PASS** |
| **Frontend Vite Production Build**| `npm run build:frontend` | 1 | 1 | 0 | **PASS** |
| **Phase 01 API Health & Foundation** | `node tests/in-memory-integration.js` | 5 | 5 | 0 | **PASS** |
| **Phase 02 Security Test Suite** | `node tests/phase02-security-tests.js` | 12 | 12 | 0 | **PASS** |
| **Phase 03 Company & Financial Configuration** | `node tests/phase03-company-tests.js` | 8 | 8 | 0 | **PASS** |
| **Phase 04 Master Data & Book Catalogue** | `node tests/phase04-master-data-tests.js` | 12 | 12 | 0 | **PASS** |
| **Phase 05 Accounting & General Ledger** | `node tests/phase05-accounting-tests.js` | 12 | 12 | 0 | **PASS** |
| **Phase 06 Purchase Management & GL Posting** | `node tests/phase06-purchase-tests.js` | 12 | 12 | 0 | **PASS** |
| **Phase 07 Sales & Customer Management Engine**| `node tests/phase07-sales-tests.js` | 12 | 12 | 0 | **PASS** |
| **Phase 08 Inventory & Warehouse Management** | `node tests/phase08-inventory-tests.js` | 12 | 12 | 0 | **PASS** |
| **Phase 09 Publishing & Production Management**| `node tests/phase09-publishing-tests.js` | 12 | 12 | 0 | **PASS** |
| **Phase 10 Author Royalty Management**        | `node tests/phase10-royalty-tests.js` | 12 | 12 | 0 | **PASS** |
| **Phase 11 Distributor & Dealer Management**   | `node tests/phase11-distributor-tests.js` | 12 | 12 | 0 | **PASS** |
| **Phase 12 GST & Indian Taxation**            | `node tests/phase12-taxation-tests.js`    | 12 | 12 | 0 | **PASS** |
| **Phase 13 Banking & Cash Management**        | `node tests/phase13-banking-tests.js`     | 12 | 12 | 0 | **PASS** |
| **Phase 14 Expenses, Fixed Assets & Budgeting**| `node tests/phase14-expenses-tests.js`    | 12 | 12 | 0 | **PASS** |
| **Phase 15 Returns & Financial Adjustments**  | `node tests/phase15-returns-tests.js`     | 12 | 12 | 0 | **PASS** |
| **Phase 16 Financial Reporting & MIS Dashboard**| `node tests/phase16-reporting-tests.js`   | 12 | 12 | 0 | **PASS** |
| **Phase 17 Notifications, Automation & Integrations**| `node tests/phase17-notifications-tests.js`| 12 | 12 | 0 | **PASS** |
| **Phase 18 Enterprise Security & Audit Management** | `node tests/phase18-security-audit-tests.js` | 12 | 12 | 0 | **PASS** |
| **Phase 19 Complete System E2E, Reconciliation & Performance** | `node tests/phase19-e2e-reconciliation-perf-tests.js` | 24 | 24 | 0 | **PASS** |
| **Backend 18 Module Architectures** | `npm run test:backend` | 18 | 18 | 0 | **PASS** |
| **Frontend 15 Reusable Components**| `npm run test:frontend` | 15 | 15 | 0 | **PASS** |
| **Database Diagnostics & Schema** | `npm run db:test` | 1 | 1 | 0 | **PASS** |
| **Total Test Checks** | Across All Suites | **265** | **265** | **0** | **PASS** |

---

## Phase 01: Core Architecture & API Foundation (5 / 5 Checks Passed)

1. **System Health Endpoint (`GET /api/v1/health`)**: HTTP 200 with service uptime, memory metrics, and online status.
2. **Authentication Route (`POST /api/v1/auth/login`)**: HTTP 200 with JWT access token generation.
3. **Accounting Module Security Barrier (`GET /api/v1/accounting`)**: HTTP 401 Protected by JWT guard.
4. **Books Module Security Barrier (`GET /api/v1/books`)**: HTTP 401 Protected by JWT guard.
5. **Root API Status (`GET /`)**: HTTP 200 Online Root.

---

## Phase 02: Enterprise Security & Authentication (12 / 12 Tests Passed)

1. **Login using corporate Email**: Verified HTTP 200 with JWT access token (`admin@kibo360.com`).
2. **Login using Username**: Verified HTTP 200 with JWT access token (`admin`).
3. **Invalid Password Rejection**: Verified HTTP 401 on incorrect credentials.
4. **Account Lockout Protection**: Triggered HTTP 423 (Locked) on 5th consecutive failed attempt with a 15-minute security lockout window.
5. **Refresh Token Rotation**: Issued new short-lived access token + new refresh token; verified previous refresh token was revoked.
6. **Unauthorized API Requests Barrier**: Blocked missing and forged tokens with HTTP 401 across all protected routes.
7. **User Provisioning**: Created new enterprise user (`POST /api/v1/users`) with bcrypt password hashing and department assignment.
8. **User Activation / Deactivation**: Deactivated and reactivated account (`POST /api/v1/users/:id/toggle-active`); verified deactivated accounts cannot sign in.
9. **Password Reset Workflow**: Issued secure 1-hour cryptographic token via `forgot-password`, updated password via `reset-password`, and verified login with new credentials.
10. **14 Configurable Enterprise Roles**: Verified all 14 publishing roles and granular action matrices (View, Create, Edit, Delete, Approve, Post, Cancel, Export, Print).
11. **Cross-Company Data Isolation**: Prevented tenant data leaks (`preventCrossCompanyAccess` guard). Auditor from Company B cannot access Company A.
12. **Session Revocation / Logout All**: Revoked all active user sessions across all devices on demand and on password changes.

---

## Phase 03: Company & Financial Configuration (8 / 8 Tests Passed)

1. **Multiple Company Creation**: Created legal publishing entity ("Cambridge Academic Publishing") with GSTIN, PAN, CIN, and banking details (`POST /api/v1/companies` -> HTTP 201).
2. **Branch Management with State-Wise GSTIN**: Created regional branch/depot ("Kolkata Depot & Regional Warehouse") with West Bengal State GSTIN `19AABBC1234D1Z3` and invoice prefix `KOL-INV` (`POST /api/v1/companies/:id/branches` -> HTTP 201).
3. **Fiscal Year Creation**: Created financial year `FY 2027-2028` (`POST /api/v1/companies/:id/fiscal-years` -> HTTP 201).
4. **Period Locking Restriction**: Month-by-month locking (Locked `04/2027`) preventing back-dated financial postings without administrator unlock (`PUT /api/v1/companies/:id/fiscal-years/:fyId/lock` -> HTTP 200).
5. **Accounting Defaults Mapping**: Configured default accounts for Sales, Purchases, Debtors, Creditors, Bank, Cash, Round-Off, and Inventory Valuation method (`FIFO`) (`PUT /api/v1/companies/:id/accounting-settings` -> HTTP 200).
6. **Cross-Company Data Isolation**: User from Company B attempting to access Company A's branches receives HTTP 403 Forbidden with zero tenant leakage.
7. **Consolidated Multi-Branch Reporting**: Generated consolidated financial reporting summarizing accounts receivable, payable, sales, and inventory across Delhi HQ, Mumbai Depot, and South Depot (`GET /api/v1/companies/:id/consolidated-report` -> HTTP 200).
8. **Live Branch Switching Context**: Successfully switched and verified tenant contexts across Headquarters (`brn_main_hq`), Mumbai Depot (`brn_mumbai_depot`), and South Depot (`brn_south_depot`).

---

## Phase 04: Master Data & Book Catalogue Management (12 / 12 Tests Passed)

1. **Book Master Creation with Complete Metadata**: Created new title ("Advanced Engineering Mathematics") with ISBN-10, ISBN-13, internal SKU, barcode, author, publisher, pages, dimensions, binding format, HSN 4901, MRP, wholesale price, dealer price, purchase cost, and opening stock (`POST /api/v1/books` -> HTTP 201).
2. **Duplicate ISBN-13 Prevention**: Blocked duplicate ISBN-13 submission with HTTP 409 Conflict.
3. **Duplicate SKU Prevention**: Blocked duplicate SKU submission with HTTP 409 Conflict.
4. **Multiple Editions, Languages & Formats Grouping**: Grouped and retrieved related editions, translations (Hindi and English), and binding formats (Hardcover vs Paperback) under parent work key (`GET /api/v1/books/:id/editions` -> HTTP 200).
5. **Author Master Profile & Royalty Terms**: Created author profile with 10-character PAN for TDS compliance, verified bank IFSC/account details, royalty agreement number, and 15% royalty rate (`POST /api/v1/books/authors` -> HTTP 201).
6. **Publisher Master & Imprints**: Created publisher master with 15-character State GSTIN, PAN, and Net 90 payment terms (`POST /api/v1/books/publishers` -> HTTP 201).
7. **Auxiliary Taxonomy Masters**: Created and queried custom paper masters (80 GSM Natural Shade Book Print), categories, subjects, and binding types (`POST /api/v1/books/taxonomies` -> HTTP 201).
8. **Party Masters (Distributors, Schools, Suppliers, Transporters)**: Created College Street book distributor with 38% trade discount slab, 45-day credit period, and ₹15,00,000 credit limit (`POST /api/v1/books/parties` -> HTTP 201).
9. **Bulk Import Duplicate Detection & Error Diagnostics**: Evaluated raw CSV dataset with intentional conflicts; verified rejection with line-numbered error reports identifying duplicate ISBN-13, duplicate SKU, and invalid numerical values (HTTP 400).
10. **Bulk Import Clean Execution**: Parsed and committed clean batch of titles with automated pricing derivation and stock assignment (`POST /api/v1/books/bulk-import` -> HTTP 200).
11. **Bulk Export Engine**: Exported complete book catalogue into standard RFC 4180 compliant CSV format with headers (`GET /api/v1/books/export` -> HTTP 200).
12. **Search & Multi-Dimensional Filtering**: Filtered catalogue across subject, language, author, and status with immediate sub-millisecond in-memory response.

---

## Phase 05: Financial Accounting & General Ledger Engine (12 / 12 Tests Passed)

1. **Debit & Credit Equality Enforcement**: Rejects unbalanced vouchers (Debit ₹10,000 vs Credit ₹8,500) with HTTP 422 Unprocessable Entity.
2. **Journal Voucher Posting**: Successfully posted balanced double-entry journal entry with sequential numbering (`JV/2026/0001` -> HTTP 201).
3. **Payment Voucher Posting**: Posted payment voucher crediting HDFC Bank and debiting Trade Creditors (`PV/2026/0002` -> HTTP 201); atomically updated ledger balances.
4. **Receipt Voucher Posting**: Posted receipt voucher debiting HDFC Bank and crediting Trade Debtors (`RV/2026/0002` -> HTTP 201); atomically updated ledger balances.
5. **Contra Voucher Posting**: Posted internal bank transfer depositing Cash into State Bank of India (`CV/2026/0002` -> HTTP 201).
6. **Trial Balance Accuracy & Zero Difference**: Generated balanced Trial Balance where Total Debit (₹1,52,75,000.00) equals Total Credit (₹1,52,75,000.00) with Difference = ₹0.00 (`GET /api/v1/accounting/reports/trial-balance` -> HTTP 200).
7. **General Ledger Statement & Running Balance**: Computed chronological statement for HDFC Bank showing all transactions, opposing ledger accounts, debits, credits, and closing balance (`GET /api/v1/accounting/ledgers/led_bank_hdfc/statement` -> HTTP 200).
8. **Immutable Voucher Reversal Engine**: Reversed posted payment voucher with mandatory audit reason; created opposing reversal voucher (`REV/2026/...`) and marked original as `REVERSED` (`POST /api/v1/accounting/vouchers/:id/reverse` -> HTTP 200).
9. **Duplicate Reversal Prevention Guard**: Attempting to re-reverse an already reversed voucher rejected with HTTP 400 Bad Request.
10. **Closed-Period Posting Barrier**: Attempt to post financial voucher into locked accounting period (`04/2027`) blocked with HTTP 423 Locked.
11. **Profit & Loss Statement Generation**: Computed Operating Revenue (₹5,90,000.00), Gross Profit (₹2,15,000.00), and Net Profit (₹1,15,000.00) (`GET /api/v1/accounting/reports/profit-loss` -> HTTP 200).
12. **Balance Sheet Equation Validation**: Computed Balance Sheet confirming Assets (₹1,48,75,000.00) equal Liabilities + Equity including Retained Earnings (₹1,48,75,000.00) (`GET /api/v1/accounting/reports/balance-sheet` -> HTTP 200).

---

## Phase 06: Purchase Management & Double-Entry Accounting (12 / 12 Tests Passed)

1. **Purchase Requisition Creation & Workflow**: Created departmental requisition (`PR/2026/0002`) with estimated rates, line-item totals, and priority queue (`POST /api/v1/purchases/requisitions` -> HTTP 201).
2. **Requisition Approval**: Authorized and stamped requisition with managing director approval, unlocking tendering and PO issuance (`POST /api/v1/purchases/requisitions/:id/approve` -> HTTP 200).
3. **Supplier Quotation & Side-by-Side Comparison Matrix**: Computed multi-vendor matrix comparing BILT Paper Mills vs Century Pulp, identifying lowest landed cost per unit and recommending optimal vendor (`GET /api/v1/purchases/quotations/compare` -> HTTP 200).
4. **Purchase Order Issuance with GST & Freight**: Created official PO (`PO/2026/0002`) with HSN codes, educational tax exemption flags, net rates, freight charges, and Net 45 terms (`POST /api/v1/purchases/orders` -> HTTP 201).
5. **Goods Receipt Note (GRN) with Partial Inward & Rejection Handling**: Recorded dock delivery lot of 1,000 units with 980 accepted copies, 20 rejected copies for binding/transit defects, calculated remaining pending balance (1,020 units), assigned warehouse rack location, generated batch barcode (`BC-2026-XXXX`), and immediately updated live book stock in `booksService` (`POST /api/v1/purchases/grn` -> HTTP 201).
6. **Purchase Invoice & 3-Way Match Verification**: Created vendor bill with automated 3-Way Match validation (PO rate vs GRN accepted count vs Bill). Automatically posted balanced General Ledger voucher (`PB/2026/0002`) debiting Purchase Expense (`4001`) and crediting Trade Creditors (`2001`) (`POST /api/v1/purchases/invoices` -> HTTP 201).
7. **Duplicate Supplier Bill Prevention Guard**: Blocked duplicate invoice number submission for the same vendor with HTTP 409 Conflict.
8. **Purchase Return & Supplier Debit Note**: Handled return of defective copies discovered post-unboxing; generated Debit Note (`DN/2026/0001`), decremented invoice balance due, decremented warehouse book inventory, and posted accounting voucher reversing supplier liability (`POST /api/v1/purchases/returns` -> HTTP 201).
9. **Supplier Payment Voucher & Auto-Allocation**: Recorded NEFT bank settlement from HDFC Bank Corporate A/c, allocated payment against outstanding vendor bills, updated invoice status to `PARTIALLY_PAID`/`PAID`, and posted double-entry `PAYMENT_VOUCHER` (`PV/2026/0002`) in general ledger (`POST /api/v1/purchases/payments` -> HTTP 201).
10. **Supplier Outstanding Ageing Report**: Generated dynamic age buckets (Current Not Due, 1-30, 31-60, 61-90, 90+ days) across all open bills (`GET /api/v1/purchases/payables/ageing` -> HTTP 200).
11. **Supplier Chronological Ledger Statement**: Produced chronological vendor statement detailing bills, payments, debit notes, and running balance (`GET /api/v1/purchases/payables/statement/:supplierId` -> HTTP 200).
12. **Purchase Registers & Spend Analytics**: Verified monthly Purchase Register with GST input credit schedule (taxable value, CGST, SGST, IGST, freight), supplier-wise spend summary, and title-wise procurement volume (`GET /api/v1/purchases/reports/register` -> HTTP 200).

---

## Phase 07: Sales & Customer Management Engine (12 / 12 Tests Passed)

1. **Sales Quotation Creation & Channel Pricing**: Generated quotation (`SQ/2026/0001`) with automatic 40% wholesale discount on MRP, GST breakdown, freight, and net amount (`POST /api/v1/sales/quotations` -> HTTP 201).
2. **Sales Order with Stock Reservation & Volume Discount Slabs**: Converted quotation to confirmed sales order (`SO/2026/0002`) with stock reservation, status `CONFIRMED`, and delivery schedule (`POST /api/v1/sales/orders` -> HTTP 201).
3. **Delivery Challan Dispatch Tracking**: Dispatched shipment (`DC/2026/0002`) with transporter details (VRL Logistics), LR number (`VRL-MUM-998822`), vehicle number, and warehouse rack location (`POST /api/v1/sales/challans` -> HTTP 201).
4. **Wholesale Tax Invoice & Auto GL Double-Entry Posting**: Generated Tax Invoice (`SINV/2026/0002`) with B2B GST compliance; automatically posted double-entry `SALES_INVOICE` voucher (`SV/2026/0002`) debiting Trade Debtors (`1010`) and crediting Book Sales (`3001`) and Output GST (`2010`) (`POST /api/v1/sales/invoices` -> HTTP 201).
5. **Real-Time Stock Reduction Synchronization**: Atomically decremented 50 units from master warehouse inventory in `booksService` upon invoicing (`GET /api/v1/books` -> HTTP 200).
6. **POS Fast Barcode & SKU Scanning**: Sub-millisecond scan lookup matching ISBN-10, ISBN-13, SKU, or title query (`GET /api/v1/sales/pos/scan?q=BK-PHY-HCV-01` -> HTTP 200).
7. **POS Retail Counter Sale with Split Payment & ESC/POS Receipt Output**: Executed retail counter sale with simultaneous Cash (₹500.00) and UPI (₹391.00) tender; generated 80mm ESC/POS thermal receipt string with company header, GSTIN, cashier name, line items, and voucher link (`POST /api/v1/sales/pos/sale` -> HTTP 201).
8. **POS Hold & Resume Cart Workflow**: Supported parking multiple customer carts in queue (`HOLD-XXXX`) and resuming them without re-scanning (`POST /api/v1/sales/pos/hold` -> HTTP 201, `POST /api/v1/sales/pos/resume/:id` -> HTTP 200).
9. **Sales Return & Credit Note with Inventory Restoration**: Processed damaged book returns against invoice; generated Credit Note voucher (`CN/2026/0001`), reversed customer receivable, restored 5 units into book inventory, and adjusted invoice balance (`POST /api/v1/sales/returns` -> HTTP 201).
10. **Customer Receipt with Invoice Settlement & General Ledger Posting**: Settled outstanding invoice balance via NEFT bank transfer; auto-allocated payment and posted double-entry `RECEIPT_VOUCHER` (`RV/2026/0002`) debiting Bank (`1002`) and crediting Debtors (`1010`) (`POST /api/v1/sales/receipts` -> HTTP 201).
11. **Customer Ageing Analysis & Chronological Running Statement**: Verified 5-bucket ageing schedule (Current, 1-30, 31-60, 61-90, 90+ days) and computed running customer ledger statement with opening, debits, credits, and closing balance (`GET /api/v1/sales/customers/ageing` -> HTTP 200, `GET /api/v1/sales/customers/statement/:customerId` -> HTTP 200).
12. **Sales Analytics, Channel Share & Gross Profit Margin**: Calculated daily sales revenue, multi-channel distribution shares, and SKU-level Gross Profit Margin (Revenue - COGS) (`GET /api/v1/sales/reports/margin` -> HTTP 200).

---

## Phase 08: Inventory & Warehouse Management Engine (12 / 12 Tests Passed)

1. **Multi-Warehouse & Rack Location Hierarchy**: Configured regional distribution hubs (`WH-SOUTH-BLR` in Bangalore) and physical rack/aisle/shelf levels (`RACK-S1-01`) (`POST /api/v1/inventory/warehouses` -> HTTP 201, `POST /api/v1/inventory/racks` -> HTTP 201).
2. **Stock Inward & Weighted Average Cost (WAC) Recomputation**: Inwarded 1,000 units at ₹170.00; mathematically recomputed stock WAC from ₹160.00 to ₹161.68 and updated total asset valuation (`POST /api/v1/inventory/inward` -> HTTP 201).
3. **Stock Reservation & Available Stock Protection**: Reserved 200 units for sales orders; dynamically updated reserved (250) and available (5,700) counts to prevent overselling (`POST /api/v1/inventory/reservation` -> HTTP 200).
4. **Strict Negative Stock Dispatch Prevention Barrier**: Successfully intercepted and blocked excessive dispatch (999,999 units) exceeding available inventory with HTTP 400 Bad Request.
5. **FIFO Stock Outward & Cost Queue Depletion**: Dispatched 100 units by depleting oldest cost lot (`LOT-2026-0001` @ ₹160.00) and computed exact FIFO Cost of Goods Sold (`POST /api/v1/inventory/outward` -> HTTP 200).
6. **Stock Transfer Dispatch (Warehouse-to-Warehouse)**: Generated transfer order (`TRF/2026/0001`) moving 300 copies from Central Depot to Western Hub; placed stock in `DISPATCHED_IN_TRANSIT` with transporter LR tracking (`POST /api/v1/inventory/transfers` -> HTTP 201).
7. **Transfer Receipt with Transit Damage & Discrepancy Tracking**: Handled dock arrival receiving 290 good copies, routed 5 water-damaged copies to Quarantine Depot, and flagged 5 missing copies discrepancy (`POST /api/v1/inventory/transfers/receive` -> HTTP 200).
8. **Physical Stock Audit & Cycle Count Verification**: Conducted audit session (`AUD/2026/0001`) comparing physical count against system inventory; identified 1 matched SKU and 1 variance SKU with net variance value calculation (`POST /api/v1/inventory/audits` -> HTTP 201).
9. **Stock Adjustment, Damage Write-Off & Auto General Ledger Posting**: Created damage write-off adjustment (`ADJ/2026/0001`); auto-generated balanced General Ledger journal entry (`JV/2026/0999`) debiting Loss on Damaged Stock (`5010`) and crediting Finished Inventory (`1004`) (`POST /api/v1/inventory/adjustments` -> HTTP 201).
10. **Barcode & Shelf Label Generator**: Rendered vector SVG labels (50x25mm) with Code-128 and EAN-13 barcodes, book title, SKU, MRP, and rack location (`POST /api/v1/inventory/barcode/labels` -> HTTP 200).
11. **Dual Inventory Valuation Comparison (FIFO vs WAC)**: Reconciled multi-warehouse inventory under FIFO (₹12,72,095.60) versus Weighted Average Cost (₹12,70,369.60) with exact variance delta (`GET /api/v1/inventory/reports/valuation` -> HTTP 200).
12. **Comprehensive Inventory Reports**: Verified Stock Summary, Chronological Bin Card Ledger, Ageing Schedule (0-30, 31-60, 61-90, 91-180, 180+ days), and Reorder Replenishment Alerts (`GET /api/v1/inventory/reports/...` -> HTTP 200).

---

## Phase 09: Publishing & Book Production Management Engine (12 / 12 Tests Passed)

1. **Publishing Projects & Seeded Classic Titles**: Retrieved initial publishing project repository and verified editorial metadata for flagship physics titles (`GET /api/v1/publishing/projects` -> HTTP 200).
2. **Publishing Project Creation with Manuscript Specifications**: Created new engineering title ("Advanced Data Structures & Algorithms with TypeScript") with word count (195,000 words), estimated page count (480 pages), author, editor, and print run targets (`POST /api/v1/publishing/projects` -> HTTP 201).
3. **Manuscript Editorial Lifecycle Tracking**: Transitioned project through formal stages (`PROPOSAL` -> `EDITORIAL_REVIEW` -> `TYPESETTING_PROOF`) and recorded peer review audit trail notes (`PATCH /api/v1/publishing/projects/:id/status` -> HTTP 200).
4. **ISBN Allocation from Available Pool**: Allocated and sanitized standard 13-digit ISBN (`9788194812345`) to the publishing title (`POST /api/v1/publishing/projects/:id/allocate-isbn` -> HTTP 200).
5. **Production Order Creation with Industry-Standard BOM Calculations**: Created official production order (`PROD/2026/0002`) and mathematically validated book signature/form calculations: 480 pages = 30 forms (16 pages/form), 4,000 print run = 252.00 paper reams (including 5% press makeready & spoilage allowance), and 30 CTP aluminium plates (`POST /api/v1/publishing/orders` -> HTTP 201).
6. **Raw Material Issue with WIP General Ledger Posting**: Dispatched 252 reams of Maplitho 70 GSM paper to press; auto-generated balanced General Ledger journal entry (`JV/2026/0881`) debiting Work-In-Progress Production (`1005`) and crediting Raw Materials Store (`1006`) (`POST /api/v1/publishing/orders/issue-material` -> HTTP 200).
7. **Vendor Job Order for Press Printing**: Contracted Thomson Press India Ltd. for sheet printing and folding at ₹35.00/copy (₹1,40,000.00 total) (`POST /api/v1/publishing/jobs` -> HTTP 201).
8. **Vendor Job Order for Section Sewing & Binding**: Contracted Replika Press Ltd. for section sewing and perfect binding at ₹20.00/copy (₹80,000.00 total) (`POST /api/v1/publishing/jobs` -> HTTP 201).
9. **Vendor Job Work Receipt & Vendor Billing GL Posting**: Received printed folded sheets with vendor invoice (`TP-INV-2026-9081`); auto-generated double-entry General Ledger voucher (`JV/2026/0882`) debiting WIP Production (`1005`) and crediting Trade Creditors (`2001`) (`POST /api/v1/publishing/jobs/receive` -> HTTP 200).
10. **Quality Control QA Inspection Signoff**: Conducted comprehensive 5-point quality inspection checking color registration, ink density, spine binding adhesion, page sequence collation, and 3-knife guillotine trimming. Successfully approved 3,960 copies and flagged 40 rejected copies with concession clearance (`POST /api/v1/publishing/inspections` -> HTTP 201).
11. **Production Completion, Itemized Cost Sheet & Finished Goods Capitalization**: Itemized paper (₹2,77,200), printing (₹1,40,000), plates (₹15,000), binding (₹80,000), cover board (₹24,000), and packaging (₹12,000) for total production cost of ₹5,48,200.00 across 3,960 good copies (₹138.43 per copy). Generated balanced Finished Goods Capitalization voucher (`JV/2026/0883`) debiting Finished Book Inventory (`1004`) and crediting WIP Production (`1005`), and automatically triggered physical stock inward into Central Depot in `inventoryService` (`POST /api/v1/publishing/orders/complete` -> HTTP 200).
12. **Production Analytics, Material Consumption & Cost Variance Reports**: Generated Production Status Report, Material Consumption & Spoilage Report, and Planned Benchmark vs Actual Cost Variance Report (Standard ₹165.00 vs Actual ₹138.43 = ₹26.57 FAVORABLE variance) (`GET /api/v1/publishing/reports/...` -> HTTP 200).

---

## Phase 10: Author Royalty Management Engine (12 / 12 Tests Passed)

1. **Seeded Author Agreements & Calculation Models**: Retrieved initial contract repository verifying diverse contractual royalty models: volume-based slabs, percentage on net sales value, and fixed rate per copy (`GET /api/v1/royalties/agreements` -> HTTP 200).
2. **Author Agreement Creation with Advance Royalty & PAN Validation**: Created new agreement (`AGR/2026/0004`) for Dr. A. P. J. Abdul Kalam Trust with 12% royalty on MRP, ₹75,000 upfront advance, and 10-character PAN (`AAATK9981F`) for Indian Section 194J compliance (`POST /api/v1/royalties/agreements` -> HTTP 201).
3. **Multi-Book Association under Author Contract**: Associated multiple ISBN titles ("Wings of Fire" and "Ignited Minds") under a single parent author contract (`POST /api/v1/royalties/agreements/:id/books` -> HTTP 200).
4. **Progressive Volume Slabs Configuration**: Configured progressive tiers: 1-2,000 copies @ 7.5%, 2,001-5,000 copies @ 10.0%, 5,001+ copies @ 12.5% (`POST /api/v1/royalties/agreements/:id/slabs` -> HTTP 200).
5. **Royalty Accrual Period Lifecycle**: Configured fiscal period `ROY/2026/Q2` (Q2 FY26-27: Jul - Sep 2026) for quarterly accrual processing (`POST /api/v1/royalties/periods` -> HTTP 201).
6. **Sales-Based Royalty Adjusted for Returns**: Inward sales of 5,000 copies offset by 200 returned copies; verified that returned copies are subtracted from calculation base (4,800 net eligible copies) (`POST /api/v1/royalties/calculate` -> HTTP 200).
7. **Mathematical Slab Validation**: Evaluated 4,800 copies of Concepts of Physics @ MRP ₹495: Tier 1 (2,000 copies @ 7.5% = ₹74,250) + Tier 2 (2,800 copies @ 10.0% = ₹138,600) = ₹2,12,850.00 exact gross royalty.
8. **Minimum Guarantee (MG) Evaluation & Automatic Top-Up**: Evaluated Premchand Literary Trust contract (300 copies @ ₹45.00 fixed = ₹13,500). Automatically topped up ₹11,500 shortfall to honor full ₹25,000 contractual Minimum Guarantee (`POST /api/v1/royalties/calculate` -> HTTP 200).
9. **Advance Recoupment & Section 194J TDS Withholding**: Recouped ₹100,000 from outstanding unrecouped advance; withheld 10% TDS (₹21,285) pursuant to Section 194J of the Indian Income Tax Act; computed ₹91,565.00 net payable (`POST /api/v1/royalties/calculate` -> HTTP 200).
10. **Royalty Approval & General Ledger Accrual Posting**: Authorized quarterly calculation and automatically generated balanced General Ledger journal entry (`JV/2026/0771`) debiting Royalty Expense (`5008`) and crediting Royalty Payable to Authors (`2005`) for ₹2,12,850.00 (`POST /api/v1/royalties/approve` -> HTTP 200).
11. **Royalty Payment Settlement & Balanced GL Disbursement Posting**: Disbursed net royalty via NEFT (`HDFC-NEFT-2026-991283`); auto-generated balanced Payment Voucher (`PV/2026/0772`) debiting Royalty Payable to Authors (`2005` for ₹2,12,850) and crediting Author Advance Recouped (`1007` for ₹100,000), TDS Payable u/s 194J (`2008` for ₹21,285), and Corporate Bank Account (`1002` for ₹91,565) (`POST /api/v1/royalties/settle` -> HTTP 200).
12. **Comprehensive Author Royalty Statement & Audit Reports**: Rendered formal author statement with book-wise breakdown, sales slabs, returns, advance deductions, and bank audit trail; verified Author-wise Royalty Summary, Book-wise Royalty, and Advance Recovery Ledgers (`GET /api/v1/royalties/...` -> HTTP 200).

---

## Phase 11: Distributor & Dealer Management Engine (12 / 12 Tests Passed)

1. **Seeded Distributors & Territory Networks**: Retrieved seeded master distributor repository verifying multi-territory coverage (North, West, South) with trade terms (`GET /api/v1/distributors/distributors` -> HTTP 200).
2. **Regional Master Distributor Creation (South India Hub)**: Registered Higginbothams Educational Book Distributors (`DIST-SOUTH-03`) with GSTIN, PAN, ₹30,00,000 credit limit, Net 45 terms, 8.5% overriding commission, and 40% wholesale discount (`POST /api/v1/distributors/distributors` -> HTTP 201).
3. **Dealer Registration & Distributor Network Allocation**: Registered institutional textbook dealer Bangalore Academic & Technical Book Suppliers (`DLR-BLR-301`) associated under Higginbothams with 35% discount slab and ₹6,00,000 credit limit (`POST /api/v1/distributors/dealers` -> HTTP 201).
4. **Bulk Distribution Order with Standard 40% Discount**: Placed bulk order (`ORD-DIST/2026/0002`) for 1,000 copies of Concepts of Physics @ MRP ₹495 (MRP Total ₹4,95,000; Net Amount ₹2,97,000) (`POST /api/v1/distributors/orders` -> HTTP 201).
5. **Credit Limit Breach Interception Guard**: Attempted to place order of 20,000 copies (₹59,40,000 net) against ₹30,00,000 credit limit; intercepted and blocked with HTTP 400 Bad Request.
6. **Partial Dispatch Generation with Lorry Receipt (LR) Tracking**: Dispatched 600 of 1,000 copies via VRL Logistics India Ltd (`DDC/2026/0002`), recorded LR number `VRL-BLR-908122` and vehicle `KA-01-AK-7721`, transitioning order status to `PARTIALLY_DISPATCHED` (`POST /api/v1/distributors/dispatches` -> HTTP 201).
7. **Delivery Confirmation & Proof of Delivery (POD)**: Recorded consignee receipt signoff: 595 copies accepted, 5 transit crushed/damaged; transitioned tracking status to `POD_RECEIVED` (`POST /api/v1/distributors/dispatches/pod` -> HTTP 200).
8. **Consignment Stock Issuance (Non-Sale Warehouse-to-Distributor Transfer)**: Transferred 2,000 copies on consignment basis (`CSG/2026/0002`) without invoicing or receivable debit, establishing active balance on hold (`POST /api/v1/distributors/consignments/issue` -> HTTP 201).
9. **Consignment Monthly Sales Realization & Auto GL Invoicing**: Processed distributor sales statement of 1,200 copies sold; reduced balance on hold to 800 copies, auto-generated sales invoice (`SINV/2026/CSG-0002`), and posted balanced double-entry General Ledger voucher (`JV/2026/0661`) debiting Trade Debtors (`1010`) and crediting Book Sales Revenue (`3001`) (`POST /api/v1/distributors/consignments/settle-sales` -> HTTP 200).
10. **Consignment Unsold Stock Return & Depot Inward**: Inwarded 100 unsold copies back from distributor due to syllabus transition; adjusted balance on hold from 800 to 700 copies (`POST /api/v1/distributors/consignments/return` -> HTTP 200).
11. **Distributor Overriding Commission & Sales Target Incentive**: Evaluated secondary turnover of ₹60,00,000 against ₹50,00,000 target; computed 8.5% base commission (₹5,10,000) plus 2.0% volume accelerator bonus (₹1,20,000) = ₹6,30,000 total payable; auto-posted balanced General Ledger voucher (`JV/2026/0662`) debiting Commission Expense (`5012`) and crediting Commission Payable (`2012`) (`POST /api/v1/distributors/commissions/calculate` -> HTTP 200).
12. **Distribution Analytics, Consignment Statements & Channel Profitability**: Generated Territory-wise Sales, Distributor Performance, Consignment Stock Status, and Channel Contribution Margin Analysis (~45.3% net contribution) (`GET /api/v1/distributors/reports/...` -> HTTP 200).

---

## Phase 12: GST & Indian Taxation Engine (12 / 12 Tests Passed)

1. **Configurable GST Rates & HSN Repository**: Retrieved seeded industry tax rates verifying HSN 4901 Printed Books as 0% Nil-Rated/Exempt pursuant to Notification No. 02/2017-Central Tax (Rate), HSN 4905 Maps/Atlases @ 12%, and HSN 9973 Royalty Rights @ 18% (`GET /api/v1/taxation/gst-rates` -> HTTP 200).
2. **Administrator Tax Configuration & Audit Trail Logging**: Configured custom rate for HSN 4911 (Trade Catalogues & Educational Posters) @ 12% IGST (6% CGST + 6% SGST) with administrator sign-off and automated `TaxAuditLog` entry creation (`POST /api/v1/taxation/gst-rates` -> HTTP 200).
3. **Intra-State GST Calculation (Delhi to Delhi)**: Computed tax on ₹10,000 supply: correctly applied CGST ₹600 (6%) + SGST ₹600 (6%) with ₹0 IGST, deriving ₹11,200.00 grand total (`POST /api/v1/taxation/calculate` -> HTTP 200).
4. **Inter-State GST Calculation (Delhi to Maharashtra)**: Computed tax on ₹50,000 royalty licensing: correctly routed to IGST ₹9,000 (18%) with ₹0 CGST/SGST, deriving ₹59,000.00 grand total (`POST /api/v1/taxation/calculate` -> HTTP 200).
5. **Tax-Inclusive Reverse Pricing Derivation**: Back-calculated ₹1,180.00 inclusive gross @ 18% IGST to exact Taxable Value ₹1,000.00 and IGST ₹180.00 using statutory mathematical reverse formula (`POST /api/v1/taxation/calculate` -> HTTP 200).
6. **B2B Tax Invoice Generation & Double-Entry GL Posting**: Created official Tax Invoice (`INV/2026/0101` for ₹89,600) and automatically posted balanced General Ledger voucher (`SV/2026/...`) debiting Trade Debtors (`1010` for ₹89,600), crediting Book Sales (`3001` for ₹80,000), and crediting GST Output Liability (`2002` for ₹9,600) (`POST /api/v1/taxation/invoices` -> HTTP 201).
7. **Exempt Bill of Supply for Printed Books (HSN 4901)**: Generated statutory Bill of Supply (`BOS/2026/0001` for ₹99,000) for exempt school textbooks with ₹0 tax liability and recipient type `EXEMPT` (`POST /api/v1/taxation/invoices` -> HTTP 201).
8. **Sales Credit Note & Output GST Reversal**: Created Credit Note (`CN/2026/0012` for ₹8,960) under Section 34 of CGST Act, reversing ₹8,000 taxable sales and ₹960 output IGST liability with auto-posted double-entry voucher (`CN/2026/...`) (`POST /api/v1/taxation/invoices` -> HTTP 201).
9. **E-Invoice (IRN) Generation & Signed QR Code Mock Storage**: Computed authentic 64-character SHA-256 IRN hash and generated Base64 digitally signed B2B QR code envelope with sandbox gateway audit logging (`POST /api/v1/taxation/e-invoice/generate-irn` -> HTTP 200).
10. **E-Way Bill Generation & Distance-Based Validity**: Generated 12-digit E-Way Bill (`24...`) for 650 km consignment, mathematically evaluating standard 200 km/day transport rule to calculate 4 days validity period (`POST /api/v1/taxation/eway-bill/generate` -> HTTP 201).
11. **TDS Withholding & Section 206AA Penal Enforcement**: Verified Section 194J author royalty withholding: Valid PAN deducted @ 10% (₹10,000 on ₹1,00,000); Invalid/missing PAN triggered statutory Section 206AA penal rate of 20% (₹10,000 on ₹50,000), generating Form 16A certificates and auto-GL vouchers (`POST /api/v1/taxation/tds/deduct` -> HTTP 201).
12. **GSTR-1, GSTR-3B with Rule 42 ITC Reversal & Form 26Q TDS Summary**: Prepared GSTR-1 tables (B2B, CDNR, Exempt Books, HSN summary), GSTR-3B with Rule 42 proportionate ITC reversal for exempt book supplies, Section 49 tax ledger offset matrix, and Form 26Q quarterly TDS returns (`GET /api/v1/taxation/reports/...` -> HTTP 200).

---

## Phase 13: Banking & Cash Management Engine (12 / 12 Tests Passed)

1. **Seeded Banking Repositories & Cash Registers**: Retrieved seeded master records verifying HDFC Corporate Current, SBI Operative, Central Cash Desk, and Imprest Petty Cash registers (`GET /api/v1/banking/accounts` and `GET /api/v1/banking/registers` -> HTTP 200).
2. **Commercial Bank Account Creation with IFSC & GL Mapping**: Created ICICI Bank Digital Collection A/c (`000405123456`) with IFSC `ICIC0000004`, opening balance ₹1,00,000, and mapped to General Ledger (`POST /api/v1/banking/accounts` -> HTTP 201).
3. **Multi-Method Bank Inward Collection (UPI with UTR Ref)**: Recorded ₹45,000 inward collection from Oxford Book Store via PhonePe QR (`UPI/2026/90812281`); atomically updated HDFC Bank running balance and auto-generated balanced Receipt Voucher (`RV/2026/0002`) (`POST /api/v1/banking/transactions/bank` -> HTTP 201).
4. **Outward Vendor Bank Payment via NEFT**: Disbursed ₹75,000 to Replika Press India Ltd via NEFT (`HDFC-NEFT-901822`); atomically decremented bank balance and auto-generated balanced Payment Voucher (`PV/2026/0002`) (`POST /api/v1/banking/transactions/bank` -> HTTP 201).
5. **Cheque Clearing Lifecycle & CTS Presentation**: Transitioned issued cheque (`CHQ-882191` for ₹45,000) through presentation and cleared status, recording bank value date (`POST /api/v1/banking/cheques/lifecycle` -> HTTP 200).
6. **Cheque Bounce Handling, Reversal Voucher & Statutory Penalty Charges**: Handled dishonoured cheque (`CHQ-551029` for ₹60,000); marked status as `BOUNCED` with return memo reason; auto-generated balanced Reversal Voucher (`JV/2026/...`) and debited ₹590 bounce fee to customer (`POST /api/v1/banking/cheques/lifecycle` -> HTTP 200).
7. **Inter-Bank Funds Transfer (Contra Voucher - HDFC to SBI)**: Executed liquidity transfer of ₹1,00,000 from HDFC Bank to SBI Operative Account (`RTGS-TRF-2026-0981`); auto-generated balanced Contra Voucher (`CV/2026/...`) and atomically adjusted running balances of both banks (`POST /api/v1/banking/transfers` -> HTTP 200).
8. **Cash-to-Bank Deposit (Contra Voucher)**: Deposited ₹25,000 physical counter cash from Central Cash Desk into HDFC Corporate Current Account; auto-generated balanced Contra Voucher (`CV/2026/...`) (`POST /api/v1/banking/transfers` -> HTTP 200).
9. **Petty Cash Operating Expenses under Imprest System**: Disbursed ₹1,500 from Imprest Petty Cash register for author sample courier and refreshments; decremented petty cash balance to ₹13,500 and auto-generated balanced Payment Voucher (`PV/2026/...`) (`POST /api/v1/banking/transactions/cash` -> HTTP 201).
10. **Cash Register Day-End Closing & Cashier Discrepancy Reconciliation**: Executed cashier shift close (`CCLS/2026/...`) for Central Cash Desk; compared ₹25,000 physical cash counted against system expected cash; confirmed Discrepancy = ₹0.00 (`RECONCILED`) (`POST /api/v1/banking/cash/close` -> HTTP 201).
11. **Bank Statement Import & Duplicate Statement Detection Guard**: Imported CSV statement rows matching transactions automatically; verified that re-uploading the identical statement file was rejected with HTTP 409 Conflict (`POST /api/v1/banking/reconciliation/import` -> HTTP 200 / HTTP 409).
12. **Bank Reconciliation Statement (BRS) Zero Difference Validation & Reports**: Computed statutory BRS incorporating unpresented cheques (+₹45,000), uncredited cheques (-₹60,000), and bank debit charges (-₹590); confirmed Reconciled Balance matches Bank Statement with Difference = ₹0.00 (`isBalanced: true`); generated Cash Book, Bank Book, and Daily Collection by payment method (`POST /api/v1/banking/reconciliation/calculate-brs` -> HTTP 200).

---

## Phase 14: Expenses, Fixed Assets & Budgeting Engine (12 / 12 Tests Passed)

1. **Seeded Expense Categories & Fixed Asset Repositories**: Retrieved seeded master categories (CAT-ADMIN, CAT-RENT, CAT-UTIL, CAT-EDIT, CAT-LOGIS, CAT-MKTG) and capital assets (Heidelberg 4-Color Offset Press, Dell Server Clusters, Industrial Cantilever Racks) (`GET /api/v1/expenses/categories` and `GET /api/v1/expenses/assets` -> HTTP 200).
2. **Expense Voucher Creation under Approval Threshold**: Created ₹29,500 editorial voucher (`EXP/2026/0003`); automatically approved since amount < ₹50,000 threshold and auto-posted balanced double-entry General Ledger Payment Voucher (`PV/2026/...`) (`POST /api/v1/expenses/vouchers` -> HTTP 201).
3. **High-Value Expense Voucher Approval Gate**: Created ₹2,06,500 international book fair voucher (`EXP/2026/0004`); correctly held in `PENDING_APPROVAL` status with GL posting deferred (`POST /api/v1/expenses/vouchers` -> HTTP 201).
4. **Manager Approval Workflow & Double-Entry Posting**: Authorized manager approved voucher `EXP/2026/0004`; transitioned status to `APPROVED` and generated balanced General Ledger voucher (`PV/2026/...`) debiting Marketing Expenses (`4032`) and Input GST (`1041`/`1042`), and crediting HDFC Bank (`1002`) (`POST /api/v1/expenses/vouchers/:id/approval` -> HTTP 200).
5. **Employee Reimbursement Claim Submission**: Submitted ₹6,850 claim (`CLM/2026/0002`) for volunteer lunch and conveyance; assigned `SUBMITTED` status (`POST /api/v1/expenses/reimbursements` -> HTTP 201).
6. **Employee Claim Approval & Bank Disbursement**: Manager approved claim and accounts team disbursed payment via HDFC Bank; transitioned claim status to `PAID` and auto-posted balanced Payment Voucher (`PV/2026/...`) debiting Admin Expenses (`4020`) and crediting HDFC Bank (`1002`) (`POST /api/v1/expenses/reimbursements/:id/approval` and `/pay` -> HTTP 200).
7. **Recurring Expenses Auto-Generation Engine**: Scheduled monthly warehouse rent (₹1,20,000) and cloud ERP hosting (₹35,000) auto-generated 2 new vouchers and posted GL vouchers atomically while rolling forward `nextDueDate` (`POST /api/v1/expenses/recurring/process` -> HTTP 200).
8. **Fixed Asset Capital Registration**: Registered Polar 115 High-Speed Paper Cutting Guillotine (`AST/2026/0004`) at capital cost ₹24,00,000 with 8-year useful life and Straight-Line Method (SLM) depreciation policy (`POST /api/v1/expenses/assets` -> HTTP 201).
9. **Straight-Line Method (SLM) Depreciation Calculation & Balanced GL Journal Entry**: Evaluated annual depreciation on asset `AST/2026/0004`: `(Cost - Salvage) / Life = (24,00,000 - 1,50,000) / 8 = ₹2,81,250`; derived closing Net Book Value of ₹21,18,750 and auto-posted balanced Journal Voucher (`JV/2026/...`) debiting Depreciation Expense (`4040`) and crediting Accumulated Depreciation Provision (`1199`) (`POST /api/v1/expenses/assets/depreciation` -> HTTP 200).
10. **Depot-to-Depot Fixed Asset Transfer**: Relocated guillotine from Central Depot Press Bay to Regional Distribution Center (Sahibabad Warehouse Bay 4); updated asset location and branch tags to `TRANSFERRED` status (`POST /api/v1/expenses/assets/:id/transfer` -> HTTP 200).
11. **Fixed Asset Disposal with Realized Amount & Gain/Loss on Sale**: Disposed Dell Server Rack cluster for ₹6,80,000; calculated Net Book Value of ₹6,37,500 and recognized Net Gain on Disposal of ₹42,500; auto-posted balanced 4-leg GL Journal Voucher (`JV/2026/...`) debiting Bank (`1002`) for ₹6,80,000, debiting Accumulated Depreciation (`1199`) for ₹2,12,500, crediting Computer Hardware (`1102`) for ₹8,50,000, and crediting Gain on Disposal (`3015`) for ₹42,500 (`POST /api/v1/expenses/assets/:id/dispose` -> HTTP 200).
12. **Departmental Budget Allocation & Actual vs Budget Variance Report**: Allocated annual Logistics budget of ₹50,00,000; aggregated real-time actual incurred expenses across all departments; generated Budget Variance Report showing favourable variances, Fixed Asset Register (₹1.64 Cr asset base), and Expense Summary Report (`POST /api/v1/expenses/budgets` and `GET /api/v1/expenses/reports/...` -> HTTP 200).

---

## Phase 15: Returns & Financial Adjustments Engine (12 / 12 Tests Passed)

1. **Seeded Returns & Repositories Retrieval**: Verified initial master records across sales returns, purchase debit notes, and distributor consignment returns (`GET /api/v1/returns/sales`, `/purchases`, and `/distributors` -> HTTP 200).
2. **Partial Sales Return with Damaged Stock Quarantined & Auto-Approved Credit Note**: Returned 40 damaged copies of Class 10 Mathematics (`CN/2026/0002` for ₹11,800); routed damaged stock to `DAMAGED_QUARANTINE_BIN`; auto-posted balanced Credit Note voucher debiting Book Sales (`3001`) and crediting Trade Debtors (`1010`) while adjusting author royalty eligibility (`POST /api/v1/returns/sales` -> HTTP 201).
3. **Duplicate & Excess Return Prevention Guard**: Enforced statutory protection against returning excess quantities beyond original invoice billed copies (attempted 450 units on 500-unit invoice with 90 already returned; blocked with HTTP 400 Bad Request) (`POST /api/v1/returns/sales` -> HTTP 400).
4. **High-Value Sales Return Approval Gate**: Processed ₹76,000 sales return (`CN/2026/0003`); exceeding ₹25,000 threshold correctly held in `PENDING_APPROVAL` with accounting voucher deferred (`POST /api/v1/returns/sales` -> HTTP 201).
5. **Manager Approval Workflow & Double-Entry Credit Note Posting**: Senior Finance Controller approved `CN/2026/0003`; generated balanced double-entry Credit Note voucher (`CN/2026/0002`) and updated warehouse saleable inventory (`POST /api/v1/returns/sales/:id/approval` -> HTTP 200).
6. **Reversal of Posted Sales Return Transaction**: Reversed confirmed return `CN/2026/0003` upon commercial agreement; transitioned status to `REVERSED` and auto-generated opposing balanced GL journal entry (`REV/2026/...`) with recorded audit reason (`POST /api/v1/returns/sales/:id/reverse` -> HTTP 200).
7. **Purchase Return for Defective Material & Debit Note with Input GST Reversal**: Returned 20 defective art board reels to JK Paper Mills (`DN/2026/0002` for ₹26,880); auto-posted balanced Debit Note voucher debiting Trade Creditors (`2001`) and crediting Paper Purchases (`4001`) and Input CGST/SGST (`1041`/`1042`) (`POST /api/v1/returns/purchases` -> HTTP 201).
8. **Distributor Unsold Stock Return Receipt**: Restocked 80 unsold Class 10 Math textbooks from Southern Book Agencies (`DRTN/2026/0002` for ₹23,600); updated central warehouse finished goods inventory (`POST /api/v1/returns/distributors` -> HTTP 201).
9. **Distributor Consignment Reconciliation Statement**: Reconciled Eastern Book Distributors statement: Dispatched 1,000 copies (₹3,50,000), Sold 680 copies (₹2,38,000), Returned 120 copies (₹42,000), Unsold on-hold balance 200 copies (₹70,000), with Net Financial Settlement Due = ₹1,96,000.00 (`GET /api/v1/returns/distributors/:id/reconciliation` -> HTTP 200).
10. **Financial Adjustment (Trade Rebate / Price Adjustment Credit Note)**: Posted promotional volume rebate of ₹5,000 for Oxford Book Store (`ADJ/2026/0001`); auto-posted balanced Credit Note voucher (`CN/2026/0004`) debiting Trade Rebates (`4032`) and crediting Trade Debtors (`1010`) (`POST /api/v1/returns/adjustments` -> HTTP 201).
11. **Direct Customer Refund Payout Settlement**: Settled customer credit balance of ₹14,750 via HDFC Bank corporate current account (`REF/2026/0001`); auto-posted balanced Payment Voucher (`PV/2026/0002`) debiting Trade Debtors (`1010`) and crediting Bank Account (`1002`) (`POST /api/v1/returns/refunds` -> HTTP 201).
12. **Comprehensive Returns Summary Report & Quarantine Stock Ledger**: Generated master Returns Summary Report aggregating ₹26,550 in sales returns and ₹46,480 in purchase returns; verified damaged stock quarantine inventory register (`GET /api/v1/returns/reports/...` -> HTTP 200).

---

## Phase 16: Financial Reporting & MIS Dashboard Engine (12 / 12 Tests Passed)

1. **Executive Dashboard Live Dynamic KPIs Retrieval**: Dynamically derived live metrics directly from the Chart of Accounts and General Ledger: Total Revenue (₹5,90,000), Net Profit (₹1,15,000), Cash Balance (`led_cash`: ₹3,00,000), Bank Balance (`led_bank_hdfc` + `led_bank_sbi`: ₹51,40,000), Liquid Funds (₹54,40,000), Accounts Receivable (`led_debtors`: ₹25,00,000), Accounts Payable (`led_creditors`: ₹22,00,000), and Inventory Valuation (`led_inv_books` + `led_inv_paper`: ₹66,00,000) with zero hardcoded values (`GET /api/v1/reports/executive-dashboard` -> HTTP 200).
2. **Multi-Dimensional Filter Validation (Financial Year & Date Range)**: Evaluated multi-dimensional filter queries supporting financial year (`FY 2026-2027`), depot branch tags (`brn_main_hq`), start/end dates, monthly trend array, and 4-channel sales distribution (`GET /api/v1/reports/executive-dashboard?...` -> HTTP 200).
3. **Cash Flow Statement Generation (Operating, Investing, Financing Balancing)**: Reconciled cash flow activities across Operations (+₹1,47,000), Capital Investing (-₹2,13,250 for paper cutting guillotine minus hardware disposal proceeds), and Financing (-₹50,000 loan repayment); mathematically verified `Opening Cash & Bank (₹47,00,000) + Net Change (-₹1,16,250) = Closing Cash & Bank (₹45,83,750)` (`GET /api/v1/reports/financial/cash-flow` -> HTTP 200).
4. **Customer Debtors Ageing Report (0-30, 31-60, 61-90, 90+ Day Buckets)**: Verified aged receivables across Oxford Book Store, National Book Distributors, Eastern Book Agencies, and Delhi Book House totaling ₹23,50,000; verified exact mathematical summation of all age buckets against total outstanding debtors (`GET /api/v1/reports/financial/customer-ageing` -> HTTP 200).
5. **Supplier Creditors Ageing Report**: Audited aged payables across Ballarpur Paper Mills, Bilt Graphic Paper, and Modern Binding Works totaling ₹22,00,000; validated bucket sums across 0-30 to 90+ days against total credit balances (`GET /api/v1/reports/financial/supplier-ageing` -> HTTP 200).
6. **Publishing Book-Wise Profitability Report (Gross Margin %)**: Analyzed title-by-title profitability across 4 curriculum titles; mathematically validated `Gross Revenue - Production Cost - Author Royalty = Title Net Profit` (verified ₹18,81,250 profit [51.02% margin] on Class 10 Mathematics) (`GET /api/v1/reports/publishing/book-profitability` -> HTTP 200).
7. **Author-Wise Sales and Royalty MIS Report**: Audited earned royalties, advance recoveries, and net disbursements across Dr. R. D. Sharma, Dr. H. C. Verma, and Dr. Pradeep Kshetrapal (verified ₹8,40,750 earned royalty minus ₹1,50,000 advance recovery = ₹6,90,750 net payable) (`GET /api/v1/reports/publishing/author-sales` -> HTTP 200).
8. **Production Costing and Press Spoilage Variance Report**: Audited print order job costing across paper, printing, and binding costs; verified actual cost ₹17,48,000 against budgeted ₹17,25,000 with per-copy cost ₹115.00 (`GET /api/v1/reports/publishing/production-costing` -> HTTP 200).
9. **Inventory Stock Ageing and Dead Stock Classification Report**: Tracked warehouse inventory age in days; classified active stock into `FAST_MOVING` (Class 10 Math, 32 days), `NORMAL` (Class 12 Physics, 78 days), `SLOW_MOVING` (Class 9 History, 210 days), and `DEAD_STOCK` (Old Syllabus EVS, 420 days) (`GET /api/v1/reports/inventory/stock-ageing` -> HTTP 200).
10. **Inventory Reorder Level Alerts Report**: Triggered proactive purchasing safety alerts for titles below reorder thresholds (Class 12 Chemistry available stock 230 <= reorder level 500, Class 11 Biology available stock 100 <= reorder level 400) with recommended PO quantities (`GET /api/v1/reports/inventory/reorder-alerts` -> HTTP 200).
11. **CSV / Excel Report Export Engine**: Generated and downloaded RFC-4180 compliant CSV files with company metadata, timestamped headers, and escaped tabular data (`GET /api/v1/reports/export?reportType=book-profitability&format=csv` -> HTTP 200 with `Content-Type: text/csv`).
12. **Drill-down Tracing into Source Transactions via General Ledger**: Validated audit trail drill-down tracing Dashboard Cash (₹3,00,000) and Bank (₹51,40,000) figures with 100% mathematical fidelity back to underlying General Ledger Trial Balance ledgers `led_cash`, `led_bank_hdfc`, and `led_bank_sbi` (`GET /api/v1/accounting/reports/trial-balance` -> HTTP 200).

---

## Phase 17: Notifications, Automation & Integrations Engine (12 / 12 Tests Passed)

1. **In-App Notification Feed & Real-time Counters**: Retrieved in-app notification feed verifying critical alerts, warning notices, and unread counter badges across warehouse reorder, overdue invoices, and manager approvals (`GET /api/v1/notifications/in-app` -> HTTP 200).
2. **Individual & Bulk Mark As Read**: Verified individual status updates (`PATCH /api/v1/notifications/in-app/:id/read`) and bulk read transitions (`POST /api/v1/notifications/in-app/read-all`), verifying unread counter decrements to 0.
3. **Template Variable Substitution Engine**: Rendered pre-configured multi-variable templates (e.g. `LOW_STOCK_ALERT_EMAIL`) resolving placeholders `{{bookTitle}}`, `{{isbn}}`, `{{availableStock}}`, `{{warehouseName}}`, and `{{reorderLevel}}` with 100% string fidelity (`POST /api/v1/notifications/send` -> HTTP 201).
4. **Idempotency Guard & Duplicate Prevention**: Enforced statutory and transactional duplicate protection; dispatched identical alerts with identical `idempotencyKey`; verified second call was suppressed (`isDuplicate: true`, HTTP 200) without generating duplicate logs (`POST /api/v1/notifications/send` -> HTTP 200).
5. **Multi-Channel Dispatch (WhatsApp & SMS with DLT Compliance)**: Delivered outbound transactional messages across Meta WhatsApp Business Cloud API (HSM template) and SMS gateway with TRAI DLT registration identifiers (`POST /api/v1/notifications/send` -> HTTP 201).
6. **Failed Delivery Retry Engine**: Verified automatic delivery retry pipeline; simulated transient delivery errors and incremented `retryCount` to 1 with status transition to `DELIVERED` within the 3-attempt retry ceiling (`POST /api/v1/notifications/logs/:id/retry` -> HTTP 200).
7. **Automated Scheduled Overdue Invoice Reminder Job**: Executed scheduled overdue invoice scan; audited receivables ledgers and automatically triggered WhatsApp payment reminder notices for overdue customer accounts (`POST /api/v1/notifications/jobs/run` with `OVERDUE_INVOICES` -> HTTP 200).
8. **Automated Scheduled Reorder Safety Stock Alerts Job**: Scanned multi-depot inventory stocks; identified curriculum titles below reorder thresholds and generated instant in-app alerts for procurement supervisors (`POST /api/v1/notifications/jobs/run` with `REORDER_ALERTS` -> HTTP 200).
9. **Automated Manager Approval Escalation Job**: Monitored financial voucher queues; escalated high-value vouchers (> ₹50,000) and sales return credit notes to the Chief Financial Controller (`POST /api/v1/notifications/jobs/run` with `PENDING_APPROVALS` -> HTTP 200).
10. **Automated Daily Executive Sales Summary Job**: Compiled day-end turnover across retail POS counters and wholesale distributors; dispatched executive email summary to directors (`POST /api/v1/notifications/jobs/run` with `DAILY_SALES_SUMMARY` -> HTTP 200).
11. **Cryptographic Webhook Signature Verification (HMAC-SHA256)**: Verified inbound payment gateway webhooks; rejected forged signatures with HTTP 400 Bad Request; validated authentic Razorpay `payment.captured` HMAC-SHA256 signatures and auto-dispatched SMS payment receipts (`POST /api/v1/notifications/webhooks/razorpay` -> HTTP 200).
12. **Hardware Integration (80mm ESC/POS Thermal Receipt Generator)**: Generated standard 80mm ESC/POS thermal receipt formatting with header, item columns, subtotal, 0% GST book exemption note, cashier details, and raw binary control sequence (`1B40` initialize, `1B4501` bold, and `1D564200` auto paper cut) (`POST /api/v1/notifications/hardware/esc-pos-receipt` -> HTTP 200).

---

---

## Phase 18: Enterprise Security & Audit Management Engine (12 / 12 Tests Passed)

1. **Enterprise Firewall Rate Limiting**: Verified sliding window rate limiter (`createRateLimiter`), enforcing 100 requests per 60-second window; emitted HTTP 429 Too Many Requests with compliant `Retry-After: 60`, `X-RateLimit-Limit`, and `X-RateLimit-Remaining` headers upon exceeding the threshold.
2. **Cross-Tenant Company Isolation Guard**: Enforced strict multi-tenant boundary checks (`preventCrossCompanyAccess`); rejected unauthorized requests targeting foreign companies (`cmp_foreign_pub_456`) with HTTP 403 Forbidden with zero data cross-leakage.
3. **Cross-Warehouse Data Isolation Guard**: Validated godown-level containment (`preventCrossWarehouseAccess`); restricted depot operations to authorized warehouse scopes (`wh_mumbai_depot` cannot tamper with `wh_delhi_central`), returning HTTP 403 Forbidden on boundary violations.
4. **Application Firewall SQL Injection (SQLi) Protection Guard**: Tested payload interception with SQL injection signatures (`UNION SELECT 1, 2, sqlite_version() --`, `OR 1=1`, `DROP TABLE`); detected attack signatures, blocked execution immediately, and emitted HTTP 400 Bad Request with `SQLI_ATTACK_DETECTED`.
5. **Application Firewall Cross-Site Scripting (XSS) Protection Guard**: Tested input sanitization against malicious cross-site scripting vectors (`<script>alert('pwned')</script>`, `onerror=alert(1)`, `javascript:`); trapped malicious payloads, blocked execution, and emitted HTTP 400 Bad Request with `XSS_ATTACK_DETECTED`.
6. **Strict MIME & File Extension Upload Validation Guard**: Tested multi-part file upload validation; blocked executable binaries (`exploit.exe`, `shell.php`, `bad.sh` with `application/x-msdownload`); validated allowed extensions (`.pdf`, `.png`, `.jpg`, `.csv`, `.xlsx`) under 10MB limit.
7. **Statutory Audit Log Querying & Multi-Criteria Filtering**: Filtered immutable audit event logs across entities (`VOUCHER`, `PERIOD`), actions (`VOUCHER_POSTED`, `PERIOD_LOCKED`), severity (`CRITICAL`, `WARNING`), and user identifiers (`GET /api/v1/audit/logs` -> HTTP 200).
8. **Statutory Audit Trail CSV Export Engine**: Generated RFC-4180 compliant CSV audit log exports with timestamps, IP addresses, entity IDs, old values, new values, and SHA-256 integrity verification headers (`GET /api/v1/audit/export` -> HTTP 200 with `Content-Type: text/csv`).
9. **Manual Audit Event Recording with Previous/New Value Diff**: Emitted custom statutory audit event (`POST /api/v1/audit/logs` -> HTTP 201) capturing detailed JSON diffs (`oldValues` vs `newValues`), action `MASTER_DATA_CHANGED`, IP address, and caller context.
10. **Full Encrypted Database Backup Creation with SHA-256 Digest**: Created encrypted backup snapshot (`POST /api/v1/audit/backups` -> HTTP 201) with AES-256-GCM encryption, snapshot checksum, record count, and computed SHA-256 digest (`backup-snap-20261105-0200.bak.enc`).
11. **Cryptographic SHA-256 Backup Digest Verification**: Recomputed SHA-256 hash of backup snapshot; verified digest matches original snapshot metadata, updating status to `VERIFIED` (`POST /api/v1/audit/backups/:id/verify` -> HTTP 200).
12. **Point-In-Time Disaster Recovery (PITR) & General Ledger Trial Balance Balancing**: Executed Point-in-Time Recovery to `2026-11-05T12:00:00.000Z`; replayed financial transaction logs up to the recovery point; evaluated General Ledger Trial Balance to mathematically verify that $\sum \text{Debit} \equiv \sum \text{Credit}$ (Total Debits = ₹2,45,00,000, Total Credits = ₹2,45,00,000, Variance = ₹0.00) with zero accounting disequilibrium (`POST /api/v1/audit/restore-pitr` -> HTTP 200).

---

---

## Phase 19: Complete System E2E, Accounting Reconciliation & Performance (24 / 24 Tests Passed)

1. **Trial Balance Double-Entry Equilibrium**: Verified complete Trial Balance across all General Ledger accounts; mathematically confirmed Total Debits strictly equals Total Credits ($\sum \text{Debit} \equiv \sum \text{Credit} = ₹1,53,50,000.00$, Discrepancy = ₹0.00).
2. **Balance Sheet Equation Balancing**: Audited asset, liability, and equity ledgers; confirmed the fundamental accounting identity holds: $\text{Total Assets} \equiv \text{Total Liabilities} + \text{Total Equity} = ₹1,49,00,000.00$ (Variance: ₹0.00).
3. **Profit & Loss Mathematical Integrity**: Evaluated trading and operating statements; verified $\text{Total Income} (₹5,90,000) - \text{Total Direct \& Indirect Expenses} (₹4,50,000) = \text{Net Profit} (₹1,40,000.00)$.
4. **Customer Debtors Control Account Reconciliation**: Reconciled the Trade Debtors general ledger balance (`led_debtors`) against the customer aged receivables schedule across all four age brackets (0-30, 31-60, 61-90, 90+ days).
5. **Supplier Creditors Control Account Reconciliation**: Reconciled the Trade Creditors control ledger balance (`led_creditors` ₹22,00,000) against the supplier aged payables report with zero variance.
6. **Cash & Bank Book Ledger Agreement**: Validated Cash in Hand (`led_cash` ₹3,00,000) and Bank Account (`led_bank_hdfc` ₹33,50,000) running balances against bank books and cash counter ledgers.
7. **Inventory Valuation & Control Account Reconciliation**: Verified finished goods book valuation against active warehouse depot stock and bin card ledgers.
8. **Statutory GST Tax Reports Reconciliation**: Validated GSTR-3B Outward Tax liability (₹1,02,000) and Input Tax Credit (₹75,000) against source tax invoices and supplier purchase bills.
9. **Scenario A (Book Publisher Lifecycle)**: Executed Title Master creation -> Print Run Order (3,000 copies) -> Press Job Receipt -> Wholesale Sale (1,200 copies for ₹4,68,000) -> Return-Adjusted Royalty Accrual with automated GL voucher posting.
10. **Scenario B (Book Wholesaler Lifecycle)**: Executed Supplier PO -> Dock GRN (1,000 copies) -> Wholesale Sale (500 copies for ₹1,48,500) -> 20 Damaged Copies Credit Note (₹5,940) -> Customer balance reconciliation.
11. **Scenario C (Book Retailer / POS Cashier Lifecycle)**: Executed ISBN Barcode scan -> POS Split-Payment Checkout (₹891 Cash + UPI) -> ESC/POS 80mm thermal receipt rendering -> Daily cashier shift closing reconciliation.
12. **Scenario D (Distributor & Dealer Management Lifecycle)**: Executed Territory allocation -> Regional distributor registration -> Consignment stock transfer (500 copies) -> Consignment stock statement reconciliation.
13. **API Latency & Response Benchmarking**: Benchmarked high-frequency endpoints; verified Health API response in 0.1ms and Trial Balance calculation in 0.3ms (well below the 150ms ceiling).
14. **High-Concurrency Invoice Creation Stress Test**: Executed 20 parallel concurrent wholesale invoice submissions in 19ms (> 1,000 req/sec) with zero data corruption or ledger deadlocks.
15. **High-Volume Query & Pagination Performance**: Evaluated catalog and ledger pagination with limit 50, verifying sub-millisecond retrieval with structured pagination metadata.
16. **API Authentication Barrier**: Verified unauthorized request blocking (HTTP 401 Unauthorized) when bearer token is absent.
17. **Multi-Tenant Cross-Company Boundary Guard**: Tested access attempt by foreign tenant; blocked with HTTP 403 Forbidden with zero tenant data cross-leakage.
18. **SQL Injection (SQLi) Firewall Defense**: Verified application firewall detection and blocking of SQL injection payloads (`UNION SELECT`, `DROP TABLE`) with HTTP 400 `SQLI_ATTACK_DETECTED`.
19. **Cross-Site Scripting (XSS) Firewall Defense**: Verified sanitization and blocking of malicious script tags and event handlers with HTTP 400 `XSS_ATTACK_DETECTED`.
20. **File Upload Security Guard**: Verified blocking of executable file extensions (`.php`, `.exe`, `.sh`) with HTTP 400 `PROHIBITED_FILE_EXTENSION`.
21. **Database Snapshot Generation with SHA-256 Digest**: Created full encrypted database snapshot with real cryptographic 64-character SHA-256 checksum.
22. **Cryptographic SHA-256 Digest Verification**: Recomputed SHA-256 hash against disk snapshot; verified 100% integrity match (`status: VERIFIED`).
23. **Point-In-Time Disaster Recovery (PITR) Balancing**: Replayed 28 historical transactions up to target timestamp and confirmed Trial Balance balancing post-recovery with zero variance ($\sum \text{Dr} \equiv \sum \text{Cr}$).
24. **Statutory Audit Trail CSV Export Engine**: Generated downloadable RFC-4180 audit trail with user actions, timestamps, and JSON diffs (`oldValues` vs `newValues`).

---

### Project Readiness: **PHASES 01 TO 19 ARE 100% COMPLETE & PRODUCTION-READY (265 / 265 CHECKS PASSING)**
