import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Send,
  MessageSquare,
  TrendingUp,
  Building2,
  Mail,
  Phone,
  Briefcase
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useNavigation } from "../contexts/NavigationContext";

interface EventRequestsProps {
  userRole: string;
  userId: string;
}

interface EventRequest {
  id: string;
  requestNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany: string;
  eventName: string;
  eventType: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  estimatedGuests: number;
  staffNeeded: {
    servers: number;
    bartenders: number;
    coordinators: number;
    managers: number;
  };
  budget: number;
  status: 'pending' | 'under-review' | 'approved' | 'rejected' | 'needs-modification';
  submittedDate: string;
  specialRequirements: string;
  cateringNeeded: boolean;
  equipmentNeeded: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  adminNotes: string;
}

export function EventRequests({ userRole, userId }: EventRequestsProps) {
  const { setCurrentPage } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<EventRequest | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'modify' | null>(null);
  const [adminResponse, setAdminResponse] = useState("");

  // Mock event requests data
  const eventRequests: EventRequest[] = [
    {
      id: "req-001",
      requestNumber: "REQ-2024-001",
      clientId: "client-001",
      clientName: "Sarah Johnson",
      clientEmail: "sarah.j@techcorp.com",
      clientPhone: "+1 (555) 123-4567",
      clientCompany: "TechCorp Industries",
      eventName: "Annual Corporate Gala 2024",
      eventType: "Corporate Event",
      eventDate: "2024-12-15",
      startTime: "18:00",
      endTime: "23:00",
      venue: "Grand Ballroom Hotel",
      address: "123 Main Street, New York, NY 10001",
      estimatedGuests: 250,
      staffNeeded: {
        servers: 15,
        bartenders: 5,
        coordinators: 2,
        managers: 1
      },
      budget: 15000,
      status: 'pending',
      submittedDate: "2024-11-28T10:30:00",
      specialRequirements: "Need staff experienced with formal dining service. Black tie event.",
      cateringNeeded: true,
      equipmentNeeded: ["Tables", "Chairs", "Linens", "Audio System"],
      priority: 'high',
      adminNotes: ""
    },
    {
      id: "req-002",
      requestNumber: "REQ-2024-002",
      clientId: "client-002",
      clientName: "Michael Chen",
      clientEmail: "michael@weddings.com",
      clientPhone: "+1 (555) 234-5678",
      clientCompany: "Chen Wedding Planning",
      eventName: "Anderson-Smith Wedding Reception",
      eventType: "Wedding",
      eventDate: "2024-12-18",
      startTime: "17:00",
      endTime: "22:00",
      venue: "Riverside Gardens",
      address: "456 River Road, Brooklyn, NY 11201",
      estimatedGuests: 180,
      staffNeeded: {
        servers: 10,
        bartenders: 3,
        coordinators: 1,
        managers: 1
      },
      budget: 8500,
      status: 'under-review',
      submittedDate: "2024-11-27T14:20:00",
      specialRequirements: "Outdoor venue, need staff comfortable with garden setting. Weather contingency plan needed.",
      cateringNeeded: true,
      equipmentNeeded: ["Tents", "Outdoor Heaters", "Lighting"],
      priority: 'medium',
      adminNotes: "Checking availability of outdoor event specialists"
    },
    {
      id: "req-003",
      requestNumber: "REQ-2024-003",
      clientId: "client-003",
      clientName: "Emily Rodriguez",
      clientEmail: "emily.r@holidayevents.com",
      clientPhone: "+1 (555) 345-6789",
      clientCompany: "Holiday Events Inc",
      eventName: "Client Appreciation Holiday Party",
      eventType: "Corporate Event",
      eventDate: "2024-12-20",
      startTime: "19:00",
      endTime: "00:00",
      venue: "Downtown Convention Center",
      address: "789 Convention Ave, Manhattan, NY 10018",
      estimatedGuests: 500,
      staffNeeded: {
        servers: 25,
        bartenders: 8,
        coordinators: 3,
        managers: 2
      },
      budget: 28000,
      status: 'approved',
      submittedDate: "2024-11-25T09:15:00",
      specialRequirements: "Large scale event. Need experienced team for crowd management.",
      cateringNeeded: true,
      equipmentNeeded: ["Stage", "DJ Equipment", "Photo Booth"],
      priority: 'urgent',
      adminNotes: "Approved - Team assembled. Schedule sent to client."
    },
    {
      id: "req-004",
      requestNumber: "REQ-2024-004",
      clientId: "client-004",
      clientName: "David Park",
      clientEmail: "david@startupevents.io",
      clientPhone: "+1 (555) 456-7890",
      clientCompany: "Startup Launch Events",
      eventName: "Product Launch Networking Event",
      eventType: "Networking",
      eventDate: "2024-12-22",
      startTime: "18:30",
      endTime: "21:30",
      venue: "Tech Hub Lounge",
      address: "321 Innovation Drive, San Francisco, CA 94105",
      estimatedGuests: 120,
      staffNeeded: {
        servers: 6,
        bartenders: 2,
        coordinators: 1,
        managers: 0
      },
      budget: 4500,
      status: 'needs-modification',
      submittedDate: "2024-11-26T16:45:00",
      specialRequirements: "Casual networking atmosphere. Need staff familiar with tech industry events.",
      cateringNeeded: false,
      equipmentNeeded: [],
      priority: 'low',
      adminNotes: "Requested budget increase - insufficient for requested staff count"
    },
    {
      id: "req-005",
      requestNumber: "REQ-2024-005",
      clientId: "client-005",
      clientName: "Jennifer Martinez",
      clientEmail: "jennifer@nonprofitgala.org",
      clientPhone: "+1 (555) 567-8901",
      clientCompany: "Community Foundation",
      eventName: "Charity Fundraising Gala",
      eventType: "Fundraiser",
      eventDate: "2024-12-14",
      startTime: "17:30",
      endTime: "22:00",
      venue: "City Museum Grand Hall",
      address: "555 Museum Plaza, Chicago, IL 60601",
      estimatedGuests: 300,
      staffNeeded: {
        servers: 18,
        bartenders: 6,
        coordinators: 2,
        managers: 1
      },
      budget: 12000,
      status: 'pending',
      submittedDate: "2024-11-29T11:00:00",
      specialRequirements: "Formal service required. Auction assistance needed during event.",
      cateringNeeded: true,
      equipmentNeeded: ["Auction Tables", "Display Stands"],
      priority: 'high',
      adminNotes: ""
    },
    {
      id: "req-006",
      requestNumber: "REQ-2024-006",
      clientId: "client-001",
      clientName: "Sarah Johnson",
      clientEmail: "sarah.j@techcorp.com",
      clientPhone: "+1 (555) 123-4567",
      clientCompany: "TechCorp Industries",
      eventName: "Executive Board Dinner",
      eventType: "Corporate Dinner",
      eventDate: "2024-12-10",
      startTime: "19:00",
      endTime: "22:00",
      venue: "Private Dining Room - The Capital Club",
      address: "888 Executive Boulevard, New York, NY 10022",
      estimatedGuests: 25,
      staffNeeded: {
        servers: 3,
        bartenders: 1,
        coordinators: 0,
        managers: 1
      },
      budget: 3500,
      status: 'rejected',
      submittedDate: "2024-11-24T13:30:00",
      specialRequirements: "High-profile executives. Discretion and fine dining expertise required.",
      cateringNeeded: true,
      equipmentNeeded: [],
      priority: 'medium',
      adminNotes: "Rejected - Insufficient lead time for proper vetting and preparation"
    }
  ];

  const stats = {
    total: eventRequests.length,
    pending: eventRequests.filter(r => r.status === 'pending').length,
    underReview: eventRequests.filter(r => r.status === 'under-review').length,
    approved: eventRequests.filter(r => r.status === 'approved').length,
    needsModification: eventRequests.filter(r => r.status === 'needs-modification').length,
    rejected: eventRequests.filter(r => r.status === 'rejected').length,
    totalBudget: eventRequests.filter(r => r.status !== 'rejected').reduce((sum, r) => sum + r.budget, 0),
    totalStaffNeeded: eventRequests.filter(r => r.status !== 'rejected').reduce((sum, r) => 
      sum + r.staffNeeded.servers + r.staffNeeded.bartenders + r.staffNeeded.coordinators + r.staffNeeded.managers, 0)
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'under-review':
        return <Badge className="bg-blue-100 text-blue-700"><Eye className="h-3 w-3 mr-1" />Under Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'needs-modification':
        return <Badge className="bg-orange-100 text-orange-700"><AlertCircle className="h-3 w-3 mr-1" />Needs Changes</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-700">High</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-700">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const filteredRequests = eventRequests.filter(request => {
    const matchesSearch = request.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.clientCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.requestNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleReviewRequest = (request: EventRequest, action: 'approve' | 'reject' | 'modify') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setAdminResponse("");
    setShowReviewDialog(true);
  };

  const handleSubmitReview = () => {
    if (!selectedRequest || !reviewAction) return;

    let message = "";
    switch (reviewAction) {
      case 'approve':
        message = `Event request ${selectedRequest.requestNumber} approved successfully!`;
        break;
      case 'reject':
        message = `Event request ${selectedRequest.requestNumber} rejected. Client will be notified.`;
        break;
      case 'modify':
        message = `Modification request sent to ${selectedRequest.clientName}`;
        break;
    }

    toast.success(message);
    setShowReviewDialog(false);
  };

  const handleMessageClient = (request: EventRequest) => {
    setSelectedRequest(request);
    setAdminResponse("");
    setShowMessageDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTotalStaff = (staffNeeded: EventRequest['staffNeeded']) => {
    return staffNeeded.servers + staffNeeded.bartenders + staffNeeded.coordinators + staffNeeded.managers;
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Requests</h1>
          <p className="text-sm text-muted-foreground">
            Review and manage client-submitted event requests
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-warning">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.underReview}</div>
            <p className="text-xs text-blue-600">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-success">Ready to schedule</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalBudget / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">Active requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Needed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStaffNeeded}</div>
            <p className="text-xs text-muted-foreground">Total positions</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by event name, client, or request number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="needs-modification">Needs Changes</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="review">
            Under Review ({stats.underReview})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({stats.approved})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Requests ({filteredRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Event Requests</CardTitle>
              <p className="text-sm text-muted-foreground">
                New requests awaiting your review and approval
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRequests.filter(r => r.status === 'pending').map((request) => (
                  <EventRequestCard
                    key={request.id}
                    request={request}
                    onReview={handleReviewRequest}
                    onMessage={handleMessageClient}
                    getStatusBadge={getStatusBadge}
                    getPriorityBadge={getPriorityBadge}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    getTotalStaff={getTotalStaff}
                  />
                ))}
                {filteredRequests.filter(r => r.status === 'pending').length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No pending requests</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Under Review</CardTitle>
              <p className="text-sm text-muted-foreground">
                Requests currently being evaluated
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRequests.filter(r => r.status === 'under-review').map((request) => (
                  <EventRequestCard
                    key={request.id}
                    request={request}
                    onReview={handleReviewRequest}
                    onMessage={handleMessageClient}
                    getStatusBadge={getStatusBadge}
                    getPriorityBadge={getPriorityBadge}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    getTotalStaff={getTotalStaff}
                  />
                ))}
                {filteredRequests.filter(r => r.status === 'under-review').length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No requests under review</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Events</CardTitle>
              <p className="text-sm text-muted-foreground">
                Confirmed events ready for staff scheduling
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRequests.filter(r => r.status === 'approved').map((request) => (
                  <EventRequestCard
                    key={request.id}
                    request={request}
                    onReview={handleReviewRequest}
                    onMessage={handleMessageClient}
                    getStatusBadge={getStatusBadge}
                    getPriorityBadge={getPriorityBadge}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    getTotalStaff={getTotalStaff}
                  />
                ))}
                {filteredRequests.filter(r => r.status === 'approved').length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No approved events</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Event Requests ({filteredRequests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>Event Details</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.requestNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.eventName}</p>
                          <p className="text-sm text-muted-foreground">{request.eventType}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.clientName}</p>
                          <p className="text-sm text-muted-foreground">{request.clientCompany}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{formatDate(request.eventDate)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(request.startTime)} - {formatTime(request.endTime)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getTotalStaff(request.staffNeeded)}</TableCell>
                      <TableCell className="font-semibold">${request.budget.toLocaleString()}</TableCell>
                      <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowReviewDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
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
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Review Event Request - {selectedRequest?.requestNumber}
            </DialogTitle>
            <DialogDescription>
              Carefully review all details before approving, rejecting, or requesting modifications
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Client Information */}
              <div className="p-4 bg-muted/50 rounded-lg border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Client Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Client Name</p>
                    <p className="font-medium">{selectedRequest.clientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{selectedRequest.clientCompany}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {selectedRequest.clientEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {selectedRequest.clientPhone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Event Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Event Name</Label>
                    <p className="font-medium text-lg">{selectedRequest.eventName}</p>
                  </div>
                  <div>
                    <Label>Event Type</Label>
                    <p className="font-medium">{selectedRequest.eventType}</p>
                  </div>
                  <div>
                    <Label>Estimated Guests</Label>
                    <p className="font-medium">{selectedRequest.estimatedGuests} guests</p>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <p className="font-medium">{formatDate(selectedRequest.eventDate)}</p>
                  </div>
                  <div>
                    <Label>Time</Label>
                    <p className="font-medium">
                      {formatTime(selectedRequest.startTime)} - {formatTime(selectedRequest.endTime)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label>Venue</Label>
                    <p className="font-medium">{selectedRequest.venue}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {selectedRequest.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Staffing Requirements */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Staffing Requirements
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-muted-foreground">Servers</p>
                    <p className="text-2xl font-bold text-blue-700">{selectedRequest.staffNeeded.servers}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-muted-foreground">Bartenders</p>
                    <p className="text-2xl font-bold text-purple-700">{selectedRequest.staffNeeded.bartenders}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-muted-foreground">Coordinators</p>
                    <p className="text-2xl font-bold text-green-700">{selectedRequest.staffNeeded.coordinators}</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-muted-foreground">Managers</p>
                    <p className="text-2xl font-bold text-orange-700">{selectedRequest.staffNeeded.managers}</p>
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Staff Needed</p>
                  <p className="text-xl font-bold">{getTotalStaff(selectedRequest.staffNeeded)} team members</p>
                </div>
              </div>

              {/* Special Requirements */}
              {selectedRequest.specialRequirements && (
                <div className="space-y-2">
                  <Label>Special Requirements</Label>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm">{selectedRequest.specialRequirements}</p>
                  </div>
                </div>
              )}

              {/* Additional Services */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Catering</Label>
                  <p className="font-medium">
                    {selectedRequest.cateringNeeded ? (
                      <Badge className="bg-green-100 text-green-700">Required</Badge>
                    ) : (
                      <Badge variant="outline">Not Required</Badge>
                    )}
                  </p>
                </div>
                <div>
                  <Label>Budget</Label>
                  <p className="text-2xl font-bold text-green-600">
                    ${selectedRequest.budget.toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedRequest.equipmentNeeded.length > 0 && (
                <div className="space-y-2">
                  <Label>Equipment Needed</Label>
                  <div className="flex gap-2 flex-wrap">
                    {selectedRequest.equipmentNeeded.map((item, index) => (
                      <Badge key={index} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Response */}
              <div className="space-y-2">
                <Label>Admin Notes / Response to Client</Label>
                <Textarea
                  placeholder="Enter your notes or message to the client..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <DialogFooter className="gap-2 sm:gap-0">
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewDialog(false)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    onClick={() => {
                      setReviewAction('modify');
                      handleSubmitReview();
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Request Changes
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      setReviewAction('reject');
                      handleSubmitReview();
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setReviewAction('approve');
                      handleSubmitReview();
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Event
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Client Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message Client</DialogTitle>
            <DialogDescription>
              Send a message to {selectedRequest?.clientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Regarding</p>
              <p className="font-medium">{selectedRequest?.eventName}</p>
              <p className="text-sm text-muted-foreground mt-2">Request: {selectedRequest?.requestNumber}</p>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Type your message here..."
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success(`Message sent to ${selectedRequest?.clientName}`);
                setShowMessageDialog(false);
              }}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Event Request Card Component
interface EventRequestCardProps {
  request: EventRequest;
  onReview: (request: EventRequest, action: 'approve' | 'reject' | 'modify') => void;
  onMessage: (request: EventRequest) => void;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string) => JSX.Element;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  getTotalStaff: (staffNeeded: EventRequest['staffNeeded']) => number;
}

function EventRequestCard({
  request,
  onReview,
  onMessage,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  formatTime,
  getTotalStaff
}: EventRequestCardProps) {
  return (
    <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg">{request.eventName}</h3>
            {getPriorityBadge(request.priority)}
            {getStatusBadge(request.status)}
          </div>
          <p className="text-sm text-muted-foreground">{request.requestNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="flex items-start gap-3">
          <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Client</p>
            <p className="font-medium">{request.clientName}</p>
            <p className="text-sm text-muted-foreground">{request.clientCompany}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Date & Time</p>
            <p className="font-medium">{formatDate(request.eventDate)}</p>
            <p className="text-sm text-muted-foreground">
              {formatTime(request.startTime)} - {formatTime(request.endTime)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Staff Needed</p>
            <p className="font-medium">{getTotalStaff(request.staffNeeded)} team members</p>
            <p className="text-sm text-muted-foreground">{request.estimatedGuests} guests</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Budget</p>
            <p className="font-medium text-green-600 text-lg">${request.budget.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 mb-4">
        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div>
          <p className="font-medium">{request.venue}</p>
          <p className="text-sm text-muted-foreground">{request.address}</p>
        </div>
      </div>

      {request.specialRequirements && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
          <p className="text-sm font-medium mb-1">Special Requirements:</p>
          <p className="text-sm text-muted-foreground">{request.specialRequirements}</p>
        </div>
      )}

      {request.adminNotes && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <p className="text-sm font-medium mb-1">Admin Notes:</p>
          <p className="text-sm text-muted-foreground">{request.adminNotes}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Submitted {formatDate(request.submittedDate)}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMessage(request)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
          {request.status === 'pending' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => onReview(request, 'reject')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onReview(request, 'approve')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </>
          )}
          {request.status === 'under-review' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReview(request, 'modify')}
            >
              <Edit className="h-4 w-4 mr-2" />
              Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
