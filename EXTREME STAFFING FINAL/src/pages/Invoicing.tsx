import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { TooltipWrapper, IconTooltip, InfoTooltip } from "../components/ui/tooltip-wrapper";
import { 
  FileText,
  Download,
  Send,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Plus,
  Eye,
  Mail,
  Printer,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CreditCard,
  AlertCircle as AlertIcon
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner@2.0.3";

interface InvoicingProps {
  userRole: string;
  userId: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  balance: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'partial' | 'cancelled';
  paymentTerms: string;
  notes?: string;
  items: InvoiceItem[];
}

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export function Invoicing({ userRole }: InvoicingProps) {
  const { setCurrentPage } = useNavigation();
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPageNum] = useState(1);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const itemsPerPage = 10;

  // Mock invoice data
  const allInvoices: Invoice[] = [
    {
      id: "INV-001",
      invoiceNumber: "INV-2024-001",
      clientId: "CL-001",
      clientName: "Innovate Corp",
      eventId: "EVT-1234",
      eventName: "Corporate Gala 2024",
      eventDate: "2024-10-10",
      issueDate: "2024-10-11",
      dueDate: "2024-11-10",
      subtotal: 8500.00,
      tax: 680.00,
      total: 9180.00,
      amountPaid: 9180.00,
      balance: 0,
      status: "paid",
      paymentTerms: "Net 30",
      items: [
        { description: "Event Staff (24 staff x 5 hours)", quantity: 120, rate: 35, amount: 4200 },
        { description: "Event Manager (1 x 8 hours)", quantity: 8, rate: 75, amount: 600 },
        { description: "Bartenders (4 x 6 hours)", quantity: 24, rate: 45, amount: 1080 },
        { description: "Setup/Cleanup Crew (6 x 4 hours)", quantity: 24, rate: 30, amount: 720 },
        { description: "Overtime Premium (various staff)", quantity: 1, rate: 1900, amount: 1900 }
      ]
    },
    {
      id: "INV-002",
      invoiceNumber: "INV-2024-002",
      clientId: "CL-002",
      clientName: "Elite Events LLC",
      eventId: "EVT-1235",
      eventName: "Wedding Reception",
      eventDate: "2024-10-12",
      issueDate: "2024-10-13",
      dueDate: "2024-11-12",
      subtotal: 4200.00,
      tax: 336.00,
      total: 4536.00,
      amountPaid: 2268.00,
      balance: 2268.00,
      status: "partial",
      paymentTerms: "Net 30",
      notes: "50% deposit received. Balance due before event.",
      items: [
        { description: "Servers (12 staff x 5 hours)", quantity: 60, rate: 35, amount: 2100 },
        { description: "Bartenders (2 x 6 hours)", quantity: 12, rate: 45, amount: 540 },
        { description: "Event Coordinator (1 x 8 hours)", quantity: 8, rate: 75, amount: 600 },
        { description: "Setup Crew (4 x 3 hours)", quantity: 12, rate: 30, amount: 360 },
        { description: "Cleanup Service", quantity: 1, rate: 600, amount: 600 }
      ]
    },
    {
      id: "INV-003",
      invoiceNumber: "INV-2024-003",
      clientId: "CL-003",
      clientName: "TechStart Inc",
      eventId: "EVT-1236",
      eventName: "Product Launch Party",
      eventDate: "2024-10-15",
      issueDate: "2024-10-16",
      dueDate: "2024-11-15",
      subtotal: 6750.00,
      tax: 540.00,
      total: 7290.00,
      amountPaid: 0,
      balance: 7290.00,
      status: "sent",
      paymentTerms: "Net 30",
      items: [
        { description: "Event Staff (18 staff x 5 hours)", quantity: 90, rate: 35, amount: 3150 },
        { description: "Registration Staff (3 x 6 hours)", quantity: 18, rate: 40, amount: 720 },
        { description: "AV Technicians (2 x 8 hours)", quantity: 16, rate: 55, amount: 880 },
        { description: "Event Manager (1 x 10 hours)", quantity: 10, rate: 75, amount: 750 },
        { description: "Security (4 x 6 hours)", quantity: 24, rate: 45, amount: 1080 },
        { description: "Emergency Staff Replacement Fee", quantity: 1, rate: 170, amount: 170 }
      ]
    },
    {
      id: "INV-004",
      invoiceNumber: "INV-2024-004",
      clientId: "CL-001",
      clientName: "Innovate Corp",
      eventId: "EVT-1237",
      eventName: "Annual Conference",
      eventDate: "2024-10-18",
      issueDate: "2024-10-19",
      dueDate: "2024-10-03",
      subtotal: 12500.00,
      tax: 1000.00,
      total: 13500.00,
      amountPaid: 0,
      balance: 13500.00,
      status: "overdue",
      paymentTerms: "Net 15",
      notes: "URGENT: Payment overdue by 16 days. Please remit immediately.",
      items: [
        { description: "Conference Staff (30 staff x 8 hours)", quantity: 240, rate: 35, amount: 8400 },
        { description: "Registration Desk (5 x 10 hours)", quantity: 50, rate: 40, amount: 2000 },
        { description: "AV Support (3 x 10 hours)", quantity: 30, rate: 55, amount: 1650 },
        { description: "Event Coordination Team (2 x 10 hours)", quantity: 20, rate: 75, amount: 1500 }
      ]
    },
    {
      id: "INV-005",
      invoiceNumber: "INV-2024-005",
      clientId: "CL-004",
      clientName: "Luxury Hotels Group",
      eventId: "EVT-1238",
      eventName: "Charity Fundraiser",
      eventDate: "2024-10-20",
      issueDate: "2024-10-14",
      dueDate: "2024-10-20",
      subtotal: 5600.00,
      tax: 448.00,
      total: 6048.00,
      amountPaid: 0,
      balance: 6048.00,
      status: "draft",
      paymentTerms: "Due on Event Date",
      items: [
        { description: "Servers (16 staff x 5 hours)", quantity: 80, rate: 35, amount: 2800 },
        { description: "Bartenders (3 x 6 hours)", quantity: 18, rate: 45, amount: 810 },
        { description: "Coat Check (2 x 5 hours)", quantity: 10, rate: 30, amount: 300 },
        { description: "Valet Coordinators (4 x 5 hours)", quantity: 20, rate: 35, amount: 700 },
        { description: "Event Manager (1 x 7 hours)", quantity: 7, rate: 75, amount: 525 },
        { description: "Weekend Premium Charge", quantity: 1, rate: 465, amount: 465 }
      ]
    }
  ];

  // Summary stats
  const stats = {
    totalInvoices: allInvoices.length,
    totalRevenue: allInvoices.reduce((sum, inv) => sum + inv.total, 0),
    paid: allInvoices.filter(inv => inv.status === 'paid').length,
    outstanding: allInvoices.reduce((sum, inv) => sum + inv.balance, 0),
    overdue: allInvoices.filter(inv => inv.status === 'overdue').length,
    overdueAmount: allInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.balance, 0)
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case "sent":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Mail className="h-3 w-3 mr-1" />Sent</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><AlertTriangle className="h-3 w-3 mr-1" />Overdue</Badge>;
      case "partial":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100"><Clock className="h-3 w-3 mr-1" />Partial</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100"><FileText className="h-3 w-3 mr-1" />Draft</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Filter invoices
  const filteredInvoices = allInvoices.filter(invoice => {
    const matchesSearch = invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.eventName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    const matchesTab = selectedTab === "all" || 
                      (selectedTab === "unpaid" && invoice.balance > 0) ||
                      (selectedTab === "paid" && invoice.status === 'paid') ||
                      (selectedTab === "overdue" && invoice.status === 'overdue');
    return matchesSearch && matchesStatus && matchesTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  const handleGenerateInvoice = () => {
    toast.success("Invoice generated successfully!");
    setShowInvoiceDialog(false);
  };

  const handleSendInvoice = (invoice: Invoice) => {
    toast.success(`Invoice ${invoice.invoiceNumber} sent to ${invoice.clientName}`);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    toast.success(`Downloading invoice ${invoice.invoiceNumber}`);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDialog(true);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Invoice Management</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Automated billing and invoice generation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-sangria hover:bg-merlot">
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Generate New Invoice</DialogTitle>
                <DialogDescription>Create invoice from completed event</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Event</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose event" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="evt1">Corporate Gala - Oct 10</SelectItem>
                        <SelectItem value="evt2">Wedding Reception - Oct 12</SelectItem>
                        <SelectItem value="evt3">Product Launch - Oct 15</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Terms</Label>
                    <Select defaultValue="net30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="due-on-receipt">Due on Receipt</SelectItem>
                        <SelectItem value="net15">Net 15</SelectItem>
                        <SelectItem value="net30">Net 30</SelectItem>
                        <SelectItem value="net60">Net 60</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea placeholder="Add any special notes or payment instructions..." />
                </div>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-900">
                    ℹ️ Invoice will be automatically calculated based on actual timesheet hours, staff rates, and 5-hour minimum pay rules.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button className="bg-sangria hover:bg-merlot" onClick={handleGenerateInvoice}>
                  Generate Invoice
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Invoices</p>
              <p className="text-xl font-semibold">{stats.totalInvoices}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-semibold">${stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-xl font-semibold">${stats.outstanding.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue ({stats.overdue})</p>
              <p className="text-xl font-semibold">${stats.overdueAmount.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All Invoices</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue
            {stats.overdue > 0 && (
              <Badge className="ml-2 bg-red-500 text-white h-5 w-5 p-0 flex items-center justify-center">
                {stats.overdue}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Invoices</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search invoices..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full sm:w-[250px]"
                    />
                  </div>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Invoice #</TableHead>
                      <TableHead className="font-semibold">Client</TableHead>
                      <TableHead className="font-semibold">Event</TableHead>
                      <TableHead className="font-semibold">Issue Date</TableHead>
                      <TableHead className="font-semibold">Due Date</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Balance</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedInvoices.length > 0 ? (
                      paginatedInvoices.map((invoice) => (
                        <TableRow key={invoice.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{invoice.clientName}</p>
                              <p className="text-xs text-muted-foreground">{invoice.clientId}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{invoice.eventName}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(invoice.eventDate).toLocaleDateString()}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(invoice.issueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${invoice.total.toLocaleString()}
                          </TableCell>
                          <TableCell className={invoice.balance > 0 ? "font-semibold text-orange-600" : "text-muted-foreground"}>
                            ${invoice.balance.toLocaleString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewInvoice(invoice)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadInvoice(invoice)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSendInvoice(invoice)}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12">
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No invoices found</p>
                          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} invoices
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageNum(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPageNum(page)}
                          className={currentPage === page ? "bg-sangria hover:bg-merlot" : ""}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageNum(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice Detail Dialog */}
      {selectedInvoice && (
        <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Invoice Header */}
              <div className="flex items-start justify-between pb-4 border-b">
                <div>
                  <h3 className="text-2xl font-semibold">{selectedInvoice.invoiceNumber}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Issued: {new Date(selectedInvoice.issueDate).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(selectedInvoice.status)}
              </div>

              {/* Client & Event Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Bill To:</h4>
                  <p className="font-medium">{selectedInvoice.clientName}</p>
                  <p className="text-sm text-muted-foreground">{selectedInvoice.clientId}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Event Details:</h4>
                  <p className="font-medium">{selectedInvoice.eventName}</p>
                  <p className="text-sm text-muted-foreground">
                    Date: {new Date(selectedInvoice.eventDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h4 className="font-semibold mb-3">Invoice Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.rate.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">${item.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">${selectedInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (8%):</span>
                    <span className="font-medium">${selectedInvoice.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Total:</span>
                    <span className="font-semibold text-lg">${selectedInvoice.total.toLocaleString()}</span>
                  </div>
                  {selectedInvoice.amountPaid > 0 && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span>Amount Paid:</span>
                        <span>-${selectedInvoice.amountPaid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-semibold">Balance Due:</span>
                        <span className="font-semibold text-lg text-orange-600">
                          ${selectedInvoice.balance.toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Notes:</h4>
                  <p className="text-sm text-muted-foreground">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>
                Close
              </Button>
              <Button variant="outline" onClick={() => handleDownloadInvoice(selectedInvoice)}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              {selectedInvoice.status !== 'paid' && (
                <Button className="bg-sangria hover:bg-merlot" onClick={() => handleSendInvoice(selectedInvoice)}>
                  <Send className="h-4 w-4 mr-2" />
                  Send to Client
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}