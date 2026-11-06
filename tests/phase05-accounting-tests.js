const app = require('../backend/dist/app').default;

console.log('===============================================================');
console.log('   KIBO360 – PHASE 05 FINANCIAL ACCOUNTING & GENERAL LEDGER');
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

async function runPhase05Tests() {
  let passed = 0;
  let total = 0;

  // 1. Authenticate as Super Admin / Finance Manager
  const loginRes = await simulate('POST', '/api/v1/auth/login', {
    identifier: 'admin@kibo360.com',
    password: 'Admin@123',
  });
  const token = loginRes.data?.data?.token;

  if (!token) {
    console.error('Failed to obtain token for Phase 05 tests');
    process.exit(1);
  }

  const authHeader = { authorization: `Bearer ${token}` };

  // --------------------------------------------------------------------------
  // TEST 1: ENFORCE DEBIT & CREDIT EQUALITY (REJECT UNBALANCED VOUCHERS)
  // --------------------------------------------------------------------------
  total++;
  const unbalancedPayload = {
    voucherType: 'JOURNAL',
    narration: 'Imbalanced entry test: Debit ₹10,000 vs Credit ₹8,500',
    items: [
      { ledgerId: 'led_paper_purchase', debitAmount: 10000.0, creditAmount: 0.0 },
      { ledgerId: 'led_creditors', debitAmount: 0.0, creditAmount: 8500.0 }, // Short by 1,500!
    ],
  };

  const imbalancedRes = await simulate('POST', '/api/v1/accounting/vouchers', unbalancedPayload, authHeader);
  if (imbalancedRes.statusCode === 422) {
    passed++;
    console.log('[PASS] Test 1: Debit & Credit Equality -> Rejected unbalanced voucher with HTTP 422 Unprocessable Entity');
  } else {
    console.error('[FAIL] Test 1: Debit & Credit Equality -> Expected 422, got', imbalancedRes.statusCode);
  }

  // --------------------------------------------------------------------------
  // TEST 2: JOURNAL VOUCHER POSTING WITH SEQUENTIAL NUMBERING
  // --------------------------------------------------------------------------
  total++;
  const validJournalPayload = {
    voucherType: 'JOURNAL',
    narration: 'Depreciation on offset printing machinery for current month',
    items: [
      { ledgerId: 'led_paper_purchase', debitAmount: 25000.0, creditAmount: 0.0, costCentreName: 'Book Printing & Pre-Press Production' },
      { ledgerId: 'led_inv_paper', debitAmount: 0.0, creditAmount: 25000.0 },
    ],
  };

  const createJvRes = await simulate('POST', '/api/v1/accounting/vouchers', validJournalPayload, authHeader);
  const jvData = createJvRes.data?.data;

  if (createJvRes.statusCode === 201 && jvData?.voucherNumber?.startsWith('JV/')) {
    passed++;
    console.log(`[PASS] Test 2: Journal Voucher Posting -> Posted voucher ${jvData.voucherNumber} (HTTP 201)`);
  } else {
    console.error('[FAIL] Test 2: Journal Voucher Posting ->', createJvRes);
  }

  // --------------------------------------------------------------------------
  // TEST 3: PAYMENT VOUCHER POSTING (CREDIT BANK, DEBIT CREDITOR)
  // --------------------------------------------------------------------------
  total++;
  const paymentPayload = {
    voucherType: 'PAYMENT_VOUCHER',
    narration: 'Cheque payment to Trade Creditors for printing services',
    items: [
      { ledgerId: 'led_creditors', debitAmount: 75000.0, creditAmount: 0.0 },
      { ledgerId: 'led_bank_hdfc', debitAmount: 0.0, creditAmount: 75000.0 },
    ],
  };

  const payRes = await simulate('POST', '/api/v1/accounting/vouchers', paymentPayload, authHeader);
  const payData = payRes.data?.data;

  if (payRes.statusCode === 201 && payData?.voucherNumber?.startsWith('PV/')) {
    passed++;
    console.log(`[PASS] Test 3: Payment Voucher Posting -> Posted ${payData.voucherNumber} reducing Bank balance (HTTP 201)`);
  } else {
    console.error('[FAIL] Test 3: Payment Voucher Posting ->', payRes);
  }

  // --------------------------------------------------------------------------
  // TEST 4: RECEIPT VOUCHER POSTING (DEBIT BANK, CREDIT DEBTOR)
  // --------------------------------------------------------------------------
  total++;
  const receiptPayload = {
    voucherType: 'RECEIPT_VOUCHER',
    narration: 'Customer RTGS payment from wholesale book distributor',
    items: [
      { ledgerId: 'led_bank_hdfc', debitAmount: 150000.0, creditAmount: 0.0 },
      { ledgerId: 'led_debtors', debitAmount: 0.0, creditAmount: 150000.0 },
    ],
  };

  const recRes = await simulate('POST', '/api/v1/accounting/vouchers', receiptPayload, authHeader);
  const recData = recRes.data?.data;

  if (recRes.statusCode === 201 && recData?.voucherNumber?.startsWith('RV/')) {
    passed++;
    console.log(`[PASS] Test 4: Receipt Voucher Posting -> Posted ${recData.voucherNumber} increasing Bank balance (HTTP 201)`);
  } else {
    console.error('[FAIL] Test 4: Receipt Voucher Posting ->', recRes);
  }

  // --------------------------------------------------------------------------
  // TEST 5: CONTRA VOUCHER POSTING (CASH TO BANK TRANSFER)
  // --------------------------------------------------------------------------
  total++;
  const contraPayload = {
    voucherType: 'CONTRA_VOUCHER',
    narration: 'Cash deposit from sales counter into SBI Bank account',
    items: [
      { ledgerId: 'led_bank_sbi', debitAmount: 50000.0, creditAmount: 0.0 },
      { ledgerId: 'led_cash', debitAmount: 0.0, creditAmount: 50000.0 },
    ],
  };

  const contraRes = await simulate('POST', '/api/v1/accounting/vouchers', contraPayload, authHeader);
  const contraData = contraRes.data?.data;

  if (contraRes.statusCode === 201 && contraData?.voucherNumber?.startsWith('CV/')) {
    passed++;
    console.log(`[PASS] Test 5: Contra Voucher Posting -> Posted ${contraData.voucherNumber} internal transfer (HTTP 201)`);
  } else {
    console.error('[FAIL] Test 5: Contra Voucher Posting ->', contraRes);
  }

  // --------------------------------------------------------------------------
  // TEST 6: TRIAL BALANCE REPORT ACCURACY & ZERO DIFFERENCE
  // --------------------------------------------------------------------------
  total++;
  const tbRes = await simulate('GET', '/api/v1/accounting/reports/trial-balance', null, authHeader);
  const tb = tbRes.data?.data;

  if (tbRes.statusCode === 200 && tb?.isBalanced === true && tb?.difference === 0 && tb?.totalDebit > 0) {
    passed++;
    console.log(`[PASS] Test 6: Trial Balance Accuracy -> Perfectly balanced! Total Debit ₹${tb.totalDebit.toLocaleString()} = Total Credit ₹${tb.totalCredit.toLocaleString()}`);
  } else {
    console.error('[FAIL] Test 6: Trial Balance Accuracy ->', tb);
  }

  // --------------------------------------------------------------------------
  // TEST 7: GENERAL LEDGER STATEMENT & CHRONOLOGICAL RUNNING BALANCE
  // --------------------------------------------------------------------------
  total++;
  const statementRes = await simulate('GET', '/api/v1/accounting/ledgers/led_bank_hdfc/statement', null, authHeader);
  const statement = statementRes.data?.data;
  console.log('DEBUG Test 7 entries count:', statement?.entries?.length, 'Vouchers:', statement?.entries?.map((e) => e.voucherNumber));

  if (
    statementRes.statusCode === 200 &&
    statement?.entries?.length >= 3 &&
    statement?.closingBalance > 0 &&
    typeof statement.isClosingDebit === 'boolean'
  ) {
    passed++;
    console.log(`[PASS] Test 7: General Ledger Statement -> Verified ${statement.entries.length} transactions with running balance for HDFC Bank`);
  } else {
    console.error('[FAIL] Test 7: General Ledger Statement ->', statementRes);
  }

  // --------------------------------------------------------------------------
  // TEST 8: IMMUTABLE VOUCHER REVERSAL ENGINE
  // --------------------------------------------------------------------------
  total++;
  const voucherToReverseId = payData?.id; // Reverse the payment voucher from Test 3
  const reversePayload = {
    reason: 'Cheque bounced due to technical signature mismatch - reversing payment entry',
  };

  const revRes = await simulate('POST', `/api/v1/accounting/vouchers/${voucherToReverseId}/reverse`, reversePayload, authHeader);
  const revResult = revRes.data?.data;

  if (
    revRes.statusCode === 200 &&
    revResult?.originalVoucher?.status === 'REVERSED' &&
    revResult?.reversalVoucher?.isReversal === true &&
    revResult?.reversalVoucher?.voucherNumber?.startsWith('REV/')
  ) {
    passed++;
    console.log(`[PASS] Test 8: Voucher Reversal -> Created opposing entry ${revResult.reversalVoucher.voucherNumber} and marked original REVERSED`);
  } else {
    console.error('[FAIL] Test 8: Voucher Reversal ->', revRes);
  }

  // --------------------------------------------------------------------------
  // TEST 9: PREVENT RE-REVERSAL OF ALREADY REVERSED VOUCHER
  // --------------------------------------------------------------------------
  total++;
  const doubleRevRes = await simulate('POST', `/api/v1/accounting/vouchers/${voucherToReverseId}/reverse`, reversePayload, authHeader);
  if (doubleRevRes.statusCode === 400) {
    passed++;
    console.log('[PASS] Test 9: Reversal Guard -> Successfully prevented duplicate reversal (HTTP 400)');
  } else {
    console.error('[FAIL] Test 9: Reversal Guard -> Expected 400, got', doubleRevRes.statusCode);
  }

  // --------------------------------------------------------------------------
  // TEST 10: CLOSED-PERIOD RESTRICTION
  // --------------------------------------------------------------------------
  total++;
  const closedPeriodPayload = {
    voucherType: 'JOURNAL',
    entryDate: '2027-04-15T10:00:00.000Z', // Locked month 04/2027
    narration: 'Unauthorized back-dated entry attempt into locked fiscal period 04/2027',
    items: [
      { ledgerId: 'led_paper_purchase', debitAmount: 5000.0, creditAmount: 0.0 },
      { ledgerId: 'led_cash', debitAmount: 0.0, creditAmount: 5000.0 },
    ],
  };

  const closedRes = await simulate('POST', '/api/v1/accounting/vouchers', closedPeriodPayload, authHeader);
  if (closedRes.statusCode === 423) {
    passed++;
    console.log('[PASS] Test 10: Closed-Period Restriction -> Blocked posting into locked period 04/2027 (HTTP 423 Locked)');
  } else {
    console.error('[FAIL] Test 10: Closed-Period Restriction -> Expected 423, got', closedRes.statusCode);
  }

  // --------------------------------------------------------------------------
  // TEST 11: PROFIT & LOSS STATEMENT GENERATION
  // --------------------------------------------------------------------------
  total++;
  const pnlRes = await simulate('GET', '/api/v1/accounting/reports/profit-loss', null, authHeader);
  const pnl = pnlRes.data?.data;

  if (pnlRes.statusCode === 200 && pnl?.totalIncome > 0 && typeof pnl?.grossProfit === 'number' && typeof pnl?.netProfit === 'number') {
    passed++;
    console.log(`[PASS] Test 11: Profit & Loss Statement -> Revenue: ₹${pnl.totalIncome.toLocaleString()}, Gross Profit: ₹${pnl.grossProfit.toLocaleString()}, Net Profit: ₹${pnl.netProfit.toLocaleString()}`);
  } else {
    console.error('[FAIL] Test 11: Profit & Loss Statement ->', pnlRes);
  }

  // --------------------------------------------------------------------------
  // TEST 12: BALANCE SHEET FINANCIAL EQUATION
  // --------------------------------------------------------------------------
  total++;
  const bsRes = await simulate('GET', '/api/v1/accounting/reports/balance-sheet', null, authHeader);
  const bs = bsRes.data?.data;

  if (bsRes.statusCode === 200 && bs?.isBalanced === true && bs?.totalAssets > 0) {
    passed++;
    console.log(`[PASS] Test 12: Balance Sheet Equation -> Balanced! Total Assets (₹${bs.totalAssets.toLocaleString()}) = Liabilities + Equity (₹${bs.totalEquityAndLiabilities.toLocaleString()})`);
  } else {
    console.error('[FAIL] Test 12: Balance Sheet Equation ->', bsRes);
  }

  console.log('---------------------------------------------------------------');
  console.log(`Phase 05 Test Suite Execution: ${passed} / ${total} Tests Passed!`);
  console.log('===============================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPhase05Tests();
