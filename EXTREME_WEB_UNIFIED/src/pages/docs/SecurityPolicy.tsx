import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Download, Shield } from "lucide-react";

interface SecurityPolicyProps {
  onNavigate: (page: string) => void;
  userRole: string;
}

export function SecurityPolicy({ onNavigate }: SecurityPolicyProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'Security-Policy.pdf';
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
              <Badge variant="outline">Policy</Badge>
            </div>
            <h1 className="text-[#5E1916]">Security Policy</h1>
            <p className="text-muted-foreground">Our security practices and protocols</p>
          </div>
        </div>
        <Button onClick={handleDownload}><Download className="h-4 w-4 mr-2" />Download PDF</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6 text-sm">
            <div><span className="text-muted-foreground">Last Updated:</span><span className="ml-2 font-semibold">October 15, 2024</span></div>
            <div><span className="text-muted-foreground">Effective Date:</span><span className="ml-2 font-semibold">November 1, 2024</span></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>1. Data Encryption</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p>All data transmitted between your device and our servers is encrypted using TLS 1.3 encryption. Sensitive data such as bank account information and tax IDs are encrypted at rest using AES-256 encryption.</p>
          <div className="bg-muted p-4 rounded-lg">
            <h5 className="font-semibold mb-2">Encryption Standards</h5>
            <ul className="text-sm space-y-1 ml-4 list-disc">
              <li>TLS 1.3 for all data in transit</li>
              <li>AES-256 for data at rest</li>
              <li>Encrypted database connections</li>
              <li>Secure key management with rotation policies</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>2. Access Controls</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p>We implement strict access controls to ensure that only authorized personnel can access system data:</p>
          <ul className="space-y-2 ml-4 list-disc text-sm">
            <li>Role-based access control (RBAC) with six permission tiers</li>
            <li>Multi-factor authentication (MFA) available for all accounts</li>
            <li>Automatic session timeouts after periods of inactivity</li>
            <li>IP-based access restrictions available for enterprise accounts</li>
            <li>Login attempt monitoring with automatic account lockout</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>3. Infrastructure Security</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p>Our infrastructure is designed with security as a priority:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Cloud Hosting</h5>
              <p className="text-sm text-muted-foreground">Hosted on SOC 2 compliant cloud infrastructure with 99.9% uptime SLA.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Network Security</h5>
              <p className="text-sm text-muted-foreground">Firewalls, intrusion detection, and DDoS protection on all endpoints.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Database Security</h5>
              <p className="text-sm text-muted-foreground">Automated backups, point-in-time recovery, and segregated database environments.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-2">Monitoring</h5>
              <p className="text-sm text-muted-foreground">24/7 system monitoring with automated alerting for anomalous behavior.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>4. Incident Response</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p>In the event of a security incident, we follow a structured response plan:</p>
          <div className="space-y-3">
            <div className="border-l-4 border-red-500 pl-4">
              <h5 className="font-semibold mb-1">Detection & Containment</h5>
              <p className="text-sm text-muted-foreground">Automated detection systems identify and contain threats within minutes.</p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h5 className="font-semibold mb-1">Assessment & Notification</h5>
              <p className="text-sm text-muted-foreground">Affected parties are notified within 72 hours as required by applicable regulations.</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h5 className="font-semibold mb-1">Remediation & Recovery</h5>
              <p className="text-sm text-muted-foreground">Root cause analysis, system hardening, and service restoration with post-incident review.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>5. Compliance</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p>We maintain compliance with industry standards and regulations:</p>
          <ul className="space-y-2 ml-4 list-disc text-sm">
            <li><strong>SOC 2 Type II:</strong> Annual audits ensuring security, availability, and confidentiality</li>
            <li><strong>GDPR:</strong> Full compliance with EU data protection regulations</li>
            <li><strong>CCPA:</strong> Compliance with California Consumer Privacy Act</li>
            <li><strong>PCI DSS:</strong> Payment card industry data security standards for payment processing</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold mb-1">Need this policy offline?</h4>
              <p className="text-sm text-muted-foreground">Download for your records</p>
            </div>
            <Button onClick={handleDownload}><Download className="h-4 w-4 mr-2" />Download PDF</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
