const http = require('http');

async function testApi() {
  console.log('=== STARTING ROLE-BASED MINI ERP + CRM TEST SUITE ===');

  const users = [
    { username: 'admin', role: 'ADMIN' },
    { username: 'sales_user', role: 'SALES' },
    { username: 'warehouse_user', role: 'WAREHOUSE' },
    { username: 'accounts_user', role: 'ACCOUNTS' },
  ];

  const tokens = {};

  // 1. Test Login & Safe User Response for all 4 Roles
  console.log('\n--- 1. Testing Login & Password Non-Exposure for All 4 Roles ---');
  for (const u of users) {
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      username: u.username,
      password: 'password123',
    });

    if (loginRes.success && loginRes.data && loginRes.data.token) {
      console.log(` Login [${u.role}]: PASSED (User: ${loginRes.data.user.username}, Role: ${loginRes.data.user.role})`);
      tokens[u.role] = loginRes.data.token;
      if (loginRes.data.user.password_hash !== undefined) {
        console.error(`Security Warning: Password hash exposed for ${u.username}`);
      }
    } else {
      console.error(` Login [${u.role}]: FAILED`, loginRes.message);
    }
  }

  // 2. Test Dynamic Role Dashboard Endpoints (/api/dashboard)
  console.log('\n--- 2. Testing Role Dashboard Data Aggregation (/api/dashboard) ---');
  for (const u of users) {
    const dashRes = await makeRequest('GET', '/api/dashboard', null, tokens[u.role]);
    if (dashRes.success && dashRes.data && dashRes.data.role === u.role) {
      console.log(` Dashboard GET /api/dashboard [${u.role}]: PASSED (Role returned: ${dashRes.data.role})`);
      console.log(`   Metrics keys:`, Object.keys(dashRes.data.metrics || {}).join(', '));
    } else {
      console.error(` Dashboard GET /api/dashboard [${u.role}]: FAILED`, dashRes.message);
    }
  }

  // 3. Test Backend Security Authorization (Role-based access limits)
  console.log('\n--- 3. Testing Backend Role-Based Authorization Enforcement ---');

  // WAREHOUSE should NOT access /api/customers (403 expected)
  const whCustomers = await makeRequest('GET', '/api/customers', null, tokens['WAREHOUSE']);
  console.log(
    `WAREHOUSE GET /api/customers:`,
    !whCustomers.success ? 'REJECTED AS EXPECTED (403) ' : 'FAILED (Allowed unexpectedly) '
  );

  // ACCOUNTS should NOT access /api/products (403 expected)
  const accProducts = await makeRequest('GET', '/api/products', null, tokens['ACCOUNTS']);
  console.log(
    `ACCOUNTS GET /api/products:`,
    !accProducts.success ? 'REJECTED AS EXPECTED (403) ' : 'FAILED (Allowed unexpectedly) '
  );

  // SALES should NOT access /api/stock/movements (403 expected)
  const salesMovements = await makeRequest('GET', '/api/stock/movements', null, tokens['SALES']);
  console.log(
    `SALES GET /api/stock/movements:`,
    !salesMovements.success ? 'REJECTED AS EXPECTED (403) ' : 'FAILED (Allowed unexpectedly) '
  );

  // ADMIN should have full access to all endpoints
  const adminCustomers = await makeRequest('GET', '/api/customers', null, tokens['ADMIN']);
  const adminProducts = await makeRequest('GET', '/api/products', null, tokens['ADMIN']);
  const adminMovements = await makeRequest('GET', '/api/stock/movements', null, tokens['ADMIN']);
  console.log(
    `ADMIN Full Access Check:`,
    adminCustomers.success && adminProducts.success && adminMovements.success
      ? 'ALL PASSED '
      : 'FAILED '
  );

  console.log('\n=== ROLE-BASED TEST SUITE COMPLETED SUCCESSFULLY ===');
}

function makeRequest(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : '';
    const options = {
      hostname: 'localhost',
      port: 5001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ success: false, message: body });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

testApi().catch(console.error);
