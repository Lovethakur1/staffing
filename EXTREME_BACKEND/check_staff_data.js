const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

(async () => {
  // Get all staff users
  const users = await p.user.findMany({
    where: { role: 'STAFF' },
    select: { id: true, name: true, email: true },
    take: 10,
  });
  console.log('=== STAFF USERS ===');
  console.log(JSON.stringify(users, null, 2));

  // Get shifts for each staff
  for (const user of users) {
    const shifts = await p.shift.findMany({
      where: { staffId: user.id },
      select: { id: true, date: true, startTime: true, endTime: true, status: true, event: { select: { title: true, venue: true } } },
      orderBy: { date: 'desc' },
      take: 5,
    });
    console.log(`\n=== SHIFTS for ${user.name} (${user.id}) ===`);
    console.log(JSON.stringify(shifts, null, 2));
  }

  // Get staff profiles
  const profiles = await p.staffProfile.findMany({
    select: { id: true, userId: true, rating: true, totalEvents: true, skills: true, hourlyRate: true, availabilityStatus: true },
    take: 10,
  });
  console.log('\n=== STAFF PROFILES ===');
  console.log(JSON.stringify(profiles, null, 2));

  // Get all events
  const events = await p.event.findMany({
    select: { id: true, title: true, date: true, venue: true, status: true, staffRequired: true },
    orderBy: { date: 'desc' },
    take: 10,
  });
  console.log('\n=== EVENTS ===');
  console.log(JSON.stringify(events, null, 2));

  // Count total shifts and their staffId
  const allShifts = await p.shift.findMany({
    select: { id: true, staffId: true, date: true, status: true, event: { select: { title: true } } },
    orderBy: { date: 'desc' },
  });
  console.log('\n=== ALL SHIFTS (' + allShifts.length + ') ===');
  console.log(JSON.stringify(allShifts, null, 2));

  await p.$disconnect();
})();
