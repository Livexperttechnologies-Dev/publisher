const app = require('../backend/dist/app').default;

console.log('===============================================================');
console.log('   KIBO360 – PHASE 13 BANKING & CASH MANAGEMENT TESTS');
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

async function runPhase13Tests() {
  let passed = 0;
  let total = 0;

  // 1. Authenticate as Super Admin / Treasury Controller
  const loginRes = await simulate('POST', '/api/v1/auth/login', {
    identifier: 'admin@kibo360.com',
    password: 'Admin@123',
  });
  const token = loginRes.data?.data?.token;
  const authHeaders = { authorization: `Bearer ${token}` };

  console.log(`[INFO] Authenticated as Super Admin. Token acquired.\n`);

  // --------------------------------------------------------------------------
  // TEST 1: Retrieve Seeded Bank Accounts & Cash Registers
  // --------------------------------------------------------------------------
  total++;
  const accountsRes = await simulate('GET', '/api/v1/banking/accounts', null, authHeaders);
  const registersRes = await simulate('GET', '/api/v1/banking/registers', null, authHeaders);

  const accounts = accountsRes.data?.data;
  const registers = registersRes.data?.data;

  if (
    accountsRes.statusCode === 200 &&
    Array.isArray(accounts) &&
    accounts.length >= 2 &&
    registersRes.statusCode === 200 &&
    Array.isArray(registers) &&
    registers.length >= 2
  ) {
    console.log(
      `[PASS] Test 1: Seeded banking repositories verified (${accounts.length} bank accounts, ${registers.length} cash registers).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 1: Failed to retrieve seeded banking records.`, { accountsRes, registersRes });
  }

  // --------------------------------------------------------------------------
  // TEST 2: Create Commercial Bank Account with IFSC & GL Mapping
  // --------------------------------------------------------------------------
  total++;
  const newAccountPayload = {
    accountName: 'ICICI Bank Digital Collection A/c',
    accountNumber: '000405123456',
    bankName: 'ICICI Bank Ltd.',
    ifscCode: 'ICIC0000004',
    branchName: 'Connaught Place, New Delhi',
    accountType: 'CURRENT',
    openingBalance: 100000.0,
    ledgerId: 'led_bank_hdfc',
  };
  const test2Res = await simulate('POST', '/api/v1/banking/accounts', newAccountPayload, authHeaders);
  const createdAcc = test2Res.data?.data;
  if (
    test2Res.statusCode === 201 &&
    createdAcc &&
    createdAcc.accountNumber === '000405123456' &&
    createdAcc.ifscCode === 'ICIC0000004' &&
    createdAcc.currentBalance === 100000.0
  ) {
    console.log(
      `[PASS] Test 2: Commercial Bank Account created successfully (#${createdAcc.accountNumber} - ${createdAcc.accountName}, Balance: ₹1,00,000).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 2: Failed to create bank account.`, test2Res);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Multi-Method Bank Inward Collection (UPI with UTR Ref)
  // --------------------------------------------------------------------------
  total++;
  const upiPayload = {
    bankAccountId: 'bnk_hdfc_01',
    transactionType: 'RECEIPT',
    paymentMethod: 'UPI',
    referenceNumber: 'UPI/2026/90812281',
    partyName: 'Oxford Book Store',
    amount: 45000.0,
    narration: 'Online textbook order payment settlement via PhonePe QR',
  };
  const test3Res = await simulate('POST', '/api/v1/banking/transactions/bank', upiPayload, authHeaders);
  const upiTx = test3Res.data?.data;
  if (
    test3Res.statusCode === 201 &&
    upiTx &&
    upiTx.paymentMethod === 'UPI' &&
    upiTx.debitAmount === 45000.0 &&
    upiTx.accountingVoucherNumber
  ) {
    console.log(
      `[PASS] Test 3: UPI Bank Receipt recorded: ₹45,000 deposited into HDFC Bank (Ref: ${upiTx.referenceNumber}, GL Voucher #${upiTx.accountingVoucherNumber}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 3: UPI transaction recording failed.`, test3Res);
  }

  // --------------------------------------------------------------------------
  // TEST 4: Outward Vendor Bank Payment via NEFT
  // --------------------------------------------------------------------------
  total++;
  const neftPayload = {
    bankAccountId: 'bnk_hdfc_01',
    transactionType: 'PAYMENT',
    paymentMethod: 'NEFT',
    referenceNumber: 'HDFC-NEFT-901822',
    partyName: 'Replika Press India Ltd.',
    amount: 75000.0,
    narration: 'Settlement for Section Sewing and Binding job work bill #RP-8812',
  };
  const test4Res = await simulate('POST', '/api/v1/banking/transactions/bank', neftPayload, authHeaders);
  const neftTx = test4Res.data?.data;
  if (
    test4Res.statusCode === 201 &&
    neftTx &&
    neftTx.paymentMethod === 'NEFT' &&
    neftTx.creditAmount === 75000.0 &&
    neftTx.accountingVoucherNumber
  ) {
    console.log(
      `[PASS] Test 4: NEFT Vendor Payment recorded: ₹75,000 debited from HDFC Bank (UTR: ${neftTx.referenceNumber}, GL Voucher #${neftTx.accountingVoucherNumber}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 4: NEFT payment recording failed.`, test4Res);
  }

  // --------------------------------------------------------------------------
  // TEST 5: Cheque Issuance, Deposit & Clearing Lifecycle
  // --------------------------------------------------------------------------
  total++;
  const chqLifecycleRes = await simulate(
    'POST',
    '/api/v1/banking/cheques/lifecycle',
    {
      chequeId: 'chq_leaf_101', // Seeded cheque #882191
      action: 'CLEAR',
      date: '2026-11-04',
    },
    authHeaders
  );
  const clearedChq = chqLifecycleRes.data?.data;
  if (
    chqLifecycleRes.statusCode === 200 &&
    clearedChq &&
    clearedChq.status === 'CLEARED' &&
    clearedChq.clearingDate === '2026-11-04'
  ) {
    console.log(
      `[PASS] Test 5: Cheque lifecycle verified: Cheque #${clearedChq.chequeNumber} cleared successfully with value date recorded.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 5: Cheque clearing lifecycle failed.`, chqLifecycleRes);
  }

  // --------------------------------------------------------------------------
  // TEST 6: Cheque Bounce Handling with Reversal Voucher & Statutory Penalty Charges
  // --------------------------------------------------------------------------
  total++;
  const bouncePayload = {
    chequeId: 'chq_leaf_102', // Seeded cheque #551029 (₹60,000)
    action: 'BOUNCE',
    date: '2026-11-04',
    bounceReason: 'Exceeds Arrangement / Insufficient Balance (Code 01)',
    bounceCharges: 590.0,
  };
  const test6Res = await simulate('POST', '/api/v1/banking/cheques/lifecycle', bouncePayload, authHeaders);
  const bouncedChq = test6Res.data?.data;
  if (
    test6Res.statusCode === 200 &&
    bouncedChq &&
    bouncedChq.status === 'BOUNCED' &&
    bouncedChq.bounceReason &&
    bouncedChq.bounceCharges === 590.0 &&
    bouncedChq.reversalVoucherNumber
  ) {
    console.log(
      `[PASS] Test 6: Cheque Bounce handled: Cheque #${bouncedChq.chequeNumber} dishonoured. Reversal Voucher #${bouncedChq.reversalVoucherNumber} and ₹590 bounce fee debited to party.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 6: Cheque bounce handling failed.`, test6Res);
  }

  // --------------------------------------------------------------------------
  // TEST 7: Inter-Bank Funds Transfer (Contra Voucher - HDFC to SBI)
  // --------------------------------------------------------------------------
  total++;
  const transferPayload = {
    transferType: 'BANK_TO_BANK',
    fromBankAccountId: 'bnk_hdfc_01',
    toBankAccountId: 'bnk_sbi_02',
    amount: 100000.0,
    referenceNumber: 'RTGS-TRF-2026-0981',
    narration: 'Inter-bank liquidity balancing transfer from HDFC to SBI Operative account',
  };
  const test7Res = await simulate('POST', '/api/v1/banking/transfers', transferPayload, authHeaders);
  const trfResult = test7Res.data?.data;
  if (
    test7Res.statusCode === 200 &&
    trfResult &&
    trfResult.transferType === 'BANK_TO_BANK' &&
    trfResult.amount === 100000.0 &&
    trfResult.voucherNumber &&
    trfResult.voucherNumber.startsWith('CV/2026/')
  ) {
    console.log(
      `[PASS] Test 7: Inter-Bank Contra Transfer executed: ₹1,00,000 transferred from HDFC to SBI (Contra Voucher #${trfResult.voucherNumber}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 7: Inter-bank transfer failed.`, test7Res);
  }

  // --------------------------------------------------------------------------
  // TEST 8: Cash-to-Bank Deposit (Contra Voucher)
  // --------------------------------------------------------------------------
  total++;
  const cashDepositPayload = {
    transferType: 'CASH_TO_BANK',
    fromCashRegisterId: 'csh_central_01',
    toBankAccountId: 'bnk_hdfc_01',
    amount: 25000.0,
    referenceNumber: 'DEP-SLIP-7721',
    narration: 'Counter cash collection deposited into HDFC Corporate Current account',
  };
  const test8Res = await simulate('POST', '/api/v1/banking/transfers', cashDepositPayload, authHeaders);
  const cashTrfResult = test8Res.data?.data;
  if (
    test8Res.statusCode === 200 &&
    cashTrfResult &&
    cashTrfResult.transferType === 'CASH_TO_BANK' &&
    cashTrfResult.amount === 25000.0 &&
    cashTrfResult.voucherNumber
  ) {
    console.log(
      `[PASS] Test 8: Cash-to-Bank deposit recorded: ₹25,000 deposited from Central Cash Desk into HDFC (Contra Voucher #${cashTrfResult.voucherNumber}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 8: Cash-to-bank transfer failed.`, test8Res);
  }

  // --------------------------------------------------------------------------
  // TEST 9: Petty Cash Operating Expenses under Imprest System
  // --------------------------------------------------------------------------
  total++;
  const pettyPayload = {
    cashRegisterId: 'csh_petty_02',
    transactionType: 'PETTY_EXPENSE',
    amount: 1500.0,
    expenseCategory: 'COURIER_AND_REFRESHMENTS',
    narration: 'Urgent courier dispatch of advance sample copies to author + editorial meeting tea',
  };
  const test9Res = await simulate('POST', '/api/v1/banking/transactions/cash', pettyPayload, authHeaders);
  const pettyTx = test9Res.data?.data;
  if (
    test9Res.statusCode === 201 &&
    pettyTx &&
    pettyTx.transactionType === 'PETTY_EXPENSE' &&
    pettyTx.creditAmount === 1500.0 &&
    pettyTx.runningBalance === 13500.0 &&
    pettyTx.accountingVoucherNumber
  ) {
    console.log(
      `[PASS] Test 9: Petty cash voucher posted: ₹1,500 disbursed under Imprest System (Balance: ₹13,500, GL Voucher #${pettyTx.accountingVoucherNumber}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 9: Petty cash transaction failed.`, test9Res);
  }

  // --------------------------------------------------------------------------
  // TEST 10: Cash Counter Day-End Closing & Cashier Discrepancy Reconciliation
  // --------------------------------------------------------------------------
  total++;
  const closeShiftPayload = {
    cashRegisterId: 'csh_central_01',
    cashierName: 'Rajiv Malhotra',
    physicalCountedCash: 25000.0, // Remaining balance after ₹25,000 deposit
    notes: 'Shift completed with verified physical denomination counts',
  };
  const test10Res = await simulate('POST', '/api/v1/banking/cash/close', closeShiftPayload, authHeaders);
  const closeSession = test10Res.data?.data;
  if (
    test10Res.statusCode === 201 &&
    closeSession &&
    closeSession.closingNumber.startsWith('CCLS/2026/') &&
    closeSession.physicalCountedCash === 25000.0 &&
    closeSession.discrepancy === 0.0 &&
    closeSession.status === 'RECONCILED'
  ) {
    console.log(
      `[PASS] Test 10: Cashier shift closed (#${closeSession.closingNumber}): Physical cash ₹25,000 matches System Expected. Discrepancy: ₹0.00 (RECONCILED).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 10: Cashier shift closing failed.`, test10Res);
  }

  // --------------------------------------------------------------------------
  // TEST 11: Bank Statement Import & Duplicate Statement Detection Guard
  // --------------------------------------------------------------------------
  total++;
  const statementPayload = {
    bankAccountId: 'bnk_hdfc_01',
    statementFileName: 'HDFC_Statement_October_2026.csv',
    rows: [
      {
        date: '2026-10-31',
        narration: 'UPI/2026/90812281/Oxford Books',
        referenceNumber: 'UPI/2026/90812281',
        depositAmount: 45000.0,
        withdrawalAmount: 0.0,
      },
      {
        date: '2026-10-31',
        narration: 'NEFT DR/HDFC-NEFT-901822/Replika Press',
        referenceNumber: 'HDFC-NEFT-901822',
        depositAmount: 0.0,
        withdrawalAmount: 75000.0,
      },
    ],
  };
  const test11ARes = await simulate('POST', '/api/v1/banking/reconciliation/import', statementPayload, authHeaders);
  const test11BRes = await simulate('POST', '/api/v1/banking/reconciliation/import', statementPayload, authHeaders);

  if (
    test11ARes.statusCode === 200 &&
    test11ARes.data?.data?.importedCount === 2 &&
    test11BRes.statusCode === 409 &&
    test11BRes.data?.message?.includes('Duplicate bank statement import rejected')
  ) {
    console.log(
      `[PASS] Test 11: Statement import & duplicate guard verified: Initial import succeeded (2 rows matched); Duplicate import blocked with HTTP 409 Conflict.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 11: Bank statement import testing failed.`, { test11ARes, test11BRes });
  }

  // --------------------------------------------------------------------------
  // TEST 12: Bank Reconciliation Statement (BRS) Zero Difference Validation & Reports
  // --------------------------------------------------------------------------
  total++;
  // Calculate expected statement balance based on formula:
  // Reconciled Balance = Book Balance + Unpresented Cheques (45,000) - Uncredited Cheques (60,000) - Bank Debits (590)
  const hdfcAcc = (await simulate('GET', '/api/v1/banking/accounts/bnk_hdfc_01', null, authHeaders)).data?.data;
  const bookBal = hdfcAcc.currentBalance;
  const expectedStatementBal = bookBal + 45000.0 - 60000.0 - 590.0;

  const brsPayload = {
    bankAccountId: 'bnk_hdfc_01',
    statementPeriod: 'October 2026',
    asOfDate: '2026-10-31',
    bankStatementBalance: expectedStatementBal,
  };
  const brsRes = await simulate('POST', '/api/v1/banking/reconciliation/calculate-brs', brsPayload, authHeaders);
  const brs = brsRes.data?.data;

  const cashBookRes = await simulate('GET', '/api/v1/banking/reports/cash-book', null, authHeaders);
  const bankBookRes = await simulate('GET', '/api/v1/banking/reports/bank-book', null, authHeaders);
  const collectionRes = await simulate('GET', '/api/v1/banking/reports/daily-collection', null, authHeaders);

  if (
    brsRes.statusCode === 200 &&
    brs &&
    brs.isBalanced === true &&
    brs.difference === 0.0 &&
    cashBookRes.statusCode === 200 &&
    bankBookRes.statusCode === 200 &&
    collectionRes.statusCode === 200
  ) {
    console.log(
      `[PASS] Test 12: Bank Reconciliation Statement (BRS) validated: Reconciled Balance ₹${brs.reconciledBalance.toLocaleString()} matches Bank Statement with Difference ₹0.00. Cash & Bank Books generated.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 12: BRS calculation or report generation failed.`, {
      brsRes,
      cashBookRes,
      bankBookRes,
      collectionRes,
    });
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`   PHASE 13 BANKING TESTS: ${passed}/${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('===============================================================\n');

  return { passed, total };
}

if (require.main === module) {
  runPhase13Tests()
    .then(({ passed, total }) => {
      process.exit(passed === total ? 0 : 1);
    })
    .catch((err) => {
      console.error('Unhandled Test Runner Error:', err);
      process.exit(1);
    });
}

module.exports = { runPhase13Tests };
