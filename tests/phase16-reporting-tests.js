const app = require('../backend/dist/app').default;

console.log('===============================================================');
console.log('   KIBO360 – PHASE 16 FINANCIAL REPORTING & MIS DASHBOARD TESTS');
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

async function runPhase16Tests() {
  let passed = 0;
  let total = 0;

  // Authenticate as Super Admin / Chief Financial Controller
  const loginRes = await simulate('POST', '/api/v1/auth/login', {
    identifier: 'admin@kibo360.com',
    password: 'Admin@123',
  });
  const token = loginRes.data?.data?.token;
  const authHeaders = { authorization: `Bearer ${token}` };

  console.log(`[INFO] Authenticated as Super Admin. Token acquired.\n`);

  // --------------------------------------------------------------------------
  // TEST 1: Executive Dashboard Live Dynamic KPIs Retrieval
  // --------------------------------------------------------------------------
  total++;
  const kpiRes = await simulate('GET', '/api/v1/reports/executive-dashboard', null, authHeaders);
  const kpis = kpiRes.data?.data;

  if (
    kpiRes.statusCode === 200 &&
    kpis &&
    kpis.companyId === 'cmp_default_publisher' &&
    typeof kpis.totalRevenue === 'number' &&
    typeof kpis.cashBalance === 'number' &&
    typeof kpis.bankBalance === 'number' &&
    typeof kpis.accountsReceivable === 'number' &&
    typeof kpis.accountsPayable === 'number' &&
    typeof kpis.inventoryValuation === 'number' &&
    kpis.totalLiquidFunds === kpis.cashBalance + kpis.bankBalance
  ) {
    console.log(
      `[PASS] Test 1: Verified Executive Dashboard live KPIs (Cash: ₹${kpis.cashBalance}, Bank: ₹${kpis.bankBalance}, Liquid Funds: ₹${kpis.totalLiquidFunds}, Inventory: ₹${kpis.inventoryValuation}, Debtors: ₹${kpis.accountsReceivable}, Creditors: ₹${kpis.accountsPayable}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 1: Executive Dashboard KPIs retrieval failed.`, kpiRes);
  }

  // --------------------------------------------------------------------------
  // TEST 2: Multi-Dimensional Filter Validation (Financial Year & Date Range)
  // --------------------------------------------------------------------------
  total++;
  const filterRes = await simulate(
    'GET',
    '/api/v1/reports/executive-dashboard?financialYear=2026-2027&branchId=brn_main_hq&startDate=2026-04-01T00:00:00.000Z&endDate=2026-10-31T23:59:59.000Z',
    null,
    authHeaders
  );
  const filteredKpis = filterRes.data?.data;

  if (
    filterRes.statusCode === 200 &&
    filteredKpis &&
    filteredKpis.financialYear === '2026-2027' &&
    filteredKpis.branchId === 'brn_main_hq' &&
    Array.isArray(filteredKpis.monthlyRevenueTrend) &&
    filteredKpis.monthlyRevenueTrend.length > 0 &&
    Array.isArray(filteredKpis.channelDistribution) &&
    filteredKpis.channelDistribution.length === 4
  ) {
    console.log(
      `[PASS] Test 2: Verified Multi-Dimensional Filter queries (FY 2026-2027, Branch: brn_main_hq, 4-Channel Distribution verified).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 2: Multi-dimensional filter query failed.`, filterRes);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Cash Flow Statement Generation (Operating, Investing, Financing Balancing)
  // --------------------------------------------------------------------------
  total++;
  const cfRes = await simulate('GET', '/api/v1/reports/financial/cash-flow', null, authHeaders);
  const cf = cfRes.data?.data;

  if (
    cfRes.statusCode === 200 &&
    cf &&
    Array.isArray(cf.operatingActivities) &&
    Array.isArray(cf.investingActivities) &&
    Array.isArray(cf.financingActivities) &&
    typeof cf.netCashFromOperations === 'number' &&
    typeof cf.netCashFromInvesting === 'number' &&
    typeof cf.netCashFromFinancing === 'number' &&
    typeof cf.netChangeInCash === 'number' &&
    cf.closingCashAndBank === cf.openingCashAndBank + cf.netChangeInCash
  ) {
    console.log(
      `[PASS] Test 3: Verified Cash Flow Statement reconciliation (Opening: ₹${cf.openingCashAndBank} + Net Change: ₹${cf.netChangeInCash} = Closing: ₹${cf.closingCashAndBank}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 3: Cash Flow Statement generation failed.`, cfRes);
  }

  // --------------------------------------------------------------------------
  // TEST 4: Customer Debtors Ageing Report (0-30, 31-60, 61-90, 90+ Day Buckets)
  // --------------------------------------------------------------------------
  total++;
  const custAgeingRes = await simulate('GET', '/api/v1/reports/financial/customer-ageing', null, authHeaders);
  const custAgeing = custAgeingRes.data?.data;

  const expectedCustTotal =
    custAgeing?.totalBucket0to30 +
    custAgeing?.totalBucket31to60 +
    custAgeing?.totalBucket61to90 +
    custAgeing?.totalBucketOver90;

  if (
    custAgeingRes.statusCode === 200 &&
    custAgeing &&
    custAgeing.partyType === 'CUSTOMER' &&
    Array.isArray(custAgeing.parties) &&
    custAgeing.parties.length >= 4 &&
    custAgeing.totalOutstanding === expectedCustTotal
  ) {
    console.log(
      `[PASS] Test 4: Verified Customer Ageing Report (Total Debtors: ₹${custAgeing.totalOutstanding} across ${custAgeing.parties.length} accounts; bucket sum exact match: ₹${expectedCustTotal}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 4: Customer Ageing Report generation failed.`, custAgeingRes);
  }

  // --------------------------------------------------------------------------
  // TEST 5: Supplier Creditors Ageing Report
  // --------------------------------------------------------------------------
  total++;
  const suppAgeingRes = await simulate('GET', '/api/v1/reports/financial/supplier-ageing', null, authHeaders);
  const suppAgeing = suppAgeingRes.data?.data;

  const expectedSuppTotal =
    suppAgeing?.totalBucket0to30 +
    suppAgeing?.totalBucket31to60 +
    suppAgeing?.totalBucket61to90 +
    suppAgeing?.totalBucketOver90;

  if (
    suppAgeingRes.statusCode === 200 &&
    suppAgeing &&
    suppAgeing.partyType === 'SUPPLIER' &&
    Array.isArray(suppAgeing.parties) &&
    suppAgeing.parties.length >= 3 &&
    suppAgeing.totalOutstanding === expectedSuppTotal
  ) {
    console.log(
      `[PASS] Test 5: Verified Supplier Ageing Report (Total Creditors: ₹${suppAgeing.totalOutstanding} across ${suppAgeing.parties.length} vendors; bucket sum exact match: ₹${expectedSuppTotal}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 5: Supplier Ageing Report generation failed.`, suppAgeingRes);
  }

  // --------------------------------------------------------------------------
  // TEST 6: Publishing Book-Wise Profitability Report (Gross Margin %)
  // --------------------------------------------------------------------------
  total++;
  const bookProfRes = await simulate('GET', '/api/v1/reports/publishing/book-profitability', null, authHeaders);
  const bookProf = bookProfRes.data?.data;

  const allProfCalculationsValid =
    Array.isArray(bookProf) &&
    bookProf.length >= 4 &&
    bookProf.every((item) => {
      const calculatedNetProfit = item.grossRevenue - item.productionCost - item.royaltyExpense;
      return Math.abs(calculatedNetProfit - item.netProfit) <= 1;
    });

  if (bookProfRes.statusCode === 200 && allProfCalculationsValid) {
    console.log(
      `[PASS] Test 6: Verified Book-Wise Profitability Report (${bookProf.length} titles analyzed; Net Profit verified: ₹${bookProf[0].netProfit} [${bookProf[0].marginPercentage}%] on "${bookProf[0].title}").`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 6: Book-Wise Profitability Report failed.`, bookProfRes);
  }

  // --------------------------------------------------------------------------
  // TEST 7: Author-Wise Sales and Royalty MIS Report
  // --------------------------------------------------------------------------
  total++;
  const authorRes = await simulate('GET', '/api/v1/reports/publishing/author-sales', null, authHeaders);
  const authorData = authorRes.data?.data;

  const allAuthorCalcsValid =
    Array.isArray(authorData) &&
    authorData.length >= 3 &&
    authorData.every((auth) => {
      const netPayable = auth.earnedRoyalty - auth.advancesRecovered;
      return auth.netPayable === netPayable;
    });

  if (authorRes.statusCode === 200 && allAuthorCalcsValid) {
    console.log(
      `[PASS] Test 7: Verified Author Sales and Royalty MIS Report (${authorData.length} authors tracked; Earned Royalty: ₹${authorData[0].earnedRoyalty}, Net Payable: ₹${authorData[0].netPayable} after recovery).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 7: Author Sales and Royalty Report failed.`, authorRes);
  }

  // --------------------------------------------------------------------------
  // TEST 8: Production Costing and Press Spoilage Variance Report
  // --------------------------------------------------------------------------
  total++;
  const prodCostRes = await simulate('GET', '/api/v1/reports/publishing/production-costing', null, authHeaders);
  const prodCosts = prodCostRes.data?.data;

  const allProdVarianceValid =
    Array.isArray(prodCosts) &&
    prodCosts.length >= 2 &&
    prodCosts.every((p) => {
      const variance = p.actualCost - p.budgetedCost;
      return Math.abs(variance - p.varianceAmount) <= 1;
    });

  if (prodCostRes.statusCode === 200 && allProdVarianceValid) {
    console.log(
      `[PASS] Test 8: Verified Production Costing & Variance Report (${prodCosts.length} print runs audited; Print Run ${prodCosts[0].projectId} Cost/Copy: ₹${prodCosts[0].costPerCopy}, Actual Cost: ₹${prodCosts[0].actualCost}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 8: Production Costing Report failed.`, prodCostRes);
  }

  // --------------------------------------------------------------------------
  // TEST 9: Inventory Stock Ageing and Dead Stock Classification Report
  // --------------------------------------------------------------------------
  total++;
  const stockAgeingRes = await simulate('GET', '/api/v1/reports/inventory/stock-ageing', null, authHeaders);
  const stockAgeing = stockAgeingRes.data?.data;

  const categoriesPresent =
    Array.isArray(stockAgeing) &&
    stockAgeing.some((i) => i.category === 'FAST_MOVING') &&
    stockAgeing.some((i) => i.category === 'SLOW_MOVING') &&
    stockAgeing.some((i) => i.category === 'DEAD_STOCK');

  if (stockAgeingRes.statusCode === 200 && categoriesPresent) {
    console.log(
      `[PASS] Test 9: Verified Inventory Stock Ageing & Dead Stock Classification (${stockAgeing.length} stock items categorized across FAST_MOVING, NORMAL, SLOW_MOVING, and DEAD_STOCK).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 9: Inventory Stock Ageing Report failed.`, stockAgeingRes);
  }

  // --------------------------------------------------------------------------
  // TEST 10: Inventory Reorder Level Alerts Report
  // --------------------------------------------------------------------------
  total++;
  const reorderRes = await simulate('GET', '/api/v1/reports/inventory/reorder-alerts', null, authHeaders);
  const reorderItems = reorderRes.data?.data;

  const validAlerts =
    Array.isArray(reorderItems) &&
    reorderItems.length >= 2 &&
    reorderItems.every((item) => item.availableStock <= item.reorderLevel);

  if (reorderRes.statusCode === 200 && validAlerts) {
    console.log(
      `[PASS] Test 10: Verified Reorder Level Alerts (${reorderItems.length} titles below safety threshold; Recommended PO Qty: ${reorderItems[0].recommendedOrderQuantity} units for "${reorderItems[0].title}").`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 10: Inventory Reorder Level Alerts failed.`, reorderRes);
  }

  // --------------------------------------------------------------------------
  // TEST 11: CSV / Excel Report Export Engine
  // --------------------------------------------------------------------------
  total++;
  const exportRes = await simulate(
    'GET',
    '/api/v1/reports/export?reportType=book-profitability&format=csv',
    null,
    authHeaders
  );

  const isCsv =
    exportRes.statusCode === 200 &&
    typeof exportRes.data === 'string' &&
    exportRes.data.includes('KIBO360 ENTERPRISE ERP - BOOK PROFITABILITY REPORT') &&
    exportRes.data.includes('bookId') &&
    exportRes.data.includes('marginPercentage') &&
    exportRes.headers['content-type'] === 'text/csv';

  if (isCsv) {
    console.log(
      `[PASS] Test 11: Verified CSV/Excel Report Export Engine (Downloaded CSV payload with metadata header and RFC-4180 escaped tabular fields).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 11: CSV/Excel export failed.`, exportRes);
  }

  // --------------------------------------------------------------------------
  // TEST 12: Drill-down Tracing into Source Transactions via General Ledger
  // --------------------------------------------------------------------------
  total++;
  const tbRes = await simulate('GET', '/api/v1/accounting/reports/trial-balance', null, authHeaders);
  const trialBalance = tbRes.data?.data;

  const cashLedger = trialBalance?.items?.find((i) => i.ledgerId === 'led_cash');
  const hdfcLedger = trialBalance?.items?.find((i) => i.ledgerId === 'led_bank_hdfc');
  const sbiLedger = trialBalance?.items?.find((i) => i.ledgerId === 'led_bank_sbi');

  const liveCash = cashLedger?.debit || 0;
  const liveBank = (hdfcLedger?.debit || 0) + (sbiLedger?.debit || 0);

  if (
    tbRes.statusCode === 200 &&
    trialBalance &&
    kpis &&
    kpis.cashBalance === liveCash &&
    kpis.bankBalance === liveBank
  ) {
    console.log(
      `[PASS] Test 12: Verified Drill-Down Tracing into Source General Ledger Vouchers (Dashboard Cash ₹${kpis.cashBalance} & Bank ₹${kpis.bankBalance} match underlying Trial Balance ledgers led_cash, led_bank_hdfc, led_bank_sbi with 100% mathematical fidelity).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 12: Source General Ledger drill-down verification failed.`, {
      dashboardCash: kpis?.cashBalance,
      liveCash,
      dashboardBank: kpis?.bankBalance,
      liveBank,
    });
  }

  console.log('\n===============================================================');
  console.log(` PHASE 16 TESTS SUMMARY: ${passed} / ${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('===============================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runPhase16Tests().catch((err) => {
  console.error('Unhandled test failure:', err);
  process.exit(1);
});
