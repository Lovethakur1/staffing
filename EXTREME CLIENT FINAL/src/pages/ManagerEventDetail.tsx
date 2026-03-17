import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  CheckCircle,
  AlertTriangle,
  Radio,
  Star,
  UserCheck,
  UserX,
  MessageSquare,
  FileText,
  Send,
  Navigation,
  Building2,
  AlertCircle,
  TrendingUp,
  ClipboardCheck,
  Camera,
  Upload
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner@2.0.3";

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
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [issueDescription, setIssueDescription] = useState("");
  const [staffRatings, setStaffRatings] = useState({
    punctuality: 5,
    quality: 5,
    professionalism: 5
  });

  const currentEventId = eventId || pageParams?.eventId;

  // Mock event data
  const event = {
    id: currentEventId || "evt-001",
    title: "Corporate Gala - Tech Summit 2025",
    client: "Innovate Corp",
    clientContact: {
      name: "John Smith",
      email: "john.smith@innovatecorp.com",
      phone: "+1 (555) 100-2000"
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

  const staffMembers: StaffMember[] = [
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

  const reportIssue = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setShowIssueDialog(true);
  };

  const submitIssue = () => {
    toast.success(`Issue reported for ${selectedStaff?.name}`);
    setShowIssueDialog(false);
    setIssueDescription("");
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

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage('manager')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
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
          <Button variant="outline" onClick={() => toast.info("Opening messages...")}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat with Admin
          </Button>
          <Button onClick={() => toast.info("Downloading event report...")}>
            <FileText className="h-4 w-4 mr-2" />
            Event Report
          </Button>
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

      {/* Staff Management Tabs */}
      <Tabs defaultValue="roster" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roster">Staff Roster</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>

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
                            <Button
                              size="sm"
                              onClick={() => handleCheckIn(staff)}
                            >
                              Check In
                            </Button>
                          )}
                          {staff.status === 'checked-in' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCheckOut(staff)}
                              >
                                Check Out
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRatingDialog(staff)}
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => reportIssue(staff)}
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
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
    </div>
  );
}
