import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { ArrowLeft, Download, Settings, CheckCircle2 } from "lucide-react";

interface SystemSettingsGuideProps {
  onNavigate: (page: string) => void;
  userRole: string;
}

export function SystemSettingsGuide({ onNavigate }: SystemSettingsGuideProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'System-Settings-Guide.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => onNavigate('documentation')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="outline">Administration</Badge>
            </div>
            <h1 className="text-[#5E1916]">System Settings & Configuration Guide</h1>
            <p className="text-muted-foreground">Configure your system settings and preferences</p>
          </div>
        </div>
        <Button onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6 text-sm">
            <div><span className="text-muted-foreground">Pages:</span><span className="ml-2 font-semibold">14</span></div>
            <div><span className="text-muted-foreground">Last Updated:</span><span className="ml-2 font-semibold">November 7, 2024</span></div>
            <div><span className="text-muted-foreground">Reading Time:</span><span className="ml-2 font-semibold">~25 minutes</span></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Table of Contents</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1">
            <a href="#company" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">1. Company Settings</a>
            <a href="#notifications" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">2. Notification Configuration</a>
            <a href="#integrations" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">3. Integrations</a>
            <a href="#database" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">4. Database Management</a>
          </div>
        </CardContent>
      </Card>

      <Card id="company">
        <CardHeader><CardTitle>1. Company Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p>Configure your organization's core settings to customize the platform for your business needs.</p>
          <div className="space-y-3">
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Organization Info</h5>
              <p className="text-sm text-muted-foreground">Set your company name, address, phone, email, website, and tax ID. This info appears on invoices.</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Billing Preferences</h5>
              <p className="text-sm text-muted-foreground">Configure payment terms (NET30, NET60), currency, tax rates, and invoice numbering format.</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Business Rules</h5>
              <p className="text-sm text-muted-foreground">Set up the 5-hour minimum pay rule, overtime thresholds, default working hours, and auto-clock-out settings.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="notifications">
        <CardHeader><CardTitle>2. Notification Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p>Customize how and when notifications are sent across the platform:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Email Notifications</h5>
              <p className="text-sm text-muted-foreground">Configure transactional emails for shift assignments, invoice reminders, and alerts.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">SMS Notifications</h5>
              <p className="text-sm text-muted-foreground">Set up SMS alerts for urgent events like shift cancellations and incidents.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Push Notifications</h5>
              <p className="text-sm text-muted-foreground">Configure in-app and mobile push notification preferences for real-time updates.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Marketing Communications</h5>
              <p className="text-sm text-muted-foreground">Manage newsletter and marketing email opt-in/opt-out settings for users.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="integrations">
        <CardHeader><CardTitle>3. Integrations</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p>Connect external services to extend platform capabilities:</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div><strong>Accounting (QuickBooks, Xero)</strong><p className="text-sm text-muted-foreground">Sync invoices, payments, and financial data.</p></div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div><strong>Communication (Slack, Email)</strong><p className="text-sm text-muted-foreground">Route notifications and alerts to Slack channels or custom emails.</p></div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div><strong>Calendar (Google, Outlook)</strong><p className="text-sm text-muted-foreground">Sync events and shifts with external calendar applications.</p></div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div><strong>Storage (Google Drive, Dropbox)</strong><p className="text-sm text-muted-foreground">Store documents and media in cloud storage providers.</p></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="database">
        <CardHeader><CardTitle>4. Database Management</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p>Admin tools for database maintenance and backups:</p>
          <div className="space-y-3">
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Automated Backups</h5>
              <p className="text-sm">Configure automatic daily, weekly, or monthly backups with retention policies.</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Manual Backups</h5>
              <p className="text-sm">Trigger on-demand full or incremental backups before major system changes.</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Backup History</h5>
              <p className="text-sm">View complete backup history with status, size, and restore options.</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
