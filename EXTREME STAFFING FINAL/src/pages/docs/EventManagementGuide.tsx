import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { ArrowLeft, Download, Calendar, CheckCircle2 } from "lucide-react";

interface EventManagementGuideProps {
  onNavigate: (page: string) => void;
  userRole: string;
}

export function EventManagementGuide({ onNavigate }: EventManagementGuideProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'Event-Management-Guide.pdf';
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
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="outline">Core Features</Badge>
            </div>
            <h1 className="text-[#5E1916]">Event Management Guide</h1>
            <p className="text-muted-foreground">
              Learn how to create, manage, and track events
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
              <span className="ml-2 font-semibold">18</span>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="ml-2 font-semibold">November 12, 2024</span>
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
              1. Event Management Overview
            </a>
            <a href="#creating-events" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">
              2. Creating and Configuring Events
            </a>
            <a href="#staff-assignment" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">
              3. Staff Assignment and Scheduling
            </a>
            <a href="#client-management" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">
              4. Client Management and Favorite Events
            </a>
            <a href="#tracking" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">
              5. Event Tracking and Monitoring
            </a>
            <a href="#post-event" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">
              6. Post-Event Processing
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Content Sections */}
      <Card id="overview">
        <CardHeader>
          <CardTitle>1. Event Management Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            The Event Management module is the heart of Extreme Staffing, designed to handle everything from small gatherings to large-scale corporate events with 100+ staff members.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <h5 className="font-semibold mb-2">Key Features</h5>
            <ul className="space-y-2 ml-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <span>Comprehensive event creation with all details and requirements</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <span>Automated staff assignment based on skills and availability</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <span>Real-time event tracking and status updates</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <span>Client portal integration for direct booking</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <span>Favorite events rebook feature for proven staff assignments</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card id="creating-events">
        <CardHeader>
          <CardTitle>2. Creating and Configuring Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h4 className="font-semibold">Step-by-Step Event Creation</h4>
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-2">Basic Information</h5>
              <p className="text-sm text-muted-foreground mb-3">
                Start by filling in the fundamental details:
              </p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Event name and description</li>
                <li>• Event date and time (start/end)</li>
                <li>• Venue name and address</li>
                <li>• Client information</li>
                <li>• Event type and category</li>
              </ul>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-2">Staffing Requirements</h5>
              <p className="text-sm text-muted-foreground mb-3">
                Define your staffing needs:
              </p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Total number of staff required</li>
                <li>• Specific roles needed (servers, bartenders, managers, etc.)</li>
                <li>• Required certifications and skills</li>
                <li>• Uniform and dress code requirements</li>
                <li>• Special instructions or notes</li>
              </ul>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-2">Scheduling and Timing</h5>
              <p className="text-sm text-muted-foreground mb-3">
                Configure the event schedule:
              </p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Setup time before event</li>
                <li>• Event duration</li>
                <li>• Breakdown time after event</li>
                <li>• Break schedules for staff</li>
                <li>• Overtime considerations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="staff-assignment">
        <CardHeader>
          <CardTitle>3. Staff Assignment and Scheduling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Assigning the right staff to events is crucial for success. The system provides multiple ways to assign staff efficiently.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Manual Assignment</h5>
              <p className="text-sm text-muted-foreground">
                Browse your staff roster and manually select individuals based on their profiles, availability, and past performance.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Auto-Suggest Feature</h5>
              <p className="text-sm text-muted-foreground">
                Let the system recommend staff based on skills, certifications, availability, and proximity to the venue.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Favorite Staff Selection</h5>
              <p className="text-sm text-muted-foreground">
                For returning clients, quickly assign staff from previous successful events using the favorite events feature.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Bulk Assignment</h5>
              <p className="text-sm text-muted-foreground">
                Assign multiple staff members at once for large-scale events requiring 20+ workers.
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <h5 className="font-semibold mb-2 text-amber-900">Important: 5-Hour Minimum Pay Rule</h5>
            <p className="text-sm text-amber-800">
              Remember that all staff assignments are subject to the 5-hour minimum pay rule. Even if an event is shorter, staff will be paid for a minimum of 5 hours. This is automatically calculated in the payroll system.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card id="client-management">
        <CardHeader>
          <CardTitle>4. Client Management and Favorite Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h4 className="font-semibold">Client Portal Integration</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Clients can access their own portal to book events, view upcoming engagements, and utilize the favorite events rebook feature.
          </p>

          <div className="space-y-3">
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Favorite Events Feature</h5>
              <p className="text-sm mb-3">
                This powerful feature allows clients to quickly rebook events with the same staff members who performed well previously.
              </p>
              <div className="text-sm space-y-2">
                <p><strong>How it works:</strong></p>
                <ol className="ml-6 space-y-1">
                  <li>1. Client marks an event as "favorite" after successful completion</li>
                  <li>2. System saves the staff roster and event configuration</li>
                  <li>3. When booking a new event, client can select from favorite events</li>
                  <li>4. System automatically suggests the same staff (if available)</li>
                  <li>5. Client can approve or modify the suggested roster</li>
                </ol>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Benefits</h5>
              <ul className="text-sm space-y-1 ml-6">
                <li>• Faster event setup and booking</li>
                <li>• Consistency in service quality</li>
                <li>• Higher client satisfaction</li>
                <li>• Better staff retention and morale</li>
                <li>• Reduced training and onboarding time</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="tracking">
        <CardHeader>
          <CardTitle>5. Event Tracking and Monitoring</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Monitor events in real-time with comprehensive tracking features:
          </p>
          
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h5 className="font-semibold mb-1">Geo-Location Attendance Tracking</h5>
              <p className="text-sm text-muted-foreground">
                Staff can clock in/out using the mobile app with geo-location verification to ensure they are on-site. Admins and managers can view real-time attendance status.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h5 className="font-semibold mb-1">Live Event Dashboard</h5>
              <p className="text-sm text-muted-foreground">
                View all active events on a single dashboard with status indicators, staff count, and any issues or alerts.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h5 className="font-semibold mb-1">Staff Performance Tracking</h5>
              <p className="text-sm text-muted-foreground">
                Monitor individual staff performance, punctuality, and client feedback during and after events.
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h5 className="font-semibold mb-1">Issue Management</h5>
              <p className="text-sm text-muted-foreground">
                Log and track any issues that arise during events, assign them to managers, and monitor resolution progress.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="post-event">
        <CardHeader>
          <CardTitle>6. Post-Event Processing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            After an event concludes, several important tasks need to be completed:
          </p>

          <div className="space-y-3">
            <Separator />
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Timesheet Review and Approval</strong>
                <p className="text-sm text-muted-foreground">
                  Review all staff timesheets, verify geo-location data, and approve hours worked for payroll processing.
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Client Feedback Collection</strong>
                <p className="text-sm text-muted-foreground">
                  Request and collect feedback from clients regarding event success, staff performance, and areas for improvement.
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Payroll Processing</strong>
                <p className="text-sm text-muted-foreground">
                  Admin users process payroll with automatic calculation of regular hours, overtime, and the 5-hour minimum pay rule.
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Client Invoicing</strong>
                <p className="text-sm text-muted-foreground">
                  Generate and send invoices to clients based on actual hours worked and agreed-upon rates.
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Event Documentation</strong>
                <p className="text-sm text-muted-foreground">
                  Archive all event documents, photos, notes, and reports for future reference and compliance.
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
