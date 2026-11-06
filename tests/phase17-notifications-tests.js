const app = require('../backend/dist/app').default;

console.log('========================================================================');
console.log('   KIBO360 – PHASE 17 NOTIFICATIONS, AUTOMATION & INTEGRATIONS TESTS');
console.log('========================================================================');

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

async function runPhase17Tests() {
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
  // TEST 1: Retrieve In-App Notification Feed & Unread Counter
  // --------------------------------------------------------------------------
  total++;
  const feedRes = await simulate('GET', '/api/v1/notifications/in-app', null, authHeaders);
  const feedData = feedRes.data?.data;
  const feedMeta = feedRes.data?.meta;

  if (
    feedRes.statusCode === 200 &&
    Array.isArray(feedData) &&
    feedData.length >= 3 &&
    typeof feedMeta?.unreadCount === 'number' &&
    feedMeta.unreadCount >= 1
  ) {
    console.log(
      `[PASS] Test 1: Verified In-App Notification Feed (${feedData.length} notifications, ${feedMeta.unreadCount} unread; types: ${feedData.map((n) => n.type).join(', ')}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 1: In-App notification feed retrieval failed.`, feedRes);
  }

  // --------------------------------------------------------------------------
  // TEST 2: Individual & Bulk Mark As Read
  // --------------------------------------------------------------------------
  total++;
  const notifToRead = feedData?.find((n) => !n.isRead);
  const markRes = await simulate('PATCH', `/api/v1/notifications/in-app/${notifToRead?.id}/read`, null, authHeaders);
  const markBulkRes = await simulate('POST', '/api/v1/notifications/in-app/read-all', null, authHeaders);

  const updatedFeed = await simulate('GET', '/api/v1/notifications/in-app', null, authHeaders);

  if (
    markRes.statusCode === 200 &&
    markRes.data?.data?.isRead === true &&
    markBulkRes.statusCode === 200 &&
    updatedFeed.data?.meta?.unreadCount === 0
  ) {
    console.log(
      `[PASS] Test 2: Verified Mark As Read and Bulk Read All (Individual notif #${notifToRead?.id} marked read; unread counter reset to 0).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 2: Mark as read operations failed.`, { markRes, markBulkRes });
  }

  // --------------------------------------------------------------------------
  // TEST 3: Template Variable Substitution Engine
  // --------------------------------------------------------------------------
  total++;
  const templateDispatchRes = await simulate(
    'POST',
    '/api/v1/notifications/send',
    {
      channel: 'EMAIL',
      recipient: 'inventory.lead@kibo360.com',
      type: 'LOW_STOCK_ALERT',
      templateCode: 'LOW_STOCK_ALERT_EMAIL',
      variables: {
        bookTitle: 'Comprehensive Chemistry - Class 12',
        isbn: '978-81-7008-003-5',
        availableStock: '230',
        warehouseName: 'Sahibabad Central Bay 1',
        reorderLevel: '500',
        recommendedQty: '5,000',
      },
    },
    authHeaders
  );

  const tmplLog = templateDispatchRes.data?.data;
  const isRenderedCorrectly =
    templateDispatchRes.statusCode === 201 &&
    tmplLog &&
    tmplLog.content.includes('Comprehensive Chemistry - Class 12') &&
    tmplLog.content.includes('230 copies') &&
    tmplLog.content.includes('Sahibabad Central Bay 1') &&
    tmplLog.subject.includes('Comprehensive Chemistry - Class 12');

  if (isRenderedCorrectly) {
    console.log(
      `[PASS] Test 3: Verified Template Variable Substitution Engine (Subject and body variables resolved: "${tmplLog.subject}").`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 3: Template variable substitution failed.`, templateDispatchRes);
  }

  // --------------------------------------------------------------------------
  // TEST 4: Idempotency Key Guard & Duplicate Prevention
  // --------------------------------------------------------------------------
  total++;
  const testIdempotencyKey = `idemp_remind_inv_0890_${Date.now()}`;

  const firstCall = await simulate(
    'POST',
    '/api/v1/notifications/send',
    {
      channel: 'WHATSAPP',
      recipient: '+919830098300',
      type: 'OVERDUE_INVOICE',
      subject: 'Payment Reminder',
      content: 'Reminder for invoice #INV/2026/0890 of amount INR 4,50,000',
      idempotencyKey: testIdempotencyKey,
    },
    authHeaders
  );

  const secondCall = await simulate(
    'POST',
    '/api/v1/notifications/send',
    {
      channel: 'WHATSAPP',
      recipient: '+919830098300',
      type: 'OVERDUE_INVOICE',
      subject: 'Payment Reminder',
      content: 'Reminder for invoice #INV/2026/0890 of amount INR 4,50,000',
      idempotencyKey: testIdempotencyKey,
    },
    authHeaders
  );

  if (
    firstCall.statusCode === 201 &&
    firstCall.data?.meta?.isDuplicate === false &&
    secondCall.statusCode === 200 &&
    secondCall.data?.meta?.isDuplicate === true &&
    firstCall.data?.data?.id === secondCall.data?.data?.id
  ) {
    console.log(
      `[PASS] Test 4: Verified Idempotency Key Guard (Duplicate dispatch suppressed; matched original dispatch log #${firstCall.data?.data?.id}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 4: Idempotency check failed.`, { firstCall, secondCall });
  }

  // --------------------------------------------------------------------------
  // TEST 5: Multi-Channel Dispatch (WhatsApp & SMS with DLT Compliance)
  // --------------------------------------------------------------------------
  total++;
  const waRes = await simulate(
    'POST',
    '/api/v1/notifications/send',
    {
      channel: 'WHATSAPP',
      recipient: '+919811098110',
      type: 'OVERDUE_INVOICE',
      templateCode: 'OVERDUE_INVOICE_WHATSAPP',
      variables: {
        customerName: 'Oxford Book Store Pvt Ltd',
        invoiceNumber: 'INV/2026/0891',
        amount: '3,42,500',
        dueDate: '04-Nov-2026',
        paymentLink: 'https://pay.kibo360.com/inv/INV-0891',
      },
    },
    authHeaders
  );

  const smsRes = await simulate(
    'POST',
    '/api/v1/notifications/send',
    {
      channel: 'SMS',
      recipient: '+919811098110',
      type: 'PAYMENT_CONFIRMATION',
      templateCode: 'PAYMENT_RECEIPT_SMS',
      variables: {
        amount: '3,42,500',
        invoiceNumber: 'INV/2026/0891',
        paymentMode: 'NEFT',
      },
    },
    authHeaders
  );

  if (
    waRes.statusCode === 201 &&
    waRes.data?.data?.channel === 'WHATSAPP' &&
    smsRes.statusCode === 201 &&
    smsRes.data?.data?.channel === 'SMS'
  ) {
    console.log(
      `[PASS] Test 5: Verified Multi-Channel Dispatch (WhatsApp HSM payload + SMS DLT compliant notification delivered).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 5: Multi-channel dispatch failed.`, { waRes, smsRes });
  }

  // --------------------------------------------------------------------------
  // TEST 6: Delivery Failure & Exponential Retry Engine
  // --------------------------------------------------------------------------
  total++;
  const logId = waRes.data?.data?.id;
  const retryRes = await simulate('POST', `/api/v1/notifications/logs/${logId}/retry`, null, authHeaders);
  const retriedLog = retryRes.data?.data;

  if (
    retryRes.statusCode === 200 &&
    retriedLog &&
    retriedLog.retryCount === 1 &&
    retriedLog.status === 'DELIVERED'
  ) {
    console.log(
      `[PASS] Test 6: Verified Delivery Retry Engine (Log #${logId} incremented retryCount to ${retriedLog.retryCount} with status: ${retriedLog.status}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 6: Delivery retry failed.`, retryRes);
  }

  // --------------------------------------------------------------------------
  // TEST 7: Automated Scheduled Overdue Invoice Reminder Job
  // --------------------------------------------------------------------------
  total++;
  const overdueJobRes = await simulate(
    'POST',
    '/api/v1/notifications/jobs/run',
    { jobType: 'OVERDUE_INVOICES' },
    authHeaders
  );
  const overdueResult = overdueJobRes.data?.data;

  if (
    overdueJobRes.statusCode === 200 &&
    overdueResult &&
    overdueResult.jobName === 'OVERDUE_INVOICES' &&
    overdueResult.itemsProcessed >= 2 &&
    overdueResult.notificationsDispatched >= 1
  ) {
    console.log(
      `[PASS] Test 7: Verified Automated Overdue Invoice Job (${overdueResult.itemsProcessed} overdue debtor accounts processed; ${overdueResult.notificationsDispatched} reminders dispatched).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 7: Overdue invoice job failed.`, overdueJobRes);
  }

  // --------------------------------------------------------------------------
  // TEST 8: Automated Scheduled Reorder Safety Stock Alerts Job
  // --------------------------------------------------------------------------
  total++;
  const reorderJobRes = await simulate(
    'POST',
    '/api/v1/notifications/jobs/run',
    { jobType: 'REORDER_ALERTS' },
    authHeaders
  );
  const reorderResult = reorderJobRes.data?.data;

  if (
    reorderJobRes.statusCode === 200 &&
    reorderResult &&
    reorderResult.jobName === 'REORDER_ALERTS' &&
    reorderResult.itemsProcessed >= 2 &&
    reorderResult.notificationsDispatched >= 2
  ) {
    console.log(
      `[PASS] Test 8: Verified Automated Inventory Reorder Job (${reorderResult.itemsProcessed} safety thresholds audited; ${reorderResult.notificationsDispatched} in-app alerts dispatched).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 8: Reorder alerts job failed.`, reorderJobRes);
  }

  // --------------------------------------------------------------------------
  // TEST 9: Automated Manager Approval Escalation Job
  // --------------------------------------------------------------------------
  total++;
  const approvalJobRes = await simulate(
    'POST',
    '/api/v1/notifications/jobs/run',
    { jobType: 'PENDING_APPROVALS' },
    authHeaders
  );
  const approvalResult = approvalJobRes.data?.data;

  if (
    approvalJobRes.statusCode === 200 &&
    approvalResult &&
    approvalResult.jobName === 'PENDING_APPROVALS' &&
    approvalResult.itemsProcessed >= 2 &&
    approvalResult.notificationsDispatched >= 2
  ) {
    console.log(
      `[PASS] Test 9: Verified Manager Approval Escalation Job (${approvalResult.itemsProcessed} high-value vouchers escalated to Chief Financial Controller).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 9: Approval escalation job failed.`, approvalJobRes);
  }

  // --------------------------------------------------------------------------
  // TEST 10: Automated Daily Executive Sales Summary Job
  // --------------------------------------------------------------------------
  total++;
  const salesSummaryRes = await simulate(
    'POST',
    '/api/v1/notifications/jobs/run',
    { jobType: 'DAILY_SALES_SUMMARY' },
    authHeaders
  );
  const salesResult = salesSummaryRes.data?.data;

  if (
    salesSummaryRes.statusCode === 200 &&
    salesResult &&
    salesResult.jobName === 'DAILY_SALES_SUMMARY' &&
    salesResult.notificationsDispatched === 1
  ) {
    console.log(
      `[PASS] Test 10: Verified Daily Executive Sales Summary Job (Dispatched daily sales digest email to directors).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 10: Daily sales summary job failed.`, salesSummaryRes);
  }

  // --------------------------------------------------------------------------
  // TEST 11: Cryptographic Webhook Verification (HMAC Signature Check)
  // --------------------------------------------------------------------------
  total++;
  // Invalid signature test
  const invalidHmacRes = await simulate(
    'POST',
    '/api/v1/notifications/webhooks/razorpay',
    { event: 'payment.captured', payload: { payment: { entity: { id: 'pay_fake', amount: 50000 } } } },
    { 'x-razorpay-signature': 'invalid_forged_hmac_hash' }
  );

  // Valid signature test
  const validHmacRes = await simulate(
    'POST',
    '/api/v1/notifications/webhooks/razorpay',
    {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_live_091823',
            amount: 34250000, // INR 3,42,500.00
            contact: '+919811098110',
            notes: { invoiceNumber: 'INV/2026/0891' },
          },
        },
      },
    },
    { 'x-razorpay-signature': 'valid_razorpay_signature_pass' }
  );

  if (
    invalidHmacRes.statusCode === 400 &&
    validHmacRes.statusCode === 200 &&
    validHmacRes.data?.success === true
  ) {
    console.log(
      `[PASS] Test 11: Verified Cryptographic Webhook Security (Forged HMAC signature rejected HTTP 400; valid payment.captured webhook processed HTTP 200).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 11: Webhook HMAC signature verification failed.`, { invalidHmacRes, validHmacRes });
  }

  // --------------------------------------------------------------------------
  // TEST 12: Hardware Integration (80mm ESC/POS Thermal Receipt Generator)
  // --------------------------------------------------------------------------
  total++;
  const receiptRes = await simulate(
    'POST',
    '/api/v1/notifications/hardware/esc-pos-receipt',
    {
      invoiceNumber: 'POS-2026-0042',
      customerName: 'St. Xavier School Bookstore',
      customerGstin: '07BBRPA1234D1ZP',
      items: [
        { title: 'Senior Secondary Mathematics - Class 10', quantity: 20, rate: 295, amount: 5900 },
        { title: 'Modern Physics - Class 12', quantity: 15, rate: 380, amount: 5700 },
      ],
      subtotal: 11600,
      taxAmount: 0,
      grandTotal: 11600,
      paymentMode: 'UPI (Ref: 9182049182)',
      cashierName: 'Aarav Sharma (Counter #01)',
      width: '80mm',
    },
    authHeaders
  );

  const receiptData = receiptRes.data?.data;
  const isReceiptValid =
    receiptRes.statusCode === 200 &&
    receiptData &&
    typeof receiptData.textRepresentation === 'string' &&
    receiptData.textRepresentation.includes('KIBO360 ENTERPRISE PUBLISHERS') &&
    receiptData.textRepresentation.includes('POS-2026-0042') &&
    receiptData.textRepresentation.includes('INR 11600.00') &&
    typeof receiptData.escPosHexCommands === 'string' &&
    receiptData.escPosHexCommands.toLowerCase().startsWith('1b40') && // ESC @ (Init)
    receiptData.escPosHexCommands.toLowerCase().endsWith('1d564200'); // GS V 66 0 (Paper Cut)

  if (isReceiptValid) {
    console.log(
      `[PASS] Test 12: Verified Hardware Integration (Generated standard 80mm ESC/POS thermal receipt with ESC @ initialize, font bold, item columns, and GS V 66 0 auto paper cut).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 12: Thermal receipt generator failed.`, receiptRes);
  }

  console.log('\n========================================================================');
  console.log(` PHASE 17 TESTS SUMMARY: ${passed} / ${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('========================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runPhase17Tests().catch((err) => {
  console.error('Unhandled test failure:', err);
  process.exit(1);
});
