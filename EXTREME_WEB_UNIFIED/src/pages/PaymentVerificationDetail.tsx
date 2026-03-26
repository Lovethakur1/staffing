import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Separator } from "../components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Eye, 
  FileText, 
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  Building2,
  CreditCard,
  Info,
  Mail,
  Phone,
  MapPin,
  Users,
  FileCheck,
  ImageIcon
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner";
import { invoiceService } from "../services/invoice.service";

interface PaymentVerificationDetailProps {
  userRole: string;
  userId: string;
}

export function PaymentVerificationDetail({ userRole }: PaymentVerificationDetailProps) {
  const { setCurrentPage, pageParams } = useNavigation();
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [payment, setPayment] = useState<any>(null);

  const paymentId = pageParams?.paymentId || "PAY-2024-001";

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const inv = await invoiceService.getInvoice(paymentId);
        const lineItems = inv.lineItems || [];
        const mapped = {
          id: inv.invoiceNumber || inv.id,
          rawId: inv.id,
          clientName: inv.client?.name || inv.client?.user?.name || '',
          clientCompany: inv.client?.company || inv.client?.user?.company || '',
          clientEmail: inv.client?.email || inv.client?.user?.email || '',
          clientPhone: inv.client?.phone || inv.client?.user?.phone || '',
          clientAddress: inv.client?.address || '',
          eventName: inv.event?.title || '',
          eventDate: inv.event?.date || inv.dueDate || inv.createdAt,
          eventTime: inv.event?.startTime || '',
          eventLocation: inv.event?.location || inv.event?.venue || '',
          guestCount: inv.event?.guestCount || '',
          staffCount: inv.event?._count?.shifts || '',
          breakdown: lineItems.length > 0
            ? lineItems.map((item: any) => ({
                item: item.description,
                quantity: item.quantity,
                rate: item.unitPrice,
                hours: '',
                total: item.quantity * item.unitPrice,
              }))
            : [{ item: 'Invoice Amount', quantity: 1, rate: inv.amount || 0, hours: '', total: inv.amount || 0 }],
          subtotal: inv.subtotal || inv.amount || 0,
          tax: inv.taxAmount || 0,
          total: inv.amount || 0,
          deposit: 0,
          totalContract: inv.amount || 0,
          remaining: inv.amount || 0,
          amount: inv.amount || 0,
          paymentType: 'Invoice Payment',
          paymentMethod: inv.stripeId ? 'Credit Card' : 'Bank Transfer',
          reference: inv.invoiceNumber || inv.id,
          accountLast4: null,
          submittedBy: inv.client?.name || inv.client?.user?.name || '',
          submittedDate: inv.paidDate || inv.updatedAt || inv.createdAt,
          submittedTime: new Date(inv.paidDate || inv.updatedAt || inv.createdAt).toLocaleTimeString(),
          attachmentDetails: [],
          status: inv.status === 'PAID' ? 'approved'
               : inv.status === 'CANCELLED' ? 'rejected'
               : 'pending',
          notes: inv.notes || '',
        };
        setPayment(mapped);
      } catch { /* failed to fetch invoice */ }
    };
    fetchPayment();
  }, [paymentId]);

  const handleBack = () => {
    setCurrentPage('verify-payment');
  };

  const handleApprove = async () => {
    if (!paymentMethod) {
      toast.error("Please confirm the payment method");
      return;
    }
    try {
      await invoiceService.updateInvoice(payment.rawId, { status: 'PAID' });
      toast.success(`Payment ${payment.id} approved successfully`);
      setShowApproveDialog(false);
      setNotes("");
      setPaymentMethod("");
      setTimeout(() => handleBack(), 1500);
    } catch {
      toast.error("Failed to approve payment");
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    try {
      await invoiceService.updateInvoice(payment.rawId, { status: 'CANCELLED' });
      toast.success(`Payment ${payment.id} rejected. Client will be notified.`);
      setShowRejectDialog(false);
      setRejectionReason("");
      setTimeout(() => handleBack(), 1500);
    } catch {
      toast.error("Failed to reject payment");
    }
  };

  const handleViewDocument = (doc: any) => {
    setSelectedDocument(doc);
    setShowDocumentViewer(true);
  };

  const handleDownloadDocument = (doc: any) => {
    toast.success(`Downloading ${doc.name}`);
  };

  const handleRequestMoreInfo = () => {
    toast.success("Request for additional information sent to client");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Approved
        </Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>;
      default:
        return null;
    }
  };

  if (!payment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-muted-foreground">Loading payment details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl mb-1">Payment Verification</h1>
              <p className="text-muted-foreground">Review payment submission #{payment.id}</p>
            </div>
          </div>
          {getStatusBadge(payment.status)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client & Event Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Client & Event Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Client Info */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Client Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Client Name</p>
                        <p className="font-medium">{payment.clientName}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Company</p>
                        <p className="font-medium">{payment.clientCompany}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{payment.clientEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{payment.clientPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 md:col-span-2">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{payment.clientAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Event Info */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Event Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Event Name</p>
                        <p className="font-medium">{payment.eventName}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Event Date & Time</p>
                        <p className="font-medium">{new Date(payment.eventDate).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">{payment.eventTime}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 md:col-span-2">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{payment.eventLocation}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Expected Guests</p>
                        <p className="font-medium">{payment.guestCount} guests</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Staff Required</p>
                        <p className="font-medium">{payment.staffCount} staff members</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Hours</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payment.breakdown.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.item}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">${item.rate}</TableCell>
                          <TableCell className="text-right">{item.hours}</TableCell>
                          <TableCell className="text-right font-medium">${item.total.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-medium">Subtotal</TableCell>
                        <TableCell className="text-right font-medium">${payment.subtotal.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-medium">Tax (18%)</TableCell>
                        <TableCell className="text-right font-medium">${payment.tax.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-semibold">Total Amount</TableCell>
                        <TableCell className="text-right font-semibold text-lg">${payment.total.toLocaleString()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {payment.deposit > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-blue-900">Payment Summary</p>
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700">Total Contract Value:</span>
                            <span className="font-medium">${payment.totalContract.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Deposit Paid:</span>
                            <span className="font-medium">${payment.deposit.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">This Payment ({payment.paymentType}):</span>
                            <span className="font-semibold text-blue-900">${payment.remaining.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Proof Attachments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Payment Proof Attachments
                </CardTitle>
                <CardDescription>
                  Review submitted payment documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {payment.attachmentDetails.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        {doc.type.includes('image') ? (
                          <ImageIcon className="h-10 w-10 text-blue-500" />
                        ) : (
                          <FileText className="h-10 w-10 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.size} • Uploaded at {doc.uploadedAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocument(doc)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadDocument(doc)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Payment Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Amount</p>
                  <p className="text-2xl font-semibold text-primary">${payment.amount.toLocaleString()}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Payment Type</p>
                  <Badge variant="outline" className="mt-1">{payment.paymentType}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{payment.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reference Number</p>
                  <p className="font-mono text-sm">{payment.reference}</p>
                </div>
                {payment.accountLast4 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Account Last 4 Digits</p>
                    <p className="font-medium">****{payment.accountLast4}</p>
                  </div>
                )}
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Submitted By</p>
                  <p className="font-medium">{payment.submittedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submission Date & Time</p>
                  <p className="font-medium">{new Date(payment.submittedDate).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground">{payment.submittedTime}</p>
                </div>
              </CardContent>
            </Card>

            {/* Admin Actions */}
            {payment.status === "pending" && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>Admin Actions</CardTitle>
                  <CardDescription>
                    Review and take action on this payment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setShowApproveDialog(true)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve Payment
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Payment
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleRequestMoreInfo}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Request More Info
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {payment.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Additional Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{payment.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Payment</DialogTitle>
            <DialogDescription>
              Confirm payment approval for {payment.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Payment Approval</p>
                  <p className="text-sm text-green-700 mt-1">
                    Approving this payment will confirm receipt of ${payment.amount.toLocaleString()} and update the invoice status.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Confirm Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Admin Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this approval..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting payment {payment.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Payment Rejection</p>
                  <p className="text-sm text-red-700 mt-1">
                    The client will be notified and asked to resubmit payment proof with corrections.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Explain why this payment is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              <XCircle className="h-4 w-4 mr-2" />
              Reject Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Dialog */}
      <Dialog open={showDocumentViewer} onOpenChange={setShowDocumentViewer}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.name}</DialogTitle>
            <DialogDescription>
              {selectedDocument?.size} • Uploaded at {selectedDocument?.uploadedAt}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {selectedDocument?.type.includes('image') ? (
              <div className="flex items-center justify-center h-full bg-slate-100 rounded-lg">
                <div className="text-center p-8">
                  <ImageIcon className="h-20 w-20 mx-auto text-slate-400 mb-4" />
                  <p className="text-muted-foreground">Image preview: {selectedDocument?.name}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    In a real application, the image would be displayed here
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-slate-100 rounded-lg">
                <div className="text-center p-8">
                  <FileText className="h-20 w-20 mx-auto text-slate-400 mb-4" />
                  <p className="text-muted-foreground">PDF preview: {selectedDocument?.name}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    In a real application, the PDF would be displayed here
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocumentViewer(false)}>
              Close
            </Button>
            <Button onClick={() => handleDownloadDocument(selectedDocument)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
