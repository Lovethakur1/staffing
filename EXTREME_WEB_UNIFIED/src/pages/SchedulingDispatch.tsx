import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { TooltipWrapper, IconTooltip } from "../components/ui/tooltip-wrapper";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Calendar,
  Search,
  MapPin,
  Users,
  Clock,
  Eye,
  CheckCircle,
  AlertTriangle,
  Navigation,
  RefreshCw,
  Truck,
  Play,
  Pause,
  Phone,
  MessageSquare,
  User,
  ArrowRight,
  Building2,
  CheckCircle2,
  XCircle,
  Radio,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigation } from "../contexts/NavigationContext";
import { eventService } from "../services/event.service";
import { staffService } from "../services/staff.service";
import { shiftService } from "../services/shift.service";
import { format, isToday, isTomorrow, parseISO, addDays } from "date-fns";

interface SchedulingDispatchProps {
  userRole: string;
  userId: string;
}

interface DispatchEvent {
  id: string;
  title: string;
  client: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
  staffRequired: number;
  staffAssigned: number;
  staffCheckedIn: number;
  shifts: any[];
}

interface StaffDispatch {
  id: string;
  name: string;
  role: string;
  status: 'en-route' | 'arrived' | 'working' | 'completed' | 'not-started';
  eventId: string;
  eventTitle: string;
  checkInTime?: string;
  checkOutTime?: string;
  phone?: string;
}

