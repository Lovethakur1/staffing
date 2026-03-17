import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Plus,
  FileText,
  Receipt,
  CreditCard,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  Printer,
} from "lucide-react";

interface AccountingSystemProps {
  userRole: string;
  userId: string;
}

export function AccountingSystem({ userRole, userId }: AccountingSystemProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");
  const [showNewTransactionDialog, setShowNewTransactionDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);

  // Chart of Accounts
  const chartOfAccounts = [
    { id: "1000", name: "Cash - Operating Account", type: "Asset", balance: 145250.00, status: "active" },
    { id: "1010", name: "Cash - Payroll Account", type: "Asset", balance: 87500.00, status: "active" },
    { id: "1100", name: "Accounts Receivable", type: "Asset", balance: 62340.00, status: "active" },
    { id: "1200", name: "Event Deposits Held", type: "Asset", balance: 28500.00, status: "active" },
    { id: "2000", name: "Accounts Payable", type: "Liability", balance: 34200.00, status: "active" },
    { id: "2100", name: "Payroll Liabilities", type: "Liability", balance: 18450.00, status: "active" },
    { id: "2200", name: "Sales Tax Payable", type: "Liability", balance: 5670.00, status: "active" },
    { id: "3000", name: "Owner's Equity", type: "Equity", balance: 265770.00, status: "active" },
    { id: "4000", name: "Event Service Revenue", type: "Revenue", balance: 425000.00, status: "active" },
    { id: "4100", name: "Staffing Fees", type: "Revenue", balance: 185000.00, status: "active" },
    { id: "5000", name: "Staff Wages Expense", type: "Expense", balance: 245000.00, status: "active" },
    { id: "5100", name: "Payroll Tax Expense", type: "Expense", balance: 38750.00, status: "active" },
    { id: "5200", name: "Equipment Expense", type: "Expense", balance: 12500.00, status: "active" },
    { id: "6000", name: "Operating Expenses", type: "Expense", balance: 45000.00, status: "active" },
  ];

  // General Ledger Transactions
  const generalLedger = [
    { 
      id: "TXN-2501", 
      date: "2025-01-08", 
      type: "Invoice Payment", 
      account: "Accounts Receivable", 
      debit: 0, 
      credit: 8500.00, 
      description: "Payment from TechCorp - Event #145",
      reference: "INV-2501",
      status: "posted"
    },
    { 
      id: "TXN-2500", 
      date: "2025-01-08", 
      type: "Payroll", 
      account: "Staff Wages Expense", 
      debit: 15250.00, 
      credit: 0, 
      description: "Payroll - Week ending 01/05/2025",
      reference: "PAY-0105",
      status: "posted"
    },
    { 
      id: "TXN-2499", 
      date: "2025-01-07", 
      type: "Deposit", 
      account: "Event Deposits Held", 
      debit: 3500.00, 
      credit: 0, 
      description: "Event deposit - Gala Dinner",
      reference: "DEP-2499",
      status: "posted"
    },
    { 
      id: "TXN-2498", 
      date: "2025-01-07", 
      type: "Expense", 
      account: "Equipment Expense", 
      debit: 850.00, 
      credit: 0, 
      description: "Equipment rental - AV setup",
      reference: "EXP-2498",
      status: "posted"
    },
    { 
      id: "TXN-2497", 
      date: "2025-01-06", 
      type: "Revenue", 
      account: "Event Service Revenue", 
      debit: 0, 
      credit: 12500.00, 
      description: "Event completion - Corporate Conference",
      reference: "REV-2497",
      status: "posted"
    },
  ];

  // Invoices
  const invoices = [
    {
      id: "INV-2501",
      client: "TechCorp Industries",
      eventName: "Annual Tech Summit 2025",
      issueDate: "2025-01-02",
      dueDate: "2025-01-16",
      amount: 8500.00,
      paid: 8500.00,
      status: "paid",
      paymentDate: "2025-01-08"
    },
    {
      id: "INV-2502",
      client: "Luxury Events Ltd",
      eventName: "New Year's Gala",
      issueDate: "2025-01-03",
      dueDate: "2025-01-17",
      amount: 15750.00,
      paid: 0,
      status: "sent",
      paymentDate: null
    },
    {
      id: "INV-2503",
      client: "Metropolitan Hotel",
      eventName: "Wedding Reception",
      issueDate: "2025-01-05",
      dueDate: "2025-01-19",
      amount: 6200.00,
      paid: 0,
      status: "draft",
      paymentDate: null
    },
    {
      id: "INV-2504",
      client: "Corporate Solutions Inc",
      eventName: "Executive Retreat",
      issueDate: "2024-12-28",
      dueDate: "2025-01-11",
      amount: 9800.00,
      paid: 0,
      status: "overdue",
      paymentDate: null
    },
  ];

  // Bills to Pay
  const bills = [
    {
      id: "BILL-1234",
      vendor: "Equipment Rentals Plus",
      description: "AV Equipment rental - January",
      issueDate: "2025-01-01",
      dueDate: "2025-01-15",
      amount: 2850.00,
      status: "unpaid"
    },
    {
      id: "BILL-1235",
      vendor: "Insurance Co",
      description: "Liability Insurance - Q1 2025",
      issueDate: "2024-12-15",
      dueDate: "2025-01-10",
      amount: 4500.00,
      status: "overdue"
    },
    {
      id: "BILL-1236",
      vendor: "Office Supplies Direct",
      description: "Office supplies and uniforms",
      issueDate: "2025-01-05",
      dueDate: "2025-01-20",
      amount: 680.00,
      status: "unpaid"
    },
  ];

  // Financial Reports Data
  const profitLossData = {
    revenue: {
      eventServices: 425000.00,
      staffingFees: 185000.00,
      total: 610000.00
    },
    expenses: {
      staffWages: 245000.00,
      payrollTax: 38750.00,
      equipment: 12500.00,
      operating: 45000.00,
      total: 341250.00
    },
    netIncome: 268750.00,
    margin: 44.1
  };

  const balanceSheetData = {
    assets: {
      cash: 232750.00,
      accountsReceivable: 62340.00,
      deposits: 28500.00,
      total: 323590.00
    },
    liabilities: {
      accountsPayable: 34200.00,
      payrollLiabilities: 18450.00,
      salesTax: 5670.00,
      total: 58320.00
    },
    equity: 265270.00
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900">Accounting System</h1>
          <p className="text-slate-600">Complete financial management and bookkeeping</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="current-quarter">Current Quarter</SelectItem>
              <SelectItem value="current-year">Current Year</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Total Revenue</span>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-semibold text-slate-900">${profitLossData.revenue.total.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-600">+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Total Expenses</span>
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-semibold text-slate-900">${profitLossData.expenses.total.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-red-600" />
              <span className="text-xs text-red-600">+8.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Net Income</span>
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-semibold text-green-600">${profitLossData.netIncome.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-slate-600">Profit Margin: {profitLossData.margin}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Accounts Receivable</span>
              <Receipt className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-semibold text-slate-900">${balanceSheetData.assets.accountsReceivable.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-orange-600" />
              <span className="text-xs text-orange-600">1 invoice overdue</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="chart-accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>General Ledger</CardTitle>
                <Dialog open={showNewTransactionDialog} onOpenChange={setShowNewTransactionDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-sangria hover:bg-merlot">
                      <Plus className="w-4 h-4" />
                      New Transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Record New Transaction</DialogTitle>
                      <DialogDescription>
                        Enter transaction details for accounting records
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Input type="date" defaultValue="2025-01-10" />
                        </div>
                        <div className="space-y-2">
                          <Label>Transaction Type</Label>
                          <Select defaultValue="revenue">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="revenue">Revenue</SelectItem>
                              <SelectItem value="expense">Expense</SelectItem>
                              <SelectItem value="payment">Payment</SelectItem>
                              <SelectItem value="deposit">Deposit</SelectItem>
                              <SelectItem value="transfer">Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Account</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            {chartOfAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.id} - {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Debit Amount</Label>
                          <Input type="number" placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                          <Label>Credit Amount</Label>
                          <Input type="number" placeholder="0.00" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea placeholder="Transaction description..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Reference Number</Label>
                        <Input placeholder="INV-0001, CHECK-0001, etc." />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowNewTransactionDialog(false)}>Cancel</Button>
                      <Button className="bg-sangria hover:bg-merlot">Post Transaction</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search and Filter */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Search transactions..." className="pl-9" />
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                  </Button>
                </div>

                {/* Transactions Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-slate-700">Date</th>
                        <th className="text-left p-3 text-sm font-medium text-slate-700">Transaction ID</th>
                        <th className="text-left p-3 text-sm font-medium text-slate-700">Type</th>
                        <th className="text-left p-3 text-sm font-medium text-slate-700">Account</th>
                        <th className="text-right p-3 text-sm font-medium text-slate-700">Debit</th>
                        <th className="text-right p-3 text-sm font-medium text-slate-700">Credit</th>
                        <th className="text-left p-3 text-sm font-medium text-slate-700">Description</th>
                        <th className="text-center p-3 text-sm font-medium text-slate-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generalLedger.map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-slate-50">
                          <td className="p-3 text-sm text-slate-900">{new Date(transaction.date).toLocaleDateString()}</td>
                          <td className="p-3 text-sm text-slate-900 font-mono">{transaction.id}</td>
                          <td className="p-3 text-sm">
                            <Badge variant="outline">{transaction.type}</Badge>
                          </td>
                          <td className="p-3 text-sm text-slate-900">{transaction.account}</td>
                          <td className="p-3 text-sm text-right text-slate-900">
                            {transaction.debit > 0 ? `$${transaction.debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                          </td>
                          <td className="p-3 text-sm text-right text-slate-900">
                            {transaction.credit > 0 ? `$${transaction.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                          </td>
                          <td className="p-3 text-sm text-slate-600">{transaction.description}</td>
                          <td className="p-3 text-center">
                            <Badge className="bg-green-100 text-green-700">Posted</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Invoices</CardTitle>
                <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-sangria hover:bg-merlot">
                      <Plus className="w-4 h-4" />
                      Create Invoice
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Create New Invoice</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Client</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select client" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="client1">TechCorp Industries</SelectItem>
                              <SelectItem value="client2">Luxury Events Ltd</SelectItem>
                              <SelectItem value="client3">Metropolitan Hotel</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Event</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="event1">Corporate Gala 2025</SelectItem>
                              <SelectItem value="event2">Product Launch Event</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Invoice Date</Label>
                          <Input type="date" defaultValue="2025-01-10" />
                        </div>
                        <div className="space-y-2">
                          <Label>Due Date</Label>
                          <Input type="date" defaultValue="2025-01-24" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Line Items</Label>
                        <div className="border rounded-lg p-4 space-y-2">
                          <div className="grid grid-cols-12 gap-2">
                            <Input placeholder="Description" className="col-span-6" />
                            <Input placeholder="Qty" type="number" className="col-span-2" />
                            <Input placeholder="Rate" type="number" className="col-span-2" />
                            <Input placeholder="Amount" disabled className="col-span-2" />
                          </div>
                          <Button variant="outline" className="w-full gap-2">
                            <Plus className="w-4 h-4" />
                            Add Line Item
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea placeholder="Payment terms, thank you message, etc." />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>Cancel</Button>
                      <Button variant="outline">Save as Draft</Button>
                      <Button className="bg-sangria hover:bg-merlot">Create & Send</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Invoice Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-slate-600 mb-1">Draft</div>
                      <div className="text-xl font-semibold text-slate-900">1</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-slate-600 mb-1">Sent</div>
                      <div className="text-xl font-semibold text-blue-600">1</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-slate-600 mb-1">Paid</div>
                      <div className="text-xl font-semibold text-green-600">1</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-slate-600 mb-1">Overdue</div>
                      <div className="text-xl font-semibold text-red-600">1</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Invoices Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-slate-700">Invoice #</th>
                        <th className="text-left p-3 text-sm font-medium text-slate-700">Client</th>
                        <th className="text-left p-3 text-sm font-medium text-slate-700">Event</th>
                        <th className="text-left p-3 text-sm font-medium text-slate-700">Issue Date</th>
                        <th className="text-left p-3 text-sm font-medium text-slate-700">Due Date</th>
                        <th className="text-right p-3 text-sm font-medium text-slate-700">Amount</th>
                        <th className="text-center p-3 text-sm font-medium text-slate-700">Status</th>
                        <th className="text-center p-3 text-sm font-medium text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b hover:bg-slate-50">
                          <td className="p-3 text-sm text-slate-900 font-mono">{invoice.id}</td>
                          <td className="p-3 text-sm text-slate-900">{invoice.client}</td>
                          <td className="p-3 text-sm text-slate-600">{invoice.eventName}</td>
                          <td className="p-3 text-sm text-slate-900">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                          <td className="p-3 text-sm text-slate-900">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                          <td className="p-3 text-sm text-right text-slate-900 font-semibold">
                            ${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-center">
                            <Badge className={
                              invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                              invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                              invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                              'bg-slate-100 text-slate-700'
                            }>
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <FileText className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Printer className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bills Tab */}
        <TabsContent value="bills" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bills to Pay</CardTitle>
                <Button className="gap-2 bg-sangria hover:bg-merlot">
                  <Plus className="w-4 h-4" />
                  Add Bill
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Bill #</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Vendor</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Description</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Issue Date</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Due Date</th>
                      <th className="text-right p-3 text-sm font-medium text-slate-700">Amount</th>
                      <th className="text-center p-3 text-sm font-medium text-slate-700">Status</th>
                      <th className="text-center p-3 text-sm font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => (
                      <tr key={bill.id} className="border-b hover:bg-slate-50">
                        <td className="p-3 text-sm text-slate-900 font-mono">{bill.id}</td>
                        <td className="p-3 text-sm text-slate-900">{bill.vendor}</td>
                        <td className="p-3 text-sm text-slate-600">{bill.description}</td>
                        <td className="p-3 text-sm text-slate-900">{new Date(bill.issueDate).toLocaleDateString()}</td>
                        <td className="p-3 text-sm text-slate-900">{new Date(bill.dueDate).toLocaleDateString()}</td>
                        <td className="p-3 text-sm text-right text-slate-900 font-semibold">
                          ${bill.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-center">
                          <Badge className={bill.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                            {bill.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button size="sm" className="bg-sangria hover:bg-merlot">Pay Now</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chart of Accounts Tab */}
        <TabsContent value="chart-accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Chart of Accounts</CardTitle>
                <Button className="gap-2 bg-sangria hover:bg-merlot">
                  <Plus className="w-4 h-4" />
                  Add Account
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Account #</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Account Name</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Type</th>
                      <th className="text-right p-3 text-sm font-medium text-slate-700">Balance</th>
                      <th className="text-center p-3 text-sm font-medium text-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartOfAccounts.map((account) => (
                      <tr key={account.id} className="border-b hover:bg-slate-50">
                        <td className="p-3 text-sm text-slate-900 font-mono">{account.id}</td>
                        <td className="p-3 text-sm text-slate-900">{account.name}</td>
                        <td className="p-3 text-sm">
                          <Badge variant="outline" className={
                            account.type === 'Asset' ? 'border-green-200 text-green-700' :
                            account.type === 'Liability' ? 'border-red-200 text-red-700' :
                            account.type === 'Equity' ? 'border-blue-200 text-blue-700' :
                            account.type === 'Revenue' ? 'border-purple-200 text-purple-700' :
                            'border-orange-200 text-orange-700'
                          }>
                            {account.type}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-right text-slate-900 font-semibold">
                          ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-center">
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Profit & Loss */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profit & Loss Statement</CardTitle>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Revenue</span>
                    <span className="text-sm font-semibold text-green-600">${profitLossData.revenue.total.toLocaleString()}</span>
                  </div>
                  <div className="pl-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Event Services</span>
                      <span className="text-sm text-slate-900">${profitLossData.revenue.eventServices.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Staffing Fees</span>
                      <span className="text-sm text-slate-900">${profitLossData.revenue.staffingFees.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Expenses</span>
                    <span className="text-sm font-semibold text-red-600">${profitLossData.expenses.total.toLocaleString()}</span>
                  </div>
                  <div className="pl-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Staff Wages</span>
                      <span className="text-sm text-slate-900">${profitLossData.expenses.staffWages.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Payroll Tax</span>
                      <span className="text-sm text-slate-900">${profitLossData.expenses.payrollTax.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Equipment</span>
                      <span className="text-sm text-slate-900">${profitLossData.expenses.equipment.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Operating</span>
                      <span className="text-sm text-slate-900">${profitLossData.expenses.operating.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Net Income</span>
                    <span className="font-semibold text-green-600 text-lg">${profitLossData.netIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-slate-600">Profit Margin</span>
                    <span className="text-sm text-slate-900">{profitLossData.margin}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Balance Sheet */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Balance Sheet</CardTitle>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Assets</span>
                    <span className="text-sm font-semibold text-green-600">${balanceSheetData.assets.total.toLocaleString()}</span>
                  </div>
                  <div className="pl-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Cash</span>
                      <span className="text-sm text-slate-900">${balanceSheetData.assets.cash.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Accounts Receivable</span>
                      <span className="text-sm text-slate-900">${balanceSheetData.assets.accountsReceivable.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Deposits Held</span>
                      <span className="text-sm text-slate-900">${balanceSheetData.assets.deposits.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Liabilities</span>
                    <span className="text-sm font-semibold text-red-600">${balanceSheetData.liabilities.total.toLocaleString()}</span>
                  </div>
                  <div className="pl-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Accounts Payable</span>
                      <span className="text-sm text-slate-900">${balanceSheetData.liabilities.accountsPayable.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Payroll Liabilities</span>
                      <span className="text-sm text-slate-900">${balanceSheetData.liabilities.payrollLiabilities.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Sales Tax Payable</span>
                      <span className="text-sm text-slate-900">${balanceSheetData.liabilities.salesTax.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Owner's Equity</span>
                    <span className="font-semibold text-blue-600 text-lg">${balanceSheetData.equity.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Assets - Liabilities = Equity
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
