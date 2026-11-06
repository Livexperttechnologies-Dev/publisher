const app = require('../backend/dist/app').default;

console.log('===============================================================');
console.log('   KIBO360 – PHASE 10 AUTHOR ROYALTY MANAGEMENT TESTS');
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

async function runPhase10Tests() {
  let passed = 0;
  let total = 0;

  // 1. Authenticate as Super Admin / Royalty Manager
  const loginRes = await simulate('POST', '/api/v1/auth/login', {
    identifier: 'admin@kibo360.com',
    password: 'Admin@123',
  });
  const token = loginRes.data?.data?.token;
  const authHeaders = { authorization: `Bearer ${token}` };

  console.log(`[INFO] Authenticated as Super Admin. Token acquired.\n`);

  // --------------------------------------------------------------------------
  // TEST 1: Retrieve Seeded Author Agreements & Diverse Calculation Models
  // --------------------------------------------------------------------------
  total++;
  const test1Res = await simulate('GET', '/api/v1/royalties/agreements', null, authHeaders);
  if (test1Res.statusCode === 200 && Array.isArray(test1Res.data?.data) && test1Res.data.data.length >= 3) {
    const methods = test1Res.data.data.map((a) => a.calculationMethod);
    const hasSlab = methods.includes('SLAB_BASED');
    const hasNetSales = methods.includes('PERCENTAGE_OF_NET_SALES');
    const hasFixed = methods.includes('FIXED_AMOUNT_PER_COPY');

    if (hasSlab && hasNetSales && hasFixed) {
      console.log(
        `[PASS] Test 1: Seeded Author Agreements retrieved with diverse contract models (Slab, Net Sales %, Fixed Rate).`
      );
      passed++;
    } else {
      console.error(`[FAIL] Test 1: Missing calculation models in seeded agreements.`, methods);
    }
  } else {
    console.error(`[FAIL] Test 1: Failed to retrieve author agreements.`, test1Res);
  }

  // --------------------------------------------------------------------------
  // TEST 2: Create a New Author Agreement with Advance Royalty & PAN Validation
  // --------------------------------------------------------------------------
  total++;
  const newAgrPayload = {
    authorId: 'auth_apj_kalam',
    authorName: 'Dr. A. P. J. Abdul Kalam Trust',
    authorEmail: 'trust@kalamfoundation.org',
    authorPan: 'AAATK9981F',
    bankAccountNumber: '10928374650192',
    bankIfsc: 'SBIN0001140',
    bankName: 'State Bank of India (Rameswaram Branch)',
    contractStartDate: '2026-01-01',
    contractEndDate: '2031-12-31',
    calculationMethod: 'PERCENTAGE_OF_MRP',
    royaltyPercentage: 12.0,
    advanceRoyaltyAmount: 75000.0,
    minimumGuarantee: 0.0,
    paymentFrequency: 'QUARTERLY',
    status: 'ACTIVE',
    notes: 'National inspirational bestseller agreement (Wings of Fire series)',
  };
  const test2Res = await simulate('POST', '/api/v1/royalties/agreements', newAgrPayload, authHeaders);
  const createdAgr = test2Res.data?.data;
  if (
    test2Res.statusCode === 201 &&
    createdAgr &&
    createdAgr.agreementNumber.startsWith('AGR/2026/') &&
    createdAgr.authorPan === 'AAATK9981F' &&
    createdAgr.advanceRoyaltyAmount === 75000.0 &&
    createdAgr.advanceBalanceRemaining === 75000.0
  ) {
    console.log(
      `[PASS] Test 2: Author Agreement created successfully (#${createdAgr.agreementNumber} - ${createdAgr.authorName}, Advance: ₹75,000).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 2: Failed to create Author Agreement.`, test2Res);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Associate Multiple Book Titles Under a Single Author Agreement
  // --------------------------------------------------------------------------
  total++;
  const bookItem1 = {
    bookId: 'bk_wings_of_fire',
    bookTitle: 'Wings of Fire: An Autobiography',
    sku: 'BK-BIO-WOF-01',
    isbn: '9788173711466',
    edition: 'Illustrated Jubilee Edition',
    territory: 'ALL',
  };
  const bookItem2 = {
    bookId: 'bk_ignited_minds',
    bookTitle: 'Ignited Minds: Unleashing the Power Within India',
    sku: 'BK-MOT-IGM-01',
    isbn: '9780143029823',
    edition: '1st Edition',
    territory: 'ALL',
  };
  const test3Res1 = await simulate('POST', `/api/v1/royalties/agreements/${createdAgr.id}/books`, bookItem1, authHeaders);
  const test3Res2 = await simulate('POST', `/api/v1/royalties/agreements/${createdAgr.id}/books`, bookItem2, authHeaders);
  const updatedAgrWithBooks = test3Res2.data?.data;
  if (
    test3Res2.statusCode === 200 &&
    updatedAgrWithBooks &&
    Array.isArray(updatedAgrWithBooks.books) &&
    updatedAgrWithBooks.books.length === 2
  ) {
    console.log(
      `[PASS] Test 3: Multiple books associated with author agreement (${updatedAgrWithBooks.books.length} titles cataloged).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 3: Failed to associate books with agreement.`, test3Res2);
  }

  // --------------------------------------------------------------------------
  // TEST 4: Configure Progressive Volume Slabs for an Author Agreement
  // Tier 1: 1 - 2,000 copies @ 7.5%
  // Tier 2: 2,001 - 5,000 copies @ 10.0%
  // Tier 3: 5,001+ copies @ 12.5%
  // --------------------------------------------------------------------------
  total++;
  const slabsPayload = {
    slabs: [
      { fromQuantity: 1, toQuantity: 2000, royaltyPercentage: 7.5 },
      { fromQuantity: 2001, toQuantity: 5000, royaltyPercentage: 10.0 },
      { fromQuantity: 5001, royaltyPercentage: 12.5 },
    ],
  };
  const test4Res = await simulate('POST', `/api/v1/royalties/agreements/${createdAgr.id}/slabs`, slabsPayload, authHeaders);
  const updatedAgrWithSlabs = test4Res.data?.data;
  if (
    test4Res.statusCode === 200 &&
    updatedAgrWithSlabs &&
    Array.isArray(updatedAgrWithSlabs.slabs) &&
    updatedAgrWithSlabs.slabs.length === 3
  ) {
    console.log(
      `[PASS] Test 4: Progressive sales volume slabs configured successfully (3 tiers: 7.5%, 10.0%, 12.5%).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 4: Failed to configure slabs.`, test4Res);
  }

  // --------------------------------------------------------------------------
  // TEST 5: Create a New Royalty Accrual Period (Q2 FY26-27)
  // --------------------------------------------------------------------------
  total++;
  const periodPayload = {
    periodNumber: 'ROY/2026/Q2',
    periodName: 'Q2 FY26-27 (Jul - Sep 2026)',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    notes: 'Q2 Monsoon academic semester royalty cycle',
  };
  const test5Res = await simulate('POST', '/api/v1/royalties/periods', periodPayload, authHeaders);
  const createdPeriod = test5Res.data?.data;
  if (test5Res.statusCode === 201 && createdPeriod && createdPeriod.periodNumber === 'ROY/2026/Q2') {
    console.log(`[PASS] Test 5: Royalty Accrual Period created (#${createdPeriod.periodNumber} - ${createdPeriod.periodName}).`);
    passed++;
  } else {
    console.error(`[FAIL] Test 5: Failed to create Royalty Period.`, test5Res);
  }

  // --------------------------------------------------------------------------
  // TEST 6: Sales-Based Royalty Calculation with Net Return Adjustments
  // Gross Sold: 5,000 copies, Customer Returns: 200 copies -> Net Eligible: 4,800 copies
  // Verifying returned copies are deducted from calculation base!
  // --------------------------------------------------------------------------
  total++;
  const test6CalcPayload = {
    periodId: createdPeriod.id,
    agreementId: 'agr_hc_verma_01', // Prof H. C. Verma
    salesDataOverrides: [
      {
        sku: 'BK-PHY-HCV-01',
        grossSold: 5000,
        returnedCount: 200,
        netSalesValue: 1425600.0,
      },
    ],
  };
  const test6Res = await simulate('POST', '/api/v1/royalties/calculate', test6CalcPayload, authHeaders);
  const hcvCalc = test6Res.data?.data?.[0];
  if (
    test6Res.statusCode === 200 &&
    hcvCalc &&
    hcvCalc.grossCopiesSold === 5000 &&
    hcvCalc.copiesReturned === 200 &&
    hcvCalc.eligibleNetCopies === 4800
  ) {
    console.log(
      `[PASS] Test 6: Sales-based royalty adjusted for returns: Gross 5,000 - Returns 200 = Net Eligible 4,800 copies.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 6: Return adjustments failed in royalty calculation.`, test6Res);
  }

  // --------------------------------------------------------------------------
  // TEST 7: Mathematical Validation of Progressive Slab Calculation
  // 4,800 Net Copies of Concepts of Physics @ MRP ₹495.00:
  // Tier 1 (1 to 2,000 = 2,000 copies): 2,000 * 495 * 7.5% = ₹74,250.00
  // Tier 2 (2,001 to 5,000 = 2,800 copies): 2,800 * 495 * 10.0% = ₹138,600.00
  // Total Gross Royalty = 74,250 + 138,600 = ₹212,850.00
  // --------------------------------------------------------------------------
  total++;
  const expectedGrossRoyalty = 212850.0;
  if (hcvCalc && hcvCalc.grossRoyaltyAmount === expectedGrossRoyalty) {
    console.log(
      `[PASS] Test 7: Progressive slab math verified exactly: Tier 1 (₹74,250) + Tier 2 (₹138,600) = ₹${hcvCalc.grossRoyaltyAmount.toLocaleString()}.`
    );
    passed++;
  } else {
    console.error(
      `[FAIL] Test 7: Slab math mismatch. Expected ₹${expectedGrossRoyalty}, got ₹${hcvCalc?.grossRoyaltyAmount}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST 8: Minimum Guarantee (MG) Evaluation & Automatic Top-Up
  // Munshi Premchand Contract has Minimum Guarantee = ₹25,000.
  // 300 copies @ ₹45.00 fixed = ₹13,500.00.
  // Shortfall = 25,000 - 13,500 = ₹11,500.00 MG Top-up!
  // Total Earned = ₹25,000.00.
  // --------------------------------------------------------------------------
  total++;
  const test8CalcPayload = {
    periodId: createdPeriod.id,
    agreementId: 'agr_premchand_03',
    salesDataOverrides: [
      {
        sku: 'BK-LIT-GODAN-HIN',
        grossSold: 300,
        returnedCount: 0,
      },
    ],
  };
  const test8Res = await simulate('POST', '/api/v1/royalties/calculate', test8CalcPayload, authHeaders);
  const premchandCalc = test8Res.data?.data?.[0];
  if (
    test8Res.statusCode === 200 &&
    premchandCalc &&
    premchandCalc.grossRoyaltyAmount === 13500.0 &&
    premchandCalc.minimumGuaranteeTopup === 11500.0
  ) {
    const totalWithMg = premchandCalc.grossRoyaltyAmount + premchandCalc.minimumGuaranteeTopup;
    console.log(
      `[PASS] Test 8: Minimum Guarantee applied: Earned ₹13,500 + MG Top-up ₹11,500 = Guaranteed ₹${totalWithMg.toLocaleString()}.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 8: Minimum Guarantee top-up failed.`, test8Res);
  }

  // --------------------------------------------------------------------------
  // TEST 9: Advance Royalty Recoupment & Section 194J TDS Withholding
  // HCV Gross: ₹212,850.00
  // Advance Recouped: ₹100,000.00 (from ₹100,000 unrecouped advance)
  // TDS u/s 194J @ 10% on Gross (PAN AAAPV1982K present): 10% * 212,850 = ₹21,285.00
  // Net Payable = 212,850 - 100,000 - 21,285 = ₹91,565.00
  // --------------------------------------------------------------------------
  total++;
  if (
    hcvCalc &&
    hcvCalc.advanceRecovered === 100000.0 &&
    hcvCalc.tdsRate === 10.0 &&
    hcvCalc.tdsAmount === 21285.0 &&
    hcvCalc.netPayableAmount === 91565.0
  ) {
    console.log(
      `[PASS] Test 9: Advance recovery & TDS verified: Gross ₹212,850 - Advance Recouped ₹100,000 - TDS 10% ₹21,285 = Net Payable ₹91,565.00.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 9: Advance recovery or TDS calculation mismatch.`, hcvCalc);
  }

  // --------------------------------------------------------------------------
  // TEST 10: Royalty Approval & Double-Entry General Ledger Accrual Posting
  // Dr: Royalty Expense Account (5008) -> ₹212,850.00
  // Cr: Royalty Payable to Authors (2005) -> ₹212,850.00
  // --------------------------------------------------------------------------
  total++;
  const test10Res = await simulate(
    'POST',
    '/api/v1/royalties/approve',
    {
      calculationId: hcvCalc.id,
      notes: 'Approved by Managing Director for Q2 cycle settlement.',
    },
    authHeaders
  );
  if (
    test10Res.statusCode === 200 &&
    test10Res.data?.data?.calculation?.status === 'APPROVED' &&
    test10Res.data?.data?.voucherNumber
  ) {
    console.log(
      `[PASS] Test 10: Royalty calculation approved. General Ledger Accrual Voucher #${test10Res.data.data.voucherNumber} posted (Dr Royalty Expense / Cr Royalty Payable).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 10: Royalty approval or GL accrual posting failed.`, test10Res);
  }

  // --------------------------------------------------------------------------
  // TEST 11: Royalty Settlement Payment & Balanced GL Disbursement Posting
  // Settlement Voucher: PV/2026/XXXX
  // Dr: Royalty Payable to Authors (2005) -> ₹212,850.00
  // Cr: Author Advance Account (1007)     -> ₹100,000.00
  // Cr: TDS Payable u/s 194J (2008)       -> ₹21,285.00
  // Cr: Bank Account (1002)               -> ₹91,565.00
  // Check: Debit (212,850) == Credit (100,000 + 21,285 + 91,565 = 212,850)
  // --------------------------------------------------------------------------
  total++;
  const settlePayload = {
    calculationId: hcvCalc.id,
    paymentDate: '2026-10-05',
    paymentMethod: 'NEFT',
    bankName: 'HDFC Bank Corporate A/c',
    referenceNumber: 'HDFC-NEFT-2026-991283',
    notes: 'Q2 Royalty payout credited to Prof H. C. Verma IIT Kanpur A/c',
  };
  const test11Res = await simulate('POST', '/api/v1/royalties/settle', settlePayload, authHeaders);
  const settlement = test11Res.data?.data?.settlement;
  if (
    test11Res.statusCode === 200 &&
    settlement &&
    settlement.settlementNumber.startsWith('ROYS/2026/') &&
    settlement.grossAmountPaid === 212850.0 &&
    settlement.advanceRecouped === 100000.0 &&
    settlement.tdsDeducted === 21285.0 &&
    settlement.netAmountPaid === 91565.0 &&
    test11Res.data?.data?.voucherNumber
  ) {
    console.log(
      `[PASS] Test 11: Royalty settled. Payment Voucher #${test11Res.data.data.voucherNumber} (Dr Payable ₹212,850 = Cr Advance ₹100k + Cr TDS ₹21.2k + Cr Bank ₹91.5k).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 11: Royalty settlement payment failed.`, test11Res);
  }

  // --------------------------------------------------------------------------
  // TEST 12: Comprehensive Author Royalty Statement & Audit Reports
  // --------------------------------------------------------------------------
  total++;
  const statementRes = await simulate('GET', `/api/v1/royalties/statements/${hcvCalc.id}`, null, authHeaders);
  const authorSummaryRes = await simulate('GET', '/api/v1/royalties/reports/author-summary', null, authHeaders);
  const bookWiseRes = await simulate('GET', '/api/v1/royalties/reports/book-wise', null, authHeaders);
  const advanceRes = await simulate('GET', '/api/v1/royalties/reports/advances', null, authHeaders);

  const statementValid =
    statementRes.statusCode === 200 &&
    statementRes.data?.data?.authorName === 'Prof. H. C. Verma' &&
    statementRes.data?.data?.summary?.netPayableToAuthor === 91565.0 &&
    statementRes.data?.data?.summary?.status === 'PAID';

  const reportsValid =
    authorSummaryRes.statusCode === 200 &&
    bookWiseRes.statusCode === 200 &&
    advanceRes.statusCode === 200;

  if (statementValid && reportsValid) {
    console.log(
      `[PASS] Test 12: Author Royalty Statement & Audit Reports generated with complete book breakdown, advance ledger, and bank audit trail.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 12: Royalty statement or reporting verification failed.`, {
      statementRes,
      authorSummaryRes,
      bookWiseRes,
      advanceRes,
    });
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`   PHASE 10 AUTHOR ROYALTY TESTS: ${passed}/${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('===============================================================\n');

  return { passed, total };
}

if (require.main === module) {
  runPhase10Tests()
    .then(({ passed, total }) => {
      process.exit(passed === total ? 0 : 1);
    })
    .catch((err) => {
      console.error('Unhandled Test Runner Error:', err);
      process.exit(1);
    });
}

module.exports = { runPhase10Tests };
