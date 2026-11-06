const app = require('../backend/dist/app').default;

console.log('===============================================================');
console.log('   KIBO360 – PHASE 12 GST & INDIAN TAXATION TESTS');
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

async function runPhase12Tests() {
  let passed = 0;
  let total = 0;

  // 1. Authenticate as Super Admin / Chief Tax Officer
  const loginRes = await simulate('POST', '/api/v1/auth/login', {
    identifier: 'admin@kibo360.com',
    password: 'Admin@123',
  });
  const token = loginRes.data?.data?.token;
  const authHeaders = { authorization: `Bearer ${token}` };

  console.log(`[INFO] Authenticated as Super Admin. Token acquired.\n`);

  // --------------------------------------------------------------------------
  // TEST 1: Retrieve Seeded Configurable GST Rates (Books HSN 4901 0% Exempt, Maps 12%, Services 18%)
  // --------------------------------------------------------------------------
  total++;
  const test1Res = await simulate('GET', '/api/v1/taxation/gst-rates', null, authHeaders);
  const rates = test1Res.data?.data;
  const bookRate = rates?.find((r) => r.hsnSacCode === '4901');
  if (
    test1Res.statusCode === 200 &&
    Array.isArray(rates) &&
    rates.length >= 5 &&
    bookRate &&
    bookRate.isExempt === true &&
    bookRate.igstRate === 0
  ) {
    console.log(
      `[PASS] Test 1: Configurable GST rates retrieved (${rates.length} rates seeded; HSN 4901 Printed Books confirmed 0% Exempt).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 1: Failed to retrieve GST rates.`, test1Res);
  }

  // --------------------------------------------------------------------------
  // TEST 2: Administrator Configures Custom GST Rate & Verifies Tax Audit Trail
  // --------------------------------------------------------------------------
  total++;
  const newRatePayload = {
    hsnSacCode: '4911',
    description: 'Trade Catalogues, Advertising Leaflets & Educational Posters',
    itemType: 'GOODS',
    igstRate: 12.0,
    cgstRate: 6.0,
    sgstRate: 6.0,
    cessRate: 0.0,
    isExempt: false,
    status: 'ACTIVE',
  };
  const test2Res = await simulate('POST', '/api/v1/taxation/gst-rates', newRatePayload, authHeaders);
  const createdRate = test2Res.data?.data;

  const auditLogsRes = await simulate('GET', '/api/v1/taxation/audit-logs', null, authHeaders);
  const auditLogs = auditLogsRes.data?.data;
  const rateAudit = auditLogs?.find((l) => l.entityId === 'gst_rate_4911');

  if (
    test2Res.statusCode === 200 &&
    createdRate &&
    createdRate.hsnSacCode === '4911' &&
    createdRate.igstRate === 12.0 &&
    createdRate.adminReviewed === true &&
    rateAudit
  ) {
    console.log(
      `[PASS] Test 2: Administrator configured custom GST rate for HSN 4911 (12% IGST / 6% CGST + 6% SGST) with audit trail logged.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 2: Failed to configure custom GST rate.`, test2Res);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Intra-State GST Calculation (Delhi to Delhi -> CGST 6% + SGST 6%)
  // --------------------------------------------------------------------------
  total++;
  const intraCalcPayload = {
    supplierGstin: '07AABCK1234D1Z2', // Delhi (07)
    placeOfSupply: '07', // Delhi (07) -> Intra-State
    pricingType: 'EXCLUSIVE',
    items: [
      {
        hsnSacCode: '4905', // Maps & Educational Globes (12% GST)
        description: 'Physical Wall Map of India (Pack of 10)',
        quantity: 10,
        unitPrice: 1000.0,
      },
    ],
  };
  const test3Res = await simulate('POST', '/api/v1/taxation/calculate', intraCalcPayload, authHeaders);
  const intraCalc = test3Res.data?.data;
  if (
    test3Res.statusCode === 200 &&
    intraCalc &&
    intraCalc.isInterState === false &&
    intraCalc.totalTaxableValue === 10000.0 &&
    intraCalc.totalCgst === 600.0 &&
    intraCalc.totalSgst === 600.0 &&
    intraCalc.totalIgst === 0.0 &&
    intraCalc.grandTotal === 11200.0
  ) {
    console.log(
      `[PASS] Test 3: Intra-State GST calculated correctly: Taxable ₹10,000 -> CGST ₹600 (6%) + SGST ₹600 (6%), Total ₹11,200.00.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 3: Intra-state tax calculation failed.`, test3Res);
  }

  // --------------------------------------------------------------------------
  // TEST 4: Inter-State GST Calculation (Delhi to Maharashtra -> IGST 18%)
  // --------------------------------------------------------------------------
  total++;
  const interCalcPayload = {
    supplierGstin: '07AABCK1234D1Z2', // Delhi (07)
    placeOfSupply: '27', // Maharashtra (27) -> Inter-State
    pricingType: 'EXCLUSIVE',
    items: [
      {
        hsnSacCode: '9973', // Royalty Licensing Services (18% GST)
        description: 'Publishing Translation Rights Licensing',
        quantity: 1,
        unitPrice: 50000.0,
      },
    ],
  };
  const test4Res = await simulate('POST', '/api/v1/taxation/calculate', interCalcPayload, authHeaders);
  const interCalc = test4Res.data?.data;
  if (
    test4Res.statusCode === 200 &&
    interCalc &&
    interCalc.isInterState === true &&
    interCalc.totalTaxableValue === 50000.0 &&
    interCalc.totalIgst === 9000.0 &&
    interCalc.totalCgst === 0.0 &&
    interCalc.totalSgst === 0.0 &&
    interCalc.grandTotal === 59000.0
  ) {
    console.log(
      `[PASS] Test 4: Inter-State GST calculated correctly: Taxable ₹50,000 -> IGST ₹9,000 (18%), Total ₹59,000.00.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 4: Inter-state tax calculation failed.`, test4Res);
  }

  // --------------------------------------------------------------------------
  // TEST 5: Tax-Inclusive Pricing Calculation with Mathematical Reverse Derivation
  // Billed Total: ₹1,180.00 @ 18% IGST -> Taxable: ₹1,000.00 | Tax: ₹180.00
  // --------------------------------------------------------------------------
  total++;
  const inclusiveCalcPayload = {
    supplierGstin: '07AABCK1234D1Z2',
    placeOfSupply: '27', // Inter-state
    pricingType: 'INCLUSIVE',
    items: [
      {
        hsnSacCode: '9973',
        description: 'Online Digital Learning Companion Access License',
        quantity: 1,
        unitPrice: 1180.0,
      },
    ],
  };
  const test5Res = await simulate('POST', '/api/v1/taxation/calculate', inclusiveCalcPayload, authHeaders);
  const incCalc = test5Res.data?.data;
  if (
    test5Res.statusCode === 200 &&
    incCalc &&
    incCalc.totalTaxableValue === 1000.0 &&
    incCalc.totalIgst === 180.0 &&
    incCalc.grandTotal === 1180.0
  ) {
    console.log(
      `[PASS] Test 5: Tax-Inclusive pricing verified: Gross ₹1,180.00 back-calculated to Taxable ₹1,000.00 + IGST ₹180.00.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 5: Tax inclusive reverse derivation failed.`, test5Res);
  }

  // --------------------------------------------------------------------------
  // TEST 6: B2B Tax Invoice Generation & Double-Entry General Ledger Posting
  // --------------------------------------------------------------------------
  total++;
  const invoicePayload = {
    docType: 'TAX_INVOICE',
    supplierGstin: '07AABCK1234D1Z2', // Delhi HQ
    placeOfSupply: '27', // Maharashtra
    recipientGstin: '27AABCT9918D1Z4',
    recipientName: 'Apex Western Educational Distributors Pvt Ltd',
    pricingType: 'EXCLUSIVE',
    items: [
      {
        hsnSacCode: '4905', // Maps (12% IGST)
        description: 'Advanced Topographical World Atlases (Hardcover)',
        quantity: 100,
        unitPrice: 800.0, // Taxable: ₹80,000 | IGST: ₹9,600 | Total: ₹89,600
      },
    ],
    notes: 'B2B supply of educational reference atlases',
  };
  const test6Res = await simulate('POST', '/api/v1/taxation/invoices', invoicePayload, authHeaders);
  const createdInv = test6Res.data?.data;
  if (
    test6Res.statusCode === 201 &&
    createdInv &&
    createdInv.invoiceNumber.startsWith('INV/2026/') &&
    createdInv.recipientType === 'B2B' &&
    createdInv.totalTaxableValue === 80000.0 &&
    createdInv.igstAmount === 9600.0 &&
    createdInv.grandTotal === 89600.0 &&
    createdInv.accountingVoucherNumber
  ) {
    console.log(
      `[PASS] Test 6: B2B Tax Invoice generated (#${createdInv.invoiceNumber} - Total ₹89,600 with GL Voucher #${createdInv.accountingVoucherNumber}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 6: B2B tax invoice creation failed.`, test6Res);
  }

  // --------------------------------------------------------------------------
  // TEST 7: Exempt Bill of Supply for Printed Books (HSN 4901 0% GST)
  // --------------------------------------------------------------------------
  total++;
  const bosPayload = {
    docType: 'BILL_OF_SUPPLY',
    supplierGstin: '07AABCK1234D1Z2',
    placeOfSupply: '07',
    recipientName: 'St. Xavier Senior Secondary School',
    pricingType: 'EXCLUSIVE',
    items: [
      {
        hsnSacCode: '4901',
        description: 'Concepts of Physics (Exempt Printed Textbooks)',
        quantity: 200,
        unitPrice: 495.0,
        isExempt: true,
      },
    ],
    notes: 'Exempt supply pursuant to Notification No. 02/2017-Central Tax (Rate)',
  };
  const test7Res = await simulate('POST', '/api/v1/taxation/invoices', bosPayload, authHeaders);
  const createdBos = test7Res.data?.data;
  if (
    test7Res.statusCode === 201 &&
    createdBos &&
    createdBos.docType === 'BILL_OF_SUPPLY' &&
    createdBos.invoiceNumber.startsWith('BOS/2026/') &&
    createdBos.totalTaxableValue === 99000.0 &&
    createdBos.cgstAmount === 0 &&
    createdBos.sgstAmount === 0 &&
    createdBos.igstAmount === 0 &&
    createdBos.grandTotal === 99000.0
  ) {
    console.log(
      `[PASS] Test 7: Bill of Supply issued for exempt printed books (#${createdBos.invoiceNumber} - Total ₹99,000, Tax ₹0).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 7: Bill of supply creation failed.`, test7Res);
  }

  // --------------------------------------------------------------------------
  // TEST 8: Sales Credit Note Generation & GST Output Tax Reversal
  // --------------------------------------------------------------------------
  total++;
  const creditNotePayload = {
    docType: 'CREDIT_NOTE',
    originalInvoiceNumber: createdInv.invoiceNumber,
    supplierGstin: '07AABCK1234D1Z2',
    placeOfSupply: '27',
    recipientGstin: '27AABCT9918D1Z4',
    recipientName: 'Apex Western Educational Distributors Pvt Ltd',
    pricingType: 'EXCLUSIVE',
    items: [
      {
        hsnSacCode: '4905',
        description: 'Return of transit-damaged atlases',
        quantity: 10,
        unitPrice: 800.0, // Reversing Taxable: ₹8,000 | IGST: ₹960 | Total: ₹8,960
      },
    ],
    notes: 'Damage allowance credit note under Section 34 of CGST Act',
  };
  const test8Res = await simulate('POST', '/api/v1/taxation/invoices', creditNotePayload, authHeaders);
  const createdCn = test8Res.data?.data;
  if (
    test8Res.statusCode === 201 &&
    createdCn &&
    createdCn.docType === 'CREDIT_NOTE' &&
    createdCn.invoiceNumber.startsWith('CN/2026/') &&
    createdCn.totalTaxableValue === 8000.0 &&
    createdCn.igstAmount === 960.0 &&
    createdCn.grandTotal === 8960.0 &&
    createdCn.accountingVoucherNumber
  ) {
    console.log(
      `[PASS] Test 8: Sales Credit Note generated (#${createdCn.invoiceNumber} - Reversing Taxable ₹8,000 & Output IGST ₹960, GL Voucher #${createdCn.accountingVoucherNumber}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 8: Credit note creation failed.`, test8Res);
  }

  // --------------------------------------------------------------------------
  // TEST 9: E-Invoice (IRN) Generation & Signed QR Code Mock Storage
  // --------------------------------------------------------------------------
  total++;
  const irnPayload = { invoiceId: createdInv.id };
  const test9Res = await simulate('POST', '/api/v1/taxation/e-invoice/generate-irn', irnPayload, authHeaders);
  const irnData = test9Res.data?.data;
  if (
    test9Res.statusCode === 200 &&
    irnData &&
    irnData.irn &&
    irnData.irn.length === 64 &&
    irnData.signedQrCode &&
    irnData.irnStatus === 'GENERATED'
  ) {
    console.log(
      `[PASS] Test 9: E-Invoice IRN generated (64-char SHA256: ${irnData.irn.substring(0, 16)}... and Signed QR payload stored).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 9: IRN generation failed.`, test9Res);
  }

  // --------------------------------------------------------------------------
  // TEST 10: E-Way Bill Generation & Distance-Based Validity Calculation
  // --------------------------------------------------------------------------
  total++;
  const ewbPayload = {
    invoiceId: createdInv.id,
    transporterName: 'VRL Logistics India Ltd.',
    vehicleNumber: 'DL-01-AB-9921',
    distanceKm: 650, // 650 km / 200 km/day = 4 days validity
    dispatchAddress: '4832/24, Ansari Road, Daryaganj, New Delhi',
    shipToAddress: '120, Budhwar Peth, Pune, Maharashtra',
  };
  const test10Res = await simulate('POST', '/api/v1/taxation/eway-bill/generate', ewbPayload, authHeaders);
  const ewbData = test10Res.data?.data;
  if (
    test10Res.statusCode === 201 &&
    ewbData &&
    ewbData.ewbNumber.length === 12 &&
    ewbData.distanceKm === 650 &&
    ewbData.status === 'ACTIVE' &&
    ewbData.validUntil
  ) {
    console.log(
      `[PASS] Test 10: E-Way Bill generated (#${ewbData.ewbNumber} for 650 km consignment, 4-day validity pursuant to 200 km/day rule).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 10: E-Way Bill generation failed.`, test10Res);
  }

  // --------------------------------------------------------------------------
  // TEST 11: TDS Deduction with PAN Verification vs Section 206AA Penal Rate (10% vs 20%)
  // --------------------------------------------------------------------------
  total++;
  // Case A: Standard PAN -> 10% TDS
  const tdsA = {
    sectionCode: '194J_ROYALTY',
    partyId: 'auth_sharma_01',
    partyName: 'Dr. R. D. Sharma',
    partyPan: 'AAAPS9912K', // Valid 10-char PAN
    billOrPaymentRef: 'ROY/2026/Q2-01',
    paymentDate: '2026-11-04',
    grossAmount: 100000.0,
    financialYear: '2026-2027',
    quarter: 'Q2',
  };
  const test11ARes = await simulate('POST', '/api/v1/taxation/tds/deduct', tdsA, authHeaders);
  const tdsRecordA = test11ARes.data?.data;

  // Case B: Invalid PAN -> 20% Penal TDS under Section 206AA
  const tdsB = {
    sectionCode: '194J_ROYALTY',
    partyId: 'auth_unknown_02',
    partyName: 'Guest Contributor (Unverified PAN)',
    partyPan: 'INVALIDPAN', // Invalid PAN format
    billOrPaymentRef: 'BILL/2026/8812',
    paymentDate: '2026-11-04',
    grossAmount: 50000.0,
    financialYear: '2026-2027',
    quarter: 'Q2',
  };
  const test11BRes = await simulate('POST', '/api/v1/taxation/tds/deduct', tdsB, authHeaders);
  const tdsRecordB = test11BRes.data?.data;

  if (
    test11ARes.statusCode === 201 &&
    tdsRecordA &&
    tdsRecordA.tdsRate === 10.0 &&
    tdsRecordA.tdsAmount === 10000.0 &&
    tdsRecordA.isPanValid === true &&
    test11BRes.statusCode === 201 &&
    tdsRecordB &&
    tdsRecordB.tdsRate === 20.0 &&
    tdsRecordB.tdsAmount === 10000.0 &&
    tdsRecordB.isPanValid === false
  ) {
    console.log(
      `[PASS] Test 11: TDS compliance verified: Valid PAN deducted @ 10% (₹10,000 on ₹1,00,000); Invalid PAN triggered Section 206AA higher 20% penal rate (₹10,000 on ₹50,000).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 11: TDS deduction testing failed.`, { test11ARes, test11BRes });
  }

  // --------------------------------------------------------------------------
  // TEST 12: GSTR-1, GSTR-3B with Rule 42 ITC Reversal & Form 26Q Summary Reports
  // --------------------------------------------------------------------------
  total++;
  const gstr1Res = await simulate('GET', '/api/v1/taxation/reports/gstr1?fy=2026-2027&period=2026-10', null, authHeaders);
  const gstr3bRes = await simulate('GET', '/api/v1/taxation/reports/gstr3b?fy=2026-2027&period=2026-10', null, authHeaders);
  const form26qRes = await simulate('GET', '/api/v1/taxation/reports/form26q?fy=2026-2027&quarter=Q2', null, authHeaders);

  const gstr1 = gstr1Res.data?.data;
  const gstr3b = gstr3bRes.data?.data;
  const form26q = form26qRes.data?.data;

  if (
    gstr1Res.statusCode === 200 &&
    gstr1 &&
    gstr1.b2bInvoicesCount >= 1 &&
    gstr1.cdnrCount >= 1 &&
    gstr1.exemptSuppliesValue > 0 &&
    Array.isArray(gstr1.hsnSummary) &&
    gstr3bRes.statusCode === 200 &&
    gstr3b &&
    gstr3b.table4_EligibleItc?.itcReversedRule42 &&
    gstr3b.table5_TaxLiabilityLedgerOffset &&
    form26qRes.statusCode === 200 &&
    form26q &&
    form26q.deductionsCount >= 2
  ) {
    console.log(
      `[PASS] Test 12: Tax reports generated: GSTR-1 (B2B, CDNR, Exempt Books & HSN table), GSTR-3B (Rule 42 ITC Reversal & Sec 49 Ledger Offset), and Form 26Q TDS Summary.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 12: Tax reports generation failed.`, { gstr1Res, gstr3bRes, form26qRes });
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`   PHASE 12 TAXATION TESTS: ${passed}/${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('===============================================================\n');

  return { passed, total };
}

if (require.main === module) {
  runPhase12Tests()
    .then(({ passed, total }) => {
      process.exit(passed === total ? 0 : 1);
    })
    .catch((err) => {
      console.error('Unhandled Test Runner Error:', err);
      process.exit(1);
    });
}

module.exports = { runPhase12Tests };
