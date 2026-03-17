import { useState, useEffect } from "react";
import { useAppState } from "../../contexts/AppStateContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { DataTable, DataTableColumn } from "../ui/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  DollarSign, 
  Check, 
  X, 
  Star,
  MapPin,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Activity,
  Users,
  Eye,
  MoreHorizontal,
  Building2,
  Timer,
  TrendingUp,
  Award,
  Target,
  Briefcase,
  ClockIcon
} from "lucide-react";
import { mockEvents, mockShifts, mockStaff, mockReviews, Shift, mockPayStubs, getTodayDate, getShiftStatus } from "../../data/mockData";

interface StaffDashboardProps {
  userId: string;
}

export function StaffDashboard({ userId }: StaffDashboardProps) {
  const { 
    showSuccess, 
    showError, 
    showInfo, 
    activeShift, 
    currentTimer, 
    setActiveShift,
    setTimerStartTime,
    setCurrentTimer,
    checkInShift,
    checkOutShift,
    isAnyShiftActive,
    setIsAnyShiftActive
  } = useAppState();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [currentShiftStatus, setCurrentShiftStatus] = useState<'not-started' | 'in-progress' | 'completed'>('not-started');
  const [isClockDialogOpen, setIsClockDialogOpen] = useState(false);

  // Sync local state with global context state
  useEffect(() => {
    if (activeShift) {
      setCurrentShiftStatus('in-progress');
    } else {
      setCurrentShiftStatus('not-started');
    }
  }, [activeShift]);

  const today = getTodayDate();
  const currentUser = mockStaff.find(staff => staff.id === userId);

  if (!currentUser) {
    return <div>Staff member not found</div>;
  }

  const calculateShiftDuration = (startTime: string, endTime: string): number => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;
    
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }
    
    return (endMinutes - startMinutes) / 60;
  };

  const userShiftsWithUpdatedStatus = mockShifts
    .filter(shift => shift.staffId === userId)
    .map(shift => ({
      ...shift,
      status: getShiftStatus(shift, today) as Shift['status']
    }));

  const upcomingShifts = userShiftsWithUpdatedStatus.filter(shift => shift.date === today);
  const pendingShifts = userShiftsWithUpdatedStatus.filter(shift => shift.status === 'pending');

  const userReviews = mockReviews.filter(review => 
    userShiftsWithUpdatedStatus.some(shift => shift.eventId === review.eventId)
  );

  const averageRating = userReviews.length > 0 
    ? userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length 
    : 0;

  const getShiftStatusBadge = (status: Shift['status']) => {
    switch (status) {
      case 'ongoing':
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <Activity className="w-3 h-3 mr-1" />
            Ongoing
          </Badge>
        );
      case 'yet-to-start':
        return (
          <Badge className="bg-info/10 text-info border-info/20">
            <Clock className="w-3 h-3 mr-1" />
            Yet to Start
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-muted text-muted-foreground border-muted-foreground/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleCheckIn = (shiftId: string) => {
    setIsLoading(true);
    showInfo("Checking in to shift...");
    setTimeout(() => {
      setIsLoading(false);
      showSuccess("Successfully checked in! Your shift has started.");
    }, 1500);
  };

  const handleCheckOut = (shiftId: string) => {
    setIsLoading(true);
    showInfo("Checking out of shift...");
    setTimeout(() => {
      setIsLoading(false);
      showSuccess("Successfully checked out! Great work today.");
    }, 1500);
  };

  const handleViewShiftDetails = (shift: Shift) => {
    setSelectedShift(shift);
  };

  const handleAcceptShift = (shiftId: string) => {
    showInfo("Accepting shift...");
    setTimeout(() => {
      showSuccess("Shift accepted successfully!");
    }, 1000);
  };

  const handleDeclineShift = (shiftId: string) => {
    showInfo("Declining shift...");
    setTimeout(() => {
      showSuccess("Shift declined successfully.");
    }, 1000);
  };

  // Clock in/out functionality for Overview tab
  const handleClockAction = () => {
    if (currentShiftStatus === 'not-started') {
      const shiftToActivate = upcomingShifts[0];
      if (shiftToActivate) {
        setCurrentShiftStatus('in-progress');
        setActiveShift(shiftToActivate);
        setTimerStartTime(new Date());
        setCurrentTimer('00:00:00');
        setIsAnyShiftActive(true);
        showSuccess("Successfully checked in! Your shift has started.");
      }
    } else if (currentShiftStatus === 'in-progress') {
      setCurrentShiftStatus('completed');
      setActiveShift(null);
      setTimerStartTime(null);
      setCurrentTimer('00:00:00');
      setIsAnyShiftActive(false);
      showSuccess("Successfully checked out! Great work today.");
    } else if (currentShiftStatus === 'completed') {
      const nextShift = upcomingShifts[1] || upcomingShifts[0];
      if (nextShift) {
        setCurrentShiftStatus('in-progress');
        setActiveShift(nextShift);
        setTimerStartTime(new Date());
        setCurrentTimer('00:00:00');
        setIsAnyShiftActive(true);
        showSuccess("Successfully checked in to next shift!");
      }
    }
    setIsClockDialogOpen(false);
  };

  const getActiveShiftForOverview = () => {
    if (currentShiftStatus === 'not-started' || currentShiftStatus === 'in-progress') {
      return upcomingShifts[0];
    } else {
      return upcomingShifts[1] || upcomingShifts[0];
    }
  };

  // Get recent activity data
  const getRecentActivity = () => {
    const recentShifts = userShiftsWithUpdatedStatus
      .filter(shift => shift.status === 'completed')
      .slice(0, 3);
    
    return recentShifts.map(shift => {
      const event = mockEvents.find(e => e.id === shift.eventId);
      return {
        id: shift.id,
        title: event?.title || 'Event',
        date: shift.date,
        duration: calculateShiftDuration(shift.startTime, shift.endTime),
        earnings: Math.max(
          calculateShiftDuration(shift.startTime, shift.endTime) * shift.hourlyRate,
          5 * shift.hourlyRate
        ),
        client: event?.client || 'Client',
        rating: 4.5 + Math.random() * 0.5 // Mock rating
      };
    });
  };

  // Performance metrics
  const getPerformanceMetrics = () => {
    const completedShifts = userShiftsWithUpdatedStatus.filter(s => s.status === 'completed');
    const totalHours = completedShifts.reduce((sum, shift) => 
      sum + calculateShiftDuration(shift.startTime, shift.endTime), 0);
    const totalEarnings = completedShifts.reduce((sum, shift) => 
      sum + Math.max(calculateShiftDuration(shift.startTime, shift.endTime) * shift.hourlyRate, 5 * shift.hourlyRate), 0);
    
    return {
      totalHours: totalHours,
      totalEarnings: totalEarnings,
      averageRating: averageRating,
      completedShifts: completedShifts.length,
      onTimeRate: 98, // Mock data
      clientSatisfaction: 96 // Mock data
    };
  };

  const performanceMetrics = getPerformanceMetrics();
  const recentActivity = getRecentActivity();
  const activeShiftData = getActiveShiftForOverview();

  // Today's Shifts DataTable columns
  const todaysShiftsColumns: DataTableColumn<Shift>[] = [
    {
      key: 'eventTitle',
      title: 'Event Details',
      sortable: true,
      filterable: true,
      render: (_, shift) => {
        const event = mockEvents.find(e => e.id === shift.eventId);
        return (
          <div className="space-y-1">
            <p className="font-medium text-sm">{event?.title || 'Event Details'}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {event?.client || 'Client Name'}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {shift.location}
            </p>
          </div>
        );
      }
    },
    {
      key: 'date',
      title: 'Date & Time',
      sortable: true,
      filterable: true,
      render: (_, shift) => (
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {new Date(shift.date).toLocaleDateString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {shift.startTime} - {shift.endTime}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(shift.date).toLocaleDateString('en-US', { weekday: 'long' })}
          </p>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Badge variant="outline" className="text-xs">
          {value}
        </Badge>
      )
    },
    {
      key: 'duration',
      title: 'Duration',
      sortable: true,
      render: (_, shift) => {
        const duration = calculateShiftDuration(shift.startTime, shift.endTime);
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">{duration}h</p>
            <p className="text-xs text-muted-foreground">
              {duration <= 4 ? '5h minimum' : 'Regular rate'}
            </p>
          </div>
        );
      }
    },
    {
      key: 'hourlyRate',
      title: 'Rate',
      sortable: true,
      render: (_, shift) => {
        const duration = calculateShiftDuration(shift.startTime, shift.endTime);
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">${shift.hourlyRate}/hr</p>
            <p className="text-xs text-success">
              ~${Math.max(duration * shift.hourlyRate, 5 * shift.hourlyRate).toFixed(0)} total
            </p>
          </div>
        );
      }
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Yet to Start', value: 'yet-to-start' },
        { label: 'Ongoing', value: 'ongoing' },
        { label: 'Completed', value: 'completed' }
      ],
      render: (status) => getShiftStatusBadge(status)
    }
  ];

  // Pending Requests DataTable columns
  const pendingRequestsColumns: DataTableColumn<Shift>[] = [
    {
      key: 'eventTitle',
      title: 'Event Details',
      sortable: true,
      filterable: true,
      render: (_, shift) => {
        const event = mockEvents.find(e => e.id === shift.eventId);
        return (
          <div className="space-y-1">
            <p className="font-medium text-sm">{event?.title || 'Event Details'}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {event?.client || 'Client Name'}
            </p>
          </div>
        );
      }
    },
    {
      key: 'date',
      title: 'Date & Time',
      sortable: true,
      filterable: true,
      render: (_, shift) => (
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {new Date(shift.date).toLocaleDateString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {shift.startTime} - {shift.endTime}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(shift.date).toLocaleDateString('en-US', { weekday: 'long' })}
          </p>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role & Location',
      sortable: true,
      filterable: true,
      render: (_, shift) => (
        <div className="space-y-1">
          <Badge variant="outline" className="text-xs mb-1">
            {shift.role}
          </Badge>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {shift.location}
          </p>
        </div>
      )
    },
    {
      key: 'duration',
      title: 'Duration',
      sortable: true,
      render: (_, shift) => {
        const duration = calculateShiftDuration(shift.startTime, shift.endTime);
        const minimumPay = Math.max(duration * shift.hourlyRate, 5 * shift.hourlyRate);
        return (
          <div className="space-y-1">
            <p className="text-sm font-medium">{duration}h</p>
            <p className="text-xs text-muted-foreground">
              {duration <= 4 ? '5h minimum applies' : 'Standard duration'}
            </p>
            <p className="text-xs text-success font-medium">
              ${minimumPay.toFixed(0)} total
              {duration <= 4 && <span className="text-info ml-1">(5h min)</span>}
            </p>
          </div>
        );
      }
    }
  ];

  return (
    <div className="standard-page-wrapper">
      <div className="page-container">
        {/* Welcome Header */}
        <div className="desktop-first-header mb-6">
          <div>
            <h1>Welcome back, {currentUser.name}!</h1>
            <p className="text-muted-foreground">
              Here's your dashboard overview for {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="adaptive-stats-grid mb-6">
          <Card className="p-4">
            <CardHeader className="pb-2 px-0">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="w-4 h-4" />
                Today's Shifts
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-0">
              <div className="text-2xl font-medium text-foreground">{upcomingShifts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {upcomingShifts.filter(s => s.status === 'ongoing').length > 0 ? 'Active shift in progress' : 
                 upcomingShifts.filter(s => s.status === 'yet-to-start').length > 0 ? 'Ready to start' : 
                 'All shifts completed'}
              </p>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardHeader className="pb-2 px-0">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4" />
                Rating
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-0">
              <div className="text-2xl font-medium text-foreground">{averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground mt-1">From {userReviews.length} reviews</p>
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardHeader className="pb-2 px-0">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-0">
              <div className="text-2xl font-medium text-foreground">{pendingShifts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {pendingShifts.length > 0 ? 'Needs your response' : 'All up to date'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pending-requests">Pending Requests</TabsTrigger>
            <TabsTrigger value="upcoming-shifts">Today's Shifts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Clock In/Out Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  Clock In/Out
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage your shift attendance and work sessions
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Active Shift Display */}
                  {activeShift && currentShiftStatus === 'in-progress' && (
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                          <span className="font-medium text-primary">Currently Working</span>
                        </div>
                        <div className="text-sm font-mono font-medium text-primary">
                          {currentTimer}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Current Shift</p>
                          <p className="font-medium">{activeShiftData?.role}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Location</p>
                          <p className="font-medium">{activeShiftData?.location}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Next Shift Information */}
                  {activeShiftData && (
                    <div className="wide-content-grid">
                      <div className="space-y-3">
                        <h4 className="font-medium">
                          {currentShiftStatus === 'in-progress' ? 'Current Shift' : 'Next Shift'}
                        </h4>
                        <div className="p-3 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{activeShiftData.role}</p>
                            <Badge variant={currentShiftStatus === 'in-progress' ? 'default' : 'outline'}>
                              {currentShiftStatus === 'in-progress' ? 'Active' : 'Upcoming'}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{activeShiftData.startTime} - {activeShiftData.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{activeShiftData.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              <span>${activeShiftData.hourlyRate}/hour</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Quick Actions</h4>
                        <div className="space-y-2">
                          <Dialog open={isClockDialogOpen} onOpenChange={setIsClockDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                className={`w-full ${
                                  currentShiftStatus === 'in-progress' 
                                    ? 'bg-destructive hover:bg-destructive/90 animate-pulse' 
                                    : 'bg-primary hover:bg-primary/90'
                                }`}
                              >
                                {currentShiftStatus === 'not-started' && (
                                  <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Clock In
                                  </>
                                )}
                                {currentShiftStatus === 'in-progress' && (
                                  <>
                                    <Pause className="w-4 h-4 mr-2" />
                                    Clock Out
                                  </>
                                )}
                                {currentShiftStatus === 'completed' && (
                                  <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Clock In Next
                                  </>
                                )}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>
                                  {currentShiftStatus === 'not-started' ? 'Clock In to Shift' : 
                                   currentShiftStatus === 'in-progress' ? 'Clock Out from Shift' : 
                                   'Clock In to Next Shift'}
                                </DialogTitle>
                                <DialogDescription>
                                  {currentShiftStatus === 'not-started' ? 'Start your work session and begin tracking time' : 
                                   currentShiftStatus === 'in-progress' ? 'End your current shift and stop time tracking' : 
                                   'Start your next shift and begin tracking time'}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex gap-3">
                                <Button 
                                  variant="outline" 
                                  className="flex-1"
                                  onClick={() => setIsClockDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  className={`flex-1 ${currentShiftStatus === 'in-progress' ? 'bg-destructive hover:bg-destructive/90' : ''}`}
                                  onClick={handleClockAction}
                                >
                                  {currentShiftStatus === 'not-started' ? 'Clock In' : 
                                   currentShiftStatus === 'in-progress' ? 'Clock Out' : 
                                   'Clock In'}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button variant="outline" className="w-full">
                            <MapPin className="w-4 h-4 mr-2" />
                            Get Directions
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            View Shift Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Overview
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your work performance and achievement metrics
                </p>
              </CardHeader>
              <CardContent>
                <div className="adaptive-stats-grid">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-medium text-primary">{performanceMetrics.totalHours}</div>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <ClockIcon className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">This month</span>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-medium text-success">${performanceMetrics.totalEarnings}</div>
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <DollarSign className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">This month</span>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-medium text-warning">{performanceMetrics.averageRating.toFixed(1)}</div>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{userReviews.length} reviews</span>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-medium text-info">{performanceMetrics.onTimeRate}%</div>
                    <p className="text-sm text-muted-foreground">On-Time Rate</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Target className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Punctuality</span>
                    </div>
                  </div>
                </div>
                
                {/* Performance Progress Bars */}
                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Client Satisfaction</span>
                      <span className="text-sm text-muted-foreground">{performanceMetrics.clientSatisfaction}%</span>
                    </div>
                    <Progress value={performanceMetrics.clientSatisfaction} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Monthly Goal Progress</span>
                      <span className="text-sm text-muted-foreground">{Math.min(100, (performanceMetrics.totalHours / 160 * 100)).toFixed(0)}%</span>
                    </div>
                    <Progress value={Math.min(100, (performanceMetrics.totalHours / 160 * 100))} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your latest completed shifts and achievements
                </p>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-6">
                    <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                    <p className="text-xs text-muted-foreground">Complete some shifts to see your activity here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-success rounded-full"></div>
                          <div>
                            <p className="font-medium text-sm">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.date).toLocaleDateString()} • {activity.client}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-success">${activity.earnings}</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-warning fill-current" />
                            <span className="text-xs text-muted-foreground">{activity.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Requests Tab */}
          <TabsContent value="pending-requests" className="space-y-4">
            <DataTable
              data={pendingShifts}
              columns={pendingRequestsColumns}
              title="Pending Shift Requests"
              subtitle="Review and respond to shift requests from clients"
              searchable={true}
              exportable={true}
              refreshable={true}
              onRefresh={() => window.location.reload()}
              pageSize={10}
              pageSizeOptions={[5, 10, 20]}
              emptyMessage="No pending requests at this time."
              actions={(shift) => (
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    onClick={() => handleAcceptShift(shift.id)}
                    disabled={isLoading}
                    className="w-full justify-start text-xs bg-success hover:bg-success/90 text-success-foreground"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeclineShift(shift.id)}
                    disabled={isLoading}
                    className="w-full justify-start text-xs text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleViewShiftDetails(shift)}
                    className="w-full justify-start text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                </div>
              )}
            />
          </TabsContent>

          {/* Today's Shifts Tab */}
          <TabsContent value="upcoming-shifts" className="space-y-4">
            <DataTable
              data={upcomingShifts}
              columns={todaysShiftsColumns}
              title="Today's Shifts"
              subtitle="Your confirmed and pending shifts scheduled for today"
              searchable={true}
              exportable={true}
              refreshable={true}
              onRefresh={() => window.location.reload()}
              pageSize={10}
              pageSizeOptions={[5, 10, 20]}
              emptyMessage="No shifts scheduled for today. Enjoy your day off!"
              actions={(shift) => (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Shift Details</DialogTitle>
                      <DialogDescription>
                        Complete information about your shift
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* Event Information */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">Event Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Event Name</label>
                            <p className="text-sm">{mockEvents.find(e => e.id === shift.eventId)?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Client</label>
                            <p className="text-sm">{mockEvents.find(e => e.id === shift.eventId)?.client || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Event Type</label>
                            <p className="text-sm">{mockEvents.find(e => e.id === shift.eventId)?.type || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Location</label>
                            <p className="text-sm flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {mockEvents.find(e => e.id === shift.eventId)?.location || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Shift Information */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">Shift Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Date</label>
                            <p className="text-sm">{shift.date}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Time</label>
                            <p className="text-sm">{shift.startTime} - {shift.endTime}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Role</label>
                            <p className="text-sm">{shift.role}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                            <Badge 
                              variant={shift.status === 'confirmed' ? 'default' : 
                                      shift.status === 'pending' ? 'secondary' : 
                                      shift.status === 'ongoing' ? 'default' : 'secondary'}
                              className={shift.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                        shift.status === 'ongoing' ? 'bg-blue-100 text-blue-800' : ''}
                            >
                              {shift.status === 'confirmed' ? 'Confirmed' :
                               shift.status === 'pending' ? 'Pending' :
                               shift.status === 'ongoing' ? 'In Progress' :
                               shift.status === 'completed' ? 'Completed' : 
                               'Yet to Start'}
                            </Badge>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Pay Rate</label>
                            <p className="text-sm">${shift.rate}/hour</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Total Hours</label>
                            <p className="text-sm">{shift.hours} hours</p>
                          </div>
                        </div>
                      </div>

                      {/* Additional Details */}
                      {mockEvents.find(e => e.id === shift.eventId)?.description && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-primary" />
                            <h3 className="font-medium">Event Description</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {mockEvents.find(e => e.id === shift.eventId)?.description}
                          </p>
                        </div>
                      )}

                      {/* Contact Information */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">Contact Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Event Coordinator</label>
                            <p className="text-sm">Sarah Johnson</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Phone</label>
                            <p className="text-sm">(555) 123-4567</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}