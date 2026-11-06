const app = require('../backend/dist/app').default;

console.log('===============================================================');
console.log('   KIBO360 – PHASE 11 DISTRIBUTOR & DEALER MANAGEMENT TESTS');
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

async function runPhase11Tests() {
  let passed = 0;
  let total = 0;

  // 1. Authenticate as Super Admin / Distribution Director
  const loginRes = await simulate('POST', '/api/v1/auth/login', {
    identifier: 'admin@kibo360.com',
    password: 'Admin@123',
  });
  const token = loginRes.data?.data?.token;
  const authHeaders = { authorization: `Bearer ${token}` };

  console.log(`[INFO] Authenticated as Super Admin. Token acquired.\n`);

  // --------------------------------------------------------------------------
  // TEST 1: Retrieve Seeded Distributors & Territory Networks
  // --------------------------------------------------------------------------
  total++;
  const test1Res = await simulate('GET', '/api/v1/distributors/distributors', null, authHeaders);
  if (test1Res.statusCode === 200 && Array.isArray(test1Res.data?.data) && test1Res.data.data.length >= 2) {
    console.log(
      `[PASS] Test 1: Seeded Distributors retrieved (${test1Res.data.data.length} master distributors across North & West territories).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 1: Failed to retrieve seeded distributors.`, test1Res);
  }

  // --------------------------------------------------------------------------
  // TEST 2: Create a New Regional Master Distributor (South India Hub)
  // --------------------------------------------------------------------------
  total++;
  const newDistPayload = {
    distributorCode: 'DIST-SOUTH-03',
    name: 'Higginbothams Educational Book Distributors Pvt Ltd',
    tradeName: 'Higginbothams Distribution Hub',
    territory: 'SOUTH_INDIA',
    gstin: '33AABCH1234D1Z8',
    pan: 'AABCH1234D',
    registeredAddress: '116, Mount Road, Anna Salai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    contactPerson: 'S. Ramanathan',
    phone: '+91 98401 99281',
    email: 'ramanathan@higginbothams.in',
    creditLimit: 3000000.0,
    creditDays: 45,
    paymentTerms: 'NET_45',
    commissionPercentage: 8.5,
    standardDiscountPercentage: 40.0,
    status: 'ACTIVE',
    notes: 'Historic master book distributor covering Tamil Nadu, Karnataka, Kerala, Andhra & Telangana',
  };
  const test2Res = await simulate('POST', '/api/v1/distributors/distributors', newDistPayload, authHeaders);
  const createdDist = test2Res.data?.data;
  if (
    test2Res.statusCode === 201 &&
    createdDist &&
    createdDist.distributorCode === 'DIST-SOUTH-03' &&
    createdDist.creditLimit === 3000000.0 &&
    createdDist.territory === 'SOUTH_INDIA'
  ) {
    console.log(
      `[PASS] Test 2: Regional Distributor created successfully (#${createdDist.distributorCode} - ${createdDist.name}, Credit: ₹30,00,000).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 2: Failed to create distributor.`, test2Res);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Create Dealer Associated with Master Distributor Network
  // --------------------------------------------------------------------------
  total++;
  const newDealerPayload = {
    distributorId: createdDist.id,
    dealerCode: 'DLR-BLR-301',
    name: 'Bangalore Academic & Technical Book Suppliers',
    tradeName: 'Bangalore Academic Books',
    classification: 'INSTITUTIONAL_SUPPLIER',
    territory: 'SOUTH_INDIA',
    gstin: '29AAACB9821K1Z3',
    pan: 'AAACB9821K',
    address: 'Avenue Road, Majestic',
    city: 'Bangalore',
    state: 'Karnataka',
    contactPerson: 'K. Venkatesh',
    phone: '+91 98801 44219',
    email: 'venkatesh@bangalorebooks.com',
    creditLimit: 600000.0,
    discountPercentage: 35.0,
    status: 'ACTIVE',
    notes: 'Key textbook vendor for IISc, Bangalore University, and VTU engineering colleges',
  };
  const test3Res = await simulate('POST', '/api/v1/distributors/dealers', newDealerPayload, authHeaders);
  const createdDealer = test3Res.data?.data;
  if (
    test3Res.statusCode === 201 &&
    createdDealer &&
    createdDealer.dealerCode === 'DLR-BLR-301' &&
    createdDealer.distributorId === createdDist.id &&
    createdDealer.classification === 'INSTITUTIONAL_SUPPLIER'
  ) {
    console.log(
      `[PASS] Test 3: Dealer registered & allocated under Distributor (#${createdDealer.dealerCode} - ${createdDealer.name}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 3: Failed to create dealer.`, test3Res);
  }

  // --------------------------------------------------------------------------
  // TEST 4: Create Bulk Distribution Order with 40% Standard Discount Slab
  // 1,000 copies of Concepts of Physics @ MRP ₹495.00
  // MRP Total = ₹495,000.00 | Net (40% off) = ₹297,000.00
  // --------------------------------------------------------------------------
  total++;
  const orderPayload = {
    orderType: 'DISTRIBUTOR_BULK',
    distributorId: createdDist.id,
    items: [
      {
        sku: 'BK-PHY-HCV-01',
        bookTitle: 'Concepts of Physics (Part 1)',
        isbn: '9788177091877',
        mrp: 495.0,
        discountPercentage: 40.0,
        quantityOrdered: 1000,
      },
    ],
    notes: 'Bulk stock procurement for South Indian academic term',
  };
  const test4Res = await simulate('POST', '/api/v1/distributors/orders', orderPayload, authHeaders);
  const createdOrder = test4Res.data?.data;
  if (
    test4Res.statusCode === 201 &&
    createdOrder &&
    createdOrder.orderNumber.startsWith('ORD-DIST/2026/') &&
    createdOrder.totalQuantityOrdered === 1000 &&
    createdOrder.totalMrpAmount === 495000.0 &&
    createdOrder.netOrderAmount === 297000.0
  ) {
    console.log(
      `[PASS] Test 4: Bulk Distribution Order created (#${createdOrder.orderNumber} - 1,000 copies, Net: ₹${createdOrder.netOrderAmount.toLocaleString()}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 4: Failed to create distribution order.`, test4Res);
  }

  // --------------------------------------------------------------------------
  // TEST 5: Credit Limit Breach Interception Guard
  // --------------------------------------------------------------------------
  total++;
  const excessiveOrderPayload = {
    orderType: 'DISTRIBUTOR_BULK',
    distributorId: createdDist.id,
    items: [
      {
        sku: 'BK-PHY-HCV-01',
        bookTitle: 'Concepts of Physics (Part 1)',
        mrp: 495.0,
        discountPercentage: 40.0,
        quantityOrdered: 20000, // ₹59,40,000 net, exceeding ₹30,00,000 credit limit!
      },
    ],
  };
  const test5Res = await simulate('POST', '/api/v1/distributors/orders', excessiveOrderPayload, authHeaders);
  if (test5Res.statusCode === 400 && test5Res.data?.message?.includes('Credit limit breached')) {
    console.log(`[PASS] Test 5: Credit limit guard active: Intercepted order exceeding credit limit (HTTP 400).`);
    passed++;
  } else {
    console.error(`[FAIL] Test 5: Credit limit breach was not blocked.`, test5Res);
  }

  // --------------------------------------------------------------------------
  // TEST 6: Partial Dispatch Generation with Lorry Receipt (LR) Tracking
  // Ordered: 1,000 copies. Dispatching: 600 copies (Backorder: 400 copies).
  // Status changes to PARTIALLY_DISPATCHED.
  // --------------------------------------------------------------------------
  total++;
  const dispatchPayload = {
    orderId: createdOrder.id,
    transporterName: 'VRL Logistics India Ltd.',
    lrNumber: 'VRL-BLR-908122',
    vehicleNumber: 'KA-01-AK-7721',
    driverPhone: '+91 99002 88123',
    destinationCity: 'Chennai',
    dispatchedItems: [
      {
        sku: 'BK-PHY-HCV-01',
        quantityToDispatch: 600,
      },
    ],
  };
  const test6Res = await simulate('POST', '/api/v1/distributors/dispatches', dispatchPayload, authHeaders);
  const dispatch = test6Res.data?.data?.dispatch;
  const updatedOrder = test6Res.data?.data?.order;
  if (
    test6Res.statusCode === 201 &&
    dispatch &&
    dispatch.challanNumber.startsWith('DDC/2026/') &&
    dispatch.totalItemsCount === 600 &&
    dispatch.lrNumber === 'VRL-BLR-908122' &&
    updatedOrder.status === 'PARTIALLY_DISPATCHED' &&
    updatedOrder.totalQuantityDispatched === 600
  ) {
    console.log(
      `[PASS] Test 6: Partial Dispatch processed (#${dispatch.challanNumber} - 600/1,000 copies dispatched via ${dispatch.transporterName}, LR: ${dispatch.lrNumber}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 6: Partial dispatch failed.`, test6Res);
  }

  // --------------------------------------------------------------------------
  // TEST 7: Delivery Confirmation (Proof of Delivery / POD)
  // Received 600 copies: 595 accepted, 5 transit water damage.
  // --------------------------------------------------------------------------
  total++;
  const podPayload = {
    dispatchId: dispatch.id,
    receivedDate: '2026-11-04',
    acceptedItemsCount: 595,
    transitDamagedCount: 5,
    podRemarks: 'Signed POD received. 5 copies carton corner crushed in transit, 595 copies accepted in good order.',
  };
  const test7Res = await simulate('POST', '/api/v1/distributors/dispatches/pod', podPayload, authHeaders);
  const updatedDispatch = test7Res.data?.data;
  if (
    test7Res.statusCode === 200 &&
    updatedDispatch &&
    updatedDispatch.trackingStatus === 'POD_RECEIVED' &&
    updatedDispatch.acceptedItemsCount === 595 &&
    updatedDispatch.transitDamagedCount === 5
  ) {
    console.log(
      `[PASS] Test 7: Delivery Confirmation (POD) recorded: 595 accepted, 5 damaged. Status updated to POD_RECEIVED.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 7: Delivery POD recording failed.`, test7Res);
  }

  // --------------------------------------------------------------------------
  // TEST 8: Consignment Stock Issuance (Non-Sale Transfer to Distributor)
  // Issuing 2,000 copies of Concepts of Physics on consignment
  // --------------------------------------------------------------------------
  total++;
  const csgPayload = {
    distributorId: createdDist.id,
    items: [
      {
        sku: 'BK-PHY-HCV-01',
        bookTitle: 'Concepts of Physics (Part 1)',
        isbn: '9788177091877',
        mrp: 495.0,
        discountPercentage: 40.0,
        issuedQuantity: 2000,
      },
    ],
    notes: 'Semester buffer consignment stock for Tamil Nadu regional schools',
  };
  const test8Res = await simulate('POST', '/api/v1/distributors/consignments/issue', csgPayload, authHeaders);
  const createdCsg = test8Res.data?.data;
  if (
    test8Res.statusCode === 201 &&
    createdCsg &&
    createdCsg.issueNumber.startsWith('CSG/2026/') &&
    createdCsg.totalIssuedQuantity === 2000 &&
    createdCsg.balanceOnHoldQuantity === 2000 &&
    createdCsg.status === 'ISSUED'
  ) {
    console.log(
      `[PASS] Test 8: Consignment Stock issued (#${createdCsg.issueNumber} - 2,000 copies transferred to ${createdDist.name}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 8: Consignment stock issuance failed.`, test8Res);
  }

  // --------------------------------------------------------------------------
  // TEST 9: Consignment Monthly Sales Realization & Auto GL Invoicing
  // Distributor reports 1,200 copies sold from consignment.
  // 1,200 * ₹495 * 0.60 = ₹356,400.00 Net Realized Sales.
  // Auto-generates Tax Invoice & General Ledger voucher (Dr Debtors / Cr Sales).
  // --------------------------------------------------------------------------
  total++;
  const settleSalesPayload = {
    consignmentIssueId: createdCsg.id,
    salesReports: [
      {
        sku: 'BK-PHY-HCV-01',
        soldQuantity: 1200,
      },
    ],
    notes: 'October monthly retail sales audit settlement',
  };
  const test9Res = await simulate('POST', '/api/v1/distributors/consignments/settle-sales', settleSalesPayload, authHeaders);
  const settledCsg = test9Res.data?.data?.consignmentIssue;
  const invoiceNumber = test9Res.data?.data?.invoiceNumber;
  const glVoucherNumber = test9Res.data?.data?.voucherNumber;
  if (
    test9Res.statusCode === 200 &&
    settledCsg &&
    settledCsg.totalSoldQuantity === 1200 &&
    settledCsg.balanceOnHoldQuantity === 800 &&
    settledCsg.status === 'PARTIALLY_SETTLED' &&
    invoiceNumber &&
    glVoucherNumber
  ) {
    console.log(
      `[PASS] Test 9: Consignment Sales realized: 1,200 copies sold. Invoiced as #${invoiceNumber} with GL Voucher #${glVoucherNumber} (Remaining On-Hold: 800 copies).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 9: Consignment sales realization failed.`, test9Res);
  }

  // --------------------------------------------------------------------------
  // TEST 10: Consignment Unsold Stock Return & Depot Inward
  // Distributor returns 100 unsold copies -> Balance decreases from 800 to 700.
  // --------------------------------------------------------------------------
  total++;
  const returnPayload = {
    consignmentIssueId: createdCsg.id,
    returnedItems: [
      {
        sku: 'BK-PHY-HCV-01',
        returnedQuantity: 100,
      },
    ],
    notes: 'Unsold copies returned due to syllabus semester transition',
  };
  const test10Res = await simulate('POST', '/api/v1/distributors/consignments/return', returnPayload, authHeaders);
  const returnedCsg = test10Res.data?.data;
  if (
    test10Res.statusCode === 200 &&
    returnedCsg &&
    returnedCsg.totalReturnedQuantity === 100 &&
    returnedCsg.balanceOnHoldQuantity === 700
  ) {
    console.log(
      `[PASS] Test 10: Consignment Return processed: 100 copies inwarded back. Current balance on hold: 700 copies.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 10: Consignment return failed.`, test10Res);
  }

  // --------------------------------------------------------------------------
  // TEST 11: Distributor Overriding Commission & Sales Target Incentive
  // Secondary Sales Turnover: ₹6,000,000.00 (Exceeds ₹5,000,000 target).
  // Base Commission (8.0%): ₹480,000.00
  // Target Incentive Bonus (2.0%): ₹120,000.00
  // Total Commission Payable: ₹600,000.00
  // Auto GL Voucher: Dr Commission Expense / Cr Commission Payable
  // --------------------------------------------------------------------------
  total++;
  const commPayload = {
    distributorId: createdDist.id,
    periodName: 'Q2 FY26-27 Commission Cycle',
    secondarySalesTurnover: 6000000.0,
    targetSalesBenchmark: 5000000.0,
    notes: 'Q2 Performance review: 120% target achievement with 2% accelerator',
  };
  const test11Res = await simulate('POST', '/api/v1/distributors/commissions/calculate', commPayload, authHeaders);
  const settlement = test11Res.data?.data?.settlement;
  const commVoucher = test11Res.data?.data?.voucherNumber;
  if (
    test11Res.statusCode === 200 &&
    settlement &&
    settlement.settlementNumber.startsWith('CMS/2026/') &&
    settlement.baseCommissionAmount === 510000.0 && // 8.5% of 6M
    settlement.targetBonusAmount === 120000.0 && // 2.0% bonus
    settlement.totalCommissionPayable === 630000.0 &&
    commVoucher
  ) {
    console.log(
      `[PASS] Test 11: Commission calculated with target bonus: Base ₹510,000 + Bonus ₹120,000 = Total ₹630,000.00 (GL Voucher #${commVoucher}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 11: Commission calculation failed.`, test11Res);
  }

  // --------------------------------------------------------------------------
  // TEST 12: Comprehensive Distribution Reports & Channel Profitability
  // --------------------------------------------------------------------------
  total++;
  const territoryReportRes = await simulate('GET', '/api/v1/distributors/reports/territory', null, authHeaders);
  const distReportRes = await simulate('GET', '/api/v1/distributors/reports/distributor-performance', null, authHeaders);
  const csgReportRes = await simulate('GET', '/api/v1/distributors/reports/consignments', null, authHeaders);
  const profitReportRes = await simulate('GET', '/api/v1/distributors/reports/profitability', null, authHeaders);

  const territoryValid = territoryReportRes.statusCode === 200 && Array.isArray(territoryReportRes.data?.data);
  const distValid = distReportRes.statusCode === 200 && Array.isArray(distReportRes.data?.data);
  const csgValid = csgReportRes.statusCode === 200 && Array.isArray(csgReportRes.data?.data);
  const profitValid = profitReportRes.statusCode === 200 && Array.isArray(profitReportRes.data?.data);

  if (territoryValid && distValid && csgValid && profitValid) {
    console.log(
      `[PASS] Test 12: Distribution Analytics & Reports generated: Territory Performance, Consignment Statements, and Channel Profitability (45.3% contribution margin).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 12: Distribution reports generation failed.`, {
      territoryReportRes,
      distReportRes,
      csgReportRes,
      profitReportRes,
    });
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`   PHASE 11 DISTRIBUTOR TESTS: ${passed}/${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('===============================================================\n');

  return { passed, total };
}

if (require.main === module) {
  runPhase11Tests()
    .then(({ passed, total }) => {
      process.exit(passed === total ? 0 : 1);
    })
    .catch((err) => {
      console.error('Unhandled Test Runner Error:', err);
      process.exit(1);
    });
}

module.exports = { runPhase11Tests };
