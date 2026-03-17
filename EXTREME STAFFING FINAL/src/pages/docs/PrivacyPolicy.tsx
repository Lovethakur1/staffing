import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { ArrowLeft, Download, Shield } from "lucide-react";

interface PrivacyPolicyProps {
  onNavigate: (page: string) => void;
  userRole: string;
}

export function PrivacyPolicy({ onNavigate }: PrivacyPolicyProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'Privacy-Policy.pdf';
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
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="outline">Policy Document</Badge>
            </div>
            <h1 className="text-[#5E1916]">Privacy Policy</h1>
            <p className="text-muted-foreground">
              How we handle your data
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
              <span className="text-muted-foreground">Effective Date:</span>
              <span className="ml-2 font-semibold">October 1, 2024</span>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="ml-2 font-semibold">October 1, 2024</span>
            </div>
            <div>
              <span className="text-muted-foreground">Version:</span>
              <span className="ml-2 font-semibold">2.0</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle>Introduction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            At Extreme Staffing, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our event staffing management platform.
          </p>
          <p>
            Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the platform.
          </p>
        </CardContent>
      </Card>

      {/* Information We Collect */}
      <Card>
        <CardHeader>
          <CardTitle>1. Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1.1 Personal Information</h4>
              <p className="text-sm text-muted-foreground mb-2">
                We collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="text-sm space-y-1 ml-6 text-muted-foreground">
                <li>• Register for an account</li>
                <li>• Create or update your user profile</li>
                <li>• Submit timesheets or attendance records</li>
                <li>• Communicate with us through the platform</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">1.2 Types of Personal Information</h4>
              <div className="bg-muted p-4 rounded-lg">
                <ul className="text-sm space-y-2">
                  <li><strong>Contact Information:</strong> Name, email address, phone number, mailing address</li>
                  <li><strong>Employment Information:</strong> Job title, work history, certifications, skills, availability</li>
                  <li><strong>Financial Information:</strong> Banking details for direct deposit, tax withholding information (W-4), payment history</li>
                  <li><strong>Identification Information:</strong> Social Security Number, driver's license, government-issued ID</li>
                  <li><strong>Demographic Information:</strong> Date of birth, gender (optional), emergency contact information</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">1.3 Location Information</h4>
              <p className="text-sm text-muted-foreground">
                When you use our mobile application to clock in/out at events, we collect geo-location data to verify your attendance at the event venue. This data is used solely for attendance verification and payroll processing purposes.
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">1.4 Usage Information</h4>
              <p className="text-sm text-muted-foreground">
                We automatically collect certain information about your device and how you interact with our platform, including:
              </p>
              <ul className="text-sm space-y-1 ml-6 text-muted-foreground mt-2">
                <li>• Browser type and version</li>
                <li>• Operating system</li>
                <li>• IP address</li>
                <li>• Access times and dates</li>
                <li>• Pages viewed and features used</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How We Use Your Information */}
      <Card>
        <CardHeader>
          <CardTitle>2. How We Use Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-3">
            We use the information we collect for the following purposes:
          </p>
          
          <div className="space-y-3">
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Platform Operations</h5>
              <p className="text-sm text-muted-foreground">
                To provide, operate, and maintain our event staffing management platform, including account creation, user authentication, and access to features based on your role.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Payroll Processing</h5>
              <p className="text-sm text-muted-foreground">
                To calculate wages, process payroll, withhold taxes, and facilitate direct deposits or other payment methods. This includes applying our 5-hour minimum pay rule and overtime calculations.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Event Management</h5>
              <p className="text-sm text-muted-foreground">
                To create, schedule, and manage events; assign staff to events; track attendance using geo-location verification; and facilitate communication between clients, managers, and staff.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Communication</h5>
              <p className="text-sm text-muted-foreground">
                To send you notifications about your schedule, event updates, payroll information, and important system announcements.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Compliance and Legal Obligations</h5>
              <p className="text-sm text-muted-foreground">
                To comply with applicable laws, regulations, and legal processes, including tax reporting requirements, labor law compliance, and responding to lawful requests from authorities.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-semibold mb-1">Platform Improvement</h5>
              <p className="text-sm text-muted-foreground">
                To analyze usage patterns, improve functionality, develop new features, and enhance user experience.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Sharing and Disclosure */}
      <Card>
        <CardHeader>
          <CardTitle>3. Information Sharing and Disclosure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-3">
            We do not sell your personal information. We may share your information in the following circumstances:
          </p>

          <div className="space-y-3">
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Within Your Organization</h5>
              <p className="text-sm">
                Information is shared with authorized users within your organization based on their role and access level. For example, administrators can view financial information, while managers cannot.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Service Providers</h5>
              <p className="text-sm">
                We may share information with third-party service providers who perform services on our behalf, such as payment processing, data hosting, and email delivery. These providers are contractually obligated to protect your information.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Legal Requirements</h5>
              <p className="text-sm">
                We may disclose your information if required by law, court order, or government regulation, or if we believe disclosure is necessary to protect our rights, your safety, or the safety of others.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Business Transfers</h5>
              <p className="text-sm">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity, subject to the same privacy protections.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Security */}
      <Card>
        <CardHeader>
          <CardTitle>4. Data Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-3">
            We implement appropriate technical and organizational security measures to protect your personal information:
          </p>

          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm">
              <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Encryption:</strong> All data transmitted between your device and our servers is encrypted using SSL/TLS protocols.</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Access Controls:</strong> Role-based access controls ensure users can only access information appropriate to their role.</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Data Backup:</strong> Regular backups are performed to prevent data loss.</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Security Monitoring:</strong> We continuously monitor our systems for suspicious activity and potential security threats.</span>
            </li>
          </ul>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mt-4">
            <p className="text-sm text-amber-900">
              <strong>Note:</strong> While we strive to protect your personal information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Your Rights */}
      <Card>
        <CardHeader>
          <CardTitle>5. Your Rights and Choices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-3">
            You have certain rights regarding your personal information:
          </p>

          <div className="space-y-2">
            <div className="p-3 border rounded-lg">
              <h5 className="font-semibold mb-1">Access and Correction</h5>
              <p className="text-sm text-muted-foreground">
                You can access and update your personal information through your profile settings at any time.
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <h5 className="font-semibold mb-1">Data Portability</h5>
              <p className="text-sm text-muted-foreground">
                You can request a copy of your personal information in a commonly used, machine-readable format.
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <h5 className="font-semibold mb-1">Deletion</h5>
              <p className="text-sm text-muted-foreground">
                You can request deletion of your personal information, subject to legal and regulatory retention requirements.
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <h5 className="font-semibold mb-1">Opt-Out of Communications</h5>
              <p className="text-sm text-muted-foreground">
                You can opt out of non-essential communications through your notification settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle>6. Data Retention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required or permitted by law. Payroll and tax records are retained for a minimum of 7 years as required by federal law.
          </p>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>7. Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-3">
            If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm"><strong>Email:</strong> privacy@extremestaffing.com</p>
            <p className="text-sm"><strong>Address:</strong> Extreme Staffing, Inc., Privacy Office</p>
            <p className="text-sm"><strong>Phone:</strong> 1-800-STAFFING</p>
          </div>
        </CardContent>
      </Card>

      {/* Changes to Policy */}
      <Card>
        <CardHeader>
          <CardTitle>8. Changes to This Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </CardContent>
      </Card>

      {/* Download Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold mb-1">Need this policy offline?</h4>
              <p className="text-sm text-muted-foreground">
                Download the complete PDF version for your records
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
