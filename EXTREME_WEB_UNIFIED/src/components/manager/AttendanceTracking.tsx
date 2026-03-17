import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TooltipWrapper } from "../ui/tooltip-wrapper";
import {
  Clock,
  UserCheck,
  UserX,
  MapPin,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Users,
  Calendar,
  Search,
  Filter,
  Eye,
  TrendingUp,
  Car
} from "lucide-react";
import { useNavigation } from "../../contexts/NavigationContext";
import api from "../../services/api";

interface AttendanceTrackingProps {
  managerId: string;
  events: any[];
}

interface EventWithAttendance {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  totalStaff: number;
  checkedIn: number;
  checkedOut: number;
  absent: number;
  late: number;
  traveling: number;
  status: 'upcoming' | 'in-progress' | 'completed';
}

export function AttendanceTracking({ managerId, events }: AttendanceTrackingProps) {
  const { setCurrentPage } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [eventsWithAttendance, setEventsWithAttendance] = useState<EventWithAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [evRes, shiftRes] = await Promise.all([
          api.get('/events'),
          api.get('/shifts'),
        ]);

        const evRaw = evRes.data;
        const evArr = Array.isArray(evRaw) ? evRaw : (evRaw?.data || []);
        const shiftRaw = shiftRes.data;
        const shiftArr = Array.isArray(shiftRaw) ? shiftRaw : (shiftRaw?.data || []);

        // Group shifts by eventId
        const shiftsByEvent: Record<string, any[]> = {};
        shiftArr.forEach((s: any) => {
          if (!shiftsByEvent[s.eventId]) shiftsByEvent[s.eventId] = [];
          shiftsByEvent[s.eventId].push(s);
        });

        const mapped: EventWithAttendance[] = evArr.map((ev: any) => {
          const shifts = shiftsByEvent[ev.id] || [];
          const total = shifts.length;
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
              const hasActive = shifts.some((s: any) => s.status === 'IN_PROGRESS' || s.status === 'ARRIVED');
              const allDone = total > 0 && shifts.every((s: any) => s.status === 'COMPLETED' || s.status === 'CANCELLED');
              if (allDone) evStatus = 'completed';
              else if (hasActive || shifts.some((s: any) => s.clockIn)) evStatus = 'in-progress';
            }
          }

          const checkedIn = shifts.filter((s: any) => s.status === 'IN_PROGRESS' || s.status === 'ARRIVED').length;
          const checkedOut = shifts.filter((s: any) => s.status === 'COMPLETED').length;
          const absent = shifts.filter((s: any) => s.status === 'CANCELLED' || s.status === 'NO_SHOW').length;
          const traveling = shifts.filter((s: any) => s.status === 'TRAVEL_TO_VENUE').length;
          const late = shifts.filter((s: any) => {
            if (!s.clockIn || !s.startTime) return false;
            const clockInTime = new Date(s.clockIn);
            const [h, m] = s.startTime.split(':').map(Number);
            const scheduled = new Date(clockInTime);
            scheduled.setHours(h, m, 0, 0);
            return clockInTime > scheduled;
          }).length;

          return {
            id: ev.id,
            title: ev.title || ev.eventName || 'Event',
            date: ev.date ? new Date(ev.date).toISOString().split('T')[0] : '',
            startTime: ev.startTime || '',
            endTime: ev.endTime || '',
            venue: ev.venue || ev.location || '',
            totalStaff: total,
            checkedIn,
            checkedOut,
            absent,
            late,
            traveling,
            status: evStatus,
          };
        });

        setEventsWithAttendance(mapped);
      } catch (err) {
        console.error('Failed to load attendance tracking data:', err);
        setError('Unable to load attendance data. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [managerId]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return eventsWithAttendance.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || event.status === statusFilter;

      let matchesDate = true;
      if (dateFilter === "today") {
        const todayStr = new Date().toISOString().split('T')[0];
        matchesDate = event.date === todayStr;
      } else if (dateFilter === "upcoming") {
        matchesDate = event.status === "upcoming";
      } else if (dateFilter === "completed") {
        matchesDate = event.status === "completed";
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [eventsWithAttendance, searchQuery, statusFilter, dateFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredEvents.length;
    const inProgress = filteredEvents.filter(e => e.status === 'in-progress').length;
    const totalStaff = filteredEvents.reduce((sum, e) => sum + e.totalStaff, 0);
    const totalCheckedIn = filteredEvents.reduce((sum, e) => sum + e.checkedIn, 0);
    const totalTraveling = filteredEvents.reduce((sum, e) => sum + e.traveling, 0);
    const totalAbsent = filteredEvents.reduce((sum, e) => sum + e.absent, 0);
    const avgAttendanceRate = totalStaff > 0
      ? Math.round(((totalStaff - totalAbsent) / totalStaff) * 100)
      : 0;

    return { total, inProgress, totalStaff, totalCheckedIn, totalTraveling, avgAttendanceRate };
  }, [filteredEvents]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-progress':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Live</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-700"><Clock className="h-3 w-3 mr-1" />Upcoming</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-700"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAttendanceRate = (event: EventWithAttendance) => {
    if (event.totalStaff === 0) return 0;
    const attended = event.totalStaff - event.absent;
    return Math.round((attended / event.totalStaff) * 100);
  };

  if (loading) {
    return (
      <div className="space-y-6 flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 flex items-center justify-center py-12">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Attendance Tracking</h2>
          <p className="text-muted-foreground">
            Monitor staff attendance across all events
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Live Events</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{stats.totalStaff}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalCheckedIn} working, {stats.totalTraveling} traveling
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold">{stats.avgAttendanceRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events by name or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Date Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No events match your filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className={event.status === 'in-progress' ? 'border-2 border-green-500' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      {getStatusBadge(event.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{event.totalStaff} Staff</span>
                      </div>
                    </div>
                  </div>
                  <TooltipWrapper content="View detailed attendance records for all staff">
                    <Button
                      onClick={() => setCurrentPage('manager-event-attendance-detail', { eventId: event.id })}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </TooltipWrapper>
                </div>

                {/* Attendance Summary */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Total</p>
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{event.totalStaff}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Checked In</p>
                    <div className="flex items-center justify-center gap-1">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-700">{event.checkedIn}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Traveling</p>
                    <div className="flex items-center justify-center gap-1">
                      <Car className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold text-blue-600">{event.traveling}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Checked Out</p>
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-blue-700">{event.checkedOut}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Late</p>
                    <div className="flex items-center justify-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-semibold text-yellow-700">{event.late}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Absent</p>
                    <div className="flex items-center justify-center gap-1">
                      <UserX className="h-4 w-4 text-red-600" />
                      <span className="font-semibold text-red-700">{event.absent}</span>
                    </div>
                  </div>
                </div>

                {/* Attendance Rate Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Attendance Rate</span>
                    <span className="font-semibold">{getAttendanceRate(event)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 rounded-full transition-all"
                      style={{ width: `${getAttendanceRate(event)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
