const app = require('../backend/dist/app').default;

console.log('===============================================================');
console.log('   KIBO360 – PHASE 15 RETURNS & FINANCIAL ADJUSTMENTS TESTS');
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

async function runPhase15Tests() {
  let passed = 0;
  let total = 0;

  // 1. Authenticate as Super Admin / Chief Financial Controller
  const loginRes = await simulate('POST', '/api/v1/auth/login', {
    identifier: 'admin@kibo360.com',
    password: 'Admin@123',
  });
  const token = loginRes.data?.data?.token;
  const authHeaders = { authorization: `Bearer ${token}` };

  console.log(`[INFO] Authenticated as Super Admin. Token acquired.\n`);

  // --------------------------------------------------------------------------
  // TEST 1: Retrieve Seeded Returns & Repositories
  // --------------------------------------------------------------------------
  total++;
  const salesRes = await simulate('GET', '/api/v1/returns/sales', null, authHeaders);
  const purchaseRes = await simulate('GET', '/api/v1/returns/purchases', null, authHeaders);
  const distRes = await simulate('GET', '/api/v1/returns/distributors', null, authHeaders);

  const salesList = salesRes.data?.data;
  const purchaseList = purchaseRes.data?.data;
  const distList = distRes.data?.data;

  if (
    salesRes.statusCode === 200 &&
    Array.isArray(salesList) &&
    salesList.length >= 1 &&
    purchaseRes.statusCode === 200 &&
    Array.isArray(purchaseList) &&
    purchaseList.length >= 1 &&
    distRes.statusCode === 200 &&
    Array.isArray(distList) &&
    distList.length >= 1
  ) {
    console.log(
      `[PASS] Test 1: Verified seeded returns repositories (${salesList.length} sales returns, ${purchaseList.length} purchase returns, ${distList.length} distributor returns).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 1: Could not retrieve seeded returns.`, { salesRes, purchaseRes, distRes });
  }

  // --------------------------------------------------------------------------
  // TEST 2: Partial Sales Return with Damaged Stock Quarantined & Auto-Approved GL Credit Note
  // --------------------------------------------------------------------------
  total++;
  const returnPartialRes = await simulate(
    'POST',
    '/api/v1/returns/sales',
    {
      salesInvoiceId: 'inv_001',
      invoiceNumber: 'INV/2026/0001',
      customerId: 'cust_delhi_books',
      customerName: 'Delhi Book House Retailers',
      returnType: 'PARTIAL',
      returnReason: 'TRANSIT_DAMAGE',
      items: [
        {
          bookId: 'bk_math_10',
          isbn: '978-81-7008-001-1',
          title: 'Senior Secondary Mathematics - Class 10',
          quantity: 40,
          unitRate: 295,
          taxableAmount: 11800,
          gstRate: 0,
          gstAmount: 0,
          totalAmount: 11800,
          condition: 'DAMAGED',
          targetBin: 'DAMAGED_QUARANTINE_BIN',
        },
      ],
      refundMode: 'CREDIT_TO_ACCOUNT',
      approvalThreshold: 25000,
      notes: 'Damaged by carton tear in transport; routed to quarantine bay',
    },
    authHeaders
  );

  const r1 = returnPartialRes.data?.data;
  if (
    returnPartialRes.statusCode === 201 &&
    r1?.status === 'CONFIRMED' &&
    r1?.accountingVoucherNumber &&
    r1?.creditNoteNumber &&
    r1?.stockAdjusted &&
    r1?.royaltyAdjusted
  ) {
    console.log(
      `[PASS] Test 2: Partial sales return ${r1.creditNoteNumber} auto-confirmed with Credit Note Voucher #${r1.accountingVoucherNumber} (Total ₹${r1.totalReturnAmount}, 40 copies quarantined).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 2: Partial sales return failed.`, returnPartialRes);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Duplicate & Excess Return Prevention Guard
  // --------------------------------------------------------------------------
  total++;
  // Invoice has max 500 units. Oxford returned 50, Delhi returned 40 (total 90). Attempting 450 (90 + 450 = 540 > 500).
  const excessReturnRes = await simulate(
    'POST',
    '/api/v1/returns/sales',
    {
      salesInvoiceId: 'inv_001',
      invoiceNumber: 'INV/2026/0001',
      customerId: 'cust_delhi_books',
      customerName: 'Delhi Book House Retailers',
      returnType: 'PARTIAL',
      returnReason: 'EXCESS_STOCK',
      items: [
        {
          bookId: 'bk_math_10',
          isbn: '978-81-7008-001-1',
          title: 'Senior Secondary Mathematics - Class 10',
          quantity: 450,
          unitRate: 295,
          taxableAmount: 132750,
          gstRate: 0,
          gstAmount: 0,
          totalAmount: 132750,
          condition: 'SALEABLE',
          targetBin: 'MAIN_WAREHOUSE',
        },
      ],
      refundMode: 'CREDIT_TO_ACCOUNT',
      approvalThreshold: 25000,
    },
    authHeaders
  );

  if (
    excessReturnRes.statusCode === 400 &&
    excessReturnRes.data?.message?.includes('Duplicate/Excess return rejected')
  ) {
    console.log(
      `[PASS] Test 3: Duplicate & excess return guard enforced: Blocked excess 450 units return exceeding invoice billed total (HTTP 400).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 3: Excess return was not blocked.`, excessReturnRes);
  }

  // --------------------------------------------------------------------------
  // TEST 4: High-Value Sales Return Held in PENDING_APPROVAL
  // --------------------------------------------------------------------------
  total++;
  const highValueRes = await simulate(
    'POST',
    '/api/v1/returns/sales',
    {
      salesInvoiceId: 'inv_002',
      invoiceNumber: 'INV/2026/0002',
      customerId: 'cust_mumbai_dist',
      customerName: 'Maharashtra State Educational Distributors',
      returnType: 'PARTIAL',
      returnReason: 'WRONG_EDITION',
      items: [
        {
          bookId: 'bk_phys_12',
          isbn: '978-81-7008-002-8',
          title: 'Modern Physics - Class 12',
          quantity: 200,
          unitRate: 380,
          taxableAmount: 76000,
          gstRate: 0,
          gstAmount: 0,
          totalAmount: 76000,
          condition: 'SALEABLE',
          targetBin: 'MAIN_WAREHOUSE',
        },
      ],
      refundMode: 'CREDIT_TO_ACCOUNT',
      approvalThreshold: 25000,
      notes: 'Shipped Edition 2 instead of Edition 3 as per order amendment',
    },
    authHeaders
  );

  const r2 = highValueRes.data?.data;
  if (
    highValueRes.statusCode === 201 &&
    r2?.status === 'PENDING_APPROVAL' &&
    !r2?.accountingVoucherNumber &&
    r2?.totalReturnAmount === 76000
  ) {
    console.log(
      `[PASS] Test 4: High-value return ${r2.creditNoteNumber} (₹${r2.totalReturnAmount}) routed to PENDING_APPROVAL status.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 4: High-value return failed approval gating.`, highValueRes);
  }

  // --------------------------------------------------------------------------
  // TEST 5: Manager Approval Workflow & Double-Entry Credit Note Posting
  // --------------------------------------------------------------------------
  total++;
  const approveRes = await simulate(
    'POST',
    `/api/v1/returns/sales/${r2.id}/approval`,
    {
      action: 'APPROVE',
      notes: 'Approved by Commercial Director for exchange credit',
    },
    authHeaders
  );

  const r2Approved = approveRes.data?.data;
  if (
    approveRes.statusCode === 200 &&
    r2Approved?.status === 'CONFIRMED' &&
    r2Approved?.accountingVoucherNumber &&
    r2Approved?.approvedBy
  ) {
    console.log(
      `[PASS] Test 5: Sales return ${r2Approved.creditNoteNumber} approved by ${r2Approved.approvedBy} with GL Voucher #${r2Approved.accountingVoucherNumber}.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 5: Sales return approval failed.`, approveRes);
  }

  // --------------------------------------------------------------------------
  // TEST 6: Reversal of Posted Sales Return Transaction
  // --------------------------------------------------------------------------
  total++;
  const reverseRes = await simulate(
    'POST',
    `/api/v1/returns/sales/${r2.id}/reverse`,
    {
      reason: 'Customer agreed to retain stock with additional 5% discount agreement',
    },
    authHeaders
  );

  const r2Reversed = reverseRes.data?.data;
  if (
    reverseRes.statusCode === 200 &&
    r2Reversed?.status === 'REVERSED' &&
    r2Reversed?.notes?.includes('REVERSED by')
  ) {
    console.log(
      `[PASS] Test 6: Sales return ${r2Reversed.creditNoteNumber} reversed with opposing GL journal entry and audit reason.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 6: Sales return reversal failed.`, reverseRes);
  }

  // --------------------------------------------------------------------------
  // TEST 7: Purchase Return for Defective Material & Debit Note with Input GST Reversal
  // --------------------------------------------------------------------------
  total++;
  const purchaseReturnRes = await simulate(
    'POST',
    '/api/v1/returns/purchases',
    {
      purchaseInvoiceId: 'pinv_002',
      invoiceNumber: 'PINV/2026/0002',
      supplierId: 'sup_002',
      supplierName: 'JK Paper Mills Ltd',
      returnType: 'PARTIAL',
      returnReason: 'REJECTED_STOCK',
      items: [
        {
          bookId: 'raw_paper_coated',
          isbn: 'RAW-PAP-COATED',
          title: 'Art Coated Board 300 GSM for Book Covers',
          quantity: 20,
          unitRate: 1200,
          taxableAmount: 24000,
          gstRate: 12,
          gstAmount: 2880,
          totalAmount: 26880,
          condition: 'DEFECTIVE',
          targetBin: 'DAMAGED_QUARANTINE_BIN',
        },
      ],
      cgstAmount: 1440,
      sgstAmount: 1440,
      settlementType: 'CREDIT_TO_ACCOUNT',
      approvalThreshold: 30000,
      notes: 'Substandard GSM variance detected on cover board reels',
    },
    authHeaders
  );

  const pr = purchaseReturnRes.data?.data;
  if (
    purchaseReturnRes.statusCode === 201 &&
    pr?.debitNoteNumber &&
    pr?.status === 'CONFIRMED' &&
    pr?.accountingVoucherNumber &&
    pr?.totalReturnAmount === 26880
  ) {
    console.log(
      `[PASS] Test 7: Purchase return ${pr.debitNoteNumber} issued to ${pr.supplierName} with Debit Note Voucher #${pr.accountingVoucherNumber} (₹${pr.totalReturnAmount} incl. ITC reversal).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 7: Purchase return failed.`, purchaseReturnRes);
  }

  // --------------------------------------------------------------------------
  // TEST 8: Distributor Unsold Stock Return Receipt
  // --------------------------------------------------------------------------
  total++;
  const distReturnRes = await simulate(
    'POST',
    '/api/v1/returns/distributors',
    {
      distributorId: 'dst_002',
      distributorName: 'Southern Book Agencies Chennai',
      returnType: 'UNSOLD_RETURN',
      warehouseId: 'wh_central_delhi',
      warehouseName: 'Central Warehouse - Delhi',
      targetLocation: 'WAREHOUSE',
      items: [
        {
          bookId: 'bk_math_10',
          isbn: '978-81-7008-001-1',
          title: 'Senior Secondary Mathematics - Class 10',
          quantity: 80,
          unitRate: 295,
          taxableAmount: 23600,
          gstRate: 0,
          gstAmount: 0,
          totalAmount: 23600,
          condition: 'SALEABLE',
          targetBin: 'MAIN_WAREHOUSE',
        },
      ],
      approvalThreshold: 30000,
      notes: 'Returned at end of academic year in saleable condition',
    },
    authHeaders
  );

  const dr = distReturnRes.data?.data;
  if (
    distReturnRes.statusCode === 201 &&
    dr?.returnNumber &&
    dr?.status === 'CONFIRMED' &&
    dr?.totalQuantity === 80
  ) {
    console.log(
      `[PASS] Test 8: Distributor return ${dr.returnNumber} processed for ${dr.distributorName} (${dr.totalQuantity} copies, ₹${dr.totalAmount}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 8: Distributor return failed.`, distReturnRes);
  }

  // --------------------------------------------------------------------------
  // TEST 9: Distributor Consignment Reconciliation Statement
  // --------------------------------------------------------------------------
  total++;
  const reconRes = await simulate(
    'GET',
    '/api/v1/returns/distributors/dst_001/reconciliation',
    null,
    authHeaders
  );

  const recon = reconRes.data?.data;
  if (
    reconRes.statusCode === 200 &&
    recon?.status === 'RECONCILED' &&
    recon?.totalDispatchedCopies === 1000 &&
    recon?.totalReturnedCopies >= 120 &&
    recon?.netSettlementDue > 0
  ) {
    console.log(
      `[PASS] Test 9: Distributor reconciliation statement verified for ${recon.distributorName} (Dispatched: ${recon.totalDispatchedCopies}, Sold: ${recon.totalSoldCopies}, Returned: ${recon.totalReturnedCopies}, Net Due: ₹${recon.netSettlementDue}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 9: Distributor reconciliation failed.`, reconRes);
  }

  // --------------------------------------------------------------------------
  // TEST 10: Financial Adjustment (Trade Rebate / Price Adjustment Credit Note)
  // --------------------------------------------------------------------------
  total++;
  const adjustmentRes = await simulate(
    'POST',
    '/api/v1/returns/adjustments',
    {
      partyType: 'CUSTOMER',
      partyId: 'cust_001',
      partyName: 'Oxford Book Store Pvt Ltd',
      adjustmentType: 'DISCOUNT_REBATE',
      referenceDocumentNumber: 'INV/2026/0001',
      taxableAmount: 5000,
      gstAmount: 0,
      reason: 'Special promotional volume rebate authorized for Class 10 launch',
      approvalThreshold: 10000,
    },
    authHeaders
  );

  const adj = adjustmentRes.data?.data;
  if (
    adjustmentRes.statusCode === 201 &&
    adj?.adjustmentNumber &&
    adj?.status === 'CONFIRMED' &&
    adj?.accountingVoucherNumber
  ) {
    console.log(
      `[PASS] Test 10: Financial adjustment ${adj.adjustmentNumber} (${adj.adjustmentType}) posted with GL Credit Note #${adj.accountingVoucherNumber} (₹${adj.totalAdjustmentAmount}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 10: Financial adjustment failed.`, adjustmentRes);
  }

  // --------------------------------------------------------------------------
  // TEST 11: Direct Customer Refund Payout Settlement
  // --------------------------------------------------------------------------
  total++;
  const refundRes = await simulate(
    'POST',
    '/api/v1/returns/refunds',
    {
      refundType: 'CUSTOMER_REFUND',
      partyId: 'cust_001',
      partyName: 'Oxford Book Store Pvt Ltd',
      referenceCreditDebitNote: 'CN/2026/0001',
      amount: 14750,
      paymentMethod: 'BANK_TRANSFER',
      bankLedgerId: 'led_bank_hdfc',
      notes: 'Direct RTGS refund against transit damage credit balance',
    },
    authHeaders
  );

  const refund = refundRes.data?.data;
  if (
    refundRes.statusCode === 201 &&
    refund?.refundNumber &&
    refund?.status === 'CONFIRMED' &&
    refund?.accountingVoucherNumber &&
    refund?.amount === 14750
  ) {
    console.log(
      `[PASS] Test 11: Customer refund ${refund.refundNumber} disbursed via HDFC Bank with GL Payment Voucher #${refund.accountingVoucherNumber} (₹${refund.amount}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 11: Refund disbursement failed.`, refundRes);
  }

  // --------------------------------------------------------------------------
  // TEST 12: Comprehensive Returns Summary Report & Quarantine Stock Ledger
  // --------------------------------------------------------------------------
  total++;
  const summaryRes = await simulate('GET', '/api/v1/returns/reports/summary', null, authHeaders);
  const quarantineRes = await simulate('GET', '/api/v1/returns/reports/quarantine-stock', null, authHeaders);

  const summary = summaryRes.data?.data;
  const quarantine = quarantineRes.data?.data;

  if (
    summaryRes.statusCode === 200 &&
    summary?.totalSalesReturnsCount >= 2 &&
    summary?.totalPurchaseReturnsCount >= 2 &&
    summary?.topReasons?.length > 0 &&
    quarantineRes.statusCode === 200 &&
    Array.isArray(quarantine) &&
    quarantine.length >= 1
  ) {
    console.log(
      `[PASS] Test 12: Generated Returns Summary Report (Sales Returns: ₹${summary.totalSalesReturnsValue}, Purchase Returns: ₹${summary.totalPurchaseReturnsValue}) and Verified Damaged Quarantine Bin (${quarantine.length} quarantined titles).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 12: Returns reports generation failed.`, { summaryRes, quarantineRes });
  }

  console.log('\n===============================================================');
  console.log(`   PHASE 15 TESTS COMPLETE: ${passed} / ${total} PASSED`);
  console.log('===============================================================\n');

  return { passed, total };
}

if (require.main === module) {
  runPhase15Tests().then(({ passed, total }) => {
    process.exit(passed === total ? 0 : 1);
  });
}

module.exports = { runPhase15Tests };
