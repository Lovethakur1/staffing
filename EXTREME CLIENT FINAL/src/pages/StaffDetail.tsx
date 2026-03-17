import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Progress } from "../components/ui/progress";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Award,
  FileText,
  Download,
  Upload,
  Edit,
  UserCheck,
  UserX,
  TrendingUp,
  Briefcase,
  Shield,
  Building2,
  Users,
  Send,
  Activity
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner@2.0.3";

interface StaffDetailProps {
  userRole: string;
  userId: string;
  staffId?: string;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive' | 'on-leave';
  location: string;
  hireDate: string;
  hourlyRate: number;
  rating: number;
  eventsCompleted: number;
  hoursWorked: number;
  availability: string[];
  certifications: string[];
  documents: {
    contract: boolean;
    background: boolean;
    i9: boolean;
    w4: boolean;
  };
  performance: {
    punctuality: number;
    professionalism: number;
    quality: number;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  bankInfo: {
    accountHolder: string;
    lastFourDigits: string;
    routingNumber: string;
  };
  taxInfo: {
    ssn: string;
    filingStatus: string;
    allowances: number;
  };
  recentEvents: Array<{
    id: string;
    name: string;
    date: string;
    venue: string;
    hours: number;
    earnings: number;
    rating: number;
  }>;
  payHistory: Array<{
    period: string;
    hours: number;
    grossPay: number;
    netPay: number;
    status: string;
  }>;
  notes: string;
}

export function StaffDetail({ userRole, userId, staffId }: StaffDetailProps) {
  const { setCurrentPage, pageParams } = useNavigation();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);

  // Get staff ID from params if not provided
  const currentStaffId = staffId || pageParams?.staffId;

