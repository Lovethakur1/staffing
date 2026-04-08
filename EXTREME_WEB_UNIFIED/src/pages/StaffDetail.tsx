import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Progress } from "../components/ui/progress";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Award,
  FileText,
  Download,
  Upload,
  Edit,
  UserCheck,
  UserX,
  TrendingUp,
  Briefcase,
  Shield,
  Building2,
  Users,
  Send,
  Activity,
  Car,
  Save,
  X,
  ChevronRight,
  Eye
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner";
import { staffService } from "../services/staff.service";
import { shiftService } from "../services/shift.service";
import api from "../services/api";

interface StaffDetailProps {
  userRole: string;
  userId: string;
  staffId?: string;
}

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
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  bankInfo: {
    accountHolder: string;
    lastFourDigits: string;
    routingNumber: string;
  };
  travelStipend?: boolean;
  taxInfo: {
    ssn: string;
    filingStatus: string;
    allowances: number;
  };
  // Demographic fields
  dob: string;
  gender: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  recentEvents: Array<{
    id: string;
    name: string;
    date: string;
    venue: string;
    hours: number;
    earnings: number;
    rating: number;
  }>;
  payHistory: Array<{
    period: string;
    hours: number;
    grossPay: number;
    netPay: number;
    status: string;
  }>;
  notes: string;
}

