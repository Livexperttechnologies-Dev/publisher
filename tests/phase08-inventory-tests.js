const app = require('../backend/dist/app').default;

console.log('===============================================================');
console.log('   KIBO360 – PHASE 08 INVENTORY & WAREHOUSE MANAGEMENT TESTS');
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

async function runPhase08Tests() {
  let passed = 0;
  let total = 0;

  // 1. Authenticate as Super Admin / Inventory Director
  const loginRes = await simulate('POST', '/api/v1/auth/login', {
    identifier: 'admin@kibo360.com',
    password: 'Admin@123',
  });
  const token = loginRes.data?.data?.token;

  if (!token) {
    console.error('Failed to obtain token for Phase 08 tests');
    process.exit(1);
  }

  const authHeader = { authorization: `Bearer ${token}` };

  // --------------------------------------------------------------------------
  // TEST 1: MULTI-WAREHOUSE & RACK LOCATION CREATION
  // --------------------------------------------------------------------------
  total++;
  const warehousePayload = {
    code: 'WH-SOUTH-BLR',
    name: 'Southern Regional Distribution Hub (Bangalore)',
    type: 'BRANCH_GODOWN',
    address: 'Plot 88, Peenya Industrial Area Phase-II',
    city: 'Bangalore',
    state: 'Karnataka',
    stateCode: '29',
    pincode: '560058',
    contactPerson: 'K. Venkatesh (Southern Depot Lead)',
    contactPhone: '+91 98450 11223',
    capacitySqFt: 20000,
    isActive: true,
  };

  const createWhRes = await simulate('POST', '/api/v1/inventory/warehouses', warehousePayload, authHeader);
  const whData = createWhRes.data?.data;

  // Create a rack inside the new warehouse
  let rackData = null;
  if (createWhRes.statusCode === 201 && whData?.id) {
    const rackRes = await simulate('POST', '/api/v1/inventory/racks', {
      warehouseId: whData.id,
      rackCode: 'RACK-S1-01',
      aisle: 'AISLE-S1',
      shelfLevel: 'SHELF-1',
      binNumber: 'BIN-01',
      capacityBooks: 2000,
      categoryAssigned: 'Regional Textbooks & Higher Education',
    }, authHeader);
    rackData = rackRes.data?.data;
  }

  if (createWhRes.statusCode === 201 && whData?.code === 'WH-SOUTH-BLR' && rackData?.rackCode === 'RACK-S1-01') {
    passed++;
    console.log(`[PASS] Test 1: Multi-Warehouse & Racks -> Created ${whData.name} (${whData.code}) with Rack: ${rackData.rackCode}`);
  } else {
    console.error('[FAIL] Test 1: Multi-Warehouse & Racks ->', { createWhRes, rackData });
  }

  // --------------------------------------------------------------------------
  // TEST 2: STOCK INWARD & WEIGHTED AVERAGE COST (WAC) RECOMPUTATION
  // --------------------------------------------------------------------------
  total++;
  const inwardPayload = {
    warehouseId: 'wh_central_press_depot',
    sku: 'BK-PHY-HCV-01',
    quantity: 1000,
    unitCost: 170.0, // Inward batch at higher cost (prev: 4950 @ 160.0)
    referenceType: 'GRN',
    referenceNumber: 'GRN/2026/0002',
    rackShelfCode: 'RACK-A1-01',
    notes: 'Receipt of new 1,000 print run from Okhla Press',
  };

  const inwardRes = await simulate('POST', '/api/v1/inventory/inward', inwardPayload, authHeader);
  const inwardStock = inwardRes.data?.data;

  // Expected WAC: ((4950 * 160) + (1000 * 170)) / 5950 = (792000 + 170000) / 5950 = 962000 / 5950 = ~161.68
  if (
    inwardRes.statusCode === 201 &&
    inwardStock?.quantityOnHand === 5950 &&
    inwardStock?.weightedAverageCost >= 161.0 &&
    inwardStock?.weightedAverageCost <= 162.0
  ) {
    passed++;
    console.log(`[PASS] Test 2: Stock Inward & WAC -> Inwarded 1,000 units. New Stock: ${inwardStock.quantityOnHand} | Recomputed WAC: ₹${inwardStock.weightedAverageCost} (Valuation: ₹${inwardStock.totalValuation.toLocaleString()})`);
  } else {
    console.error('[FAIL] Test 2: Stock Inward & WAC ->', inwardRes);
  }

  // --------------------------------------------------------------------------
  // TEST 3: STOCK RESERVATION & AVAILABLE STOCK CALCULATION
  // --------------------------------------------------------------------------
  total++;
  const reservePayload = {
    warehouseId: 'wh_central_press_depot',
    sku: 'BK-PHY-HCV-01',
    quantity: 200,
    salesOrderRef: 'SO/2026/0005',
    release: false,
  };

  const reserveRes = await simulate('POST', '/api/v1/inventory/reservation', reservePayload, authHeader);
  const reservedStock = reserveRes.data?.data;

  if (
    reserveRes.statusCode === 200 &&
    reservedStock?.quantityReserved === 250 && // 50 initial + 200 new
    reservedStock?.quantityAvailable === reservedStock.quantityOnHand - 250
  ) {
    passed++;
    console.log(`[PASS] Test 3: Stock Reservation -> Reserved 200 units for ${reservePayload.salesOrderRef}. Total Reserved: ${reservedStock.quantityReserved} | Available: ${reservedStock.quantityAvailable} units`);
  } else {
    console.error('[FAIL] Test 3: Stock Reservation ->', reserveRes);
  }

  // --------------------------------------------------------------------------
  // TEST 4: STRICT NEGATIVE STOCK DISPATCH PREVENTION BARRIER
  // --------------------------------------------------------------------------
  total++;
  const excessiveOutwardPayload = {
    warehouseId: 'wh_central_press_depot',
    sku: 'BK-PHY-HCV-01',
    quantity: 999999, // Way beyond physical on-hand stock
    referenceType: 'SALES_INVOICE',
    referenceNumber: 'SINV/2026/EXCESS',
  };

  const negativeStockRes = await simulate('POST', '/api/v1/inventory/outward', excessiveOutwardPayload, authHeader);

  if (
    negativeStockRes.statusCode === 400 &&
    negativeStockRes.data?.message?.includes('Negative stock is strictly disallowed')
  ) {
    passed++;
    console.log(`[PASS] Test 4: Negative Stock Prevention -> Successfully blocked dispatch of 999,999 units (HTTP 400: "${negativeStockRes.data.message}")`);
  } else {
    console.error('[FAIL] Test 4: Negative Stock Prevention ->', negativeStockRes);
  }

  // --------------------------------------------------------------------------
  // TEST 5: STOCK OUTWARD & FIFO LOT QUEUE DEPLETION
  // --------------------------------------------------------------------------
  total++;
  const outwardPayload = {
    warehouseId: 'wh_central_press_depot',
    sku: 'BK-PHY-HCV-01',
    quantity: 100,
    referenceType: 'SALES_INVOICE',
    referenceNumber: 'SINV/2026/0010',
    notes: 'Outward dispatch for order fulfillment',
  };

  const outwardRes = await simulate('POST', '/api/v1/inventory/outward', outwardPayload, authHeader);
  const outwardResult = outwardRes.data?.data;

  if (
    outwardRes.statusCode === 200 &&
    outwardResult?.stock?.quantityOnHand === 5850 &&
    outwardResult?.fifoCostOfGoodsSold > 0 &&
    outwardResult?.lotsConsumed?.length > 0
  ) {
    passed++;
    console.log(`[PASS] Test 5: FIFO Stock Outward -> Dispatched 100 units. Depleted Lot: ${outwardResult.lotsConsumed[0].lotNumber} @ ₹${outwardResult.lotsConsumed[0].unitCost} (COGS: ₹${outwardResult.fifoCostOfGoodsSold})`);
  } else {
    console.error('[FAIL] Test 5: FIFO Stock Outward ->', outwardRes);
  }

  // --------------------------------------------------------------------------
  // TEST 6: STOCK TRANSFER DISPATCH (WAREHOUSE-TO-WAREHOUSE IN-TRANSIT)
  // --------------------------------------------------------------------------
  total++;
  const transferPayload = {
    transferType: 'WAREHOUSE_TO_WAREHOUSE',
    fromWarehouseId: 'wh_central_press_depot',
    toWarehouseId: 'wh_bhiwandi_godown',
    transporterName: 'VRL Logistics India',
    vehicleNumber: 'MH-04-AZ-4521',
    lrNumber: 'VRL-INVENTORY-7711',
    notes: 'Replenishment transfer from Central to Western Hub',
    items: [
      {
        sku: 'BK-PHY-HCV-01',
        title: 'Concepts of Physics (Part 1)',
        dispatchedQuantity: 300,
        fromRackCode: 'RACK-A1-01',
        toRackCode: 'RACK-W1-01',
      },
    ],
  };

  const createTrfRes = await simulate('POST', '/api/v1/inventory/transfers', transferPayload, authHeader);
  const trfData = createTrfRes.data?.data;

  if (
    createTrfRes.statusCode === 201 &&
    trfData?.transferNumber?.startsWith('TRF/') &&
    trfData?.status === 'DISPATCHED_IN_TRANSIT' &&
    trfData?.items[0]?.dispatchedQuantity === 300
  ) {
    passed++;
    console.log(`[PASS] Test 6: Stock Transfer Dispatch -> Dispatched ${trfData.transferNumber} (300 units) from ${trfData.fromWarehouseName} to ${trfData.toWarehouseName} [Status: ${trfData.status}]`);
  } else {
    console.error('[FAIL] Test 6: Stock Transfer Dispatch ->', createTrfRes);
  }

  // --------------------------------------------------------------------------
  // TEST 7: STOCK TRANSFER RECEIPT WITH DAMAGE & DISCREPANCY TRACKING
  // --------------------------------------------------------------------------
  total++;
  const receivePayload = {
    transferId: trfData?.id,
    items: [
      {
        sku: 'BK-PHY-HCV-01',
        receivedQuantity: 290, // 290 good copies
        damagedQuantity: 5,   // 5 transit damaged
        toRackCode: 'RACK-W1-01',
        notes: '5 copies water-damaged during monsoon transit, 5 copies missing in carton',
      },
    ],
    notes: 'Received at Bhiwandi dock. 5 missing copies flagged on LR.',
  };

  const receiveRes = await simulate('POST', '/api/v1/inventory/transfers/receive', receivePayload, authHeader);
  const receivedTrf = receiveRes.data?.data;
  const receivedItem = receivedTrf?.items?.find((i) => i.sku === 'BK-PHY-HCV-01');

  if (
    receiveRes.statusCode === 200 &&
    receivedItem?.receivedQuantity === 290 &&
    receivedItem?.damagedQuantity === 5 &&
    receivedItem?.discrepancyQuantity === 5 // 300 - (290 + 5) = 5
  ) {
    passed++;
    console.log(`[PASS] Test 7: Transfer Receipt & Discrepancies -> Inwarded: 290 good | Damaged: 5 to Quarantine | Discrepancy: ${receivedItem.discrepancyQuantity} missing units (Status: ${receivedTrf.status})`);
  } else {
    console.error('[FAIL] Test 7: Transfer Receipt & Discrepancies ->', receiveRes);
  }

  // --------------------------------------------------------------------------
  // TEST 8: PHYSICAL STOCK AUDIT & CYCLE COUNT SESSION
  // --------------------------------------------------------------------------
  total++;
  const auditPayload = {
    warehouseId: 'wh_central_press_depot',
    scheduledBy: 'Internal Audit Committee (K. Sharma)',
    notes: 'Q3 Physical Inventory Cycle Count Verification',
    items: [
      {
        sku: 'BK-PHY-HCV-01',
        countedQuantity: 5550, // Physical count matches on-hand
        rackShelfCode: 'RACK-A1-01',
      },
      {
        sku: 'BK-MATH-12-ENG-PB',
        countedQuantity: 1495, // 5 missing copies shrinkage
        rackShelfCode: 'RACK-B2-01',
      },
    ],
  };

  const auditRes = await simulate('POST', '/api/v1/inventory/audits', auditPayload, authHeader);
  const auditData = auditRes.data?.data;

  if (
    auditRes.statusCode === 201 &&
    auditData?.auditSessionNumber?.startsWith('AUD/') &&
    auditData?.matchedCount === 1 &&
    auditData?.varianceCount === 1
  ) {
    passed++;
    console.log(`[PASS] Test 8: Physical Stock Audit -> Session ${auditData.auditSessionNumber}: Audited 2 items. Matched: ${auditData.matchedCount} | Variance: ${auditData.varianceCount} (Net Variance Value: ₹${auditData.netVarianceValue})`);
  } else {
    console.error('[FAIL] Test 8: Physical Stock Audit ->', auditRes);
  }

  // --------------------------------------------------------------------------
  // TEST 9: STOCK ADJUSTMENT, DAMAGE WRITE-OFF & AUTO GL POSTING
  // --------------------------------------------------------------------------
  total++;
  const adjustmentPayload = {
    warehouseId: 'wh_central_press_depot',
    adjustmentType: 'DAMAGE_WRITEOFF',
    reason: 'Write-off of 5 water-damaged math book copies flagged in cycle count',
    items: [
      {
        sku: 'BK-MATH-12-ENG-PB',
        title: 'Mathematics for Class XII (Vol 1 & 2 Complete Set)',
        physicalQuantity: 1495, // System was 1500, write down to 1495
        unitCost: 210.0,
        rackShelfCode: 'RACK-B2-01',
        notes: 'Water damaged by depot roof leakage',
      },
    ],
  };

  const adjustRes = await simulate('POST', '/api/v1/inventory/adjustments', adjustmentPayload, authHeader);
  const adjustData = adjustRes.data?.data;

  if (
    adjustRes.statusCode === 201 &&
    adjustData?.adjustmentNumber?.startsWith('ADJ/') &&
    adjustData?.totalVarianceQuantity === -5 &&
    adjustData?.voucherNumber?.startsWith('JV/')
  ) {
    passed++;
    console.log(`[PASS] Test 9: Stock Adjustment & Auto GL -> Created ${adjustData.adjustmentNumber} (Variance: ${adjustData.totalVarianceQuantity} units, ₹${adjustData.totalVarianceValue}) | Posted GL Voucher: ${adjustData.voucherNumber}`);
  } else {
    console.error('[FAIL] Test 9: Stock Adjustment & Auto GL ->', adjustRes);
  }

  // --------------------------------------------------------------------------
  // TEST 10: BARCODE & SHELF LABEL GENERATOR (SVG / PRINTABLE SPEC)
  // --------------------------------------------------------------------------
  total++;
  const labelPayload = {
    sku: 'BK-PHY-HCV-01',
    warehouseId: 'wh_central_press_depot',
    quantity: 2,
    labelType: 'PRODUCT_LABEL',
    barcodeFormat: 'CODE128',
  };

  const labelRes = await simulate('POST', '/api/v1/inventory/barcode/labels', labelPayload, authHeader);
  const labelsList = labelRes.data?.data;

  if (
    labelRes.statusCode === 200 &&
    Array.isArray(labelsList) &&
    labelsList.length === 2 &&
    labelsList[0]?.svgHtml?.includes('KIBO360 PUBLISHING') &&
    labelsList[0]?.barcodeData === 'BK-PHY-HCV-01'
  ) {
    passed++;
    console.log(`[PASS] Test 10: Barcode & Label Generation -> Generated 2 printable SVG labels for ${labelsList[0].title} (Barcode: ${labelsList[0].barcodeData} | Format: ${labelsList[0].barcodeFormat})`);
  } else {
    console.error('[FAIL] Test 10: Barcode & Label Generation ->', labelRes);
  }

  // --------------------------------------------------------------------------
  // TEST 11: INVENTORY VALUATION COMPARISON (FIFO VS WEIGHTED AVERAGE COST)
  // --------------------------------------------------------------------------
  total++;
  const valRes = await simulate('GET', '/api/v1/inventory/reports/valuation', null, authHeader);
  const valData = valRes.data?.data;

  if (
    valRes.statusCode === 200 &&
    valData?.totalValuationWac > 0 &&
    valData?.totalValuationFifo > 0 &&
    Array.isArray(valData?.items) &&
    valData.items.length >= 2
  ) {
    passed++;
    console.log(`[PASS] Test 11: Inventory Valuation Comparison -> WAC Valuation: ₹${valData.totalValuationWac.toLocaleString()} | FIFO Valuation: ₹${valData.totalValuationFifo.toLocaleString()} (Delta: ₹${valData.varianceValue.toLocaleString()})`);
  } else {
    console.error('[FAIL] Test 11: Inventory Valuation Comparison ->', valRes);
  }

  // --------------------------------------------------------------------------
  // TEST 12: INVENTORY REPORTS (STOCK SUMMARY, BIN CARD, AGEING & REORDER)
  // --------------------------------------------------------------------------
  total++;
  const summaryRes = await simulate('GET', '/api/v1/inventory/reports/summary', null, authHeader);
  const summaryList = summaryRes.data?.data || [];

  const ledgerRes = await simulate('GET', '/api/v1/inventory/reports/ledger/BK-PHY-HCV-01', null, authHeader);
  const ledgerEntries = ledgerRes.data?.data || [];

  const ageingRes = await simulate('GET', '/api/v1/inventory/reports/ageing', null, authHeader);
  const ageingList = ageingRes.data?.data || [];

  const reorderRes = await simulate('GET', '/api/v1/inventory/reports/reorder', null, authHeader);
  const reorderData = reorderRes.data?.data;

  if (
    summaryRes.statusCode === 200 &&
    ledgerRes.statusCode === 200 &&
    ageingRes.statusCode === 200 &&
    reorderRes.statusCode === 200 &&
    summaryList.length >= 2 &&
    ledgerEntries.length >= 2 &&
    ageingList.length >= 2
  ) {
    passed++;
    console.log(`[PASS] Test 12: Comprehensive Inventory Reports -> Summary: ${summaryList.length} items | Bin Card: ${ledgerEntries.length} movements | Ageing: ${ageingList.length} items | Reorder Alerts: ${reorderData?.reorderCount || 0} items`);
  } else {
    console.error('[FAIL] Test 12: Comprehensive Inventory Reports ->', { summaryRes, ledgerRes, ageingRes, reorderRes });
  }

  // --------------------------------------------------------------------------
  // FINAL SUMMARY
  // --------------------------------------------------------------------------
  console.log('===============================================================');
  console.log(`   PHASE 08 INVENTORY & WAREHOUSE: ${passed} / ${total} TESTS PASSED`);
  console.log('===============================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPhase08Tests().catch((err) => {
  console.error('Unhandled test failure:', err);
  process.exit(1);
});
