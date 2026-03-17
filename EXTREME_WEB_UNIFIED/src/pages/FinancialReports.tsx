import { useState } from "react";
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

interface FinancialReportsProps {
  userRole: string;
  userId: string;
}

export function FinancialReports({ userRole, userId }: FinancialReportsProps) {
  const { setCurrentPage } = useNavigation();
  const [filterPeriod, setFilterPeriod] = useState("month");

  // Mock Financial Data
  const financialMetrics = {
    totalRevenue: 284750,
    revenueChange: 12.5,
    totalExpenses: 156420,
    expenseChange: -3.2,
    netProfit: 128330,
    profitMargin: 45.1,
    cashFlow: 86200,
    avgPaymentTime: 12.5
  };

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
    },
    {
      id: "TXN-005",
      date: "2024-10-07",
      type: "expense",
      category: "Operating Costs",
      description: "Office Supplies",
      amount: -280,
      balance: 89670
    },
    {
      id: "TXN-006",
      date: "2024-10-06",
      type: "income",
      category: "Client Payment",
      description: "INV-2024-083 - Wedding Event",
      amount: 3200,
      balance: 89950
    },
    {
      id: "TXN-007",
      date: "2024-10-05",
      type: "expense",
      category: "Marketing",
      description: "Social Media Advertising",
      amount: -750,
      balance: 86750
    },
    {
      id: "TXN-008",
      date: "2024-10-04",
      type: "expense",
      category: "Payroll",
      description: "Weekly Payroll - Sep 24-30",
      amount: -15840,
      balance: 87500
    }
  ];

  const expenseByCategory = [
    { category: "Payroll", amount: 123400, percentage: 78.9 },
    { category: "Operating Costs", amount: 18600, percentage: 11.9 },
    { category: "Marketing", amount: 8750, percentage: 5.6 },
    { category: "Equipment", amount: 3420, percentage: 2.2 },
    { category: "Other", amount: 2250, percentage: 1.4 }
  ];

  const revenueByClient = [
    { client: "TechCorp Inc", revenue: 45600, events: 12 },
    { client: "Corporate Events Ltd", revenue: 38400, events: 8 },
    { client: "Smith Foundation", revenue: 28900, events: 6 },
    { client: "Global Tech Summit", revenue: 24500, events: 5 },
    { client: "Wedding - Johnson", revenue: 18200, events: 4 }
  ];

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
          <CardDescription>View all financial transactions and ledger entries</CardDescription>
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
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {txn.date}
                    </div>
                  </TableCell>
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
                    className={txn.type === 'income' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}
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

      {/* Expense Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Distribution of expenses across categories</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Client</CardTitle>
            <CardDescription>Top revenue-generating clients</CardDescription>
          </CardHeader>
          <CardContent>
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
                      <Badge variant="outline">{client.events} events</Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      ${client.revenue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
