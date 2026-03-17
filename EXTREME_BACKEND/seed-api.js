const http = require('http');

const staffData = [
    { name: 'Michael Chen', email: 'michael.chen@staff.com', phone: '+1 555-101-0001', password: 'Staff@123', role: 'STAFF' },
    { name: 'Sarah Johnson', email: 'sarah.johnson@staff.com', phone: '+1 555-101-0002', password: 'Staff@123', role: 'STAFF' },
    { name: 'David Martinez', email: 'david.martinez@staff.com', phone: '+1 555-101-0003', password: 'Staff@123', role: 'STAFF' },
    { name: 'Emma Davis', email: 'emma.davis@staff.com', phone: '+1 555-101-0004', password: 'Staff@123', role: 'STAFF' },
    { name: 'James Wilson', email: 'james.wilson@staff.com', phone: '+1 555-101-0005', password: 'Staff@123', role: 'STAFF' },
    { name: 'Lisa Anderson', email: 'lisa.anderson@staff.com', phone: '+1 555-101-0006', password: 'Staff@123', role: 'STAFF' },
    { name: 'Robert Taylor', email: 'robert.taylor@staff.com', phone: '+1 555-101-0007', password: 'Staff@123', role: 'STAFF' },
    { name: 'Jennifer Lee', email: 'jennifer.lee@staff.com', phone: '+1 555-101-0008', password: 'Staff@123', role: 'STAFF' },
    { name: 'Christopher Brown', email: 'christopher.brown@staff.com', phone: '+1 555-101-0009', password: 'Staff@123', role: 'STAFF' },
    { name: 'Amanda White', email: 'amanda.white@staff.com', phone: '+1 555-101-0010', password: 'Staff@123', role: 'STAFF' },
    { name: 'Daniel Garcia', email: 'daniel.garcia@staff.com', phone: '+1 555-101-0011', password: 'Staff@123', role: 'STAFF' },
    { name: 'Olivia Martinez', email: 'olivia.martinez@staff.com', phone: '+1 555-101-0012', password: 'Staff@123', role: 'STAFF' },
    { name: 'William Thomas', email: 'william.thomas@staff.com', phone: '+1 555-101-0013', password: 'Staff@123', role: 'STAFF' },
    { name: 'Sophia Clark', email: 'sophia.clark@staff.com', phone: '+1 555-101-0014', password: 'Staff@123', role: 'STAFF' },
    { name: 'Ethan Robinson', email: 'ethan.robinson@staff.com', phone: '+1 555-101-0015', password: 'Staff@123', role: 'STAFF' },
];

const clientData = [
    { name: 'TechCorp Industries', email: 'events@techcorp.com', phone: '+1 555-200-0001', password: 'Client@123', role: 'CLIENT' },
    { name: 'Riverside Events LLC', email: 'booking@riversideevents.com', phone: '+1 555-200-0002', password: 'Client@123', role: 'CLIENT' },
];

function registerUser(user) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(user);
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
            },
        };

        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => { responseBody += chunk; });
            res.on('end', () => {
                if (res.statusCode === 201) {
                    console.log(`✅ Success: ${user.name} (${user.email})`);
                    resolve();
                } else if (res.statusCode === 409) {
                    console.log(`⏭ Skipped: ${user.name} (Email already exists)`);
                    resolve();
                } else {
                    console.error(`❌ Failed: ${user.name} - Status ${res.statusCode} - ${responseBody}`);
                    resolve();
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

async function runSeed() {
    console.log('Seeding 15 staff members...');
    for (const staff of staffData) {
        await registerUser(staff);
    }

    console.log('\nSeeding 2 clients...');
    for (const client of clientData) {
        await registerUser(client);
    }

    console.log('\n🎉 Seeding via API complete!');
}

runSeed().catch(err => console.error('Seed Error:', err));