export function StaffDetail({ userRole, userId, staffId }: StaffDetailProps) {
  const { setCurrentPage, pageParams } = useNavigation();
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);

  // Get staff ID from params if not provided
  const currentStaffId = staffId || pageParams?.staffId;

  // Real staff state
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState<StaffMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [staffDocuments, setStaffDocuments] = useState<any[]>([]);
  const [docActionLoading, setDocActionLoading] = useState<string | null>(null);

  // Fetch staff profile + all tab data
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        if (!currentStaffId) return;
        setIsLoading(true);
        const s = await staffService.getStaffProfile(currentStaffId);

        const userId = s.user?.id || s.userId || '';
        const hourlyRate = s.hourlyRate || 25;

        // Fetch shifts, timesheets, documents in parallel
        const [shifts, timesheetRes, docsRes] = await Promise.allSettled([
          userId ? shiftService.getShifts({ staffId: userId, take: 50 }) : Promise.resolve([]),
          userId ? api.get('/timesheets', { params: { staffId: userId, take: 50 } }).then(r => r.data) : Promise.resolve([]),
          staffService.getDocuments(currentStaffId),
        ]);

        // --- Event History ---
        const shiftsData: any[] = shifts.status === 'fulfilled' ? (shifts.value || []) : [];
        const recentEvents = shiftsData.map((shift: any) => {
          const event = shift.event || {};
          const hoursWorked = shift.hoursWorked || shift.totalHours || (() => {
            if (shift.clockInTime && shift.clockOutTime) {
              return Math.round((new Date(shift.clockOutTime).getTime() - new Date(shift.clockInTime).getTime()) / 3600000 * 10) / 10;
            }
            return shift.guaranteedHours || 0;
          })();
          return {
            id: shift.id,
            name: event.title || event.name || 'Event',
            date: shift.date || event.date || shift.createdAt,
            venue: event.venue || event.location || '',
            hours: hoursWorked,
            earnings: Math.round(hoursWorked * hourlyRate * 100) / 100,
            rating: shift.rating || event.rating || 0,
          };
        });

        // --- Payroll ---
        const timesheetRaw = timesheetRes.status === 'fulfilled' ? timesheetRes.value : [];
        const timesheetArr: any[] = Array.isArray(timesheetRaw) ? timesheetRaw : (timesheetRaw?.data || []);
        // Group by month
        const monthMap: Record<string, { hours: number; gross: number }> = {};
        timesheetArr.forEach((ts: any) => {
          const d = new Date(ts.date || ts.weekStart || ts.createdAt);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (!monthMap[key]) monthMap[key] = { hours: 0, gross: 0 };
          const h = ts.totalHours || ts.hoursWorked || ts.hours || 0;
          monthMap[key].hours += h;
          monthMap[key].gross += ts.totalPay || ts.grossPay || (h * hourlyRate);
        });
        const payHistory = Object.entries(monthMap)
          .sort((a, b) => b[0].localeCompare(a[0]))
          .slice(0, 12)
          .map(([key, val]) => {
            const [year, month] = key.split('-');
            const label = new Date(Number(year), Number(month) - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            const gross = Math.round(val.gross * 100) / 100;
            return {
              period: label,
              hours: Math.round(val.hours * 10) / 10,
              grossPay: gross,
              netPay: Math.round(gross * 0.75 * 100) / 100, // ~25% taxes estimate
              status: 'Paid',
            };
          });

        // --- Documents ---
        const docsRaw = docsRes.status === 'fulfilled' ? docsRes.value : null;
        const docsArr: any[] = Array.isArray(docsRaw) ? docsRaw : (docsRaw?.data || docsRaw?.documents || []);
        const hasDoc = (type: string) => docsArr.some((d: any) =>
          (d.type || d.documentType || d.category || '').toLowerCase().includes(type.toLowerCase()) && d.status !== 'REJECTED'
        );
        const documents = docsArr.length > 0
          ? { contract: hasDoc('contract'), background: hasDoc('background'), i9: hasDoc('i9'), w4: hasDoc('w4') }
          : (s.documents || { contract: false, background: false, i9: false, w4: false });

        setStaffDocuments(docsArr);

        // --- Performance (from shift data) ---
        const completedShifts = shiftsData.filter((sh: any) => sh.status === 'COMPLETED' || sh.clockOutTime);
        const onTimeCount = completedShifts.filter((sh: any) => sh.arrivedOnTime || sh.punctualityRating >= 4).length;
        const performance = completedShifts.length > 0 ? {
          punctuality: Math.round((onTimeCount / completedShifts.length) * 100) || (s.performance?.punctuality ?? 85),
          professionalism: s.performance?.professionalism ?? Math.round(((s.rating || 4.5) / 5) * 100),
          quality: s.performance?.quality ?? Math.round(((s.rating || 4.5) / 5) * 100),
        } : (s.performance || { punctuality: 85, professionalism: 85, quality: 85 });

        // --- Stats from real shift data ---
        const completedEventIds = new Set(shiftsData.filter((sh: any) => sh.status === 'COMPLETED' || sh.clockOutTime).map((sh: any) => sh.eventId));
        const eventsCompleted = completedEventIds.size || s.eventsCompleted || s.totalEvents || 0;
        const hoursWorked = shiftsData.reduce((sum: number, sh: any) => {
          const h = sh.hoursWorked || sh.totalHours || (() => {
            if (sh.clockInTime && sh.clockOutTime)
              return (new Date(sh.clockOutTime).getTime() - new Date(sh.clockInTime).getTime()) / 3600000;
            return sh.guaranteedHours || 0;
          })();
          return sum + h;
        }, 0) || s.hoursWorked || 0;

        // Map backend StaffProfile/User to our StaffMember state interface
        const mapped: StaffMember = {
          id: s.id,
          name: s.user?.name || s.name || 'Staff',
          email: s.user?.email || s.email || '',
          phone: s.user?.phone || s.phone || '',
          role: s.staffType || s.role || 'General',
          status: (s.isActive === false ? 'inactive' : 'active') as StaffMember['status'],
          location: s.location || s.address || '',
          hireDate: s.hireDate || s.createdAt || new Date().toISOString(),
          hourlyRate,
          rating: s.rating || 4.5,
          eventsCompleted,
          hoursWorked: Math.round(hoursWorked * 10) / 10,
          availability: s.availability || [],
          certifications: s.skills || s.certifications || [],
          documents,
          performance,
          emergencyContact: s.emergencyContact ? {
            name: s.emergencyContact,
            relationship: 'Emergency Contact',
            phone: s.emergencyPhone || ''
          } : { name: '', relationship: '', phone: '' },
          bankInfo: s.bankAccountInfo || { accountHolder: '', lastFourDigits: '', routingNumber: '' },
          taxInfo: s.taxId ? { ssn: s.taxId, filingStatus: 'Single', allowances: 0 } : { ssn: '', filingStatus: 'Single', allowances: 0 },
          // Demographic fields from user object
          dob: s.user?.dob ? s.user.dob.split('T')[0] : '',
          gender: s.user?.gender || '',
          city: s.user?.city || '',
          state: s.user?.state || '',
          zipCode: s.user?.zipCode || '',
          country: s.user?.country || '',
          recentEvents,
          payHistory,
          notes: s.notes || ''
        };

        setStaff(mapped);
        setFormData(mapped);
      } catch (err) {
        console.error('Failed to load staff profile', err);
        toast.error('Failed to load staff profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStaff();
  }, [currentStaffId]);

  // Check if user is Scheduler - they have restricted access
  const isScheduler = userRole === 'scheduler';
  // Check if user is Admin - ONLY admins can see financial data
  const isAdmin = userRole === 'admin';
  // Check if user has full non-financial access
  const hasFullAccess = userRole === 'admin' || userRole === 'manager' || userRole === 'subadmin';

  const handleDocAction = async (docId: string, status: 'VERIFIED' | 'REJECTED', notes?: string) => {
    setDocActionLoading(docId);
    try {
      await staffService.updateDocument(docId, {
        status,
        ...(notes && { notes }),
        ...(status === 'VERIFIED' && { verifiedAt: new Date().toISOString() }),
      });
      toast.success(status === 'VERIFIED' ? 'Document verified!' : 'Document rejected.');
      // Update local state
      setStaffDocuments(prev => prev.map(d => d.id === docId ? { ...d, status } : d));
    } catch {
      toast.error('Failed to update document status');
    } finally {
      setDocActionLoading(null);
    }
  };

  const getDocFileUrl = (fileUrl: string) => {
    if (!fileUrl) return '#';
    if (fileUrl.startsWith('http')) return fileUrl;
    const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${base}${fileUrl}`;
  };

  useEffect(() => {
    setFormData(staff);
  }, [staff]);

  const handleSaveProfile = async () => {
    if (!staff || !formData) return;
    try {
      // Update staff profile fields
      await staffService.updateStaffProfile(staff.id, {
        hourlyRate: formData.hourlyRate,
        availabilityStatus: formData.status,
        location: formData.location,
        emergencyContact: formData.emergencyContact?.name,
        emergencyPhone: formData.emergencyContact?.phone,
      });

      // Also update user-level fields (name, phone, dob, gender, city, state, zipCode, country)
      const userRes = await staffService.getStaffProfile(staff.id);
      if (userRes?.user?.id) {
        await api.put(`/users/${userRes.user.id}`, {
          name: formData.name,
          phone: formData.phone,
          dob: formData.dob || null,
          gender: formData.gender || null,
          city: formData.city || null,
          state: formData.state || null,
          zipCode: formData.zipCode || null,
          country: formData.country || null,
        });
      }

      setStaff(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };


  const handleCancelEdit = () => {
    setFormData(staff);
    setIsEditing(false);
  };

  if (isLoading || !staff || !formData) {
    return <div className="p-8 text-center text-muted-foreground">Loading staff profile...</div>;
  }

  const updateField = (field: keyof StaffMember, value: any) => {
    setFormData(prev => prev ? ({ ...prev, [field]: value }) as StaffMember : null);
  };

  const updateNestedField = (parent: keyof StaffMember, child: string, value: any) => {
    setFormData(prev => prev ? ({
      ...prev,
      [parent]: {
        ...(prev[parent] as object),
        [child]: value
      }
    }) as StaffMember : null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700"><UserCheck className="h-3 w-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-700"><UserX className="h-3 w-3 mr-1" />Inactive</Badge>;
      case 'on-leave':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />On Leave</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage('staff')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {staff.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3 min-w-[300px]">
                  <div className="space-y-1">
                    <Label>Full Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="font-bold text-lg"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1/2 space-y-1">
                      <Label>Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(val: any) => updateField('status', val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="on-leave">On Leave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-1/2 space-y-1">
                      <Label>Role</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(val) => updateField('role', val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Event Server">Event Server</SelectItem>
                          <SelectItem value="Bartender">Bartender</SelectItem>
                          <SelectItem value="Event Coordinator">Event Coordinator</SelectItem>
                          <SelectItem value="Catering Manager">Catering Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl font-bold">{staff.name}</h1>
                    {getStatusBadge(staff.status)}
                  </div>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    {staff.role}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    Hired on {new Date(staff.hireDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isScheduler && (
            <>
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setShowNotesDialog(true)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Notes
                  </Button>
                  <Button variant="outline" onClick={() => toast.info("Sending message to " + staff.name)}>
                    <Send className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </>
              )}
            </>
          )}
          {isScheduler && (
            <Button variant="outline" onClick={() => toast.info("Sending message to " + staff.name)}>
              <Send className="h-4 w-4 mr-2" />
              Message
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {isAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hourly Rate</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => updateField('hourlyRate', Number(e.target.value))}
                  className="mt-1"
                />
              ) : (
                <div className="text-2xl font-bold">${staff.hourlyRate}</div>
              )}
              <p className="text-xs text-muted-foreground">Per hour</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              {staff.rating}
            </div>
            <p className="text-xs text-success">Excellent rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.eventsCompleted}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.hoursWorked}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(staff.hoursWorked * staff.hourlyRate).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Lifetime</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours/Week</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(staff.hoursWorked / ((new Date().getTime() - new Date(staff.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 7))).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Per week</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="schedule">Schedule & Availability</TabsTrigger>
          <TabsTrigger value="events">Event History</TabsTrigger>
          {isAdmin && <TabsTrigger value="payroll">Payroll</TabsTrigger>}
          {!isScheduler && <TabsTrigger value="documents">Documents</TabsTrigger>}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  {isEditing ? (
                    <Input
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{staff.email}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Phone</Label>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{staff.phone}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Location</Label>
                  {isEditing ? (
                    <Input
                      value={formData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{staff.location}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Date of Birth</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => updateField('dob', e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{staff.dob ? new Date(staff.dob).toLocaleDateString() : '—'}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Gender</Label>
                    {isEditing ? (
                      <Input
                        value={formData.gender}
                        onChange={(e) => updateField('gender', e.target.value)}
                        placeholder="e.g. Male, Female"
                      />
                    ) : (
                      <span className="text-sm">{staff.gender || '—'}</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">City</Label>
                    {isEditing ? (
                      <Input
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                      />
                    ) : (
                      <span className="text-sm">{staff.city || '—'}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">State</Label>
                    {isEditing ? (
                      <Input
                        value={formData.state}
                        onChange={(e) => updateField('state', e.target.value)}
                      />
                    ) : (
                      <span className="text-sm">{staff.state || '—'}</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Zip Code</Label>
                    {isEditing ? (
                      <Input
                        value={formData.zipCode}
                        onChange={(e) => updateField('zipCode', e.target.value)}
                      />
                    ) : (
                      <span className="text-sm">{staff.zipCode || '—'}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Country</Label>
                    {isEditing ? (
                      <Input
                        value={formData.country}
                        onChange={(e) => updateField('country', e.target.value)}
                      />
                    ) : (
                      <span className="text-sm">{staff.country || '—'}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact - Hidden for Schedulers */}
            {!isScheduler && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.emergencyContact.name}
                        onChange={(e) => updateNestedField('emergencyContact', 'name', e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{staff.emergencyContact.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Relationship</Label>
                    {isEditing ? (
                      <Input
                        value={formData.emergencyContact.relationship}
                        onChange={(e) => updateNestedField('emergencyContact', 'relationship', e.target.value)}
                      />
                    ) : (
                      <span>{staff.emergencyContact.relationship}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Phone</Label>
                    {isEditing ? (
                      <Input
                        value={formData.emergencyContact.phone}
                        onChange={(e) => updateNestedField('emergencyContact', 'phone', e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{staff.emergencyContact.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bank Information - Admin Only */}
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Banking Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Account Holder</Label>
                    {isEditing ? (
                      <Input
                        value={formData.bankInfo.accountHolder}
                        onChange={(e) => updateNestedField('bankInfo', 'accountHolder', e.target.value)}
                      />
                    ) : (
                      <span>{staff.bankInfo.accountHolder}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Account Number (Last 4)</Label>
                    {isEditing ? (
                      <Input
                        value={formData.bankInfo.lastFourDigits}
                        onChange={(e) => updateNestedField('bankInfo', 'lastFourDigits', e.target.value)}
                      />
                    ) : (
                      <span>****{staff.bankInfo.lastFourDigits}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Routing Number</Label>
                    {isEditing ? (
                      <Input
                        value={formData.bankInfo.routingNumber}
                        onChange={(e) => updateNestedField('bankInfo', 'routingNumber', e.target.value)}
                      />
                    ) : (
                      <span>{staff.bankInfo.routingNumber}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tax Information - Admin Only */}
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Tax Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">SSN</Label>
                    {isEditing ? (
                      <Input
                        value={formData.taxInfo.ssn}
                        onChange={(e) => updateNestedField('taxInfo', 'ssn', e.target.value)}
                      />
                    ) : (
                      <span>{staff.taxInfo.ssn}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Filing Status</Label>
                    {isEditing ? (
                      <Select
                        value={formData.taxInfo.filingStatus}
                        onValueChange={(val) => updateNestedField('taxInfo', 'filingStatus', val)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Single">Single</SelectItem>
                          <SelectItem value="Married">Married</SelectItem>
                          <SelectItem value="Head of Household">Head of Household</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span>{staff.taxInfo.filingStatus}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Allowances</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={formData.taxInfo.allowances}
                        onChange={(e) => updateNestedField('taxInfo', 'allowances', Number(e.target.value))}
                      />
                    ) : (
                      <span>{staff.taxInfo.allowances}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Travel Stipend Status - Admin Only */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Travel Compensation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="flex items-center space-x-2 border p-4 rounded-lg">
                    <Checkbox
                      id="travelStipend"
                      checked={formData.travelStipend}
                      onCheckedChange={(checked: boolean) => updateField('travelStipend', checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="travelStipend"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Travel Stipend Enabled
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Staff member receives compensation for travel from home to event location.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      {staff.travelStipend ? (
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                          <UserX className="h-6 w-6 text-slate-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-base">Travel Stipend</p>
                        <p className="text-sm text-muted-foreground">
                          {staff.travelStipend
                            ? "Active: Paid for home-to-event travel"
                            : "Inactive: Standard commute policy applies"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certifications & Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-3">
                  <Label>Certifications (comma separated)</Label>
                  <Input
                    value={formData.certifications.join(', ')}
                    onChange={(e) => updateField('certifications', e.target.value.split(',').map(s => s.trim()))}
                  />
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {staff.certifications.map((cert, index) => (
                    <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                      <Award className="h-3 w-3 mr-1" />
                      {cert}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Based on {staff.eventsCompleted} completed events
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Punctuality</Label>
                    <span className="text-sm font-semibold">{isEditing ? formData.performance.punctuality : staff.performance.punctuality}%</span>
                  </div>
                  {isEditing ? (
                    <Input
                      type="range"
                      min="0" max="100"
                      value={formData.performance.punctuality}
                      onChange={(e) => updateNestedField('performance', 'punctuality', Number(e.target.value))}
                    />
                  ) : (
                    <Progress value={staff.performance.punctuality} className="h-3" />
                  )}
                  <p className="text-xs text-muted-foreground">
                    On-time arrivals and professional time management
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Professionalism</Label>
                    <span className="text-sm font-semibold">{isEditing ? formData.performance.professionalism : staff.performance.professionalism}%</span>
                  </div>
                  {isEditing ? (
                    <Input
                      type="range"
                      min="0" max="100"
                      value={formData.performance.professionalism}
                      onChange={(e) => updateNestedField('performance', 'professionalism', Number(e.target.value))}
                    />
                  ) : (
                    <Progress value={staff.performance.professionalism} className="h-3" />
                  )}
                  <p className="text-xs text-muted-foreground">
                    Attitude, appearance, and client interaction
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Quality of Work</Label>
                    <span className="text-sm font-semibold">{isEditing ? formData.performance.quality : staff.performance.quality}%</span>
                  </div>
                  {isEditing ? (
                    <Input
                      type="range"
                      min="0" max="100"
                      value={formData.performance.quality}
                      onChange={(e) => updateNestedField('performance', 'quality', Number(e.target.value))}
                    />
                  ) : (
                    <Progress value={staff.performance.quality} className="h-3" />
                  )}
                  <p className="text-xs text-muted-foreground">
                    Task completion and service excellence
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overall Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-6xl font-bold flex items-center justify-center gap-2 mb-4">
                    <Star className="h-12 w-12 fill-yellow-400 text-yellow-400" />
                    {staff.rating}
                  </div>
                  <p className="text-muted-foreground mb-6">Out of 5.0</p>
                  <div className="flex justify-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-8 w-8 ${star <= Math.floor(staff.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <Badge variant="default" className="text-sm">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Top Performer
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Work Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{staff.eventsCompleted}</p>
                  <p className="text-sm text-muted-foreground">Events Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{staff.hoursWorked}</p>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {Math.floor((new Date().getTime() - new Date(staff.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 30))}
                  </p>
                  <p className="text-sm text-muted-foreground">Months Employed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    ${(staff.hoursWorked * staff.hourlyRate).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule & Availability Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Weekly Availability</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Days available for scheduling
                  </p>
                </div>
                <Button onClick={() => setShowScheduleDialog(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div
                    key={day}
                    className={`p-4 rounded-lg border-2 text-center ${staff.availability.includes(day)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                      }`}
                  >
                    <p className="font-semibold text-sm">{day.slice(0, 3)}</p>
                    <p className="text-xs mt-1">
                      {staff.availability.includes(day) ? (
                        <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400 mx-auto" />
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Event History Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest {staff.recentEvents.length} events worked
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Hours</TableHead>
                    {isAdmin && <TableHead>Earnings</TableHead>}
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.recentEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 6 : 5} className="text-center text-muted-foreground py-8">
                        No event history found
                      </TableCell>
                    </TableRow>
                  ) : staff.recentEvents.map((event) => (
                    <TableRow
                      key={event.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors group"
                      onClick={() => setCurrentPage('staff-event-detail', { staffId: staff.id, eventId: event.id })}
                    >
                      <TableCell className="font-medium text-primary group-hover:underline">{event.name}</TableCell>
                      <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                      <TableCell>{event.venue}</TableCell>
                      <TableCell>{event.hours}h</TableCell>
                      {isAdmin && <TableCell className="font-semibold">${event.earnings}</TableCell>}
                      <TableCell>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{event.rating}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Tab */}
        {isAdmin && (
          <TabsContent value="payroll" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pay History</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Recent pay periods and earnings
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pay Period</TableHead>
                      <TableHead>Hours Worked</TableHead>
                      <TableHead>Gross Pay</TableHead>
                      <TableHead>Net Pay</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.payHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No payroll records found
                        </TableCell>
                      </TableRow>
                    ) : staff.payHistory.map((pay, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{pay.period}</TableCell>
                        <TableCell>{pay.hours}h</TableCell>
                        <TableCell>${pay.grossPay.toLocaleString()}</TableCell>
                        <TableCell className="font-semibold">${pay.netPay.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={pay.status === 'Paid' ? 'default' : 'secondary'}>
                            {pay.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Documents Tab */}
        {!isScheduler && (
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Uploaded Documents</span>
                  {staffDocuments.filter(d => d.status === 'PENDING').length > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-700">
                      {staffDocuments.filter(d => d.status === 'PENDING').length} Pending Review
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Documents uploaded by staff — {isAdmin || hasFullAccess ? 'verify or reject each document below' : 'review status below'}
                </p>
              </CardHeader>
              <CardContent>
                {staffDocuments.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>No documents uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {staffDocuments.map((doc: any) => {
                      const isPending = doc.status === 'PENDING';
                      const isVerified = doc.status === 'VERIFIED';
                      const isRejected = doc.status === 'REJECTED';
                      const isLoading = docActionLoading === doc.id;
                      return (
                        <div key={doc.id} className={`flex items-start justify-between gap-4 p-4 border rounded-lg ${isPending ? 'border-yellow-300 bg-yellow-50' : isRejected ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {isVerified ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                            ) : isRejected ? (
                              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                            ) : (
                              <Clock className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="font-medium truncate">{doc.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{(doc.category || doc.type || '').replace(/_/g, ' ')}</p>
                              <p className="text-xs text-muted-foreground">Uploaded {new Date(doc.createdAt || doc.uploadDate).toLocaleDateString()}</p>
                              {doc.notes && isRejected && (
                                <p className="text-xs text-red-600 mt-1">Reason: {doc.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              className={isVerified ? 'bg-green-100 text-green-700' : isRejected ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}
                            >
                              {isVerified ? 'Verified' : isRejected ? 'Rejected' : 'Pending'}
                            </Badge>
                            {doc.fileUrl && (
                              <a href={getDocFileUrl(doc.fileUrl)} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </a>
                            )}
                            {(isAdmin || hasFullAccess) && (isPending || isRejected) && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={isLoading}
                                onClick={() => handleDocAction(doc.id, 'VERIFIED')}
                              >
                                {isLoading ? '...' : 'Verify'}
                              </Button>
                            )}
                            {(isAdmin || hasFullAccess) && (isPending || isVerified) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                disabled={isLoading}
                                onClick={() => handleDocAction(doc.id, 'REJECTED', 'Document rejected by admin')}
                              >
                                {isLoading ? '...' : 'Reject'}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Schedule Dialog (Kept separate as it has complex UI) */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Availability</DialogTitle>
            <DialogDescription>
              Modify {staff.name}'s weekly availability
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day}`}
                  defaultChecked={staff.availability.includes(day)}
                />
                <label htmlFor={`day-${day}`} className="text-sm font-medium">
                  {day}
                </label>
              </div>
            ))}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success("Availability updated!");
                setShowScheduleDialog(false);
              }}>
                Update Availability
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Staff Notes</DialogTitle>
            <DialogDescription>
              Internal notes about {staff.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Add notes about this staff member..."
              rows={6}
              defaultValue={staff.notes}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowNotesDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success("Notes saved!");
                setShowNotesDialog(false);
              }}>
                Save Notes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
