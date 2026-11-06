const app = require('../backend/dist/app').default;

console.log('===============================================================');
console.log('   KIBO360 – PHASE 14 EXPENSES, FIXED ASSETS & BUDGETING TESTS');
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

async function runPhase14Tests() {
  let passed = 0;
  let total = 0;

  // 1. Authenticate as Super Admin / Chief Financial Officer
  const loginRes = await simulate('POST', '/api/v1/auth/login', {
    identifier: 'admin@kibo360.com',
    password: 'Admin@123',
  });
  const token = loginRes.data?.data?.token;
  const authHeaders = { authorization: `Bearer ${token}` };

  console.log(`[INFO] Authenticated as Super Admin. Token acquired.\n`);

  // --------------------------------------------------------------------------
  // TEST 1: Retrieve Seeded Expense Categories & Seeded Fixed Assets
  // --------------------------------------------------------------------------
  total++;
  const categoriesRes = await simulate('GET', '/api/v1/expenses/categories', null, authHeaders);
  const assetsRes = await simulate('GET', '/api/v1/expenses/assets', null, authHeaders);

  const categories = categoriesRes.data?.data;
  const assets = assetsRes.data?.data;

  if (
    categoriesRes.statusCode === 200 &&
    Array.isArray(categories) &&
    categories.length >= 6 &&
    assetsRes.statusCode === 200 &&
    Array.isArray(assets) &&
    assets.length >= 3
  ) {
    console.log(
      `[PASS] Test 1: Verified expense categories (${categories.length} categories) and seeded fixed assets (${assets.length} assets).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 1: Could not retrieve categories or assets.`, { categoriesRes, assetsRes });
  }

  // --------------------------------------------------------------------------
  // TEST 2: Create Expense Voucher Under Threshold (Auto-Approved & GL Posted)
  // --------------------------------------------------------------------------
  total++;
  const voucherUnderRes = await simulate(
    'POST',
    '/api/v1/expenses/vouchers',
    {
      categoryId: 'cat_editorial',
      amount: 25000,
      taxAmount: 4500,
      paymentMethod: 'BANK_TRANSFER',
      paymentLedgerId: 'led_bank_hdfc',
      vendorName: 'Apex Proofreading & Editorial Services',
      department: 'Editorial',
      projectId: 'PRJ/2026/0002',
      notes: 'Typesetting & indexing for Senior Secondary Physics Textbook',
      approvalThreshold: 50000,
    },
    authHeaders
  );

  const v1 = voucherUnderRes.data?.data;
  if (
    voucherUnderRes.statusCode === 201 &&
    v1?.status === 'APPROVED' &&
    v1?.accountingVoucherNumber &&
    v1?.totalAmount === 29500
  ) {
    console.log(
      `[PASS] Test 2: Expense voucher ${v1.voucherNumber} auto-approved with GL Voucher #${v1.accountingVoucherNumber} (Total ₹${v1.totalAmount}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 2: Auto-approval voucher creation failed.`, voucherUnderRes);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Create Expense Voucher Over Threshold (Workflow Pending Approval)
  // --------------------------------------------------------------------------
  total++;
  const voucherOverRes = await simulate(
    'POST',
    '/api/v1/expenses/vouchers',
    {
      categoryId: 'cat_marketing',
      amount: 175000,
      taxAmount: 31500,
      paymentMethod: 'BANK_TRANSFER',
      paymentLedgerId: 'led_bank_hdfc',
      vendorName: 'Frankfurt Book Fair GmbH',
      department: 'Marketing',
      notes: 'International Copyright Exhibition Booth & Catalogue display',
      approvalThreshold: 50000,
    },
    authHeaders
  );

  const v2 = voucherOverRes.data?.data;
  if (
    voucherOverRes.statusCode === 201 &&
    v2?.status === 'PENDING_APPROVAL' &&
    !v2?.accountingVoucherNumber &&
    v2?.totalAmount === 206500
  ) {
    console.log(
      `[PASS] Test 3: High-value expense voucher ${v2.voucherNumber} (₹${v2.totalAmount}) held in PENDING_APPROVAL status.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 3: Over-threshold voucher did not enter PENDING_APPROVAL.`, voucherOverRes);
  }

  // --------------------------------------------------------------------------
  // TEST 4: Manager Approval Workflow & GL Posting for High-Value Voucher
  // --------------------------------------------------------------------------
  total++;
  const approvalRes = await simulate(
    'POST',
    `/api/v1/expenses/vouchers/${v2.id}/approval`,
    {
      action: 'APPROVE',
      notes: 'Approved by CFO as per International Business Plan FY26-27',
    },
    authHeaders
  );

  const v2Approved = approvalRes.data?.data;
  if (
    approvalRes.statusCode === 200 &&
    v2Approved?.status === 'APPROVED' &&
    v2Approved?.accountingVoucherNumber &&
    v2Approved?.approvedBy
  ) {
    console.log(
      `[PASS] Test 4: Voucher ${v2Approved.voucherNumber} approved by ${v2Approved.approvedBy} with GL Voucher #${v2Approved.accountingVoucherNumber}.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 4: Voucher approval workflow failed.`, approvalRes);
  }

  // --------------------------------------------------------------------------
  // TEST 5: Employee Reimbursement Claim Submission
  // --------------------------------------------------------------------------
  total++;
  const claimRes = await simulate(
    'POST',
    '/api/v1/expenses/reimbursements',
    {
      employeeId: 'EMP-088',
      employeeName: 'Ananya Deshmukh',
      department: 'Marketing',
      purpose: 'Delhi Book Fair local logistics, taxi fare and volunteer lunch',
      amount: 6850,
      notes: 'Scanned fuel bills and food receipts attached',
    },
    authHeaders
  );

  const claim = claimRes.data?.data;
  if (
    claimRes.statusCode === 201 &&
    claim?.claimNumber &&
    claim?.status === 'SUBMITTED' &&
    claim?.amount === 6850
  ) {
    console.log(
      `[PASS] Test 5: Employee reimbursement claim ${claim.claimNumber} submitted for ${claim.employeeName} (₹${claim.amount}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 5: Reimbursement submission failed.`, claimRes);
  }

  // --------------------------------------------------------------------------
  // TEST 6: Employee Reimbursement Approval & Disbursement with GL Voucher
  // --------------------------------------------------------------------------
  total++;
  const claimApproveRes = await simulate(
    'POST',
    `/api/v1/expenses/reimbursements/${claim.id}/approval`,
    { action: 'APPROVE', notes: 'Verified and approved' },
    authHeaders
  );

  const claimPayRes = await simulate(
    'POST',
    `/api/v1/expenses/reimbursements/${claim.id}/pay`,
    {
      paymentMethod: 'BANK_TRANSFER',
      paymentLedgerId: 'led_bank_hdfc',
    },
    authHeaders
  );

  const paidClaim = claimPayRes.data?.data;
  if (
    claimApproveRes.statusCode === 200 &&
    claimPayRes.statusCode === 200 &&
    paidClaim?.status === 'PAID' &&
    paidClaim?.accountingVoucherNumber
  ) {
    console.log(
      `[PASS] Test 6: Reimbursement ${paidClaim.claimNumber} paid via HDFC Bank with GL Voucher #${paidClaim.accountingVoucherNumber}.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 6: Reimbursement payment flow failed.`, { claimApproveRes, claimPayRes });
  }

  // --------------------------------------------------------------------------
  // TEST 7: Recurring Expense Processing & Scheduled Auto-Posting
  // --------------------------------------------------------------------------
  total++;
  const recurringProcessRes = await simulate('POST', '/api/v1/expenses/recurring/process', {}, authHeaders);
  const processResult = recurringProcessRes.data?.data;

  if (
    recurringProcessRes.statusCode === 200 &&
    processResult?.processedCount >= 2 &&
    Array.isArray(processResult?.generatedVouchers)
  ) {
    console.log(
      `[PASS] Test 7: Recurring expenses processor generated ${processResult.processedCount} automated vouchers (Warehouse Rent & Cloud ERP).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 7: Recurring expense processing failed.`, recurringProcessRes);
  }

  // --------------------------------------------------------------------------
  // TEST 8: Fixed Asset Registration with Straight-Line Method (SLM)
  // --------------------------------------------------------------------------
  total++;
  const newAssetRes = await simulate(
    'POST',
    '/api/v1/expenses/assets',
    {
      assetName: 'Polar 115 High-Speed Paper Cutting Guillotine',
      category: 'PLANT_AND_MACHINERY',
      purchaseDate: '2026-05-01T00:00:00.000Z',
      purchaseValue: 2400000,
      salvageValue: 150000,
      usefulLifeYears: 8,
      depreciationMethod: 'SLM',
      location: 'Bindery Section, Okhla Central Depot',
    },
    authHeaders
  );

  const newAsset = newAssetRes.data?.data;
  if (
    newAssetRes.statusCode === 201 &&
    newAsset?.assetCode &&
    newAsset?.netBookValue === 2400000 &&
    newAsset?.depreciationMethod === 'SLM'
  ) {
    console.log(
      `[PASS] Test 8: Registered capital asset ${newAsset.assetCode} (${newAsset.assetName}) at cost ₹${newAsset.purchaseValue}.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 8: Fixed asset registration failed.`, newAssetRes);
  }

  // --------------------------------------------------------------------------
  // TEST 9: Annual Depreciation Calculation & Balanced GL Journal Voucher
  // --------------------------------------------------------------------------
  total++;
  // Annual SLM = (2400000 - 150000) / 8 = 2250000 / 8 = 281250
  const depRes = await simulate(
    'POST',
    '/api/v1/expenses/assets/depreciation',
    {
      assetId: newAsset.id,
      financialYear: '2026-2027',
      periodName: 'Annual FY 2026-27',
    },
    authHeaders
  );

  const schedule = depRes.data?.data;
  if (
    depRes.statusCode === 200 &&
    schedule?.depreciationAmount === 281250 &&
    schedule?.closingBookValue === 2118750 &&
    schedule?.accountingVoucherNumber
  ) {
    console.log(
      `[PASS] Test 9: SLM depreciation posted for ${schedule.assetCode}: ₹${schedule.depreciationAmount} (Closing NBV: ₹${schedule.closingBookValue}, GL Voucher: #${schedule.accountingVoucherNumber}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 9: Depreciation calculation failed.`, depRes);
  }

  // --------------------------------------------------------------------------
  // TEST 10: Fixed Asset Depot-to-Depot Transfer
  // --------------------------------------------------------------------------
  total++;
  const transferRes = await simulate(
    'POST',
    `/api/v1/expenses/assets/${newAsset.id}/transfer`,
    {
      newLocation: 'Regional Distribution Center, Sahibabad Warehouse Bay 4',
      newBranchId: 'brn_up_depot',
      newBranchName: 'Uttar Pradesh Central Depository',
      transferReason: 'Capacity expansion in regional press facility',
    },
    authHeaders
  );

  const transferred = transferRes.data?.data;
  if (
    transferRes.statusCode === 200 &&
    transferred?.status === 'TRANSFERRED' &&
    transferred?.location.includes('Sahibabad')
  ) {
    console.log(
      `[PASS] Test 10: Asset ${transferred.assetCode} transferred to "${transferred.location}".`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 10: Fixed asset transfer failed.`, transferRes);
  }

  // --------------------------------------------------------------------------
  // TEST 11: Fixed Asset Disposal with Realized Amount & Gain/Loss on Sale
  // --------------------------------------------------------------------------
  total++;
  // Disposing Server Rack (AST/2026/0002)
  // Purchase: 850000, AccDep: 212500, NBV: 637500
  // Sold for 680000 -> Gain = 42500
  const disposalRes = await simulate(
    'POST',
    '/api/v1/expenses/assets/ast_002/dispose',
    {
      disposalType: 'SALE',
      realizedAmount: 680000,
      buyerName: 'TechRecycle Systems Pvt Ltd',
      paymentLedgerId: 'led_bank_hdfc',
      notes: 'Sold surplus rack server post cloud migration',
    },
    authHeaders
  );

  const disposal = disposalRes.data?.data;
  if (
    disposalRes.statusCode === 200 &&
    disposal?.realizedAmount === 680000 &&
    disposal?.gainLossAmount === 42500 &&
    disposal?.accountingVoucherNumber
  ) {
    console.log(
      `[PASS] Test 11: Asset ${disposal.assetCode} disposed for ₹${disposal.realizedAmount} with Net Gain of ₹${disposal.gainLossAmount} (GL Voucher: #${disposal.accountingVoucherNumber}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 11: Asset disposal flow failed.`, disposalRes);
  }

  // --------------------------------------------------------------------------
  // TEST 12: Budget Allocation, Actuals Aggregation, Variance Reports & Asset Register
  // --------------------------------------------------------------------------
  total++;
  // Create Department Budget
  const newBudgetRes = await simulate(
    'POST',
    '/api/v1/expenses/budgets',
    {
      financialYear: '2026-2027',
      title: 'Logistics & Warehousing Operations Budget FY26-27',
      budgetType: 'EXPENSE',
      department: 'Logistics',
      totalAllocatedExpense: 5000000,
      totalAllocatedRevenue: 0,
      notes: 'Freight, inter-depot movements, pallet racks and packing materials',
    },
    authHeaders
  );

  const varianceReportRes = await simulate('GET', '/api/v1/expenses/reports/budget-variance', null, authHeaders);
  const assetRegisterRes = await simulate('GET', '/api/v1/expenses/reports/asset-register', null, authHeaders);
  const summaryReportRes = await simulate('GET', '/api/v1/expenses/reports/summary', null, authHeaders);

  const varianceData = varianceReportRes.data?.data;
  const assetRegister = assetRegisterRes.data?.data;
  const summaryData = summaryReportRes.data?.data;

  if (
    newBudgetRes.statusCode === 201 &&
    varianceReportRes.statusCode === 200 &&
    varianceData?.departmentVariances?.length >= 4 &&
    assetRegisterRes.statusCode === 200 &&
    assetRegister?.totalOriginalCost > 0 &&
    summaryReportRes.statusCode === 200 &&
    summaryData?.categoryBreakdown?.length > 0
  ) {
    console.log(
      `[PASS] Test 12: Validated Budget Variance Report (${varianceData.departmentVariances.length} departments), Fixed Asset Register (Total Value: ₹${assetRegister.totalOriginalCost}), and Expense Summary Report.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 12: Budget variance or reports generation failed.`, {
      newBudgetRes,
      varianceReportRes,
      assetRegisterRes,
      summaryReportRes,
    });
  }

  console.log('\n===============================================================');
  console.log(`   PHASE 14 TESTS COMPLETE: ${passed} / ${total} PASSED`);
  console.log('===============================================================\n');

  return { passed, total };
}

if (require.main === module) {
  runPhase14Tests().then(({ passed, total }) => {
    process.exit(passed === total ? 0 : 1);
  });
}

module.exports = { runPhase14Tests };
