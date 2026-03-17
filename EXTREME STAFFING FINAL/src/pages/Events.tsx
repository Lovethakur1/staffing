import { useState } from "react";
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
} from "lucide-react";
import { ComprehensiveEventManagement } from "../components/admin/ComprehensiveEventManagement";
import { useNavigation } from "../contexts/NavigationContext";
import { eventData, type EventData } from "../data/eventData";
import { RescheduleEventDialog, type RescheduleData } from "../components/dialogs/RescheduleEventDialog";

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

  // Function to navigate to the appropriate event detail page based on role
  const handleViewEventDetails = (eventId: string) => {
    // Normalize role to ensure consistent behavior
    const normalizedRole = userRole.toLowerCase();
    
    // Admins and Schedulers use the Admin detail view (with financials hidden for Schedulers)
    if (normalizedRole === 'admin' || normalizedRole === 'scheduler') {
      setCurrentPage('admin-event-detail', { eventId });
    } else {
      // Managers and staff see the operational-only view
      setCurrentPage('manager-event-detail', { eventId });
    }
  };

  // Use centralized events data
  const allEvents: EventData[] = eventData;

  // Handle reschedule event
  const handleRescheduleClick = (event: EventData) => {
    // Only allow rescheduling for events that are not completed or cancelled
    if (event.status === 'completed' || event.status === 'cancelled') {
      return;
    }
    setEventToReschedule(event);
    setRescheduleDialogOpen(true);
  };

  const handleRescheduleSubmit = (data: RescheduleData) => {
    // In a real app, this would update the backend
    console.log('Reschedule data:', data);
    // Close the dialog
    setRescheduleDialogOpen(false);
    setEventToReschedule(null);
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
    avgRating: allEvents.filter(e => e.rating).reduce((sum, e) => sum + (e.rating || 0), 0) / allEvents.filter(e => e.rating).length,
  };

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
              {stats.avgRating.toFixed(1)}
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
                {filteredEvents.map((event) => (
                  <TableRow key={event.id} className="hover:bg-slate-50">
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
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Event
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Export Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
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
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
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
            <Button className="bg-sangria hover:bg-merlot">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
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