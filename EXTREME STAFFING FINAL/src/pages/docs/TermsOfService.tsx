import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { ArrowLeft, Download, FileText } from "lucide-react";

interface TermsOfServiceProps {
  onNavigate: (page: string) => void;
  userRole: string;
}

export function TermsOfService({ onNavigate }: TermsOfServiceProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'Terms-of-Service.pdf';
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
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="outline">Policy Document</Badge>
            </div>
            <h1 className="text-[#5E1916]">Terms of Service</h1>
            <p className="text-muted-foreground">
              Platform terms and conditions
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

      {/* Acceptance of Terms */}
      <Card>
        <CardHeader>
          <CardTitle>1. Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Welcome to Extreme Staffing. By accessing or using our event staffing management platform ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Platform.
          </p>
          <p className="text-sm text-muted-foreground">
            These Terms constitute a legally binding agreement between you and Extreme Staffing, Inc. ("Company," "we," "us," or "our"). Please read them carefully.
          </p>
        </CardContent>
      </Card>

      {/* Platform Description */}
      <Card>
        <CardHeader>
          <CardTitle>2. Platform Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-3">
            Extreme Staffing is a comprehensive event staffing management system that provides:
          </p>
          <ul className="text-sm space-y-2 ml-6 text-muted-foreground">
            <li>• Event planning and management tools</li>
            <li>• Staff scheduling and dispatch capabilities</li>
            <li>• Geo-location-based attendance tracking</li>
            <li>• Automated payroll processing with 5-hour minimum pay rule</li>
            <li>• Client, staff, admin, and manager portals</li>
            <li>• Financial management and reporting (admin only)</li>
            <li>• Integrated communication tools</li>
          </ul>
        </CardContent>
      </Card>

      {/* User Accounts and Registration */}
      <Card>
        <CardHeader>
          <CardTitle>3. User Accounts and Registration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">3.1 Account Creation</h4>
              <p className="text-sm text-muted-foreground">
                To use certain features of the Platform, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">3.2 Account Security</h4>
              <p className="text-sm text-muted-foreground">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">3.3 User Roles and Access Levels</h4>
              <p className="text-sm text-muted-foreground mb-2">
                The Platform provides different access levels based on user roles:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <ul className="text-sm space-y-2">
                  <li><strong>Admin:</strong> Full system access including financial data and payroll</li>
                  <li><strong>Manager:</strong> Event and staff management without financial access</li>
                  <li><strong>Client:</strong> Event booking and favorite staff selection</li>
                  <li><strong>Staff:</strong> Schedule viewing and timesheet submission</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">3.4 Age Requirement</h4>
              <p className="text-sm text-muted-foreground">
                You must be at least 18 years old to create an account and use the Platform.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acceptable Use */}
      <Card>
        <CardHeader>
          <CardTitle>4. Acceptable Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-3">
            You agree to use the Platform only for lawful purposes and in accordance with these Terms. You agree NOT to:
          </p>

          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <span className="text-red-600 font-bold mt-1">×</span>
              <span>Use the Platform in any way that violates any applicable federal, state, local, or international law</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-red-600 font-bold mt-1">×</span>
              <span>Transmit any false, misleading, or inaccurate information</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-red-600 font-bold mt-1">×</span>
              <span>Interfere with or disrupt the Platform or servers or networks connected to the Platform</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-red-600 font-bold mt-1">×</span>
              <span>Attempt to gain unauthorized access to any portion of the Platform or any other systems or networks</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-red-600 font-bold mt-1">×</span>
              <span>Use any automated system to access the Platform in a manner that sends more request messages than a human can reasonably produce</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-red-600 font-bold mt-1">×</span>
              <span>Share your account credentials with others or allow others to use your account</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-red-600 font-bold mt-1">×</span>
              <span>Falsify geo-location data or attempt to circumvent attendance tracking</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll and Payment Terms */}
      <Card>
        <CardHeader>
          <CardTitle>5. Payroll and Payment Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">5.1 5-Hour Minimum Pay Rule</h4>
              <p className="text-sm">
                All staff members assigned to events are guaranteed a minimum of 5 hours of pay, regardless of actual hours worked. This is a fundamental business rule and applies to all event assignments.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">5.2 Payroll Processing</h4>
              <p className="text-sm text-muted-foreground">
                Payroll is processed according to the schedule established by your organization. Staff members are responsible for submitting accurate timesheets in a timely manner. Late or inaccurate submissions may result in delayed payment.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">5.3 Payment Methods</h4>
              <p className="text-sm text-muted-foreground">
                Payment is made via direct deposit or other methods as configured by your organization. You are responsible for providing accurate banking information.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">5.4 Tax Withholding</h4>
              <p className="text-sm text-muted-foreground">
                Applicable federal, state, and local taxes will be withheld from your pay as required by law. You are responsible for providing accurate W-4 information and updating it as needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Intellectual Property */}
      <Card>
        <CardHeader>
          <CardTitle>6. Intellectual Property</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">6.1 Platform Ownership</h4>
            <p className="text-sm text-muted-foreground">
              The Platform and its entire contents, features, and functionality are owned by Extreme Staffing, Inc. and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2">6.2 Limited License</h4>
            <p className="text-sm text-muted-foreground">
              Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Platform for your internal business purposes.
            </p>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2">6.3 User Content</h4>
            <p className="text-sm text-muted-foreground">
              You retain ownership of any content you submit to the Platform. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content as necessary to provide the Platform services.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Geo-Location Services */}
      <Card>
        <CardHeader>
          <CardTitle>7. Geo-Location Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The Platform uses geo-location services to verify staff attendance at event venues. By using the Platform's mobile application to clock in/out, you consent to the collection and use of your location data for attendance verification and payroll purposes.
          </p>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <p className="text-sm text-amber-900">
              <strong>Important:</strong> Attempting to falsify or manipulate geo-location data is a violation of these Terms and may result in account termination and potential legal action.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy and Data Protection */}
      <Card>
        <CardHeader>
          <CardTitle>8. Privacy and Data Protection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your use of the Platform is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our data collection and use practices.
          </p>
          <Button variant="outline" onClick={() => onNavigate('privacy-policy')}>
            View Privacy Policy
          </Button>
        </CardContent>
      </Card>

      {/* Disclaimers and Limitations */}
      <Card>
        <CardHeader>
          <CardTitle>9. Disclaimers and Limitations of Liability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">9.1 Disclaimer of Warranties</h4>
              <p className="text-sm text-muted-foreground">
                THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">9.2 Limitation of Liability</h4>
              <p className="text-sm text-muted-foreground">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL EXTREME STAFFING, INC. BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Termination */}
      <Card>
        <CardHeader>
          <CardTitle>10. Termination</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We may terminate or suspend your account and access to the Platform immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Platform will immediately cease.
          </p>
        </CardContent>
      </Card>

      {/* Changes to Terms */}
      <Card>
        <CardHeader>
          <CardTitle>11. Changes to Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page and updating the "Last Updated" date. Your continued use of the Platform after such modifications constitutes your acceptance of the updated Terms.
          </p>
        </CardContent>
      </Card>

      {/* Governing Law */}
      <Card>
        <CardHeader>
          <CardTitle>12. Governing Law and Dispute Resolution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            These Terms shall be governed by and construed in accordance with the laws of the United States and the state in which Extreme Staffing, Inc. is incorporated, without regard to its conflict of law provisions.
          </p>
          <p className="text-sm text-muted-foreground">
            Any disputes arising from or relating to these Terms or your use of the Platform shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
          </p>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>13. Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            If you have any questions about these Terms, please contact us:
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm"><strong>Email:</strong> legal@extremestaffing.com</p>
            <p className="text-sm"><strong>Address:</strong> Extreme Staffing, Inc., Legal Department</p>
            <p className="text-sm"><strong>Phone:</strong> 1-800-STAFFING</p>
          </div>
        </CardContent>
      </Card>

      {/* Download Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold mb-1">Need these terms offline?</h4>
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
