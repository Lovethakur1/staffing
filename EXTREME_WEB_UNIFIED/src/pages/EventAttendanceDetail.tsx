import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  UserCheck,
  UserX,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Users,
  Calendar,
  Search,
  Filter,
  Timer,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Download,
  Activity,
  ArrowLeft,
  MapPinned,
  Phone,
  Mail,
  Edit,
  CheckCheck,
  XCircle
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import api from "../services/api";

interface EventAttendanceDetailProps {
  userRole: string;
  userId: string;
  eventId?: string;
}

interface StaffAttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  phone: string;
  email: string;
  scheduledIn: string;
  scheduledOut: string;
  actualIn?: string;
  actualOut?: string;
  status: 'present' | 'absent' | 'late' | 'early-departure' | 'on-shift' | 'pending';
  checkInLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  checkOutLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  totalHours?: number;
  notes?: string;
}

export function EventAttendanceDetail({ userRole, eventId }: EventAttendanceDetailProps) {
  const { setCurrentPage } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPageNum] = useState(1);
  const [selectedTab, setSelectedTab] = useState("all");
  const itemsPerPage = 15;

  const [eventData, setEventData] = useState<any>(null);
  const [staffAttendance, setStaffAttendance] = useState<StaffAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch event details and shifts for this event
        const [evRes, shiftRes] = await Promise.all([
          eventId ? api.get(`/events/${eventId}`) : Promise.resolve({ data: null }),
          api.get(`/shifts${eventId ? `?eventId=${eventId}` : ''}`),
        ]);

        // Process event data
        const evRaw = evRes.data;
        const ev = evRaw?.data || evRaw;
        if (ev && ev.id) {
          setEventData({
            eventId: ev.id,
            eventName: ev.title || ev.eventName || 'Event',
            eventDate: ev.date ? new Date(ev.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
            eventTime: `${ev.startTime || ''} - ${ev.endTime || ''}`,
            venue: ev.venue || ev.location || '',
            venueAddress: ev.location || '',
            client: ev.client?.user?.name || ev.client?.company || 'Client',
            eventManager: 'Manager',
          });
        }

        // Process shifts into attendance records
        const shiftRaw = shiftRes.data;
        const shiftArr = Array.isArray(shiftRaw) ? shiftRaw : (shiftRaw?.data || []);

        const records: StaffAttendanceRecord[] = shiftArr.map((s: any) => {
          // Determine attendance status from shift status
          let status: StaffAttendanceRecord['status'] = 'pending';
          if (s.status === 'COMPLETED') {
            // Check if they were late
            if (s.clockIn && s.startTime) {
              const clockInTime = new Date(s.clockIn);
              const [h, m] = s.startTime.split(':').map(Number);
              const scheduled = new Date(clockInTime);
              scheduled.setHours(h, m, 0, 0);
              status = clockInTime > scheduled ? 'late' : 'present';
            } else {
              status = 'present';
            }
          } else if (s.status === 'IN_PROGRESS' || s.status === 'ARRIVED') {
            if (s.clockIn && s.startTime) {
              const clockInTime = new Date(s.clockIn);
              const [h, m] = s.startTime.split(':').map(Number);
              const scheduled = new Date(clockInTime);
              scheduled.setHours(h, m, 0, 0);
              status = clockInTime > scheduled ? 'late' : 'on-shift';
            } else {
              status = 'on-shift';
            }
          } else if (s.status === 'CANCELLED' || s.status === 'NO_SHOW') {
            status = 'absent';
          } else if (s.status === 'TRAVEL_TO_VENUE') {
            status = 'on-shift';
          } else {
            status = 'pending';
          }

          const clockInTime = s.clockIn ? new Date(s.clockIn).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : undefined;
          const clockOutTime = s.clockOut ? new Date(s.clockOut).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : undefined;

          return {
            id: s.id,
            staffId: s.staffId,
            staffName: s.staff?.name || 'Staff',
            staffRole: s.role || 'Staff',
            phone: s.staff?.phone || '',
            email: '',
            scheduledIn: s.startTime || '',
            scheduledOut: s.endTime || '',
            actualIn: clockInTime,
            actualOut: clockOutTime,
            status,
            checkInLocation: s.location ? {
              lat: 0,
              lng: 0,
              address: s.location,
            } : undefined,
            checkOutLocation: s.clockOut && s.location ? {
              lat: 0,
              lng: 0,
              address: s.location,
            } : undefined,
            totalHours: s.totalHours || undefined,
            notes: undefined,
          };
        });

        setStaffAttendance(records);
      } catch (err) {
        console.error('Failed to load event attendance:', err);
        setError('Unable to load event attendance data. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  // Calculate statistics
  const stats = {
    totalStaff: staffAttendance.length,
    present: staffAttendance.filter(s => s.status === 'present').length,
    onShift: staffAttendance.filter(s => s.status === 'on-shift').length,
    late: staffAttendance.filter(s => s.status === 'late').length,
    absent: staffAttendance.filter(s => s.status === 'absent').length,
    pending: staffAttendance.filter(s => s.status === 'pending').length,
    attendanceRate: staffAttendance.length > 0
      ? (((staffAttendance.filter(s => s.status !== 'absent' && s.status !== 'pending').length) / staffAttendance.length) * 100).toFixed(1)
      : '0.0'
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Present</Badge>;
      case "on-shift":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Timer className="h-3 w-3 mr-1" />On Shift</Badge>;
      case "late":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100"><Clock className="h-3 w-3 mr-1" />Late</Badge>;
      case "absent":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><UserX className="h-3 w-3 mr-1" />Absent</Badge>;
      case "early-departure":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"><AlertTriangle className="h-3 w-3 mr-1" />Early</Badge>;
      case "pending":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Get unique roles for filter
  const uniqueRoles = Array.from(new Set(staffAttendance.map(s => s.staffRole)));

  // Filter by tab
  let tabFilteredStaff = staffAttendance;
  if (selectedTab !== "all") {
    tabFilteredStaff = staffAttendance.filter(s => s.status === selectedTab);
  }

  // Filter records
  const filteredStaff = tabFilteredStaff.filter(staff => {
    const matchesSearch = staff.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.phone.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || staff.status === statusFilter;
    const matchesRole = roleFilter === "all" || staff.staffRole === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStaff = filteredStaff.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="space-y-6 w-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event attendance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 w-full flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Server Error</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentPage('attendance')}
          className="w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Attendance
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-[#5E1916]">{eventData.eventName}</h1>
            <p className="text-muted-foreground mt-1">
              Event Attendance Tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Event Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-semibold">{eventData.eventDate}</p>
                <p className="text-sm font-mono text-muted-foreground">{eventData.eventTime}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Venue</p>
                <p className="font-semibold">{eventData.venue}</p>
                <p className="text-sm text-muted-foreground">{eventData.venueAddress}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-semibold">{eventData.client}</p>
                <p className="text-sm text-muted-foreground">Event ID: {eventData.eventId}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Event Manager</p>
                <p className="font-semibold">{eventData.eventManager}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Staff</p>
              <p className="text-xl font-semibold">{stats.totalStaff}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Present</p>
              <p className="text-xl font-semibold">{stats.present}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Timer className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">On Shift</p>
              <p className="text-xl font-semibold">{stats.onShift}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Late</p>
              <p className="text-xl font-semibold">{stats.late}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-xl font-semibold">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rate</p>
              <p className="text-xl font-semibold">{stats.attendanceRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Staff Attendance Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Staff Attendance Details</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search staff..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-[200px]"
                  />
                </div>

                {/* Role Filter */}
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {uniqueRoles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="all">All ({staffAttendance.length})</TabsTrigger>
                <TabsTrigger value="present">Present ({stats.present})</TabsTrigger>
                <TabsTrigger value="on-shift">On Shift ({stats.onShift})</TabsTrigger>
                <TabsTrigger value="late">Late ({stats.late})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Staff Member</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Scheduled In</TableHead>
                  <TableHead className="font-semibold">Actual In</TableHead>
                  <TableHead className="font-semibold">Scheduled Out</TableHead>
                  <TableHead className="font-semibold">Actual Out</TableHead>
                  <TableHead className="font-semibold text-center">Total Hours</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Location Verified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStaff.length > 0 ? (
                  paginatedStaff.map((staff) => (
                    <TableRow key={staff.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div>
                          <p className="font-medium">{staff.staffName}</p>
                          <p className="text-xs text-muted-foreground">{staff.staffId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{staff.phone}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[150px]">{staff.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{staff.staffRole}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {staff.scheduledIn}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {staff.actualIn ? (
                          <span className={staff.status === 'late' ? 'text-orange-600 font-semibold' : 'text-green-600 font-semibold'}>
                            {staff.actualIn}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">--:--</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {staff.scheduledOut}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {staff.actualOut ? (
                          <span className="text-green-600 font-semibold">{staff.actualOut}</span>
                        ) : (
                          <span className="text-muted-foreground">--:--</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {staff.totalHours ? `${staff.totalHours.toFixed(2)}h` : <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>{getStatusBadge(staff.status)}</TableCell>
                      <TableCell>
                        {staff.checkInLocation ? (
                          <div className="flex items-center gap-1">
                            <MapPinned className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-600">Verified</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No staff records found</p>
                      <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStaff.length)} of {filteredStaff.length} staff
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPageNum(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPageNum(pageNum)}
                        className={currentPage === pageNum ? "bg-primary hover:bg-primary/90" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPageNum(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
