import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { 
  Calendar, Clock, Search, Filter, CheckCircle2, XCircle, 
  AlertCircle, Users, ChevronDown, ChevronUp, MapPin,
  Phone, Mail, Star, Briefcase, RefreshCw
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { staffService } from "../services/staff.service";
import { shiftService } from "../services/shift.service";
import { toast } from "sonner";

interface StaffAvailabilityData {
  id: string;
  name: string;
  avatar: string;
  role: string;
  hourlyRate: number;
  rating: number;
  phone: string;
  email: string;
  location: string;
  totalEvents: number;
  weeklyAvailability: {
    [key: string]: { available: boolean; hours: string };
  };
  upcomingAssignments: { date: string; event: string; hours: string }[];
  certifications: string[];
  currentStatus: 'available' | 'busy' | 'unavailable';
}

interface StaffAvailabilityProps {
  userRole?: string;
  userId?: string;
}

export function StaffAvailability({ userRole = 'admin', userId }: StaffAvailabilityProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('2025-01-15');
  const [expandedStaff, setExpandedStaff] = useState<string[]>([]);
  const [staffAvailability, setStaffAvailability] = useState<StaffAvailabilityData[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is Admin for financial data visibility
  const isAdmin = userRole === 'admin';

  // Fetch staff data from API
  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const [staffRes, shiftsRes] = await Promise.all([
        staffService.getStaffList(),
        shiftService.getShifts({ status: 'CONFIRMED' }).catch(() => ({ data: [] }))
      ]);
      
      const shifts = shiftsRes?.data || [];

      // Extract staff array from response (API returns { data: [], pagination: {} })
      const staffList: any[] = Array.isArray(staffRes) ? staffRes : (staffRes?.data || []);

      // Transform staff data to match expected interface
      const transformed: StaffAvailabilityData[] = staffList.map((staff: any) => {
        const user = staff.user || {};
        const name = user.name || staff.name || 'Staff Member';
        const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
        
        // Get staff's availability days and convert to weekly schedule
        const availabilityDays = staff.availability || [];
        const defaultHours = '5:00 PM - 11:00 PM';
        const weeklyAvailability: { [key: string]: { available: boolean; hours: string } } = {
          monday: { available: availabilityDays.includes('Monday'), hours: availabilityDays.includes('Monday') ? defaultHours : 'Not Available' },
          tuesday: { available: availabilityDays.includes('Tuesday'), hours: availabilityDays.includes('Tuesday') ? defaultHours : 'Not Available' },
          wednesday: { available: availabilityDays.includes('Wednesday'), hours: availabilityDays.includes('Wednesday') ? defaultHours : 'Not Available' },
          thursday: { available: availabilityDays.includes('Thursday'), hours: availabilityDays.includes('Thursday') ? defaultHours : 'Not Available' },
          friday: { available: availabilityDays.includes('Friday'), hours: availabilityDays.includes('Friday') ? defaultHours : 'Not Available' },
          saturday: { available: availabilityDays.includes('Saturday'), hours: availabilityDays.includes('Saturday') ? '2:00 PM - 12:00 AM' : 'Not Available' },
          sunday: { available: availabilityDays.includes('Sunday'), hours: availabilityDays.includes('Sunday') ? '12:00 PM - 10:00 PM' : 'Not Available' }
        };
        
        // Find upcoming assignments for this staff member
        const staffShifts = shifts.filter((s: any) => s.staffId === staff.id || s.userId === staff.userId);
        const upcomingAssignments = staffShifts.slice(0, 3).map((shift: any) => ({
          date: new Date(shift.startTime).toLocaleDateString(),
          event: shift.event?.name || 'Event',
          hours: `${new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        }));
        
        // Determine current status
        let currentStatus: 'available' | 'busy' | 'unavailable' = 'available';
        if (staff.isActive === false) {
          currentStatus = 'unavailable';
        } else if (staffShifts.length > 0) {
          // Check if currently on a shift
          const now = new Date();
          const hasActiveShift = staffShifts.some((s: any) => {
            const start = new Date(s.startTime);
            const end = new Date(s.endTime);
            return now >= start && now <= end;
          });
          currentStatus = hasActiveShift ? 'busy' : 'available';
        }
        
        return {
          id: staff.id,
          name,
          avatar: initials,
          role: staff.staffType || staff.role || 'Server',
          hourlyRate: staff.hourlyRate || 25,
          rating: staff.rating || 4.5,
          phone: user.phone || staff.phone || '',
          email: user.email || staff.email || '',
          location: staff.location || staff.address || 'New York, NY',
          totalEvents: staff.totalEvents || staff.eventsCompleted || 0,
          weeklyAvailability,
          upcomingAssignments,
          certifications: staff.skills || staff.certifications || [],
          currentStatus
        };
      });
      
      setStaffAvailability(transformed);
    } catch (error) {
      console.error('Failed to fetch staff availability:', error);
      toast.error('Failed to load staff availability');
    } finally {
      setLoading(false);
    }
  };

  // Filter staff based on search and filters
  const filteredStaff = staffAvailability.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
    const matchesAvailability = availabilityFilter === 'all' || staff.currentStatus === availabilityFilter;
    
    return matchesSearch && matchesRole && matchesAvailability;
  });

  // Get unique roles
  const uniqueRoles = Array.from(new Set(staffAvailability.map(s => s.role)));

  const toggleStaffExpansion = (staffId: string) => {
    setExpandedStaff(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />Available</Badge>;
      case 'busy':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><AlertCircle className="w-3 h-3 mr-1" />Busy</Badge>;
      case 'unavailable':
        return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Unavailable</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDayAvailabilityColor = (available: boolean) => {
    return available ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <div className="h-full overflow-auto">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl flex items-center gap-2">
              <Calendar className="h-8 w-8 text-primary" />
              Staff Availability
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage staff availability schedules and upcoming assignments
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStaffData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">Available Now</p>
                  <p className="text-3xl">
                    {staffAvailability.filter(s => s.currentStatus === 'available').length}
                  </p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">Currently Busy</p>
                  <p className="text-3xl">
                    {staffAvailability.filter(s => s.currentStatus === 'busy').length}
                  </p>
                </div>
                <AlertCircle className="w-10 h-10 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">Total Staff</p>
                  <p className="text-3xl">{staffAvailability.length}</p>
                </div>
                <Users className="w-10 h-10 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {uniqueRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Availability Filter */}
              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Staff Availability List */}
        <div className="space-y-4">
          {filteredStaff.map(staff => (
            <Card key={staff.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Staff Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {staff.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{staff.name}</h3>
                          {getStatusBadge(staff.currentStatus)}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {staff.role}
                          </span>
                          {isAdmin && (
                            <span className="flex items-center gap-1">
                              ${staff.hourlyRate}/hr
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {staff.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {staff.totalEvents} events
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {staff.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {staff.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {staff.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStaffExpansion(staff.id)}
                    >
                      {expandedStaff.includes(staff.id) ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          View Details
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Upcoming Assignments Preview */}
                  {staff.upcomingAssignments.length > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                      <p className="text-sm font-medium text-blue-900 mb-2">
                        Upcoming Assignments ({staff.upcomingAssignments.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {staff.upcomingAssignments.map((assignment, idx) => (
                          <Badge key={idx} variant="outline" className="bg-white">
                            {assignment.date} - {assignment.event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {expandedStaff.includes(staff.id) && (
                    <div className="border-t pt-4 space-y-4">
                      {/* Weekly Availability */}
                      <div>
                        <h4 className="font-medium mb-3">Weekly Availability</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                          {Object.entries(staff.weeklyAvailability).map(([day, data]) => (
                            <div key={day} className="border rounded-lg p-3">
                              <p className="font-medium text-sm capitalize mb-1">{day}</p>
                              <Badge 
                                variant="outline" 
                                className={getDayAvailabilityColor(data.available)}
                              >
                                {data.available ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                                {data.available ? 'Available' : 'Off'}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-2">{data.hours}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Certifications */}
                      <div>
                        <h4 className="font-medium mb-2">Certifications</h4>
                        <div className="flex flex-wrap gap-2">
                          {staff.certifications.map((cert, idx) => (
                            <Badge key={idx} variant="secondary">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button size="sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          Assign to Event
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4 mr-2" />
                          Contact
                        </Button>
                        <Button variant="outline" size="sm">
                          View Full Profile
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredStaff.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-2">No Staff Found</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Try adjusting your search or filter criteria to find staff members.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
