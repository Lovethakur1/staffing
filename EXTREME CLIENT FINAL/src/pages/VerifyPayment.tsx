import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  ArrowLeft,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Upload,
  CreditCard,
  Building,
  FileText,
  Calendar,
  User,
  Mail,
  Phone
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner@2.0.3";

export function VerifyPayment() {
  const { setCurrentPage } = useNavigation();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  // Mock payment data
  const payment = {
    id: "PAY-2024-001",
    eventId: "evt-012",
    eventName: "Birthday Party - Smith",
    clientName: "Robert Smith",
    clientEmail: "robert.smith@example.com",
    clientPhone: "(555) 123-4567",
    amount: 2450,
    dueDate: "2024-10-14",
    eventDate: "2024-10-14",
    status: "pending_verification",
    paymentType: "Final Payment",
    deposit: 1200,
    remaining: 2450,
    totalContract: 3650,
    submittedDate: "2024-10-11",
    paymentDetails: {
      method: "Bank Transfer",
      reference: "TXN-9876543210",
      accountLast4: "4532",
      submittedBy: "Robert Smith",
      submissionTime: "2:35 PM"
    },
    eventDetails: {
      date: "October 14, 2024",
      time: "6:00 PM - 11:00 PM",
      location: "Sunset Gardens",
      staffCount: 8,
      estimatedGuests: 75
    },
    breakdown: [
      { item: "Bartenders (2)", quantity: 2, rate: 28, hours: 5, total: 280 },
      { item: "Servers (4)", quantity: 4, rate: 22, hours: 5, total: 440 },
      { item: "Event Coordinator (1)", quantity: 1, rate: 35, hours: 6, total: 210 },
      { item: "Setup Crew (2)", quantity: 2, rate: 20, hours: 3, total: 120 },
      { item: "Service Fee", quantity: 1, rate: 200, hours: 1, total: 200 },
    ],
    attachments: [
      { name: "bank_transfer_receipt.pdf", size: "245 KB", uploadedAt: "2:35 PM" },
      { name: "payment_confirmation.pdf", size: "156 KB", uploadedAt: "2:36 PM" }
    ]
  };

  const handleApprove = () => {
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    
    setVerificationStatus('approved');
    toast.success("Payment verified and approved");
    
    setTimeout(() => {
      setCurrentPage('billing');
    }, 2000);
  };

  const handleReject = () => {
    if (!notes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    setVerificationStatus('rejected');
    toast.success("Payment rejected. Client will be notified.");
    
    setTimeout(() => {
      setCurrentPage('billing');
    }, 2000);
  };

  const handleRequestInfo = () => {
    toast.info("Additional information request sent to client");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage('billing')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl">Verify Payment</h1>
              <p className="text-muted-foreground">
                Review and verify payment submission
              </p>
            </div>
          </div>
          <Badge
            variant={
              verificationStatus === 'approved'
                ? 'default'
                : verificationStatus === 'rejected'
                ? 'destructive'
                : 'secondary'
            }
            className="text-sm py-1 px-3"
          >
            {verificationStatus === 'approved' && <CheckCircle2 className="h-4 w-4 mr-1" />}
            {verificationStatus === 'rejected' && <XCircle className="h-4 w-4 mr-1" />}
            {verificationStatus === 'pending' && <Clock className="h-4 w-4 mr-1" />}
            {verificationStatus.toUpperCase().replace('_', ' ')}
          </Badge>
        </div>

        {/* Alert for urgent verification */}
        <Alert className="border-yellow-500 bg-yellow-500/10">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <span className="text-yellow-600">Event starts in 3 days.</span>
            <span className="ml-2">Payment verification required to confirm staff assignments.</span>
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>ID: {payment.id}</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-lg">
                    ${payment.amount.toLocaleString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Information */}
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Payment Type</p>
                      <p className="font-medium">{payment.paymentType}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Method</p>
                      <p className="font-medium flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {payment.paymentDetails.method}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Reference Number</p>
                      <p className="font-medium font-mono text-sm">{payment.paymentDetails.reference}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Account</p>
                      <p className="font-medium">****{payment.paymentDetails.accountLast4}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Submitted Date</p>
                      <p className="font-medium">{payment.submittedDate}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Submission Time</p>
                      <p className="font-medium">{payment.paymentDetails.submissionTime}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="space-y-4">
                  <h4 className="font-medium">Payment Breakdown</h4>
                  <div className="rounded-lg border">
                    <div className="divide-y">
                      <div className="grid grid-cols-5 gap-4 p-3 bg-muted/50 text-sm font-medium">
                        <div className="col-span-2">Item</div>
                        <div className="text-center">Qty × Rate</div>
                        <div className="text-center">Hours</div>
                        <div className="text-right">Total</div>
                      </div>
                      {payment.breakdown.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-5 gap-4 p-3 text-sm">
                          <div className="col-span-2">{item.item}</div>
                          <div className="text-center">
                            {item.quantity} × ${item.rate}
                          </div>
                          <div className="text-center">{item.hours}h</div>
                          <div className="text-right font-medium">
                            ${item.total.toLocaleString()}
                          </div>
                        </div>
                      ))}
                      <div className="grid grid-cols-5 gap-4 p-3 bg-muted/50 font-medium">
                        <div className="col-span-4 text-right">Subtotal:</div>
                        <div className="text-right">
                          ${payment.breakdown.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-4 p-3 bg-muted/50">
                        <div className="col-span-4 text-right text-muted-foreground">Previous Deposit:</div>
                        <div className="text-right text-muted-foreground">
                          -${payment.deposit.toLocaleString()}
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-4 p-3 bg-primary/10 font-medium">
                        <div className="col-span-4 text-right">Amount Due:</div>
                        <div className="text-right text-primary">
                          ${payment.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div className="space-y-4">
                  <h4 className="font-medium">Payment Proof Attachments</h4>
                  <div className="space-y-2">
                    {payment.attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {file.size} • Uploaded at {file.uploadedAt}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event & Client Info */}
            <Card>
              <CardHeader>
                <CardTitle>Event & Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Event Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{payment.eventName}</p>
                          <p className="text-xs text-muted-foreground">Event ID: {payment.eventId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{payment.eventDetails.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{payment.eventDetails.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{payment.eventDetails.staffCount} staff, {payment.eventDetails.estimatedGuests} guests</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Client Contact</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{payment.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${payment.clientEmail}`} className="text-primary hover:underline">
                          {payment.clientEmail}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${payment.clientPhone}`} className="text-primary hover:underline">
                          {payment.clientPhone}
                        </a>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2 w-full">
                        Contact Client
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Verification Actions */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Verification</CardTitle>
                <CardDescription>Review and take action</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {verificationStatus === 'pending' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="payment-method">Confirm Payment Method</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger id="payment-method">
                          <SelectValue placeholder="Select method..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                          <SelectItem value="credit-card">Credit Card</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="wire">Wire Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Verification Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any notes about this payment..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={handleApprove}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve Payment
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleRequestInfo}
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Request More Info
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleReject}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Payment
                      </Button>
                    </div>
                  </>
                )}

                {verificationStatus === 'approved' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center p-8 text-center">
                      <div className="space-y-2">
                        <div className="flex justify-center">
                          <div className="rounded-full bg-green-100 p-3">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                          </div>
                        </div>
                        <h3 className="font-medium">Payment Approved</h3>
                        <p className="text-sm text-muted-foreground">
                          Client and staff have been notified
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setCurrentPage('billing')}
                    >
                      Return to Billing
                    </Button>
                  </div>
                )}

                {verificationStatus === 'rejected' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center p-8 text-center">
                      <div className="space-y-2">
                        <div className="flex justify-center">
                          <div className="rounded-full bg-red-100 p-3">
                            <XCircle className="h-8 w-8 text-red-600" />
                          </div>
                        </div>
                        <h3 className="font-medium">Payment Rejected</h3>
                        <p className="text-sm text-muted-foreground">
                          Client has been notified to resubmit
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setCurrentPage('billing')}
                    >
                      Return to Billing
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Contract:</span>
                  <span className="font-medium">${payment.totalContract.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Previous Deposit:</span>
                  <span className="font-medium">${payment.deposit.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current Payment:</span>
                  <span className="font-medium">${payment.amount.toLocaleString()}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Remaining Balance:</span>
                  <span className="font-medium text-primary">
                    ${(payment.totalContract - payment.deposit - payment.amount).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
