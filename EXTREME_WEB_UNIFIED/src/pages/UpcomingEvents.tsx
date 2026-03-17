import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Pagination } from "../components/ui/pagination";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Eye,
  MessageSquare,
  SlidersHorizontal,
  X,
  ChevronDown,
  ArrowUpDown,
  MoreHorizontal,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { eventService } from "../services/event.service";
import { useNavigation } from "../contexts/NavigationContext";

interface UpcomingEventsProps {
  userRole: string;
  userId: string;
  filterType?: 'upcoming' | 'ongoing';
}

export function UpcomingEvents({ userRole, userId, filterType = 'upcoming' }: UpcomingEventsProps) {
  const { setCurrentPage } = useNavigation();

  // API data state
  const [rawEvents, setRawEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await eventService.getEvents();
        const d = res;
        setRawEvents(Array.isArray(d) ? d : (d?.data || d?.events || []));
      } catch (err: any) {
        setFetchError(err?.response?.data?.error || 'Failed to load events.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // State for Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "budget" | "title">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPageNum] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Role checks
  const isClient = userRole === 'client';
  const isAdmin = userRole === 'admin';
  const showBudget = isAdmin;

  // 1. Filter by Role & Date (Upcoming) — backend already filters by role via JWT
  const baseEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return rawEvents.filter(event => {
      if (filterType === 'ongoing') {
        return event.status === 'IN_PROGRESS' || event.status === 'in-progress';
      }
      const eventDate = new Date(event.date);
      const status = (event.status || '').toUpperCase();
      return eventDate >= today && (status === 'CONFIRMED' || status === 'PENDING' || status === 'IN_PROGRESS');
    });
  }, [rawEvents, filterType]);

  // 2. Get Unique Event Types for Filter
  const eventTypes = useMemo(() => {
    const types = new Set(baseEvents.map((e: any) => e.eventType).filter(Boolean));
    return Array.from(types);
  }, [baseEvents]);

  // 3. Apply Search & Filters
  const filteredEvents = useMemo(() => {
    return baseEvents.filter((event: any) => {
      const matchesSearch =
        (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.eventType || "").toLowerCase().includes(searchTerm.toLowerCase());

      const evStatus = (event.status || '').toLowerCase();
      const matchesStatus = statusFilter === "all" || evStatus === statusFilter;
      const matchesType = typeFilter === "all" || event.eventType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [baseEvents, searchTerm, statusFilter, typeFilter]);

  // 4. Apply Sorting
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a: any, b: any) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === "budget") {
        comparison = (b.budget || 0) - (a.budget || 0);
      } else if (sortBy === "title") {
        comparison = (a.title || '').localeCompare(b.title || '');
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredEvents, sortBy, sortOrder]);

  // 5. Pagination Logic
  const totalPages = Math.ceil(sortedEvents.length / itemsPerPage);
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedEvents.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedEvents, currentPage, itemsPerPage]);

  // Helpers
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setSortBy("date");
    setSortOrder("asc");
    setCurrentPageNum(1);
  };

  const toggleSort = (field: "date" | "budget" | "title") => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-success/10 text-success border-success/20 hover:bg-success/20';
      case 'pending': return 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20';
      case 'completed': return 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20';
      default: return 'bg-muted/50 text-muted-foreground border-border';
    }
  };

  const getUrgencyIndicator = (date: string, status: string) => {
    const eventDate = new Date(date);
    const now = new Date();
    const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

    if (status === 'pending' && daysUntil <= 7 && daysUntil > 0) return <AlertCircle className="h-4 w-4 text-orange-500" />;
    if (status === 'pending' && daysUntil <= 3 && daysUntil > 0) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (status === 'confirmed') return <CheckCircle className="h-4 w-4 text-green-500" />;
    return null;
  };

  const getDaysUntilEvent = (date: string) => {
    const eventDate = new Date(date);
    const now = new Date();
    const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

    if (daysUntil === 0) return "Today";
    if (daysUntil === 1) return "Tomorrow";
    if (daysUntil > 0) return `In ${daysUntil} days`;
    return "Past";
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-3 text-muted-foreground">Loading events...</span>
    </div>
  );

  if (fetchError) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-destructive">
      <AlertCircle className="h-8 w-8" />
      <p>{fetchError}</p>
      <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
    </div>
  );

  return (
    <div className="page-container space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Clock className="h-8 w-8 text-primary" />
            Upcoming Events
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your schedule, staffing, and event details efficiently.
          </p>
        </div>
        {isClient && (
          <Button onClick={() => setCurrentPage("book-event")} size="lg" className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Book New Event
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Upcoming</p>
              <div className="text-2xl font-bold">{baseEvents.length}</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
              <div className="text-2xl font-bold text-green-600">
                {baseEvents.filter(e => e.status === 'confirmed').length}
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Action</p>
              <div className="text-2xl font-bold text-orange-600">
                {baseEvents.filter(e => e.status === 'pending').length}
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">This Week</p>
              <div className="text-2xl font-bold text-blue-600">
                {baseEvents.filter(e => {
                  const days = Math.ceil((new Date(e.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                  return days >= 0 && days <= 7;
                }).length}
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Data Table Card */}
      <Card className="border-border/60 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle>Events List</CardTitle>
              <CardDescription>
                Showing {filteredEvents.length} events matching your criteria
              </CardDescription>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPageNum(1); // Reset page on search
                  }}
                  className="pl-9 bg-background"
                />
              </div>

              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPageNum(1); }}>
                  <SelectTrigger className="w-[130px] bg-background">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPageNum(1); }}>
                  <SelectTrigger className="w-[140px] bg-background">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {eventTypes.map(type => (
                      <SelectItem key={type as string} value={type as string}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetFilters}
                    className="h-10 w-10 text-muted-foreground hover:text-foreground"
                    title="Clear Filters"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="border-t">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[50px] text-center">#</TableHead>
                  <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort("title")}>
                    <div className="flex items-center gap-1">
                      Event Details
                      {sortBy === "title" && <ArrowUpDown className="h-3 w-3" />}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort("date")}>
                    <div className="flex items-center gap-1">
                      Date & Time
                      {sortBy === "date" && <ArrowUpDown className="h-3 w-3" />}
                    </div>
                  </TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Staffing</TableHead>
                  {!isClient && <TableHead>Client</TableHead>}
                  {showBudget && (
                    <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort("budget")}>
                      <div className="flex items-center gap-1">
                        Budget
                        {sortBy === "budget" && <ArrowUpDown className="h-3 w-3" />}
                      </div>
                    </TableHead>
                  )}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEvents.length > 0 ? (
                  paginatedEvents.map((event: any, index) => {
                    // Backend includes client info nested
                    const clientName = event.client?.user?.name || event.client?.companyName || 'Unknown';
                    const clientEmail = event.client?.user?.email || '';
                    const assignedStaff = event.shifts || [];
                    const staffingPercentage = (event.staffRequired || 0) > 0
                      ? Math.round((assignedStaff.length / event.staffRequired) * 100)
                      : 0;

                    return (
                      <TableRow key={event.id} className="group hover:bg-muted/30">
                        <TableCell className="text-center text-muted-foreground text-xs">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </TableCell>

                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold group-hover:text-primary transition-colors">{event.title}</span>
                            <span className="text-xs text-muted-foreground">{event.eventType}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground mt-0.5">
                              <Clock className="h-3.5 w-3.5" />
                              <span className="text-xs">{event.startTime} - {event.endTime}</span>
                            </div>
                            <Badge variant="outline" className="w-fit mt-1 text-[10px] h-5 px-1.5 font-normal border-border">
                              {getDaysUntilEvent(event.date)}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-start gap-1.5 max-w-[180px]">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                            <span className="text-sm line-clamp-2" title={event.location}>{event.location}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="w-[160px] space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{assignedStaff.length}/{event.staffRequired || 0} Staff</span>
                              <span className={staffingPercentage === 100 ? "text-green-600 font-medium" : "text-muted-foreground"}>
                                {staffingPercentage}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${staffingPercentage === 100 ? 'bg-green-500' :
                                  staffingPercentage >= 50 ? 'bg-blue-500' : 'bg-orange-500'
                                  }`}
                                style={{ width: `${staffingPercentage}%` }}
                              />
                            </div>
                            <div className="flex -space-x-2">
                              {assignedStaff.slice(0, 3).map((shift: any, i: number) => (
                                <Avatar key={shift?.id || i} className="h-6 w-6 border-2 border-background ring-1 ring-border/50">
                                  <AvatarFallback className="text-[9px] bg-primary/5 text-primary">
                                    {shift?.staff?.user?.name?.substring(0, 2).toUpperCase() || 'S'}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {assignedStaff.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background ring-1 ring-border/50 flex items-center justify-center text-[9px] font-medium text-muted-foreground">
                                  +{assignedStaff.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {!isClient && (
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{clientName}</div>
                              <div className="text-xs text-muted-foreground">{clientEmail}</div>
                            </div>
                          </TableCell>
                        )}

                        {showBudget && (
                          <TableCell>
                            <div className="flex items-center font-mono text-sm text-muted-foreground">
                              <DollarSign className="h-3.5 w-3.5 mr-1" />
                              {event.budget.toLocaleString()}
                            </div>
                          </TableCell>
                        )}

                        <TableCell>
                          <Badge variant="secondary" className={`${getStatusColor(event.status)} capitalize border px-2.5 py-0.5 rounded-md shadow-none`}>
                            {event.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setCurrentPage("booking-details", { bookingId: event.id })}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setCurrentPage("messages", { eventId: event.id, staffIds: event?.shifts || [], eventTitle: event.title })}>
                                <MessageSquare className="mr-2 h-4 w-4" /> Messages
                              </DropdownMenuItem>
                              {isAdmin && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive">
                                    Cancel Event
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={isClient ? 8 : (showBudget ? 9 : 8)} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                        <Search className="h-10 w-10 mb-2 opacity-20" />
                        <p className="text-lg font-medium">No events found</p>
                        <p className="text-sm">Try adjusting your filters or search query.</p>
                        <Button
                          variant="link"
                          onClick={resetFilters}
                          className="mt-2 text-primary"
                        >
                          Clear all filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Footer with Pagination */}
        <div className="p-4 border-t bg-muted/5">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredEvents.length}
            onPageChange={setCurrentPageNum}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val);
              setCurrentPageNum(1);
            }}
          />
        </div>
      </Card>
    </div>
  );
}
