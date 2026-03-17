import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { TooltipWrapper, IconTooltip } from "../components/ui/tooltip-wrapper";
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  BarChart3,
  ArrowUpRight,
  Eye,
  MessageSquare,
  FileText,
  Building2,
  ClipboardCheck,
  UserCog,
  Settings,
  Award,
  Package,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  CreditCard,
  Receipt,
  Filter
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner@2.0.3";

interface SubAdminProps {
  userRole: string;
  userId: string;
}

export function SubAdmin({ userRole, userId }: SubAdminProps) {
  const { setCurrentPage } = useNavigation();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Dashboard stats
  const dashboardStats = {
    totalEvents: 47,
    activeEvents: 12,
    totalStaff: 243,
    activeStaff: 89,
    monthlyRevenue: 284500,
    revenueChange: 15.3,
    pendingApprovals: 14,
    clientSatisfaction: 94,
    staffUtilization: 76,
    avgEventRating: 4.7,
    pendingPayroll: 23,
    upcomingEvents: 28
  };

  // Recent activities
  const recentActivities = [
    {
      id: "act-1",
      type: "event",
      title: "New event created",
      description: "Corporate Gala - Tech Summit 2025",
      timestamp: "15 mins ago",
      icon: Calendar,
      color: "text-blue-600"
    },
    {
      id: "act-2",
      type: "staff",
      title: "Staff member onboarded",
      description: "Jessica Chen - Bartender",
      timestamp: "1 hour ago",
      icon: UserCog,
      color: "text-green-600"
    },
    {
      id: "act-3",
      type: "approval",
      title: "Timesheet approved",
      description: "Week ending Dec 21 - 15 timesheets",
      timestamp: "2 hours ago",
      icon: CheckCircle2,
      color: "text-emerald-600"
    },
    {
      id: "act-4",
      type: "finance",
      title: "Invoice generated",
      description: "INV-2025-1247 - $12,450",
      timestamp: "3 hours ago",
      icon: Receipt,
      color: "text-purple-600"
    },
    {
      id: "act-5",
      type: "alert",
      title: "Shift rejection alert",
      description: "2 staff rejected upcoming shifts",
      timestamp: "4 hours ago",
      icon: AlertTriangle,
      color: "text-amber-600"
    }
  ];

  // Pending approvals
  const pendingApprovals = [
    {
      id: "appr-1",
      type: "Timesheet",
      staff: "Michael Rodriguez",
      event: "Wedding Reception",
      amount: "$425.00",
      date: "Dec 20, 2025",
      status: "pending"
    },
    {
      id: "appr-2",
      type: "Timesheet",
      staff: "Sarah Johnson",
      event: "Corporate Gala",
      amount: "$380.00",
      date: "Dec 19, 2025",
      status: "pending"
    },
    {
      id: "appr-3",
      type: "Time Off",
      staff: "David Chen",
      event: "N/A",
      amount: "Dec 25-27",
      date: "Dec 18, 2025",
      status: "pending"
    },
    {
      id: "appr-4",
      type: "Expense",
      staff: "Emma Wilson",
      event: "Product Launch",
      amount: "$156.50",
      date: "Dec 20, 2025",
      status: "pending"
    }
  ];

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'events':
        setCurrentPage('events');
        break;
      case 'staff':
        setCurrentPage('workforce');
        break;
      case 'clients':
        setCurrentPage('clients');
        break;
      case 'payroll':
        setCurrentPage('payroll');
        break;
      case 'reports':
        setCurrentPage('reports');
        break;
      case 'timesheets':
        setCurrentPage('timesheets');
        break;
      default:
        toast.info(`Opening ${action}...`);
    }
  };

  const handleApproval = (id: string, approved: boolean) => {
    toast.success(approved ? "Item approved successfully" : "Item rejected");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Sub-Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage operations, approve requests, and oversee day-to-day activities
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Events</p>
                <p className="text-2xl">{dashboardStats.activeEvents}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dashboardStats.totalEvents} total
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Staff</p>
                <p className="text-2xl">{dashboardStats.activeStaff}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dashboardStats.totalStaff} total
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl">${(dashboardStats.monthlyRevenue / 1000).toFixed(1)}k</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3 text-green-600" />
                  <p className="text-xs text-green-600">
                    +{dashboardStats.revenueChange}%
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl">{dashboardStats.pendingApprovals}</p>
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs mt-1"
                  onClick={() => setSelectedTab("approvals")}
                >
                  Review now
                </Button>
              </div>
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/20">
                <ClipboardCheck className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm">Client Satisfaction</p>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {dashboardStats.clientSatisfaction}%
              </Badge>
            </div>
            <Progress value={dashboardStats.clientSatisfaction} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm">Staff Utilization</p>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {dashboardStats.staffUtilization}%
              </Badge>
            </div>
            <Progress value={dashboardStats.staffUtilization} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm">Avg Event Rating</p>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <Star className="w-3 h-3 mr-1 fill-amber-500" />
                {dashboardStats.avgEventRating}
              </Badge>
            </div>
            <Progress value={dashboardStats.avgEventRating * 20} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="approvals">
            Pending Approvals
            {dashboardStats.pendingApprovals > 0 && (
              <Badge className="ml-2 bg-[#5E1916]">{dashboardStats.pendingApprovals}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('events')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Events
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('staff')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Staff
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('timesheets')}
                >
                  <ClipboardCheck className="w-4 h-4 mr-2" />
                  Review Timesheets
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('payroll')}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Process Payroll
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('clients')}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Manage Clients
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('reports')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate Reports
                </Button>
              </CardContent>
            </Card>

            {/* System Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Overview</CardTitle>
                <CardDescription>Current status and metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Upcoming Events</span>
                  </div>
                  <span className="font-medium">{dashboardStats.upcomingEvents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Pending Payroll</span>
                  </div>
                  <span className="font-medium">{dashboardStats.pendingPayroll}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Staff Utilization</span>
                  </div>
                  <span className="font-medium">{dashboardStats.staffUtilization}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Client Satisfaction</span>
                  </div>
                  <span className="font-medium">{dashboardStats.clientSatisfaction}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Pending Approvals</span>
                  </div>
                  <Badge className="bg-[#5E1916]">{dashboardStats.pendingApprovals}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                Review and approve timesheets, expenses, and time-off requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingApprovals.map((approval) => (
                  <div
                    key={approval.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{approval.type}</Badge>
                        <span className="font-medium">{approval.staff}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{approval.event}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted: {approval.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{approval.amount}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleApproval(approval.id, false)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproval(approval.id, true)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                      <div className={`p-2 rounded-lg bg-muted ${activity.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
