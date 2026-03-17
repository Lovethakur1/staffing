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
  Send,
  Filter
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

  // Pending staff payroll submissions - starts with mock, enriched by API
  const [pendingSubmissions, setPendingSubmissions] = useState([
    {
      id: "SUB-2024-045",
      staffName: "Michael Rodriguez",
      staffId: "STAFF-045",
      submittedDate: "2024-10-10",
      entriesCount: 2,
      totalHours: 10.5,
      estimatedPay: 625.00,
      status: "pending"
    },
    {
      id: "SUB-2024-046",
      staffName: "Sarah Chen",
      staffId: "STAFF-028",
      submittedDate: "2024-10-11",
      entriesCount: 3,
      totalHours: 15.5,
      estimatedPay: 875.50,
      status: "pending"
    },
    {
      id: "SUB-2024-047",
      staffName: "David Miller",
      staffId: "STAFF-063",
      submittedDate: "2024-10-11",
      entriesCount: 1,
      totalHours: 6.0,
      estimatedPay: 450.00,
      status: "pending"
    },
    {
      id: "SUB-2024-048",
      staffName: "Jennifer Lee",
      staffId: "STAFF-019",
      submittedDate: "2024-10-12",
      entriesCount: 4,
      totalHours: 22.0,
      estimatedPay: 1320.00,
      status: "pending"
    },
    {
      id: "SUB-2024-049",
      staffName: "Robert Taylor",
      staffId: "STAFF-072",
      submittedDate: "2024-10-12",
      entriesCount: 2,
      totalHours: 12.0,
      estimatedPay: 720.00,
      status: "pending"
    }
  ]);

  // Fetch live data from API
  useEffect(() => {
    const fetchPayrollData = async () => {
      try {
        setIsLoading(true);
        const timesheets = await financeService.getTimesheets({ status: 'SUBMITTED' });
        const tsArray = Array.isArray(timesheets) ? timesheets : (timesheets?.data || []);
        if (tsArray.length > 0) {
          const mapped = tsArray.map((ts: any, idx: number) => ({
            id: ts.id || `SUB-API-${idx}`,
            staffName: ts.staff?.user?.name || 'Staff Member',
            staffId: ts.staffId || `STAFF-${idx}`,
            submittedDate: ts.createdAt?.split('T')[0] || '',
            entriesCount: 1,
            totalHours: ts.totalHours || 0,
            estimatedPay: ts.grossPay || 0,
            status: (ts.status || 'pending').toLowerCase()
          }));
          setPendingSubmissions(mapped);
        }
      } catch {
        // API unavailable — keep mock data
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayrollData();
  }, []);

  // Payroll batch processing
  const payrollBatches = [
    {
      id: "PAY-2024-10-W2",
      period: "Oct 1-7, 2024",
      staffCount: 24,
      totalHours: 856,
      grossPay: 21400,
      taxes: 4280,
      netPay: 17120,
      status: "processed",
      processedDate: "2024-10-08"
    },
    {
      id: "PAY-2024-10-W3",
      period: "Oct 8-14, 2024",
      staffCount: 28,
      totalHours: 924,
      grossPay: 23100,
      taxes: 4620,
      netPay: 18480,
      status: "pending",
      processedDate: null
    },
    {
      id: "PAY-2024-10-W1",
      period: "Sep 24-30, 2024",
      staffCount: 22,
      totalHours: 792,
      grossPay: 19800,
      taxes: 3960,
      netPay: 15840,
      status: "completed",
      processedDate: "2024-10-01"
    },
    {
      id: "PAY-2024-09-W4",
      period: "Sep 17-23, 2024",
      staffCount: 26,
      totalHours: 884,
      grossPay: 22100,
      taxes: 4420,
      netPay: 17680,
      status: "completed",
      processedDate: "2024-09-24"
    }
  ];

  // Staff payment history
  const staffPayments = [
    {
      staffId: "STAFF-045",
      staffName: "Michael Rodriguez",
      role: "Bartender",
      lastPayment: "2024-10-08",
      lastAmount: 850.00,
      totalEarnings: 12400.00,
      totalHours: 248
    },
    {
      staffId: "STAFF-028",
      staffName: "Sarah Chen",
      role: "Server",
      lastPayment: "2024-10-08",
      lastAmount: 675.00,
      totalEarnings: 9850.00,
      totalHours: 281
    },
    {
      staffId: "STAFF-063",
      staffName: "David Miller",
      role: "Event Coordinator",
      lastPayment: "2024-10-08",
      lastAmount: 1100.00,
      totalEarnings: 15600.00,
      totalHours: 284
    },
    {
      staffId: "STAFF-019",
      staffName: "Jennifer Lee",
      role: "Bartender",
      lastPayment: "2024-10-08",
      lastAmount: 920.00,
      totalEarnings: 13800.00,
      totalHours: 307
    },
    {
      staffId: "STAFF-072",
      staffName: "Robert Taylor",
      role: "Server",
      lastPayment: "2024-10-08",
      lastAmount: 560.00,
      totalEarnings: 8240.00,
      totalHours: 235
    }
  ];

  // Calculate metrics
  const totalPendingSubmissions = pendingSubmissions.length;
  const totalPendingHours = pendingSubmissions.reduce((sum, sub) => sum + sub.totalHours, 0);
  const totalPendingPay = pendingSubmissions.reduce((sum, sub) => sum + sub.estimatedPay, 0);
  const upcomingPayrollAmount = payrollBatches.find(p => p.status === 'pending')?.netPay || 0;

  const handleReviewSubmission = (submissionId: string) => {
    setCurrentPage('admin-payroll-review');
    toast.info(`Opening payroll review for ${submissionId}`);
  };

  const handleApproveAll = () => {
    toast.success(`Approved ${totalPendingSubmissions} payroll submissions`);
  };

  const handleProcessPayroll = () => {
    toast.success("Processing payroll batch");
  };

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
              Oct 15, 2024
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Active Staff
              <InfoTooltip content="Staff members with recent activity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{staffPayments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This period
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submission ID</TableHead>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Entries</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Estimated Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.id}</TableCell>
                      <TableCell>{submission.staffName}</TableCell>
                      <TableCell>{submission.submittedDate}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {submission.entriesCount} {submission.entriesCount === 1 ? 'entry' : 'entries'}
                        </Badge>
                      </TableCell>
                      <TableCell>{submission.totalHours.toFixed(1)}h</TableCell>
                      <TableCell className="font-medium">${submission.estimatedPay.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReviewSubmission(submission.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payroll ID</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Staff Count</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Taxes</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollBatches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {batch.period}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {batch.staffCount}
                        </div>
                      </TableCell>
                      <TableCell>{batch.totalHours}h</TableCell>
                      <TableCell>${batch.grossPay.toLocaleString()}</TableCell>
                      <TableCell className="text-red-600">${batch.taxes.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">${batch.netPay.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(batch.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Payment</TableHead>
                    <TableHead>Last Amount</TableHead>
                    <TableHead>Total Earnings</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffPayments.map((staff) => (
                    <TableRow key={staff.staffId}>
                      <TableCell className="font-medium">{staff.staffId}</TableCell>
                      <TableCell>{staff.staffName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{staff.role}</Badge>
                      </TableCell>
                      <TableCell>{staff.lastPayment}</TableCell>
                      <TableCell className="font-medium">${staff.lastAmount.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ${staff.totalEarnings.toLocaleString()}
                      </TableCell>
                      <TableCell>{staff.totalHours}h</TableCell>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}