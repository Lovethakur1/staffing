import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  FileText,
  Download,
  Upload,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Users,
  MapPin,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface FinancialManagementProps {
  userRole: string;
  userId: string;
}

interface EventFinancial {
  id: string;
  eventName: string;
  client: string;
  date: string;
  venue: string;
  totalCost: number;
  deposit: number;
  depositPaid: number;
  balance: number;
  staffCost: number;
  expenses: number;
  tips: number;
  profit: number;
  status: 'draft' | 'deposit-pending' | 'deposit-paid' | 'balance-pending' | 'paid' | 'overdue';
}

interface Expense {
  id: string;
  eventId: string;
  eventName: string;
  category: string;
  description: string;
  amount: number;
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  receipt?: string;
}

interface Tip {
  id: string;
  eventId: string;
  eventName: string;
  staffId: string;
  staffName: string;
  amount: number;
  paidBy: string;
  method: 'cash' | 'card' | 'app';
  date: string;
}

export function FinancialManagement({ userRole, userId }: FinancialManagementProps) {
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showTipDialog, setShowTipDialog] = useState(false);
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventFinancial | null>(null);

  const [expenseForm, setExpenseForm] = useState({
    eventId: "",
    category: "",
    description: "",
    amount: ""
  });

  const [tipForm, setTipForm] = useState({
    eventId: "",
    staffId: "",
    amount: "",
    method: "cash"
  });

  // Mock event financials
  const eventFinancials: EventFinancial[] = [
    {
      id: "evt-001",
      eventName: "Corporate Gala - Tech Summit 2025",
      client: "Innovate Corp",
      date: "2025-10-10",
      venue: "Grand Ballroom",
      totalCost: 12500,
      deposit: 5000,
      depositPaid: 5000,
      balance: 7500,
      staffCost: 8400,
      expenses: 2100,
      tips: 600,
      profit: 2000,
      status: "deposit-paid"
    },
    {
      id: "evt-002",
      eventName: "Wedding Reception - Johnson & Smith",
      client: "Emily Johnson",
      date: "2025-10-10",
      venue: "Riverside Gardens",
      totalCost: 8500,
      deposit: 3000,
      depositPaid: 0,
      balance: 8500,
      staffCost: 5600,
      expenses: 1200,
      tips: 400,
      profit: 1300,
      status: "deposit-pending"
    },
    {
      id: "evt-003",
      eventName: "Product Launch - XYZ Innovation",
      client: "XYZ Technologies",
      date: "2025-10-11",
      venue: "Convention Center",
      totalCost: 15000,
      deposit: 6000,
      depositPaid: 6000,
      balance: 0,
      staffCost: 9800,
      expenses: 2500,
      tips: 800,
      profit: 1900,
      status: "paid"
    }
  ];

  // Mock expenses
  const expenses: Expense[] = [
    {
      id: "exp-001",
      eventId: "evt-001",
      eventName: "Corporate Gala",
      category: "Equipment Rental",
      description: "Additional sound system rental",
      amount: 850,
      submittedBy: "Sarah Mitchell",
      submittedAt: "2025-10-09T14:30:00",
      status: "approved",
      approvedBy: "Admin Team",
      approvedAt: "2025-10-09T15:00:00"
    },
    {
      id: "exp-002",
      eventId: "evt-001",
      eventName: "Corporate Gala",
      category: "Transportation",
      description: "Staff transportation to venue",
      amount: 450,
      submittedBy: "Sarah Mitchell",
      submittedAt: "2025-10-10T08:00:00",
      status: "pending"
    },
    {
      id: "exp-003",
      eventId: "evt-002",
      eventName: "Wedding Reception",
      category: "Supplies",
      description: "Emergency supply run - linens",
      amount: 320,
      submittedBy: "Michael Johnson",
      submittedAt: "2025-10-10T16:20:00",
      status: "approved",
      approvedBy: "Admin Team",
      approvedAt: "2025-10-10T16:45:00"
    }
  ];

  // Mock tips
  const tips: Tip[] = [
    {
      id: "tip-001",
      eventId: "evt-001",
      eventName: "Corporate Gala",
      staffId: "staff-001",
      staffName: "Emma Williams",
      amount: 150,
      paidBy: "Innovate Corp",
      method: "card",
      date: "2025-10-10"
    },
    {
      id: "tip-002",
      eventId: "evt-001",
      eventName: "Corporate Gala",
      staffId: "staff-002",
      staffName: "James Rodriguez",
      amount: 200,
      paidBy: "Innovate Corp",
      method: "card",
      date: "2025-10-10"
    },
    {
      id: "tip-003",
      eventId: "evt-002",
      eventName: "Wedding Reception",
      staffId: "staff-003",
      staffName: "Maria Garcia",
      amount: 100,
      paidBy: "Emily Johnson",
      method: "cash",
      date: "2025-10-10"
    }
  ];

  const totalRevenue = eventFinancials.reduce((sum, e) => sum + e.totalCost, 0);
  const totalProfit = eventFinancials.reduce((sum, e) => sum + e.profit, 0);
  const pendingDeposits = eventFinancials.filter(e => e.status === 'deposit-pending').length;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'deposit-paid':
        return <Badge className="bg-blue-100 text-blue-700"><Clock className="h-3 w-3 mr-1" />Deposit Paid</Badge>;
      case 'deposit-pending':
        return <Badge className="bg-yellow-100 text-yellow-700"><AlertCircle className="h-3 w-3 mr-1" />Deposit Pending</Badge>;
      case 'balance-pending':
        return <Badge className="bg-orange-100 text-orange-700"><Clock className="h-3 w-3 mr-1" />Balance Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-700"><AlertTriangle className="h-3 w-3 mr-1" />Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getExpenseStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const submitExpense = () => {
    if (!expenseForm.eventId || !expenseForm.category || !expenseForm.amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Expense submitted for approval!");
    setExpenseForm({ eventId: "", category: "", description: "", amount: "" });
    setShowExpenseDialog(false);
  };

  const submitTip = () => {
    if (!tipForm.eventId || !tipForm.staffId || !tipForm.amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Tip recorded successfully!");
    setTipForm({ eventId: "", staffId: "", amount: "", method: "cash" });
    setShowTipDialog(false);
  };

  const recordDeposit = () => {
    toast.success("Deposit payment recorded!");
    setShowDepositDialog(false);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Financial Management</h1>
          <p className="text-muted-foreground">
            Complete financial tracking for events, expenses, and payments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowExpenseDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
          <Button onClick={() => setShowTipDialog(true)}>
            <DollarSign className="h-4 w-4 mr-2" />
            Record Tip
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-success flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">After all expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deposits</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingDeposits}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">All approved expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deposits">Deposits & Payments</TabsTrigger>
          <TabsTrigger value="expenses">
            Expenses
            {expenses.filter(e => e.status === 'pending').length > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-white">
                {expenses.filter(e => e.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="tips">Tips & Gratuities</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Deposit</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventFinancials.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{event.eventName}</p>
                          <p className="text-sm text-muted-foreground">{event.client}</p>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-semibold">${event.totalCost.toLocaleString()}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">${event.depositPaid.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">of ${event.deposit.toLocaleString()}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">${event.balance.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => toast.info("Downloading invoice...")}>
                            <Download className="h-4 w-4" />
                          </Button>
                          {event.status === 'deposit-pending' && (
                            <Button size="sm" onClick={() => {
                              setSelectedEvent(event);
                              setShowDepositDialog(true);
                            }}>
                              Record Payment
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

        {/* Deposits & Payments Tab */}
        <TabsContent value="deposits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deposit Tracking</CardTitle>
              <p className="text-sm text-muted-foreground">
                Monitor client deposits and balance payments
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventFinancials.map((event) => (
                  <div key={event.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{event.eventName}</h3>
                        <p className="text-sm text-muted-foreground">{event.client}</p>
                      </div>
                      {getStatusBadge(event.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Amount</p>
                        <p className="font-semibold text-lg">${event.totalCost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Deposit Required</p>
                        <p className="font-semibold text-lg">${event.deposit.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Deposit Paid</p>
                        <p className="font-semibold text-lg text-green-600">${event.depositPaid.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Balance Due</p>
                        <p className="font-semibold text-lg text-orange-600">${event.balance.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2">Payment Progress</p>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${(event.depositPaid / event.totalCost) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round((event.depositPaid / event.totalCost) * 100)}% paid
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Event Expenses</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track and approve event-related expenses
                  </p>
                </div>
                <Button onClick={() => setShowExpenseDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.eventName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell className="font-semibold">${expense.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{expense.submittedBy}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(expense.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getExpenseStatusBadge(expense.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {expense.status === 'pending' && userRole === 'admin' && (
                            <>
                              <Button size="sm" onClick={() => toast.success("Expense approved!")}>
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => toast.error("Expense rejected")}>
                                Reject
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => toast.info("Viewing receipt...")}>
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tips Tab */}
        <TabsContent value="tips" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tips & Gratuities</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track tips paid to staff members
                  </p>
                </div>
                <Button onClick={() => setShowTipDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Tip
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid By</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tips.map((tip) => (
                    <TableRow key={tip.id}>
                      <TableCell className="font-medium">{tip.eventName}</TableCell>
                      <TableCell>{tip.staffName}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ${tip.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{tip.paidBy}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{tip.method}</Badge>
                      </TableCell>
                      <TableCell>{new Date(tip.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Total Tips Distributed</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${tips.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profitability Tab */}
        <TabsContent value="profitability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Profitability Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventFinancials.map((event) => (
                  <div key={event.id} className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg mb-4">{event.eventName}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="font-semibold text-lg">${event.totalCost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Staff Cost</p>
                        <p className="font-semibold text-lg text-red-600">-${event.staffCost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expenses</p>
                        <p className="font-semibold text-lg text-red-600">-${event.expenses.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tips Paid</p>
                        <p className="font-semibold text-lg text-red-600">-${event.tips.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Net Profit</p>
                        <p className={`font-semibold text-lg ${event.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${event.profit.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Profit Margin</span>
                        <span className="font-medium">
                          {Math.round((event.profit / event.totalCost) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${event.profit > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(Math.abs((event.profit / event.totalCost) * 100), 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Expense Dialog */}
      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Event Expense</DialogTitle>
            <DialogDescription>
              Submit an expense for manager approval
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Event *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={expenseForm.eventId}
                onChange={(e) => setExpenseForm({...expenseForm, eventId: e.target.value})}
              >
                <option value="">Select event...</option>
                {eventFinancials.map((event) => (
                  <option key={event.id} value={event.id}>{event.eventName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
              >
                <option value="">Select category...</option>
                <option value="Equipment Rental">Equipment Rental</option>
                <option value="Transportation">Transportation</option>
                <option value="Supplies">Supplies</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Decorations">Decorations</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                placeholder="Describe the expense..."
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Receipt (Optional)</Label>
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Receipt
              </Button>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowExpenseDialog(false)}>Cancel</Button>
              <Button onClick={submitExpense}>Submit Expense</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Tip Dialog */}
      <Dialog open={showTipDialog} onOpenChange={setShowTipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Staff Tip</DialogTitle>
            <DialogDescription>
              Log tips paid to staff members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Event *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={tipForm.eventId}
                onChange={(e) => setTipForm({...tipForm, eventId: e.target.value})}
              >
                <option value="">Select event...</option>
                {eventFinancials.map((event) => (
                  <option key={event.id} value={event.id}>{event.eventName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Staff Member *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={tipForm.staffId}
                onChange={(e) => setTipForm({...tipForm, staffId: e.target.value})}
              >
                <option value="">Select staff member...</option>
                <option value="staff-001">Emma Williams</option>
                <option value="staff-002">James Rodriguez</option>
                <option value="staff-003">Maria Garcia</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Tip Amount *</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={tipForm.amount}
                onChange={(e) => setTipForm({...tipForm, amount: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={tipForm.method}
                onChange={(e) => setTipForm({...tipForm, method: e.target.value})}
              >
                <option value="cash">Cash</option>
                <option value="card">Credit/Debit Card</option>
                <option value="app">Mobile App</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowTipDialog(false)}>Cancel</Button>
              <Button onClick={submitTip}>
                <DollarSign className="h-4 w-4 mr-2" />
                Record Tip
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deposit Payment Dialog */}
      <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Deposit Payment</DialogTitle>
            <DialogDescription>
              {selectedEvent?.eventName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Deposit Required</p>
                  <p className="font-semibold text-lg">${selectedEvent?.deposit.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount Received</p>
                  <Input type="number" placeholder="0.00" className="mt-1" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                <option value="card">Credit/Debit Card</option>
                <option value="bank">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="cash">Cash</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Transaction Reference</Label>
              <Input placeholder="Transaction ID or check number" />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDepositDialog(false)}>Cancel</Button>
              <Button onClick={recordDeposit}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}