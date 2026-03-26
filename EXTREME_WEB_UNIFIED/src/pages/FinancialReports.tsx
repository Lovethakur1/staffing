import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { InfoTooltip } from "../components/ui/tooltip-wrapper";
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
  Download,
  FileText,
  Receipt,
  BarChart3,
  PieChart,
  Building2,
  Wallet,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { useNavigation } from "../contexts/NavigationContext";
import { invoiceService } from "../services/invoice.service";
import { financeService } from "../services/finance.service";

interface FinancialReportsProps {
  userRole: string;
  userId: string;
}

export function FinancialReports({ userRole, userId }: FinancialReportsProps) {
  const { setCurrentPage } = useNavigation();
  const [filterPeriod, setFilterPeriod] = useState("month");
  const [isLoading, setIsLoading] = useState(true);

  const [financialMetrics, setFinancialMetrics] = useState({
    totalRevenue: 0, revenueChange: 0,
    totalExpenses: 0, expenseChange: 0,
    netProfit: 0, profitMargin: 0,
    cashFlow: 0, avgPaymentTime: 0,
  });
  const [accountTransactions, setAccountTransactions] = useState<any[]>([]);
  const [expenseByCategory, setExpenseByCategory] = useState<any[]>([]);
  const [revenueByClient, setRevenueByClient] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [invoicesRaw, runsRaw] = await Promise.all([
          invoiceService.getInvoices({ take: 500 }),
          financeService.getPayrollRuns({ take: 200 }),
        ]);

        const invoices: any[] = Array.isArray(invoicesRaw) ? invoicesRaw : (invoicesRaw?.data || []);
        const runs: any[] = Array.isArray(runsRaw) ? runsRaw : (runsRaw?.data || []);

        // ── Metrics ───────────────────────────────────────────────────
        const paidInvoices = invoices.filter(i => (i.status || '').toUpperCase() === 'PAID');
        const completedRuns = runs.filter(r => (r.status || '').toUpperCase() === 'COMPLETED');
        const totalRevenue = paidInvoices.reduce((s, i) => s + (i.amount ?? 0), 0);
        const totalExpenses = completedRuns.reduce((s, r) => s + (r.totalAmount ?? 0), 0);
        const netProfit = totalRevenue - totalExpenses;
        setFinancialMetrics({
          totalRevenue,
          revenueChange: 0,
          totalExpenses,
          expenseChange: 0,
          netProfit,
          profitMargin: totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 1000) / 10 : 0,
          cashFlow: netProfit,
          avgPaymentTime: 0,
        });

        // ── Transaction ledger ────────────────────────────────────────
        const revTxns = paidInvoices.map(i => ({
          id: i.id,
          date: i.paidDate?.split('T')[0] || i.createdAt?.split('T')[0] || '',
          type: 'income',
          category: 'Client Payment',
          description: `${i.invoiceNumber || i.id} — ${i.client?.user?.name || i.client?.company || 'Client'}`,
          amount: i.amount ?? 0,
        }));
        const expTxns = completedRuns.map(r => ({
          id: r.id,
          date: r.updatedAt?.split('T')[0] || r.createdAt?.split('T')[0] || '',
          type: 'expense',
          category: 'Payroll',
          description: `Payroll run ${r.periodStart?.split('T')[0] ?? ''} → ${r.periodEnd?.split('T')[0] ?? ''}`,
          amount: r.totalAmount ?? 0,
        }));
        const sorted = [...revTxns, ...expTxns]
          .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        // Compute running balance
        let balance = totalRevenue - totalExpenses;
        const withBalance = sorted.map(txn => {
          const row = { ...txn, balance };
          balance -= txn.type === 'income' ? txn.amount : -txn.amount;
          return row;
        });
        setAccountTransactions(withBalance);

        // ── Expenses by category ──────────────────────────────────────
        const payrollTotal = totalExpenses;
        setExpenseByCategory(
          payrollTotal > 0
            ? [{ category: 'Payroll', amount: payrollTotal, percentage: 100 }]
            : []
        );

        // ── Revenue by client ─────────────────────────────────────────
        const byClient: Record<string, { client: string; revenue: number; events: Set<string> }> = {};
        for (const inv of paidInvoices) {
          const name = inv.client?.user?.name || inv.client?.company || 'Unknown';
          if (!byClient[name]) byClient[name] = { client: name, revenue: 0, events: new Set() };
          byClient[name].revenue += inv.amount ?? 0;
          if (inv.eventId) byClient[name].events.add(inv.eventId);
        }
        setRevenueByClient(
          Object.values(byClient)
            .map(c => ({ client: c.client, revenue: c.revenue, events: c.events.size }))
            .sort((a, b) => b.revenue - a.revenue)
        );
      } catch {
        toast.error('Failed to load financial report data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleGenerateReport = (reportType: string) => {
    toast.success(`Generating ${reportType} report...`);
  };

  const handleExportData = () => {
    toast.success("Exporting financial data to CSV");
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl">Financial Reports & Analytics</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Admin
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Comprehensive financial reporting, analytics, and insights
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
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
              <InfoTooltip content="Total revenue for selected period" />
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
              <InfoTooltip content="Total expenses for selected period" />
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
              <InfoTooltip content="Revenue minus expenses" />
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
              <InfoTooltip content="Current available balance" />
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

      {/* Report Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:border-[#5E1916] transition-colors">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#5E1916]" />
              Profit & Loss Statement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Comprehensive P&L report for the selected period with detailed revenue and expense breakdown
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => handleGenerateReport('Profit & Loss')}
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-[#5E1916] transition-colors">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#5E1916]" />
              Revenue Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Detailed revenue breakdown by client, event type, and time period with trend analysis
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => handleGenerateReport('Revenue Analysis')}
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-[#5E1916] transition-colors">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-5 w-5 text-[#5E1916]" />
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Categorized expense analysis showing distribution and trends over time
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => handleGenerateReport('Expense Breakdown')}
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-[#5E1916] transition-colors">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-[#5E1916]" />
              Payroll Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Staff payment summary with tax calculations and year-to-date totals
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => handleGenerateReport('Payroll Summary')}
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-[#5E1916] transition-colors">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-5 w-5 text-[#5E1916]" />
              Tax Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Tax reports, compliance documents, and quarterly filings
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => handleGenerateReport('Tax Documents')}
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-[#5E1916] transition-colors">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#5E1916]" />
              Cash Flow Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Cash flow statement showing inflows, outflows, and balance forecasting
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => handleGenerateReport('Cash Flow')}
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Account Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Paid invoices and completed payroll runs</CardDescription>
        </CardHeader>

        <CardContent>
          {accountTransactions.length === 0 && !isLoading ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No completed transactions yet</p>
              <p className="text-sm text-muted-foreground mt-1">Paid invoices and completed payroll runs will appear here</p>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Running Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountTransactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {txn.date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={txn.type === 'income' ? 'default' : 'secondary'}
                      className={txn.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
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
                    className={txn.type === 'income' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}
                  >
                    {txn.type === 'income' ? '+' : '-'}${txn.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">${txn.balance.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Distribution of expenses across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseByCategory.length === 0 && !isLoading ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No expense data yet</p>
              </div>
            ) : (
            <div className="space-y-4">
              {expenseByCategory.map((item) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className="text-sm text-muted-foreground">
                      ${item.amount.toLocaleString()} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#5E1916] h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Client</CardTitle>
            <CardDescription>Top revenue-generating clients</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueByClient.length === 0 && !isLoading ? (
              <div className="text-center py-8">
                <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No paid invoices yet</p>
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenueByClient.map((client) => (
                  <TableRow key={client.client}>
                    <TableCell className="font-medium">{client.client}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{client.events} event{client.events !== 1 ? 's' : ''}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      ${client.revenue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
