import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { ArrowLeft, Download, Users, CheckCircle2 } from "lucide-react";

interface StaffWorkforceGuideProps {
  onNavigate: (page: string) => void;
  userRole: string;
}

export function StaffWorkforceGuide({ onNavigate }: StaffWorkforceGuideProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'Staff-Workforce-Management-Guide.pdf';
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
                <Users className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="outline">Core Features</Badge>
            </div>
            <h1 className="text-[#5E1916]">Staff & Workforce Management Guide</h1>
            <p className="text-muted-foreground">
              Complete guide to managing your staff and workforce
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
              <span className="ml-2 font-semibold">24</span>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="ml-2 font-semibold">November 8, 2024</span>
            </div>
            <div>
              <span className="text-muted-foreground">Reading Time:</span>
              <span className="ml-2 font-semibold">~45 minutes</span>
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
              1. Workforce Overview
            </a>
            <a href="#adding-staff" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">
              2. Adding & Onboarding Staff
            </a>
            <a href="#profiles" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">
              3. Managing Staff Profiles
            </a>
            <a href="#skills" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">
              4. Skills & Certifications
            </a>
            <a href="#availability" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">
              5. Availability & Scheduling
            </a>
            <a href="#performance" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">
              6. Performance Tracking
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Content Sections */}
      <Card id="overview">
        <CardHeader>
          <CardTitle>1. Workforce Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            The Workforce Management module is the central hub for managing all staff-related operations in Extreme Staffing. It provides a comprehensive view of your entire workforce with tools for tracking, organizing, and optimizing your team.
          </p>
          <p>
            Key features include:
          </p>
          <ul className="space-y-2 ml-6">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <strong>Staff Directory:</strong> Searchable database of all active and inactive staff members with quick filters
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <strong>Status Dashboard:</strong> Real-time overview of staff availability, active assignments, and capacity
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <strong>Bulk Operations:</strong> Import/export staff data via CSV templates for efficient management
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <strong>Document Tracking:</strong> Automated alerts for expiring certifications and required documents
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card id="adding-staff">
        <CardHeader>
          <CardTitle>2. Adding & Onboarding Staff</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h4 className="font-semibold">Adding New Staff Members</h4>
          <div className="space-y-3">
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Step 1: Navigate to Workforce Page</h5>
              <p className="text-sm text-muted-foreground">
                Go to People → Workforce and click the "Add New Staff" button in the top right.
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Step 2: Enter Basic Information</h5>
              <p className="text-sm text-muted-foreground">
                Fill in the staff member's name, email, phone number, and assign their role (Bartender, Server, Security, etc.).
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Step 3: Set Up Skills & Rates</h5>
              <p className="text-sm text-muted-foreground">
                Assign relevant skills, set the hourly pay rate, and specify the experience level (Junior, Standard, Premium, Elite).
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Step 4: Upload Documents</h5>
              <p className="text-sm text-muted-foreground">
                Collect and upload required documents including ID verification, tax forms (W-4/W-9), certifications, and signed NDAs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="profiles">
        <CardHeader>
          <CardTitle>3. Managing Staff Profiles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Each staff member has a comprehensive profile page that stores all their information:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Personal Information</h5>
              <p className="text-sm text-muted-foreground">
                Contact details, emergency contacts, location, and profile photo
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Employment Details</h5>
              <p className="text-sm text-muted-foreground">
                Join date, hourly rate, bank account info (encrypted), and tax ID
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Event History</h5>
              <p className="text-sm text-muted-foreground">
                Complete record of past events, shifts worked, and performance ratings
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Compliance Status</h5>
              <p className="text-sm text-muted-foreground">
                Document verification status, certification expiry dates, and training completion
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="skills">
        <CardHeader>
          <CardTitle>4. Skills & Certifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Effective skills management enables smart scheduling and ensures the right staff are assigned to the right events:
          </p>
          <div className="space-y-3">
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Skill Categories</h5>
              <p className="text-sm">
                Organize staff skills into categories like Food & Beverage, Security, Production, AV/Technical, and Hospitality. Each skill can have proficiency levels.
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Certification Tracking</h5>
              <p className="text-sm">
                Upload certifications with issue and expiry dates. The system automatically alerts when certifications are expiring within 30 days so you can schedule renewals.
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Skill-Based Matching</h5>
              <p className="text-sm">
                When creating events, the scheduling system uses staff skills to recommend the best-matched available staff members.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="availability">
        <CardHeader>
          <CardTitle>5. Availability & Scheduling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Staff availability management ensures efficient scheduling and prevents conflicts:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Availability Status</strong>
                <p className="text-sm text-muted-foreground">
                  Staff can set their availability as Available, Busy, or Off. This is visible to schedulers when assigning shifts.
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Calendar View</strong>
                <p className="text-sm text-muted-foreground">
                  View staff schedules in a calendar format to identify open slots, conflicts, and overtime situations.
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Geo-Location Tracking</strong>
                <p className="text-sm text-muted-foreground">
                  Track staff location during travel and shifts for accurate attendance and real-time operational visibility.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="performance">
        <CardHeader>
          <CardTitle>6. Performance Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Monitor and improve staff performance with built-in tracking tools:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Ratings & Reviews</h5>
              <p className="text-sm text-muted-foreground">
                Managers and clients can rate staff after events. Ratings feed into the staff profile and influence future scheduling priority.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Attendance Record</h5>
              <p className="text-sm text-muted-foreground">
                Track clock-in/out accuracy, no-shows, and punctuality metrics across all events.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Event Statistics</h5>
              <p className="text-sm text-muted-foreground">
                Total events worked, hours logged, tips earned, and overall performance score.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Incident History</h5>
              <p className="text-sm text-muted-foreground">
                View any incidents reported involving the staff member for compliance and improvement tracking.
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
