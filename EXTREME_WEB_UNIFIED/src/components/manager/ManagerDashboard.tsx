import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { toast } from "sonner";
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
  Award,
  Coffee,
  Play,
  Pause,
  Timer
} from "lucide-react";
import { EventOverview } from "./EventOverview";
import { StaffRoster } from "./StaffRoster";
import { AttendanceTracking } from "./AttendanceTracking";
import { PerformanceMonitoring } from "./PerformanceMonitoring";
import { CommunicationCenter } from "./CommunicationCenter";
// Data fetched via API in useEffect below
import api from "../../services/api";

interface ManagerDashboardProps {
  managerId: string;
}

export function ManagerDashboard({ managerId }: ManagerDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [events, setEvents] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  // Manager's Personal Shift State (Manager as Staff)
  const [shiftStatus, setShiftStatus] = useState<'idle' | 'working' | 'break' | 'completed'>('working');
  const [breakTimer, setBreakTimer] = useState(0);
  const [workTimer, setWorkTimer] = useState(0);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);

  // Fetch from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, staffRes] = await Promise.all([
          api.get('/events'),
          api.get('/staff'),
        ]);
        const ed = eventsRes.data;
        const sd = staffRes.data;
        setEvents(Array.isArray(ed) ? ed : (ed?.data || ed?.events || []));
        setStaff(Array.isArray(sd) ? sd : (sd?.data || sd?.staff || []));
      } catch (err) {
        // Show empty state
      }
    };
    fetchData();
  }, []);

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (shiftStatus === 'working') {
      interval = setInterval(() => {
        setWorkTimer(prev => prev + 1);
      }, 1000);
    } else if (shiftStatus === 'break') {
      interval = setInterval(() => {
        setBreakTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [shiftStatus]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartBreak = () => {
    setShiftStatus('break');
    toast.info("Break started. Enjoy your rest!");
  };

  const handleEndBreak = () => {
    setShiftStatus('working');
    toast.success("Welcome back! Break ended.");
  };

  const handleClockIn = () => {
    setShiftStatus('working');
    toast.success("Shift started successfully.");
  };

  const handleClockOutClick = () => {
    setShowCheckOutModal(true);
  };

  const confirmClockOut = () => {
    setShiftStatus('completed');
    setShowCheckOutModal(false);
    toast.success("Clocked out successfully.");
  };

  // Manager's events from API
  const managerEvents = useMemo(() => events, [events]);

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

  // Staff from API
  const managedStaff = useMemo(() => staff, [staff]);

  const checkedInStaff = managedStaff.filter((s: any) => s.isActive).length;
  const totalStaffNeeded = managerEvents.reduce((sum: number, event: any) => sum + (event.staffRequired || 0), 0);

  // Calculate performance metrics
  const activeEvents = todaysEvents.length;
  const completionRate = 92;
  const avgStaffRating = managedStaff.length > 0
    ? +(managedStaff.reduce((sum: number, s: any) => sum + (s.rating || 0), 0) / managedStaff.length).toFixed(1)
    : 0;
  const onTimeRate = 87;

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
        <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
          <TabsList className="inline-flex h-10 items-center justify-start lg:grid w-full lg:grid-cols-5 min-w-full lg:min-w-0 p-1">
            <TabsTrigger value="overview" className="flex-1 lg:flex-none flex items-center gap-2 px-4 whitespace-nowrap">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex-1 lg:flex-none flex items-center gap-2 px-4 whitespace-nowrap">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Staff Roster</span>
              <span className="sm:hidden">Roster</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex-1 lg:flex-none flex items-center gap-2 px-4 whitespace-nowrap">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Attendance</span>
              <span className="sm:hidden">Time</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex-1 lg:flex-none flex items-center gap-2 px-4 whitespace-nowrap">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
              <span className="sm:hidden">Perf.</span>
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex-1 lg:flex-none flex items-center gap-2 px-4 whitespace-nowrap">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Messages</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">

          {/* Manager's Personal Shift Card (Manager as Staff) */}
          <Card className="border-t-4 border-t-sangria bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-sangria" />
                  <div>
                    <CardTitle className="text-lg">My Shift Status</CardTitle>
                    <CardDescription>Manage your personal attendance and breaks</CardDescription>
                  </div>
                </div>
                <Badge variant={shiftStatus === 'break' ? "secondary" : "default"}
                  className={
                    shiftStatus === 'break' ? "bg-amber-100 text-amber-800" :
                      shiftStatus === 'working' ? "bg-green-100 text-green-800" :
                        shiftStatus === 'idle' ? "bg-gray-100 text-gray-800" :
                          "bg-blue-100 text-blue-800"
                  }>
                  {shiftStatus === 'break' ? "On Break" :
                    shiftStatus === 'working' ? "Active" :
                      shiftStatus === 'idle' ? "Not Started" : "Completed"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">

                {/* Timer Display */}
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-muted-foreground">Current Session</p>
                  <div className="font-mono text-3xl font-bold tracking-tight text-gray-900">
                    {formatTime(shiftStatus === 'break' ? breakTimer : workTimer)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Activity className="h-3 w-3" />
                    <span>Total Shift: {formatTime(workTimer + breakTimer)}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white border rounded-lg shadow-sm">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Active Work</p>
                    <p className="text-lg font-mono font-bold text-green-700">{formatTime(workTimer)}</p>
                  </div>
                  <div className="p-3 bg-white border rounded-lg shadow-sm">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Break Time</p>
                    <p className="text-lg font-mono font-bold text-amber-700">{formatTime(breakTimer)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {shiftStatus === 'idle' && (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={handleClockIn}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Shift
                    </Button>
                  )}

                  {shiftStatus === 'working' && (
                    <>
                      <Button
                        className="w-full bg-amber-600 hover:bg-amber-700"
                        onClick={handleStartBreak}
                      >
                        <Coffee className="h-4 w-4 mr-2" />
                        Start Break
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleClockOutClick}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Check Out
                      </Button>
                    </>
                  )}

                  {shiftStatus === 'break' && (
                    <>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={handleEndBreak}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        End Break
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleClockOutClick}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Check Out
                      </Button>
                    </>
                  )}

                  {shiftStatus === 'completed' && (
                    <Button disabled variant="outline" className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Shift Completed
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

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
                                <span>{event.shifts?.length || 0}/{event.staffRequired} staff</span>
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

      {/* Check Out Summary Modal */}
      <Dialog open={showCheckOutModal} onOpenChange={setShowCheckOutModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Check Out</DialogTitle>
            <DialogDescription>
              Review your shift summary before clocking out.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <p className="text-xs text-gray-500 uppercase font-semibold">Total Time</p>
                <p className="text-xl font-mono font-bold text-slate-800">
                  {formatTime(workTimer + breakTimer)}
                </p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-xs text-green-700 uppercase font-semibold">Billable</p>
                <p className="text-xl font-mono font-bold text-green-800">
                  {formatTime(workTimer)}
                </p>
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-xs text-amber-700 uppercase font-semibold">Break Time (Non-Billable)</p>
                <p className="text-sm text-amber-600">Deducted from total</p>
              </div>
              <p className="text-xl font-mono font-bold text-amber-800">
                {formatTime(breakTimer)}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg text-sm text-gray-600">
              <p>By confirming, you certify that these hours are accurate.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckOutModal(false)}>Cancel</Button>
            <Button className="bg-[#5E1916] hover:bg-[#4E0707]" onClick={confirmClockOut}>
              Confirm Check Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
