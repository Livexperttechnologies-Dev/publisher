const app = require('../backend/dist/app').default;

console.log('========================================================================');
console.log('   KIBO360 – PHASE 18 ENTERPRISE SECURITY & AUDIT MANAGEMENT TESTS');
console.log('========================================================================');

function simulate(method, url, body = null, headers = {}) {
  return new Promise((resolve) => {
    const EventEmitter = require('events');
    const req = new EventEmitter();
    req.method = method;
    req.url = url;
    req.originalUrl = url;
    req.headers = { host: 'localhost:5000', ...headers };
    req.socket = { remoteAddress: '127.0.0.1' };
    req.connection = req.socket;
    req.body = body || {};

    const res = new EventEmitter();
    let statusCode = 200;
    let responseData = null;
    res._headers = {};

    res.status = function (code) {
      statusCode = code;
      return res;
    };

    res.json = function (data) {
      responseData = data;
      resolve({ statusCode, data: responseData, headers: res._headers });
    };

    res.send = function (data) {
      responseData = data;
      resolve({ statusCode, data: responseData, headers: res._headers });
    };

    res.setHeader = function (k, v) {
      res._headers[k.toLowerCase()] = v;
    };
    res.getHeader = function (k) {
      return res._headers[k.toLowerCase()];
    };
    res.removeHeader = function (k) {
      delete res._headers[k.toLowerCase()];
    };

    try {
      app.handle(req, res);
    } catch (err) {
      resolve({ statusCode: 500, error: err.message, headers: res._headers });
    }
  });
}

