import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  ArrowLeft,
  Download,
  Send,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  CreditCard,
  DollarSign,
  Edit,
  Ban,
  RefreshCw,
  AlertTriangle,
  XCircle,
  Eye,
  ShieldCheck,
  ShieldX,
  Image,
  Upload
} from "lucide-react";
import { toast } from "sonner";
import { useNavigation } from "../contexts/NavigationContext";
import { invoiceService } from "../services/invoice.service";
import api from "../services/api";
import type { Invoice } from "../data/invoiceData";

interface InvoiceDetailProps {
  userRole: string;
  userId: string;
}

export function InvoiceDetail({ userRole }: InvoiceDetailProps) {
  const { setCurrentPage, pageParams, goBack } = useNavigation();
  const [showMarkPaidDialog, setShowMarkPaidDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showSendReminderDialog, setShowSendReminderDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [rawInvoice, setRawInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [clientPaymentMethod, setClientPaymentMethod] = useState('');
  const [clientPaymentNotes, setClientPaymentNotes] = useState('');
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Get invoice from API
  const invoiceId = pageParams?.invoiceId || "";

  const fetchInvoice = async () => {
    if (!invoiceId) { setLoading(false); return; }
    try {
      const raw = await invoiceService.getInvoice(invoiceId);
      setRawInvoice(raw);
      if (raw && raw.id) {
        setInvoice({
          id: raw.invoiceNumber || raw.id,
          clientId: raw.clientId || '',
          clientName: raw.client?.user?.name || raw.client?.companyName || '',
          clientEmail: raw.client?.user?.email || '',
          clientPhone: raw.client?.user?.phone || '',
          clientAddress: raw.client?.companyAddress || raw.client?.address || '',
          eventName: raw.event?.title || '',
          eventDate: raw.event?.date || '',
          eventLocation: raw.event?.venue || '',
          amount: raw.amount || 0,
          status: (raw.status || 'draft').toLowerCase() as Invoice['status'],
          issueDate: raw.createdAt || '',
          dueDate: raw.dueDate || '',
          paidDate: raw.paidDate || undefined,
          paymentMethod: raw.paymentMethod || undefined,
          lineItems: (raw.lineItems || []).map((li: any) => ({
            description: li.description,
            quantity: li.quantity,
            rate: li.unitPrice,
            hours: li.quantity,
            total: li.amount,
          })),
          subtotal: raw.subtotal || 0,
          tax: raw.taxAmount || 0,
          taxRate: raw.taxRate || 0,
          total: raw.amount || 0,
          notes: raw.notes || undefined,
        });
      }
    } catch {
      // Invoice not found
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);
  
  const companyInfo = {
    name: "Elite Event Staffing",
    address: "456 Staffing Avenue, Los Angeles, CA 90001",
    phone: "+1 (555) 987-6543",
    email: "billing@eliteeventstaffing.com",
    taxId: "12-3456789"
  };

  const handleBack = () => {
    goBack();
  };

  const handleDownloadPDF = () => {
    toast.success(`Downloading invoice ${invoice.id} as PDF`);
  };

  const handlePrint = () => {
    window.print();
    toast.info("Opening print dialog");
  };

  const handleSendEmail = () => {
    toast.success(`Sending invoice ${invoice.id} to ${invoice.clientEmail}`);
  };

  const handleConfirmMarkAsPaid = async () => {
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    setIsProcessing(true);
    try {
      await invoiceService.updateInvoice(rawInvoice.id, {
        status: 'PAID',
        paymentMethod,
        notes: paymentNotes || undefined,
      } as any);
      toast.success(`Invoice ${invoice.id} marked as PAID via ${paymentMethod}`);
      setShowMarkPaidDialog(false);
      setPaymentMethod("");
      setPaymentNotes("");
      fetchInvoice();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to mark as paid');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendReminder = () => {
    setShowSendReminderDialog(true);
    setReminderMessage(`Dear ${invoice.clientName},\n\nThis is a friendly reminder that invoice ${invoice.id} for "${invoice.eventName}" in the amount of $${invoice.amount.toLocaleString()} is ${invoice.status === 'overdue' ? 'now overdue' : 'pending payment'}.\n\nDue Date: ${invoice.dueDate}\nAmount Due: $${invoice.amount.toLocaleString()}\n\nPlease remit payment at your earliest convenience.\n\nThank you for your business!\n\nBest regards,\nElite Event Staffing`);
  };

  const handleConfirmSendReminder = () => {
    toast.success(`Payment reminder sent to ${invoice.clientName} at ${invoice.clientEmail}`);
    setShowSendReminderDialog(false);
    setReminderMessage("");
  };

  const handleCancelInvoice = async () => {
    if (!cancellationReason) {
      toast.error("Please provide a cancellation reason");
      return;
    }
    setIsProcessing(true);
    try {
      await invoiceService.updateInvoice(rawInvoice.id, {
        status: 'CANCELLED',
        notes: cancellationReason,
      });
      toast.success(`Invoice ${invoice.id} has been CANCELLED`);
      setShowCancelDialog(false);
      setCancellationReason("");
      fetchInvoice();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to cancel invoice');
    } finally {
      setIsProcessing(false);
    }
  };

  // Payment verification handlers (admin reviews client proof)
  const handleApprovePayment = async () => {
    setIsProcessing(true);
    try {
      await invoiceService.updateInvoice(rawInvoice.id, {
        status: 'PAID',
      } as any);
      toast.success(`Payment verified! Invoice ${invoice?.id} marked as PAID.`);
      fetchInvoice();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to approve payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectPayment = async () => {
    setIsProcessing(true);
    try {
      await invoiceService.updateInvoice(rawInvoice.id, {
        status: 'SENT',
        notes: `Payment proof rejected. ${invoice?.notes || ''}`.trim(),
      } as any);
      toast.success(`Payment rejected. Invoice sent back to client for re-payment.`);
      fetchInvoice();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to reject payment');
    } finally {
      setIsProcessing(false);
    }
  };

  // Client submits payment proof
  const handleClientSubmitPayment = async () => {
    if (!clientPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    if (!paymentProofFile) {
      toast.error('Please upload proof of payment');
      return;
    }
    setIsUploading(true);
    try {
      // Upload file
      const formData = new FormData();
      formData.append('file', paymentProofFile);
      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const fileUrl = uploadRes.data?.file?.url || uploadRes.data?.url;

      // Update invoice with proof
      await invoiceService.updateInvoice(rawInvoice.id, {
        status: 'AWAITING_VERIFICATION',
        paymentMethod: clientPaymentMethod,
        paymentProofUrl: fileUrl,
        notes: clientPaymentNotes || undefined,
      } as any);

      toast.success('Payment proof submitted! Awaiting admin verification.');
      setShowPayDialog(false);
      setClientPaymentMethod('');
      setClientPaymentNotes('');
      setPaymentProofFile(null);
      fetchInvoice();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit payment');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = () => {
    toast.info("Opening invoice editor");
  };

  const handleResendInvoice = () => {
    toast.success(`Invoice ${invoice.id} resent to ${invoice.clientEmail}`);
  };

  const handleDuplicate = () => {
    toast.success(`Created duplicate of invoice ${invoice.id}`);
  };

  const handleApplyLateFee = () => {
    toast.success(`Late fee of $250 applied to invoice ${invoice.id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'pending':
      case 'sent':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending Payment</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-700 border-red-200"><AlertTriangle className="h-3 w-3 mr-1" />Overdue</Badge>;
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700"><FileText className="h-3 w-3 mr-1" />Draft</Badge>;
      case 'awaiting_verification':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Clock className="h-3 w-3 mr-1" />Awaiting Verification</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDaysOverdue = () => {
    if (!invoice) return 0;
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Invoice not found</h3>
          <p className="text-muted-foreground mb-4">The invoice may have been removed or the ID is invalid.</p>
          <Button variant="outline" onClick={() => goBack()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-3xl">Invoice {invoice.id}</h1>
            <p className="text-muted-foreground mt-1">
              {invoice.eventName} - {invoice.clientName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(invoice.status)}
          {invoice.status === 'overdue' && (
            <Badge variant="destructive">
              {getDaysOverdue()} days overdue
            </Badge>
          )}
        </div>
      </div>

      {/* Admin Action Buttons - Only for admin */}
      {userRole === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admin Actions</CardTitle>
            <CardDescription>Manage invoice status and send communications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {invoice.status === 'awaiting_verification' && (
                <>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprovePayment} disabled={isProcessing}>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Approve Payment
                  </Button>
                  <Button variant="destructive" onClick={handleRejectPayment} disabled={isProcessing}>
                    <ShieldX className="h-4 w-4 mr-2" />
                    Reject Payment
                  </Button>
                </>
              )}
              {(invoice.status === 'pending' || invoice.status === 'sent' || invoice.status === 'overdue' || invoice.status === 'draft') && (
                <Button 
                  variant={invoice.status === 'overdue' ? 'destructive' : 'default'}
                  onClick={() => setShowMarkPaidDialog(true)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Paid
                </Button>
              )}
              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                <Button variant="outline" onClick={handleSendReminder}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Reminder
                </Button>
              )}
              {invoice.status === 'overdue' && (
                <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50" onClick={handleApplyLateFee}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Apply Late Fee
                </Button>
              )}
              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50" onClick={() => setShowCancelDialog(true)}>
                  <Ban className="h-4 w-4 mr-2" />
                  Cancel Invoice
                </Button>
              )}
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" onClick={handleResendInvoice}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Resend Invoice
              </Button>
              <Button variant="outline" onClick={handleDuplicate}>
                <FileText className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Verification Banner - Admin reviews client proof */}
      {invoice.status === 'awaiting_verification' && rawInvoice && userRole === 'admin' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              Payment Verification Required
            </CardTitle>
            <CardDescription>The client has submitted payment proof for this invoice. Please review and approve or reject.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Payment Method</div>
                <div className="font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  {rawInvoice.paymentMethod || 'Not specified'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Submitted On</div>
                <div className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  {rawInvoice.paymentProofDate ? new Date(rawInvoice.paymentProofDate).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            {rawInvoice.paymentProofUrl ? (
              <div>
                <div className="text-sm text-muted-foreground mb-2">Payment Proof</div>
                <div className="border rounded-lg p-3 bg-white">
                  {rawInvoice.paymentProofUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <div className="space-y-2">
                      <img
                        src={`http://localhost:5000${rawInvoice.paymentProofUrl}`}
                        alt="Payment proof"
                        className="max-h-96 rounded-md border object-contain mx-auto"
                      />
                      <div className="flex justify-center">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`http://localhost:5000${rawInvoice.paymentProofUrl}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-2" />
                            View Full Size
                          </a>
                        </Button>
                      </div>
                    </div>
                  ) : rawInvoice.paymentProofUrl.match(/\.pdf$/i) ? (
                    <div className="space-y-2">
                      <iframe
                        src={`http://localhost:5000${rawInvoice.paymentProofUrl}`}
                        className="w-full h-96 rounded-md border"
                        title="Payment proof PDF"
                      />
                      <div className="flex justify-center">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`http://localhost:5000${rawInvoice.paymentProofUrl}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-2" />
                            Open PDF
                          </a>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Payment Proof Document</div>
                        <div className="text-xs text-muted-foreground">Click to view the uploaded proof file</div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`http://localhost:5000${rawInvoice.paymentProofUrl}`} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4 mr-2" />
                          View File
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-3 bg-white text-sm text-muted-foreground">
                No payment proof file was uploaded.
              </div>
            )}

            <Separator />
            <div className="flex gap-3">
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleApprovePayment}
                disabled={isProcessing}
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Approve Payment'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectPayment}
                disabled={isProcessing}
              >
                <ShieldX className="h-4 w-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Reject Payment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Payment Action - show Pay button for clients */}
      {userRole === 'client' && (invoice.status === 'pending' || invoice.status === 'sent' || invoice.status === 'overdue' || invoice.status === 'draft') && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-green-900">Payment Required</p>
                <p className="text-sm text-green-700 mt-1">
                  Please submit your payment of <span className="font-semibold">${invoice.total.toLocaleString()}</span> and upload proof of payment for verification.
                </p>
                <Button size="sm" className="mt-3 bg-green-600 hover:bg-green-700" onClick={() => setShowPayDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Pay & Upload Proof
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Awaiting Verification Notice */}
      {userRole === 'client' && invoice.status === 'awaiting_verification' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Payment Under Review</p>
                <p className="text-sm text-blue-700 mt-1">
                  Your payment proof has been submitted and is being reviewed by the admin. You will be notified once it's approved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning for Overdue Invoices - Admin only */}
      {invoice.status === 'overdue' && userRole === 'admin' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Payment Overdue</p>
                <p className="text-sm text-red-700 mt-1">
                  This invoice is {getDaysOverdue()} days past due. Please contact the client immediately or take appropriate collection actions.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="destructive" onClick={handleSendReminder}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Urgent Reminder
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-300" onClick={handleApplyLateFee}>
                    Apply Late Fee
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Document */}
          <Card>
            <CardContent className="pt-6">
              {/* Company Header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-semibold text-[#5E1916]">{companyInfo.name}</h2>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {companyInfo.address}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {companyInfo.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {companyInfo.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Tax ID: {companyInfo.taxId}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-semibold">INVOICE</div>
                  <div className="mt-2 text-sm">
                    <div className="font-medium">{invoice.id}</div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Bill To & Invoice Details */}
              <div className="grid gap-6 md:grid-cols-2 mb-8">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">BILL TO</div>
                  <div className="font-semibold text-lg">{invoice.clientName}</div>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {invoice.clientAddress}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {invoice.clientEmail}
                    </div>
                    {invoice.clientPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {invoice.clientPhone}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Issue Date:</span>
                      <span className="font-medium">{new Date(invoice.issueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span className={`font-medium ${invoice.status === 'overdue' ? 'text-red-600' : ''}`}>
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    {invoice.paidDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Paid Date:</span>
                        <span className="font-medium text-green-600">{new Date(invoice.paidDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {invoice.paymentMethod && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Method:</span>
                        <span className="font-medium">{invoice.paymentMethod}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm font-medium text-muted-foreground mb-2">EVENT DETAILS</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Event Name</div>
                    <div className="font-medium">{invoice.eventName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Event Date</div>
                    <div className="font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(invoice.eventDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-xs text-muted-foreground">Location</div>
                    <div className="font-medium flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {invoice.eventLocation}
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="mb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.lineItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.rate.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.hours}</TableCell>
                        <TableCell className="text-right font-medium">${item.total.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">${invoice.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax ({invoice.taxRate}%):</span>
                    <span className="font-medium">${invoice.tax.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-2xl font-semibold text-[#5E1916]">
                      ${invoice.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="mt-8 pt-6 border-t">
                  <div className="text-sm font-medium text-muted-foreground mb-2">NOTES</div>
                  <p className="text-sm">{invoice.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
                <p>Thank you for your business!</p>
                <p className="mt-1">
                  For any questions regarding this invoice, please contact {companyInfo.email}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Current Status</div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(invoice.status)}
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground mb-2">Amount Due</div>
                <div className="text-2xl font-semibold">
                  {invoice.status === 'paid' ? (
                    <span className="text-green-600">$0.00</span>
                  ) : (
                    <span className="text-[#5E1916]">${invoice.total.toLocaleString()}</span>
                  )}
                </div>
              </div>
              {invoice.status !== 'paid' && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Due Date</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className={`font-medium ${invoice.status === 'overdue' ? 'text-red-600' : ''}`}>
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    {invoice.status === 'overdue' && (
                      <p className="text-xs text-red-600 mt-1">
                        {getDaysOverdue()} days overdue
                      </p>
                    )}
                  </div>
                </>
              )}
              {invoice.status === 'paid' && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Payment Details</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Paid on {new Date(invoice.paidDate!).toLocaleDateString()}</span>
                      </div>
                      {invoice.paymentMethod && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span>{invoice.paymentMethod}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              {invoice.status === 'awaiting_verification' && rawInvoice && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Verification Pending</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>Proof submitted {rawInvoice.paymentProofDate ? new Date(rawInvoice.paymentProofDate).toLocaleDateString() : ''}</span>
                      </div>
                      {rawInvoice.paymentMethod && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span>{rawInvoice.paymentMethod}</span>
                        </div>
                      )}
                      {rawInvoice.paymentProofUrl && (
                        <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                          <a href={`http://localhost:5000${rawInvoice.paymentProofUrl}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-2" />
                            View Payment Proof
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Client</div>
                <div className="font-medium">{invoice.clientName}</div>
              </div>
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground mb-1">Email</div>
                <div className="text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {invoice.clientEmail}
                </div>
              </div>
              {invoice.clientPhone && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Phone</div>
                    <div className="text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {invoice.clientPhone}
                    </div>
                  </div>
                </>
              )}
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground mb-1">Address</div>
                <div className="text-sm flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{invoice.clientAddress}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Client: Pay button */}
              {userRole === 'client' && (invoice.status === 'pending' || invoice.status === 'sent' || invoice.status === 'overdue' || invoice.status === 'draft') && (
                <Button
                  size="sm"
                  className="w-full justify-start bg-green-600 hover:bg-green-700"
                  onClick={() => setShowPayDialog(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Pay & Upload Proof
                </Button>
              )}
              {/* Admin: Send Reminder */}
              {userRole === 'admin' && invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleSendReminder}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Reminder
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleDownloadPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Invoice
              </Button>
              {userRole === 'admin' && invoice.status !== 'paid' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Invoice
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Line Items:</span>
                <span className="font-medium">{invoice.lineItems.length}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">${invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-medium">${invoice.tax.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Total:</span>
                <span className="font-semibold text-[#5E1916]">
                  ${invoice.total.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mark as Paid Dialog */}
      <Dialog open={showMarkPaidDialog} onOpenChange={setShowMarkPaidDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Invoice as Paid</DialogTitle>
            <DialogDescription>
              Confirm payment receipt for invoice {invoice.id} - ${invoice.total.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                  <SelectItem value="ACH Transfer">ACH Transfer</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Corporate Account">Corporate Account</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentNotes">Payment Notes (Optional)</Label>
              <Textarea
                id="paymentNotes"
                placeholder="Transaction ID, reference number, or any other payment details..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMarkPaidDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmMarkAsPaid}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Reminder Dialog */}
      <Dialog open={showSendReminderDialog} onOpenChange={setShowSendReminderDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
            <DialogDescription>
              Send a payment reminder email to {invoice.clientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reminderTo">To:</Label>
              <Input id="reminderTo" value={invoice.clientEmail} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminderMessage">Message</Label>
              <Textarea
                id="reminderMessage"
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendReminderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSendReminder}>
              <Send className="h-4 w-4 mr-2" />
              Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Invoice Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel invoice {invoice.id}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancellationReason">Cancellation Reason *</Label>
              <Textarea
                id="cancellationReason"
                placeholder="Please provide a reason for cancelling this invoice..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Invoice
            </Button>
            <Button variant="destructive" onClick={handleCancelInvoice}>
              <Ban className="h-4 w-4 mr-2" />
              Cancel Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Payment Proof Upload Dialog */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Payment</DialogTitle>
            <DialogDescription>
              Upload proof of payment for invoice {invoice.id} — ${invoice.total.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Invoice</span>
                <span className="font-medium">{invoice.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Due</span>
                <span className="font-semibold text-[#5E1916]">${invoice.total.toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Method *</Label>
              <Select value={clientPaymentMethod} onValueChange={setClientPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                  <SelectItem value="ACH Transfer">ACH Transfer</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Zelle">Zelle</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Proof of Payment *</Label>
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-gray-50 transition-colors"
                onClick={() => document.getElementById('proofFileInput')?.click()}
              >
                {paymentProofFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">{paymentProofFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground"
                      onClick={(e) => { e.stopPropagation(); setPaymentProofFile(null); }}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload receipt or screenshot</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, PDF up to 10MB</p>
                  </>
                )}
              </div>
              <input
                id="proofFileInput"
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPaymentProofFile(file);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Transaction ID, reference number, or any details..."
                value={clientPaymentNotes}
                onChange={(e) => setClientPaymentNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleClientSubmitPayment}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Submitting...' : 'Submit Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
