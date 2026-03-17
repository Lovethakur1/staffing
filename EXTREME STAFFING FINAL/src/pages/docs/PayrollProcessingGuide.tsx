import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { ArrowLeft, Download, DollarSign, CheckCircle2, AlertTriangle } from "lucide-react";

interface PayrollProcessingGuideProps {
  onNavigate: (page: string) => void;
  userRole: string;
}

export function PayrollProcessingGuide({ onNavigate }: PayrollProcessingGuideProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'Payroll-Processing-Guide.pdf';
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
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="outline">Financial</Badge>
            </div>
            <h1 className="text-[#5E1916]">Payroll Processing Guide</h1>
            <p className="text-muted-foreground">
              Step-by-step guide to payroll processing and management
            </p>
          </div>
        </div>
        <Button onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Security Warning */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">Admin Access Only</h4>
              <p className="text-sm text-amber-800">
                All payroll and financial information is restricted to admin access only. Managers and staff cannot view any financial data to ensure security and compliance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meta Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Pages:</span>
              <span className="ml-2 font-semibold">16</span>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="ml-2 font-semibold">November 9, 2024</span>
            </div>
            <div>
              <span className="text-muted-foreground">Reading Time:</span>
              <span className="ml-2 font-semibold">~40 minutes</span>
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
            <a href="#overview" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">
              1. Payroll System Overview
            </a>
            <a href="#minimum-pay" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">
              2. 5-Hour Minimum Pay Rule
            </a>
            <a href="#calculations" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">
              3. Automated Payroll Calculations
            </a>
            <a href="#processing" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">
              4. Processing Payroll
            </a>
            <a href="#compliance" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">
              5. Tax Compliance and Reporting
            </a>
            <a href="#troubleshooting" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">
              6. Troubleshooting Common Issues
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Content Sections */}
      <Card id="overview">
        <CardHeader>
          <CardTitle>1. Payroll System Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Extreme Staffing replaces external payroll software like ADP and Gusto with an integrated payroll system that automates calculations and ensures compliance.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <h5 className="font-semibold mb-2">Key Features</h5>
            <ul className="space-y-2 ml-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <span>Automated calculation of regular hours, overtime, and special rates</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <span>5-hour minimum pay rule automatically applied</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <span>Tax withholding and compliance management</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <span>Direct deposit and payment processing integration</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <span>Comprehensive reporting and audit trails</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card id="minimum-pay">
        <CardHeader>
          <CardTitle>2. 5-Hour Minimum Pay Rule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
            <h5 className="font-semibold mb-2 text-primary">Understanding the 5-Hour Minimum</h5>
            <p className="text-sm mb-3">
              All staff members are guaranteed a minimum of 5 hours of pay for any event assignment, regardless of the actual hours worked. This is a fundamental business rule in Extreme Staffing.
            </p>
          </div>

          <h4 className="font-semibold mt-6">How It Works</h4>
          <div className="space-y-3">
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Scenario 1: Event Shorter Than 5 Hours</h5>
              <p className="text-sm text-muted-foreground mb-2">
                If a staff member works 3 hours at an event:
              </p>
              <div className="bg-muted p-3 rounded text-sm">
                <p>Actual hours worked: 3 hours</p>
                <p>Pay calculated for: 5 hours (minimum)</p>
                <p>Staff member receives: 5 hours × hourly rate</p>
              </div>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Scenario 2: Event Longer Than 5 Hours</h5>
              <p className="text-sm text-muted-foreground mb-2">
                If a staff member works 8 hours at an event:
              </p>
              <div className="bg-muted p-3 rounded text-sm">
                <p>Actual hours worked: 8 hours</p>
                <p>Pay calculated for: 8 hours (actual)</p>
                <p>Staff member receives: 8 hours × hourly rate</p>
              </div>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Scenario 3: Multiple Events in One Day</h5>
              <p className="text-sm text-muted-foreground mb-2">
                Each event is calculated separately:
              </p>
              <div className="bg-muted p-3 rounded text-sm">
                <p>Event 1: 2 hours worked → paid for 5 hours</p>
                <p>Event 2: 3 hours worked → paid for 5 hours</p>
                <p>Total pay: 10 hours (5 + 5)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="calculations">
        <CardHeader>
          <CardTitle>3. Automated Payroll Calculations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            The system automatically handles complex payroll calculations including regular hours, overtime, and special circumstances.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Regular Hours</h5>
              <p className="text-sm text-muted-foreground">
                Standard hourly rate applied to all hours up to 8 hours per day or 40 hours per week, with the 5-hour minimum enforced per event.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Overtime Calculation</h5>
              <p className="text-sm text-muted-foreground">
                1.5× regular rate for hours exceeding 8 per day or 40 per week. 2× rate for hours exceeding 12 per day.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Holiday Pay</h5>
              <p className="text-sm text-muted-foreground">
                Special rates can be configured for holiday events with automatic application to eligible staff.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Role-Based Rates</h5>
              <p className="text-sm text-muted-foreground">
                Different roles (servers, bartenders, managers) can have different pay rates automatically applied.
              </p>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h5 className="font-semibold mb-2">Calculation Priority</h5>
            <ol className="text-sm space-y-1 ml-6">
              <li>1. Apply 5-hour minimum per event</li>
              <li>2. Calculate regular hours vs overtime hours</li>
              <li>3. Apply role-based rates</li>
              <li>4. Add any bonuses or adjustments</li>
              <li>5. Calculate tax withholdings</li>
              <li>6. Determine net pay</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card id="processing">
        <CardHeader>
          <CardTitle>4. Processing Payroll</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h4 className="font-semibold">Weekly Payroll Processing Steps</h4>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                1
              </div>
              <div className="flex-1">
                <h5 className="font-semibold mb-1">Review Timesheets</h5>
                <p className="text-sm text-muted-foreground">
                  Navigate to Payroll → Timesheet Review. Review all submitted timesheets for the pay period, verify geo-location data, and approve or request corrections.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                2
              </div>
              <div className="flex-1">
                <h5 className="font-semibold mb-1">Run Payroll Calculations</h5>
                <p className="text-sm text-muted-foreground">
                  Click "Calculate Payroll" to process all approved timesheets. The system will automatically apply the 5-hour minimum, calculate overtime, and determine gross pay for each employee.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                3
              </div>
              <div className="flex-1">
                <h5 className="font-semibold mb-1">Review Payroll Summary</h5>
                <p className="text-sm text-muted-foreground">
                  Review the payroll summary report showing total gross pay, tax withholdings, deductions, and net pay. Verify all calculations are correct.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                4
              </div>
              <div className="flex-1">
                <h5 className="font-semibold mb-1">Make Adjustments</h5>
                <p className="text-sm text-muted-foreground">
                  If needed, add bonuses, commissions, or other adjustments before finalizing payroll.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                5
              </div>
              <div className="flex-1">
                <h5 className="font-semibold mb-1">Approve and Process</h5>
                <p className="text-sm text-muted-foreground">
                  Click "Approve Payroll" to finalize. This will generate payment files for direct deposit or check printing.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                6
              </div>
              <div className="flex-1">
                <h5 className="font-semibold mb-1">Archive and Report</h5>
                <p className="text-sm text-muted-foreground">
                  System automatically archives payroll records and generates required reports for tax compliance and accounting.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="compliance">
        <CardHeader>
          <CardTitle>5. Tax Compliance and Reporting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Ensure compliance with all federal, state, and local tax regulations:
          </p>

          <div className="space-y-3">
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Automatic Tax Withholding</h5>
              <p className="text-sm">
                The system automatically calculates and withholds federal income tax, Social Security, Medicare, and applicable state and local taxes based on employee W-4 information.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Quarterly Reports</h5>
              <p className="text-sm">
                Generate Form 941 (Employer's Quarterly Federal Tax Return) and state unemployment tax reports automatically from the Reports section.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Year-End Processing</h5>
              <p className="text-sm">
                At year-end, the system generates W-2 forms for all employees and Form 940 (Federal Unemployment Tax) automatically.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="troubleshooting">
        <CardHeader>
          <CardTitle>6. Troubleshooting Common Issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="border-l-4 border-amber-500 pl-4">
              <h5 className="font-semibold mb-1">Issue: Timesheet Not Appearing in Payroll</h5>
              <p className="text-sm text-muted-foreground">
                <strong>Solution:</strong> Ensure the timesheet has been submitted and approved by a manager. Unapproved timesheets will not appear in payroll calculations.
              </p>
            </div>

            <div className="border-l-4 border-amber-500 pl-4">
              <h5 className="font-semibold mb-1">Issue: 5-Hour Minimum Not Applied</h5>
              <p className="text-sm text-muted-foreground">
                <strong>Solution:</strong> Check that the staff member was assigned to an event (not just logged hours). The 5-hour minimum is event-based.
              </p>
            </div>

            <div className="border-l-4 border-amber-500 pl-4">
              <h5 className="font-semibold mb-1">Issue: Overtime Not Calculating Correctly</h5>
              <p className="text-sm text-muted-foreground">
                <strong>Solution:</strong> Verify the employee's overtime rules in their profile. Ensure the time period settings match your company's policy (daily vs. weekly overtime).
              </p>
            </div>

            <div className="border-l-4 border-amber-500 pl-4">
              <h5 className="font-semibold mb-1">Issue: Tax Withholding Amount Incorrect</h5>
              <p className="text-sm text-muted-foreground">
                <strong>Solution:</strong> Review the employee's W-4 information and ensure tax tables are up to date. Update tax settings in System Configuration if needed.
              </p>
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
              <p className="text-sm text-muted-foreground">
                Download the complete PDF version for easy reference
              </p>
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
