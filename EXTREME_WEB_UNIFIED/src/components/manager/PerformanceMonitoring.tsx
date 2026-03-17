import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { 
  Star,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  CheckCircle,
  AlertTriangle,
  Eye,
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  Bookmark
} from "lucide-react";
import { mockStaff, mockEvents } from "../../data/mockData";
import { toast } from "sonner";

interface PerformanceMonitoringProps {
  managerId: string;
  events: any[];
}

interface PerformanceRating {
  id: string;
  staffId: string;
  staffName: string;
  eventId: string;
  eventName: string;
  ratings: {
    punctuality: number;
    professionalism: number;
    teamwork: number;
    customerService: number;
    problemSolving: number;
    overall: number;
  };
  notes: string;
  isPrivate: boolean;
  timestamp: string;
  managerName: string;
  improvements?: string;
  highlights?: string;
}

export function PerformanceMonitoring({ managerId, events }: PerformanceMonitoringProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Mock performance ratings
  const [performanceRatings, setPerformanceRatings] = useState<PerformanceRating[]>([
    {
      id: "rating-1",
      staffId: "staff-1",
      staffName: "Sarah Johnson",
      eventId: "event-1",
      eventName: "Corporate Gala",
      ratings: {
        punctuality: 5,
        professionalism: 5,
        teamwork: 4,
        customerService: 5,
        problemSolving: 4,
        overall: 5
      },
      notes: "Exceptional performance throughout the event. Showed great leadership and handled client requests professionally.",
      highlights: "Led the setup team efficiently, received direct compliments from client",
      improvements: "Could improve on delegation skills",
      isPrivate: true,
      timestamp: "2025-01-06 22:30",
      managerName: "Manager Smith"
    },
    {
      id: "rating-2",
      staffId: "staff-2",
      staffName: "Michael Chen",
      eventId: "event-2",
      eventName: "Wedding Reception",
      ratings: {
        punctuality: 4,
        professionalism: 5,
        teamwork: 5,
        customerService: 5,
        problemSolving: 5,
        overall: 5
      },
      notes: "Outstanding bartending skills. Created custom cocktails that impressed guests. Very professional interaction with clients.",
      highlights: "Created signature cocktails, handled high-volume orders smoothly",
      improvements: "Arrived 10 minutes late due to traffic",
      isPrivate: true,
      timestamp: "2025-01-05 23:45",
      managerName: "Manager Smith"
    },
    {
      id: "rating-3",
      staffId: "staff-3",
      staffName: "Emily Rodriguez",
      eventId: "event-3",
      eventName: "Product Launch",
      ratings: {
        punctuality: 5,
        professionalism: 4,
        teamwork: 4,
        customerService: 4,
        problemSolving: 3,
        overall: 4
      },
      notes: "Good overall performance. Showed enthusiasm and willingness to help. Some areas for improvement in handling unexpected situations.",
      highlights: "Enthusiastic attitude, great with guest interactions",
      improvements: "Could be more proactive in problem-solving situations",
      isPrivate: true,
      timestamp: "2025-01-04 20:15",
      managerName: "Manager Smith"
    }
  ]);

  // Rating form state
  const [ratingForm, setRatingForm] = useState({
    punctuality: [4],
    professionalism: [4],
    teamwork: [4],
    customerService: [4],
    problemSolving: [4],
    overall: [4],
    notes: "",
    highlights: "",
    improvements: "",
    isPrivate: true
  });

  const managedStaff = useMemo(() => 
    mockStaff.filter(staff => 
      events.some(event => event.assignedStaff.includes(staff.id))
    ), [events]
  );

  const todaysEvents = useMemo(() => 
    events.filter(event => {
      const eventDate = new Date(event.date);
      const today = new Date();
      return eventDate.toDateString() === today.toDateString();
    }), [events]
  );

  const filteredRatings = useMemo(() => 
    performanceRatings.filter(rating => {
      const matchesSearch = rating.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rating.eventName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEvent = eventFilter === "all" || rating.eventId === eventFilter;
      const matchesRating = ratingFilter === "all" || 
                           (ratingFilter === "excellent" && rating.ratings.overall >= 4.5) ||
                           (ratingFilter === "good" && rating.ratings.overall >= 3.5 && rating.ratings.overall < 4.5) ||
                           (ratingFilter === "needs-improvement" && rating.ratings.overall < 3.5);
      return matchesSearch && matchesEvent && matchesRating;
    }), [performanceRatings, searchTerm, eventFilter, ratingFilter]
  );

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-emerald-600";
    if (rating >= 3.5) return "text-blue-600";
    if (rating >= 2.5) return "text-amber-600";
    return "text-red-600";
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Excellent</Badge>;
    if (rating >= 3.5) return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Good</Badge>;
    if (rating >= 2.5) return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Fair</Badge>;
    return <Badge className="bg-red-50 text-red-700 border-red-200">Needs Improvement</Badge>;
  };

  const getStarDisplay = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`h-4 w-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  const calculateOverallRating = () => {
    const ratings = [
      ratingForm.punctuality[0],
      ratingForm.professionalism[0],
      ratingForm.teamwork[0],
      ratingForm.customerService[0],
      ratingForm.problemSolving[0]
    ];
    return Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10;
  };

  const handleSubmitRating = () => {
    if (!selectedStaff || !selectedEvent) return;

    const newRating: PerformanceRating = {
      id: `rating-${Date.now()}`,
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      eventId: selectedEvent.id,
      eventName: selectedEvent.title,
      ratings: {
        punctuality: ratingForm.punctuality[0],
        professionalism: ratingForm.professionalism[0],
        teamwork: ratingForm.teamwork[0],
        customerService: ratingForm.customerService[0],
        problemSolving: ratingForm.problemSolving[0],
        overall: calculateOverallRating()
      },
      notes: ratingForm.notes,
      highlights: ratingForm.highlights,
      improvements: ratingForm.improvements,
      isPrivate: ratingForm.isPrivate,
      timestamp: new Date().toLocaleString(),
      managerName: "Manager Smith"
    };

    setPerformanceRatings(prev => [newRating, ...prev]);
    setIsRatingDialogOpen(false);
    
    // Reset form
    setRatingForm({
      punctuality: [4],
      professionalism: [4],
      teamwork: [4],
      customerService: [4],
      problemSolving: [4],
      overall: [4],
      notes: "",
      highlights: "",
      improvements: "",
      isPrivate: true
    });

    toast.success(`Performance rating submitted for ${selectedStaff.name}!`);
  };

  const stats = useMemo(() => {
    const totalRatings = filteredRatings.length;
    const avgRating = totalRatings > 0 
      ? filteredRatings.reduce((sum, r) => sum + r.ratings.overall, 0) / totalRatings 
      : 0;
    const excellentCount = filteredRatings.filter(r => r.ratings.overall >= 4.5).length;
    const needsImprovementCount = filteredRatings.filter(r => r.ratings.overall < 3.5).length;

    return {
      totalRatings,
      avgRating: Math.round(avgRating * 10) / 10,
      excellentCount,
      needsImprovementCount
    };
  }, [filteredRatings]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Performance Monitoring</h2>
          <p className="text-muted-foreground">
            Rate staff performance and provide real-time feedback during events
          </p>
        </div>
        <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Rate Performance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Rate Staff Performance</DialogTitle>
              <DialogDescription>
                Provide detailed performance feedback for staff members during or after events.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Staff and Event Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Staff Member</Label>
                  <Select onValueChange={(value) => {
                    const staff = managedStaff.find(s => s.id === value);
                    setSelectedStaff(staff);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {managedStaff.map(staff => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name} - {staff.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Select Event</Label>
                  <Select onValueChange={(value) => {
                    const event = events.find(e => e.id === value);
                    setSelectedEvent(event);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map(event => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title} - {event.date}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Rating Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Punctuality ({ratingForm.punctuality[0]}/5)
                    </Label>
                    <Slider
                      value={ratingForm.punctuality}
                      onValueChange={(value) => setRatingForm(prev => ({ ...prev, punctuality: value }))}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Professionalism ({ratingForm.professionalism[0]}/5)
                    </Label>
                    <Slider
                      value={ratingForm.professionalism}
                      onValueChange={(value) => setRatingForm(prev => ({ ...prev, professionalism: value }))}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Teamwork ({ratingForm.teamwork[0]}/5)
                    </Label>
                    <Slider
                      value={ratingForm.teamwork}
                      onValueChange={(value) => setRatingForm(prev => ({ ...prev, teamwork: value }))}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Customer Service ({ratingForm.customerService[0]}/5)
                    </Label>
                    <Slider
                      value={ratingForm.customerService}
                      onValueChange={(value) => setRatingForm(prev => ({ ...prev, customerService: value }))}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Problem Solving ({ratingForm.problemSolving[0]}/5)
                    </Label>
                    <Slider
                      value={ratingForm.problemSolving}
                      onValueChange={(value) => setRatingForm(prev => ({ ...prev, problemSolving: value }))}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Overall Rating
                      </Label>
                      <span className="text-lg font-bold">{calculateOverallRating()}/5</span>
                    </div>
                    <div className="flex gap-1">
                      {getStarDisplay(calculateOverallRating())}
                    </div>
                  </div>
                </div>
              </div>

              {/* Written Feedback */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Performance Highlights</Label>
                  <Textarea 
                    placeholder="What did this staff member do particularly well?"
                    value={ratingForm.highlights}
                    onChange={(e) => setRatingForm(prev => ({ ...prev, highlights: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Areas for Improvement</Label>
                  <Textarea 
                    placeholder="What could be improved for next time?"
                    value={ratingForm.improvements}
                    onChange={(e) => setRatingForm(prev => ({ ...prev, improvements: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea 
                  placeholder="Any additional feedback or observations..."
                  value={ratingForm.notes}
                  onChange={(e) => setRatingForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              {/* Privacy Settings */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <Label className="font-medium">Private Feedback</Label>
                  <p className="text-sm text-muted-foreground">
                    This rating will only be visible to administrators and not shared with the staff member
                  </p>
                </div>
                <Switch 
                  checked={ratingForm.isPrivate}
                  onCheckedChange={(checked) => setRatingForm(prev => ({ ...prev, isPrivate: checked }))}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsRatingDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitRating} disabled={!selectedStaff || !selectedEvent}>
                  <Star className="h-4 w-4 mr-2" />
                  Submit Rating
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Ratings</p>
                <p className="text-2xl font-bold">{stats.totalRatings}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">{stats.avgRating}/5</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Excellent Performance</p>
                <p className="text-2xl font-bold">{stats.excellentCount}</p>
              </div>
              <Award className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Needs Improvement</p>
                <p className="text-2xl font-bold">{stats.needsImprovementCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by staff name or event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map(event => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="excellent">Excellent (4.5+)</SelectItem>
              <SelectItem value="good">Good (3.5-4.4)</SelectItem>
              <SelectItem value="needs-improvement">Needs Improvement (&lt;3.5)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Performance Ratings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRatings.map((rating) => (
          <Card key={rating.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{rating.staffName}</CardTitle>
                  <p className="text-sm text-muted-foreground">{rating.eventName}</p>
                  <p className="text-xs text-muted-foreground">{rating.timestamp}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {getStarDisplay(rating.ratings.overall)}
                  </div>
                  <span className={`font-bold ${getRatingColor(rating.ratings.overall)}`}>
                    {rating.ratings.overall}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Overall Rating Badge */}
              <div className="flex items-center justify-between">
                {getRatingBadge(rating.ratings.overall)}
                {rating.isPrivate && (
                  <Badge variant="outline" className="text-xs">
                    <Bookmark className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                )}
              </div>

              {/* Category Ratings */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Punctuality:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{rating.ratings.punctuality}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Professionalism:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{rating.ratings.professionalism}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Teamwork:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{rating.ratings.teamwork}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Customer Service:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{rating.ratings.customerService}</span>
                  </div>
                </div>
              </div>

              {/* Performance Highlights */}
              {rating.highlights && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <h4 className="text-sm font-medium text-emerald-800 mb-1">Highlights</h4>
                  <p className="text-sm text-emerald-700">{rating.highlights}</p>
                </div>
              )}

              {/* Areas for Improvement */}
              {rating.improvements && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="text-sm font-medium text-amber-800 mb-1">Areas for Improvement</h4>
                  <p className="text-sm text-amber-700">{rating.improvements}</p>
                </div>
              )}

              {/* Notes */}
              {rating.notes && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="text-sm font-medium mb-1">Manager Notes</h4>
                  <p className="text-sm text-muted-foreground">{rating.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  By {rating.managerName}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Follow Up
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredRatings.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">No Performance Ratings</h3>
              <p className="text-muted-foreground">
                No performance ratings match your current search criteria
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
