/**
 * Seed a shift for today assigned to a demo staff user.
 * Run: node seed-shift-today.js
 *
 * Steps:
 * 1. Login as admin to get a token
 * 2. Fetch all staff to get a staff user ID
 * 3. Fetch all events (or create one if none)
 * 4. Create a shift for today with status CONFIRMED
 */

const http = require('http');

const BASE = { hostname: 'localhost', port: 5000 };

function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const opts = {
            ...BASE,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
            },
        };
        const req = http.request(opts, (res) => {
            let buf = '';
            res.on('data', (c) => (buf += c));
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(buf) }); }
                catch { resolve({ status: res.statusCode, body: buf }); }
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function run() {
    // 1. Login as admin
    console.log('🔐 Logging in as admin...');
    const loginRes = await request('POST', '/api/auth/login', {
        email: 'admin@extremestaffing.com',
        password: 'password',
    });
    if (loginRes.status !== 200) {
        console.error('❌ Admin login failed:', loginRes.body);
        process.exit(1);
    }
    const token = loginRes.body.token;
    console.log('✅ Admin logged in');

    // 2. Get staff users
    console.log('\n👥 Fetching staff...');
    const staffRes = await request('GET', '/api/users?role=STAFF&limit=5', null, token);
    const staffList = staffRes.body?.data || staffRes.body;
    const staffArr = Array.isArray(staffList) ? staffList : [];
    if (staffArr.length === 0) {
        console.error('❌ No staff users found. Run seed-api.js first.');
        process.exit(1);
    }
    const staffUser = staffArr[0];
    console.log(`✅ Using staff: ${staffUser.name} (${staffUser.id})`);

    // 3. Get or create an event
    console.log('\n📅 Fetching events...');
    const eventsRes = await request('GET', '/api/events?limit=5', null, token);
    const eventsData = eventsRes.body?.data || eventsRes.body;
    const eventsArr = Array.isArray(eventsData) ? eventsData : [];

    let eventId;
    if (eventsArr.length > 0) {
        eventId = eventsArr[0].id;
        console.log(`✅ Using event: ${eventsArr[0].title} (${eventId})`);
    } else {
        console.log('⚠️  No events found. Creating one...');
        // Need a client first
        const clientsRes = await request('GET', '/api/clients?limit=1', null, token);
        const clientsData = clientsRes.body?.data || clientsRes.body;
        const clientsArr = Array.isArray(clientsData) ? clientsData : [];
        if (clientsArr.length === 0) {
            console.error('❌ No clients found. Run seed-api.js first and wait for clients to be created.');
            process.exit(1);
        }
        const clientId = clientsArr[0].id;
        const today = new Date().toISOString().split('T')[0];
        const createEventRes = await request('POST', '/api/events', {
            title: 'Demo Event Today',
            venue: 'Grand Hall',
            location: '123 Main Street, Downtown',
            date: today,
            startTime: '09:00',
            endTime: '17:00',
            clientId,
            staffRequired: 3,
            status: 'UPCOMING',
        }, token);
        if (createEventRes.status !== 201) {
            console.error('❌ Failed to create event:', createEventRes.body);
            process.exit(1);
        }
        eventId = createEventRes.body.id;
        console.log(`✅ Created event: ${eventId}`);
    }

    // 4. Create shift for today
    const today = new Date().toISOString().split('T')[0];
    console.log(`\n🕐 Creating shift for ${today}...`);
    const shiftRes = await request('POST', '/api/shifts', {
        eventId,
        staffId: staffUser.id,
        date: today,
        startTime: '09:00',
        endTime: '17:00',
        role: 'Event Staff',
        hourlyRate: 25,
        status: 'CONFIRMED',
    }, token);

    if (shiftRes.status === 201 || shiftRes.status === 200) {
        console.log(`✅ Shift created! ID: ${shiftRes.body.id}`);
        console.log(`\n🎉 Done! Staff "${staffUser.name}" has a CONFIRMED shift for today.`);
        console.log(`   Login as: ${staffUser.email} / Staff@123`);
        console.log(`   Then click "Clock In" in the top nav.`);
    } else {
        console.error('❌ Failed to create shift:', JSON.stringify(shiftRes.body, null, 2));
    }
}

run().catch((err) => console.error('Error:', err));
