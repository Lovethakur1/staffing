import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
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
  Eye,
  Timer,
  ChevronLeft,
  ChevronRight,
  Download,
  TrendingUp,
  Activity,
  ArrowRight,
  FileSpreadsheet,
  Flag,
  Edit
} from "lucide-react";
import { toast } from "sonner";
import { useNavigation } from "../contexts/NavigationContext";
import { eventService } from "../services/event.service";
import { shiftService } from "../services/shift.service";

interface AttendanceProps {
  userRole: string;
  userId: string;
}

interface EventAttendanceSummary {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  totalStaff: number;
  present: number;
  onShift: number;
  late: number;
  absent: number;
  earlyDeparture: number;
  attendanceRate: number;
  status: 'completed' | 'in-progress' | 'upcoming';
}

export function Attendance({ userRole }: AttendanceProps) {
  const { setCurrentPage } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPageNum] = useState(1);
  const [eventAttendance, setEventAttendance] = useState<EventAttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [evArr, shiftArr] = await Promise.all([
          eventService.getEvents(),
          shiftService.getShifts(),
        ]);

        // Group shifts by eventId
        const shiftsByEvent: Record<string, any[]> = {};
        shiftArr.forEach((s: any) => {
          if (!shiftsByEvent[s.eventId]) shiftsByEvent[s.eventId] = [];
          shiftsByEvent[s.eventId].push(s);
        });

        // Build attendance summary per event
        const summaries: EventAttendanceSummary[] = evArr.map((ev: any) => {
          const shifts = shiftsByEvent[ev.id] || [];
          const total = shifts.length;
          const now = new Date();
          const evDate = ev.date ? new Date(ev.date) : null;

          // Determine event status
          let evStatus: 'completed' | 'in-progress' | 'upcoming' = 'upcoming';
          if (evDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const eventDay = new Date(evDate);
            eventDay.setHours(0, 0, 0, 0);
            if (eventDay < today) evStatus = 'completed';
            else if (eventDay.getTime() === today.getTime()) {
              const hasActive = shifts.some((s: any) => s.status === 'IN_PROGRESS' || s.status === 'ARRIVED' || s.status === 'TRAVEL_TO_VENUE');
              const allDone = total > 0 && shifts.every((s: any) => s.status === 'COMPLETED' || s.status === 'CANCELLED');
              if (allDone) evStatus = 'completed';
              else if (hasActive || shifts.some((s: any) => s.clockIn)) evStatus = 'in-progress';
            }
          }

          // Count attendance categories from shift statuses
          const present = shifts.filter((s: any) => s.status === 'COMPLETED').length;
          const onShift = shifts.filter((s: any) => s.status === 'IN_PROGRESS' || s.status === 'ARRIVED').length;
          const absent = shifts.filter((s: any) => s.status === 'CANCELLED' || s.status === 'NO_SHOW').length;
          // Late = clocked in after scheduled start time
          const late = shifts.filter((s: any) => {
            if (!s.clockIn || !s.startTime) return false;
            const clockInTime = new Date(s.clockIn);
            const [h, m] = s.startTime.split(':').map(Number);
            const scheduled = new Date(clockInTime);
            scheduled.setHours(h, m, 0, 0);
            return clockInTime > scheduled;
          }).length;
          const attendedCount = total - absent;
          const attendanceRate = total > 0 ? Math.round((attendedCount / total) * 1000) / 10 : 0;

          return {
            eventId: ev.id,
            eventName: ev.title || ev.eventName || 'Event',
            eventDate: ev.date ? new Date(ev.date).toISOString().split('T')[0] : '',
            eventTime: `${ev.startTime || ''} - ${ev.endTime || ''}`,
            venue: ev.venue || ev.location || '',
            totalStaff: total,
            present,
            onShift,
            late,
            absent,
            earlyDeparture: 0,
            attendanceRate,
            status: evStatus,
          };
        });

        setEventAttendance(summaries);
      } catch (err) {
        console.error('Failed to load attendance data:', err);
        setError('Unable to load attendance data. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Summary statistics
  const stats = {
    totalEvents: eventAttendance.length,
    inProgress: eventAttendance.filter(e => e.status === 'in-progress').length,
    completed: eventAttendance.filter(e => e.status === 'completed').length,
    upcoming: eventAttendance.filter(e => e.status === 'upcoming').length,
    totalStaff: eventAttendance.reduce((acc, e) => acc + e.totalStaff, 0),
    averageAttendance: eventAttendance.filter(e => e.status !== 'upcoming').length > 0
      ? (eventAttendance
        .filter(e => e.status !== 'upcoming')
        .reduce((acc, e) => acc + e.attendanceRate, 0) /
        eventAttendance.filter(e => e.status !== 'upcoming').length).toFixed(1)
      : '0.0'
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Timer className="h-3 w-3 mr-1" />In Progress</Badge>;
      case "upcoming":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100"><Clock className="h-3 w-3 mr-1" />Upcoming</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAttendanceRateBadge = (rate: number) => {
    if (rate === 0) return <span className="text-muted-foreground">N/A</span>;
    if (rate >= 95) return <span className="text-green-600 font-semibold">{rate}%</span>;
    if (rate >= 85) return <span className="text-blue-600 font-semibold">{rate}%</span>;
    if (rate >= 75) return <span className="text-orange-600 font-semibold">{rate}%</span>;
    return <span className="text-red-600 font-semibold">{rate}%</span>;
  };

  // Filter records
  const filteredEvents = eventAttendance.filter(event => {
    const matchesSearch = event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.eventId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    const todayStr = new Date().toISOString().split('T')[0];
    const matchesDate = dateFilter === "all" ||
      (dateFilter === "today" && event.eventDate === todayStr) ||
      (dateFilter === "upcoming" && event.status === "upcoming") ||
      (dateFilter === "completed" && event.status === "completed");
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);

  const handleViewDetails = (eventId: string) => {
    setCurrentPage('event-attendance-detail', { eventId });
  };

  if (loading) {
    return (
      <div className="space-y-6 w-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading attendance data...</p>
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

  // Role-specific content
  const getRoleConfig = () => {
    switch (userRole) {
      case 'admin':
        return {
          title: 'Attendance Tracking',
          description: 'Monitor and manage attendance across all events and staff',
          showManualOverride: true,
          showGenerateReport: true,
          showFlagIssue: false,
        };
      case 'sub-admin':
        return {
          title: 'Attendance',
          description: 'Track staff attendance and manage check-in records',
          showManualOverride: true,
          showGenerateReport: true,
          showFlagIssue: false,
        };
      case 'scheduler':
        return {
          title: 'Attendance Tracking',
          description: 'Review attendance for scheduled events and assigned staff',
          showManualOverride: false,
          showGenerateReport: true,
          showFlagIssue: false,
        };
      case 'manager':
        return {
          title: 'Attendance Tracking',
          description: 'Monitor team attendance and flag attendance issues',
          showManualOverride: false,
          showGenerateReport: true,
          showFlagIssue: true,
        };
      default:
        return {
          title: 'Attendance Tracking',
          description: 'Monitor attendance across all events',
          showManualOverride: false,
          showGenerateReport: false,
          showFlagIssue: false,
        };
    }
  };

  const roleConfig = getRoleConfig();

  const handleGenerateReport = () => {
    toast.success('Attendance report generated and ready for download');
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-[#5E1916]">{roleConfig.title}</h1>
          <p className="text-muted-foreground mt-1">
            {roleConfig.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {roleConfig.showGenerateReport && (
            <Button variant="outline" onClick={handleGenerateReport}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          )}
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="text-xl font-semibold">{stats.totalEvents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Timer className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-xl font-semibold">{stats.inProgress}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-xl font-semibold">{stats.completed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="text-xl font-semibold">{stats.upcoming}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Staff</p>
              <p className="text-xl font-semibold">{stats.totalStaff}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Rate</p>
              <p className="text-xl font-semibold">{stats.averageAttendance}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Events Attendance Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Events Attendance Overview</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-[250px]"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Event Details</TableHead>
                  <TableHead className="font-semibold">Date & Time</TableHead>
                  <TableHead className="font-semibold">Venue</TableHead>
                  <TableHead className="font-semibold text-center">Total Staff</TableHead>
                  <TableHead className="font-semibold text-center">Present</TableHead>
                  <TableHead className="font-semibold text-center">On Shift</TableHead>
                  <TableHead className="font-semibold text-center">Late</TableHead>
                  <TableHead className="font-semibold text-center">Absent</TableHead>
                  <TableHead className="font-semibold text-center">Attendance Rate</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEvents.length > 0 ? (
                  paginatedEvents.map((event) => (
                    <TableRow key={event.eventId} className="hover:bg-muted/30">
                      <TableCell>
                        <div>
                          <p className="font-medium">{event.eventName}</p>
                          <p className="text-xs text-muted-foreground">{event.eventId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {new Date(event.eventDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">{event.eventTime}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-1 max-w-[200px]">
                          <MapPin className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{event.venue}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold">{event.totalStaff}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-700">{event.present}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Timer className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold text-blue-700">{event.onShift}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {event.late > 0 ? (
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <span className="font-semibold text-orange-700">{event.late}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {event.absent > 0 ? (
                          <div className="flex items-center justify-center gap-1">
                            <UserX className="h-4 w-4 text-red-600" />
                            <span className="font-semibold text-red-700">{event.absent}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {getAttendanceRateBadge(event.attendanceRate)}
                      </TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(event.eventId)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {roleConfig.showManualOverride && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCurrentPage('event-attendance-detail', { eventId: event.eventId });
                              }}
                              title="Edit attendance records"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {roleConfig.showFlagIssue && event.absent > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-orange-600 hover:text-orange-700"
                              onClick={() => toast.info(`Attendance issue flagged for ${event.eventName}`)}
                              title="Flag attendance issue"
                            >
                              <Flag className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No events found</p>
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
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredEvents.length)} of {filteredEvents.length} events
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
