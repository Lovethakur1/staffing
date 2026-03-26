import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { TooltipWrapper, InfoTooltip } from "../components/ui/tooltip-wrapper";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import {
  Users, Search, Star, MapPin, Clock, Eye, Calendar,
  ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
  Filter, X, SlidersHorizontal, RotateCcw, StarIcon, User, Users2, CalendarDays,
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner";
import { eventService } from "../services/event.service";

interface StaffProps {
  userRole: string;
  userId: string;
}

interface EventWithDetails {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
  eventType?: string;
  clientId?: string;
  managerName: string;
  staffCount: number;
  eventRating?: number;
}

type SortField = 'title' | 'date' | 'location' | 'staffCount' | 'status' | 'eventRating';
type SortOrder = 'asc' | 'desc';

export function Staff({ userRole, userId }: StaffProps) {
  const { setCurrentPage } = useNavigation();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [pageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventWithDetails | null>(null);
  const [favoriteStaff, setFavoriteStaff] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Rating states
  const [eventRating, setEventRating] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState("");
  const [addToFavorites, setAddToFavorites] = useState<string>("no");

  // Live events data
  const [eventsWithDetails, setEventsWithDetails] = useState<EventWithDetails[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const raw = await eventService.getEvents();
        const mapped: EventWithDetails[] = raw
          .filter((ev: any) => {
            const status = (ev.status || '').toLowerCase();
            return ['completed', 'confirmed', 'in-progress', 'pending'].includes(status);
          })
          .map((ev: any) => ({
            id: ev.id,
            title: ev.title || ev.name || 'Untitled Event',
            date: ev.date || ev.startDate || '',
            startTime: ev.startTime || (ev.date ? new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),
            endTime: ev.endTime || '',
            location: ev.venue || ev.location || '',
            status: (ev.status || '').toLowerCase(),
            eventType: ev.eventType || ev.type || 'Event',
            clientId: ev.clientId,
            managerName: ev.manager?.user?.name || ev.manager?.name || 'Not Assigned',
            staffCount: ev.staffShifts?.length || ev.assignedStaff?.length || ev._count?.staffShifts || 0,
            eventRating: ev.rating || undefined,
          }));
        setEventsWithDetails(mapped);
      } catch {
        toast.error('Failed to load event history');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [userId, userRole]);

  // Filtering + sorting
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = eventsWithDetails.filter(event => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.managerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || event.status === statusFilter;

      const matchesLocation = locationFilter === "all" ||
        event.location.toLowerCase().includes(locationFilter.toLowerCase());

      const eventDate = new Date(event.date);
      const matchesMonth = monthFilter === "all" ||
        eventDate.getMonth() === parseInt(monthFilter);

      return matchesSearch && matchesStatus && matchesLocation && matchesMonth;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortField) {
        case 'title': aValue = a.title.toLowerCase(); bValue = b.title.toLowerCase(); break;
        case 'date': aValue = new Date(a.date); bValue = new Date(b.date); break;
        case 'location': aValue = a.location.toLowerCase(); bValue = b.location.toLowerCase(); break;
        case 'staffCount': aValue = a.staffCount; bValue = b.staffCount; break;
        case 'eventRating': aValue = a.eventRating || 0; bValue = b.eventRating || 0; break;
        default: aValue = a.title.toLowerCase(); bValue = b.title.toLowerCase();
      }
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [eventsWithDetails, searchQuery, statusFilter, locationFilter, monthFilter, sortField, sortOrder]);

  // Pagination
  const totalEvents = filteredAndSortedEvents.length;
  const totalPages = Math.ceil(totalEvents / pageSize);
  const startIndex = (currentTablePage - 1) * pageSize;
  const paginatedEvents = filteredAndSortedEvents.slice(startIndex, startIndex + pageSize);

  // Handlers
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentTablePage(1);
    switch (filterType) {
      case 'status': setStatusFilter(value); break;
      case 'location': setLocationFilter(value); break;
      case 'month': setMonthFilter(value); break;
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setLocationFilter("all");
    setMonthFilter("all");
    setCurrentTablePage(1);
  };

  const openRatingDialog = (event: EventWithDetails) => {
    setSelectedEvent(event);
    setEventRating(5);
    setRatingFeedback("");
    setAddToFavorites("no");
    setShowRatingDialog(true);
  };

  const submitRating = () => {
    if (!selectedEvent) return;
    toast.success(`Event rated ${eventRating} stars! Feedback submitted.`);
    if (addToFavorites === "yes") {
      toast.success(`Staff from this event added to favorites!`);
    }
    setShowRatingDialog(false);
  };

  const bookAgain = (event: EventWithDetails) => {
    setCurrentPage("book-event", { bookAgainEventId: event.id });
    toast.success(`Redirecting to book a similar event to "${event.title}"`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-1">Completed</Badge>;
      case 'confirmed': return <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-1">Confirmed</Badge>;
      case 'pending': return <Badge variant="secondary" className="text-xs px-2 py-1">Pending</Badge>;
      case 'cancelled': return <Badge variant="destructive" className="text-xs px-2 py-1">Cancelled</Badge>;
      default: return <Badge variant="secondary" className="text-xs px-2 py-1">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (start: string, end: string) => {
    if (!start) return '—';
    return end ? `${start} - ${end}` : start;
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="desktop-first-header mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground flex items-center gap-2">
            <CalendarDays className="h-8 w-8 text-primary" />
            Event History & Staff Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Review your completed events, rate staff performance, and manage favorites
          </p>
        </div>
        <div className="flex items-center gap-3">
          <InfoTooltip content={`Total completed events: ${totalEvents}`}>
            <Badge variant="outline" className="hidden sm:flex">
              {totalEvents} Events
            </Badge>
          </InfoTooltip>
          <TooltipWrapper content="Show or hide filter options">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {(searchQuery || statusFilter !== "all" || locationFilter !== "all" || monthFilter !== "all") && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs">!</Badge>
              )}
            </Button>
          </TooltipWrapper>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Filters</h3>
                <Button variant="outline" size="sm" onClick={clearFilters} className="h-8 px-3">
                  <X className="w-3 h-3 mr-1" />Clear All
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search events, locations, managers..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentTablePage(1); }} className="pl-10" />
                </div>
                <Select value={statusFilter} onValueChange={(v) => handleFilterChange('status', v)}>
                  <SelectTrigger className="w-40"><Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="All Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={locationFilter} onValueChange={(v) => handleFilterChange('location', v)}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="All Locations" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="new york">New York</SelectItem>
                    <SelectItem value="los angeles">Los Angeles</SelectItem>
                    <SelectItem value="chicago">Chicago</SelectItem>
                    <SelectItem value="miami">Miami</SelectItem>
                    <SelectItem value="san francisco">San Francisco</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={monthFilter} onValueChange={(v) => handleFilterChange('month', v)}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="All Months" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                      <SelectItem key={i} value={String(i)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Event History ({totalEvents})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-medium cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-2">Event Name {getSortIcon('title')}</div>
                </TableHead>
                <TableHead className="font-medium cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-2">Date & Time {getSortIcon('date')}</div>
                </TableHead>
                <TableHead className="font-medium cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('location')}>
                  <div className="flex items-center gap-2">Location {getSortIcon('location')}</div>
                </TableHead>
                <TableHead className="font-medium">Manager</TableHead>
                <TableHead className="font-medium cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('staffCount')}>
                  <div className="flex items-center gap-2">Staff Count {getSortIcon('staffCount')}</div>
                </TableHead>
                <TableHead className="font-medium cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('eventRating')}>
                  <div className="flex items-center gap-2">Rating {getSortIcon('eventRating')}</div>
                </TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <CalendarDays className="h-10 w-10 text-muted-foreground" />
                      <p className="text-muted-foreground">No events found</p>
                      <p className="text-sm text-muted-foreground">
                        {searchQuery || statusFilter !== "all" ? "Try adjusting your search or filters" : "No completed events yet"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{event.eventType}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(event.date)}</div>
                      <div className="text-sm text-muted-foreground">{formatTime(event.startTime, event.endTime)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2 max-w-[200px]">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm truncate" title={event.location}>{event.location || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{event.managerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{event.staffCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.eventRating ? (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < event.eventRating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                          <span className="ml-1 text-sm text-muted-foreground">({event.eventRating}/5)</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not rated</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(event.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <TooltipWrapper content="Rate event and staff performance">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-muted" onClick={() => openRatingDialog(event)}>
                            <StarIcon className="h-4 w-4" />
                          </Button>
                        </TooltipWrapper>
                        <TooltipWrapper content="Book another similar event">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-muted" onClick={() => bookAgain(event)}>
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </TooltipWrapper>
                        <TooltipWrapper content="View event details and staff list">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-muted" onClick={() => setCurrentPage("event-staff-details", { eventId: event.id })}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipWrapper>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalEvents > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, totalEvents)} of {totalEvents} entries
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentTablePage(p => Math.max(1, p - 1))} disabled={currentTablePage === 1} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
              <Button key={page} variant={currentTablePage === page ? "default" : "outline"} size="sm" onClick={() => setCurrentTablePage(page)} className="h-8 w-8 p-0">{page}</Button>
            ))}
            <Button variant="outline" size="sm" onClick={() => setCurrentTablePage(p => Math.min(totalPages, p + 1))} disabled={currentTablePage === totalPages} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><StarIcon className="w-5 h-5" />Rate Event & Staff</DialogTitle>
            <DialogDescription>Provide feedback for "{selectedEvent?.title}" and manage staff favorites</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6 pb-2">
              <Card className="p-4 bg-muted/50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{selectedEvent.title}</h4>
                    <Badge>{selectedEvent.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /><span>{formatDate(selectedEvent.date)}</span></div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /><span>{formatTime(selectedEvent.startTime, selectedEvent.endTime)}</span></div>
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /><span>{selectedEvent.location}</span></div>
                    <div className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" /><span>{selectedEvent.managerName}</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users2 className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedEvent.staffCount} staff members</span>
                  </div>
                </div>
              </Card>

              <div className="space-y-3">
                <label className="font-medium">Overall Event Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setEventRating(star)} className="transition-colors hover:scale-110">
                      <Star className={`w-8 h-8 ${star <= eventRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">({eventRating}/5 stars)</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="font-medium">Add Staff to Favorites</label>
                <p className="text-sm text-muted-foreground">
                  Would you like to add staff from this event to your favorites for easy future booking?
                </p>
                <RadioGroup value={addToFavorites} onValueChange={setAddToFavorites} className="mt-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes" className="cursor-pointer">Yes, add all staff to favorites</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no" className="cursor-pointer">No, don't add to favorites</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <label htmlFor="feedback" className="font-medium">Additional Feedback (Optional)</label>
                <Textarea
                  id="feedback"
                  placeholder="Share your experience with this event and staff performance..."
                  value={ratingFeedback}
                  onChange={(e) => setRatingFeedback(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowRatingDialog(false)}>Cancel</Button>
                <Button variant="outline" onClick={() => { setShowRatingDialog(false); bookAgain(selectedEvent); }} className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />Book Again
                </Button>
                <Button onClick={submitRating} className="flex items-center gap-2">
                  <StarIcon className="w-4 h-4" />Submit Rating
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
