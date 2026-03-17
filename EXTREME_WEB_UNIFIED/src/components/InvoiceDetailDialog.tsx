import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Download,
  Printer,
  Send,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  hours: number;
  total: number;
}

interface Invoice {
  id: string;
  client: string;
  clientEmail?: string;
  clientAddress?: string;
  eventName: string;
  eventDate?: string;
  eventLocation?: string;
  amount: number;
  status: string;
  issueDate: string;
  dueDate: string;
  paidDate: string | null;
  lineItems?: InvoiceItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  notes?: string;
}

interface InvoiceDetailDialogProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceDetailDialog({ invoice, isOpen, onClose }: InvoiceDetailDialogProps) {
  if (!invoice) return null;

  const handleDownloadPDF = () => {
    toast.success("Downloading invoice as PDF...");
  };

  const handlePrint = () => {
    window.print();
    toast.success("Opening print dialog...");
  };

  const handleSendEmail = () => {
    toast.success(`Invoice sent to ${invoice.clientEmail || invoice.client}`);
  };

  const handleMarkAsPaid = () => {
    toast.success("Invoice marked as paid");
    onClose();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'overdue':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Overdue
          </Badge>
        );
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Invoice Details</DialogTitle>
          <DialogDescription>
            Comprehensive invoice information and line items
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-[#5E1916] to-[#4E0707] text-white p-6 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl mb-2">INVOICE</h2>
                <p className="text-lg opacity-90">{invoice.id}</p>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90 mb-1">Status</div>
                {getStatusBadge(invoice.status)}
              </div>
            </div>
          </div>

          {/* Company and Client Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* From */}
            <div>
              <h3 className="font-medium text-sm text-gray-500 mb-2">FROM</h3>
              <div className="space-y-1">
                <p className="font-bold">Extreme Staffing Solutions</p>
                <p className="text-sm text-gray-600">123 Business Ave</p>
                <p className="text-sm text-gray-600">Los Angeles, CA 90001</p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  billing@extremestaffing.com
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  (555) 123-4567
                </p>
              </div>
            </div>

            {/* To */}
            <div>
              <h3 className="font-medium text-sm text-gray-500 mb-2">BILL TO</h3>
              <div className="space-y-1">
                <p className="font-bold">{invoice.client}</p>
                {invoice.clientAddress && (
                  <p className="text-sm text-gray-600">{invoice.clientAddress}</p>
                )}
                {invoice.clientEmail && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {invoice.clientEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 mb-1">Issue Date</p>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                {invoice.issueDate}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Due Date</p>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                {invoice.dueDate}
              </p>
            </div>
            {invoice.paidDate && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Paid Date</p>
                <p className="font-medium text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  {invoice.paidDate}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Amount</p>
              <p className="font-bold text-lg text-[#5E1916]">
                ${invoice.amount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Event Information */}
          {invoice.eventName && (
            <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-sm text-blue-900 mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Event Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-blue-700">Event:</span>
                  <span className="ml-2 text-blue-900 font-medium">{invoice.eventName}</span>
                </div>
                {invoice.eventDate && (
                  <div>
                    <span className="text-blue-700">Date:</span>
                    <span className="ml-2 text-blue-900 font-medium">{invoice.eventDate}</span>
                  </div>
                )}
                {invoice.eventLocation && (
                  <div>
                    <span className="text-blue-700">Location:</span>
                    <span className="ml-2 text-blue-900 font-medium">{invoice.eventLocation}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Line Items */}
          {invoice.lineItems && invoice.lineItems.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Services Provided</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Description</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-700">Qty</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-700">Rate</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-700">Hours</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.map((item, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="p-3 text-sm">{item.description}</td>
                        <td className="p-3 text-sm text-right">{item.quantity}</td>
                        <td className="p-3 text-sm text-right">${item.rate}</td>
                        <td className="p-3 text-sm text-right">{item.hours}h</td>
                        <td className="p-3 text-sm text-right font-medium">
                          ${item.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full md:w-80 space-y-2">
              {invoice.subtotal !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${invoice.subtotal.toLocaleString()}</span>
                </div>
              )}
              {invoice.tax !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax & Fees:</span>
                  <span className="font-medium">${invoice.tax.toLocaleString()}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-xl text-[#5E1916]">
                  ${(invoice.total || invoice.amount).toLocaleString()}
                </span>
              </div>
              {invoice.status === 'paid' && invoice.paidDate && (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Paid on {invoice.paidDate}</span>
                  </div>
                </div>
              )}
              {invoice.status === 'overdue' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Payment is overdue</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="border-t pt-4">
              <h3 className="font-medium text-sm text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" className="flex-1" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleSendEmail}>
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            {invoice.status !== 'paid' && (
              <Button className="flex-1 bg-[#5E1916] hover:bg-[#4E0707]" onClick={handleMarkAsPaid}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Paid
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
