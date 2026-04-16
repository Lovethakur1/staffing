import cron from 'node-cron';
import prisma from '../config/database';

export const startCronJobs = () => {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('[CRON] Sweeping for forgotten checkouts...');
    try {
      const activeShifts = await prisma.shift.findMany({
        where: {
          status: { in: ['IN_PROGRESS', 'ONGOING'] },
          timesheet: { clockOutTime: null },
        },
        include: { timesheet: true },
      });

      const now = new Date();

      for (const shift of activeShifts) {
        if (!shift.date || !shift.endTime) continue;

        const [h, m] = shift.endTime.split(':').map(Number);
        const shiftEnd = new Date(shift.date);
        shiftEnd.setHours(h, m, 0, 0);

        const gracePeriodEnd = new Date(shiftEnd.getTime() + 2 * 60 * 60 * 1000); // end + 2h

        // Check if current time is past the grace period
        if (now > gracePeriodEnd) {
          console.log(`[CRON] Auto-checking out shift ${shift.id} (Staff: ${shift.staffId})`);

          // Calculate hours
          const totalMs = shiftEnd.getTime() - new Date(shift.clockIn || shiftEnd).getTime();
          const totalHours = Math.max(0, totalMs / (1000 * 60 * 60));
          
          const guaranteedHours = shift.guaranteedHours || 0;
          const regularHours = Math.min(totalHours, guaranteedHours || totalHours);
          const additionalWork = guaranteedHours > 0 ? Math.max(0, totalHours - guaranteedHours) : 0;
          const totalPay = totalHours * shift.hourlyRate;

          // 1. Update Shift
          await prisma.shift.update({
            where: { id: shift.id },
            data: {
              status: 'COMPLETED',
              clockOut: shiftEnd,
              totalHours,
              totalPay,
            },
          });

          // 2. Update Timesheet
          if (shift.timesheet) {
            await prisma.timesheet.update({
              where: { id: shift.timesheet.id },
              data: {
                clockOutTime: shiftEnd,
                status: 'PENDING',
                notes: 'System auto-checkout applied due to missed punch out (maxed to scheduled end time).',
                totalHours,
                regularHours,
                additionalWork,
              },
            });
          }

          // 3. Create Notification
          if (shift.staffId) {
            await prisma.notification.create({
              data: {
                userId: shift.staffId,
                title: 'Auto Check-Out Applied',
                message: `You forgot to check out for your shift on ${shiftEnd.toLocaleDateString()}. The system automatically checked you out at the scheduled end time (${shift.endTime}).`,
                type: 'system',
              },
            });
          }
        }
      }
    } catch (error) {
      console.error('[CRON] Error during sweep:', error);
    }
  });

  console.log('[CRON] Registered auto-checkout sweep.');

  // ── Auto-complete events whose date has passed ──────────────────
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Checking for events to auto-complete...');
    try {
      const now = new Date();
      // Find events that are PENDING/CONFIRMED/IN_PROGRESS and whose date is in the past
      const pastEvents = await prisma.event.findMany({
        where: {
          status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
          date: { lt: now },
        },
        include: {
          shifts: { select: { id: true, status: true } },
        },
      });

      for (const event of pastEvents) {
        // For multi-day events, check endDate too
        const eventEnd = (event as any).endDate || event.date;
        // Add 24h buffer after the event date
        const cutoff = new Date(new Date(eventEnd).getTime() + 24 * 60 * 60 * 1000);
        if (now < cutoff) continue;

        // Check all shifts are done (COMPLETED, CANCELLED, or NO_SHOW)
        const hasActiveShifts = event.shifts.some(
          (s: any) => !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(s.status)
        );
        if (hasActiveShifts) continue;

        await prisma.event.update({
          where: { id: event.id },
          data: { status: 'COMPLETED' },
        });
        console.log(`[CRON] Auto-completed event: ${event.title} (${event.id})`);
      }
    } catch (error) {
      console.error('[CRON] Error during event auto-complete:', error);
    }
  });

  console.log('[CRON] Registered event auto-complete check.');
};
