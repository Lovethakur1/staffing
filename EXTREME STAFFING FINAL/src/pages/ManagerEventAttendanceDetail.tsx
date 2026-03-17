import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { TooltipWrapper, IconTooltip } from "../components/ui/tooltip-wrapper";
import { 
  ArrowLeft,
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
  Download,
  Phone
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner@2.0.3";

interface ManagerEventAttendanceDetailProps {
  userRole: string;
  userId: string;
  eventId?: string;
}

interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  phone: string;
  scheduledIn: string;
  scheduledOut: string;
  actualIn?: string;
  actualOut?: string;
  status: 'checked-in' | 'checked-out' | 'absent' | 'late' | 'on-break';
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  notes?: string;
  totalHours?: number;
  breaks: {
    start: string;
    end?: string;
    duration?: number;
  }[];
}

export function ManagerEventAttendanceDetail({ userRole, userId, eventId }: ManagerEventAttendanceDetailProps) {
  const { setCurrentPage, pageParams } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<AttendanceRecord | null>(null);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [checkOutNotes, setCheckOutNotes] = useState("");

  const currentEventId = eventId || pageParams?.eventId;

  // Mock event data
  const eventData = {
    id: currentEventId,
    title: "Corporate Gala - Tech Summit 2025",
    date: "2025-11-12",
    startTime: "18:00",
    endTime: "23:00",
    venue: "Grand Ballroom, Downtown",
    address: "123 Main St, Downtown"
  };

  // Mock attendance records for this event
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: "att-001",
      staffId: "ST-101",
      staffName: "Michael Chen",
      staffRole: "Event Server",
      phone: "+1 (555) 123-4567",
      scheduledIn: "18:00",
      scheduledOut: "23:00",
      actualIn: "17:55",
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
      id: "att-002",
      staffId: "ST-102",
      staffName: "Sarah Johnson",
      staffRole: "Bartender",
      phone: "+1 (555) 234-5678",
      scheduledIn: "18:00",
      scheduledOut: "23:00",
      actualIn: "17:50",
      status: "checked-in",
      location: {
        lat: 40.7128,
        lng: -74.0060,
        address: "123 Grand Avenue, Downtown"
      },
      breaks: [],
      notes: "Early arrival"
    },
    {
      id: "att-003",
      staffId: "ST-103",
      staffName: "David Martinez",
      staffRole: "Event Server",
      phone: "+1 (555) 345-6789",
      scheduledIn: "18:00",
      scheduledOut: "23:00",
      actualIn: "18:20",
      status: "late",
      location: {
        lat: 40.7128,
        lng: -74.0060,
        address: "123 Grand Avenue, Downtown"
      },
      breaks: [],
      notes: "Traffic delay reported"
    },
    {
      id: "att-004",
      staffId: "ST-104",
      staffName: "Emma Rodriguez",
      staffRole: "Event Server",
      phone: "+1 (555) 456-7890",
      scheduledIn: "18:00",
      scheduledOut: "23:00",
      status: "absent",
      breaks: [],
      notes: "Did not show up"
    },
    {
      id: "att-005",
      staffId: "ST-105",
      staffName: "James Wilson",
      staffRole: "Setup Crew",
      phone: "+1 (555) 567-8901",
      scheduledIn: "18:00",
      scheduledOut: "23:00",
      actualIn: "17:55",
      status: "on-break",
      location: {
        lat: 40.7128,
        lng: -74.0060,
        address: "123 Grand Avenue, Downtown"
      },
      breaks: [
        {
          start: "20:00"
        }
      ],
      notes: "Lunch break"
    },
    {
      id: "att-006",
      staffId: "ST-106",
      staffName: "Lisa Anderson",
      staffRole: "Event Server",
      phone: "+1 (555) 678-9012",
      scheduledIn: "18:00",
      scheduledOut: "23:00",
      actualIn: "17:58",
      status: "checked-in",
      location: {
        lat: 40.7128,
        lng: -74.0060,
        address: "123 Grand Avenue, Downtown"
      },
      breaks: []
    }
  ]);

  // Filter records
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.staffRole.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: attendanceRecords.length,
    checkedIn: attendanceRecords.filter(r => r.status === 'checked-in' || r.status === 'on-break').length,
    checkedOut: attendanceRecords.filter(r => r.status === 'checked-out').length,
    absent: attendanceRecords.filter(r => r.status === 'absent').length,
    late: attendanceRecords.filter(r => r.status === 'late').length,
    attendanceRate: Math.round(((attendanceRecords.length - attendanceRecords.filter(r => r.status === 'absent').length) / attendanceRecords.length) * 100)
  };

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

  const handleCheckOut = (recordId: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    setAttendanceRecords(prev => prev.map(record => {
      if (record.id === recordId) {
        const checkInTime = new Date(`1970-01-01T${record.actualIn}:00`);
        const checkOutTime = new Date(`1970-01-01T${timestamp}:00`);
        const totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
        
        return {
          ...record,
          actualOut: timestamp,
          status: "checked-out" as const,
          totalHours: Math.round(totalHours * 100) / 100,
          notes: checkOutNotes || record.notes
        };
      }
      return record;
    }));

    setCheckOutNotes("");
    setSelectedStaff(null);
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

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <TooltipWrapper content="Back to attendance tracking">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage('manager')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </TooltipWrapper>
          <div>
            <h1 className="text-2xl font-semibold">Event Attendance Details</h1>
            <p className="text-muted-foreground">{eventData.title}</p>
          </div>
        </div>
        <TooltipWrapper content="Download attendance report for this event">
          <Button variant="outline" onClick={() => toast.info("Downloading attendance report...")}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </TooltipWrapper>
      </div>

      {/* Event Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium">{new Date(eventData.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-medium">{eventData.startTime} - {eventData.endTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Venue</p>
                <p className="font-medium">{eventData.venue}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total Staff</p>
                <p className="font-medium">{stats.total} Members</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Total</p>
              <div className="flex items-center justify-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Checked In</p>
              <div className="flex items-center justify-center gap-1">
                <UserCheck className="h-4 w-4 text-green-600" />
                <span className="text-2xl font-bold text-green-700">{stats.checkedIn}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Checked Out</p>
              <div className="flex items-center justify-center gap-1">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-2xl font-bold text-blue-700">{stats.checkedOut}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Late</p>
              <div className="flex items-center justify-center gap-1">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-700">{stats.late}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Absent</p>
              <div className="flex items-center justify-center gap-1">
                <UserX className="h-4 w-4 text-red-600" />
                <span className="text-2xl font-bold text-red-700">{stats.absent}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Rate</p>
              <span className="text-2xl font-bold text-emerald-700">{stats.attendanceRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by staff name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="checked-in">Checked In</SelectItem>
            <SelectItem value="checked-out">Checked Out</SelectItem>
            <SelectItem value="on-break">On Break</SelectItem>
            <SelectItem value="late">Late</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Staff Attendance Records ({filteredRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {record.staffName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-1 flex-1">
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
                      <span>{record.staffRole}</span>
                      {record.actualIn && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>In: {record.actualIn}</span>
                        </div>
                      )}
                      {record.actualOut && (
                        <div className="flex items-center gap-1">
                          <StopCircle className="h-4 w-4" />
                          <span>Out: {record.actualOut}</span>
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
                  {/* Phone Call Button */}
                  <IconTooltip content={`Call ${record.staffName}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const phone = record.phone.replace(/[^0-9]/g, '');
                        window.open(`tel:${phone}`);
                      }}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </IconTooltip>

                  {record.status === 'checked-in' && (
                    <>
                      <TooltipWrapper content="Start break for this staff member">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartBreak(record.id)}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Break
                        </Button>
                      </TooltipWrapper>
                      <Dialog>
                        <DialogTrigger asChild>
                          <TooltipWrapper content="Check out this staff member">
                            <Button 
                              size="sm"
                              onClick={() => setSelectedStaff(record)}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Check Out
                            </Button>
                          </TooltipWrapper>
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
                                value={checkOutNotes}
                                onChange={(e) => setCheckOutNotes(e.target.value)}
                              />
                            </div>
                            <div className="flex justify-end gap-3">
                              <Button variant="outline" onClick={() => setSelectedStaff(null)}>Cancel</Button>
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
                    <TooltipWrapper content="End break and return to work">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEndBreak(record.id)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        End Break
                      </Button>
                    </TooltipWrapper>
                  )}

                  {record.location && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <IconTooltip content="View staff location on map">
                          <Button variant="outline" size="sm">
                            <Navigation className="h-4 w-4" />
                          </Button>
                        </IconTooltip>
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
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredRecords.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold mb-2">No Staff Records Found</h3>
            <p className="text-muted-foreground">
              No staff records match your current filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
