import { Request, Response } from 'express';
import prisma from '../config/database';

export const getPricingConfig = async (req: Request, res: Response) => {
  try {
    let config = await prisma.pricingConfig.findFirst({
      include: {
        tierRates: true,
        multiplierRules: true,
        travelFeeRules: true,
      },
    });

    if (!config) {
      // Create default if none exists
      config = await prisma.pricingConfig.create({
        data: {
          platformFeePercentage: 15,
          minimumHours: 5,
          tierRates: {
            create: [
              { role: "Bartender", junior: 32, standard: 41, premium: 53, elite: 68 },
              { role: "Server", junior: 28, standard: 35, premium: 45, elite: 58 },
              { role: "Event Coordinator", junior: 38, standard: 48, premium: 62, elite: 80 },
              { role: "Manager", junior: 45, standard: 58, premium: 75, elite: 95 },
              { role: "Security", junior: 35, standard: 45, premium: 58, elite: 75 },
              { role: "Valet", junior: 25, standard: 32, premium: 41, elite: 53 }
            ]
          },
          multiplierRules: {
            create: [
              {
                name: "Weekend Premium",
                type: "weekend",
                percentage: 20,
                enabled: true,
                description: "Applied to Friday, Saturday, and Sunday events"
              },
              {
                name: "Holiday Premium",
                type: "holiday",
                percentage: 30,
                enabled: true,
                description: "Applied to major holidays (New Year's, Christmas, etc.)"
              },
              {
                name: "Rush Booking Fee",
                type: "rush",
                percentage: 25,
                enabled: true,
                description: "Applied when event is booked less than 7 days in advance"
              }
            ]
          },
          travelFeeRules: {
            create: [
              { minMiles: 0, maxMiles: 10, fee: 0 },
              { minMiles: 11, maxMiles: 25, fee: 75 },
              { minMiles: 26, maxMiles: 50, fee: 150 },
              { minMiles: 51, maxMiles: 999, fee: 250 }
            ]
          }
        },
        include: {
          tierRates: true,
          multiplierRules: true,
          travelFeeRules: true,
        }
      });
    }

    res.json(config);
  } catch (error) {
    console.error('Error fetching pricing config:', error);
    res.status(500).json({ error: 'Failed to fetch pricing config' });
  }
};

export const updatePricingConfig = async (req: Request, res: Response) => {
  try {
    const { id, platformFeePercentage, minimumHours, tierRates, multiplierRules, travelFeeRules } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Config ID is required' });
    }

    // Use a transaction to safely update everything
    const updatedConfig = await prisma.$transaction(async (tx: any) => {
      // Update basic fields
      await tx.pricingConfig.update({
        where: { id },
        data: {
          platformFeePercentage,
          minimumHours,
        },
      });

      // Update nested models: tierRates
      if (tierRates && Array.isArray(tierRates)) {
        await tx.tierRate.deleteMany({ where: { pricingConfigId: id } });
        await tx.tierRate.createMany({
          data: tierRates.map((tr: any) => ({
            pricingConfigId: id,
            role: tr.role,
            junior: tr.junior,
            standard: tr.standard,
            premium: tr.premium,
            elite: tr.elite,
          })),
        });
      }

      // Update nested models: multiplierRules
      if (multiplierRules && Array.isArray(multiplierRules)) {
        await tx.multiplierRule.deleteMany({ where: { pricingConfigId: id } });
        await tx.multiplierRule.createMany({
          data: multiplierRules.map((mr: any) => ({
            pricingConfigId: id,
            name: mr.name,
            type: mr.type,
            percentage: mr.percentage,
            enabled: mr.enabled,
            description: mr.description,
          })),
        });
      }

      // Update nested models: travelFeeRules
      if (travelFeeRules && Array.isArray(travelFeeRules)) {
        await tx.travelFeeRule.deleteMany({ where: { pricingConfigId: id } });
        await tx.travelFeeRule.createMany({
          data: travelFeeRules.map((tf: any) => ({
            pricingConfigId: id,
            minMiles: tf.minMiles,
            maxMiles: tf.maxMiles,
            fee: tf.fee,
          })),
        });
      }

      return tx.pricingConfig.findUnique({
        where: { id },
        include: {
          tierRates: true,
          multiplierRules: true,
          travelFeeRules: true,
        },
      });
    });

    res.json(updatedConfig);
  } catch (error) {
    console.error('Error updating pricing config:', error);
    res.status(500).json({ error: 'Failed to update pricing config' });
  }
};
