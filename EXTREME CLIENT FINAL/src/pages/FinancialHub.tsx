import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Upload,
  Send,
  Search,
  Filter,
  Plus,
  Eye,
  FileText,
  CreditCard,
  Building2,
  Receipt,
  BarChart3,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Wallet
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner@2.0.3";

interface FinancialHubProps {
  userRole: string;
  userId: string;
}

export function FinancialHub({ userRole }: FinancialHubProps) {
  const { setCurrentPage } = useNavigation();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("month");

  // Mock Financial Data
  const financialMetrics = {
    totalRevenue: 284750,
    revenueChange: 12.5,
    totalExpenses: 156420,
    expenseChange: -3.2,
    netProfit: 128330,
    profitMargin: 45.1,
    pendingInvoices: 8,
    pendingAmount: 45600,
    overdueInvoices: 3,
    overdueAmount: 12400,
    upcomingPayroll: 42800,
    payrollDate: "Oct 15, 2024",
    avgPaymentTime: 12.5,
    cashFlow: 86200
  };

  const recentInvoices = [
    {
      id: "INV-2024-089",
      client: "TechCorp Inc",
      eventName: "Annual Conference",
      amount: 8500,
      status: "paid",
      issueDate: "2024-10-01",
      dueDate: "2024-10-15",
      paidDate: "2024-10-12"
    },
    {
      id: "INV-2024-090",
      client: "Wedding - Johnson",
      eventName: "Wedding Reception",
      amount: 3200,
      status: "pending",
      issueDate: "2024-10-05",
      dueDate: "2024-10-19",
      paidDate: null
    },
    {
      id: "INV-2024-091",
      client: "Corporate Events Ltd",
      eventName: "Product Launch",
      amount: 12400,
      status: "overdue",
      issueDate: "2024-09-20",
      dueDate: "2024-10-04",
      paidDate: null
    },
    {
      id: "INV-2024-092",
      client: "Smith Foundation",
      eventName: "Charity Gala",
      amount: 6800,
      status: "pending",
      issueDate: "2024-10-08",
      dueDate: "2024-10-22",
      paidDate: null
    },
    {
      id: "INV-2024-093",
      client: "Marketing Agency",
      eventName: "Team Building Event",
      amount: 4200,
      status: "draft",
      issueDate: "2024-10-10",
      dueDate: "2024-10-24",
      paidDate: null
    }
  ];

  const payrollEntries = [
    {
      id: "PAY-2024-10-W2",
      period: "Oct 1-7, 2024",
      staffCount: 24,
      totalHours: 856,
      grossPay: 21400,
      taxes: 4280,
      netPay: 17120,
      status: "processed",
      processedDate: "2024-10-08"
    },
    {
      id: "PAY-2024-10-W3",
      period: "Oct 8-14, 2024",
      staffCount: 28,
      totalHours: 924,
      grossPay: 23100,
      taxes: 4620,
      netPay: 18480,
      status: "pending",
      processedDate: null
    },
    {
      id: "PAY-2024-10-W1",
      period: "Sep 24-30, 2024",
      staffCount: 22,
      totalHours: 792,
      grossPay: 19800,
      taxes: 3960,
      netPay: 15840,
      status: "completed",
      processedDate: "2024-10-01"
    }
  ];

  const accountTransactions = [
    {
      id: "TXN-001",
      date: "2024-10-12",
      type: "income",
      category: "Client Payment",
      description: "INV-2024-089 - TechCorp Inc",
      amount: 8500,
      balance: 86200
    },
    {
      id: "TXN-002",
      date: "2024-10-11",
      type: "expense",
      category: "Payroll",
      description: "Weekly Payroll - Oct 1-7",
      amount: -17120,
      balance: 77700
    },
    {
      id: "TXN-003",
      date: "2024-10-10",
      type: "expense",
      category: "Operating Costs",
      description: "Software Subscriptions",
      amount: -450,
      balance: 94820
    },
    {
      id: "TXN-004",
      date: "2024-10-08",
      type: "income",
      category: "Client Payment",
      description: "INV-2024-085 - Event Payment",
      amount: 5600,
      balance: 95270
    }
  ];

  // Pending staff payroll submissions
  const pendingPayrollSubmissions = [
    {
      id: "SUB-2024-045",
      staffName: "Michael Rodriguez",
      staffId: "STAFF-045",
      submittedDate: "2024-10-10",
      entriesCount: 2,
      totalHours: 10.5,
      estimatedPay: 625.00
    },
    {
      id: "SUB-2024-046",
      staffName: "Sarah Chen",
      staffId: "STAFF-028",
      submittedDate: "2024-10-11",
      entriesCount: 3,
      totalHours: 15.5,
      estimatedPay: 875.50
    },
    {
      id: "SUB-2024-047",
      staffName: "David Miller",
      staffId: "STAFF-063",
      submittedDate: "2024-10-11",
      entriesCount: 1,
      totalHours: 6.0,
      estimatedPay: 450.00
    }
  ];

  const handleCreateInvoice = () => {
    toast.success("Opening invoice creation form");
  };

  const handleProcessPayroll = () => {
    toast.success("Processing payroll for current period");
  };

  const handleViewInvoice = (invoiceId: string) => {
    toast.info(`Opening invoice ${invoiceId}`);
  };

  const handleSendInvoice = (invoiceId: string) => {
    toast.success(`Invoice ${invoiceId} sent to client`);
  };

  const handleVerifyPayment = () => {
    setCurrentPage('verify-payment');
  };

  const handleReviewPayroll = (submissionId: string) => {
    setCurrentPage('admin-payroll-review');
    toast.info(`Opening payroll review for ${submissionId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
      case 'processed':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl">Financial Center</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive financial management, invoicing, payroll, and accounting
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="accounting">Accounting</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">${financialMetrics.totalRevenue.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>+{financialMetrics.revenueChange}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">${financialMetrics.totalExpenses.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                  <TrendingDown className="h-3 w-3" />
                  <span>{financialMetrics.expenseChange}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Net Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">${financialMetrics.netProfit.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <span>{financialMetrics.profitMargin}% margin</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Cash Flow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">${financialMetrics.cashFlow.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <span>Available balance</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Items */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pending Invoices</CardTitle>
                <CardDescription>
                  {financialMetrics.pendingInvoices} invoices awaiting payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pending</p>
                    <p className="text-2xl">${financialMetrics.pendingAmount.toLocaleString()}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                    <p className="text-2xl">${financialMetrics.overdueAmount.toLocaleString()}</p>
                    <p className="text-xs text-red-600">{financialMetrics.overdueInvoices} invoices</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <Button className="w-full" variant="outline" onClick={() => setActiveTab('invoicing')}>
                  View All Invoices
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Payroll</CardTitle>
                <CardDescription>
                  Next scheduled payroll processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount Due</p>
                    <p className="text-2xl">${financialMetrics.upcomingPayroll.toLocaleString()}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-medium">{financialMetrics.payrollDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="secondary">Pending Review</Badge>
                  </div>
                </div>
                <Button className="w-full" onClick={() => setActiveTab('payroll')}>
                  Process Payroll
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="justify-start" onClick={handleCreateInvoice}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
                <Button variant="outline" className="justify-start" onClick={handleVerifyPayment}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Verify Payment
                </Button>
                <Button variant="outline" className="justify-start" onClick={handleProcessPayroll}>
                  <Users className="h-4 w-4 mr-2" />
                  Process Payroll
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => setActiveTab('reports')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* INVOICING TAB */}
        <TabsContent value="invoicing" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invoices & Billing</CardTitle>
                  <CardDescription>Manage client invoices and track payments</CardDescription>
                </div>
                <Button onClick={handleCreateInvoice}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.client}</TableCell>
                      <TableCell className="text-muted-foreground">{invoice.eventName}</TableCell>
                      <TableCell className="font-semibold">${invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>{invoice.issueDate}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInvoice(invoice.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {invoice.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendInvoice(invoice.id)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYROLL TAB */}
        <TabsContent value="payroll" className="space-y-6">
          {/* Pending Staff Submissions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Staff Payroll Submissions</CardTitle>
                  <CardDescription>Review and approve staff payroll entries</CardDescription>
                </div>
                <Badge className="bg-yellow-100 text-yellow-700 text-base px-3 py-1">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {pendingPayrollSubmissions.length} Pending Review
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              {pendingPayrollSubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="font-medium mb-2">All Caught Up!</h3>
                  <p className="text-sm text-muted-foreground">
                    No pending payroll submissions to review.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Submission ID</TableHead>
                      <TableHead>Staff Name</TableHead>
                      <TableHead>Submitted Date</TableHead>
                      <TableHead>Entries</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Estimated Pay</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPayrollSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.id}</TableCell>
                        <TableCell>{submission.staffName}</TableCell>
                        <TableCell>{submission.submittedDate}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{submission.entriesCount} {submission.entriesCount === 1 ? 'entry' : 'entries'}</Badge>
                        </TableCell>
                        <TableCell>{submission.totalHours.toFixed(1)}h</TableCell>
                        <TableCell className="font-medium">${submission.estimatedPay.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className="bg-yellow-100 text-yellow-700">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReviewPayroll(submission.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Payroll Batch Processing */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payroll Batch Processing</CardTitle>
                  <CardDescription>Process approved payroll in batches</CardDescription>
                </div>
                <Button onClick={handleProcessPayroll}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Payroll Run
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payroll ID</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Staff Count</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Taxes</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.id}</TableCell>
                      <TableCell>{entry.period}</TableCell>
                      <TableCell>{entry.staffCount}</TableCell>
                      <TableCell>{entry.totalHours}h</TableCell>
                      <TableCell>${entry.grossPay.toLocaleString()}</TableCell>
                      <TableCell className="text-red-600">${entry.taxes.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">${entry.netPay.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACCOUNTING TAB */}
        <TabsContent value="accounting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Accounting & Transactions</CardTitle>
              <CardDescription>View all financial transactions and ledger</CardDescription>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountTransactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell>{txn.date}</TableCell>
                      <TableCell>
                        <Badge variant={txn.type === 'income' ? 'default' : 'secondary'}>
                          {txn.type === 'income' ? (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          )}
                          {txn.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{txn.category}</TableCell>
                      <TableCell className="text-muted-foreground">{txn.description}</TableCell>
                      <TableCell
                        className={txn.type === 'income' ? 'text-green-600' : 'text-red-600'}
                      >
                        {txn.type === 'income' ? '+' : ''}${Math.abs(txn.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">${txn.balance.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REPORTS TAB */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Profit & Loss Statement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Comprehensive P&L report for the selected period
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Detailed revenue breakdown by client and event type
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Expense Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Categorized expense analysis and trends
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Payroll Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Staff payment summary and tax calculations
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Tax Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Tax reports and compliance documents
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Cash Flow Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Cash flow statement and forecasting
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
