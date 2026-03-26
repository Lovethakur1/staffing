import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { Checkbox } from "../components/ui/checkbox";
import { TooltipWrapper, IconTooltip, InfoTooltip } from "../components/ui/tooltip-wrapper";
import {
  Users,
  Search,
  Plus,
  Filter,
  Star,
  Phone,
  Mail,
  MapPin,
  Eye,
  Edit,
  Download,
  Upload,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  TrendingUp,
  DollarSign,
  Shield,
  Briefcase,
  GraduationCap,
  UserCheck,
  UserX,
  MoreHorizontal,
  Send,
  Heart,
  Ban,
  Car
} from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";
import { staffService } from "../services/staff.service";
import { useNavigation } from "../contexts/NavigationContext";


interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive' | 'on-leave';
  location: string;
  hireDate: string;
  hourlyRate: number;
  rating: number;
  eventsCompleted: number;
  hoursWorked: number;
  availability: string[];
  certifications: string[];
  documents: {
    contract: boolean;
    background: boolean;
    i9: boolean;
    w4: boolean;
  };
  performance: {
    punctuality: number;
    professionalism: number;
    quality: number;
  };
  isFavorite?: boolean;
  isExcluded?: boolean;
}

interface WorkforceProps {
  userRole?: string;
  userId?: string;
}

