import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  CalendarDays,
  Search,
  Filter,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Download,
  Star,
  TrendingUp,
  Briefcase,
} from "lucide-react";
import { format, parseISO, isPast, isFuture, isToday } from "date-fns";
import { useNavigation } from "../contexts/NavigationContext";

interface StaffMyEventsProps {
  userId: string;
}

// Mock events data for staff member
const mockStaffEvents = [
  // Upcoming Events
  {
    id: "event-001",
    name: "Annual Corporate Gala 2024",
    type: "Corporate Event",
    status: "confirmed",
    role: "Bartender",
    date: "2024-12-15",
    startTime: "18:00",
    endTime: "23:00",
    duration: 5,
    venue: "Grand Luxe Hotel Ballroom",
    address: "456 Luxury Ave, Los Angeles, CA",
    expectedGuests: 200,
    checkInStatus: "not-started",
    payRate: 25.00,
    totalPay: 125.00,
  },
  {
    id: "event-002",
    name: "Wedding Reception - Smith & Johnson",
    type: "Wedding",
    status: "confirmed",
    role: "Server",
    date: "2024-12-20",
    startTime: "17:00",
    endTime: "22:00",
    duration: 5,
    venue: "Oceanview Banquet Hall",
    address: "789 Beach Blvd, Santa Monica, CA",
    expectedGuests: 150,
    checkInStatus: "not-started",
    payRate: 22.00,
    totalPay: 110.00,
  },
  {
    id: "event-003",
    name: "Tech Conference Networking Mixer",
    type: "Corporate Event",
    status: "confirmed",
    role: "Bartender",
    date: "2024-12-22",
    startTime: "19:00",
    endTime: "23:00",
    duration: 4,
    venue: "Downtown Convention Center",
    address: "321 Tech Plaza, Los Angeles, CA",
    expectedGuests: 300,
    checkInStatus: "not-started",
    payRate: 25.00,
    totalPay: 100.00,
  },
  {
    id: "event-004",
    name: "New Year's Eve Celebration",
    type: "Private Party",
    status: "confirmed",
    role: "Bartender",
    date: "2024-12-31",
    startTime: "20:00",
    endTime: "02:00",
    duration: 6,
    venue: "Skyline Rooftop Lounge",
    address: "555 High Street, Los Angeles, CA",
    expectedGuests: 250,
    checkInStatus: "not-started",
    payRate: 30.00,
    totalPay: 180.00,
  },
  {
    id: "event-005",
    name: "Holiday Office Party",
    type: "Corporate Event",
    status: "pending",
    role: "Server",
    date: "2024-12-18",
    startTime: "18:00",
    endTime: "22:00",
    duration: 4,
    venue: "Garden Terrace Restaurant",
    address: "888 Park Lane, Beverly Hills, CA",
    expectedGuests: 80,
    checkInStatus: "not-started",
    payRate: 22.00,
    totalPay: 88.00,
  },
  {
    id: "event-012",
    name: "Luxury Brand Product Launch",
    type: "Corporate Event",
    status: "confirmed",
    role: "Server",
    date: "2025-01-05",
    startTime: "19:00",
    endTime: "23:00",
    duration: 4,
    venue: "Fashion District Gallery",
    address: "789 Style Ave, Beverly Hills, CA",
    expectedGuests: 180,
    checkInStatus: "not-started",
    payRate: 24.00,
    totalPay: 96.00,
  },
  {
    id: "event-013",
    name: "Winter Charity Fundraiser",
    type: "Fundraiser",
    status: "confirmed",
    role: "Bartender",
    date: "2025-01-10",
    startTime: "18:00",
    endTime: "22:00",
    duration: 4,
    venue: "Metropolitan Arts Center",
    address: "456 Culture Blvd, Los Angeles, CA",
    expectedGuests: 220,
    checkInStatus: "not-started",
    payRate: 25.00,
    totalPay: 100.00,
  },
  {
    id: "event-014",
    name: "Executive Board Meeting Dinner",
    type: "Corporate Event",
    status: "confirmed",
    role: "Server",
    date: "2025-01-12",
    startTime: "18:30",
    endTime: "21:30",
    duration: 3,
    venue: "Executive Club Private Dining",
    address: "100 Corporate Plaza, Los Angeles, CA",
    expectedGuests: 50,
    checkInStatus: "not-started",
    payRate: 28.00,
    totalPay: 84.00,
  },
  {
    id: "event-015",
    name: "Super Bowl Viewing Party",
    type: "Private Party",
    status: "confirmed",
    role: "Bartender",
    date: "2025-02-09",
    startTime: "16:00",
    endTime: "22:00",
    duration: 6,
    venue: "Sports Bar & Lounge",
    address: "234 Game Day Drive, Santa Monica, CA",
    expectedGuests: 300,
    checkInStatus: "not-started",
    payRate: 26.00,
    totalPay: 156.00,
  },
  {
    id: "event-016",
    name: "Valentine's Day Dinner Service",
    type: "Private Party",
    status: "confirmed",
    role: "Server",
    date: "2025-02-14",
    startTime: "17:00",
    endTime: "23:00",
    duration: 6,
    venue: "Romantic Garden Restaurant",
    address: "567 Love Lane, Malibu, CA",
    expectedGuests: 120,
    checkInStatus: "not-started",
    payRate: 23.00,
    totalPay: 138.00,
  },
  {
    id: "event-017",
    name: "Industry Awards Ceremony",
    type: "Corporate Event",
    status: "pending",
    role: "Bartender",
    date: "2025-02-20",
    startTime: "19:00",
    endTime: "00:00",
    duration: 5,
    venue: "Grand Theater & Ballroom",
    address: "890 Broadway, Los Angeles, CA",
    expectedGuests: 400,
    checkInStatus: "not-started",
    payRate: 27.00,
    totalPay: 135.00,
  },
  {
    id: "event-018",
    name: "Spring Fashion Show After Party",
    type: "Private Party",
    status: "pending",
    role: "Server",
    date: "2025-03-15",
    startTime: "21:00",
    endTime: "02:00",
    duration: 5,
    venue: "Runway Club",
    address: "123 Fashion Ave, Beverly Hills, CA",
    expectedGuests: 250,
    checkInStatus: "not-started",
    payRate: 25.00,
    totalPay: 125.00,
  },

  // Past/Completed Events
  {
    id: "event-006",
    name: "Thanksgiving Corporate Dinner",
    type: "Corporate Event",
    status: "completed",
    role: "Bartender",
    date: "2024-11-25",
    startTime: "18:00",
    endTime: "22:00",
    duration: 4,
    venue: "Heritage Hall",
    address: "123 Main St, Los Angeles, CA",
    expectedGuests: 120,
    checkInStatus: "completed",
    payRate: 25.00,
    totalPay: 100.00,
    rating: 5,
    feedback: "Excellent service!",
  },
  {
    id: "event-007",
    name: "Fall Charity Gala",
    type: "Fundraiser",
    status: "completed",
    role: "Server",
    date: "2024-11-10",
    startTime: "19:00",
    endTime: "23:00",
    duration: 4,
    venue: "Crystal Ballroom",
    address: "456 Charity Dr, Los Angeles, CA",
    expectedGuests: 200,
    checkInStatus: "completed",
    payRate: 22.00,
    totalPay: 88.00,
    rating: 5,
    feedback: "Great team player",
  },
  {
    id: "event-008",
    name: "Halloween Costume Party",
    type: "Private Party",
    status: "completed",
    role: "Bartender",
    date: "2024-10-31",
    startTime: "20:00",
    endTime: "01:00",
    duration: 5,
    venue: "Mansion Estate",
    address: "777 Spooky Lane, Hollywood, CA",
    expectedGuests: 150,
    checkInStatus: "completed",
    payRate: 26.00,
    totalPay: 130.00,
    rating: 4,
    feedback: "Professional and efficient",
  },
  {
    id: "event-009",
    name: "Product Launch Event",
    type: "Corporate Event",
    status: "completed",
    role: "Server",
    date: "2024-10-15",
    startTime: "18:00",
    endTime: "21:00",
    duration: 3,
    venue: "Tech Hub Auditorium",
    address: "999 Innovation Blvd, Santa Monica, CA",
    expectedGuests: 180,
    checkInStatus: "completed",
    payRate: 23.00,
    totalPay: 69.00,
    rating: 5,
    feedback: "Outstanding performance!",
  },
  {
    id: "event-010",
    name: "Summer BBQ Festival",
    type: "Festival",
    status: "completed",
    role: "Bartender",
    date: "2024-09-20",
    startTime: "12:00",
    endTime: "18:00",
    duration: 6,
    venue: "Beachfront Park",
    address: "111 Ocean Ave, Malibu, CA",
    expectedGuests: 500,
    checkInStatus: "completed",
    payRate: 24.00,
    totalPay: 144.00,
    rating: 5,
    feedback: "Handled high volume excellently",
  },
  {
    id: "event-019",
    name: "Corporate Training Seminar Lunch",
    type: "Corporate Event",
    status: "completed",
    role: "Server",
    date: "2024-10-05",
    startTime: "11:00",
    endTime: "15:00",
    duration: 4,
    venue: "Business Conference Center",
    address: "345 Corporate Way, Los Angeles, CA",
    expectedGuests: 100,
    checkInStatus: "completed",
    payRate: 21.00,
    totalPay: 84.00,
    rating: 4,
    feedback: "Timely and courteous",
  },
  {
    id: "event-020",
    name: "Wine Tasting & Auction",
    type: "Fundraiser",
    status: "completed",
    role: "Bartender",
    date: "2024-09-15",
    startTime: "18:00",
    endTime: "22:00",
    duration: 4,
    venue: "Vineyard Estate",
    address: "678 Wine Country Rd, Malibu, CA",
    expectedGuests: 80,
    checkInStatus: "completed",
    payRate: 27.00,
    totalPay: 108.00,
    rating: 5,
    feedback: "Wine knowledge impressive!",
  },
  {
    id: "event-021",
    name: "Summer Concert VIP Lounge",
    type: "Festival",
    status: "completed",
    role: "Bartender",
    date: "2024-08-20",
    startTime: "19:00",
    endTime: "23:00",
    duration: 4,
    venue: "Outdoor Amphitheater",
    address: "890 Music Blvd, Los Angeles, CA",
    expectedGuests: 200,
    checkInStatus: "completed",
    payRate: 28.00,
    totalPay: 112.00,
    rating: 5,
    feedback: "Energy and professionalism!",
  },
  {
    id: "event-022",
    name: "Independence Day Celebration",
    type: "Private Party",
    status: "completed",
    role: "Server",
    date: "2024-07-04",
    startTime: "16:00",
    endTime: "22:00",
    duration: 6,
    venue: "Rooftop Terrace",
    address: "234 Patriot Plaza, Santa Monica, CA",
    expectedGuests: 150,
    checkInStatus: "completed",
    payRate: 24.00,
    totalPay: 144.00,
    rating: 4,
    feedback: "Great attitude throughout",
  },
  {
    id: "event-023",
    name: "Spring Corporate Retreat",
    type: "Corporate Event",
    status: "completed",
    role: "Bartender",
    date: "2024-06-10",
    startTime: "09:00",
    endTime: "17:00",
    duration: 8,
    venue: "Mountain Resort Conference Hall",
    address: "567 Summit Drive, Big Bear, CA",
    expectedGuests: 120,
    checkInStatus: "completed",
    payRate: 26.00,
    totalPay: 208.00,
    rating: 5,
    feedback: "Exceptional all-day service",
  },
  {
    id: "event-024",
    name: "Mother's Day Brunch",
    type: "Private Party",
    status: "completed",
    role: "Server",
    date: "2024-05-12",
    startTime: "10:00",
    endTime: "15:00",
    duration: 5,
    venue: "Garden Café & Bistro",
    address: "123 Bloom Street, Beverly Hills, CA",
    expectedGuests: 90,
    checkInStatus: "completed",
    payRate: 23.00,
    totalPay: 115.00,
    rating: 5,
    feedback: "Warm and attentive service",
  },
  {
    id: "event-025",
    name: "Easter Sunday Dinner Service",
    type: "Private Party",
    status: "completed",
    role: "Server",
    date: "2024-03-31",
    startTime: "17:00",
    endTime: "21:00",
    duration: 4,
    venue: "Elegant Dining Hall",
    address: "456 Spring Ave, Los Angeles, CA",
    expectedGuests: 100,
    checkInStatus: "completed",
    payRate: 22.00,
    totalPay: 88.00,
    rating: 4,
    feedback: "Professional and friendly",
  },
  {
    id: "event-026",
    name: "St. Patrick's Day Party",
    type: "Private Party",
    status: "completed",
    role: "Bartender",
    date: "2024-03-17",
    startTime: "18:00",
    endTime: "01:00",
    duration: 7,
    venue: "Irish Pub & Restaurant",
    address: "789 Celtic Way, Santa Monica, CA",
    expectedGuests: 250,
    checkInStatus: "completed",
    payRate: 25.00,
    totalPay: 175.00,
    rating: 5,
    feedback: "Handled rush excellently!",
  },
  {
    id: "event-027",
    name: "Annual Shareholders Meeting",
    type: "Corporate Event",
    status: "completed",
    role: "Server",
    date: "2024-02-28",
    startTime: "08:00",
    endTime: "17:00",
    duration: 9,
    venue: "Corporate Headquarters",
    address: "900 Business Park Dr, Los Angeles, CA",
    expectedGuests: 300,
    checkInStatus: "completed",
    payRate: 27.00,
    totalPay: 243.00,
    rating: 5,
    feedback: "Impeccable corporate service",
  },
  {
    id: "event-028",
    name: "Winter Sports Awards Banquet",
    type: "Corporate Event",
    status: "completed",
    role: "Bartender",
    date: "2024-01-20",
    startTime: "18:00",
    endTime: "22:00",
    duration: 4,
    venue: "Alpine Lodge",
    address: "123 Mountain Rd, Big Bear, CA",
    expectedGuests: 150,
    checkInStatus: "completed",
    payRate: 26.00,
    totalPay: 104.00,
    rating: 5,
    feedback: "Fantastic energy!",
  },
  
  // Cancelled Event
  {
    id: "event-011",
    name: "Awards Ceremony Dinner",
    type: "Corporate Event",
    status: "cancelled",
    role: "Server",
    date: "2024-11-05",
    startTime: "19:00",
    endTime: "23:00",
    duration: 4,
    venue: "Prestige Theater",
    address: "222 Broadway, Los Angeles, CA",
    expectedGuests: 150,
    checkInStatus: "cancelled",
    payRate: 24.00,
    totalPay: 96.00,
  },
];

