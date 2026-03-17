require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Set to midnight UTC today (works regardless of server timezone)
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    console.log('Setting shift dates to:', todayUTC.toISOString());

    const result = await prisma.shift.updateMany({
        where: { status: { in: ['CONFIRMED', 'PENDING'] } },
        data: { date: todayUTC }
    });
    console.log('Updated', result.count, 'shifts to today');
}

main()
    .then(() => prisma.$disconnect())
    .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
