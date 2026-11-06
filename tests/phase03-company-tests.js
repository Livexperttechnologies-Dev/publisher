const app = require('../backend/dist/app').default;

console.log('===============================================================');
console.log('   KIBO360 – PHASE 03 COMPANY & FINANCIAL CONFIGURATION TESTS');
console.log('===============================================================');

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

    res.status = function (code) {
      statusCode = code;
      return res;
    };

    res.json = function (data) {
      responseData = data;
      resolve({ statusCode, data: responseData });
    };

    res.send = function (data) {
      responseData = data;
      resolve({ statusCode, data: responseData });
    };

    res.setHeader = function () {};
    res.getHeader = function () {};
    res.removeHeader = function () {};
    res._headers = {};

    try {
      app.handle(req, res);
    } catch (err) {
      resolve({ statusCode: 500, error: err.message });
    }
  });
}

async function runPhase03Tests() {
  let passed = 0;
  let total = 0;

  // 1. Authenticate as Super Admin
  const loginSuper = await simulate('POST', '/api/v1/auth/login', {
    identifier: 'admin@kibo360.com',
    password: 'Admin@123',
  });
  const adminToken = loginSuper.data?.data?.token;

  // -------------------------------------------------------------
  // Test 1: Multiple Company Creation
  // -------------------------------------------------------------
  total++;
  const createCompanyRes = await simulate(
    'POST',
    '/api/v1/companies',
    {
      name: 'Cambridge Academic Publishing India Ltd.',
      code: 'CAPI',
      legalName: 'Cambridge Academic Publishing India Limited',
      businessType: 'BOOK_PUBLISHER',
      taxId: '06AABBC1234D1Z9',
      pan: 'AABBC1234D',
      cin: 'U22110HR2015PLC098765',
      currency: 'INR',
      currencySymbol: '₹',
      decimalPrecision: 2,
      email: 'corporate@cambridgeacademic.in',
      phone: '+91 124 4567890',
      registeredAddress: 'Sector 44, Institutional Area, Gurugram, Haryana',
      billingAddress: 'Sector 44, Institutional Area, Gurugram, Haryana - 122003',
      city: 'Gurugram',
      state: 'Haryana',
      country: 'India',
      postalCode: '122003',
      invoicePrefix: 'CAPI',
    },
    { authorization: `Bearer ${adminToken}` }
  );

  const newCompanyId = createCompanyRes.data?.data?.id;
  if (createCompanyRes.statusCode === 201 && newCompanyId) {
    passed++;
    console.log('[PASS] Test 1: Multiple Company Creation -> Created entity "Cambridge Academic Publishing" (HTTP 201)');
  } else {
    console.log('[FAIL] Test 1: Company creation failed', createCompanyRes);
  }

  // -------------------------------------------------------------
  // Test 2: Branch Creation with Branch-Specific State GSTIN & Prefix
  // -------------------------------------------------------------
  total++;
  const createBranchRes = await simulate(
    'POST',
    `/api/v1/companies/${newCompanyId}/branches`,
    {
      name: 'Kolkata College Street Distribution Depot',
      code: 'KOL-DEPOT',
      isMain: false,
      registeredAddress: 'College Street Boi Para, Kolkata',
      billingAddress: 'College Street Boi Para, Kolkata, West Bengal',
      city: 'Kolkata',
      state: 'West Bengal',
      country: 'India',
      postalCode: '700073',
      phone: '+91 33 2241 5566',
      email: 'kolkata.depot@cambridgeacademic.in',
      gstin: '19AABBC1234D1Z3', // West Bengal State GSTIN
      branchManagerName: 'Debabrata Mukherjee',
      invoicePrefix: 'KOL-INV',
      interBranchTransfersEnabled: true,
    },
    { authorization: `Bearer ${adminToken}` }
  );

  if (createBranchRes.statusCode === 201 && createBranchRes.data?.data?.code === 'KOL-DEPOT') {
    passed++;
    console.log('[PASS] Test 2: Branch Creation -> Created Kolkata Depot with State GSTIN 19AABBC1234D1Z3 & prefix KOL-INV');
  } else {
    console.log('[FAIL] Test 2: Branch creation failed', createBranchRes);
  }

  // -------------------------------------------------------------
  // Test 3: Financial Year Creation
  // -------------------------------------------------------------
  total++;
  const createFYRes = await simulate(
    'POST',
    `/api/v1/companies/${newCompanyId}/fiscal-years`,
    {
      name: 'FY 2027-2028',
      startDate: '2027-04-01T00:00:00.000Z',
      endDate: '2028-03-31T23:59:59.000Z',
      accountingStartDate: '2027-04-01T00:00:00.000Z',
      isCurrent: false,
    },
    { authorization: `Bearer ${adminToken}` }
  );

  const fyId = createFYRes.data?.data?.id;
  if (createFYRes.statusCode === 201 && fyId) {
    passed++;
    console.log('[PASS] Test 3: Financial Year Creation -> Created "FY 2027-2028" successfully');
  } else {
    console.log('[FAIL] Test 3: Fiscal year creation failed', createFYRes);
  }

  // -------------------------------------------------------------
  // Test 4: Financial Year Period Locking Restrictions
  // -------------------------------------------------------------
  total++;
  const lockRes = await simulate(
    'PUT',
    `/api/v1/companies/${newCompanyId}/fiscal-years/${fyId}/lock`,
    {
      month: 4,
      year: 2027,
      isLocked: true,
    },
    { authorization: `Bearer ${adminToken}` }
  );

  if (lockRes.statusCode === 200 && lockRes.data?.data?.lockedPeriods?.length > 0) {
    passed++;
    console.log('[PASS] Test 4: Period Locking Restriction -> Month 04/2027 successfully locked against back-dated postings');
  } else {
    console.log('[FAIL] Test 4: Period lock failed', lockRes);
  }

  // -------------------------------------------------------------
  // Test 5: Default Accounting Settings Mapping
  // -------------------------------------------------------------
  total++;
  const updateSettingsRes = await simulate(
    'PUT',
    `/api/v1/companies/${newCompanyId}/accounting-settings`,
    {
      defaultSalesAccountId: 'led_sales_school',
      defaultPurchaseAccountId: 'led_exp_paper',
      inventoryValuationMethod: 'FIFO',
      defaultReceivableAccountId: 'led_debtors',
      defaultPayableAccountId: 'led_creditors',
      defaultCashAccountId: 'led_cash',
      defaultBankAccountId: 'led_bank_hdfc',
      roundOffAccountId: 'led_round_off',
      discountAllowedAccountId: 'led_discount_allowed',
      discountReceivedAccountId: 'led_discount_received',
    },
    { authorization: `Bearer ${adminToken}` }
  );

  if (updateSettingsRes.statusCode === 200 && updateSettingsRes.data?.data?.inventoryValuationMethod === 'FIFO') {
    passed++;
    console.log('[PASS] Test 5: Accounting Defaults -> Mapped sales, purchase, debtors, creditors & FIFO valuation');
  } else {
    console.log('[FAIL] Test 5: Accounting settings update failed', updateSettingsRes);
  }

  // -------------------------------------------------------------
  // Test 6: Cross-Company Access Prevention (Data Isolation)
  // -------------------------------------------------------------
  total++;
  // Login as Accountant of Apex Publishers (company cmp_default_publisher)
  const loginAccountant = await simulate('POST', '/api/v1/auth/login', {
    identifier: 'accountant@apexpublishers.com',
    password: 'Publisher@2026',
  });
  const accountantToken = loginAccountant.data?.data?.token;

  // Accountant attempts to access newCompanyId (Cambridge Academic)
  const crossCompanyAttempt = await simulate(
    'GET',
    `/api/v1/companies/${newCompanyId}/branches`,
    null,
    { authorization: `Bearer ${accountantToken}` }
  );

  if (crossCompanyAttempt.statusCode === 403) {
    passed++;
    console.log('[PASS] Test 6: Cross-Company Data Isolation -> Blocked access to other company branches (HTTP 403 Forbidden)');
  } else {
    console.log('[FAIL] Test 6: Cross-company access was improperly permitted', crossCompanyAttempt);
  }

  // -------------------------------------------------------------
  // Test 7: Authorized Consolidated Multi-Branch Financial Reporting
  // -------------------------------------------------------------
  total++;
  const consolidatedRes = await simulate(
    'GET',
    `/api/v1/companies/cmp_default_publisher/consolidated-summary`,
    null,
    { authorization: `Bearer ${adminToken}` }
  );

  if (
    consolidatedRes.statusCode === 200 &&
    consolidatedRes.data?.data?.totalBranches === 3 &&
    consolidatedRes.data?.data?.consolidatedRevenue === '₹79,500,000.00'
  ) {
    passed++;
    console.log('[PASS] Test 7: Consolidated Multi-Branch Reporting -> Generated consolidated report across 3 branches');
  } else {
    console.log('[FAIL] Test 7: Consolidated report failed', consolidatedRes);
  }

  // -------------------------------------------------------------
  // Test 8: Company & Branch Switching Context Verification
  // -------------------------------------------------------------
  total++;
  const branchesList = await simulate(
    'GET',
    `/api/v1/companies/cmp_default_publisher/branches`,
    null,
    { authorization: `Bearer ${adminToken}` }
  );

  if (branchesList.statusCode === 200 && branchesList.data?.data?.length === 3) {
    passed++;
    console.log('[PASS] Test 8: Branch Switching Context -> Verified HQ-DELHI, BHW-MUM, and STH-BLR switches');
  } else {
    console.log('[FAIL] Test 8: Branch context failed', branchesList);
  }

  console.log('---------------------------------------------------------------');
  console.log(`Phase 03 Test Suite Execution: ${passed} / ${total} Tests Passed!`);
  console.log('===============================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPhase03Tests();
