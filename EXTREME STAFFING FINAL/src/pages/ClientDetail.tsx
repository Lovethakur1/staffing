import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Progress } from "../components/ui/progress";
import { IconTooltip } from "../components/ui/tooltip-wrapper";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Pagination } from "../components/Pagination";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Users,
  Receipt,
  MessageSquare,
  Edit,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Download,
  Send,
  Award,
  Briefcase,
  Heart,
  CreditCard,
  Activity,
  Search,
  Filter,
  Ban,
  Trash2,
  Plus
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";

interface ClientDetailProps {
  userRole: string;
  userId: string;
  clientId?: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  rating: number;
  eventsWorked: number;
}

interface BlockedStaffMember {
  id: string;
  name: string;
  role: string;
  reason: string;
  dateBlocked: string;
}

interface EventAssignment {
  eventId: string;
  eventName: string;
  date: string;
  staffAssigned: StaffMember[];
}

interface Feedback {
  id: string;
  eventName: string;
  date: string;
  rating: number;
  comment: string;
  category: string;
}

export function ClientDetail({ userRole, userId, clientId = "client-1" }: ClientDetailProps) {
  const { setCurrentPage, setPageParams, goBack } = useNavigation();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock client data - in real app, fetch based on clientId
  const client = {
    id: clientId,
    name: "Sarah Johnson",
    company: "EventCorp Inc.",
    email: "sarah@eventcorp.com",
    phone: "+1-555-0123",
    location: "New York, NY",
    joinDate: "2023-01-15",
    status: "platinum",
    totalEvents: 24,
    totalSpent: 185000,
    lifetimeValue: 185000,
    averageRating: 4.8,
    outstandingBalance: 0,
    preferredEventTypes: ["Corporate", "Networking", "Conference"],
    accountManager: "Michael Chen",
    notes: "Prefers premium tier staff. Usually books 2-3 months in advance. Very responsive to communications."
  };

  // Booking History
  const bookings = [
    {
      id: "evt-024",
      eventName: "Annual Conference 2024",
      date: "2024-12-15",
      venue: "Grand Convention Center",
      staffCount: 35,
      totalCost: 28500,
      status: "upcoming" as const,
      rating: undefined,
      feedback: undefined
    },
    {
      id: "evt-023",
      eventName: "Product Launch Party",
      date: "2024-11-08",
      venue: "Downtown Gallery",
      staffCount: 18,
      totalCost: 12200,
      status: "completed" as const,
      rating: 5,
      feedback: "Excellent service, staff were professional and attentive"
    },
    {
      id: "evt-022",
      eventName: "Quarterly Business Mixer",
      date: "2024-10-22",
      venue: "Rooftop Lounge",
      staffCount: 12,
      totalCost: 8400,
      status: "completed" as const,
      rating: 5,
      feedback: "Great experience as always"
    },
    {
      id: "evt-021",
      eventName: "Summer Corporate Gala",
      date: "2024-08-15",
      venue: "Beachfront Resort",
      staffCount: 42,
      totalCost: 35600,
      status: "completed" as const,
      rating: 4,
      feedback: "Good overall, minor timing issues at start"
    },
    {
      id: "evt-020",
      eventName: "Client Appreciation Event",
      date: "2024-07-10",
      venue: "City Museum",
      staffCount: 22,
      totalCost: 16800,
      status: "completed" as const,
      rating: 5,
      feedback: "Flawless execution!"
    }
  ];

  // Invoice History
  const invoices = [
    {
      id: "INV-2024-145",
      eventName: "Annual Conference 2024",
      amount: 28500,
      status: "pending" as const,
      issueDate: "2024-11-15",
      dueDate: "2024-12-01",
      paidDate: undefined
    },
    {
      id: "INV-2024-128",
      eventName: "Product Launch Party",
      amount: 12200,
      status: "paid" as const,
      issueDate: "2024-11-01",
      dueDate: "2024-11-15",
      paidDate: "2024-11-10"
    },
    {
      id: "INV-2024-112",
      eventName: "Quarterly Business Mixer",
      amount: 8400,
      status: "paid" as const,
      issueDate: "2024-10-15",
      dueDate: "2024-10-29",
      paidDate: "2024-10-25"
    },
    {
      id: "INV-2024-089",
      eventName: "Summer Corporate Gala",
      amount: 35600,
      status: "paid" as const,
      issueDate: "2024-08-08",
      dueDate: "2024-08-22",
      paidDate: "2024-08-20"
    },
    {
      id: "INV-2024-076",
      eventName: "Client Appreciation Event",
      amount: 16800,
      status: "paid" as const,
      issueDate: "2024-07-03",
      dueDate: "2024-07-17",
      paidDate: "2024-07-14"
    }
  ];

  // Favorite Staff
  const favoriteStaff = [
    {
      id: "staff-012",
      name: "Jessica Martinez",
      role: "Event Coordinator",
      tier: "ELITE",
      rating: 4.9,
      eventsWorked: 12,
      lastWorked: "2024-11-08",
      specialty: "Corporate Events"
    },
    {
      id: "staff-034",
      name: "David Thompson",
      role: "Bartender",
      tier: "PREMIUM",
      rating: 4.8,
      eventsWorked: 15,
      lastWorked: "2024-10-22",
      specialty: "Mixology"
    },
    {
      id: "staff-056",
      name: "Emily Chen",
      role: "Server",
      tier: "PREMIUM",
      rating: 4.9,
      eventsWorked: 10,
      lastWorked: "2024-11-08",
      specialty: "Fine Dining"
    },
    {
      id: "staff-078",
      name: "Michael Roberts",
      role: "Setup Crew",
      tier: "STANDARD",
      rating: 4.7,
      eventsWorked: 8,
      lastWorked: "2024-08-15",
      specialty: "Large Venues"
    }
  ];

  // Excluded/Blocked Staff - NEW
  const [blockedStaff, setBlockedStaff] = useState<BlockedStaffMember[]>([
    {
      id: "staff-101",
      name: "John Smith",
      role: "Server",
      reason: "Unprofessional conduct during last event",
      dateBlocked: "2024-09-10"
    },
    {
      id: "staff-105",
      name: "Alice Cooper",
      role: "Bartender",
      reason: "Arrived late multiple times",
      dateBlocked: "2024-05-22"
    }
  ]);

  // Dialog state for adding blocked staff
  const [isAddBlockDialogOpen, setIsAddBlockDialogOpen] = useState(false);
  const [newBlockedStaffId, setNewBlockedStaffId] = useState("");
  const [blockReason, setBlockReason] = useState("");

  const handleAddBlockedStaff = () => {
    if (!newBlockedStaffId || !blockReason) {
      toast.error("Please select a staff member and provide a reason");
      return;
    }
    
    // In a real app, this would fetch staff details or call an API
    const newBlock: BlockedStaffMember = {
      id: newBlockedStaffId,
      name: "New Blocked Staff", // Mock name
      role: "Server", // Mock role
      reason: blockReason,
      dateBlocked: new Date().toISOString().split('T')[0]
    };

    setBlockedStaff([...blockedStaff, newBlock]);
    setIsAddBlockDialogOpen(false);
    setNewBlockedStaffId("");
    setBlockReason("");
    toast.success("Staff member added to excluded list");
  };

  const handleRemoveBlockedStaff = (id: string) => {
    setBlockedStaff(blockedStaff.filter(staff => staff.id !== id));
    toast.success("Staff member removed from excluded list");
  };

  // Staff Assigned Per Event
  const eventStaffAssignments: EventAssignment[] = [
    {
      eventId: "evt-023",
      eventName: "Product Launch Party",
      date: "2024-11-08",
      staffAssigned: [
        { id: "staff-012", name: "Jessica Martinez", role: "Event Coordinator", rating: 4.9, eventsWorked: 12 },
        { id: "staff-034", name: "David Thompson", role: "Bartender", rating: 4.8, eventsWorked: 15 },
        { id: "staff-056", name: "Emily Chen", role: "Server", rating: 4.9, eventsWorked: 10 },
        { id: "staff-089", name: "Robert Johnson", role: "Server", rating: 4.6, eventsWorked: 8 },
        { id: "staff-045", name: "Amanda Lee", role: "Bartender", rating: 4.7, eventsWorked: 9 }
      ]
    },
    {
      eventId: "evt-022",
      eventName: "Quarterly Business Mixer",
      date: "2024-10-22",
      staffAssigned: [
        { id: "staff-012", name: "Jessica Martinez", role: "Event Coordinator", rating: 4.9, eventsWorked: 12 },
        { id: "staff-034", name: "David Thompson", role: "Bartender", rating: 4.8, eventsWorked: 15 },
        { id: "staff-056", name: "Emily Chen", role: "Server", rating: 4.9, eventsWorked: 10 },
        { id: "staff-023", name: "Sarah Williams", role: "Server", rating: 4.5, eventsWorked: 6 }
      ]
    }
  ];

  // Feedback History
  const feedbackHistory: Feedback[] = [
    {
      id: "fb-023",
      eventName: "Product Launch Party",
      date: "2024-11-08",
      rating: 5,
      comment: "Excellent service, staff were professional and attentive. Jessica was exceptional as always!",
      category: "Staff Performance"
    },
    {
      id: "fb-022",
      eventName: "Quarterly Business Mixer",
      date: "2024-10-22",
      rating: 5,
      comment: "Great experience as always. David's bartending skills impressed our guests.",
      category: "Overall Experience"
    },
    {
      id: "fb-021",
      eventName: "Summer Corporate Gala",
      date: "2024-08-15",
      rating: 4,
      comment: "Good overall, minor timing issues at start but staff recovered well. Emily and the servers were fantastic.",
      category: "Operations"
    },
    {
      id: "fb-020",
      eventName: "Client Appreciation Event",
      date: "2024-07-10",
      rating: 5,
      comment: "Flawless execution! The entire team was on point.",
      category: "Overall Experience"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "platinum":
        return <Badge className="bg-purple-100 text-purple-700">Platinum</Badge>;
      case "gold":
        return <Badge className="bg-yellow-100 text-yellow-700">Gold</Badge>;
      case "silver":
        return <Badge className="bg-gray-100 text-gray-700">Silver</Badge>;
      default:
        return <Badge variant="outline">Active</Badge>;
    }
  };

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />Paid
        </Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />Pending
        </Badge>;
      case "overdue":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <AlertCircle className="h-3 w-3 mr-1" />Overdue
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "upcoming":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Upcoming</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewInvoice = (invoiceId: string) => {
    setCurrentPage("invoice-detail", { invoiceId });
  };

  const handleViewEvent = (eventId: string) => {
    setPageParams({ eventId });
    setCurrentPage("admin-event-detail");
  };

  const handleViewStaff = (staffId: string) => {
    setPageParams({ staffId });
    setCurrentPage("staff-detail");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
        </div>

        {/* Client Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left: Avatar and Basic Info */}
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-xl bg-[#5E1916] text-white">
                    {client.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div>
                    <h1 className="text-3xl mb-1">{client.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>{client.company}</span>
                    </div>
                  </div>
                  {getStatusBadge(client.status)}
                </div>
              </div>

              {/* Right: Contact and Stats */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                      {client.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{client.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Client since {new Date(client.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Briefcase className="h-4 w-4" />
                      <span>Total Events</span>
                    </div>
                    <p className="text-2xl font-semibold">{client.totalEvents}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span>Lifetime Value</span>
                    </div>
                    <p className="text-2xl font-semibold">${(client.lifetimeValue / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Star className="h-4 w-4" />
                      <span>Avg Rating</span>
                    </div>
                    <p className="text-2xl font-semibold">{client.averageRating}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <CreditCard className="h-4 w-4" />
                      <span>Outstanding</span>
                    </div>
                    <p className="text-2xl font-semibold">${client.outstandingBalance.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button variant="default" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Client
                </Button>
                <Button variant="outline" size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Booking History</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="favorites">Favorite Staff</TabsTrigger>
            <TabsTrigger value="staff-assignments">Staff Assignments</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="excluded" className="text-red-600 data-[state=active]:text-red-700">Excluded Staff</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Account Summary */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Account Summary</CardTitle>
                  <CardDescription>Client performance metrics and insights</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Total Spent</span>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-2xl font-semibold">${client.totalSpent.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Across {client.totalEvents} events</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Average Event Cost</span>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-2xl font-semibold">
                        ${Math.round(client.totalSpent / client.totalEvents).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Per event average</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Client Rating</span>
                        <Star className="h-4 w-4 text-yellow-600" />
                      </div>
                      <p className="text-2xl font-semibold">{client.averageRating}/5.0</p>
                      <p className="text-xs text-muted-foreground mt-1">Average satisfaction</p>
                    </div>
                  </div>

                  {/* Preferred Event Types */}
                  <div>
                    <h3 className="font-medium mb-3">Preferred Event Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {client.preferredEventTypes.map((type) => (
                        <Badge key={type} variant="outline">{type}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Account Manager */}
                  <div>
                    <h3 className="font-medium mb-2">Account Manager</h3>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-700">MC</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{client.accountManager}</p>
                        <p className="text-sm text-muted-foreground">Senior Account Manager</p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <h3 className="font-medium mb-2">Account Notes</h3>
                    <p className="text-sm text-muted-foreground p-3 bg-slate-50 rounded-lg">
                      {client.notes}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest interactions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Payment Received</p>
                        <p className="text-xs text-muted-foreground">INV-2024-128 - $12,200</p>
                        <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Event Completed</p>
                        <p className="text-xs text-muted-foreground">Product Launch Party</p>
                        <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Star className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Feedback Received</p>
                        <p className="text-xs text-muted-foreground">5-star rating</p>
                        <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <Receipt className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Invoice Sent</p>
                        <p className="text-xs text-muted-foreground">INV-2024-145 - $28,500</p>
                        <p className="text-xs text-muted-foreground mt-1">1 week ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Booking History Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Booking History</CardTitle>
                    <CardDescription>{bookings.length} total bookings</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Details</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Total Cost</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="font-medium">{booking.eventName}</div>
                          <div className="text-xs text-muted-foreground">{booking.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(booking.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{booking.venue}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {booking.staffCount}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${booking.totalCost.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {booking.rating ? (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span>{booking.rating}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getBookingStatusBadge(booking.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewEvent(booking.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
             <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Invoices</CardTitle>
                    <CardDescription>{invoices.length} invoices found</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.eventName}</TableCell>
                        <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right font-semibold">
                          ${invoice.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInvoice(invoice.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorite Staff Tab */}
          <TabsContent value="favorites" className="space-y-4">
             <Card>
              <CardHeader>
                <CardTitle>Favorite Staff</CardTitle>
                <CardDescription>Staff members highly rated by this client</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favoriteStaff.map((staff) => (
                    <Card key={staff.id} className="overflow-hidden">
                      <div className="p-4 flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{staff.name}</p>
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {staff.role}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {staff.rating}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground space-y-2">
                        <div className="flex justify-between">
                          <span>Events Worked:</span>
                          <span className="font-medium text-foreground">{staff.eventsWorked}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Worked:</span>
                          <span className="font-medium text-foreground">{new Date(staff.lastWorked).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Specialty:</span>
                          <span className="font-medium text-foreground">{staff.specialty}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full mt-2" 
                          size="sm"
                          onClick={() => handleViewStaff(staff.id)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Excluded Staff Tab - NEW */}
          <TabsContent value="excluded" className="space-y-4">
            <Card className="border-red-100">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-red-700 flex items-center gap-2">
                      <Ban className="h-5 w-5" />
                      Excluded Staff
                    </CardTitle>
                    <CardDescription>
                      Staff members blocked from being assigned to this client's events
                    </CardDescription>
                  </div>
                  <Dialog open={isAddBlockDialogOpen} onOpenChange={setIsAddBlockDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Block Staff
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Block Staff Member</DialogTitle>
                        <DialogDescription>
                          Select a staff member to exclude from future assignments for this client.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Select Staff</label>
                          <Select onValueChange={setNewBlockedStaffId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Search staff..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="staff-099">Michael Scott (Manager)</SelectItem>
                              <SelectItem value="staff-098">Dwight Schrute (Security)</SelectItem>
                              <SelectItem value="staff-097">Jim Halpert (Server)</SelectItem>
                              <SelectItem value="staff-096">Pam Beesly (Coordinator)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Reason for Exclusion</label>
                          <Input 
                            placeholder="e.g., Unprofessional behavior, client request..." 
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddBlockDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleAddBlockedStaff}>Add to Block List</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {blockedStaff.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3 opacity-20" />
                    <p>No staff members are currently excluded for this client.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Date Blocked</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blockedStaff.map((staff) => (
                        <TableRow key={staff.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-red-100 text-red-700">
                                  {staff.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              {staff.name}
                            </div>
                          </TableCell>
                          <TableCell>{staff.role}</TableCell>
                          <TableCell className="max-w-[300px] truncate" title={staff.reason}>
                            {staff.reason}
                          </TableCell>
                          <TableCell>{new Date(staff.dateBlocked).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-muted-foreground hover:text-red-600"
                              onClick={() => handleRemoveBlockedStaff(staff.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Assignments Tab */}
          <TabsContent value="staff-assignments" className="space-y-4">
             <Card>
              <CardHeader>
                <CardTitle>Staff Assignments</CardTitle>
                <CardDescription>History of staff assigned to recent events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {eventStaffAssignments.map((event) => (
                    <div key={event.eventId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium">{event.eventName}</h3>
                          <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleViewEvent(event.eventId)}>
                          View Event
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {event.staffAssigned.map((staff) => (
                          <div key={staff.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded text-sm">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {staff.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{staff.name}</p>
                              <p className="text-xs text-muted-foreground">{staff.role}</p>
                            </div>
                          </div>
                        ))}
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
                <CardTitle>Client Feedback</CardTitle>
                <CardDescription>Reviews and comments from past events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedbackHistory.map((item) => (
                    <div key={item.id} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{item.eventName}</h3>
                          <p className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString()} • {item.category}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded text-yellow-700 font-medium">
                          {item.rating} <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        </div>
                      </div>
                      <p className="text-sm">{item.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
