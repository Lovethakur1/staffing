import { useState } from "react";
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
  ArrowRight
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";

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
  const itemsPerPage = 10;

  // Mock event attendance data
  const eventAttendance: EventAttendanceSummary[] = [
    {
      eventId: "EVT-1234",
      eventName: "Corporate Gala 2024",
      eventDate: "2024-11-14",
      eventTime: "18:00 - 23:00",
      venue: "Grand Ballroom, Downtown",
      totalStaff: 25,
      present: 18,
      onShift: 5,
      late: 2,
      absent: 0,
      earlyDeparture: 0,
      attendanceRate: 100,
      status: 'in-progress'
    },
    {
      eventId: "EVT-1235",
      eventName: "Wedding Reception - Smith & Johnson",
      eventDate: "2024-11-14",
      eventTime: "17:00 - 22:00",
      venue: "Riverside Venue",
      totalStaff: 15,
      present: 12,
      onShift: 2,
      late: 0,
      absent: 1,
      earlyDeparture: 0,
      attendanceRate: 93.3,
      status: 'in-progress'
    },
    {
      eventId: "EVT-1236",
      eventName: "Tech Product Launch",
      eventDate: "2024-11-14",
      eventTime: "15:00 - 20:00",
      venue: "Tech Convention Center",
      totalStaff: 32,
      present: 30,
      onShift: 0,
      late: 1,
      absent: 1,
      earlyDeparture: 0,
      attendanceRate: 96.9,
      status: 'completed'
    },
    {
      eventId: "EVT-1237",
      eventName: "Business Conference Setup",
      eventDate: "2024-11-14",
      eventTime: "08:00 - 16:00",
      venue: "Business Center",
      totalStaff: 20,
      present: 19,
      onShift: 0,
      late: 1,
      absent: 0,
      earlyDeparture: 0,
      attendanceRate: 100,
      status: 'completed'
    },
    {
      eventId: "EVT-1238",
      eventName: "Charity Fundraiser Gala",
      eventDate: "2024-11-14",
      eventTime: "18:30 - 23:30",
      venue: "Luxury Hotel Ballroom",
      totalStaff: 28,
      present: 15,
      onShift: 12,
      late: 1,
      absent: 0,
      earlyDeparture: 0,
      attendanceRate: 100,
      status: 'in-progress'
    },
    {
      eventId: "EVT-1239",
      eventName: "Holiday Corporate Party",
      eventDate: "2024-11-15",
      eventTime: "19:00 - 01:00",
      venue: "Downtown Event Space",
      totalStaff: 40,
      present: 0,
      onShift: 0,
      late: 0,
      absent: 0,
      earlyDeparture: 0,
      attendanceRate: 0,
      status: 'upcoming'
    },
    {
      eventId: "EVT-1240",
      eventName: "Birthday Party - Martinez",
      eventDate: "2024-11-15",
      eventTime: "14:00 - 18:00",
      venue: "Garden Venue",
      totalStaff: 8,
      present: 0,
      onShift: 0,
      late: 0,
      absent: 0,
      earlyDeparture: 0,
      attendanceRate: 0,
      status: 'upcoming'
    },
    {
      eventId: "EVT-1241",
      eventName: "Annual Shareholders Meeting",
      eventDate: "2024-11-13",
      eventTime: "09:00 - 17:00",
      venue: "Corporate Headquarters",
      totalStaff: 18,
      present: 17,
      onShift: 0,
      late: 1,
      absent: 0,
      earlyDeparture: 0,
      attendanceRate: 100,
      status: 'completed'
    },
    {
      eventId: "EVT-1242",
      eventName: "Art Gallery Opening",
      eventDate: "2024-11-13",
      eventTime: "18:00 - 22:00",
      venue: "Modern Art Museum",
      totalStaff: 12,
      present: 11,
      onShift: 0,
      late: 0,
      absent: 1,
      earlyDeparture: 0,
      attendanceRate: 91.7,
      status: 'completed'
    },
    {
      eventId: "EVT-1243",
      eventName: "Food Festival Weekend",
      eventDate: "2024-11-12",
      eventTime: "10:00 - 20:00",
      venue: "City Park",
      totalStaff: 55,
      present: 52,
      onShift: 0,
      late: 2,
      absent: 1,
      earlyDeparture: 0,
      attendanceRate: 98.2,
      status: 'completed'
    },
  ];

  // Summary statistics
  const stats = {
    totalEvents: eventAttendance.length,
    inProgress: eventAttendance.filter(e => e.status === 'in-progress').length,
    completed: eventAttendance.filter(e => e.status === 'completed').length,
    upcoming: eventAttendance.filter(e => e.status === 'upcoming').length,
    totalStaff: eventAttendance.reduce((acc, e) => acc + e.totalStaff, 0),
    averageAttendance: (eventAttendance
      .filter(e => e.status !== 'upcoming')
      .reduce((acc, e) => acc + e.attendanceRate, 0) / 
      eventAttendance.filter(e => e.status !== 'upcoming').length).toFixed(1)
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
    const matchesDate = dateFilter === "all" || 
                       (dateFilter === "today" && event.eventDate === "2024-11-14") ||
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

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-[#5E1916]">Attendance Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Monitor attendance across all events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(event.eventId)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
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
