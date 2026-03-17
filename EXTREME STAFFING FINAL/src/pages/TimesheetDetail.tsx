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
  Truck
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";

interface TimesheetDetailProps {
  userRole: string;
  userId: string;
}

export function TimesheetDetail({ userRole }: TimesheetDetailProps) {
  const { setCurrentPage, pageParams } = useNavigation();
  const timesheetId = pageParams?.timesheetId || "TS-2024-041";

  // Mock detailed timesheet data
  const timesheetData = {
    id: timesheetId,
    weekEnding: "2024-10-20",
    weekStarting: "2024-10-14",
    status: "submitted",
    totalHours: 42.5,
    regularHours: 42.5,
    travelPay: 90.00,
    grossPay: 1152.50,
    hourlyRate: 25.00,
    submittedDate: "2024-10-21",
    submittedTime: "14:30",
    approvedDate: null,
    approvedBy: null,
    paidDate: null,
    notes: "Great week! All shifts completed on time.",
    shifts: [
      {
        id: "SH-001",
        date: "2024-10-14",
        dayOfWeek: "Monday",
        event: "Corporate Gala 2024",
        eventId: "EVT-1234",
        location: "Grand Ballroom, Downtown",
        position: "Server",
        clockIn: "17:55",
        clockOut: "23:10",
        breakDuration: 30,
        totalHours: 5.25,
        travelStipend: 15.00,
        pay: 146.25,
        status: "approved",
        approvedBy: "Manager Sarah Johnson",
        notes: "Excellent service"
      },
      {
        id: "SH-002",
        date: "2024-10-15",
        dayOfWeek: "Tuesday",
        event: "Wedding Reception",
        eventId: "EVT-1235",
        location: "Riverside Venue",
        position: "Bartender",
        clockIn: "16:45",
        clockOut: "22:15",
        breakDuration: 45,
        totalHours: 4.75,
        travelStipend: 0,
        pay: 118.75,
        status: "approved",
        approvedBy: "Manager Sarah Johnson",
        notes: ""
      },
      {
        id: "SH-003",
        date: "2024-10-16",
        dayOfWeek: "Wednesday",
        event: "Product Launch Event",
        eventId: "EVT-1236",
        location: "Tech Convention Center",
        position: "Event Staff",
        clockIn: "15:50",
        clockOut: "20:05",
        breakDuration: 15,
        totalHours: 4.0,
        travelStipend: 15.00,
        pay: 115.00,
        status: "approved",
        approvedBy: "Manager Michael Chen",
        notes: ""
      },
      {
        id: "SH-004",
        date: "2024-10-17",
        dayOfWeek: "Thursday",
        event: "Corporate Training Session",
        eventId: "EVT-1237",
        location: "Business Center",
        position: "Setup Crew",
        clockIn: "08:00",
        clockOut: "16:30",
        breakDuration: 60,
        totalHours: 7.5,
        travelStipend: 30.00,
        pay: 217.50,
        status: "approved",
        approvedBy: "Manager Sarah Johnson",
        notes: "Early morning setup"
      },
      {
        id: "SH-005",
        date: "2024-10-18",
        dayOfWeek: "Friday",
        event: "Charity Fundraiser Gala",
        eventId: "EVT-1238",
        location: "Luxury Hotel Ballroom",
        position: "Server",
        clockIn: "18:00",
        clockOut: "01:30",
        breakDuration: 45,
        totalHours: 6.75,
        travelStipend: 15.00,
        pay: 183.75,
        status: "approved",
        approvedBy: "Manager Emma Davis",
        notes: "Late night shift"
      },
      {
        id: "SH-006",
        date: "2024-10-19",
        dayOfWeek: "Saturday",
        event: "Weekend Conference",
        eventId: "EVT-1239",
        location: "Convention Center Hall A",
        position: "Registration Desk",
        clockIn: "07:45",
        clockOut: "18:00",
        breakDuration: 90,
        totalHours: 8.75,
        travelStipend: 15.00,
        pay: 233.75,
        status: "approved",
        approvedBy: "Manager Sarah Johnson",
        notes: "Full day event"
      },
      {
        id: "SH-007",
        date: "2024-10-20",
        dayOfWeek: "Sunday",
        event: "Sunday Brunch Service",
        eventId: "EVT-1240",
        location: "Garden Restaurant",
        position: "Server",
        clockIn: "09:30",
        clockOut: "15:15",
        breakDuration: 30,
        totalHours: 5.5,
        travelStipend: 0,
        pay: 137.50,
        status: "approved",
        approvedBy: "Manager Michael Chen",
        notes: "Weekend premium pay"
      }
    ]
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