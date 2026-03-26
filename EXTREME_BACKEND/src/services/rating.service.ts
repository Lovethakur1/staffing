import prisma from '../config/database';

/**
 * Calculates and updates the dynamic rating for a staff member.
 * Formula: Max 5 Points
 * - Client Review Component: Max 3 Points (Average Client Stars / 5 * 3)
 * - Punctuality Component: Max 2 Points (2.0 - 0.01 per 10 minutes late on check-in)
 */
export async function calculateAndSaveStaffRating(staffId: string) {
  try {
    // 1. Calculate Punctuality Component
    const completedShifts = await prisma.shift.findMany({
      where: {
        staffId,
        status: { in: ['COMPLETED', 'IN_PROGRESS'] }, // Count anything they clocked into
        clockIn: { not: null },
      },
      select: {
        date: true,
        startTime: true,
        clockIn: true,
      },
    });

    let punctualityScores: number[] = [];

    completedShifts.forEach((shift) => {
      if (!shift.clockIn) return;

      // Extract hours and minutes from the "HH:MM" startTime string
      const [startHour, startMin] = shift.startTime.split(':').map(Number);
      
      // Construct the exact scheduled start datetime
      const scheduledStart = new Date(shift.date);
      scheduledStart.setHours(startHour, startMin, 0, 0);

      const actualClockIn = new Date(shift.clockIn);

      let shiftPunctualityScore = 2.0;

      // If they clocked in after the scheduled start time
      if (actualClockIn > scheduledStart) {
        const lateMs = actualClockIn.getTime() - scheduledStart.getTime();
        const lateMinutes = Math.floor(lateMs / 60000);

        if (lateMinutes > 0) {
          const tenMinuteBlocks = Math.floor(lateMinutes / 10);
          const penalty = tenMinuteBlocks * 0.01;
          shiftPunctualityScore = Math.max(0, 2.0 - penalty);
        }
      }

      punctualityScores.push(shiftPunctualityScore);
    });

    let avgPunctuality = 2.0; // Default to perfect if no shifts yet
    if (punctualityScores.length > 0) {
      const totalPunctuality = punctualityScores.reduce((sum, score) => sum + score, 0);
      avgPunctuality = totalPunctuality / punctualityScores.length;
    }

    // 2. Calculate Client Review Component
    const clientReviews = await prisma.clientReview.aggregate({
      where: { staffId },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });

    const averageStars = clientReviews._avg.rating;
    const reviewCount = clientReviews._count.id;

    let clientComponent = 3.0; // Assume perfect 5-stars (3.0 pts) until first review
    if (reviewCount > 0 && averageStars !== null) {
      clientComponent = (averageStars / 5) * 3;
    }

    // 3. Final Rating Calculation
    const totalRating = clientComponent + avgPunctuality;
    // Cap at 5.0 and round to 2 decimal places
    const finalRating = Math.min(5.0, Math.round(totalRating * 100) / 100);

    // 4. Update the StaffProfile
    await prisma.staffProfile.update({
      where: { userId: staffId },
      data: { rating: finalRating },
    });

    return finalRating;
  } catch (error) {
    console.error('Error calculating staff rating:', error);
    throw error;
  }
}
