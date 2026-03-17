import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { TooltipWrapper, IconTooltip, InfoTooltip } from "../components/ui/tooltip-wrapper";
import {
  Heart,
  Star,
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  Plus
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import api from "../services/api";

interface FavoritesProps {
  userRole: string;
  userId: string;
}

export function Favorites({ userRole, userId }: FavoritesProps) {
  const { setCurrentPage } = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [clientEvents, setClientEvents] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const staffRes = await api.get('/staff');
        const staffRaw = staffRes.data;
        const staffArr = Array.isArray(staffRaw) ? staffRaw : (staffRaw?.data || []);
        if (staffArr.length > 0) {
          setAllStaff(staffArr.map((s: any) => ({
            id: s.id,
            name: s.name || s.user?.name || 'Staff',
            email: s.email || s.user?.email || '',
            phone: s.phone || s.user?.phone || '',
            role: s.role || 'Staff',
            skills: s.skills || [],
            rating: s.rating || 4.5,
            hourlyRate: s.hourlyRate || 25,
            experience: s.experience || 1,
            totalEvents: s.totalEvents || s._count?.shifts || 0,
          })));
        }
      } catch {
        setError('Unable to load staff data. Please check your connection and try again.');
      }
      try {
        const evRes = await api.get('/events');
        const evRaw = evRes.data;
        const evArr = Array.isArray(evRaw) ? evRaw : (evRaw?.data || []);
        setClientEvents(evArr.filter((e: any) => e.clientId === userId));
      } catch { /* events optional */ }
      try {
        const favRes = await api.get('/clients/favorites');
        const favRaw = favRes.data;
        const favArr = Array.isArray(favRaw) ? favRaw : (favRaw?.data || []);
        setFavoriteIds(favArr.map((f: any) => f.staffId || f.id));
      } catch { /* favorites optional */ }
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  // Get worked-with staff IDs from events
  const workedWithStaffIds = [...new Set(clientEvents.flatMap((event: any) => event.assignedStaff || event.shifts?.map((s: any) => s.staffId) || []))];

  // Filter staff to show only high-rated ones (favorites are typically 4.5+ rating)
  // and those the client has worked with or marked as favorite
  const favoriteStaff = allStaff.filter(staff =>
    staff.rating >= 4.5 || workedWithStaffIds.includes(staff.id) || favoriteIds.includes(staff.id)
  );

  // Filter staff based on search and filters
  const filteredStaff = favoriteStaff.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSkill = skillFilter === "all" || staff.skills.includes(skillFilter);

    const matchesRating = ratingFilter === "all" ||
      (ratingFilter === "5" && staff.rating >= 5) ||
      (ratingFilter === "4+" && staff.rating >= 4.5) ||
      (ratingFilter === "4" && staff.rating >= 4 && staff.rating < 4.5);

    return matchesSearch && matchesSkill && matchesRating;
  });

  // Get unique skills for filter dropdown
  const allSkills = [...new Set(favoriteStaff.flatMap(staff => staff.skills))];

  const getWorkedWithCount = (staffId: string) => {
    return clientEvents.filter(event => event.assignedStaff.includes(staffId)).length;
  };

  const isStaffWorkedWith = (staffId: string) => {
    return workedWithStaffIds.includes(staffId);
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading favorites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Server Error</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="desktop-first-header mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold text-foreground flex items-center gap-2">
              <Heart className="h-8 w-8 text-red-500 fill-red-500" />
              Favorite Staff
            </h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              Client
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Your most trusted and preferred professional staff members
          </p>
        </div>
        <Button onClick={() => setCurrentPage("staff")} size="lg" variant="outline">
          <Users className="mr-2 h-5 w-5" />
          Browse All Staff
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Favorite Staff</p>
                <p className="text-2xl font-bold">{favoriteStaff.length}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Worked With</p>
                <p className="text-2xl font-bold text-green-600">{workedWithStaffIds.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {favoriteStaff.length > 0 ?
                    (favoriteStaff.reduce((sum, staff) => sum + staff.rating, 0) / favoriteStaff.length).toFixed(1)
                    : '0'}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold text-primary">
                  {favoriteStaff.reduce((sum, staff) => sum + getWorkedWithCount(staff.id), 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-lg mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {allSkills.slice(0, 10).map((skill) => (
                  <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4+">4.5+ Stars</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff Grid */}
      {filteredStaff.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No favorite staff found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || skillFilter !== "all" || ratingFilter !== "all"
                ? "Try adjusting your search criteria or filters."
                : "Build your favorites list by working with our professional staff."}
            </p>
            <Button onClick={() => setCurrentPage("staff")} size="lg">
              <Users className="mr-2 h-5 w-5" />
              Browse Staff Directory
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((staff) => (
            <Card key={staff.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-semibold">{staff.name}</h4>
                      {isStaffWorkedWith(staff.id) ? (
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      ) : (
                        <Heart className="h-4 w-4 text-gray-300" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{staff.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({staff.totalEvents} events)
                      </span>
                    </div>
                    {isStaffWorkedWith(staff.id) && (
                      <Badge variant="secondary" className="text-xs">
                        Worked together {getWorkedWithCount(staff.id)} times
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-primary">${staff.hourlyRate}/hr</p>
                    <p className="text-xs text-muted-foreground">hourly rate</p>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {staff.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {staff.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{staff.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Experience Highlights */}
                <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{staff.experience} years</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span>{staff.totalEvents} events</span>
                    </div>
                  </div>
                </div>

                {/* Contact & Actions */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Again
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      View Profile
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </Button>
                  </div>

                  {!isStaffWorkedWith(staff.id) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-red-500 border-red-200 hover:bg-red-50"
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Add to Favorites
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg mt-8">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Need Help Finding the Right Staff?</h3>
            <p className="text-muted-foreground">
              Our team can help you find the perfect staff for your next event based on your preferences and past experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => setCurrentPage("book-event")}>
                <Plus className="mr-2 h-5 w-5" />
                Book New Event
              </Button>
              <Button variant="outline" onClick={() => setCurrentPage("messages")}>
                <MessageSquare className="mr-2 h-5 w-5" />
                Contact Support
              </Button>
              <Button variant="outline" onClick={() => setCurrentPage("staff")}>
                <Users className="mr-2 h-5 w-5" />
                Browse All Staff
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
