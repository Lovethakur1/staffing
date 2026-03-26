require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

p.user.findUnique({ where: { email: 'admin@extremestaffing.com' }, select: { password: true } })
  .then(async user => {
    console.log('Hash:', user.password);
    const valid = await bcrypt.compare('password', user.password);
    console.log('Password "password" valid:', valid);
  })
  .catch(console.error)
  .finally(() => p.$disconnect());
