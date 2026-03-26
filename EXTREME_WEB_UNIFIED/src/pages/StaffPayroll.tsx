import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { InfoTooltip } from "../components/ui/tooltip-wrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Search,
  Plus,
  Eye,
  TrendingUp,
  Calendar,
  FileText,
  Send
} from "lucide-react";
import { toast } from "sonner";
import { useNavigation } from "../contexts/NavigationContext";
import { financeService } from "../services/finance.service";

interface StaffPayrollProps {
  userRole: string;
  userId: string;
}

export function StaffPayroll({ userRole }: StaffPayrollProps) {
  const { setCurrentPage } = useNavigation();
  const [activeTab, setActiveTab] = useState("pending-submissions");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("month");
  const [isLoading, setIsLoading] = useState(true);

  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [staffSummaries, setStaffSummaries] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [tsRaw, runsRaw, approvedRaw] = await Promise.all([
          financeService.getTimesheets({ status: 'PENDING', take: 200 } as any),
          financeService.getPayrollRuns({ take: 100 }),
          financeService.getTimesheets({ status: 'APPROVED', take: 500 } as any),
        ]);

        // ── Pending timesheet submissions ────────────────────────────────
        const tsArr = Array.isArray(tsRaw) ? tsRaw : (tsRaw?.data || []);
        setPendingSubmissions(tsArr.map((ts: any) => ({
          id: ts.id,
          staffName: ts.staff?.name || 'Staff Member',
          staffId: ts.staffId || '',
          submittedDate: ts.clockInTime?.split('T')[0] || '',
          shiftTitle: ts.shift?.event?.title || ts.shift?.role || '—',
          totalHours: ts.totalHours ?? 0,
          estimatedPay: (ts.totalHours ?? 0) * (ts.shift?.hourlyRate ?? 0),
          status: (ts.status || 'pending').toLowerCase(),
        })));

        // ── Payroll runs ─────────────────────────────────────────────────
        const runsArr = Array.isArray(runsRaw) ? runsRaw : (runsRaw?.data || []);
        setPayrollRuns(runsArr.map((r: any) => ({
          id: r.id,
          period: `${r.periodStart?.split('T')[0] ?? '—'} → ${r.periodEnd?.split('T')[0] ?? '—'}`,
          staffCount: r._count?.items ?? 0,
          totalAmount: r.totalAmount ?? 0,
          processedBy: r.processor?.name || '—',
          status: (r.status || 'draft').toLowerCase(),
          createdAt: r.createdAt?.split('T')[0] || '',
        })));

        // ── Staff payment summaries (aggregated from approved timesheets) ─
        const approvedArr = Array.isArray(approvedRaw) ? approvedRaw : (approvedRaw?.data || []);
        const byStaff: Record<string, any> = {};
        for (const ts of approvedArr) {
          const sid = ts.staffId;
          if (!sid) continue;
          const pay = (ts.totalHours ?? 0) * (ts.shift?.hourlyRate ?? 0);
          const date = ts.clockInTime?.split('T')[0] || '';
          if (!byStaff[sid]) {
            byStaff[sid] = {
              staffId: sid,
              staffName: ts.staff?.name || '—',
              role: ts.shift?.role || '—',
              lastDate: date,
              lastPay: pay,
              totalEarnings: 0,
              totalHours: 0,
            };
          }
          byStaff[sid].totalHours += ts.totalHours ?? 0;
          byStaff[sid].totalEarnings += pay;
          if (date > (byStaff[sid].lastDate || '')) {
            byStaff[sid].lastDate = date;
            byStaff[sid].lastPay = pay;
          }
        }
        setStaffSummaries(
          Object.values(byStaff).sort((a, b) => b.totalEarnings - a.totalEarnings)
        );
      } catch {
        toast.error('Failed to load payroll data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Derived metrics ────────────────────────────────────────────────────────
  const totalPendingSubmissions = pendingSubmissions.length;
  const totalPendingHours = pendingSubmissions.reduce((s, sub) => s + sub.totalHours, 0);
  const totalPendingPay = pendingSubmissions.reduce((s, sub) => s + sub.estimatedPay, 0);
  const upcomingRun = payrollRuns.find(r => r.status === 'draft' || r.status === 'processing');
  const upcomingPayrollAmount = upcomingRun?.totalAmount ?? 0;

  const handleReviewSubmission = (submissionId: string) => {
    setCurrentPage('admin-payroll-review');
    toast.info(`Opening payroll review for ${submissionId}`);
  };

  const handleApproveOne = async (id: string) => {
    try {
      await financeService.updateTimesheet(id, { status: 'APPROVED' });
      toast.success('Submission approved');
      setPendingSubmissions(prev => prev.filter(s => s.id !== id));
    } catch {
      toast.error('Failed to approve submission');
    }
  };

  const handleApproveAll = async () => {
    if (pendingSubmissions.length === 0) return;
    try {
      await Promise.all(
        pendingSubmissions.map(sub => financeService.updateTimesheet(sub.id, { status: 'APPROVED' }))
      );
      toast.success(`Approved ${pendingSubmissions.length} submissions`);
      setPendingSubmissions([]);
    } catch {
      toast.error('Failed to approve all submissions');
    }
  };

  const handleProcessPayroll = () => setCurrentPage('admin-payroll-review');

  const handleViewStaffDetails = (staffId: string) => {
    toast.info(`Opening payment history for ${staffId}`);
  };

  const handleExportPayroll = () => {
    toast.success("Exporting payroll data to CSV");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'processed':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-700"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl">Staff Payroll Management</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Admin
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Review submissions, process payroll, and manage staff payments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleProcessPayroll}>
            <Plus className="h-4 w-4 mr-2" />
            New Payroll Run
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Submissions
              <InfoTooltip content="Staff payroll entries awaiting review" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalPendingSubmissions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalPendingHours.toFixed(1)} hours total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pending Amount
              <InfoTooltip content="Total estimated pay for pending submissions" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${totalPendingPay.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Upcoming Payroll
              <InfoTooltip content="Next scheduled payroll run" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${upcomingPayrollAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {upcomingRun ? upcomingRun.period : 'No runs pending'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Active Staff
              <InfoTooltip content="Staff members with approved timesheets" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{staffSummaries.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              With approved hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
          <TabsTrigger value="pending-submissions">Pending Submissions</TabsTrigger>
          <TabsTrigger value="payroll-batches">Payroll Batches</TabsTrigger>
          <TabsTrigger value="staff-payments">Staff Payments</TabsTrigger>
        </TabsList>

        {/* Pending Submissions Tab */}
        <TabsContent value="pending-submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    Pending Staff Payroll Submissions
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {totalPendingSubmissions} submissions awaiting review (${totalPendingPay.toLocaleString()})
                  </CardDescription>
                </div>
                <Button onClick={handleApproveAll}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve All
                </Button>
              </div>
            </CardHeader>

            <CardContent>
{pendingSubmissions.length === 0 && !isLoading ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="font-medium mb-2">All Caught Up!</h3>
                  <p className="text-sm text-muted-foreground">No pending payroll submissions to review.</p>
                </div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submission ID</TableHead>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Shift / Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Est. Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium text-xs text-muted-foreground">{submission.id.slice(0,8)}…</TableCell>
                      <TableCell>{submission.staffName}</TableCell>
                      <TableCell className="text-muted-foreground">{submission.shiftTitle}</TableCell>
                      <TableCell>{submission.submittedDate}</TableCell>
                      <TableCell>{submission.totalHours.toFixed(1)}h</TableCell>
                      <TableCell className="font-medium">${submission.estimatedPay.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleReviewSubmission(submission.id)}>
                            <Eye className="h-4 w-4 mr-1" />Review
                          </Button>
                          <Button variant="default" size="sm" onClick={() => handleApproveOne(submission.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-1" />Approve
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" onClick={handleApproveAll}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve All Submissions
                </Button>
                <Button variant="outline" onClick={handleProcessPayroll}>
                  <Send className="h-4 w-4 mr-2" />
                  Process Payroll
                </Button>
                <Button variant="outline" onClick={handleExportPayroll}>
                  <Download className="h-4 w-4 mr-2" />
                  Export to CSV
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('payroll-batches')}>
                  <FileText className="h-4 w-4 mr-2" />
                  View History
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Batches Tab */}
        <TabsContent value="payroll-batches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Batch Processing</CardTitle>
              <CardDescription>
                View and manage payroll runs by period
              </CardDescription>
            </CardHeader>

            <CardContent>
              {payrollRuns.length === 0 && !isLoading ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No payroll runs yet. Create one to get started.</p>
                </div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Run ID</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Staff Count</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Processed By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRuns.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium text-xs text-muted-foreground">{run.id.slice(0,8)}…</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {run.period}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {run.staffCount}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">${run.totalAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">{run.processedBy}</TableCell>
                      <TableCell>{getStatusBadge(run.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => toast.info(`Viewing run ${run.id.slice(0,8)}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => toast.success('Exporting payroll run')}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Payments Tab */}
        <TabsContent value="staff-payments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search staff by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
{staffSummaries.length === 0 && !isLoading ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No staff payment history found</p>
                  <p className="text-sm text-muted-foreground mt-1">Approve timesheets to populate this view</p>
                </div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Last Pay</TableHead>
                    <TableHead>Total Earnings</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffSummaries
                    .filter(s =>
                      !searchQuery ||
                      s.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      s.role.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((staff) => (
                    <TableRow key={staff.staffId}>
                      <TableCell className="font-medium">{staff.staffName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{staff.role}</Badge>
                      </TableCell>
                      <TableCell>{staff.lastDate || '—'}</TableCell>
                      <TableCell className="font-medium">${staff.lastPay.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ${staff.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{staff.totalHours.toFixed(1)}h</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewStaffDetails(staff.staffId)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
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
      </Tabs>
    </div>
  );
}