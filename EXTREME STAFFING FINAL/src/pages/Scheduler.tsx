import { useState } from "react";
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
  Mail
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { toast } from "sonner@2.0.3";
import { cn } from "../components/ui/utils";
import { mockEvents, mockStaff, mockUsers } from "../data/mockData";

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
}

export function Scheduler({ userRole, userId }: SchedulerProps) {
  const { setCurrentPage } = useNavigation();
  const [selectedTab, setSelectedTab] = useState("events");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  // Scheduler stats - calculate from real data
  const upcomingEvents = mockEvents.filter(e => 
    e.status === 'confirmed' || e.status === 'pending' || e.status === 'in-progress'
  );
  
  const eventsNeedingStaff = upcomingEvents.filter(e => 
    (e.assignedStaff?.length || 0) < e.staffRequired
  );

  const schedulerStats = {
    eventsToSchedule: eventsNeedingStaff.length,
    staffAvailable: mockStaff.filter(s => s.availability === 'Available').length,
    shiftsThisWeek: upcomingEvents.reduce((acc, e) => acc + (e.assignedStaff?.length || 0), 0),
    fillRate: Math.round((upcomingEvents.reduce((acc, e) => acc + (e.assignedStaff?.length || 0), 0) / upcomingEvents.reduce((acc, e) => acc + e.staffRequired, 0)) * 100),
    upcomingEvents: upcomingEvents.length,
    staffConflicts: 3
  };

  // Map events to Scheduler format
  const eventsNeedingStaffFormatted: Event[] = upcomingEvents.map(event => {
    const client = mockUsers.find(u => u.id === event.clientId);
    const staffAssigned = event.assignedStaff?.length || 0;
    const staffRequired = event.staffRequired;
    
    let status: 'needs-staff' | 'partially-staffed' | 'fully-staffed' = 'needs-staff';
    if (staffAssigned === staffRequired) {
      status = 'fully-staffed';
    } else if (staffAssigned > 0) {
      status = 'partially-staffed';
    }

    return {
      id: event.id,
      title: event.title,
      client: client?.name || 'Unknown Client',
      date: new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: `${event.startTime} - ${event.endTime}`,
      venue: event.venue || event.location,
      staffRequired: staffRequired,
      staffAssigned: staffAssigned,
      status: status
    };
  });

  // Map staff to Scheduler format
  const availableStaffFormatted: StaffMember[] = mockStaff.map(staff => {
    let availability: 'available' | 'unavailable' | 'partial' = 'available';
    if (staff.availability === 'Unavailable') {
      availability = 'unavailable';
    } else if (staff.availability === 'Limited') {
      availability = 'partial';
    }

    return {
      id: staff.id,
      name: staff.name,
      role: staff.role,
      skills: staff.skills || [],
      rating: staff.rating || 4.5,
      availability: availability,
      experience: staff.experience || 3,
      lastWorked: 'Recently',
      preferredEvents: [],
      distance: undefined
    };
  });

  // Recent scheduling actions
  const recentActions = [
    {
      id: "action-1",
      type: "assigned",
      staff: mockStaff[0]?.name || "Staff Member",
      event: eventsNeedingStaffFormatted[0]?.title || "Event",
      timestamp: "10 mins ago",
      icon: CheckCircle2,
      color: "text-green-600"
    },
    {
      id: "action-2",
      type: "conflict",
      staff: mockStaff[3]?.name || "Staff Member",
      event: eventsNeedingStaffFormatted[1]?.title || "Event",
      timestamp: "25 mins ago",
      icon: AlertTriangle,
      color: "text-amber-600"
    },
    {
      id: "action-3",
      type: "assigned",
      staff: mockStaff[2]?.name || "Staff Member",
      event: eventsNeedingStaffFormatted[2]?.title || "Event",
      timestamp: "1 hour ago",
      icon: CheckCircle2,
      color: "text-green-600"
    },
    {
      id: "action-4",
      type: "removed",
      staff: mockStaff[5]?.name || "Staff Member",
      event: eventsNeedingStaffFormatted[3]?.title || "Event",
      timestamp: "2 hours ago",
      icon: XCircle,
      color: "text-red-600"
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

  const handleConfirmAssignment = (staffId: string) => {
    const staff = availableStaffFormatted.find(s => s.id === staffId);
    toast.success(`${staff?.name} assigned to ${selectedEvent?.title}`);
    setIsAssignDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleViewEvent = (eventId: string) => {
    setCurrentPage('admin-event-detail', { eventId });
  };

  const filteredStaff = availableStaffFormatted.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || staff.role.toLowerCase() === filterRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Scheduler Dashboard</h1>
        <p className="text-muted-foreground">
          Assign staff to events based on availability, skills, and experience
        </p>
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
              <Badge className="ml-2 bg-[#5E1916]">{schedulerStats.eventsToSchedule}</Badge>
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
                            {staff.name.split(' ').map(n => n[0]).join('')}
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
          <div className="space-y-4 max-h-96 overflow-y-auto">
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
                        {staff.name.split(' ').map(n => n[0]).join('')}
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
                  <Button
                    size="sm"
                    className="bg-[#5E1916] hover:bg-[#5E1916]/90"
                    onClick={() => handleConfirmAssignment(staff.id)}
                  >
                    Assign
                  </Button>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}