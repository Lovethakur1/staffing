import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
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
  XCircle
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";

interface TimesheetsProps {
  userRole: string;
  userId: string;
}

export function Timesheets({ userRole }: TimesheetsProps) {
  const { setCurrentPage } = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPageNum] = useState(1);
  const itemsPerPage = 10;

  // Mock timesheet data with more entries
  const allTimesheets = [
    {
      id: "TS-2024-042",
      weekEnding: "2024-10-27",
      status: "draft",
      totalHours: 12.5,
      regularHours: 12.5,
      overtimeHours: 0,
      grossPay: 312.50,
      submittedDate: null,
      approvedDate: null,
      paidDate: null,
      shiftsCount: 3
    },
    {
      id: "TS-2024-041",
      weekEnding: "2024-10-20",
      status: "submitted",
      totalHours: 42.5,
      regularHours: 40,
      overtimeHours: 2.5,
      grossPay: 1062.50,
      submittedDate: "2024-10-21",
      approvedDate: null,
      paidDate: null,
      shiftsCount: 8
    },
    {
      id: "TS-2024-040",
      weekEnding: "2024-10-13",
      status: "approved",
      totalHours: 38.75,
      regularHours: 38.75,
      overtimeHours: 0,
      grossPay: 968.75,
      submittedDate: "2024-10-14",
      approvedDate: "2024-10-15",
      paidDate: null,
      shiftsCount: 7
    },
    {
      id: "TS-2024-039",
      weekEnding: "2024-10-06",
      status: "paid",
      totalHours: 45,
      regularHours: 40,
      overtimeHours: 5,
      grossPay: 1187.50,
      submittedDate: "2024-10-07",
      approvedDate: "2024-10-08",
      paidDate: "2024-10-11",
      shiftsCount: 9
    },
    {
      id: "TS-2024-038",
      weekEnding: "2024-09-29",
      status: "paid",
      totalHours: 40,
      regularHours: 40,
      overtimeHours: 0,
      grossPay: 1000.00,
      submittedDate: "2024-09-30",
      approvedDate: "2024-10-01",
      paidDate: "2024-10-04",
      shiftsCount: 8
    },
    {
      id: "TS-2024-037",
      weekEnding: "2024-09-22",
      status: "paid",
      totalHours: 37.5,
      regularHours: 37.5,
      overtimeHours: 0,
      grossPay: 937.50,
      submittedDate: "2024-09-23",
      approvedDate: "2024-09-24",
      paidDate: "2024-09-27",
      shiftsCount: 7
    },
    {
      id: "TS-2024-036",
      weekEnding: "2024-09-15",
      status: "paid",
      totalHours: 43,
      regularHours: 40,
      overtimeHours: 3,
      grossPay: 1112.50,
      submittedDate: "2024-09-16",
      approvedDate: "2024-09-17",
      paidDate: "2024-09-20",
      shiftsCount: 8
    },
    {
      id: "TS-2024-035",
      weekEnding: "2024-09-08",
      status: "paid",
      totalHours: 41,
      regularHours: 40,
      overtimeHours: 1,
      grossPay: 1037.50,
      submittedDate: "2024-09-09",
      approvedDate: "2024-09-10",
      paidDate: "2024-09-13",
      shiftsCount: 8
    },
    {
      id: "TS-2024-034",
      weekEnding: "2024-09-01",
      status: "paid",
      totalHours: 39,
      regularHours: 39,
      overtimeHours: 0,
      grossPay: 975.00,
      submittedDate: "2024-09-02",
      approvedDate: "2024-09-03",
      paidDate: "2024-09-06",
      shiftsCount: 7
    },
    {
      id: "TS-2024-033",
      weekEnding: "2024-08-25",
      status: "rejected",
      totalHours: 35.5,
      regularHours: 35.5,
      overtimeHours: 0,
      grossPay: 0,
      submittedDate: "2024-08-26",
      approvedDate: null,
      paidDate: null,
      shiftsCount: 6
    },
  ];

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

  // Calculate summary stats
  const timesheetSummary = {
    weeklyAverage: 41.5,
    monthlyTotal: 166,
    pendingApproval: 42.5,
    totalEarnings: 4156.25
  };

  // Filter timesheets
  const filteredTimesheets = allTimesheets.filter(ts => {
    const matchesSearch = ts.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ts.weekEnding.includes(searchQuery);
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

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Timesheets</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Track your hours and manage timesheet submissions
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
          <Button 
            size="sm" 
            className="bg-sangria hover:bg-merlot"
            onClick={handleAddManualEntry}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Timesheet
          </Button>
        </div>
      </div>

      {/* Quick Stats - Keep these */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Weekly Average
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">{timesheetSummary.weeklyAverage}h</div>
            <p className="text-xs text-muted-foreground">Last 4 weeks</p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Monthly Total
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">{timesheetSummary.monthlyTotal}h</div>
            <p className="text-xs text-muted-foreground">This month</p>
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
            <div className="text-2xl font-semibold text-foreground">{timesheetSummary.pendingApproval}h</div>
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
            <CardTitle>All Timesheets</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search timesheets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-[250px]"
                />
              </div>

              {/* Status Filter */}
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
                  <TableHead className="font-semibold">Week Ending</TableHead>
                  <TableHead className="font-semibold">Total Hours</TableHead>
                  <TableHead className="font-semibold">Regular</TableHead>
                  <TableHead className="font-semibold">Overtime</TableHead>
                  <TableHead className="font-semibold">Gross Pay</TableHead>
                  <TableHead className="font-semibold">Shifts</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTimesheets.length > 0 ? (
                  paginatedTimesheets.map((timesheet) => (
                    <TableRow key={timesheet.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{timesheet.id}</TableCell>
                      <TableCell>{new Date(timesheet.weekEnding).toLocaleDateString()}</TableCell>
                      <TableCell>{timesheet.totalHours}h</TableCell>
                      <TableCell>{timesheet.regularHours}h</TableCell>
                      <TableCell>
                        {timesheet.overtimeHours > 0 ? (
                          <span className="text-orange-600 font-medium">{timesheet.overtimeHours}h</span>
                        ) : (
                          <span className="text-muted-foreground">0h</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${timesheet.grossPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{timesheet.shiftsCount} shifts</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(timesheet.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewTimesheet(timesheet.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
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
