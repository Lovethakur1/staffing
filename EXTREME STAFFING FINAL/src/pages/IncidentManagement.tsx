import { useState } from "react";
import { useNavigation } from "../contexts/NavigationContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { TooltipWrapper, IconTooltip, InfoTooltip } from "../components/ui/tooltip-wrapper";
import { 
  AlertTriangle,
  Shield,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Camera,
  Users,
  Calendar,
  MapPin,
  Phone,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface IncidentManagementProps {
  userRole: string;
  userId: string;
}

interface Incident {
  id: string;
  title: string;
  type: 'injury' | 'property-damage' | 'complaint' | 'safety' | 'theft' | 'other';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  eventId: string;
  eventName: string;
  reportedBy: string;
  reportedDate: string;
  location: string;
  description: string;
  involvedParties: string[];
  witnesses?: string[];
  actionsTaken: string;
  resolution?: string;
  photoEvidence?: number;
  followUpRequired: boolean;
  insuranceClaim?: string;
}

export function IncidentManagement({ userRole }: IncidentManagementProps) {
  const { setCurrentPage } = useNavigation();
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPageNum] = useState(1);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const itemsPerPage = 10;

  // Mock incident data
  const incidents: Incident[] = [
    {
      id: "INC-001",
      title: "Guest Slip and Fall - Main Ballroom",
      type: "injury",
      severity: "high",
      status: "investigating",
      eventId: "EVT-1234",
      eventName: "Corporate Gala 2024",
      reportedBy: "Sarah Mitchell (Manager)",
      reportedDate: "2024-10-10T20:30:00",
      location: "Grand Ballroom - Near Bar Area",
      description: "Guest slipped on wet floor near bar station. Complained of ankle pain. First aid administered on site. Guest declined ambulance but requested incident report for insurance purposes.",
      involvedParties: ["Guest: John Smith", "Bartender: Sarah Johnson"],
      witnesses: ["Server: Michael Chen", "Guest: Jane Doe"],
      actionsTaken: "First aid applied, wet floor signs placed, area cordoned off, guest information collected, photos taken of scene.",
      photoEvidence: 3,
      followUpRequired: true,
      insuranceClaim: "Pending"
    },
    {
      id: "INC-002",
      title: "Equipment Damage - AV System",
      type: "property-damage",
      severity: "medium",
      status: "resolved",
      eventId: "EVT-1236",
      eventName: "Product Launch Party",
      reportedBy: "Christopher Brown (AV Tech)",
      reportedDate: "2024-10-15T18:45:00",
      location: "Tech Convention Center - Stage Area",
      description: "Wireless microphone dropped by speaker during presentation. Microphone body cracked, audio cuts out intermittently. Replacement microphone deployed immediately.",
      involvedParties: ["Speaker: Dr. Emily Johnson", "AV Tech: Christopher Brown"],
      actionsTaken: "Backup microphone deployed within 2 minutes. Damaged unit removed from service and tagged for repair. Event continued without interruption.",
      resolution: "Equipment repaired by vendor. Cost: $150. Speaker's company reimbursed for damage.",
      photoEvidence: 2,
      followUpRequired: false
    },
    {
      id: "INC-003",
      title: "Food Allergy Emergency",
      type: "safety",
      severity: "critical",
      status: "closed",
      eventId: "EVT-1235",
      eventName: "Wedding Reception",
      reportedBy: "Lisa Anderson (Event Coordinator)",
      reportedDate: "2024-10-12T19:15:00",
      location: "Riverside Venue - Dining Area",
      description: "Guest experienced allergic reaction to nuts despite requesting nut-free meal. Guest's EpiPen administered by companion. 911 called immediately. Paramedics arrived within 8 minutes. Guest stable and transported to hospital.",
      involvedParties: ["Guest: Amanda Miller", "Server: Emma Davis", "Chef: Robert Taylor"],
      witnesses: ["Multiple guests", "Event Coordinator: Lisa Anderson"],
      actionsTaken: "911 called immediately, guest's companion administered EpiPen, paramedics escorted to guest, kitchen protocols reviewed, all nut-containing dishes removed from service, remaining guests with allergies verified with kitchen.",
      resolution: "Guest recovered fully. Kitchen procedure error identified - cross-contamination during plating. New protocols implemented: separate prep areas for allergen-free meals, mandatory double-check system.",
      photoEvidence: 0,
      followUpRequired: false,
      insuranceClaim: "Filed - Claim #INS-2024-4892"
    },
    {
      id: "INC-004",
      title: "Staff Verbal Altercation",
      type: "complaint",
      severity: "medium",
      status: "resolved",
      eventId: "EVT-1237",
      eventName: "Annual Conference",
      reportedBy: "Manager on Duty",
      reportedDate: "2024-10-18T14:20:00",
      location: "Business Center - Break Room",
      description: "Two staff members had heated argument during break period. Voices raised, other staff uncomfortable. No physical contact. Immediately separated and moved to different event areas.",
      involvedParties: ["Server: David Martinez", "Setup Crew: James Wilson"],
      actionsTaken: "Both staff members separated immediately, manager conducted individual interviews, written warnings issued to both parties, scheduled for mediation session.",
      resolution: "Both staff members apologized, attended conflict resolution training. Placed on different shifts for 30 days. No repeat incidents.",
      photoEvidence: 0,
      followUpRequired: false
    },
    {
      id: "INC-005",
      title: "Missing Equipment - Portable Speakers",
      type: "theft",
      severity: "high",
      status: "open",
      eventId: "EVT-1238",
      eventName: "Charity Fundraiser",
      reportedBy: "Equipment Manager",
      reportedDate: "2024-10-21T10:00:00",
      location: "Luxury Hotel Ballroom",
      description: "Two portable speaker units (valued at $900 total) missing after event breakdown. Last seen during setup at 3pm. Not present during equipment count at 11pm. Venue security reviewing footage.",
      involvedParties: ["Various staff and vendors"],
      actionsTaken: "Venue security notified, police report filed, insurance claim initiated, all staff present interviewed, security footage requested.",
      photoEvidence: 1,
      followUpRequired: true,
      insuranceClaim: "Filed - Claim #INS-2024-4901"
    }
  ];

  // Summary stats
  const stats = {
    total: incidents.length,
    open: incidents.filter(i => i.status === 'open' || i.status === 'investigating').length,
    critical: incidents.filter(i => i.severity === 'critical').length,
    resolved: incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length,
    requireFollowUp: incidents.filter(i => i.followUpRequired).length
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Critical</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Medium</Badge>;
      case "low":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><AlertTriangle className="h-3 w-3 mr-1" />Open</Badge>;
      case "investigating":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100"><Clock className="h-3 w-3 mr-1" />Investigating</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>;
      case "closed":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100"><XCircle className="h-3 w-3 mr-1" />Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const types = {
      'injury': { label: 'Injury', className: 'bg-red-50 text-red-700 border-red-200' },
      'property-damage': { label: 'Property Damage', className: 'bg-orange-50 text-orange-700 border-orange-200' },
      'complaint': { label: 'Complaint', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      'safety': { label: 'Safety', className: 'bg-purple-50 text-purple-700 border-purple-200' },
      'theft': { label: 'Theft', className: 'bg-pink-50 text-pink-700 border-pink-200' },
      'other': { label: 'Other', className: 'bg-gray-50 text-gray-700 border-gray-200' }
    };
    const typeInfo = types[type as keyof typeof types] || types.other;
    return <Badge variant="outline" className={typeInfo.className}>{typeInfo.label}</Badge>;
  };

  // Filter incidents
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         incident.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === "all" || incident.severity === severityFilter;
    const matchesType = typeFilter === "all" || incident.type === typeFilter;
    const matchesTab = selectedTab === "all" || 
                      (selectedTab === "active" && (incident.status === 'open' || incident.status === 'investigating')) ||
                      (selectedTab === "critical" && incident.severity === 'critical') ||
                      (selectedTab === "resolved" && (incident.status === 'resolved' || incident.status === 'closed'));
    return matchesSearch && matchesSeverity && matchesType && matchesTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIncidents = filteredIncidents.slice(startIndex, startIndex + itemsPerPage);

  const handleNewReport = () => {
    toast.success("Incident report created successfully");
    setShowReportDialog(false);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Incident Management</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Track and manage event incidents and safety concerns
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
            <DialogTrigger asChild>
              <Button className="bg-sangria hover:bg-merlot">
                <Plus className="h-4 w-4 mr-2" />
                Report Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Report New Incident</DialogTitle>
                <DialogDescription>Document incident details for investigation and follow-up</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Incident Title *</Label>
                    <Input placeholder="Brief description of incident" />
                  </div>
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="injury">Injury</SelectItem>
                        <SelectItem value="property-damage">Property Damage</SelectItem>
                        <SelectItem value="complaint">Complaint</SelectItem>
                        <SelectItem value="safety">Safety Concern</SelectItem>
                        <SelectItem value="theft">Theft</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Severity *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Event</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="evt1">Corporate Gala 2024</SelectItem>
                        <SelectItem value="evt2">Wedding Reception</SelectItem>
                        <SelectItem value="evt3">Product Launch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Location *</Label>
                    <Input placeholder="Specific location where incident occurred" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Description *</Label>
                    <Textarea 
                      placeholder="Detailed description of what happened..." 
                      rows={4}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Immediate Actions Taken *</Label>
                    <Textarea 
                      placeholder="What steps were taken immediately after the incident..." 
                      rows={3}
                    />
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <p className="text-sm text-yellow-900">
                    ⚠️ For critical incidents (injuries, safety hazards): Ensure emergency services contacted if needed, area secured, and supervisor notified immediately.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowReportDialog(false)}>Cancel</Button>
                <Button className="bg-sangria hover:bg-merlot" onClick={handleNewReport}>
                  Submit Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Incidents</p>
              <p className="text-xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-xl font-semibold">{stats.open}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical</p>
              <p className="text-xl font-semibold">{stats.critical}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-xl font-semibold">{stats.resolved}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All Incidents</TabsTrigger>
          <TabsTrigger value="active">
            Active
            {stats.open > 0 && (
              <Badge className="ml-2 bg-orange-500 text-white h-5 w-5 p-0 flex items-center justify-center">
                {stats.open}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="critical">
            Critical
            {stats.critical > 0 && (
              <Badge className="ml-2 bg-red-500 text-white h-5 w-5 p-0 flex items-center justify-center">
                {stats.critical}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Incident Reports</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search incidents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full sm:w-[250px]"
                    />
                  </div>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="injury">Injury</SelectItem>
                      <SelectItem value="property-damage">Property Damage</SelectItem>
                      <SelectItem value="complaint">Complaint</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="theft">Theft</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paginatedIncidents.length > 0 ? (
                  paginatedIncidents.map((incident) => (
                    <div key={incident.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-sm text-muted-foreground">{incident.id}</span>
                            {getTypeBadge(incident.type)}
                            {getSeverityBadge(incident.severity)}
                            {getStatusBadge(incident.status)}
                          </div>
                          <h4 className="font-semibold text-lg mb-2">{incident.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{incident.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{new Date(incident.reportedDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{incident.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{incident.eventName}</span>
                            </div>
                            {incident.photoEvidence && incident.photoEvidence > 0 && (
                              <div className="flex items-center gap-2">
                                <Camera className="h-4 w-4 text-muted-foreground" />
                                <span>{incident.photoEvidence} photos</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-3 border-t">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setCurrentPage('incident-detail', { incidentId: incident.id })}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {incident.status !== 'closed' && (
                          <Button variant="outline" size="sm">
                            Update Status
                          </Button>
                        )}
                        {incident.followUpRequired && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700">
                            <Clock className="h-3 w-3 mr-1" />
                            Follow-up Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No incidents found</p>
                    <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredIncidents.length)} of {filteredIncidents.length} incidents
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageNum(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageNum(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}