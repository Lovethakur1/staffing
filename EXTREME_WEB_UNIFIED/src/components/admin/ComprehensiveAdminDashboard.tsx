import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { 
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Settings,
  BarChart3,
  MapPin,
  Shield,
  Download,
  Bell,
  Activity
} from "lucide-react";
import { UserManagement } from "./UserManagement";
import { HiringOnboarding } from "./HiringOnboarding";
import { SchedulingEventManagement } from "./SchedulingEventManagement";
import { mockUsers, mockEvents, mockStaff, mockPayrollRecords, mockRatings } from "../../data/mockData";

interface AdminDashboardProps {
  adminId: string;
}

export function ComprehensiveAdminDashboard({ adminId }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate comprehensive statistics
  const totalRevenue = mockEvents.reduce((sum, event) => sum + event.budget, 0);
  const totalStaff = mockStaff.length;
  const activeStaff = mockStaff.filter(s => s.isActive).length;
  const totalClients = mockUsers.filter(user => user.role === 'client').length;
  const averageRating = mockRatings.length > 0 
    ? mockRatings.reduce((sum, rating) => sum + rating.overall, 0) / mockRatings.length 
    : 0;

  const upcomingEvents = mockEvents.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    return eventDate >= today && event.status !== 'completed';
  }).length;

  const pendingApplications = 8; // Mock data
  const contractsSigned = 15; // Mock data
  const totalHoursThisMonth = mockPayrollRecords.reduce((sum, record) => sum + record.totalHours, 0);

  const alertsData = [
    {
      id: 1,
      type: 'warning',
      title: 'Staff Shortage Alert',
      message: 'Corporate Gala on Jan 10 needs 2 more bartenders',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'info',
      title: 'New Application',
      message: 'Sarah Johnson applied for Event Coordinator position',
      time: '4 hours ago'
    },
    {
      id: 3,
      type: 'success',
      title: 'Contract Signed',
      message: 'Michael Chen signed employment contract',
      time: '1 day ago'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'user_created',
      description: 'New client account created for ABC Corp',
      timestamp: '10 minutes ago',
      user: 'System'
    },
    {
      id: 2,
      type: 'event_assigned',
      description: 'Assigned 5 staff members to Wedding Reception',
      timestamp: '25 minutes ago',
      user: 'Admin Smith'
    },
    {
      id: 3,
      type: 'payroll_processed',
      description: 'Processed payroll for 23 staff members',
      timestamp: '1 hour ago',
      user: 'Admin Johnson'
    },
    {
      id: 4,
      type: 'override_applied',
      description: 'Applied rate override for premium event',
      timestamp: '2 hours ago',
      user: 'Admin Smith'
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'info': return <Bell className="h-4 w-4 text-blue-600" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      default: return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_created': return <UserPlus className="h-4 w-4 text-blue-600" />;
      case 'event_assigned': return <Calendar className="h-4 w-4 text-purple-600" />;
      case 'payroll_processed': return <DollarSign className="h-4 w-4 text-emerald-600" />;
      case 'override_applied': return <Settings className="h-4 w-4 text-amber-600" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Admin Control Center</h1>
          <p className="text-muted-foreground">
            Comprehensive platform management and oversight dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Administrator
          </Badge>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="hiring" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Hiring</span>
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Scheduling</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm text-emerald-600">+12.5%</span>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Staff</p>
                    <p className="text-2xl font-bold">{activeStaff}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm text-emerald-600">+3 this month</span>
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Client Satisfaction</p>
                    <p className="text-2xl font-bold">{averageRating.toFixed(1)}/5</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-muted-foreground">Average rating</span>
                    </div>
                  </div>
                  <Star className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                    <p className="text-2xl font-bold">{totalHoursThisMonth}h</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-600">This month</span>
                    </div>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Upcoming Events</p>
                    <p className="text-xl font-semibold">{upcomingEvents}</p>
                  </div>
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Applications</p>
                    <p className="text-xl font-semibold">{pendingApplications}</p>
                  </div>
                  <UserPlus className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Contracts Signed</p>
                    <p className="text-xl font-semibold">{contractsSigned}</p>
                  </div>
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Clients</p>
                    <p className="text-xl font-semibold">{totalClients}</p>
                  </div>
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Platform Health & Alerts */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Platform Health & Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Health Indicators */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Staff Utilization</span>
                      <span className="text-sm text-muted-foreground">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Event Capacity</span>
                      <span className="text-sm text-muted-foreground">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>

                {/* Recent Alerts */}
                <div className="space-y-3">
                  <h4 className="font-medium">Recent Alerts</h4>
                  {alertsData.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{activity.user}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button className="h-20 flex-col gap-2" onClick={() => setActiveTab('users')}>
                  <UserPlus className="h-6 w-6" />
                  <span>Create User</span>
                </Button>
                <Button className="h-20 flex-col gap-2" variant="outline" onClick={() => setActiveTab('scheduling')}>
                  <Calendar className="h-6 w-6" />
                  <span>Assign Staff</span>
                </Button>
                <Button className="h-20 flex-col gap-2" variant="outline" onClick={() => setActiveTab('hiring')}>
                  <FileText className="h-6 w-6" />
                  <span>Process Applications</span>
                </Button>
                <Button className="h-20 flex-col gap-2" variant="outline">
                  <DollarSign className="h-6 w-6" />
                  <span>Run Payroll</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        {/* Hiring & Onboarding Tab */}
        <TabsContent value="hiring">
          <HiringOnboarding />
        </TabsContent>

        {/* Scheduling & Event Management Tab */}
        <TabsContent value="scheduling">
          <SchedulingEventManagement />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Reports & Analytics</h2>
              <p className="text-muted-foreground">
                Generate comprehensive reports and view detailed analytics
              </p>
            </div>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export All Data
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Revenue, payroll, and financial analytics
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Monthly Revenue Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Payroll Summary
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Client Billing Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Staff Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Staff performance and utilization metrics
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Staff Performance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Attendance Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Skills Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Event Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Event analytics and client satisfaction
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Event Success Rate
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Client Feedback
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Booking Trends
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <p>Revenue chart visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Staff Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-4" />
                    <p>Staff utilization chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
