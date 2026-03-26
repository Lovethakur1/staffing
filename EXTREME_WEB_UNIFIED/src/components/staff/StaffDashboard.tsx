import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  FileText,
  Upload,
  Check,
  X,
  Star,
  Navigation,
  Coffee,
  Play,
  Pause,
  AlertCircle,
  RefreshCw,
  Loader2
} from "lucide-react";
import { TimesheetForm } from "./TimesheetForm";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import api from "../../services/api";

import { ShiftActionCard } from "./ShiftActionCard";

interface StaffDashboardProps {
  staffId: string;
}

interface DashboardData {
  profile: any;
  stats: {
    todaysShifts: number;
    upcomingShifts: number;
    pendingRequests: number;
    completedShifts: number;
    rating: number;
    totalEvents: number;
    totalEarnings: number;
    thisMonthEarnings: number;
  };
  shifts: {
    today: any[];
    upcoming: any[];
    pending: any[];
    recent: any[];
  };
  payroll: any[];
  documents: any[];
  certifications: any[];
}

export function StaffDashboard({ staffId }: StaffDashboardProps) {
  const [showTimesheetForm, setShowTimesheetForm] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Dashboard data from API
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Rejection Dialog State
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [shiftToReject, setShiftToReject] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Break Management State
  const [shiftStatus, setShiftStatus] = useState<'idle' | 'working' | 'break' | 'completed'>('working');
  const [breakTimer, setBreakTimer] = useState(0);
  const [workTimer, setWorkTimer] = useState(0);
  const [showShiftDetails, setShowShiftDetails] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  
  // Overdue Shift Warning State
  const [showOverdueWarning, setShowOverdueWarning] = useState(false);

  // Fetch dashboard data from API
  const fetchDashboard = useCallback(async (showLoading = true) => {
    if (showLoading) setIsRefreshing(true);
    try {
      const res = await api.get('/staff/me/dashboard');
      setDashboardData(res.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch dashboard:', err);
      setError('Unable to load dashboard data from server.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(() => fetchDashboard(false), 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  // Derived data from dashboard
  const stats = dashboardData?.stats || {
    todaysShifts: 0,
    upcomingShifts: 0,
    pendingRequests: 0,
    completedShifts: 0,
    rating: 0,
    totalEvents: 0,
    totalEarnings: 0,
    thisMonthEarnings: 0,
  };
  const shifts = dashboardData?.shifts || { today: [], upcoming: [], pending: [], recent: [] };
  const payroll = dashboardData?.payroll || [];
  const documents = dashboardData?.documents || [];
  const certifications = dashboardData?.certifications || [];

  // Active Shift
  const activeShift = shifts.upcoming[0] || shifts.today[0];

  const handleShiftStatusUpdate = (status: any, data: any) => {
    console.log("Shift status update:", status, data);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (shiftStatus === 'working') {
      interval = setInterval(() => {
        setWorkTimer(prev => prev + 1);
      }, 1000);
    } else if (shiftStatus === 'break') {
      interval = setInterval(() => {
        setBreakTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [shiftStatus]);

  // Overdue Shift Warning Logic
  useEffect(() => {
    if (activeShift && shiftStatus === 'working' && activeShift.endTime && activeShift.date) {
        const checkOverdue = () => {
           const [h, m] = activeShift.endTime.split(':').map(Number);
           const shiftEnd = new Date(activeShift.date);
           shiftEnd.setHours(h, m, 0, 0);
           const now = new Date();
           if (now > shiftEnd) {
              setShowOverdueWarning(true);
           } else {
              setShowOverdueWarning(false);
           }
        };
        checkOverdue();
        const int = setInterval(checkOverdue, 60000);
        return () => clearInterval(int);
    }
    setShowOverdueWarning(false);
  }, [activeShift, shiftStatus]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartBreak = () => {
    setShiftStatus('break');
    toast.info("Break started. Work timer paused.");
  };

  const handleEndBreak = () => {
    setShiftStatus('working');
    toast.success("Welcome back! Work timer resumed.");
  };

  const handleClockIn = () => {
    setShiftStatus('working');
    toast.success("Clocked in successfully!");
  };

  const handleClockOutClick = () => {
    setShowCheckOutModal(true);
  };

  const confirmClockOut = () => {
    setShiftStatus('completed');
    setShowCheckOutModal(false);
    toast.success("Shift completed successfully!");
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTitle = (shift: any) => {
    return shift?.event?.title || 'Unknown Event';
  };

  const handleShiftResponse = async (shiftId: string, response: 'confirmed' | 'rejected') => {
    if (response === 'rejected') {
      setShiftToReject(shiftId);
      setRejectionReason("");
      setIsRejectDialogOpen(true);
    } else {
      try {
        await api.put(`/shifts/${shiftId}/status`, { status: 'CONFIRMED' });
        toast.success("Shift confirmed successfully!");
        fetchDashboard(); // Refresh dashboard data
      } catch (err) {
        toast.error("Failed to confirm shift");
      }
    }
  };

  const confirmRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    if (shiftToReject) {
      try {
        await api.put(`/shifts/${shiftToReject}/status`, { status: 'REJECTED' });
        toast.success("Shift request declined");
        setIsRejectDialogOpen(false);
        setShiftToReject(null);
        setRejectionReason("");
        fetchDashboard(); // Refresh dashboard data
      } catch (err) {
        toast.error("Failed to decline shift");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="p-6 flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Server Error</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button variant="outline" onClick={() => fetchDashboard()}>Retry</Button>
        </div>
      </div>
    );
  }
  // Get logged-in user's name
  const userName = dashboardData?.profile?.user?.name || 'Staff';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName}!</h1>
          <p className="text-gray-500">Here's your dashboard overview for {format(new Date(), 'EEEE, MMMM dd, yyyy')}</p>
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
            onClick={() => fetchDashboard()}
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

      {showOverdueWarning && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800">Shift Ended - Please Clock Out</h3>
            <p className="text-sm text-red-700 mt-1">
              Your scheduled shift time has ended. Please clock out now to ensure accurate timesheets. 
              If you remain clocked in for more than 2 hours past your scheduled end time, the system will automatically 
              clock you out at your scheduled end time.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Today's Shifts</p>
                <h3 className="text-2xl font-bold">{stats.todaysShifts}</h3>
                <p className="text-xs text-gray-400">{stats.upcomingShifts} upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Star className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Rating</p>
                <h3 className="text-2xl font-bold">{stats.rating.toFixed(1)}</h3>
                <p className="text-xs text-gray-400">{stats.totalEvents} events completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                <h3 className="text-2xl font-bold">{stats.pendingRequests}</h3>
                <p className="text-xs text-gray-400">Needs your response</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="h-auto p-1 w-full flex flex-row bg-slate-100 border rounded-xl gap-1">
          <TabsTrigger
            value="overview"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all
              data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm
              data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-slate-200"
          >
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all
              data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm
              data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-slate-200"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Pending Requests</span>
            {shifts.pending.length > 0 && (
              <span className="ml-1 text-[10px] leading-none bg-amber-500 text-white rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                {shifts.pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="todays-shifts"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all
              data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm
              data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-slate-200"
          >
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Today's Shifts</span>
          </TabsTrigger>
          <TabsTrigger
            value="payroll"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all
              data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm
              data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-slate-200"
          >
            <DollarSign className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Payroll</span>
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all
              data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm
              data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-900 data-[state=inactive]:hover:bg-slate-200"
          >
            <FileText className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Documents</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Active Shift Action Card */}
          {activeShift ? (
            <ShiftActionCard
              shift={activeShift}
              onStatusUpdate={handleShiftStatusUpdate}
              isTravelReimbursable={true}
            />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No upcoming shifts scheduled for today.</p>
              </CardContent>
            </Card>
          )}

          {/* Performance Overview (Placeholder from image bottom) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-center justify-center bg-slate-50 rounded border border-dashed">
                <p className="text-gray-400">Performance chart visualization</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <h3 className="text-lg font-medium">Pending Requests</h3>
          <div className="grid gap-4">
            {shifts.pending.map((shift) => (
              <Card key={shift.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{getEventTitle(shift)}</CardTitle>
                      <CardDescription>{shift.role}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(shift.status)}>
                      {shift.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{shift.date ? format(new Date(shift.date), 'MMM dd, yyyy') : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{shift.startTime} - {shift.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{shift.event?.venue || shift.location || 'TBD'}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Rate: ${shift.hourlyRate}/hour</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleShiftResponse(shift.id, 'rejected')}>
                        <X className="h-4 w-4 mr-1" /> Decline
                      </Button>
                      <Button size="sm" onClick={() => handleShiftResponse(shift.id, 'confirmed')}>
                        <Check className="h-4 w-4 mr-1" /> Accept
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {shifts.pending.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Check className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>No pending requests. You're all caught up!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="todays-shifts" className="space-y-4">
          <h3 className="text-lg font-medium">Today's Shifts</h3>
          <div className="grid gap-4">
            {shifts.today.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No shifts scheduled for today.</p>
                </CardContent>
              </Card>
            ) : (
              shifts.today.map((shift) => (
                <Card key={shift.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{getEventTitle(shift)}</CardTitle>
                        <CardDescription>{shift.role}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(shift.status)}>
                        {shift.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{shift.date ? format(new Date(shift.date), 'MMM dd, yyyy') : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{shift.startTime} - {shift.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{shift.event?.venue || shift.location || 'TBD'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll" className="space-y-4">
          <h3 className="text-lg font-medium">Payroll History</h3>
          <div className="grid gap-4">
            {payroll.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No payroll records found.</p>
                </CardContent>
              </Card>
            ) : (
              payroll.map((record) => (
                <Card key={record.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Pay Period: {record.period}</h4>
                        <p className="text-sm text-muted-foreground">{(record.regularHours + record.additionalHours).toFixed(1)} hours worked</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">${record.netPay?.toFixed(2) || '0.00'}</p>
                        <Badge className={record.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {record.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <h3 className="text-lg font-medium">Documents</h3>
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Documents</CardTitle>
                <CardDescription>Upload and manage your required documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {documents.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No documents uploaded yet.</p>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">{doc.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={
                          doc.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                            doc.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                        }>
                          {doc.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4 mr-1" /> Update
                        </Button>
                      </div>
                    </div>
                  ))
                )}
                <Button className="w-full" variant="outline">
                  <Upload className="h-4 w-4 mr-2" /> Upload New Document
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {showTimesheetForm && selectedShift && (
        <TimesheetForm
          isOpen={showTimesheetForm}
          onClose={() => {
            setShowTimesheetForm(false);
            setSelectedShift(null);
          }}
          shift={selectedShift}
        />
      )}

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

      {/* Check Out Summary Modal */}
      <Dialog open={showCheckOutModal} onOpenChange={setShowCheckOutModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Check Out</DialogTitle>
            <DialogDescription>
              Review your shift summary before clocking out.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <p className="text-xs text-gray-500 uppercase font-semibold">Total Time</p>
                <p className="text-xl font-mono font-bold text-slate-800">
                  {formatTime(workTimer + breakTimer)}
                </p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-xs text-green-700 uppercase font-semibold">Billable</p>
                <p className="text-xl font-mono font-bold text-green-800">
                  {formatTime(workTimer)}
                </p>
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-xs text-amber-700 uppercase font-semibold">Break Time (Non-Billable)</p>
                <p className="text-sm text-amber-600">Deducted from total</p>
              </div>
              <p className="text-xl font-mono font-bold text-amber-800">
                {formatTime(breakTimer)}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg text-sm text-gray-600">
              <p>By confirming, you certify that these hours are accurate.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckOutModal(false)}>Cancel</Button>
            <Button className="bg-[#5E1916] hover:bg-[#4E0707]" onClick={confirmClockOut}>
              Confirm Check Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
