import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const events = await prisma.event.findMany({ include: { shifts: true } });
  console.log(JSON.stringify(events, null, 2));
}
run().catch(console.error).finally(() => prisma.$disconnect());
