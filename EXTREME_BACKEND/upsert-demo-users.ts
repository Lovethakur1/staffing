import 'dotenv/config';
import prisma from './src/config/database';
import bcrypt from 'bcryptjs';

async function upsertDemoUsers() {
    console.log('Upserting demo users...');
    const password = await bcrypt.hash('password', 12);

    await prisma.user.upsert({
        where: { email: 'admin@extremestaffing.com' },
        update: { password, role: 'ADMIN' },
        create: { name: 'System Admin', email: 'admin@extremestaffing.com', password, role: 'ADMIN' },
    });

    await prisma.user.upsert({
        where: { email: 'manager@extremestaffing.com' },
        update: { password, role: 'MANAGER' },
        create: { name: 'Operations Manager', email: 'manager@extremestaffing.com', password, role: 'MANAGER' },
    });

    await prisma.user.upsert({
        where: { email: 'staff@extremestaffing.com' },
        update: { password, role: 'STAFF' },
        create: {
            name: 'John Staff', email: 'staff@extremestaffing.com', password, role: 'STAFF',
            staffProfile: { create: { skills: ['Bartender'], hourlyRate: 25.0 } }
        },
    });

    await prisma.user.upsert({
        where: { email: 'scheduler@extremestaffing.com' },
        update: { password, role: 'SCHEDULER' },
        create: { name: 'Shift Scheduler', email: 'scheduler@extremestaffing.com', password, role: 'SCHEDULER' },
    });

    await prisma.user.upsert({
        where: { email: 'client@company.com' },
        update: { password, role: 'CLIENT' },
        create: {
            name: 'Corporate Client', email: 'client@company.com', password, role: 'CLIENT',
            clientProfile: { create: { company: 'Acme Corp', type: 'corporate' } }
        },
    });

    console.log('Demo users upserted successfully!');
}

upsertDemoUsers().catch(console.error).finally(() => prisma.$disconnect());