  // Mock staff data - in real app, this would be fetched based on staffId
  const staffMembers: StaffMember[] = [
    {
      id: "staff-001",
      name: "Emma Williams",
      email: "emma.w@company.com",
      phone: "+1 (555) 123-4567",
      role: "Event Server",
      status: "active",
      location: "New York, NY",
      hireDate: "2023-06-15",
      hourlyRate: 28,
      rating: 4.9,
      eventsCompleted: 145,
      hoursWorked: 1240,
      availability: ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday"],
      certifications: ["Food Handler", "Alcohol Service", "First Aid"],
      documents: {
        contract: true,
        background: true,
        i9: true,
        w4: true
      },
      performance: {
        punctuality: 98,
        professionalism: 96,
        quality: 97
      },
      emergencyContact: {
        name: "John Williams",
        relationship: "Spouse",
        phone: "+1 (555) 123-4568"
      },
      bankInfo: {
        accountHolder: "Emma Williams",
        lastFourDigits: "4523",
        routingNumber: "021000021"
      },
      taxInfo: {
        ssn: "***-**-4523",
        filingStatus: "Married",
        allowances: 2
      },
      recentEvents: [
        { id: "evt-001", name: "Corporate Gala 2024", date: "2024-10-28", venue: "Grand Ballroom", hours: 6.5, earnings: 182, rating: 5 },
        { id: "evt-002", name: "Wedding Reception", date: "2024-10-26", venue: "Rosewood Manor", hours: 7, earnings: 196, rating: 5 },
        { id: "evt-003", name: "Product Launch", date: "2024-10-24", venue: "Innovation Center", hours: 5, earnings: 140, rating: 5 },
        { id: "evt-004", name: "Charity Fundraiser", date: "2024-10-20", venue: "Community Hall", hours: 8, earnings: 224, rating: 4 },
        { id: "evt-005", name: "Conference Dinner", date: "2024-10-18", venue: "Convention Center", hours: 6, earnings: 168, rating: 5 }
      ],
      payHistory: [
        { period: "Oct 22-28, 2024", hours: 42, grossPay: 1176, netPay: 892, status: "Processing" },
        { period: "Oct 15-21, 2024", hours: 38, grossPay: 1064, netPay: 805, status: "Paid" },
        { period: "Oct 8-14, 2024", hours: 45, grossPay: 1260, netPay: 952, status: "Paid" },
        { period: "Oct 1-7, 2024", hours: 40, grossPay: 1120, netPay: 847, status: "Paid" }
      ],
      notes: "Excellent team player with consistent high performance. Preferred for high-profile corporate events."
    },
    {
      id: "staff-002",
      name: "James Rodriguez",
      email: "james.r@company.com",
      phone: "+1 (555) 234-5678",
      role: "Bartender",
      status: "active",
      location: "Los Angeles, CA",
      hireDate: "2023-08-20",
      hourlyRate: 32,
      rating: 4.8,
      eventsCompleted: 128,
      hoursWorked: 1105,
      availability: ["Thursday", "Friday", "Saturday", "Sunday"],
      certifications: ["Mixology", "Alcohol Service", "Food Handler"],
      documents: {
        contract: true,
        background: true,
        i9: true,
        w4: true
      },
      performance: {
        punctuality: 95,
        professionalism: 97,
        quality: 96
      },
      emergencyContact: {
        name: "Maria Rodriguez",
        relationship: "Mother",
        phone: "+1 (555) 234-5679"
      },
      bankInfo: {
        accountHolder: "James Rodriguez",
        lastFourDigits: "8821",
        routingNumber: "122000247"
      },
      taxInfo: {
        ssn: "***-**-8821",
        filingStatus: "Single",
        allowances: 1
      },
      recentEvents: [
        { id: "evt-006", name: "Cocktail Reception", date: "2024-10-27", venue: "Skybar Lounge", hours: 7, earnings: 224, rating: 5 },
        { id: "evt-007", name: "Private Party", date: "2024-10-25", venue: "Beach House", hours: 6, earnings: 192, rating: 5 },
        { id: "evt-008", name: "Corporate Mixer", date: "2024-10-22", venue: "Downtown Loft", hours: 5, earnings: 160, rating: 4 },
        { id: "evt-009", name: "Wedding Bar Service", date: "2024-10-19", venue: "Garden Estate", hours: 8, earnings: 256, rating: 5 }
      ],
      payHistory: [
        { period: "Oct 22-28, 2024", hours: 38, grossPay: 1216, netPay: 921, status: "Processing" },
        { period: "Oct 15-21, 2024", hours: 35, grossPay: 1120, netPay: 848, status: "Paid" },
        { period: "Oct 8-14, 2024", hours: 40, grossPay: 1280, netPay: 969, status: "Paid" }
      ],
      notes: "Expert mixologist with extensive cocktail knowledge. Great for upscale events."
    },
    {
      id: "staff-003",
      name: "Maria Garcia",
      email: "maria.g@company.com",
      phone: "+1 (555) 345-6789",
      role: "Event Coordinator",
      status: "active",
      location: "Chicago, IL",
      hireDate: "2023-03-10",
      hourlyRate: 35,
      rating: 4.9,
      eventsCompleted: 89,
      hoursWorked: 892,
      availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      certifications: ["Event Planning", "Project Management", "First Aid"],
      documents: {
        contract: true,
        background: true,
        i9: true,
        w4: true
      },
      performance: {
        punctuality: 99,
        professionalism: 98,
        quality: 98
      },
      emergencyContact: {
        name: "Carlos Garcia",
        relationship: "Husband",
        phone: "+1 (555) 345-6790"
      },
      bankInfo: {
        accountHolder: "Maria Garcia",
        lastFourDigits: "3309",
        routingNumber: "071000039"
      },
      taxInfo: {
        ssn: "***-**-3309",
        filingStatus: "Married",
        allowances: 3
      },
      recentEvents: [
        { id: "evt-010", name: "Corporate Conference", date: "2024-10-28", venue: "McCormick Center", hours: 10, earnings: 350, rating: 5 },
        { id: "evt-011", name: "Product Launch", date: "2024-10-23", venue: "Tech Hub", hours: 8, earnings: 280, rating: 5 },
        { id: "evt-012", name: "Executive Summit", date: "2024-10-20", venue: "Business Park", hours: 9, earnings: 315, rating: 5 }
      ],
      payHistory: [
        { period: "Oct 22-28, 2024", hours: 45, grossPay: 1575, netPay: 1193, status: "Processing" },
        { period: "Oct 15-21, 2024", hours: 42, grossPay: 1470, netPay: 1113, status: "Paid" }
      ],
      notes: "Outstanding organizational skills and client management. Highly recommended for complex events."
    }
  ];

