import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { 
  CreditCard, 
  Download, 
  DollarSign, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Receipt,
  Wallet
} from "lucide-react";

interface BillingProps {
  userRole: string;
  userId: string;
}

export function Billing({ userRole }: BillingProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card-1");

  // Mock data for billing
  const billingOverview = {
    currentBalance: 2450,
    pendingCharges: 890,
    totalSpent: 15678,
    savedAmount: 3200
  };

  const invoices = [
    {
      id: "INV-2024-001",
      eventTitle: "Corporate Gala",
      services: ["Event Staff", "Security"],
      amount: 2450,
      dueDate: "2024-02-15",
      status: "pending"
    },
    {
      id: "INV-2024-002", 
      eventTitle: "Wedding Reception",
      services: ["Waitstaff", "Bartenders"],
      amount: 1890,
      dueDate: "2024-01-28",
      status: "paid"
    },
    {
      id: "INV-2024-003",
      eventTitle: "Product Launch",
      services: ["Event Coordinators"],
      amount: 890,
      dueDate: "2024-02-10",
      status: "overdue"
    }
  ];

  const paymentMethods = [
    {
      id: "card-1",
      type: "card",
      brand: "Visa",
      last4: "4242",
      expiryMonth: "12",
      expiryYear: "2026",
      isDefault: true
    },
    {
      id: "card-2", 
      type: "card",
      brand: "Mastercard",
      last4: "8888",
      expiryMonth: "09",
      expiryYear: "2025",
      isDefault: false
    }
  ];

  const transactions = [
    {
      id: "txn-001",
      description: "Payment for Corporate Gala",
      amount: -2450,
      date: "2024-01-20",
      status: "completed",
      type: "payment"
    },
    {
      id: "txn-002",
      description: "Refund for cancelled event",
      amount: 890,
      date: "2024-01-18",
      status: "completed", 
      type: "refund"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "overdue":
        return <Badge className="bg-destructive text-destructive-foreground"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Billing & Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your payments, invoices, and billing information
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export Statements
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input id="card-number" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Cardholder Name</Label>
                    <Input id="name" placeholder="John Doe" />
                  </div>
                  <Button className="w-full">Add Card</Button>
                </div>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      {/* Billing Overview */}
      <div className="adaptive-stats-grid">
          <Card className="p-6 min-w-0 max-w-[280px] mx-auto w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-0 pt-0">
              <div className="text-2xl font-semibold text-foreground mb-1">${billingOverview.currentBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Due in next 30 days
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 min-w-0 max-w-[280px] mx-auto w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Charges</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-0 pt-0">
              <div className="text-2xl font-semibold text-foreground mb-1">${billingOverview.pendingCharges.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting processing
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 min-w-0 max-w-[280px] mx-auto w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-0 pt-0">
              <div className="text-2xl font-semibold text-foreground mb-1">${billingOverview.totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                This year
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 min-w-0 max-w-[280px] mx-auto w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Savings</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-0 pt-0">
              <div className="text-2xl font-semibold text-foreground mb-1">${billingOverview.savedAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Compared to market rates
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Billing Details */}
        <Tabs defaultValue="invoices" className="space-y-4">
          <TabsList>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payment Methods</TabsTrigger>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-4">
            <Card className="desktop-card-padding">
              <CardHeader className="px-0">
                <CardTitle>Recent Invoices</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="responsive-table">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Invoice ID</TableHead>
                        <TableHead className="min-w-[200px]">Event</TableHead>
                        <TableHead className="min-w-[100px]">Amount</TableHead>
                        <TableHead className="min-w-[100px]">Due Date</TableHead>
                        <TableHead className="min-w-[80px]">Status</TableHead>
                        <TableHead className="min-w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{invoice.eventTitle}</p>
                              <p className="text-sm text-muted-foreground">
                                {invoice.services.join(", ")}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                          <TableCell>{invoice.dueDate}</TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Receipt className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              {invoice.status === "pending" && (
                                <Button size="sm">Pay Now</Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <div className="desktop-first-2-col">
              <Card className="desktop-card-padding">
                <CardHeader className="px-0">
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className={`p-4 border rounded-lg ${selectedPaymentMethod === method.id ? 'border-primary bg-primary/5' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{method.brand} •••• {method.last4}</p>
                            <p className="text-sm text-muted-foreground">
                              Expires {method.expiryMonth}/{method.expiryYear}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {method.isDefault && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedPaymentMethod(method.id)}
                          >
                            {selectedPaymentMethod === method.id ? 'Selected' : 'Select'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="desktop-card-padding">
                <CardHeader className="px-0">
                  <CardTitle>Billing Address</CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input id="company" defaultValue="Extreme Staffing Solutions" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" defaultValue="123 Business Ave" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" defaultValue="New York" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input id="zip" defaultValue="10001" />
                    </div>
                  </div>
                  <Button className="w-full">Update Billing Address</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card className="desktop-card-padding">
              <CardHeader className="px-0">
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="responsive-table">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.description}</TableCell>
                          <TableCell className={transaction.amount > 0 ? 'text-success' : 'text-foreground'}>
                            {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                          </TableCell>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>
                            <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize">{transaction.type}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
}
