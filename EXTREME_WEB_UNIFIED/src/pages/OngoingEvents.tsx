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
  X,
  ArrowUpDown,
  MoreHorizontal,
  Radio,
  ClipboardCheck,
  Activity,
  PlayCircle,
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

interface OngoingEventsProps {
  userRole: string;
  userId: string;
}

export function OngoingEvents({ userRole, userId }: OngoingEventsProps) {
  const { setCurrentPage } = useNavigation();

  // API state
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
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"time" | "budget" | "title">("time");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPageNum] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Role checks
  const isClient = userRole === 'client';
  const isAdmin = userRole === 'admin';
  const showBudget = isAdmin;

  // 1. Filter to only ongoing/today events — backend already filters by role
  const baseEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    return rawEvents.filter(event => {
      const status = (event.status || '').toUpperCase();
      const eventDate = (event.date || '').split('T')[0];
      return status === 'IN_PROGRESS' || (status === 'CONFIRMED' && eventDate === todayStr);
    });
  }, [rawEvents]);

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

      const matchesType = typeFilter === "all" || event.eventType === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [baseEvents, searchTerm, typeFilter]);

  // 4. Apply Sorting
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a: any, b: any) => {
      let comparison = 0;
      if (sortBy === "time") {
        comparison = (a.startTime || '').localeCompare(b.startTime || '');
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
    setTypeFilter("all");
    setSortBy("time");
    setSortOrder("asc");
    setCurrentPageNum(1);
  };

  const toggleSort = (field: "time" | "budget" | "title") => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const activeStaffCount = baseEvents.reduce((acc: number, event: any) => acc + (event.shifts?.length || 0), 0);

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-3 text-muted-foreground">Loading ongoing events...</span>
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
            <Radio className="h-8 w-8 text-blue-600" />
            Ongoing Events
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor active events happening today in real-time.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Events</p>
              <div className="text-2xl font-bold">{baseEvents.length}</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Staff On-Site</p>
              <div className="text-2xl font-bold text-green-600">
                {activeStaffCount}
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Locations</p>
              <div className="text-2xl font-bold text-purple-600">
                {new Set(baseEvents.map(e => e.location)).size}
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Alerts</p>
              <div className="text-2xl font-bold text-orange-600">
                0
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Data Table Card */}
      <Card className="border-border/60 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle>Live Events Feed</CardTitle>
              <CardDescription>
                Real-time view of {filteredEvents.length} events currently active
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

                {(searchTerm || typeFilter !== "all") && (
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
                  <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort("time")}>
                    <div className="flex items-center gap-1">
                      Time
                      {sortBy === "time" && <ArrowUpDown className="h-3 w-3" />}
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
                              <Clock className="h-3.5 w-3.5 text-blue-600" />
                              <span className="font-medium text-blue-700">{event.startTime} - {event.endTime}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {/* Calculate duration or progress here if needed */}
                              Active Now
                            </div>
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
                          <Badge variant="secondary" className={`${getStatusColor(event.status)} capitalize border px-2.5 py-0.5 rounded-md shadow-none flex w-fit items-center gap-1`}>
                            {event.status === 'in-progress' || (event.status === 'confirmed' && event.date === new Date().toISOString().split('T')[0]) ? (
                              <>
                                <span className="relative flex h-2 w-2 mr-1">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Live
                              </>
                            ) : event.status}
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
                                <Eye className="mr-2 h-4 w-4" /> Monitor
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setCurrentPage("messages", { eventId: event.id, staffIds: event?.shifts || [], eventTitle: event.title })}>
                                <MessageSquare className="mr-2 h-4 w-4" /> Message Team
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <PlayCircle className="mr-2 h-4 w-4" /> Attendance Check
                              </DropdownMenuItem>
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
                        <Activity className="h-10 w-10 mb-2 opacity-20" />
                        <p className="text-lg font-medium">No ongoing events</p>
                        <p className="text-sm">There are no events currently in progress.</p>
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
