import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { 
  Users,
  Search,
  Filter,
  Eye,
  Phone,
  Mail,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Shield,
  Award,
  Calendar,
  MessageSquare
} from "lucide-react";
import { mockStaff, mockShifts } from "../../data/mockData";
import { toast } from "sonner";

interface StaffRosterProps {
  managerId: string;
  events: any[];
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  skills: string[];
  hourlyRate: number;
  rating: number;
  totalEvents: number;
  isActive: boolean;
  currentStatus: 'available' | 'on-shift' | 'break' | 'off-duty';
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
    lastUpdate: string;
  };
  certifications: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export function StaffRoster({ managerId, events }: StaffRosterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);

  // Get all staff assigned to manager's events - memoized to prevent infinite re-renders
  const managedStaff: StaffMember[] = useMemo(() => 
    mockStaff.map((staff, index) => ({
      ...staff,
      role: staff.role || staff.skills?.[0] || 'General Staff',
      currentStatus: staff.isActive ? 'on-shift' : 'off-duty' as any,
      currentLocation: staff.isActive ? {
        lat: 40.7128 + (index * 0.001 - 0.005),
        lng: -74.0060 + (index * 0.001 - 0.005),
        address: `${100 + index * 10} ${['Main St', 'Broadway', 'Park Ave', 'Wall St'][index % 4]}`,
        lastUpdate: `${5 + (index * 5) % 30} minutes ago`
      } : undefined,
      certifications: ['Food Safety', 'CPR', 'First Aid'].slice(0, (index % 3) + 1),
      emergencyContact: {
        name: `${staff.name.split(' ')[0]} Contact`,
        phone: `+1 (555) ${100 + index * 10}-${1000 + index * 100}`,
        relationship: ['Spouse', 'Parent', 'Sibling', 'Friend'][index % 4]
      }
    })).filter(staff => 
      events.some(event => event.assignedStaff.includes(staff.id))
    ), [events]
  );

  const filteredStaff = useMemo(() => 
    managedStaff.filter(staff => {
      const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           staff.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || staff.currentStatus === statusFilter;
      const matchesRole = roleFilter === "all" || staff.role.toLowerCase().includes(roleFilter.toLowerCase());
      return matchesSearch && matchesStatus && matchesRole;
    }), [managedStaff, searchTerm, statusFilter, roleFilter]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-shift': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'available': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'break': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'off-duty': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-shift': return <CheckCircle className="h-4 w-4" />;
      case 'available': return <Clock className="h-4 w-4" />;
      case 'break': return <AlertCircle className="h-4 w-4" />;
      case 'off-duty': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleSendMessage = (staffId: string) => {
    toast.success("Message sent to staff member!");
  };

  const handleCallStaff = (phone: string) => {
    toast.success(`Calling ${phone}...`);
  };

  const getStaffPerformance = useMemo(() => {
    // Create a stable performance map based on staffId
    const performanceMap: { [key: string]: any } = {};
    return (staffId: string) => {
      if (!performanceMap[staffId]) {
        const hash = staffId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        performanceMap[staffId] = {
          onTimeRate: 80 + (hash % 20),
          completionRate: 85 + (hash % 15),
          clientRating: (3.5 + ((hash % 15) / 10)).toFixed(1),
          totalShifts: 10 + (hash % 50)
        };
      }
      return performanceMap[staffId];
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Staff Roster</h2>
          <p className="text-muted-foreground">
            View and manage all staff assigned to your events
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{managedStaff.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On Shift</p>
                <p className="text-2xl font-bold">{managedStaff.filter(s => s.currentStatus === 'on-shift').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{managedStaff.filter(s => s.currentStatus === 'available').length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">
                  {(managedStaff.reduce((sum, staff) => sum + staff.rating, 0) / managedStaff.length).toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="on-shift">On Shift</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="break">On Break</SelectItem>
              <SelectItem value="off-duty">Off Duty</SelectItem>
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="server">Server</SelectItem>
              <SelectItem value="bartender">Bartender</SelectItem>
              <SelectItem value="coordinator">Coordinator</SelectItem>
              <SelectItem value="setup">Setup Crew</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Members ({filteredStaff.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Role & Skills</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {staff.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          <p className="text-sm text-muted-foreground">{staff.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{staff.role}</p>
                        <div className="flex gap-1 flex-wrap mt-1">
                          {staff.skills.slice(0, 2).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {staff.skills.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{staff.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(staff.currentStatus)}
                        <Badge className={getStatusColor(staff.currentStatus)}>
                          {staff.currentStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{staff.rating}</span>
                        <span className="text-sm text-muted-foreground">({staff.totalEvents})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{staff.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm truncate max-w-[120px]">{staff.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {staff.currentLocation ? (
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-emerald-600">
                            <MapPin className="h-3 w-3" />
                            <span>On Location</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                            {staff.currentLocation.address}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {staff.currentLocation.lastUpdate}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not available</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedStaff(staff)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                {staff.name} - Detailed Profile
                              </DialogTitle>
                              <DialogDescription>
                                View comprehensive staff information including performance, certifications, and contact details.
                              </DialogDescription>
                            </DialogHeader>
                            {selectedStaff && (
                              <div className="space-y-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Personal Information */}
                                  <div className="space-y-4">
                                    <div>
                                      <h3 className="font-semibold mb-3">Personal Information</h3>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                          <Users className="h-4 w-4 text-muted-foreground" />
                                          <span>{selectedStaff.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Mail className="h-4 w-4 text-muted-foreground" />
                                          <span>{selectedStaff.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Phone className="h-4 w-4 text-muted-foreground" />
                                          <span>{selectedStaff.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Shield className="h-4 w-4 text-muted-foreground" />
                                          <span>{selectedStaff.role}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <h3 className="font-semibold mb-3">Skills & Certifications</h3>
                                      <div className="space-y-2">
                                        <div className="flex gap-2 flex-wrap">
                                          {selectedStaff.skills.map((skill) => (
                                            <Badge key={skill} variant="secondary">
                                              {skill}
                                            </Badge>
                                          ))}
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                          {selectedStaff.certifications.map((cert) => (
                                            <Badge key={cert} className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                              <Award className="h-3 w-3 mr-1" />
                                              {cert}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <h3 className="font-semibold mb-3">Emergency Contact</h3>
                                      {selectedStaff.emergencyContact && (
                                        <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
                                          <p className="font-medium">{selectedStaff.emergencyContact.name}</p>
                                          <p className="text-muted-foreground">{selectedStaff.emergencyContact.relationship}</p>
                                          <p className="text-muted-foreground">{selectedStaff.emergencyContact.phone}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Performance & Status */}
                                  <div className="space-y-4">
                                    <div>
                                      <h3 className="font-semibold mb-3">Current Status</h3>
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                          {getStatusIcon(selectedStaff.currentStatus)}
                                          <Badge className={getStatusColor(selectedStaff.currentStatus)}>
                                            {selectedStaff.currentStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                          </Badge>
                                        </div>
                                        
                                        {selectedStaff.currentLocation && (
                                          <div className="p-3 bg-muted rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                              <MapPin className="h-4 w-4 text-emerald-600" />
                                              <span className="font-medium text-emerald-600">Currently On Location</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{selectedStaff.currentLocation.address}</p>
                                            <p className="text-xs text-muted-foreground">Last updated: {selectedStaff.currentLocation.lastUpdate}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div>
                                      <h3 className="font-semibold mb-3">Performance Metrics</h3>
                                      <div className="space-y-3">
                                        {(() => {
                                          const performance = getStaffPerformance(selectedStaff.id);
                                          return (
                                            <>
                                              <div className="flex items-center justify-between">
                                                <span className="text-sm">Overall Rating</span>
                                                <div className="flex items-center gap-1">
                                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                  <span className="font-medium">{selectedStaff.rating}/5</span>
                                                </div>
                                              </div>
                                              <div className="flex items-center justify-between">
                                                <span className="text-sm">On-Time Rate</span>
                                                <span className="font-medium">{performance.onTimeRate}%</span>
                                              </div>
                                              <div className="flex items-center justify-between">
                                                <span className="text-sm">Completion Rate</span>
                                                <span className="font-medium">{performance.completionRate}%</span>
                                              </div>
                                              <div className="flex items-center justify-between">
                                                <span className="text-sm">Total Events</span>
                                                <span className="font-medium">{selectedStaff.totalEvents}</span>
                                              </div>
                                            </>
                                          );
                                        })()}
                                      </div>
                                    </div>

                                    <div>
                                      <h3 className="font-semibold mb-3">Recent Activity</h3>
                                      <div className="space-y-2">
                                        <div className="p-2 bg-muted rounded text-xs">
                                          <p className="font-medium">Checked in to Corporate Gala</p>
                                          <p className="text-muted-foreground">2 hours ago</p>
                                        </div>
                                        <div className="p-2 bg-muted rounded text-xs">
                                          <p className="font-medium">Completed Wedding Reception</p>
                                          <p className="text-muted-foreground">Yesterday</p>
                                        </div>
                                        <div className="p-2 bg-muted rounded text-xs">
                                          <p className="font-medium">Received 5-star rating</p>
                                          <p className="text-muted-foreground">2 days ago</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-between pt-4 border-t">
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline"
                                      onClick={() => handleCallStaff(selectedStaff.phone)}
                                    >
                                      <Phone className="h-4 w-4 mr-2" />
                                      Call Staff
                                    </Button>
                                    <Button 
                                      variant="outline"
                                      onClick={() => handleSendMessage(selectedStaff.id)}
                                    >
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Send Message
                                    </Button>
                                  </div>
                                  <Button>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    View Schedule
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendMessage(staff.id)}
                        >
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCallStaff(staff.phone)}
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredStaff.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">No Staff Found</h3>
              <p className="text-muted-foreground">
                No staff members match your current search criteria
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