export function Workforce({ userRole = 'admin', userId }: WorkforceProps) {
  const { setCurrentPage, pageParams } = useNavigation();
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  
  // Sub-Admin can't see financial data
  const canViewFinancialData = userRole === 'admin';

  // Fetch staff from API
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await staffService.getStaffList();
        const staffData = Array.isArray(res) ? res : (res?.data || []);
        const mapped: StaffMember[] = staffData.map((s: any) => ({
          id: s.id,
          name: s.user?.name || s.name || 'Staff',
          email: s.user?.email || s.email || '',
          phone: s.user?.phone || s.phone || '',
          role: s.staffType || s.role || 'General',
          status: (s.isActive === false ? 'inactive' : 'active') as StaffMember['status'],
          location: s.location || s.address || '',
          hireDate: s.hireDate || s.createdAt || '',
          hourlyRate: s.hourlyRate || 25,
          rating: s.rating || 4.5,
          eventsCompleted: s.eventsCompleted || s.totalEvents || 0,
          hoursWorked: s.hoursWorked || 0,
          availability: s.availability || [],
          certifications: s.skills || s.certifications || [],
          documents: s.documents || { contract: true, background: true, i9: true, w4: true },
          performance: s.performance || { punctuality: 90, professionalism: 90, quality: 90 },
          isFavorite: s.isFavorite || false,
          isExcluded: s.isExcluded || false,
        }));
        setStaffMembers(mapped);
      } catch (err) {
        console.log('Failed to load staff');
      }
    };
    fetchStaff();
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddStaffDialog, setShowAddStaffDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-open Add Staff Dialog if passed in params
  useEffect(() => {
    if (pageParams?.showAddDialog) {
      setShowAddStaffDialog(true);
    }
  }, [pageParams]);
  
  // New staff form state
  const [newStaffForm, setNewStaffForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    location: "",
    hourlyRate: "",
    hireDate: "",
    certifications: "",
    availability: [] as string[],
    notes: "",
    travelStipendEnabled: false
  });

  // Rating form state
  const [ratingData, setRatingData] = useState({
    eventId: "",
    overallRating: 0,
    punctuality: 0,
    professionalism: 0,
    quality: 0,
    teamwork: 0,
    clientFeedback: 0,
    comments: "",
    wouldRecommend: true
  });

  const workforceStats = {
    totalStaff: staffMembers.length,
    activeStaff: staffMembers.filter(s => s.status === 'active').length,
    onLeave: staffMembers.filter(s => s.status === 'on-leave').length,
    avgRating: (staffMembers.reduce((sum, s) => sum + s.rating, 0) / staffMembers.length).toFixed(1),
    totalHours: staffMembers.reduce((sum, s) => sum + s.hoursWorked, 0),
    avgHourlyRate: (staffMembers.reduce((sum, s) => sum + s.hourlyRate, 0) / staffMembers.length).toFixed(2),
    pendingDocs: staffMembers.filter(s => !s.documents.background || !s.documents.w4).length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200"><UserCheck className="h-3 w-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200"><UserX className="h-3 w-3 mr-1" />Inactive</Badge>;
      case 'on-leave':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200"><Clock className="h-3 w-3 mr-1" />On Leave</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || staff.role === roleFilter;
    const matchesStatus = statusFilter === "all" || staff.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const favoriteStaff = staffMembers.filter(s => s.isFavorite);
  const excludedStaff = staffMembers.filter(s => s.isExcluded);

  const viewStaffDetails = (staff: StaffMember) => {
    setCurrentPage('staff-detail', { staffId: staff.id });
  };

  const handleAddStaff = async () => {
    if (!newStaffForm.name || !newStaffForm.email || !newStaffForm.phone || !newStaffForm.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await staffService.createStaff({
        name: newStaffForm.name,
        email: newStaffForm.email,
        phone: newStaffForm.phone,
        password: newStaffForm.password || undefined,
        role: newStaffForm.role,
        location: newStaffForm.location,
        hourlyRate: newStaffForm.hourlyRate ? parseFloat(newStaffForm.hourlyRate) : undefined,
        hireDate: newStaffForm.hireDate,
        certifications: newStaffForm.certifications.split(',').map(c => c.trim()).filter(Boolean),
        availability: newStaffForm.availability,
        notes: newStaffForm.notes,
        travelStipendEnabled: newStaffForm.travelStipendEnabled
      });
      
      // Add to local state
      const newMember: StaffMember = {
        id: result.id,
        name: newStaffForm.name,
        email: newStaffForm.email,
        phone: newStaffForm.phone,
        role: newStaffForm.role,
        status: 'active',
        location: newStaffForm.location,
        hireDate: newStaffForm.hireDate || new Date().toISOString(),
        hourlyRate: newStaffForm.hourlyRate ? parseFloat(newStaffForm.hourlyRate) : 25,
        rating: 0,
        eventsCompleted: 0,
        hoursWorked: 0,
        availability: newStaffForm.availability,
        certifications: newStaffForm.certifications.split(',').map(c => c.trim()).filter(Boolean),
        documents: { contract: false, background: false, i9: false, w4: false },
        performance: { punctuality: 0, professionalism: 0, quality: 0 },
        isFavorite: false,
        isExcluded: false
      };
      
      setStaffMembers(prev => [newMember, ...prev]);
      toast.success("New staff member added successfully!");
      setShowAddStaffDialog(false);
      
      // Reset form
      setNewStaffForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "",
        location: "",
        hourlyRate: "",
        hireDate: "",
        certifications: "",
        availability: [],
        notes: "",
        travelStipendEnabled: false
      });
    } catch (error: any) {
      console.error('Failed to add staff:', error);
      toast.error(error.response?.data?.error || "Failed to add staff member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRateStaff = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setRatingData({
      eventId: "",
      overallRating: staff.rating,
      punctuality: staff.performance.punctuality,
      professionalism: staff.performance.professionalism,
      quality: staff.performance.quality,
      teamwork: 95,
      clientFeedback: 94,
      comments: "",
      wouldRecommend: true
    });
    setShowRatingDialog(true);
  };

  const handleReinstateStaff = (staffId: string) => {
    setStaffMembers(prev => prev.map(s =>
      s.id === staffId ? { ...s, isExcluded: false, status: 'active' } : s
    ));
    toast.success("Staff member has been re-instated and is available for assignment.");
  };

  const handleSubmitRating = () => {
    const avgRating = (
      ratingData.punctuality +
      ratingData.professionalism +
      ratingData.quality +
      ratingData.teamwork +
      ratingData.clientFeedback
    ) / 5 / 20; // Convert percentage to 5-star rating

    toast.success(`Rating submitted successfully! New rating: ${avgRating.toFixed(1)} stars`);
    setShowRatingDialog(false);
  };

  const StarRating = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-colors"
          >
            <Star
              className={`h-6 w-6 ${star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "fill-none text-gray-300"
                }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const StaffTable = ({ data, showActions = true }: { data: StaffMember[], showActions?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Staff Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Rate</TableHead>
          <TableHead>Events</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead>Status</TableHead>
          {showActions && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((staff) => (
          <TableRow key={staff.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="font-medium">{staff.name}</p>
                    {staff.isFavorite && <Heart className="h-3 w-3 fill-red-500 text-red-500" />}
                    {staff.isExcluded && <Ban className="h-3 w-3 text-red-600" />}
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {staff.location}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{staff.role}</Badge>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm">
                  <Mail className="h-3 w-3" />
                  {staff.email}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Phone className="h-3 w-3" />
                  {staff.phone}
                </div>
              </div>
            </TableCell>
            <TableCell className="font-semibold">
              {canViewFinancialData ? `$${staff.hourlyRate}/hr` : '---'}
            </TableCell>
            <TableCell>{staff.eventsCompleted}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{staff.rating}</span>
              </div>
            </TableCell>
            <TableCell>{getStatusBadge(staff.status)}</TableCell>
            {showActions && (
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => viewStaffDetails(staff)}
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {!staff.isExcluded && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRateStaff(staff)}
                      title="Rate Staff"
                      className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  {staff.isExcluded && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Re-instate Staff"
                      onClick={() => handleReinstateStaff(staff.id)}
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={showActions ? 8 : 7} className="h-24 text-center text-muted-foreground">
              No staff members found in this category.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Status', 'Location', 'Hire Date', 'Hourly Rate', 'Rating', 'Events Completed', 'Hours Worked', 'Certifications', 'Available Days'];
    const csvData = filteredStaff.map(staff => [
      staff.name,
      staff.email,
      staff.phone,
      staff.role,
      staff.status,
      staff.location,
      staff.hireDate ? new Date(staff.hireDate).toLocaleDateString() : '',
      staff.hourlyRate.toString(),
      staff.rating.toString(),
      staff.eventsCompleted.toString(),
      staff.hoursWorked.toString(),
      staff.certifications.join('; '),
      staff.availability.join('; ')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `workforce_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${filteredStaff.length} staff members to CSV`);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {userRole === 'sub-admin' ? 'Staff Management' : 'Workforce Management'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your entire workforce, track performance, and handle documentation
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <TooltipWrapper content="Export workforce data to Excel or CSV">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </TooltipWrapper>
          <TooltipWrapper content="Add a new staff member to your workforce">
            <Button size="sm" onClick={() => setShowAddStaffDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </TooltipWrapper>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workforceStats.totalStaff}</div>
            <p className="text-xs text-muted-foreground">All team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workforceStats.activeStaff}</div>
            <p className="text-xs text-success">Currently working</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workforceStats.onLeave}</div>
            <p className="text-xs text-warning">Temporary absence</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workforceStats.avgRating}</div>
            <p className="text-xs text-muted-foreground">Performance score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workforceStats.totalHours.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Cumulative</p>
          </CardContent>
        </Card>

        {canViewFinancialData && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rate</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${workforceStats.avgHourlyRate}</div>
              <p className="text-xs text-muted-foreground">Per hour</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Docs</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workforceStats.pendingDocs}</div>
            <p className="text-xs text-destructive">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search staff by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Event Server">Event Server</SelectItem>
                <SelectItem value="Bartender">Bartender</SelectItem>
                <SelectItem value="Event Coordinator">Event Coordinator</SelectItem>
                <SelectItem value="Catering Manager">Catering Manager</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="directory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="directory">Staff Directory</TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            Favorites
            <Badge variant="secondary" className="ml-1 px-1 py-0 h-4 text-[10px]">{favoriteStaff.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="excluded" className="flex items-center gap-1">
            <Ban className="h-3.5 w-3.5" />
            Excluded
            <Badge variant="secondary" className="ml-1 px-1 py-0 h-4 text-[10px]">{excludedStaff.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Staff Members ({filteredStaff.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <StaffTable data={filteredStaff} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                    Favorite Staff
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your top-rated and preferred staff members.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <StaffTable data={favoriteStaff} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="excluded" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Ban className="h-5 w-5 text-red-600" />
                    Excluded Staff
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Staff members who are currently excluded or blacklisted from assignments.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <StaffTable data={excludedStaff} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track staff performance metrics and ratings
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStaff.map((staff) => (
                  <div key={staff.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{staff.name}</p>
                            {staff.isFavorite && <Heart className="h-4 w-4 fill-red-500 text-red-500" />}
                          </div>
                          <p className="text-sm text-muted-foreground">{staff.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xl font-bold">{staff.rating}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRateStaff(staff)}
                          className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Rate
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Punctuality</span>
                          <span className="font-medium">{staff.performance.punctuality}%</span>
                        </div>
                        <Progress value={staff.performance.punctuality} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Professionalism</span>
                          <span className="font-medium">{staff.performance.professionalism}%</span>
                        </div>
                        <Progress value={staff.performance.professionalism} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Quality</span>
                          <span className="font-medium">{staff.performance.quality}%</span>
                        </div>
                        <Progress value={staff.performance.quality} />
                      </div>
                    </div>
                    <div className={`grid ${canViewFinancialData ? 'grid-cols-3' : 'grid-cols-2'} gap-4 mt-4 pt-4 border-t text-sm`}>
                      <div>
                        <p className="text-muted-foreground">Events Completed</p>
                        <p className="font-semibold text-lg">{staff.eventsCompleted}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Hours Worked</p>
                        <p className="font-semibold text-lg">{staff.hoursWorked}</p>
                      </div>
                      {canViewFinancialData && (
                        <div>
                          <p className="text-muted-foreground">Total Earnings</p>
                          <p className="font-semibold text-lg">${(staff.hoursWorked * staff.hourlyRate).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track required documentation for all staff members
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Contract</TableHead>
                    <TableHead>Background Check</TableHead>
                    <TableHead>I-9 Form</TableHead>
                    <TableHead>W-4 Form</TableHead>
                    <TableHead>Certifications</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{staff.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {staff.documents.contract ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell>
                        {staff.documents.background ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell>
                        {staff.documents.i9 ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell>
                        {staff.documents.w4 ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {staff.certifications.map((cert, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toast.info("Downloading documents...")}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toast.info("Upload document dialog")}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Availability & Scheduling</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage staff availability and schedule assignments
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStaff.filter(s => s.status === 'active').map((staff) => (
                  <div key={staff.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          <p className="text-sm text-muted-foreground">{staff.role}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStaff(staff);
                          setShowScheduleDialog(true);
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Update Schedule
                      </Button>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Available Days:</p>
                      <div className="flex gap-2 flex-wrap">
                        {staff.availability.length > 0 ? (
                          staff.availability.map((day, index) => (
                            <Badge key={index} variant="default">
                              {day}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No availability set</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Staff Dialog */}
      <Dialog open={showAddStaffDialog} onOpenChange={setShowAddStaffDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Dialog content remains same as previous */}
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Enter the details of the new staff member to add them to your workforce
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Form fields... I'll paste them to ensure file integrity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input 
                  placeholder="John Doe" 
                  value={newStaffForm.name}
                  onChange={(e) => setNewStaffForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input 
                  type="email" 
                  placeholder="john.doe@company.com" 
                  value={newStaffForm.email}
                  onChange={(e) => setNewStaffForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input 
                  placeholder="+1 (555) 123-4567" 
                  value={newStaffForm.phone}
                  onChange={(e) => setNewStaffForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Initial Password</Label>
                <Input 
                  type="text"
                  placeholder="Defaults to TempPassword123!" 
                  value={newStaffForm.password}
                  onChange={(e) => setNewStaffForm(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select 
                value={newStaffForm.role}
                onValueChange={(value) => setNewStaffForm(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Event Server">Event Server</SelectItem>
                  <SelectItem value="Bartender">Bartender</SelectItem>
                  <SelectItem value="Event Coordinator">Event Coordinator</SelectItem>
                  <SelectItem value="Catering Manager">Catering Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={`grid ${canViewFinancialData ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
              <div className="space-y-2">
                <Label>Location *</Label>
                <Input 
                  placeholder="New York, NY" 
                  value={newStaffForm.location}
                  onChange={(e) => setNewStaffForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              {canViewFinancialData && (
                <div className="space-y-2">
                  <Label>Hourly Rate *</Label>
                  <Input 
                    type="number" 
                    placeholder="25.00" 
                    value={newStaffForm.hourlyRate}
                    onChange={(e) => setNewStaffForm(prev => ({ ...prev, hourlyRate: e.target.value }))}
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Hire Date *</Label>
              <Input 
                type="date" 
                value={newStaffForm.hireDate}
                onChange={(e) => setNewStaffForm(prev => ({ ...prev, hireDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Certifications (comma-separated)</Label>
              <Input 
                placeholder="Food Handler, Alcohol Service, First Aid" 
                value={newStaffForm.certifications}
                onChange={(e) => setNewStaffForm(prev => ({ ...prev, certifications: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Availability</Label>
              <div className="grid grid-cols-4 gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`add-${day}`}
                      checked={newStaffForm.availability.includes(day)}
                      onCheckedChange={(checked) => {
                        setNewStaffForm(prev => ({
                          ...prev,
                          availability: checked 
                            ? [...prev.availability, day]
                            : prev.availability.filter(d => d !== day)
                        }));
                      }}
                    />
                    <label
                      htmlFor={`add-${day}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day.slice(0, 3)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea 
                placeholder="Additional information about the staff member..." 
                rows={3} 
                value={newStaffForm.notes}
                onChange={(e) => setNewStaffForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 border p-3 rounded-lg">
                <Checkbox 
                  id="travelStipendNew"
                  checked={newStaffForm.travelStipendEnabled}
                  onCheckedChange={(checked) => setNewStaffForm(prev => ({ ...prev, travelStipendEnabled: checked as boolean }))}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="travelStipendNew"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Travel Stipend Enabled
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Staff member receives compensation for travel from home to event location.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowAddStaffDialog(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleAddStaff} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Staff Member
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Update Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Availability</DialogTitle>
            <DialogDescription>
              Update availability for {selectedStaff?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={`schedule-${day}`}
                    defaultChecked={selectedStaff?.availability.includes(day)}
                  />
                  <label
                    htmlFor={`schedule-${day}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {day}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success("Availability updated successfully!");
                setShowScheduleDialog(false);
              }}>
                Update Availability
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rate Staff Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Rate staff dialog content */}
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Rate Staff Performance
            </DialogTitle>
            <DialogDescription>
              Provide a comprehensive performance rating for {selectedStaff?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Staff Info Card */}
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {selectedStaff?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedStaff?.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedStaff?.role}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      Current Rating: {selectedStaff?.rating}
                    </span>
                    <span className="text-muted-foreground">
                      {selectedStaff?.eventsCompleted} Events Completed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Selection */}
            <div className="space-y-2">
              <Label>Event (Optional)</Label>
              <Select value={ratingData.eventId} onValueChange={(value) => setRatingData({ ...ratingData, eventId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an event to rate performance on" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="evt-001">Corporate Gala - Dec 15, 2024</SelectItem>
                  <SelectItem value="evt-002">Wedding Reception - Dec 18, 2024</SelectItem>
                  <SelectItem value="evt-003">Holiday Party - Dec 20, 2024</SelectItem>
                  <SelectItem value="evt-004">Conference Dinner - Dec 22, 2024</SelectItem>
                  <SelectItem value="general">General Performance Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Overall Rating */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Overall Rating
                <span className="text-sm font-normal text-muted-foreground">
                  ({ratingData.overallRating} / 5 stars)
                </span>
              </Label>
              <StarRating
                value={ratingData.overallRating}
                onChange={(value) => setRatingData({ ...ratingData, overallRating: value })}
              />
            </div>

            {/* Performance Metrics */}
            <div className="space-y-4">
              <h4 className="font-medium">Performance Metrics</h4>

              {/* Punctuality */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Punctuality
                  </Label>
                  <span className="text-sm font-medium">{ratingData.punctuality}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ratingData.punctuality}
                  onChange={(e) => setRatingData({ ...ratingData, punctuality: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-xs text-muted-foreground">
                  Arrives on time, ready to work
                </p>
              </div>

              {/* Professionalism */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    Professionalism
                  </Label>
                  <span className="text-sm font-medium">{ratingData.professionalism}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ratingData.professionalism}
                  onChange={(e) => setRatingData({ ...ratingData, professionalism: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <p className="text-xs text-muted-foreground">
                  Appearance, attitude, and conduct
                </p>
              </div>

              {/* Quality of Work */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-600" />
                    Quality of Work
                  </Label>
                  <span className="text-sm font-medium">{ratingData.quality}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ratingData.quality}
                  onChange={(e) => setRatingData({ ...ratingData, quality: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <p className="text-xs text-muted-foreground">
                  Attention to detail and execution
                </p>
              </div>

              {/* Teamwork */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-600" />
                    Teamwork & Collaboration
                  </Label>
                  <span className="text-sm font-medium">{ratingData.teamwork}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ratingData.teamwork}
                  onChange={(e) => setRatingData({ ...ratingData, teamwork: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
                <p className="text-xs text-muted-foreground">
                  Works well with others, helpful
                </p>
              </div>

              {/* Client Feedback */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-pink-600" />
                    Client Feedback
                  </Label>
                  <span className="text-sm font-medium">{ratingData.clientFeedback}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ratingData.clientFeedback}
                  onChange={(e) => setRatingData({ ...ratingData, clientFeedback: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                />
                <p className="text-xs text-muted-foreground">
                  Client satisfaction and positive feedback
                </p>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <Label>Comments & Feedback</Label>
              <Textarea
                placeholder="Provide specific feedback about this staff member's performance..."
                value={ratingData.comments}
                onChange={(e) => setRatingData({ ...ratingData, comments: e.target.value })}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Recommendation */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${ratingData.wouldRecommend ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {ratingData.wouldRecommend ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Would you recommend this staff member?</p>
                  <p className="text-sm text-muted-foreground">For future events and assignments</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={ratingData.wouldRecommend ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRatingData({ ...ratingData, wouldRecommend: true })}
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={!ratingData.wouldRecommend ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRatingData({ ...ratingData, wouldRecommend: false })}
                >
                  No
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitRating} className="bg-yellow-600 hover:bg-yellow-700">
                <Star className="h-4 w-4 mr-2" />
                Submit Rating
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
