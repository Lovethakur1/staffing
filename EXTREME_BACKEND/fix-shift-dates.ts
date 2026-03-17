import 'dotenv/config';
import prisma from './src/config/database';

async function main() {
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    console.log('Setting all CONFIRMED/PENDING shifts to:', todayUTC.toISOString());

    const result = await prisma.shift.updateMany({
        where: { status: { in: ['CONFIRMED', 'PENDING'] } },
        data: { date: todayUTC },
    });

    console.log(`✅ Updated ${result.count} shifts to today (${todayUTC.toISOString()})`);
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e.message);
        prisma.$disconnect();
        process.exit(1);
    });
