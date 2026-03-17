import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Separator } from "../components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { 
  Receipt,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  TrendingUp,
  FileText,
  DollarSign,
  Building2
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner@2.0.3";

interface InvoicingProps {
  userRole: string;
  userId: string;
}

// Mock invoice data - comprehensive and realistic
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
    clientEmail: "billing@premiumevents.com"
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
    clientEmail: "billing@premiumevents.com"
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
    clientEmail: "billing@premiumevents.com"
  },
  {
    id: "INV-2024-004",
    eventTitle: "Wedding Reception - Smith",
    eventDate: "2024-10-15",
    location: "Riverside Manor, Philadelphia",
    staffCount: 15,
    totalAmount: 9450,
    amountPaid: 0,
    remainingBalance: 9450,
    status: "overdue" as const,
    dueDate: "2024-10-08",
    invoiceDate: "2024-09-15",
    clientName: "Premium Events LLC",
    clientEmail: "billing@premiumevents.com"
  },
  {
    id: "INV-2024-005",
    eventTitle: "Product Launch Event",
    eventDate: "2025-02-10",
    location: "Innovation Hub, San Francisco",
    staffCount: 30,
    totalAmount: 18900,
    amountPaid: 9450,
    remainingBalance: 9450,
    status: "partial" as const,
    dueDate: "2025-02-03",
    invoiceDate: "2024-01-10",
    clientName: "Premium Events LLC",
    clientEmail: "billing@premiumevents.com"
  },
  {
    id: "INV-2024-006",
    eventTitle: "Holiday Party Corporate",
    eventDate: "2024-12-20",
    location: "Plaza Hotel, Manhattan",
    staffCount: 22,
    totalAmount: 13860,
    amountPaid: 13860,
    remainingBalance: 0,
    status: "paid" as const,
    dueDate: "2024-12-13",
    invoiceDate: "2024-11-20",
    clientName: "Premium Events LLC",
    clientEmail: "billing@premiumevents.com"
  },
  {
    id: "INV-2024-007",
    eventTitle: "Summer Music Festival",
    eventDate: "2025-06-15",
    location: "Central Park, New York",
    staffCount: 50,
    totalAmount: 31500,
    amountPaid: 0,
    remainingBalance: 31500,
    status: "pending" as const,
    dueDate: "2025-06-08",
    invoiceDate: "2025-05-15",
    clientName: "Premium Events LLC",
    clientEmail: "billing@premiumevents.com"
  },
  {
    id: "INV-2024-008",
    eventTitle: "Business Conference 2024",
    eventDate: "2024-09-05",
    location: "Hilton Downtown, Miami",
    staffCount: 12,
    totalAmount: 7560,
    amountPaid: 0,
    remainingBalance: 7560,
    status: "overdue" as const,
    dueDate: "2024-08-29",
    invoiceDate: "2024-08-05",
    clientName: "Premium Events LLC",
    clientEmail: "billing@premiumevents.com"
  }
];

