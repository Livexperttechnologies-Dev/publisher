const app = require('../backend/dist/app').default;

console.log('===============================================================');
console.log('   KIBO360 – IN-MEMORY API INTEGRATION & HEALTH TEST');
console.log('===============================================================');

// Mock request / response simulator
function simulateRequest(method, url, body = null, headers = {}) {
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

async function runTests() {
  let passed = 0;
  let total = 0;

  // Test 1: Health
  total++;
  const healthRes = await simulateRequest('GET', '/api/v1/health');
  if (healthRes.statusCode === 200 && healthRes.data.data.status === 'ONLINE') {
    passed++;
    console.log('[PASS] Endpoint: GET /api/v1/health -> HTTP 200 ONLINE');
  } else {
    console.log('[FAIL] Endpoint: GET /api/v1/health ->', healthRes);
  }

  // Test 2: Auth Login
  total++;
  const loginRes = await simulateRequest('POST', '/api/v1/auth/login', {
    identifier: 'admin@kibo360.com',
    password: 'Admin@123',
  });
  if (loginRes.statusCode === 200 && loginRes.data.data?.token) {
    passed++;
    console.log('[PASS] Endpoint: POST /api/v1/auth/login -> HTTP 200 JWT Generated');
  } else {
    console.log('[FAIL] Endpoint: POST /api/v1/auth/login ->', loginRes);
  }

  // Test 3: Accounting Module Security Barrier
  total++;
  const accountsRes = await simulateRequest('GET', '/api/v1/accounting');
  if (accountsRes.statusCode === 401) {
    passed++;
    console.log('[PASS] Endpoint: GET /api/v1/accounting -> HTTP 401 Protected By JWT Guard');
  } else {
    console.log('[FAIL] Endpoint: GET /api/v1/accounting -> Expected 401, got', accountsRes.statusCode);
  }

  // Test 4: Books Module Security Barrier
  total++;
  const booksRes = await simulateRequest('GET', '/api/v1/books');
  if (booksRes.statusCode === 401) {
    passed++;
    console.log('[PASS] Endpoint: GET /api/v1/books -> HTTP 401 Protected By JWT Guard');
  } else {
    console.log('[FAIL] Endpoint: GET /api/v1/books -> Expected 401, got', booksRes.statusCode);
  }

  // Test 5: Root API Status
  total++;
  const rootRes = await simulateRequest('GET', '/');
  if (rootRes.statusCode === 200 && rootRes.data.status === 'ONLINE') {
    passed++;
    console.log('[PASS] Endpoint: GET / -> HTTP 200 Online Root');
  } else {
    console.log('[FAIL] Endpoint: GET / ->', rootRes);
  }

  console.log('---------------------------------------------------------------');
  console.log(`Phase 01 API Verification: ${passed} / ${total} Checks Passed!`);
  console.log('===============================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
