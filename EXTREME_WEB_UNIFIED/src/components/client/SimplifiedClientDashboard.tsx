import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { TooltipWrapper, IconTooltip, InfoTooltip } from "../ui/tooltip-wrapper";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Star,
  Plus,
  TrendingUp,
  Bell,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  User,
  CheckCircle,
  XCircle,
  Eye,
  Activity,
  Timer,
  Building,
  CreditCard,
  Receipt,
  Target,
  UserCheck,
  Zap,
  ChevronDown,
  ChevronUp,
  Filter,
  MoreHorizontal,
  Users2,
  Grid,
  List,
  Search,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
  FilterX,
  BarChart3,
  TrendingDown,
  Download,
  Settings,
  UserPlus,
  UserMinus,
  MapPinIcon,
  Clock3,
  Award,
  Briefcase,
  MessageSquare,
  Loader2,
  RefreshCw
} from "lucide-react";
import api from "../../services/api";
import { useNavigation } from "../../contexts/NavigationContext";
import { format } from "date-fns";

interface SimplifiedClientDashboardProps {
  clientId: string;
}

export function SimplifiedClientDashboard({ clientId }: SimplifiedClientDashboardProps) {
  const { setCurrentPage } = useNavigation();

  // Enhanced state for handling large staff lists (100+)
  const [expandedStaffSections, setExpandedStaffSections] = useState<{ [key: string]: boolean }>({});
  const [staffSearchQueries, setStaffSearchQueries] = useState<{ [key: string]: string }>({});
  const [staffViewModes, setStaffViewModes] = useState<{ [key: string]: 'compact' | 'detailed' | 'grid' }>({});
  const [staffFilters, setStaffFilters] = useState<{
    [key: string]: {
      role: string;
      rating: string;
      experience: string;
      location: string;
      availability: string;
      hourlyRateRange: string;
    }
  }>({});
  const [staffSorting, setStaffSorting] = useState<{
    [key: string]: {
      field: 'name' | 'rating' | 'hourlyRate' | 'experience';
      direction: 'asc' | 'desc';
    }
  }>({});
  const [staffPagination, setStaffPagination] = useState<{
    [key: string]: {
      currentPage: number;
      itemsPerPage: number;
    }
  }>({});
  const [showStaffFilters, setShowStaffFilters] = useState<{ [key: string]: boolean }>({});

  // API data state
  const [clientEvents, setClientEvents] = useState<any[]>([]);
  const [clientInvoices, setClientInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsRefreshing(true);
    try {
      const [eventsRes, invoicesRes] = await Promise.all([
        api.get('/events'),
        api.get('/invoices'),
      ]);
      // Handle both plain array and paginated { data: [] } shapes
      const eventsData = eventsRes.data;
      const invoicesData = invoicesRes.data;
      setClientEvents(Array.isArray(eventsData) ? eventsData : (eventsData?.data || eventsData?.events || []));
      setClientInvoices(Array.isArray(invoicesData) ? invoicesData : (invoicesData?.data || invoicesData?.invoices || []));
      setLastUpdated(new Date());
    } catch (err) {
      // Show empty state
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(false), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Event categorization
  const today = new Date();
  const todayDateString = today.toISOString().split('T')[0];

  const ongoingEvents = clientEvents.filter((event: any) => {
    const status = (event.status || '').toUpperCase();
    return status === 'CONFIRMED' && (event.date || '').startsWith(todayDateString);
  });

  const completedEvents = clientEvents.filter((event: any) => {
    const status = (event.status || '').toUpperCase();
    return status === 'COMPLETED' || (event.date || '') < todayDateString;
  }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const upcomingEvents = clientEvents.filter((event: any) => {
    const status = (event.status || '').toUpperCase();
    return (status === 'CONFIRMED' || status === 'PENDING') &&
      (event.date || '') > todayDateString;
  }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Featured events
  const featuredOngoing = ongoingEvents[0];
  const featuredCompleted = completedEvents[0];
  const featuredUpcoming = upcomingEvents[0];

  // Calculate statistics
  const totalInvestment = clientEvents.reduce((sum: number, event: any) => sum + (event.budget || 0), 0);
  const totalStaffHired = clientEvents.reduce((sum: number, event: any) => sum + (event.shifts?.length || 0), 0);
  const pendingPayments = clientInvoices
    .filter((inv: any) => (inv.status || '').toUpperCase() === 'PENDING')
    .reduce((sum: number, inv: any) => sum + (inv.totalAmount || inv.amount || 0), 0);

  // Build a staff lookup map from event shifts for display purposes
  // Backend returns: event.shifts[].staff.user.name, staff.rating, staff.staffType, etc.
  const staffLookup: Record<string, any> = {};
  clientEvents.forEach((event: any) => {
    (event.shifts || []).forEach((shift: any) => {
      if (shift?.staff?.id) {
        staffLookup[shift.staff.id] = {
          id: shift.staff.id,
          name: shift.staff.user?.name || 'Staff',
          rating: shift.staff.rating || 0,
          specialty: shift.staff.staffType || 'General',
          hourlyRate: shift.staff.hourlyRate || 0,
          avatar: shift.staff.user?.avatar || '',
        };
      }
    });
  });

  // Get staff IDs from events' shifts
  const getEventStaffIds = (event: any): string[] =>
    (event.shifts || []).map((sh: any) => sh?.staff?.id).filter(Boolean);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-success/10 text-success border-success/20';
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'completed': return 'bg-primary/10 text-primary border-primary/20';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/50 text-muted-foreground border-border';
    }
  };

  const getEventStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Mock check-in/out times generator based on event ID for consistency
  const generateCheckInTime = (eventId: string, staffId: string) => {
    const hash = eventId.slice(-2) + staffId.slice(-2);
    const baseMinutes = parseInt(hash, 16) % 60;
    const startHour = 8; // Events typically start preparation early
    return `${String(startHour + Math.floor(baseMinutes / 20)).padStart(2, '0')}:${String(baseMinutes % 60).padStart(2, '0')}`;
  };

  const generateCheckOutTime = (eventId: string, staffId: string) => {
    const hash = eventId.slice(-2) + staffId.slice(-2);
    const baseMinutes = parseInt(hash, 16) % 60;
    const endHour = 18; // Events typically end in evening
    return `${String(endHour + Math.floor(baseMinutes / 30)).padStart(2, '0')}:${String(baseMinutes % 60).padStart(2, '0')}`;
  };

  // Helper functions for managing large staff lists
  const toggleStaffSection = (eventId: string) => {
    setExpandedStaffSections(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const updateStaffSearch = (eventId: string, query: string) => {
    setStaffSearchQueries(prev => ({
      ...prev,
      [eventId]: query
    }));
  };

  const toggleStaffViewMode = (eventId: string) => {
    setStaffViewModes(prev => ({
      ...prev,
      [eventId]: prev[eventId] === 'compact' ? 'detailed' : 'compact'
    }));
  };

  const getFilteredStaff = (staffIds: string[], eventId: string) => {
    const query = staffSearchQueries[eventId]?.toLowerCase() || '';
    if (!query) return staffIds;

    return staffIds.filter(staffId => {
      const staff = staffLookup[staffId];
      return staff?.name.toLowerCase().includes(query);
    });
  };

  // Enhanced staff management functions for large-scale events
  const updateStaffFilter = (eventId: string, filterType: string, value: string) => {
    setStaffFilters(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [filterType]: value
      }
    }));
    // Reset to first page when filters change
    setStaffPagination(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        currentPage: 1
      }
    }));
  };

  const updateStaffSorting = (eventId: string, field: string) => {
    setStaffSorting(prev => {
      const currentSort = prev[eventId];
      const newDirection = currentSort?.field === field && currentSort?.direction === 'asc' ? 'desc' : 'asc';
      return {
        ...prev,
        [eventId]: {
          field: field as any,
          direction: newDirection
        }
      };
    });
  };

  const getAdvancedFilteredStaff = (staffIds: string[], eventId: string) => {
    const query = staffSearchQueries[eventId]?.toLowerCase() || '';
    const filters = staffFilters[eventId] || {};
    const sorting = staffSorting[eventId] || { field: 'name', direction: 'asc' };

    let filtered = staffIds.filter(staffId => {
      const staff = staffLookup[staffId];
      if (!staff) return false;

      // Search query filter
      if (query && !staff.name.toLowerCase().includes(query)) return false;

      // Role filter
      if (filters.role && filters.role !== 'all' && staff.specialty !== filters.role) return false;

      // Rating filter
      if (filters.rating && filters.rating !== 'all') {
        const minRating = parseFloat(filters.rating);
        if (staff.rating < minRating) return false;
      }

      // Hourly rate filter
      if (filters.hourlyRateRange && filters.hourlyRateRange !== 'all') {
        const [min, max] = filters.hourlyRateRange.split('-').map(Number);
        if (staff.hourlyRate < min || (max && staff.hourlyRate > max)) return false;
      }

      return true;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      const staffA = staffLookup[a];
      const staffB = staffLookup[b];
      if (!staffA || !staffB) return 0;

      let comparison = 0;
      switch (sorting.field) {
        case 'name':
          comparison = staffA.name.localeCompare(staffB.name);
          break;
        case 'rating':
          comparison = staffA.rating - staffB.rating;
          break;
        case 'hourlyRate':
          comparison = staffA.hourlyRate - staffB.hourlyRate;
          break;
        default:
          comparison = staffA.name.localeCompare(staffB.name);
      }

      return sorting.direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const getPaginatedStaff = (staffIds: string[], eventId: string) => {
    const filtered = getAdvancedFilteredStaff(staffIds, eventId);
    const pagination = staffPagination[eventId] || { currentPage: 1, itemsPerPage: 20 };

    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;

    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / pagination.itemsPerPage),
      currentPage: pagination.currentPage,
      itemsPerPage: pagination.itemsPerPage
    };
  };

  const updatePagination = (eventId: string, page: number, itemsPerPage?: number) => {
    setStaffPagination(prev => ({
      ...prev,
      [eventId]: {
        currentPage: page,
        itemsPerPage: itemsPerPage || prev[eventId]?.itemsPerPage || 20
      }
    }));
  };

  const getStaffStatistics = (staffIds: string[], eventId: string) => {
    const filteredStaff = getAdvancedFilteredStaff(staffIds, eventId);
    const allStaff = staffIds.map(id => staffLookup[id]).filter(Boolean);

    const totalCost = filteredStaff.reduce((sum: number, staffId: string) => {
      const staff = staffLookup[staffId];
      return sum + (staff?.hourlyRate || 0) * 8;
    }, 0);

    const avgRating = filteredStaff.reduce((sum: number, staffId: string) => {
      const staff = staffLookup[staffId];
      return sum + (staff?.rating || 0);
    }, 0) / (filteredStaff.length || 1);

    const roleBreakdown = filteredStaff.reduce((acc: Record<string, number>, staffId: string) => {
      const staff = staffLookup[staffId];
      const role = staff?.specialty || 'General';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalStaff: filteredStaff.length,
      totalCost,
      avgRating: Math.round(avgRating * 10) / 10,
      roleBreakdown
    };
  };

  const getDisplayedStaff = (staffIds: string[], eventId: string) => {
    if (staffIds.length > 15) {
      // For large events, use pagination
      return getPaginatedStaff(staffIds, eventId).items;
    } else {
      // For smaller events, use the existing expand/collapse logic
      const filteredStaff = getAdvancedFilteredStaff(staffIds, eventId);
      const isExpanded = expandedStaffSections[eventId];

      if (isExpanded || filteredStaff.length <= 5) {
        return filteredStaff;
      }

      return filteredStaff.slice(0, 3);
    }
  };

  const handleViewEventDetails = (event: any) => {
    setCurrentPage("booking-details", { bookingId: event.id });
  };

  return (
    <div className="page-container mobile-space-y">
      {/* Welcome Header */}
      <div className="mobile-responsive-header">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
            Welcome back!
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Your event management hub - Track ongoing, completed, and upcoming events
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {lastUpdated && (
            <Badge variant="outline" className="text-xs">
              Updated {format(lastUpdated, "HH:mm:ss")}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData()}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button
            onClick={() => setCurrentPage("book-event")}
            size="lg"
            className="shadow-lg mobile-touch-button w-full sm:w-auto"
          >
            <Plus className="mr-2 h-5 w-5" />
            Book New Event
          </Button>
        </div>
      </div>

      {/* Enhanced Quick Stats Dashboard */}
      <div className="desktop-stats-grid mobile-gap">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
            <Calendar className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{clientEvents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {upcomingEvents.length} upcoming
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Investment</CardTitle>
            <DollarSign className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">${totalInvestment.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${clientEvents.length > 0 ? Math.round(totalInvestment / clientEvents.length).toLocaleString() : 0} avg per event
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Staff Hired</CardTitle>
            <Users className="h-5 w-5 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalStaffHired}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Professional staff members
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
            <FileText className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">${pendingPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Outstanding invoices
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {clientEvents.length > 0 ? Math.round((clientEvents.filter(e => e.status === 'completed').length / clientEvents.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Events completed successfully
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Events</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {ongoingEvents.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Events Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Event Management Hub
          </CardTitle>
          <p className="text-muted-foreground">
            Comprehensive view of your ongoing, upcoming, and completed events
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ongoing" className="w-full">
            <TabsList className="w-full justify-start sm:justify-center">
              <TabsTrigger value="ongoing" className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden xs:inline">Ongoing</span>
                <span className="inline xs:hidden">Live</span>
                <span className="font-medium">({ongoingEvents.length})</span>
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden xs:inline">Upcoming</span>
                <span className="inline xs:hidden">Soon</span>
                <span className="font-medium">({upcomingEvents.length})</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden xs:inline">Completed</span>
                <span className="inline xs:hidden">Done</span>
                <span className="font-medium">({completedEvents.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* Ongoing Events Tab */}
            <TabsContent value="ongoing" className="mt-6">
              {featuredOngoing ? (
                <div className="mobile-space-y">
                  <div className="mobile-responsive-header">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <h3 className="text-lg sm:text-xl font-semibold">{featuredOngoing.title}</h3>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1 w-fit">
                        <Activity className="h-3 w-3" />
                        Live Now
                      </Badge>
                    </div>
                    <Button
                      onClick={() => handleViewEventDetails(featuredOngoing)}
                      className="mobile-touch-button w-full sm:w-auto"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 mobile-gap-lg">
                    {/* Event Information */}
                    <div className="mobile-space-y">
                      <div className="mobile-card bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-4">Event Information</h4>
                        <div className="space-y-4">
                          <div className="flex items-center mobile-gap-sm">
                            <Building className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <span className="text-sm break-words">{featuredOngoing.eventType}</span>
                          </div>
                          <div className="flex items-start mobile-gap-sm">
                            <Calendar className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm">{featuredOngoing.date}</p>
                              <p className="text-xs text-muted-foreground mt-1">{featuredOngoing.startTime} - {featuredOngoing.endTime}</p>
                            </div>
                          </div>
                          <div className="flex items-start mobile-gap-sm">
                            <MapPin className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm break-words">{featuredOngoing.location}</span>
                          </div>
                          <div className="flex items-center mobile-gap-sm">
                            <DollarSign className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <span className="text-sm font-medium">${featuredOngoing.budget.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Staff Check-in Status */}
                    <div className="mobile-space-y">
                      <div className="mobile-responsive-header">
                        <h4 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                          <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                          <span className="break-words">Staff Check-in Status ({getEventStaffIds(featuredOngoing).length} staff)</span>
                        </h4>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStaffViewMode(featuredOngoing.id)}
                            className="mobile-touch-target"
                          >
                            {staffViewModes[featuredOngoing.id] === 'compact' ?
                              <List className="h-4 w-4" /> :
                              <Grid className="h-4 w-4" />
                            }
                          </Button>
                          {getEventStaffIds(featuredOngoing).length > 10 && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh]">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Users2 className="h-5 w-5" />
                                    All Staff - {featuredOngoing.title}
                                  </DialogTitle>
                                  <DialogDescription>
                                    View and search all staff members assigned to this event
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="flex items-center gap-4">
                                    <div className="relative flex-1">
                                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input
                                        placeholder="Search staff..."
                                        className="pl-10"
                                        value={staffSearchQueries[featuredOngoing.id] || ''}
                                        onChange={(e) => updateStaffSearch(featuredOngoing.id, e.target.value)}
                                      />
                                    </div>
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                      {getFilteredStaff(getEventStaffIds(featuredOngoing), featuredOngoing.id).length} of {getEventStaffIds(featuredOngoing).length}
                                    </Badge>
                                  </div>
                                  <ScrollArea className="h-[50vh]">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {getFilteredStaff(getEventStaffIds(featuredOngoing), featuredOngoing.id).map((staffId) => {
                                        const staff = staffLookup[staffId];
                                        const checkInTime = generateCheckInTime(featuredOngoing.id, staffId);
                                        return staff ? (
                                          <div key={staff.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                  <User className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                  <p className="font-medium">{staff.name}</p>
                                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                    {staff.rating} • ${staff.hourlyRate}/hr
                                                  </div>
                                                  <p className="text-xs text-green-600">Active since {checkInTime}</p>
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                <div className="flex items-center gap-1 text-sm font-medium text-green-700">
                                                  <Clock className="h-4 w-4" />
                                                  {checkInTime}
                                                </div>
                                                <Badge className="bg-green-100 text-green-800 text-xs">
                                                  Online
                                                </Badge>
                                              </div>
                                            </div>
                                          </div>
                                        ) : null;
                                      })}
                                    </div>
                                  </ScrollArea>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>

                      {getEventStaffIds(featuredOngoing).length > 5 && (
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search staff..."
                              className="pl-10 h-8"
                              value={staffSearchQueries[featuredOngoing.id] || ''}
                              onChange={(e) => updateStaffSearch(featuredOngoing.id, e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {getDisplayedStaff(getEventStaffIds(featuredOngoing), featuredOngoing.id).map((staffId) => {
                          const staff = staffLookup[staffId];
                          const checkInTime = generateCheckInTime(featuredOngoing.id, staffId);
                          return staff ? (
                            <div key={staff.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{staff.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      {staff.rating} • ${staff.hourlyRate}/hr
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1 text-sm font-medium text-green-700">
                                    <Clock className="h-3 w-3" />
                                    {checkInTime}
                                  </div>
                                  <p className="text-xs text-green-600">Checked in</p>
                                </div>
                              </div>
                            </div>
                          ) : null;
                        })}

                        {!expandedStaffSections[featuredOngoing.id] &&
                          getFilteredStaff(getEventStaffIds(featuredOngoing), featuredOngoing.id).length > 3 && (
                            <Button
                              variant="ghost"
                              onClick={() => toggleStaffSection(featuredOngoing.id)}
                              className="w-full justify-center text-green-700 hover:bg-green-50"
                            >
                              <ChevronDown className="h-4 w-4 mr-2" />
                              View {getFilteredStaff(getEventStaffIds(featuredOngoing), featuredOngoing.id).length - 3} more staff
                            </Button>
                          )}

                        {expandedStaffSections[featuredOngoing.id] &&
                          getFilteredStaff(getEventStaffIds(featuredOngoing), featuredOngoing.id).length > 3 && (
                            <Button
                              variant="ghost"
                              onClick={() => toggleStaffSection(featuredOngoing.id)}
                              className="w-full justify-center text-green-700 hover:bg-green-50"
                            >
                              <ChevronUp className="h-4 w-4 mr-2" />
                              Show less
                            </Button>
                          )}
                      </div>

                      {getEventStaffIds(featuredOngoing).length > 0 && getAdvancedFilteredStaff(getEventStaffIds(featuredOngoing), featuredOngoing.id).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No staff found matching your criteria</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setStaffFilters(prev => ({ ...prev, [featuredOngoing.id]: {} as any }));
                              setStaffSearchQueries(prev => ({ ...prev, [featuredOngoing.id]: '' }));
                            }}
                            className="mt-2"
                          >
                            Clear all filters
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button variant="outline">
                      <Phone className="mr-2 h-4 w-4" />
                      Contact Manager
                    </Button>
                    <Button variant="outline">
                      <Activity className="mr-2 h-4 w-4" />
                      Live Updates
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Zap className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No ongoing events</h3>
                  <p className="text-muted-foreground">
                    You don't have any events currently in progress.
                  </p>
                </div>


              )}
            </TabsContent>

            {/* Upcoming Events Tab */}
            <TabsContent value="upcoming" className="mt-6">
              {featuredUpcoming ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold">{featuredUpcoming.title}</h3>
                      <Badge className={getStatusColor(featuredUpcoming.status)}>
                        {getEventStatusIcon(featuredUpcoming.status)}
                        {featuredUpcoming.status.charAt(0).toUpperCase() + featuredUpcoming.status.slice(1)}
                      </Badge>
                    </div>
                    <Button onClick={() => handleViewEventDetails(featuredUpcoming)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Event Information */}
                    <div className="space-y-4">
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <h4 className="font-semibold mb-3 text-orange-800">Event Information</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Building className="h-4 w-4 text-orange-600" />
                            <span className="text-sm">{featuredUpcoming.eventType}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-orange-600" />
                            <div>
                              <p className="font-medium text-sm">{featuredUpcoming.date}</p>
                              <p className="text-xs text-muted-foreground">{featuredUpcoming.startTime} - {featuredUpcoming.endTime}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-orange-600" />
                            <span className="text-sm">{featuredUpcoming.location}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Users className="h-4 w-4 text-orange-600" />
                            <span className="text-sm">{getEventStaffIds(featuredUpcoming).length} of {featuredUpcoming.staffRequired} staff assigned</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <DollarSign className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium">${featuredUpcoming.budget.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Event Preparation Status */}
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold mb-3 text-blue-800">Event Preparation</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Staff confirmed and briefed</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Venue requirements reviewed</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <span>Final preparations in progress</span>
                          </div>
                        </div>
                      </div>

                      {/* Special Requirements */}
                      {featuredUpcoming.specialRequirements && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h4 className="font-semibold mb-2 text-yellow-800">Special Requirements</h4>
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                            <p className="text-sm text-yellow-700">{featuredUpcoming.specialRequirements}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Assigned Staff */}
                    {/* Enhanced Staff Management for Large-Scale Events (100+ Staff) */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Users className="h-4 w-4 text-orange-500" />
                          Assigned Staff ({getEventStaffIds(featuredUpcoming).length})
                          {getEventStaffIds(featuredUpcoming).length > 50 && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                              Large Event
                            </Badge>
                          )}
                        </h4>
                        <div className="flex items-center gap-2">
                          {getEventStaffIds(featuredUpcoming).length > 10 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowStaffFilters(prev => ({ ...prev, [featuredUpcoming.id]: !prev[featuredUpcoming.id] }))}
                              className="h-8 px-3"
                            >
                              <Filter className="h-4 w-4 mr-1" />
                              Filters
                            </Button>
                          )}
                          {getEventStaffIds(featuredUpcoming).length > 15 && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 px-3">
                                  <BarChart3 className="h-4 w-4 mr-1" />
                                  Full View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-7xl max-h-[90vh]">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Users2 className="h-5 w-5" />
                                    Staff Management - {featuredUpcoming.title}
                                    <Badge className="bg-orange-100 text-orange-800">
                                      {getEventStaffIds(featuredUpcoming).length} Total Staff
                                    </Badge>
                                  </DialogTitle>
                                  <DialogDescription>
                                    Manage staff assignments, view performance details, and request replacements
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-6">
                                  {/* Enhanced Controls for Large Events */}
                                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                                    <div className="lg:col-span-2">
                                      <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                          placeholder="Search by name, role, or skills..."
                                          className="pl-10"
                                          value={staffSearchQueries[featuredUpcoming.id] || ''}
                                          onChange={(e) => updateStaffSearch(featuredUpcoming.id, e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={staffSorting[featuredUpcoming.id]?.field || 'name'}
                                        onChange={(e) => updateStaffSorting(featuredUpcoming.id, e.target.value)}
                                      >
                                        <option value="name">Sort by Name</option>
                                        <option value="rating">Sort by Rating</option>
                                        <option value="hourlyRate">Sort by Rate</option>
                                      </select>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateStaffSorting(featuredUpcoming.id, staffSorting[featuredUpcoming.id]?.field || 'name')}
                                        className="px-3"
                                      >
                                        {staffSorting[featuredUpcoming.id]?.direction === 'desc' ?
                                          <SortDesc className="h-4 w-4" /> :
                                          <SortAsc className="h-4 w-4" />
                                        }
                                      </Button>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button variant="outline" size="sm" className="flex-1">
                                        <Download className="h-4 w-4 mr-1" />
                                        Export
                                      </Button>
                                      <Button variant="outline" size="sm" className="flex-1">
                                        <Settings className="h-4 w-4 mr-1" />
                                        Manage
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Advanced Filters for Large Events */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4 bg-muted/30 rounded-lg">
                                    <select
                                      className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                                      value={staffFilters[featuredUpcoming.id]?.role || 'all'}
                                      onChange={(e) => updateStaffFilter(featuredUpcoming.id, 'role', e.target.value)}
                                    >
                                      <option value="all">All Roles</option>
                                      <option value="Server">Servers</option>
                                      <option value="Bartender">Bartenders</option>
                                      <option value="Security">Security</option>
                                      <option value="Coordinator">Coordinators</option>
                                      <option value="Setup">Setup Crew</option>
                                    </select>
                                    <select
                                      className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                                      value={staffFilters[featuredUpcoming.id]?.rating || 'all'}
                                      onChange={(e) => updateStaffFilter(featuredUpcoming.id, 'rating', e.target.value)}
                                    >
                                      <option value="all">All Ratings</option>
                                      <option value="4.5">4.5+ Stars</option>
                                      <option value="4">4+ Stars</option>
                                      <option value="3.5">3.5+ Stars</option>
                                    </select>
                                    <select
                                      className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                                      value={staffFilters[featuredUpcoming.id]?.hourlyRateRange || 'all'}
                                      onChange={(e) => updateStaffFilter(featuredUpcoming.id, 'hourlyRateRange', e.target.value)}
                                    >
                                      <option value="all">All Rates</option>
                                      <option value="15-20">$15-20/hr</option>
                                      <option value="20-25">$20-25/hr</option>
                                      <option value="25-30">$25-30/hr</option>
                                      <option value="30-999">$30+/hr</option>
                                    </select>
                                    <select
                                      className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                                      value={staffFilters[featuredUpcoming.id]?.availability || 'all'}
                                      onChange={(e) => updateStaffFilter(featuredUpcoming.id, 'availability', e.target.value)}
                                    >
                                      <option value="all">All Status</option>
                                      <option value="confirmed">Confirmed</option>
                                      <option value="pending">Pending</option>
                                      <option value="backup">Backup</option>
                                    </select>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setStaffFilters(prev => ({ ...prev, [featuredUpcoming.id]: {} as any }));
                                        setStaffSearchQueries(prev => ({ ...prev, [featuredUpcoming.id]: '' }));
                                      }}
                                      className="h-8 text-xs"
                                    >
                                      <FilterX className="h-3 w-3 mr-1" />
                                      Clear
                                    </Button>
                                    <Badge variant="outline" className="h-8 flex items-center justify-center text-xs">
                                      {(() => {
                                        const stats = getStaffStatistics(getEventStaffIds(featuredUpcoming), featuredUpcoming.id);
                                        return `${stats.totalStaff} shown`;
                                      })()}
                                    </Badge>
                                  </div>

                                  {/* Staff Statistics Dashboard for Large Events */}
                                  {getEventStaffIds(featuredUpcoming).length > 30 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                      {(() => {
                                        const stats = getStaffStatistics(getEventStaffIds(featuredUpcoming), featuredUpcoming.id);
                                        return (
                                          <>
                                            <div className="text-center">
                                              <div className="text-2xl font-bold text-orange-700">{stats.totalStaff}</div>
                                              <div className="text-xs text-orange-600">Total Staff</div>
                                            </div>
                                            <div className="text-center">
                                              <div className="text-2xl font-bold text-orange-700">${Math.round(stats.totalCost).toLocaleString()}</div>
                                              <div className="text-xs text-orange-600">Daily Cost</div>
                                            </div>
                                            <div className="text-center">
                                              <div className="text-2xl font-bold text-orange-700">{stats.avgRating}★</div>
                                              <div className="text-xs text-orange-600">Avg Rating</div>
                                            </div>
                                            <div className="text-center">
                                              <div className="text-2xl font-bold text-orange-700">{Object.keys(stats.roleBreakdown).length}</div>
                                              <div className="text-xs text-orange-600">Role Types</div>
                                            </div>
                                          </>
                                        );
                                      })()}
                                    </div>
                                  )}

                                  {/* Paginated Staff List for Large Events */}
                                  <ScrollArea className="h-[40vh]">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {(() => {
                                        const paginatedData = getPaginatedStaff(getEventStaffIds(featuredUpcoming), featuredUpcoming.id);
                                        return paginatedData.items.map((staffId) => {
                                          const staff = staffLookup[staffId];
                                          return staff ? (
                                            <div key={staff.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 min-w-0">
                                                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <User className="h-4 w-4 text-orange-600" />
                                                  </div>
                                                  <div className="min-w-0">
                                                    <p className="font-medium text-sm truncate">{staff.name}</p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                      <span>{staff.rating}</span>
                                                      <Briefcase className="h-3 w-3" />
                                                      <span className="truncate">{staff.specialty || 'General'}</span>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                  <div className="text-sm font-medium">${staff.hourlyRate}/hr</div>
                                                  <Badge className="bg-orange-100 text-orange-800 text-xs">Ready</Badge>
                                                </div>
                                              </div>
                                            </div>
                                          ) : null;
                                        });
                                      })()}
                                    </div>
                                  </ScrollArea>

                                  {/* Pagination Controls for Large Events */}
                                  {getEventStaffIds(featuredUpcoming).length > 20 && (
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Show</span>
                                        <select
                                          className="flex h-8 w-20 rounded-md border border-input bg-background px-2 py-1 text-sm"
                                          value={staffPagination[featuredUpcoming.id]?.itemsPerPage || 20}
                                          onChange={(e) => updatePagination(featuredUpcoming.id, 1, parseInt(e.target.value))}
                                        >
                                          <option value="10">10</option>
                                          <option value="20">20</option>
                                          <option value="50">50</option>
                                          <option value="100">100</option>
                                        </select>
                                        <span className="text-sm text-muted-foreground">per page</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {(() => {
                                          const paginatedData = getPaginatedStaff(getEventStaffIds(featuredUpcoming), featuredUpcoming.id);
                                          return (
                                            <>
                                              <span className="text-sm text-muted-foreground">
                                                {((paginatedData.currentPage - 1) * paginatedData.itemsPerPage) + 1}-{Math.min(paginatedData.currentPage * paginatedData.itemsPerPage, paginatedData.totalItems)} of {paginatedData.totalItems}
                                              </span>
                                              <div className="flex gap-1">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => updatePagination(featuredUpcoming.id, Math.max(1, paginatedData.currentPage - 1))}
                                                  disabled={paginatedData.currentPage === 1}
                                                  className="h-8 w-8 p-0"
                                                >
                                                  <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => updatePagination(featuredUpcoming.id, Math.min(paginatedData.totalPages, paginatedData.currentPage + 1))}
                                                  disabled={paginatedData.currentPage === paginatedData.totalPages}
                                                  className="h-8 w-8 p-0"
                                                >
                                                  <ChevronRight className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            </>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Quick Filters for Medium-Large Events */}
                      {showStaffFilters[featuredUpcoming.id] && getEventStaffIds(featuredUpcoming).length > 10 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <select
                            className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                            value={staffFilters[featuredUpcoming.id]?.role || 'all'}
                            onChange={(e) => updateStaffFilter(featuredUpcoming.id, 'role', e.target.value)}
                          >
                            <option value="all">All Roles</option>
                            <option value="Server">Servers</option>
                            <option value="Bartender">Bartenders</option>
                            <option value="Security">Security</option>
                          </select>
                          <select
                            className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                            value={staffFilters[featuredUpcoming.id]?.rating || 'all'}
                            onChange={(e) => updateStaffFilter(featuredUpcoming.id, 'rating', e.target.value)}
                          >
                            <option value="all">All Ratings</option>
                            <option value="4.5">4.5+ Stars</option>
                            <option value="4">4+ Stars</option>
                          </select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStaffFilters(prev => ({ ...prev, [featuredUpcoming.id]: {} as any }))}
                            className="h-8 text-xs"
                          >
                            <FilterX className="h-3 w-3 mr-1" />
                            Clear
                          </Button>
                        </div>
                      )}

                      {/* Search for Events with 5+ Staff */}
                      {getEventStaffIds(featuredUpcoming).length > 5 && (
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search staff..."
                              className="pl-10 h-8"
                              value={staffSearchQueries[featuredUpcoming.id] || ''}
                              onChange={(e) => updateStaffSearch(featuredUpcoming.id, e.target.value)}
                            />
                          </div>
                          {getEventStaffIds(featuredUpcoming).length > 15 && (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 text-xs">
                              {getAdvancedFilteredStaff(getEventStaffIds(featuredUpcoming), featuredUpcoming.id).length} of {getEventStaffIds(featuredUpcoming).length}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Staff Display Area */}
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {getDisplayedStaff(getEventStaffIds(featuredUpcoming), featuredUpcoming.id).map((staffId) => {
                          const staff = staffLookup[staffId];
                          return staff ? (
                            <div key={staff.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                  <User className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{staff.name}</p>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    {staff.rating}
                                    {staff.specialty && (
                                      <>
                                        <span className="mx-1">•</span>
                                        <span>{staff.specialty}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ${staff.hourlyRate}/hr
                              </div>
                            </div>
                          ) : null;
                        })}

                        {/* Pagination for Large Events in Main View */}
                        {getEventStaffIds(featuredUpcoming).length > 15 && (
                          <div className="flex items-center justify-center gap-2 pt-3 border-t">
                            {(() => {
                              const paginatedData = getPaginatedStaff(getEventStaffIds(featuredUpcoming), featuredUpcoming.id);
                              return (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updatePagination(featuredUpcoming.id, Math.max(1, paginatedData.currentPage - 1))}
                                    disabled={paginatedData.currentPage === 1}
                                    className="h-8 px-3"
                                  >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                  </Button>
                                  <span className="text-sm text-muted-foreground px-3">
                                    Page {paginatedData.currentPage} of {paginatedData.totalPages}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updatePagination(featuredUpcoming.id, Math.min(paginatedData.totalPages, paginatedData.currentPage + 1))}
                                    disabled={paginatedData.currentPage === paginatedData.totalPages}
                                    className="h-8 px-3"
                                  >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                  </Button>
                                </>
                              );
                            })()}
                          </div>
                        )}

                        {/* Expand/Collapse for Smaller Events */}
                        {getEventStaffIds(featuredUpcoming).length <= 15 && !expandedStaffSections[featuredUpcoming.id] &&
                          getAdvancedFilteredStaff(getEventStaffIds(featuredUpcoming), featuredUpcoming.id).length > 3 && (
                            <Button
                              variant="ghost"
                              onClick={() => toggleStaffSection(featuredUpcoming.id)}
                              className="w-full justify-center text-orange-700 hover:bg-orange-50"
                            >
                              <ChevronDown className="h-4 w-4 mr-2" />
                              View {getAdvancedFilteredStaff(getEventStaffIds(featuredUpcoming), featuredUpcoming.id).length - 3} more staff
                            </Button>
                          )}

                        {getEventStaffIds(featuredUpcoming).length <= 15 && expandedStaffSections[featuredUpcoming.id] &&
                          getAdvancedFilteredStaff(getEventStaffIds(featuredUpcoming), featuredUpcoming.id).length > 3 && (
                            <Button
                              variant="ghost"
                              onClick={() => toggleStaffSection(featuredUpcoming.id)}
                              className="w-full justify-center text-orange-700 hover:bg-orange-50"
                            >
                              <ChevronUp className="h-4 w-4 mr-2" />
                              Show less
                            </Button>
                          )}
                      </div>

                      {/* No Results State */}
                      {getEventStaffIds(featuredUpcoming).length > 0 && getAdvancedFilteredStaff(getEventStaffIds(featuredUpcoming), featuredUpcoming.id).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No staff found matching your criteria</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setStaffFilters(prev => ({ ...prev, [featuredUpcoming.id]: {} as any }));
                              setStaffSearchQueries(prev => ({ ...prev, [featuredUpcoming.id]: '' }));
                            }}
                            className="mt-2"
                          >
                            Clear all filters
                          </Button>
                        </div>
                      )}

                      {/* Summary for Large Events */}
                      {getEventStaffIds(featuredUpcoming).length > 30 && (
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Large event: {getEventStaffIds(featuredUpcoming).length} total staff across multiple roles
                            </span>
                            <span className="font-medium">
                              Est. daily cost: ${Math.round(getEventStaffIds(featuredUpcoming).length * 20 * 8).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Staff
                    </Button>
                    <Button variant="outline">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payment Details
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
                  <p className="text-muted-foreground mb-4">
                    Ready to plan your next amazing event?
                  </p>
                  <Button onClick={() => setCurrentPage("book-event")} size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Book New Event
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Completed Events Tab */}
            <TabsContent value="completed" className="mt-6">
              {featuredCompleted ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold">{featuredCompleted.title}</h3>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Completed
                      </Badge>
                    </div>
                    <Button onClick={() => handleViewEventDetails(featuredCompleted)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Event Information */}
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold mb-3 text-blue-800">Event Information</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Building className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">{featuredCompleted.eventType}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="font-medium text-sm">{featuredCompleted.date}</p>
                              <p className="text-xs text-muted-foreground">{featuredCompleted.startTime} - {featuredCompleted.endTime}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">{featuredCompleted.location}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Target className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">Event Completed Successfully</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Staff Attendance Summary */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Timer className="h-4 w-4 text-blue-500" />
                          Staff Attendance Summary ({getEventStaffIds(featuredCompleted).length})
                        </h4>
                        {getEventStaffIds(featuredCompleted).length > 10 && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh]">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Timer className="h-5 w-5" />
                                  Complete Attendance Report - {featuredCompleted.title}
                                </DialogTitle>
                                <DialogDescription>
                                  View detailed attendance records and work hours for all staff members
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                  <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      placeholder="Search staff..."
                                      className="pl-10"
                                      value={staffSearchQueries[featuredCompleted.id] || ''}
                                      onChange={(e) => updateStaffSearch(featuredCompleted.id, e.target.value)}
                                    />
                                  </div>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                    {getFilteredStaff(getEventStaffIds(featuredCompleted), featuredCompleted.id).length} of {getEventStaffIds(featuredCompleted).length}
                                  </Badge>
                                </div>
                                <ScrollArea className="h-[50vh]">
                                  <div className="grid grid-cols-1 gap-3">
                                    {getFilteredStaff(getEventStaffIds(featuredCompleted), featuredCompleted.id).map((staffId) => {
                                      const staff = staffLookup[staffId];
                                      const checkInTime = generateCheckInTime(featuredCompleted.id, staffId);
                                      const checkOutTime = generateCheckOutTime(featuredCompleted.id, staffId);
                                      const workDuration = parseInt(checkOutTime.split(':')[0]) - parseInt(checkInTime.split(':')[0]);
                                      return staff ? (
                                        <div key={staff.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <User className="h-5 w-5 text-blue-600" />
                                              </div>
                                              <div>
                                                <p className="font-medium">{staff.name}</p>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                  {staff.rating} • ${staff.hourlyRate}/hr
                                                </div>
                                              </div>
                                            </div>
                                            <div className="text-right space-y-1">
                                              <div className="flex items-center gap-1 text-sm text-blue-700">
                                                <Clock className="h-4 w-4" />
                                                {checkInTime} - {checkOutTime}
                                              </div>
                                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                                {workDuration}h worked
                                              </Badge>
                                              <p className="text-xs text-blue-600">
                                                ${workDuration * staff.hourlyRate} earned
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      ) : null;
                                    })}
                                  </div>
                                </ScrollArea>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>

                      {getEventStaffIds(featuredCompleted).length > 5 && (
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search staff..."
                              className="pl-10 h-8"
                              value={staffSearchQueries[featuredCompleted.id] || ''}
                              onChange={(e) => updateStaffSearch(featuredCompleted.id, e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {getDisplayedStaff(getEventStaffIds(featuredCompleted), featuredCompleted.id).map((staffId) => {
                          const staff = staffLookup[staffId];
                          const checkInTime = generateCheckInTime(featuredCompleted.id, staffId);
                          const checkOutTime = generateCheckOutTime(featuredCompleted.id, staffId);
                          return staff ? (
                            <div key={staff.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{staff.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      {staff.rating}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right space-y-1">
                                  <div className="flex items-center gap-1 text-xs text-blue-700">
                                    <Clock className="h-3 w-3" />
                                    In: {checkInTime}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-blue-700">
                                    <Clock className="h-3 w-3" />
                                    Out: {checkOutTime}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : null;
                        })}

                        {!expandedStaffSections[featuredCompleted.id] &&
                          getFilteredStaff(getEventStaffIds(featuredCompleted), featuredCompleted.id).length > 3 && (
                            <Button
                              variant="ghost"
                              onClick={() => toggleStaffSection(featuredCompleted.id)}
                              className="w-full justify-center text-blue-700 hover:bg-blue-50"
                            >
                              <ChevronDown className="h-4 w-4 mr-2" />
                              View {getFilteredStaff(getEventStaffIds(featuredCompleted), featuredCompleted.id).length - 3} more staff
                            </Button>
                          )}

                        {expandedStaffSections[featuredCompleted.id] &&
                          getFilteredStaff(getEventStaffIds(featuredCompleted), featuredCompleted.id).length > 3 && (
                            <Button
                              variant="ghost"
                              onClick={() => toggleStaffSection(featuredCompleted.id)}
                              className="w-full justify-center text-blue-700 hover:bg-blue-50"
                            >
                              <ChevronUp className="h-4 w-4 mr-2" />
                              Show less
                            </Button>
                          )}
                      </div>

                      {getEventStaffIds(featuredCompleted).length > 0 && getAdvancedFilteredStaff(getEventStaffIds(featuredCompleted), featuredCompleted.id).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No staff found matching your criteria</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setStaffFilters(prev => ({ ...prev, [featuredCompleted.id]: {} as any }));
                              setStaffSearchQueries(prev => ({ ...prev, [featuredCompleted.id]: '' }));
                            }}
                            className="mt-2"
                          >
                            Clear all filters
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button variant="outline">
                      <Receipt className="mr-2 h-4 w-4" />
                      Download Invoice
                    </Button>
                    <Button variant="outline">
                      <Star className="mr-2 h-4 w-4" />
                      Rate Staff
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No completed events</h3>
                  <p className="text-muted-foreground">
                    Your completed events will appear here after they finish.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Button onClick={() => setCurrentPage("bookings")} variant="outline" className="h-16 flex-col">
          <FileText className="h-6 w-6 mb-2" />
          View All Bookings
        </Button>
        <Button onClick={() => setCurrentPage("upcoming-events")} variant="outline" className="h-16 flex-col">
          <Calendar className="h-6 w-6 mb-2" />
          Upcoming Events
        </Button>
        <Button onClick={() => setCurrentPage("staff")} variant="outline" className="h-16 flex-col">
          <Users className="h-6 w-6 mb-2" />
          Staff Directory
        </Button>
        <Button onClick={() => setCurrentPage("messages")} variant="outline" className="h-16 flex-col">
          <Mail className="h-6 w-6 mb-2" />
          Support Center
        </Button>
      </div>
    </div>
  );
}