export function Invoicing({ userRole, userId }: InvoicingProps) {
  const { setCurrentPage } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<typeof mockInvoices[0] | null>(null);
  const itemsPerPage = 10;

  // Apply filters
  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = 
      invoice.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPageNum - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  // Calculate summary statistics
  const totalBilled = mockInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaid = mockInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalOverdue = mockInvoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.remainingBalance, 0);
  const totalPending = mockInvoices
    .filter(inv => inv.status === 'pending' || inv.status === 'partial')
    .reduce((sum, inv) => sum + inv.remainingBalance, 0);

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
      case 'paid': return <CheckCircle className="h-3 w-3" />;
      case 'partial': return <TrendingUp className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'overdue': return <AlertTriangle className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const handleViewInvoice = (invoiceId: string) => {
    setCurrentPage('invoice-detail', { invoiceId });
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success(`Downloading invoice ${invoiceId}...`);
  };

  const handlePayInvoice = (invoiceId: string) => {
    const invoice = mockInvoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setSelectedInvoice(invoice);
      setPaymentModalOpen(true);
    }
  };

  const handleProcessPayment = () => {
    if (selectedInvoice) {
      toast.success(`Processing payment for ${selectedInvoice.id}...`);
      setPaymentModalOpen(false);
      setTimeout(() => {
        toast.success("Payment processed successfully!");
      }, 1500);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="desktop-first-header mb-6">
        <div>
          <h1 className="flex items-center gap-2">
            <Receipt className="h-7 w-7 text-sangria" />
            Invoices & Billing
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your event invoices and make payments
          </p>
        </div>
      </div>

      {/* Summary Cards - Subtle Professional Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        {/* Total Billed */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Billed</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-mono">${totalBilled.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {mockInvoices.length} invoices
            </p>
          </CardContent>
        </Card>

        {/* Total Paid - Subtle Green */}
        <Card className="border-0 shadow-lg bg-green-50 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Total Paid</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-green-900">${totalPaid.toLocaleString()}</div>
            <p className="text-xs text-green-700 mt-1">
              {mockInvoices.filter(i => i.status === 'paid').length} completed
            </p>
          </CardContent>
        </Card>

        {/* Pending - Subtle Yellow/Amber */}
        <Card className="border-0 shadow-lg bg-amber-50 border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Pending</CardTitle>
            <Clock className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-amber-900">${totalPending.toLocaleString()}</div>
            <p className="text-xs text-amber-700 mt-1">
              {mockInvoices.filter(i => i.status === 'pending' || i.status === 'partial').length} invoices
            </p>
          </CardContent>
        </Card>

        {/* Overdue - Subtle Red */}
        <Card className="border-0 shadow-lg bg-red-50 border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900">Overdue</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="font-mono text-red-900">${totalOverdue.toLocaleString()}</div>
            <p className="text-xs text-red-700 mt-1">
              {mockInvoices.filter(i => i.status === 'overdue').length} need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by event name, invoice number, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partially Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-sangria" />
              Event Invoices
            </CardTitle>
            <span className="text-sm font-normal text-muted-foreground">
              {filteredInvoices.length} results
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mb-2">No Invoices Found</h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your search or filters."
                  : "Your event invoices will appear here."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Invoice / Event</TableHead>
                      <TableHead>Event Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-center">Staff</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div>
                            <p className="font-mono text-sm font-semibold text-sangria">{invoice.id}</p>
                            <p className="font-medium text-sm mt-0.5">{invoice.eventTitle}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {new Date(invoice.eventDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            {invoice.location.split(',')[0]}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded text-sm">
                            <Users className="h-3.5 w-3.5 text-slate-600" />
                            <span className="font-medium">{invoice.staffCount}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono font-semibold">${invoice.totalAmount.toLocaleString()}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono text-green-600 font-medium">${invoice.amountPaid.toLocaleString()}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-mono text-sangria font-semibold">${invoice.remainingBalance.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(invoice.status)} border flex items-center gap-1.5 w-fit`}>
                            {getStatusIcon(invoice.status)}
                            <span className="text-xs">
                              {invoice.status === 'partial' ? 'Partial' 
                                : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewInvoice(invoice.id)}
                              className="h-8"
                            >
                              <Eye className="h-4 w-4 mr-1.5" />
                              View
                            </Button>
                            {invoice.remainingBalance > 0 && (
                              <Button
                                size="sm"
                                className="bg-sangria hover:bg-wine text-white h-8"
                                onClick={() => handlePayInvoice(invoice.id)}
                              >
                                <CreditCard className="h-4 w-4 mr-1.5" />
                                Pay
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y">
                {paginatedInvoices.map((invoice) => (
                  <div key={invoice.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono text-sm font-semibold text-sangria">{invoice.id}</p>
                        <p className="font-medium mt-0.5">{invoice.eventTitle}</p>
                      </div>
                      <Badge className={`${getStatusColor(invoice.status)} border flex items-center gap-1`}>
                        {getStatusIcon(invoice.status)}
                        <span className="text-xs">
                          {invoice.status === 'partial' ? 'Partial' : invoice.status}
                        </span>
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(invoice.eventDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {invoice.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {invoice.staffCount} staff members
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Amount</p>
                        <p className="font-mono font-semibold text-sm">${invoice.totalAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Paid</p>
                        <p className="font-mono text-green-600 font-semibold text-sm">${invoice.amountPaid.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Balance</p>
                        <p className="font-mono text-sangria font-semibold text-sm">${invoice.remainingBalance.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleViewInvoice(invoice.id)}
                      >
                        <Eye className="h-4 w-4 mr-1.5" />
                        View
                      </Button>
                      {invoice.remainingBalance > 0 && (
                        <Button
                          size="sm"
                          className="flex-1 bg-sangria hover:bg-wine text-white"
                          onClick={() => handlePayInvoice(invoice.id)}
                        >
                          <CreditCard className="h-4 w-4 mr-1.5" />
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} results
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageNum(Math.max(1, currentPageNum - 1))}
                      disabled={currentPageNum === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPageNum === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPageNum(page)}
                            className={currentPageNum === page ? "bg-sangria hover:bg-wine text-white" : ""}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageNum(Math.min(totalPages, currentPageNum + 1))}
                      disabled={currentPageNum === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-sangria" />
              Payment Summary
            </DialogTitle>
            <DialogDescription>
              Review invoice details and proceed with payment
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-4 py-4">
              {/* Invoice Summary Card */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Invoice Number</span>
                  <span className="text-sm font-mono font-semibold text-sangria">{selectedInvoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Event</span>
                  <span className="text-sm font-medium text-right max-w-[250px]">{selectedInvoice.eventTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Event Date</span>
                  <span className="text-sm">
                    {new Date(selectedInvoice.eventDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm">Total Amount</span>
                  <span className="text-sm font-mono">${selectedInvoice.totalAmount.toLocaleString()}</span>
                </div>
                {selectedInvoice.amountPaid > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-green-600">Already Paid</span>
                    <span className="text-sm font-mono text-green-600">-${selectedInvoice.amountPaid.toLocaleString()}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">Amount to Pay</span>
                  <span className="font-mono font-semibold text-sangria">${selectedInvoice.remainingBalance.toLocaleString()}</span>
                </div>
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> You will be redirected to our secure payment gateway to complete the transaction.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => handleDownloadInvoice(selectedInvoice?.id || '')}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
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