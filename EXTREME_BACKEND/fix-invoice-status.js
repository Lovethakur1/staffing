// Quick fix: update all DRAFT invoices to SENT
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const invoices = await prisma.invoice.findMany({
    select: { id: true, invoiceNumber: true, status: true, amount: true }
  });
  console.log('Current invoices:', JSON.stringify(invoices, null, 2));
  
  const updated = await prisma.invoice.updateMany({
    where: { status: 'DRAFT' },
    data: { status: 'SENT' }
  });
  console.log(`Updated ${updated.count} DRAFT invoices to SENT`);
  
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
