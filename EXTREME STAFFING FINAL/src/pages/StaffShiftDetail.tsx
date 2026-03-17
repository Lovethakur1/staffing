import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Play,
  Pause,
  Navigation,
  ShieldCheck,
  Shirt,
  ClipboardList,
  Phone,
  Mail,
  Info,
  Coffee,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigation } from "../contexts/NavigationContext";
import { useAppState } from "../contexts/AppStateContext";
import { toast } from "sonner@2.0.3";
import { motion } from "motion/react";

interface StaffShiftDetailProps {
  userId: string;
}

interface BreakRecord {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number; // in minutes
}

// Mock shift detail data
const mockShiftDetail = {
  id: "shift-001",
  status: "confirmed",
  role: "Bartender",
  
  // Event Information
  event: {
    id: "event-001",
    name: "Annual Corporate Gala 2024",
    type: "Corporate Event",
    date: "2024-12-15",
    startTime: "18:00",
    endTime: "23:00",
    duration: 5,
    venue: "Grand Luxe Hotel Ballroom",
    address: "456 Luxury Ave, Los Angeles, CA 90001",
    coordinates: { lat: 34.0522, lng: -118.2437 },
    expectedGuests: 200,
    description: "Annual year-end celebration for 200+ employees and partners. Formal event with premium service expectations.",
    dressCode: "Black tie - Formal tuxedo or dark suit with bow tie",
    specialInstructions: "VIP section for executives requires premium service. Be prepared for high-volume bar service during cocktail hour (6-7 PM).",
    setupTime: "17:00",
    parkingInfo: "Valet parking available. Staff parking in rear lot - enter through service entrance.",
    hasBreaks: true,
    breakCount: 2,
    breakDuration: 15,
  },
  
  // Staff assignment details
  myShift: {
    checkInTime: null,
    checkOutTime: null,
    status: "not-started",
    breakDuration: 30, // minutes
    station: "Main Bar - North Side",
  },
  
  // Event coordinator (NOT client)
  coordinator: {
    name: "Sarah Johnson",
    role: "Event Manager",
    phone: "+1 (555) 123-4567",
    email: "sarah.johnson@staffingco.com",
  },
  
  // On-ground manager
  manager: {
    name: "Robert Garcia",
    phone: "+1 (555) 987-6543",
    email: "robert.g@staffingco.com",
  },
  
  // Other staff on this event
  teamMembers: [
    { id: "staff-001", name: "Sarah Martinez", role: "Bartender", station: "Main Bar - North Side" },
    { id: "staff-002", name: "Mike Johnson", role: "Bartender", station: "Main Bar - South Side" },
    { id: "staff-003", name: "Jessica Rodriguez", role: "Bartender", station: "VIP Bar" },
    { id: "staff-030", name: "Michael Scott", role: "Server", station: "Section A" },
    { id: "staff-031", name: "Jennifer Lopez", role: "Server", station: "Section B" },
    { id: "staff-032", name: "Robert Taylor", role: "Server", station: "Section C" },
    { id: "staff-040", name: "Linda Chen", role: "Supervisor", station: "Floor Manager" },
  ],
  
  // Important notes
  notes: [
    "Arrive 30 minutes before setup time for briefing",
    "Bring valid ID for venue security check",
    "Meal will be provided during break time",
    "Contact on-ground manager immediately if any issues arise",
  ],
};

