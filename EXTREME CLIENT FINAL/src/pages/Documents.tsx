import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Progress } from "../components/ui/progress";
import { 
  Upload, 
  File, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  Eye,
  AlertTriangle,
  FileText,
  Shield,
  Camera
} from "lucide-react";

interface DocumentsProps {
  userRole: string;
  userId: string;
}

export function Documents({ userRole }: DocumentsProps) {
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mock documents data
  const documents = [
    {
      id: "doc-001",
      name: "Government ID",
      type: "identification",
      fileName: "drivers_license.pdf",
      uploadDate: "2024-01-15",
      status: "approved",
      expiryDate: "2027-01-15",
      required: true,
      description: "Valid government-issued photo ID"
    },
    {
      id: "doc-002", 
      name: "Food Handler License",
      type: "certification",
      fileName: "food_handler_cert.pdf",
      uploadDate: "2024-02-10",
      status: "approved",
      expiryDate: "2025-02-10",
      required: true,
      description: "Required for food service events"
    },
    {
      id: "doc-003",
      name: "Background Check",
      type: "verification",
      fileName: "background_check_2024.pdf",
      uploadDate: "2024-01-20",
      status: "pending",
      expiryDate: "2025-01-20",
      required: true,
      description: "Criminal background verification"
    },
    {
      id: "doc-004",
      name: "W-4 Form",
      type: "tax",
      fileName: "w4_form_2024.pdf",
      uploadDate: "2024-01-10",
      status: "approved",
      expiryDate: null,
      required: true,
      description: "Tax withholding form"
    },
    {
      id: "doc-005",
      name: "Direct Deposit Form",
      type: "banking",
      fileName: "direct_deposit.pdf",
      uploadDate: "2024-01-12",
      status: "approved",
      expiryDate: null,
      required: false,
      description: "Bank account information for payroll"
    },
    {
      id: "doc-006",
      name: "Emergency Contact",
      type: "personal",
      fileName: "emergency_contact.pdf",
      uploadDate: "2024-01-10",
      status: "approved",
      expiryDate: null,
      required: true,
      description: "Emergency contact information"
    },
    {
      id: "doc-007",
      name: "Professional References",
      type: "reference",
      fileName: "references.pdf",
      uploadDate: "2024-01-18",
      status: "rejected",
      expiryDate: null,
      required: false,
      description: "Professional work references",
      rejectionReason: "Contact information incomplete"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case "expired":
        return <Badge className="bg-orange-100 text-orange-700"><AlertTriangle className="h-3 w-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "identification": return <Shield className="h-4 w-4" />;
      case "certification": return <FileText className="h-4 w-4" />;
      case "verification": return <CheckCircle className="h-4 w-4" />;
      case "tax": return <File className="h-4 w-4" />;
      case "banking": return <File className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const documentStats = {
    total: documents.length,
    approved: documents.filter(d => d.status === "approved").length,
    pending: documents.filter(d => d.status === "pending").length,
    rejected: documents.filter(d => d.status === "rejected").length,
    required: documents.filter(d => d.required).length
  };

  const requiredDocuments = documents.filter(d => d.required);
  const completionRate = (requiredDocuments.filter(d => d.status === "approved").length / requiredDocuments.length) * 100;

  const expiringDocuments = documents.filter(d => {
    if (!d.expiryDate) return false;
    const expiryDate = new Date(d.expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow;
  });

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Documents</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Manage your required documents and certifications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            variant={completionRate === 100 ? "default" : "secondary"}
            className={completionRate === 100 ? "bg-success text-success-foreground" : ""}
          >
            {completionRate.toFixed(0)}% Complete
          </Badge>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Document Type</label>
                  <select className="w-full mt-1 p-2 border rounded">
                    <option>Select document type</option>
                    <option>ID/License</option>
                    <option>Certification</option>
                    <option>Background Check</option>
                    <option>Tax Form</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">File</label>
                  <Input type="file" className="mt-1" accept=".pdf,.jpg,.png" />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input placeholder="Brief description of the document" className="mt-1" />
                </div>
                {uploadProgress > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
                <Button className="w-full">Upload Document</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="adaptive-stats-grid">
        <Card className="p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              Total Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">{documentStats.total}</div>
            <p className="text-xs text-muted-foreground">{documentStats.required} required</p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">{completionRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Required docs completed</p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">{documentStats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="w-4 h-4" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">{expiringDocuments.length}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Overview */}
      <div className="space-y-4 sm:space-y-6">
        <div className="adaptive-content-grid">
          {/* Required Documents Status */}
          <Card className="p-6">
            <CardHeader className="px-0 pb-4">
              <CardTitle className="text-lg">Required Documents</CardTitle>
              <p className="text-sm text-muted-foreground">
                Complete all required documents
              </p>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-3">
                {requiredDocuments.slice(0, 4).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        doc.status === 'approved' ? 'bg-success' : 
                        doc.status === 'pending' ? 'bg-warning' : 'bg-destructive'
                      }`}>
                        {getTypeIcon(doc.type)}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{doc.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {doc.status === 'approved' ? 'Approved' : 
                           doc.status === 'pending' ? 'Under Review' : 'Action Required'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(doc.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Document Actions */}
          <Card className="p-6">
            <CardHeader className="px-0 pb-4">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Common document tasks
              </p>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Document
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="w-4 h-4 mr-2" />
                  View All Documents
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Download Archive
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Expiring Documents */}
          <Card className="p-6">
            <CardHeader className="px-0 pb-4">
              <CardTitle className="text-lg">Expiring Soon</CardTitle>
              <p className="text-sm text-muted-foreground">
                Documents needing renewal
              </p>
            </CardHeader>
            <CardContent className="px-0">
              {expiringDocuments.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-10 h-10 text-success mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">All documents are current</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expiringDocuments.map((doc) => (
                    <div key={doc.id} className="p-3 border border-warning rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">{doc.name}</h4>
                          <p className="text-xs text-muted-foreground">Expires: {doc.expiryDate}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Renew
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <CardHeader className="px-0 pb-4">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest document updates
              </p>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                  <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">Document approved</h4>
                    <p className="text-xs text-muted-foreground">Food Handler License</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 days ago</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                  <div className="w-8 h-8 bg-warning rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">Document submitted</h4>
                    <p className="text-xs text-muted-foreground">Background Check</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1 week ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Document Management */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="required">Required</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Library</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(doc.type)}
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">{doc.fileName}</p>
                          </div>
                          {doc.required && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{doc.type}</TableCell>
                      <TableCell>{doc.uploadDate}</TableCell>
                      <TableCell>{doc.expiryDate || "N/A"}</TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          {doc.status === "rejected" && (
                            <Button variant="ghost" size="sm">
                              <Upload className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="required" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requiredDocuments.map((doc) => (
                  <div key={doc.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(doc.type)}
                        <h3 className="font-semibold">{doc.name}</h3>
                      </div>
                      {getStatusBadge(doc.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{doc.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        {doc.status === "approved" ? (
                          <span className="text-green-600">✓ Completed</span>
                        ) : doc.status === "pending" ? (
                          <span className="text-yellow-600">⏳ Under Review</span>
                        ) : (
                          <span className="text-red-600">❌ Action Required</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {doc.status === "approved" ? (
                          <>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </>
                        ) : (
                          <Button size="sm">
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                          </Button>
                        )}
                      </div>
                    </div>
                    {doc.status === "rejected" && doc.rejectionReason && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <strong>Rejection Reason:</strong> {doc.rejectionReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.filter(d => d.status === "pending").map((doc) => (
                  <div key={doc.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(doc.type)}
                        <h3 className="font-semibold">{doc.name}</h3>
                      </div>
                      {getStatusBadge(doc.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploaded: {doc.uploadDate}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {documents.filter(d => d.status === "pending").length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No documents pending review
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expiringDocuments.map((doc) => (
                  <div key={doc.id} className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(doc.type)}
                        <h3 className="font-semibold">{doc.name}</h3>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Expires Soon
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-orange-700">Expires: {doc.expiryDate}</span>
                      <Button size="sm">
                        <Upload className="h-4 w-4 mr-1" />
                        Renew Document
                      </Button>
                    </div>
                  </div>
                ))}
                {expiringDocuments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No documents expiring in the next 30 days
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}