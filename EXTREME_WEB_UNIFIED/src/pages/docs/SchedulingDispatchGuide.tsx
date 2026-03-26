import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { ArrowLeft, Download, Calendar, CheckCircle2 } from "lucide-react";

interface SchedulingDispatchGuideProps {
  onNavigate: (page: string) => void;
  userRole: string;
}

export function SchedulingDispatchGuide({ onNavigate }: SchedulingDispatchGuideProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'Scheduling-Dispatch-Guide.pdf';
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
            <h1 className="text-[#5E1916]">Scheduling & Dispatch Guide</h1>
            <p className="text-muted-foreground">
              Master the scheduling system and dispatch operations
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
              <span className="ml-2 font-semibold">20</span>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="ml-2 font-semibold">November 14, 2024</span>
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
            <a href="#overview" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">1. Scheduling Overview</a>
            <a href="#creating-shifts" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">2. Creating & Managing Shifts</a>
            <a href="#dispatch" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">3. Dispatch Operations</a>
            <a href="#conflicts" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">4. Conflict Resolution</a>
            <a href="#marketplace" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">5. Shift Marketplace</a>
            <a href="#tracking" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">6. Real-Time Tracking</a>
          </div>
        </CardContent>
      </Card>

      <Card id="overview">
        <CardHeader>
          <CardTitle>1. Scheduling Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            The Scheduling & Dispatch module is the operational backbone of Extreme Staffing. It handles shift creation, staff assignment, real-time tracking, and dispatch coordination for all events.
          </p>
          <ul className="space-y-2 ml-6">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div><strong>Calendar View:</strong> Visual calendar showing all shifts across events with drag-and-drop assignment</div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div><strong>Auto-Assignment:</strong> Smart scheduling that matches staff skills and availability to event requirements</div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div><strong>Conflict Detection:</strong> Automatic alerts when staff are double-booked or working excessive hours</div>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card id="creating-shifts">
        <CardHeader>
          <CardTitle>2. Creating & Managing Shifts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Step 1: Select the Event</h5>
              <p className="text-sm text-muted-foreground">Navigate to the event detail page or the Scheduling & Dispatch module and select the event that needs staffing.</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Step 2: Define Shift Parameters</h5>
              <p className="text-sm text-muted-foreground">Set the shift date, start time, end time, required role (Bartender, Server, Security, etc.), and hourly rate.</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Step 3: Assign Staff</h5>
              <p className="text-sm text-muted-foreground">Search for available staff by skills, ratings, and proximity to the venue. Select staff and send shift confirmations.</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Step 4: Confirm & Notify</h5>
              <p className="text-sm text-muted-foreground">Staff receive notifications of their shift assignments and must confirm acceptance. Track confirmation status from the scheduling dashboard.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="dispatch">
        <CardHeader>
          <CardTitle>3. Dispatch Operations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>The dispatch workflow follows an Uber-like real-time tracking model:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Travel to Venue</h5>
              <p className="text-sm text-muted-foreground">Staff tap "Start Travel" when departing. Their location is tracked in real-time until arrival.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Arrival & Clock-In</h5>
              <p className="text-sm text-muted-foreground">Geo-verified arrival triggers automatic clock-in. Managers can view arrivals on the live operations dashboard.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Shift Management</h5>
              <p className="text-sm text-muted-foreground">Staff can log breaks, report incidents, and track their shift progress in real-time.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Travel Home</h5>
              <p className="text-sm text-muted-foreground">After clock-out, staff can log their travel home for complete time and mileage tracking.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="conflicts">
        <CardHeader>
          <CardTitle>4. Conflict Resolution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>The system automatically detects and helps resolve scheduling conflicts:</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Double-Booking Prevention</strong>
                <p className="text-sm text-muted-foreground">The system blocks assigning staff to overlapping shifts and suggests alternatives.</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Overtime Alerts</strong>
                <p className="text-sm text-muted-foreground">Automatic alerts when staff are approaching overtime thresholds to manage costs.</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Find Replacement</strong>
                <p className="text-sm text-muted-foreground">When staff cancel, use the "Find Replacement" tool to quickly identify and assign qualified available staff.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="marketplace">
        <CardHeader>
          <CardTitle>5. Shift Marketplace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            The Shift Marketplace enables flexible shift management:
          </p>
          <div className="space-y-3">
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Posting Shifts</h5>
              <p className="text-sm">Staff can post shifts they want to drop, and other qualified staff can pick them up, subject to manager approval.</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Shift Swaps</h5>
              <p className="text-sm">Two staff members can propose a shift swap. Both parties and the manager must approve for the swap to take effect.</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Open Shifts</h5>
              <p className="text-sm">Schedulers can post open shifts to the marketplace, allowing qualified staff to claim them on a first-come basis.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="tracking">
        <CardHeader>
          <CardTitle>6. Real-Time Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>The Live Operations dashboard provides real-time visibility into all active shifts:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Live Map</h5>
              <p className="text-sm text-muted-foreground">Track staff locations on an interactive map during travel and active shifts.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Status Feed</h5>
              <p className="text-sm text-muted-foreground">Real-time updates on clock-ins, breaks, incidents, and clock-outs across all events.</p>
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
