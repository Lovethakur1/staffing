import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { ArrowLeft, Download, BookOpen, CheckCircle2 } from "lucide-react";

interface GettingStartedGuideProps {
  onNavigate: (page: string) => void;
  userRole: string;
}

export function GettingStartedGuide({ onNavigate }: GettingStartedGuideProps) {
  const handleDownload = () => {
    // Simulate PDF download
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'Getting-Started-Guide.pdf';
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
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="outline">Getting Started</Badge>
            </div>
            <h1 className="text-[#5E1916]">Getting Started Guide</h1>
            <p className="text-muted-foreground">
              Complete guide to set up your account and start using the platform
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
              <span className="ml-2 font-semibold">12</span>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="ml-2 font-semibold">November 10, 2024</span>
            </div>
            <div>
              <span className="text-muted-foreground">Reading Time:</span>
              <span className="ml-2 font-semibold">~30 minutes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Table of Contents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <a href="#introduction" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">
              1. Introduction to Extreme Staffing
            </a>
            <a href="#account-setup" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">
              2. Account Setup & Configuration
            </a>
            <a href="#navigation" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">
              3. Platform Navigation
            </a>
            <a href="#first-event" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">
              4. Creating Your First Event
            </a>
            <a href="#staff-onboarding" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">
              5. Staff Onboarding
            </a>
            <a href="#best-practices" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">
              6. Best Practices
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Sections */}
      <Card id="introduction">
        <CardHeader>
          <CardTitle>1. Introduction to Extreme Staffing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Welcome to Extreme Staffing, the comprehensive event staffing management system designed to replace all external software like QuickBooks, Xero, ADP, Gusto, and ConnectTeam with one unified platform.
          </p>
          <p>
            Our system provides four main portals to serve different user roles:
          </p>
          <ul className="space-y-2 ml-6">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <strong>Admin Portal:</strong> Full system access with financial management, payroll processing, and complete oversight
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <strong>Manager Portal:</strong> Event and staff management without access to financial data
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <strong>Client Portal:</strong> Event booking, staff selection, and favorite events rebook feature
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <strong>Staff Portal:</strong> Schedule viewing, timesheet submission, and profile management
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card id="account-setup">
        <CardHeader>
          <CardTitle>2. Account Setup & Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h4 className="font-semibold">Initial Setup Steps</h4>
          <div className="space-y-3">
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Step 1: Complete Your Profile</h5>
              <p className="text-sm text-muted-foreground">
                Navigate to Settings → Profile to add your company information, contact details, and branding elements including your logo and color scheme.
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Step 2: Configure Company Settings</h5>
              <p className="text-sm text-muted-foreground">
                Set up your 5-hour minimum pay rules, overtime calculations, time zones, and default working hours in Settings → Company Configuration.
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Step 3: Set Up User Roles & Permissions</h5>
              <p className="text-sm text-muted-foreground">
                Define access levels for admins, managers, and staff members to ensure proper data security and workflow management.
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Step 4: Configure Payroll Settings</h5>
              <p className="text-sm text-muted-foreground">
                Set up pay rates, tax withholdings, and payment schedules. Note: All financial settings are only accessible to admin users.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="navigation">
        <CardHeader>
          <CardTitle>3. Platform Navigation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            The platform is organized into logical departments for easy navigation:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Operations</h5>
              <p className="text-sm text-muted-foreground">
                Dashboard, notifications, and real-time operational oversight
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Event Management</h5>
              <p className="text-sm text-muted-foreground">
                Create, manage, and track all events and client bookings
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">People</h5>
              <p className="text-sm text-muted-foreground">
                Staff roster, scheduling, and workforce management
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Financial Management</h5>
              <p className="text-sm text-muted-foreground">
                Payroll, invoicing, and financial reporting (Admin only)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="first-event">
        <CardHeader>
          <CardTitle>4. Creating Your First Event</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-3 list-decimal ml-6">
            <li>
              <strong>Navigate to Events → Create Event</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Click the "Create Event" button in the Events section
              </p>
            </li>
            <li>
              <strong>Fill in Event Details</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Enter event name, date, time, venue, and client information
              </p>
            </li>
            <li>
              <strong>Define Staffing Requirements</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Specify the number of staff needed, required roles, and skill sets
              </p>
            </li>
            <li>
              <strong>Assign Staff Members</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Select staff from your roster or use the "Favorite Staff" feature for returning clients
              </p>
            </li>
            <li>
              <strong>Review and Confirm</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Double-check all details and click "Create Event" to finalize
              </p>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card id="staff-onboarding">
        <CardHeader>
          <CardTitle>5. Staff Onboarding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Properly onboarding staff ensures smooth operations and compliance:
          </p>
          <div className="space-y-3">
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Creating Staff Profiles</h5>
              <p className="text-sm">
                Go to People → Staff Roster → Add New Staff. Enter all required information including contact details, certifications, skills, and emergency contacts.
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Document Collection</h5>
              <p className="text-sm">
                Upload required documents such as certifications, licenses, and completed onboarding forms through the staff profile.
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Setting Pay Rates</h5>
              <p className="text-sm">
                Admin users can configure individual pay rates, considering the 5-hour minimum pay rule and any overtime calculations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="best-practices">
        <CardHeader>
          <CardTitle>6. Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Regular Data Backups</strong>
                <p className="text-sm text-muted-foreground">
                  Export important data regularly and keep offline backups of critical information
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Maintain Updated Staff Information</strong>
                <p className="text-sm text-muted-foreground">
                  Keep staff profiles current with latest certifications, contact information, and availability
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Use Favorite Events Feature</strong>
                <p className="text-sm text-muted-foreground">
                  Leverage the rebook feature to quickly assign proven staff to returning client events
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Monitor Geo-Location Attendance</strong>
                <p className="text-sm text-muted-foreground">
                  Utilize geo-location tracking to verify staff attendance and ensure accurate time tracking
                </p>
              </div>
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
