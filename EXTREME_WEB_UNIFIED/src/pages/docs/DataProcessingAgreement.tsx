import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Download, FileText } from "lucide-react";

interface DataProcessingAgreementProps {
  onNavigate: (page: string) => void;
  userRole: string;
}

export function DataProcessingAgreement({ onNavigate }: DataProcessingAgreementProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'Data-Processing-Agreement.pdf';
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
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="outline">Policy</Badge>
            </div>
            <h1 className="text-[#5E1916]">Data Processing Agreement</h1>
            <p className="text-muted-foreground">GDPR and data protection compliance</p>
          </div>
        </div>
        <Button onClick={handleDownload}><Download className="h-4 w-4 mr-2" />Download PDF</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6 text-sm">
            <div><span className="text-muted-foreground">Last Updated:</span><span className="ml-2 font-semibold">October 1, 2024</span></div>
            <div><span className="text-muted-foreground">Effective Date:</span><span className="ml-2 font-semibold">October 1, 2024</span></div>
            <div><span className="text-muted-foreground">Version:</span><span className="ml-2 font-semibold">2.0</span></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>1. Definitions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p>This Data Processing Agreement ("DPA") forms part of the Terms of Service between Extreme Staffing ("Processor") and the organization using our services ("Controller").</p>
          <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
            <p><strong>"Personal Data"</strong> means any information relating to an identified or identifiable natural person.</p>
            <p><strong>"Processing"</strong> means any operation performed on Personal Data, including collection, recording, storage, retrieval, use, disclosure, or erasure.</p>
            <p><strong>"Data Subject"</strong> means the identified or identifiable natural person to whom the Personal Data relates.</p>
            <p><strong>"Sub-processor"</strong> means any third party appointed by the Processor to process Personal Data on behalf of the Controller.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>2. Scope of Processing</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p>The Processor processes Personal Data on behalf of the Controller for the following purposes:</p>
          <ul className="space-y-2 ml-4 list-disc text-sm">
            <li>Staff member profile management (names, contact information, employment details)</li>
            <li>Event scheduling and shift management (location data, time tracking)</li>
            <li>Payroll processing (banking information, tax IDs, compensation records)</li>
            <li>Communication services (messages, notifications, support tickets)</li>
            <li>Performance tracking and reporting (ratings, attendance records)</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>3. Data Subject Rights</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p>The Processor shall assist the Controller in fulfilling Data Subject requests including:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Right of Access</h5>
              <p className="text-sm text-muted-foreground">Data subjects may request a copy of their personal data. Export tools are available in user profiles.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Right to Rectification</h5>
              <p className="text-sm text-muted-foreground">Users can update their personal information through their profile settings at any time.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Right to Erasure</h5>
              <p className="text-sm text-muted-foreground">Account deletion requests are processed within 30 days, subject to legal retention requirements.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Right to Data Portability</h5>
              <p className="text-sm text-muted-foreground">Personal data can be exported in machine-readable formats (CSV, JSON).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>4. Security Measures</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p>The Processor implements appropriate technical and organizational measures:</p>
          <ul className="space-y-2 ml-4 list-disc text-sm">
            <li>Encryption of personal data in transit (TLS 1.3) and at rest (AES-256)</li>
            <li>Role-based access controls limiting data access to authorized personnel</li>
            <li>Regular security assessments and penetration testing</li>
            <li>Employee security training and confidentiality agreements</li>
            <li>Incident detection, response, and notification procedures</li>
            <li>Regular backup and disaster recovery procedures</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>5. Sub-processors</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p>The following sub-processors are authorized to process Personal Data:</p>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted"><tr><th className="p-3 text-left">Sub-processor</th><th className="p-3 text-left">Purpose</th><th className="p-3 text-left">Location</th></tr></thead>
              <tbody>
                <tr className="border-t"><td className="p-3">Cloud Hosting Provider</td><td className="p-3">Infrastructure & storage</td><td className="p-3">United States</td></tr>
                <tr className="border-t"><td className="p-3">Stripe</td><td className="p-3">Payment processing</td><td className="p-3">United States</td></tr>
                <tr className="border-t"><td className="p-3">Email Service Provider</td><td className="p-3">Transactional emails</td><td className="p-3">United States</td></tr>
                <tr className="border-t"><td className="p-3">SMS Gateway</td><td className="p-3">SMS notifications</td><td className="p-3">United States</td></tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>6. Data Retention</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p>Personal Data is retained in accordance with the following schedule:</p>
          <ul className="space-y-2 ml-4 list-disc text-sm">
            <li><strong>Active account data:</strong> Retained for the duration of the service agreement</li>
            <li><strong>Financial records:</strong> Retained for 7 years as required by tax regulations</li>
            <li><strong>Login and audit logs:</strong> Retained for 2 years</li>
            <li><strong>Deleted account data:</strong> Purged within 90 days of deletion request</li>
            <li><strong>Backup data:</strong> Rotated and purged according to backup retention policy</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold mb-1">Need this agreement offline?</h4>
              <p className="text-sm text-muted-foreground">Download for your records</p>
            </div>
            <Button onClick={handleDownload}><Download className="h-4 w-4 mr-2" />Download PDF</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
