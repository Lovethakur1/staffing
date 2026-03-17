import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  ArrowLeft,
  DollarSign,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Clock,
  Car,
  ParkingCircle,
  AlertTriangle,
  Calculator,
  TrendingDown,
  Percent,
  Paperclip,
  ExternalLink
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner";

interface AdminPayrollReviewProps {
  userRole: string;
  userId: string;
  submissionId?: string;
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
  breakTime: number;
  totalHours: number;
  driveTime: number;
  parkingFee: number;
  hourlyRate: number;
  parkingReceipt?: {
    name: string;
    size: number;
    type: string;
    url: string;
  };
}

interface PayrollSubmission {
  id: string;
  staffName: string;
  staffId: string;
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
  entries: PayrollEntry[];
  importantComments?: string;
}

export function AdminPayrollReview({ userRole, userId, submissionId }: AdminPayrollReviewProps) {
  const { setCurrentPage } = useNavigation();
  
  // Mock submission data
  const [submission] = useState<PayrollSubmission>({
    id: "PAY-2024-002",
    staffName: "Michael Rodriguez",
    staffId: "STAFF-045",
    submissionDate: "2024-10-10",
    status: 'pending',
    importantComments: "Event ran 30 minutes overtime due to extended client request. Additional setup time required for special AV equipment.",
    entries: [
      {
        id: "entry-1",
        eventName: "Fundraiser Gala",
        clientName: "Smith Foundation",
        date: "2024-10-09",
        managerName: "Emily Davis",
        venue: "Convention Center",
        checkInTime: "17:00",
        checkOutTime: "23:00",
        breakTime: 0.5,
        totalHours: 5.5,
        driveTime: 0.5,
        parkingFee: 20,
        hourlyRate: 25,
        parkingReceipt: {
          name: "parking-receipt-convention-center.pdf",
          size: 245000,
          type: "application/pdf",
          url: "data:application/pdf;base64,mock-receipt-data"
        }
      },
      {
        id: "entry-2",
        eventName: "Team Building Event",
        clientName: "Marketing Agency",
        date: "2024-10-10",
        managerName: "David Brown",
        venue: "Outdoor Park",
        checkInTime: "10:00",
        checkOutTime: "16:00",
        breakTime: 1,
        totalHours: 5,
        driveTime: 0.25,
        parkingFee: 0,
        hourlyRate: 25
      }
    ]
  });

  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Calculation constants
  const WORKMAN_COMP_RATE = 5.25; // 5.25%
  const SA_CHARGE_RATE = 3.5; // 3.5% for S&A charge (example)

  // Calculate totals
  const getTotalWorkHours = () => {
    return submission.entries.reduce((sum, entry) => sum + entry.totalHours, 0);
  };

  const getTotalDriveTime = () => {
    return submission.entries.reduce((sum, entry) => sum + entry.driveTime, 0);
  };

  const getTotalParkingFees = () => {
    return submission.entries.reduce((sum, entry) => sum + entry.parkingFee, 0);
  };

  const getPayBeforeDeductions = () => {
    const workHours = getTotalWorkHours();
    const driveTime = getTotalDriveTime();
    const avgRate = submission.entries[0]?.hourlyRate || 25;
    return (workHours + driveTime) * avgRate;
  };

  const getWorkmanCompDeduction = () => {
    return (getPayBeforeDeductions() * WORKMAN_COMP_RATE) / 100;
  };

  const getSACharge = () => {
    return (getPayBeforeDeductions() * SA_CHARGE_RATE) / 100;
  };

  const getOtherCompensation = () => {
    // This could come from additional fields - using parking fees as example
    return getTotalParkingFees();
  };

  const getTotalPayDue = () => {
    const payBeforeDeductions = getPayBeforeDeductions();
    const workmanComp = getWorkmanCompDeduction();
    const saCharge = getSACharge();
    const otherComp = getOtherCompensation();
    return payBeforeDeductions - workmanComp - saCharge + otherComp;
  };

  const handleApprove = () => {
    toast.success(`Payroll ${submission.id} approved for payment`);
    setTimeout(() => setCurrentPage('financial-hub'), 1500);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    toast.success(`Payroll ${submission.id} rejected`);
    setTimeout(() => setCurrentPage('financial-hub'), 1500);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage('financial-hub')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl">Payroll Review</h1>
              <p className="text-muted-foreground mt-1">
                Review and approve staff payroll submission
              </p>
            </div>
          </div>
          <Badge className="bg-yellow-100 text-yellow-700 text-base px-4 py-2">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Pending Review
          </Badge>
        </div>

        {/* Staff Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Staff Information</CardTitle>
                <CardDescription>Payroll submitted by staff member</CardDescription>
              </div>
              <Badge variant="outline" className="text-base px-3 py-1">
                {submission.id}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Staff Name</p>
                <p className="font-medium">{submission.staffName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Staff ID</p>
                <p className="font-medium">{submission.staffId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submission Date</p>
                <p className="font-medium">{submission.submissionDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Work Entries ({submission.entries.length})</CardTitle>
            <CardDescription>Detailed breakdown of hours worked</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Break</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submission.entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.eventName}</TableCell>
                    <TableCell>{entry.clientName}</TableCell>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.managerName}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.venue}</TableCell>
                    <TableCell>{entry.checkInTime}</TableCell>
                    <TableCell>{entry.checkOutTime}</TableCell>
                    <TableCell>{entry.breakTime}h</TableCell>
                    <TableCell className="font-medium">{entry.totalHours.toFixed(2)}h</TableCell>
                    <TableCell>${entry.hourlyRate}/hr</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Additional Expenses */}
            {(getTotalDriveTime() > 0 || getTotalParkingFees() > 0) && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-4">Additional Expenses</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  {getTotalDriveTime() > 0 && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Car className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Total Drive Time</span>
                      </div>
                      <span className="font-medium">{getTotalDriveTime().toFixed(2)}h</span>
                    </div>
                  )}
                  {getTotalParkingFees() > 0 && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <ParkingCircle className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Total Parking Fees</span>
                      </div>
                      <span className="font-medium">${getTotalParkingFees().toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Parking Receipts */}
            {submission.entries.some(e => e.parkingReceipt) && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Parking Receipts ({submission.entries.filter(e => e.parkingReceipt).length})
                </h4>
                <div className="space-y-2">
                  {submission.entries.map((entry) => (
                    entry.parkingReceipt && (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{entry.parkingReceipt.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {entry.clientName} • {entry.date} • ${entry.parkingFee.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(entry.parkingReceipt!.url, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Calculation */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Payment Calculation
                </CardTitle>
                <CardDescription>Automated calculation based on submission</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Work Hours Calculation */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Work Hours:</span>
                    </div>
                    <span className="font-medium">{getTotalWorkHours().toFixed(2)}h</span>
                  </div>
                  
                  {getTotalDriveTime() > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Drive Time:</span>
                      </div>
                      <span className="font-medium">{getTotalDriveTime().toFixed(2)}h</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Hourly Rate:</span>
                    <span className="font-medium">${submission.entries[0]?.hourlyRate || 0}/hr</span>
                  </div>
                </div>

                <Separator />

                {/* Pay Calculation */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-base">
                    <span className="font-medium">Pay Before Deductions:</span>
                    <span className="font-semibold text-lg">${getPayBeforeDeductions().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-red-600">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-sm">Less Workman's Comp ({WORKMAN_COMP_RATE}%):</span>
                    </div>
                    <span className="font-medium">-${getWorkmanCompDeduction().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-red-600">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      <span className="text-sm">Charge for S&A ({SA_CHARGE_RATE}%):</span>
                    </div>
                    <span className="font-medium">-${getSACharge().toFixed(2)}</span>
                  </div>
                  
                  {getOtherCompensation() > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">Other Compensation:</span>
                      </div>
                      <span className="font-medium">+${getOtherCompensation().toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Total Due */}
                <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                  <span className="font-semibold text-lg">Total Pay Due:</span>
                  <span className="font-bold text-2xl text-primary">
                    ${getTotalPayDue().toFixed(2)}
                  </span>
                </div>

                {/* Breakdown Detail */}
                <div className="p-4 bg-muted rounded-lg space-y-2 text-xs text-muted-foreground">
                  <p><strong>Calculation Formula:</strong></p>
                  <p>Total Pay = (Work Hours + Drive Time) × Hourly Rate - Workman's Comp - S&A Charge + Other Compensation</p>
                  <p>= ({getTotalWorkHours().toFixed(2)}h + {getTotalDriveTime().toFixed(2)}h) × ${submission.entries[0]?.hourlyRate || 0} - ${getWorkmanCompDeduction().toFixed(2)} - ${getSACharge().toFixed(2)} + ${getOtherCompensation().toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Important Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Important Comments</CardTitle>
            </CardHeader>
            <CardContent>
              {submission.importantComments ? (
                <p className="text-sm whitespace-pre-wrap">{submission.importantComments}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No comments provided</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentPage('financial-hub')}
              >
                Back to Payroll List
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => setShowApproveDialog(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve & Process Payment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approve Dialog */}
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Payroll?</DialogTitle>
              <DialogDescription>
                This will approve the payroll submission and process payment of ${getTotalPayDue().toFixed(2)} to {submission.staffName}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-green-900">Staff Member:</span>
                      <span className="font-medium text-green-900">{submission.staffName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-900">Total Hours:</span>
                      <span className="font-medium text-green-900">{getTotalWorkHours().toFixed(2)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-900">Payment Amount:</span>
                      <span className="font-bold text-lg text-green-900">${getTotalPayDue().toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <p className="text-sm text-muted-foreground">
                The payment will be processed in the next payroll batch. Staff member will be notified via email.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm Approval
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Payroll?</DialogTitle>
              <DialogDescription>
                Provide a reason for rejection. The staff member will be notified and can resubmit.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="E.g., Missing manager verification, incorrect hours, need additional documentation..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-900">
                  <strong>Note:</strong> Staff member will receive an email notification with your rejection reason and will need to resubmit their payroll.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                <XCircle className="h-4 w-4 mr-2" />
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
