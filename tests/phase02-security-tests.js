const app = require('../backend/dist/app').default;

console.log('===============================================================');
console.log('   KIBO360 – PHASE 02 AUTOMATED SECURITY & AUTH TEST SUITE');
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

async function runSecurityTests() {
  let passed = 0;
  let total = 0;

  // -------------------------------------------------------------
  // Test 1: Login using Email
  // -------------------------------------------------------------
  total++;
  const loginEmail = await simulate('POST', '/api/v1/auth/login', {
    identifier: 'admin@kibo360.com',
    password: 'Admin@123',
  });
  if (loginEmail.statusCode === 200 && loginEmail.data.data?.token) {
    passed++;
    console.log('[PASS] Test 1: Login using corporate Email -> HTTP 200 & JWT generated');
  } else {
    console.log('[FAIL] Test 1: Login using Email failed', loginEmail);
  }

  // -------------------------------------------------------------
  // Test 2: Login using Username
  // -------------------------------------------------------------
  total++;
  const loginUser = await simulate('POST', '/api/v1/auth/login', {
    identifier: 'admin',
    password: 'Admin@123',
  });
  if (loginUser.statusCode === 200 && loginUser.data.data?.token) {
    passed++;
    console.log('[PASS] Test 2: Login using Username -> HTTP 200 & JWT generated');
  } else {
    console.log('[FAIL] Test 2: Login using Username failed', loginUser);
  }

  const superAdminToken = loginUser.data.data.token;
  const initialRefreshToken = loginUser.data.data.refreshToken;

  // -------------------------------------------------------------
  // Test 3: Invalid Passwords Rejected
  // -------------------------------------------------------------
  total++;
  const invalidPass = await simulate('POST', '/api/v1/auth/login', {
    identifier: 'finance@apexpublishers.com',
    password: 'WrongPassword999!',
  });
  if (invalidPass.statusCode === 401) {
    passed++;
    console.log('[PASS] Test 3: Invalid Password correctly rejected -> HTTP 401');
  } else {
    console.log('[FAIL] Test 3: Invalid password allowed', invalidPass);
  }

  // -------------------------------------------------------------
  // Test 4: Account Lockout after 5 Consecutive Failed Attempts
  // -------------------------------------------------------------
  total++;
  const targetUser = 'victim.user@apexpublishers.com';
  // Send 4 failed attempts
  for (let i = 0; i < 4; i++) {
    await simulate('POST', '/api/v1/auth/login', { identifier: targetUser, password: 'BadPassword' });
  }
  // 5th failed attempt should trigger account lockout
  const fifthAttempt = await simulate('POST', '/api/v1/auth/login', { identifier: targetUser, password: 'BadPassword' });
  if (fifthAttempt.statusCode === 423) {
    passed++;
    console.log('[PASS] Test 4: Account Lockout triggered on 5th failed attempt -> HTTP 423 (Locked)');
  } else {
    console.log('[FAIL] Test 4: Account lockout not triggered', fifthAttempt);
  }

  // -------------------------------------------------------------
  // Test 5: Refresh Token Rotation
  // -------------------------------------------------------------
  total++;
  const refreshRes = await simulate('POST', '/api/v1/auth/refresh', {
    refreshToken: initialRefreshToken,
  });
  if (refreshRes.statusCode === 200 && refreshRes.data.data?.refreshToken && refreshRes.data.data?.token) {
    const newRefreshToken = refreshRes.data.data.refreshToken;

    // Verify old refresh token is revoked
    const oldRefreshAttempt = await simulate('POST', '/api/v1/auth/refresh', {
      refreshToken: initialRefreshToken,
    });
    if (oldRefreshAttempt.statusCode === 401) {
      passed++;
      console.log('[PASS] Test 5: Refresh Token Rotation -> New tokens issued & old token revoked');
    } else {
      console.log('[FAIL] Test 5: Old refresh token was not invalidated');
    }
  } else {
    console.log('[FAIL] Test 5: Refresh token failed', refreshRes);
  }

  // -------------------------------------------------------------
  // Test 6: Unauthorized API Requests (Missing or Invalid Token)
  // -------------------------------------------------------------
  total++;
  const missingTokenRes = await simulate('GET', '/api/v1/users');
  const badTokenRes = await simulate('GET', '/api/v1/users', null, {
    authorization: 'Bearer invalid.tampered.token',
  });
  if (missingTokenRes.statusCode === 401 && badTokenRes.statusCode === 401) {
    passed++;
    console.log('[PASS] Test 6: Unauthorized requests blocked -> HTTP 401 for missing and invalid tokens');
  } else {
    console.log('[FAIL] Test 6: Unauthorized requests not blocked properly');
  }

  // -------------------------------------------------------------
  // Test 7: User Management - List & Create User
  // -------------------------------------------------------------
  total++;
  const createUserRes = await simulate(
    'POST',
    '/api/v1/users',
    {
      fullName: 'Ananya Deshmukh',
      email: 'ananya.deshmukh@apexpublishers.com',
      username: 'ananya_publishing',
      password: 'Publisher@2026',
      role: 'Publisher',
      department: 'Editorial & Imprints',
      branchId: 'brn_main_hq',
    },
    { authorization: `Bearer ${superAdminToken}` }
  );
  if (createUserRes.statusCode === 201 && createUserRes.data.data?.id) {
    passed++;
    console.log('[PASS] Test 7: User Management -> Created new user successfully (HTTP 201)');
  } else {
    console.log('[FAIL] Test 7: Create user failed', createUserRes);
  }

  // -------------------------------------------------------------
  // Test 8: User Management - Activate/Deactivate Toggle
  // -------------------------------------------------------------
  total++;
  const targetId = createUserRes.data?.data?.id || 'usr_finance_controller';
  // Deactivate
  const toggleDeactivate = await simulate(
    'POST',
    `/api/v1/users/${targetId}/toggle-active`,
    {},
    { authorization: `Bearer ${superAdminToken}` }
  );
  // Re-activate so user can perform subsequent workflow tests
  const toggleReactivate = await simulate(
    'POST',
    `/api/v1/users/${targetId}/toggle-active`,
    {},
    { authorization: `Bearer ${superAdminToken}` }
  );
  if (toggleDeactivate.statusCode === 200 && toggleReactivate.statusCode === 200) {
    passed++;
    console.log(`[PASS] Test 8: Activate/Deactivate User -> Account deactivation & reactivation verified`);
  } else {
    console.log('[FAIL] Test 8: User status toggle failed', toggleDeactivate);
  }

  // -------------------------------------------------------------
  // Test 9: Password Reset Workflow (Forgot Password -> Reset -> Login)
  // -------------------------------------------------------------
  total++;
  const forgotRes = await simulate('POST', '/api/v1/auth/forgot-password', {
    identifier: 'ananya.deshmukh@apexpublishers.com',
  });
  const resetToken = forgotRes.data?.data?.resetToken;
  if (resetToken) {
    const resetRes = await simulate('POST', '/api/v1/auth/reset-password', {
      token: resetToken,
      newPassword: 'BrandNewPassword@2027',
    });
    if (resetRes.statusCode === 200) {
      // Test login with newly set password
      const newLogin = await simulate('POST', '/api/v1/auth/login', {
        identifier: 'ananya.deshmukh@apexpublishers.com',
        password: 'BrandNewPassword@2027',
      });
      if (newLogin.statusCode === 200) {
        passed++;
        console.log('[PASS] Test 9: Password Reset Workflow -> Token issued, password updated, login verified');
      } else {
        console.log('[FAIL] Test 9: Login failed after password reset');
      }
    } else {
      console.log('[FAIL] Test 9: Password reset failed', resetRes);
    }
  } else {
    console.log('[FAIL] Test 9: Forgot password did not yield token', forgotRes);
  }

  // -------------------------------------------------------------
  // Test 10: 14 Enterprise Roles & Granular Permissions Matrix
  // -------------------------------------------------------------
  total++;
  const rolesRes = await simulate('GET', '/api/v1/roles', null, {
    authorization: `Bearer ${superAdminToken}`,
  });
  if (rolesRes.statusCode === 200 && Array.isArray(rolesRes.data.data) && rolesRes.data.data.length === 14) {
    passed++;
    console.log('[PASS] Test 10: Role Management -> 14 Configurable Enterprise Publishing Roles verified');
  } else {
    console.log('[FAIL] Test 10: Role matrix check failed', rolesRes);
  }

  // -------------------------------------------------------------
  // Test 11: Cross-Company Data Access Prevention
  // -------------------------------------------------------------
  total++;
  // Login as auditor of National Book Sellers (cmp_scholastic_distributors)
  const auditorLogin = await simulate('POST', '/api/v1/auth/login', {
    identifier: 'auditor@nationalbooks.in',
    password: 'Publisher@2026',
  });
  const auditorToken = auditorLogin.data?.data?.token;

  // Auditor from Company B attempts to list users of Company A
  const crossCompanyUsers = await simulate('GET', '/api/v1/users', null, {
    authorization: `Bearer ${auditorToken}`,
  });
  // Must only see their own company users (multi-company isolation filter)
  const otherCompanyLeaks = crossCompanyUsers.data?.data?.filter(
    (u) => u.companyId !== 'cmp_scholastic_distributors'
  );
  if (crossCompanyUsers.statusCode === 200 && (!otherCompanyLeaks || otherCompanyLeaks.length === 0)) {
    passed++;
    console.log('[PASS] Test 11: Cross-Company Data Access Prevention -> Tenant isolation verified (0 leaks)');
  } else {
    console.log('[FAIL] Test 11: Cross-company data leak detected', otherCompanyLeaks);
  }

  // -------------------------------------------------------------
  // Test 12: Session Revocation / Logout All Devices
  // -------------------------------------------------------------
  total++;
  const logoutAllRes = await simulate('POST', '/api/v1/auth/logout-all', {}, {
    authorization: `Bearer ${superAdminToken}`,
  });
  if (logoutAllRes.statusCode === 200) {
    passed++;
    console.log('[PASS] Test 12: Session Revocation -> All active user sessions revoked successfully');
  } else {
    console.log('[FAIL] Test 12: Logout all failed', logoutAllRes);
  }

  console.log('---------------------------------------------------------------');
  console.log(`Security Test Suite Execution: ${passed} / ${total} Tests Passed!`);
  console.log('===============================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runSecurityTests();
