import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  Calendar,
  Search, 
  MapPin,
  Users,
  Clock,
  DollarSign,
  Settings,
  Eye,
  Edit,
  CheckCircle,
  AlertTriangle,
  Navigation,
  User,
  Shield,
  MoreHorizontal,
  Plus,
  Filter,
  Download
} from "lucide-react";
import { mockEvents, mockStaff, mockUsers, mockShifts } from "../../data/mockData";
import { toast } from "sonner";

interface StaffAssignment {
  staffId: string;
  staffName: string;
  role: string;
  skills: string[];
  hourlyRate: number;
  isAssigned: boolean;
  checkInTime?: string;
  currentLocation?: { lat: number; lng: number; address: string };
}

interface EventOverride {
  id: string;
  eventId: string;
  type: 'time' | 'payment' | 'staff' | 'location';
  originalValue: string;
  newValue: string;
  reason: string;
  authorizedBy: string;
  timestamp: string;
}

export function SchedulingEventManagement() {
  const [activeTab, setActiveTab] = useState('events');
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);

  // Mock live tracking data
  const [liveTracking] = useState<StaffAssignment[]>([
    {
      staffId: "staff-1",
      staffName: "Sarah Johnson",
      role: "Event Coordinator",
      skills: ["Event Planning", "Team Leadership"],
      hourlyRate: 25,
      isAssigned: true,
      checkInTime: "14:30",
      currentLocation: {
        lat: 40.7128,
        lng: -74.0060,
        address: "123 Grand Avenue, Downtown"
      }
    },
    {
      staffId: "staff-2",
      staffName: "Michael Chen",
      role: "Bartender",
      skills: ["Mixology", "Customer Service"],
      hourlyRate: 28,
      isAssigned: true,
      checkInTime: "17:45",
      currentLocation: {
        lat: 40.7589,
        lng: -73.9851,
        address: "456 Garden Lane, Westside"
      }
    }
  ]);

  // Mock overrides data
  const [overrides] = useState<EventOverride[]>([
    {
      id: "override-1",
      eventId: "event-1",
      type: "time",
      originalValue: "18:00 - 23:00",
      newValue: "17:30 - 23:30",
      reason: "Client requested earlier start time",
      authorizedBy: "Admin Smith",
      timestamp: "2025-01-06 10:30"
    },
    {
      id: "override-2",
      eventId: "event-2",
      type: "payment",
      originalValue: "$25/hr",
      newValue: "$30/hr",
      reason: "Premium event rate applied",
      authorizedBy: "Admin Johnson",
      timestamp: "2025-01-05 15:20"
    }
  ]);

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-primary/10 text-primary border-primary/20';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getClientName = (clientId: string) => {
    const client = mockUsers.find(user => user.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const getAvailableStaff = (eventDate: string, requiredSkills: string[] = []) => {
    return mockStaff.filter(staff => {
      // Check if staff is available (not already assigned to another event on the same date)
      const isAvailable = !mockShifts.some(shift => 
        shift.staffId === staff.id && 
        shift.date === eventDate &&
        shift.status === 'confirmed'
      );
      
      // Check if staff has required skills
      const hasRequiredSkills = requiredSkills.length === 0 || 
        requiredSkills.some(skill => staff.skills.includes(skill));
      
      return isAvailable && hasRequiredSkills && staff.isActive;
    });
  };

  const handleStaffAssignment = (eventId: string, staffIds: string[]) => {
    toast.success(`${staffIds.length} staff members assigned to event!`);
    setIsAssignmentDialogOpen(false);
  };

  const handleCreateOverride = () => {
    toast.success("Override applied successfully!");
    setIsOverrideDialogOpen(false);
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    // Simple distance calculation (not accurate, just for demo)
    const distance = Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2)) * 100;
    return distance.toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Scheduling & Event Management</h2>
          <p className="text-muted-foreground">
            Assign staff, track live locations, and manage event overrides
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Schedule
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events">Event Assignment</TabsTrigger>
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="overrides">Manual Overrides</TabsTrigger>
        </TabsList>

        {/* Event Assignment Tab */}
        <TabsContent value="events" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Events Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Events Requiring Staff Assignment ({filteredEvents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Staff Required</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => {
                      const assignedCount = event.assignedStaff?.length || 0;
                      const requiredCount = event.staffRequired || 0;
                      const staffingComplete = assignedCount >= requiredCount;
                      
                      return (
                        <TableRow key={event.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{event.title}</p>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{event.location}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{getClientName(event.clientId)}</span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium">{event.date}</p>
                              <p className="text-muted-foreground">{event.time}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className={staffingComplete ? "text-emerald-600" : "text-amber-600"}>
                                {assignedCount}/{requiredCount}
                              </span>
                              {staffingComplete ? (
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">${event.budget.toLocaleString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(event.status)}>
                              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setIsAssignmentDialogOpen(true);
                                }}
                              >
                                <Users className="h-3 w-3 mr-1" />
                                Assign
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setIsOverrideDialogOpen(true);
                                }}
                              >
                                <Settings className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Staff Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Live Staff Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {liveTracking.map((staff) => (
                    <div key={staff.staffId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{staff.staffName}</h4>
                          <p className="text-sm text-muted-foreground">{staff.role}</p>
                          {staff.checkInTime && (
                            <p className="text-xs text-emerald-600">
                              Checked in at {staff.checkInTime}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-emerald-600">On Location</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {staff.currentLocation?.address}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => setIsTrackingDialogOpen(true)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Map
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Geofencing Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Location Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg border-amber-200 bg-amber-50">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800">Late Check-in</h4>
                        <p className="text-sm text-amber-700">
                          David Wilson hasn't checked in for his 2:00 PM shift
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          Expected: 1:45 PM • Current time: 2:15 PM
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg border-red-200 bg-red-50">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-800">Location Mismatch</h4>
                        <p className="text-sm text-red-700">
                          Emma Davis is 2.3 miles from event location
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          Expected: Downtown Convention Center
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg border-emerald-200 bg-emerald-50">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-emerald-800">All Clear</h4>
                        <p className="text-sm text-emerald-700">
                          5 staff members are at their assigned locations
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">
                          Average check-in time: 8 minutes early
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Manual Overrides Tab */}
        <TabsContent value="overrides" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Manual Overrides</h3>
            <Dialog open={isOverrideDialogOpen} onOpenChange={setIsOverrideDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Create Override
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Manual Override</DialogTitle>
                  <DialogDescription>
                    Create manual scheduling overrides to handle special cases, conflicts, or specific client requests.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Select Event</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose event" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockEvents.map(event => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.title} - {event.date}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Override Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="time">Shift Times</SelectItem>
                          <SelectItem value="payment">Payment Rate</SelectItem>
                          <SelectItem value="staff">Staff Assignment</SelectItem>
                          <SelectItem value="location">Event Location</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Original Value</Label>
                      <Input placeholder="Current value" />
                    </div>
                    <div className="space-y-2">
                      <Label>New Value</Label>
                      <Input placeholder="New value" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Reason for Override</Label>
                    <Textarea 
                      placeholder="Explain why this override is necessary..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="notify-staff" defaultChecked />
                    <Label htmlFor="notify-staff">Notify affected staff</Label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsOverrideDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateOverride}>
                      Apply Override
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Override Type</TableHead>
                      <TableHead>Original → New</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Authorized By</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overrides.map((override) => {
                      const event = mockEvents.find(e => e.id === override.eventId);
                      
                      return (
                        <TableRow key={override.id}>
                          <TableCell>
                            <div className="font-medium">
                              {event?.title || "Unknown Event"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {override.type.charAt(0).toUpperCase() + override.type.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <span className="text-red-600 line-through">
                                {override.originalValue}
                              </span>
                              <br />
                              <span className="text-emerald-600 font-medium">
                                {override.newValue}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{override.reason}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{override.authorizedBy}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {override.timestamp}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Staff Assignment Dialog */}
      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Staff to Event</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold">{selectedEvent.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedEvent.date} • {selectedEvent.time} • {selectedEvent.location}
                </p>
                <p className="text-sm">
                  Need {selectedEvent.staffRequired} staff members
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-4">Available Staff</h4>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {getAvailableStaff(selectedEvent.date).map((staff) => (
                    <div key={staff.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300"
                        />
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          <div className="flex gap-2 mt-1">
                            {staff.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${staff.hourlyRate}/hr</p>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{staff.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleStaffAssignment(selectedEvent.id, [])}>
                  Assign Selected Staff
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Live Tracking Map Dialog */}
      <Dialog open={isTrackingDialogOpen} onOpenChange={setIsTrackingDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Live Staff Tracking Map</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="h-[400px] bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Interactive map would be displayed here</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Showing real-time GPS locations of active staff
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {liveTracking.map((staff) => (
                <div key={staff.staffId} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="font-medium">{staff.staffName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {staff.currentLocation?.address}
                  </p>
                  <p className="text-xs text-emerald-600">
                    Last update: 30 seconds ago
                  </p>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}