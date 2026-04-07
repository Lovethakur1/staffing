const http = require('http');

function req(method, path, token, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost', port: 5000,
      path: '/api' + path, method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    const r = http.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

(async () => {
  // Login as staff
  const login = await req('POST', '/auth/login', null, {
    email: 'marcus.johnson@extremestaffing.com', password: 'password'
  });
  if (login.status !== 200) {
    console.log('Login failed:', login);
    return;
  }
  const token = login.data.token;
  const userId = login.data.user.id;
  console.log('Logged in as:', login.data.user.name, '(' + userId + ')');

  // Test payroll
  const payroll = await req('GET', '/staff/me/payroll', token);
  console.log('\n=== /staff/me/payroll ===');
  console.log('Status:', payroll.status, '| Items:', payroll.data?.data?.length || 0);

  // Test reviews  
  const reviews = await req('GET', '/reviews/staff/' + userId, token);
  console.log('\n=== /reviews/staff/' + userId + ' ===');
  console.log('Status:', reviews.status, '| Items:', Array.isArray(reviews.data) ? reviews.data.length : 0);

  // Test certifications
  const certs = await req('GET', '/staff/' + userId + '/certifications', token);
  console.log('\n=== /staff/' + userId + '/certifications ===');
  console.log('Status:', certs.status, '| Items:', Array.isArray(certs.data) ? certs.data.length : 0);

  // Test timesheets
  const timesheets = await req('GET', '/finance/timesheets', token);
  console.log('\n=== /finance/timesheets ===');
  console.log('Status:', timesheets.status, '| Items:', timesheets.data?.data?.length || 0);

  // Test documents
  const docs = await req('GET', '/staff/' + userId + '/documents', token);
  console.log('\n=== /staff/' + userId + '/documents ===');
  console.log('Status:', docs.status, '| Items:', Array.isArray(docs.data) ? docs.data.length : (docs.data?.data?.length || 0));

  // Test dashboard
  const dash = await req('GET', '/staff/me/dashboard', token);
  console.log('\n=== /staff/me/dashboard ===');
  console.log('Status:', dash.status);
  if (dash.status === 200) {
    const d = dash.data;
    console.log('Stats:', JSON.stringify(d.stats));
    console.log('Shifts today:', d.shifts?.today?.length, '| upcoming:', d.shifts?.upcoming?.length, '| pending:', d.shifts?.pending?.length);
    console.log('Payroll items:', d.payroll?.length);
    console.log('Documents:', d.documents?.length);
    console.log('Certifications:', d.certifications?.length);
  }
})();
