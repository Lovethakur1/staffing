import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Clock,
  Download,
  Plus,
  CheckCircle,
  AlertCircle,
  Calendar,
  Timer,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  XCircle,
  Users,
  ClipboardCheck,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { financeService } from "../services/finance.service";
import { toast } from "sonner";

interface TimesheetsProps {
  userRole: string;
  userId: string;
}

export function Timesheets({ userRole, userId }: TimesheetsProps) {
  const { setCurrentPage } = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPageNum] = useState(1);
  const [allTimesheets, setAllTimesheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(userRole === 'manager' ? 'my-timesheets' : 'all');
  const itemsPerPage = 10;

  // Determine role capabilities
  const canApprove = userRole === 'admin' || userRole === 'sub-admin' || userRole === 'manager';
  const isPersonalView = userRole === 'staff';
  const hasTeamView = userRole === 'manager';

  useEffect(() => {
    const fetchTimesheets = async () => {
      try {
        const raw = await financeService.getTimesheets();
        const mapped = raw.map((ts: any) => ({
          id: ts.id,
          weekEnding: ts.shift?.date || (ts.clockInTime ? ts.clockInTime.split('T')[0] : ''),
          status: (ts.status || 'draft').toLowerCase(),
          totalHours: ts.totalHours || 0,
          regularHours: ts.regularHours || 0,
          grossPay: ts.grossPay || 0,
          submittedDate: ts.clockInTime ? ts.clockInTime.split('T')[0] : null,
          approvedDate: ts.approvedAt ? ts.approvedAt.split('T')[0] : null,
          paidDate: null,
          shiftsCount: 1,
          staffId: ts.staffId || '',
          staffName: ts.staff?.name || '',
          eventName: ts.shift?.event?.title || '',
        }));
        setAllTimesheets(mapped);
      } catch (err) {
        toast.error('Failed to load timesheets');
      } finally {
        setLoading(false);
      }
    };
    fetchTimesheets();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "submitted":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><AlertCircle className="h-3 w-3 mr-1" />Submitted</Badge>;
      case "paid":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case "draft":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Compute summary from live data
  const computeSummary = (timesheets: any[]) => ({
    weeklyAverage: timesheets.length > 0
      ? parseFloat((timesheets.reduce((s, t) => s + (t.totalHours || 0), 0) / timesheets.length).toFixed(1))
      : 0,
    monthlyTotal: timesheets.reduce((s, t) => s + (t.regularHours || 0), 0),
    pendingApproval: timesheets
      .filter(t => t.status === 'submitted')
      .reduce((s, t) => s + (t.totalHours || 0), 0),
    totalEarnings: timesheets
      .filter(t => t.status === 'paid' || t.status === 'approved')
      .reduce((s, t) => s + (t.grossPay || 0), 0),
    pendingCount: timesheets.filter(t => t.status === 'submitted').length,
    approvedCount: timesheets.filter(t => t.status === 'approved').length,
    totalCount: timesheets.length,
  });

  // Get timesheets filtered by current tab context
  const getContextTimesheets = () => {
    if (isPersonalView) {
      // Staff only sees their own
      return allTimesheets.filter(t => t.staffId === userId);
    }
    if (hasTeamView && activeTab === 'my-timesheets') {
      // Manager's personal timesheets
      return allTimesheets.filter(t => t.staffId === userId);
    }
    // All timesheets for admin, sub-admin, or manager team view
    return allTimesheets;
  };

  const contextTimesheets = getContextTimesheets();
  const timesheetSummary = computeSummary(contextTimesheets);

  // Role-specific header config
  const getHeaderConfig = () => {
    if (userRole === 'staff') {
      return { title: 'Timesheets', description: 'Track your hours and manage timesheet submissions' };
    }
    if (userRole === 'manager') {
      return activeTab === 'my-timesheets'
        ? { title: 'My Timesheets', description: 'View and manage your personal timesheet entries' }
        : { title: 'Team Timesheets', description: 'Review and approve your team\'s timesheet submissions' };
    }
    if (userRole === 'sub-admin') {
      return { title: 'Timesheets', description: 'Manage and approve staff timesheet submissions' };
    }
    return { title: 'Timesheets', description: 'Track hours and manage timesheet submissions' };
  };

  const headerConfig = getHeaderConfig();

  const handleApproveTimesheet = async (timesheetId: string) => {
    try {
      await financeService.updateTimesheet(timesheetId, { status: 'approved' });
      setAllTimesheets(prev => prev.map(t => t.id === timesheetId ? { ...t, status: 'approved', approvedDate: new Date().toISOString().split('T')[0] } : t));
      toast.success('Timesheet approved');
    } catch {
      toast.error('Failed to approve timesheet');
    }
  };

  const handleRejectTimesheet = async (timesheetId: string) => {
    try {
      await financeService.updateTimesheet(timesheetId, { status: 'rejected' });
      setAllTimesheets(prev => prev.map(t => t.id === timesheetId ? { ...t, status: 'rejected' } : t));
      toast.success('Timesheet rejected');
    } catch {
      toast.error('Failed to reject timesheet');
    }
  };

  // Filter timesheets
  const filteredTimesheets = contextTimesheets.filter(ts => {
    const matchesSearch = ts.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ts.weekEnding || '').includes(searchQuery) ||
      (ts.staffName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ts.eventName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ts.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTimesheets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTimesheets = filteredTimesheets.slice(startIndex, startIndex + itemsPerPage);

  const handleViewTimesheet = (timesheetId: string) => {
    setCurrentPage('timesheet-detail', { timesheetId });
  };

  const handleAddManualEntry = () => {
    setCurrentPage('timesheet-manual-entry');
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading timesheets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">{headerConfig.title}</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            {headerConfig.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="current">Current Period</SelectItem>
              <SelectItem value="last30">Last 30 Days</SelectItem>
              <SelectItem value="last90">Last 90 Days</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {(isPersonalView || (hasTeamView && activeTab === 'my-timesheets')) && (
            <Button
              size="sm"
              className="bg-sangria hover:bg-merlot"
              onClick={handleAddManualEntry}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Timesheet
            </Button>
          )}
        </div>
      </div>

      {/* Manager Tab Toggle */}
      {hasTeamView && (
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPageNum(1); setSearchQuery(''); setStatusFilter('all'); }}>
          <TabsList>
            <TabsTrigger value="my-timesheets" className="gap-2">
              <Clock className="h-4 w-4" />
              My Timesheets
            </TabsTrigger>
            <TabsTrigger value="team-timesheets" className="gap-2">
              <Users className="h-4 w-4" />
              Team Timesheets
              {timesheetSummary.pendingCount > 0 && activeTab !== 'team-timesheets' && (
                <Badge className="bg-orange-100 text-orange-700 ml-1 text-xs px-1.5">{computeSummary(allTimesheets).pendingCount}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {canApprove && (!hasTeamView || activeTab === 'team-timesheets') ? 'Total Timesheets' : 'Weekly Average'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">
              {canApprove && (!hasTeamView || activeTab === 'team-timesheets')
                ? timesheetSummary.totalCount
                : `${timesheetSummary.weeklyAverage}h`}
            </div>
            <p className="text-xs text-muted-foreground">
              {canApprove && (!hasTeamView || activeTab === 'team-timesheets') ? 'All records' : 'Last 4 weeks'}
            </p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {canApprove && (!hasTeamView || activeTab === 'team-timesheets') ? 'Approved' : 'Monthly Total'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">
              {canApprove && (!hasTeamView || activeTab === 'team-timesheets')
                ? timesheetSummary.approvedCount
                : `${timesheetSummary.monthlyTotal}h`}
            </div>
            <p className="text-xs text-muted-foreground">
              {canApprove && (!hasTeamView || activeTab === 'team-timesheets') ? 'Timesheets approved' : 'This month'}
            </p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">
              {canApprove && (!hasTeamView || activeTab === 'team-timesheets')
                ? timesheetSummary.pendingCount
                : `${timesheetSummary.pendingApproval}h`}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="w-4 h-4" />
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">${timesheetSummary.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Timesheets DataTable */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>
              {hasTeamView && activeTab === 'team-timesheets' ? 'Team Timesheets' : 'All Timesheets'}
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={canApprove ? "Search by staff, event..." : "Search timesheets..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-[250px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Timesheet ID</TableHead>
                  {(canApprove && (!hasTeamView || activeTab === 'team-timesheets')) && (
                    <TableHead className="font-semibold">Staff Member</TableHead>
                  )}
                  <TableHead className="font-semibold">Event</TableHead>
                  <TableHead className="font-semibold">Week Ending</TableHead>
                  <TableHead className="font-semibold">Total Hours</TableHead>
                  <TableHead className="font-semibold">Regular</TableHead>
                  <TableHead className="font-semibold">Gross Pay</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTimesheets.length > 0 ? (
                  paginatedTimesheets.map((timesheet) => (
                    <TableRow key={timesheet.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{timesheet.id}</TableCell>
                      {(canApprove && (!hasTeamView || activeTab === 'team-timesheets')) && (
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{timesheet.staffName || 'Staff'}</p>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <span className="text-sm">{timesheet.eventName || '—'}</span>
                      </TableCell>
                      <TableCell>
                        {timesheet.weekEnding ? new Date(timesheet.weekEnding).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell>{timesheet.totalHours}h</TableCell>
                      <TableCell>{timesheet.regularHours}h</TableCell>
                      <TableCell className="font-medium">
                        ${(timesheet.grossPay || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{getStatusBadge(timesheet.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewTimesheet(timesheet.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {canApprove && timesheet.status === 'submitted' && (!hasTeamView || activeTab === 'team-timesheets') && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleApproveTimesheet(timesheet.id)}
                                title="Approve timesheet"
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleRejectTimesheet(timesheet.id)}
                                title="Reject timesheet"
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={canApprove && (!hasTeamView || activeTab === 'team-timesheets') ? 9 : 8} className="text-center py-12">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No timesheets found</p>
                      <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTimesheets.length)} of {filteredTimesheets.length} timesheets
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPageNum(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPageNum(page)}
                      className={currentPage === page ? "bg-sangria hover:bg-merlot" : ""}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPageNum(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
