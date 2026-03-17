import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { 
  Calendar,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  MessageSquare,
  Phone,
  Mail,
  Navigation,
  UserCheck,
  UserX,
  Bell,
  Activity,
  Shield,
  Eye,
  TrendingUp,
  Award
} from "lucide-react";
import { EventOverview } from "./EventOverview";
import { StaffRoster } from "./StaffRoster";
import { AttendanceTracking } from "./AttendanceTracking";
import { PerformanceMonitoring } from "./PerformanceMonitoring";
import { CommunicationCenter } from "./CommunicationCenter";
import { mockEvents, mockStaff, mockShifts } from "../../data/mockData";

interface ManagerDashboardProps {
  managerId: string;
}

export function ManagerDashboard({ managerId }: ManagerDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock manager data - memoized to prevent re-computation on every render
  const managerEvents = useMemo(() => 
    mockEvents.filter(event => 
      event.assignedStaff.includes(managerId) || event.managerId === managerId
    ), [managerId]
  );

  const todaysEvents = useMemo(() => 
    managerEvents.filter(event => {
      const eventDate = new Date(event.date);
      const today = new Date();
      return eventDate.toDateString() === today.toDateString();
    }), [managerEvents]
  );

  const upcomingEvents = useMemo(() => 
    managerEvents.filter(event => {
      const eventDate = new Date(event.date);
      const today = new Date();
      return eventDate > today;
    }), [managerEvents]
  );

  // Mock staff data for events this manager oversees - memoized
  const managedStaff = useMemo(() => 
    mockStaff.filter(staff => 
      managerEvents.some(event => event.assignedStaff.includes(staff.id))
    ), [managerEvents]
  );

  const checkedInStaff = managedStaff.filter(staff => staff.isActive).length;
  const totalStaffNeeded = managerEvents.reduce((sum, event) => sum + event.staffRequired, 0);

  // Calculate performance metrics
  const activeEvents = todaysEvents.length;
  const completionRate = 92; // Mock data
  const avgStaffRating = 4.3; // Mock data
  const onTimeRate = 87; // Mock data

  const alertsData = [
    {
      id: 1,
      type: 'warning',
      title: 'Late Check-in',
      message: 'Sarah Johnson is 15 minutes late for Corporate Gala',
      time: '10 minutes ago',
      eventId: 'event-1'
    },
    {
      id: 2,
      type: 'info',
      title: 'Location Update',
      message: 'Michael Chen has arrived at Wedding Reception venue',
      time: '25 minutes ago',
      eventId: 'event-2'
    },
    {
      id: 3,
      type: 'success',
      title: 'All Staff Present',
      message: 'Product Launch event is fully staffed and ready',
      time: '1 hour ago',
      eventId: 'event-3'
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle className="h-4 w-4 text-amber-600" />;
      case 'info': return <Bell className="h-4 w-4 text-blue-600" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      default: return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Oversee events, manage staff, and ensure exceptional service delivery
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Event Manager
          </Badge>
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Quick Message
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Events</p>
                <p className="text-2xl font-bold">{activeEvents}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600">Live now</span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Staff Attendance</p>
                <p className="text-2xl font-bold">{checkedInStaff}/{managedStaff.length}</p>
                <div className="flex items-center gap-1 mt-1">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-emerald-600">{onTimeRate}% on time</span>
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
                <p className="text-sm font-medium text-muted-foreground">Performance Score</p>
                <p className="text-2xl font-bold">{avgStaffRating}/5</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-muted-foreground">Average rating</span>
                </div>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-emerald-600">+5% this month</span>
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Staff Roster</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Attendance</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Performance</span>
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Messages</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Events */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todaysEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">No events scheduled for today</p>
                    </div>
                  ) : (
                    todaysEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{event.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{event.time}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{event.assignedStaff.length}/{event.staffRequired} staff</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            {event.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Live Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Live Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alertsData.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
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
                <Button className="h-20 flex-col gap-2" onClick={() => setActiveTab('attendance')}>
                  <UserCheck className="h-6 w-6" />
                  <span>Check-In Staff</span>
                </Button>
                <Button className="h-20 flex-col gap-2" variant="outline" onClick={() => setActiveTab('communication')}>
                  <MessageSquare className="h-6 w-6" />
                  <span>Send Message</span>
                </Button>
                <Button className="h-20 flex-col gap-2" variant="outline" onClick={() => setActiveTab('performance')}>
                  <Star className="h-6 w-6" />
                  <span>Rate Performance</span>
                </Button>
                <Button className="h-20 flex-col gap-2" variant="outline">
                  <Navigation className="h-6 w-6" />
                  <span>View Locations</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Roster Tab */}
        <TabsContent value="staff">
          <StaffRoster managerId={managerId} events={managerEvents} />
        </TabsContent>

        {/* Attendance Tracking Tab */}
        <TabsContent value="attendance">
          <AttendanceTracking managerId={managerId} events={managerEvents} />
        </TabsContent>

        {/* Performance Monitoring Tab */}
        <TabsContent value="performance">
          <PerformanceMonitoring managerId={managerId} events={managerEvents} />
        </TabsContent>

        {/* Communication Center Tab */}
        <TabsContent value="communication">
          <CommunicationCenter managerId={managerId} events={managerEvents} />
        </TabsContent>
      </Tabs>
    </div>
  );
}