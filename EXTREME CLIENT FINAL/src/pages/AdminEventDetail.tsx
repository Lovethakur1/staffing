import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  MessageSquare,
  FileText,
  Activity,
  TrendingUp,
  Shield,
  Download,
  Send,
  Edit,
  MoreVertical,
  ArrowLeft,
  Briefcase,
  CreditCard,
  UserCheck,
  AlertCircle,
  Timer,
  ChevronRight
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";

export function AdminEventDetail() {
  const { setCurrentPage } = useNavigation();

  // Mock event data - in real app this would come from route params/state
  const event = {
    id: 'evt-001',
    name: 'Wedding Reception - Johnson',
    client: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      company: 'Personal Event',
      rating: 4.8,
      totalEvents: 3
    },
    status: 'in-progress',
    date: 'October 15, 2025',
    startTime: '6:00 PM',
    endTime: '11:00 PM',
    duration: '5 hours',
    location: 'Grand Hotel Ballroom',
    address: '123 Main Street, Downtown, CA 90210',
    type: 'Wedding',
    attendees: 150,
    description: 'Elegant wedding reception with formal dinner service, open bar, and dancing.',
    totalBudget: 8500,
    paidAmount: 6000,
    pendingAmount: 2500,
    paymentStatus: 'partial',
    staffRequired: 12,
    staffAssigned: 11,
    staffCheckedIn: 9,
    specialRequirements: [
      'Formal attire required',
      'Wine service certification preferred',
      'Late night availability'
    ]
  };

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

  return (
    <div className="h-full overflow-auto">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Button 
            variant="ghost" 
            className="w-fit"
            onClick={() => setCurrentPage('dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl">{event.name}</h1>
                <Badge className={
                  event.status === 'in-progress' ? 'bg-primary' :
                  event.status === 'completed' ? 'bg-green-600' :
                  'bg-gray-600'
                }>
                  {event.status === 'in-progress' ? 'In Progress' :
                   event.status === 'completed' ? 'Completed' :
                   'Upcoming'}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{event.startTime} - {event.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Event
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

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
                    <Button size="sm" variant="outline">
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

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">Payment Status</p>
                  <p className="text-2xl">${(event.paidAmount / 1000).toFixed(1)}k</p>
                </div>
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
              <Progress value={(event.paidAmount / event.totalBudget) * 100} className="mt-3" />
              <p className="text-muted-foreground mt-2">${event.pendingAmount} pending</p>
            </CardContent>
          </Card>

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
                  <p className="text-2xl">{event.client.rating} ⭐</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-muted-foreground mt-3">{event.client.totalEvents} total events</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="staff">Staff Details</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
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
                        {event.client.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{event.client.name}</p>
                      <p className="text-muted-foreground">{event.client.company}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{event.client.rating}</span>
                        <span className="text-muted-foreground">({event.client.totalEvents} events)</span>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${event.client.email}`} className="text-primary hover:underline">
                        {event.client.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${event.client.phone}`} className="text-primary hover:underline">
                        {event.client.phone}
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Assigned Staff ({staffMembers.length})</CardTitle>
                  <Button variant="outline" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Add Staff
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {staffMembers.map((staff) => (
                    <div key={staff.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {staff.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{staff.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {staff.role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${staff.hourlyRate}/hr
                            </span>
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
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(staff.status)}>
                          {getStatusIcon(staff.status)}
                          <span className="ml-1">
                            {staff.status === 'checked-in' ? 'Checked In' :
                             staff.status === 'not-arrived' ? 'Not Arrived' :
                             'Not Assigned'}
                          </span>
                        </Badge>
                        {staff.status === 'not-arrived' && (
                          <Button size="sm" variant="destructive">
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
                    <p className="text-2xl font-medium">${event.totalBudget.toLocaleString()}</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-green-50">
                    <p className="text-muted-foreground mb-1">Paid Amount</p>
                    <p className="text-2xl font-medium text-green-700">${event.paidAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-yellow-50">
                    <p className="text-muted-foreground mb-1">Pending Amount</p>
                    <p className="text-2xl font-medium text-yellow-700">${event.pendingAmount.toLocaleString()}</p>
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Client Feedback & Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h4 className="font-medium mb-2">No Feedback Yet</h4>
                  <p className="text-muted-foreground mb-4">
                    {clientFeedback.status}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Feedback and ratings will appear here after the event is completed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
