import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigation } from "../contexts/NavigationContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  AlertTriangle,
  Shield,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Users,
  Calendar,
  MapPin,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  AlertCircle,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { eventService } from "../services/event.service";

interface IncidentManagementProps {
  userRole: string;
  userId: string;
}

type IncidentType = 'injury' | 'property-damage' | 'complaint' | 'safety' | 'theft' | 'other';
type Severity = 'critical' | 'high' | 'medium' | 'low';
type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed';

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
  notes: any[];
  timeline: any[];
}

const SEVERITY_MAP: Record<string, Severity> = {
  CRITICAL: 'critical', HIGH: 'high', MEDIUM: 'medium', LOW: 'low',
  critical: 'critical', high: 'high', medium: 'medium', low: 'low',
};
const STATUS_MAP: Record<string, IncidentStatus> = {
  OPEN: 'open', INVESTIGATING: 'investigating', RESOLVED: 'resolved', CLOSED: 'closed',
  open: 'open', investigating: 'investigating', resolved: 'resolved', closed: 'closed',
};

function mapIncident(raw: any): Incident {
  return {
    id: raw.id,
    title: raw.title || '',
    type: (raw.type || 'other') as IncidentType,
    severity: SEVERITY_MAP[raw.severity] || 'medium',
    status: STATUS_MAP[raw.status] || 'open',
    eventId: raw.eventId || undefined,
    eventName: raw.event?.title || undefined,
    reportedBy: raw.reporter?.name || raw.reportedBy || '',
    reportedDate: raw.createdAt || new Date().toISOString(),
    location: raw.location || '',
    description: raw.description || '',
    involvedParties: raw.involvedParties || [],
    witnesses: raw.witnesses || [],
    actionsTaken: raw.actionsTaken || '',
    resolution: raw.resolution,
    followUpRequired: raw.followUpRequired || false,
    notes: raw.notes || [],
    timeline: raw.timeline || [],
  };
}

const BLANK_FORM = {
  title: '',
  type: 'other' as IncidentType,
  severity: 'medium' as Severity,
  eventId: '',
  location: '',
  description: '',
  involvedParties: '',
  witnesses: '',
  actionsTaken: '',
  followUpRequired: false as boolean,
};

