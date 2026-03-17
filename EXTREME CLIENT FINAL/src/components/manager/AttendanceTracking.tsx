import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { 
  Clock,
  UserCheck,
  UserX,
  MapPin,
  Navigation,
  CheckCircle,
  AlertTriangle,
  Users,
  Calendar,
  Search,
  Filter,
  Timer,
  Play,
  Pause,
  StopCircle,
  Eye,
  AlertCircle
} from "lucide-react";
import { mockStaff, mockEvents } from "../../data/mockData";
import { toast } from "sonner";

interface AttendanceTrackingProps {
  managerId: string;
  events: any[];
}

interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  eventId: string;
  eventName: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'checked-in' | 'checked-out' | 'absent' | 'late' | 'on-break';
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  notes?: string;
  totalHours?: number;
  overtimeHours?: number;
  breaks: {
    start: string;
    end?: string;
    duration?: number;
  }[];
}

export function AttendanceTracking({ managerId, events }: AttendanceTrackingProps) {
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [isCheckOutDialogOpen, setIsCheckOutDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);

  // Mock attendance data
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: "att-1",
      staffId: "staff-1",
      staffName: "Sarah Johnson",
      eventId: "event-1",
      eventName: "Corporate Gala",
      checkInTime: "14:30",
      status: "checked-in",
      location: {
        lat: 40.7128,
        lng: -74.0060,
        address: "123 Grand Avenue, Downtown"
      },
      breaks: [],
      notes: "On time arrival"
    },
    {
      id: "att-2",
      staffId: "staff-2",
      staffName: "Michael Chen",
      eventId: "event-2",
      eventName: "Wedding Reception",
      checkInTime: "17:45",
      checkOutTime: "23:30",
      status: "checked-out",
      location: {
        lat: 40.7589,
        lng: -73.9851,
        address: "456 Garden Lane, Westside"
      },
      totalHours: 5.75,
      breaks: [
        {
          start: "20:00",
          end: "20:15",
          duration: 15
        }
      ],
      notes: "Excellent performance"
    },
    {
      id: "att-3",
      staffId: "staff-3",
      staffName: "Emily Rodriguez",
      eventId: "event-1",
      eventName: "Corporate Gala",
      status: "late",
      notes: "Traffic delay reported"
    },
    {
      id: "att-4",
      staffId: "staff-4",
      staffName: "David Wilson",
      eventId: "event-3",
      eventName: "Product Launch",
      checkInTime: "09:00",
      status: "on-break",
      location: {
        lat: 40.7505,
        lng: -73.9934,
        address: "789 Tech Plaza, Midtown"
      },
      breaks: [
        {
          start: "12:00"
        }
      ],
      notes: "Lunch break"
    }
  ]);

  const todaysEvents = useMemo(() => 
    events.filter(event => {
      const eventDate = new Date(event.date);
      const today = new Date();
      return eventDate.toDateString() === today.toDateString();
    }), [events]
  );

  const filteredRecords = useMemo(() => 
    attendanceRecords.filter(record => {
      const matchesEvent = selectedEvent === "all" || record.eventId === selectedEvent;
      const matchesSearch = record.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.eventName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || record.status === statusFilter;
      return matchesEvent && matchesSearch && matchesStatus;
    }), [attendanceRecords, selectedEvent, searchTerm, statusFilter]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked-in': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'checked-out': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'absent': return 'bg-red-50 text-red-700 border-red-200';
      case 'late': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'on-break': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checked-in': return <CheckCircle className="h-4 w-4" />;
      case 'checked-out': return <StopCircle className="h-4 w-4" />;
      case 'absent': return <UserX className="h-4 w-4" />;
      case 'late': return <AlertTriangle className="h-4 w-4" />;
      case 'on-break': return <Pause className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleCheckIn = (staffId: string, eventId: string, location: any) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      staffId,
      staffName: mockStaff.find(s => s.id === staffId)?.name || "Unknown",
      eventId,
      eventName: events.find(e => e.id === eventId)?.title || "Unknown Event",
      checkInTime: timestamp,
      status: "checked-in",
      location,
      breaks: [],
      notes: "Checked in via manager"
    };

    setAttendanceRecords(prev => [...prev, newRecord]);
    setIsCheckInDialogOpen(false);
    toast.success(`${newRecord.staffName} checked in successfully!`);
  };

  const handleCheckOut = (recordId: string, notes?: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    setAttendanceRecords(prev => prev.map(record => {
      if (record.id === recordId) {
        const checkInTime = new Date(`1970-01-01T${record.checkInTime}:00`);
        const checkOutTime = new Date(`1970-01-01T${timestamp}:00`);
        const totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
        
        return {
          ...record,
          checkOutTime: timestamp,
          status: "checked-out" as const,
          totalHours: Math.round(totalHours * 100) / 100,
          notes: notes || record.notes
        };
      }
      return record;
    }));

    setIsCheckOutDialogOpen(false);
    toast.success("Staff member checked out successfully!");
  };

  const handleStartBreak = (recordId: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    setAttendanceRecords(prev => prev.map(record => {
      if (record.id === recordId) {
        return {
          ...record,
          status: "on-break" as const,
          breaks: [...record.breaks, { start: timestamp }]
        };
      }
      return record;
    }));

    toast.success("Break started");
  };

  const handleEndBreak = (recordId: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    setAttendanceRecords(prev => prev.map(record => {
      if (record.id === recordId) {
        const updatedBreaks = record.breaks.map((breakRecord, index) => {
          if (index === record.breaks.length - 1 && !breakRecord.end) {
            const startTime = new Date(`1970-01-01T${breakRecord.start}:00`);
            const endTime = new Date(`1970-01-01T${timestamp}:00`);
            const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
            
            return {
              ...breakRecord,
              end: timestamp,
              duration: Math.round(duration)
            };
          }
          return breakRecord;
        });

        return {
          ...record,
          status: "checked-in" as const,
          breaks: updatedBreaks
        };
      }
      return record;
    }));

    toast.success("Break ended");
  };

  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const checkedIn = filteredRecords.filter(r => r.status === 'checked-in' || r.status === 'on-break').length;
    const checkedOut = filteredRecords.filter(r => r.status === 'checked-out').length;
    const absent = filteredRecords.filter(r => r.status === 'absent' || r.status === 'late').length;
    
    return { total, checkedIn, checkedOut, absent };
  }, [filteredRecords]);

  // Mock current location for geofencing check
  const managerLocation = {
    lat: 40.7128,
    lng: -74.0060,
    address: "Manager Location"
  };

  const isWithinGeofence = useMemo(() => 
    (staffLocation: any, eventLocation: any, radiusMeters = 100) => {
      // Simple distance check (in a real app, you'd use proper geolocation calculations)
      // Use a stable hash-based approach instead of random
      const hash = (staffLocation?.lat || 0) + (eventLocation?.lat || 0);
      return hash % 10 > 3; // Mock: 70% chance of being in range based on coordinates
    }, []
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Attendance & Timekeeping</h2>
          <p className="text-muted-foreground">
            Manage staff check-ins, check-outs, and monitor attendance in real-time
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserCheck className="h-4 w-4 mr-2" />
                Check In Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Check In Staff Member</DialogTitle>
                <DialogDescription>
                  Select an event and staff member to check in. Location verification is required.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Event</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose event" />
                    </SelectTrigger>
                    <SelectContent>
                      {todaysEvents.map(event => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title} - {event.time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Staff Member</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockStaff.map(staff => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name} - {staff.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Location Verification</Label>
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-emerald-800">Location Verified</p>
                      <p className="text-xs text-emerald-600">Within event geofence area</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea 
                    placeholder="Add any notes about the check-in..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsCheckInDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleCheckIn("staff-1", "event-1", managerLocation)}>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Check In
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Checked In</p>
                <p className="text-2xl font-bold">{stats.checkedIn}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Checked Out</p>
                <p className="text-2xl font-bold">{stats.checkedOut}</p>
              </div>
              <StopCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Absent/Late</p>
                <p className="text-2xl font-bold">{stats.absent}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by staff name or event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map(event => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="checked-in">Checked In</SelectItem>
              <SelectItem value="checked-out">Checked Out</SelectItem>
              <SelectItem value="on-break">On Break</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="late">Late</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Attendance Records ({filteredRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {record.staffName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold">{record.staffName}</h4>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        <Badge className={getStatusColor(record.status)}>
                          {record.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{record.eventName}</span>
                      </div>
                      {record.checkInTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>In: {record.checkInTime}</span>
                        </div>
                      )}
                      {record.checkOutTime && (
                        <div className="flex items-center gap-1">
                          <StopCircle className="h-4 w-4" />
                          <span>Out: {record.checkOutTime}</span>
                        </div>
                      )}
                      {record.totalHours && (
                        <div className="flex items-center gap-1">
                          <Timer className="h-4 w-4" />
                          <span>{record.totalHours}h total</span>
                        </div>
                      )}
                    </div>

                    {record.location && (
                      <div className="flex items-center gap-1 text-sm text-emerald-600">
                        <MapPin className="h-4 w-4" />
                        <span>On location: {record.location.address}</span>
                      </div>
                    )}

                    {record.notes && (
                      <p className="text-sm text-muted-foreground italic">
                        Note: {record.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {record.status === 'checked-in' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartBreak(record.id)}
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        Break
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <UserX className="h-4 w-4 mr-1" />
                            Check Out
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Check Out {record.staffName}</DialogTitle>
                            <DialogDescription>
                              Add notes about the staff member's performance and finalize their shift.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Notes (Optional)</Label>
                              <Textarea 
                                placeholder="Add any notes about the performance or shift..."
                                className="min-h-[100px]"
                              />
                            </div>
                            <div className="flex justify-end gap-3">
                              <Button variant="outline">Cancel</Button>
                              <Button onClick={() => handleCheckOut(record.id)}>
                                <UserX className="h-4 w-4 mr-2" />
                                Check Out
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}

                  {record.status === 'on-break' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEndBreak(record.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      End Break
                    </Button>
                  )}

                  {record.location && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Navigation className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Staff Location</DialogTitle>
                          <DialogDescription>
                            View the current location of the staff member with geofence verification.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="h-[300px] bg-muted rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">Interactive map would be displayed here</p>
                              <p className="text-sm text-muted-foreground mt-2">
                                Showing {record.staffName}'s current location
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Address:</span>
                              <span className="text-sm">{record.location.address}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Coordinates:</span>
                              <span className="text-sm">{record.location.lat}, {record.location.lng}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Geofence Status:</span>
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Within Range
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredRecords.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">No Attendance Records</h3>
              <p className="text-muted-foreground">
                No attendance records match your current filters
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Geofencing Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Geofencing Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <h4 className="font-semibold text-emerald-800">Manager Location Verified</h4>
              </div>
              <p className="text-sm text-emerald-700">
                You are within the event geofence area and can perform check-ins/check-outs
              </p>
              <p className="text-xs text-emerald-600 mt-2">
                Location: {managerLocation.address}
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Active Event Zones</h4>
              </div>
              <p className="text-sm text-blue-700">
                {todaysEvents.length} event location{todaysEvents.length !== 1 ? 's' : ''} monitored today
              </p>
              <div className="mt-2 space-y-1">
                {todaysEvents.slice(0, 2).map(event => (
                  <p key={event.id} className="text-xs text-blue-600">
                    • {event.title} - {event.location}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}