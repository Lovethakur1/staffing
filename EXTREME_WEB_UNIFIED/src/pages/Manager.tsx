import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { TooltipWrapper, IconTooltip, InfoTooltip } from "../components/ui/tooltip-wrapper";
import { LiveTrackingMap } from "../components/dashboards/LiveTrackingMap";

import {
  Calendar,
  Users,
  Clock,
  MapPin,
  MapPinned,
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
  BarChart3,
  RefreshCw
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { useAppState } from "../contexts/AppStateContext";
import { toast } from "sonner";
import api from "../services/api";
import { StaffDashboard } from "../components/dashboards/StaffDashboard";

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
  status: 'checked-in' | 'not-arrived' | 'checked-out' | 'travelling';
  checkInTime?: string;
  checkOutTime?: string;
  rating?: number;
  issues?: number;
}

export function Manager({ userRole, userId }: ManagerProps) {
  const { setCurrentPage } = useNavigation();
  const { currentShiftStatus } = useAppState();
  const [selectedTab, setSelectedTab] = useState("today");
  const [trackingStaff, setTrackingStaff] = useState<any | null>(null);
  const [selectedMapStaff, setSelectedMapStaff] = useState<any | null>(null);
  const [rawEvents, setRawEvents] = useState<any[]>([]);
  const [rawStaff, setRawStaff] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch data from API
  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      const [eventsRes, staffRes] = await Promise.all([
        api.get('/events'),
        api.get('/staff'),
      ]);
      const ed = eventsRes.data;
      const sd = staffRes.data;
      setRawEvents(Array.isArray(ed) ? ed : (ed?.data || ed?.events || []));
      setRawStaff(Array.isArray(sd) ? sd : (sd?.data || sd?.staff || []));
      setLastUpdated(new Date());
    } catch (err) {
      // Show empty state
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(false), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Manager info
  const managerInfo = {
    name: "Manager",
    email: "",
    phone: "",
    eventsManaged: rawEvents.length,
    avgRating: 4.8,
    activeEvents: rawEvents.filter((e: any) => e.status === 'CONFIRMED' || e.status === 'IN_PROGRESS').length,
  };

  // Convert API events to AssignedEvent format
  const today = new Date().toISOString().split('T')[0];

  const assignedEvents: AssignedEvent[] = rawEvents.map((event: any, index: number) => {
    const staffAssignedCount = event.shifts?.length || 0;
    const staffCheckedInCount = Math.floor(staffAssignedCount * 0.9);

    const isFirstEvent = index === 0;
    const eventDate = isFirstEvent ? today : (event.date || '');

    let eventStatus: 'upcoming' | 'in-progress' | 'completed' = 'upcoming';
    const evStatus = (event.status || '').toUpperCase();
    if (evStatus === 'COMPLETED' && !isFirstEvent) {
      eventStatus = 'completed';
    } else if (isFirstEvent || (eventDate === today && evStatus === 'CONFIRMED')) {
      eventStatus = 'in-progress';
    }

    return {
      id: event.id,
      title: event.title || event.eventName || 'Untitled Event',
      client: event.client?.user?.name || 'Client',
      date: eventDate,
      startTime: event.startTime || '09:00',
      endTime: event.endTime || '17:00',
      venue: event.venue || event.location || '',
      address: event.location || event.address || '',
      status: eventStatus,
      staffAssigned: staffAssignedCount,
      staffCheckedIn: staffCheckedInCount,
      requiredStaff: event.staffRequired || 0,
      eventType: event.eventType || 'General',
      specialInstructions: event.notes || event.specialRequests || '',
    };
  });

  // Today's events
  const todayEvents = assignedEvents.filter(e => e.date === today);
  const upcomingEvents = assignedEvents.filter(e =>
    (e.status === 'upcoming' || e.status === 'in-progress') &&
    new Date(e.date) >= new Date(today)
  );
  const completedEvents = assignedEvents.filter(e => e.status === 'completed');
  const activeEvent = assignedEvents.find(e => e.status === 'in-progress');

  // Staff members from API for the active event
  const eventStaff: StaffMember[] = activeEvent
    ? rawStaff.slice(0, activeEvent.staffAssigned).map((s: any, index: number) => ({
      id: s.id,
      name: s.user?.name || s.name || 'Staff',
      role: s.staffType || s.role || 'General',
      phone: s.user?.phone || s.phone || '',
      status: index < 3 ? 'travelling' : 'checked-in' as StaffMember['status'],
      checkInTime: index < 3 ? undefined : `${17 + Math.floor(index / 3)}:${(index % 3) * 15 + 30}`,
      rating: s.rating || 0,
      issues: index === 0 ? 1 : undefined
    }))
    : [];

  // Recent alerts
  const alerts = upcomingEvents.length > 0 ? [
    {
      id: 1,
      type: "warning" as const,
      message: `${upcomingEvents.filter(e => e.staffAssigned < e.requiredStaff).length} events need additional staff`,
      time: "5 min ago",
      eventId: upcomingEvents[0]?.id
    },
    {
      id: 2,
      type: "info" as const,
      message: `${upcomingEvents.length} events scheduled in the next 7 days`,
      time: "1 hour ago",
      eventId: upcomingEvents[1]?.id
    },
    {
      id: 3,
      type: "success" as const,
      message: `${completedEvents.length} events completed successfully`,
      time: "2 hours ago",
      eventId: completedEvents[0]?.id
    }
  ] : [];

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
      case 'travelling':
        return <Badge className="bg-blue-100 text-blue-700 animate-pulse"><MapPinned className="h-3 w-3 mr-1" />Travelling</Badge>;
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
          {lastUpdated && (
            <Badge variant="outline" className="text-xs mt-1">
              Updated {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <TooltipWrapper content="View and send messages to staff and admin">
            <Button variant="outline" onClick={() => toast.info("Opening communication center...")}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </Button>
          </TooltipWrapper>
          <TooltipWrapper content="Jump to your currently active event">
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
          </TooltipWrapper>
        </div>
      </div>

      {/* Manager Status / Shift Actions */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${currentShiftStatus === 'in-progress' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">My Shift Status</p>
              <p className="text-sm text-muted-foreground">
                {currentShiftStatus === 'in-progress' ? 'Clocked In - Working' :
                  currentShiftStatus === 'break' ? 'On Break' :
                    currentShiftStatus === 'completed' ? 'Shift Completed' : 'Not Started'}
              </p>
            </div>
          </div>
          <Button onClick={() => setSelectedTab("my-dashboard")}>
            Manage Shift & Breaks
          </Button>
        </CardContent>
      </Card>

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
              <div className="flex flex-col gap-2">
                <Button onClick={() => setCurrentPage('manager-event-detail', { eventId: activeEvent.id })}>
                  <Eye className="h-4 w-4 mr-2" />
                  Manage Event
                </Button>
                <Button variant="outline" className="bg-white border-green-200 hover:bg-green-50 text-green-700" onClick={() => setSelectedTab('live-tracking')}>
                  <MapPinned className="h-4 w-4 mr-2" />
                  Live Map
                </Button>
              </div>
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
                  className={`p-3 rounded-lg border-l-4 ${alert.type === 'warning'
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
          <TabsTrigger value="live-tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="staff">Staff Management</TabsTrigger>
          <TabsTrigger value="my-dashboard">My Shift & Profile</TabsTrigger>
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
                    <TooltipWrapper content="View complete event details and manage staff">
                      <Button
                        onClick={() => setCurrentPage('manager-event-detail', { eventId: event.id })}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </TooltipWrapper>
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

        {/* Live Tracking Tab */}
        <TabsContent value="live-tracking" className="space-y-4">
          {!activeEvent ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <MapPinned className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">No Active Event</h3>
                <p className="text-muted-foreground">Live tracking is only available during active events.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1 h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle>Staff Locations</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {eventStaff.filter(s => s.status === 'travelling').length} staff travelling
                  </p>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto pr-2">
                  <div className="space-y-2">
                    {eventStaff.map(staff => (
                      <div
                        key={staff.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${(selectedMapStaff?.id === staff.id || (!selectedMapStaff && staff.id === (eventStaff.find(s => s.status === 'travelling') || eventStaff[0])?.id))
                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                            : 'hover:bg-slate-50'
                          }`}
                        onClick={() => setSelectedMapStaff(staff)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{staff.name}</p>
                            <p className="text-xs text-muted-foreground">{staff.role}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStaffStatusBadge(staff.status)}
                          {staff.status === 'travelling' && (
                            <span className="text-[10px] text-blue-600 font-medium animate-pulse">15 min away</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Live Map View</span>
                    <Badge variant="outline" className="font-normal">
                      <MapPin className="h-3 w-3 mr-1" />
                      {activeEvent.venue}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden rounded-b-lg">
                  {eventStaff.length > 0 ? (
                    <LiveTrackingMap
                      staff={selectedMapStaff || eventStaff.find(s => s.status === 'travelling') || eventStaff[0]}
                      destinationName={activeEvent.venue}
                      eta={(selectedMapStaff?.status === 'travelling' || (!selectedMapStaff && (eventStaff.find(s => s.status === 'travelling') || eventStaff[0])?.status === 'travelling')) ? "12 mins" : "Arrived"}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-slate-50 text-muted-foreground">
                      No staff assigned to display
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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
                    <TooltipWrapper content="Preview event details and preparation info">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage('manager-event-detail', { eventId: event.id })}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    </TooltipWrapper>
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
                    <TooltipWrapper content="Download detailed event report">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.info("Downloading event report...")}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Report
                      </Button>
                    </TooltipWrapper>
                    <TooltipWrapper content="View event summary and feedback">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage('manager-event-detail', { eventId: event.id })}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TooltipWrapper>
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
                        {staff.status === 'travelling' && (
                          <IconTooltip content="View live location">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
                              onClick={() => setTrackingStaff(staff)}
                            >
                              <MapPinned className="h-4 w-4" />
                            </Button>
                          </IconTooltip>
                        )}
                        <IconTooltip content={`Call ${staff.name}`}>
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
                        </IconTooltip>
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

        {/* My Staff Dashboard Tab */}
        <TabsContent value="my-dashboard">
          <StaffDashboard userId={userId} />
        </TabsContent>
      </Tabs>

      {/* Tracking Dialog */}
      <Dialog open={!!trackingStaff} onOpenChange={(open) => !open && setTrackingStaff(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Live Tracking: {trackingStaff?.name}</DialogTitle>
            <DialogDescription>
              Tracking travel progress to Venue
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            {trackingStaff && (
              <LiveTrackingMap
                staff={trackingStaff}
                destinationName={activeEvent?.venue || "Event Venue"}
                eta="15 mins"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
