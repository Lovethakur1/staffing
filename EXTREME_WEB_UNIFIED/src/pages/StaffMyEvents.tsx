import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  CalendarDays,
  Search,
  Filter,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Download,
  Star,
  TrendingUp,
  Briefcase,
} from "lucide-react";
import { format, parseISO, isPast, isFuture, isToday } from "date-fns";
import { useNavigation } from "../contexts/NavigationContext";
import api from "../services/api";

interface StaffMyEventsProps {
  userId: string;
}

export function StaffMyEvents({ userId }: StaffMyEventsProps) {
  const { setCurrentPage } = useNavigation();
  const [activeTab, setActiveTab] = useState<"upcoming" | "history" | "pending">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [currentPage, setCurrentPageNum] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;
  const [staffEvents, setStaffEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const res = await api.get('/shifts');
        const raw = res.data;
        const shiftsArr = Array.isArray(raw) ? raw : (raw?.data || raw?.shifts || []);
        const mapped = shiftsArr.map((s: any) => {
          const ev = s.event || {};
          const startTime = ev.startTime || s.startTime || '';
          const endTime = ev.endTime || s.endTime || '';
          const startDate = ev.date || s.date || '';
          let duration = 4;
          if (startTime && endTime) {
            const [sh, sm] = startTime.split(':').map(Number);
            const [eh, em] = endTime.split(':').map(Number);
            let rawDuration = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
            // Handle cross-midnight shifts (e.g. 23:00 to 02:00)
            if (rawDuration < 0) rawDuration += 24;
            duration = parseFloat(rawDuration.toFixed(2));
          }
          return {
            id: s.id,           // ← real shift ID, used for navigation
            eventId: ev.id,
            name: ev.title || ev.name || 'Shift',
            type: ev.eventType || ev.type || 'General',
            status: (s.status || 'pending').toLowerCase().replace(/_/g, '-'),
            role: s.role || 'Staff',
            date: startDate ? new Date(startDate).toISOString().split('T')[0] : '',
            startTime,
            endTime,
            duration,
            venue: ev.venue || ev.location || '',
            address: ev.address || ev.location || '',
            expectedGuests: ev.guestCount || ev.expectedGuests || 0,
            checkInStatus: s.clockInTime ? 'completed' : 'not-started',
            payRate: s.hourlyRate || 0,
            totalPay: (s.hourlyRate || 0) * duration,
            rating: 0,
            feedback: '',
          };
        });
        setStaffEvents(mapped);
      } catch {
        setError('Unable to load shifts. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchShifts();
  }, [userId]);

  // Filter events based on tab
  // Backend ShiftStatus: PENDING, CONFIRMED, REJECTED, YET_TO_START,
  //   TRAVEL_TO_VENUE, ARRIVED, ONGOING, IN_PROGRESS, COMPLETED, TRAVEL_HOME
  // All mapped to lowercase via .toLowerCase().replace(/_/g, '-')
  const ACTIVE_STATUSES = ['in-progress', 'ongoing', 'travel-to-venue', 'arrived', 'travel-home'];
  const PRE_WORK_STATUSES = ['pending', 'confirmed', 'yet-to-start'];

  const getEventsByTab = () => {
    switch (activeTab) {
      case "upcoming":
        // Future/today scheduled shifts that staff accepted, including currently active ones
        return staffEvents.filter(
          (event) =>
            event.date &&
            (isFuture(parseISO(event.date)) || isToday(parseISO(event.date))) &&
            event.status !== "cancelled" &&
            event.status !== "completed" &&
            event.status !== "rejected"
        );

      case "history":
        return staffEvents.filter(
          (event) =>
            event.status === "completed" ||
            event.status === "rejected" ||
            (event.date && isPast(parseISO(event.date)) && !isToday(parseISO(event.date)) && !ACTIVE_STATUSES.includes(event.status))
        );
      case "pending":
        return staffEvents.filter((event) => event.status === "pending");
      default:
        return staffEvents;
    }
  };

  // Apply filters and search
  const filteredEvents = getEventsByTab().filter((event) => {
    const matchesSearch =
      searchQuery === "" ||
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || event.type === filterType;
    const matchesRole = filterRole === "all" || event.role === filterRole;

    return matchesSearch && matchesType && matchesRole;
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "date-desc":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "name":
        return a.name.localeCompare(b.name);
      case "venue":
        return a.venue.localeCompare(b.venue);
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedEvents.length / itemsPerPage);
  const paginatedEvents = sortedEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique types and roles for filters
  const eventTypes = Array.from(new Set(staffEvents.map((e) => e.type).filter(Boolean)));
  const eventRoles = Array.from(new Set(staffEvents.map((e) => e.role).filter(Boolean)));

  // Statistics
  const stats = {
    upcoming: staffEvents.filter(
      (e) =>
        e.date && (isFuture(parseISO(e.date)) || isToday(parseISO(e.date))) &&
        e.status !== "cancelled" &&
        e.status !== "completed" &&
        e.status !== "rejected"
    ).length,
    completed: staffEvents.filter((e) => e.status === "completed").length,
    pending: staffEvents.filter((e) => e.status === "pending").length,
    totalHours: staffEvents
      .filter((e) => e.status === "completed")
      .reduce((sum, e) => sum + (e.duration || 0), 0),
  };

  const handleViewDetails = (eventId: string) => {
    setCurrentPage("shift-details", { shiftId: eventId });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 w-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading events...</p>
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-[#5E1916]">My Events</h1>
          <p className="text-gray-500">View all your event assignments and history</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-[#5E1916] mt-1">{stats.upcoming}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-[#5E1916] mt-1">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Events</p>
                <p className="text-2xl font-bold text-[#5E1916] mt-1">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours Worked</p>
                <p className="text-2xl font-bold text-[#5E1916] mt-1">{stats.totalHours}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters (Collapsible) */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Event Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Your Role</label>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {eventRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date (Earliest First)</SelectItem>
                    <SelectItem value="date-desc">Date (Latest First)</SelectItem>
                    <SelectItem value="name">Event Name (A-Z)</SelectItem>
                    <SelectItem value="venue">Venue (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterType("all");
                  setFilterRole("all");
                  setSortBy("date");
                  setSearchQuery("");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Event List
            </CardTitle>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search events, venues, or types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming" className="gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming
                {stats.upcoming > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {stats.upcoming}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="pending" className="gap-2">
                <AlertCircle className="h-4 w-4" />
                Pending
                {stats.pending > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {stats.pending}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {paginatedEvents.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDays className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No events found</p>
                  {searchQuery && (
                    <Button
                      variant="link"
                      onClick={() => setSearchQuery("")}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event Details</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Venue</TableHead>
                          <TableHead>Your Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedEvents.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{event.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {event.type}
                                  </Badge>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {event.expectedGuests} guests
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {format(parseISO(event.date), "MMM dd, yyyy")}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {event.startTime} - {event.endTime}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {event.duration}h duration
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium text-sm">{event.venue}</p>
                                  <p className="text-xs text-gray-500">{event.address}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-[#5E1916] text-white">
                                <Briefcase className="h-3 w-3 mr-1" />
                                {event.role}
                              </Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(event.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(event.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-sm text-gray-500">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(currentPage * itemsPerPage, sortedEvents.length)} of{" "}
                        {sortedEvents.length} events
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageNum(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <div className="flex gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPageNum(page)}
                              className={
                                currentPage === page
                                  ? "bg-[#5E1916] hover:bg-[#4E0707]"
                                  : ""
                              }
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageNum(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
