import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  FilterX, 
  BarChart3, 
  Download, 
  Settings, 
  Star, 
  MapPin, 
  Clock, 
  User, 
  Users2, 
  ChevronLeft, 
  ChevronRight, 
  Grid, 
  List, 
  Heart, 
  MessageSquare,
  Calendar,
  Award,
  Briefcase,
  Phone,
  Mail,
  Eye,
  UserPlus,
  TrendingUp,
  Target,
  Users,
  Activity
} from "lucide-react";
import { mockStaff, mockEvents, Staff } from "../../data/mockData";
import { toast } from "sonner";

interface EnterpriseStaffDirectoryProps {
  clientId: string;
}

interface StaffFilters {
  search: string;
  role: string;
  rating: string;
  hourlyRateRange: string;
  location: string;
  availability: string;
  experience: string;
  skills: string;
}

interface StaffSorting {
  field: 'name' | 'rating' | 'hourlyRate' | 'experience' | 'totalEvents';
  direction: 'asc' | 'desc';
}

interface StaffPagination {
  currentPage: number;
  itemsPerPage: number;
}

export function EnterpriseStaffDirectory({ clientId }: EnterpriseStaffDirectoryProps) {
  // Enhanced state for enterprise-level staff management
  const [filters, setFilters] = useState<StaffFilters>({
    search: '',
    role: 'all',
    rating: 'all',
    hourlyRateRange: 'all',
    location: 'all',
    availability: 'all',
    experience: 'all',
    skills: 'all'
  });
  
  const [sorting, setSorting] = useState<StaffSorting>({
    field: 'rating',
    direction: 'desc'
  });
  
  const [pagination, setPagination] = useState<StaffPagination>({
    currentPage: 1,
    itemsPerPage: 20
  });
  
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [favoriteStaffIds, setFavoriteStaffIds] = useState<string[]>([]);

  // Get client's event history
  const clientEvents = mockEvents.filter(event => event.clientId === clientId);
  const workedWithStaffIds = [...new Set(clientEvents.flatMap(event => event.assignedStaff))];

  // Enhanced filtering logic
  const filteredAndSortedStaff = useMemo(() => {
    let filtered = mockStaff.filter(staff => {
      // Search filter
      if (filters.search && !staff.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Role filter
      if (filters.role !== 'all' && staff.specialty !== filters.role) {
        return false;
      }
      
      // Rating filter
      if (filters.rating !== 'all') {
        const minRating = parseFloat(filters.rating);
        if (staff.rating < minRating) return false;
      }
      
      // Hourly rate filter
      if (filters.hourlyRateRange !== 'all') {
        const [min, max] = filters.hourlyRateRange.split('-').map(Number);
        if (staff.hourlyRate < min || (max !== 999 && staff.hourlyRate > max)) {
          return false;
        }
      }
      
      // Location filter (simulated)
      if (filters.location !== 'all') {
        // In a real app, this would check staff location
        return true;
      }
      
      // Availability filter (simulated)
      if (filters.availability !== 'all') {
        // In a real app, this would check real availability
        return true;
      }
      
      // Experience filter (based on events worked)
      if (filters.experience !== 'all') {
        const eventsWorked = clientEvents.filter(e => e.assignedStaff.includes(staff.id)).length;
        const minEvents = parseInt(filters.experience);
        if (eventsWorked < minEvents) return false;
      }
      
      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sorting.field) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'hourlyRate':
          aValue = a.hourlyRate;
          bValue = b.hourlyRate;
          break;
        case 'experience':
          aValue = clientEvents.filter(e => e.assignedStaff.includes(a.id)).length;
          bValue = clientEvents.filter(e => e.assignedStaff.includes(b.id)).length;
          break;
        case 'totalEvents':
          aValue = Math.floor(Math.random() * 50) + a.rating * 10;
          bValue = Math.floor(Math.random() * 50) + b.rating * 10;
          break;
        default:
          return 0;
      }
      
      if (sorting.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  }, [filters, sorting, clientEvents]);

  // Pagination logic
  const paginatedStaff = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredAndSortedStaff.slice(startIndex, endIndex);
  }, [filteredAndSortedStaff, pagination]);

  const totalPages = Math.ceil(filteredAndSortedStaff.length / pagination.itemsPerPage);

  // Statistics
  const stats = useMemo(() => {
    const avgRating = filteredAndSortedStaff.reduce((sum, staff) => sum + staff.rating, 0) / filteredAndSortedStaff.length;
    const avgRate = filteredAndSortedStaff.reduce((sum, staff) => sum + staff.hourlyRate, 0) / filteredAndSortedStaff.length;
    const roleBreakdown = filteredAndSortedStaff.reduce((acc, staff) => {
      const role = staff.specialty || 'General';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalStaff: filteredAndSortedStaff.length,
      avgRating: Math.round(avgRating * 10) / 10,
      avgRate: Math.round(avgRate),
      workedWith: filteredAndSortedStaff.filter(s => workedWithStaffIds.includes(s.id)).length,
      roleBreakdown
    };
  }, [filteredAndSortedStaff, workedWithStaffIds]);

  // Filter update function
  const updateFilter = (key: keyof StaffFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Sort update function
  const updateSorting = (field: StaffSorting['field']) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      search: '',
      role: 'all',
      rating: 'all',
      hourlyRateRange: 'all',
      location: 'all',
      availability: 'all',
      experience: 'all',
      skills: 'all'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Toggle favorite
  const toggleFavorite = (staffId: string) => {
    setFavoriteStaffIds(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
    toast.success("Favorites updated");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Directory</h1>
          <p className="text-muted-foreground">
            Enterprise-level staff management and discovery
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-1" />
            Request Staff
          </Button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalStaff}</div>
                <div className="text-xs text-muted-foreground">Total Staff</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{stats.avgRating}★</div>
                <div className="text-xs text-muted-foreground">Avg Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">${stats.avgRate}</div>
                <div className="text-xs text-muted-foreground">Avg Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{stats.workedWith}</div>
                <div className="text-xs text-muted-foreground">Worked With</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{favoriteStaffIds.length}</div>
                <div className="text-xs text-muted-foreground">Favorites</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{Object.keys(stats.roleBreakdown).length}</div>
                <div className="text-xs text-muted-foreground">Specialties</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff by name, skills, or specialty..."
                  className="pl-10 w-80"
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-primary text-primary-foreground' : ''}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <select 
                className="flex h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={`${sorting.field}-${sorting.direction}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSorting({ field: field as StaffSorting['field'], direction: direction as 'asc' | 'desc' });
                }}
              >
                <option value="rating-desc">Rating ↓</option>
                <option value="rating-asc">Rating ↑</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="hourlyRate-desc">Rate ↓</option>
                <option value="hourlyRate-asc">Rate ↑</option>
                <option value="experience-desc">Experience ↓</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4 bg-muted/30 rounded-lg mb-4">
              <select 
                className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                value={filters.role}
                onChange={(e) => updateFilter('role', e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="Server">Servers</option>
                <option value="Bartender">Bartenders</option>
                <option value="Security">Security</option>
                <option value="Coordinator">Coordinators</option>
                <option value="Setup">Setup Crew</option>
              </select>
              
              <select 
                className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                value={filters.rating}
                onChange={(e) => updateFilter('rating', e.target.value)}
              >
                <option value="all">All Ratings</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
              </select>
              
              <select 
                className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                value={filters.hourlyRateRange}
                onChange={(e) => updateFilter('hourlyRateRange', e.target.value)}
              >
                <option value="all">All Rates</option>
                <option value="15-20">$15-20/hr</option>
                <option value="20-25">$20-25/hr</option>
                <option value="25-30">$25-30/hr</option>
                <option value="30-999">$30+/hr</option>
              </select>
              
              <select 
                className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                value={filters.availability}
                onChange={(e) => updateFilter('availability', e.target.value)}
              >
                <option value="all">All Availability</option>
                <option value="available">Available Now</option>
                <option value="busy">Limited</option>
                <option value="weekend">Weekends Only</option>
              </select>
              
              <select 
                className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                value={filters.experience}
                onChange={(e) => updateFilter('experience', e.target.value)}
              >
                <option value="all">All Experience</option>
                <option value="5">5+ Events</option>
                <option value="10">10+ Events</option>
                <option value="20">20+ Events</option>
              </select>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-8 text-xs"
              >
                <FilterX className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {paginatedStaff.length} of {filteredAndSortedStaff.length} staff</span>
            <div className="flex items-center gap-2">
              <span>Items per page:</span>
              <select 
                className="h-8 w-16 rounded border px-2 text-xs"
                value={pagination.itemsPerPage}
                onChange={(e) => setPagination(prev => ({ ...prev, itemsPerPage: parseInt(e.target.value), currentPage: 1 }))}
              >
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Grid/List */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
        : "space-y-3"
      }>
        {paginatedStaff.map((staff) => {
          const eventsWorked = clientEvents.filter(e => e.assignedStaff.includes(staff.id)).length;
          const isFavorite = favoriteStaffIds.includes(staff.id);
          const hasWorkedWith = workedWithStaffIds.includes(staff.id);
          
          return (
            <Card key={staff.id} className={`hover:shadow-md transition-shadow ${hasWorkedWith ? 'border-blue-200' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{staff.name}</h3>
                      <p className="text-sm text-muted-foreground">{staff.specialty || 'General Staff'}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(staff.id)}
                    className="p-1 h-8 w-8"
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{staff.rating}</span>
                    </div>
                    <span className="text-sm font-medium">${staff.hourlyRate}/hr</span>
                  </div>
                  
                  {hasWorkedWith && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <Award className="h-3 w-3" />
                      Worked together {eventsWorked} time{eventsWorked !== 1 ? 's' : ''}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {staff.skills.slice(0, 2).map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {staff.skills.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{staff.skills.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {staff.name}
                        </DialogTitle>
                        <DialogDescription>
                          View complete profile, skills, and performance history
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Basic Info</h4>
                            <div className="space-y-2 text-sm">
                              <div>Rating: {staff.rating} ⭐</div>
                              <div>Rate: ${staff.hourlyRate}/hour</div>
                              <div>Specialty: {staff.specialty}</div>
                              {hasWorkedWith && <div>Events Together: {eventsWorked}</div>}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Skills</h4>
                            <div className="flex flex-wrap gap-1">
                              {staff.skills.map(skill => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button className="flex-1">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Send Message
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            Book for Event
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button size="sm">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {pagination.currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(totalPages, prev.currentPage + 1) }))}
              disabled={pagination.currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredAndSortedStaff.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No staff found</h3>
          <p className="text-muted-foreground mb-4">
            No staff members match your current filters
          </p>
          <Button onClick={clearAllFilters}>
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}
