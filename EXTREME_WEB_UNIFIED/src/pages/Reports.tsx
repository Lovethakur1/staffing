import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import { 
  Download, 
  FileText, 
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Clock,
  Filter,
  Eye,
  MapPin,
  Star,
  CheckCircle,
  AlertTriangle,
  Timer,
  Target,
  Zap,
  Shield,
  TrendingDown,
  Activity,
  Percent,
  Plus
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area, AreaChart } from "recharts";

interface ReportsProps {
  userRole: string;
  userId: string;
}

export function Reports({ userRole, userId }: ReportsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedReport, setSelectedReport] = useState("staff-hours");

  // Enhanced Mock reports data with admin focus
  const staffHoursData = [
    { week: "Week 1", totalHours: 342, scheduledHours: 360, utilization: 95, laborCost: 8550 },
    { week: "Week 2", totalHours: 368, scheduledHours: 380, utilization: 97, laborCost: 9200 },
    { week: "Week 3", totalHours: 325, scheduledHours: 350, utilization: 93, laborCost: 8125 },
    { week: "Week 4", totalHours: 384, scheduledHours: 400, utilization: 96, laborCost: 9600 },
  ];

  const laborCostData = [
    { month: "Jan", estimatedCost: 45600, actualCost: 47200, variance: 3.5, events: 12 },
    { month: "Feb", estimatedCost: 52800, actualCost: 51900, variance: -1.7, events: 15 },
    { month: "Mar", estimatedCost: 48300, actualCost: 49800, variance: 3.1, events: 13 },
    { month: "Apr", estimatedCost: 61200, actualCost: 59800, variance: -2.3, events: 18 },
    { month: "May", estimatedCost: 55500, actualCost: 57100, variance: 2.9, events: 16 },
    { month: "Jun", estimatedCost: 67400, actualCost: 66200, variance: -1.8, events: 20 },
  ];

  const revenueData = [
    { month: "Jan", revenue: 45000, events: 12, profit: 13500, laborCost: 47200 },
    { month: "Feb", revenue: 52000, events: 15, profit: 15600, laborCost: 51900 },
    { month: "Mar", revenue: 48000, events: 13, profit: 14400, laborCost: 49800 },
    { month: "Apr", revenue: 61000, events: 18, profit: 18300, laborCost: 59800 },
    { month: "May", revenue: 55000, events: 16, profit: 16500, laborCost: 57100 },
    { month: "Jun", revenue: 67000, events: 20, profit: 20100, laborCost: 66200 },
    { month: "Jul", revenue: 72000, events: 22, profit: 21600, laborCost: 72800 },
    { month: "Aug", revenue: 69000, events: 21, profit: 20700, laborCost: 69300 },
    { month: "Sep", revenue: 75000, events: 24, profit: 22500, laborCost: 75600 },
    { month: "Oct", revenue: 83000, events: 26, profit: 24900, laborCost: 83200 }
  ];

  const onTimePerformanceData = [
    { week: "Week 1", onTime: 87, late: 8, noShow: 5, totalShifts: 45 },
    { week: "Week 2", onTime: 92, late: 6, noShow: 2, totalShifts: 48 },
    { week: "Week 3", onTime: 89, late: 7, noShow: 4, totalShifts: 42 },
    { week: "Week 4", onTime: 94, late: 4, noShow: 2, totalShifts: 50 },
  ];

  const attendanceTrackingData = [
    { 
      date: "2024-10-21", 
      totalStaff: 24, 
      checkedIn: 23, 
      onLocation: 22, 
      compliance: 96,
      lateCheckIns: 2,
      geoViolations: 1
    },
    { 
      date: "2024-10-22", 
      totalStaff: 18, 
      checkedIn: 18, 
      onLocation: 17, 
      compliance: 94,
      lateCheckIns: 1,
      geoViolations: 1
    },
    { 
      date: "2024-10-23", 
      totalStaff: 32, 
      checkedIn: 31, 
      onLocation: 30, 
      compliance: 94,
      lateCheckIns: 3,
      geoViolations: 2
    },
  ];

  const staffRatingsData = [
    { name: "Emma Williams", punctuality: 4.8, professionalism: 4.9, overall: 4.85, events: 45, clientRating: 4.9 },
    { name: "James Rodriguez", punctuality: 4.6, professionalism: 4.7, overall: 4.65, events: 38, clientRating: 4.7 },
    { name: "Maria Garcia", punctuality: 4.9, professionalism: 4.8, overall: 4.85, events: 32, clientRating: 4.8 },
    { name: "David Kim", punctuality: 4.5, professionalism: 4.6, overall: 4.55, events: 28, clientRating: 4.6 },
    { name: "Sophie Brown", punctuality: 4.7, professionalism: 4.9, overall: 4.8, events: 41, clientRating: 4.8 },
  ];

  const eventTypeData = [
    { name: "Corporate Events", value: 35, revenue: 420000, color: "#5E1916" },
    { name: "Weddings", value: 28, revenue: 336000, color: "#7A1712" },
    { name: "Private Parties", value: 20, revenue: 240000, color: "#541E1B" },
    { name: "Product Launches", value: 12, revenue: 144000, color: "#7E2811" },
    { name: "Other", value: 5, revenue: 60000, color: "#BC544B" }
  ];

  const staffUtilizationData = [
    { name: "Emma Williams", events: 45, hours: 180, utilization: 90 },
    { name: "James Rodriguez", events: 38, hours: 152, utilization: 76 },
    { name: "Maria Garcia", events: 32, hours: 128, utilization: 64 },
    { name: "David Kim", events: 28, hours: 112, utilization: 56 },
    { name: "Sophie Brown", events: 41, hours: 164, utilization: 82 }
  ];

  const clientSatisfactionData = [
    { month: "Jan", satisfaction: 4.2, responses: 28 },
    { month: "Feb", satisfaction: 4.3, responses: 35 },
    { month: "Mar", satisfaction: 4.1, responses: 30 },
    { month: "Apr", satisfaction: 4.5, responses: 42 },
    { month: "May", satisfaction: 4.4, responses: 38 },
    { month: "Jun", satisfaction: 4.6, responses: 48 },
    { month: "Jul", satisfaction: 4.7, responses: 52 },
    { month: "Aug", satisfaction: 4.6, responses: 49 },
    { month: "Sep", satisfaction: 4.8, responses: 58 },
    { month: "Oct", satisfaction: 4.9, responses: 62 }
  ];

  const reportSummary = {
    totalRevenue: 687000,
    totalEvents: 187,
    averageEventValue: 3673,
    clientSatisfaction: 4.6,
    staffUtilization: 73.6,
    profitMargin: 30,
    totalStaffHours: 1419,
    avgHourlyRate: 25.50,
    totalLaborCost: 36185,
    onTimePerformance: 90.5,
    geoCompliance: 94.8,
    avgStaffRating: 4.74,
    laborCostVariance: 1.2
  };

  const scheduledReports = [
    {
      id: "rpt-001",
      name: "Weekly Staff Hours Report",
      type: "Staff Hours",
      frequency: "Weekly",
      lastGenerated: "2024-10-21",
      nextScheduled: "2024-10-28",
      status: "active",
      description: "Staff hours worked vs. scheduled with utilization rates"
    },
    {
      id: "rpt-002",
      name: "Monthly Revenue & Labor Cost Report",
      type: "Revenue",
      frequency: "Monthly",
      lastGenerated: "2024-10-01",
      nextScheduled: "2024-11-01",
      status: "active",
      description: "Revenue analysis with labor cost breakdowns and variance"
    },
    {
      id: "rpt-003",
      name: "Weekly On-Time Performance Report",
      type: "Attendance",
      frequency: "Weekly",
      lastGenerated: "2024-10-21",
      nextScheduled: "2024-10-28",
      status: "active",
      description: "Staff punctuality and attendance tracking metrics"
    },
    {
      id: "rpt-004",
      name: "Staff Rating Analytics",
      type: "Performance",
      frequency: "Monthly",
      lastGenerated: "2024-10-01",
      nextScheduled: "2024-11-01",
      status: "active",
      description: "Staff performance ratings and client feedback analysis"
    },
    {
      id: "rpt-005",
      name: "Geo-Location Compliance Report",
      type: "Compliance",
      frequency: "Weekly",
      lastGenerated: "2024-10-21",
      nextScheduled: "2024-10-28",
      status: "active",
      description: "Location tracking compliance and attendance verification"
    },
    {
      id: "rpt-006",
      name: "Labor Cost Estimation Report",
      type: "Financial",
      frequency: "Weekly",
      lastGenerated: "2024-10-21",
      nextScheduled: "2024-10-28",
      status: "active",
      description: "Estimated vs. actual labor costs for published shifts"
    }
  ];

  const availableReports = [
    { id: "staff-hours", name: "Staff Hours Analysis", description: "Weekly and monthly staff hours with utilization tracking", priority: "high" },
    { id: "revenue", name: "Revenue & Labor Cost Analysis", description: "Financial performance with labor cost breakdowns", priority: "high" },
    { id: "on-time", name: "On-Time Staff Performance", description: "Punctuality and attendance analytics", priority: "high" },
    { id: "labor-cost", name: "Labor Cost Estimation", description: "Estimated vs. actual labor costs for shift planning", priority: "medium" },
    { id: "staff-ratings", name: "Staff Rating Analytics", description: "Performance ratings and client feedback analysis", priority: "medium" },
    { id: "geo-compliance", name: "Geo-Location Compliance", description: "Location tracking and attendance verification", priority: "medium" },
    { id: "events", name: "Event Statistics", description: "Event volume and distribution analytics", priority: "low" },
    { id: "clients", name: "Client Analysis", description: "Client satisfaction and retention metrics", priority: "low" },
    { id: "custom", name: "Custom Report Builder", description: "Build your own custom reports with flexible parameters", priority: "low" }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-700">Paused</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Reports & Analytics</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Sub-Admin
            </Badge>
          </div>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Essential business insights for staff management, revenue tracking, and operational efficiency
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
          <CardHeader className="pb-2 px-0">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Total Staff Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">{reportSummary.totalStaffHours.toLocaleString()}h</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">${reportSummary.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-success">+12% from last period</p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4" />
              On-Time Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">{reportSummary.onTimePerformance}%</div>
            <p className="text-xs text-success">+3% improvement</p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              Labor Cost
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">${reportSummary.totalLaborCost.toLocaleString()}</div>
            <p className="text-xs text-warning">+{reportSummary.laborCostVariance}% vs. estimate</p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4" />
              Avg Staff Rating
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">{reportSummary.avgStaffRating}</div>
            <p className="text-xs text-success">+0.1 this month</p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              Geo Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">{reportSummary.geoCompliance}%</div>
            <p className="text-xs text-info">Location tracking</p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              Staff Utilization
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">{reportSummary.staffUtilization}%</div>
            <p className="text-xs text-success">+5% from last period</p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Percent className="w-4 h-4" />
              Profit Margin
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">{reportSummary.profitMargin}%</div>
            <p className="text-xs text-success">+2% from last period</p>
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
                <p className="text-sm text-muted-foreground">
                  Track actual vs. scheduled hours with utilization rates
                </p>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Revenue vs Labor Cost */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Revenue vs Labor Cost</CardTitle>
                  <Badge className="bg-primary text-primary-foreground">Weekly Essential</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Monitor revenue performance against labor costs
                </p>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* On-Time Performance */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Weekly On-Time Performance</CardTitle>
                  <Badge className="bg-primary text-primary-foreground">Weekly Essential</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Staff punctuality and attendance tracking
                </p>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Labor Cost Variance */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Labor Cost Estimation Accuracy</CardTitle>
                  <Badge className="bg-info text-info-foreground">Cost Control</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Estimated vs. actual labor costs for published shifts
                </p>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>

          {/* Staff Performance Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Staff Rating & Performance Analytics</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comprehensive staff performance tracking with client ratings
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Performance Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Punctuality Rating</TableHead>
                    <TableHead>Professionalism Rating</TableHead>
                    <TableHead>Overall Rating</TableHead>
                    <TableHead>Client Rating</TableHead>
                    <TableHead>Events Completed</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffRatingsData.map((staff, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{staff.punctuality}</span>
                          <Progress value={staff.punctuality * 20} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{staff.professionalism}</span>
                          <Progress value={staff.professionalism * 20} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{staff.overall}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-blue-400 text-blue-400" />
                          <span>{staff.clientRating}</span>
                        </div>
                      </TableCell>
                      <TableCell>{staff.events}</TableCell>
                      <TableCell>
                        <Badge variant={staff.overall >= 4.8 ? "default" : staff.overall >= 4.5 ? "secondary" : "outline"}>
                          {staff.overall >= 4.8 ? "Excellent" : staff.overall >= 4.5 ? "Good" : "Needs Improvement"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Geo-Location Compliance */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Geo-Location Attendance Tracking</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Real-time location compliance and attendance verification
                  </p>
                </div>
                <Badge className="bg-success text-success-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  Live Tracking Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Recent Attendance</h4>
                  {attendanceTrackingData.map((day, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{day.date}</span>
                        <Badge variant={day.compliance >= 95 ? "default" : "secondary"}>
                          {day.compliance}% Compliance
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Total Staff:</span>
                          <span>{day.totalStaff}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Checked In:</span>
                          <span className="text-success">{day.checkedIn}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>On Location:</span>
                          <span className="text-info">{day.onLocation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Late Check-ins:</span>
                          <span className="text-warning">{day.lateCheckIns}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Geo Violations:</span>
                          <span className="text-destructive">{day.geoViolations}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="md:col-span-2">
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={attendanceTrackingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="checkedIn" stackId="1" stroke="#059669" fill="#059669" name="Checked In" />
                      <Area type="monotone" dataKey="onLocation" stackId="2" stroke="#0369a1" fill="#0369a1" name="On Location" />
                    </AreaChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-success/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium">Compliance Rate</span>
                      </div>
                      <div className="text-2xl font-semibold text-success">94.8%</div>
                      <p className="text-xs text-muted-foreground">Average this week</p>
                    </div>
                    
                    <div className="p-3 bg-warning/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="text-sm font-medium">Violations</span>
                      </div>
                      <div className="text-2xl font-semibold text-warning">4</div>
                      <p className="text-xs text-muted-foreground">Total this week</p>
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
              <CardHeader>
                <CardTitle>Revenue Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#5E1916" strokeWidth={2} name="Revenue" />
                    <Line type="monotone" dataKey="profit" stroke="#7A1712" strokeWidth={2} name="Profit" />
                    <Line type="monotone" dataKey="laborCost" stroke="#d97706" strokeWidth={2} name="Labor Cost" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={eventTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {eventTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Staff Utilization Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={staffUtilizationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="utilization" fill="#5E1916" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Satisfaction Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={clientSatisfactionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[3.5, 5]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="satisfaction" stroke="#5E1916" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Admin Report</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Create custom reports for operational insights
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Type</label>
                  <Select value={selectedReport} onValueChange={setSelectedReport}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableReports.map((report) => (
                        <SelectItem key={report.id} value={report.id}>
                          {report.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Period</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV Data</SelectItem>
                      <SelectItem value="dashboard">Interactive Dashboard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Include Labor Cost Estimates</label>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="laborCosts" className="rounded" defaultChecked />
                    <label htmlFor="laborCosts" className="text-sm">Show estimated vs. actual labor costs</label>
                  </div>
                </div>
                <Button className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Admin Reports</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Essential reports prioritized by business importance
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableReports.map((report) => (
                    <div key={report.id} className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium">{report.name}</h3>
                        <Badge variant={
                          report.priority === 'high' ? 'default' : 
                          report.priority === 'medium' ? 'secondary' : 'outline'
                        }>
                          {report.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" variant={report.priority === 'high' ? 'default' : 'outline'}>
                          <Download className="h-4 w-4 mr-1" />
                          Generate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions for Weekly Essentials */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Essential Reports - Quick Actions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Generate the three most important weekly reports with one click
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-24 flex-col gap-2">
                  <Clock className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Staff Hours Report</div>
                    <div className="text-xs opacity-80">Weekly utilization analysis</div>
                  </div>
                </Button>
                
                <Button className="h-24 flex-col gap-2" variant="outline">
                  <DollarSign className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Revenue & Costs</div>
                    <div className="text-xs opacity-80">Financial performance</div>
                  </div>
                </Button>
                
                <Button className="h-24 flex-col gap-2" variant="outline">
                  <CheckCircle className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">On-Time Performance</div>
                    <div className="text-xs opacity-80">Staff punctuality metrics</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Automated Report Schedule</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your weekly, monthly, and quarterly automated reports
                  </p>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Last Generated</TableHead>
                    <TableHead>Next Scheduled</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.name}</div>
                          <div className="text-xs text-muted-foreground">{report.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.type}</Badge>
                      </TableCell>
                      <TableCell>{report.frequency}</TableCell>
                      <TableCell>{report.lastGenerated}</TableCell>
                      <TableCell>{report.nextScheduled}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Schedule Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Essentials Schedule</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your most important reports delivered automatically
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Staff Hours Report</p>
                      <p className="text-sm text-muted-foreground">Every Monday at 9:00 AM</p>
                    </div>
                  </div>
                  <Badge className="bg-success text-success-foreground">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Revenue & Cost Report</p>
                      <p className="text-sm text-muted-foreground">Every Monday at 9:30 AM</p>
                    </div>
                  </div>
                  <Badge className="bg-success text-success-foreground">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">On-Time Performance</p>
                      <p className="text-sm text-muted-foreground">Every Monday at 10:00 AM</p>
                    </div>
                  </div>
                  <Badge className="bg-success text-success-foreground">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Delivery Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure how and when you receive reports
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Email Recipients</label>
                    <div className="text-sm text-muted-foreground">admin@extremestaffing.com, manager@extremestaffing.com</div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Delivery Format</label>
                    <div className="text-sm text-muted-foreground">PDF + Excel attachments</div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Alert Preferences</label>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="overtime" defaultChecked />
                        <label htmlFor="overtime">Alert when staff overtime exceeds 10%</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="attendance" defaultChecked />
                        <label htmlFor="attendance">Alert when on-time performance drops below 90%</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="costs" defaultChecked />
                        <label htmlFor="costs">Alert when labor cost variance exceeds 5%</label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Timer className="h-4 w-4 mr-2" />
                  Configure Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
