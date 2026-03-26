import * as dotenv from 'dotenv';
dotenv.config();
import prisma from './src/config/database';

async function fetchClients() {
    const clients = await prisma.clientProfile.findMany({
        take: 5,
        include: {
            user: true
        }
    });

    console.log(JSON.stringify(clients, null, 2));
}

fetchClients().catch(console.error).finally(() => prisma.$disconnect());
