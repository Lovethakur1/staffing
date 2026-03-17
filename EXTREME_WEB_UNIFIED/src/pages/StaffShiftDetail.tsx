import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "../components/ui/dialog";
import {
  ArrowLeft, Calendar, Clock, MapPin, Users, Briefcase, AlertCircle,
  CheckCircle2, Play, Navigation, ShieldCheck, Shirt, ClipboardList,
  Phone, Mail, Info, Coffee,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigation } from "../contexts/NavigationContext";
import { useAppState } from "../contexts/AppStateContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { shiftService } from "../services/shift.service";

interface StaffShiftDetailProps {
  userId: string;
  shiftId?: string;
}

interface BreakRecord {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number;
}

interface ShiftData {
  id: string;
  status: string;
  role: string;
  date: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  clockInTime?: string | null;
  clockOutTime?: string | null;
  event: {
    id: string;
    name: string;
    type: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    venue: string;
    address: string;
    expectedGuests: number;
    description: string;
    dressCode: string;
    specialInstructions: string;
    setupTime: string;
    parkingInfo: string;
    hasBreaks: boolean;
    breakCount: number;
    breakDuration: number;
  };
  coordinator: { name: string; role: string; phone: string; email: string } | null;
  manager: { name: string; phone: string; email: string } | null;
  teamMembers: { id: string; name: string; role: string; station: string }[];
  notes: string[];
}

function mapApiShiftToData(raw: any): ShiftData {
  const ev = raw.event || {};
  const startDate = ev.date || raw.date || '';
  const endTime = ev.endTime || raw.endTime || '';
  const startTime = ev.startTime || raw.startTime || '';

  // Compute duration in hours
  let duration = 0;
  if (startTime && endTime) {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    duration = Math.abs((eh * 60 + em - (sh * 60 + sm))) / 60;
  }

  // Team members from sibling shifts (other staff on same event)
  const teamMembers = (raw.event?.staffShifts || [])
    .filter((ss: any) => ss.staffId !== raw.staffId)
    .map((ss: any) => ({
      id: ss.staffId,
      name: ss.staff?.user?.name || ss.staff?.name || 'Staff',
      role: ss.role || 'Staff',
      station: ss.location || ss.notes || '—',
    }));

  // Manager info
  const manager = ev.manager?.user
    ? { name: ev.manager.user.name, phone: ev.manager.user.phone || '', email: ev.manager.user.email || '' }
    : null;

  // Notes: gather special instructions, dress code as note bullets
  const notes: string[] = [];
  if (ev.setupTime) notes.push(`Arrive 30 minutes before setup time (${ev.setupTime}) for briefing`);
  notes.push('Bring valid ID for venue security check');
  if (raw.event?.breakDuration) notes.push('Meal will be provided during break time');
  notes.push('Contact on-ground manager immediately if any issues arise');

  return {
    id: raw.id,
    status: (raw.status || '').toLowerCase(),
    role: raw.role || 'Staff',
    date: startDate,
    startTime,
    endTime,
    breakDuration: raw.breakDuration || 30,
    clockInTime: raw.clockInTime || null,
    clockOutTime: raw.clockOutTime || null,
    event: {
      id: ev.id || '',
      name: ev.title || ev.name || 'Event',
      type: ev.eventType || ev.type || 'Event',
      date: startDate,
      startTime,
      endTime,
      duration,
      venue: ev.venue || ev.location || '',
      address: ev.address || ev.location || '',
      expectedGuests: ev.guestCount || ev.expectedGuests || 0,
      description: ev.description || '',
      dressCode: ev.dressCode || raw.dressCode || '',
      specialInstructions: ev.specialInstructions || raw.specialInstructions || '',
      setupTime: ev.setupTime || '',
      parkingInfo: ev.parkingInfo || ev.parkingInstructions || '',
      hasBreaks: true,
      breakCount: ev.breakCount || 2,
      breakDuration: ev.breakDuration || raw.breakDuration || 15,
    },
    coordinator: ev.coordinator
      ? { name: ev.coordinator.name || '', role: ev.coordinator.role || 'Coordinator', phone: ev.coordinator.phone || '', email: ev.coordinator.email || '' }
      : null,
    manager,
    teamMembers,
    notes,
  };
}

