import { useState, useEffect } from "react";
import { useAppState } from "../../contexts/AppStateContext";
import { useNavigation } from "../../contexts/NavigationContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { DataTable, DataTableColumn } from "../ui/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { TooltipWrapper, IconTooltip, InfoTooltip } from "../ui/tooltip-wrapper";
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
  ClockIcon,
} from "lucide-react";
import { format } from "date-fns";
import { mockEvents, mockReviews, Shift, getTodayDate } from "../../data/mockData";
import api from "../../services/api";
import { toast } from "sonner";
import { ShiftActionCard, ShiftDetailedStatus } from "./ShiftActionCard";

interface StaffDashboardProps {
  userId: string;
}

export function StaffDashboard({ userId }: StaffDashboardProps) {
  const { setCurrentPage } = useNavigation();
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
    setIsAnyShiftActive,
    startBreak,
    endBreak,
    currentShiftStatus,
    setCurrentShiftStatus
  } = useAppState();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isClockDialogOpen, setIsClockDialogOpen] = useState(false);

  // Rejection Dialog State
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [shiftToReject, setShiftToReject] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const today = getTodayDate();

  // Live shifts from API
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shiftsRes, userRes] = await Promise.all([
          api.get('/shifts'),
          api.get('/auth/me').catch(() => api.get('/users/me').catch(() => null)),
        ]);
        const raw = shiftsRes.data;
        const shiftsArr = Array.isArray(raw) ? raw : (raw?.data || raw?.shifts || []);
        const mapped: Shift[] = shiftsArr.map((s: any) => ({
          id: s.id,
          staffId: s.staffId || userId,
          eventId: s.event?.id || s.eventId || '',
          date: s.date ? format(new Date(s.date), 'yyyy-MM-dd') : '',
          startTime: s.startTime || '',
          endTime: s.endTime || '',
          role: s.role || 'Staff',
          location: s.event?.venue || s.event?.location || s.location || '',
          hourlyRate: s.hourlyRate || 0,
          guaranteedHours: s.guaranteedHours || 5,
          status: (s.status || 'pending').toLowerCase().replace(/_/g, '-') as Shift['status'],
          eventTitle: s.event?.title || s.event?.name || '',
          duration: 0,
        }));
        setShifts(mapped);
        if (userRes?.data) {
          const u = userRes.data?.data || userRes.data?.user || userRes.data;
          setCurrentUser({ id: u.id, name: u.name || u.email?.split('@')[0] || 'Staff', email: u.email, role: u.role });
        }
      } catch {
        // silently fail — dashboard stays with empty state
      }
    };
    fetchData();
  }, [userId]);

  // Sync local state with global context state
  useEffect(() => {
    if (activeShift && currentShiftStatus === 'not-started') {
      setCurrentShiftStatus('in-progress');
    }
  }, [activeShift]);

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

  // Use local shifts state instead of derived variable
  const upcomingShifts = shifts.filter(shift => shift.date === today);
  const pendingShifts = shifts.filter(shift => shift.status === 'pending');

  const userReviews = mockReviews.filter(review =>
    shifts.some(shift => shift.eventId === review.eventId)
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
      case 'confirmed':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Check className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <X className="w-3 h-3 mr-1" />
            Rejected
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
      setShifts(prev => prev.map(s => s.id === shiftId ? { ...s, status: 'confirmed' } : s));
      showSuccess("Shift accepted successfully!");
    }, 1000);
  };

  const handleDeclineShift = (shiftId: string) => {
    setShiftToReject(shiftId);
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };

  const confirmRejection = () => {
    if (!rejectionReason.trim()) {
      showError("Please provide a reason for rejection");
      return;
    }

    if (shiftToReject) {
      setShifts(prev => prev.map(s => s.id === shiftToReject ? { ...s, status: 'rejected' } : s));

      console.log(`Shift ${shiftToReject} rejected. Reason: ${rejectionReason}`);
      showSuccess("Shift declined successfully.");

      setIsRejectDialogOpen(false);
      setShiftToReject(null);
      setRejectionReason("");
    }
  };

  // Clock in/out functionality for Overview tab
  const handleClockAction = () => {
    if (currentShiftStatus === 'not-started' || currentShiftStatus === 'completed') {
      const shiftToActivate = currentShiftStatus === 'completed'
        ? (upcomingShifts[1] || upcomingShifts[0])
        : upcomingShifts[0];

      if (shiftToActivate) {
        checkInShift(shiftToActivate.id, userId);
        setCurrentShiftStatus('in-progress');
      }
    } else if (currentShiftStatus === 'in-progress' || currentShiftStatus === 'break') {
      if (activeShift) {
        checkOutShift(activeShift.id, userId);
        setCurrentShiftStatus('completed');
      }
    }
    setIsClockDialogOpen(false);
  };

  const handleStartBreak = () => {
    startBreak();
  };

  const handleEndBreak = () => {
    endBreak();
  };

  const getActiveShiftForOverview = () => {
    // If we have an active shift in context (meaning we are working, traveling, or on break), use that
    if (activeShift) {
      // Find the full shift object from our local list to get all details, or use activeShift
      return shifts.find(s => s.id === activeShift.id) || activeShift;
    }

    // Otherwise show the next upcoming shift
    const nextShift = upcomingShifts.find(s => s.status === 'yet-to-start' || s.status === 'confirmed');
    return nextShift || upcomingShifts[0];
  };

  // Get recent activity data
  const getRecentActivity = () => {
    const recentShifts = shifts
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
        client: (event as any)?.client || event?.clientId || 'Client',
        rating: 4.5 + Math.random() * 0.5 // Mock rating
      };
    });
  };

  // Performance metrics
  const getPerformanceMetrics = () => {
    const completedShifts = shifts.filter(s => s.status === 'completed');
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
              {(event as any)?.client || event?.clientId || 'Client Name'}
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
              {(event as any)?.client || event?.clientId || 'Client Name'}
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
            <h1>Welcome back, {currentUser?.name || 'Staff'}!</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto md:h-10 bg-slate-100/50 p-1 rounded-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 border-none">Overview</TabsTrigger>
            <TabsTrigger value="pending-requests" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 border-none">Pending Requests</TabsTrigger>
            <TabsTrigger value="upcoming-shifts" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 border-none">Today's Shifts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">

            {activeShiftData ? (
              <ShiftActionCard
                shift={activeShiftData}
                onStatusUpdate={(status, data) => {
                  console.log("Shift Status Update:", status, data);
                  if (status === 'working') {
                    setCurrentShiftStatus('in-progress');
                  } else if (status === 'on_break') {
                    setCurrentShiftStatus('break');
                  } else if (status === 'completed' || status === 'checked_out') {
                    setCurrentShiftStatus('completed');
                  }
                }}
                isTravelReimbursable={true}
              />
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>No upcoming shifts scheduled for today.</p>
                </CardContent>
              </Card>
            )}

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
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage('shift-details', { shiftId: shift.id })}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Shift Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this shift request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Rejection</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Conflict with another job, personal emergency, etc."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmRejection}>Decline Shift</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
