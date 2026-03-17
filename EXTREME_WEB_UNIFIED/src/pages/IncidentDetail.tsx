import { useState } from "react";
import { useNavigation } from "../contexts/NavigationContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { TooltipWrapper, IconTooltip, InfoTooltip } from "../components/ui/tooltip-wrapper";
import {
  ArrowLeft,
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  CheckCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  History,
  Image as ImageIcon,
  Phone,
  Mail,
  Users,
  DollarSign,
  Search,
  UserPlus,
  Send,
  Wrench,
  Zap,
  Save,
  Ban,
  Shield,
  FileWarning,
} from "lucide-react";
import { toast } from "sonner";

interface IncidentDetailProps {
  userRole: string;
  userId: string;
  incidentId?: string;
}

export function IncidentDetail({ userRole, userId, incidentId }: IncidentDetailProps) {
  const { setCurrentPage } = useNavigation();
  const [newNote, setNewNote] = useState("");
  const [status, setStatus] = useState("under-review");
  
  // Resolution action dialogs
  const [showContactStaffDialog, setShowContactStaffDialog] = useState(false);
  const [showReplacementDialog, setShowReplacementDialog] = useState(false);
  const [showPenaltyDialog, setShowPenaltyDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  
  // Resolution form states
  const [contactMessage, setContactMessage] = useState("");
  const [selectedReplacement, setSelectedReplacement] = useState("");
  const [penaltyAmount, setPenaltyAmount] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");

  // Mock incident data
  const incident = {
    id: incidentId || "INC-001",
    title: "Staff No-Show - Corporate Gala",
    type: "Staff Issue",
    severity: "high",
    status: "under-review",
    eventId: "event-001",
    eventName: "Annual Corporate Gala",
    eventDate: "2024-11-15",
    reportedBy: {
      id: "manager-1",
      name: "Michael Chen",
      role: "Event Manager",
      email: "michael.chen@extremestaffing.com",
    },
    reportedAt: "2024-11-15T18:30:00",
    description:
      "Head bartender Sarah Martinez failed to arrive at the venue. No prior communication or notification. Attempted to contact via phone and text with no response. Had to quickly assign backup staff.",
    location: "Grand Hotel Ballroom",
    address: "123 Main Street, Downtown, CA 90210",
    affectedStaff: [
      {
        id: "staff-001",
        name: "Sarah Martinez",
        role: "Head Bartender",
        phone: "+1 (555) 111-2222",
        email: "sarah.martinez@email.com",
      },
    ],
    attachments: [
      {
        id: "att-001",
        name: "text-message-screenshot.png",
        type: "image",
        url: "#",
        uploadedAt: "2024-11-15T18:35:00",
      },
      {
        id: "att-002",
        name: "incident-report.pdf",
        type: "document",
        url: "#",
        uploadedAt: "2024-11-15T18:40:00",
      },
    ],
    timeline: [
      {
        id: "1",
        action: "Incident Reported",
        by: "Michael Chen",
        timestamp: "2024-11-15T18:30:00",
        details: "Manager reported staff no-show",
      },
      {
        id: "2",
        action: "Status Updated",
        by: "Admin Team",
        timestamp: "2024-11-15T18:35:00",
        details: "Status changed to Under Review",
      },
      {
        id: "3",
        action: "Note Added",
        by: "Admin Team",
        timestamp: "2024-11-15T19:00:00",
        details: "Attempted to contact staff member via phone",
      },
    ],
    notes: [
      {
        id: "note-001",
        author: "Admin Team",
        content: "Called Sarah multiple times. Phone goes straight to voicemail. Will follow up tomorrow morning.",
        timestamp: "2024-11-15T19:00:00",
      },
      {
        id: "note-002",
        author: "Michael Chen",
        content: "Backup staff performed well. Event proceeded without major issues.",
        timestamp: "2024-11-15T23:15:00",
      },
    ],
    resolution: null,
    impact: {
      financialCost: 450,
      timeDelay: "30 minutes",
      clientNotified: true,
    },
  };

  // Mock available replacement staff
  const availableReplacements = [
    { id: "rep-1", name: "John Davis", role: "Head Bartender", rating: 4.9, hourlyRate: 45 },
    { id: "rep-2", name: "Emily Wilson", role: "Head Bartender", rating: 4.8, hourlyRate: 42 },
    { id: "rep-3", name: "Marcus Johnson", role: "Senior Bartender", rating: 4.7, hourlyRate: 38 },
  ];

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    toast.success("Note added to incident");
    setNewNote("");
  };

  const handleUpdateStatus = (newStatus: string) => {
    setStatus(newStatus);
    toast.success("Incident status updated");
  };

  const handleContactStaff = () => {
    if (!contactMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }
    
    toast.success(`Message sent to ${incident.affectedStaff[0].name}`);
    setShowContactStaffDialog(false);
    setContactMessage("");
    
    // Add to timeline
    incident.timeline.push({
      id: String(incident.timeline.length + 1),
      action: "Staff Contacted",
      by: "Admin Team",
      timestamp: new Date().toISOString(),
      details: "Sent message to staff member regarding incident",
    });
  };

  const handleAssignReplacement = () => {
    if (!selectedReplacement) {
      toast.error("Please select a replacement staff member");
      return;
    }
    
    const replacement = availableReplacements.find(r => r.id === selectedReplacement);
    toast.success(`${replacement?.name} assigned as replacement`);
    setShowReplacementDialog(false);
    setSelectedReplacement("");
  };

  const handleApplyPenalty = () => {
    if (!penaltyAmount || parseFloat(penaltyAmount) <= 0) {
      toast.error("Please enter a valid penalty amount");
      return;
    }
    
    toast.success(`Penalty of $${penaltyAmount} applied to staff member`);
    setShowPenaltyDialog(false);
    setPenaltyAmount("");
  };

  const handleResolveIncident = () => {
    if (!resolutionNotes.trim()) {
      toast.error("Please provide resolution notes");
      return;
    }
    
    toast.success("Incident marked as resolved");
    setStatus("resolved");
    setShowResolveDialog(false);
    setResolutionNotes("");
    setCurrentPage("incident-management");
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, { variant: any; icon: any; color: string }> = {
      critical: { variant: "destructive", icon: XCircle, color: "text-red-600" },
      high: { variant: "destructive", icon: AlertTriangle, color: "text-orange-600" },
      medium: { variant: "default", icon: AlertCircle, color: "text-yellow-600" },
      low: { variant: "secondary", icon: CheckCircle, color: "text-blue-600" },
    };
    const config = variants[severity] || variants.medium;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      open: "default",
      "under-review": "default",
      resolved: "secondary",
      closed: "secondary",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <TooltipWrapper content="Back to incidents list">
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage("incident-management")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </TooltipWrapper>
          <div>
            <h1 className="text-[#5E1916]">{incident.title}</h1>
            <p className="text-sm text-gray-600">Incident #{incident.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getSeverityBadge(incident.severity)}
          {getStatusBadge(incident.status)}
        </div>
      </div>

      {/* Quick Action Resolution Toolbar */}
      <Card className="border-[#5E1916]/20 bg-gradient-to-r from-[#5E1916]/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#5E1916]" />
            Quick Resolution Actions
          </CardTitle>
          <CardDescription>
            Take immediate action to resolve this incident without leaving the page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <TooltipWrapper content="Send message or call affected staff member">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowContactStaffDialog(true)}
              >
                <Phone className="h-4 w-4 mr-2" />
                Contact Staff
              </Button>
            </TooltipWrapper>

            <TooltipWrapper content="Find and assign replacement staff for this event">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowReplacementDialog(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Replacement
              </Button>
            </TooltipWrapper>

            <TooltipWrapper content="Apply penalty or disciplinary action to staff">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowPenaltyDialog(true)}
              >
                <Ban className="h-4 w-4 mr-2" />
                Apply Penalty
              </Button>
            </TooltipWrapper>

            <TooltipWrapper content="Mark incident as resolved with notes">
              <Button
                className="w-full justify-start bg-[#5E1916] hover:bg-[#4E0707]"
                onClick={() => setShowResolveDialog(true)}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Resolve Incident
              </Button>
            </TooltipWrapper>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Details */}
          <Card>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{incident.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Type</p>
                    <p className="text-sm text-gray-600">{incident.type}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Event Date</p>
                    <p className="text-sm text-gray-600">{incident.eventDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Reported At</p>
                    <p className="text-sm text-gray-600">
                      {new Date(incident.reportedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">{incident.location}</p>
                  </div>
                </div>
              </div>

              {/* Impact */}
              {userRole === "admin" && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Impact Assessment</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Financial Cost</p>
                        <p className="font-medium text-gray-900">
                          ${incident.impact.financialCost}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Time Delay</p>
                        <p className="font-medium text-gray-900">{incident.impact.timeDelay}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Client Notified</p>
                        <p className="font-medium text-gray-900">
                          {incident.impact.clientNotified ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Affected Staff */}
          <Card>
            <CardHeader>
              <CardTitle>Affected Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {incident.affectedStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{staff.name}</p>
                        <p className="text-sm text-gray-600">{staff.role}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {staff.phone}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {staff.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <TooltipWrapper content="View staff member's full profile">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage("staff-detail", { staffId: staff.id })}
                        >
                          View Profile
                        </Button>
                      </TooltipWrapper>
                      <TooltipWrapper content="Contact staff member directly">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowContactStaffDialog(true)}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      </TooltipWrapper>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline & Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Timeline & Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="timeline">
                <TabsList className="w-full">
                  <TabsTrigger value="timeline" className="flex-1">Timeline</TabsTrigger>
                  <TabsTrigger value="notes" className="flex-1">Internal Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    {incident.timeline.map((event) => (
                      <div key={event.id} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#5E1916] mt-2"></div>
                        <div className="flex-1 pb-3 border-b last:border-0">
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-medium text-sm">{event.action}</p>
                            <span className="text-xs text-gray-500">
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{event.details}</p>
                          <p className="text-xs text-gray-500 mt-1">by {event.by}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    {incident.notes.map((note) => (
                      <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">{note.author}</p>
                          <span className="text-xs text-gray-500">
                            {new Date(note.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{note.content}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>Add Internal Note</Label>
                    <Textarea
                      placeholder="Add a note about this incident..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={handleAddNote} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Status</Label>
                <Select value={status} onValueChange={handleUpdateStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="under-review">Under Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Reported By</p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{incident.reportedBy.name}</p>
                    <p className="text-xs text-gray-600">{incident.reportedBy.role}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Event */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Related Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">{incident.eventName}</p>
                <p className="text-xs text-gray-600 mt-1">{incident.eventDate}</p>
                <p className="text-xs text-gray-600">{incident.location}</p>
              </div>
              <TooltipWrapper content="View full event details">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setCurrentPage("admin-event-detail", { eventId: incident.eventId })}
                >
                  View Event Details
                </Button>
              </TooltipWrapper>
            </CardContent>
          </Card>

          {/* Attachments */}
          {incident.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {incident.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{attachment.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(attachment.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Contact Staff Dialog */}
      <Dialog open={showContactStaffDialog} onOpenChange={setShowContactStaffDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Staff Member</DialogTitle>
            <DialogDescription>
              Send a message to {incident.affectedStaff[0].name} regarding this incident
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <User className="h-10 w-10 rounded-full bg-gray-200 p-2" />
                <div>
                  <p className="font-medium">{incident.affectedStaff[0].name}</p>
                  <p className="text-sm text-gray-600">{incident.affectedStaff[0].phone}</p>
                  <p className="text-sm text-gray-600">{incident.affectedStaff[0].email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Type your message here..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={5}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Phone className="h-4 w-4 mr-2" />
                Call Instead
              </Button>
              <Button variant="outline" className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Email Instead
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactStaffDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleContactStaff}>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Replacement Dialog */}
      <Dialog open={showReplacementDialog} onOpenChange={setShowReplacementDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Replacement Staff</DialogTitle>
            <DialogDescription>
              Find and assign a replacement for {incident.affectedStaff[0].name} ({incident.affectedStaff[0].role})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input placeholder="Search available staff..." />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableReplacements.map((staff) => (
                <div
                  key={staff.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedReplacement === staff.id
                      ? "border-[#5E1916] bg-[#5E1916]/5"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedReplacement(staff.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{staff.name}</p>
                        <p className="text-sm text-gray-600">{staff.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${staff.hourlyRate}/hr</p>
                      <p className="text-sm text-gray-600">⭐ {staff.rating}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplacementDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignReplacement} disabled={!selectedReplacement}>
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apply Penalty Dialog */}
      <Dialog open={showPenaltyDialog} onOpenChange={setShowPenaltyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Penalty</DialogTitle>
            <DialogDescription>
              Apply a financial penalty or disciplinary action to {incident.affectedStaff[0].name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Important</p>
                  <p className="text-sm text-amber-700">
                    Penalties will be deducted from the staff member's next payment and recorded in their profile.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="penalty-amount">Penalty Amount ($)</Label>
              <Input
                id="penalty-amount"
                type="number"
                placeholder="0.00"
                value={penaltyAmount}
                onChange={(e) => setPenaltyAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Penalty Type</Label>
              <Select defaultValue="financial">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financial Penalty</SelectItem>
                  <SelectItem value="warning">Written Warning</SelectItem>
                  <SelectItem value="suspension">Temporary Suspension</SelectItem>
                  <SelectItem value="termination">Contract Termination</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea placeholder="Describe the reason for this penalty..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPenaltyDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleApplyPenalty}>
              <Ban className="h-4 w-4 mr-2" />
              Apply Penalty
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Incident Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Incident</DialogTitle>
            <DialogDescription>
              Provide resolution details and close this incident
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Resolution Notes</Label>
              <Textarea
                placeholder="Describe how this incident was resolved..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Final Status</Label>
              <Select defaultValue="resolved">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resolved">Resolved - No Further Action</SelectItem>
                  <SelectItem value="resolved-warning">Resolved - Warning Issued</SelectItem>
                  <SelectItem value="resolved-penalty">Resolved - Penalty Applied</SelectItem>
                  <SelectItem value="closed">Closed - Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                This incident will be marked as resolved and moved to the resolved incidents archive.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolveIncident} className="bg-[#5E1916] hover:bg-[#4E0707]">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Resolve Incident
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
