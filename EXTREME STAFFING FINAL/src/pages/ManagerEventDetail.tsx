import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Star,
  ArrowLeft,
  Building2,
  Radio,
  MessageSquare,
  FileText,
  Send,
  MapPinned,
  ScanFace
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner@2.0.3";
import { TooltipWrapper, IconTooltip } from "../components/ui/tooltip-wrapper";
import { mockEvents, mockUsers, mockStaff } from "../data/mockData";
import { LiveTrackingMap } from "../components/dashboards/LiveTrackingMap";

interface ManagerEventDetailProps {
  userRole: string;
  userId: string;
  eventId?: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  status: 'checked-in' | 'not-arrived' | 'checked-out' | 'late';
  checkInTime?: string;
  checkOutTime?: string;
  rating: number;
  expectedTime: string;
  actualArrival?: string;
  hoursWorked?: number;
  performance?: {
    punctuality: number;
    quality: number;
    professionalism: number;
  };
  issues?: string[];
}

export function ManagerEventDetail({ userRole, userId, eventId }: ManagerEventDetailProps) {
  const { setCurrentPage, pageParams } = useNavigation();
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showReportIssueDialog, setShowReportIssueDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [issueDescription, setIssueDescription] = useState("");
  const [staffRatings, setStaffRatings] = useState({
    punctuality: 5,
    quality: 5,
    professionalism: 5
  });
  const [reportIssue, setReportIssue] = useState({
    category: "event",
    priority: "medium",
    subject: "",
    description: "",
    relatedStaffId: "",
  });
  const [managerCheckInStatus, setManagerCheckInStatus] = useState<'not-checked-in' | 'checked-in' | 'checked-out'>('not-checked-in');
  const [managerCheckInTime, setManagerCheckInTime] = useState<string | null>(null);
  const [managerCheckOutTime, setManagerCheckOutTime] = useState<string | null>(null);
  const [selectedMapStaff, setSelectedMapStaff] = useState<StaffMember | null>(null);

  const currentEventId = eventId || pageParams?.eventId;

  useEffect(() => {
    if (currentEventId) {
      // toast.info(`Debug: Loading event ID: ${currentEventId}`);
    } else {
      toast.error("Debug: No event ID received");
    }
  }, [currentEventId]);

  // Find event from mock data
  const foundEvent = mockEvents.find(e => e.id === currentEventId);
  const foundClient = foundEvent ? mockUsers.find(u => u.id === foundEvent.clientId) : null;
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (currentEventId && !foundEvent) {
       console.log(`Debug: Event ID ${currentEventId} not found in mock data. Available IDs:`, mockEvents.map(e => e.id));
    }
  }, [currentEventId, foundEvent]);

  // Mock event data with fallback
  const event = foundEvent ? {
    id: foundEvent.id,
    title: foundEvent.title,
    client: foundClient?.name || "Unknown Client",
    clientContact: {
      name: foundClient?.name || "Event Contact",
      email: foundClient?.email || "contact@email.com",
      phone: foundClient?.phone || "+1 (555) 100-2000"
    },
    date: foundEvent.date,
    startTime: foundEvent.startTime,
    endTime: foundEvent.endTime,
    venue: foundEvent.venue || foundEvent.location,
    address: foundEvent.location,
    status: (foundEvent.status === 'confirmed' && foundEvent.date === today) ? 'in-progress' : foundEvent.status,
    eventType: foundEvent.eventType || "Event",
    requiredStaff: foundEvent.staffRequired,
    specialInstructions: foundEvent.specialRequirements || foundEvent.requirements || "No special instructions.",
    setupTime: foundEvent.startTime ? "15:00" : "15:00",
    breakdownTime: foundEvent.endTime ? "00:00" : "00:00",
    parkingInfo: "Valet parking available. Staff parking in lot B.",
    uniformRequirements: "Black tie required. White shirts, black bow ties provided on-site."
  } : {
    id: currentEventId || "evt-001",
    title: currentEventId ? `Event Not Found (ID: ${currentEventId})` : "No Event Selected",
    client: "N/A",
    clientContact: {
      name: "N/A",
      email: "N/A",
      phone: "N/A"
    },
    date: "2025-10-10",
    startTime: "18:00",
    endTime: "23:00",
    venue: "Grand Ballroom",
    address: "123 Main St, Downtown, New York, NY 10001",
    status: "in-progress",
    eventType: "Corporate",
    requiredStaff: 24,
    specialInstructions: "VIP section requires experienced servers. Bar service until 22:00. Coat check area needs 2 staff members dedicated throughout event.",
    setupTime: "15:00",
    breakdownTime: "00:00",
    parkingInfo: "Valet parking available. Staff parking in lot B.",
    uniformRequirements: "Black tie required. White shirts, black bow ties provided on-site."
  };

  const staffMembers: StaffMember[] = (foundEvent && foundEvent.assignedStaff && foundEvent.assignedStaff.length > 0) ? foundEvent.assignedStaff.map((staffId, index) => {
    const staff = mockStaff.find(s => s.id === staffId);
    const mockStatus: 'checked-in' | 'not-arrived' | 'checked-out' | 'late' = index < 2 ? 'checked-in' : index === 2 ? 'late' : 'not-arrived';
    return {
      id: staff?.id || staffId,
      name: staff?.name || "Unknown Staff",
      role: index % 3 === 0 ? "Event Server" : index % 3 === 1 ? "Bartender" : "Catering Manager",
      phone: staff?.phone || "+1 (555) 123-4567",
      email: staff?.email || "staff@company.com",
      status: mockStatus,
      expectedTime: foundEvent.startTime,
      actualArrival: mockStatus === 'checked-in' ? foundEvent.startTime : undefined,
      checkInTime: mockStatus === 'checked-in' ? foundEvent.startTime : undefined,
      rating: staff?.rating || 4.8,
      hoursWorked: mockStatus === 'checked-in' ? 2 : undefined,
      performance: { punctuality: 95, quality: 98, professionalism: 97 },
      issues: mockStatus === 'late' ? ["Running late"] : []
    };
  }) : [
    {
      id: "staff-001",
      name: "Emma Williams",
      role: "Event Server",
      phone: "+1 (555) 123-4567",
      email: "emma.w@company.com",
      status: "checked-in",
      expectedTime: "17:30",
      actualArrival: "17:25",
      checkInTime: "17:25",
      rating: 4.9,
      hoursWorked: 2.5,
      performance: {
        punctuality: 100,
        quality: 95,
        professionalism: 98
      }
    },
    {
      id: "staff-002",
      name: "James Rodriguez",
      role: "Bartender",
      phone: "+1 (555) 234-5678",
      email: "james.r@company.com",
      status: "checked-in",
      expectedTime: "17:30",
      actualArrival: "17:35",
      checkInTime: "17:35",
      rating: 4.8,
      hoursWorked: 2.4,
      performance: {
        punctuality: 90,
        quality: 98,
        professionalism: 96
      }
    },
    {
      id: "staff-003",
      name: "Maria Garcia",
      role: "Event Server",
      phone: "+1 (555) 345-6789",
      email: "maria.g@company.com",
      status: "checked-in",
      expectedTime: "17:30",
      actualArrival: "17:28",
      checkInTime: "17:28",
      rating: 4.9,
      hoursWorked: 2.5,
      performance: {
        punctuality: 98,
        quality: 97,
        professionalism: 99
      }
    },
    {
      id: "staff-004",
      name: "David Kim",
      role: "Event Server",
      phone: "+1 (555) 456-7890",
      email: "david.k@company.com",
      status: "late",
      expectedTime: "17:30",
      rating: 4.6,
      issues: ["Running 15 minutes late - traffic"]
    },
    {
      id: "staff-005",
      name: "Sophie Brown",
      role: "Catering Manager",
      phone: "+1 (555) 567-8901",
      email: "sophie.b@company.com",
      status: "checked-in",
      expectedTime: "17:00",
      actualArrival: "16:55",
      checkInTime: "16:55",
      rating: 4.8,
      hoursWorked: 3.0,
      performance: {
        punctuality: 100,
        quality: 96,
        professionalism: 97
      }
    }
  ];

  const checkedInStaff = staffMembers.filter(s => s.status === 'checked-in').length;
  const lateStaff = staffMembers.filter(s => s.status === 'late').length;
  const notArrivedStaff = staffMembers.filter(s => s.status === 'not-arrived').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'checked-in':
        return <Badge className="bg-green-100 text-green-700"><UserCheck className="h-3 w-3 mr-1" />Checked In</Badge>;
      case 'checked-out':
        return <Badge className="bg-gray-100 text-gray-700"><CheckCircle className="h-3 w-3 mr-1" />Checked Out</Badge>;
      case 'late':
        return <Badge className="bg-orange-100 text-orange-700"><Clock className="h-3 w-3 mr-1" />Late</Badge>;
      case 'not-arrived':
        return <Badge className="bg-yellow-100 text-yellow-700"><AlertCircle className="h-3 w-3 mr-1" />Not Arrived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleCheckIn = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setShowCheckInDialog(true);
  };

  const confirmCheckIn = () => {
    toast.success(`${selectedStaff?.name} checked in successfully!`);
    setShowCheckInDialog(false);
  };

  const handleCheckOut = (staff: StaffMember) => {
    toast.success(`${staff.name} checked out successfully!`);
  };

  const openStaffIssueDialog = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setShowIssueDialog(true);
  };

  const submitIssue = () => {
    toast.success(`Issue reported for ${selectedStaff?.name}`);
    setShowIssueDialog(false);
    setIssueDescription("");
  };

  const submitAdminIssue = () => {
    if (!reportIssue.subject || !reportIssue.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const priorityLabel = reportIssue.priority.charAt(0).toUpperCase() + reportIssue.priority.slice(1);
    toast.success(`${priorityLabel} priority issue reported to admin successfully!`);
    
    // Reset form
    setReportIssue({
      category: "event",
      priority: "medium",
      subject: "",
      description: "",
      relatedStaffId: "",
    });
    setShowReportIssueDialog(false);
  };

  const openRatingDialog = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setStaffRatings({
      punctuality: staff.performance?.punctuality || 5,
      quality: staff.performance?.quality || 5,
      professionalism: staff.performance?.professionalism || 5
    });
    setShowRatingDialog(true);
  };

  const submitRating = () => {
    toast.success(`Rating submitted for ${selectedStaff?.name}!`);
    setShowRatingDialog(false);
  };

  const handleManagerCheckIn = () => {
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setManagerCheckInTime(currentTime);
    setManagerCheckInStatus('checked-in');
    toast.success(`You have successfully checked in at ${currentTime}!`);
  };

  const handleManagerCheckOut = () => {
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setManagerCheckOutTime(currentTime);
    setManagerCheckInStatus('checked-out');
    toast.success(`You have successfully checked out at ${currentTime}!`);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <TooltipWrapper content="Back to Manager Dashboard">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage('manager')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </TooltipWrapper>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <Badge className="bg-green-100 text-green-700">
                <Radio className="h-3 w-3 mr-1 animate-pulse" />
                LIVE
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {event.client}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipWrapper content="Report event, client, or staff issues to admin team">
            <Button 
              variant="outline" 
              className="bg-[#5E1916] text-[rgb(94,25,22)] hover:bg-[#4E0707]"
              onClick={() => setShowReportIssueDialog(true)}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report Issue to Admin
            </Button>
          </TooltipWrapper>
          <TooltipWrapper content="Send direct message to admin">
            <Button variant="outline" onClick={() => toast.info("Opening messages...")}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat with Admin
            </Button>
          </TooltipWrapper>
          <TooltipWrapper content="Download complete event report">
            <Button onClick={() => toast.info("Downloading event report...")}>
              <FileText className="h-4 w-4 mr-2" />
              Event Report
            </Button>
          </TooltipWrapper>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Checked In</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkedInStaff}/{event.requiredStaff}</div>
            <Progress value={(checkedInStaff / event.requiredStaff) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lateStaff}</div>
            <p className="text-xs text-muted-foreground">Staff members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Event Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5h</div>
            <p className="text-xs text-muted-foreground">{event.startTime} - {event.endTime}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues Reported</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffMembers.filter(s => s.issues && s.issues.length > 0).length}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Event Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Date & Time</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{event.startTime} - {event.endTime}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Venue</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{event.venue}</p>
                    <p className="text-sm text-muted-foreground">{event.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Label className="text-sm text-muted-foreground mb-2 block">Special Instructions</Label>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">{event.specialInstructions}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Setup Time</Label>
                <p className="font-medium">{event.setupTime}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Breakdown Time</Label>
                <p className="font-medium">{event.breakdownTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Contact Person</Label>
              <p className="font-medium">{event.clientContact.name}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${event.clientContact.email}`} className="text-sm text-blue-600 hover:underline">
                  {event.clientContact.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${event.clientContact.phone}`} className="text-sm text-blue-600 hover:underline">
                  {event.clientContact.phone}
                </a>
              </div>
            </div>
            <Button className="w-full" variant="outline" onClick={() => {
              window.open(`tel:${event.clientContact.phone.replace(/[^0-9]/g, '')}`);
            }}>
              <Phone className="h-4 w-4 mr-2" />
              Call Client
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Manager Biometric Check-In */}
      <Card className="border-2 border-[#5E1916] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#5E1916]/10 via-[#5E1916]/5 to-transparent relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
             <ScanFace className="h-32 w-32 text-[#5E1916]" />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <CardTitle className="flex items-center gap-2 text-[#5E1916]">
                <ScanFace className="h-5 w-5" />
                Biometric Attendance
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Secure biometric verification for event entry
              </p>
            </div>
            {managerCheckInStatus === 'checked-in' && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified & Checked In
              </Badge>
            )}
            {managerCheckInStatus === 'checked-out' && (
              <Badge className="bg-gray-100 text-gray-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Checked Out
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              {managerCheckInStatus === 'not-checked-in' && (
                <p className="text-sm text-muted-foreground">
                  Please complete biometric verification to check in.
                </p>
              )}
              {managerCheckInStatus === 'checked-in' && managerCheckInTime && (
                <div>
                  <p className="text-sm text-muted-foreground">Check-in Time</p>
                  <p className="text-lg font-semibold text-green-700 font-mono">{managerCheckInTime}</p>
                </div>
              )}
              {managerCheckInStatus === 'checked-out' && (
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Check-in Time</p>
                    <p className="font-medium font-mono">{managerCheckInTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Check-out Time</p>
                    <p className="font-medium font-mono">{managerCheckOutTime}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {managerCheckInStatus === 'not-checked-in' && (
                <TooltipWrapper content="Scan face to check in">
                  <Button 
                    onClick={handleManagerCheckIn}
                    className="bg-[#5E1916] hover:bg-[#4E0707] shadow-lg shadow-[#5E1916]/20 transition-all hover:scale-105"
                  >
                    <ScanFace className="h-4 w-4 mr-2" />
                    Biometric Check In
                  </Button>
                </TooltipWrapper>
              )}
              {managerCheckInStatus === 'checked-in' && (
                <TooltipWrapper content="Check yourself out">
                  <Button 
                    onClick={handleManagerCheckOut}
                    variant="outline"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Check Out
                  </Button>
                </TooltipWrapper>
              )}
              {managerCheckInStatus === 'checked-out' && (
                <Badge variant="secondary" className="px-4 py-2">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Attendance Complete
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Management Tabs */}
      <Tabs defaultValue="live-tracking" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live-tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="roster">Staff Roster</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>

        {/* Live Tracking Tab */}
        <TabsContent value="live-tracking" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
              {/* Staff List - Left Side */}
              <div className="lg:col-span-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                    <UserCheck className="h-5 w-5 text-[#5E1916]" />
                    Staff Locations
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Select staff member to track real-time location
                  </p>
                </div>
                <div className="flex-1 overflow-auto p-4 space-y-3">
                  {staffMembers.map(staff => (
                    <div 
                      key={staff.id} 
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 group ${
                        (selectedMapStaff?.id === staff.id || (!selectedMapStaff && staff.id === staffMembers[0]?.id))
                          ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500/20' 
                          : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedMapStaff(staff)}
                    >
                       <div className="flex items-center gap-4">
                         <div className="relative">
                           <Avatar className="h-10 w-10 border border-slate-100 bg-slate-100 text-slate-600 font-bold">
                             <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-sm">
                               {staff.name.split(' ').map(n => n[0]).join('')}
                             </AvatarFallback>
                           </Avatar>
                           {/* Status Dot */}
                           <span className={`absolute bottom-0 -right-1 h-3 w-3 border-2 border-white rounded-full ${staff.status === 'not-arrived' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></span>
                         </div>
                         <div>
                           <p className="font-bold text-sm text-slate-800">{staff.name}</p>
                           <p className="text-xs text-slate-500 font-medium">{staff.role}</p>
                         </div>
                       </div>
                       
                       <div className="flex flex-col items-end">
                         {staff.status === 'not-arrived' ? (
                            <span className="px-2.5 py-1 rounded-md bg-white border border-blue-200 text-blue-600 text-[10px] font-bold shadow-sm">
                               En Route
                            </span>
                         ) : staff.status === 'checked-in' ? (
                            <span className="px-2.5 py-1 rounded-md bg-white border border-green-200 text-green-600 text-[10px] font-bold shadow-sm">
                               Arrived
                            </span>
                         ) : (
                            getStatusBadge(staff.status)
                         )}
                       </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Map View - Right Side */}
              <div className="lg:col-span-2 h-full rounded-xl border border-slate-200 shadow-sm overflow-hidden relative group bg-slate-900">
                {/* Map Component */}
                <div className="w-full h-full relative">
                  {staffMembers.length > 0 ? (
                    <LiveTrackingMap 
                      staff={selectedMapStaff || staffMembers[0]}
                      destinationName={event.venue}
                      eta={(selectedMapStaff?.status === 'not-arrived' || (!selectedMapStaff && staffMembers[0].status === 'not-arrived')) ? "15 mins" : "Arrived"}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                      <div className="bg-slate-800 p-4 rounded-full">
                         <MapPinned className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-slate-400">No staff location data available</p>
                    </div>
                  )}
                  
                  {/* Bottom Stats Overlay - Exact Replica of Screenshot */}
                  {(selectedMapStaff || staffMembers[0]) && (
                     <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">

                     </div>
                  )}
                </div>
              </div>
            </div>
        </TabsContent>

        {/* Staff Roster */}
        <TabsContent value="roster" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete Staff Roster</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage all staff assigned to this event
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffMembers.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{staff.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{staff.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <a href={`tel:${staff.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {staff.phone}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(staff.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {staff.checkInTime ? (
                            <>
                              <p className="font-medium">In: {staff.checkInTime}</p>
                              {staff.checkOutTime && <p className="text-muted-foreground">Out: {staff.checkOutTime}</p>}
                            </>
                          ) : (
                            <p className="text-muted-foreground">Expected: {staff.expectedTime}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{staff.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {staff.status === 'not-arrived' && (
                            <TooltipWrapper content="Check in this staff member">
                              <Button
                                size="sm"
                                onClick={() => handleCheckIn(staff)}
                              >
                                Check In
                              </Button>
                            </TooltipWrapper>
                          )}
                          {staff.status === 'checked-in' && (
                            <>
                              <TooltipWrapper content="Check out this staff member">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCheckOut(staff)}
                                >
                                  Check Out
                                </Button>
                              </TooltipWrapper>
                              <IconTooltip content="Rate performance">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openRatingDialog(staff)}
                                >
                                  <Star className="h-4 w-4" />
                                </Button>
                              </IconTooltip>
                            </>
                          )}
                          <IconTooltip content="Report an issue">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openStaffIssueDialog(staff)}
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          </IconTooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Checked In</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{checkedInStaff}</div>
                <Progress value={(checkedInStaff / event.requiredStaff) * 100} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Late</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{lateStaff}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Not Arrived</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{notArrivedStaff}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staffMembers.filter(s => s.checkInTime).map((staff) => (
                  <div key={staff.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{staff.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Checked in at {staff.checkInTime}
                        {staff.actualArrival && staff.expectedTime && staff.actualArrival < staff.expectedTime && (
                          <span className="text-green-600"> (Early)</span>
                        )}
                        {staff.actualArrival && staff.expectedTime && staff.actualArrival > staff.expectedTime && (
                          <span className="text-orange-600"> (Late)</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance Tracking</CardTitle>
              <p className="text-sm text-muted-foreground">
                Real-time performance monitoring and ratings
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staffMembers.filter(s => s.performance).map((staff) => (
                  <div key={staff.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          <p className="text-sm text-muted-foreground">{staff.role}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => openRatingDialog(staff)}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Rate Performance
                      </Button>
                    </div>
                    {staff.performance && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Punctuality</span>
                            <span className="font-medium">{staff.performance.punctuality}%</span>
                          </div>
                          <Progress value={staff.performance.punctuality} />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Quality</span>
                            <span className="font-medium">{staff.performance.quality}%</span>
                          </div>
                          <Progress value={staff.performance.quality} />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Professionalism</span>
                            <span className="font-medium">{staff.performance.professionalism}%</span>
                          </div>
                          <Progress value={staff.performance.professionalism} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reported Issues</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track and manage event-related issues
              </p>
            </CardHeader>
            <CardContent>
              {staffMembers.filter(s => s.issues && s.issues.length > 0).length > 0 ? (
                <div className="space-y-4">
                  {staffMembers.filter(s => s.issues && s.issues.length > 0).map((staff) => (
                    <div key={staff.id} className="p-4 border-l-4 border-orange-500 bg-orange-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">{staff.name}</p>
                          {staff.issues?.map((issue, index) => (
                            <p key={index} className="text-sm text-muted-foreground mt-1">{issue}</p>
                          ))}
                        </div>
                        <Button size="sm" variant="outline">
                          Resolve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>No issues reported</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Check-in Dialog */}
      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check In Staff Member</DialogTitle>
            <DialogDescription>
              Confirm check-in for {selectedStaff?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{selectedStaff?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedStaff?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedStaff?.role}</p>
                </div>
              </div>
              <div className="text-sm space-y-1">
                <p>Expected: {selectedStaff?.expectedTime}</p>
                <p className="font-medium">Check-in Time: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCheckInDialog(false)}>Cancel</Button>
              <Button onClick={confirmCheckIn}>Confirm Check-in</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Issue Report Dialog */}
      <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Issue</DialogTitle>
            <DialogDescription>
              Report an issue for {selectedStaff?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Issue Description</Label>
              <Textarea
                placeholder="Describe the issue..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowIssueDialog(false)}>Cancel</Button>
              <Button onClick={submitIssue}>Submit Issue</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Staff Performance</DialogTitle>
            <DialogDescription>
              Provide performance rating for {selectedStaff?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Punctuality ({staffRatings.punctuality}/5)</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setStaffRatings({...staffRatings, punctuality: star})}
                      className="transition-colors"
                    >
                      <Star className={`h-6 w-6 ${star <= staffRatings.punctuality ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Quality of Work ({staffRatings.quality}/5)</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setStaffRatings({...staffRatings, quality: star})}
                      className="transition-colors"
                    >
                      <Star className={`h-6 w-6 ${star <= staffRatings.quality ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Professionalism ({staffRatings.professionalism}/5)</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setStaffRatings({...staffRatings, professionalism: star})}
                      className="transition-colors"
                    >
                      <Star className={`h-6 w-6 ${star <= staffRatings.professionalism ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowRatingDialog(false)}>Cancel</Button>
              <Button onClick={submitRating}>Submit Rating</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Issue Report Dialog */}
      <Dialog open={showReportIssueDialog} onOpenChange={setShowReportIssueDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Issue to Admin</DialogTitle>
            <DialogDescription>
              Report an event, client, staff, or other related issue to the admin team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Issue Category <span className="text-red-500">*</span></Label>
                <Select
                  value={reportIssue.category}
                  onValueChange={(value) => setReportIssue({...reportIssue, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event">Event Related</SelectItem>
                    <SelectItem value="client">Client Issue</SelectItem>
                    <SelectItem value="staff">Staff Issue</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority Level <span className="text-red-500">*</span></Label>
                <Select
                  value={reportIssue.priority}
                  onValueChange={(value) => setReportIssue({...reportIssue, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {reportIssue.category === 'staff' && (
              <div>
                <Label>Related Staff Member (Optional)</Label>
                <Select
                  value={reportIssue.relatedStaffId}
                  onValueChange={(value) => setReportIssue({...reportIssue, relatedStaffId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {staffMembers.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name} - {staff.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Subject <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Brief summary of the issue"
                value={reportIssue.subject}
                onChange={(e) => setReportIssue({...reportIssue, subject: e.target.value})}
              />
            </div>
            <div>
              <Label>Description <span className="text-red-500">*</span></Label>
              <Textarea
                placeholder="Provide detailed information about the issue..."
                value={reportIssue.description}
                onChange={(e) => setReportIssue({...reportIssue, description: e.target.value})}
                rows={6}
              />
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Event Context</p>
                  <p><strong>Event:</strong> {event.title}</p>
                  <p><strong>Client:</strong> {event.client}</p>
                  <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowReportIssueDialog(false)}>Cancel</Button>
              <Button 
                onClick={submitAdminIssue}
                className="bg-[#5E1916] hover:bg-[#4E0707]"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit to Admin
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}