import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Calendar,
  Users,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Radio,
  MessageSquare,
  FileText,
  TrendingUp,
  Activity,
  Star,
  Phone,
  Mail,
  Navigation,
  ClipboardCheck,
  UserCheck,
  Eye,
  Send,
  Bell,
  BarChart3
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner@2.0.3";

interface ManagerProps {
  userRole: string;
  userId: string;
}

interface AssignedEvent {
  id: string;
  title: string;
  client: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  staffAssigned: number;
  staffCheckedIn: number;
  requiredStaff: number;
  eventType: string;
  specialInstructions?: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  status: 'checked-in' | 'not-arrived' | 'checked-out';
  checkInTime?: string;
  checkOutTime?: string;
  rating?: number;
  issues?: number;
}

export function Manager({ userRole, userId }: ManagerProps) {
  const { setCurrentPage } = useNavigation();
  const [selectedTab, setSelectedTab] = useState("today");

  // Mock manager data
  const managerInfo = {
    name: "Sarah Mitchell",
    email: "sarah.mitchell@company.com",
    phone: "+1 (555) 789-0123",
    eventsManaged: 87,
    avgRating: 4.8,
    activeEvents: 2
  };

  // Mock assigned events
  const assignedEvents: AssignedEvent[] = [
    {
      id: "evt-001",
      title: "Corporate Gala - Tech Summit 2025",
      client: "Innovate Corp",
      date: "2025-10-10",
      startTime: "18:00",
      endTime: "23:00",
      venue: "Grand Ballroom",
      address: "123 Main St, Downtown",
      status: "in-progress",
      staffAssigned: 24,
      staffCheckedIn: 23,
      requiredStaff: 24,
      eventType: "Corporate",
      specialInstructions: "VIP section requires experienced servers. Bar service until 22:00."
    },
    {
      id: "evt-002",
      title: "Wedding Reception - Johnson & Smith",
      client: "Emily Johnson",
      date: "2025-10-10",
      startTime: "17:30",
      endTime: "22:30",
      venue: "Riverside Gardens",
      address: "456 River Rd, Westside",
      status: "upcoming",
      staffAssigned: 12,
      staffCheckedIn: 0,
      requiredStaff: 12,
      eventType: "Wedding",
      specialInstructions: "Coordinate with wedding planner. Setup starts at 15:00."
    },
    {
      id: "evt-003",
      title: "Product Launch - XYZ Innovation",
      client: "XYZ Technologies",
      date: "2025-10-11",
      startTime: "19:00",
      endTime: "22:00",
      venue: "Convention Center Hall A",
      address: "789 Convention Ave",
      status: "upcoming",
      staffAssigned: 18,
      staffCheckedIn: 0,
      requiredStaff: 18,
      eventType: "Corporate",
      specialInstructions: "Tech demos throughout venue. Staff briefing at 18:00."
    },
    {
      id: "evt-004",
      title: "Charity Fundraiser Dinner",
      client: "Hope Foundation",
      date: "2025-10-08",
      startTime: "18:00",
      endTime: "22:00",
      venue: "City Hall Ballroom",
      address: "100 Government Plaza",
      status: "completed",
      staffAssigned: 15,
      staffCheckedIn: 15,
      requiredStaff: 15,
      eventType: "Charity",
      specialInstructions: "Silent auction area needs dedicated staff."
    }
  ];

  // Today's events
  const todayEvents = assignedEvents.filter(e => e.date === "2025-10-10");
  const upcomingEvents = assignedEvents.filter(e => e.status === "upcoming" && e.date > "2025-10-10");
  const completedEvents = assignedEvents.filter(e => e.status === "completed");
  const activeEvent = assignedEvents.find(e => e.status === "in-progress");

  // Mock staff for active event
  const eventStaff: StaffMember[] = [
    {
      id: "staff-001",
      name: "Emma Williams",
      role: "Event Server",
      phone: "+1 (555) 123-4567",
      status: "checked-in",
      checkInTime: "17:45",
      rating: 4.9
    },
    {
      id: "staff-002",
      name: "James Rodriguez",
      role: "Bartender",
      phone: "+1 (555) 234-5678",
      status: "checked-in",
      checkInTime: "17:50",
      rating: 4.8
    },
    {
      id: "staff-003",
      name: "Maria Garcia",
      role: "Event Server",
      phone: "+1 (555) 345-6789",
      status: "checked-in",
      checkInTime: "17:55",
      rating: 4.9
    },
    {
      id: "staff-004",
      name: "David Kim",
      role: "Event Server",
      phone: "+1 (555) 456-7890",
      status: "not-arrived",
      rating: 4.6,
      issues: 1
    }
  ];

  // Recent alerts
  const alerts = [
    {
      id: 1,
      type: "warning",
      message: "1 staff member has not checked in for Corporate Gala",
      time: "5 min ago",
      eventId: "evt-001"
    },
    {
      id: 2,
      type: "info",
      message: "Weather alert: Rain expected at Riverside Gardens",
      time: "1 hour ago",
      eventId: "evt-002"
    },
    {
      id: 3,
      type: "success",
      message: "All staff confirmed for Product Launch event",
      time: "2 hours ago",
      eventId: "evt-003"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-progress':
        return <Badge className="bg-green-100 text-green-700"><Radio className="h-3 w-3 mr-1 animate-pulse" />Live</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-700"><Clock className="h-3 w-3 mr-1" />Upcoming</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-700"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStaffStatusBadge = (status: string) => {
    switch (status) {
      case 'checked-in':
        return <Badge className="bg-green-100 text-green-700"><UserCheck className="h-3 w-3 mr-1" />Checked In</Badge>;
      case 'checked-out':
        return <Badge className="bg-gray-100 text-gray-700"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'not-arrived':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Not Arrived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {managerInfo.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => toast.info("Opening communication center...")}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </Button>
          <Button onClick={() => {
            if (activeEvent) {
              setCurrentPage('manager-event-detail', { eventId: activeEvent.id });
            } else {
              toast.info("No active event right now");
            }
          }}>
            <Activity className="h-4 w-4 mr-2" />
            Active Event
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeEvent ? '1 in progress' : 'None active'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayEvents.reduce((sum, e) => sum + e.staffAssigned, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Assigned today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-in Rate</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeEvent ? Math.round((activeEvent.staffCheckedIn / activeEvent.staffAssigned) * 100) : 0}%
            </div>
            <p className="text-xs text-success">
              {activeEvent ? `${activeEvent.staffCheckedIn}/${activeEvent.staffAssigned} checked in` : 'No active event'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              {managerInfo.avgRating}
            </div>
            <p className="text-xs text-muted-foreground">Average rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Event Alert */}
      {activeEvent && (
        <Card className="border-2 border-green-500 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <Radio className="h-6 w-6 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {activeEvent.title}
                    <Badge className="bg-green-500 text-white">LIVE NOW</Badge>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{activeEvent.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{activeEvent.startTime} - {activeEvent.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{activeEvent.staffCheckedIn}/{activeEvent.staffAssigned} Staff</span>
                    </div>
                    <div>
                      <Progress value={(activeEvent.staffCheckedIn / activeEvent.staffAssigned) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
              <Button onClick={() => setCurrentPage('manager-event-detail', { eventId: activeEvent.id })}>
                <Eye className="h-4 w-4 mr-2" />
                Manage Event
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'warning'
                      ? 'border-yellow-500 bg-yellow-50'
                      : alert.type === 'info'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-green-500 bg-green-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />}
                      {alert.type === 'info' && <Bell className="h-5 w-5 text-blue-600 mt-0.5" />}
                      {alert.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground mt-1">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today's Events</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="staff">Staff Management</TabsTrigger>
        </TabsList>

        {/* Today's Events */}
        <TabsContent value="today" className="space-y-4">
          {todayEvents.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No events scheduled for today</p>
              </CardContent>
            </Card>
          ) : (
            todayEvents.map((event) => (
              <Card key={event.id} className={event.status === 'in-progress' ? 'border-2 border-green-500' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        {getStatusBadge(event.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{event.client}</p>
                    </div>
                    <Button
                      onClick={() => setCurrentPage('manager-event-detail', { eventId: event.id })}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{event.venue}</p>
                        <p className="text-muted-foreground text-xs">{event.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{event.startTime} - {event.endTime}</p>
                        <p className="text-muted-foreground text-xs">
                          {((new Date(`2000-01-01 ${event.endTime}`) as any) - (new Date(`2000-01-01 ${event.startTime}`) as any)) / (1000 * 60 * 60)} hours
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{event.staffAssigned} Staff</p>
                        <p className="text-muted-foreground text-xs">
                          {event.staffCheckedIn} checked in
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Staff Check-in</p>
                      <Progress value={(event.staffCheckedIn / event.staffAssigned) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round((event.staffCheckedIn / event.staffAssigned) * 100)}%
                      </p>
                    </div>
                  </div>

                  {event.specialInstructions && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-900 mb-1">Special Instructions:</p>
                      <p className="text-sm text-blue-800">{event.specialInstructions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Upcoming Events */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming events</p>
              </CardContent>
            </Card>
          ) : (
            upcomingEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        {getStatusBadge(event.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{event.client}</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage('manager-event-detail', { eventId: event.id })}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{new Date(event.date).toLocaleDateString()}</p>
                        <p className="text-muted-foreground text-xs">{event.eventType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{event.venue}</p>
                        <p className="text-muted-foreground text-xs">{event.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{event.startTime} - {event.endTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{event.staffAssigned} Staff Required</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Completed Events */}
        <TabsContent value="completed" className="space-y-4">
          {completedEvents.map((event) => (
            <Card key={event.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      {getStatusBadge(event.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{event.client}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.info("Downloading event report...")}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Report
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage('manager-event-detail', { eventId: event.id })}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{event.venue}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{event.staffAssigned} Staff</p>
                      <p className="text-xs text-success">All checked in</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium text-green-600">Completed Successfully</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Staff Management Tab */}
        <TabsContent value="staff" className="space-y-4">
          {activeEvent ? (
            <Card>
              <CardHeader>
                <CardTitle>Staff for: {activeEvent.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Real-time staff status and management
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {eventStaff.map((staff) => (
                    <div key={staff.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          <p className="text-sm text-muted-foreground">{staff.role}</p>
                          {staff.checkInTime && (
                            <p className="text-xs text-muted-foreground">Checked in at {staff.checkInTime}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{staff.rating}</span>
                        </div>
                        {getStaffStatusBadge(staff.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const phone = staff.phone.replace(/[^0-9]/g, '');
                            window.open(`tel:${phone}`);
                          }}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active event to manage staff</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
