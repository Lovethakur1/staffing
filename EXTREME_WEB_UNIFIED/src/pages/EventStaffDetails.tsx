import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Separator } from "../components/ui/separator";
import {
  Users,
  Search,
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Calendar,
  DollarSign,
  Trophy,
  Activity,
  Crown,
  Shield,
  Heart,
  Send,
  CalendarDays,
  Timer,
  MapPinIcon,
  User,
  TrendingUp,
  Award,
  Target,
  Briefcase,
  Users2,
  Filter,
  SortAsc,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserPlus
} from "lucide-react";
import { Staff } from "../data/mockData";
import { useNavigation } from "../contexts/NavigationContext";
import api from "../services/api";
import { toast } from "sonner";
import { reviewService } from "../services/review.service";

interface EventStaffDetailsProps {
  userRole: string;
  userId: string;
}

interface StaffRating {
  id: string;
  staffId: string;
  clientId: string;
  eventId: string;
  rating: number;
  review: string;
  date: string;
}

export function EventStaffDetails({ userRole, userId }: EventStaffDetailsProps) {
  const { setCurrentPage, pageParams } = useNavigation();
  const eventId = pageParams?.eventId;

  // State variables
  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [selectedStaffForRating, setSelectedStaffForRating] = useState<Staff | null>(null);
  const [ratingType, setRatingType] = useState<"individual" | "group">("individual");
  const [favoriteStaff, setFavoriteStaff] = useState<string[]>([
    "staff-1", "staff-3", "staff-5"
  ]);

  // Mock ratings data
  const [staffRatings] = useState<StaffRating[]>([
    {
      id: "rating-1",
      staffId: "staff-1",
      clientId: userId,
      eventId: eventId || "event-1",
      rating: 5,
      review: "Exceptional service! Emma was professional, punctual, and went above and beyond.",
      date: "2024-01-15"
    },
    {
      id: "rating-2",
      staffId: "staff-2",
      clientId: userId,
      eventId: eventId || "event-1",
      rating: 4,
      review: "Great work ethic and very reliable. Would book again!",
      date: "2024-01-15"
    }
  ]);

  // State for API data
  const [event, setEvent] = useState<any>(null);
  const [eventStaff, setEventStaff] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (eventId) {
          const evRes = await api.get(`/events/${eventId}`);
          const evRaw = evRes.data;
          const ev = evRaw?.data || evRaw;
          if (ev && ev.id) {
            setEvent({
              ...ev,
              title: ev.title || ev.eventName || 'Event',
              location: ev.location || ev.venue || '',
              status: (ev.status || 'pending').toLowerCase(),
              date: ev.date || '',
              time: `${ev.startTime || ''} - ${ev.endTime || ''}`,
              assignedStaff: ev.shifts?.map((s: any) => s.staffId) || [],
            });
            // Extract staff directly from the event's shifts (already included in the getEvent response)
            const staffFromShifts = (ev.shifts || []).map((s: any) => {
              const staffUser = s.staff || {};
              const profile = staffUser.staffProfile || {};
              return {
                id: staffUser.id || s.staffId,
                name: staffUser.name || 'Staff Member',
                email: staffUser.email || '',
                phone: staffUser.phone || '',
                location: profile.location || '',
                skills: profile.skills || [],
                rating: profile.rating || 4.5,
                hourlyRate: s.hourlyRate || profile.hourlyRate || 0,
                totalEvents: profile.totalEvents || 0,
                availabilityStatus: profile.availabilityStatus || 'available',
                experience: profile.totalEvents || 0,
                shiftStatus: (s.status || '').toLowerCase(),
                role: s.role || '',
              };
            });
            setEventStaff(staffFromShifts);
          } else {
            setError('Event not found.');
          }
        } else {
          setError('No event specified.');
        }
      } catch {
        setError('Unable to load event details. Please check your connection and try again.');
      }
      setLoading(false);
    };
    fetchData();
  }, [eventId]);



  const eventManager = event?.manager ? { name: event.manager.name || event.manager.user?.name, email: event.manager.email || event.manager.user?.email || '', role: 'Manager' } : null;


  // Get all unique skills
  const allSkills = Array.from(new Set(eventStaff.flatMap(staff => staff.skills)));

  // Filter and sort staff
  const getFilteredStaff = () => {
    let filtered = eventStaff;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(staff =>
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.skills.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by skill
    if (skillFilter !== "all") {
      filtered = filtered.filter(staff => staff.skills.includes(skillFilter));
    }

    // Filter by availability
    if (availabilityFilter !== "all") {
      filtered = filtered.filter(staff => staff.availabilityStatus === availabilityFilter);
    }

    // Sort staff
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "experience":
          return b.totalEvents - a.totalEvents;
        case "rate":
          return a.hourlyRate - b.hourlyRate;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  };

  const filteredStaff = getFilteredStaff();

  // Toggle favorite staff
  const toggleFavorite = (staffId: string) => {
    setFavoriteStaff(prev =>
      prev.includes(staffId)
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  // Get staff rating by client
  const getStaffRating = (staffId: string) => {
    const rating = staffRatings.find(r => r.staffId === staffId && r.clientId === userId);
    return rating?.rating || 0;
  };

  // Get availability color
  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-success text-success-foreground";
      case "busy":
        return "bg-warning text-warning-foreground";
      case "unavailable":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="w-3 h-3" />;
      case "busy":
        return <Clock className="w-3 h-3" />;
      case "unavailable":
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  // Rating Dialog Component
  const RatingDialog = () => {
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState("");
    const [groupRatings, setGroupRatings] = useState<{ [key: string]: { rating: number, review: string } }>({});

    // Initialize group ratings for all staff
    const initializeGroupRatings = () => {
      const initialRatings: { [key: string]: { rating: number, review: string } } = {};
      filteredStaff.forEach(staff => {
        initialRatings[staff.id] = { rating: 5, review: "" };
      });
      setGroupRatings(initialRatings);
    };

    // Update individual staff rating in group mode
    const updateGroupRating = (staffId: string, rating: number) => {
      setGroupRatings(prev => ({
        ...prev,
        [staffId]: { ...prev[staffId], rating }
      }));
    };

    // Update individual staff review in group mode
    const updateGroupReview = (staffId: string, review: string) => {
      setGroupRatings(prev => ({
        ...prev,
        [staffId]: { ...prev[staffId], review }
      }));
    };

    const handleSubmitRating = async () => {
      try {
        if (ratingType === "group") {
          // Submit all ratings in parallel
          const promises = Object.entries(groupRatings).map(([staffId, data]) => 
            reviewService.submitReview({
              staffId,
              eventId: event?.id || '',
              rating: data.rating,
              feedback: data.review
            })
          );
          await Promise.all(promises);
          toast.success('Successfully submitted ratings for all staff!');
        } else if (selectedStaffForRating) {
          // Submit individual rating
          await reviewService.submitReview({
            staffId: selectedStaffForRating.id,
            eventId: event?.id || '',
            rating,
            feedback: review
          });
          toast.success(`Successfully rated ${selectedStaffForRating.name}!`);
        }
        
        // Refresh event data to reflect new ratings/favorites if needed
        setTimeout(() => {
          window.location.reload();
        }, 1500);

      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to submit rating. Please try again.');
        console.error('Error submitting rating:', error);
      } finally {
        setShowRatingDialog(false);
        setRating(5);
        setReview("");
        setGroupRatings({});
      }
    };

    return (
      <Dialog
        open={showRatingDialog}
        onOpenChange={(open) => {
          setShowRatingDialog(open);
          if (open && ratingType === "group") {
            initializeGroupRatings();
          }
        }}
      >
        <DialogContent className={ratingType === "group" ? "max-w-4xl max-h-[90vh] overflow-y-auto" : "max-w-md"}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              {ratingType === "individual"
                ? `Rate ${selectedStaffForRating?.name}`
                : `Rate All Event Staff (${filteredStaff.length} members)`
              }
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {ratingType === "individual" ? (
              // Individual Rating Interface
              <>
                {/* Star Rating */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Overall Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1"
                      >
                        <Star
                          className={`w-6 h-6 ${star <= rating
                            ? 'fill-warning text-warning'
                            : 'text-muted-foreground'
                            }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Review (Optional)</label>
                  <Textarea
                    placeholder="Share your experience with this staff member..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows={4}
                  />
                </div>
              </>
            ) : (
              // Group Rating Interface
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-medium">Rate All Staff Members</h4>
                    <p className="text-sm text-muted-foreground">
                      Provide individual ratings and feedback for each staff member
                    </p>
                  </div>
                  <Badge variant="outline">{filteredStaff.length} Staff</Badge>
                </div>

                <div className="grid gap-4 max-h-[60vh] overflow-y-auto">
                  {filteredStaff.map((staff) => (
                    <Card key={staff.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>
                            {staff.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-3">
                          <div>
                            <h5 className="font-medium">{staff.name}</h5>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{staff.skills.slice(0, 2).join(", ")}</span>
                              <span>•</span>
                              <span>${staff.hourlyRate}/hr</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-warning fill-current" />
                                <span>{staff.rating}</span>
                              </div>
                            </div>
                          </div>

                          {/* Individual Rating */}
                          <div>
                            <label className="text-sm font-medium mb-2 block">Rating</label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => updateGroupRating(staff.id, star)}
                                  className="p-1"
                                >
                                  <Star
                                    className={`w-5 h-5 ${star <= (groupRatings[staff.id]?.rating || 5)
                                      ? 'fill-warning text-warning'
                                      : 'text-muted-foreground'
                                      }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Individual Review */}
                          <div>
                            <label className="text-sm font-medium mb-2 block">Review (Optional)</label>
                            <Textarea
                              placeholder={`Share your experience with ${staff.name}...`}
                              value={groupRatings[staff.id]?.review || ""}
                              onChange={(e) => updateGroupReview(staff.id, e.target.value)}
                              rows={2}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowRatingDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmitRating}
              >
                <Send className="w-4 h-4 mr-2" />
                {ratingType === "individual" ? "Submit Rating" : "Submit All Ratings"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Calculate staff statistics
  const staffStats = {
    total: eventStaff.length,
    available: eventStaff.filter(s => s.availabilityStatus === 'available').length,
    busy: eventStaff.filter(s => s.availabilityStatus === 'busy').length,
    unavailable: eventStaff.filter(s => s.availabilityStatus === 'unavailable').length,
    averageRating: eventStaff.reduce((acc, staff) => acc + staff.rating, 0) / eventStaff.length,
    totalHourlyRate: eventStaff.reduce((acc, staff) => acc + staff.hourlyRate, 0),
    averageExperience: eventStaff.reduce((acc, staff) => acc + staff.totalEvents, 0) / eventStaff.length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event staff details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Server Error</h2>
          <p className="text-gray-500 mb-4">{error || 'Event data not available.'}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage("staff")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Staff Directory
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                {event.title} - Staff Details
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  {event.date}
                </div>
                <div className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  {event.time}
                </div>
                <div className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  {event.location}
                </div>
                <Badge className={`${event.status === 'confirmed' ? 'bg-success text-success-foreground' :
                  event.status === 'pending' ? 'bg-warning text-warning-foreground' :
                    event.status === 'completed' ? 'bg-info text-info-foreground' :
                      'bg-destructive text-destructive-foreground'
                  }`}>
                  {event.status}
                </Badge>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{staffStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Staff</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-success">{staffStats.available}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-warning">{staffStats.busy}</div>
                <div className="text-sm text-muted-foreground">Busy</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-destructive">{staffStats.unavailable}</div>
                <div className="text-sm text-muted-foreground">Unavailable</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">{staffStats.averageRating.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">${staffStats.totalHourlyRate}</div>
                <div className="text-sm text-muted-foreground">Total Rate/hr</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Event Manager Section */}
      {eventManager && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Event Manager
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-border">
                <AvatarFallback className="text-lg bg-primary text-primary-foreground font-medium">
                  {eventManager.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="text-lg font-medium">{eventManager.name}</h4>
                <p className="text-muted-foreground">{eventManager.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Event Manager
                  </Badge>
                  <Badge variant="outline">
                    {eventManager.role}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search staff by name, location, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Skills" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {allSkills.map((skill) => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="rate">Hourly Rate</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>

              {['client', 'admin', 'manager', 'scheduler'].includes(userRole?.toLowerCase() || '') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setRatingType("group");
                    setShowRatingDialog(true);
                  }}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Rate All Staff
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredStaff.map((staff) => {
          const isFavorite = favoriteStaff.includes(staff.id);
          const userRating = getStaffRating(staff.id);

          return (
            <Card key={staff.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-border">
                      <AvatarFallback className="text-lg bg-primary text-primary-foreground font-medium">
                        {staff.name.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-medium text-foreground">{staff.name}</h3>
                        {['client', 'admin', 'manager', 'scheduler'].includes(userRole?.toLowerCase() || '') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(staff.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Heart
                              className={`w-4 h-4 ${isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground'
                                }`}
                            />
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-warning fill-current" />
                          <span className="text-sm font-medium text-foreground">{staff.rating}</span>
                          <span className="text-sm text-muted-foreground">({staff.totalEvents} events)</span>
                        </div>
                        <Badge className={`${getAvailabilityColor(staff.availabilityStatus)} flex items-center gap-1`}>
                          {getStatusIcon(staff.availabilityStatus)}
                          {staff.availabilityStatus}
                        </Badge>
                      </div>

                      {userRating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-muted-foreground">Your rating:</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${star <= userRating
                                  ? 'fill-warning text-warning'
                                  : 'text-muted-foreground'
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium text-foreground">${staff.hourlyRate}/hr</p>
                    <p className="text-sm text-muted-foreground">Starting rate</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Skills */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {staff.skills.slice(0, 4).map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {staff.skills.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{staff.skills.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{staff.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{staff.phone}</span>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-muted rounded">
                    <div className="text-sm font-medium">{staff.totalEvents}</div>
                    <div className="text-xs text-muted-foreground">Events</div>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <div className="text-sm font-medium">{staff.rating}</div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <div className="text-sm font-medium">98%</div>
                    <div className="text-xs text-muted-foreground">Attendance</div>
                  </div>
                </div>

                {/* Actions */}
                {['client', 'admin', 'manager', 'scheduler'].includes(userRole?.toLowerCase() || '') && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedStaffForRating(staff);
                        setRatingType("individual");
                        setShowRatingDialog(true);
                      }}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Rate
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Results */}
      {filteredStaff.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No staff found</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {searchQuery || skillFilter !== "all" || availabilityFilter !== "all"
                ? "Try adjusting your search filters"
                : "No staff members assigned to this event"}
            </p>
            <Button onClick={() => setCurrentPage("staff")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Staff Directory
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Rating Dialog */}
      <RatingDialog />
    </div>
  );
}
