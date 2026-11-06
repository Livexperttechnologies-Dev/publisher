const app = require('../backend/dist/app').default;

console.log('===============================================================');
console.log('   KIBO360 – PHASE 04 MASTER DATA & BOOK CATALOGUE TESTS');
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

async function runPhase04Tests() {
  let passed = 0;
  let total = 0;

  // 1. Authenticate as Super Admin / Publisher
  const loginSuper = await simulate('POST', '/api/v1/auth/login', {
    identifier: 'admin@kibo360.com',
    password: 'Admin@123',
  });
  const token = loginSuper.data?.data?.token;

  if (!token) {
    console.error('Failed to obtain token for testing Phase 04');
    process.exit(1);
  }

  const authHeader = { authorization: `Bearer ${token}` };

  // --------------------------------------------------------------------------
  // TEST 1: BOOK MASTER CREATION WITH COMPLETE METADATA
  // --------------------------------------------------------------------------
  total++;
  const uniqueTimestamp = Date.now();
  const newBookPayload = {
    title: 'Advanced Engineering Mathematics (Metric Edition)',
    subtitle: 'Differential Equations, Linear Algebra & Complex Analysis',
    isbn10: '8177097711',
    isbn13: '9788177097718',
    sku: `BK-ENGG-MATH-${uniqueTimestamp.toString().slice(-4)}`,
    barcode: '9788177097718',
    authorName: 'Prof. Erwin Kreyszig',
    publisherName: 'Apex Educational Publishers & Distributors Ltd.',
    edition: '10th International Edition',
    volume: 'Complete Vol 1 & 2',
    language: 'English',
    subject: 'Mathematics',
    category: 'Academic & School Textbooks',
    subcategory: 'Higher Technical Education',
    publicationYear: 2026,
    numberOfPages: 1152,
    bindingType: 'Paperback',
    bookSize: 'Royal 8vo',
    printingFormat: '2 Color',
    hsnSacCode: '4901',
    taxRate: 0.0,
    mrp: 1195.0,
    wholesalePrice: 717.0,
    dealerPrice: 896.25,
    purchaseCost: 420.0,
    openingStock: 1500,
    reorderLevel: 150,
    status: 'ACTIVE',
  };

  const createBookRes = await simulate('POST', '/api/v1/books', newBookPayload, authHeader);
  if (createBookRes.statusCode === 201 && createBookRes.data?.data?.id) {
    passed++;
    console.log('[PASS] Test 1: Book Master Creation -> Created book with full metadata & pricing (HTTP 201)');
  } else {
    console.error('[FAIL] Test 1: Book Master Creation ->', createBookRes);
  }

  // --------------------------------------------------------------------------
  // TEST 2: DUPLICATE ISBN-13 PREVENTION
  // --------------------------------------------------------------------------
  total++;
  const duplicateIsbnPayload = {
    title: 'Duplicate ISBN Conflict Book',
    sku: `BK-CONFLICT-${Date.now()}`,
    isbn13: '9788177097718', // Same as Test 1
    authorName: 'Another Author',
    publisherName: 'Apex Educational Publishers & Distributors Ltd.',
    subject: 'Mathematics',
    category: 'Academic & School Textbooks',
    numberOfPages: 300,
    mrp: 599.0,
  };

  const dupIsbnRes = await simulate('POST', '/api/v1/books', duplicateIsbnPayload, authHeader);
  if (dupIsbnRes.statusCode === 409) {
    passed++;
    console.log('[PASS] Test 2: Duplicate ISBN-13 Prevention -> Blocked duplicate ISBN with HTTP 409 Conflict');
  } else {
    console.error('[FAIL] Test 2: Duplicate ISBN-13 Prevention -> Expected 409, got', dupIsbnRes.statusCode);
  }

  // --------------------------------------------------------------------------
  // TEST 3: DUPLICATE SKU / BOOK CODE PREVENTION
  // --------------------------------------------------------------------------
  total++;
  const duplicateSkuPayload = {
    title: 'Duplicate SKU Conflict Book',
    sku: newBookPayload.sku, // Same SKU as Test 1
    isbn13: '9788177099999',
    authorName: 'Another Author',
    publisherName: 'Apex Educational Publishers & Distributors Ltd.',
    subject: 'Physics',
    category: 'Academic & School Textbooks',
    numberOfPages: 250,
    mrp: 450.0,
  };

  const dupSkuRes = await simulate('POST', '/api/v1/books', duplicateSkuPayload, authHeader);
  if (dupSkuRes.statusCode === 409) {
    passed++;
    console.log('[PASS] Test 3: Duplicate SKU Prevention -> Blocked duplicate SKU with HTTP 409 Conflict');
  } else {
    console.error('[FAIL] Test 3: Duplicate SKU Prevention -> Expected 409, got', dupSkuRes.statusCode);
  }

  // --------------------------------------------------------------------------
  // TEST 4: MULTIPLE EDITIONS, LANGUAGES & FORMATS GROUPING
  // --------------------------------------------------------------------------
  total++;
  const editionsRes = await simulate('GET', '/api/v1/books/bk_math_12_eng_pb/editions', null, authHeader);
  const editions = editionsRes.data?.data?.editionsAndFormats || [];
  const hasMultipleLangs = editions.some((e) => e.language === 'English') && editions.some((e) => e.language === 'Hindi');
  const hasMultipleFormats = editions.some((e) => e.bindingType === 'Paperback') && editions.some((e) => e.bindingType === 'Hardcover');

  if (editionsRes.statusCode === 200 && editions.length >= 3 && hasMultipleLangs && hasMultipleFormats) {
    passed++;
    console.log(`[PASS] Test 4: Multiple Editions & Formats Grouping -> Retrieved ${editions.length} related editions, Hindi/English & Hardcover/Paperback`);
  } else {
    console.error('[FAIL] Test 4: Multiple Editions & Formats Grouping ->', editionsRes);
  }

  // --------------------------------------------------------------------------
  // TEST 5: AUTHOR MASTER CREATION WITH ROYALTY TERMS & PAN
  // --------------------------------------------------------------------------
  total++;
  const authorPayload = {
    name: 'Dr. Amartya K. Sen',
    pseudonym: 'Prof. Sen',
    bio: 'Nobel Memorial Prize in Economic Sciences Laureate and Author on Welfare Economics.',
    email: 'amartya.sen@economics.harvard.edu',
    pan: 'ABCDE1234F',
    bankDetails: {
      accountName: 'Amartya Kumar Sen',
      accountNumber: '0012987654321',
      bankName: 'State Bank of India',
      ifsc: 'SBIN0000001',
      branch: 'Main Branch, Kolkata',
    },
    royaltyAgreementNumber: 'AGR-SEN-2026-001',
    royaltyType: 'PERCENTAGE_ON_MRP',
    royaltyRate: 15.0,
    paymentTerms: 'Annual',
  };

  const createAuthorRes = await simulate('POST', '/api/v1/books/authors', authorPayload, authHeader);
  if (createAuthorRes.statusCode === 201 && createAuthorRes.data?.data?.id) {
    passed++;
    console.log('[PASS] Test 5: Author Master -> Created author with PAN, bank details & 15% royalty terms (HTTP 201)');
  } else {
    console.error('[FAIL] Test 5: Author Master ->', createAuthorRes);
  }

  // --------------------------------------------------------------------------
  // TEST 6: PUBLISHER MASTER CREATION WITH GSTIN & PAYMENT TERMS
  // --------------------------------------------------------------------------
  total++;
  const publisherPayload = {
    name: 'Oxford University Academic Press India',
    code: `OUP-IND-${uniqueTimestamp.toString().slice(-4)}`,
    contactPerson: 'Director of Publications',
    email: 'editorial@oxfordpress.co.in',
    gstin: '07AAABO1234P1Z8',
    pan: 'AAABO1234P',
    address: 'YMCA Library Building, Jai Singh Road',
    city: 'New Delhi',
    state: 'Delhi',
    paymentTerms: 'Net 90',
  };

  const createPubRes = await simulate('POST', '/api/v1/books/publishers', publisherPayload, authHeader);
  if (createPubRes.statusCode === 201 && createPubRes.data?.data?.id) {
    passed++;
    console.log('[PASS] Test 6: Publisher Master -> Created publisher with State GSTIN & Net 90 terms (HTTP 201)');
  } else {
    console.error('[FAIL] Test 6: Publisher Master ->', createPubRes);
  }

  // --------------------------------------------------------------------------
  // TEST 7: AUXILIARY MASTERS & TAXONOMIES
  // --------------------------------------------------------------------------
  total++;
  const taxonomyPayload = {
    type: 'PAPER_TYPE',
    code: `PAP-80BPRINT-${uniqueTimestamp.toString().slice(-4)}`,
    name: '80 GSM Natural Shade Book Print Paper',
    description: 'High opacity, acid-free bulk book printing paper.',
    metadata: { gsm: 80, finish: 'Matte Natural' },
  };

  const createTaxRes = await simulate('POST', '/api/v1/books/taxonomies', taxonomyPayload, authHeader);
  const listTaxRes = await simulate('GET', '/api/v1/books/taxonomies?type=PAPER_TYPE', null, authHeader);

  if (createTaxRes.statusCode === 201 && listTaxRes.statusCode === 200 && listTaxRes.data?.data?.length > 0) {
    passed++;
    console.log('[PASS] Test 7: Auxiliary Taxonomy Masters -> Created and queried 80 GSM Paper Master');
  } else {
    console.error('[FAIL] Test 7: Auxiliary Taxonomy Masters ->', createTaxRes);
  }

  // --------------------------------------------------------------------------
  // TEST 8: PARTY MASTERS (DISTRIBUTOR, SCHOOL, SUPPLIER, TRANSPORTER)
  // --------------------------------------------------------------------------
  total++;
  const partyPayload = {
    partyType: 'DISTRIBUTOR',
    name: 'Eastern Regional Book Depot Pvt. Ltd.',
    code: `DIST-ER-${uniqueTimestamp.toString().slice(-4)}`,
    contactPerson: 'A. K. Banerjee',
    email: 'orders@easternbookdepot.in',
    gstin: '19AAACE4567G1Z4',
    pan: 'AAACE4567G',
    billingAddress: '14, College Street, Book Market',
    city: 'Kolkata',
    state: 'West Bengal',
    stateCode: '19',
    pincode: '700073',
    creditLimit: 1500000.0,
    creditDays: 45,
    discountRate: 38.0,
    paymentTerms: 'Net 45',
  };

  const createPartyRes = await simulate('POST', '/api/v1/books/parties', partyPayload, authHeader);
  if (createPartyRes.statusCode === 201 && createPartyRes.data?.data?.id) {
    passed++;
    console.log('[PASS] Test 8: Party Masters -> Created College Street Distributor with 38% discount slab & 45 credit days');
  } else {
    console.error('[FAIL] Test 8: Party Masters ->', createPartyRes);
  }

  // --------------------------------------------------------------------------
  // TEST 9: BULK IMPORT WITH DUPLICATE ISBN DETECTION & ERROR REPORTING
  // --------------------------------------------------------------------------
  total++;
  const bulkWithErrorsPayload = {
    items: [
      {
        title: 'Valid Book One',
        sku: `BK-BULK-VALID-01-${uniqueTimestamp}`,
        isbn13: '9788177090014',
        authorName: 'Author A',
        publisherName: 'Apex Publishers',
        mrp: 350.0,
      },
      {
        // Row 2: Duplicate ISBN-13 (existing in database from Test 1)
        title: 'Duplicate ISBN Conflict Row',
        sku: `BK-BULK-DUP-02-${uniqueTimestamp}`,
        isbn13: '9788177097718', // Already exists!
        authorName: 'Author B',
        publisherName: 'Apex Publishers',
        mrp: 400.0,
      },
      {
        // Row 3: Missing mandatory SKU and invalid negative MRP
        title: 'Invalid Book Row',
        sku: '',
        authorName: 'Author C',
        publisherName: 'Apex Publishers',
        mrp: -100.0,
      },
    ],
    duplicateHandling: 'REJECT',
  };

  const bulkErrorRes = await simulate('POST', '/api/v1/books/bulk-import', bulkWithErrorsPayload, authHeader);
  const hasErrors = bulkErrorRes.data?.data?.errors?.length >= 2;
  const hasIsbnError = bulkErrorRes.data?.data?.errors?.some((e) => e.column === 'isbn13');
  const hasSkuError = bulkErrorRes.data?.data?.errors?.some((e) => e.column === 'sku');

  if (bulkErrorRes.statusCode === 400 && hasErrors && hasIsbnError && hasSkuError) {
    passed++;
    console.log(`[PASS] Test 9: Bulk Import Duplicate Detection -> Rejected invalid batch with ${bulkErrorRes.data.data.errors.length} line-numbered error reports`);
  } else {
    console.error('[FAIL] Test 9: Bulk Import Duplicate Detection ->', bulkErrorRes);
  }

  // --------------------------------------------------------------------------
  // TEST 10: BULK IMPORT OF CLEAN CATALOGUE
  // --------------------------------------------------------------------------
  total++;
  const cleanBatchPayload = {
    items: [
      {
        title: 'Organic Chemistry Reactions & Mechanisms',
        sku: `BK-CHEM-01-${uniqueTimestamp}`,
        isbn13: `978817709${uniqueTimestamp.toString().slice(-4)}1`,
        authorName: 'Dr. O. P. Tandon',
        publisherName: 'Apex Educational Publishers & Distributors Ltd.',
        subject: 'Chemistry',
        category: 'Academic & School Textbooks',
        numberOfPages: 840,
        bindingType: 'Paperback',
        mrp: 750.0,
        wholesalePrice: 450.0,
        dealerPrice: 562.5,
        purchaseCost: 260.0,
        openingStock: 800,
      },
      {
        title: 'Inorganic Chemistry Principles & Industrial Applications',
        sku: `BK-CHEM-02-${uniqueTimestamp}`,
        isbn13: `978817709${uniqueTimestamp.toString().slice(-4)}2`,
        authorName: 'Dr. O. P. Tandon',
        publisherName: 'Apex Educational Publishers & Distributors Ltd.',
        subject: 'Chemistry',
        category: 'Academic & School Textbooks',
        numberOfPages: 920,
        bindingType: 'Paperback',
        mrp: 825.0,
        wholesalePrice: 495.0,
        dealerPrice: 618.75,
        purchaseCost: 290.0,
        openingStock: 650,
      },
    ],
    duplicateHandling: 'REJECT',
  };

  const cleanBulkRes = await simulate('POST', '/api/v1/books/bulk-import', cleanBatchPayload, authHeader);
  if (cleanBulkRes.statusCode === 200 && cleanBulkRes.data?.data?.successfulCount === 2) {
    passed++;
    console.log('[PASS] Test 10: Bulk Import Clean Execution -> Imported 2 titles successfully (HTTP 200)');
  } else {
    console.error('[FAIL] Test 10: Bulk Import Clean Execution ->', cleanBulkRes);
  }

  // --------------------------------------------------------------------------
  // TEST 11: BULK EXPORT CATALOGUE TO CSV
  // --------------------------------------------------------------------------
  total++;
  const exportRes = await simulate('GET', '/api/v1/books/export', null, authHeader);
  const isCsv = typeof exportRes.data === 'string' && exportRes.data.includes('Title,SKU,ISBN-13');

  if (exportRes.statusCode === 200 && isCsv) {
    passed++;
    console.log('[PASS] Test 11: Bulk Export Engine -> Exported complete catalogue in CSV format with standard headers');
  } else {
    console.error('[FAIL] Test 11: Bulk Export Engine ->', exportRes);
  }

  // --------------------------------------------------------------------------
  // TEST 12: SEARCH & FILTERING CAPABILITIES
  // --------------------------------------------------------------------------
  total++;
  const searchRes = await simulate('GET', '/api/v1/books?search=Physics', null, authHeader);
  const filterLangRes = await simulate('GET', '/api/v1/books?language=Hindi', null, authHeader);

  const searchPass = searchRes.statusCode === 200 && searchRes.data?.data?.some((b) => b.subject.includes('Physics') || b.title.includes('Physics'));
  const filterPass = filterLangRes.statusCode === 200 && filterLangRes.data?.data?.every((b) => b.language === 'Hindi');

  if (searchPass && filterPass) {
    passed++;
    console.log('[PASS] Test 12: Search & Filters -> Multi-criteria filtering verified for Hindi language & Physics subject');
  } else {
    console.error('[FAIL] Test 12: Search & Filters ->', { searchRes, filterLangRes });
  }

  console.log('---------------------------------------------------------------');
  console.log(`Phase 04 Test Suite Execution: ${passed} / ${total} Tests Passed!`);
  console.log('===============================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPhase04Tests();