export function StaffMyEvents({ userId }: StaffMyEventsProps) {
  const { setCurrentPage } = useNavigation();
  const [activeTab, setActiveTab] = useState<"upcoming" | "history" | "pending">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [currentPage, setCurrentPageNum] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;

  // Filter events based on tab
  const getEventsByTab = () => {
    const now = new Date();
    switch (activeTab) {
      case "upcoming":
        return mockStaffEvents.filter(
          (event) => 
            (isFuture(parseISO(event.date)) || isToday(parseISO(event.date))) &&
            event.status !== "cancelled" &&
            event.status !== "completed"
        );
      case "history":
        return mockStaffEvents.filter(
          (event) => 
            event.status === "completed" || 
            (isPast(parseISO(event.date)) && !isToday(parseISO(event.date)))
        );
      case "pending":
        return mockStaffEvents.filter((event) => event.status === "pending");
      default:
        return mockStaffEvents;
    }
  };

  // Apply filters and search
  const filteredEvents = getEventsByTab().filter((event) => {
    const matchesSearch =
      searchQuery === "" ||
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || event.type === filterType;
    const matchesRole = filterRole === "all" || event.role === filterRole;

    return matchesSearch && matchesType && matchesRole;
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "date-desc":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "name":
        return a.name.localeCompare(b.name);
      case "venue":
        return a.venue.localeCompare(b.venue);
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedEvents.length / itemsPerPage);
  const paginatedEvents = sortedEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique types and roles for filters
  const eventTypes = Array.from(new Set(mockStaffEvents.map((e) => e.type)));
  const eventRoles = Array.from(new Set(mockStaffEvents.map((e) => e.role)));

  // Statistics
  const stats = {
    upcoming: mockStaffEvents.filter(
      (e) =>
        (isFuture(parseISO(e.date)) || isToday(parseISO(e.date))) &&
        e.status !== "cancelled" &&
        e.status !== "completed"
    ).length,
    completed: mockStaffEvents.filter((e) => e.status === "completed").length,
    pending: mockStaffEvents.filter((e) => e.status === "pending").length,
    totalHours: mockStaffEvents
      .filter((e) => e.status === "completed")
      .reduce((sum, e) => sum + e.duration, 0),
  };

  const handleViewDetails = (eventId: string) => {
    setCurrentPage("shift-details");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-[#5E1916]">My Events</h1>
          <p className="text-gray-500">View all your event assignments and history</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-[#5E1916] mt-1">{stats.upcoming}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-[#5E1916] mt-1">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Events</p>
                <p className="text-2xl font-bold text-[#5E1916] mt-1">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours Worked</p>
                <p className="text-2xl font-bold text-[#5E1916] mt-1">{stats.totalHours}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters (Collapsible) */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Event Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Your Role</label>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {eventRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date (Earliest First)</SelectItem>
                    <SelectItem value="date-desc">Date (Latest First)</SelectItem>
                    <SelectItem value="name">Event Name (A-Z)</SelectItem>
                    <SelectItem value="venue">Venue (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterType("all");
                  setFilterRole("all");
                  setSortBy("date");
                  setSearchQuery("");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Event List
            </CardTitle>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search events, venues, or types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming" className="gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming
                {stats.upcoming > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {stats.upcoming}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="pending" className="gap-2">
                <AlertCircle className="h-4 w-4" />
                Pending
                {stats.pending > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {stats.pending}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {paginatedEvents.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDays className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No events found</p>
                  {searchQuery && (
                    <Button
                      variant="link"
                      onClick={() => setSearchQuery("")}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event Details</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Venue</TableHead>
                          <TableHead>Your Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedEvents.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{event.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {event.type}
                                  </Badge>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {event.expectedGuests} guests
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {format(parseISO(event.date), "MMM dd, yyyy")}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {event.startTime} - {event.endTime}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {event.duration}h duration
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium text-sm">{event.venue}</p>
                                  <p className="text-xs text-gray-500">{event.address}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-[#5E1916] text-white">
                                <Briefcase className="h-3 w-3 mr-1" />
                                {event.role}
                              </Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(event.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(event.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-sm text-gray-500">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(currentPage * itemsPerPage, sortedEvents.length)} of{" "}
                        {sortedEvents.length} events
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageNum(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <div className="flex gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPageNum(page)}
                              className={
                                currentPage === page
                                  ? "bg-[#5E1916] hover:bg-[#4E0707]"
                                  : ""
                              }
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageNum(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}