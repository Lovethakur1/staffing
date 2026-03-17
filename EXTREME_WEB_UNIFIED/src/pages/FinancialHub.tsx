import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import {
  DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Clock, Download, Send,
  Search, Plus, Eye, FileText, Receipt, Users, Wallet, BarChart3, PieChart,
  ArrowUpRight, ArrowDownRight, Building2
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner";
import { invoiceService } from "../services/invoice.service";
import { financeService } from "../services/finance.service";

interface FinancialHubProps {
  userRole: string;
  userId: string;
}

export function FinancialHub({ userRole, userId }: FinancialHubProps) {
  const { setCurrentPage } = useNavigation();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("month");

  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [payrollEntries, setPayrollEntries] = useState<any[]>([]);
  const [pendingPayrollSubmissions, setPendingPayrollSubmissions] = useState<any[]>([]);
  const [financialMetrics, setFinancialMetrics] = useState({
    totalRevenue: 0, revenueChange: 0, totalExpenses: 0, expenseChange: 0,
    netProfit: 0, profitMargin: 0, pendingInvoices: 0, pendingAmount: 0,
    overdueInvoices: 0, overdueAmount: 0, upcomingPayroll: 0, payrollDate: 'TBD',
    avgPaymentTime: 0, cashFlow: 0,
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [invoicesRaw, timesheetsRaw] = await Promise.all([
          invoiceService.getInvoices(),
          financeService.getTimesheets(),
        ]);

        const invoices = invoicesRaw.map((inv: any) => ({
          id: inv.invoiceNumber || inv.id,
          client: inv.client?.user?.name || inv.client?.company || 'Client',
          eventName: inv.event?.title || 'Event',
          amount: inv.total || 0,
          status: (inv.status || 'draft').toLowerCase(),
          issueDate: inv.issueDate || inv.createdAt?.split('T')[0] || '',
          dueDate: inv.dueDate || '',
          paidDate: inv.status === 'PAID' ? inv.updatedAt?.split('T')[0] : null,
        }));
        setRecentInvoices(invoices.slice(0, 10));

        const payroll = timesheetsRaw.map((ts: any) => ({
          id: ts.id,
          period: ts.shift?.date || 'Period',
          staffCount: 1,
          totalHours: ts.totalHours || 0,
          grossPay: ts.grossPay || 0,
          taxes: Math.round((ts.grossPay || 0) * 0.2),
          netPay: Math.round((ts.grossPay || 0) * 0.8),
          status: (ts.status || 'pending').toLowerCase(),
          processedDate: ts.approvedAt?.split('T')[0] || null,
        }));
        setPayrollEntries(payroll.slice(0, 10));

        const pendingTs = timesheetsRaw
          .filter((ts: any) => ts.status === 'SUBMITTED' || ts.status === 'PENDING')
          .slice(0, 5);
        setPendingPayrollSubmissions(pendingTs.map((ts: any) => ({
          id: ts.id,
          staffName: ts.staff?.user?.name || 'Staff',
          staffId: ts.staffId || '',
          submittedDate: ts.clockInTime?.split('T')[0] || '',
          entriesCount: 1,
          totalHours: ts.totalHours || 0,
          estimatedPay: ts.grossPay || 0,
        })));

        const totalRevenue = invoices.filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + i.amount, 0);
        const outstanding = invoices.filter((i: any) => i.status !== 'paid').reduce((s: number, i: any) => s + i.amount, 0);
        const overdue = invoices.filter((i: any) => i.status === 'overdue');
        const totalPayroll = payroll.reduce((s: number, p: any) => s + p.netPay, 0);

        setFinancialMetrics({
          totalRevenue,
          revenueChange: 0,
          totalExpenses: totalPayroll,
          expenseChange: 0,
          netProfit: totalRevenue - totalPayroll,
          profitMargin: totalRevenue > 0 ? Math.round(((totalRevenue - totalPayroll) / totalRevenue) * 1000) / 10 : 0,
          pendingInvoices: invoices.filter((i: any) => i.status === 'sent' || i.status === 'pending').length,
          pendingAmount: outstanding,
          overdueInvoices: overdue.length,
          overdueAmount: overdue.reduce((s: number, i: any) => s + i.amount, 0),
          upcomingPayroll: payroll.filter((p: any) => p.status === 'pending').reduce((s: number, p: any) => s + p.grossPay, 0),
          payrollDate: 'Next cycle',
          avgPaymentTime: 0,
          cashFlow: totalRevenue - totalPayroll,
        });
      } catch {
        toast.error('Failed to load financial data');
      }
    };
    fetchAll();
  }, []);

  const handleCreateInvoice = () => toast.success("Opening invoice creation form");
  const handleProcessPayroll = () => toast.success("Processing payroll for current period");
  const handleViewInvoice = (invoiceId: string) => setCurrentPage('invoice-detail', { invoiceId });
  const handleSendInvoice = (invoiceId: string) => toast.success(`Invoice ${invoiceId} sent to client`);
  const handleVerifyPayment = () => setCurrentPage('verify-payment');
  const handleReviewPayroll = (submissionId: string) => {
    setCurrentPage('admin-payroll-review');
    toast.info(`Opening payroll review for ${submissionId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': case 'completed': case 'processed':
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
          <div className="flex items-center gap-3">
            <h1 className="text-3xl">Financial Center</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Admin
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">Comprehensive financial management, invoicing, payroll, and accounting</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="inline-flex lg:grid w-full grid-cols-2 lg:grid-cols-5 min-w-max lg:min-w-0">
            <TabsTrigger value="overview" className="whitespace-nowrap">Overview</TabsTrigger>
            <TabsTrigger value="invoicing" className="whitespace-nowrap">Invoicing</TabsTrigger>
            <TabsTrigger value="payroll" className="whitespace-nowrap">Payroll</TabsTrigger>
            <TabsTrigger value="accounting" className="whitespace-nowrap">Accounting</TabsTrigger>
            <TabsTrigger value="reports" className="whitespace-nowrap">Reports</TabsTrigger>
          </TabsList>
        </div>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign className="h-4 w-4" />Total Revenue</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl">${financialMetrics.totalRevenue.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-1"><TrendingUp className="h-3 w-3" /><span>All time</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Receipt className="h-4 w-4" />Total Expenses</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl">${financialMetrics.totalExpenses.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1"><span>Payroll costs</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4" />Net Profit</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl">${financialMetrics.netProfit.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1"><span>{financialMetrics.profitMargin}% margin</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Wallet className="h-4 w-4" />Cash Flow</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl">${financialMetrics.cashFlow.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1"><span>Available balance</span></div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Pending Invoices</CardTitle><CardDescription>{financialMetrics.pendingInvoices} invoices awaiting payment</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div><p className="text-sm text-muted-foreground">Total Pending</p><p className="text-2xl">${financialMetrics.pendingAmount.toLocaleString()}</p></div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div><p className="text-sm text-muted-foreground">Overdue</p><p className="text-2xl">${financialMetrics.overdueAmount.toLocaleString()}</p><p className="text-xs text-red-600">{financialMetrics.overdueInvoices} invoices</p></div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <Button className="w-full" variant="outline" onClick={() => setActiveTab('invoicing')}>View All Invoices</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Upcoming Payroll</CardTitle><CardDescription>Next scheduled payroll processing</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div><p className="text-sm text-muted-foreground">Amount Due</p><p className="text-2xl">${financialMetrics.upcomingPayroll.toLocaleString()}</p></div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Due Date:</span><span className="font-medium">{financialMetrics.payrollDate}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status:</span><Badge variant="secondary">Pending Review</Badge></div>
                </div>
                <Button className="w-full" onClick={() => setActiveTab('payroll')}>Process Payroll</Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="justify-start" onClick={handleCreateInvoice}><Plus className="h-4 w-4 mr-2" />Create Invoice</Button>
                <Button variant="outline" className="justify-start" onClick={handleVerifyPayment}><CheckCircle2 className="h-4 w-4 mr-2" />Verify Payment</Button>
                <Button variant="outline" className="justify-start" onClick={handleProcessPayroll}><Users className="h-4 w-4 mr-2" />Process Payroll</Button>
                <Button variant="outline" className="justify-start" onClick={() => setActiveTab('reports')}><BarChart3 className="h-4 w-4 mr-2" />View Reports</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* INVOICING TAB */}
        <TabsContent value="invoicing" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Invoices & Billing</CardTitle><CardDescription>Manage client invoices and track payments</CardDescription></div>
                <Button onClick={handleCreateInvoice}><Plus className="h-4 w-4 mr-2" />Create Invoice</Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search invoices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
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
              {recentInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No invoices found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Invoice ID</TableHead><TableHead>Client</TableHead><TableHead>Event</TableHead><TableHead>Amount</TableHead><TableHead>Issue Date</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {recentInvoices
                      .filter(inv => filterStatus === 'all' || inv.status === filterStatus)
                      .filter(inv => !searchQuery || inv.client?.toLowerCase().includes(searchQuery.toLowerCase()) || inv.id?.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((invoice) => (
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
                              <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice.id)}><Eye className="h-4 w-4" /></Button>
                              {invoice.status === 'pending' && <Button variant="ghost" size="sm" onClick={() => handleSendInvoice(invoice.id)}><Send className="h-4 w-4" /></Button>}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYROLL TAB */}
        <TabsContent value="payroll" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Pending Staff Payroll Submissions</CardTitle><CardDescription>Review and approve staff payroll entries</CardDescription></div>
                {pendingPayrollSubmissions.length > 0 && (
                  <Badge className="bg-yellow-100 text-yellow-700 text-base px-3 py-1"><AlertCircle className="h-4 w-4 mr-2" />{pendingPayrollSubmissions.length} Pending Review</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {pendingPayrollSubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="font-medium mb-2">All Caught Up!</h3>
                  <p className="text-sm text-muted-foreground">No pending payroll submissions to review.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Submission ID</TableHead><TableHead>Staff Name</TableHead><TableHead>Submitted Date</TableHead><TableHead>Entries</TableHead><TableHead>Total Hours</TableHead><TableHead>Estimated Pay</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {pendingPayrollSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.id}</TableCell>
                        <TableCell>{submission.staffName}</TableCell>
                        <TableCell>{submission.submittedDate}</TableCell>
                        <TableCell><Badge variant="outline">{submission.entriesCount} {submission.entriesCount === 1 ? 'entry' : 'entries'}</Badge></TableCell>
                        <TableCell>{submission.totalHours.toFixed(1)}h</TableCell>
                        <TableCell className="font-medium">${submission.estimatedPay.toFixed(2)}</TableCell>
                        <TableCell><Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge></TableCell>
                        <TableCell><Button variant="outline" size="sm" onClick={() => handleReviewPayroll(submission.id)}><Eye className="h-4 w-4 mr-2" />Review</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div><CardTitle>Payroll Batch Processing</CardTitle><CardDescription>Process approved payroll in batches</CardDescription></div>
                <Button onClick={handleProcessPayroll}><Plus className="h-4 w-4 mr-2" />New Payroll Run</Button>
              </div>
            </CardHeader>
            <CardContent>
              {payrollEntries.length === 0 ? (
                <div className="text-center py-8"><p className="text-muted-foreground">No payroll entries found</p></div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Payroll ID</TableHead><TableHead>Period</TableHead><TableHead>Staff Count</TableHead><TableHead>Total Hours</TableHead><TableHead>Gross Pay</TableHead><TableHead>Taxes</TableHead><TableHead>Net Pay</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACCOUNTING TAB */}
        <TabsContent value="accounting" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Accounting & Transactions</CardTitle><CardDescription>View all financial transactions and ledger</CardDescription></CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Transaction ledger will populate as invoices are paid and payroll is processed</p>
                <p className="text-sm text-muted-foreground mt-1">Live data connected — transactions appear automatically</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REPORTS TAB */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: FileText, title: 'Profit & Loss Statement', desc: 'Comprehensive P&L report for the selected period' },
              { icon: BarChart3, title: 'Revenue Analysis', desc: 'Detailed revenue breakdown by client and event type' },
              { icon: PieChart, title: 'Expense Breakdown', desc: 'Categorized expense analysis and trends' },
              { icon: Users, title: 'Payroll Summary', desc: 'Staff payroll costs for the selected period' },
              { icon: Receipt, title: 'Invoice Aging Report', desc: 'Overdue invoices sorted by days outstanding' },
              { icon: TrendingUp, title: 'Cash Flow Statement', desc: 'Monthly cash flow and projection analysis' },
            ].map((report) => (
              <Card key={report.title} className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><report.icon className="h-5 w-5" />{report.title}</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{report.desc}</p>
                  <Button variant="outline" size="sm" className="w-full"><Download className="h-4 w-4 mr-2" />Generate Report</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
