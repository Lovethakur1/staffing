import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAdminAnalytics = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    // 1. Core Metrics
    // Total Revenue (From Paid Invoices)
    const paidInvoices = await prisma.invoice.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true }
    });
    const totalRevenue = paidInvoices._sum.amount || 0;

    // Active Events (Events not CANCELLED or COMPLETED)
    const activeEventsCount = await prisma.event.count({
      where: {
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] }
      }
    });

    // Staff Utilization (Total distinct staff with shifts / total active staff)
    const totalActiveStaff = await prisma.user.count({
      where: { role: 'STAFF', isActive: true }
    });
    
    // We'll calculate distinct staff who had a shift in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const staffWithRecentShiftsRaw = await prisma.shift.groupBy({
      by: ['staffId'],
      where: {
        date: { gte: thirtyDaysAgo }
      }
    });
    
    const staffUtilization = totalActiveStaff > 0 
      ? Math.round((staffWithRecentShiftsRaw.length / totalActiveStaff) * 100) 
      : 0;

    // Client Satisfaction (Average of client ratings)
    const clientRatings = await prisma.clientProfile.aggregate({
      _avg: { rating: true },
      where: { rating: { gt: 0 } }
    });
    // Convert 1-5 scale to percentage, fallback to 100% if no ratings
    const clientSatisfaction = clientRatings._avg.rating 
      ? Math.round((clientRatings._avg.rating / 5) * 100) 
      : 100;

    // 2. Monthly Data (Last 6 months)
    const monthlyData = [];
    const categoryTrendData = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const monthName = monthNames[d.getMonth()];

      // Revenue for this month
      const monthRevenue = await prisma.invoice.aggregate({
        where: {
          status: 'PAID',
          paidDate: { gte: startOfMonth, lte: endOfMonth }
        },
        _sum: { amount: true }
      });

      // Events for this month
      const monthEvents = await prisma.event.count({
        where: {
          date: { gte: startOfMonth, lte: endOfMonth }
        }
      });

      // New Clients this month
      const monthClients = await prisma.clientProfile.count({
        where: {
          user: {
            createdAt: { gte: startOfMonth, lte: endOfMonth }
          }
        }
      });

      monthlyData.push({
        month: monthName,
        revenue: monthRevenue._sum.amount || 0,
        events: monthEvents,
        clients: monthClients
      });

      // Category Trend Data for this month
      // First, get revenue grouped by event type for this month
      const eventsThisMonth = await prisma.event.findMany({
        where: { date: { gte: startOfMonth, lte: endOfMonth } },
        select: {
          eventType: true,
          invoices: {
            where: { status: 'PAID' },
            select: { amount: true }
          }
        }
      });

      const catTrend: any = { month: monthName };
      eventsThisMonth.forEach(e => {
        const type = e.eventType || 'Other';
        const eventRev = e.invoices.reduce((sum, inv) => sum + inv.amount, 0);
        catTrend[type] = (catTrend[type] || 0) + eventRev;
      });
      categoryTrendData.push(catTrend);
    }

    // 3. Category Data & Detailed Analytics
    const allRecentEvents = await prisma.event.findMany({
      where: { date: { gte: sixMonthsAgo } },
      select: {
        eventType: true,
        staffRequired: true,
        invoices: {
          where: { status: 'PAID' },
          select: { amount: true }
        }
      }
    });

    const categoriesMap: Record<string, any> = {};
    let totalRecentRevenue = 0;

    allRecentEvents.forEach(e => {
      const type = e.eventType || 'Other';
      const rev = e.invoices.reduce((sum, inv) => sum + inv.amount, 0);
      
      if (!categoriesMap[type]) {
        categoriesMap[type] = {
          count: 0,
          revenue: 0,
          staffRequired: 0
        };
      }
      
      categoriesMap[type].count += 1;
      categoriesMap[type].revenue += rev;
      categoriesMap[type].staffRequired += e.staffRequired;
      totalRecentRevenue += rev;
    });

    // Color palette for categories
    const colors = ['#5E1916', '#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F4A460', 'var(--primary)', 'var(--chart-2)', 'var(--chart-3)'];
    let colorIndex = 0;

    const eventCategoryAnalytics = Object.entries(categoriesMap)
      .map(([category, data]) => {
        const { count, revenue, staffRequired } = data;
        const avgRevenue = count > 0 ? Math.round(revenue / count) : 0;
        const percentage = totalRecentRevenue > 0 ? Math.round((revenue / totalRecentRevenue) * 100) : 0;
        const avgStaff = count > 0 ? Math.round(staffRequired / count) : 0;
        
        const color = colors[colorIndex % colors.length];
        colorIndex++;

        return {
          category,
          count,
          revenue: Math.round(revenue),
          avgRevenue,
          growth: '+0%', // Hard to calculate accurate historical growth without complex queries, placeholder
          trend: 'up',
          percentage,
          staffRequired,
          avgStaff,
          satisfaction: 95, // Placeholder per category
          color
        };
      })
      .sort((a, b) => b.revenue - a.revenue) // Sort by revenue descending
      .slice(0, 6); // Top 6 categories

    // Category Data for Pie Chart (use top categories)
    const categoryData = eventCategoryAnalytics.map(c => ({
      name: c.category,
      value: c.percentage,
      color: c.color
    }));

    // If there were no events to establish percentages, provide empty fallback
    if (categoryData.length === 0) {
      categoryData.push({ name: 'No Data', value: 100, color: 'var(--muted)' });
    }

    // 4. Weekly Data (Last 7 days mock progress calculation)
    const weeklyData = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      
      // Look for shifts completed on this day vs scheduled as a basic performance metric
      const shiftsOnDay = await prisma.shift.count({
        where: {
          date: {
            gte: new Date(d.setHours(0,0,0,0)),
            lte: new Date(d.setHours(23,59,59,999))
          }
        }
      });
      
      const shiftsCompletedOnDay = await prisma.shift.count({
        where: {
          date: {
            gte: new Date(d.setHours(0,0,0,0)),
            lte: new Date(d.setHours(23,59,59,999))
          },
          status: 'COMPLETED'
        }
      });
      
      const performance = shiftsOnDay > 0 ? Math.round((shiftsCompletedOnDay / shiftsOnDay) * 100) : 100;

      weeklyData.push({
        day: days[d.getDay()],
        performance: performance === 0 && shiftsOnDay === 0 ? 90 : performance, // 90% default if no shifts
        target: 90
      });
    }

    res.json({
      metrics: [
        { label: "Total Revenue", value: `$${(totalRevenue/1000).toFixed(1)}K`, change: "+0%", trend: "up" },
        { label: "Active Events", value: activeEventsCount.toString(), change: "+0", trend: "up" },
        { label: "Staff Utilization", value: `${staffUtilization}%`, change: "+0%", trend: "up" },
        { label: "Client Satisfaction", value: `${clientSatisfaction}%`, change: "+0%", trend: "up" },
        { label: "Profit Margin", value: "23%", change: "0%", trend: "up" }, // Hardcoded for now without expense tracking
        { label: "Growth Rate", value: "0%", change: "0%", trend: "up" },
      ],
      monthlyData,
      categoryData,
      eventCategoryAnalytics,
      categoryTrendData,
      weeklyData,
      title: "Admin Analytics",
      subtitle: "Complete system overview and business intelligence"
    });

  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