export function StaffShiftDetail({ userId }: StaffShiftDetailProps) {
  const { setCurrentPage } = useNavigation();
  const { showSuccess, showInfo } = useAppState();
  
  // Refined Status State
  const [shiftStatus, setShiftStatus] = useState<'not-started' | 'working' | 'break' | 'completed'>('not-started');
  const [showClockDialog, setShowClockDialog] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  
  // Timers (in seconds)
  const [workTimer, setWorkTimer] = useState(0);
  const [breakTimer, setBreakTimer] = useState(0);
  
  const [breaks, setBreaks] = useState<BreakRecord[]>([]);
  const [currentBreakId, setCurrentBreakId] = useState<string | null>(null);

  const shift = mockShiftDetail;

  // Timer Logic
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

  const handleClockIn = () => {
    setShiftStatus('working');
    setShowClockDialog(false);
    showSuccess("Clocked in successfully! Your shift has started.");
    toast.success("Shift started - Good luck!");
  };

  const handleClockOutClick = () => {
    setShowClockDialog(false); // Close the simple dialog if open
    setShowCheckOutModal(true); // Open the summary modal
  };

  const confirmClockOut = () => {
    setShiftStatus('completed');
    setShowCheckOutModal(false);
    showSuccess("Clocked out successfully! Great work today.");
    toast.success("Shift completed - Well done!");
  };

  const handleStartBreak = () => {
    if (breaks.length >= (shift.event.breakCount || 0)) {
      toast.error("You have used all your breaks for this event");
      return;
    }

    const breakId = `break-${Date.now()}`;
    const newBreak: BreakRecord = {
      id: breakId,
      startTime: new Date().toLocaleTimeString(),
      endTime: null,
      duration: shift.event.breakDuration || 15,
    };

    setBreaks([...breaks, newBreak]);
    setShiftStatus('break'); // Update status
    setCurrentBreakId(breakId);
    toast.success(`Break started - ${shift.event.breakDuration} minutes`);
  };

  const handleEndBreak = () => {
    if (!currentBreakId) return;

    setBreaks(breaks.map(b => 
      b.id === currentBreakId 
        ? { ...b, endTime: new Date().toLocaleTimeString() }
        : b
    ));
    setShiftStatus('working'); // Update status
    setCurrentBreakId(null);
    toast.success("Break ended - Back to work!");
  };

  const remainingBreaks = (shift.event.breakCount || 0) - breaks.length;

  const handleGetDirections = () => {
    const address = encodeURIComponent(shift.event.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
    toast.success("Opening directions in Google Maps");
  };

  const handleCallCoordinator = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmailCoordinator = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCurrentPage('dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-[#5E1916]">Shift Details</h1>
            <p className="text-gray-500">{shift.event.name}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={handleGetDirections}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Get Directions
          </Button>
          
          {shiftStatus === 'not-started' && (
            <Button 
              className="bg-[#5E1916] hover:bg-[#4E0707]"
              onClick={() => setShowClockDialog(true)}
            >
              <Play className="h-4 w-4 mr-2" />
              Clock In
            </Button>
          )}

          {shiftStatus === 'working' && (
            <div className="flex gap-2">
              <Button 
                className="bg-amber-600 hover:bg-amber-700"
                onClick={handleStartBreak}
              >
                <Coffee className="h-4 w-4 mr-2" />
                Start Break
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={handleClockOutClick}
              >
                <Clock className="h-4 w-4 mr-2" />
                Check Out
              </Button>
            </div>
          )}

          {shiftStatus === 'break' && (
            <div className="flex gap-2">
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleEndBreak}
              >
                <Play className="h-4 w-4 mr-2" />
                End Break
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={handleClockOutClick}
              >
                <Clock className="h-4 w-4 mr-2" />
                Check Out
              </Button>
            </div>
          )}

          {shiftStatus === 'completed' && (
            <Button disabled className="bg-green-600 hover:bg-green-700 opacity-50 cursor-not-allowed">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Completed
            </Button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {(shiftStatus === 'working' || shiftStatus === 'break') && (
        <Card className={`${shiftStatus === 'break' ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
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
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Information
              </CardTitle>
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
                <div>
                  <p className="text-sm text-gray-600">Expected Guests</p>
                  <p className="font-medium">{shift.event.expectedGuests} guests</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">{format(new Date(shift.event.date), "MMMM dd, yyyy")}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(shift.event.date), "EEEE")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Event Time</p>
                  <p className="font-medium">{shift.event.startTime} - {shift.event.endTime}</p>
                  <p className="text-xs text-gray-500">{shift.event.duration} hours</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-gray-600 mb-2">Event Description</p>
                <p className="text-sm">{shift.event.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Venue & Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Venue & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Venue Name</p>
                <p className="font-medium">{shift.event.venue}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">Address</p>
                <p className="font-medium">{shift.event.address}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Setup Time</p>
                <p className="font-medium">{shift.event.setupTime}</p>
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Please arrive 30 minutes before setup time
                </p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Parking Information</p>
                <p className="text-sm text-blue-800">{shift.event.parkingInfo}</p>
              </div>
            </CardContent>
          </Card>

          {/* Your Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Your Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Your Role</p>
                  <Badge className="bg-[#5E1916] text-white mt-1">{shift.role}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Shift Duration</p>
                  <p className="font-medium">{shift.event.duration} hours</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Break Duration</p>
                  <p className="font-medium">{shift.myShift.breakDuration} minutes</p>
                </div>
              </div>

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

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-medium">Special Instructions</p>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-900">{shift.event.specialInstructions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Team
              </CardTitle>
              <p className="text-sm text-gray-600">
                Other staff members working this event
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shift.teamMembers.map((member) => (
                  <div 
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
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

          {/* Important Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Important Notes
              </CardTitle>
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
            <CardHeader>
              <CardTitle className="text-base">Shift Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                {shiftStatus === 'not-started' && (
                  <>
                    <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="font-medium">Not Started</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Clock in when you arrive
                    </p>
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
                    <p className="text-xs text-gray-600 mt-1">
                      Shift in progress
                    </p>
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
                    <p className="text-xs text-gray-600 mt-1">
                      Paused work timer
                    </p>
                  </>
                )}
                {shiftStatus === 'completed' && (
                  <>
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-blue-600" />
                    <p className="font-medium text-blue-600">Completed</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Great work today!
                    </p>
                  </>
                )}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {format(new Date(shift.event.date), "MMM dd")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">
                    {shift.event.startTime} - {shift.event.endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Duration:</span>
                  <span className="font-medium font-mono">
                    {formatTime(workTimer + breakTimer)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Work:</span>
                  <span className="font-medium font-mono text-green-700">
                    {formatTime(workTimer)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Break Time:</span>
                  <span className="font-medium font-mono text-amber-700">
                    {formatTime(breakTimer)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Break Management - Only shown if event has breaks and shift is active */}
          {shift.event.hasBreaks && (shiftStatus === 'working' || shiftStatus === 'break') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Coffee className="h-4 w-4" />
                  Break Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">Breaks Available</span>
                    <Badge className="bg-blue-600">
                      {remainingBreaks} of {shift.event.breakCount}
                    </Badge>
                  </div>
                  <p className="text-xs text-blue-800">
                    Each break lasts {shift.event.breakDuration} minutes
                  </p>
                </div>

                {shiftStatus === 'break' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-amber-50 border-2 border-amber-300 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-amber-600 rounded-full animate-pulse" />
                      <p className="font-medium text-amber-900">On Break</p>
                    </div>
                    <p className="text-sm text-amber-800 mb-4">
                      Enjoy your {shift.event.breakDuration}-minute break!
                    </p>
                    <Button 
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      onClick={handleEndBreak}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      End Break
                    </Button>
                  </motion.div>
                ) : (
                  <Button 
                    className="w-full bg-[#5E1916] hover:bg-[#4E0707]"
                    onClick={handleStartBreak}
                    disabled={remainingBreaks === 0}
                  >
                    <Coffee className="h-4 w-4 mr-2" />
                    {remainingBreaks === 0 ? 'No Breaks Left' : 'Start Break'}
                  </Button>
                )}

                {breaks.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Break History</p>
                      {breaks.map((breakRecord, index) => (
                        <div 
                          key={breakRecord.id}
                          className="p-2 bg-gray-50 rounded border text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Break {index + 1}</span>
                            <Badge variant="secondary" className="text-xs">
                              {breakRecord.duration}m
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-gray-600">
                            <Clock className="h-3 w-3" />
                            <span>{breakRecord.startTime}</span>
                            {breakRecord.endTime && (
                              <>
                                <span>-</span>
                                <span>{breakRecord.endTime}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Event Coordinator Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Event Coordinator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{shift.coordinator.name}</p>
                <p className="text-xs text-gray-500">{shift.coordinator.role}</p>
              </div>
              
              <Separator />

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleCallCoordinator(shift.coordinator.phone)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Coordinator
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleEmailCoordinator(shift.coordinator.email)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Coordinator
                </Button>
              </div>

              <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                <Info className="h-3 w-3 inline mr-1" />
                Contact for event-related questions
              </div>
            </CardContent>
          </Card>

          {/* On-Ground Manager */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                On-Ground Manager
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{shift.manager.name}</p>
              </div>
              
              <Separator />

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleCallCoordinator(shift.manager.phone)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Manager
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleEmailCoordinator(shift.manager.email)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Manager
                </Button>
              </div>

              <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                Contact for immediate issues
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Clock In/Out Dialog */}
      <Dialog open={showClockDialog} onOpenChange={setShowClockDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {shiftStatus === 'not-started' ? 'Clock In to Shift' : 'Clock Out from Shift'}
            </DialogTitle>
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
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowClockDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                className={`flex-1 ${
                  shiftStatus === 'working' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-[#5E1916] hover:bg-[#4E0707]'
                }`}
                onClick={() => {
                  if (shiftStatus === 'not-started') {
                    handleClockIn();
                  } else {
                    handleClockOutClick();
                  }
                }}
              >
                {shiftStatus === 'not-started' ? 'Clock In' : 'Clock Out'}
              </Button>
            </div>
          </div>
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