export function StaffShiftDetail({ userId, shiftId }: StaffShiftDetailProps) {
  const { setCurrentPage } = useNavigation();
  const { showSuccess, showInfo } = useAppState();

  const [shiftStatus, setShiftStatus] = useState<'not-started' | 'working' | 'break' | 'completed'>('not-started');
  const [showClockDialog, setShowClockDialog] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [workTimer, setWorkTimer] = useState(0);
  const [breakTimer, setBreakTimer] = useState(0);
  const [breaks, setBreaks] = useState<BreakRecord[]>([]);
  const [currentBreakId, setCurrentBreakId] = useState<string | null>(null);

  const [shift, setShift] = useState<ShiftData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShift = async () => {
      if (!shiftId) {
        setLoading(false);
        return;
      }
      try {
        const raw = await shiftService.getShift(shiftId);
        const mapped = mapApiShiftToData(raw);
        setShift(mapped);
        // Restore status from API
        if (mapped.clockOutTime) setShiftStatus('completed');
        else if (mapped.clockInTime) setShiftStatus('working');
      } catch {
        toast.error('Failed to load shift details');
      } finally {
        setLoading(false);
      }
    };
    fetchShift();
  }, [shiftId]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (shiftStatus === 'working') {
      interval = setInterval(() => setWorkTimer(prev => prev + 1), 1000);
    } else if (shiftStatus === 'break') {
      interval = setInterval(() => setBreakTimer(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [shiftStatus]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleClockIn = async () => {
    try {
      if (shiftId) await shiftService.clockIn(shiftId);
      setShiftStatus('working');
      setShowClockDialog(false);
      showSuccess('Clocked in successfully! Your shift has started.');
      toast.success('Shift started - Good luck!');
    } catch {
      toast.error('Failed to clock in. Please try again.');
    }
  };

  const handleClockOutClick = () => {
    setShowClockDialog(false);
    setShowCheckOutModal(true);
  };

  const confirmClockOut = async () => {
    try {
      if (shiftId) await shiftService.clockOut(shiftId);
      setShiftStatus('completed');
      setShowCheckOutModal(false);
      showSuccess('Clocked out successfully! Great work today.');
      toast.success('Shift completed - Well done!');
    } catch {
      toast.error('Failed to clock out. Please try again.');
    }
  };

  const handleStartBreak = () => {
    if (!shift) return;
    if (breaks.length >= (shift.event.breakCount || 0)) {
      toast.error('You have used all your breaks for this event');
      return;
    }
    const breakId = `break-${Date.now()}`;
    setBreaks(prev => [...prev, { id: breakId, startTime: new Date().toLocaleTimeString(), endTime: null, duration: shift.event.breakDuration || 15 }]);
    setShiftStatus('break');
    setCurrentBreakId(breakId);
    toast.success(`Break started - ${shift.event.breakDuration} minutes`);
  };

  const handleEndBreak = () => {
    if (!currentBreakId) return;
    setBreaks(prev => prev.map(b => b.id === currentBreakId ? { ...b, endTime: new Date().toLocaleTimeString() } : b));
    setShiftStatus('working');
    setCurrentBreakId(null);
    toast.success('Break ended - Back to work!');
  };

  const handleGetDirections = () => {
    if (!shift) return;
    const address = encodeURIComponent(shift.event.address || shift.event.venue);
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
  };

  const handleCallContact = (phone: string) => { if (phone) window.location.href = `tel:${phone}`; };
  const handleEmailContact = (email: string) => { if (email) window.location.href = `mailto:${email}`; };

  const remainingBreaks = shift ? (shift.event.breakCount || 0) - breaks.length : 0;

  const formatEventDate = (dateStr: string) => {
    try { return format(new Date(dateStr), 'MMMM dd, yyyy'); } catch { return dateStr; }
  };
  const formatEventDay = (dateStr: string) => {
    try { return format(new Date(dateStr), 'EEEE'); } catch { return ''; }
  };
  const formatShortDate = (dateStr: string) => {
    try { return format(new Date(dateStr), 'MMM dd'); } catch { return dateStr; }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shift details...</p>
        </div>
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Shift not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => setCurrentPage('dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setCurrentPage('dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard
          </Button>
          <div>
            <h1 className="text-[#5E1916]">Shift Details</h1>
            <p className="text-gray-500">{shift.event.name}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleGetDirections}>
            <Navigation className="h-4 w-4 mr-2" />Get Directions
          </Button>

          {shiftStatus === 'not-started' && (
            <Button className="bg-[#5E1916] hover:bg-[#4E0707]" onClick={() => setShowClockDialog(true)}>
              <Play className="h-4 w-4 mr-2" />Clock In
            </Button>
          )}
          {shiftStatus === 'working' && (
            <div className="flex gap-2">
              <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleStartBreak}>
                <Coffee className="h-4 w-4 mr-2" />Start Break
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={handleClockOutClick}>
                <Clock className="h-4 w-4 mr-2" />Check Out
              </Button>
            </div>
          )}
          {shiftStatus === 'break' && (
            <div className="flex gap-2">
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleEndBreak}>
                <Play className="h-4 w-4 mr-2" />End Break
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={handleClockOutClick}>
                <Clock className="h-4 w-4 mr-2" />Check Out
              </Button>
            </div>
          )}
          {shiftStatus === 'completed' && (
            <Button disabled className="bg-green-600 opacity-50 cursor-not-allowed">
              <CheckCircle2 className="h-4 w-4 mr-2" />Completed
            </Button>
          )}
        </div>
      </div>

      {/* Active Status Banner */}
      {(shiftStatus === 'working' || shiftStatus === 'break') && (
        <Card className={shiftStatus === 'break' ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full animate-pulse ${shiftStatus === 'break' ? 'bg-amber-600' : 'bg-green-600'}`} />
                <div>
                  <p className={`font-medium ${shiftStatus === 'break' ? 'text-amber-900' : 'text-green-900'}`}>
                    {shiftStatus === 'break' ? 'On Break' : 'Shift In Progress'}
                  </p>
                  <p className={`text-sm ${shiftStatus === 'break' ? 'text-amber-700' : 'text-green-700'}`}>
                    {shiftStatus === 'break' ? 'Enjoy your break!' : 'You are currently clocked in.'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Session Time</p>
                <p className={`text-2xl font-mono font-bold ${shiftStatus === 'break' ? 'text-amber-700' : 'text-green-700'}`}>
                  {formatTime(shiftStatus === 'break' ? breakTimer : workTimer)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Event Name</p>
                <p className="font-medium text-lg">{shift.event.name}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Event Type</p>
                  <Badge variant="secondary">{shift.event.type}</Badge>
                </div>
                {shift.event.expectedGuests > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Expected Guests</p>
                    <p className="font-medium">{shift.event.expectedGuests} guests</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">{formatEventDate(shift.event.date)}</p>
                  <p className="text-xs text-gray-500">{formatEventDay(shift.event.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Event Time</p>
                  <p className="font-medium">{shift.event.startTime} - {shift.event.endTime}</p>
                  {shift.event.duration > 0 && <p className="text-xs text-gray-500">{shift.event.duration.toFixed(1)} hours</p>}
                </div>
              </div>
              {shift.event.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Event Description</p>
                    <p className="text-sm">{shift.event.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Venue & Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Venue & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {shift.event.venue && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Venue Name</p>
                  <p className="font-medium">{shift.event.venue}</p>
                </div>
              )}
              {shift.event.address && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="font-medium">{shift.event.address}</p>
                </div>
              )}
              {shift.event.setupTime && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Setup Time</p>
                  <p className="font-medium">{shift.event.setupTime}</p>
                  <p className="text-xs text-amber-600 mt-1">⚠️ Please arrive 30 minutes before setup time</p>
                </div>
              )}
              {shift.event.parkingInfo && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Parking Information</p>
                  <p className="text-sm text-blue-800">{shift.event.parkingInfo}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Your Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" />Your Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Your Role</p>
                  <Badge className="bg-[#5E1916] text-white mt-1">{shift.role}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Shift Duration</p>
                  <p className="font-medium">{shift.event.duration.toFixed(1)} hours</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Break Duration</p>
                  <p className="font-medium">{shift.breakDuration} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Shift Status</p>
                  <Badge variant="secondary" className="mt-1">{shift.status}</Badge>
                </div>
              </div>

              {shift.event.dressCode && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Shirt className="h-4 w-4 text-gray-400" />
                      <p className="text-sm font-medium">Dress Code</p>
                    </div>
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-sm text-purple-900">{shift.event.dressCode}</p>
                    </div>
                  </div>
                </>
              )}

              {shift.event.specialInstructions && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                    <p className="text-sm font-medium">Special Instructions</p>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-900">{shift.event.specialInstructions}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Members */}
          {shift.teamMembers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Your Team</CardTitle>
                <p className="text-sm text-gray-600">Other staff members working this event</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {shift.teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{member.station}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Important Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" />Important Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {shift.notes.map((note, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-[#5E1916] rounded-full mt-2" />
                    <p className="text-sm">{note}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Status */}
          <Card>
            <CardHeader><CardTitle className="text-base">Shift Status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                {shiftStatus === 'not-started' && (
                  <>
                    <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="font-medium">Not Started</p>
                    <p className="text-xs text-gray-600 mt-1">Clock in when you arrive</p>
                  </>
                )}
                {shiftStatus === 'working' && (
                  <>
                    <div className="relative">
                      <Play className="h-12 w-12 mx-auto mb-2 text-green-600" />
                      <div className="absolute top-0 right-1/2 translate-x-1/2">
                        <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse" />
                      </div>
                    </div>
                    <p className="font-medium text-green-600">Working</p>
                    <p className="text-xs text-gray-600 mt-1">Shift in progress</p>
                  </>
                )}
                {shiftStatus === 'break' && (
                  <>
                    <div className="relative">
                      <Coffee className="h-12 w-12 mx-auto mb-2 text-amber-500" />
                      <div className="absolute top-0 right-1/2 translate-x-1/2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                      </div>
                    </div>
                    <p className="font-medium text-amber-600">On Break</p>
                    <p className="text-xs text-gray-600 mt-1">Paused work timer</p>
                  </>
                )}
                {shiftStatus === 'completed' && (
                  <>
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-blue-600" />
                    <p className="font-medium text-blue-600">Completed</p>
                    <p className="text-xs text-gray-600 mt-1">Great work today!</p>
                  </>
                )}
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formatShortDate(shift.event.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{shift.event.startTime} - {shift.event.endTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Duration:</span>
                  <span className="font-medium font-mono">{formatTime(workTimer + breakTimer)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Work:</span>
                  <span className="font-medium font-mono text-green-700">{formatTime(workTimer)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Break Time:</span>
                  <span className="font-medium font-mono text-amber-700">{formatTime(breakTimer)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Break Management */}
          {shift.event.hasBreaks && (shiftStatus === 'working' || shiftStatus === 'break') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Coffee className="h-4 w-4" />Break Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">Breaks Available</span>
                    <Badge className="bg-blue-600">{remainingBreaks} of {shift.event.breakCount}</Badge>
                  </div>
                  <p className="text-xs text-blue-800">Each break lasts {shift.event.breakDuration} minutes</p>
                </div>

                {shiftStatus === 'break' ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-amber-600 rounded-full animate-pulse" />
                      <p className="font-medium text-amber-900">On Break</p>
                    </div>
                    <p className="text-sm text-amber-800 mb-4">Enjoy your {shift.event.breakDuration}-minute break!</p>
                    <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={handleEndBreak}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />End Break
                    </Button>
                  </motion.div>
                ) : (
                  <Button className="w-full bg-[#5E1916] hover:bg-[#4E0707]" onClick={handleStartBreak} disabled={remainingBreaks === 0}>
                    <Coffee className="h-4 w-4 mr-2" />
                    {remainingBreaks === 0 ? 'No Breaks Left' : 'Start Break'}
                  </Button>
                )}

                {breaks.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Break History</p>
                      {breaks.map((b, i) => (
                        <div key={b.id} className="p-2 bg-gray-50 rounded border text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Break {i + 1}</span>
                            <Badge variant="secondary" className="text-xs">{b.duration}m</Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-gray-600">
                            <Clock className="h-3 w-3" />
                            <span>{b.startTime}</span>
                            {b.endTime && <><span>-</span><span>{b.endTime}</span></>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Event Coordinator */}
          {shift.coordinator && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Event Coordinator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{shift.coordinator.name}</p>
                  <p className="text-xs text-gray-500">{shift.coordinator.role}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  {shift.coordinator.phone && (
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleCallContact(shift.coordinator!.phone)}>
                      <Phone className="h-4 w-4 mr-2" />Call Coordinator
                    </Button>
                  )}
                  {shift.coordinator.email && (
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleEmailContact(shift.coordinator!.email)}>
                      <Mail className="h-4 w-4 mr-2" />Email Coordinator
                    </Button>
                  )}
                </div>
                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                  <Info className="h-3 w-3 inline mr-1" />Contact for event-related questions
                </div>
              </CardContent>
            </Card>
          )}

          {/* On-Ground Manager */}
          {shift.manager && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" />On-Ground Manager</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{shift.manager.name}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  {shift.manager.phone && (
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleCallContact(shift.manager!.phone)}>
                      <Phone className="h-4 w-4 mr-2" />Call Manager
                    </Button>
                  )}
                  {shift.manager.email && (
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleEmailContact(shift.manager!.email)}>
                      <Mail className="h-4 w-4 mr-2" />Email Manager
                    </Button>
                  )}
                </div>
                <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                  <AlertCircle className="h-3 w-3 inline mr-1" />Contact for immediate issues
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Clock In Dialog */}
      <Dialog open={showClockDialog} onOpenChange={setShowClockDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{shiftStatus === 'not-started' ? 'Clock In to Shift' : 'Clock Out from Shift'}</DialogTitle>
            <DialogDescription>
              {shiftStatus === 'not-started'
                ? 'Confirm that you have arrived and are ready to start your shift'
                : 'Confirm that you are ending your shift and leaving the venue'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Event:</span>
                <span className="font-medium">{shift.event.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium">{shift.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowClockDialog(false)}>Cancel</Button>
              <Button
                className={`flex-1 ${shiftStatus === 'working' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#5E1916] hover:bg-[#4E0707]'}`}
                onClick={() => shiftStatus === 'not-started' ? handleClockIn() : handleClockOutClick()}
              >
                {shiftStatus === 'not-started' ? 'Clock In' : 'Clock Out'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Check Out Summary */}
      <Dialog open={showCheckOutModal} onOpenChange={setShowCheckOutModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Check Out</DialogTitle>
            <DialogDescription>Review your shift summary before clocking out.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <p className="text-xs text-gray-500 uppercase font-semibold">Total Time</p>
                <p className="text-xl font-mono font-bold text-slate-800">{formatTime(workTimer + breakTimer)}</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-xs text-green-700 uppercase font-semibold">Billable</p>
                <p className="text-xl font-mono font-bold text-green-800">{formatTime(workTimer)}</p>
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-xs text-amber-700 uppercase font-semibold">Break Time (Non-Billable)</p>
                <p className="text-sm text-amber-600">Deducted from total</p>
              </div>
              <p className="text-xl font-mono font-bold text-amber-800">{formatTime(breakTimer)}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg text-sm text-gray-600">
              <p>By confirming, you certify that these hours are accurate.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckOutModal(false)}>Cancel</Button>
            <Button className="bg-[#5E1916] hover:bg-[#4E0707]" onClick={confirmClockOut}>Confirm Check Out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}