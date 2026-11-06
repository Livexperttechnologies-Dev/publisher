# KIBO360 – API Documentation (v1)

## Base URL
- **API Base**: `http://localhost:5000/api/v1`
- **Interactive Swagger UI**: `http://localhost:5000/api/docs`
- **Root Status**: `http://localhost:5000/`

---

## Standard JSON Response Envelope

All API endpoints return consistent envelopes:

### Success Response (`200 OK` / `201 Created`):
```json
{
  "success": true,
  "message": "Resource fetched successfully",
  "data": { ... },
  "meta": {
    "total": 120,
    "page": 1,
    "limit": 10
  }
}
```

### Error Response (`400 Bad Request` / `401 Unauthorized` / `422 Unprocessable`):
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "path": "email",
      "message": "Please enter a valid enterprise email address"
    }
  ]
}
```

---

## 18 Modular Domain Endpoints

| Module | Route Prefix | Primary Purpose | Auth Required |
| :--- | :--- | :--- | :--- |
| **Health** | `/api/v1/health` | Service uptime and capability check | No |
| **Auth** | `/api/v1/auth/login` | Session authentication & JWT generation | No |
| **Users** | `/api/v1/users` | Staff profiles, user roles & branch assignments | Yes |
| **Companies** | `/api/v1/companies` | Multi-company legal profiles & branches | Yes |
| **Accounting**| `/api/v1/accounting` | Chart of Accounts, General Ledger & Day Book | Yes |
| **Books** | `/api/v1/books` | ISBN-13 master catalog, editions & binding | Yes |
| **Inventory** | `/api/v1/inventory` | Godown stocks, paper reels & stock valuations | Yes |
| **Purchases** | `/api/v1/purchases` | Paper procurement, printer job work & bills | Yes |
| **Sales** | `/api/v1/sales` | Invoices, institutional orders & wholesale slabs | Yes |
| **Customers** | `/api/v1/customers` | Bookstores, educational institutions & distributors | Yes |
| **Suppliers** | `/api/v1/suppliers` | Paper mills, printing presses & binders | Yes |
| **Publishing**| `/api/v1/publishing`| Publishing imprints, reprint cycles & press runs | Yes |
| **Royalties** | `/api/v1/royalties` | Author contracts, royalty slabs & advance offsets| Yes |
| **Distributors**| `/api/v1/distributors` | Regional trade depots & consignment sales | Yes |
| **Taxation** | `/api/v1/taxation` | GST returns, TDS Form 16A & compliance | Yes |
| **Banking** | `/api/v1/banking` | Bank accounts, cash ledgers & reconciliation | Yes |
| **Expenses** | `/api/v1/expenses` | Direct production & administrative overheads | Yes |
| **Reports** | `/api/v1/reports` | P&L, Balance Sheet & Trial Balance | Yes |
| **Notifications**| `/api/v1/notifications`| Financial thresholds & stock reorder alerts | Yes |
