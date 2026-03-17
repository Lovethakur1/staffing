import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
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
  Plus,
  Ban,
  AlertTriangle,
  Undo2
} from "lucide-react";
import { mockStaff, mockEvents } from "../data/mockData";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner@2.0.3";

interface FavoritesProps {
  userRole: string;
  userId: string;
}

interface ExcludedStaffMember {
  id: string;
  name: string;
  role: string;
  reason: string;
  date: string;
}

export function Favorites({ userRole, userId }: FavoritesProps) {
  const { setCurrentPage } = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("favorites");

  // Exclusion State
  const [excludeDialogOpen, setExcludeDialogOpen] = useState(false);
  const [selectedStaffForExclusion, setSelectedStaffForExclusion] = useState<typeof mockStaff[0] | null>(null);
  const [exclusionReason, setExclusionReason] = useState("");
  const [excludedStaffList, setExcludedStaffList] = useState<ExcludedStaffMember[]>([
    {
      id: "staff-99", 
      name: "John Doe", 
      role: "Bartender", 
      reason: "No call no show on last event", 
      date: "2024-01-15"
    }
  ]);

  // Get client's events to determine which staff they've worked with
  const clientEvents = mockEvents.filter(event => event.clientId === userId);
  const workedWithStaffIds = [...new Set(clientEvents.flatMap(event => event.assignedStaff))];
  
  // Filter staff to show only high-rated ones (favorites are typically 4.5+ rating)
  // and those the client has worked with
  const favoriteStaff = mockStaff.filter(staff => 
    (staff.rating >= 4.5 || workedWithStaffIds.includes(staff.id)) &&
    !excludedStaffList.some(ex => ex.id === staff.id) // Filter out excluded staff
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

  const handleCallAdmin = () => {
    toast.success("Connecting you to our admin support team...", {
      description: "You'll be redirected to speak with an administrator who can assist with all staff-related inquiries.",
    });
  };

  const handleExcludeClick = (staff: typeof mockStaff[0]) => {
    setSelectedStaffForExclusion(staff);
    setExclusionReason("");
    setExcludeDialogOpen(true);
  };

  const confirmExclusion = () => {
    if (!selectedStaffForExclusion) return;
    
    if (!exclusionReason.trim()) {
      toast.error("Please provide a reason for exclusion");
      return;
    }

    const newExclusion: ExcludedStaffMember = {
      id: selectedStaffForExclusion.id,
      name: selectedStaffForExclusion.name,
      role: selectedStaffForExclusion.role,
      reason: exclusionReason,
      date: new Date().toISOString().split('T')[0]
    };

    setExcludedStaffList([...excludedStaffList, newExclusion]);
    setExcludeDialogOpen(false);
    toast.success(`${selectedStaffForExclusion.name} has been added to your exclusion list.`);
    setSelectedStaffForExclusion(null);
  };

  const handleUnblock = (id: string) => {
    setExcludedStaffList(excludedStaffList.filter(staff => staff.id !== id));
    toast.success("Staff member removed from exclusion list.");
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="desktop-first-header mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            Staff Preferences
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your favorite staff and exclusions for future events
          </p>
        </div>
        <Button onClick={() => setCurrentPage("staff")} size="lg" variant="outline">
          <Users className="mr-2 h-5 w-5" />
          Browse All Staff
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Favorites
          </TabsTrigger>
          <TabsTrigger value="excluded" className="flex items-center gap-2">
            <Ban className="h-4 w-4" />
            Excluded
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="space-y-6">
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
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setCurrentPage("book-event", { preferredStaffId: staff.id, staffName: staff.name })}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Book Again
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setCurrentPage("staff", { staffId: staff.id })}
                        >
                          View Profile
                        </Button>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={handleCallAdmin}>
                          <Phone className="mr-2 h-4 w-4" />
                          Call Admin
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleExcludeClick(staff)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="excluded" className="space-y-6">
          <Card className="border-red-100 bg-red-50/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-red-900">Excluded Staff Management</h3>
                  <p className="text-red-700/80 text-sm">
                    Staff members listed here will not be assigned to your future events. You can manage this list or remove exclusions at any time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {excludedStaffList.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
              <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-900">No Excluded Staff</h3>
              <p className="text-slate-500">You haven't excluded any staff members yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {excludedStaffList.map((staff) => (
                <Card key={staff.id} className="border-0 shadow-lg border-l-4 border-l-red-500">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold flex items-center gap-2">
                          {staff.name}
                          <Badge variant="destructive" className="text-xs">Excluded</Badge>
                        </h4>
                        <p className="text-sm text-muted-foreground">{staff.role}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleUnblock(staff.id)}
                        className="text-slate-500 hover:text-green-600"
                      >
                        <Undo2 className="h-4 w-4 mr-2" />
                        Unblock
                      </Button>
                    </div>

                    <div className="bg-red-50 p-3 rounded-md mb-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-red-900">Reason for Exclusion</p>
                          <p className="text-sm text-red-800">{staff.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-red-700/70 border-t border-red-200/50 pt-2 mt-2">
                        <Calendar className="h-3 w-3" />
                        Excluded on {new Date(staff.date).toLocaleDateString()}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground italic">
                      This staff member will not appear in your booking suggestions.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Actions Footer */}
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
              <Button variant="outline" onClick={() => setCurrentPage("staff")}>
                <Users className="mr-2 h-5 w-5" />
                Browse Staff Directory
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exclusion Dialog */}
      <Dialog open={excludeDialogOpen} onOpenChange={setExcludeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="h-5 w-5" />
              Exclude Staff Member
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to exclude {selectedStaffForExclusion?.name}? They will not be assigned to your future events.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Exclusion</Label>
              <Textarea 
                placeholder="Please explain why you want to exclude this staff member (e.g., poor performance, punctuality issues)..."
                value={exclusionReason}
                onChange={(e) => setExclusionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setExcludeDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmExclusion}>Confirm Exclusion</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}