export function IncidentManagement({ userRole, userId }: IncidentManagementProps) {
  const { setCurrentPage } = useNavigation();

  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [events, setEvents] = useState<{ id: string; title: string; venue?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [updatingIncident, setUpdatingIncident] = useState<Incident | null>(null);
  const [newStatus, setNewStatus] = useState<IncidentStatus>('open');

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await eventService.getIncidents();
      setIncidents(data.map(mapIncident));
    } catch {
      toast.error('Failed to load incidents');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchIncidents();
    eventService.getEvents({ take: 200 }).then((res: any) => {
      const data = Array.isArray(res) ? res : (res?.data || []);
      setEvents(data.map((e: any) => ({ id: e.id, title: e.title, venue: e.venue })));
    }).catch(() => {}).finally(() => setLoadingEvents(false));
  }, [fetchIncidents]);

  const stats = useMemo(() => ({
    total: incidents.length,
    open: incidents.filter(i => i.status === 'open' || i.status === 'investigating').length,
    critical: incidents.filter(i => i.severity === 'critical').length,
    resolved: incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length,
    followUp: incidents.filter(i => i.followUpRequired && i.status !== 'resolved' && i.status !== 'closed').length,
  }), [incidents]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return incidents.filter(i => {
      const matchQ = !q || i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.id.toLowerCase().includes(q) || (i.eventName || '').toLowerCase().includes(q);
      const matchSev = severityFilter === 'all' || i.severity === severityFilter;
      const matchType = typeFilter === 'all' || i.type === typeFilter;
      const matchTab =
        selectedTab === 'all' ||
        (selectedTab === 'active' && (i.status === 'open' || i.status === 'investigating')) ||
        (selectedTab === 'critical' && i.severity === 'critical') ||
        (selectedTab === 'resolved' && (i.status === 'resolved' || i.status === 'closed'));
      return matchQ && matchSev && matchType && matchTab;
    });
  }, [incidents, searchQuery, severityFilter, typeFilter, selectedTab]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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

  const getTypeBadge = (t: IncidentType) => {
    const map: Record<IncidentType, string> = {
      'injury': 'bg-red-50 text-red-700 border-red-200',
      'property-damage': 'bg-orange-50 text-orange-700 border-orange-200',
      'complaint': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'safety': 'bg-purple-50 text-purple-700 border-purple-200',
      'theft': 'bg-pink-50 text-pink-700 border-pink-200',
      'other': 'bg-gray-50 text-gray-700 border-gray-200',
    };
    const labels: Record<IncidentType, string> = {
      'injury': 'Injury', 'property-damage': 'Property Damage',
      'complaint': 'Complaint', 'safety': 'Safety', 'theft': 'Theft', 'other': 'Other',
    };
    return <Badge variant="outline" className={map[t]}>{labels[t]}</Badge>;
  };

  const handleSubmitReport = async () => {
    if (!form.title.trim()) { toast.error('Incident title is required'); return; }
    if (!form.description.trim()) { toast.error('Description is required'); return; }
    if (!form.location.trim()) { toast.error('Location is required'); return; }

    setSubmitting(true);
    try {
      const eventId = form.eventId || 'none';
      const result = await eventService.createIncident(eventId, {
        title: form.title,
        type: form.type,
        severity: form.severity.toUpperCase(),
        description: form.description,
        location: form.location,
        involvedParties: form.involvedParties.split(',').map(s => s.trim()).filter(Boolean),
        witnesses: form.witnesses.split(',').map(s => s.trim()).filter(Boolean),
        actionsTaken: form.actionsTaken,
        followUpRequired: form.followUpRequired,
      });

      setIncidents(prev => [mapIncident(result), ...prev]);
      toast.success('Incident report submitted');
      setShowReportDialog(false);
      setForm(BLANK_FORM);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to submit incident');
    }
    setSubmitting(false);
  };

  const openStatusDialog = (incident: Incident) => {
    setUpdatingIncident(incident);
    setNewStatus(incident.status);
    setShowStatusDialog(true);
  };

  const handleStatusUpdate = async () => {
    if (!updatingIncident) return;
    try {
      const now = new Date().toISOString();
      const updatedTimeline = [...(updatingIncident.timeline || []), {
        id: String(Date.now()),
        action: 'Status Updated',
        by: userRole,
        timestamp: now,
        details: `Status changed to ${newStatus}`,
      }];

      await eventService.updateIncident(updatingIncident.id, {
        status: newStatus.toUpperCase(),
        timeline: updatedTimeline,
      });

      setIncidents(prev => prev.map(i => i.id === updatingIncident.id
        ? { ...i, status: newStatus, timeline: updatedTimeline }
        : i
      ));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
    setShowStatusDialog(false);
    setUpdatingIncident(null);
  };

  const handleExport = () => {
    const csv = [
      ['ID','Title','Type','Severity','Status','Event','Location','Date'].join(','),
      ...incidents.map(i => [i.id, `"${i.title}"`, i.type, i.severity, i.status, `"${i.eventName || ''}"`, `"${i.location}"`, new Date(i.reportedDate).toLocaleDateString()].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'incidents.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Incidents exported');
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-semibold">
              {userRole === 'manager' ? 'Incident Reports' : 'Incident Management'}
            </h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {userRole === 'manager' ? 'Manager' : userRole === 'sub-admin' ? 'Sub-Admin' : 'Admin'}
            </Badge>
          </div>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Track and manage event incidents and safety concerns
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchIncidents} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={incidents.length === 0}>
            <Download className="h-4 w-4 mr-2" />Export
          </Button>
          <Button className="bg-sangria hover:bg-merlot" onClick={() => setShowReportDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />Report Incident
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div><p className="text-sm text-muted-foreground">Total</p><p className="text-xl font-semibold">{stats.total}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div><p className="text-sm text-muted-foreground">Active</p><p className="text-xl font-semibold">{stats.open}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div><p className="text-sm text-muted-foreground">Critical</p><p className="text-xl font-semibold">{stats.critical}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div><p className="text-sm text-muted-foreground">Resolved</p><p className="text-xl font-semibold">{stats.resolved}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div><p className="text-sm text-muted-foreground">Follow-up</p><p className="text-xl font-semibold">{stats.followUp}</p></div>
          </div>
        </Card>
      </div>

      {stats.critical > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <Flame className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Critical Incidents Require Immediate Attention</p>
            <p className="text-sm text-red-700 mt-0.5">
              {stats.critical} critical incident{stats.critical !== 1 ? 's' : ''} open. Review and take action immediately.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={v => { setSelectedTab(v); setPage(1); }}>
        <TabsList>
          <TabsTrigger value="all">All Incidents</TabsTrigger>
          <TabsTrigger value="active">
            Active
            {stats.open > 0 && <Badge className="ml-1.5 bg-orange-500 text-white h-4 w-4 p-0 flex items-center justify-center text-xs rounded-full">{stats.open}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="critical">
            Critical
            {stats.critical > 0 && <Badge className="ml-1.5 bg-red-500 text-white h-4 w-4 p-0 flex items-center justify-center text-xs rounded-full">{stats.critical}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Incident Reports</CardTitle>
                  <CardDescription>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search incidents..." value={searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setPage(1); }} className="pl-9 w-[220px]" />
                  </div>
                  <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                      <SelectValue />
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
                  <Select value={severityFilter} onValueChange={v => { setSeverityFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
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
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-16 text-muted-foreground">Loading incidents...</div>
                ) : incidents.length === 0 ? (
                  <div className="text-center py-16">
                    <Shield className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
                    <p className="font-semibold text-muted-foreground text-lg">No incidents recorded</p>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">Report an incident to start tracking safety concerns</p>
                    <Button onClick={() => setShowReportDialog(true)}><Plus className="h-4 w-4 mr-2" />Report First Incident</Button>
                  </div>
                ) : paginated.length === 0 ? (
                  <div className="text-center py-10">
                    <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No incidents match your filters</p>
                  </div>
                ) : paginated.map(incident => (
                  <div key={incident.id} className={`p-4 border rounded-lg hover:bg-muted/30 transition-colors ${incident.severity === 'critical' ? 'border-red-200 bg-red-50/30' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{incident.id.slice(0, 8)}</span>
                        {getTypeBadge(incident.type)}
                        {getSeverityBadge(incident.severity)}
                        {getStatusBadge(incident.status)}
                        {incident.followUpRequired && incident.status !== 'resolved' && incident.status !== 'closed' && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            <Clock className="h-3 w-3 mr-1" />Follow-up
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-base mb-1">{incident.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{incident.description}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{new Date(incident.reportedDate).toLocaleDateString()}</span>
                        {incident.location && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{incident.location}</span>}
                        {incident.eventName && <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />{incident.eventName}</span>}
                        {incident.involvedParties.length > 0 && <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{incident.involvedParties.length} involved</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      <Button variant="outline" size="sm"
                        onClick={() => setCurrentPage('incident-detail', { incidentId: incident.id })}>
                        <Eye className="h-4 w-4 mr-2" />View Details
                      </Button>
                      {incident.status !== 'closed' && (
                        <Button variant="outline" size="sm" onClick={() => openStatusDialog(incident)}>
                          <RefreshCw className="h-4 w-4 mr-2" />Update Status
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-5 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {(page - 1) * itemsPerPage + 1}–{Math.min(page * itemsPerPage, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* REPORT INCIDENT DIALOG */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report New Incident</DialogTitle>
            <DialogDescription>Document incident details for investigation and follow-up</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-2">
              <Label>Incident Title *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Brief, clear description of what happened" />
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as IncidentType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Select value={form.severity} onValueChange={v => setForm(f => ({ ...f, severity: v as Severity }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical - Immediate danger</SelectItem>
                  <SelectItem value="high">High - Significant impact</SelectItem>
                  <SelectItem value="medium">Medium - Moderate concern</SelectItem>
                  <SelectItem value="low">Low - Minor issue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Related Event (optional)</Label>
              <Select value={form.eventId || 'none'} onValueChange={v => setForm(f => ({ ...f, eventId: v === 'none' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder={loadingEvents ? 'Loading events...' : 'Select event...'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific event</SelectItem>
                  {events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}{e.venue ? ` - ${e.venue}` : ''}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Location *</Label>
              <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="Specific location where incident occurred" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Description *</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Detailed description of what happened..." rows={4} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Immediate Actions Taken</Label>
              <Textarea value={form.actionsTaken} onChange={e => setForm(f => ({ ...f, actionsTaken: e.target.value }))}
                placeholder="Steps taken immediately after the incident..." rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Involved Parties (comma-separated)</Label>
              <Input value={form.involvedParties} onChange={e => setForm(f => ({ ...f, involvedParties: e.target.value }))}
                placeholder="e.g. John Smith, Jane Doe" />
            </div>
            <div className="space-y-2">
              <Label>Witnesses (comma-separated)</Label>
              <Input value={form.witnesses} onChange={e => setForm(f => ({ ...f, witnesses: e.target.value }))}
                placeholder="e.g. Michael Lee" />
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <input type="checkbox" id="followUp" checked={form.followUpRequired}
                onChange={e => setForm(f => ({ ...f, followUpRequired: e.target.checked }))} className="h-4 w-4" />
              <Label htmlFor="followUp" className="cursor-pointer">Follow-up action required</Label>
            </div>
            {(form.severity === 'critical' || form.severity === 'high') && (
              <div className="col-span-2 bg-orange-50 border border-orange-200 p-3 rounded-lg">
                <p className="text-sm text-orange-900">
                  For critical/high incidents: Ensure emergency services have been contacted if needed, the area secured, and a supervisor notified immediately.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>Cancel</Button>
            <Button className="bg-sangria hover:bg-merlot" onClick={handleSubmitReport} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* STATUS UPDATE DIALOG */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Incident Status</DialogTitle>
            <DialogDescription>{updatingIncident?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={v => setNewStatus(v as IncidentStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>Cancel</Button>
            <Button onClick={handleStatusUpdate} className="bg-sangria hover:bg-merlot">Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
