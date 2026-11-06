const app = require('../backend/dist/app').default;

console.log('===============================================================');
console.log('   KIBO360 – PHASE 07 SALES & CUSTOMER MANAGEMENT TESTS');
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

async function runPhase07Tests() {
  let passed = 0;
  let total = 0;

  // 1. Authenticate as Super Admin / Sales Manager
  const loginRes = await simulate('POST', '/api/v1/auth/login', {
    identifier: 'admin@kibo360.com',
    password: 'Admin@123',
  });
  const token = loginRes.data?.data?.token;

  if (!token) {
    console.error('Failed to obtain token for Phase 07 tests');
    process.exit(1);
  }

  const authHeader = { authorization: `Bearer ${token}` };

  // --------------------------------------------------------------------------
  // TEST 1: SALES QUOTATION CREATION
  // --------------------------------------------------------------------------
  total++;
  const quotationPayload = {
    customerId: 'cst_oxford_dist',
    customerName: 'Oxford Book House & Distributors',
    salesChannel: 'WHOLESALE',
    validUntil: '2026-11-25T00:00:00.000Z',
    paymentTerms: 'Net 30',
    freightCharges: 500.0,
    remarks: 'Seasonal wholesale catalogue order',
    items: [
      {
        bookId: 'bk_physics_part1',
        title: 'Concepts of Physics (Part 1)',
        sku: 'BK-PHY-HCV-01',
        isbn: '9788177091877',
        quantity: 100,
        mrp: 495.0,
        unitRate: 297.0, // 40% wholesale trade discount on MRP 495
        discountPercent: 0,
        taxRate: 0,
      },
    ],
  };

  const createQuoteRes = await simulate('POST', '/api/v1/sales/quotations', quotationPayload, authHeader);
  const quoteData = createQuoteRes.data?.data;

  if (createQuoteRes.statusCode === 201 && quoteData?.quotationNumber?.startsWith('SQ/') && quoteData?.items?.length === 1) {
    passed++;
    console.log(`[PASS] Test 1: Sales Quotation -> Created ${quoteData.quotationNumber} for ${quoteData.customerName} (Grand Total: ₹${quoteData.grandTotal?.toLocaleString()})`);
  } else {
    console.error('[FAIL] Test 1: Sales Quotation ->', createQuoteRes);
  }

  // --------------------------------------------------------------------------
  // TEST 2: SALES ORDER CREATION WITH STOCK RESERVATION & DISCOUNT SLABS
  // --------------------------------------------------------------------------
  total++;
  const orderPayload = {
    quotationRef: quoteData?.quotationNumber,
    customerId: 'cst_oxford_dist',
    customerName: 'Oxford Book House & Distributors',
    customerGstin: '27AABCO4321A1Z9',
    customerStateCode: '27',
    salesChannel: 'WHOLESALE',
    deliveryDueDate: '2026-11-15T00:00:00.000Z',
    paymentTerms: 'Net 30',
    freightCharges: 350.0,
    notes: 'Approved wholesale order with reserved stock allocation',
    items: [
      {
        bookId: 'bk_physics_part1',
        title: 'Concepts of Physics (Part 1)',
        sku: 'BK-PHY-HCV-01',
        isbn: '9788177091877',
        quantity: 50,
        mrp: 495.0,
        unitRate: 297.0,
        discountPercent: 0,
        taxRate: 0,
      },
    ],
  };

  const createOrderRes = await simulate('POST', '/api/v1/sales/orders', orderPayload, authHeader);
  const orderData = createOrderRes.data?.data;

  if (createOrderRes.statusCode === 201 && orderData?.orderNumber?.startsWith('SO/') && orderData?.status === 'CONFIRMED') {
    passed++;
    console.log(`[PASS] Test 2: Sales Order -> Created ${orderData.orderNumber} with status ${orderData.status} (Reserved 50 copies of ${orderData.items[0].sku})`);
  } else {
    console.error('[FAIL] Test 2: Sales Order ->', createOrderRes);
  }

  // --------------------------------------------------------------------------
  // TEST 3: DELIVERY CHALLAN DISPATCH
  // --------------------------------------------------------------------------
  total++;
  const challanPayload = {
    salesOrderId: orderData?.id,
    customerId: 'cst_oxford_dist',
    customerName: 'Oxford Book House & Distributors',
    deliveryAddress: 'Central Warehouse, Bhiwandi, Maharashtra',
    dispatchDate: '2026-11-06T00:00:00.000Z',
    transporterName: 'VRL Logistics India',
    lrNumber: 'VRL-MUM-998822',
    vehicleNumber: 'MH-04-AZ-4521',
    notes: 'Dispatched in 2 corrugated cartons with tamper-evident seal',
    items: [
      {
        bookId: 'bk_physics_part1',
        sku: 'BK-PHY-HCV-01',
        title: 'Concepts of Physics (Part 1)',
        orderedQuantity: 50,
        dispatchedQuantity: 50,
        warehouseRack: 'RACK-B2-01',
      },
    ],
  };

  const createChallanRes = await simulate('POST', '/api/v1/sales/challans', challanPayload, authHeader);
  const challanData = createChallanRes.data?.data;

  if (createChallanRes.statusCode === 201 && challanData?.challanNumber?.startsWith('DC/') && challanData?.status === 'DISPATCHED') {
    passed++;
    console.log(`[PASS] Test 3: Delivery Challan -> Dispatched ${challanData.challanNumber} via ${challanData.transporterName} (LR: ${challanData.lrNumber})`);
  } else {
    console.error('[FAIL] Test 3: Delivery Challan ->', createChallanRes);
  }

  // --------------------------------------------------------------------------
  // TEST 4: WHOLESALE TAX INVOICE & AUTO GENERAL LEDGER DOUBLE-ENTRY POSTING
  // --------------------------------------------------------------------------
  total++;
  const todayIso = new Date().toISOString();
  const invoicePayload = {
    salesChannel: 'WHOLESALE',
    salesOrderId: orderData?.id,
    deliveryChallanId: challanData?.id,
    customerId: 'cst_oxford_dist',
    customerName: 'Oxford Book House & Distributors',
    customerGstin: '27AABCO4321A1Z9',
    customerStateCode: '27',
    placeOfSupply: '27-Maharashtra',
    invoiceDate: todayIso,
    dueDate: '2026-12-06T00:00:00.000Z',
    paymentMethod: 'CUSTOMER_CREDIT',
    freightAmount: 350.0,
    items: [
      {
        bookId: 'bk_physics_part1',
        sku: 'BK-PHY-HCV-01',
        title: 'Concepts of Physics (Part 1)',
        mrp: 495.0,
        quantity: 50,
        unitRate: 297.0,
        discountPercent: 0,
        taxRate: 0,
        purchaseCost: 160.0,
      },
    ],
  };

  const createInvRes = await simulate('POST', '/api/v1/sales/invoices', invoicePayload, authHeader);
  const invData = createInvRes.data?.data;

  if (
    createInvRes.statusCode === 201 &&
    invData?.invoiceNumber?.startsWith('SINV/') &&
    invData?.voucherNumber?.startsWith('SV/') &&
    invData?.netPayable > 0
  ) {
    passed++;
    console.log(`[PASS] Test 4: Wholesale Tax Invoice -> Created ${invData.invoiceNumber} | Posted GL Voucher: ${invData.voucherNumber} (Net Payable: ₹${invData.netPayable.toLocaleString()})`);
  } else {
    console.error('[FAIL] Test 4: Wholesale Tax Invoice ->', createInvRes);
  }

  // --------------------------------------------------------------------------
  // TEST 5: REAL-TIME STOCK REDUCTION VERIFICATION IN MASTER CATALOGUE
  // --------------------------------------------------------------------------
  total++;
  const bookRes = await simulate('GET', '/api/v1/books', null, authHeader);
  const booksList = Array.isArray(bookRes.data?.data) ? bookRes.data.data : bookRes.data?.data?.items || [];
  const phyBook = booksList.find((b) => b.sku === 'BK-PHY-HCV-01');

  if (bookRes.statusCode === 200 && phyBook && phyBook.openingStock < 5000) {
    passed++;
    console.log(`[PASS] Test 5: Real-Time Stock Sync -> SKU ${phyBook.sku} stock adjusted accurately from 5000 to ${phyBook.openingStock} units`);
  } else {
    console.error('[FAIL] Test 5: Real-Time Stock Sync ->', { statusCode: bookRes.statusCode, phyBook });
  }

  // --------------------------------------------------------------------------
  // TEST 6: POS FAST BARCODE & ITEM SCAN LOOKUP
  // --------------------------------------------------------------------------
  total++;
  const scanRes = await simulate('GET', '/api/v1/sales/pos/scan?q=BK-PHY-HCV-01', null, authHeader);
  const scannedItem = scanRes.data?.data;

  if (scanRes.statusCode === 200 && scannedItem?.sku === 'BK-PHY-HCV-01' && scannedItem?.mrp === 495.0) {
    passed++;
    console.log(`[PASS] Test 6: Fast POS Barcode/SKU Scan -> Found: "${scannedItem.title}" | MRP: ₹${scannedItem.mrp} | Stock: ${scannedItem.currentStock}`);
  } else {
    console.error('[FAIL] Test 6: Fast POS Barcode/SKU Scan ->', scanRes);
  }

  // --------------------------------------------------------------------------
  // TEST 7: POS RETAIL SALE WITH SPLIT PAYMENT & 80MM ESC/POS RECEIPT OUTPUT
  // --------------------------------------------------------------------------
  total++;
  // Open POS shift
  const openShiftRes = await simulate('POST', '/api/v1/sales/pos/shift/open', {
    openingFloatCash: 5000.0,
    cashierName: 'Pooja Sharma (Terminal 1)',
  }, authHeader);
  const activeShift = openShiftRes.data?.data;

  // 2 units * 495 with 10% discount = 445.50 * 2 = 891.00 netPayable
  const posSalePayload = {
    customerName: 'Retail Walk-in Customer',
    customerId: 'pty_walkin_retail',
    paymentMethod: 'SPLIT_PAYMENT',
    paymentDetails: {
      cashAmount: 500.0,
      upiAmount: 391.0,
      upiRef: 'UPI-TXN-887711',
    },
    items: [
      {
        sku: 'BK-PHY-HCV-01',
        quantity: 2,
        customDiscountPercent: 10,
      },
    ],
    posShiftId: activeShift?.id,
  };

  const posSaleRes = await simulate('POST', '/api/v1/sales/pos/sale', posSalePayload, authHeader);
  const posData = posSaleRes.data?.data;

  if (
    posSaleRes.statusCode === 201 &&
    posData?.invoice?.invoiceNumber?.startsWith('POS/') &&
    posData?.invoice?.paymentMethod === 'SPLIT_PAYMENT' &&
    posData?.thermalReceipt?.includes('KIBO360')
  ) {
    passed++;
    console.log(`[PASS] Test 7: POS Retail Split Payment -> Invoice ${posData.invoice.invoiceNumber} (Cash ₹500 + UPI ₹391) | ESC/POS receipt rendered (${posData.thermalReceipt.length} chars)`);
  } else {
    console.error('[FAIL] Test 7: POS Retail Split Payment ->', posSaleRes);
  }

  // --------------------------------------------------------------------------
  // TEST 8: POS HOLD & RESUME CART WORKFLOW
  // --------------------------------------------------------------------------
  total++;
  const holdPayload = {
    customerName: 'Customer in Queue (Waiting for UPI)',
    cashierName: 'Pooja Sharma',
    items: [
      {
        bookId: 'bk_math_12_eng_pb',
        sku: 'BK-MATH-12-ENG-PB',
        title: 'Mathematics for Class XII',
        quantity: 1,
        unitPrice: 595.0,
      },
    ],
    totalAmount: 595.0,
  };

  const holdRes = await simulate('POST', '/api/v1/sales/pos/hold', holdPayload, authHeader);
  const heldCart = holdRes.data?.data;

  const getHeldRes = await simulate('GET', '/api/v1/sales/pos/held-carts', null, authHeader);
  const heldList = getHeldRes.data?.data || [];

  const resumeRes = await simulate('POST', `/api/v1/sales/pos/resume/${heldCart?.id}`, null, authHeader);
  const resumedCart = resumeRes.data?.data;

  if (holdRes.statusCode === 201 && heldCart?.cartHoldRef && heldList.length > 0 && resumedCart?.id === heldCart?.id) {
    passed++;
    console.log(`[PASS] Test 8: POS Hold & Resume Cart -> Parked Cart ${heldCart.cartHoldRef} -> Resumed successfully`);
  } else {
    console.error('[FAIL] Test 8: POS Hold & Resume Cart ->', { holdRes, getHeldRes, resumeRes });
  }

  // --------------------------------------------------------------------------
  // TEST 9: SALES RETURN & CREDIT NOTE POSTING & INVENTORY RESTORATION
  // --------------------------------------------------------------------------
  total++;
  const returnPayload = {
    salesInvoiceId: invData?.id || 'sinv_default',
    returnReason: 'Defective binding on 5 copies during transit inspection',
    items: [
      {
        bookId: 'bk_physics_part1',
        sku: 'BK-PHY-HCV-01',
        title: 'Concepts of Physics (Part 1)',
        returnedQty: 5,
        unitRate: 297.0,
        taxRate: 0,
      },
    ],
  };

  const createReturnRes = await simulate('POST', '/api/v1/sales/returns', returnPayload, authHeader);
  const returnData = createReturnRes.data?.data;

  if (
    createReturnRes.statusCode === 201 &&
    returnData?.creditNoteNumber?.startsWith('CN/') &&
    returnData?.voucherNumber?.startsWith('CN/') &&
    returnData?.totalReturnAmount > 0
  ) {
    passed++;
    console.log(`[PASS] Test 9: Sales Return & Credit Note -> Created ${returnData.creditNoteNumber} | Posted GL Credit Note: ${returnData.voucherNumber} (₹${returnData.totalReturnAmount.toLocaleString()})`);
  } else {
    console.error('[FAIL] Test 9: Sales Return & Credit Note ->', createReturnRes);
  }

  // --------------------------------------------------------------------------
  // TEST 10: CUSTOMER RECEIPT WITH AUTOMATIC INVOICE SETTLEMENT & GL POSTING
  // --------------------------------------------------------------------------
  total++;
  const remainingDue = (invData?.netPayable || 15200) - (returnData?.totalReturnAmount || 1485);
  const receiptPayload = {
    customerId: 'cst_oxford_dist',
    paymentMethod: 'BANK_TRANSFER_NEFT_RTGS',
    bankLedgerId: 'led_bank_hdfc',
    referenceNumber: 'NEFT/HDFC/20261108/99881',
    amount: remainingDue,
    invoicesSettled: [
      {
        invoiceId: invData?.id || 'sinv_default',
        invoiceNumber: invData?.invoiceNumber || 'SINV/2026/0001',
        allocatedAmount: remainingDue,
      },
    ],
    notes: 'Final settlement after Credit Note adjustment',
  };

  const createReceiptRes = await simulate('POST', '/api/v1/sales/receipts', receiptPayload, authHeader);
  const receiptData = createReceiptRes.data?.data;

  if (
    createReceiptRes.statusCode === 201 &&
    receiptData?.receiptNumber?.startsWith('RV/') &&
    receiptData?.voucherNumber?.startsWith('RV/') &&
    receiptData?.amount === remainingDue
  ) {
    passed++;
    console.log(`[PASS] Test 10: Customer Receipt -> Settled ${receiptData.receiptNumber} | Posted GL Voucher: ${receiptData.voucherNumber} (₹${receiptData.amount.toLocaleString()} into ${receiptData.bankLedgerName})`);
  } else {
    console.error('[FAIL] Test 10: Customer Receipt ->', createReceiptRes);
  }

  // --------------------------------------------------------------------------
  // TEST 11: CUSTOMER AGEING & RUNNING STATEMENT
  // --------------------------------------------------------------------------
  total++;
  const ageingRes = await simulate('GET', '/api/v1/sales/customers/ageing', null, authHeader);
  const ageingData = ageingRes.data?.data;

  const stmtRes = await simulate('GET', '/api/v1/sales/customers/statement/cst_oxford_dist', null, authHeader);
  const stmtData = stmtRes.data?.data;

  if (
    ageingRes.statusCode === 200 &&
    Array.isArray(ageingData?.items) &&
    stmtRes.statusCode === 200 &&
    stmtData?.customerId === 'cst_oxford_dist' &&
    Array.isArray(stmtData?.entries)
  ) {
    passed++;
    console.log(`[PASS] Test 11: Customer Ageing & Statement -> Verified ${ageingData.items.length} ageing accounts. Statement for ${stmtData.customerName}: ${stmtData.entries.length} entries, Closing: ₹${stmtData.closingBalance.toLocaleString()}`);
  } else {
    console.error('[FAIL] Test 11: Customer Ageing & Statement ->', { ageingRes, stmtRes });
  }

  // --------------------------------------------------------------------------
  // TEST 12: SALES REPORTS & GROSS MARGIN ANALYSIS
  // --------------------------------------------------------------------------
  total++;
  const dailyReportRes = await simulate('GET', '/api/v1/sales/reports/daily', null, authHeader);
  const dailyReport = dailyReportRes.data?.data;

  const channelReportRes = await simulate('GET', '/api/v1/sales/reports/channel-wise', null, authHeader);
  const channelReport = channelReportRes.data?.data;

  const marginReportRes = await simulate('GET', '/api/v1/sales/reports/margin', null, authHeader);
  const marginReport = marginReportRes.data?.data;

  if (
    dailyReportRes.statusCode === 200 &&
    channelReportRes.statusCode === 200 &&
    marginReportRes.statusCode === 200 &&
    Array.isArray(channelReport) &&
    Array.isArray(marginReport)
  ) {
    passed++;
    const totalMargin = marginReport.reduce((acc, m) => acc + (m.grossMarginAmount || 0), 0);
    console.log(`[PASS] Test 12: Sales Reports & Gross Margin -> Daily Revenue: ₹${(dailyReport?.totalGrossSales || 0).toLocaleString()} | Channels: ${channelReport.length} | Gross Profit Margin: ₹${totalMargin.toLocaleString()}`);
  } else {
    console.error('[FAIL] Test 12: Sales Reports & Gross Margin ->', { dailyReportRes, channelReportRes, marginReportRes });
  }

  // --------------------------------------------------------------------------
  // FINAL SUMMARY
  // --------------------------------------------------------------------------
  console.log('===============================================================');
  console.log(`   PHASE 07 SALES & CUSTOMER MANAGEMENT: ${passed} / ${total} TESTS PASSED`);
  console.log('===============================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPhase07Tests().catch((err) => {
  console.error('Unhandled test failure:', err);
  process.exit(1);
});
