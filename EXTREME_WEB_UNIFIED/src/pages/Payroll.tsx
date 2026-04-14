import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { TooltipWrapper, IconTooltip, InfoTooltip } from "../components/ui/tooltip-wrapper";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Plus,
  Search,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  AlertCircle
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner";
import { financeService } from "../services/finance.service";

interface PayrollProps {
  userRole: string;
  userId: string;
}

interface PayrollEntry {
  id: string;
  eventName: string;
  clientName: string;
  date: string;
  managerName: string;
  venue: string;
  checkInTime: string;
  checkOutTime: string;
  totalHours: number;
  status: 'pending' | 'approved' | 'rejected';
  amount?: number;
  submittedDate: string;
}

interface StaffSubmission {
  id: string;
  staffName: string;
  staffId: string;
  submittedDate: string;
  entriesCount: number;
  totalHours: number;
  estimatedPay: number;
  status: 'pending' | 'approved' | 'rejected';
}

export function Payroll({ userRole, userId }: PayrollProps) {
  const { setCurrentPage } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEntry, setSelectedEntry] = useState<PayrollEntry | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Check if user is admin
  const isAdmin = userRole === 'admin';
  const [isLoading, setIsLoading] = useState(true);

  const [myPayrollEntries, setMyPayrollEntries] = useState<PayrollEntry[]>([]);

  // Fetch live payroll data from API
  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        setIsLoading(true);
        const timesheets = await financeService.getTimesheets();
        const tsArray = Array.isArray(timesheets) ? timesheets : (timesheets?.data || []);
        const entries: PayrollEntry[] = tsArray.map((ts: any) => ({
          id: ts.id || '',
          eventName: ts.shift?.event?.title || ts.shift?.role || 'Shift',
          clientName: ts.shift?.event?.client?.user?.name || ts.shift?.event?.client?.company || '—',
          date: ts.shift?.date?.split('T')[0] || ts.clockInTime?.split('T')[0] || '',
          managerName: ts.approvedBy?.name || '—',
          venue: ts.shift?.event?.location || ts.shift?.event?.venue || '—',
          checkInTime: ts.clockInTime ? new Date(ts.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
          checkOutTime: ts.clockOutTime ? new Date(ts.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
          totalHours: ts.totalHours || 0,
          status: (ts.status || 'pending').toLowerCase() as PayrollEntry['status'],
          amount: ts.totalHours && ts.shift?.hourlyRate ? ts.totalHours * ts.shift.hourlyRate : undefined,
          submittedDate: ts.createdAt?.split('T')[0] || '',
        }));
        setMyPayrollEntries(entries);
      } catch {
        // API unavailable
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayroll();
  }, []);

  const [allStaffSubmissions, setAllStaffSubmissions] = useState<StaffSubmission[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchAdminPayroll = async () => {
      try {
        const timesheets = await financeService.getTimesheets({ take: 500 } as any);
        const tsArray = Array.isArray(timesheets) ? timesheets : (timesheets?.data || []);
        // Group by staffId to create one row per staff member
        const byStaff: Record<string, StaffSubmission> = {};
        for (const ts of tsArray) {
          const sid = ts.staffId || ts.id;
          const date = ts.createdAt?.split('T')[0] || '';
          const pay = (ts.totalHours || 0) * (ts.shift?.hourlyRate || 0);
          const status = (ts.status || 'pending').toLowerCase() as StaffSubmission['status'];
          if (!byStaff[sid]) {
            byStaff[sid] = {
              id: `SUB-${sid.slice(0, 8)}`,
              staffName: ts.staff?.name || '—',
              staffId: sid,
              submittedDate: date,
              entriesCount: 0,
              totalHours: 0,
              estimatedPay: 0,
              status,
            };
          }
          byStaff[sid].entriesCount += 1;
          byStaff[sid].totalHours += ts.totalHours || 0;
          byStaff[sid].estimatedPay += pay;
          if (date > byStaff[sid].submittedDate) byStaff[sid].submittedDate = date;
          // If any entry is pending, mark the group as pending
          if (status === 'pending') byStaff[sid].status = 'pending';
        }
        setAllStaffSubmissions(Object.values(byStaff));
      } catch { /* API unavailable */ }
    };
    fetchAdminPayroll();
  }, [isAdmin]);

  const filteredMyEntries = myPayrollEntries.filter(entry => {
    const matchesSearch = 
      entry.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.venue.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredSubmissions = allStaffSubmissions.filter(submission => {
    const matchesSearch = 
      submission.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleViewDetails = (entry: PayrollEntry) => {
    setSelectedEntry(entry);
    setShowDetailsDialog(true);
  };

  const handleDownload = (entryId: string) => {
    toast.success(`Downloading payroll ${entryId}`);
  };

  const handleAddNewPayroll = () => {
    setCurrentPage('submit-payroll');
  };

  const handleReviewSubmission = (submissionId: string) => {
    setCurrentPage('admin-payroll-review', { submissionId });
  };

  const myStats = {
    total: myPayrollEntries.length,
    pending: myPayrollEntries.filter(e => e.status === 'pending').length,
    approved: myPayrollEntries.filter(e => e.status === 'approved').length,
    rejected: myPayrollEntries.filter(e => e.status === 'rejected').length,
    totalEarnings: myPayrollEntries
      .filter(e => e.status === 'approved' && e.amount)
      .reduce((sum, e) => sum + (e.amount || 0), 0)
  };

  const adminStats = {
    totalSubmissions: allStaffSubmissions.length,
    pending: allStaffSubmissions.filter(s => s.status === 'pending').length,
    approved: allStaffSubmissions.filter(s => s.status === 'approved').length,
    rejected: allStaffSubmissions.filter(s => s.status === 'rejected').length,
    totalPending: allStaffSubmissions
      .filter(s => s.status === 'pending')
      .reduce((sum, s) => sum + s.estimatedPay, 0)
  };

  // STAFF/MANAGER VIEW
  if (!isAdmin) {
    return (
      <div className="space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl">{userRole === 'manager' ? 'My Payroll' : 'Payroll'}</h1>
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {userRole === 'manager' ? 'Manager' : 'Staff'}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              View your payroll history and submit new entries
            </p>
          </div>
          <TooltipWrapper content="Manually add a payroll entry for events not auto-tracked">
            <Button onClick={handleAddNewPayroll} className="bg-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add New Payroll Manually
            </Button>
          </TooltipWrapper>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{myStats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-yellow-600">{myStats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-green-600">{myStats.approved}</div>
            </CardContent>
          </Card>


          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-red-600">{myStats.rejected}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">${myStats.totalEarnings.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Payroll Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by event, client, or venue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {filteredMyEntries.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No Payroll Entries</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You haven't submitted any payroll entries yet.
                </p>
                <Button onClick={handleAddNewPayroll}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Payroll
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Name</TableHead>
                      <TableHead>Client Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Manager Name</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMyEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.eventName}</TableCell>
                        <TableCell>{entry.clientName}</TableCell>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{entry.managerName}</TableCell>
                        <TableCell className="text-muted-foreground">{entry.venue}</TableCell>
                        <TableCell>{entry.checkInTime}</TableCell>
                        <TableCell>{entry.checkOutTime}</TableCell>
                        <TableCell className="font-medium">{entry.totalHours}h</TableCell>
                        <TableCell>{getStatusBadge(entry.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(entry)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {entry.status === 'approved' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(entry.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payroll Details</DialogTitle>
              <DialogDescription>
                Complete information for payroll entry
              </DialogDescription>
            </DialogHeader>

            {selectedEntry && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Event Name</p>
                    <p className="font-medium">{selectedEntry.eventName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Client Name</p>
                    <p className="font-medium">{selectedEntry.clientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date Worked</p>
                    <p className="font-medium">{selectedEntry.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Manager</p>
                    <p className="font-medium">{selectedEntry.managerName}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Venue</p>
                    <p className="font-medium">{selectedEntry.venue}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Check In Time</p>
                    <p className="font-medium">{selectedEntry.checkInTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Check Out Time</p>
                    <p className="font-medium">{selectedEntry.checkOutTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                    <p className="font-medium">{selectedEntry.totalHours}h</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedEntry.status)}</div>
                  </div>
                  {selectedEntry.amount && (
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-medium text-green-600">${selectedEntry.amount.toFixed(2)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted Date</p>
                    <p className="font-medium">{selectedEntry.submittedDate}</p>
                  </div>
                </div>

                {selectedEntry.status === 'approved' && (
                  <div className="flex justify-end">
                    <Button onClick={() => handleDownload(selectedEntry.id)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Payroll Slip
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ADMIN VIEW - Different interface for reviewing all staff submissions
  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl">Payroll Management</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve staff payroll submissions
          </p>
        </div>
        <Badge className="bg-yellow-100 text-yellow-700 text-base px-4 py-2">
          <AlertCircle className="h-4 w-4 mr-2" />
          {adminStats.pending} Submissions Pending Review
        </Badge>
      </div>

      {/* Admin Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{adminStats.totalSubmissions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-yellow-600">{adminStats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{adminStats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{adminStats.rejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${adminStats.totalPending.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Submissions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by staff name, ID, or submission ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="font-medium mb-2">All Caught Up!</h3>
              <p className="text-sm text-muted-foreground">
                No staff payroll submissions to review at this time.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submission ID</TableHead>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Staff ID</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Entries</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Estimated Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.id}</TableCell>
                      <TableCell className="font-medium">{submission.staffName}</TableCell>
                      <TableCell>{submission.staffId}</TableCell>
                      <TableCell>{submission.submittedDate}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {submission.entriesCount} {submission.entriesCount === 1 ? 'entry' : 'entries'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{submission.totalHours.toFixed(1)}h</TableCell>
                      <TableCell className="font-medium">${submission.estimatedPay.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant={submission.status === 'pending' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleReviewSubmission(submission.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {submission.status === 'pending' ? 'Review' : 'View'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
