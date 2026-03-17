import { useState, useEffect } from "react";
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
import {
  FileText, Download, Send, DollarSign, Calendar, CheckCircle, Clock, AlertTriangle,
  XCircle, Plus, Eye, Mail, Printer, Search, Filter, ChevronLeft, ChevronRight, TrendingUp, CreditCard
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner";
import { invoiceService } from "../services/invoice.service";

interface InvoicingProps {
  userRole: string;
  userId: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
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

export function Invoicing({ userRole }: InvoicingProps) {
  const { setCurrentPage } = useNavigation();
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPageNum] = useState(1);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const raw = await invoiceService.getInvoices();
        const mapped: Invoice[] = raw.map((inv: any) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber || `INV-${inv.id.slice(0, 6).toUpperCase()}`,
          clientId: inv.clientId || '',
          clientName: inv.client?.user?.name || inv.client?.company || 'Client',
          eventId: inv.eventId || '',
          eventName: inv.event?.title || 'Event',
          eventDate: inv.event?.date || '',
          issueDate: inv.issueDate || inv.createdAt?.split('T')[0] || '',
          dueDate: inv.dueDate || '',
          subtotal: inv.subtotal || 0,
          tax: inv.tax || 0,
          total: inv.total || inv.amount || 0,
          amountPaid: inv.amountPaid || (inv.status === 'PAID' ? (inv.total || 0) : 0),
          balance: inv.balance || (inv.status === 'PAID' ? 0 : (inv.total || 0)),
          status: (inv.status || 'draft').toLowerCase() as Invoice['status'],
          paymentTerms: inv.paymentTerms || 'Net 30',
          notes: inv.notes,
          items: (inv.lineItems || inv.items || []).map((li: any) => ({
            description: li.description || li.name || '',
            quantity: li.quantity || 1,
            rate: li.unitPrice || li.rate || 0,
            amount: li.amount || (li.quantity || 1) * (li.unitPrice || li.rate || 0),
          })),
        }));
        setAllInvoices(mapped);
      } catch {
        toast.error('Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const stats = {
    totalInvoices: allInvoices.length,
    totalRevenue: allInvoices.reduce((s, i) => s + i.total, 0),
    paid: allInvoices.filter(i => i.status === 'paid').length,
    outstanding: allInvoices.reduce((s, i) => s + i.balance, 0),
    overdue: allInvoices.filter(i => i.status === 'overdue').length,
    overdueAmount: allInvoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.balance, 0),
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case "sent": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Mail className="h-3 w-3 mr-1" />Sent</Badge>;
      case "overdue": return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><AlertTriangle className="h-3 w-3 mr-1" />Overdue</Badge>;
      case "partial": return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100"><Clock className="h-3 w-3 mr-1" />Partial</Badge>;
      case "draft": return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100"><FileText className="h-3 w-3 mr-1" />Draft</Badge>;
      case "cancelled": return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredInvoices = allInvoices.filter(inv => {
    const matchesSearch = inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.eventName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    const matchesTab = selectedTab === "all" ||
      (selectedTab === "unpaid" && inv.balance > 0) ||
      (selectedTab === "paid" && inv.status === 'paid') ||
      (selectedTab === "overdue" && inv.status === 'overdue');
    return matchesSearch && matchesStatus && matchesTab;
  });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  const handleGenerateInvoice = () => {
    toast.success("Invoice generated successfully!");
    setShowInvoiceDialog(false);
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      await invoiceService.sendInvoice(invoice.id);
      setAllInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, status: 'sent' } : inv));
      toast.success(`Invoice ${invoice.invoiceNumber} sent to ${invoice.clientName}`);
    } catch {
      toast.error('Failed to send invoice');
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    toast.success(`Downloading invoice ${invoice.invoiceNumber}`);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDialog(true);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Invoice Management</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">Automated billing and invoice generation</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export All</Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-sangria hover:bg-merlot"><Plus className="h-4 w-4 mr-2" />New Invoice</Button>
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
                    <Select><SelectTrigger><SelectValue placeholder="Choose event" /></SelectTrigger><SelectContent><SelectItem value="evt1">Select an event</SelectItem></SelectContent></Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Terms</Label>
                    <Select defaultValue="net30">
                      <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <p className="text-sm text-blue-900">ℹ️ Invoice will be automatically calculated based on actual timesheet hours, staff rates, and 5-hour minimum pay rules.</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button className="bg-sangria hover:bg-merlot" onClick={handleGenerateInvoice}>Generate Invoice</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-sm text-muted-foreground">Total Invoices</p><p className="text-xl font-semibold">{stats.totalInvoices}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><DollarSign className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-xl font-semibold">${stats.totalRevenue.toLocaleString()}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><Clock className="w-5 h-5 text-orange-600" /></div>
            <div><p className="text-sm text-muted-foreground">Outstanding</p><p className="text-xl font-semibold">${stats.outstanding.toLocaleString()}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
            <div><p className="text-sm text-muted-foreground">Overdue ({stats.overdue})</p><p className="text-xl font-semibold">${stats.overdueAmount.toLocaleString()}</p></div>
          </div>
        </Card>
      </div>

      {/* Tabs + Table */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All Invoices</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue
            {stats.overdue > 0 && <Badge className="ml-2 bg-red-500 text-white h-5 w-5 p-0 flex items-center justify-center">{stats.overdue}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Invoices</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search invoices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-full sm:w-[250px]" />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
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
                            <div><p className="font-medium">{invoice.clientName}</p><p className="text-xs text-muted-foreground">{invoice.clientId}</p></div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{invoice.eventName}</p>
                              {invoice.eventDate && <p className="text-xs text-muted-foreground">{new Date(invoice.eventDate).toLocaleDateString()}</p>}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : '—'}</TableCell>
                          <TableCell className="text-sm">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}</TableCell>
                          <TableCell className="font-semibold">${invoice.total.toLocaleString()}</TableCell>
                          <TableCell className={invoice.balance > 0 ? "font-semibold text-orange-600" : "text-muted-foreground"}>${invoice.balance.toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice)}><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDownloadInvoice(invoice)}><Download className="h-4 w-4" /></Button>
                              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                                <Button variant="ghost" size="sm" onClick={() => handleSendInvoice(invoice)}><Send className="h-4 w-4" /></Button>
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

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} invoices</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPageNum(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" />Previous</Button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                      <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => setCurrentPageNum(page)} className={currentPage === page ? "bg-sangria hover:bg-merlot" : ""}>{page}</Button>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setCurrentPageNum(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next<ChevronRight className="h-4 w-4" /></Button>
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
            <DialogHeader><DialogTitle>Invoice Details</DialogTitle></DialogHeader>
            <div className="space-y-6 py-4">
              <div className="flex items-start justify-between pb-4 border-b">
                <div>
                  <h3 className="text-2xl font-semibold">{selectedInvoice.invoiceNumber}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Issued: {selectedInvoice.issueDate ? new Date(selectedInvoice.issueDate).toLocaleDateString() : '—'}</p>
                </div>
                {getStatusBadge(selectedInvoice.status)}
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Bill To:</h4>
                  <p className="font-medium">{selectedInvoice.clientName}</p>
                  <p className="text-sm text-muted-foreground">{selectedInvoice.clientId}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Event Details:</h4>
                  <p className="font-medium">{selectedInvoice.eventName}</p>
                  {selectedInvoice.dueDate && <p className="text-sm text-muted-foreground">Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>}
                </div>
              </div>
              {selectedInvoice.items.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Invoice Items</h4>
                  <Table>
                    <TableHeader><TableRow><TableHead>Description</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Rate</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((item, idx) => (
                        <TableRow key={idx}><TableCell>{item.description}</TableCell><TableCell className="text-right">{item.quantity}</TableCell><TableCell className="text-right">${item.rate.toFixed(2)}</TableCell><TableCell className="text-right font-medium">${item.amount.toLocaleString()}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span><span className="font-medium">${selectedInvoice.subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tax:</span><span className="font-medium">${selectedInvoice.tax.toLocaleString()}</span></div>
                  <div className="flex justify-between pt-2 border-t"><span className="font-semibold">Total:</span><span className="font-semibold text-lg">${selectedInvoice.total.toLocaleString()}</span></div>
                  {selectedInvoice.amountPaid > 0 && (
                    <>
                      <div className="flex justify-between text-green-600"><span>Amount Paid:</span><span>-${selectedInvoice.amountPaid.toLocaleString()}</span></div>
                      <div className="flex justify-between pt-2 border-t"><span className="font-semibold">Balance Due:</span><span className="font-semibold text-lg text-orange-600">${selectedInvoice.balance.toLocaleString()}</span></div>
                    </>
                  )}
                </div>
              </div>
              {selectedInvoice.notes && (
                <div className="bg-muted/50 p-4 rounded-lg"><h4 className="font-semibold mb-2">Notes:</h4><p className="text-sm text-muted-foreground">{selectedInvoice.notes}</p></div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>Close</Button>
              <Button variant="outline" onClick={() => handleDownloadInvoice(selectedInvoice)}><Download className="h-4 w-4 mr-2" />Download PDF</Button>
              <Button variant="outline"><Printer className="h-4 w-4 mr-2" />Print</Button>
              {selectedInvoice.status !== 'paid' && (
                <Button className="bg-sangria hover:bg-merlot" onClick={() => handleSendInvoice(selectedInvoice)}><Send className="h-4 w-4 mr-2" />Send to Client</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
