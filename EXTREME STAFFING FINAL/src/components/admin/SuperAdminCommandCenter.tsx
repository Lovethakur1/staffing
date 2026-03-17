import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Progress } from "../ui/progress";
import { TooltipWrapper, IconTooltip } from "../ui/tooltip-wrapper";
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
  UserX,
  RefreshCw,
  Phone,
  Mail,
  ExternalLink
} from "lucide-react";
import { useNavigation } from "../../contexts/NavigationContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";

export function SuperAdminCommandCenter() {
  const { setCurrentPage } = useNavigation();

  // Dialog states
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [selectedRejection, setSelectedRejection] = useState<any>(null);
  const [replacementStaffId, setReplacementStaffId] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  // Recent Shift Rejections Data (Stateful)
  const [recentRejections, setRecentRejections] = useState([
    {
      id: "rej-1",
      staffName: "Alex Morgan",
      staffId: "st-001",
      role: "Bartender",
      event: "Corporate Gala",
      eventId: "evt-001",
      date: "Tomorrow, 6:00 PM",
      location: "Grand Ballroom",
      reason: "Family emergency",
      timestamp: "10 mins ago"
    },
    {
      id: "rej-2",
      staffName: "Sam Wilson",
      staffId: "st-002",
      role: "Security",
      event: "Tech Summit",
      eventId: "evt-002",
      date: "Nov 12, 8:00 AM",
      location: "Convention Center",
      reason: "Transportation issues",
      timestamp: "35 mins ago"
    },
    {
      id: "rej-3",
      staffName: "Jordan Lee",
      staffId: "st-003",
      role: "Server",
      event: "Wedding Reception",
      eventId: "evt-003",
      date: "Nov 15, 4:00 PM",
      location: "Riverside Gardens",
      reason: "Conflict with another job",
      timestamp: "1 hour ago"
    }
  ]);

  // Real-time metrics
  const liveMetrics = {
    activeEvents: 8,
    activeStaff: 127,
    ongoingShifts: 43,
    checkInsToday: 89,
    pendingCheckOuts: 15,
    lateStaff: 3,
    urgentIssues: 2 + recentRejections.length, 
    shiftRejections: recentRejections.length,
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

  // Mock available staff for reassignment
  const availableStaff = [
    { id: "avail-1", name: "Jessica Chang", role: "Bartender", rating: 4.9, distance: "2.1 miles" },
    { id: "avail-2", name: "Marcus Johnson", role: "Security", rating: 4.7, distance: "5.4 miles" },
    { id: "avail-3", name: "Emily Blunt", role: "Server", rating: 4.8, distance: "1.2 miles" },
    { id: "avail-4", name: "Robert De Niro", role: "Server", rating: 5.0, distance: "3.0 miles" },
    { id: "avail-5", name: "Chris Evans", role: "Bartender", rating: 4.6, distance: "8.5 miles" },
  ];

  // Handlers
  const handleReassignClick = (rejection: any) => {
    setSelectedRejection(rejection);
    setReplacementStaffId("");
    setIsReassignDialogOpen(true);
  };

  const confirmReassign = () => {
    if (!replacementStaffId) {
      toast.error("Please select a staff member");
      return;
    }

    const replacement = availableStaff.find(s => s.id === replacementStaffId);
    
    // Remove from rejections list
    setRecentRejections(prev => prev.filter(r => r.id !== selectedRejection.id));
    
    toast.success(`Shift reassigned to ${replacement?.name}`);
    setIsReassignDialogOpen(false);
    setSelectedRejection(null);
  };

  const handleContactClick = (rejection: any) => {
    setSelectedRejection(rejection);
    setContactMessage(`Hi ${rejection.staffName.split(' ')[0]}, regarding your rejection for the ${rejection.event}...`);
    setIsContactDialogOpen(true);
  };

  const sendContactMessage = () => {
    if (!contactMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    toast.success(`Message sent to ${selectedRejection.staffName}`);
    setIsContactDialogOpen(false);
    setSelectedRejection(null);
  };

  const viewEventDetails = (eventId: string) => {
    setCurrentPage('admin-event-detail', { eventId });
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
      trend: `${liveMetrics.shiftRejections} shift rejections`,
      alert: true,
      action: "Review",
      page: "dashboard",
    },
  ];



  // Pending actions
  const pendingActions = [
    {
      id: 0,
      type: "rejection",
      title: "Shift Rejections",
      description: `${recentRejections.length} staff members declined assigned shifts`,
      priority: "high",
      count: recentRejections.length,
      action: "Reassign Shifts",
      page: "shift-conflicts",
    },
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
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header Section */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl tracking-tight">Command Center</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Real-time operations monitoring and control
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1 text-xs sm:text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live Updates
          </Badge>
          <TooltipWrapper content="View detailed activity log of all system operations">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <Activity className="w-4 h-4 mr-2" />
              Activity Log
            </Button>
          </TooltipWrapper>
        </div>
      </div>

      {/* Quick Status Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statusCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.color}`} />
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
                  <p className="text-xl sm:text-2xl font-semibold">{card.value}</p>
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
      <Tabs defaultValue="actions" className="space-y-4 w-full">
        <div className="overflow-x-auto">
          <TabsList className="w-full sm:w-auto flex sm:inline-flex">
            <TabsTrigger value="actions" className="gap-1 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm">
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Pending Actions</span>
              <span className="sm:hidden">Actions</span>
              {pendingActions.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {pendingActions.length}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger value="upcoming" className="gap-1 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Upcoming Events</span>
              <span className="sm:hidden">Upcoming</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-1 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm">
              <Award className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Top Performers</span>
              <span className="sm:hidden">Top</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Pending Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          {/* Urgent Rejections Card */}
          {recentRejections.length > 0 && (
            <Card className="border-red-200 bg-red-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-red-700">
                  <UserX className="w-5 h-5" />
                  Recent Shift Rejections
                </CardTitle>
                <CardDescription>
                  Staff members have declined their assigned shifts. Immediate reassignment needed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentRejections.map((rejection) => (
                    <div key={rejection.id} className="bg-white p-3 rounded-md border border-red-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{rejection.staffName}</span>
                          <Badge variant="outline" className="text-xs text-red-600 border-red-200">Declined</Badge>
                          <span className="text-xs text-muted-foreground">• {rejection.timestamp}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Reason:</span> {rejection.reason}
                        </div>
                        <div className="text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                           <div className="flex items-center gap-1">
                             <Calendar className="w-3 h-3" /> 
                             {rejection.date}
                           </div>
                           <div className="flex items-center gap-1">
                             <MapPin className="w-3 h-3" /> 
                             {rejection.location}
                           </div>
                           <Button 
                             variant="link" 
                             className="h-auto p-0 text-xs text-blue-600 gap-1 ml-0 sm:ml-2"
                             onClick={() => viewEventDetails(rejection.eventId)}
                           >
                             {rejection.event}
                             <ExternalLink className="w-3 h-3" />
                           </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                         <Button 
                           size="sm" 
                           variant="outline" 
                           className="flex-1 sm:flex-none h-8 text-xs"
                           onClick={() => handleContactClick(rejection)}
                         >
                           <Mail className="w-3 h-3 mr-1" />
                           Contact
                         </Button>
                         <Button 
                           size="sm" 
                           className="flex-1 sm:flex-none h-8 text-xs bg-red-600 hover:bg-red-700"
                           onClick={() => handleReassignClick(rejection)}
                         >
                           <RefreshCw className="w-3 h-3 mr-1" />
                           Reassign
                         </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">All Actions Required</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {pendingActions.length} items requiring your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingActions.map((action) => (
                  <div
                    key={action.id}
                    className={`p-3 sm:p-4 border rounded-lg flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 hover:bg-accent/50 transition-colors ${getPriorityColor(
                      action.priority
                    )}`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-medium text-sm sm:text-base">{action.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {action.count} items
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(action.page)}
                      className="w-full sm:w-auto flex-shrink-0"
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
              <CardTitle className="text-base sm:text-lg">Critical Upcoming Events</CardTitle>
              <CardDescription className="text-xs sm:text-sm">High-priority events in the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingCritical.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 sm:p-4 border rounded-lg space-y-2 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setCurrentPage("events")}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-medium text-sm sm:text-base truncate">{event.name}</h4>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{event.client}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            {event.date} at {event.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 flex-shrink-0" />
                            {event.staffAssigned}/{event.staffNeeded} staff
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3 flex-shrink-0" />
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
              <CardTitle className="text-base sm:text-lg">Top Performers This Week</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Staff with outstanding performance metrics</CardDescription>
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

      {/* Reassign Dialog */}
      <Dialog open={isReassignDialogOpen} onOpenChange={setIsReassignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reassign Shift</DialogTitle>
            <DialogDescription>
              Assign a new staff member for {selectedRejection?.event}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="bg-muted/50 p-3 rounded-md text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">Role:</span>
                  <p className="font-medium">{selectedRejection?.role}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p className="font-medium">{selectedRejection?.date}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Reason for Rejection:</span>
                  <p className="text-destructive font-medium">{selectedRejection?.reason}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff">Select Replacement</Label>
              <Select value={replacementStaffId} onValueChange={setReplacementStaffId}>
                <SelectTrigger id="staff">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {availableStaff
                    .filter(s => s.role === selectedRejection?.role)
                    .map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{staff.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {staff.rating} ★ • {staff.distance}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                  {availableStaff.filter(s => s.role === selectedRejection?.role).length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No matching staff available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReassignDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmReassign}>Confirm Reassignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Staff</DialogTitle>
            <DialogDescription>
              Send a message to {selectedRejection?.staffName}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>Cancel</Button>
            <Button onClick={sendContactMessage}>Send Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
