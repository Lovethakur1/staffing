import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { 
  Receipt,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  MapPin,
  Users,
  FileText,
  Building2,
  Mail,
  Phone,
  ArrowLeft,
  Printer,
  DollarSign
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner@2.0.3";

interface InvoiceDetailProps {
  userRole: string;
  userId: string;
}

// Mock invoice data - matching the Invoicing page
const mockInvoices = [
  {
    id: "INV-2024-001",
    eventTitle: "Corporate Annual Gala 2024",
    eventDate: "2024-12-15",
    location: "Grand Hyatt, New York",
    staffCount: 25,
    totalAmount: 15750,
    amountPaid: 7875,
    remainingBalance: 7875,
    status: "partial" as const,
    dueDate: "2024-12-08",
    invoiceDate: "2024-11-15",
    clientName: "Premium Events LLC",
    clientEmail: "billing@premiumevents.com",
    clientPhone: "+1 (555) 123-4567",
    billingAddress: "123 Business Avenue, Suite 500, New York, NY 10001",
    items: [
      { description: "Event Manager (8 hours)", quantity: 1, rate: 150, amount: 1200 },
      { description: "Waitstaff (5 hours minimum)", quantity: 15, rate: 35, amount: 2625 },
      { description: "Bartenders (5 hours minimum)", quantity: 4, rate: 40, amount: 800 },
      { description: "Security Personnel (8 hours)", quantity: 3, rate: 50, amount: 1200 },
      { description: "Cleaning Crew (4 hours)", quantity: 2, rate: 30, amount: 240 }
    ],
    subtotal: 6065,
    serviceFee: 606.50,
    tax: 1202.70,
    payments: [
      { date: "2024-11-20", amount: 7875, method: "Credit Card", reference: "PAY-2024-001" }
    ],
    notes: "50% deposit paid. Balance due 7 days before event."
  },
  {
    id: "INV-2024-002",
    eventTitle: "Tech Conference Expo",
    eventDate: "2024-11-28",
    location: "Convention Center, Boston",
    staffCount: 40,
    totalAmount: 25200,
    amountPaid: 25200,
    remainingBalance: 0,
    status: "paid" as const,
    dueDate: "2024-11-21",
    invoiceDate: "2024-10-28",
    clientName: "Premium Events LLC",
    clientEmail: "billing@premiumevents.com",
    clientPhone: "+1 (555) 123-4567",
    billingAddress: "123 Business Avenue, Suite 500, New York, NY 10001",
    items: [
      { description: "Event Coordinators (10 hours)", quantity: 3, rate: 150, amount: 4500 },
      { description: "Registration Staff (8 hours)", quantity: 10, rate: 35, amount: 2800 },
      { description: "AV Technicians (10 hours)", quantity: 4, rate: 75, amount: 3000 },
      { description: "Setup Crew (6 hours)", quantity: 8, rate: 40, amount: 1920 },
      { description: "Catering Staff (8 hours)", quantity: 15, rate: 35, amount: 4200 }
    ],
    subtotal: 16420,
    serviceFee: 1642,
    tax: 3238,
    payments: [
      { date: "2024-11-01", amount: 12600, method: "Bank Transfer", reference: "PAY-2024-002A" },
      { date: "2024-11-15", amount: 12600, method: "Bank Transfer", reference: "PAY-2024-002B" }
    ],
    notes: "Full payment received. Thank you for your business!"
  },
  {
    id: "INV-2024-003",
    eventTitle: "Charity Fundraising Dinner",
    eventDate: "2025-01-20",
    location: "Four Seasons, Chicago",
    staffCount: 18,
    totalAmount: 11340,
    amountPaid: 0,
    remainingBalance: 11340,
    status: "pending" as const,
    dueDate: "2025-01-13",
    invoiceDate: "2024-12-20",
    clientName: "Premium Events LLC",
    clientEmail: "billing@premiumevents.com",
    clientPhone: "+1 (555) 123-4567",
    billingAddress: "123 Business Avenue, Suite 500, New York, NY 10001",
    items: [
      { description: "Event Manager (6 hours)", quantity: 1, rate: 150, amount: 900 },
      { description: "Waitstaff (5 hours minimum)", quantity: 12, rate: 35, amount: 2100 },
      { description: "Bartenders (5 hours minimum)", quantity: 3, rate: 40, amount: 600 },
      { description: "Coat Check Attendants (5 hours)", quantity: 2, rate: 30, amount: 300 }
    ],
    subtotal: 3900,
    serviceFee: 390,
    tax: 750,
    payments: [],
    notes: "Payment due 7 days before event date."
  }
];

export function InvoiceDetail({ userRole, userId }: InvoiceDetailProps) {
  const { setCurrentPage, pageParams } = useNavigation();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  
  // Get invoice from pageParams
  const invoiceId = pageParams?.invoiceId;
  const invoice = mockInvoices.find(inv => inv.id === invoiceId) || mockInvoices[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-50 text-green-700 border-green-200';
      case 'partial': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'overdue': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'partial': return <Clock className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleDownloadPDF = () => {
    toast.success(`Downloading invoice ${invoice.id} as PDF...`);
  };

  const handlePrintInvoice = () => {
    toast.info(`Printing invoice ${invoice.id}...`);
  };

  const handleMakePayment = () => {
    setPaymentModalOpen(true);
  };

  const handleProcessPayment = () => {
    toast.success(`Processing payment for ${invoice.id}...`);
    setPaymentModalOpen(false);
    // Simulate payment success - in real app would update invoice status
    setTimeout(() => {
      toast.success("Payment processed successfully!");
    }, 1500);
  };

  return (
    <div className="page-container">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentPage('invoicing')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Button>
      </div>

      {/* Invoice Header */}
      <Card className="border-0 shadow-lg mb-6">
        <CardHeader className="border-b">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Receipt className="h-6 w-6 text-sangria" />
                <h1>Invoice Details</h1>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sangria">{invoice.id}</p>
                <Badge className={`${getStatusColor(invoice.status)} border flex items-center gap-1.5`}>
                  {getStatusIcon(invoice.status)}
                  <span className="text-xs">
                    {invoice.status === 'partial' ? 'Partially Paid' 
                      : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={handlePrintInvoice}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              {invoice.remainingBalance > 0 && (
                <Button
                  className="bg-sangria hover:bg-wine text-white gap-2"
                  onClick={handleMakePayment}
                >
                  <CreditCard className="h-4 w-4" />
                  Make Payment
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Details */}
            <div className="space-y-4">
              <div>
                <h3 className="mb-3">Event Information</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Event Name</p>
                      <p className="font-medium">{invoice.eventTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Event Date</p>
                      <p className="font-medium">
                        {new Date(invoice.eventDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-medium">{invoice.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Staff Assigned</p>
                      <p className="font-medium">{invoice.staffCount} staff members</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Details */}
            <div className="space-y-4">
              <div>
                <h3 className="mb-3">Billing Information</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Client Name</p>
                      <p className="font-medium">{invoice.clientName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{invoice.clientEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{invoice.clientPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Billing Address</p>
                      <p className="font-medium">{invoice.billingAddress}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Invoice Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Invoice Date</p>
              <p className="font-medium">
                {new Date(invoice.invoiceDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Due Date</p>
              <p className="font-medium">
                {new Date(invoice.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Event Date</p>
              <p className="font-medium">
                {new Date(invoice.eventDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card className="border-0 shadow-lg mb-6">
        <CardHeader className="border-b">
          <CardTitle>Invoice Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right font-mono">${item.rate.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono font-semibold">${item.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="border-t p-6">
            <div className="flex flex-col items-end space-y-2 max-w-sm ml-auto">
              <div className="flex justify-between w-full">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-mono">${invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between w-full">
                <span className="text-muted-foreground">Service Fee (10%):</span>
                <span className="font-mono">${invoice.serviceFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between w-full">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-mono">${invoice.tax.toLocaleString()}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between w-full">
                <span>Total Amount:</span>
                <span className="font-mono font-semibold">${invoice.totalAmount.toLocaleString()}</span>
              </div>
              {invoice.amountPaid > 0 && (
                <>
                  <div className="flex justify-between w-full">
                    <span className="text-green-600">Amount Paid:</span>
                    <span className="font-mono text-green-600 font-semibold">-${invoice.amountPaid.toLocaleString()}</span>
                  </div>
                  <Separator className="my-2" />
                </>
              )}
              <div className="flex justify-between w-full">
                <span className="text-sangria">Balance Due:</span>
                <span className="font-mono text-sangria font-semibold">${invoice.remainingBalance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      {invoice.payments && invoice.payments.length > 0 && (
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader className="border-b">
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Date</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.payments.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {new Date(payment.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                    <TableCell className="text-right font-mono text-green-600 font-semibold">
                      ${payment.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {invoice.notes && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b">
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-sangria" />
              Payment Summary
            </DialogTitle>
            <DialogDescription>
              Review invoice details and proceed with payment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Invoice Summary */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Invoice Number</span>
                <span className="text-sm font-mono font-semibold">{invoice.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Event</span>
                <span className="text-sm font-medium text-right max-w-[250px]">{invoice.eventTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Event Date</span>
                <span className="text-sm">
                  {new Date(invoice.eventDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm">Total Amount</span>
                <span className="text-sm font-mono">${invoice.totalAmount.toLocaleString()}</span>
              </div>
              {invoice.amountPaid > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-green-600">Already Paid</span>
                  <span className="text-sm font-mono text-green-600">-${invoice.amountPaid.toLocaleString()}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Amount to Pay</span>
                <span className="font-mono font-semibold text-sangria">${invoice.remainingBalance.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> You will be redirected to our secure payment gateway to complete the transaction.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Invoice
            </Button>
            <Button
              className="bg-sangria hover:bg-wine text-white gap-2"
              onClick={handleProcessPayment}
            >
              <CreditCard className="h-4 w-4" />
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
