import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Progress } from "../ui/progress";
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  MapPin,
  Activity,
  BarChart3,
  ArrowUpRight,
  Eye,
  MessageSquare,
  Award,
  Star,
} from "lucide-react";
import { useNavigation } from "../../contexts/NavigationContext";

export function SuperAdminCommandCenter() {
  const { setCurrentPage } = useNavigation();

  // Real-time metrics
  const liveMetrics = {
    activeEvents: 8,
    activeStaff: 127,
    ongoingShifts: 43,
    checkInsToday: 89,
    pendingCheckOuts: 15,
    lateStaff: 3,
    urgentIssues: 2,
  };

  // Today's stats
  const todayStats = {
    totalRevenue: 28450,
    revenueChange: 12.5,
    eventsCompleted: 5,
    eventsUpcoming: 8,
    staffUtilization: 82,
    clientSatisfaction: 96,
    onTimePerformance: 94,
    overtimeHours: 12,
  };

  // Quick status cards data
  const statusCards = [
    {
      title: "Active Events Today",
      value: liveMetrics.activeEvents,
      subtitle: `${liveMetrics.ongoingShifts} ongoing shifts`,
      icon: Radio,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "+2 from yesterday",
      action: "View Live",
      page: "live-ops",
    },
    {
      title: "Staff On Duty",
      value: liveMetrics.activeStaff,
      subtitle: `${liveMetrics.checkInsToday} check-ins today`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: `${liveMetrics.lateStaff} late arrivals`,
      alert: liveMetrics.lateStaff > 0,
      action: "Monitor",
      page: "timesheets",
    },
    {
      title: "Revenue Today",
      value: `$${todayStats.totalRevenue.toLocaleString()}`,
      subtitle: `${todayStats.revenueChange > 0 ? '+' : ''}${todayStats.revenueChange}% vs yesterday`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      trend: todayStats.revenueChange > 0 ? "trending up" : "trending down",
      positive: todayStats.revenueChange > 0,
      action: "Details",
      page: "billing",
    },
    {
      title: "Urgent Actions",
      value: liveMetrics.urgentIssues,
      subtitle: "Require immediate attention",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      trend: "2 critical, 5 warnings",
      alert: true,
      action: "Review",
      page: "dashboard",
    },
  ];

  // Live events happening now
  const liveEvents = [
    {
      id: "evt-001",
      name: "Corporate Gala - Tech Summit 2025",
      client: "Innovate Corp",
      venue: "Grand Ballroom, Downtown",
      status: "in-progress",
      progress: 65,
      staffCount: 24,
      staffPresent: 23,
      startTime: "6:00 PM",
      endTime: "11:00 PM",
      issues: 0,
      manager: "Sarah Mitchell",
    },
    {
      id: "evt-002",
      name: "Wedding Reception - Johnson & Smith",
      client: "Emily Johnson",
      venue: "Riverside Gardens",
      status: "in-progress",
      progress: 40,
      staffCount: 12,
      staffPresent: 12,
      startTime: "5:30 PM",
      endTime: "10:30 PM",
      issues: 0,
      manager: "Marcus Thompson",
    },
    {
      id: "evt-003",
      name: "Product Launch - XYZ Innovation",
      client: "XYZ Technologies",
      venue: "Convention Center Hall A",
      status: "setup",
      progress: 20,
      staffCount: 18,
      staffPresent: 16,
      startTime: "7:00 PM",
      endTime: "10:00 PM",
      issues: 1,
      issueType: "2 staff late",
      manager: "David Chen",
    },
  ];

  // Pending actions
  const pendingActions = [
    {
      id: 1,
      type: "approval",
      title: "Overtime Approval Needed",
      description: "15 staff members exceeded regular hours this week",
      priority: "high",
      count: 15,
      action: "Review & Approve",
      page: "timesheets",
    },
    {
      id: 2,
      type: "review",
      title: "Client Feedback Pending",
      description: "5 events awaiting client satisfaction review",
      priority: "medium",
      count: 5,
      action: "Review Feedback",
      page: "events",
    },
    {
      id: 3,
      type: "certification",
      title: "Expiring Certifications",
      description: "8 staff certifications expire within 30 days",
      priority: "medium",
      count: 8,
      action: "Send Reminders",
      page: "staff",
    },
    {
      id: 4,
      type: "invoice",
      title: "Pending Invoices",
      description: "12 invoices ready to be sent to clients",
      priority: "high",
      count: 12,
      action: "Review & Send",
      page: "billing",
    },
    {
      id: 5,
      type: "hiring",
      title: "Interview Scheduling",
      description: "8 candidates awaiting interview dates",
      priority: "low",
      count: 8,
      action: "Schedule",
      page: "interviews",
    },
  ];

  // Upcoming critical events
  const upcomingCritical = [
    {
      id: "evt-010",
      name: "Annual Charity Gala",
      client: "Hope Foundation",
      date: "Tomorrow",
      time: "6:00 PM",
      staffNeeded: 35,
      staffAssigned: 35,
      status: "ready",
      budget: 15000,
    },
    {
      id: "evt-011",
      name: "Corporate Conference",
      client: "Global Ventures Inc",
      date: "Nov 12",
      time: "8:00 AM",
      staffNeeded: 50,
      staffAssigned: 48,
      status: "pending",
      budget: 28000,
    },
    {
      id: "evt-012",
      name: "VIP Wedding",
      client: "Anderson Family",
      date: "Nov 15",
      time: "4:00 PM",
      staffNeeded: 40,
      staffAssigned: 42,
      status: "ready",
      budget: 22000,
    },
  ];

  // Top performers this week
  const topPerformers = [
    {
      id: "staff-001",
      name: "Jennifer Martinez",
      role: "Senior Server",
      shiftsCompleted: 12,
      rating: 4.9,
      revenue: 2400,
      onTimeRate: 100,
    },
    {
      id: "staff-002",
      name: "Michael Chen",
      role: "Bartender",
      shiftsCompleted: 10,
      rating: 4.8,
      revenue: 2100,
      onTimeRate: 100,
    },
    {
      id: "staff-003",
      name: "Sarah Johnson",
      role: "Event Coordinator",
      shiftsCompleted: 8,
      rating: 4.9,
      revenue: 1950,
      onTimeRate: 100,
    },
    {
      id: "staff-004",
      name: "David Williams",
      role: "Server",
      shiftsCompleted: 11,
      rating: 4.7,
      revenue: 1850,
      onTimeRate: 91,
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-progress":
        return "text-green-600 bg-green-100";
      case "setup":
        return "text-blue-600 bg-blue-100";
      case "ready":
        return "text-emerald-600 bg-emerald-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl tracking-tight">Command Center</h1>
          <p className="text-muted-foreground mt-1">
            Real-time operations monitoring and control
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live Updates
          </Badge>
          <Button variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Activity Log
          </Button>
        </div>
      </div>

      {/* Quick Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statusCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  {card.alert && (
                    <Badge variant="destructive" className="text-xs">
                      Alert
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-2xl">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.title}</p>
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => setCurrentPage(card.page)}
                    >
                      {card.action}
                      <ArrowUpRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="live" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live" className="gap-2">
            <Radio className="w-4 h-4" />
            Live Operations
          </TabsTrigger>
          <TabsTrigger value="actions" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Pending Actions
            {pendingActions.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingActions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="gap-2">
            <Calendar className="w-4 h-4" />
            Upcoming Events
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <Award className="w-4 h-4" />
            Top Performers
          </TabsTrigger>
        </TabsList>

        {/* Live Operations Tab */}
        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Events In Progress
                  </CardTitle>
                  <CardDescription>
                    {liveEvents.filter((e) => e.status === "in-progress").length} active events
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setCurrentPage("live-ops")}>
                  Full View
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liveEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border rounded-lg space-y-3 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setCurrentPage("events")}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{event.name}</h4>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status === "in-progress" ? "Live" : event.status}
                          </Badge>
                          {event.issues > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {event.issueType}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.venue}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.startTime} - {event.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {event.staffPresent}/{event.staffCount} staff
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Manager: {event.manager}</span>
                          <span>•</span>
                          <span>Client: {event.client}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-2xl">{event.progress}%</div>
                        <p className="text-xs text-muted-foreground">Complete</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Event Progress</span>
                        <span className="font-medium">{event.progress}%</span>
                      </div>
                      <Progress value={event.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actions Required</CardTitle>
              <CardDescription>
                {pendingActions.length} items requiring your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingActions.map((action) => (
                  <div
                    key={action.id}
                    className={`p-4 border rounded-lg flex items-start justify-between hover:bg-accent/50 transition-colors ${getPriorityColor(
                      action.priority
                    )}`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{action.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {action.count} items
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(action.page)}
                    >
                      {action.action}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upcoming Events Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Critical Upcoming Events</CardTitle>
              <CardDescription>High-priority events in the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingCritical.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border rounded-lg space-y-2 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setCurrentPage("events")}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{event.name}</h4>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.client}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {event.date} at {event.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {event.staffAssigned}/{event.staffNeeded} staff
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${event.budget.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {event.staffAssigned < event.staffNeeded && (
                        <Badge variant="destructive">Understaffed</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Performers Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers This Week</CardTitle>
              <CardDescription>Staff with outstanding performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformers.map((performer, index) => (
                  <div
                    key={performer.id}
                    className="p-4 border rounded-lg flex items-center justify-between hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setCurrentPage("staff")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {performer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                            <Award className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{performer.name}</p>
                        <p className="text-sm text-muted-foreground">{performer.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-medium">{performer.shiftsCompleted}</p>
                        <p className="text-xs text-muted-foreground">Shifts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {performer.rating}
                        </p>
                        <p className="text-xs text-muted-foreground">Rating</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          ${performer.revenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{performer.onTimeRate}%</p>
                        <p className="text-xs text-muted-foreground">On-Time</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Row - Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Staff Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl">{todayStats.staffUtilization}%</div>
              <Progress value={todayStats.staffUtilization} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {liveMetrics.activeStaff} of 155 staff working
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Client Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl flex items-center gap-2">
                {todayStats.clientSatisfaction}%
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <Progress value={todayStats.clientSatisfaction} className="h-2" />
              <p className="text-xs text-muted-foreground">Based on 47 reviews this month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">On-Time Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl">{todayStats.onTimePerformance}%</div>
              <Progress value={todayStats.onTimePerformance} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {liveMetrics.lateStaff} late arrivals today
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Overtime Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl">{todayStats.overtimeHours}h</div>
              <p className="text-xs text-muted-foreground">This week</p>
              <Button variant="outline" size="sm" className="w-full mt-2">
                Review Approvals
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
