const app = require('../backend/dist/app').default;

console.log('===============================================================');
console.log('   KIBO360 – PHASE 06 PURCHASE MANAGEMENT & GENERAL LEDGER');
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

async function runPhase06Tests() {
  let passed = 0;
  let total = 0;

  // 1. Authenticate as Super Admin / Purchase Manager
  const loginRes = await simulate('POST', '/api/v1/auth/login', {
    identifier: 'admin@kibo360.com',
    password: 'Admin@123',
  });
  const token = loginRes.data?.data?.token;

  if (!token) {
    console.error('Failed to obtain token for Phase 06 tests');
    process.exit(1);
  }

  const authHeader = { authorization: `Bearer ${token}` };

  // --------------------------------------------------------------------------
  // TEST 1: PURCHASE REQUISITION CREATION & WORKFLOW
  // --------------------------------------------------------------------------
  total++;
  const prPayload = {
    department: 'Publishing Editorial & Press Depot',
    requiredDate: '2026-11-20T00:00:00.000Z',
    priority: 'HIGH',
    requestedBy: 'Editorial Production Lead',
    remarks: 'Requisition for 2,000 copies of Physics JEE Foundation guide and paper stock',
    items: [
      {
        bookId: 'bk_phy_concepts_eng_pb',
        title: 'Concepts of Physics (Part 1 - Classic Edition)',
        sku: 'BK-PHY-CONCEPTS-ENG-PB',
        isbn: '9788177098845',
        quantity: 2000,
        estimatedRate: 160.0,
      },
    ],
  };

  const createPrRes = await simulate('POST', '/api/v1/purchases/requisitions', prPayload, authHeader);
  const prData = createPrRes.data?.data;

  if (createPrRes.statusCode === 201 && prData?.requisitionNo?.startsWith('PR/') && prData?.status === 'PENDING_APPROVAL') {
    passed++;
    console.log(`[PASS] Test 1: Purchase Requisition -> Created ${prData.requisitionNo} with total ₹${prData.totalEstimated.toLocaleString()} (HTTP 201)`);
  } else {
    console.error('[FAIL] Test 1: Purchase Requisition ->', createPrRes);
  }

  // --------------------------------------------------------------------------
  // TEST 2: REQUISITION APPROVAL BY AUTHORIZED AUTHORITY
  // --------------------------------------------------------------------------
  total++;
  const approveRes = await simulate(
    'POST',
    `/api/v1/purchases/requisitions/${prData.id}/approve`,
    { approved: true, remarks: 'Approved for urgent tender and PO issuance' },
    authHeader
  );
  const approvedPr = approveRes.data?.data;

  if (approveRes.statusCode === 200 && approvedPr?.status === 'APPROVED') {
    passed++;
    console.log(`[PASS] Test 2: Requisition Approval -> Approved ${approvedPr.requisitionNo} by ${approvedPr.approvedBy}`);
  } else {
    console.error('[FAIL] Test 2: Requisition Approval ->', approveRes);
  }

  // --------------------------------------------------------------------------
  // TEST 3: SUPPLIER QUOTATION & SIDE-BY-SIDE COMPARISON MATRIX
  // --------------------------------------------------------------------------
  total++;
  const compareRes = await simulate('GET', '/api/v1/purchases/quotations/compare', null, authHeader);
  const compareData = compareRes.data?.data;

  if (
    compareRes.statusCode === 200 &&
    compareData?.items?.length > 0 &&
    compareData?.suppliersComparedCount >= 2 &&
    compareData?.items[0]?.recommendedSupplierName
  ) {
    passed++;
    const firstRec = compareData.items[0];
    console.log(`[PASS] Test 3: Supplier Comparison Matrix -> Compared ${compareData.suppliersComparedCount} mills for SKU ${firstRec.sku}. Recommended: ${firstRec.recommendedSupplierName} (Landed: ₹${firstRec.supplierOffers[0].landedCostPerUnit})`);
  } else {
    console.error('[FAIL] Test 3: Supplier Comparison Matrix ->', compareRes);
  }

  // --------------------------------------------------------------------------
  // TEST 4: PURCHASE ORDER ISSUANCE WITH GST & FREIGHT
  // --------------------------------------------------------------------------
  total++;
  const poPayload = {
    supplierId: 'pty_supp_papermill',
    supplierName: 'Ballarpur Paper & Pulp Mills Ltd.',
    supplierGstin: '06AAACB9876E1Z1',
    supplierAddress: 'First India Place, MG Road, Gurugram, Haryana',
    supplierStateCode: '06', // Haryana -> Inter-State IGST from Delhi
    expectedDelivery: '2026-11-25T00:00:00.000Z',
    requisitionRef: prData.requisitionNo,
    freightCharges: 4500.0,
    paymentTerms: 'Net 45',
    items: [
      {
        bookId: 'bk_phy_concepts_eng_pb',
        bookTitle: 'Concepts of Physics (Part 1 - Classic Edition)',
        isbn: '9788177098845',
        sku: 'BK-PHY-CONCEPTS-ENG-PB',
        quantity: 2000,
        unitRate: 155.0,
        discountPercent: 5.0, // net rate 147.25
        taxPercent: 0.0, // Educational book exempt
      },
    ],
  };

  const createPoRes = await simulate('POST', '/api/v1/purchases/orders', poPayload, authHeader);
  const poData = createPoRes.data?.data;

  if (createPoRes.statusCode === 201 && poData?.poNumber?.startsWith('PO/') && poData?.status === 'ISSUED') {
    passed++;
    console.log(`[PASS] Test 4: Purchase Order Issuance -> Issued ${poData.poNumber} to ${poData.supplierName} for ₹${poData.grandTotal.toLocaleString()} (HTTP 201)`);
  } else {
    console.error('[FAIL] Test 4: Purchase Order Issuance ->', createPoRes);
  }

  // --------------------------------------------------------------------------
  // TEST 5: GOODS RECEIPT NOTE (PARTIAL & REJECTED GOODS HANDLING) & INWARD STOCK
  // --------------------------------------------------------------------------
  total++;
  // We receive 1,000 out of 2,000 units: 980 accepted, 15 rejected for binding defect, 5 transit damaged
  const grnPayload = {
    purchaseOrderId: poData.id,
    receiptDate: new Date().toISOString(),
    deliveryChallanNo: 'DC-BILT-99411',
    transporterName: 'VRL Logistics Express Ltd.',
    lrNumber: 'VRL-DEL-10294',
    vehicleNumber: 'DL-1L-8942',
    notes: 'First delivery lot received at dock. 980 accepted, 20 defective copies rejected.',
    items: [
      {
        sku: 'BK-PHY-CONCEPTS-ENG-PB',
        bookTitle: 'Concepts of Physics (Part 1 - Classic Edition)',
        receivedQuantity: 1000,
        rejectedQuantity: 15,
        damagedQuantity: 5,
        warehouseRack: 'RACK-B2-01',
        rejectionReason: 'Trimming defects & moisture damage on 20 copies',
      },
    ],
  };

  const createGrnRes = await simulate('POST', '/api/v1/purchases/grn', grnPayload, authHeader);
  const grnData = createGrnRes.data?.data;
  const grnItem = grnData?.items?.[0];

  if (
    createGrnRes.statusCode === 201 &&
    grnData?.grnNumber?.startsWith('GRN/') &&
    grnItem?.acceptedQuantity === 980 &&
    grnItem?.rejectedQuantity === 15 &&
    grnItem?.pendingQuantity === 1020 &&
    grnItem?.batchBarcode?.startsWith('BC-')
  ) {
    passed++;
    console.log(`[PASS] Test 5: Goods Receipt Note (GRN) -> Received 1,000: Accepted 980, Rejected 20, Pending on PO 1,020 (Barcode: ${grnItem.batchBarcode})`);
  } else {
    console.error('[FAIL] Test 5: Goods Receipt Note (GRN) ->', createGrnRes);
  }

  // --------------------------------------------------------------------------
  // TEST 6: PURCHASE INVOICE & 3-WAY MATCH WITH AUTOMATIC GENERAL LEDGER POSTING
  // --------------------------------------------------------------------------
  total++;
  // Bill for 980 accepted copies at net 147.25 = 144,305 + 2,250 freight = 146,555
  const invoicePayload = {
    supplierInvoiceNo: `BILT/INV/${Date.now().toString().slice(-4)}`,
    purchaseOrderId: poData.id,
    goodsReceiptNoteId: grnData.id,
    supplierId: poData.supplierId,
    supplierName: poData.supplierName,
    supplierGstin: poData.supplierGstin,
    supplierStateCode: poData.supplierStateCode,
    freightAmount: 2250.0,
    items: [
      {
        bookId: 'bk_phy_concepts_eng_pb',
        description: 'Concepts of Physics (980 Accepted Copies Billed)',
        sku: 'BK-PHY-CONCEPTS-ENG-PB',
        hsnSacCode: '4901',
        quantity: 980,
        unitRate: 155.0,
        discountAmount: 7595.0, // 5% discount
        taxRate: 0.0,
      },
    ],
  };

  const createInvRes = await simulate('POST', '/api/v1/purchases/invoices', invoicePayload, authHeader);
  const invData = createInvRes.data?.data;

  if (
    createInvRes.statusCode === 201 &&
    invData?.invoiceNumber?.startsWith('PINV/') &&
    invData?.threeWayMatched === true &&
    invData?.accountingVoucherId &&
    invData?.voucherNumber?.startsWith('PB/')
  ) {
    passed++;
    console.log(`[PASS] Test 6: 3-Way Match & Invoice Posting -> Verified PO/GRN match. Generated ${invData.invoiceNumber} linked to General Ledger Voucher ${invData.voucherNumber} (Net: ₹${invData.netPayable.toLocaleString()})`);
  } else {
    console.error('[FAIL] Test 6: 3-Way Match & Invoice Posting ->', createInvRes);
  }

  // --------------------------------------------------------------------------
  // TEST 7: DUPLICATE SUPPLIER BILL PREVENTION (HTTP 409 CONFLICT)
  // --------------------------------------------------------------------------
  total++;
  const duplicateInvRes = await simulate('POST', '/api/v1/purchases/invoices', invoicePayload, authHeader);
  if (duplicateInvRes.statusCode === 409) {
    passed++;
    console.log('[PASS] Test 7: Duplicate Bill Guard -> Rejected duplicate supplier bill number with HTTP 409 Conflict');
  } else {
    console.error('[FAIL] Test 7: Duplicate Bill Guard -> Expected 409, got', duplicateInvRes.statusCode);
  }

  // --------------------------------------------------------------------------
  // TEST 8: PURCHASE RETURN & SUPPLIER DEBIT NOTE WITH LEDGER POSTING
  // --------------------------------------------------------------------------
  total++;
  // Return 30 copies discovered with missing pages after unboxing
  const returnPayload = {
    purchaseInvoiceId: invData.id,
    returnReason: 'Post-inspection missing signature pages 129-144',
    items: [
      {
        bookId: 'bk_phy_concepts_eng_pb',
        sku: 'BK-PHY-CONCEPTS-ENG-PB',
        title: 'Concepts of Physics (Part 1 - Classic Edition)',
        returnedQty: 30,
        unitRate: 147.25,
        taxRate: 0.0,
      },
    ],
  };

  const returnRes = await simulate('POST', '/api/v1/purchases/returns', returnPayload, authHeader);
  const returnData = returnRes.data?.data;

  if (
    returnRes.statusCode === 201 &&
    returnData?.returnNumber?.startsWith('DN/') &&
    returnData?.accountingVoucherId &&
    returnData?.voucherNumber?.startsWith('DN/')
  ) {
    passed++;
    console.log(`[PASS] Test 8: Purchase Return & Debit Note -> Created ${returnData.returnNumber} for ₹${returnData.totalReturnAmount.toLocaleString()} linked to Accounting Voucher ${returnData.voucherNumber}`);
  } else {
    console.error('[FAIL] Test 8: Purchase Return & Debit Note ->', returnRes);
  }

  // --------------------------------------------------------------------------
  // TEST 9: SUPPLIER PAYMENT VOUCHER & INVOICE SETTLEMENT
  // --------------------------------------------------------------------------
  total++;
  // Settle ₹100,000 against the invoice from HDFC Bank Corporate A/c
  const paymentPayload = {
    supplierId: invData.supplierId,
    paymentDate: new Date().toISOString(),
    paymentMode: 'BANK_TRANSFER_NEFT_RTGS',
    bankLedgerId: 'led_bank_hdfc',
    referenceNumber: 'NEFT-HDFC-99120485',
    amount: 100000.0,
    invoicesSettled: [
      {
        invoiceId: invData.id,
        invoiceNumber: invData.invoiceNumber,
        allocatedAmount: 100000.0,
      },
    ],
  };

  const payRes = await simulate('POST', '/api/v1/purchases/payments', paymentPayload, authHeader);
  const payData = payRes.data?.data;

  if (
    payRes.statusCode === 201 &&
    payData?.paymentNumber?.startsWith('PV/') &&
    payData?.accountingVoucherId &&
    payData?.voucherNumber?.startsWith('PV/')
  ) {
    passed++;
    console.log(`[PASS] Test 9: Supplier Payment Voucher -> Paid ₹${payData.amount.toLocaleString()} via ${payData.paymentMode} linked to Ledger Entry ${payData.voucherNumber}`);
  } else {
    console.error('[FAIL] Test 9: Supplier Payment Voucher ->', payRes);
  }

  // --------------------------------------------------------------------------
  // TEST 10: SUPPLIER OUTSTANDING AGEING REPORT (0-30, 31-60, 61-90, 90+ DAYS)
  // --------------------------------------------------------------------------
  total++;
  const ageingRes = await simulate('GET', '/api/v1/purchases/payables/ageing', null, authHeader);
  const ageing = ageingRes.data?.data;

  if (ageingRes.statusCode === 200 && ageing?.items?.length > 0 && ageing?.totalOutstanding > 0) {
    passed++;
    const biltAgeing = ageing.items.find((i) => i.supplierId === 'pty_supp_papermill');
    console.log(`[PASS] Test 10: Supplier Ageing Report -> Outstanding Payables: ₹${ageing.totalOutstanding.toLocaleString()} (BILT Mill Current: ₹${biltAgeing?.currentNotDue.toLocaleString()})`);
  } else {
    console.error('[FAIL] Test 10: Supplier Ageing Report ->', ageingRes);
  }

  // --------------------------------------------------------------------------
  // TEST 11: SUPPLIER CHRONOLOGICAL RUNNING STATEMENT
  // --------------------------------------------------------------------------
  total++;
  const statementRes = await simulate('GET', `/api/v1/purchases/payables/statement/${invData.supplierId}`, null, authHeader);
  const stmt = statementRes.data?.data;

  if (statementRes.statusCode === 200 && stmt?.entries?.length >= 3 && typeof stmt?.closingBalance === 'number') {
    passed++;
    console.log(`[PASS] Test 11: Supplier Statement -> Verified ${stmt.entries.length} chronological ledger entries for ${stmt.supplierName} with closing balance ₹${stmt.closingBalance.toLocaleString()}`);
  } else {
    console.error('[FAIL] Test 11: Supplier Statement ->', statementRes);
  }

  // --------------------------------------------------------------------------
  // TEST 12: PURCHASE REGISTER & SPEND REPORTS
  // --------------------------------------------------------------------------
  total++;
  const registerRes = await simulate('GET', '/api/v1/purchases/reports/register', null, authHeader);
  const register = registerRes.data?.data;

  const supplierSpendRes = await simulate('GET', '/api/v1/purchases/reports/supplier-wise', null, authHeader);
  const supplierSpend = supplierSpendRes.data?.data;

  const bookPurchasesRes = await simulate('GET', '/api/v1/purchases/reports/book-wise', null, authHeader);
  const bookPurchases = bookPurchasesRes.data?.data;

  if (
    registerRes.statusCode === 200 &&
    register?.items?.length >= 2 &&
    supplierSpendRes.statusCode === 200 &&
    supplierSpend?.length > 0 &&
    bookPurchasesRes.statusCode === 200 &&
    bookPurchases?.length > 0
  ) {
    passed++;
    console.log(`[PASS] Test 12: Purchase Registers & Spend Reports -> Verified Purchase Register (₹${register.grandTotal.toLocaleString()}), Supplier Spend & Book Purchases`);
  } else {
    console.error('[FAIL] Test 12: Purchase Registers & Spend Reports ->', { registerRes, supplierSpendRes, bookPurchasesRes });
  }

  console.log('---------------------------------------------------------------');
  console.log(`Phase 06 Test Suite Execution: ${passed} / ${total} Tests Passed!`);
  console.log('===============================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPhase06Tests();
