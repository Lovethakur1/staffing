import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Star, Heart, Search, Calendar, Users, MessageSquare } from "lucide-react";
import { DataTable } from "../ui/data-table";
import { toast } from "sonner";
import { staffService } from "../../services/staff.service";
import { eventService } from "../../services/event.service";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  rating: number;
  totalEvents: number;
  hourlyRate: number;
  skills: string[];
  status: string;
}

interface ClientEvent {
  id: string;
  title: string;
  date: string;
  status: string;
  staffIds: string[];
}

interface StaffDirectoryRatingsProps {
  clientId: string;
}

export function StaffDirectoryRatings({ clientId }: StaffDirectoryRatingsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [favoriteFilter, setFavoriteFilter] = useState("all");
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [ratingData, setRatingData] = useState({
    overall: 5, punctuality: 5, professionalism: 5, quality: 5, communication: 5, comment: ""
  });

  const [allStaff, setAllStaff] = useState<StaffMember[]>([]);
  const [clientEvents, setClientEvents] = useState<ClientEvent[]>([]);
  const [favoriteStaffIds, setFavoriteStaffIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [staffRaw, eventsRaw] = await Promise.all([
          staffService.getStaffList(),
          eventService.getEvents(),
        ]);

        const staffMapped: StaffMember[] = staffRaw.map((s: any) => ({
          id: s.id,
          name: s.user?.name || s.name || 'Staff',
          email: s.user?.email || s.email || '',
          rating: s.rating || s.averageRating || 0,
          totalEvents: s.totalEvents || s._count?.staffShifts || 0,
          hourlyRate: s.hourlyRate || 0,
          skills: s.skills || [],
          status: s.status || 'ACTIVE',
        }));
        setAllStaff(staffMapped);

        const clientEvsMapped: ClientEvent[] = eventsRaw
          .filter((ev: any) => ev.clientId === clientId)
          .map((ev: any) => ({
            id: ev.id,
            title: ev.title || ev.name || 'Event',
            date: ev.date || ev.startDate || '',
            status: (ev.status || '').toLowerCase(),
            staffIds: (ev.staffShifts || []).map((ss: any) => ss.staffId).filter(Boolean),
          }));
        setClientEvents(clientEvsMapped);

        // Favourites default: staff worked with this client who have high rating
        const workedIds = [...new Set(clientEvsMapped.flatMap(ev => ev.staffIds))];
        setFavoriteStaffIds(staffMapped.filter(s => workedIds.includes(s.id) && s.rating >= 4.5).map(s => s.id));
      } catch {
        toast.error('Failed to load staff directory');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clientId]);

  const workedWithStaffIds = [...new Set(clientEvents.flatMap(ev => ev.staffIds))];
  const workedWithStaff = allStaff.filter(s => workedWithStaffIds.includes(s.id));
  const allSkills = [...new Set(allStaff.flatMap(s => s.skills))];

  const filteredStaff = allStaff.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSkill = skillFilter === "all" || staff.skills.includes(skillFilter);
    const matchesRating = ratingFilter === "all" ||
      (ratingFilter === "4+" && staff.rating >= 4) ||
      (ratingFilter === "4.5+" && staff.rating >= 4.5);
    const matchesFavorite = favoriteFilter === "all" ||
      (favoriteFilter === "favorites" && favoriteStaffIds.includes(staff.id)) ||
      (favoriteFilter === "worked-with" && workedWithStaffIds.includes(staff.id));
    return matchesSearch && matchesSkill && matchesRating && matchesFavorite;
  });

  const toggleFavorite = (staffId: string) => {
    const isFav = favoriteStaffIds.includes(staffId);
    setFavoriteStaffIds(prev => isFav ? prev.filter(id => id !== staffId) : [...prev, staffId]);
    toast.success(isFav ? "Removed from favorites" : "Added to favorites");
  };

  const submitRating = () => {
    toast.success("Rating submitted successfully!");
    setShowRatingDialog(false);
    setSelectedStaff(null);
    setRatingData({ overall: 5, punctuality: 5, professionalism: 5, quality: 5, communication: 5, comment: "" });
  };

  const getEventsWithStaff = (staffId: string) => clientEvents.filter(ev => ev.staffIds.includes(staffId));

  const staffColumns = [
    {
      key: 'name',
      title: 'Staff Member',
      render: (_: any, staff: StaffMember) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {staff.name.split(' ').map((n: string) => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="font-medium">{staff.name}</p>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-muted-foreground">{staff.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'skills',
      title: 'Skills',
      render: (_: any, staff: StaffMember) => (
        <div className="flex flex-wrap gap-1">
          {(staff.skills || []).slice(0, 3).map((skill: string) => (
            <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
          ))}
          {(staff.skills || []).length > 3 && (
            <Badge variant="secondary" className="text-xs">+{staff.skills.length - 3}</Badge>
          )}
        </div>
      )
    },
    {
      key: 'hourlyRate',
      title: 'Rate',
      render: (_: any, staff: StaffMember) => (
        <span className="font-medium">${staff.hourlyRate}/hr</span>
      )
    },
    {
      key: 'totalEvents',
      title: 'Experience',
      render: (_: any, staff: StaffMember) => (
        <div className="text-sm">
          <p>{staff.totalEvents} events</p>
          <p className="text-muted-foreground">{getEventsWithStaff(staff.id).length} with you</p>
        </div>
      )
    },
    {
      key: 'id',
      title: 'Actions',
      render: (_: any, staff: StaffMember) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => toggleFavorite(staff.id)}
            className={favoriteStaffIds.includes(staff.id) ? "border-red-200 bg-red-50 hover:bg-red-100" : ""}>
            <Heart className={`h-4 w-4 ${favoriteStaffIds.includes(staff.id) ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setSelectedStaff(staff); setShowProfileDialog(true); }}>
            View Profile
          </Button>
          {workedWithStaffIds.includes(staff.id) && (
            <Button size="sm" onClick={() => { setSelectedStaff(staff); setShowRatingDialog(true); }}>Rate</Button>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading staff directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Staff Directory & Ratings</h3>
          <p className="text-muted-foreground">Browse, rate, and manage your preferred staff</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{filteredStaff.length} staff members</Badge>
          <Badge variant="outline">{favoriteStaffIds.length} favorites</Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Staff worked with', value: workedWithStaff.length, icon: <Users className="h-5 w-5 text-primary" /> },
          { label: 'Favorite staff', value: favoriteStaffIds.length, icon: <Heart className="h-5 w-5 text-red-500" /> },
          {
            label: 'Average rating', icon: <Star className="h-5 w-5 text-yellow-500" />,
            value: workedWithStaff.length > 0
              ? (workedWithStaff.reduce((sum, s) => sum + s.rating, 0) / workedWithStaff.length).toFixed(1)
              : '0.0'
          },
          { label: 'Total events', value: clientEvents.length, icon: <Calendar className="h-5 w-5 text-blue-500" /> },
        ].map((stat, i) => (
          <Card key={i} className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                {stat.icon}
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search staff..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger><SelectValue placeholder="Filter by skill" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {allSkills.map((skill) => <SelectItem key={skill} value={skill}>{skill}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger><SelectValue placeholder="Filter by rating" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="4.5+">4.5+ Stars</SelectItem>
                <SelectItem value="4+">4+ Stars</SelectItem>
              </SelectContent>
            </Select>
            <Select value={favoriteFilter} onValueChange={setFavoriteFilter}>
              <SelectTrigger><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                <SelectItem value="favorites">Favorites Only</SelectItem>
                <SelectItem value="worked-with">Worked With</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { setSearchTerm(""); setSkillFilter("all"); setRatingFilter("all"); setFavoriteFilter("all"); }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <DataTable columns={staffColumns} data={filteredStaff} searchable={true} className="border-0 shadow-lg" />

      {/* Profile Dialog */}
      {showProfileDialog && selectedStaff && (
        <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-primary">
                    {selectedStaff.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedStaff.name}</h3>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{selectedStaff.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({selectedStaff.totalEvents} events)</span>
                  </div>
                </div>
              </DialogTitle>
              <DialogDescription>View profile and booking history with this staff member.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Details</h4>
                  <div className="space-y-2 text-sm">
                    <p>Rate: <span className="font-medium">${selectedStaff.hourlyRate}/hour</span></p>
                    <p>Experience: <span className="font-medium">{selectedStaff.totalEvents} events</span></p>
                    <p>Status: <span className="font-medium text-green-600">Available</span></p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Your History</h4>
                  <div className="space-y-2 text-sm">
                    <p>Events together: <span className="font-medium">{getEventsWithStaff(selectedStaff.id).length}</span></p>
                    <p>Favorite: <span className="font-medium">{favoriteStaffIds.includes(selectedStaff.id) ? "Yes" : "No"}</span></p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Skills & Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStaff.skills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Recent Events Together</h4>
                <div className="space-y-2">
                  {getEventsWithStaff(selectedStaff.id).slice(0, 3).map(event => (
                    <div key={event.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{event.date ? new Date(event.date).toLocaleDateString() : ''}</p>
                        </div>
                        <Badge>{event.status}</Badge>
                      </div>
                    </div>
                  ))}
                  {getEventsWithStaff(selectedStaff.id).length === 0 && (
                    <p className="text-sm text-muted-foreground">No shared events yet.</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => toggleFavorite(selectedStaff.id)} variant={favoriteStaffIds.includes(selectedStaff.id) ? "default" : "outline"} className="flex-1">
                  <Heart className={`mr-2 h-4 w-4 ${favoriteStaffIds.includes(selectedStaff.id) ? "fill-current" : ""}`} />
                  {favoriteStaffIds.includes(selectedStaff.id) ? "Remove from Favorites" : "Add to Favorites"}
                </Button>
                <Button variant="outline" className="flex-1"><MessageSquare className="mr-2 h-4 w-4" />Message</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Rating Dialog */}
      {showRatingDialog && selectedStaff && (
        <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Rate {selectedStaff.name}</DialogTitle>
              <DialogDescription>Share your experience. Your feedback helps maintain service quality.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-4">
                {[
                  { key: 'overall', label: 'Overall Performance' },
                  { key: 'punctuality', label: 'Punctuality' },
                  { key: 'professionalism', label: 'Professionalism' },
                  { key: 'quality', label: 'Quality of Work' },
                  { key: 'communication', label: 'Communication' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex justify-between items-center">
                    <Label>{label}</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <Button key={rating} variant="ghost" size="sm" onClick={() => setRatingData({ ...ratingData, [key]: rating })} className="p-1">
                          <Star className={`h-5 w-5 ${rating <= (ratingData as any)[key] ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <Label htmlFor="comment">Additional Comments (Optional)</Label>
                <Textarea id="comment" value={ratingData.comment} onChange={(e) => setRatingData({ ...ratingData, comment: e.target.value })} placeholder="Share your experience..." rows={4} />
              </div>
              <div className="flex gap-2">
                <Button onClick={submitRating} className="flex-1">Submit Rating</Button>
                <Button variant="outline" onClick={() => setShowRatingDialog(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