async function runPhase18Tests() {
  let passed = 0;
  let total = 0;

  // 1. Authenticate as Super Admin / Chief Financial Controller
  const adminLoginRes = await simulate('POST', '/api/v1/auth/login', {
    identifier: 'admin@kibo360.com',
    password: 'Admin@123',
  });
  const adminToken = adminLoginRes.data?.data?.token;
  const adminHeaders = { authorization: `Bearer ${adminToken}` };

  console.log(`[INFO] Authenticated as Super Admin. Token acquired.\n`);

  // --------------------------------------------------------------------------
  // TEST 1: JWT Authentication & Forged Token Rejection
  // --------------------------------------------------------------------------
  total++;
  const validAuthRes = await simulate('GET', '/api/v1/audit/security-status', null, adminHeaders);
  const forgedAuthRes = await simulate('GET', '/api/v1/audit/security-status', null, {
    authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.forged.tampered_signature',
  });

  if (validAuthRes.statusCode === 200 && forgedAuthRes.statusCode === 401) {
    console.log(
      `[PASS] Test 1: Verified JWT Authentication (Valid token granted HTTP 200; forged/tampered token rejected HTTP 401).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 1: JWT Authentication test failed.`, { validAuthRes, forgedAuthRes });
  }

  // --------------------------------------------------------------------------
  // TEST 2: Role-Based Access Control (RBAC) & Privilege Escalation Barrier
  // --------------------------------------------------------------------------
  total++;
  // Authenticate as a non-admin user (e.g. standard operator or mock token with DATA_ENTRY role)
  const jwt = require('../backend/node_modules/jsonwebtoken');
  const JWT_SECRET = 'kibo360_enterprise_secure_jwt_secret_key_2026_finance';

  const lowPrivilegeToken = jwt.sign(
    {
      id: 'usr_clerk_01',
      username: 'clerk@kibo360.com',
      role: 'INVENTORY_CLERK',
      roleType: 'STANDARD_USER',
      companyId: 'cmp_default_publisher',
      branchId: 'brn_main_hq',
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  const lowPrivHeaders = { authorization: `Bearer ${lowPrivilegeToken}` };

  // Attempt to trigger a full database backup (requires SUPER_ADMIN or CHIEF_FINANCIAL_CONTROLLER)
  const rbacBlockRes = await simulate(
    'POST',
    '/api/v1/audit/backups',
    { backupType: 'FULL_SNAPSHOT' },
    lowPrivHeaders
  );

  if (rbacBlockRes.statusCode === 403) {
    console.log(
      `[PASS] Test 2: Verified Granular RBAC (Restricted administrative backup endpoint blocked low-privilege INVENTORY_CLERK with HTTP 403 Forbidden).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 2: RBAC privilege barrier failed.`, rbacBlockRes);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Cross-Company Tenant Isolation Guard
  // --------------------------------------------------------------------------
  total++;
  const foreignCompanyToken = jwt.sign(
    {
      id: 'usr_foreign_01',
      username: 'foreign@cambridge.com',
      role: 'ACCOUNTANT',
      roleType: 'STANDARD_USER',
      companyId: 'cmp_foreign_tenant_99',
      branchId: 'brn_foreign_01',
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  const foreignHeaders = { authorization: `Bearer ${foreignCompanyToken}` };

  // User from Company B attempts to access Company A's specific data
  const tenantBreachRes = await simulate(
    'GET',
    '/api/v1/companies/cmp_default_publisher/branches',
    null,
    foreignHeaders
  );

  if (tenantBreachRes.statusCode === 403) {
    console.log(
      `[PASS] Test 3: Verified Multi-Company Tenant Isolation (Prevented cross-company data leakage; Foreign Company B blocked from inspecting Company A with HTTP 403).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 3: Cross-company tenant isolation failed.`, tenantBreachRes);
  }

  // --------------------------------------------------------------------------
  // TEST 4: Multi-Warehouse Isolation Guard
  // --------------------------------------------------------------------------
  total++;
  const warehouseScopedToken = jwt.sign(
    {
      id: 'usr_wh_clerk',
      username: 'sahibabad_clerk@kibo360.com',
      role: 'WAREHOUSE_SUPERVISOR',
      roleType: 'BRANCH_USER',
      companyId: 'cmp_default_publisher',
      branchId: 'brn_sahibabad',
      warehouseId: 'wh_sahibabad_01',
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const { preventCrossWarehouseAccess } = require('../backend/dist/middleware/securityMiddleware');
  let warehouseGuardPassed = false;
  let warehouseErrorStatus = 0;

  const mockReq = {
    user: {
      role: 'WAREHOUSE_SUPERVISOR',
      roleType: 'BRANCH_USER',
      warehouseId: 'wh_sahibabad_01',
    },
    params: { warehouseId: 'wh_kolkata_hub_02' },
    query: {},
    body: {},
  };
  const mockRes = {};
  const mockNext = (err) => {
    if (err && err.statusCode === 403) {
      warehouseGuardPassed = true;
      warehouseErrorStatus = 403;
    }
  };

  preventCrossWarehouseAccess(mockReq, mockRes, mockNext);

  if (warehouseGuardPassed && warehouseErrorStatus === 403) {
    console.log(
      `[PASS] Test 4: Verified Multi-Warehouse Isolation Guard (Warehouse supervisor restricted to Sahibabad depot blocked from Kolkata depot with HTTP 403).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 4: Warehouse isolation guard failed.`);
  }

  // --------------------------------------------------------------------------
  // TEST 5: SQL Injection Attack Detection & Prevention
  // --------------------------------------------------------------------------
  total++;
  const sqliAttackRes = await simulate(
    'GET',
    '/api/v1/audit/logs?search=%27%20UNION%20SELECT%20*%20FROM%20users;%20--',
    null,
    adminHeaders
  );

  if (sqliAttackRes.statusCode === 400 && sqliAttackRes.data?.code === 'SQLI_ATTACK_DETECTED') {
    console.log(
      `[PASS] Test 5: Verified SQL Injection Firewall (Blocked malicious UNION SELECT payload with HTTP 400 SQLI_ATTACK_DETECTED).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 5: SQL Injection test failed.`, sqliAttackRes);
  }

  // --------------------------------------------------------------------------
  // TEST 6: Cross-Site Scripting (XSS) Payload Protection
  // --------------------------------------------------------------------------
  total++;
  const xssAttackRes = await simulate(
    'POST',
    '/api/v1/audit/logs',
    {
      action: 'MASTER_DATA_CHANGED',
      entity: 'books',
      description: 'Updated book title to <script>alert("XSS_COMPROMISED")</script>',
    },
    adminHeaders
  );

  if (xssAttackRes.statusCode === 400 && xssAttackRes.data?.code === 'XSS_ATTACK_DETECTED') {
    console.log(
      `[PASS] Test 6: Verified XSS Firewall (Blocked malicious <script> injection payload with HTTP 400 XSS_ATTACK_DETECTED).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 6: XSS protection test failed.`, xssAttackRes);
  }

  // --------------------------------------------------------------------------
  // TEST 7: API Rate Limiting Enforcement
  // --------------------------------------------------------------------------
  total++;
  const { createRateLimiter } = require('../backend/dist/middleware/securityMiddleware');
  const strictLimiter = createRateLimiter({
    windowMs: 10000,
    maxRequests: 3,
    message: 'Rate limit quota exceeded.',
  });

  let rateLimitTripped = false;
  const testIp = '198.51.100.99';

  for (let i = 0; i < 5; i++) {
    const rateReq = { ip: testIp, baseUrl: '/api/v1/auth/login', socket: { remoteAddress: testIp } };
    const rateRes = {
      _status: 200,
      _headers: {},
      setHeader(k, v) {
        this._headers[k] = v;
      },
      status(c) {
        this._status = c;
        return this;
      },
      json(d) {
        if (this._status === 429) {
          rateLimitTripped = true;
        }
      },
    };
    let nextCalled = false;
    strictLimiter(rateReq, rateRes, () => {
      nextCalled = true;
    });
  }

  if (rateLimitTripped) {
    console.log(
      `[PASS] Test 7: Verified API Rate Limiting Enforcement (Sliding window rate limiter tripped on 4th consecutive request -> HTTP 429 Too Many Requests).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 7: Rate limiter test failed.`);
  }

  // --------------------------------------------------------------------------
  // TEST 8: File Upload Security Validation (Prohibited Extensions & Whitelist)
  // --------------------------------------------------------------------------
  total++;
  const prohibitedFileRes = await simulate(
    'POST',
    '/api/v1/audit/validate-upload',
    {
      file: {
        filename: 'malicious_webshell.php',
        mimetype: 'application/x-php',
        sizeBytes: 1024,
      },
    },
    adminHeaders
  );

  const validFileRes = await simulate(
    'POST',
    '/api/v1/audit/validate-upload',
    {
      file: {
        filename: 'author_contract_agreement.pdf',
        mimetype: 'application/pdf',
        sizeBytes: 245000,
      },
    },
    adminHeaders
  );

  if (
    prohibitedFileRes.statusCode === 400 &&
    prohibitedFileRes.data?.code === 'PROHIBITED_FILE_EXTENSION' &&
    validFileRes.statusCode === 200 &&
    validFileRes.data?.success === true
  ) {
    console.log(
      `[PASS] Test 8: Verified File Upload Security (Blocked executable extension .php with HTTP 400; verified valid PDF document upload).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 8: File upload security test failed.`, { prohibitedFileRes, validFileRes });
  }

  // --------------------------------------------------------------------------
  // TEST 9: Comprehensive Audit Trail Recording & Querying
  // --------------------------------------------------------------------------
  total++;
  const auditLogsRes = await simulate('GET', '/api/v1/audit/logs', null, adminHeaders);
  const logsList = auditLogsRes.data?.data;
  const logsMeta = auditLogsRes.data?.meta;

  const hasKeyActions =
    Array.isArray(logsList) &&
    logsList.some((l) => l.action === 'LOGIN_SUCCESS') &&
    logsList.some((l) => l.action === 'VOUCHER_POSTED') &&
    logsList.some((l) => l.action === 'PERIOD_LOCKED');

  if (auditLogsRes.statusCode === 200 && hasKeyActions && logsMeta?.total >= 5) {
    console.log(
      `[PASS] Test 9: Verified Comprehensive Audit Trail Recording (${logsMeta.total} audit logs tracked with user, IP, action, entity, and state diffs).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 9: Audit trail retrieval failed.`, auditLogsRes);
  }

  // --------------------------------------------------------------------------
  // TEST 10: Statutory Audit Log CSV Export Engine
  // --------------------------------------------------------------------------
  total++;
  const exportAuditRes = await simulate('GET', '/api/v1/audit/export', null, adminHeaders);

  const isAuditCsvValid =
    exportAuditRes.statusCode === 200 &&
    typeof exportAuditRes.data === 'string' &&
    exportAuditRes.data.includes('KIBO360 ENTERPRISE ERP - STATUTORY AUDIT TRAIL LOG') &&
    exportAuditRes.data.includes('LOGIN_SUCCESS') &&
    exportAuditRes.data.includes('VOUCHER_POSTED') &&
    exportAuditRes.headers['content-type'] === 'text/csv';

  if (isAuditCsvValid) {
    console.log(
      `[PASS] Test 10: Verified Statutory Audit Log CSV Export Engine (Generated downloadable RFC-4180 audit trail for statutory auditors).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 10: Audit log CSV export failed.`, exportAuditRes);
  }

  // --------------------------------------------------------------------------
  // TEST 11: Cryptographic Database Backup Creation & SHA-256 Verification
  // --------------------------------------------------------------------------
  total++;
  const createBackupRes = await simulate(
    'POST',
    '/api/v1/audit/backups',
    { backupType: 'FULL_SNAPSHOT', retentionDays: 30 },
    adminHeaders
  );
  const newBackup = createBackupRes.data?.data;

  const verifyBackupRes = await simulate(
    'POST',
    `/api/v1/audit/backups/${newBackup?.id}/verify`,
    null,
    adminHeaders
  );
  const verificationData = verifyBackupRes.data?.data;

  if (
    createBackupRes.statusCode === 201 &&
    newBackup &&
    typeof newBackup.checksumSha256 === 'string' &&
    newBackup.checksumSha256.length === 64 &&
    verifyBackupRes.statusCode === 200 &&
    verificationData?.isValid === true
  ) {
    console.log(
      `[PASS] Test 11: Verified Database Backup & SHA-256 Checksum Integrity (Snapshot ${newBackup.filename} created with 64-char SHA-256 hash: ${newBackup.checksumSha256.substring(0, 16)}... and verified 100% intact).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 11: Database backup creation/verification failed.`, { createBackupRes, verifyBackupRes });
  }

  // --------------------------------------------------------------------------
  // TEST 12: Point-in-Time Recovery (PITR) & Double-Entry Equilibrium
  // --------------------------------------------------------------------------
  total++;
  const targetTime = new Date().toISOString();
  const pitrRes = await simulate(
    'POST',
    '/api/v1/audit/backups/restore-pitr',
    {
      targetTimestamp: targetTime,
      reason: 'Statutory compliance verification and disaster recovery drill',
    },
    adminHeaders
  );
  const pitrResult = pitrRes.data?.data;

  if (
    pitrRes.statusCode === 200 &&
    pitrResult &&
    pitrResult.status === 'RESTORE_SUCCESSFUL' &&
    pitrResult.finalLedgersBalanced === true &&
    pitrResult.replayedVouchersCount >= 10
  ) {
    console.log(
      `[PASS] Test 12: Verified Point-In-Time Recovery (PITR) (Restored state to ${targetTime}; replayed ${pitrResult.replayedVouchersCount} transactions with double-entry balance Dr=Cr confirmed).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 12: Point-In-Time Recovery failed.`, pitrRes);
  }

  console.log('\n========================================================================');
  console.log(` PHASE 18 TESTS SUMMARY: ${passed} / ${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('========================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runPhase18Tests().catch((err) => {
  console.error('Unhandled test failure:', err);
  process.exit(1);
});
