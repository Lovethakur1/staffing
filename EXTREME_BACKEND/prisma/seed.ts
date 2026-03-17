import 'dotenv/config';
import prisma from '../src/config/database';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('Seeding database...');

    // Clean up existing data for safe re-run
    await prisma.user.deleteMany({});

    const password = await bcrypt.hash('password', 12);

    // 1. Admin User
    const admin = await prisma.user.create({
        data: {
            name: 'System Admin',
            email: 'admin@extremestaffing.com',
            password,
            role: 'ADMIN',
        },
    });

    // 2. Manager User
    const manager = await prisma.user.create({
        data: {
            name: 'Operations Manager',
            email: 'manager@extremestaffing.com',
            password,
            role: 'MANAGER',
        },
    });

    // 3. Client User
    const client = await prisma.user.create({
        data: {
            name: 'Corporate Client',
            email: 'client@company.com',
            password,
            role: 'CLIENT',
            clientProfile: {
                create: {
                    company: 'Acme Corp',
                    type: 'corporate'
                }
            }
        },
    });

    // 4. Staff User
    const staff = await prisma.user.create({
        data: {
            name: 'John Staff',
            email: 'staff@extremestaffing.com',
            password,
            role: 'STAFF',
            staffProfile: {
                create: {
                    skills: ['Bartender', 'Security'],
                    hourlyRate: 25.0,
                }
            }
        },
    });

    // 5. Scheduler User
    const scheduler = await prisma.user.create({
        data: {
            name: 'Shift Scheduler',
            email: 'scheduler@extremestaffing.com',
            password,
            role: 'SCHEDULER',
        },
    });

    console.log('Seed completed successfully!');
    console.log({ admin, manager, client, staff, scheduler });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
