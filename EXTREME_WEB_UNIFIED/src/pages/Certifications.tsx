import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { staffService } from "../services/staff.service";

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

export function Certifications({ userRole, userId }: CertificationsProps) {
  const { setCurrentPage } = useNavigation();
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [certTypeFilter, setCertTypeFilter] = useState("all");
  const [currentPage, setCurrentPageNum] = useState(1);
  const itemsPerPage = 10;
  const [allCertifications, setAllCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const res = await staffService.getAllCertifications();
        const certs = Array.isArray(res) ? res : (res?.data || []);
        setAllCertifications(certs.map((c: any) => {
          const expiry = c.expiryDate ? new Date(c.expiryDate) : null;
          const now = new Date();
          const daysUntil = expiry ? Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
          let status: Certification['status'] = 'valid';
          if (!c.verifiedDate && !c.verifiedBy) status = 'pending-verification';
          else if (daysUntil < 0) status = 'expired';
          else if (daysUntil < 60) status = 'expiring-soon';
          return {
            id: c.id,
            staffId: c.staffId || '',
            staffName: c.staff?.user?.name || c.staffName || '',
            certType: c.type || c.certType || '',
            certNumber: c.certNumber || c.number || '',
            issueDate: c.issueDate || c.createdAt || '',
            expiryDate: c.expiryDate || '',
            status: (c.status || status) as Certification['status'],
            daysUntilExpiry: daysUntil,
            documentUrl: c.documentUrl || c.fileUrl || undefined,
            verifiedBy: c.verifiedBy || undefined,
            verifiedDate: c.verifiedDate || undefined,
            notes: c.notes || undefined,
          };
        }));
      } catch {
        // Failed to load certifications
      }
      setLoading(false);
    };
    fetchCertifications();
  }, [userId]);

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

  const handleVerify = async (cert: Certification) => {
    try {
      await staffService.verifyCertification(cert.id, {});
      setAllCertifications(prev => prev.map(c =>
        c.id === cert.id ? { ...c, status: 'valid' as const, verifiedBy: 'admin', verifiedDate: new Date().toISOString() } : c
      ));
      toast.success(`Certification "${cert.certType}" verified successfully`);
    } catch {
      toast.error('Failed to verify certification');
    }
  };

  const handleSendReminder = (cert: Certification) => {
    toast.success(`Renewal reminder sent to ${cert.staffName}`);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">
              {userRole === 'manager' || userRole === 'staff' ? 'My Certifications' : 'Certification & Compliance'}
            </h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {userRole === 'sub-admin' ? 'Sub-Admin' : userRole === 'manager' ? 'Manager' : 'Staff'}
            </Badge>
          </div>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            {userRole === 'manager' || userRole === 'staff' ? 'View and manage your certifications' : 'Track staff certifications and ensure compliance'}
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
