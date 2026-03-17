import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Upload,
  Download,
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Award,
  XCircle,
  Bell,
  TrendingDown
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner@2.0.3";

interface CertificationsProps {
  userRole: string;
  userId: string;
}

interface Certification {
  id: string;
  staffId: string;
  staffName: string;
  certType: string;
  certNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring-soon' | 'expired' | 'pending-verification';
  daysUntilExpiry: number;
  documentUrl?: string;
  verifiedBy?: string;
  verifiedDate?: string;
  notes?: string;
}

export function Certifications({ userRole }: CertificationsProps) {
  const { setCurrentPage } = useNavigation();
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [certTypeFilter, setCertTypeFilter] = useState("all");
  const [currentPage, setCurrentPageNum] = useState(1);
  const itemsPerPage = 10;

  // Mock certification data
  const allCertifications: Certification[] = [
    {
      id: "CERT-001",
      staffId: "ST-101",
      staffName: "Michael Chen",
      certType: "Food Handler",
      certNumber: "FH-2024-8934",
      issueDate: "2024-06-15",
      expiryDate: "2025-06-15",
      status: "valid",
      daysUntilExpiry: 247,
      documentUrl: "/docs/cert-001.pdf",
      verifiedBy: "Admin User",
      verifiedDate: "2024-06-16"
    },
    {
      id: "CERT-002",
      staffId: "ST-101",
      staffName: "Michael Chen",
      certType: "ServSafe",
      certNumber: "SS-CA-493847",
      issueDate: "2023-09-20",
      expiryDate: "2024-11-20",
      status: "expiring-soon",
      daysUntilExpiry: 40,
      documentUrl: "/docs/cert-002.pdf",
      verifiedBy: "Admin User",
      verifiedDate: "2023-09-21",
      notes: "Renewal reminder sent to staff"
    },
    {
      id: "CERT-003",
      staffId: "ST-102",
      staffName: "Sarah Johnson",
      certType: "TIPS Alcohol",
      certNumber: "TIPS-2024-7639",
      issueDate: "2024-03-10",
      expiryDate: "2027-03-10",
      status: "valid",
      daysUntilExpiry: 880,
      documentUrl: "/docs/cert-003.pdf",
      verifiedBy: "Admin User",
      verifiedDate: "2024-03-11"
    },
    {
      id: "CERT-004",
      staffId: "ST-102",
      staffName: "Sarah Johnson",
      certType: "Food Handler",
      certNumber: "FH-2024-1847",
      issueDate: "2024-01-05",
      expiryDate: "2025-01-05",
      status: "valid",
      daysUntilExpiry: 86,
      documentUrl: "/docs/cert-004.pdf",
      verifiedBy: "Admin User",
      verifiedDate: "2024-01-06"
    },
    {
      id: "CERT-005",
      staffId: "ST-103",
      staffName: "David Martinez",
      certType: "CPR & First Aid",
      certNumber: "CPR-2023-9372",
      issueDate: "2023-08-15",
      expiryDate: "2024-08-15",
      status: "expired",
      daysUntilExpiry: -56,
      documentUrl: "/docs/cert-005.pdf",
      verifiedBy: "Admin User",
      verifiedDate: "2023-08-16",
      notes: "URGENT: Expired certification - staff cannot work medical support events"
    },
    {
      id: "CERT-006",
      staffId: "ST-104",
      staffName: "Emma Davis",
      certType: "Food Handler",
      certNumber: "FH-2024-5829",
      issueDate: "2024-09-01",
      expiryDate: "2025-09-01",
      status: "valid",
      daysUntilExpiry: 325,
      documentUrl: "/docs/cert-006.pdf",
      verifiedBy: "Admin User",
      verifiedDate: "2024-09-02"
    },
    {
      id: "CERT-007",
      staffId: "ST-105",
      staffName: "James Wilson",
      certType: "ServSafe",
      certNumber: "",
      issueDate: "",
      expiryDate: "",
      status: "pending-verification",
      daysUntilExpiry: 0,
      notes: "Document uploaded, awaiting admin verification"
    },
    {
      id: "CERT-008",
      staffId: "ST-106",
      staffName: "Lisa Anderson",
      certType: "TIPS Alcohol",
      certNumber: "TIPS-2024-8472",
      issueDate: "2024-07-20",
      expiryDate: "2027-07-20",
      status: "valid",
      daysUntilExpiry: 1013,
      documentUrl: "/docs/cert-008.pdf",
      verifiedBy: "Admin User",
      verifiedDate: "2024-07-21"
    },
    {
      id: "CERT-009",
      staffId: "ST-107",
      staffName: "Robert Taylor",
      certType: "Security License",
      certNumber: "SEC-CA-38475",
      issueDate: "2024-02-10",
      expiryDate: "2026-02-10",
      status: "valid",
      daysUntilExpiry: 487,
      documentUrl: "/docs/cert-009.pdf",
      verifiedBy: "Admin User",
      verifiedDate: "2024-02-11"
    },
    {
      id: "CERT-010",
      staffId: "ST-108",
      staffName: "Jennifer Lee",
      certType: "CPR & First Aid",
      certNumber: "CPR-2024-4721",
      issueDate: "2024-05-15",
      expiryDate: "2024-11-15",
      status: "expiring-soon",
      daysUntilExpiry: 35,
      documentUrl: "/docs/cert-010.pdf",
      verifiedBy: "Admin User",
      verifiedDate: "2024-05-16",
      notes: "Renewal notification sent"
    }
  ];

  // Summary stats
  const stats = {
    total: allCertifications.length,
    valid: allCertifications.filter(c => c.status === 'valid').length,
    expiringSoon: allCertifications.filter(c => c.status === 'expiring-soon').length,
    expired: allCertifications.filter(c => c.status === 'expired').length,
    pending: allCertifications.filter(c => c.status === 'pending-verification').length,
    complianceRate: ((allCertifications.filter(c => c.status === 'valid' || c.status === 'expiring-soon').length / 
                      allCertifications.length) * 100).toFixed(0)
  };

  const getStatusBadge = (status: string, daysUntilExpiry: number) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Valid</Badge>;
      case "expiring-soon":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100"><Clock className="h-3 w-3 mr-1" />Expires in {daysUntilExpiry}d</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      case "pending-verification":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Eye className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Filter certifications
  const filteredCertifications = allCertifications.filter(cert => {
    const matchesSearch = cert.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.certNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    const matchesType = certTypeFilter === "all" || cert.certType === certTypeFilter;
    const matchesTab = selectedTab === "all" || 
                      (selectedTab === "expiring" && (cert.status === 'expiring-soon' || cert.status === 'expired')) ||
                      (selectedTab === "pending" && cert.status === 'pending-verification');
    return matchesSearch && matchesStatus && matchesType && matchesTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCertifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCertifications = filteredCertifications.slice(startIndex, startIndex + itemsPerPage);

  // Get unique cert types
  const certTypes = Array.from(new Set(allCertifications.map(c => c.certType))).filter(Boolean);

  const handleVerify = (cert: Certification) => {
    toast.success(`Certification ${cert.id} verified successfully`);
  };

  const handleSendReminder = (cert: Certification) => {
    toast.success(`Renewal reminder sent to ${cert.staffName}`);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Certification & Compliance</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Track staff certifications and ensure compliance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-sangria hover:bg-merlot">
            <Upload className="h-4 w-4 mr-2" />
            Upload Certification
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Certs</p>
              <p className="text-xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valid</p>
              <p className="text-xl font-semibold">{stats.valid}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expiring</p>
              <p className="text-xl font-semibold">{stats.expiringSoon}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expired</p>
              <p className="text-xl font-semibold">{stats.expired}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Compliance</p>
              <p className="text-xl font-semibold">{stats.complianceRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alert Banner for Expiring/Expired */}
      {(stats.expiringSoon > 0 || stats.expired > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900">Certification Compliance Alert</h4>
              <p className="text-sm text-red-700 mt-1">
                {stats.expired > 0 && `${stats.expired} certification(s) have expired. `}
                {stats.expiringSoon > 0 && `${stats.expiringSoon} certification(s) expiring within 60 days. `}
                Take action to maintain compliance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All Certifications</TabsTrigger>
          <TabsTrigger value="expiring">
            Expiring/Expired
            {(stats.expiringSoon + stats.expired) > 0 && (
              <Badge className="ml-2 bg-red-500 text-white h-5 w-5 p-0 flex items-center justify-center">
                {stats.expiringSoon + stats.expired}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Verification
            {stats.pending > 0 && (
              <Badge className="ml-2 bg-blue-500 text-white h-5 w-5 p-0 flex items-center justify-center">
                {stats.pending}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {/* Certifications Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Certifications</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search certifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full sm:w-[250px]"
                    />
                  </div>

                  {/* Type Filter */}
                  <Select value={certTypeFilter} onValueChange={setCertTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <FileText className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {certTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="valid">Valid</SelectItem>
                      <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="pending-verification">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Staff Member</TableHead>
                      <TableHead className="font-semibold">Certification Type</TableHead>
                      <TableHead className="font-semibold">Cert Number</TableHead>
                      <TableHead className="font-semibold">Issue Date</TableHead>
                      <TableHead className="font-semibold">Expiry Date</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCertifications.length > 0 ? (
                      paginatedCertifications.map((cert) => (
                        <TableRow key={cert.id} className="hover:bg-muted/30">
                          <TableCell>
                            <div>
                              <p className="font-medium">{cert.staffName}</p>
                              <p className="text-xs text-muted-foreground">{cert.staffId}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{cert.certType}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{cert.certNumber || '-'}</TableCell>
                          <TableCell className="text-sm">
                            {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(cert.status, cert.daysUntilExpiry)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {cert.documentUrl && (
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              {cert.status === 'pending-verification' ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleVerify(cert)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              ) : (cert.status === 'expiring-soon' || cert.status === 'expired') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSendReminder(cert)}
                                >
                                  <Bell className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No certifications found</p>
                          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCertifications.length)} of {filteredCertifications.length} certifications
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageNum(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPageNum(page)}
                          className={currentPage === page ? "bg-sangria hover:bg-merlot" : ""}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageNum(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
