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
import { useState, useEffect } from "react";
import { analyticsService } from "../services/analytics.service";

interface AnalyticsProps {
  userRole: string;
  userId: string;
}

export function Analytics({ userRole, userId }: AnalyticsProps) {
  const [dateRange, setDateRange] = useState("6months");
  const [metric, setMetric] = useState("revenue");
  const [adminData, setAdminData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (userRole === 'admin') {
      setIsLoading(true);
      setLoadError(false);
      analyticsService.getAdminAnalytics()
        .then(data => setAdminData(data))
        .catch(() => setLoadError(true))
        .finally(() => setIsLoading(false));
    }
  }, [userRole]);

  const getAnalyticsData = () => {
    switch (userRole) {
      case "admin":
        return {
          title: adminData?.title ?? "Admin Analytics",
          subtitle: adminData?.subtitle ?? "Complete system overview and business intelligence",
          metrics: adminData?.metrics ?? [],
          monthlyData: adminData?.monthlyData ?? [],
        };
      case "client":
        return { title: "Client Analytics", subtitle: "Your event performance and spending insights", metrics: [], monthlyData: [] };
      case "staff":
        return { title: "Staff Analytics", subtitle: "Your performance metrics and earnings overview", metrics: [], monthlyData: [] };
      case "manager":
        return { title: "Manager Analytics", subtitle: "Event and team performance overview", metrics: [], monthlyData: [] };
      default:
        return { title: "Analytics", subtitle: "Performance insights and metrics", metrics: [], monthlyData: [] };
    }
  };

  const analyticsData = getAnalyticsData();

  // Performance by category data
  const categoryData = (userRole === 'admin' && adminData?.categoryData) ? adminData.categoryData : [];

  // Detailed event category analytics for admin
  const eventCategoryAnalytics = (userRole === 'admin' && adminData?.eventCategoryAnalytics) ? adminData.eventCategoryAnalytics : [];

  // Monthly trend by category for admin
  const categoryTrendData = (userRole === 'admin' && adminData?.categoryTrendData) ? adminData.categoryTrendData : [];

  // Weekly performance data
  const weeklyData = (userRole === 'admin' && adminData?.weeklyData) ? adminData.weeklyData : [];

  // Goal progress data — admin only, from real API
  const goalData: { goal: string; progress: number; color: string }[] = [];

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-medium text-foreground">{analyticsData.title}</h1>
          <Badge variant="outline" className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            {userRole === 'admin' ? 'Admin' : userRole === 'client' ? 'Client' : 'Staff'}
          </Badge>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          {analyticsData.subtitle}
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <p className="text-sm">Loading analytics data…</p>
          </div>
        </Card>
      )}

      {/* Error state */}
      {loadError && !isLoading && (
        <Card className="p-8 border-destructive/30">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <p className="font-medium">Failed to load analytics</p>
            <p className="text-sm text-muted-foreground">Could not reach the server. Please check your connection and try again.</p>
            <Button variant="outline" size="sm" onClick={() => {
              setLoadError(false);
              setIsLoading(true);
              analyticsService.getAdminAnalytics()
                .then(data => setAdminData(data))
                .catch(() => setLoadError(true))
                .finally(() => setIsLoading(false));
            }}>
              <RefreshCw className="h-4 w-4 mr-2" />Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Content — hidden while loading or errored */}
      {!isLoading && !loadError && <>
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
      {analyticsData.metrics.length === 0 ? (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <BarChart3 className="h-8 w-8" />
            <p className="text-sm">No metrics data available yet</p>
          </div>
        </Card>
      ) : (
      <div className="adaptive-stats-grid">
        {analyticsData.metrics.map((metric: any, index: number) => (
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
      )}

      {/* Main Charts */}
      {analyticsData.monthlyData.length > 0 && (
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
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
              {categoryData.map((item: any) => (
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
      )}

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
              {eventCategoryAnalytics.map((category: any, index: number) => (
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
      </>}
    </div>
  );
}
