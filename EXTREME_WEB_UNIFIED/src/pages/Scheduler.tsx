import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { TooltipWrapper, IconTooltip } from "../components/ui/tooltip-wrapper";
import {
  Calendar,
  Users,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Activity,
  Eye,
  UserCheck,
  UserX,
  Star,
  Award,
  TrendingUp,
  Search,
  Filter,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Building2,
  Phone,
  Mail,
  MessageSquare
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { toast } from "sonner";
import { cn } from "../components/ui/utils";
import { eventService } from "../services/event.service";
import { staffService } from "../services/staff.service";
import { shiftService } from "../services/shift.service";
import { chatService } from "../services/chat.service";

interface SchedulerProps {
  userRole: string;
  userId: string;
}

interface Event {
  id: string;
  title: string;
  client: string;
  date: string;
  time: string;
  venue: string;
  staffRequired: number;
  staffAssigned: number;
  status: 'needs-staff' | 'partially-staffed' | 'fully-staffed';
  rawEvent: any;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  skills: string[];
  rating: number;
  availability: 'available' | 'unavailable' | 'partial';
  experience: number;
  lastWorked: string;
  preferredEvents: string[];
  distance?: string;
  rawStaff: any;
}

export function Scheduler({ userRole, userId }: SchedulerProps) {
  const { setCurrentPage } = useNavigation();
  const [selectedTab, setSelectedTab] = useState("events");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  // Used to show loading state if creating a conversation takes a moment
  const [navigatingToMsg, setNavigatingToMsg] = useState<string | null>(null);

  const [events, setEvents] = useState<any[]>([]);
  const [apiStaff, setApiStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSchedulerData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      const [eventsRes, staffRes] = await Promise.all([
        eventService.getEvents(),
        staffService.getStaffList()
      ]);
      const eventsArr = Array.isArray(eventsRes) ? eventsRes : (eventsRes?.data || eventsRes?.events || []);
      const staffArr = Array.isArray(staffRes) ? staffRes : (staffRes?.data || staffRes?.staff || []);
      setEvents(eventsArr);
      setApiStaff(staffArr);
      setLastUpdated(new Date());
    } catch (err) {
      toast.error("Failed to load scheduler data");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedulerData();
    const interval = setInterval(() => fetchSchedulerData(false), 30000);
    return () => clearInterval(interval);
  }, [fetchSchedulerData]);

  // Scheduler stats - calculate from real data
  const upcomingEvents = events.filter(e => {
    const s = e.status?.toLowerCase() || '';
    return s === 'confirmed' || s === 'pending' || s === 'in-progress' || s === 'in_progress';
  });

  const eventsNeedingStaff = upcomingEvents.filter(e =>
    (e.shifts?.length || 0) < (e.staffRequired || 0)
  );

  const schedulerStats = {
    eventsToSchedule: eventsNeedingStaff.length,
    staffAvailable: apiStaff.filter(s => s.staffProfile?.availabilityStatus !== 'unavailable').length,
    shiftsThisWeek: upcomingEvents.reduce((acc, e) => acc + (e.shifts?.length || 0), 0),
    fillRate: upcomingEvents.length > 0
      ? Math.round((upcomingEvents.reduce((acc, e) => acc + (e.shifts?.length || 0), 0) / Math.max(1, upcomingEvents.reduce((acc, e) => acc + (e.staffRequired || 0), 0))) * 100)
      : 0,
    upcomingEvents: upcomingEvents.length,
    staffConflicts: 0
  };

  // Map events to Scheduler format
  const eventsNeedingStaffFormatted: Event[] = upcomingEvents.map(event => {
    const clientName = event.client?.user?.name || event.client?.companyName || 'Unknown Client';

    // Only count shifts that are not explicitly rejected
    const activeShifts = event.shifts?.filter((s: any) => s.status !== 'REJECTED') || [];
    const staffAssigned = activeShifts.length;
    const staffRequired = event.staffRequired || 0;

    let status: 'needs-staff' | 'partially-staffed' | 'fully-staffed' = 'needs-staff';
    if (staffRequired > 0 && staffAssigned >= staffRequired) {
      status = 'fully-staffed';
    } else if (staffAssigned > 0) {
      status = 'partially-staffed';
    }

    return {
      id: event.id,
      title: event.title || event.eventName || 'Event',
      client: clientName,
      date: new Date(event.date || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: `${event.startTime || '00:00'} - ${event.endTime || '00:00'}`,
      venue: event.venue || event.location || 'TBA',
      staffRequired: staffRequired,
      staffAssigned: staffAssigned,
      status: status,
      rawEvent: event,
    };
  });

  // Map staff to Scheduler format
  const availableStaffFormatted: StaffMember[] = useMemo(() => apiStaff.map(profile => {
    const user = profile.user || {};
    let availability: 'available' | 'unavailable' | 'partial' = 'available';
    if (profile.availabilityStatus === 'unavailable') {
      availability = 'unavailable';
    } else if (profile.availabilityStatus === 'limited') {
      availability = 'partial';
    }

    return {
      id: user.id || profile.userId,
      name: user.name || 'Unknown Staff',
      role: profile.role || 'Staff',
      skills: profile.skills || [],
      rating: profile.rating || 4.5,
      availability: availability,
      experience: profile.experience || 3,
      lastWorked: 'Recently',
      preferredEvents: [],
      distance: undefined,
      rawStaff: profile,
    };
  }), [apiStaff]);

  // Recent scheduling actions (kept as mock for visual purposes if no real activity stream exists)
  const recentActions = [
    {
      id: "action-1",
      type: "assigned",
      staff: "Michael Chen",
      event: "Corporate Gala",
      timestamp: "10 mins ago",
      icon: CheckCircle2,
      color: "text-green-600"
    }
  ];

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'fully-staffed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'partially-staffed':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'needs-staff':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: Event['status']) => {
    switch (status) {
      case 'fully-staffed':
        return 'Fully Staffed';
      case 'partially-staffed':
        return 'Partially Staffed';
      case 'needs-staff':
        return 'Needs Staff';
      default:
        return 'Unknown';
    }
  };

  const getAvailabilityColor = (availability: StaffMember['availability']) => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-700';
      case 'partial':
        return 'bg-amber-100 text-amber-700';
      case 'unavailable':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleAssignStaff = (event: Event) => {
    setSelectedEvent(event);
    setIsAssignDialogOpen(true);
  };

  const handleConfirmAssignment = async (staffId: string) => {
    if (!selectedEvent) return;
    setAssigning(staffId);
    try {
      const shiftData = {
        eventId: selectedEvent.id,
        staffId,
        date: selectedEvent.rawEvent.date,
        startTime: selectedEvent.rawEvent.startTime || '09:00',
        endTime: selectedEvent.rawEvent.endTime || '17:00',
        role: selectedEvent.rawEvent.eventType || 'Staff',
        hourlyRate: availableStaffFormatted.find(s => s.id === staffId)?.rawStaff?.staffProfile?.hourlyRate || 25,
        guaranteedHours: 4,
      };

      await shiftService.createShift(shiftData);

      const staff = availableStaffFormatted.find(s => s.id === staffId);
      toast.success(`${staff?.name} assigned to ${selectedEvent.title}`);

      // Update local state to reflect the assignment
      const newShift = { id: Date.now().toString(), staffId, status: 'PENDING', staff: { id: staffId, name: staff?.name || '' } };
      setEvents(prev => prev.map(e => {
        if (e.id === selectedEvent.id) {
          return {
            ...e,
            shifts: [...(e.shifts || []), newShift]
          };
        }
        return e;
      }));

      // Update selectedEvent so the dialog reflects the new assignment
      setSelectedEvent(prev => prev ? {
        ...prev,
        rawEvent: {
          ...prev.rawEvent,
          shifts: [...(prev.rawEvent?.shifts || []), newShift]
        }
      } : null);
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to assign staff');
    } finally {
      setAssigning(null);
    }
  };

  const handleNavigationToMessage = async (staffId: string) => {
    setNavigatingToMsg(staffId);
    try {
      const conv = await chatService.createConversation({ participantIds: [staffId] });
      const convId = conv?.id || conv?.conversationId;
      if (convId) {
        setCurrentPage('messages', { conversationId: convId });
      }
    } catch {
      toast.error('Failed to open messages');
    } finally {
      setNavigatingToMsg(null);
    }
  };

  const handleViewEvent = (eventId: string) => {
    setCurrentPage('admin-event-detail', { eventId });
  };

  const filteredStaff = availableStaffFormatted.filter(staff => {
    const nameStr = staff.name || '';
    const roleStr = staff.role || '';
    const searchStr = searchQuery || '';

    const matchesSearch = nameStr.toLowerCase().includes(searchStr.toLowerCase()) ||
      roleStr.toLowerCase().includes(searchStr.toLowerCase());
    const matchesRole = filterRole === 'all' || roleStr.toLowerCase() === filterRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading scheduler data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Scheduler Dashboard</h1>
          <p className="text-muted-foreground">
            Assign staff to events based on availability, skills, and experience
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <Badge variant="outline" className="text-xs">
              Updated {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSchedulerData(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Events to Schedule</p>
                <p className="text-2xl">{schedulerStats.eventsToSchedule}</p>
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
                <p className="text-sm text-muted-foreground">Staff Available</p>
                <p className="text-2xl">{schedulerStats.staffAvailable}</p>
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
                <p className="text-sm text-muted-foreground">Shifts This Week</p>
                <p className="text-2xl">{schedulerStats.shiftsThisWeek}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fill Rate</p>
                <p className="text-2xl">{schedulerStats.fillRate}%</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="events">
            Events
            {schedulerStats.eventsToSchedule > 0 && (
              <Badge className="ml-2 bg-[#5E1916] text-white">{schedulerStats.eventsToSchedule}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="staff">Available Staff</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Events Needing Staff</CardTitle>
                  <CardDescription>
                    Assign qualified staff members to upcoming events
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage('events')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View All Events
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eventsNeedingStaffFormatted.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{event.title}</h3>
                          <Badge variant="outline" className={getStatusColor(event.status)}>
                            {getStatusLabel(event.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {event.client}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {event.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {event.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.venue}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {event.staffAssigned} / {event.staffRequired} staff assigned
                        </span>
                        {event.status === 'needs-staff' && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewEvent(event.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {event.status !== 'fully-staffed' && (
                          <Button
                            size="sm"
                            className="bg-[#5E1916] hover:bg-[#5E1916]/90"
                            onClick={() => handleAssignStaff(event)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Assign Staff
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <CardTitle>Available Staff</CardTitle>
                  <CardDescription>
                    Browse staff by availability, skills, ratings, and experience
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search staff..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="bartender">Bartender</SelectItem>
                      <SelectItem value="server">Server</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Avatar>
                          <AvatarFallback className="bg-[#5E1916] text-white">
                            {(staff.name || 'S').split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{staff.name}</h3>
                            <Badge variant="outline">{staff.role}</Badge>
                            <Badge variant="outline" className={getAvailabilityColor(staff.availability)}>
                              {staff.availability}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              {staff.rating}
                            </div>
                            <div className="flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              {staff.experience}y exp
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Last: {staff.lastWorked}
                            </div>
                            {staff.distance && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {staff.distance}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {staff.skills.map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNavigationToMessage(staff.id)}
                          disabled={navigatingToMsg === staff.id}
                        >
                          {navigatingToMsg === staff.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1" />
                          ) : (
                            <MessageSquare className="w-4 h-4 mr-1" />
                          )}
                          Message
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage('staff-detail', { staffId: staff.id })}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Profile
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
              <CardTitle>Recent Scheduling Activity</CardTitle>
              <CardDescription>Latest staff assignments and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <div key={action.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                      <div className={cn("p-2 rounded-lg bg-muted", action.color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium capitalize">{action.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {action.staff} • {action.event}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{action.timestamp}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Staff to Event</DialogTitle>
            <DialogDescription>
              Select qualified staff members for {selectedEvent?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto overscroll-contain" style={{ willChange: 'scroll-position' }}>
            {availableStaffFormatted
              .filter(s => s.availability !== 'unavailable')
              .map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-[#5E1916] text-white">
                        {(staff.name || 'S').split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{staff.name}</span>
                        <Badge variant="outline" className="text-xs">{staff.role}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {staff.rating}
                        <span>•</span>
                        <span>{staff.experience}y exp</span>
                        {staff.distance && (
                          <>
                            <span>•</span>
                            <span>{staff.distance}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavigationToMessage(staff.id)}
                      disabled={navigatingToMsg === staff.id}
                    >
                      {navigatingToMsg === staff.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1" />
                      ) : (
                        <MessageSquare className="w-4 h-4 mr-1" />
                      )}
                      Message
                    </Button>
                    <Button
                      disabled={assigning === staff.id || selectedEvent?.rawEvent?.shifts?.some((s: any) => s.staffId === staff.id)}
                      className="bg-[#5E1916] hover:bg-[#5E1916]/90"
                      onClick={() => handleConfirmAssignment(staff.id)}
                    >
                      {assigning === staff.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
                      ) : null}
                      {selectedEvent?.rawEvent?.shifts?.some((s: any) => s.staffId === staff.id) ? 'Assigned' : 'Assign'}
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
