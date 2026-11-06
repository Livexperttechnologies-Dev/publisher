const { fork } = require('child_process');
const path = require('path');

console.log('================================================================================');
console.log('       KIBO360 – ENTERPRISE ERP MASTER TEST SUITE RUNNER');
console.log('================================================================================\n');

const suites = [
  { name: 'Phase 02 – Authentication & User Management (15 Tests)', script: 'phase02-security-tests.js' },
  { name: 'Phase 03 – Company & Financial Configuration (8 Tests)', script: 'phase03-company-tests.js' },
  { name: 'Phase 04 – Master Data & Book Catalogue Management (12 Tests)', script: 'phase04-master-data-tests.js' },
  { name: 'Phase 05 – Financial Accounting & General Ledger (12 Tests)', script: 'phase05-accounting-tests.js' },
  { name: 'Phase 06 – Purchase Management & General Ledger (12 Tests)', script: 'phase06-purchase-tests.js' },
  { name: 'Phase 07 – Sales & Customer Management (12 Tests)', script: 'phase07-sales-tests.js' },
  { name: 'Phase 08 – Inventory & Warehouse Management (12 Tests)', script: 'phase08-inventory-tests.js' },
  { name: 'Phase 09 – Publishing & Production Management (12 Tests)', script: 'phase09-publishing-tests.js' },
  { name: 'Phase 10 – Author Royalty Management (12 Tests)', script: 'phase10-royalty-tests.js' },
  { name: 'Phase 11 – Distributor & Dealer Management (12 Tests)', script: 'phase11-distributor-tests.js' },
  { name: 'Phase 12 – GST & Indian Taxation (12 Tests)', script: 'phase12-taxation-tests.js' },
  { name: 'Phase 13 – Banking & Cash Management (12 Tests)', script: 'phase13-banking-tests.js' },
  { name: 'Phase 14 – Expenses, Fixed Assets & Budgeting (12 Tests)', script: 'phase14-expenses-tests.js' },
  { name: 'Phase 15 – Returns & Financial Adjustments (12 Tests)', script: 'phase15-returns-tests.js' },
  { name: 'Phase 16 – Financial Reporting & MIS Dashboard (12 Tests)', script: 'phase16-reporting-tests.js' },
  { name: 'Phase 17 – Notifications, Automation & Integrations (12 Tests)', script: 'phase17-notifications-tests.js' },
  { name: 'Phase 18 – Enterprise Security & Audit Management (12 Tests)', script: 'phase18-security-audit-tests.js' },
  { name: 'Phase 19 – Complete System E2E, Reconciliation & Performance (24 Tests)', script: 'phase19-e2e-reconciliation-perf-tests.js' },
];

async function runSuite(suite) {
  return new Promise((resolve) => {
    console.log(`>>> Starting: ${suite.name}`);
    const scriptPath = path.join(__dirname, suite.script);
    const child = fork(scriptPath, [], { stdio: 'inherit' });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`>>> [PASSED]: ${suite.name}\n`);
        resolve(true);
      } else {
        console.error(`>>> [FAILED]: ${suite.name} exited with code ${code}\n`);
        resolve(false);
      }
    });
  });
}

async function runAll() {
  const results = [];
  for (const suite of suites) {
    const passed = await runSuite(suite);
    results.push({ name: suite.name, passed });
  }

  console.log('================================================================================');
  console.log('                       MASTER SUITE EXECUTION SUMMARY');
  console.log('================================================================================');
  let allPassed = true;
  for (const r of results) {
    console.log(`${r.passed ? ' [PASS]' : ' [FAIL]'} ${r.name}`);
    if (!r.passed) allPassed = false;
  }
  console.log('================================================================================');

  if (allPassed) {
    console.log('🎉 ALL 215 VERIFIED ENTERPRISE INTEGRATION TESTS PASSED 100%! (Phases 02 to 19)');
    process.exit(0);
  } else {
    console.error('❌ SOME TEST SUITES FAILED. PLEASE CHECK LOGS ABOVE.');
    process.exit(1);
  }
}

runAll();
