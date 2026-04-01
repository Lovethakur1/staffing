require('dotenv').config();
const { Pool } = require('pg');
const p = new Pool({ connectionString: process.env.DATABASE_URL });
p.query('SELECT id, status, "paymentProofUrl", "paymentMethod", "paymentProofDate" FROM "Invoice"')
  .then(r => { console.log(JSON.stringify(r.rows, null, 2)); p.end(); })
  .catch(e => { console.error(e); p.end(); });
