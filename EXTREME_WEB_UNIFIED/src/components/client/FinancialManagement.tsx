import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Progress } from "../ui/progress";
import { DollarSign, FileText, CreditCard, Download, Eye, Calendar, TrendingUp, AlertCircle, CheckCircle2, Clock, Filter } from "lucide-react";
import { mockEvents, mockInvoices, mockClients, Invoice } from "../../data/mockData";
import { DataTable } from "../ui/data-table";
import { toast } from "sonner";

interface FinancialManagementProps {
  clientId: string;
}

export function FinancialManagement({ clientId }: FinancialManagementProps) {
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
    tipAmount: "",
    saveCard: false
  });

  // Get client data
  const client = mockClients.find(c => c.id === clientId);
  const clientEvents = mockEvents.filter(event => event.clientId === clientId);
  const clientInvoices = mockInvoices.filter(invoice => invoice.clientId === clientId);

  // Filter invoices
  const filteredInvoices = clientInvoices.filter(invoice => {
    return statusFilter === "all" || invoice.status === statusFilter;
  });

  // Calculate financial stats
  const totalPaid = clientInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const totalPending = clientInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);
  const totalOverdue = clientInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);
  const totalSpent = totalPaid + totalPending + totalOverdue;
  const averageEventCost = clientEvents.length > 0 ? totalSpent / clientEvents.length : 0;

  // Corporate balance (for corporate clients)
  const corporateBalance = client?.type === 'corporate' ? 2500 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success/10 text-success border-success/20';
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'overdue': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'draft': return 'bg-muted/50 text-muted-foreground border-border';
      default: return 'bg-muted/50 text-muted-foreground border-border';
    }
  };

  const getUrgencyIcon = (status: string, dueDate: string) => {
    if (status === 'overdue') return <AlertCircle className="h-4 w-4 text-destructive" />;
    if (status === 'paid') return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (status === 'pending') return <Clock className="h-4 w-4 text-warning" />;
    return <FileText className="h-4 w-4 text-muted-foreground" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handlePayment = () => {
    if (!selectedInvoice) return;
    
    // Validate payment data
    if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.nameOnCard) {
      toast.error("Please fill in all payment details");
      return;
    }

    // Process payment (mock)
    toast.success(`Payment of ${formatCurrency(selectedInvoice.amount)} processed successfully!`);
    setShowPaymentDialog(false);
    setSelectedInvoice(null);
    
    // Reset form
    setPaymentData({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      nameOnCard: "",
      tipAmount: "",
      saveCard: false
    });
  };

  // Define columns for invoices table
  const invoiceColumns = [
    {
      key: "invoiceNumber",
      title: "Invoice",
      render: (_value: any, row: any) => (
        <div className="flex items-center gap-2">
          {getUrgencyIcon(row.status, row.dueDate)}
          <div>
            <p className="font-medium">#{row.invoiceNumber}</p>
            <p className="text-sm text-muted-foreground">{row.eventTitle}</p>
          </div>
        </div>
      )
    },
    {
      key: "issueDate",
      title: "Issue Date",
      render: (_value: any, row: any) => (
        <div className="text-sm">
          <p>{row.issueDate}</p>
          <p className="text-muted-foreground">Due: {row.dueDate}</p>
        </div>
      )
    },
    {
      key: "amount",
      title: "Amount",
      render: (_value: any, row: any) => (
        <div className="text-right">
          <p className="font-medium">{formatCurrency(row.amount)}</p>
          {row.tipAmount > 0 && (
            <p className="text-sm text-muted-foreground">+{formatCurrency(row.tipAmount)} tip</p>
          )}
        </div>
      )
    },
    {
      key: "status",
      title: "Status",
      render: (_value: any, row: any) => (
        <Badge className={getStatusColor(row.status)}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      )
    },
    {
      key: "actions",
      title: "Actions",
      render: (_value: any, row: any) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedInvoice(row);
              setShowInvoiceDialog(true);
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          {row.status === 'pending' && (
            <Button
              size="sm"
              onClick={() => {
                setSelectedInvoice(row);
                setShowPaymentDialog(true);
              }}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Pay
            </Button>
          )}
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Financial Management</h3>
          <p className="text-muted-foreground">Track expenses, view invoices, and manage payments</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{filteredInvoices.length} invoices</Badge>
          {totalPending > 0 && (
            <Badge variant="destructive">{formatCurrency(totalPending)} pending</Badge>
          )}
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary-hover text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Spent</CardTitle>
            <DollarSign className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalSpent)}</div>
            <p className="text-xs opacity-80 mt-1">Across {clientEvents.length} events</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-success to-success/90 text-success-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Paid</CardTitle>
            <CheckCircle2 className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalPaid)}</div>
            <p className="text-xs opacity-80 mt-1">Completed payments</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-warning to-warning/90 text-warning-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Pending</CardTitle>
            <Clock className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalPending)}</div>
            <p className="text-xs opacity-80 mt-1">Outstanding payments</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Event Cost</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{formatCurrency(averageEventCost)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per event average</p>
          </CardContent>
        </Card>
      </div>

      {/* Corporate Balance (if applicable) */}
      {client?.type === 'corporate' && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Corporate Account Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-2xl font-bold text-primary">{formatCurrency(corporateBalance)}</p>
                <p className="text-sm text-muted-foreground">Available credit</p>
              </div>
              <Button>
                Add Funds
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Credit Used</span>
                <span>{Math.round((totalSpent / (totalSpent + corporateBalance)) * 100)}%</span>
              </div>
              <Progress value={(totalSpent / (totalSpent + corporateBalance)) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button variant="outline" className="justify-start h-auto p-4">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="font-medium">Pay Outstanding</p>
              <p className="text-sm text-muted-foreground">{formatCurrency(totalPending)}</p>
            </div>
          </div>
        </Button>
        
        <Button variant="outline" className="justify-start h-auto p-4">
          <div className="flex items-center gap-3">
            <Download className="h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="font-medium">Download All</p>
              <p className="text-sm text-muted-foreground">Export invoices</p>
            </div>
          </div>
        </Button>
        
        <Button variant="outline" className="justify-start h-auto p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="font-medium">Spending Report</p>
              <p className="text-sm text-muted-foreground">Annual summary</p>
            </div>
          </div>
        </Button>
        
        <Button variant="outline" className="justify-start h-auto p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="font-medium">Payment Schedule</p>
              <p className="text-sm text-muted-foreground">Upcoming dues</p>
            </div>
          </div>
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <Label className="text-sm font-medium">Filter by status:</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Invoices</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <DataTable
        columns={invoiceColumns}
        data={filteredInvoices}
        searchKey="invoiceNumber"
        className="border-0 shadow-lg"
      />

      {/* Invoice Detail Dialog */}
      {showInvoiceDialog && selectedInvoice && (
        <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice #{selectedInvoice.invoiceNumber}
              </DialogTitle>
              <DialogDescription>
                Review the details of this invoice including service breakdown, costs, and payment information.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Invoice Details</h4>
                  <div className="space-y-2 text-sm">
                    <p>Invoice #: <span className="font-medium">{selectedInvoice.invoiceNumber}</span></p>
                    <p>Event: <span className="font-medium">{selectedInvoice.eventTitle}</span></p>
                    <p>Issue Date: <span className="font-medium">{selectedInvoice.issueDate}</span></p>
                    <p>Due Date: <span className="font-medium">{selectedInvoice.dueDate}</span></p>
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge className={getStatusColor(selectedInvoice.status)}>
                    {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                  </Badge>
                  <div className="mt-4">
                    <p className="text-3xl font-bold">{formatCurrency(selectedInvoice.amount)}</p>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Line Items */}
              <div>
                <h4 className="font-semibold mb-4">Service Details</h4>
                <div className="space-y-3">
                  {selectedInvoice.lineItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × {formatCurrency(item.rate)} × {item.hours} hours
                        </p>
                      </div>
                      <p className="font-medium">{formatCurrency(item.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee (8%):</span>
                  <span>{formatCurrency(selectedInvoice.serviceFee)}</span>
                </div>
                {selectedInvoice.tipAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Tips:</span>
                    <span>{formatCurrency(selectedInvoice.tipAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedInvoice.amount)}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => toast.success("Invoice downloaded successfully")}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                {selectedInvoice.status === 'pending' && (
                  <Button
                    onClick={() => {
                      setShowInvoiceDialog(false);
                      setShowPaymentDialog(true);
                    }}
                    className="flex-1"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Now
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Payment Dialog */}
      {showPaymentDialog && selectedInvoice && (
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Make Payment
              </DialogTitle>
              <DialogDescription>
                Securely pay your invoice using your credit card. You can also add tips for the staff who worked your event.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex justify-between items-center mb-2">
                  <span>Invoice #{selectedInvoice.invoiceNumber}</span>
                  <span className="font-bold">{formatCurrency(selectedInvoice.amount)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedInvoice.eventTitle}</p>
              </div>
              
              {/* Payment Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nameOnCard">Name on Card</Label>
                  <Input
                    id="nameOnCard"
                    value={paymentData.nameOnCard}
                    onChange={(e) => setPaymentData({...paymentData, nameOnCard: e.target.value})}
                    placeholder="Full name as on card"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      value={paymentData.expiryDate}
                      onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={paymentData.cvv}
                      onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
                
                {/* Optional Tip */}
                <div>
                  <Label htmlFor="tipAmount">Add Tip for Staff (Optional)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="tipAmount"
                      type="number"
                      value={paymentData.tipAmount}
                      onChange={(e) => setPaymentData({...paymentData, tipAmount: e.target.value})}
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {/* Quick tip buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentData({...paymentData, tipAmount: (selectedInvoice.amount * 0.15).toFixed(2)})}
                  >
                    15%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentData({...paymentData, tipAmount: (selectedInvoice.amount * 0.18).toFixed(2)})}
                  >
                    18%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentData({...paymentData, tipAmount: (selectedInvoice.amount * 0.20).toFixed(2)})}
                  >
                    20%
                  </Button>
                </div>
              </div>
              
              {/* Total with tip */}
              {paymentData.tipAmount && (
                <div className="p-4 border rounded-lg bg-primary/5">
                  <div className="flex justify-between items-center">
                    <span>Total Payment:</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(selectedInvoice.amount + parseFloat(paymentData.tipAmount || "0"))}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Invoice: {formatCurrency(selectedInvoice.amount)} + Tip: {formatCurrency(parseFloat(paymentData.tipAmount || "0"))}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={handlePayment} className="flex-1">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay {formatCurrency(selectedInvoice.amount + parseFloat(paymentData.tipAmount || "0"))}
                </Button>
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
