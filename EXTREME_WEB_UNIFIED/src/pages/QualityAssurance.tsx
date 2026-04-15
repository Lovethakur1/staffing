import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import {
  Star,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Clock,
  Send,
  Eye,
  BarChart3,
  Users,
  Calendar,
  Award,
  ThumbsUp,
  ThumbsDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  RefreshCw,
  ClipboardList,
  Activity,
  Building2,
  MapPin,
  Inbox,
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner";
import { eventService } from "../services/event.service";
import { invoiceService } from "../services/invoice.service";
import { surveyService } from "../services/survey.service";

interface QualityAssuranceProps {
  userRole: string;
  userId: string;
}

interface SurveyRecord {
  id: string;
  eventName: string;
  clientName: string;
  clientEmail: string;
  eventDate: string;
  venue: string;
  invoiceStatus: string;
  invoiceId: string;
  surveyStatus: 'not_sent' | 'sent' | 'completed';
  sentDate?: string;
  completedDate?: string;
  overallRating?: number;
  responses?: {
    staffQuality: number;
    professionalism: number;
    punctuality: number;
    communication: number;
    valueForMoney: number;
  };
  comments?: string;
  wouldRecommend?: boolean;
}


export function QualityAssurance({ userRole, userId }: QualityAssuranceProps) {
  const { setCurrentPage } = useNavigation();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [surveyStatusFilter, setSurveyStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [surveyRecords, setSurveyRecords] = useState<SurveyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SurveyRecord | null>(null);
  const [surveyMessage, setSurveyMessage] = useState(
    "Thank you for choosing our staffing services. We'd love to hear about your experience. Please take a moment to complete this short survey."
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [events, invoices, surveys] = await Promise.all([
        eventService.getEvents({ take: 200 }),
        invoiceService.getInvoices({ take: 200 }),
        surveyService.getSurveys(),
      ]);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // Build invoice map keyed by eventId
      const invoiceByEvent: Record<string, any> = {};
      for (const inv of invoices) {
        if (inv.eventId) invoiceByEvent[inv.eventId] = inv;
      }
      // Build survey map keyed by eventId
      const surveyByEvent: Record<string, any> = {};
      for (const s of surveys) {
        if (s.eventId) surveyByEvent[s.eventId] = s;
      }
      // Past events only
      const pastEvents = events.filter((ev: any) => {
        const d = ev.date ? new Date(ev.date) : null;
        return d && d < today;
      });
      const records: SurveyRecord[] = pastEvents.map((ev: any) => {
        const inv = invoiceByEvent[ev.id];
        const survey = surveyByEvent[ev.id];
        return {
          id: ev.id,
          eventName: ev.title || '',
          clientName: ev.client?.user?.name || ev.client?.name || '',
          clientEmail: ev.client?.user?.email || ev.client?.email || '',
          eventDate: ev.date || '',
          venue: ev.venue || ev.location || '',
          invoiceStatus: inv?.status || 'NONE',
          invoiceId: inv?.id || '',
          surveyStatus: survey?.surveyStatus || 'not_sent',
          sentDate: survey?.sentDate || undefined,
          completedDate: survey?.completedDate || undefined,
          overallRating: survey?.overallRating || undefined,
          responses: survey?.responses || undefined,
          comments: survey?.comments || undefined,
          wouldRecommend: survey?.wouldRecommend ?? undefined,
        } as SurveyRecord;
      });
      // Sort: not_sent first, then by date desc
      records.sort((a, b) => {
        if (a.surveyStatus === 'not_sent' && b.surveyStatus !== 'not_sent') return -1;
        if (a.surveyStatus !== 'not_sent' && b.surveyStatus === 'not_sent') return 1;
        return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
      });
      setSurveyRecords(records);
    } catch { /* failed to load */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Derived stats from real data
  const stats = useMemo(() => {
    const total = surveyRecords.length;
    const sent = surveyRecords.filter(r => r.surveyStatus === 'sent').length;
    const completed = surveyRecords.filter(r => r.surveyStatus === 'completed').length;
    const notSent = surveyRecords.filter(r => r.surveyStatus === 'not_sent').length;
    const paidEvents = surveyRecords.filter(r => r.invoiceStatus === 'PAID').length;
    return { total, sent, completed, notSent, paidEvents };
  }, [surveyRecords]);

  // Filtered + paginated surveys
  const filteredRecords = useMemo(() => {
    return surveyRecords.filter(r => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || r.eventName.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q) || r.venue.toLowerCase().includes(q);
      const matchStatus = surveyStatusFilter === 'all' || r.surveyStatus === surveyStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [surveyRecords, searchQuery, surveyStatusFilter]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getSurveyStatusBadge = (status: SurveyRecord['surveyStatus']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Clock className="h-3 w-3 mr-1" />Awaiting Response</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"><Mail className="h-3 w-3 mr-1" />Not Sent</Badge>;
    }
  };

  const getInvoiceBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Paid</Badge>;
      case 'SENT': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Sent</Badge>;
      case 'OVERDUE': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Overdue</Badge>;
      case 'DRAFT': return <Badge variant="secondary">Draft</Badge>;
      case 'NONE': return <Badge variant="outline" className="text-muted-foreground">No Invoice</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
      ))}
      <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );

  const handleSendSurvey = async () => {
    if (!selectedRecord) return;
    try {
      await surveyService.createSurvey({
        eventId: selectedRecord.id,
        clientName: selectedRecord.clientName,
        clientEmail: selectedRecord.clientEmail,
        surveyStatus: 'sent',
        message: surveyMessage,
      });
      setSurveyRecords(prev => prev.map(r =>
        r.id === selectedRecord.id ? { ...r, surveyStatus: 'sent', sentDate: new Date().toISOString() } : r
      ));
      toast.success(`Survey sent to ${selectedRecord.clientName}`);
    } catch {
      toast.error('Failed to send survey');
    }
    setShowSendDialog(false);
    setSurveyMessage("Thank you for choosing our staffing services. We'd love to hear about your experience. Please take a moment to complete this short survey.");
  };

  // Category labels for the analytics section
  const CATEGORIES = [
    { key: 'staffQuality', label: 'Staff Quality' },
    { key: 'professionalism', label: 'Professionalism' },
    { key: 'punctuality', label: 'Punctuality' },
    { key: 'communication', label: 'Communication' },
    { key: 'valueForMoney', label: 'Value for Money' },
  ];

  const completedWithRatings = surveyRecords.filter(
    r => r.surveyStatus === 'completed' && r.overallRating && r.overallRating > 0
  );

  const avgRating = completedWithRatings.length
    ? (completedWithRatings.reduce((sum, r) => sum + (r.overallRating || 0), 0) / completedWithRatings.length).toFixed(1)
    : null;

  const recommendCount = surveyRecords.filter(r => r.wouldRecommend).length;
  const recommendTotal = surveyRecords.filter(r => r.surveyStatus === 'completed').length;
  const recommendRate = recommendTotal > 0 ? Math.round((recommendCount / recommendTotal) * 100) : null;

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Quality Assurance & Feedback</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              Admin
            </Badge>
          </div>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Post-event surveys and client satisfaction tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => { setActiveTab("analytics"); }}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button
            className="bg-sangria hover:bg-merlot"
            onClick={() => {
              const first = surveyRecords.find(r => r.surveyStatus === 'not_sent');
              if (!first) { toast.info("All surveys have been sent"); return; }
              setSelectedRecord(first);
              setShowSendDialog(true);
            }}
          >
            <Send className="h-4 w-4 mr-2" />
            Send Next Survey
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Past Events</p>
              <p className="text-xl font-semibold">{loading ? '—' : stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Surveys Pending</p>
              <p className="text-xl font-semibold">{loading ? '—' : stats.notSent}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Satisfaction</p>
              <p className="text-xl font-semibold">
                {loading ? '—' : avgRating ? `${avgRating} / 5` : 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recommend Rate</p>
              <p className="text-xl font-semibold">
                {loading ? '—' : recommendRate !== null ? `${recommendRate}%` : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="surveys">
            Surveys
            {!loading && stats.notSent > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-white h-4 w-4 p-0 flex items-center justify-center text-xs rounded-full">
                {stats.notSent}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Survey Pipeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-5 w-5 text-primary" />
                  Survey Pipeline
                </CardTitle>
                <CardDescription>Current status of post-event surveys</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                          Surveys Sent / Awaiting
                        </span>
                        <span className="text-sm font-semibold">{stats.sent}</span>
                      </div>
                      <Progress value={stats.total ? (stats.sent / stats.total) * 100 : 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                          Responses Received
                        </span>
                        <span className="text-sm font-semibold">{stats.completed}</span>
                      </div>
                      <Progress value={stats.total ? (stats.completed / stats.total) * 100 : 0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                          Pending (not yet sent)
                        </span>
                        <span className="text-sm font-semibold">{stats.notSent}</span>
                      </div>
                      <Progress value={stats.total ? (stats.notSent / stats.total) * 100 : 0} className="h-2" />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Response Rate</span>
                      <span className="font-semibold">
                        {stats.sent > 0 ? `${Math.round((stats.completed / stats.sent) * 100)}%` : '—'}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Satisfaction Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Satisfaction Summary
                </CardTitle>
                <CardDescription>Based on completed survey responses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {completedWithRatings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Inbox className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="font-medium text-muted-foreground">No feedback received yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Send surveys to your clients to start collecting satisfaction data</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
                      <div className="text-4xl font-bold text-primary">{avgRating}</div>
                      <div>
                        <div className="flex gap-0.5 mb-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} className={`h-5 w-5 ${i < Math.round(Number(avgRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">out of 5.0 — {completedWithRatings.length} responses</p>
                      </div>
                    </div>
                    {CATEGORIES.map(cat => {
                      const catRatings = completedWithRatings.filter(r => r.responses?.[cat.key as keyof typeof r.responses]);
                      const avg = catRatings.length
                        ? catRatings.reduce((sum, r) => sum + (r.responses?.[cat.key as keyof typeof r.responses] || 0), 0) / catRatings.length
                        : 0;
                      return (
                        <div key={cat.key}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">{cat.label}</span>
                            <span className="text-sm font-medium">{avg > 0 ? avg.toFixed(1) : '—'}</span>
                          </div>
                          <Progress value={(avg / 5) * 100} className="h-1.5" />
                        </div>
                      );
                    })}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Events Needing Surveys */}
          {stats.notSent > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Events Needing Surveys ({stats.notSent})
                </CardTitle>
                <CardDescription>Past events where no survey has been sent yet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {surveyRecords.filter(r => r.surveyStatus === 'not_sent').slice(0, 5).map(r => (
                    <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{r.eventName}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {r.clientName} · {r.venue}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(r.eventDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        {getInvoiceBadge(r.invoiceStatus)}
                        <Button
                          size="sm"
                          onClick={() => { setSelectedRecord(r); setShowSendDialog(true); }}
                        >
                          <Send className="h-3.5 w-3.5 mr-1.5" />
                          Send Survey
                        </Button>
                      </div>
                    </div>
                  ))}
                  {stats.notSent > 5 && (
                    <Button variant="ghost" className="w-full" onClick={() => setActiveTab("surveys")}>
                      View all {stats.notSent} pending surveys →
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── SURVEYS TAB ──────────────────────────────────────── */}
        <TabsContent value="surveys" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Post-Event Survey Management</CardTitle>
                  <CardDescription>
                    {loading ? 'Loading…' : `${filteredRecords.length} of ${surveyRecords.length} past events`}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchData()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by event, client, or venue…"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                    className="pl-9"
                  />
                </div>
                <Select value={surveyStatusFilter} onValueChange={(v) => { setSurveyStatusFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="not_sent">Not Sent</SelectItem>
                    <SelectItem value="sent">Awaiting Response</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Event</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Survey Status</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                          Loading events…
                        </TableCell>
                      </TableRow>
                    ) : paginatedRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground font-medium">No events found</p>
                          <p className="text-sm text-muted-foreground mt-1">Try adjusting filters</p>
                        </TableCell>
                      </TableRow>
                    ) : paginatedRecords.map(r => (
                      <TableRow key={r.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium max-w-[180px] truncate">{r.eventName}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{r.clientName || '—'}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[140px]">{r.clientEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {r.eventDate ? new Date(r.eventDate).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell className="text-sm max-w-[120px] truncate">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{r.venue || '—'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getInvoiceBadge(r.invoiceStatus)}</TableCell>
                        <TableCell>{getSurveyStatusBadge(r.surveyStatus)}</TableCell>
                        <TableCell>
                          {r.surveyStatus === 'completed' && r.overallRating
                            ? renderStars(r.overallRating)
                            : <span className="text-muted-foreground text-sm">—</span>
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          {r.surveyStatus === 'not_sent' ? (
                            <Button
                              size="sm"
                              onClick={() => { setSelectedRecord(r); setShowSendDialog(true); }}
                            >
                              <Send className="h-3.5 w-3.5 mr-1.5" />
                              Send Survey
                            </Button>
                          ) : r.surveyStatus === 'sent' ? (
                            <Button variant="outline" size="sm" disabled>
                              <Clock className="h-3.5 w-3.5 mr-1.5" />
                              Awaiting
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setSelectedRecord(r); setShowDetailDialog(true); }}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5" />
                              View
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * itemsPerPage + 1}–{Math.min(page * itemsPerPage, filteredRecords.length)} of {filteredRecords.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
                      <Button
                        key={n}
                        variant={page === n ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(n)}
                        className={page === n ? "bg-sangria hover:bg-merlot" : ""}
                      >{n}</Button>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── RESPONSES TAB ─────────────────────────────────────── */}
        <TabsContent value="responses" className="mt-6">
          {completedWithRatings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Responses Yet</h3>
                <p className="text-muted-foreground text-center max-w-sm mb-6">
                  Client feedback will appear here once surveys have been sent and completed. Send surveys from the Surveys tab to start collecting responses.
                </p>
                <Button onClick={() => setActiveTab("surveys")}>
                  <Send className="h-4 w-4 mr-2" />
                  Go to Surveys
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedWithRatings.map(r => (
                <Card key={r.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{r.clientName}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-sm text-muted-foreground">{r.eventName}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Event: {r.eventDate ? new Date(r.eventDate).toLocaleDateString() : '—'}
                          {r.completedDate && ` · Responded: ${new Date(r.completedDate).toLocaleDateString()}`}
                        </p>
                        {r.comments && (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm italic">"{r.comments}"</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {r.overallRating && renderStars(r.overallRating)}
                        {r.wouldRecommend !== undefined && (
                          r.wouldRecommend
                            ? <Badge className="bg-green-100 text-green-700"><ThumbsUp className="h-3 w-3 mr-1" />Recommends</Badge>
                            : <Badge className="bg-red-100 text-red-700"><ThumbsDown className="h-3 w-3 mr-1" />Doesn't Recommend</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── ANALYTICS TAB ─────────────────────────────────────── */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Past Events</p>
                    <p className="text-2xl font-semibold">{loading ? '—' : stats.total}</p>
                  </div>
                </div>
                <Progress value={100} className="h-1.5 bg-blue-100" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Survey Sent Rate</p>
                    <p className="text-2xl font-semibold">
                      {loading || !stats.total ? '—' : `${Math.round(((stats.sent + stats.completed) / stats.total) * 100)}%`}
                    </p>
                  </div>
                </div>
                <Progress
                  value={stats.total ? ((stats.sent + stats.completed) / stats.total) * 100 : 0}
                  className="h-1.5"
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Invoiced (Paid)</p>
                    <p className="text-2xl font-semibold">
                      {loading ? '—' : `${stats.paidEvents} / ${stats.total}`}
                    </p>
                  </div>
                </div>
                <Progress
                  value={stats.total ? (stats.paidEvents / stats.total) * 100 : 0}
                  className="h-1.5"
                />
              </CardContent>
            </Card>
          </div>

          {/* Category breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Satisfaction by Category
              </CardTitle>
              <CardDescription>Average scores across all completed survey responses</CardDescription>
            </CardHeader>
            <CardContent>
              {completedWithRatings.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <Inbox className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No completed responses yet</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {CATEGORIES.map(cat => {
                    const catRatings = completedWithRatings.filter(r => r.responses?.[cat.key as keyof typeof r.responses]);
                    const avg = catRatings.length
                      ? catRatings.reduce((sum, r) => sum + (r.responses?.[cat.key as keyof typeof r.responses] || 0), 0) / catRatings.length
                      : 0;
                    const pct = (avg / 5) * 100;
                    const color = avg >= 4 ? 'text-green-600' : avg >= 3 ? 'text-yellow-600' : 'text-red-600';
                    return (
                      <div key={cat.key}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{cat.label}</span>
                          <div className="flex items-center gap-3">
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(avg) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <span className={`text-sm font-semibold w-7 text-right ${color}`}>
                              {avg > 0 ? avg.toFixed(1) : '—'}
                            </span>
                          </div>
                        </div>
                        <Progress value={pct} className="h-2.5" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice status breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invoice Status Breakdown</CardTitle>
              <CardDescription>Distribution of past events by billing status</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : (
                <div className="space-y-3">
                  {(['PAID', 'SENT', 'OVERDUE', 'DRAFT', 'NONE'] as const).map(status => {
                    const count = surveyRecords.filter(r => r.invoiceStatus === status).length;
                    if (count === 0) return null;
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <div className="w-24 flex-shrink-0">{getInvoiceBadge(status)}</div>
                        <div className="flex-1">
                          <Progress value={stats.total ? (count / stats.total) * 100 : 0} className="h-2" />
                        </div>
                        <span className="text-sm font-medium w-10 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── SEND SURVEY DIALOG ──────────────────────────────────────── */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Post-Event Survey</DialogTitle>
            <DialogDescription>
              Send a satisfaction survey to the client for the selected event.
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{selectedRecord.eventName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{selectedRecord.clientName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{selectedRecord.clientEmail || 'No email on file'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {selectedRecord.eventDate ? new Date(selectedRecord.eventDate).toLocaleDateString() : '—'} · {selectedRecord.venue}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="survey-message">Personalized Message</Label>
                <Textarea
                  id="survey-message"
                  value={surveyMessage}
                  onChange={e => setSurveyMessage(e.target.value)}
                  rows={4}
                  placeholder="Write a personal message to the client…"
                />
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  The survey will cover: Overall Satisfaction, Staff Quality, Professionalism, Punctuality, Communication, and Value for Money.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>Cancel</Button>
            <Button onClick={handleSendSurvey} className="bg-sangria hover:bg-merlot">
              <Send className="h-4 w-4 mr-2" />
              Send Survey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── FEEDBACK DETAIL DIALOG ──────────────────────────────────── */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              {selectedRecord?.eventName} — {selectedRecord?.clientName}
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-5 py-4">
              {selectedRecord.overallRating ? (
                <>
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Overall Rating</p>
                      {renderStars(selectedRecord.overallRating)}
                    </div>
                    <div className="text-right">
                      {selectedRecord.completedDate && (
                        <p className="text-xs text-muted-foreground">
                          Submitted {new Date(selectedRecord.completedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {selectedRecord.responses && (
                    <div>
                      <p className="font-semibold text-sm mb-3">Category Ratings</p>
                      <div className="space-y-3">
                        {CATEGORIES.map(cat => {
                          const val = selectedRecord.responses?.[cat.key as keyof typeof selectedRecord.responses] || 0;
                          return (
                            <div key={cat.key}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm">{cat.label}</span>
                                <span className="text-sm font-medium">{val}/5</span>
                              </div>
                              <Progress value={(val / 5) * 100} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {selectedRecord.comments && (
                    <div>
                      <p className="font-semibold text-sm mb-2">Client Comments</p>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm italic">"{selectedRecord.comments}"</p>
                      </div>
                    </div>
                  )}
                  {selectedRecord.wouldRecommend !== undefined && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${selectedRecord.wouldRecommend ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      {selectedRecord.wouldRecommend
                        ? <><ThumbsUp className="h-4 w-4 text-green-600" /><p className="text-sm text-green-900 font-medium">Client would recommend our services</p></>
                        : <><ThumbsDown className="h-4 w-4 text-red-600" /><p className="text-sm text-red-900 font-medium">Client would not recommend our services</p></>
                      }
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No detailed feedback available</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
