import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { IconTooltip } from "../components/ui/tooltip-wrapper";
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
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Calendar,
  Users,
  DollarSign,
  Eye,
  CheckSquare,
  XCircle,
  Star,
  AlertCircle,
  Building2,
  Briefcase,
  Download,
  RefreshCw,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner";
import type { EventRequest } from "../data/eventRequestsData";
import { eventService } from "../services/event.service";

interface EventRequestsQueueProps {
  userRole: string;
  userId: string;
}

export function EventRequestsQueue({ userRole, userId }: EventRequestsQueueProps) {
  const { setCurrentPage, setPageParams } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [validationFilter, setValidationFilter] = useState("all");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedRequest, setSelectedRequest] = useState<EventRequest | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const [eventRequestsData, setEventRequestsData] = useState<EventRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isScheduler = userRole === 'scheduler';

  // Fetch events from API and map to EventRequest interface
  const fetchEvents = useCallback(async (showLoading = true) => {
    if (showLoading) setIsRefreshing(true);
    try {
      const res = await eventService.getEvents();
      const d = res;
      const events: any[] = Array.isArray(d) ? d : (d?.data || d?.events || []);

      // Map backend events to EventRequest display format
      const mapped: EventRequest[] = events.map((ev: any, idx: number) => {
        const statusMap: Record<string, EventRequest['status']> = {
          'PENDING': 'pending',
          'CONFIRMED': 'approved',
          'CANCELLED': 'rejected',
          'COMPLETED': 'approved',
          'IN_PROGRESS': 'under-review',
        };
        const evStatus = (ev.status || 'PENDING').toUpperCase();
        return {
          id: ev.id,
          requestNumber: `REQ-${ev.id?.substring(0, 4).toUpperCase() || String(idx + 1).padStart(4, '0')}`,
          submittedDate: ev.createdAt || ev.date || new Date().toISOString(),
          clientId: ev.clientId || '',
          clientName: ev.client?.user?.name || ev.clientName || 'Client',
          clientEmail: ev.client?.user?.email || ev.clientEmail || '',
          clientPhone: ev.client?.user?.phone || ev.clientPhone || '',
          clientCompany: ev.client?.company || ev.company || '',
          eventName: ev.title || ev.eventName || 'Untitled Event',
          eventType: ev.eventType || ev.type || 'General',
          eventDate: ev.date || '',
          startTime: ev.startTime || '09:00',
          endTime: ev.endTime || '17:00',
          venue: ev.venue || ev.location || '',
          address: ev.address || ev.location || '',
          estimatedGuests: ev.guestCount || ev.estimatedGuests || 0,
          totalStaffNeeded: ev.staffRequired || ev.shiftsNeeded || 0,
          favoritesSelected: 0,
          selectedTiers: [],
          totalPrice: ev.budget || 0,
          specialRequirements: ev.notes || ev.specialRequirements || '',
          cateringNeeded: false,
          equipmentNeeded: [],
          validationStatus: {
            favoritesAvailable: true,
            tierStaffAvailable: (ev.shifts?.length || 0) >= (ev.staffRequired || 0),
            noConflicts: true,
            pricingValid: (ev.budget || 0) > 0,
          },
          priority: 'medium' as EventRequest['priority'],
          status: statusMap[evStatus] || 'pending',
          adminNotes: ev.adminNotes || '',
        };
      });
      setEventRequestsData(mapped);
      setLastUpdated(new Date());
    } catch (err) {
      toast.error('Failed to fetch event requests');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchEvents();
    const interval = setInterval(() => fetchEvents(false), 30000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  // Calculate stats
  const stats = useMemo(() => ({
    total: eventRequestsData.length,
    pending: eventRequestsData.filter(r => r.status === 'pending').length,
    underReview: eventRequestsData.filter(r => r.status === 'under-review').length,
    approved: eventRequestsData.filter(r => r.status === 'approved').length,
    needsModification: eventRequestsData.filter(r => r.status === 'needs-modification').length,
    rejected: eventRequestsData.filter(r => r.status === 'rejected').length,
    fullyValid: eventRequestsData.filter(r =>
      r.validationStatus.favoritesAvailable &&
      r.validationStatus.tierStaffAvailable &&
      r.validationStatus.noConflicts &&
      r.validationStatus.pricingValid
    ).length,
    hasIssues: eventRequestsData.filter(r =>
      !r.validationStatus.favoritesAvailable ||
      !r.validationStatus.tierStaffAvailable ||
      !r.validationStatus.noConflicts ||
      !r.validationStatus.pricingValid
    ).length,
    totalRevenue: eventRequestsData
      .filter(r => r.status !== 'rejected')
      .reduce((sum, r) => sum + r.totalPrice, 0),
    totalStaff: eventRequestsData
      .filter(r => r.status !== 'rejected')
      .reduce((sum, r) => sum + r.totalStaffNeeded, 0)
  }), [eventRequestsData]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = eventRequestsData.filter(request => {
      const matchesSearch =
        request.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.clientCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.venue.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;
      const matchesEventType = eventTypeFilter === "all" || request.eventType === eventTypeFilter;

      const matchesValidation =
        validationFilter === "all" ||
        (validationFilter === "valid" &&
          request.validationStatus.favoritesAvailable &&
          request.validationStatus.tierStaffAvailable &&
          request.validationStatus.noConflicts &&
          request.validationStatus.pricingValid) ||
        (validationFilter === "issues" && (
          !request.validationStatus.favoritesAvailable ||
          !request.validationStatus.tierStaffAvailable ||
          !request.validationStatus.noConflicts ||
          !request.validationStatus.pricingValid
        ));

      let matchesDateRange = true;
      if (dateRangeFilter !== "all") {
        const submittedDate = new Date(request.submittedDate);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (dateRangeFilter) {
          case "today":
            matchesDateRange = daysDiff === 0;
            break;
          case "week":
            matchesDateRange = daysDiff <= 7;
            break;
          case "month":
            matchesDateRange = daysDiff <= 30;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesValidation && matchesEventType && matchesDateRange;
    });

    // Sort data
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison = new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime();
          break;
        case "eventDate":
          comparison = new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
          break;
        case "price":
          comparison = a.totalPrice - b.totalPrice;
          break;
        case "guests":
          comparison = a.estimatedGuests - b.estimatedGuests;
          break;
        case "staff":
          comparison = a.totalStaffNeeded - b.totalStaffNeeded;
          break;
        case "client":
          comparison = a.clientName.localeCompare(b.clientName);
          break;
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [eventRequestsData, searchQuery, statusFilter, priorityFilter, validationFilter, eventTypeFilter, dateRangeFilter, sortBy, sortOrder]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, page, pageSize]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setValidationFilter("all");
    setEventTypeFilter("all");
    setDateRangeFilter("all");
    setSortBy("date");
    setSortOrder("desc");
    setPage(1);
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />Pending
        </Badge>;
      case "under-review":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Eye className="h-3 w-3 mr-1" />Under Review
        </Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />Approved
        </Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />Rejected
        </Badge>;
      case "needs-modification":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          <AlertCircle className="h-3 w-3 mr-1" />Needs Changes
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />Urgent
        </Badge>;
      case "high":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getValidationIcon = (validationStatus: EventRequest["validationStatus"]) => {
    const allValid =
      validationStatus.favoritesAvailable &&
      validationStatus.tierStaffAvailable &&
      validationStatus.noConflicts &&
      validationStatus.pricingValid;

    if (allValid) {
      return <IconTooltip content="All validations passed">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
      </IconTooltip>;
    }

    const issues = [];
    if (!validationStatus.favoritesAvailable) issues.push("Favorites unavailable");
    if (!validationStatus.tierStaffAvailable) issues.push("Insufficient staff");
    if (!validationStatus.noConflicts) issues.push("Scheduling conflict");
    if (!validationStatus.pricingValid) issues.push("Pricing issue");

    return <IconTooltip content={issues.join(", ")}>
      <AlertTriangle className="h-5 w-5 text-orange-600" />
    </IconTooltip>;
  };

  const handleViewDetails = (request: EventRequest) => {
    setCurrentPage("event-request-detail", { requestId: request.id });
  };

  const handleApproveAndCreate = async (request: EventRequest) => {
    try {
      await eventService.updateEvent(request.id, { status: 'CONFIRMED' });
      toast.success(`Request approved! Event: ${request.eventName}`);
      // Refresh list to reflect status change
      fetchEvents(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to approve event');
    }
  };

  const handleMessageClient = (request: EventRequest) => {
    setSelectedRequest(request);
    setAdminMessage("");
    setShowMessageDialog(true);
  };

  const eventTypes = useMemo(() => {
    const types = new Set(eventRequestsData.map(r => r.eventType).filter(Boolean));
    return Array.from(types).sort();
  }, [eventRequestsData]);

  const handleSendMessage = () => {
    toast.success(`Message sent to ${selectedRequest?.clientName}`);
    setShowMessageDialog(false);
    setAdminMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl mb-2">Event Requests Queue</h1>
            <p className="text-muted-foreground">
              Review, validate, and approve client-submitted event requests with automated staff assignment
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <Badge variant="outline" className="text-xs">
                Updated {format(lastUpdated, "HH:mm:ss")}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchEvents()}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${isScheduler ? 'xl:grid-cols-5' : 'xl:grid-cols-6'} gap-4`}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-semibold mt-1">{stats.total}</p>
                </div>
                <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-semibold mt-1">{stats.pending}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Under Review</p>
                  <p className="text-2xl font-semibold mt-1">{stats.underReview}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-semibold mt-1">{stats.approved}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fully Valid</p>
                  <p className="text-2xl font-semibold mt-1">{stats.fullyValid}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckSquare className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {!isScheduler && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-semibold mt-1">${(stats.totalRevenue / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Table Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle>Event Requests</CardTitle>
                <CardDescription>
                  {filteredAndSortedData.length} of {stats.total} requests
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by event, client, company, venue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="needs-modification">Needs Changes</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={validationFilter} onValueChange={setValidationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Validation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Validation</SelectItem>
                  <SelectItem value="valid">Fully Valid</SelectItem>
                  <SelectItem value="issues">Has Issues</SelectItem>
                </SelectContent>
              </Select>

              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {eventTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Second Row Filters */}
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>

              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Submission Date</SelectItem>
                  <SelectItem value="eventDate">Event Date</SelectItem>
                  {!isScheduler && <SelectItem value="price">Total Price</SelectItem>}
                  <SelectItem value="guests">Guest Count</SelectItem>
                  <SelectItem value="staff">Staff Needed</SelectItem>
                  <SelectItem value="client">Client Name</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
              </Button>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>Event Details</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Event Date</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Staff</TableHead>
                    {!isScheduler && <TableHead>Price</TableHead>}
                    <TableHead>Priority</TableHead>
                    <TableHead>Validation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isScheduler ? 10 : 11} className="text-center py-8 text-muted-foreground">
                        No event requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((request) => (
                      <TableRow key={request.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="font-medium">{request.requestNumber}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(request.submittedDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <div className="font-medium truncate">{request.eventName}</div>
                            <div className="text-xs text-muted-foreground truncate">{request.eventType}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="font-medium truncate">{request.clientName}</div>
                              <div className="text-xs text-muted-foreground truncate">{request.clientCompany}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <div className="whitespace-nowrap">{formatDate(request.eventDate)}</div>
                              <div className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatTime(request.startTime)} - {formatTime(request.endTime)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{request.estimatedGuests}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{request.totalStaffNeeded}</span>
                            {request.favoritesSelected > 0 && (
                              <IconTooltip content={`${request.favoritesSelected} favorite staff selected`}>
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              </IconTooltip>
                            )}
                          </div>
                        </TableCell>
                        {!isScheduler && (
                          <TableCell>
                            <div className="font-semibold whitespace-nowrap">
                              ${request.totalPrice.toLocaleString()}
                            </div>
                          </TableCell>
                        )}
                        <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                        <TableCell>{getValidationIcon(request.validationStatus)}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <IconTooltip content="View details">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(request)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </IconTooltip>
                            {request.status === "pending" && (
                              <IconTooltip content="Approve and create event">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleApproveAndCreate(request)}
                                >
                                  <CheckSquare className="h-4 w-4" />
                                </Button>
                              </IconTooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
