import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { TooltipWrapper, IconTooltip, InfoTooltip } from "../components/ui/tooltip-wrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  DollarSign,
  MoreHorizontal,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Download,
  Building2,
  Star,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Grid,
  List,
  SlidersHorizontal,
  CalendarClock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckSquare,
} from "lucide-react";
import { ComprehensiveEventManagement } from "../components/admin/ComprehensiveEventManagement";
import { useNavigation } from "../contexts/NavigationContext";
import type { EventData } from "../data/eventData";
import { RescheduleEventDialog, type RescheduleData } from "../components/dialogs/RescheduleEventDialog";
import { eventService } from "../services/event.service";
import { toast } from "sonner";

interface EventsProps {
  userRole: string;
  userId: string;
}

export function Events({ userRole, userId }: EventsProps) {
  const { setCurrentPage } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [eventToReschedule, setEventToReschedule] = useState<EventData | null>(null);

  const [allEvents, setAllEvents] = useState<EventData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const itemsPerPage = 10;

  // Fetch events function (reusable for refresh)
  const fetchEvents = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setIsRefreshing(true);
      const res = await eventService.getEvents();
      const raw = res;
      const eventsArr = Array.isArray(raw) ? raw : (raw?.data || raw?.events || []);
      if (eventsArr.length > 0) {
        const mapped: EventData[] = eventsArr.map((e: any) => ({
          id: e.id,
          name: e.title || e.eventName || 'Event',
          type: e.eventType || 'General',
          client: e.client?.user?.name || 'Client',
          clientCompany: e.client?.company || '',
          clientEmail: e.client?.user?.email || '',
          clientPhone: e.client?.user?.phone || '',
          clientRating: e.client?.rating || 0,
          clientTotalEvents: e.client?.totalEvents || 0,
          date: e.date || '',
          startTime: e.startTime || '',
          endTime: e.endTime || '',
          time: `${e.startTime || ''} - ${e.endTime || ''}`,
          location: e.location || e.venue || '',
          address: e.location || '',
          status: (e.status || 'pending').toLowerCase().replace('_', '-'),
          attendees: e.guestCount || 0,
          staffRequired: e.staffRequired || 0,
          staffAssigned: e._count?.shifts || e.shifts?.length || 0,
          staffCheckedIn: e.shifts?.filter((s: any) => ['IN_PROGRESS', 'BREAK', 'ONGOING', 'COMPLETED'].includes(s.status)).length || 0,
          budget: e.budget || 0,
          paidAmount: 0,
          pendingAmount: e.budget || 0,
          duration: `${e.startTime || ''} - ${e.endTime || ''}`,
          description: e.description || '',
          specialRequirements: e.specialRequirements ? [e.specialRequirements] : [],
          rating: 0,
        }));
        setAllEvents(mapped);
      }
      if (showRefreshToast) toast.success('Events refreshed');
    } catch (err) {
      setError('Unable to load events. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Function to navigate to the appropriate event detail page based on role
  const handleViewEventDetails = (eventId: string) => {
    const normalizedRole = userRole.toLowerCase();
    if (normalizedRole === 'admin' || normalizedRole === 'scheduler') {
      setCurrentPage('admin-event-detail', { eventId });
    } else {
      setCurrentPage('manager-event-detail', { eventId });
    }
  };

  // Handle reschedule event
  const handleRescheduleClick = (event: EventData) => {
    // Only allow rescheduling for events that are not completed or cancelled
    if (event.status === 'completed' || event.status === 'cancelled') {
      return;
    }
    setEventToReschedule(event);
    setRescheduleDialogOpen(true);
  };

  const handleRescheduleSubmit = async (data: RescheduleData) => {
    try {
      const updatePayload: any = { status: data.rescheduleType === 'postpone' ? 'PENDING' : undefined };
      if (data.rescheduleType === 'reschedule') {
        if (data.newDate) updatePayload.date = data.newDate;
        if (data.newStartTime) updatePayload.startTime = data.newStartTime;
        if (data.newEndTime) updatePayload.endTime = data.newEndTime;
      }
      await eventService.updateEvent(data.eventId, updatePayload);
      toast.success(data.rescheduleType === 'postpone' ? 'Event postponed' : 'Event rescheduled');
      // Refresh events list using reusable function
      await fetchEvents();
    } catch (err) {
      toast.error('Failed to reschedule event');
    }
    setRescheduleDialogOpen(false);
    setEventToReschedule(null);
  };

  // Handle bulk selection
  const handleSelectEvent = (eventId: string) => {
    setSelectedEventIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedEventIds.size === filteredEvents.length) {
      setSelectedEventIds(new Set());
    } else {
      setSelectedEventIds(new Set(filteredEvents.map(e => e.id)));
    }
  };

  // Handle bulk export
  const handleBulkExport = () => {
    const selectedEvents = allEvents.filter(e => selectedEventIds.has(e.id));
    if (selectedEvents.length === 0) {
      toast.error('No events selected');
      return;
    }
    
    const csvRows = [
      ['Event Name', 'Type', 'Client', 'Date', 'Time', 'Location', 'Status', 'Guests', 'Staff Required', 'Staff Assigned', 'Budget'],
      ...selectedEvents.map(event => [
        event.name,
        event.type,
        event.client,
        event.date ? new Date(event.date).toLocaleDateString() : '',
        event.time || `${event.startTime} - ${event.endTime}`,
        event.location,
        event.status,
        String(event.attendees || 0),
        String(event.staffRequired || 0),
        String(event.staffAssigned || 0),
        `$${(event.budget || 0).toLocaleString()}`
      ])
    ];
    const csvContent = csvRows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `events_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success(`${selectedEvents.length} events exported`);
    setSelectedEventIds(new Set());
  };

  // Handle Edit Event — navigates to admin event detail page
  const handleEditEvent = (eventId: string) => {
    setCurrentPage('admin-event-detail', { eventId });
  };

  // Handle Manage Staff — navigates to admin event detail page (staff tab)
  const handleManageStaff = (eventId: string) => {
    setCurrentPage('admin-event-detail', { eventId });
  };

  // Handle Export Details — generates a CSV download
  const handleExportDetails = (event: EventData) => {
    const csvRows = [
      ['Field', 'Value'],
      ['Event Name', event.name],
      ['Type', event.type],
      ['Client', event.client],
      ['Date', event.date ? new Date(event.date).toLocaleDateString() : ''],
      ['Time', event.time || `${event.startTime} - ${event.endTime}`],
      ['Location', event.location],
      ['Status', event.status],
      ['Guests', String(event.attendees || 0)],
      ['Staff Required', String(event.staffRequired || 0)],
      ['Staff Assigned', String(event.staffAssigned || 0)],
      ['Budget', `$${(event.budget || 0).toLocaleString()}`],
      ['Description', event.description || ''],
    ];
    const csvContent = csvRows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `event_${event.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success('Event details exported');
  };

  // If event is selected, show detailed view
  if (selectedEvent) {
    return (
      <ComprehensiveEventManagement
        eventId={selectedEvent}
        onBack={() => setSelectedEvent(null)}
      />
    );
  }

  // Filter and sort events
  const filteredEvents = allEvents
    .filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || event.status === statusFilter;
      const matchesType = typeFilter === "all" || event.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "budget":
          return b.budget - a.budget;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPageNum - 1) * itemsPerPage,
    currentPageNum * itemsPerPage
  );

  // Reset page when filters change
  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setCurrentPageNum(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700";
      case "confirmed":
        return "bg-purple-100 text-purple-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "postponed":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Calculate stats
  const stats = {
    total: allEvents.length,
    upcoming: allEvents.filter(e => ['pending', 'confirmed', 'in-progress'].includes(e.status)).length,
    inProgress: allEvents.filter(e => e.status === 'in-progress').length,
    completed: allEvents.filter(e => e.status === 'completed').length,
    totalRevenue: userRole === 'admin' ? allEvents.reduce((sum, e) => sum + e.budget, 0) : 0,
    avgRating: (() => { const rated = allEvents.filter(e => e.rating && e.rating > 0); return rated.length > 0 ? rated.reduce((sum, e) => sum + (e.rating || 0), 0) / rated.length : null; })(),
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-slate-50 items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col bg-slate-50 items-center justify-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Server Error</h2>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-slate-900">Event Management</h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage all aspects of your events from creation to completion
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TooltipWrapper content="Refresh events">
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchEvents(true)}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipWrapper>
            {selectedEventIds.size > 0 && (
              <TooltipWrapper content={`Export ${selectedEventIds.size} selected events`}>
                <Button
                  variant="outline"
                  onClick={handleBulkExport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export ({selectedEventIds.size})
                </Button>
              </TooltipWrapper>
            )}
            <TooltipWrapper content="Create a new event booking">
              <Button
                className="bg-sangria hover:bg-merlot"
                onClick={() => setCurrentPage('create-event')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </TooltipWrapper>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b px-6 py-4">
        <div className={`grid grid-cols-2 gap-4 ${userRole === 'admin' ? 'md:grid-cols-6' : 'md:grid-cols-5'}`}>
          <div className="text-center">
            <div className="text-2xl font-semibold text-slate-900">{stats.total}</div>
            <div className="text-xs text-slate-600">Total Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-blue-600">{stats.upcoming}</div>
            <div className="text-xs text-slate-600">Upcoming</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-orange-600">{stats.inProgress}</div>
            <div className="text-xs text-slate-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-green-600">{stats.completed}</div>
            <div className="text-xs text-slate-600">Completed</div>
          </div>
          {userRole === 'admin' && (
            <div className="text-center">
              <div className="text-2xl font-semibold text-slate-900">
                ${(stats.totalRevenue / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-slate-600">Total Revenue</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-2xl font-semibold text-slate-900">
              {stats.avgRating !== null ? stats.avgRating.toFixed(1) : 'N/A'}
            </div>
            <div className="text-xs text-slate-600">Avg Rating</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search events, clients, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="postponed">Postponed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Corporate">Corporate</SelectItem>
              <SelectItem value="Wedding">Wedding</SelectItem>
              <SelectItem value="Private">Private</SelectItem>
              <SelectItem value="Fundraiser">Fundraiser</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              {userRole === 'admin' && <SelectItem value="budget">Budget</SelectItem>}
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <IconTooltip content="List view">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-sangria hover:bg-merlot' : ''}
              >
                <List className="w-4 h-4" />
              </Button>
            </IconTooltip>
            <IconTooltip content="Grid view">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-sangria hover:bg-merlot' : ''}
              >
                <Grid className="w-4 h-4" />
              </Button>
            </IconTooltip>
          </div>
        </div>
      </div>

      {/* Events List/Grid */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'list' ? (
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedEventIds.size === filteredEvents.length && filteredEvents.length > 0}
                      onChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Staff</TableHead>
                  {userRole === 'admin' && <TableHead>Budget</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEvents.map((event) => (
                  <TableRow key={event.id} className={`hover:bg-slate-50 ${selectedEventIds.has(event.id) ? 'bg-blue-50' : ''}`}>
                    <TableCell>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedEventIds.has(event.id)}
                        onChange={() => handleSelectEvent(event.id)} />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{event.name}</div>
                      <div className="text-xs text-slate-500">{event.type}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span>{event.client}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="flex items-center gap-2">
                          <CalendarIcon className="w-3 h-3 text-slate-400" />
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        {event.time && (
                          <span className="flex items-center gap-2 text-slate-500 text-xs">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 max-w-[150px]" title={event.location}>
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>{event.attendees}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {event.staffCheckedIn}/{event.staffAssigned}
                        <span className="text-xs text-slate-500 ml-1">checked in</span>
                      </div>
                    </TableCell>
                    {userRole === 'admin' && (
                      <TableCell>
                        <span className="font-medium">${(event.budget / 1000).toFixed(1)}K</span>
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <TooltipWrapper content="View details">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewEventDetails(event.id)}
                            className="h-8 w-8"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TooltipWrapper>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewEventDetails(event.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditEvent(event.id)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Event
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportDetails(event)}>
                              <Download className="w-4 h-4 mr-2" />
                              Export Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManageStaff(event.id)}>
                              <Users className="w-4 h-4 mr-2" />
                              Manage Staff
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRescheduleClick(event)}>
                              <CalendarClock className="w-4 h-4 mr-2" />
                              Reschedule Event
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedEvents.map((event) => (
              <Card key={event.id} className={`hover:shadow-md transition-shadow cursor-pointer ${selectedEventIds.has(event.id) ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedEventIds.has(event.id)}
                        onChange={() => handleSelectEvent(event.id)}
                      />
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 truncate">{event.name}</CardTitle>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(event.status)}>
                            {event.status.replace('-', ' ')}
                          </Badge>
                          <Badge variant="outline">{event.type}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Building2 className="w-4 h-4" />
                    <span className="truncate">{event.client}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{event.location}</span>
                  </div>

                  <div className="pt-3 border-t space-y-2">
                    {userRole === 'admin' && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Budget</span>
                        <span className="font-semibold">${event.budget.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Staff</span>
                      <span className="font-semibold">{event.staffAssigned}/{event.staffRequired}</span>
                    </div>
                    {event.rating && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">{event.rating}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleViewEventDetails(event.id)}
                    className="w-full bg-sangria hover:bg-merlot mt-4"
                  >
                    View Full Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No events found</h3>
            <p className="text-slate-600 mb-4">
              Try adjusting your filters or create a new event
            </p>
            <Button className="bg-sangria hover:bg-merlot" onClick={() => setCurrentPage('create-event')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>
        )}

        {/* Pagination */}
        {filteredEvents.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between bg-white border rounded-md mt-4 px-4 py-3">
            <div className="text-sm text-slate-600">
              Showing {(currentPageNum - 1) * itemsPerPage + 1} to {Math.min(currentPageNum * itemsPerPage, filteredEvents.length)} of {filteredEvents.length} events
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPageNum === 1}
                onClick={() => setCurrentPageNum(prev => prev - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPageNum <= 3) {
                    pageNum = i + 1;
                  } else if (currentPageNum >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPageNum - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPageNum === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className={`w-8 h-8 p-0 ${currentPageNum === pageNum ? 'bg-sangria hover:bg-merlot' : ''}`}
                      onClick={() => setCurrentPageNum(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPageNum === totalPages}
                onClick={() => setCurrentPageNum(prev => prev + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Reschedule Event Dialog */}
      {rescheduleDialogOpen && eventToReschedule && (
        <RescheduleEventDialog
          open={rescheduleDialogOpen}
          onOpenChange={setRescheduleDialogOpen}
          eventName={eventToReschedule.name}
          eventId={eventToReschedule.id}
          currentDate={eventToReschedule.date}
          currentStartTime={eventToReschedule.startTime}
          currentEndTime={eventToReschedule.endTime}
          onReschedule={handleRescheduleSubmit}
        />
      )}
    </div>
  );
}
