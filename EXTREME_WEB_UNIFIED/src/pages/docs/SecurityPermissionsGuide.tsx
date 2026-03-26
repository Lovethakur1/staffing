import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { ArrowLeft, Download, Shield, CheckCircle2 } from "lucide-react";

interface SecurityPermissionsGuideProps {
  onNavigate: (page: string) => void;
  userRole: string;
}

export function SecurityPermissionsGuide({ onNavigate }: SecurityPermissionsGuideProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'Security-Permissions-Guide.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => onNavigate('documentation')}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="outline">Administration</Badge>
            </div>
            <h1 className="text-[#5E1916]">Security & Permissions Guide</h1>
            <p className="text-muted-foreground">Manage security settings and user permissions</p>
          </div>
        </div>
        <Button onClick={handleDownload}><Download className="h-4 w-4 mr-2" />Download PDF</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6 text-sm">
            <div><span className="text-muted-foreground">Pages:</span><span className="ml-2 font-semibold">10</span></div>
            <div><span className="text-muted-foreground">Last Updated:</span><span className="ml-2 font-semibold">November 13, 2024</span></div>
            <div><span className="text-muted-foreground">Reading Time:</span><span className="ml-2 font-semibold">~20 minutes</span></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Table of Contents</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1">
            <a href="#roles" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">1. User Roles</a>
            <a href="#permissions" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">2. Permission Configuration</a>
            <a href="#access" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">3. Access Control</a>
            <a href="#audit" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">4. Audit & Monitoring</a>
            <a href="#2fa" className="block py-2 px-3 hover:bg-muted rounded-md transition-colors">5. Two-Factor Authentication</a>
          </div>
        </CardContent>
      </Card>

      <Card id="roles">
        <CardHeader><CardTitle>1. User Roles</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p>Extreme Staffing uses a role-based access control (RBAC) system with six defined roles:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Admin</h5>
              <p className="text-sm text-muted-foreground">Full system access including financial management, system settings, and user management.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Sub-Admin</h5>
              <p className="text-sm text-muted-foreground">Operational oversight without financial access. Can manage staff, events, and incidents.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Scheduler</h5>
              <p className="text-sm text-muted-foreground">Event creation, staff scheduling, and dispatch operations focus.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Manager</h5>
              <p className="text-sm text-muted-foreground">On-site event management, attendance tracking, and performance reviews.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Staff</h5>
              <p className="text-sm text-muted-foreground">Personal schedule, timesheets, payroll viewing, and profile management.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Client</h5>
              <p className="text-sm text-muted-foreground">Event booking, staff selection, favorites, and invoice viewing.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="permissions">
        <CardHeader><CardTitle>2. Permission Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p>Customize permissions for each role using the Roles & Permissions page:</p>
          <div className="space-y-3">
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Viewing Permissions</h5>
              <p className="text-sm text-muted-foreground">Control which pages and data each role can view (e.g., managers cannot see financial data).</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Action Permissions</h5>
              <p className="text-sm text-muted-foreground">Define which actions each role can perform: create, edit, delete, approve, or export data.</p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Custom Permission Sets</h5>
              <p className="text-sm text-muted-foreground">Create custom permission combinations for specialized roles within your organization.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="access">
        <CardHeader><CardTitle>3. Access Control</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div><strong>Session Management</strong><p className="text-sm text-muted-foreground">View active sessions and force logout of specific devices or all devices.</p></div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div><strong>Login Activity</strong><p className="text-sm text-muted-foreground">Track all login attempts with IP address, user agent, timestamp, and success/failure status.</p></div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div><strong>Account Lockout</strong><p className="text-sm text-muted-foreground">Automatic account lockout after multiple failed login attempts with admin-controlled reset.</p></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="audit">
        <CardHeader><CardTitle>4. Audit & Monitoring</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p>Comprehensive audit logging for compliance and security:</p>
          <div className="space-y-3">
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Login Logs</h5>
              <p className="text-sm">Complete history of all login attempts including IP address, user agent, and success/failure.</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Action Audit Trail</h5>
              <p className="text-sm">Timestamped records of all data modifications, approvals, and administrative actions.</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Security Alerts</h5>
              <p className="text-sm">Automatic alerts for suspicious activity like unusual login patterns or unauthorized access attempts.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="2fa">
        <CardHeader><CardTitle>5. Two-Factor Authentication</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p>Enable additional security for user accounts:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">SMS Verification</h5>
              <p className="text-sm text-muted-foreground">Send one-time codes via SMS for login verification.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Authenticator App</h5>
              <p className="text-sm text-muted-foreground">Support for TOTP authenticator apps like Google Authenticator.</p>
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
            <Button onClick={handleDownload}><Download className="h-4 w-4 mr-2" />Download PDF</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
