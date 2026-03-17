import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { 
  Calendar, Clock, Search, Filter, CheckCircle2, XCircle, 
  AlertCircle, Users, ChevronDown, ChevronUp, MapPin,
  Phone, Mail, Star, Briefcase
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

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

  // Check if user is Admin for financial data visibility
  const isAdmin = userRole === 'admin';

  // Mock staff availability data
  const staffAvailability = [
    {
      id: 'staff-001',
      name: 'Sarah Martinez',
      avatar: 'SM',
      role: 'Bartender',
      hourlyRate: 28,
      rating: 4.9,
      phone: '+1 (555) 234-5678',
      email: 'sarah.martinez@example.com',
      location: 'New York, NY',
      totalEvents: 142,
      weeklyAvailability: {
        monday: { available: true, hours: '5:00 PM - 2:00 AM' },
        tuesday: { available: true, hours: '5:00 PM - 2:00 AM' },
        wednesday: { available: true, hours: '5:00 PM - 2:00 AM' },
        thursday: { available: true, hours: '5:00 PM - 2:00 AM' },
        friday: { available: true, hours: '5:00 PM - 2:00 AM' },
        saturday: { available: true, hours: '2:00 PM - 2:00 AM' },
        sunday: { available: false, hours: 'Not Available' }
      },
      upcomingAssignments: [
        { date: '2025-01-18', event: 'Corporate Gala', hours: '6:00 PM - 11:00 PM' },
        { date: '2025-01-20', event: 'Wedding Reception', hours: '5:00 PM - 12:00 AM' }
      ],
      certifications: ['Mixology', 'Responsible Beverage Service'],
      currentStatus: 'available'
    },
    {
      id: 'staff-002',
      name: 'Michael Chen',
      avatar: 'MC',
      role: 'Head Server',
      hourlyRate: 32,
      rating: 4.8,
      phone: '+1 (555) 345-6789',
      email: 'michael.chen@example.com',
      location: 'New York, NY',
      totalEvents: 215,
      weeklyAvailability: {
        monday: { available: true, hours: '4:00 PM - 11:00 PM' },
        tuesday: { available: true, hours: '4:00 PM - 11:00 PM' },
        wednesday: { available: false, hours: 'Not Available' },
        thursday: { available: true, hours: '4:00 PM - 11:00 PM' },
        friday: { available: true, hours: '4:00 PM - 1:00 AM' },
        saturday: { available: true, hours: '12:00 PM - 1:00 AM' },
        sunday: { available: true, hours: '12:00 PM - 10:00 PM' }
      },
      upcomingAssignments: [
        { date: '2025-01-16', event: 'Charity Fundraiser', hours: '5:00 PM - 10:00 PM' },
        { date: '2025-01-19', event: 'Product Launch', hours: '6:00 PM - 11:00 PM' },
        { date: '2025-01-22', event: 'Birthday Party', hours: '7:00 PM - 11:00 PM' }
      ],
      certifications: ['Food Handler', 'Wine Sommelier'],
      currentStatus: 'available'
    },
    {
      id: 'staff-003',
      name: 'Emma Davis',
      avatar: 'ED',
      role: 'Server',
      hourlyRate: 25,
      rating: 4.7,
      phone: '+1 (555) 456-7890',
      email: 'emma.davis@example.com',
      location: 'Brooklyn, NY',
      totalEvents: 98,
      weeklyAvailability: {
        monday: { available: true, hours: '5:00 PM - 11:00 PM' },
        tuesday: { available: true, hours: '5:00 PM - 11:00 PM' },
        wednesday: { available: true, hours: '5:00 PM - 11:00 PM' },
        thursday: { available: true, hours: '5:00 PM - 11:00 PM' },
        friday: { available: true, hours: '5:00 PM - 12:00 AM' },
        saturday: { available: true, hours: '3:00 PM - 12:00 AM' },
        sunday: { available: true, hours: '3:00 PM - 10:00 PM' }
      },
      upcomingAssignments: [
        { date: '2025-01-17', event: 'Networking Event', hours: '6:00 PM - 10:00 PM' }
      ],
      certifications: ['Food Handler'],
      currentStatus: 'available'
    },
    {
      id: 'staff-004',
      name: 'James Wilson',
      avatar: 'JW',
      role: 'Server',
      hourlyRate: 25,
      rating: 4.6,
      phone: '+1 (555) 567-8901',
      email: 'james.wilson@example.com',
      location: 'Queens, NY',
      totalEvents: 54,
      weeklyAvailability: {
        monday: { available: false, hours: 'Not Available' },
        tuesday: { available: false, hours: 'Not Available' },
        wednesday: { available: true, hours: '6:00 PM - 11:00 PM' },
        thursday: { available: true, hours: '6:00 PM - 11:00 PM' },
        friday: { available: true, hours: '6:00 PM - 12:00 AM' },
        saturday: { available: true, hours: '12:00 PM - 12:00 AM' },
        sunday: { available: true, hours: '12:00 PM - 10:00 PM' }
      },
      upcomingAssignments: [],
      certifications: ['Food Handler'],
      currentStatus: 'available'
    },
    {
      id: 'staff-005',
      name: 'Lisa Anderson',
      avatar: 'LA',
      role: 'Bartender',
      hourlyRate: 28,
      rating: 4.9,
      phone: '+1 (555) 678-9012',
      email: 'lisa.anderson@example.com',
      location: 'Manhattan, NY',
      totalEvents: 167,
      weeklyAvailability: {
        monday: { available: true, hours: '5:00 PM - 1:00 AM' },
        tuesday: { available: true, hours: '5:00 PM - 1:00 AM' },
        wednesday: { available: true, hours: '5:00 PM - 1:00 AM' },
        thursday: { available: true, hours: '5:00 PM - 1:00 AM' },
        friday: { available: true, hours: '5:00 PM - 2:00 AM' },
        saturday: { available: true, hours: '3:00 PM - 2:00 AM' },
        sunday: { available: false, hours: 'Not Available' }
      },
      upcomingAssignments: [
        { date: '2025-01-18', event: 'Corporate Gala', hours: '6:00 PM - 11:00 PM' },
        { date: '2025-01-21', event: 'Cocktail Party', hours: '7:00 PM - 11:00 PM' }
      ],
      certifications: ['Mixology', 'Responsible Beverage Service'],
      currentStatus: 'busy'
    },
    {
      id: 'staff-006',
      name: 'David Brown',
      avatar: 'DB',
      role: 'Busser',
      hourlyRate: 20,
      rating: 4.5,
      phone: '+1 (555) 789-0123',
      email: 'david.brown@example.com',
      location: 'Bronx, NY',
      totalEvents: 37,
      weeklyAvailability: {
        monday: { available: true, hours: 'Anytime' },
        tuesday: { available: true, hours: 'Anytime' },
        wednesday: { available: true, hours: 'Anytime' },
        thursday: { available: true, hours: 'Anytime' },
        friday: { available: true, hours: 'Anytime' },
        saturday: { available: true, hours: 'Anytime' },
        sunday: { available: true, hours: 'Anytime' }
      },
      upcomingAssignments: [
        { date: '2025-01-16', event: 'Charity Fundraiser', hours: '5:00 PM - 10:00 PM' }
      ],
      certifications: ['Food Handler'],
      currentStatus: 'available'
    },
    {
      id: 'staff-007',
      name: 'Amy Taylor',
      avatar: 'AT',
      role: 'Server',
      hourlyRate: 25,
      rating: 4.8,
      phone: '+1 (555) 890-1234',
      email: 'amy.taylor@example.com',
      location: 'Brooklyn, NY',
      totalEvents: 123,
      weeklyAvailability: {
        monday: { available: true, hours: '5:00 PM - 11:00 PM' },
        tuesday: { available: true, hours: '5:00 PM - 11:00 PM' },
        wednesday: { available: true, hours: '5:00 PM - 11:00 PM' },
        thursday: { available: false, hours: 'Not Available' },
        friday: { available: true, hours: '5:00 PM - 12:00 AM' },
        saturday: { available: true, hours: '2:00 PM - 12:00 AM' },
        sunday: { available: true, hours: '2:00 PM - 10:00 PM' }
      },
      upcomingAssignments: [
        { date: '2025-01-20', event: 'Wedding Reception', hours: '5:00 PM - 12:00 AM' }
      ],
      certifications: ['Food Handler', 'Allergen Awareness'],
      currentStatus: 'available'
    },
    {
      id: 'staff-008',
      name: 'Christopher Miller',
      avatar: 'CM',
      role: 'Event Coordinator',
      hourlyRate: 35,
      rating: 4.9,
      phone: '+1 (555) 901-2345',
      email: 'chris.miller@example.com',
      location: 'Manhattan, NY',
      totalEvents: 189,
      weeklyAvailability: {
        monday: { available: true, hours: '9:00 AM - 11:00 PM' },
        tuesday: { available: true, hours: '9:00 AM - 11:00 PM' },
        wednesday: { available: true, hours: '9:00 AM - 11:00 PM' },
        thursday: { available: true, hours: '9:00 AM - 11:00 PM' },
        friday: { available: true, hours: '9:00 AM - 1:00 AM' },
        saturday: { available: true, hours: '9:00 AM - 1:00 AM' },
        sunday: { available: true, hours: '10:00 AM - 10:00 PM' }
      },
      upcomingAssignments: [
        { date: '2025-01-18', event: 'Corporate Gala', hours: '3:00 PM - 12:00 AM' },
        { date: '2025-01-19', event: 'Product Launch', hours: '4:00 PM - 11:00 PM' }
      ],
      certifications: ['Event Management', 'Safety Coordinator'],
      currentStatus: 'busy'
    }
  ];

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
        <div>
          <h1 className="text-3xl flex items-center gap-2">
            <Calendar className="h-8 w-8 text-primary" />
            Staff Availability
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage staff availability schedules and upcoming assignments
          </p>
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