import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { TooltipWrapper, IconTooltip, InfoTooltip } from "../components/ui/tooltip-wrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Star,
  BarChart3,
  Activity,
  Target,
  Download,
  Filter,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Area, 
  AreaChart,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { useState } from "react";

interface AnalyticsProps {
  userRole: string;
  userId: string;
}

export function Analytics({ userRole, userId }: AnalyticsProps) {
  const [dateRange, setDateRange] = useState("6months");
  const [metric, setMetric] = useState("revenue");

  // Sample data based on user role
  const getAnalyticsData = () => {
    switch (userRole) {
      case "client":
        return {
          title: "Client Analytics",
          subtitle: "Your event performance and spending insights",
          metrics: [
            { label: "Total Spent", value: "$24,500", change: "+12%", trend: "up" },
            { label: "Events Hosted", value: "12", change: "+3", trend: "up" },
            { label: "Avg Event Cost", value: "$2,041", change: "-5%", trend: "down" },
            { label: "Staff Rating", value: "4.8", change: "+0.2", trend: "up" },
            { label: "Success Rate", value: "96%", change: "+4%", trend: "up" },
            { label: "Rebookings", value: "8", change: "+2", trend: "up" },
          ],
          monthlyData: [
            { month: 'Jan', spending: 2400, events: 2, satisfaction: 95 },
            { month: 'Feb', spending: 1800, events: 1, satisfaction: 92 },
            { month: 'Mar', spending: 3200, events: 3, satisfaction: 96 },
            { month: 'Apr', spending: 2800, events: 2, satisfaction: 94 },
            { month: 'May', spending: 4200, events: 4, satisfaction: 98 },
            { month: 'Jun', spending: 3600, events: 3, satisfaction: 97 },
          ],
        };
      
      case "staff":
        return {
          title: "Staff Analytics",
          subtitle: "Your performance metrics and earnings overview",
          metrics: [
            { label: "Total Earnings", value: "$8,450", change: "+15%", trend: "up" },
            { label: "Hours Worked", value: "234", change: "+22h", trend: "up" },
            { label: "Events Completed", value: "28", change: "+6", trend: "up" },
            { label: "Average Rating", value: "4.9", change: "+0.1", trend: "up" },
            { label: "Punctuality", value: "98%", change: "+2%", trend: "up" },
            { label: "Rebookings", value: "85%", change: "+5%", trend: "up" },
          ],
          monthlyData: [
            { month: 'Jan', earnings: 1200, hours: 42, rating: 4.8 },
            { month: 'Feb', earnings: 950, hours: 38, rating: 4.7 },
            { month: 'Mar', earnings: 1400, hours: 45, rating: 4.9 },
            { month: 'Apr', earnings: 1100, hours: 40, rating: 4.8 },
            { month: 'May', earnings: 1650, hours: 48, rating: 4.9 },
            { month: 'Jun', earnings: 1350, hours: 44, rating: 4.9 },
          ],
        };
      
      case "admin":
        return {
          title: "Admin Analytics",
          subtitle: "Complete system overview and business intelligence",
          metrics: [
            { label: "Total Revenue", value: "$145K", change: "+24%", trend: "up" },
            { label: "Active Events", value: "47", change: "+8", trend: "up" },
            { label: "Staff Utilization", value: "87%", change: "+5%", trend: "up" },
            { label: "Client Satisfaction", value: "96%", change: "+2%", trend: "up" },
            { label: "Profit Margin", value: "23%", change: "+1%", trend: "up" },
            { label: "Growth Rate", value: "18%", change: "+3%", trend: "up" },
          ],
          monthlyData: [
            { month: 'Jan', revenue: 24000, events: 18, clients: 12 },
            { month: 'Feb', revenue: 18000, events: 14, clients: 9 },
            { month: 'Mar', revenue: 32000, events: 24, clients: 16 },
            { month: 'Apr', revenue: 28000, events: 21, clients: 14 },
            { month: 'May', revenue: 42000, events: 32, clients: 22 },
            { month: 'Jun', revenue: 36000, events: 28, clients: 19 },
          ],
        };
      
      case "manager":
        return {
          title: "Manager Analytics",
          subtitle: "Event and team performance overview",
          metrics: [
            { label: "Active Events", value: "12", change: "+3", trend: "up" },
            { label: "Team Size", value: "24", change: "+2", trend: "up" },
            { label: "Staff Utilization", value: "89%", change: "+4%", trend: "up" },
            { label: "Team Rating", value: "4.7", change: "+0.2", trend: "up" },
            { label: "On-Time Rate", value: "94%", change: "+3%", trend: "up" },
            { label: "Completion Rate", value: "98%", change: "+1%", trend: "up" },
          ],
          monthlyData: [
            { month: 'Jan', events: 8, staff: 18, utilization: 85 },
            { month: 'Feb', events: 6, staff: 20, utilization: 82 },
            { month: 'Mar', events: 10, staff: 22, utilization: 88 },
            { month: 'Apr', events: 9, staff: 21, utilization: 86 },
            { month: 'May', events: 13, staff: 24, utilization: 91 },
            { month: 'Jun', events: 11, staff: 24, utilization: 89 },
          ],
        };
      
      default:
        return {
          title: "Analytics",
          subtitle: "Performance insights and metrics",
          metrics: [],
          monthlyData: [],
        };
    }
  };

  const analyticsData = getAnalyticsData();

  // Performance by category data
  const categoryData = [
    { name: 'Corporate', value: 45, color: 'var(--primary)' },
    { name: 'Wedding', value: 30, color: 'var(--chart-2)' },
    { name: 'Private', value: 15, color: 'var(--chart-3)' },
    { name: 'Conference', value: 10, color: 'var(--chart-4)' },
  ];

  // Detailed event category analytics for admin
  const eventCategoryAnalytics = userRole === 'admin' ? [
    { 
      category: 'Corporate Events', 
      count: 124, 
      revenue: 485000, 
      avgRevenue: 3911,
      growth: '+18%',
      trend: 'up',
      percentage: 42,
      staffRequired: 1240,
      avgStaff: 10,
      satisfaction: 94,
      color: '#5E1916'
    },
    { 
      category: 'Weddings', 
      count: 89, 
      revenue: 312000, 
      avgRevenue: 3506,
      growth: '+24%',
      trend: 'up',
      percentage: 30,
      staffRequired: 890,
      avgStaff: 10,
      satisfaction: 98,
      color: '#8B4513'
    },
    { 
      category: 'Private Parties', 
      count: 67, 
      revenue: 178000, 
      avgRevenue: 2657,
      growth: '+12%',
      trend: 'up',
      percentage: 23,
      staffRequired: 470,
      avgStaff: 7,
      satisfaction: 92,
      color: '#A0522D'
    },
    { 
      category: 'Conferences', 
      count: 28, 
      revenue: 156000, 
      avgRevenue: 5571,
      growth: '-5%',
      trend: 'down',
      percentage: 9,
      staffRequired: 420,
      avgStaff: 15,
      satisfaction: 91,
      color: '#CD853F'
    },
    { 
      category: 'Galas & Fundraisers', 
      count: 22, 
      revenue: 142000, 
      avgRevenue: 6455,
      growth: '+31%',
      trend: 'up',
      percentage: 7,
      staffRequired: 330,
      avgStaff: 15,
      satisfaction: 96,
      color: '#DEB887'
    },
    { 
      category: 'Sports Events', 
      count: 18, 
      revenue: 89000, 
      avgRevenue: 4944,
      growth: '+8%',
      trend: 'up',
      percentage: 6,
      staffRequired: 360,
      avgStaff: 20,
      satisfaction: 89,
      color: '#F4A460'
    },
  ] : [];

  // Monthly trend by category for admin
  const categoryTrendData = userRole === 'admin' ? [
    { month: 'Jan', Corporate: 42000, Wedding: 28000, Private: 15000, Conference: 12000, Gala: 10000, Sports: 8000 },
    { month: 'Feb', Corporate: 38000, Wedding: 24000, Private: 12000, Conference: 14000, Gala: 12000, Sports: 7000 },
    { month: 'Mar', Corporate: 45000, Wedding: 32000, Private: 18000, Conference: 16000, Gala: 14000, Sports: 9000 },
    { month: 'Apr', Corporate: 48000, Wedding: 29000, Private: 16000, Conference: 15000, Gala: 13000, Sports: 8500 },
    { month: 'May', Corporate: 52000, Wedding: 35000, Private: 20000, Conference: 18000, Gala: 16000, Sports: 10000 },
    { month: 'Jun', Corporate: 49000, Wedding: 31000, Private: 17000, Conference: 13000, Gala: 15000, Sports: 9000 },
  ] : [];

  // Weekly performance data
  const weeklyData = [
    { day: 'Mon', performance: 85, target: 90 },
    { day: 'Tue', performance: 92, target: 90 },
    { day: 'Wed', performance: 88, target: 90 },
    { day: 'Thu', performance: 95, target: 90 },
    { day: 'Fri', performance: 90, target: 90 },
    { day: 'Sat', performance: 97, target: 90 },
    { day: 'Sun', performance: 93, target: 90 },
  ];

  // Goal progress data
  const goalData = userRole === 'admin' ? [
    { goal: 'Revenue Target', progress: 78, color: 'var(--primary)' },
    { goal: 'Customer Satisfaction', progress: 96, color: 'var(--success)' },
    { goal: 'Staff Utilization', progress: 87, color: 'var(--info)' },
    { goal: 'Growth Rate', progress: 65, color: 'var(--warning)' },
  ] : [
    { goal: 'Event Completion', progress: 94, color: 'var(--primary)' },
    { goal: 'Customer Satisfaction', progress: 96, color: 'var(--success)' },
    { goal: 'Staff Utilization', progress: 87, color: 'var(--info)' },
    { goal: 'Team Performance', progress: 89, color: 'var(--warning)' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-medium text-foreground">{analyticsData.title}</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          {analyticsData.subtitle}
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Primary Metric" />
              </SelectTrigger>
              <SelectContent>
                {userRole === 'admin' && <SelectItem value="revenue">Revenue</SelectItem>}
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="satisfaction">Satisfaction</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              <span className="sm:hidden">Apply Filters</span>
              <span className="hidden sm:inline">More Filters</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="adaptive-stats-grid">
        {analyticsData.metrics.map((metric, index) => (
          <Card key={index} className="p-4 sm:p-6">
            <CardHeader className="pb-2 px-0">
              <CardTitle className="text-xs sm:text-sm text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-0">
              <div className="text-xl sm:text-2xl font-medium text-foreground">{metric.value}</div>
              <div className="flex items-center gap-2 mt-2">
                {metric.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-success" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-destructive" />
                )}
                <span className={`text-xs ${
                  metric.trend === "up" ? "text-success" : "text-destructive"
                }`}>
                  {metric.change}
                </span>
                <span className="text-xs text-muted-foreground">vs last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts */}
      <div className="wide-content-grid">
        <Card className="p-4 sm:p-6">
          <CardHeader className="px-0 pb-4">
            <CardTitle className="text-base sm:text-lg">
              {userRole === "client" ? "Spending Trend" : 
               userRole === "staff" ? "Earnings Trend" : 
               userRole === "admin" ? "Revenue Trend" : "Event Trend"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Monthly performance over time
            </p>
          </CardHeader>
          <CardContent className="px-0">
            <div className="h-[250px] sm:h-[300px] md:h-[350px] xl:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={userRole === "client" ? "spending" : userRole === "staff" ? "earnings" : userRole === "admin" ? "revenue" : "events"}
                    stroke="var(--primary)" 
                    fill="var(--primary)"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4 sm:p-6">
          <CardHeader className="px-0 pb-4">
            <CardTitle className="text-base sm:text-lg">Performance by Category</CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribution across event types
            </p>
          </CardHeader>
          <CardContent className="px-0">
            <div className="h-[250px] sm:h-[300px] md:h-[350px] xl:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs sm:text-sm text-foreground">{item.name}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">({item.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Category Analytics - Admin Only */}
      {userRole === 'admin' && eventCategoryAnalytics.length > 0 && (
        <>
          {/* Category Breakdown Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-medium">Event Category Analytics</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Detailed breakdown by event type to identify trends and opportunities
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventCategoryAnalytics.map((category, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Calendar className="w-5 h-5" style={{ color: category.color }} />
                      </div>
                      <div>
                        <h3 className="font-medium">{category.category}</h3>
                        <p className="text-xs text-muted-foreground">{category.percentage}% of total</p>
                      </div>
                    </div>
                    <Badge 
                      className={category.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                    >
                      {category.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {category.growth}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-t">
                      <span className="text-sm text-muted-foreground">Total Events</span>
                      <span className="font-medium">{category.count}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-t">
                      <span className="text-sm text-muted-foreground">Total Revenue</span>
                      <span className="font-medium">${(category.revenue / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-t">
                      <span className="text-sm text-muted-foreground">Avg Revenue/Event</span>
                      <span className="font-medium">${category.avgRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-t">
                      <span className="text-sm text-muted-foreground">Staff Required</span>
                      <span className="font-medium">{category.staffRequired} ({category.avgStaff}/event)</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-t">
                      <span className="text-sm text-muted-foreground">Satisfaction</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{category.satisfaction}%</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Revenue Trend by Category */}
          <Card className="p-6">
            <CardHeader className="px-0 pb-4">
              <CardTitle className="text-lg">Revenue Trend by Event Category</CardTitle>
              <p className="text-sm text-muted-foreground">
                Monthly revenue comparison across different event types
              </p>
            </CardHeader>
            <CardContent className="px-0">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={categoryTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="Corporate" stroke="#5E1916" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Wedding" stroke="#8B4513" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Private" stroke="#A0522D" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Conference" stroke="#CD853F" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Gala" stroke="#DEB887" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Sports" stroke="#F4A460" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-4 mt-4 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#5E1916' }} />
                  <span className="text-sm">Corporate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8B4513' }} />
                  <span className="text-sm">Wedding</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#A0522D' }} />
                  <span className="text-sm">Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#CD853F' }} />
                  <span className="text-sm">Conference</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#DEB887' }} />
                  <span className="text-sm">Gala</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F4A460' }} />
                  <span className="text-sm">Sports</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Insights */}
          <Card className="p-6">
            <CardHeader className="px-0 pb-4">
              <CardTitle className="text-lg">Category Performance Insights</CardTitle>
              <p className="text-sm text-muted-foreground">
                Key observations and recommendations based on event category data
              </p>
            </CardHeader>
            <CardContent className="px-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-green-900">Top Performer</h4>
                  </div>
                  <p className="text-sm text-green-800">
                    <strong>Corporate Events</strong> lead with 124 events and $485K revenue. Highest volume category with strong growth at +18%.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Highest Satisfaction</h4>
                  </div>
                  <p className="text-sm text-blue-800">
                    <strong>Weddings</strong> achieve 98% satisfaction with exceptional growth at +24%. Premium pricing opportunity.
                  </p>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-orange-600" />
                    <h4 className="font-medium text-orange-900">Highest Average Revenue</h4>
                  </div>
                  <p className="text-sm text-orange-800">
                    <strong>Galas & Fundraisers</strong> command $6,455 per event average. Focus on acquiring more of these high-value events.
                  </p>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h4 className="font-medium text-red-900">Needs Attention</h4>
                  </div>
                  <p className="text-sm text-red-800">
                    <strong>Conferences</strong> showing -5% decline. Review pricing strategy and client satisfaction to reverse trend.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Performance Details */}
      <div className="wide-content-grid">
        <Card className="p-4 sm:p-6">
          <CardHeader className="px-0 pb-4">
            <CardTitle className="text-base sm:text-lg">Weekly Performance</CardTitle>
            <p className="text-sm text-muted-foreground">
              Daily performance vs target
            </p>
          </CardHeader>
          <CardContent className="px-0">
            <div className="h-[250px] sm:h-[300px] md:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="performance" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="var(--muted)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4 sm:p-6">
          <CardHeader className="px-0 pb-4">
            <CardTitle className="text-base sm:text-lg">Goal Progress</CardTitle>
            <p className="text-sm text-muted-foreground">
              Progress towards key objectives
            </p>
          </CardHeader>
          <CardContent className="px-0">
            <div className="space-y-4 sm:space-y-6">
              {goalData.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{goal.goal}</span>
                    <span className="text-sm text-muted-foreground">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${goal.progress}%`,
                        backgroundColor: goal.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <Card className="p-4 sm:p-6">
        <CardHeader className="px-0 pb-4">
          <CardTitle className="text-base sm:text-lg">Key Insights & Recommendations</CardTitle>
          <p className="text-sm text-muted-foreground">
            AI-powered insights based on your data
          </p>
        </CardHeader>
        <CardContent className="px-0">
          <div className="space-y-4">
            <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-success/10 border border-success/20 rounded-lg">
              <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-success mb-1">Strong Performance</h4>
                <p className="text-sm text-foreground">
                  {userRole === "client" 
                    ? "Your event satisfaction rates are 15% above industry average. Consider expanding your event portfolio."
                    : userRole === "staff"
                      ? "Your punctuality and performance ratings are exceptional. You're eligible for premium shift opportunities."
                      : "Revenue growth is exceeding targets by 24%. Consider expanding staff capacity to meet increasing demand."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-info/10 border border-info/20 rounded-lg">
              <div className="w-8 h-8 bg-info rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-info mb-1">Optimization Opportunity</h4>
                <p className="text-sm text-foreground">
                  {userRole === "client"
                    ? "Corporate events show highest ROI. Consider focusing 60% of your budget on corporate event types."
                    : userRole === "staff"
                      ? "Your availability on weekends matches high-demand periods. Consider updating your rates for premium time slots."
                      : "Staff utilization is highest on weekends. Consider implementing dynamic pricing for peak periods."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="w-8 h-8 bg-warning rounded-full flex items-center justify-center flex-shrink-0">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-warning mb-1">Action Needed</h4>
                <p className="text-sm text-foreground">
                  {userRole === "client"
                    ? "Your rebooking rate for favorite staff is declining. Consider setting up automatic rebooking preferences."
                    : userRole === "staff"
                      ? "Complete your professional certification to access higher-paying event categories."
                      : "Client acquisition cost is increasing. Focus on retention and referral programs to improve profitability."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}