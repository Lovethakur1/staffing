const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany();
  console.log('Total events:', events.length);
  events.forEach(e => {
    console.log(`Event ${e.id}: ${e.title} - Status: ${e.status} - Date: ${e.date}`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
