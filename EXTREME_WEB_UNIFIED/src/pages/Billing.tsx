import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Clock,
  Receipt,
  FileText,
  Eye,
  Loader2,
  Upload,
  CreditCard,
  Image,
  HourglassIcon,
} from "lucide-react";
import { format } from "date-fns";
import { invoiceService } from "../services/invoice.service";
import api from "../services/api";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner";

interface BillingProps {
  userRole: string;
  userId: string;
}

export function Billing({ userRole, userId }: BillingProps) {
  const { setCurrentPage } = useNavigation();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Payment dialog state
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const response = await invoiceService.getInvoices({ take: 200 });
      const data = response.data || response;
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch invoices', err);
      toast.error('Failed to load billing data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePayClick = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPaymentMethod("");
    setPaymentNotes("");
    setProofFile(null);
    setShowPayDialog(true);
  };

  const handleSubmitPayment = async () => {
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    if (!proofFile) {
      toast.error("Please upload proof of payment");
      return;
    }
    if (!selectedInvoice) return;

    setIsSubmitting(true);
    try {
      // 1. Upload the proof file
      const formData = new FormData();
      formData.append('file', proofFile);
      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const proofUrl = uploadRes.data?.file?.url || uploadRes.data?.url || uploadRes.data?.filename;

      // 2. Update invoice with payment proof
      await api.put(`/invoices/${selectedInvoice.id}`, {
        status: 'AWAITING_VERIFICATION',
        paymentMethod,
        paymentProofUrl: proofUrl,
        notes: paymentNotes || selectedInvoice.notes,
      });

      toast.success("Payment proof submitted! Awaiting admin verification.");
      setShowPayDialog(false);
      fetchInvoices();
    } catch (err: any) {
      console.error('Payment submission failed', err);
      toast.error(err.response?.data?.error || 'Failed to submit payment proof');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate stats from real data
  const paidInvoices = invoices.filter(inv => inv.status === 'PAID');
  const pendingInvoices = invoices.filter(inv => inv.status === 'SENT' || inv.status === 'DRAFT');
  const overdueInvoices = invoices.filter(inv => inv.status === 'OVERDUE');
  const awaitingInvoices = invoices.filter(inv => inv.status === 'AWAITING_VERIFICATION');

  const totalPaid = paidInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalAwaiting = awaitingInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalSpent = totalPaid + totalPending + totalOverdue + totalAwaiting;

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case "SENT":
        return <Badge className="bg-warning text-warning-foreground"><Clock className="h-3 w-3 mr-1" />Pending Payment</Badge>;
      case "DRAFT":
        return <Badge variant="secondary"><FileText className="h-3 w-3 mr-1" />Draft</Badge>;
      case "OVERDUE":
        return <Badge className="bg-destructive text-destructive-foreground"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>;
      case "AWAITING_VERIFICATION":
        return <Badge className="bg-blue-100 text-blue-700"><HourglassIcon className="h-3 w-3 mr-1" />Awaiting Verification</Badge>;
      case "CANCELLED":
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const canPay = (status: string) => {
    const s = status?.toUpperCase();
    return s === 'SENT' || s === 'OVERDUE' || s === 'DRAFT' || s === 'PENDING';
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Billing & Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View your invoices and billing information
          </p>
        </div>
      </div>

      {/* Billing Overview */}
      <div className="adaptive-stats-grid">
        <Card className="p-6 min-w-0 max-w-[280px] mx-auto w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-0 pt-0">
            <div className="text-2xl font-semibold text-foreground mb-1">${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">{invoices.length} total invoices</p>
          </CardContent>
        </Card>

        <Card className="p-6 min-w-0 max-w-[280px] mx-auto w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-0 pt-0">
            <div className="text-2xl font-semibold text-green-600 mb-1">${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">{paidInvoices.length} paid invoices</p>
          </CardContent>
        </Card>

        <Card className="p-6 min-w-0 max-w-[280px] mx-auto w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-0 pt-0">
            <div className="text-2xl font-semibold text-yellow-600 mb-1">${totalPending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">{pendingInvoices.length} pending invoices</p>
          </CardContent>
        </Card>

        <Card className="p-6 min-w-0 max-w-[280px] mx-auto w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Awaiting Verification</CardTitle>
            <HourglassIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-0 pt-0">
            <div className="text-2xl font-semibold text-blue-600 mb-1">${totalAwaiting.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">{awaitingInvoices.length} awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({invoices.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingInvoices.length})</TabsTrigger>
          <TabsTrigger value="awaiting">Awaiting ({awaitingInvoices.length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({paidInvoices.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({overdueInvoices.length})</TabsTrigger>
        </TabsList>

        {["all", "pending", "awaiting", "paid", "overdue"].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <Card className="desktop-card-padding">
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                    <span className="text-muted-foreground">Loading invoices...</span>
                  </div>
                ) : (
                  <div className="responsive-table">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[130px]">Invoice #</TableHead>
                          <TableHead className="min-w-[200px]">Event</TableHead>
                          <TableHead className="min-w-[100px]">Amount</TableHead>
                          <TableHead className="min-w-[100px]">Due Date</TableHead>
                          <TableHead className="min-w-[100px]">Status</TableHead>
                          <TableHead className="min-w-[160px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices
                          .filter(inv => {
                            if (tab === "all") return true;
                            if (tab === "pending") return inv.status === "SENT" || inv.status === "DRAFT";
                            if (tab === "awaiting") return inv.status === "AWAITING_VERIFICATION";
                            if (tab === "paid") return inv.status === "PAID";
                            if (tab === "overdue") return inv.status === "OVERDUE";
                            return true;
                          })
                          .map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell className="font-medium font-mono text-sm">{invoice.invoiceNumber}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{invoice.event?.title || 'N/A'}</p>
                                  {invoice.notes && (
                                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">{invoice.notes}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="font-semibold">${(invoice.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                              <TableCell>{invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                              <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setCurrentPage('invoice-detail', { invoiceId: invoice.id });
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  {canPay(invoice.status) && (
                                    <Button
                                      size="sm"
                                      className="bg-[#5E1916] hover:bg-[#4E0707]"
                                      onClick={() => handlePayClick(invoice)}
                                    >
                                      <CreditCard className="h-4 w-4 mr-1" />
                                      Pay
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        {invoices.filter(inv => {
                          if (tab === "all") return true;
                          if (tab === "pending") return inv.status === "SENT" || inv.status === "DRAFT";
                          if (tab === "awaiting") return inv.status === "AWAITING_VERIFICATION";
                          if (tab === "paid") return inv.status === "PAID";
                          if (tab === "overdue") return inv.status === "OVERDUE";
                          return true;
                        }).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>No {tab === "all" ? "" : tab} invoices found</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Payment Proof Upload Dialog */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Submit Payment
            </DialogTitle>
            <DialogDescription>
              Pay invoice {selectedInvoice?.invoiceNumber} — ${(selectedInvoice?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Invoice summary */}
            <div className="p-3 bg-gray-50 rounded-lg border space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Event:</span>
                <span className="font-medium">{selectedInvoice?.event?.title || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Due:</span>
                <span className="font-bold text-lg text-green-700">${(selectedInvoice?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Due Date:</span>
                <span>{selectedInvoice?.dueDate ? format(new Date(selectedInvoice.dueDate), 'MMM dd, yyyy') : 'N/A'}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                  <SelectItem value="ACH">ACH Transfer</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Zelle">Zelle</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Proof of Payment Upload */}
            <div className="space-y-2">
              <Label>Proof of Payment *</Label>
              <p className="text-xs text-muted-foreground">Upload a screenshot, receipt, or bank confirmation (PNG, JPG, PDF)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 10 * 1024 * 1024) {
                      toast.error("File size must be under 10MB");
                      return;
                    }
                    setProofFile(file);
                  }
                }}
              />
              {proofFile ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Image className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-900 truncate">{proofFile.name}</p>
                    <p className="text-xs text-green-700">{(proofFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setProofFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-24 border-dashed"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload proof of payment</span>
                  </div>
                </Button>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Payment Notes (optional)</Label>
              <Textarea
                placeholder="Reference number, transfer details, etc."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPayDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              className="bg-[#5E1916] hover:bg-[#4E0707]"
              onClick={handleSubmitPayment}
              disabled={isSubmitting || !paymentMethod || !proofFile}
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</>
              ) : (
                <><Upload className="h-4 w-4 mr-2" />Submit Payment Proof</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
