import { useState, useEffect } from "react";
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
  AlertCircle
} from "lucide-react";
import { mockShifts, mockPayrollRecords, mockRatings, mockEvents, getShiftsByStaff, getPayrollByStaff, getRatingsByStaff } from "../../data/mockData";
import { TimesheetForm } from "./TimesheetForm";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner@2.0.3";
import { format } from "date-fns";

import { ShiftActionCard } from "./ShiftActionCard";

interface StaffDashboardProps {
  staffId: string;
}

export function StaffDashboard({ staffId }: StaffDashboardProps) {
  const [showTimesheetForm, setShowTimesheetForm] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  
  // Initialize shifts with state so we can update them
  const [shifts, setShifts] = useState(() => getShiftsByStaff(staffId));

  // Rejection Dialog State
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [shiftToReject, setShiftToReject] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Break Management State
  const [shiftStatus, setShiftStatus] = useState<'idle' | 'working' | 'break' | 'completed'>('working'); // Default to working for demo
  const [breakTimer, setBreakTimer] = useState(0);
  const [workTimer, setWorkTimer] = useState(0);
  const [showShiftDetails, setShowShiftDetails] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);

  const staffPayroll = getPayrollByStaff(staffId);
  const staffRatings = getRatingsByStaff(staffId);
  
  const upcomingShifts = shifts.filter(shift => new Date(shift.date) >= new Date());
  // ... (rest of variable definitions)

  // Active Shift Mock
  const activeShift = upcomingShifts[0] || shifts[0];

  const handleShiftStatusUpdate = (status: any, data: any) => {
    console.log("Shift status update:", status, data);
    // In a real app, you would sync this with the backend
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
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTitle = (eventId: string) => {
    const event = mockEvents.find(e => e.id === eventId);
    return event?.title || 'Unknown Event';
  };

  const handleShiftResponse = (shiftId: string, response: 'confirmed' | 'rejected') => {
    if (response === 'rejected') {
      setShiftToReject(shiftId);
      setRejectionReason("");
      setIsRejectDialogOpen(true);
    } else {
      setShifts(prevShifts => prevShifts.map(shift => 
        shift.id === shiftId 
          ? { ...shift, status: 'confirmed' } 
          : shift
      ));
      toast.success("Shift confirmed successfully!");
    }
  };

  const confirmRejection = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    if (shiftToReject) {
      setShifts(prevShifts => prevShifts.map(shift => 
        shift.id === shiftToReject 
          ? { ...shift, status: 'rejected' } 
          : shift
      ));
      toast.success("Shift request declined");
      setIsRejectDialogOpen(false);
      setShiftToReject(null);
      setRejectionReason("");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, Emma Williams!</h1>
        <p className="text-gray-500">Here's your dashboard overview for {format(new Date(), 'EEEE, MMMM dd, yyyy')}</p>
      </div>

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
                <h3 className="text-2xl font-bold">{todaysShifts.length}</h3>
                <p className="text-xs text-gray-400">Active shift in progress</p>
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
                <h3 className="text-2xl font-bold">{averageRating.toFixed(1)}</h3>
                <p className="text-xs text-gray-400">From {staffRatings.length} reviews</p>
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
                <h3 className="text-2xl font-bold">{pendingShifts.length}</h3>
                <p className="text-xs text-gray-400">Needs your response</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="bg-muted p-1 rounded-lg inline-flex">
          <TabsList className="bg-transparent">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Pending Requests</TabsTrigger>
            <TabsTrigger value="todays-shifts" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Today's Shifts</TabsTrigger>
            <TabsTrigger value="payroll" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Payroll</TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Documents</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Active Shift Action Card */}
          <ShiftActionCard 
            shift={activeShift} 
            onStatusUpdate={handleShiftStatusUpdate} 
            isTravelReimbursable={true}
          />

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
            {pendingShifts.map((shift) => (
              <Card key={shift.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{getEventTitle(shift.eventId)}</CardTitle>
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
                      <span className="text-sm">{shift.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{shift.startTime} - {shift.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{shift.location}</span>
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
            {pendingShifts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Check className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>No pending requests. You're all caught up!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="todays-shifts" className="space-y-4">
           {/* Reusing existing list logic for simplicity */}
           <div className="grid gap-4">
            {shifts.map((shift) => (
              <Card key={shift.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{getEventTitle(shift.eventId)}</CardTitle>
                      <CardDescription>{shift.role}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(shift.status)}>
                      {shift.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                     {/* ... same details ... */}
                     <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{shift.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{shift.startTime} - {shift.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{shift.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
           </div>
        </TabsContent>

        {/* Existing Tabs Contents */}
        <TabsContent value="payroll" className="space-y-4">
          <h3 className="text-lg font-medium">Payroll History</h3>
          <div className="grid gap-4">
            {staffPayroll.map((record) => (
              <Card key={record.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Pay Period: {record.period}</h4>
                      <p className="text-sm text-muted-foreground">{record.totalHours} hours worked</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">${record.netPay}</p>
                      <Badge className={record.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {record.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <h3 className="text-lg font-medium">Documents</h3>
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Required Documents</CardTitle>
                <CardDescription>Upload and manage your required documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { type: 'ID', status: 'approved', required: true },
                  { type: 'Food Handler License', status: 'approved', required: true },
                  { type: 'Background Check', status: 'pending', required: true },
                  { type: 'W-4 Form', status: 'missing', required: true },
                ].map((doc, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">{doc.type}</p>
                      <p className="text-sm text-muted-foreground">{doc.required ? 'Required' : 'Optional'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={
                        doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                        doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {doc.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Upload className="h-4 w-4 mr-1" /> Upload
                      </Button>
                    </div>
                  </div>
                ))}
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
