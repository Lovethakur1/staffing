import { useNavigation } from "../contexts/NavigationContext";
import { eventData, type EventData } from "../data/eventData";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { 
  ArrowLeft, Calendar, Clock, MapPin, Download, Edit, MoreVertical, 
  AlertTriangle, Phone, Send, UserCheck, CreditCard, Activity, Star,
  Briefcase, ChevronRight, Users, Mail, DollarSign, Timer, Shield,
  CheckCircle, XCircle, AlertCircle, Ban, Search, Filter, X, CalendarClock,
  Coffee
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { toast } from "sonner@2.0.3";
import { RescheduleEventDialog, type RescheduleData } from "../components/dialogs/RescheduleEventDialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "../components/ui/dropdown-menu";

interface AdminEventDetailProps {
  userRole?: string;
}

export function AdminEventDetail({ userRole = 'admin' }: AdminEventDetailProps) {
  const { pageParams, goBack, setCurrentPage } = useNavigation();
  
  // Check if user is Admin - ONLY admins can see financial data
  const isAdmin = userRole.toLowerCase() === 'admin';
  
  // Get event from centralized data using pageParams
  const eventId = pageParams?.eventId || 'evt-001';
  const eventDetails = eventData.find(e => e.id === eventId);
  
  // Fallback to first event if not found
  const event = eventDetails || eventData[0];

  // Reschedule dialog state
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  
  const handleViewStaffDetail = (staff: any) => {
    setCurrentPage('event-staff-detail', { staffId: staff.id, eventId: event.id });
  };

  const handleRescheduleSubmit = (data: RescheduleData) => {
    // In a real app, this would update the backend
    console.log('Reschedule data:', data);
    setRescheduleDialogOpen(false);
  };

  // Mock staff data - in real app this would be fetched based on event.staffAssigned
  const staffMembers = [
    {
      id: 's1',
      name: 'Sarah Martinez',
      role: 'Bartender',
      avatar: 'SM',
      status: 'not-arrived',
      checkInTime: null,
      hourlyRate: 28,
      hoursWorked: 0,
      rating: 4.9,
      phone: '+1 (555) 234-5678',
      certifications: ['Mixology', 'Responsible Beverage Service']
    },
    {
      id: 's2',
      name: 'Michael Chen',
      role: 'Head Server',
      avatar: 'MC',
      status: 'checked-in',
      checkInTime: '5:45 PM',
      hourlyRate: 32,
      hoursWorked: 2.5,
      rating: 4.8,
      phone: '+1 (555) 345-6789',
      certifications: ['Food Handler', 'Wine Sommelier']
    },
    {
      id: 's3',
      name: 'Emma Davis',
      role: 'Server',
      avatar: 'ED',
      status: 'checked-in',
      checkInTime: '5:50 PM',
      hourlyRate: 25,
      hoursWorked: 2.3,
      rating: 4.7,
      phone: '+1 (555) 456-7890',
      certifications: ['Food Handler']
    },
    {
      id: 's4',
      name: 'James Wilson',
      role: 'Server',
      avatar: 'JW',
      status: 'checked-in',
      checkInTime: '5:55 PM',
      hourlyRate: 25,
      hoursWorked: 2.2,
      rating: 4.6,
      phone: '+1 (555) 567-8901',
      certifications: ['Food Handler']
    },
    {
      id: 's5',
      name: 'Lisa Anderson',
      role: 'Bartender',
      avatar: 'LA',
      status: 'checked-in',
      checkInTime: '5:48 PM',
      hourlyRate: 28,
      hoursWorked: 2.4,
      rating: 4.9,
      phone: '+1 (555) 678-9012',
      certifications: ['Mixology', 'Responsible Beverage Service']
    },
    {
      id: 's6',
      name: 'David Brown',
      role: 'Server',
      avatar: 'DB',
      status: 'checked-in',
      checkInTime: '6:00 PM',
      hourlyRate: 25,
      hoursWorked: 2.1,
      rating: 4.5,
      phone: '+1 (555) 789-0123',
      certifications: ['Food Handler']
    },
    {
      id: 's7',
      name: 'Amy Taylor',
      role: 'Server',
      avatar: 'AT',
      status: 'checked-in',
      checkInTime: '5:52 PM',
      hourlyRate: 25,
      hoursWorked: 2.3,
      rating: 4.8,
      phone: '+1 (555) 890-1234',
      certifications: ['Food Handler', 'Allergen Awareness']
    },
    {
      id: 's8',
      name: 'Robert Garcia',
      role: 'Busser',
      avatar: 'RG',
      status: 'checked-in',
      checkInTime: '5:58 PM',
      hourlyRate: 20,
      hoursWorked: 2.1,
      rating: 4.6,
      phone: '+1 (555) 901-2345',
      certifications: ['Food Handler']
    },
    {
      id: 's9',
      name: 'Jennifer Lee',
      role: 'Busser',
      avatar: 'JL',
      status: 'checked-in',
      checkInTime: '5:55 PM',
      hourlyRate: 20,
      hoursWorked: 2.2,
      rating: 4.7,
      phone: '+1 (555) 012-3456',
      certifications: ['Food Handler']
    },
    {
      id: 's10',
      name: 'Thomas Moore',
      role: 'Event Coordinator',
      avatar: 'TM',
      status: 'checked-in',
      checkInTime: '5:30 PM',
      hourlyRate: 35,
      hoursWorked: 2.6,
      rating: 4.9,
      phone: '+1 (555) 123-4567',
      certifications: ['Event Management', 'Safety Coordinator']
    },
    {
      id: 's11',
      name: 'Maria Rodriguez',
      role: 'Server',
      avatar: 'MR',
      status: 'not-assigned',
      checkInTime: null,
      hourlyRate: 25,
      hoursWorked: 0,
      rating: 4.8,
      phone: '+1 (555) 234-5678',
      certifications: ['Food Handler']
    }
  ];

  // Mock Excluded Staff for this client
  const clientExcludedStaff = [
    { id: 'staff-101', name: 'John Smith', role: 'Server', reason: 'Unprofessional conduct' },
    { id: 'staff-105', name: 'Alice Cooper', role: 'Bartender', reason: 'Late arrival' },
    // Adding one simulated conflict for demo purposes if needed, 
    // but sticking to IDs not in the active list for clean state by default
  ];

  const eventTimeline = [
    { time: '5:30 PM', event: 'Event coordinator checked in', status: 'completed', user: 'Thomas Moore' },
    { time: '5:45 PM', event: 'Head server checked in', status: 'completed', user: 'Michael Chen' },
    { time: '5:48 PM', event: 'Bartender checked in', status: 'completed', user: 'Lisa Anderson' },
    { time: '5:50 PM', event: 'Server checked in', status: 'completed', user: 'Emma Davis' },
    { time: '6:00 PM', event: 'Event started', status: 'completed', user: 'System' },
    { time: '6:15 PM', event: 'Sarah Martinez (Bartender) - Not arrived (ALERT)', status: 'alert', user: 'System' },
    { time: '7:00 PM', event: 'Dinner service begins (scheduled)', status: 'upcoming', user: 'System' },
    { time: '9:00 PM', event: 'Dancing & bar service (scheduled)', status: 'upcoming', user: 'System' },
    { time: '11:00 PM', event: 'Event end (scheduled)', status: 'upcoming', user: 'System' }
  ];

  const paymentHistory = [
    { id: 1, date: 'Sep 15, 2025', description: 'Initial Deposit', amount: 3000, status: 'completed', method: 'Credit Card' },
    { id: 2, date: 'Oct 1, 2025', description: 'Second Payment', amount: 3000, status: 'completed', method: 'Bank Transfer' },
    { id: 3, date: 'Oct 15, 2025', description: 'Final Payment (Due)', amount: 2500, status: 'pending', method: 'Credit Card' }
  ];

  const clientFeedback = {
    rating: null,
    review: null,
    status: 'Event in progress - feedback pending'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked-in':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'not-arrived':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'not-assigned':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checked-in':
        return <CheckCircle className="w-4 h-4" />;
      case 'not-arrived':
        return <AlertTriangle className="w-4 h-4" />;
      case 'not-assigned':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredStaff = staffMembers.filter(staff => {
    const nameMatch = staff.name.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === 'all' || staff.status === filterStatus;
    return nameMatch && statusMatch;
  });

  // Add Staff Dialog State
  const [addStaffDialogOpen, setAddStaffDialogOpen] = useState(false);
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  // Available staff pool (not currently assigned to this event)
  const availableStaffPool = [
    {
      id: 'staff-201',
      name: 'Christopher Miller',
      role: 'Bartender',
      avatar: 'CM',
      hourlyRate: 30,
      rating: 4.9,
      certifications: ['Mixology', 'Responsible Beverage Service', 'Wine Sommelier'],
      availability: 'Available',
      experience: '5 years',
      totalEvents: 142
    },
    {
      id: 'staff-202',
      name: 'Patricia Johnson',
      role: 'Server',
      avatar: 'PJ',
      hourlyRate: 26,
      rating: 4.8,
      certifications: ['Food Handler', 'Allergen Awareness'],
      availability: 'Available',
      experience: '3 years',
      totalEvents: 98
    },
    {
      id: 'staff-203',
      name: 'Daniel White',
      role: 'Head Server',
      avatar: 'DW',
      hourlyRate: 33,
      rating: 4.9,
      certifications: ['Food Handler', 'Wine Sommelier', 'Leadership'],
      availability: 'Available',
      experience: '7 years',
      totalEvents: 215
    },
    {
      id: 'staff-204',
      name: 'Sandra Martinez',
      role: 'Busser',
      avatar: 'SM',
      hourlyRate: 22,
      rating: 4.7,
      certifications: ['Food Handler'],
      availability: 'Available',
      experience: '2 years',
      totalEvents: 67
    },
    {
      id: 'staff-205',
      name: 'Kevin Anderson',
      role: 'Bartender',
      avatar: 'KA',
      hourlyRate: 29,
      rating: 4.8,
      certifications: ['Mixology', 'Responsible Beverage Service'],
      availability: 'Available',
      experience: '4 years',
      totalEvents: 128
    },
    {
      id: 'staff-206',
      name: 'Nancy Thompson',
      role: 'Server',
      avatar: 'NT',
      hourlyRate: 25,
      rating: 4.6,
      certifications: ['Food Handler'],
      availability: 'Available',
      experience: '2 years',
      totalEvents: 54
    },
    {
      id: 'staff-207',
      name: 'Brian Harris',
      role: 'Event Coordinator',
      avatar: 'BH',
      hourlyRate: 37,
      rating: 4.9,
      certifications: ['Event Management', 'Safety Coordinator', 'First Aid'],
      availability: 'Available',
      experience: '8 years',
      totalEvents: 189
    },
    {
      id: 'staff-208',
      name: 'Michelle Clark',
      role: 'Server',
      avatar: 'MC',
      hourlyRate: 26,
      rating: 4.7,
      certifications: ['Food Handler', 'Wine Sommelier'],
      availability: 'Available',
      experience: '3 years',
      totalEvents: 81
    }
  ];

  // Filter available staff
  const filteredAvailableStaff = availableStaffPool.filter(staff => {
    const nameMatch = staff.name.toLowerCase().includes(staffSearchTerm.toLowerCase());
    const roleMatch = selectedRole === 'all' || staff.role === selectedRole;
    // Exclude staff that are on the client's exclusion list
    const notExcluded = !clientExcludedStaff.some(excluded => excluded.id === staff.id);
    return nameMatch && roleMatch && notExcluded;
  });

  // Get unique roles for filter
  const uniqueRoles = ['all', ...Array.from(new Set(availableStaffPool.map(s => s.role)))];

  const handleAddStaff = (staff: any) => {
    toast.success(`${staff.name} has been assigned to ${event.name}`, {
      description: `Role: ${staff.role} | Rate: $${staff.hourlyRate}/hr`
    });
    setAddStaffDialogOpen(false);
    setStaffSearchTerm('');
    setSelectedRole('all');
  };

  return (
    <div className="h-full overflow-auto">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Button 
            variant="ghost" 
            className="w-fit"
            onClick={goBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl font-bold truncate">{event.name}</h1>
                <Badge className={`w-fit ${
                  event.status === 'in-progress' ? 'bg-primary' :
                  event.status === 'completed' ? 'bg-green-600' :
                  event.status === 'cancelled' ? 'bg-destructive' :
                  event.status === 'postponed' ? 'bg-amber-600' :
                  'bg-gray-600'
                }`}>
                  {event.status === 'in-progress' ? 'In Progress' :
                   event.status === 'completed' ? 'Completed' :
                   event.status === 'cancelled' ? 'Cancelled' :
                   event.status === 'postponed' ? 'Postponed' :
                   'Upcoming'}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>{event.startTime} - {event.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="truncate max-w-[200px]">{event.location}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm" onClick={() => setRescheduleDialogOpen(true)} className="flex-1 sm:flex-none">
                <CalendarClock className="w-4 h-4 mr-2" />
                <span className="sm:hidden">Reschedule</span>
                <span className="hidden sm:inline">Reschedule Event</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Edit className="w-4 h-4 mr-2" />
                <span className="sm:hidden">Edit</span>
                <span className="hidden sm:inline">Edit Event</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="sm:hidden">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRescheduleDialogOpen(true)}>
                    <CalendarClock className="w-4 h-4 mr-2" />
                    Reschedule Event
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Postponed Alert */}
        {event.status === 'postponed' && (
          <Card className="border-amber-500/50 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-amber-800 mb-1">Event Postponed</h3>
                  <p className="text-amber-700 mb-3">
                    This event has been postponed. {event.postponementReason && `Reason: ${event.postponementReason}`}
                  </p>
                  {event.originalDate && (
                     <p className="text-sm text-amber-600">Original Date: {event.originalDate}</p>
                  )}
                  <div className="mt-3">
                     <Button size="sm" variant="outline" className="border-amber-200 hover:bg-amber-100 text-amber-800" onClick={() => setRescheduleDialogOpen(true)}>
                       Set New Date
                     </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cancelled Alert */}
        {event.status === 'cancelled' && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-destructive mb-1">Event Cancelled</h3>
                  <p className="text-muted-foreground mb-3">
                    This event has been cancelled and is no longer active.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Critical Alerts */}
        {staffMembers.filter(s => s.status === 'not-arrived').length > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-destructive mb-1">Critical Alert: Staff Not Arrived</h3>
                  <p className="text-muted-foreground mb-3">
                    {staffMembers.filter(s => s.status === 'not-arrived').length} staff member(s) have not checked in yet. Event started 15 minutes ago.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="destructive">
                      <Phone className="w-4 h-4 mr-2" />
                      Contact Staff
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setAddStaffDialogOpen(true)}>
                      Find Replacement
                    </Button>
                    <Button size="sm" variant="outline">
                      <Send className="w-4 h-4 mr-2" />
                      Notify Client
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">Staff Check-in</p>
                  <p className="text-2xl">{event.staffCheckedIn}/{event.staffAssigned}</p>
                </div>
                <UserCheck className="w-8 h-8 text-primary" />
              </div>
              <Progress value={(event.staffCheckedIn / event.staffAssigned) * 100} className="mt-3" />
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground mb-1">Payment Status</p>
                    <p className="text-2xl">${(event.paidAmount / 1000).toFixed(1)}k</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-green-600" />
                </div>
                <Progress value={(event.paidAmount / event.budget) * 100} className="mt-3" />
                <p className="text-muted-foreground mt-2">${event.pendingAmount} pending</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">Event Progress</p>
                  <p className="text-2xl">42%</p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
              <Progress value={42} className="mt-3" />
              <p className="text-muted-foreground mt-2">2h 30m elapsed</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">Client Rating</p>
                  <p className="text-2xl">{event.clientRating} ⭐</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-muted-foreground mt-3">{event.clientTotalEvents} total events</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="staff">Staff Details</TabsTrigger>
            {isAdmin && <TabsTrigger value="payments">Payments</TabsTrigger>}
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="feedback">Client Feedback</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-muted-foreground mb-1">Event Type</p>
                    <p className="font-medium">{event.type}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground mb-1">Location</p>
                    <p className="font-medium">{event.location}</p>
                    <p className="text-muted-foreground">{event.address}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground mb-1">Expected Attendees</p>
                    <p className="font-medium">{event.attendees} guests</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground mb-1">Duration</p>
                    <p className="font-medium">{event.duration}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground mb-2">Special Requirements</p>
                    <div className="space-y-1">
                      {event.specialRequirements.map((req, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm">{req}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{event.description}</p>
                  </div>
                  {event.hasBreaks && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-muted-foreground mb-2">Staff Break Policy</p>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Coffee className="w-4 h-4 text-blue-700" />
                            <span className="font-medium text-blue-900">Breaks Enabled</span>
                          </div>
                          <div className="space-y-1 text-sm text-blue-800">
                            <p>• Number of Breaks: <span className="font-medium">{event.breakCount}</span></p>
                            <p>• Duration per Break: <span className="font-medium">{event.breakDuration} minutes</span></p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {event.client.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{event.client}</p>
                      <p className="text-muted-foreground">{event.clientCompany}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{event.clientRating}</span>
                        <span className="text-muted-foreground">({event.clientTotalEvents} events)</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Excluded Staff Alert in Overview */}
                  {clientExcludedStaff.length > 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-md p-3">
                      <div className="flex items-start gap-2">
                        <Ban className="w-4 h-4 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800">Excluded Staff Alert</p>
                          <p className="text-xs text-red-600 mt-1">
                            This client has {clientExcludedStaff.length} staff members on their exclusion list.
                            Do not assign: {clientExcludedStaff.map(s => s.name).join(", ")}.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${event.clientEmail}`} className="text-primary hover:underline">
                        {event.clientEmail}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${event.clientPhone}`} className="text-primary hover:underline">
                        {event.clientPhone}
                      </a>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Client
                    </Button>
                    <Button variant="outline" className="flex-1" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Staff Details Tab */}
          <TabsContent value="staff" className="space-y-4">
            {/* Excluded Staff Card */}
            {clientExcludedStaff.length > 0 && (
              <Card className="border-red-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                    <Ban className="w-4 h-4" />
                    Client Restrictions: Excluded Staff
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-3">
                    The following staff members should NOT be assigned to this event per client request.
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {clientExcludedStaff.map(staff => (
                      <Badge key={staff.id} variant="outline" className="border-red-200 bg-red-50 text-red-700 gap-1 pl-1 pr-2 py-1">
                        <XCircle className="w-3 h-3" />
                        {staff.name} ({staff.role})
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Assigned Staff ({staffMembers.length})</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setAddStaffDialogOpen(true)}>
                    <Users className="w-4 h-4 mr-2" />
                    Add Staff
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredStaff.map((staff) => (
                    <div 
                        key={staff.id} 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                        onClick={() => handleViewStaffDetail(staff)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {staff.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium group-hover:text-primary transition-colors">{staff.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {staff.role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {isAdmin && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${staff.hourlyRate}/hr
                              </span>
                            )}
                            {staff.checkInTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                In: {staff.checkInTime}
                              </span>
                            )}
                            {staff.hoursWorked > 0 && (
                              <span className="flex items-center gap-1">
                                <Timer className="w-3 h-3" />
                                {staff.hoursWorked}h worked
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {staff.rating}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {staff.certifications.map((cert, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(staff.status)}>
                          {getStatusIcon(staff.status)}
                          <span className="ml-1">
                            {staff.status === 'checked-in' ? 'Checked In' :
                             staff.status === 'not-arrived' ? 'Not Arrived' :
                             'Not Assigned'}
                          </span>
                        </Badge>
                        
                        <Button variant="ghost" size="sm" className="hidden group-hover:flex">
                             View Details <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>

                        {staff.status === 'not-arrived' && (
                          <Button size="sm" variant="destructive" onClick={(e) => {
                              e.stopPropagation(); // Prevent opening detail view
                              // Call logic
                          }}>
                            <Phone className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-muted-foreground mb-1">Total Budget</p>
                      <p className="text-2xl font-medium">${event.budget?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-green-50">
                      <p className="text-muted-foreground mb-1">Paid Amount</p>
                      <p className="text-2xl font-medium text-green-700">${event.paidAmount?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-yellow-50">
                      <p className="text-muted-foreground mb-1">Pending Amount</p>
                      <p className="text-2xl font-medium text-yellow-700">${event.pendingAmount?.toLocaleString() || '0'}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment History */}
                  <div>
                    <h4 className="font-medium mb-3">Payment History</h4>
                    <div className="space-y-2">
                      {paymentHistory.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{payment.description}</p>
                              <Badge className={
                                payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                'bg-yellow-100 text-yellow-700'
                              }>
                                {payment.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{payment.date}</span>
                              <span>{payment.method}</span>
                            </div>
                          </div>
                          <p className="text-lg font-medium">${payment.amount.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Process Payment
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Event Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventTimeline.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          item.status === 'completed' ? 'bg-green-100' :
                          item.status === 'alert' ? 'bg-red-100' :
                          'bg-gray-100'
                        }`}>
                          {item.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-green-700" />
                          ) : item.status === 'alert' ? (
                            <AlertCircle className="w-4 h-4 text-red-700" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-700" />
                          )}
                        </div>
                        {idx < eventTimeline.length - 1 && (
                          <div className="w-0.5 h-12 bg-border"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{item.event}</p>
                          <p className="text-muted-foreground">{item.time}</p>
                        </div>
                        <p className="text-muted-foreground">{item.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-4">
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Feedback Pending</h3>
                <p className="text-muted-foreground max-w-sm mb-6">
                  The client hasn't provided feedback for this event yet. Feedback is typically collected after the event concludes.
                </p>
                <Button variant="outline">
                  <Send className="w-4 h-4 mr-2" />
                  Request Feedback
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={addStaffDialogOpen} onOpenChange={setAddStaffDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>Add Staff to {event.name}</DialogTitle>
            <DialogDescription>
              Select staff members from the available pool to assign to this event.
            </DialogDescription>
          </DialogHeader>
          
          {/* Fixed Search/Filter Section */}
          <div className="px-6 space-y-3 py-4 border-b bg-muted/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search staff by name..."
                value={staffSearchTerm}
                onChange={(e) => setStaffSearchTerm(e.target.value)}
                className="pl-9"
              />
              {staffSearchTerm && (
                <button
                  onClick={() => setStaffSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full h-10 pl-9 pr-4 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>
                    {role === 'all' ? 'All Roles' : role}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Results Counter */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredAvailableStaff.length} of {availableStaffPool.length} available staff
            </div>
          </div>
          
          {/* Scrollable Staff List */}
          <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(90vh - 280px)' }}>
            {filteredAvailableStaff.length > 0 ? (
              <div className="space-y-3">
                {filteredAvailableStaff.map(staff => (
                  <div key={staff.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {staff.avatar}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{staff.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {staff.role}
                            </Badge>
                            {isAdmin && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${staff.hourlyRate}/hr
                              </span>
                            )}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleAddStaff(staff)}
                          className="shrink-0"
                        >
                          Add
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {staff.rating}
                        </span>
                        <span>{staff.experience}</span>
                        <span>{staff.totalEvents} events</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {staff.certifications.slice(0, 2).map((cert, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs py-0">
                            {cert}
                          </Badge>
                        ))}
                        {staff.certifications.length > 2 && (
                          <Badge variant="secondary" className="text-xs py-0">
                            +{staff.certifications.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">No Staff Found</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Try adjusting your search or filter criteria to find available staff members.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reschedule Event Dialog */}
      <RescheduleEventDialog
        open={rescheduleDialogOpen}
        onOpenChange={setRescheduleDialogOpen}
        eventName={event.name}
        eventId={event.id}
        currentDate={event.date}
        currentStartTime={event.startTime}
        currentEndTime={event.endTime}
        onReschedule={handleRescheduleSubmit}
      />
    </div>
  );
}