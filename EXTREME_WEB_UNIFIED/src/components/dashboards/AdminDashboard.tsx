import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Progress } from "../ui/progress";
import {
  Users,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  Star,
  Activity,
  Target,
  BarChart3,
  Settings,
  Plus,
  FileText,
  Shield,
  Zap,
  Loader2,
} from "lucide-react";
import api from "../../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart, PieChart, Pie, Cell } from "recharts";

export function AdminDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [eventsRes, staffRes, usersRes] = await Promise.all([
          api.get('/events'),
          api.get('/staff'),
          api.get('/users'),
        ]);
        const ed = eventsRes.data;
        const sd = staffRes.data;
        const ud = usersRes.data;
        setEvents(Array.isArray(ed) ? ed : (ed?.data || ed?.events || []));
        setStaff(Array.isArray(sd) ? sd : (sd?.data || sd?.staff || []));
        setUsers(Array.isArray(ud) ? ud : (ud?.data || ud?.users || []));
      } catch (err) {
        // Silently handle — dashboard shows 0s on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Calculate overall stats from real data
  const totalClients = users.filter((u: any) => u.role === 'CLIENT').length;
  const totalStaff = staff.length;
  const totalEvents = events.length;
  const activeEvents = events.filter((e: any) => {
    const s = (e.status || '').toUpperCase();
    return s === 'CONFIRMED' || s === 'IN_PROGRESS';
  }).length;
  const totalRevenue = events.reduce((sum: number, e: any) => sum + (e.budget || 0), 0);
  const completedEvents = events.filter((e: any) => (e.status || '').toUpperCase() === 'COMPLETED').length;
  const avgEventValue = totalEvents > 0 ? totalRevenue / totalEvents : 0;

  // Staff metrics
  const activeStaff = staff.filter((s: any) => s.isActive !== false).length;
  const avgStaffRating = staff.length > 0
    ? staff.reduce((sum: number, s: any) => sum + (s.rating || 0), 0) / staff.length
    : 0;

  // Monthly revenue chart — static placeholder (no time-series API yet)
  const monthlyRevenueData = [
    { month: 'Jan', revenue: 24000, events: 8, clients: 5 },
    { month: 'Feb', revenue: 18000, events: 6, clients: 4 },
    { month: 'Mar', revenue: 32000, events: 12, clients: 8 },
    { month: 'Apr', revenue: 28000, events: 10, clients: 7 },
    { month: 'May', revenue: 42000, events: 16, clients: 12 },
    { month: 'Jun', revenue: 36000, events: 14, clients: 10 },
  ];

  // Event status from real data
  const eventStatusData = [
    { status: 'Completed', count: events.filter((e: any) => (e.status || '').toUpperCase() === 'COMPLETED').length, color: 'var(--success)' },
    { status: 'Confirmed', count: events.filter((e: any) => (e.status || '').toUpperCase() === 'CONFIRMED').length, color: 'var(--info)' },
    { status: 'Pending', count: events.filter((e: any) => (e.status || '').toUpperCase() === 'PENDING').length, color: 'var(--warning)' },
    { status: 'Cancelled', count: events.filter((e: any) => (e.status || '').toUpperCase() === 'CANCELLED').length, color: 'var(--destructive)' },
  ];

  // Top staff by rating
  const staffPerformanceData = [...staff]
    .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5)
    .map((s: any) => ({
      name: s.user?.name || s.firstName || 'Staff',
      rating: s.rating || 0,
      events: s._count?.shifts || 0,
      hours: (s._count?.shifts || 0) * 6,
    }));



  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="desktop-text-3xl font-medium text-foreground">Admin Dashboard</h1>
          <p className="desktop-text-base text-muted-foreground mt-2">
            Complete overview of your staffing operations
          </p>
        </div>
        <div className="flex items-center gap-3 justify-start 2xl:justify-end">
          <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="desktop-stats-grid">
        <Card className="desktop-card-padding">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 desktop-text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="desktop-text-2xl font-medium text-foreground">${totalRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="desktop-text-xs text-success">+24% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="desktop-card-padding">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 desktop-text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Active Events
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="desktop-text-2xl font-medium text-foreground">{activeEvents}</div>
            <div className="flex items-center gap-2 mt-2">
              <Activity className="w-3 h-3 text-info" />
              <span className="desktop-text-xs text-muted-foreground">Of {totalEvents} total</span>
            </div>
          </CardContent>
        </Card>

        <Card className="desktop-card-padding">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 desktop-text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              Active Staff
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="desktop-text-2xl font-medium text-foreground">{activeStaff}</div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="desktop-text-xs text-success">{activeStaff} active</span>
            </div>
          </CardContent>
        </Card>

        <Card className="desktop-card-padding">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 desktop-text-sm text-muted-foreground">
              <Building2 className="w-4 h-4" />
              Total Clients
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="desktop-text-2xl font-medium text-foreground">{totalClients}</div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="desktop-text-xs text-success">+3 this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="desktop-card-padding">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 desktop-text-sm text-muted-foreground">
              <Star className="w-4 h-4" />
              Avg Staff Rating
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="desktop-text-2xl font-medium text-foreground">{avgStaffRating.toFixed(1)}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="desktop-text-xs text-warning">★★★★★</span>
            </div>
          </CardContent>
        </Card>

        <Card className="desktop-card-padding">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 desktop-text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="desktop-text-2xl font-medium text-foreground">96%</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="desktop-text-xs text-success">Excellent performance</span>
            </div>
          </CardContent>
        </Card>

        <Card className="desktop-card-padding">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 desktop-text-sm text-muted-foreground">
              <BarChart3 className="w-4 h-4" />
              Avg Event Value
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="desktop-text-2xl font-medium text-foreground">${Math.round(avgEventValue).toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="desktop-text-xs text-success">+15% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="desktop-card-padding">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 desktop-text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="desktop-text-2xl font-medium text-foreground">2.4h</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="desktop-text-xs text-success">Avg client response</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="desktop-first-3-col">
        <Card className="desktop-card-padding">
          <CardHeader>
            <CardTitle className="desktop-text-lg">Monthly Revenue</CardTitle>
            <p className="desktop-text-sm text-muted-foreground">Revenue trend over time</p>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] 2xl:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenueData}>
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
                    dataKey="revenue"
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

        <Card className="desktop-card-padding">
          <CardHeader>
            <CardTitle className="desktop-text-lg">Event Status</CardTitle>
            <p className="desktop-text-sm text-muted-foreground">Current event distribution</p>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] 2xl:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eventStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {eventStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {eventStatusData.map((item) => (
                <div key={item.status} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="desktop-text-xs text-muted-foreground">{item.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="desktop-card-padding">
          <CardHeader>
            <CardTitle className="desktop-text-lg">Staff Performance</CardTitle>
            <p className="desktop-text-sm text-muted-foreground">Top performing staff members</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staffPerformanceData.map((staff, index) => (
                <div key={staff.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="desktop-text-xs font-medium text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="desktop-text-sm font-medium text-foreground">{staff.name}</p>
                      <p className="desktop-text-xs text-muted-foreground">{staff.events} events</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-warning fill-current" />
                      <span className="desktop-text-sm font-medium text-foreground">{staff.rating}</span>
                    </div>
                    <p className="desktop-text-xs text-muted-foreground">{staff.hours}h</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Actions */}
      <div className="desktop-first-2-col">
        <Card className="desktop-card-padding">
          <CardHeader>
            <CardTitle className="desktop-text-lg">Quick Actions</CardTitle>
            <p className="desktop-text-sm text-muted-foreground">Frequently used admin functions</p>
          </CardHeader>
          <CardContent className="desktop-actions-grid">
            <Button className="flex flex-col gap-2 h-auto py-4 bg-primary hover:bg-primary-hover text-primary-foreground">
              <Plus className="w-6 h-6" />
              <span className="desktop-text-sm">Add Event</span>
            </Button>

            <Button variant="outline" className="flex flex-col gap-2 h-auto py-4">
              <Users className="w-6 h-6" />
              <span className="desktop-text-sm">Manage Staff</span>
            </Button>

            <Button variant="outline" className="flex flex-col gap-2 h-auto py-4">
              <Building2 className="w-6 h-6" />
              <span className="desktop-text-sm">Client Portal</span>
            </Button>

            <Button variant="outline" className="flex flex-col gap-2 h-auto py-4">
              <DollarSign className="w-6 h-6" />
              <span className="desktop-text-sm">Process Payroll</span>
            </Button>

            <Button variant="outline" className="flex flex-col gap-2 h-auto py-4">
              <FileText className="w-6 h-6" />
              <span className="desktop-text-sm">Generate Report</span>
            </Button>

            <Button variant="outline" className="flex flex-col gap-2 h-auto py-4">
              <Settings className="w-6 h-6" />
              <span className="desktop-text-sm">System Settings</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="desktop-card-padding">
          <CardHeader>
            <CardTitle className="desktop-text-lg">Recent Activity</CardTitle>
            <p className="desktop-text-sm text-muted-foreground">Latest system activities</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-accent rounded-lg">
                <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="desktop-text-sm font-medium text-foreground">Event Completed</h4>
                  <p className="desktop-text-xs text-muted-foreground">Corporate Gala 2024 finished successfully</p>
                </div>
                <span className="desktop-text-xs text-muted-foreground">2 hours ago</span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-accent rounded-lg">
                <div className="w-10 h-10 bg-info rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="desktop-text-sm font-medium text-foreground">New Staff Member</h4>
                  <p className="desktop-text-xs text-muted-foreground">Alexandra Johnson joined the team</p>
                </div>
                <span className="desktop-text-xs text-muted-foreground">5 hours ago</span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-accent rounded-lg">
                <div className="w-10 h-10 bg-warning rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="desktop-text-sm font-medium text-foreground">Payroll Processed</h4>
                  <p className="desktop-text-xs text-muted-foreground">September payroll completed for all staff</p>
                </div>
                <span className="desktop-text-xs text-muted-foreground">1 day ago</span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-accent rounded-lg">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="desktop-text-sm font-medium text-foreground">New Client</h4>
                  <p className="desktop-text-xs text-muted-foreground">Premium Events Corp signed up</p>
                </div>
                <span className="desktop-text-xs text-muted-foreground">2 days ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
