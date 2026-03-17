const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('Staff@123', 12);
    const clientPassword = await bcrypt.hash('Client@123', 12);

    // 15 Staff Members
    const staffData = [
        { name: 'Michael Chen', email: 'michael.chen@staff.com', phone: '+1 555-101-0001', skills: ['Bartending', 'Mixology'], hourlyRate: 28, rating: 4.8 },
        { name: 'Sarah Johnson', email: 'sarah.johnson@staff.com', phone: '+1 555-101-0002', skills: ['Event Server', 'Fine Dining'], hourlyRate: 25, rating: 4.9 },
        { name: 'David Martinez', email: 'david.martinez@staff.com', phone: '+1 555-101-0003', skills: ['Setup Crew', 'AV Equipment'], hourlyRate: 22, rating: 4.5 },
        { name: 'Emma Davis', email: 'emma.davis@staff.com', phone: '+1 555-101-0004', skills: ['Event Coordinator', 'Planning'], hourlyRate: 35, rating: 4.7 },
        { name: 'James Wilson', email: 'james.wilson@staff.com', phone: '+1 555-101-0005', skills: ['Security', 'Crowd Management'], hourlyRate: 30, rating: 4.6 },
        { name: 'Lisa Anderson', email: 'lisa.anderson@staff.com', phone: '+1 555-101-0006', skills: ['Event Server', 'Catering'], hourlyRate: 24, rating: 4.4 },
        { name: 'Robert Taylor', email: 'robert.taylor@staff.com', phone: '+1 555-101-0007', skills: ['Security', 'First Aid'], hourlyRate: 32, rating: 4.8 },
        { name: 'Jennifer Lee', email: 'jennifer.lee@staff.com', phone: '+1 555-101-0008', skills: ['Bartending', 'Wine Service'], hourlyRate: 27, rating: 4.7 },
        { name: 'Christopher Brown', email: 'christopher.brown@staff.com', phone: '+1 555-101-0009', skills: ['Event Server', 'Hospitality'], hourlyRate: 23, rating: 4.3 },
        { name: 'Amanda White', email: 'amanda.white@staff.com', phone: '+1 555-101-0010', skills: ['Event Server', 'Customer Service'], hourlyRate: 24, rating: 4.5 },
        { name: 'Daniel Garcia', email: 'daniel.garcia@staff.com', phone: '+1 555-101-0011', skills: ['Setup Crew', 'Lighting'], hourlyRate: 22, rating: 4.2 },
        { name: 'Olivia Martinez', email: 'olivia.martinez@staff.com', phone: '+1 555-101-0012', skills: ['Event Server', 'Table Setting'], hourlyRate: 23, rating: 4.6 },
        { name: 'William Thomas', email: 'william.thomas@staff.com', phone: '+1 555-101-0013', skills: ['Bartending', 'Cocktails'], hourlyRate: 26, rating: 4.4 },
        { name: 'Sophia Clark', email: 'sophia.clark@staff.com', phone: '+1 555-101-0014', skills: ['Event Coordinator', 'Decorations'], hourlyRate: 30, rating: 4.9 },
        { name: 'Ethan Robinson', email: 'ethan.robinson@staff.com', phone: '+1 555-101-0015', skills: ['Setup Crew', 'Heavy Lifting', 'AV Equipment'], hourlyRate: 25, rating: 4.3 },
    ];

    console.log('Creating 15 staff members...');
    for (const s of staffData) {
        const existing = await prisma.user.findUnique({ where: { email: s.email } });
        if (existing) {
            console.log(`  ⏭ ${s.name} already exists, skipping`);
            continue;
        }
        const user = await prisma.user.create({
            data: {
                name: s.name,
                email: s.email,
                phone: s.phone,
                password,
                role: 'STAFF',
                isActive: true,
                staffProfile: {
                    create: {
                        skills: s.skills,
                        hourlyRate: s.hourlyRate,
                        rating: s.rating,
                        totalEvents: Math.floor(Math.random() * 30) + 5,
                        availabilityStatus: 'available',
                        isActive: true,
                    },
                },
            },
        });
        console.log(`  ✅ Created staff: ${user.name} (${user.email})`);
    }

    // 2 Clients
    const clientData = [
        { name: 'TechCorp Industries', email: 'events@techcorp.com', phone: '+1 555-200-0001', company: 'TechCorp Industries', type: 'corporate' },
        { name: 'Riverside Events LLC', email: 'booking@riversideevents.com', phone: '+1 555-200-0002', company: 'Riverside Events LLC', type: 'corporate' },
    ];

    console.log('\nCreating 2 clients...');
    for (const c of clientData) {
        const existing = await prisma.user.findUnique({ where: { email: c.email } });
        if (existing) {
            console.log(`  ⏭ ${c.name} already exists, skipping`);
            continue;
        }
        const user = await prisma.user.create({
            data: {
                name: c.name,
                email: c.email,
                phone: c.phone,
                password: clientPassword,
                role: 'CLIENT',
                isActive: true,
                clientProfile: {
                    create: {
                        company: c.company,
                        type: c.type,
                        totalEvents: 0,
                        totalSpent: 0,
                        rating: 0,
                        isActive: true,
                    },
                },
            },
        });
        console.log(`  ✅ Created client: ${user.name} (${user.email})`);
    }

    console.log('\n🎉 Seeding complete! 15 staff + 2 clients added.');
    console.log('Staff login: any staff email / Staff@123');
    console.log('Client login: events@techcorp.com or booking@riversideevents.com / Client@123');
}

main()
    .catch((e) => {
        console.error('Seeding error:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
