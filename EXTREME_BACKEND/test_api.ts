import prisma from './src/config/database';
import { getPricingConfig, updatePricingConfig } from './src/controllers/pricing.controller';

async function test() {
  console.log("Testing pricing config API locally...");

  // Mock res/req to test controller directly
  const req: any = {};
  const res: any = {
    json: (data: any) => console.log("Response:", JSON.stringify(data, null, 2)),
    status: (code: number) => {
      console.log("Status:", code);
      return { json: (data: any) => console.log("Error:", data) };
    }
  };

  console.log("--- GET ---");
  await getPricingConfig(req, res);

  console.log("--- End test ---");
}

test().catch(console.error).finally(() => prisma.$disconnect());
