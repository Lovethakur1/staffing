import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { ArrowLeft, Download, TrendingUp, CheckCircle2 } from "lucide-react";

interface FinancialManagementGuideProps {
  onNavigate: (page: string) => void;
  userRole: string;
}

export function FinancialManagementGuide({ onNavigate }: FinancialManagementGuideProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'Financial-Management-Guide.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => onNavigate('documentation')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="outline">Financial</Badge>
            </div>
            <h1 className="text-[#5E1916]">Financial Management Guide</h1>
            <p className="text-muted-foreground">
              Complete financial management and reporting guide
            </p>
          </div>
        </div>
        <Button onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Meta Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Pages:</span>
              <span className="ml-2 font-semibold">22</span>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="ml-2 font-semibold">November 11, 2024</span>
            </div>
            <div>
              <span className="text-muted-foreground">Reading Time:</span>
              <span className="ml-2 font-semibold">~50 minutes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table of Contents */}
      <Card>
        <CardHeader>
          <CardTitle>Table of Contents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <a href="#overview" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">1. Financial Hub Overview</a>
            <a href="#invoicing" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">2. Invoicing & Billing</a>
            <a href="#payments" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">3. Payment Processing</a>
            <a href="#reports" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">4. Financial Reports</a>
            <a href="#budgets" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">5. Budget Management</a>
            <a href="#tax" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">6. Tax & Compliance</a>
          </div>
        </CardContent>
      </Card>

      <Card id="overview">
        <CardHeader>
          <CardTitle>1. Financial Hub Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            The Financial Hub is the centralized command center for all financial operations. It replaces the need for external accounting software like QuickBooks or Xero.
          </p>
          <ul className="space-y-2 ml-6">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div><strong>Revenue Dashboard:</strong> Real-time revenue tracking with visual charts and trend analysis</div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div><strong>Expense Tracking:</strong> Monitor payroll costs, vendor payments, and operational expenses</div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div><strong>Profit Analysis:</strong> Event-level and overall profit/loss tracking with margin calculations</div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div><strong>Cash Flow:</strong> Projected cash flow based on outstanding invoices and scheduled payroll</div>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card id="invoicing">
        <CardHeader>
          <CardTitle>2. Invoicing & Billing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Creating Invoices</h5>
              <p className="text-sm text-muted-foreground">Generate invoices from completed events with automatic line items based on hours worked, staff rates, and additional fees.</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Invoice Templates</h5>
              <p className="text-sm text-muted-foreground">Customize invoice templates with your company branding, payment terms (NET30, NET60), and tax configurations.</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Payment Tracking</h5>
              <p className="text-sm text-muted-foreground">Track invoice statuses (Draft, Sent, Paid, Overdue, Cancelled) with automated reminder emails for overdue payments.</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Deposits & Partial Payments</h5>
              <p className="text-sm text-muted-foreground">Accept deposits upfront and record partial payments against invoices with automatic balance calculations.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="payments">
        <CardHeader>
          <CardTitle>3. Payment Processing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Accept and process payments through integrated payment gateways:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Online Payments</h5>
              <p className="text-sm text-muted-foreground">Stripe integration for credit/debit card payments directly from invoices.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Payment Verification</h5>
              <p className="text-sm text-muted-foreground">Manual payment verification for check, wire transfer, and ACH payments with receipt uploads.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Refunds</h5>
              <p className="text-sm text-muted-foreground">Process full or partial refunds with audit trail documentation.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Credit Limits</h5>
              <p className="text-sm text-muted-foreground">Set and manage client credit limits to control exposure and financial risk.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="reports">
        <CardHeader>
          <CardTitle>4. Financial Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Generate comprehensive financial reports for business insights:</p>
          <div className="space-y-3">
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Revenue Reports</h5>
              <p className="text-sm">Detailed revenue breakdowns by client, event type, time period, and service category.</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Payroll Reports</h5>
              <p className="text-sm">Staff payment summaries, tax withholding reports, and workers' compensation calculations.</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Profit & Loss</h5>
              <p className="text-sm">P&L statements per event, per client, or across the entire business for any date range.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="budgets">
        <CardHeader>
          <CardTitle>5. Budget Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Event Budgets</strong>
                <p className="text-sm text-muted-foreground">Set budgets per event and track actual spending against projections in real-time.</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Cost Alerts</strong>
                <p className="text-sm text-muted-foreground">Receive alerts when event costs approach or exceed budget thresholds.</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Pricing Configuration</strong>
                <p className="text-sm text-muted-foreground">Configure tier rates, multiplier rules, and travel fees to ensure consistent and profitable pricing.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="tax">
        <CardHeader>
          <CardTitle>6. Tax & Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Stay compliant with financial regulations:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Tax Calculations</h5>
              <p className="text-sm text-muted-foreground">Automatic tax rate application on invoices with configurable rates per jurisdiction.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Workers' Compensation</h5>
              <p className="text-sm text-muted-foreground">Automatic workers' comp rate calculations and deductions in payroll processing.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Tax Forms</h5>
              <p className="text-sm text-muted-foreground">Track W-4 and W-9 forms for all staff, with automated reminders for missing documentation.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Audit Trail</h5>
              <p className="text-sm text-muted-foreground">Complete audit trail for all financial transactions with timestamped records.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold mb-1">Need this guide offline?</h4>
              <p className="text-sm text-muted-foreground">Download the complete PDF version for easy reference</p>
            </div>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
