import { useState, useEffect } from "react";
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
  History,
  Phone,
  Mail,
  Users,
  DollarSign,
  Search,
  UserPlus,
  Send,
  Zap,
  Save,
  Ban,
  Shield,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { eventService } from "../services/event.service";
import { staffService } from "../services/staff.service";

interface IncidentDetailProps {
  userRole: string;
  userId: string;
  incidentId?: string;
}

type IncidentType = 'injury' | 'property-damage' | 'complaint' | 'safety' | 'theft' | 'other';
type Severity = 'critical' | 'high' | 'medium' | 'low';
type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed';

interface Note { id: string; author: string; content: string; timestamp: string; }
interface TimelineEntry { id: string; action: string; by: string; timestamp: string; details: string; }

interface Incident {
  id: string;
  title: string;
  type: IncidentType;
  severity: Severity;
  status: IncidentStatus;
  eventId?: string;
  eventName?: string;
  reportedBy: string;
  reportedDate: string;
  location: string;
  description: string;
  involvedParties: string[];
  witnesses: string[];
  actionsTaken: string;
  resolution?: string;
  followUpRequired: boolean;
  notes: Note[];
  timeline: TimelineEntry[];
}

const LS_KEY = 'incidents_store';
function loadIncidents(): Incident[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function saveIncidents(list: Incident[]) { localStorage.setItem(LS_KEY, JSON.stringify(list)); }

export function IncidentDetail({ userRole, userId, incidentId }: IncidentDetailProps) {
  const { setCurrentPage } = useNavigation();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [staffList, setStaffList] = useState<{ id: string; name: string; role?: string }[]>([]);

  // Dialogs
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showReplacementDialog, setShowReplacementDialog] = useState(false);
  const [showPenaltyDialog, setShowPenaltyDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);

  // Form state
  const [contactMessage, setContactMessage] = useState("");
  const [selectedReplacement, setSelectedReplacement] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const [penaltyAmount, setPenaltyAmount] = useState("");
  const [penaltyType, setPenaltyType] = useState("financial");
  const [penaltyReason, setPenaltyReason] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [finalStatus, setFinalStatus] = useState<IncidentStatus>("resolved");
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    const all = loadIncidents();
    const found = all.find(i => i.id === incidentId);
    if (found) { setIncident(found); } else { setNotFound(true); }

    staffService.getStaffList({ take: 200 }).then((res: any) => {
      const data = Array.isArray(res) ? res : (res?.data || []);
      setStaffList(data.map((s: any) => ({
        id: s.id,
        name: s.name || s.user?.name || s.id,
        role: s.role || '',
      })));
    }).catch(() => {});
  }, [incidentId]);

  if (notFound || (!incident && !notFound)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Shield className="h-14 w-14 text-muted-foreground" />
        <p className="text-xl font-semibold text-muted-foreground">
          {notFound ? 'Incident not found' : 'Loadingâ€¦'}
        </p>
        {notFound && <p className="text-sm text-muted-foreground">This incident may have been removed or the ID is incorrect.</p>}
        <Button variant="outline" onClick={() => setCurrentPage('incident-management')}>
          <ArrowLeft className="h-4 w-4 mr-2" />Back to Incidents
        </Button>
      </div>
    );
  }

  // â”€â”€ Persist changes to localStorage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const update = (patch: Partial<Incident>) => {
    const updated = { ...incident!, ...patch };
    setIncident(updated);
    const all = loadIncidents();
    saveIncidents(all.map(i => i.id === updated.id ? updated : i));
  };

  const addTimeline = (action: string, details: string) => {
    const entry: TimelineEntry = {
      id: String(Date.now()),
      action,
      by: userRole,
      timestamp: new Date().toISOString(),
      details,
    };
    update({ timeline: [...(incident!.timeline || []), entry] });
  };

  // â”€â”€ Badges â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const getSeverityBadge = (s: Severity) => {
    switch (s) {
      case 'critical': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1"><Flame className="h-3 w-3" />Critical</Badge>;
      case 'high':     return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">High</Badge>;
      case 'medium':   return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Medium</Badge>;
      case 'low':      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Low</Badge>;
    }
  };

  const getStatusBadge = (s: IncidentStatus) => {
    switch (s) {
      case 'open':          return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1"><AlertTriangle className="h-3 w-3" />Open</Badge>;
      case 'investigating': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 gap-1"><Clock className="h-3 w-3" />Investigating</Badge>;
      case 'resolved':      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1"><CheckCircle className="h-3 w-3" />Resolved</Badge>;
      case 'closed':        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 gap-1"><XCircle className="h-3 w-3" />Closed</Badge>;
    }
  };

  const getTypeLabel = (t: IncidentType) => ({
    'injury': 'Injury', 'property-damage': 'Property Damage',
    'complaint': 'Complaint', 'safety': 'Safety Concern', 'theft': 'Theft', 'other': 'Other',
  }[t]);

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleStatusChange = async (newStatus: IncidentStatus) => {
    try { await eventService.updateIncident(incident!.id, { status: newStatus.toUpperCase() }); } catch { /* localStorage */ }
    update({ status: newStatus });
    addTimeline('Status Updated', `Status changed to ${newStatus}`);
    toast.success(`Status updated to ${newStatus}`);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: String(Date.now()),
      author: userRole,
      content: newNote.trim(),
      timestamp: new Date().toISOString(),
    };
    update({ notes: [...(incident!.notes || []), note] });
    addTimeline('Note Added', 'Internal note added to incident');
    toast.success('Note added');
    setNewNote('');
  };

  const handleContact = () => {
    if (!contactMessage.trim()) { toast.error('Please enter a message'); return; }
    addTimeline('Staff Contacted', `Message sent: "${contactMessage.trim().slice(0, 60)}â€¦"`);
    toast.success('Contact recorded in timeline');
    setShowContactDialog(false);
    setContactMessage('');
  };

  const handleAssignReplacement = () => {
    if (!selectedReplacement) { toast.error('Select a staff member'); return; }
    const staff = staffList.find(s => s.id === selectedReplacement);
    addTimeline('Replacement Assigned', `${staff?.name} assigned as replacement`);
    toast.success(`${staff?.name} assigned as replacement`);
    setShowReplacementDialog(false);
    setSelectedReplacement('');
    setStaffSearch('');
  };

  const handleApplyPenalty = () => {
    if (penaltyType === 'financial' && (!penaltyAmount || parseFloat(penaltyAmount) <= 0)) {
      toast.error('Enter a valid penalty amount'); return;
    }
    const detail = penaltyType === 'financial' ? `Financial penalty of $${penaltyAmount} applied` : `${penaltyType} applied`;
    addTimeline('Penalty Applied', detail + (penaltyReason ? ` â€” ${penaltyReason}` : ''));
    toast.success('Penalty recorded');
    setShowPenaltyDialog(false);
    setPenaltyAmount(''); setPenaltyReason('');
  };

  const handleResolve = async () => {
    if (!resolutionNotes.trim()) { toast.error('Provide resolution notes'); return; }
    try { await eventService.updateIncident(incident!.id, { status: finalStatus.toUpperCase(), resolution: resolutionNotes }); } catch { /* localStorage */ }
    update({ status: finalStatus, resolution: resolutionNotes });
    addTimeline('Incident Resolved', resolutionNotes.slice(0, 80));
    toast.success('Incident resolved');
    setShowResolveDialog(false);
    setResolutionNotes('');
  };

  const filteredStaff = staffList.filter(s =>
    !staffSearch || s.name.toLowerCase().includes(staffSearch.toLowerCase()) || (s.role || '').toLowerCase().includes(staffSearch.toLowerCase())
  );

  const isResolved = incident!.status === 'resolved' || incident!.status === 'closed';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setCurrentPage('incident-management')}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{incident!.title}</h1>
            <p className="text-sm text-muted-foreground">Incident #{incident!.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getSeverityBadge(incident!.severity)}
          {getStatusBadge(incident!.status)}
        </div>
      </div>

      {/* Quick Action Toolbar */}
      {!isResolved && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />Quick Resolution Actions
            </CardTitle>
            <CardDescription>Take immediate action without leaving the page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => setShowContactDialog(true)}>
                <Phone className="h-4 w-4 mr-2" />Contact Staff
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => setShowReplacementDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />Assign Replacement
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => setShowPenaltyDialog(true)}>
                <Ban className="h-4 w-4 mr-2" />Apply Penalty
              </Button>
              <Button className="w-full justify-start bg-sangria hover:bg-merlot" onClick={() => setShowResolveDialog(true)}>
                <CheckCircle2 className="h-4 w-4 mr-2" />Resolve Incident
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isResolved && incident!.resolution && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Resolution</p>
              <p className="text-sm text-green-700 mt-0.5">{incident!.resolution}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{incident!.description}</p>
              </div>
              {incident!.actionsTaken && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-2">Immediate Actions Taken</h4>
                    <p className="text-sm text-muted-foreground">{incident!.actionsTaken}</p>
                  </div>
                </>
              )}
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Type</p>
                    <p className="text-muted-foreground">{getTypeLabel(incident!.type)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Reported</p>
                    <p className="text-muted-foreground">{new Date(incident!.reportedDate).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">{incident!.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Event</p>
                    <p className="text-muted-foreground">{incident!.eventName || 'Not linked'}</p>
                  </div>
                </div>
              </div>
              {(incident!.involvedParties.length > 0 || (incident!.witnesses || []).length > 0) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    {incident!.involvedParties.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                          <Users className="h-4 w-4" />Involved Parties
                        </p>
                        <ul className="space-y-1">
                          {incident!.involvedParties.map((p, i) => (
                            <li key={i} className="text-sm text-muted-foreground">â€¢ {p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(incident!.witnesses || []).length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                          <User className="h-4 w-4" />Witnesses
                        </p>
                        <ul className="space-y-1">
                          {incident!.witnesses!.map((w, i) => (
                            <li key={i} className="text-sm text-muted-foreground">â€¢ {w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timeline & Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />Timeline & Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="timeline">
                <TabsList className="w-full">
                  <TabsTrigger value="timeline" className="flex-1">Timeline</TabsTrigger>
                  <TabsTrigger value="notes" className="flex-1">
                    Internal Notes
                    {(incident!.notes || []).length > 0 && (
                      <Badge className="ml-1.5 bg-primary text-white h-4 w-4 p-0 flex items-center justify-center text-xs rounded-full">
                        {incident!.notes.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="mt-4">
                  {(incident!.timeline || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No timeline entries yet</p>
                  ) : (
                    <div className="space-y-0">
                      {[...(incident!.timeline || [])].reverse().map((entry, idx, arr) => (
                        <div key={entry.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-sangria mt-1.5 flex-shrink-0" />
                            {idx < arr.length - 1 && <div className="w-0.5 bg-border flex-1 my-1" />}
                          </div>
                          <div className={`flex-1 pb-4 ${idx < arr.length - 1 ? '' : ''}`}>
                            <div className="flex items-start justify-between gap-2 mb-0.5">
                              <p className="font-medium text-sm">{entry.action}</p>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {new Date(entry.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{entry.details}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">by {entry.by}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="notes" className="mt-4 space-y-4">
                  {(incident!.notes || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No notes yet</p>
                  ) : (
                    <div className="space-y-3">
                      {[...(incident!.notes || [])].reverse().map(note => (
                        <div key={note.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-sm font-medium capitalize">{note.author}</p>
                            <span className="text-xs text-muted-foreground">{new Date(note.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2 pt-2 border-t">
                    <Label>Add Internal Note</Label>
                    <Textarea placeholder="Add a note about this incidentâ€¦" value={newNote}
                      onChange={e => setNewNote(e.target.value)} rows={3} />
                    <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                      <Save className="h-4 w-4 mr-2" />Add Note
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
                <Select value={incident!.status} onValueChange={v => handleStatusChange(v as IncidentStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-1 text-sm">
                <p className="font-medium">Follow-up Required</p>
                <p className="text-muted-foreground">{incident!.followUpRequired ? 'âš ï¸ Yes' : 'âœ… No'}</p>
              </div>
              <Separator />
              <div className="space-y-1 text-sm">
                <p className="font-medium">Reported By</p>
                <p className="text-muted-foreground capitalize">{incident!.reportedBy || 'â€”'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Event Info */}
          {incident!.eventName && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Related Event</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="font-medium">{incident!.eventName}</p>
                <p className="text-muted-foreground">{new Date(incident!.reportedDate).toLocaleDateString()}</p>
                <p className="text-muted-foreground">{incident!.location}</p>
                {incident!.eventId && (
                  <Button variant="outline" size="sm" className="w-full"
                    onClick={() => setCurrentPage('admin-event-detail', { eventId: incident!.eventId })}>
                    View Event Details
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Severity</span>
                {getSeverityBadge(incident!.severity)}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{getTypeLabel(incident!.type)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Involved</span>
                <span className="font-medium">{incident!.involvedParties.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Notes</span>
                <span className="font-medium">{(incident!.notes || []).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timeline events</span>
                <span className="font-medium">{(incident!.timeline || []).length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* â”€â”€ CONTACT STAFF DIALOG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Staff / Party</DialogTitle>
            <DialogDescription>Record a contact attempt with an involved party</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-muted/50 p-3 rounded-lg flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">Involved parties</p>
                <p className="text-muted-foreground">
                  {incident!.involvedParties.length > 0 ? incident!.involvedParties.join(', ') : 'None listed'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Message / Notes *</Label>
              <Textarea placeholder="Describe the contact attempt or message sentâ€¦" value={contactMessage}
                onChange={e => setContactMessage(e.target.value)} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactDialog(false)}>Cancel</Button>
            <Button onClick={handleContact}><Send className="h-4 w-4 mr-2" />Record Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€ ASSIGN REPLACEMENT DIALOG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Dialog open={showReplacementDialog} onOpenChange={setShowReplacementDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Replacement Staff</DialogTitle>
            <DialogDescription>Find and record a replacement assignment for this incident</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search staffâ€¦" value={staffSearch}
                onChange={e => setStaffSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {filteredStaff.length === 0
                ? <p className="text-sm text-muted-foreground text-center py-4">{staffList.length === 0 ? 'Loading staffâ€¦' : 'No staff match your search'}</p>
                : filteredStaff.map(s => (
                  <div key={s.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedReplacement === s.id ? 'border-sangria bg-sangria/5' : 'hover:bg-muted/50'}`}
                    onClick={() => setSelectedReplacement(s.id)}>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{s.name}</p>
                        {s.role && <p className="text-xs text-muted-foreground">{s.role}</p>}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplacementDialog(false)}>Cancel</Button>
            <Button onClick={handleAssignReplacement} disabled={!selectedReplacement}>
              <UserPlus className="h-4 w-4 mr-2" />Record Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€ PENALTY DIALOG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Dialog open={showPenaltyDialog} onOpenChange={setShowPenaltyDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Apply Penalty / Action</DialogTitle>
            <DialogDescription>Record disciplinary action related to this incident</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">Penalties are recorded in the timeline and can be referenced in payroll review.</p>
            </div>
            <div className="space-y-2">
              <Label>Action Type</Label>
              <Select value={penaltyType} onValueChange={setPenaltyType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financial Penalty</SelectItem>
                  <SelectItem value="written-warning">Written Warning</SelectItem>
                  <SelectItem value="suspension">Temporary Suspension</SelectItem>
                  <SelectItem value="termination">Contract Termination</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {penaltyType === 'financial' && (
              <div className="space-y-2">
                <Label>Amount ($)</Label>
                <Input type="number" min={0} step={0.01} placeholder="0.00" value={penaltyAmount}
                  onChange={e => setPenaltyAmount(e.target.value)} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea placeholder="Describe the reasonâ€¦" value={penaltyReason}
                onChange={e => setPenaltyReason(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPenaltyDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleApplyPenalty}>
              <Ban className="h-4 w-4 mr-2" />Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€ RESOLVE DIALOG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Resolve Incident</DialogTitle>
            <DialogDescription>Provide resolution details and close this incident</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Resolution Notes *</Label>
              <Textarea placeholder="Describe how this incident was resolvedâ€¦" value={resolutionNotes}
                onChange={e => setResolutionNotes(e.target.value)} rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Final Status</Label>
              <Select value={finalStatus} onValueChange={v => setFinalStatus(v as IncidentStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="resolved">Resolved â€” No further action</SelectItem>
                  <SelectItem value="closed">Closed â€” Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <p className="text-xs text-green-700">This incident will be marked as resolved and archived.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>Cancel</Button>
            <Button onClick={handleResolve} className="bg-sangria hover:bg-merlot">
              <CheckCircle2 className="h-4 w-4 mr-2" />Resolve Incident
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
