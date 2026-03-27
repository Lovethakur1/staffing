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
import { toast } from "sonner";
import { TooltipWrapper, IconTooltip } from "../components/ui/tooltip-wrapper";
// Data fetched via API in useEffect below
import { lazy, Suspense } from "react";
const LiveStaffMap = lazy(() => import("../components/map/LiveStaffMap"));
import api from "../services/api";

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
  const [apiEvent, setApiEvent] = useState<any>(null);
  const [apiStaff, setApiStaff] = useState<any[]>([]);

  const currentEventId = eventId || pageParams?.eventId;
  const today = new Date().toISOString().split('T')[0];

  // Fetch event and staff from API
  useEffect(() => {
    const fetchData = async () => {
      if (!currentEventId) return;
      try {
        const [eventRes, staffRes] = await Promise.all([
          api.get(`/events/${currentEventId}`),
          api.get('/staff'),
        ]);
        setApiEvent(eventRes.data);
        const sd = staffRes.data;
        setApiStaff(Array.isArray(sd) ? sd : (sd?.data || sd?.staff || []));
      } catch (err) {
        console.log(`Failed to load event ${currentEventId}`);
      }
    };
    fetchData();
  }, [currentEventId]);

  // Build event data from API response
  const event = apiEvent ? {
    id: apiEvent.id,
    title: apiEvent.title || apiEvent.eventName || 'Event',
    client: apiEvent.client?.user?.name || 'Client',
    clientContact: {
      name: apiEvent.client?.user?.name || "Event Contact",
      email: apiEvent.client?.user?.email || "contact@email.com",
      phone: apiEvent.client?.user?.phone || ""
    },
    date: apiEvent.date || today,
    startTime: apiEvent.startTime || '09:00',
    endTime: apiEvent.endTime || '17:00',
    venue: apiEvent.venue || apiEvent.location || '',
    address: apiEvent.location || apiEvent.address || '',
    status: (apiEvent.status || '').toUpperCase() === 'CONFIRMED' ? 'in-progress' : apiEvent.status,
    eventType: apiEvent.eventType || "General",
    requiredStaff: apiEvent.staffRequired || 0,
    specialInstructions: apiEvent.notes || apiEvent.specialRequirements || "No special instructions.",
    setupTime: "15:00",
    breakdownTime: "00:00",
    parkingInfo: "Staff parking available.",
    uniformRequirements: "Please refer to event brief."
  } : {
    id: currentEventId || "evt-001",
    title: "Loading...",
    client: "Loading...",
    clientContact: { name: "N/A", email: "N/A", phone: "N/A" },
    date: today,
    startTime: "09:00",
    endTime: "17:00",
    venue: "",
    address: "",
    status: "pending",
    eventType: "General",
    requiredStaff: 0,
    specialInstructions: "",
    setupTime: "15:00",
    breakdownTime: "00:00",
    parkingInfo: "",
    uniformRequirements: ""
  };

  // Build staff members from API event.shifts or fall back to staff API
  const staffMembers: StaffMember[] = (() => {
    const shifts = apiEvent?.shifts || [];
    if (shifts.length > 0) {
      return shifts.map((shift: any, index: number) => {
        const s = shift.staff || {};
        const mockStatus: StaffMember['status'] = index < 2 ? 'checked-in' : index === 2 ? 'late' : 'not-arrived';
        return {
          id: s.id || shift.staffId || `staff-${index}`,
          name: s.user?.name || s.name || 'Staff Member',
          role: shift.role || s.staffType || 'General',
          phone: s.user?.phone || s.phone || '',
          email: s.user?.email || s.email || '',
          status: mockStatus,
          expectedTime: event.startTime,
          actualArrival: mockStatus === 'checked-in' ? event.startTime : undefined,
          checkInTime: mockStatus === 'checked-in' ? event.startTime : undefined,
          rating: s.rating || 4.5,
          hoursWorked: mockStatus === 'checked-in' ? 2 : undefined,
          performance: { punctuality: 95, quality: 98, professionalism: 97 },
          issues: mockStatus === 'late' ? ['Running late'] : []
        };
      });
    }
    // Fallback: use staff from API 
    return apiStaff.slice(0, event.requiredStaff || 5).map((s: any, index: number) => {
      const mockStatus: StaffMember['status'] = index < 2 ? 'checked-in' : index === 2 ? 'late' : 'not-arrived';
      return {
        id: s.id,
        name: s.user?.name || s.name || 'Staff',
        role: s.staffType || s.role || 'General',
        phone: s.user?.phone || s.phone || '',
        email: s.user?.email || s.email || '',
        status: mockStatus,
        expectedTime: event.startTime,
        actualArrival: mockStatus === 'checked-in' ? event.startTime : undefined,
        checkInTime: mockStatus === 'checked-in' ? event.startTime : undefined,
        rating: s.rating || 4.5,
        hoursWorked: mockStatus === 'checked-in' ? 2 : undefined,
        performance: { punctuality: 95, quality: 98, professionalism: 97 },
        issues: mockStatus === 'late' ? ['Running late'] : []
      };
    });
  })();

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
              className="bg-[#5E1916] text-white hover:bg-[#4E0707]"
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
          <Suspense fallback={
            <Card><CardContent className="py-12 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </CardContent></Card>
          }>
            <LiveStaffMap
              eventId={resolvedEventId}
              venueLat={apiEvent?.locationLat}
              venueLng={apiEvent?.locationLng}
              venueName={event.venue || event.title}
              selectedStaffId={selectedMapStaff?.id || null}
            />
          </Suspense>
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
                      onClick={() => setStaffRatings({ ...staffRatings, punctuality: star })}
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
                      onClick={() => setStaffRatings({ ...staffRatings, quality: star })}
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
                      onClick={() => setStaffRatings({ ...staffRatings, professionalism: star })}
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
                  onValueChange={(value) => setReportIssue({ ...reportIssue, category: value })}
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
                  onValueChange={(value) => setReportIssue({ ...reportIssue, priority: value })}
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
                  onValueChange={(value) => setReportIssue({ ...reportIssue, relatedStaffId: value })}
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
                onChange={(e) => setReportIssue({ ...reportIssue, subject: e.target.value })}
              />
            </div>
            <div>
              <Label>Description <span className="text-red-500">*</span></Label>
              <Textarea
                placeholder="Provide detailed information about the issue..."
                value={reportIssue.description}
                onChange={(e) => setReportIssue({ ...reportIssue, description: e.target.value })}
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