  const staff = staffMembers.find(s => s.id === currentStaffId) || staffMembers[0];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700"><UserCheck className="h-3 w-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-700"><UserX className="h-3 w-3 mr-1" />Inactive</Badge>;
      case 'on-leave':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />On Leave</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage('staff')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {staff.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold">{staff.name}</h1>
                {getStatusBadge(staff.status)}
              </div>
              <p className="text-muted-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {staff.role}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                Hired on {new Date(staff.hireDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowNotesDialog(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Notes
          </Button>
          <Button variant="outline" onClick={() => toast.info("Sending message to " + staff.name)}>
            <Send className="h-4 w-4 mr-2" />
            Message
          </Button>
          <Button onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hourly Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${staff.hourlyRate}</div>
            <p className="text-xs text-muted-foreground">Per hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              {staff.rating}
            </div>
            <p className="text-xs text-success">Excellent rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.eventsCompleted}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.hoursWorked}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(staff.hoursWorked * staff.hourlyRate).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours/Week</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(staff.hoursWorked / ((new Date().getTime() - new Date(staff.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 7))).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Per week</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="schedule">Schedule & Availability</TabsTrigger>
          <TabsTrigger value="events">Event History</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{staff.email}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{staff.phone}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Location</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{staff.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Name</Label>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{staff.emergencyContact.name}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Relationship</Label>
                  <span>{staff.emergencyContact.relationship}</span>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{staff.emergencyContact.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Banking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Account Holder</Label>
                  <span>{staff.bankInfo.accountHolder}</span>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Account Number</Label>
                  <span>****{staff.bankInfo.lastFourDigits}</span>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Routing Number</Label>
                  <span>{staff.bankInfo.routingNumber}</span>
                </div>
              </CardContent>
            </Card>

            {/* Tax Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Tax Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">SSN</Label>
                  <span>{staff.taxInfo.ssn}</span>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Filing Status</Label>
                  <span>{staff.taxInfo.filingStatus}</span>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Allowances</Label>
                  <span>{staff.taxInfo.allowances}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certifications & Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {staff.certifications.map((cert, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                    <Award className="h-3 w-3 mr-1" />
                    {cert}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Based on {staff.eventsCompleted} completed events
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Punctuality</Label>
                    <span className="text-sm font-semibold">{staff.performance.punctuality}%</span>
                  </div>
                  <Progress value={staff.performance.punctuality} className="h-3" />
                  <p className="text-xs text-muted-foreground">
                    On-time arrivals and professional time management
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Professionalism</Label>
                    <span className="text-sm font-semibold">{staff.performance.professionalism}%</span>
                  </div>
                  <Progress value={staff.performance.professionalism} className="h-3" />
                  <p className="text-xs text-muted-foreground">
                    Attitude, appearance, and client interaction
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Quality of Work</Label>
                    <span className="text-sm font-semibold">{staff.performance.quality}%</span>
                  </div>
                  <Progress value={staff.performance.quality} className="h-3" />
                  <p className="text-xs text-muted-foreground">
                    Task completion and service excellence
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overall Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-6xl font-bold flex items-center justify-center gap-2 mb-4">
                    <Star className="h-12 w-12 fill-yellow-400 text-yellow-400" />
                    {staff.rating}
                  </div>
                  <p className="text-muted-foreground mb-6">Out of 5.0</p>
                  <div className="flex justify-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-8 w-8 ${
                          star <= Math.floor(staff.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <Badge variant="default" className="text-sm">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Top Performer
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Work Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{staff.eventsCompleted}</p>
                  <p className="text-sm text-muted-foreground">Events Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{staff.hoursWorked}</p>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {Math.floor((new Date().getTime() - new Date(staff.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 30))}
                  </p>
                  <p className="text-sm text-muted-foreground">Months Employed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    ${(staff.hoursWorked * staff.hourlyRate).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule & Availability Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Weekly Availability</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Days available for scheduling
                  </p>
                </div>
                <Button onClick={() => setShowScheduleDialog(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div
                    key={day}
                    className={`p-4 rounded-lg border-2 text-center ${
                      staff.availability.includes(day)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <p className="font-semibold text-sm">{day.slice(0, 3)}</p>
                    <p className="text-xs mt-1">
                      {staff.availability.includes(day) ? (
                        <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400 mx-auto" />
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Event History Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest {staff.recentEvents.length} events worked
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.recentEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                      <TableCell>{event.venue}</TableCell>
                      <TableCell>{event.hours}h</TableCell>
                      <TableCell className="font-semibold">${event.earnings}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{event.rating}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pay History</CardTitle>
              <p className="text-sm text-muted-foreground">
                Recent pay periods and earnings
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pay Period</TableHead>
                    <TableHead>Hours Worked</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.payHistory.map((pay, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{pay.period}</TableCell>
                      <TableCell>{pay.hours}h</TableCell>
                      <TableCell>${pay.grossPay.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">${pay.netPay.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={pay.status === 'Paid' ? 'default' : 'secondary'}>
                          {pay.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Status</CardTitle>
              <p className="text-sm text-muted-foreground">
                Required documentation and certifications
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {staff.documents.contract ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">Employment Contract</p>
                      <p className="text-sm text-muted-foreground">
                        {staff.documents.contract ? 'Signed and stored' : 'Pending signature'}
                      </p>
                    </div>
                  </div>
                  {staff.documents.contract && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {staff.documents.background ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">Background Check</p>
                      <p className="text-sm text-muted-foreground">
                        {staff.documents.background ? 'Completed and passed' : 'In progress'}
                      </p>
                    </div>
                  </div>
                  {staff.documents.background && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {staff.documents.i9 ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">I-9 Form</p>
                      <p className="text-sm text-muted-foreground">
                        {staff.documents.i9 ? 'Completed and verified' : 'Pending completion'}
                      </p>
                    </div>
                  </div>
                  {staff.documents.i9 && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {staff.documents.w4 ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">W-4 Tax Form</p>
                      <p className="text-sm text-muted-foreground">
                        {staff.documents.w4 ? 'On file' : 'Missing - needs upload'}
                      </p>
                    </div>
                  </div>
                  {staff.documents.w4 ? (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Staff Profile</DialogTitle>
            <DialogDescription>
              Update {staff.name}'s information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={staff.email} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input defaultValue={staff.phone} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hourly Rate</Label>
                <Input type="number" defaultValue={staff.hourlyRate} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success("Profile updated successfully!");
                setShowEditDialog(false);
              }}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Availability</DialogTitle>
            <DialogDescription>
              Modify {staff.name}'s weekly availability
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day}`}
                  defaultChecked={staff.availability.includes(day)}
                />
                <label htmlFor={`day-${day}`} className="text-sm font-medium">
                  {day}
                </label>
              </div>
            ))}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success("Availability updated!");
                setShowScheduleDialog(false);
              }}>
                Update Availability
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Staff Notes</DialogTitle>
            <DialogDescription>
              Internal notes about {staff.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Add notes about this staff member..."
              rows={6}
              defaultValue={staff.notes}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowNotesDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success("Notes saved!");
                setShowNotesDialog(false);
              }}>
                Save Notes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
