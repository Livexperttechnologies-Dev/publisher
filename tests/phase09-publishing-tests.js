const app = require('../backend/dist/app').default;

console.log('===============================================================');
console.log('   KIBO360 – PHASE 09 PUBLISHING & PRODUCTION MANAGEMENT TESTS');
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

async function runPhase09Tests() {
  let passed = 0;
  let total = 0;

  // 1. Authenticate as Super Admin / Publishing Production Lead
  const loginRes = await simulate('POST', '/api/v1/auth/login', {
    identifier: 'admin@kibo360.com',
    password: 'Admin@123',
  });
  const token = loginRes.data?.data?.token;
  const authHeaders = { authorization: `Bearer ${token}` };

  console.log(`[INFO] Authenticated as Super Admin. Token acquired.\n`);

  // --------------------------------------------------------------------------
  // TEST 1: Get Initial Publishing Projects & Seeded Classic Titles
  // --------------------------------------------------------------------------
  total++;
  const test1Res = await simulate('GET', '/api/v1/publishing/projects', null, authHeaders);
  if (test1Res.statusCode === 200 && Array.isArray(test1Res.data?.data) && test1Res.data.data.length >= 2) {
    console.log(`[PASS] Test 1: Seeded Publishing Projects retrieved successfully (${test1Res.data.data.length} projects).`);
    passed++;
  } else {
    console.error(`[FAIL] Test 1: Failed to retrieve seeded projects.`, test1Res);
  }

  // --------------------------------------------------------------------------
  // TEST 2: Create a New Publishing Project with Manuscript Specifications
  // --------------------------------------------------------------------------
  total++;
  const newProjectPayload = {
    title: 'Advanced Data Structures & Algorithms with TypeScript',
    subtitle: 'From LeetCode to Large-Scale System Design',
    language: 'English',
    edition: '1st Edition',
    category: 'Computer Science & Software Engineering',
    authorId: 'auth_ajit_kumar',
    authorName: 'Ajit Kumar',
    editorName: 'Senior STEM Acquisitions Editor',
    plannedPrintRun: 4000,
    targetMrp: 750.0,
    manuscriptWordCount: 195000,
    estimatedPages: 480,
    notes: 'Key textbook for CS engineering faculties and IT professionals',
  };
  const test2Res = await simulate('POST', '/api/v1/publishing/projects', newProjectPayload, authHeaders);
  const createdProject = test2Res.data?.data;
  if (
    test2Res.statusCode === 201 &&
    createdProject &&
    createdProject.projectNumber.startsWith('PRJ/2026/') &&
    createdProject.title === newProjectPayload.title &&
    createdProject.estimatedPages === 480
  ) {
    console.log(`[PASS] Test 2: Publishing Project created successfully (#${createdProject.projectNumber} - ${createdProject.title}).`);
    passed++;
  } else {
    console.error(`[FAIL] Test 2: Failed to create Publishing Project.`, test2Res);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Update Manuscript Stage Transition & Editorial Audit Trail
  // --------------------------------------------------------------------------
  total++;
  const test3Res = await simulate(
    'PATCH',
    `/api/v1/publishing/projects/${createdProject.id}/status`,
    {
      status: 'TYPESETTING_PROOF',
      notes: 'Peer review completed with 4 independent reviewers; typeset proofs in InDesign approved.',
    },
    authHeaders
  );
  if (test3Res.statusCode === 200 && test3Res.data?.data?.status === 'TYPESETTING_PROOF') {
    console.log(`[PASS] Test 3: Project editorial stage successfully updated to TYPESETTING_PROOF with audit note.`);
    passed++;
  } else {
    console.error(`[FAIL] Test 3: Failed to update project status.`, test3Res);
  }

  // --------------------------------------------------------------------------
  // TEST 4: Allocate Standard 13-digit ISBN from Available Allocation Pool
  // --------------------------------------------------------------------------
  total++;
  const isbnToAllocate = '978-81-948123-4-5';
  const test4Res = await simulate(
    'POST',
    `/api/v1/publishing/projects/${createdProject.id}/allocate-isbn`,
    { isbn: isbnToAllocate },
    authHeaders
  );
  if (test4Res.statusCode === 200 && test4Res.data?.data?.isbnAllocated === '9788194812345') {
    console.log(`[PASS] Test 4: ISBN allocated and sanitized successfully (ISBN: ${test4Res.data.data.isbnAllocated}).`);
    passed++;
  } else {
    console.error(`[FAIL] Test 4: Failed to allocate ISBN.`, test4Res);
  }

  // --------------------------------------------------------------------------
  // TEST 5: Create Production Order & Verify Industry Formula Material BOM Calculation
  // 480 pages -> 480 / 16 = 30 Forms
  // Print Run: 4000 copies
  // Paper Reams Required = 30 * (4000 / 500) * 1.05 = 30 * 8 * 1.05 = 252.00 Reams
  // --------------------------------------------------------------------------
  total++;
  const prodOrderPayload = {
    projectId: createdProject.id,
    sku: 'BK-CS-DSA-01',
    title: createdProject.title,
    edition: createdProject.edition,
    printRun: 4000,
    sheetSize: '23x36 inches',
    paperGsm: 70,
    paperType: 'Maplitho Natural Shade 70 GSM',
    coverGsm: 300,
    coverFinishing: 'Thermal Matte Lamination + Spot UV + Emboss',
    bindingType: 'Section Sewn & Perfect Bound',
    pagesCount: 480,
    pressVendorId: 'sup_thomson_press',
    pressVendorName: 'Thomson Press India Ltd. (Okhla Plant)',
    bindingVendorId: 'sup_replika_press',
    bindingVendorName: 'Replika Press & Automated Bindery Ltd.',
    notes: 'Premium softcover run with gold foil titling',
  };
  const test5Res = await simulate('POST', '/api/v1/publishing/orders', prodOrderPayload, authHeaders);
  const createdProdOrder = test5Res.data?.data;
  if (
    test5Res.statusCode === 201 &&
    createdProdOrder &&
    createdProdOrder.orderNumber.startsWith('PROD/2026/') &&
    createdProdOrder.formsCount === 30 &&
    createdProdOrder.reamsRequired === 252.0 &&
    createdProdOrder.platesRequired === 30
  ) {
    console.log(
      `[PASS] Test 5: Production Order created with verified BOM math (Forms: 30, Reams: 252.00, CTP Plates: 30).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 5: Production Order creation or BOM formula failed.`, test5Res);
  }

  // --------------------------------------------------------------------------
  // TEST 6: Raw Material Issue to Production (WIP General Ledger Posting)
  // Dr: Work-In-Progress (WIP) - Production (1005)
  // Cr: Raw Materials Store - Paper & Board (1006)
  // 252 reams @ ₹1,100/ream = ₹277,200.00
  // --------------------------------------------------------------------------
  total++;
  const issueMaterialPayload = {
    productionOrderId: createdProdOrder.id,
    materialType: 'PAPER_REAMS',
    quantityIssued: 252.0,
    unitCost: 1100.0,
    warehouseId: 'wh_central_press_depot',
    notes: '252 reams dispatched from Central Depot to Thomson Press',
  };
  const test6Res = await simulate('POST', '/api/v1/publishing/orders/issue-material', issueMaterialPayload, authHeaders);
  if (
    test6Res.statusCode === 200 &&
    test6Res.data?.data?.productionOrder?.status === 'MATERIAL_ISSUED' &&
    test6Res.data?.data?.voucherNumber
  ) {
    console.log(
      `[PASS] Test 6: Raw paper issued to press. Status MATERIAL_ISSUED with GL Voucher #${test6Res.data.data.voucherNumber} (Dr WIP / Cr Raw Materials).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 6: Raw Material issue failed.`, test6Res);
  }

  // --------------------------------------------------------------------------
  // TEST 7: Create Vendor Job Order for Press Printing
  // --------------------------------------------------------------------------
  total++;
  const printingJobPayload = {
    productionOrderId: createdProdOrder.id,
    jobType: 'PRINTING',
    vendorId: 'sup_thomson_press',
    vendorName: 'Thomson Press India Ltd. (Okhla Plant)',
    vendorGstin: '07AAACT1234F1Z5',
    materialIssuedNotes: '252 reams Maplitho 70 GSM & 30 CTP plates provided',
    jobWorkRate: 35.0, // ₹35 per copy printing charge
    totalJobCharges: 140000.0, // 4,000 * ₹35
  };
  const test7Res = await simulate('POST', '/api/v1/publishing/jobs', printingJobPayload, authHeaders);
  const printingJob = test7Res.data?.data;
  if (
    test7Res.statusCode === 201 &&
    printingJob &&
    printingJob.jobOrderNumber.startsWith('JOB/2026/') &&
    printingJob.jobType === 'PRINTING' &&
    printingJob.totalJobCharges === 140000.0
  ) {
    console.log(`[PASS] Test 7: Vendor Job Order for Printing created (#${printingJob.jobOrderNumber} for ₹140,000.00).`);
    passed++;
  } else {
    console.error(`[FAIL] Test 7: Printing Job Order creation failed.`, test7Res);
  }

  // --------------------------------------------------------------------------
  // TEST 8: Create Vendor Job Order for Section Sewing & Automated Binding
  // --------------------------------------------------------------------------
  total++;
  const bindingJobPayload = {
    productionOrderId: createdProdOrder.id,
    jobType: 'BINDING',
    vendorId: 'sup_replika_press',
    vendorName: 'Replika Press & Automated Bindery Ltd.',
    vendorGstin: '06AAACR9876Q1Z2',
    materialIssuedNotes: 'Printed folded sheets transferred from Thomson Press',
    jobWorkRate: 20.0, // ₹20 per copy binding charge
    totalJobCharges: 80000.0, // 4,000 * ₹20
  };
  const test8Res = await simulate('POST', '/api/v1/publishing/jobs', bindingJobPayload, authHeaders);
  const bindingJob = test8Res.data?.data;
  if (
    test8Res.statusCode === 201 &&
    bindingJob &&
    bindingJob.jobType === 'BINDING' &&
    bindingJob.totalJobCharges === 80000.0
  ) {
    console.log(`[PASS] Test 8: Vendor Job Order for Binding created (#${bindingJob.jobOrderNumber} for ₹80,000.00).`);
    passed++;
  } else {
    console.error(`[FAIL] Test 8: Binding Job Order creation failed.`, test8Res);
  }

  // --------------------------------------------------------------------------
  // TEST 9: Receive Vendor Job Work & Generate Vendor Billing GL Voucher
  // Dr: Work-In-Progress (WIP) - Production (1005)
  // Cr: Trade Creditors - Press & Bindery Vendors (2001)
  // --------------------------------------------------------------------------
  total++;
  const receiveJobPayload = {
    jobOrderId: printingJob.id,
    itemsDeliveredCount: 4000,
    vendorInvoiceNumber: 'TP-INV-2026-9081',
    actualMaterialConsumed: 252.0,
    spoilageWastageCount: 40,
    notes: 'Printed sheets delivered to bindery with 1% permissible makeready spoilage',
  };
  const test9Res = await simulate('POST', '/api/v1/publishing/jobs/receive', receiveJobPayload, authHeaders);
  if (
    test9Res.statusCode === 200 &&
    test9Res.data?.data?.jobOrder?.status === 'DELIVERED' &&
    test9Res.data?.data?.voucherNumber
  ) {
    console.log(
      `[PASS] Test 9: Vendor Job Work received with bill #${receiveJobPayload.vendorInvoiceNumber} and GL Voucher #${test9Res.data.data.voucherNumber}.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 9: Vendor Job Work receipt failed.`, test9Res);
  }

  // --------------------------------------------------------------------------
  // TEST 10: Quality Control QA Inspection Signoff
  // Verify 5 rigorous print & bindery checkpoints:
  // Registration, Ink Density, Binding Adhesion, Page Sequence, Trimming
  // --------------------------------------------------------------------------
  total++;
  const qaPayload = {
    productionOrderId: createdProdOrder.id,
    inspectedBy: 'Chief Quality Inspector (Bureau of Indian Standards)',
    sampleSize: 100,
    approvedCopies: 3960,
    rejectedCopies: 40, // 40 copies damaged during trimming
    quarantineCopies: 0,
    printRegistrationPass: true,
    inkDensityPass: true,
    bindingAdhesionPass: true,
    pageSequencePass: true,
    trimmingPass: true,
    remarks: '40 copies rejected due to guillotine knife alignment drift. 3,960 copies passed with pristine quality.',
  };
  const test10Res = await simulate('POST', '/api/v1/publishing/inspections', qaPayload, authHeaders);
  const inspection = test10Res.data?.data;
  if (
    test10Res.statusCode === 201 &&
    inspection &&
    inspection.overallStatus === 'PASSED_WITH_CONCESSION' &&
    inspection.approvedCopies === 3960 &&
    inspection.rejectedCopies === 40
  ) {
    console.log(
      `[PASS] Test 10: Quality Inspection QA completed successfully (#${inspection.inspectionNumber} - 3,960 approved, 40 rejected).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 10: Quality Inspection QA failed.`, test10Res);
  }

  // --------------------------------------------------------------------------
  // TEST 11: Production Completion, Cost Sheet & Finished Goods Capitalization
  // Total Cost = Paper (₹277,200) + Printing (₹140,000) + Binding (₹80,000) +
  //              Plates (₹15,000) + Cover Board (₹24,000) + Shrink-wrap & Cartons (₹12,000)
  //            = ₹548,200.00
  // Good Copies = 3,960
  // Per Copy Cost = 548,200 / 3,960 = ₹138.43
  // Automatic GL: Dr Finished Book Inventory (1004) / Cr WIP Production (1005)
  // Automatic Physical Stock Inward into Warehouse Depot via inventoryService
  // --------------------------------------------------------------------------
  total++;
  const completionPayload = {
    productionOrderId: createdProdOrder.id,
    destinationWarehouseId: 'wh_central_press_depot',
    destinationRackCode: 'RACK-B2-04',
    paperCost: 277200.0,
    printingCost: 140000.0,
    plateCost: 15000.0,
    bindingCost: 80000.0,
    coverCost: 24000.0,
    packagingCost: 12000.0,
    labourCost: 0.0,
    freightCost: 0.0,
    overheadCost: 0.0,
    goodCopiesProduced: 3960,
    notes: 'Finished edition received at Central Press Depot and cataloged.',
  };
  const test11Res = await simulate('POST', '/api/v1/publishing/orders/complete', completionPayload, authHeaders);
  const completedOrder = test11Res.data?.data?.productionOrder;
  const costSheet = test11Res.data?.data?.costSheet;
  if (
    test11Res.statusCode === 200 &&
    completedOrder &&
    completedOrder.status === 'COMPLETED' &&
    completedOrder.goodCopiesProduced === 3960 &&
    costSheet &&
    costSheet.totalCost === 548200.0 &&
    costSheet.perCopyCost === 138.43 &&
    test11Res.data?.data?.voucherNumber
  ) {
    console.log(
      `[PASS] Test 11: Production Order completed. Total Cost: ₹${costSheet.totalCost.toLocaleString()}, Per-Copy: ₹${costSheet.perCopyCost}, Capitalization Voucher: #${test11Res.data.data.voucherNumber}.`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 11: Production completion failed.`, test11Res);
  }

  // --------------------------------------------------------------------------
  // TEST 12: Production Analytics, Material Consumption & Cost Variance Reports
  // --------------------------------------------------------------------------
  total++;
  const statusReportRes = await simulate('GET', '/api/v1/publishing/reports/status', null, authHeaders);
  const materialReportRes = await simulate('GET', '/api/v1/publishing/reports/material-consumption', null, authHeaders);
  const varianceReportRes = await simulate('GET', '/api/v1/publishing/reports/variance', null, authHeaders);

  const statusValid = statusReportRes.statusCode === 200 && Array.isArray(statusReportRes.data?.data);
  const materialValid = materialReportRes.statusCode === 200 && Array.isArray(materialReportRes.data?.data);
  const varianceValid =
    varianceReportRes.statusCode === 200 &&
    Array.isArray(varianceReportRes.data?.data) &&
    varianceReportRes.data.data.some((v) => v.orderNumber === createdProdOrder.orderNumber);

  if (statusValid && materialValid && varianceValid) {
    const varItem = varianceReportRes.data.data.find((v) => v.orderNumber === createdProdOrder.orderNumber);
    console.log(
      `[PASS] Test 12: Production Reports generated successfully. Variance for #${varItem.orderNumber}: Benchmark ₹${varItem.budgetedPerCopyCost} vs Actual ₹${varItem.actualPerCopyCost} (${varItem.varianceStatus}).`
    );
    passed++;
  } else {
    console.error(`[FAIL] Test 12: Production Analytics & Variance Reports failed.`, {
      statusReportRes,
      materialReportRes,
      varianceReportRes,
    });
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`   PHASE 09 PUBLISHING & PRODUCTION TESTS: ${passed}/${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('===============================================================\n');

  return { passed, total };
}

if (require.main === module) {
  runPhase09Tests()
    .then(({ passed, total }) => {
      process.exit(passed === total ? 0 : 1);
    })
    .catch((err) => {
      console.error('Unhandled Test Runner Error:', err);
      process.exit(1);
    });
}

module.exports = { runPhase09Tests };
