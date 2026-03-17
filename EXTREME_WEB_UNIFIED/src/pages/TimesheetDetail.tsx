import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Separator } from "../components/ui/separator";
import { 
  ArrowLeft,
  Download, 
  Edit,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  MapPin,
  Timer,
  DollarSign,
  FileText,
  XCircle,
  CheckCheck,
  Truck,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { financeService } from "../services/finance.service";
import { toast } from "sonner";

interface TimesheetDetailProps {
  userRole: string;
  userId: string;
}

export function TimesheetDetail({ userRole }: TimesheetDetailProps) {
  const { setCurrentPage, pageParams } = useNavigation();
  const timesheetId = pageParams?.timesheetId || "";
  const [loading, setLoading] = useState(true);
  const [timesheetData, setTimesheetData] = useState<any>(null);

  const canApprove = userRole === 'admin' || userRole === 'sub-admin' || userRole === 'manager';

  useEffect(() => {
    const fetchTimesheet = async () => {
      if (!timesheetId) {
        setLoading(false);
        return;
      }
      try {
        const raw = await financeService.getTimesheet(timesheetId);
        // Map API response to expected format
        const ts = raw;
        setTimesheetData({
          id: ts.id,
          weekEnding: ts.shift?.date || (ts.clockInTime ? ts.clockInTime.split('T')[0] : ''),
          weekStarting: ts.shift?.date || (ts.clockInTime ? ts.clockInTime.split('T')[0] : ''),
          status: (ts.status || 'draft').toLowerCase(),
          totalHours: ts.totalHours || 0,
          regularHours: ts.regularHours || 0,
          travelPay: ts.travelPay || 0,
          grossPay: ts.grossPay || 0,
          hourlyRate: ts.hourlyRate || ts.payRate || 25.00,
          submittedDate: ts.clockInTime ? ts.clockInTime.split('T')[0] : null,
          submittedTime: ts.clockInTime ? new Date(ts.clockInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null,
          approvedDate: ts.approvedAt ? ts.approvedAt.split('T')[0] : null,
          approvedBy: ts.approvedBy || null,
          paidDate: null,
          notes: ts.notes || '',
          staffName: ts.staff?.name || 'Staff',
          shifts: ts.shift ? [{
            id: ts.shift.id,
            date: ts.shift.date,
            dayOfWeek: ts.shift.date ? new Date(ts.shift.date).toLocaleDateString('en-US', { weekday: 'long' }) : '',
            event: ts.shift.event?.title || 'Event',
            eventId: ts.shift.eventId || '',
            location: ts.shift.event?.location || ts.shift.location || '',
            position: ts.shift.role || 'Staff',
            clockIn: ts.clockInTime ? new Date(ts.clockInTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '',
            clockOut: ts.clockOutTime ? new Date(ts.clockOutTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '',
            breakDuration: ts.breakMinutes || 0,
            totalHours: ts.totalHours || 0,
            travelStipend: ts.travelPay || 0,
            pay: ts.grossPay || 0,
            status: (ts.status || 'draft').toLowerCase(),
            approvedBy: ts.approvedBy || '',
            notes: ts.notes || '',
          }] : [],
        });
      } catch {
        toast.error('Failed to load timesheet details');
      } finally {
        setLoading(false);
      }
    };
    fetchTimesheet();
  }, [timesheetId]);

  const handleApprove = async () => {
    try {
      await financeService.updateTimesheet(timesheetId, { status: 'approved' });
      setTimesheetData((prev: any) => ({ ...prev, status: 'approved', approvedDate: new Date().toISOString().split('T')[0] }));
      toast.success('Timesheet approved successfully');
    } catch {
      toast.error('Failed to approve timesheet');
    }
  };

  const handleReject = async () => {
    try {
      await financeService.updateTimesheet(timesheetId, { status: 'rejected' });
      setTimesheetData((prev: any) => ({ ...prev, status: 'rejected' }));
      toast.success('Timesheet rejected');
    } catch {
      toast.error('Failed to reject timesheet');
    }
  };

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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading timesheet details...</p>
        </div>
      </div>
    );
  }

  if (!timesheetData) {
    return (
      <div className="space-y-6 w-full">
        <Button variant="outline" size="sm" onClick={() => setCurrentPage('timesheets')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Timesheet not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage('timesheets')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Timesheet Details</h1>
            <p className="text-sm lg:text-base text-muted-foreground mt-1">
              {timesheetData.id} • Week of {new Date(timesheetData.weekStarting).toLocaleDateString()} - {new Date(timesheetData.weekEnding).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          {timesheetData.status === 'draft' && (
            <>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button size="sm" className="bg-sangria hover:bg-merlot">
                <CheckCheck className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </>
          )}
          {canApprove && timesheetData.status === 'submitted' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleReject}
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleApprove}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-xl font-semibold">{timesheetData.totalHours}h</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Timer className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Regular Hours</p>
              <p className="text-xl font-semibold">{timesheetData.regularHours}h</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Travel Pay</p>
              <p className="text-xl font-semibold text-orange-600">${timesheetData.travelPay.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gross Pay</p>
              <p className="text-xl font-semibold">${timesheetData.grossPay.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Timesheet Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Timesheet Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Timesheet ID</p>
                <p className="font-medium">{timesheetData.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <div>{getStatusBadge(timesheetData.status)}</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Period Start</p>
                <p className="font-medium">{new Date(timesheetData.weekStarting).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Period End</p>
                <p className="font-medium">{new Date(timesheetData.weekEnding).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Hourly Rate</p>
                <p className="font-medium">${timesheetData.hourlyRate.toFixed(2)}/hour</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Classification</p>
                <p className="font-medium">1099 Contractor</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-1">Submission Details</p>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>
                  {timesheetData.submittedDate ? (
                    `Submitted on ${new Date(timesheetData.submittedDate).toLocaleDateString()} at ${timesheetData.submittedTime}`
                  ) : (
                    'Not submitted yet'
                  )}
                </span>
              </div>
            </div>

            {timesheetData.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Notes</p>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{timesheetData.notes}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Regular Pay</span>
                <span className="font-medium">
                  ${(timesheetData.regularHours * timesheetData.hourlyRate).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground ml-4">{timesheetData.regularHours}h × ${timesheetData.hourlyRate}/h</span>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Travel Stipends</span>
                <span className="font-medium text-orange-600">
                  ${timesheetData.travelPay.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground ml-4">Flat rate per trip</span>
              </div>

              <Separator />

              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold">Gross Pay</span>
                <span className="text-xl font-bold text-sangria">
                  ${timesheetData.grossPay.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Total Shifts: {timesheetData.shifts.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Shifts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Shift Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Event</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Position</TableHead>
                  <TableHead className="font-semibold">Clock In</TableHead>
                  <TableHead className="font-semibold">Clock Out</TableHead>
                  <TableHead className="font-semibold">Break</TableHead>
                  <TableHead className="font-semibold">Hours</TableHead>
                  <TableHead className="font-semibold">Travel</TableHead>
                  <TableHead className="font-semibold">Pay</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timesheetData.shifts.map((shift) => (
                  <TableRow key={shift.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <p className="font-medium">{new Date(shift.date).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">{shift.dayOfWeek}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{shift.event}</p>
                        <p className="text-xs text-muted-foreground">{shift.eventId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{shift.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{shift.position}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{shift.clockIn}</TableCell>
                    <TableCell className="font-mono text-sm">{shift.clockOut}</TableCell>
                    <TableCell className="text-sm">{shift.breakDuration} min</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{shift.totalHours}h</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {shift.travelStipend > 0 ? (
                        <div className="flex items-center text-orange-600 text-sm">
                          <Truck className="w-3 h-3 mr-1" />
                          ${shift.travelStipend.toFixed(2)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">${shift.pay.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(shift.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Shifts</p>
                <p className="text-lg font-semibold">{timesheetData.shifts.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-lg font-semibold">{timesheetData.totalHours}h</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Travel</p>
                <p className="text-lg font-semibold text-orange-600">${timesheetData.travelPay.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pay</p>
                <p className="text-lg font-semibold text-sangria">${timesheetData.grossPay.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