export function SchedulingDispatch({ userRole, userId }: SchedulingDispatchProps) {
  const { setCurrentPage } = useNavigation();
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'week'>('today');
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [events, setEvents] = useState<DispatchEvent[]>([]);
  const [staffDispatch, setStaffDispatch] = useState<StaffDispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<DispatchEvent | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffDispatch | null>(null);
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const itemsPerPage = 10;

  // Fetch data
  const fetchData = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      const eventsRes = await eventService.getEvents();
      const eventsArr = Array.isArray(eventsRes) ? eventsRes : (eventsRes?.data || eventsRes?.events || []);
      
      const mapped: DispatchEvent[] = eventsArr.map((e: any) => ({
        id: e.id,
        title: e.title || e.eventName || 'Event',
        client: e.client?.user?.name || 'Client',
        date: e.date || '',
        startTime: e.startTime || '',
        endTime: e.endTime || '',
        location: e.location || e.venue || '',
        status: (e.status || 'pending').toLowerCase().replace('_', '-'),
        staffRequired: e.staffRequired || 0,
        staffAssigned: e._count?.shifts || e.shifts?.length || 0,
        staffCheckedIn: e.shifts?.filter((s: any) => s.clockInTime)?.length || 0,
        shifts: e.shifts || [],
      }));
      
      setEvents(mapped);
      
      // Build staff dispatch list from shifts
      const staffList: StaffDispatch[] = [];
      eventsArr.forEach((e: any) => {
        (e.shifts || []).forEach((shift: any) => {
          const staff = shift.staff?.user;
          if (staff) {
            let status: StaffDispatch['status'] = 'not-started';
            if (shift.clockOutTime) status = 'completed';
            else if (shift.clockInTime) status = 'working';
            else if (shift.status === 'TRAVEL_TO_VENUE' || shift.status === 'EN_ROUTE') status = 'en-route';
            else if (shift.status === 'ARRIVED') status = 'arrived';
            
            staffList.push({
              id: shift.id,
              name: staff.name || 'Staff',
              role: shift.role || 'Staff',
              status,
              eventId: e.id,
              eventTitle: e.title || 'Event',
              checkInTime: shift.clockInTime,
              checkOutTime: shift.clockOutTime,
              phone: staff.phone,
            });
          }
        });
      });
      setStaffDispatch(staffList);
      
      if (showToast) toast.success('Data refreshed');
    } catch (err) {
      toast.error('Failed to load dispatch data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter events by tab
  const getEventsByTab = () => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const tomorrowStr = format(addDays(today, 1), 'yyyy-MM-dd');
    const weekEnd = format(addDays(today, 7), 'yyyy-MM-dd');
    
    return events.filter(event => {
      const eventDate = event.date.split('T')[0];
      switch (activeTab) {
        case 'today':
          return eventDate === todayStr;
        case 'tomorrow':
          return eventDate === tomorrowStr;
        case 'week':
          return eventDate >= todayStr && eventDate <= weekEnd;
        default:
          return true;
      }
    });
  };

  // Apply filters
  const filteredEvents = getEventsByTab().filter(event => {
    const matchesSearch = searchQuery === '' ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPageNum - 1) * itemsPerPage,
    currentPageNum * itemsPerPage
  );

  // Stats
  const todayEvents = events.filter(e => e.date.split('T')[0] === format(new Date(), 'yyyy-MM-dd'));
  const stats = {
    todayTotal: todayEvents.length,
    inProgress: todayEvents.filter(e => e.status === 'in-progress').length,
    staffOnDuty: staffDispatch.filter(s => s.status === 'working' || s.status === 'arrived').length,
    pendingCheckIn: staffDispatch.filter(s => s.status === 'en-route' || s.status === 'not-started').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'confirmed': return 'bg-purple-100 text-purple-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStaffStatusColor = (status: StaffDispatch['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'working': return 'bg-blue-100 text-blue-700';
      case 'arrived': return 'bg-purple-100 text-purple-700';
      case 'en-route': return 'bg-orange-100 text-orange-700';
      case 'not-started': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-slate-50 items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading dispatch data...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-slate-900 flex items-center gap-2">
              <Radio className="h-6 w-6 text-green-500 animate-pulse" />
              Scheduling & Dispatch
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Real-time staff tracking and event dispatch management
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TooltipWrapper content="Refresh data">
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchData(true)}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipWrapper>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Live Updates
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Today's Events</p>
                  <p className="text-2xl font-semibold text-slate-900">{stats.todayTotal}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">In Progress</p>
                  <p className="text-2xl font-semibold text-orange-600">{stats.inProgress}</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Staff On Duty</p>
                  <p className="text-2xl font-semibold text-green-600">{stats.staffOnDuty}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Check-In</p>
                  <p className="text-2xl font-semibold text-yellow-600">{stats.pendingCheckIn}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as any); setCurrentPageNum(1); }} className="flex-shrink-0">
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex-1 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search events, clients, locations..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPageNum(1); }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPageNum(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Events List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Dispatch Queue
                  <Badge variant="outline" className="ml-2">{filteredEvents.length} events</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paginatedEvents.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No events scheduled for this period</p>
                    </div>
                  ) : (
                    paginatedEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer ${
                          selectedEvent?.id === event.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
                        }`}
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-slate-900">{event.title}</h3>
                              <Badge className={getStatusColor(event.status)}>
                                {event.status.replace('-', ' ')}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                              <div className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {event.client}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {event.startTime} - {event.endTime}
                              </div>
                              <div className="flex items-center gap-1 col-span-2">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-slate-900">
                              {event.staffCheckedIn}/{event.staffAssigned}
                            </div>
                            <div className="text-xs text-slate-500">checked in</div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentPage('admin-event-detail', { eventId: event.id });
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Details
                            </Button>
                          </div>
                          {event.staffAssigned < event.staffRequired && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Needs {event.staffRequired - event.staffAssigned} more staff
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-slate-600">
                      Page {currentPageNum} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPageNum === 1}
                        onClick={() => setCurrentPageNum(prev => prev - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPageNum === totalPages}
                        onClick={() => setCurrentPageNum(prev => prev + 1)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Staff Dispatch Panel */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Staff Status
                  <Badge variant="outline" className="ml-2">{staffDispatch.length} active</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {staffDispatch.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No staff dispatched yet</p>
                    </div>
                  ) : (
                    staffDispatch.slice(0, 10).map((staff) => (
                      <div
                        key={staff.id}
                        className="p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-slate-600" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 text-sm">{staff.name}</div>
                              <div className="text-xs text-slate-500">{staff.role}</div>
                            </div>
                          </div>
                          <Badge className={getStaffStatusColor(staff.status)}>
                            {staff.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {staff.eventTitle}
                          </div>
                          {staff.checkInTime && (
                            <div className="flex items-center gap-1 mt-1">
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                              Checked in at {new Date(staff.checkInTime).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                        {staff.phone && (
                          <div className="mt-2 flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
                              <Phone className="w-3 h-3 mr-1" />
                              Call
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Message
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setCurrentPage('events')}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    View All Events
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setCurrentPage('staff')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Manage Staff
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setCurrentPage('live-ops')}
                  >
                    <Radio className="w-4 h-4 mr-2" />
                    Live Operations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
