import { useState } from "react";
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
  Users,
  Calendar,
  Search,
  Filter,
  Eye,
  Timer,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Download,
  TrendingUp,
  Activity
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";

interface AttendanceProps {
  userRole: string;
  userId: string;
}

interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  eventId: string;
  eventName: string;
  date: string;
  scheduledIn: string;
  scheduledOut: string;
  actualIn?: string;
  actualOut?: string;
  status: 'present' | 'absent' | 'late' | 'early-departure' | 'on-shift';
  location?: string;
  notes?: string;
}

export function Attendance({ userRole }: AttendanceProps) {
  const { setCurrentPage } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("today");
  const [currentPage, setCurrentPageNum] = useState(1);
  const itemsPerPage = 10;

  // Mock attendance data
  const attendanceRecords: AttendanceRecord[] = [
    {
      id: "ATT-001",
      staffId: "ST-101",
      staffName: "Michael Chen",
      staffRole: "Server",
      eventId: "EVT-1234",
      eventName: "Corporate Gala 2024",
      date: "2024-10-10",
      scheduledIn: "18:00",
      scheduledOut: "23:00",
      actualIn: "17:55",
      actualOut: "23:10",
      status: "present",
      location: "Grand Ballroom, Downtown",
      notes: "Checked in on time"
    },
    {
      id: "ATT-002",
      staffId: "ST-102",
      staffName: "Sarah Johnson",
      staffRole: "Bartender",
      eventId: "EVT-1234",
      eventName: "Corporate Gala 2024",
      date: "2024-10-10",
      scheduledIn: "18:00",
      scheduledOut: "23:00",
      actualIn: "18:00",
      status: "on-shift",
      location: "Grand Ballroom, Downtown"
    },
    {
      id: "ATT-003",
      staffId: "ST-103",
      staffName: "David Martinez",
      staffRole: "Event Staff",
      eventId: "EVT-1234",
      eventName: "Corporate Gala 2024",
      date: "2024-10-10",
      scheduledIn: "18:00",
      scheduledOut: "23:00",
      actualIn: "18:25",
      actualOut: "23:05",
      status: "late",
      location: "Grand Ballroom, Downtown",
      notes: "Traffic delay"
    },
    {
      id: "ATT-004",
      staffId: "ST-104",
      staffName: "Emma Davis",
      staffRole: "Server",
      eventId: "EVT-1235",
      eventName: "Wedding Reception",
      date: "2024-10-10",
      scheduledIn: "17:00",
      scheduledOut: "22:00",
      actualIn: "16:50",
      actualOut: "21:30",
      status: "early-departure",
      location: "Riverside Venue",
      notes: "Left early - medical"
    },
    {
      id: "ATT-005",
      staffId: "ST-105",
      staffName: "James Wilson",
      staffRole: "Setup Crew",
      eventId: "EVT-1235",
      eventName: "Wedding Reception",
      date: "2024-10-10",
      scheduledIn: "17:00",
      scheduledOut: "22:00",
      status: "absent",
      location: "Riverside Venue",
      notes: "No show - No call"
    },
    {
      id: "ATT-006",
      staffId: "ST-106",
      staffName: "Lisa Anderson",
      staffRole: "Event Coordinator",
      eventId: "EVT-1236",
      eventName: "Product Launch",
      date: "2024-10-10",
      scheduledIn: "15:00",
      scheduledOut: "20:00",
      actualIn: "14:55",
      status: "on-shift",
      location: "Tech Convention Center"
    },
    {
      id: "ATT-007",
      staffId: "ST-107",
      staffName: "Robert Taylor",
      staffRole: "Security",
      eventId: "EVT-1236",
      eventName: "Product Launch",
      date: "2024-10-10",
      scheduledIn: "15:00",
      scheduledOut: "20:00",
      actualIn: "15:00",
      actualOut: "20:00",
      status: "present",
      location: "Tech Convention Center"
    },
    {
      id: "ATT-008",
      staffId: "ST-108",
      staffName: "Jennifer Lee",
      staffRole: "Registration Desk",
      eventId: "EVT-1237",
      eventName: "Conference Setup",
      date: "2024-10-10",
      scheduledIn: "08:00",
      scheduledOut: "16:00",
      actualIn: "08:10",
      actualOut: "16:05",
      status: "late",
      location: "Business Center",
      notes: "10 min late"
    },
    {
      id: "ATT-009",
      staffId: "ST-109",
      staffName: "Christopher Brown",
      staffRole: "AV Technician",
      eventId: "EVT-1237",
      eventName: "Conference Setup",
      date: "2024-10-10",
      scheduledIn: "08:00",
      scheduledOut: "16:00",
      actualIn: "07:55",
      actualOut: "16:10",
      status: "present",
      location: "Business Center"
    },
    {
      id: "ATT-010",
      staffId: "ST-110",
      staffName: "Amanda White",
      staffRole: "Server",
      eventId: "EVT-1238",
      eventName: "Charity Fundraiser",
      date: "2024-10-10",
      scheduledIn: "18:30",
      scheduledOut: "23:30",
      actualIn: "18:30",
      status: "on-shift",
      location: "Luxury Hotel Ballroom"
    },
  ];

  // Summary statistics
  const stats = {
    totalScheduled: attendanceRecords.length,
    present: attendanceRecords.filter(r => r.status === 'present').length,
    onShift: attendanceRecords.filter(r => r.status === 'on-shift').length,
    late: attendanceRecords.filter(r => r.status === 'late').length,
    absent: attendanceRecords.filter(r => r.status === 'absent').length,
    earlyDeparture: attendanceRecords.filter(r => r.status === 'early-departure').length,
    attendanceRate: ((attendanceRecords.filter(r => r.status !== 'absent').length / attendanceRecords.length) * 100).toFixed(1)
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
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Filter records
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.staffId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    const matchesEvent = eventFilter === "all" || record.eventId === eventFilter;
    return matchesSearch && matchesStatus && matchesEvent;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  // Get unique events for filter
  const uniqueEventsMap = new Map();
  attendanceRecords.forEach(r => {
    if (!uniqueEventsMap.has(r.eventId)) {
      uniqueEventsMap.set(r.eventId, { id: r.eventId, name: r.eventName });
    }
  });
  const uniqueEvents = Array.from(uniqueEventsMap.values());

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Attendance Tracking</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Monitor staff check-ins and attendance across all events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Select value={selectedTab} onValueChange={setSelectedTab}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Scheduled</p>
              <p className="text-xl font-semibold">{stats.totalScheduled}</p>
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
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Absent</p>
              <p className="text-xl font-semibold">{stats.absent}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rate</p>
              <p className="text-xl font-semibold">{stats.attendanceRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Attendance Records</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff or events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-[250px]"
                />
              </div>

              {/* Event Filter */}
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {uniqueEvents.map(event => (
                    <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="on-shift">On Shift</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="early-departure">Early Departure</SelectItem>
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
                  <TableHead className="font-semibold">Staff Member</TableHead>
                  <TableHead className="font-semibold">Event</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Scheduled</TableHead>
                  <TableHead className="font-semibold">Actual In</TableHead>
                  <TableHead className="font-semibold">Actual Out</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.length > 0 ? (
                  paginatedRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.staffName}</p>
                          <p className="text-xs text-muted-foreground">{record.staffRole}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{record.eventName}</p>
                          <p className="text-xs text-muted-foreground">{record.eventId}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {new Date(record.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {record.scheduledIn} - {record.scheduledOut}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {record.actualIn || <span className="text-muted-foreground">--:--</span>}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {record.actualOut || <span className="text-muted-foreground">--:--</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-1 max-w-[200px]">
                          <MapPin className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-sm truncate">{record.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{record.notes || '-'}</span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No attendance records found</p>
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
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPageNum(page)}
                      className={currentPage === page ? "bg-sangria hover:bg-merlot" : ""}
                    >
                      {page}
                    </Button>
                  ))}
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
