import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Checkbox } from "../components/ui/checkbox";
import {
  DollarSign,
  Download,
  FileText,
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  CreditCard,
  Building2,
  Plus,
  Send,
  FileCheck,
  Banknote,
  Receipt,
  Shield,
} from "lucide-react";

interface AdvancedPayrollProps {
  userRole: string;
  userId: string;
}

export function AdvancedPayroll({ userRole, userId }: AdvancedPayrollProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [showRunPayrollDialog, setShowRunPayrollDialog] = useState(false);

  // Payroll Periods
  const payrollPeriods = [
    { id: "PP-2025-02", period: "01/06/2025 - 01/12/2025", status: "current", processed: false, payDate: "2025-01-15" },
    { id: "PP-2025-01", period: "12/30/2024 - 01/05/2025", status: "processed", processed: true, payDate: "2025-01-08" },
    { id: "PP-2024-52", period: "12/23/2024 - 12/29/2024", status: "processed", processed: true, payDate: "2025-01-02" },
  ];

  // Current Payroll Run Data
  const currentPayrollRun = {
    periodId: "PP-2025-02",
    period: "01/06/2025 - 01/12/2025",
    payDate: "2025-01-15",
    totalEmployees: 42,
    regularHours: 1680,
    overtimeHours: 84,
    grossPay: 52450.00,
    federalTax: 7867.50,
    stateTax: 3147.00,
    socialSecurity: 3251.90,
    medicare: 760.53,
    otherDeductions: 850.00,
    netPay: 36573.07,
    employerTaxes: 4812.43,
    totalCost: 57262.43
  };

  // Employee Payroll Details
  const employeePayroll = [
    {
      id: "staff-1",
      name: "Emma Williams",
      type: "W-2",
      hoursWorked: 42.5,
      regularPay: 850.00,
      overtime: 42.50,
      bonus: 0,
      grossPay: 892.50,
      federalTax: 133.88,
      stateTax: 53.55,
      socialSecurity: 55.34,
      medicare: 12.94,
      netPay: 636.79,
      directDeposit: true,
      status: "ready"
    },
    {
      id: "staff-2",
      name: "James Rodriguez",
      type: "W-2",
      hoursWorked: 40.0,
      regularPay: 960.00,
      overtime: 0,
      bonus: 100.00,
      grossPay: 1060.00,
      federalTax: 159.00,
      stateTax: 63.60,
      socialSecurity: 65.72,
      medicare: 15.37,
      netPay: 756.31,
      directDeposit: true,
      status: "ready"
    },
    {
      id: "staff-3",
      name: "Sarah Martinez",
      type: "1099",
      hoursWorked: 35.0,
      regularPay: 875.00,
      overtime: 0,
      bonus: 0,
      grossPay: 875.00,
      federalTax: 0,
      stateTax: 0,
      socialSecurity: 0,
      medicare: 0,
      netPay: 875.00,
      directDeposit: true,
      status: "ready"
    },
  ];

  // Tax Forms & Filing
  const taxForms = [
    { form: "941", quarter: "Q4 2024", dueDate: "2025-01-31", status: "ready", amount: 12450.00 },
    { form: "940", year: "2024", dueDate: "2025-01-31", status: "filed", amount: 2340.00 },
    { form: "W-2", year: "2024", dueDate: "2025-01-31", status: "generated", count: 42 },
    { form: "1099-NEC", year: "2024", dueDate: "2025-01-31", status: "generated", count: 8 },
  ];

  // Direct Deposit Batches
  const directDepositBatches = [
    {
      id: "DD-2025-002",
      payDate: "2025-01-15",
      employees: 42,
      totalAmount: 36573.07,
      status: "scheduled",
      processDate: "2025-01-14"
    },
    {
      id: "DD-2025-001",
      payDate: "2025-01-08",
      employees: 40,
      totalAmount: 34125.50,
      status: "completed",
      processDate: "2025-01-07"
    },
  ];

  // Payroll Summary Stats
  const payrollStats = {
    currentPeriodGross: 52450.00,
    currentPeriodNet: 36573.07,
    ytdGross: 52450.00,
    ytdTaxes: 15876.93,
    avgHourlyRate: 24.50,
    totalEmployees: 42
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900">Advanced Payroll System</h1>
          <p className="text-slate-600">Complete payroll processing with tax filing and direct deposit</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showRunPayrollDialog} onOpenChange={setShowRunPayrollDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-sangria hover:bg-merlot">
                <Calculator className="w-4 h-4" />
                Run Payroll
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Run Payroll - Period {currentPayrollRun.period}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Payroll Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-slate-600 mb-1">Total Employees</div>
                      <div className="text-2xl font-semibold">{currentPayrollRun.totalEmployees}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-slate-600 mb-1">Gross Pay</div>
                      <div className="text-2xl font-semibold text-green-600">${currentPayrollRun.grossPay.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-slate-600 mb-1">Net Pay</div>
                      <div className="text-2xl font-semibold text-blue-600">${currentPayrollRun.netPay.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tax Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tax Withholdings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Federal Income Tax</span>
                      <span className="text-sm font-semibold">${currentPayrollRun.federalTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">State Income Tax</span>
                      <span className="text-sm font-semibold">${currentPayrollRun.stateTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Social Security</span>
                      <span className="text-sm font-semibold">${currentPayrollRun.socialSecurity.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Medicare</span>
                      <span className="text-sm font-semibold">${currentPayrollRun.medicare.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Other Deductions</span>
                      <span className="text-sm font-semibold">${currentPayrollRun.otherDeductions.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between">
                      <span className="font-semibold text-slate-900">Total Deductions</span>
                      <span className="font-semibold text-red-600">${(currentPayrollRun.grossPay - currentPayrollRun.netPay).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Employer Costs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Employer Costs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Employee Gross Pay</span>
                      <span className="text-sm font-semibold">${currentPayrollRun.grossPay.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Employer Payroll Taxes</span>
                      <span className="text-sm font-semibold">${currentPayrollRun.employerTaxes.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between">
                      <span className="font-semibold text-slate-900">Total Payroll Cost</span>
                      <span className="font-semibold text-purple-600">${currentPayrollRun.totalCost.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Pay Date */}
                <div className="space-y-2">
                  <Label>Pay Date</Label>
                  <Input type="date" value={currentPayrollRun.payDate} />
                </div>

                {/* Checklist */}
                <div className="space-y-2">
                  <Label>Pre-Process Checklist</Label>
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox id="verify-hours" defaultChecked />
                        <label htmlFor="verify-hours" className="text-sm">All hours verified and approved</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="verify-bank" defaultChecked />
                        <label htmlFor="verify-bank" className="text-sm">Bank account funded</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="verify-tax" defaultChecked />
                        <label htmlFor="verify-tax" className="text-sm">Tax tables up to date</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="verify-direct" defaultChecked />
                        <label htmlFor="verify-direct" className="text-sm">Direct deposit info verified</label>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRunPayrollDialog(false)}>Cancel</Button>
                <Button variant="outline">Save as Draft</Button>
                <Button className="bg-sangria hover:bg-merlot gap-2">
                  <Send className="w-4 h-4" />
                  Process Payroll
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Current Period Gross</span>
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-semibold text-slate-900">${payrollStats.currentPeriodGross.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">Pay Date: Jan 15, 2025</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Current Period Net</span>
              <Banknote className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-semibold text-slate-900">${payrollStats.currentPeriodNet.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">After all deductions</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">YTD Taxes Withheld</span>
              <Receipt className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-semibold text-slate-900">${payrollStats.ytdTaxes.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">Federal + State + FICA</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Active Employees</span>
              <Users className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-semibold text-slate-900">{payrollStats.totalEmployees}</div>
            <div className="text-xs text-slate-500 mt-1">Avg: ${payrollStats.avgHourlyRate}/hr</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="current-run" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current-run">Current Payroll Run</TabsTrigger>
          <TabsTrigger value="history">Payroll History</TabsTrigger>
          <TabsTrigger value="tax-filing">Tax Filing & Forms</TabsTrigger>
          <TabsTrigger value="direct-deposit">Direct Deposit</TabsTrigger>
          <TabsTrigger value="reports">Payroll Reports</TabsTrigger>
        </TabsList>

        {/* Current Payroll Run */}
        <TabsContent value="current-run" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payroll Period: {currentPayrollRun.period}</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">Pay Date: {new Date(currentPayrollRun.payDate).toLocaleDateString()}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Employee Payroll Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-slate-700">Employee</th>
                        <th className="text-center p-3 text-sm font-medium text-slate-700">Type</th>
                        <th className="text-right p-3 text-sm font-medium text-slate-700">Hours</th>
                        <th className="text-right p-3 text-sm font-medium text-slate-700">Regular Pay</th>
                        <th className="text-right p-3 text-sm font-medium text-slate-700">OT/Bonus</th>
                        <th className="text-right p-3 text-sm font-medium text-slate-700">Gross Pay</th>
                        <th className="text-right p-3 text-sm font-medium text-slate-700">Taxes</th>
                        <th className="text-right p-3 text-sm font-medium text-slate-700">Net Pay</th>
                        <th className="text-center p-3 text-sm font-medium text-slate-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeePayroll.map((emp) => {
                        const totalTaxes = emp.federalTax + emp.stateTax + emp.socialSecurity + emp.medicare;
                        return (
                          <tr key={emp.id} className="border-b hover:bg-slate-50">
                            <td className="p-3 text-sm text-slate-900">{emp.name}</td>
                            <td className="p-3 text-center">
                              <Badge variant="outline" className={emp.type === 'W-2' ? 'border-blue-200 text-blue-700' : 'border-green-200 text-green-700'}>
                                {emp.type}
                              </Badge>
                            </td>
                            <td className="p-3 text-sm text-right text-slate-900">{emp.hoursWorked}</td>
                            <td className="p-3 text-sm text-right text-slate-900">${emp.regularPay.toFixed(2)}</td>
                            <td className="p-3 text-sm text-right text-slate-900">${(emp.overtime + emp.bonus).toFixed(2)}</td>
                            <td className="p-3 text-sm text-right text-slate-900 font-semibold">${emp.grossPay.toFixed(2)}</td>
                            <td className="p-3 text-sm text-right text-red-600">${totalTaxes.toFixed(2)}</td>
                            <td className="p-3 text-sm text-right text-green-600 font-semibold">${emp.netPay.toFixed(2)}</td>
                            <td className="p-3 text-center">
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Ready
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Payroll Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-slate-600 mb-2">Total Hours</div>
                      <div className="text-xl font-semibold">{currentPayrollRun.regularHours + currentPayrollRun.overtimeHours}</div>
                      <div className="text-xs text-slate-500">Regular: {currentPayrollRun.regularHours} | OT: {currentPayrollRun.overtimeHours}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-slate-600 mb-2">Total Gross Pay</div>
                      <div className="text-xl font-semibold text-green-600">${currentPayrollRun.grossPay.toLocaleString()}</div>
                      <div className="text-xs text-slate-500">Before taxes & deductions</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-slate-600 mb-2">Total Net Pay</div>
                      <div className="text-xl font-semibold text-blue-600">${currentPayrollRun.netPay.toLocaleString()}</div>
                      <div className="text-xs text-slate-500">To be deposited</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll History */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Period ID</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Pay Period</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Pay Date</th>
                      <th className="text-center p-3 text-sm font-medium text-slate-700">Status</th>
                      <th className="text-center p-3 text-sm font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollPeriods.map((period) => (
                      <tr key={period.id} className="border-b hover:bg-slate-50">
                        <td className="p-3 text-sm text-slate-900 font-mono">{period.id}</td>
                        <td className="p-3 text-sm text-slate-900">{period.period}</td>
                        <td className="p-3 text-sm text-slate-900">{new Date(period.payDate).toLocaleDateString()}</td>
                        <td className="p-3 text-center">
                          <Badge className={period.processed ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                            {period.processed ? 'Processed' : 'Current'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" className="h-8 gap-1">
                              <FileText className="w-4 h-4" />
                              View
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 gap-1">
                              <Download className="w-4 h-4" />
                              Export
                            </Button>
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

        {/* Tax Filing & Forms */}
        <TabsContent value="tax-filing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Forms & Filing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Upcoming Deadlines */}
                <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-orange-900">Tax Filing Deadlines Approaching</div>
                      <div className="text-sm text-orange-700 mt-1">Form 941 and annual W-2/1099 forms due January 31, 2025</div>
                    </div>
                  </div>
                </div>

                {/* Tax Forms Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-slate-700">Form</th>
                        <th className="text-left p-3 text-sm font-medium text-slate-700">Period</th>
                        <th className="text-left p-3 text-sm font-medium text-slate-700">Due Date</th>
                        <th className="text-right p-3 text-sm font-medium text-slate-700">Amount/Count</th>
                        <th className="text-center p-3 text-sm font-medium text-slate-700">Status</th>
                        <th className="text-center p-3 text-sm font-medium text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxForms.map((form, index) => (
                        <tr key={index} className="border-b hover:bg-slate-50">
                          <td className="p-3 text-sm text-slate-900 font-semibold">{form.form}</td>
                          <td className="p-3 text-sm text-slate-900">{form.quarter || form.year}</td>
                          <td className="p-3 text-sm text-slate-900">{new Date(form.dueDate).toLocaleDateString()}</td>
                          <td className="p-3 text-sm text-right text-slate-900">
                            {form.amount ? `$${form.amount.toLocaleString()}` : `${form.count} forms`}
                          </td>
                          <td className="p-3 text-center">
                            <Badge className={
                              form.status === 'filed' ? 'bg-green-100 text-green-700' :
                              form.status === 'generated' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }>
                              {form.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-1">
                              {form.status === 'ready' && (
                                <Button size="sm" className="bg-sangria hover:bg-merlot gap-1">
                                  <Send className="w-3 h-3" />
                                  E-File
                                </Button>
                              )}
                              {form.status === 'generated' && (
                                <Button size="sm" variant="outline" className="gap-1">
                                  <Download className="w-3 h-3" />
                                  Download
                                </Button>
                              )}
                              {form.status === 'filed' && (
                                <Button size="sm" variant="ghost" className="gap-1">
                                  <FileCheck className="w-3 h-3" />
                                  View
                                </Button>
                              )}
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

        {/* Direct Deposit */}
        <TabsContent value="direct-deposit" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Direct Deposit Batches</CardTitle>
                <Button variant="outline" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  Bank Settings
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {directDepositBatches.map((batch) => (
                  <Card key={batch.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="font-semibold text-slate-900">{batch.id}</div>
                          <div className="text-sm text-slate-600">Pay Date: {new Date(batch.payDate).toLocaleDateString()}</div>
                        </div>
                        <Badge className={batch.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                          {batch.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-slate-600">Employees</div>
                          <div className="font-semibold">{batch.employees}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600">Total Amount</div>
                          <div className="font-semibold text-green-600">${batch.totalAmount.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600">Process Date</div>
                          <div className="font-semibold">{new Date(batch.processDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="gap-2">
                          <FileText className="w-4 h-4" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="w-4 h-4" />
                          Export ACH
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Reports */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <FileText className="w-8 h-8 text-sangria mb-3" />
                <div className="font-semibold text-slate-900 mb-1">Payroll Register</div>
                <div className="text-sm text-slate-600 mb-4">Complete payroll detail by period</div>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Generate
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Receipt className="w-8 h-8 text-sangria mb-3" />
                <div className="font-semibold text-slate-900 mb-1">Tax Liability Report</div>
                <div className="text-sm text-slate-600 mb-4">Federal and state tax summary</div>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Generate
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Calculator className="w-8 h-8 text-sangria mb-3" />
                <div className="font-semibold text-slate-900 mb-1">Labor Cost Analysis</div>
                <div className="text-sm text-slate-600 mb-4">Detailed cost breakdown</div>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Generate
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
