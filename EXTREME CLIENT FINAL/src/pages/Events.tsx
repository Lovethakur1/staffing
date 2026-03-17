import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  DollarSign,
  MoreHorizontal,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Download,
  Building2,
  Star,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Grid,
  List,
  SlidersHorizontal,
} from "lucide-react";
import { ComprehensiveEventManagement } from "../components/admin/ComprehensiveEventManagement";
import { useNavigation } from "../contexts/NavigationContext";

interface EventsProps {
  userRole: string;
  userId: string;
}

interface Event {
  id: string;
  name: string;
  client: string;
  date: string;
  time: string;
  location: string;
  type: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  attendees: number;
  budget: number;
  staffAssigned: number;
  staffRequired: number;
  staffCheckedIn: number;
  rating?: number;
}

export function Events({ userRole, userId }: EventsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  // Mock events data
  const allEvents: Event[] = [
    {
      id: 'evt-001',
      name: 'Corporate Annual Gala 2025',
      client: 'TechCorp Industries',
      date: '2025-10-15',
      time: '18:00 - 23:00',
      location: 'Grand Hotel Ballroom',
      type: 'Corporate',
      status: 'in-progress',
      attendees: 250,
      budget: 25000,
      staffRequired: 20,
      staffAssigned: 18,
      staffCheckedIn: 15,
      rating: 5.0,
    },
    {
      id: 'evt-002',
      name: 'Wedding Reception - Johnson',
      client: 'Sarah Johnson',
      date: '2025-10-18',
      time: '17:00 - 22:00',
      location: 'Riverside Garden',
      type: 'Wedding',
      status: 'confirmed',
      attendees: 150,
      budget: 18000,
      staffRequired: 12,
      staffAssigned: 12,
      staffCheckedIn: 0,
      rating: 4.8,
    },
    {
      id: 'evt-003',
      name: 'Product Launch Party',
      client: 'StartUp Inc',
      date: '2025-10-20',
      time: '19:00 - 23:00',
      location: 'Downtown Convention Center',
      type: 'Corporate',
      status: 'confirmed',
      attendees: 300,
      budget: 35000,
      staffRequired: 25,
      staffAssigned: 20,
      staffCheckedIn: 0,
    },
    {
      id: 'evt-004',
      name: 'Charity Fundraiser Dinner',
      client: 'Hope Foundation',
      date: '2025-10-22',
      time: '18:30 - 22:30',
      location: 'City Hall',
      type: 'Fundraiser',
      status: 'pending',
      attendees: 200,
      budget: 22000,
      staffRequired: 15,
      staffAssigned: 10,
      staffCheckedIn: 0,
    },
    {
      id: 'evt-005',
      name: 'Birthday Celebration - Davis',
      client: 'Michael Davis',
      date: '2025-10-12',
      time: '19:00 - 23:00',
      location: 'Rooftop Lounge',
      type: 'Private',
      status: 'completed',
      attendees: 80,
      budget: 8500,
      staffRequired: 8,
      staffAssigned: 8,
      staffCheckedIn: 8,
      rating: 4.9,
    },
  ];

  // If event is selected, show detailed view
  if (selectedEvent) {
    return (
      <ComprehensiveEventManagement 
        eventId={selectedEvent}
        onBack={() => setSelectedEvent(null)}
      />
    );
  }

  // Filter and sort events
  const filteredEvents = allEvents
    .filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || event.status === statusFilter;
      const matchesType = typeFilter === "all" || event.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "budget":
          return b.budget - a.budget;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700";
      case "confirmed":
        return "bg-purple-100 text-purple-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Calculate stats
  const stats = {
    total: allEvents.length,
    upcoming: allEvents.filter(e => ['pending', 'confirmed', 'in-progress'].includes(e.status)).length,
    inProgress: allEvents.filter(e => e.status === 'in-progress').length,
    completed: allEvents.filter(e => e.status === 'completed').length,
    totalRevenue: allEvents.reduce((sum, e) => sum + e.budget, 0),
    avgRating: allEvents.filter(e => e.rating).reduce((sum, e) => sum + (e.rating || 0), 0) / allEvents.filter(e => e.rating).length,
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-slate-900">Event Management</h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage all aspects of your events from creation to completion
            </p>
          </div>
          <Button 
            className="bg-sangria hover:bg-merlot"
            onClick={() => setCurrentPage('create-event')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-slate-900">{stats.total}</div>
            <div className="text-xs text-slate-600">Total Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-blue-600">{stats.upcoming}</div>
            <div className="text-xs text-slate-600">Upcoming</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-orange-600">{stats.inProgress}</div>
            <div className="text-xs text-slate-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-green-600">{stats.completed}</div>
            <div className="text-xs text-slate-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-slate-900">
              ${(stats.totalRevenue / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-slate-600">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-slate-900">
              {stats.avgRating.toFixed(1)}
            </div>
            <div className="text-xs text-slate-600">Avg Rating</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search events, clients, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Corporate">Corporate</SelectItem>
              <SelectItem value="Wedding">Wedding</SelectItem>
              <SelectItem value="Private">Private</SelectItem>
              <SelectItem value="Fundraiser">Fundraiser</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="budget">Budget</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-sangria hover:bg-merlot' : ''}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-sangria hover:bg-merlot' : ''}
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Events List/Grid */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Event Icon */}
                    <div className="w-14 h-14 rounded-lg bg-sangria/10 flex items-center justify-center flex-shrink-0">
                      <CalendarIcon className="w-7 h-7 text-sangria" />
                    </div>

                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900 truncate">{event.name}</h3>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status.replace('-', ' ')}
                        </Badge>
                        <Badge variant="outline">{event.type}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Building2 className="w-4 h-4" />
                          <span className="truncate">{event.client}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Users className="w-4 h-4" />
                          <span>{event.attendees} guests</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden lg:flex flex-col items-center justify-center px-4 border-l">
                      <div className="text-xl font-semibold text-slate-900">
                        ${(event.budget / 1000).toFixed(0)}K
                      </div>
                      <div className="text-xs text-slate-600">Budget</div>
                    </div>

                    <div className="hidden lg:flex flex-col items-center justify-center px-4 border-l">
                      <div className="text-xl font-semibold text-slate-900">
                        {event.staffCheckedIn}/{event.staffAssigned}
                      </div>
                      <div className="text-xs text-slate-600">Staff Check-in</div>
                    </div>

                    {event.rating && (
                      <div className="hidden lg:flex flex-col items-center justify-center px-4 border-l">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-xl font-semibold text-slate-900">{event.rating}</span>
                        </div>
                        <div className="text-xs text-slate-600">Rating</div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedEvent(event.id)}
                        className="bg-sangria hover:bg-merlot"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Event
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Export Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="w-4 h-4 mr-2" />
                            Manage Staff
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 truncate">{event.name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(event.status)}>
                          {event.status.replace('-', ' ')}
                        </Badge>
                        <Badge variant="outline">{event.type}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Building2 className="w-4 h-4" />
                    <span className="truncate">{event.client}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  
                  <div className="pt-3 border-t space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Budget</span>
                      <span className="font-semibold">${event.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Staff</span>
                      <span className="font-semibold">{event.staffAssigned}/{event.staffRequired}</span>
                    </div>
                    {event.rating && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">{event.rating}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => setSelectedEvent(event.id)}
                    className="w-full bg-sangria hover:bg-merlot mt-4"
                  >
                    View Full Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No events found</h3>
            <p className="text-slate-600 mb-4">
              Try adjusting your filters or create a new event
            </p>
            <Button className="bg-sangria hover:bg-merlot">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
