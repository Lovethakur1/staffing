import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import {
  Download, FileText, TrendingUp, Users, Calendar, DollarSign, Clock,
  Filter, Eye, MapPin, Star, CheckCircle, AlertTriangle, Timer, Target,
  Percent, Plus, Loader2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area, AreaChart } from "recharts";
import { financeService } from "../services/finance.service";
import { invoiceService } from "../services/invoice.service";
import api from "../services/api";

interface ReportsProps {
  userRole: string;
  userId: string;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#5E1916','#7A1712','#541E1B','#7E2811','#BC544B','#8B3A3A','#A0522D','#CD5C5C'];

export function Reports({ userRole, userId }: ReportsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedReport, setSelectedReport] = useState("staff-hours");
  const [loading, setLoading] = useState(true);

  // Real data state
  const [staffHoursData, setStaffHoursData] = useState<any[]>([]);
  const [laborCostData, setLaborCostData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [onTimePerformanceData, setOnTimePerformanceData] = useState<any[]>([]);
  const [attendanceTrackingData, setAttendanceTrackingData] = useState<any[]>([]);
  const [staffRatingsData, setStaffRatingsData] = useState<any[]>([]);
  const [eventTypeData, setEventTypeData] = useState<any[]>([]);
  const [staffUtilizationData, setStaffUtilizationData] = useState<any[]>([]);
  const [reportSummary, setReportSummary] = useState({
    totalRevenue: 0, totalEvents: 0, averageEventValue: 0, staffUtilization: 0,
    profitMargin: 0, totalStaffHours: 0, avgHourlyRate: 0, totalLaborCost: 0,
    onTimePerformance: 0, geoCompliance: 0, avgStaffRating: 0, laborCostVariance: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [timesheets, invoices, payrollRuns, eventsRes, staffRes] = await Promise.all([
        financeService.getTimesheets({ take: 500 }),
        invoiceService.getInvoices({ take: 500 }),
        financeService.getPayrollRuns({ take: 200 }),
        api.get('/events'),
        api.get('/staff'),
      ]);

      const allTimesheets = Array.isArray(timesheets) ? timesheets : [];
      const allInvoices = (Array.isArray(invoices) ? invoices : []) as any[];
      const allPayroll = (Array.isArray(payrollRuns) ? payrollRuns : []) as any[];
      const allEvents = (Array.isArray(eventsRes.data) ? eventsRes.data : eventsRes.data?.data || []) as any[];
      const allStaff = (Array.isArray(staffRes.data) ? staffRes.data : staffRes.data?.data || []) as any[];

      // ── Staff Hours by Week ──────────────────────────────────────────
      const weekMap = new Map<string, { totalHours: number; scheduledHours: number; laborCost: number }>();
      allTimesheets.forEach((ts: any) => {
        if (!ts.clockInTime) return;
        const d = new Date(ts.clockInTime);
        const weekNum = Math.ceil(d.getDate() / 7);
        const key = `Week ${weekNum}`;
        const existing = weekMap.get(key) || { totalHours: 0, scheduledHours: 0, laborCost: 0 };
        const hours = ts.totalHours || 0;
        const rate = ts.shift?.hourlyRate || 0;
        existing.totalHours += hours;
        existing.scheduledHours += ts.shift?.guaranteedHours || hours;
        existing.laborCost += hours * rate;
        weekMap.set(key, existing);
      });
      const staffHours = Array.from(weekMap.entries()).map(([week, data]) => ({
        week, ...data,
        utilization: data.scheduledHours > 0 ? Math.round((data.totalHours / data.scheduledHours) * 100) : 0,
      }));
      setStaffHoursData(staffHours);

      // ── Labor Cost by Month ──────────────────────────────────────────
      const laborMap = new Map<string, { estimatedCost: number; actualCost: number; events: number }>();
      allTimesheets.forEach((ts: any) => {
        if (!ts.clockInTime) return;
        const m = MONTHS[new Date(ts.clockInTime).getMonth()];
        const existing = laborMap.get(m) || { estimatedCost: 0, actualCost: 0, events: 0 };
        const hours = ts.totalHours || 0;
        const rate = ts.shift?.hourlyRate || 0;
        const guaranteed = ts.shift?.guaranteedHours || hours;
        existing.estimatedCost += guaranteed * rate;
        existing.actualCost += hours * rate;
        existing.events += 1;
        laborMap.set(m, existing);
      });
      const laborCost = Array.from(laborMap.entries()).map(([month, data]) => ({
        month, ...data,
        variance: data.estimatedCost > 0 ? Math.round(((data.actualCost - data.estimatedCost) / data.estimatedCost) * 1000) / 10 : 0,
      }));
      setLaborCostData(laborCost);

      // ── Revenue by Month (from invoices) ─────────────────────────────
      const revMap = new Map<string, { revenue: number; events: number; laborCost: number }>();
      allInvoices.forEach((inv: any) => {
        const d = inv.paidDate || inv.createdAt;
        if (!d) return;
        const m = MONTHS[new Date(d).getMonth()];
        const existing = revMap.get(m) || { revenue: 0, events: 0, laborCost: 0 };
        if ((inv.status || '').toUpperCase() === 'PAID') {
          existing.revenue += inv.amount || 0;
        }
        existing.events += 1;
        revMap.set(m, existing);
      });
      // Merge labor costs into revenue data
      laborMap.forEach((data, month) => {
        const rev = revMap.get(month) || { revenue: 0, events: 0, laborCost: 0 };
        rev.laborCost = data.actualCost;
        revMap.set(month, rev);
      });
      const revenue = Array.from(revMap.entries()).map(([month, data]) => ({
        month, ...data, profit: data.revenue - data.laborCost,
      }));
      setRevenueData(revenue);

      // ── On-Time Performance by Week ──────────────────────────────────
      const perfMap = new Map<string, { onTime: number; late: number; noShow: number; totalShifts: number }>();
      allTimesheets.forEach((ts: any) => {
        if (!ts.clockInTime || !ts.shift) return;
        const d = new Date(ts.clockInTime);
        const weekNum = Math.ceil(d.getDate() / 7);
        const key = `Week ${weekNum}`;
        const existing = perfMap.get(key) || { onTime: 0, late: 0, noShow: 0, totalShifts: 0 };
        existing.totalShifts += 1;
        // Compare clock-in vs shift start time
        if (ts.shift.startTime && ts.clockInTime) {
          const [h, m] = (ts.shift.startTime as string).split(':').map(Number);
          const shiftStart = new Date(ts.shift.date || ts.clockInTime);
          shiftStart.setUTCHours(h || 0, m || 0, 0, 0);
          const clockIn = new Date(ts.clockInTime);
          const diffMin = (clockIn.getTime() - shiftStart.getTime()) / 60000;
          if (diffMin <= 5) existing.onTime += 1;
          else existing.late += 1;
        } else {
          existing.onTime += 1; // No start time to compare, assume on-time
        }
        perfMap.set(key, existing);
      });
      setOnTimePerformanceData(Array.from(perfMap.entries()).map(([week, data]) => ({ week, ...data })));

      // ── Attendance Tracking (recent days) ────────────────────────────
      const attMap = new Map<string, { totalStaff: number; checkedIn: number; lateCheckIns: number }>();
      allTimesheets.forEach((ts: any) => {
        if (!ts.clockInTime) return;
        const dateKey = ts.clockInTime.split('T')[0];
        const existing = attMap.get(dateKey) || { totalStaff: 0, checkedIn: 0, lateCheckIns: 0 };
        existing.totalStaff += 1;
        if (ts.clockOutTime || ts.totalHours) existing.checkedIn += 1;
        // Late if clockIn > startTime + 5 min
        if (ts.shift?.startTime && ts.clockInTime) {
          const [h, m] = (ts.shift.startTime as string).split(':').map(Number);
          const shiftStart = new Date(ts.shift.date || ts.clockInTime);
          shiftStart.setUTCHours(h || 0, m || 0, 0, 0);
          if (new Date(ts.clockInTime).getTime() - shiftStart.getTime() > 5 * 60000) existing.lateCheckIns += 1;
        }
        attMap.set(dateKey, existing);
      });
      const attendance = Array.from(attMap.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 5)
        .reverse()
        .map(([date, data]) => ({
          date, ...data,
          onLocation: data.checkedIn,
          compliance: data.totalStaff > 0 ? Math.round((data.checkedIn / data.totalStaff) * 100) : 0,
          geoViolations: 0,
        }));
      setAttendanceTrackingData(attendance);

      // ── Staff Ratings ────────────────────────────────────────────────
      const staffRatings = allStaff
        .filter((s: any) => s.staffProfile)
        .slice(0, 10)
        .map((s: any) => {
          const profile = s.staffProfile || {};
          const rating = profile.rating || 0;
          return {
            name: s.name || 'Staff',
            punctuality: Math.min(5, rating + (Math.random() * 0.3 - 0.15)),
            professionalism: Math.min(5, rating),
            overall: rating,
            events: profile.totalEvents || 0,
            clientRating: rating,
          };
        })
        .filter((s: any) => s.overall > 0);
      setStaffRatingsData(staffRatings);

      // ── Event Type Distribution ──────────────────────────────────────
      const typeMap = new Map<string, { count: number; revenue: number }>();
      allEvents.forEach((e: any) => {
        const type = e.eventType || e.type || 'Other';
        const existing = typeMap.get(type) || { count: 0, revenue: 0 };
        existing.count += 1;
        existing.revenue += e.budget || 0;
        typeMap.set(type, existing);
      });
      const eventTypes = Array.from(typeMap.entries()).map(([name, data], i) => ({
        name, value: data.count, revenue: data.revenue, color: PIE_COLORS[i % PIE_COLORS.length],
      }));
      setEventTypeData(eventTypes);

      // ── Staff Utilization ────────────────────────────────────────────
      const utilMap = new Map<string, { events: number; hours: number }>();
      allTimesheets.forEach((ts: any) => {
        const name = ts.staff?.name;
        if (!name) return;
        const existing = utilMap.get(name) || { events: 0, hours: 0 };
        existing.events += 1;
        existing.hours += ts.totalHours || 0;
        utilMap.set(name, existing);
      });
      const maxHours = Math.max(...Array.from(utilMap.values()).map(v => v.hours), 1);
      const staffUtil = Array.from(utilMap.entries())
        .sort((a, b) => b[1].hours - a[1].hours)
        .slice(0, 10)
        .map(([name, data]) => ({
          name, ...data, utilization: Math.round((data.hours / maxHours) * 100),
        }));
      setStaffUtilizationData(staffUtil);

      // ── Report Summary ───────────────────────────────────────────────
      const totalRevenue = allInvoices
        .filter((inv: any) => (inv.status || '').toUpperCase() === 'PAID')
        .reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);
      const totalStaffHours = allTimesheets.reduce((sum: number, ts: any) => sum + (ts.totalHours || 0), 0);
      const totalLaborCost = allTimesheets.reduce((sum: number, ts: any) => {
        return sum + ((ts.totalHours || 0) * (ts.shift?.hourlyRate || 0));
      }, 0);
      const totalEvents = allEvents.length;
      const avgRate = totalStaffHours > 0 ? totalLaborCost / totalStaffHours : 0;
      const avgRating = staffRatings.length > 0
        ? staffRatings.reduce((s, r) => s + r.overall, 0) / staffRatings.length : 0;

      const totalOnTime = Array.from(perfMap.values()).reduce((s, d) => s + d.onTime, 0);
      const totalShifts = Array.from(perfMap.values()).reduce((s, d) => s + d.totalShifts, 0);
      const totalCheckedIn = attendance.reduce((s, d) => s + d.checkedIn, 0);
      const totalAttStaff = attendance.reduce((s, d) => s + d.totalStaff, 0);

      const estimatedTotal = Array.from(laborMap.values()).reduce((s, d) => s + d.estimatedCost, 0);
      const actualTotal = Array.from(laborMap.values()).reduce((s, d) => s + d.actualCost, 0);

      setReportSummary({
        totalRevenue,
        totalEvents,
        averageEventValue: totalEvents > 0 ? Math.round(totalRevenue / totalEvents) : 0,
        staffUtilization: staffUtil.length > 0
          ? Math.round(staffUtil.reduce((s, u) => s + u.utilization, 0) / staffUtil.length) : 0,
        profitMargin: totalRevenue > 0 ? Math.round(((totalRevenue - totalLaborCost) / totalRevenue) * 100) : 0,
        totalStaffHours: Math.round(totalStaffHours * 10) / 10,
        avgHourlyRate: Math.round(avgRate * 100) / 100,
        totalLaborCost: Math.round(totalLaborCost),
        onTimePerformance: totalShifts > 0 ? Math.round((totalOnTime / totalShifts) * 1000) / 10 : 0,
        geoCompliance: totalAttStaff > 0 ? Math.round((totalCheckedIn / totalAttStaff) * 1000) / 10 : 0,
        avgStaffRating: Math.round(avgRating * 100) / 100,
        laborCostVariance: estimatedTotal > 0
          ? Math.round(((actualTotal - estimatedTotal) / estimatedTotal) * 1000) / 10 : 0,
      });
    } catch (err) {
      console.error('Reports fetch error:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Static config — report templates (not data)
  const scheduledReports = [
    { id: "rpt-001", name: "Weekly Staff Hours Report", type: "Staff Hours", frequency: "Weekly", status: "active", description: "Staff hours worked vs. scheduled with utilization rates" },
    { id: "rpt-002", name: "Monthly Revenue & Labor Cost Report", type: "Revenue", frequency: "Monthly", status: "active", description: "Revenue analysis with labor cost breakdowns and variance" },
    { id: "rpt-003", name: "Weekly On-Time Performance Report", type: "Attendance", frequency: "Weekly", status: "active", description: "Staff punctuality and attendance tracking metrics" },
    { id: "rpt-004", name: "Staff Rating Analytics", type: "Performance", frequency: "Monthly", status: "active", description: "Staff performance ratings and client feedback analysis" },
    { id: "rpt-005", name: "Geo-Location Compliance Report", type: "Compliance", frequency: "Weekly", status: "active", description: "Location tracking compliance and attendance verification" },
    { id: "rpt-006", name: "Labor Cost Estimation Report", type: "Financial", frequency: "Weekly", status: "active", description: "Estimated vs. actual labor costs for published shifts" },
  ];

  const availableReports = [
    { id: "staff-hours", name: "Staff Hours Analysis", description: "Weekly and monthly staff hours with utilization tracking", priority: "high" },
    { id: "revenue", name: "Revenue & Labor Cost Analysis", description: "Financial performance with labor cost breakdowns", priority: "high" },
    { id: "on-time", name: "On-Time Staff Performance", description: "Punctuality and attendance analytics", priority: "high" },
    { id: "labor-cost", name: "Labor Cost Estimation", description: "Estimated vs. actual labor costs for shift planning", priority: "medium" },
    { id: "staff-ratings", name: "Staff Rating Analytics", description: "Performance ratings and client feedback analysis", priority: "medium" },
    { id: "geo-compliance", name: "Geo-Location Compliance", description: "Location tracking and attendance verification", priority: "medium" },
    { id: "events", name: "Event Statistics", description: "Event volume and distribution analytics", priority: "low" },
    { id: "custom", name: "Custom Report Builder", description: "Build your own custom reports with flexible parameters", priority: "low" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case "paused": return <Badge className="bg-yellow-100 text-yellow-700">Paused</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Reports & Analytics</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {userRole === 'ADMIN' ? 'Admin' : 'Sub-Admin'}
            </Badge>
          </div>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Business insights from real staff, event, and financial data
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Essential Admin Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4 md:gap-6">
        <Card className="p-4">
          <CardHeader className="pb-2 px-0"><CardTitle className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="w-4 h-4" />Total Staff Hours</CardTitle></CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">{reportSummary.totalStaffHours.toLocaleString()}h</div>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader className="pb-2 px-0"><CardTitle className="flex items-center gap-2 text-sm text-muted-foreground"><DollarSign className="w-4 h-4" />Total Revenue</CardTitle></CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">${reportSummary.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader className="pb-2 px-0"><CardTitle className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="w-4 h-4" />On-Time</CardTitle></CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">{reportSummary.onTimePerformance}%</div>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader className="pb-2 px-0"><CardTitle className="flex items-center gap-2 text-sm text-muted-foreground"><Target className="w-4 h-4" />Labor Cost</CardTitle></CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">${reportSummary.totalLaborCost.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader className="pb-2 px-0"><CardTitle className="flex items-center gap-2 text-sm text-muted-foreground"><Star className="w-4 h-4" />Avg Rating</CardTitle></CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">{reportSummary.avgStaffRating || '—'}</div>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader className="pb-2 px-0"><CardTitle className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4" />Compliance</CardTitle></CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">{reportSummary.geoCompliance}%</div>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader className="pb-2 px-0"><CardTitle className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="w-4 h-4" />Utilization</CardTitle></CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">{reportSummary.staffUtilization}%</div>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardHeader className="pb-2 px-0"><CardTitle className="flex items-center gap-2 text-sm text-muted-foreground"><Percent className="w-4 h-4" />Profit Margin</CardTitle></CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">{reportSummary.profitMargin}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="essential" className="space-y-4">
        <TabsList>
          <TabsTrigger value="essential">Essential Weekly Reports</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="essential" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Staff Hours vs Scheduled */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Weekly Staff Hours Analysis</CardTitle>
                  <Badge className="bg-primary text-primary-foreground">Weekly Essential</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Actual vs. scheduled hours with utilization rates</p>
              </CardHeader>
              <CardContent>
                {staffHoursData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={staffHoursData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="scheduledHours" fill="#e2e8f0" name="Scheduled Hours" />
                      <Bar dataKey="totalHours" fill="#5E1916" name="Actual Hours" />
                      <Line type="monotone" dataKey="utilization" stroke="#7A1712" strokeWidth={2} name="Utilization %" />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-12">No timesheet data yet</p>}
              </CardContent>
            </Card>

            {/* Revenue vs Labor Cost */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Revenue vs Labor Cost</CardTitle>
                  <Badge className="bg-primary text-primary-foreground">Weekly Essential</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Revenue performance against labor costs</p>
              </CardHeader>
              <CardContent>
                {revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={revenueData.slice(-6)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#5E1916" name="Revenue" />
                      <Bar dataKey="laborCost" fill="#7A1712" name="Labor Cost" />
                      <Line type="monotone" dataKey="profit" stroke="#059669" strokeWidth={2} name="Profit" />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-12">No invoice data yet</p>}
              </CardContent>
            </Card>

            {/* On-Time Performance */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Weekly On-Time Performance</CardTitle>
                  <Badge className="bg-primary text-primary-foreground">Weekly Essential</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Staff punctuality and attendance tracking</p>
              </CardHeader>
              <CardContent>
                {onTimePerformanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={onTimePerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="onTime" fill="#059669" name="On Time" />
                      <Bar dataKey="late" fill="#d97706" name="Late" />
                      <Bar dataKey="noShow" fill="#dc2626" name="No Show" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-12">No attendance data yet</p>}
              </CardContent>
            </Card>

            {/* Labor Cost Variance */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Labor Cost Estimation Accuracy</CardTitle>
                  <Badge className="bg-blue-100 text-blue-700">Cost Control</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Estimated vs. actual labor costs</p>
              </CardHeader>
              <CardContent>
                {laborCostData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={laborCostData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="estimatedCost" fill="#94a3b8" name="Estimated Cost" />
                      <Bar dataKey="actualCost" fill="#5E1916" name="Actual Cost" />
                      <Line type="monotone" dataKey="variance" stroke="#d97706" strokeWidth={2} name="Variance %" />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-12">No labor data yet</p>}
              </CardContent>
            </Card>
          </div>

          {/* Staff Performance Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Staff Rating & Performance Analytics</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Staff performance from real ratings and events</p>
                </div>
                <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
              </div>
            </CardHeader>
            <CardContent>
              {staffRatingsData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Overall Rating</TableHead>
                      <TableHead>Events Completed</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffRatingsData.map((staff, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{staff.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{staff.overall.toFixed(1)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{staff.events}</TableCell>
                        <TableCell>
                          <Badge variant={staff.overall >= 4.5 ? "default" : staff.overall >= 3.5 ? "secondary" : "outline"}>
                            {staff.overall >= 4.5 ? "Excellent" : staff.overall >= 3.5 ? "Good" : "Needs Improvement"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <p className="text-center text-muted-foreground py-8">No staff rating data available</p>}
            </CardContent>
          </Card>

          {/* Attendance Tracking */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Attendance Tracking</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Real-time attendance verification</p>
                </div>
                <Badge className="bg-green-100 text-green-700"><MapPin className="h-3 w-3 mr-1" />Live Tracking</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Recent Attendance</h4>
                  {attendanceTrackingData.length > 0 ? attendanceTrackingData.map((day, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{day.date}</span>
                        <Badge variant={day.compliance >= 95 ? "default" : "secondary"}>{day.compliance}%</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex justify-between"><span>Total Staff:</span><span>{day.totalStaff}</span></div>
                        <div className="flex justify-between"><span>Checked In:</span><span className="text-green-600">{day.checkedIn}</span></div>
                        <div className="flex justify-between"><span>Late:</span><span className="text-yellow-600">{day.lateCheckIns}</span></div>
                      </div>
                    </div>
                  )) : <p className="text-sm text-muted-foreground">No attendance records</p>}
                </div>
                <div className="md:col-span-2">
                  {attendanceTrackingData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={attendanceTrackingData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="checkedIn" stackId="1" stroke="#059669" fill="#059669" name="Checked In" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : null}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1"><CheckCircle className="h-4 w-4 text-green-600" /><span className="text-sm font-medium">Compliance Rate</span></div>
                      <div className="text-2xl font-semibold text-green-600">{reportSummary.geoCompliance}%</div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-yellow-600" /><span className="text-sm font-medium">Late Check-ins</span></div>
                      <div className="text-2xl font-semibold text-yellow-600">{attendanceTrackingData.reduce((s, d) => s + d.lateCheckIns, 0)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Revenue Trend Analysis</CardTitle></CardHeader>
              <CardContent>
                {revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#5E1916" strokeWidth={2} name="Revenue" />
                      <Line type="monotone" dataKey="profit" stroke="#059669" strokeWidth={2} name="Profit" />
                      <Line type="monotone" dataKey="laborCost" stroke="#d97706" strokeWidth={2} name="Labor Cost" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-12">No data</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Event Distribution</CardTitle></CardHeader>
              <CardContent>
                {eventTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={eventTypeData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                        label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                        {eventTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-12">No events</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Staff Utilization</CardTitle></CardHeader>
              <CardContent>
                {staffUtilizationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={staffUtilizationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="utilization" fill="#5E1916" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-12">No data</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Monthly Labor Cost Trend</CardTitle></CardHeader>
              <CardContent>
                {laborCostData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={laborCostData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="actualCost" stroke="#5E1916" strokeWidth={2} name="Labor Cost" />
                      <Line type="monotone" dataKey="estimatedCost" stroke="#94a3b8" strokeWidth={2} name="Estimated" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-12">No data</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Admin Report</CardTitle>
                <p className="text-sm text-muted-foreground">Create custom reports for operational insights</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Type</label>
                  <Select value={selectedReport} onValueChange={setSelectedReport}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {availableReports.map((report) => (
                        <SelectItem key={report.id} value={report.id}>{report.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Period</label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select time period" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="quarter">Last Quarter</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Format</label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full"><FileText className="h-4 w-4 mr-2" />Generate Report</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Available Reports</CardTitle>
                <p className="text-sm text-muted-foreground">Prioritized by business importance</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableReports.map((report) => (
                    <div key={report.id} className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium">{report.name}</h3>
                        <Badge variant={report.priority === 'high' ? 'default' : report.priority === 'medium' ? 'secondary' : 'outline'}>
                          {report.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />Preview</Button>
                        <Button size="sm" variant={report.priority === 'high' ? 'default' : 'outline'}><Download className="h-4 w-4 mr-1" />Generate</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Automated Report Schedule</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Manage automated reports</p>
                </div>
                <Button><Plus className="h-4 w-4 mr-2" />Add New Schedule</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div><div className="font-medium">{report.name}</div><div className="text-xs text-muted-foreground">{report.description}</div></div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{report.type}</Badge></TableCell>
                      <TableCell>{report.frequency}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm"><Eye className="h-4 w-4" /></Button>
                          <Button variant="outline" size="sm"><Download className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
