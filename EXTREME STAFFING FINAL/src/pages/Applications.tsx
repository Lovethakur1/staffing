import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import {
  Users,
  Search,
  Filter,
  Eye,
  Mail,
  Phone,
  MapPin,
  Download,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  AlertCircle,
  Award,
  Briefcase,
  GraduationCap,
  DollarSign,
  ExternalLink,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { useNavigation } from "../contexts/NavigationContext";

interface PageProps {
  userRole: string;
  userId: string;
}

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  education: string;
  skills: string[];
  status: 'pending' | 'reviewing' | 'interview' | 'approved' | 'rejected';
  appliedDate: string;
  source: string;
  salary: string;
  availability: string;
  location: string;
  resumeUrl?: string;
  coverLetterUrl?: string;
  notes?: string;
  rating?: number;
  backgroundCheck?: 'pending' | 'in-progress' | 'passed' | 'failed';
}

export function Applications({ userRole, userId }: PageProps) {
  const { setCurrentPage: setNavigationPage } = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock applications data with comprehensive details
  const [applications] = useState<Application[]>([
    {
      id: "app-001",
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      position: "Event Coordinator",
      experience: "3 years",
      education: "Bachelor's in Hospitality Management",
      skills: ["Event Planning", "Customer Service", "Team Leadership", "Budget Management"],
      status: "pending",
      appliedDate: "2025-10-08",
      source: "Company Website",
      salary: "$50,000 - $60,000",
      availability: "Immediate",
      location: "Los Angeles, CA",
      resumeUrl: "/resume-sarah.pdf",
      coverLetterUrl: "/cover-letter-sarah.pdf",
      notes: "Strong background in corporate events with excellent references",
      backgroundCheck: "pending"
    },
    {
      id: "app-002",
      name: "Michael Chen",
      email: "m.chen@email.com",
      phone: "+1 (555) 987-6543",
      position: "Bartender",
      experience: "5 years",
      education: "Mixology Certification",
      skills: ["Mixology", "Customer Service", "Cash Handling", "Inventory Management"],
      status: "interview",
      appliedDate: "2025-10-06",
      source: "LinkedIn",
      salary: "$28 - $35/hour",
      availability: "2 weeks notice",
      location: "Los Angeles, CA",
      resumeUrl: "/resume-michael.pdf",
      rating: 4,
      notes: "Excellent references from previous employers",
      backgroundCheck: "in-progress"
    },
    {
      id: "app-003",
      name: "Emily Rodriguez",
      email: "emily.r@email.com",
      phone: "+1 (555) 456-7890",
      position: "Server",
      experience: "2 years",
      education: "High School Diploma",
      skills: ["Food Service", "Multitasking", "Communication", "POS Systems"],
      status: "approved",
      appliedDate: "2025-10-05",
      source: "Indeed",
      salary: "$24 - $28/hour",
      availability: "Immediate",
      location: "Los Angeles, CA",
      rating: 5,
      notes: "Outstanding interview performance, great personality",
      backgroundCheck: "passed"
    },
    {
      id: "app-004",
      name: "David Wilson",
      email: "d.wilson@email.com",
      phone: "+1 (555) 321-0987",
      position: "Setup Crew",
      experience: "1 year",
      education: "High School Diploma",
      skills: ["Physical Labor", "Equipment Setup", "Teamwork", "Time Management"],
      status: "reviewing",
      appliedDate: "2025-10-07",
      source: "Referral",
      salary: "$20 - $24/hour",
      availability: "Immediate",
      location: "Los Angeles, CA",
      notes: "Good attitude, willing to learn",
      backgroundCheck: "pending"
    },
    {
      id: "app-005",
      name: "Jessica Martinez",
      email: "jessica.m@email.com",
      phone: "+1 (555) 234-5678",
      position: "Event Coordinator",
      experience: "4 years",
      education: "Master's in Event Management",
      skills: ["Event Planning", "Vendor Relations", "Marketing", "Project Management"],
      status: "interview",
      appliedDate: "2025-10-04",
      source: "Company Website",
      salary: "$55,000 - $65,000",
      availability: "1 month notice",
      location: "Los Angeles, CA",
      resumeUrl: "/resume-jessica.pdf",
      rating: 5,
      notes: "Exceptional credentials, managed events for Fortune 500 companies",
      backgroundCheck: "passed"
    },
    {
      id: "app-006",
      name: "Robert Taylor",
      email: "r.taylor@email.com",
      phone: "+1 (555) 345-6789",
      position: "Bartender",
      experience: "3 years",
      education: "Bartending License",
      skills: ["Mixology", "Customer Relations", "Event Bar Service"],
      status: "pending",
      appliedDate: "2025-10-08",
      source: "Indeed",
      salary: "$26 - $32/hour",
      availability: "Immediate",
      location: "Los Angeles, CA",
      resumeUrl: "/resume-robert.pdf",
      backgroundCheck: "pending"
    },
    {
      id: "app-007",
      name: "Amanda Lee",
      email: "amanda.lee@email.com",
      phone: "+1 (555) 456-7891",
      position: "Server",
      experience: "5 years",
      education: "Culinary Arts Degree",
      skills: ["Fine Dining Service", "Wine Knowledge", "Customer Service", "Team Training"],
      status: "approved",
      appliedDate: "2025-10-03",
      source: "Referral",
      salary: "$26 - $30/hour",
      availability: "Immediate",
      location: "Los Angeles, CA",
      rating: 5,
      notes: "Extensive fine dining experience, perfect for high-end events",
      backgroundCheck: "passed"
    },
    {
      id: "app-008",
      name: "Christopher Brown",
      email: "c.brown@email.com",
      phone: "+1 (555) 567-8901",
      position: "Setup Crew",
      experience: "2 years",
      education: "High School Diploma",
      skills: ["Physical Labor", "Equipment Handling", "Safety Protocols", "Logistics"],
      status: "reviewing",
      appliedDate: "2025-10-07",
      source: "LinkedIn",
      salary: "$22 - $26/hour",
      availability: "Immediate",
      location: "Los Angeles, CA",
      notes: "Previous experience with stage and event setup",
      backgroundCheck: "in-progress"
    },
    {
      id: "app-009",
      name: "Olivia Davis",
      email: "olivia.d@email.com",
      phone: "+1 (555) 678-9012",
      position: "Event Coordinator",
      experience: "2 years",
      education: "Bachelor's in Communications",
      skills: ["Event Coordination", "Social Media Marketing", "Client Relations"],
      status: "rejected",
      appliedDate: "2025-10-02",
      source: "Company Website",
      salary: "$45,000 - $55,000",
      availability: "2 weeks notice",
      location: "Los Angeles, CA",
      notes: "Lacked required experience level for our needs"
    },
    {
      id: "app-010",
      name: "Daniel Garcia",
      email: "daniel.g@email.com",
      phone: "+1 (555) 789-0123",
      position: "Bartender",
      experience: "7 years",
      education: "Mixology Certification + Advanced Training",
      skills: ["Craft Cocktails", "Bar Management", "Staff Training", "Inventory Control"],
      status: "interview",
      appliedDate: "2025-10-05",
      source: "LinkedIn",
      salary: "$30 - $38/hour",
      availability: "3 weeks notice",
      location: "Los Angeles, CA",
      resumeUrl: "/resume-daniel.pdf",
      rating: 5,
      notes: "Highly experienced, certified mixologist with bar management background",
      backgroundCheck: "passed"
    }
  ]);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesPosition = positionFilter === "all" || app.position === positionFilter;
    const matchesSource = sourceFilter === "all" || app.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesPosition && matchesSource;
  });

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'reviewing': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'interview': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'reviewing': return <Eye className="h-4 w-4" />;
      case 'interview': return <Calendar className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getBackgroundCheckBadge = (status?: string) => {
    if (!status) return null;
    const colors = {
      'pending': 'bg-gray-50 text-gray-700 border-gray-200',
      'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
      'passed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'failed': 'bg-red-50 text-red-700 border-red-200'
    };
    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  const handleStatusUpdate = (applicationId: string, newStatus: string) => {
    toast.success(`Application status updated to ${newStatus}!`);
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsDetailsDialogOpen(true);
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
    interview: applications.filter(a => a.status === 'interview').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setNavigationPage('hiring')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Applications</h1>
            <p className="text-muted-foreground">
              Manage and review job applications from candidates
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Applications
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">Reviewing</p>
              <p className="text-2xl font-bold text-blue-600">{stats.reviewing}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">Interview</p>
              <p className="text-2xl font-bold text-purple-600">{stats.interview}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="Event Coordinator">Event Coordinator</SelectItem>
                <SelectItem value="Bartender">Bartender</SelectItem>
                <SelectItem value="Server">Server</SelectItem>
                <SelectItem value="Setup Crew">Setup Crew</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="Company Website">Company Website</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="Indeed">Indeed</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Job Applications ({filteredApplications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Background</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-medium text-primary">
                            {application.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{application.name}</p>
                          <p className="text-sm text-muted-foreground">{application.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{application.position}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{application.experience}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{application.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(application.status)}
                        <Badge className={getStatusColor(application.status)}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getBackgroundCheckBadge(application.backgroundCheck)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{application.appliedDate}</span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(application)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredApplications.length)} of {filteredApplications.length} applications
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Personal Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedApplication.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedApplication.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedApplication.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedApplication.location}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Position & Experience
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Position:</span> {selectedApplication.position}</p>
                      <p><span className="font-medium">Experience:</span> {selectedApplication.experience}</p>
                      <p><span className="font-medium">Education:</span> {selectedApplication.education}</p>
                      <p><span className="font-medium">Availability:</span> {selectedApplication.availability}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Skills
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      {selectedApplication.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Application Details</h3>
                    <div className="space-y-3">
                      <div>
                        <Label>Status</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(selectedApplication.status)}
                          <Badge className={getStatusColor(selectedApplication.status)}>
                            {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <Label>Update Status</Label>
                        <Select 
                          defaultValue={selectedApplication.status}
                          onValueChange={(value) => handleStatusUpdate(selectedApplication.id, value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewing">Reviewing</SelectItem>
                            <SelectItem value="interview">Interview</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Application Source</Label>
                        <p className="text-sm mt-1">{selectedApplication.source}</p>
                      </div>

                      <div>
                        <Label>Salary Expectation</Label>
                        <p className="text-sm mt-1">{selectedApplication.salary}</p>
                      </div>

                      <div>
                        <Label>Background Check</Label>
                        <div className="mt-1">
                          {getBackgroundCheckBadge(selectedApplication.backgroundCheck)}
                        </div>
                      </div>

                      {selectedApplication.rating && (
                        <div>
                          <Label>Interview Rating</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Award
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < selectedApplication.rating!
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm">{selectedApplication.rating}/5</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Documents</h3>
                    <div className="space-y-2">
                      {selectedApplication.resumeUrl && (
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <FileText className="h-4 w-4 mr-2" />
                          Download Resume
                        </Button>
                      )}
                      {selectedApplication.coverLetterUrl && (
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <FileText className="h-4 w-4 mr-2" />
                          Download Cover Letter
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {selectedApplication.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{selectedApplication.notes}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Add Notes</h3>
                <Textarea 
                  placeholder="Enter notes about this application..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-between pt-4">
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Interview
                  </Button>
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </div>
                <Button onClick={() => setIsDetailsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
