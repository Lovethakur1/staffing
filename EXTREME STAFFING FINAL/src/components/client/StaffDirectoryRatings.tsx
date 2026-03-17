import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Star, Heart, Search, Filter, MapPin, Calendar, Users, MessageSquare, Plus } from "lucide-react";
import { mockStaff, mockEvents, Staff } from "../../data/mockData";
import { DataTable } from "../ui/data-table";
import { toast } from "sonner";

interface StaffDirectoryRatingsProps {
  clientId: string;
}

export function StaffDirectoryRatings({ clientId }: StaffDirectoryRatingsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [favoriteFilter, setFavoriteFilter] = useState("all");
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [ratingData, setRatingData] = useState({
    overall: 5,
    punctuality: 5,
    professionalism: 5,
    quality: 5,
    communication: 5,
    comment: ""
  });

  // Get client's events and staff they've worked with
  const clientEvents = mockEvents.filter(event => event.clientId === clientId);
  const workedWithStaffIds = [...new Set(clientEvents.flatMap(event => event.assignedStaff))];
  const workedWithStaff = mockStaff.filter(staff => workedWithStaffIds.includes(staff.id));

  // Simulate favorite staff (in real app this would come from backend)
  const [favoriteStaffIds, setFavoriteStaffIds] = useState<string[]>(
    workedWithStaff.filter(staff => staff.rating >= 4.5).map(staff => staff.id)
  );

  // Get all skills for filter
  const allSkills = [...new Set(mockStaff.flatMap(staff => staff.skills))];

  // Filter staff
  const filteredStaff = mockStaff.filter(staff => {
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
    setFavoriteStaffIds(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
    toast.success(
      favoriteStaffIds.includes(staffId) 
        ? "Removed from favorites" 
        : "Added to favorites"
    );
  };

  const submitRating = () => {
    toast.success("Rating submitted successfully!");
    setShowRatingDialog(false);
    setSelectedStaff(null);
    setRatingData({
      overall: 5,
      punctuality: 5,
      professionalism: 5,
      quality: 5,
      communication: 5,
      comment: ""
    });
  };

  const getEventsWithStaff = (staffId: string) => {
    return clientEvents.filter(event => event.assignedStaff.includes(staffId));
  };

  // Define columns for staff table
  const staffColumns = [
    {
      accessorKey: "name",
      header: "Staff Member",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {row.original.name.split(' ').map((n: string) => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-muted-foreground">{row.original.rating}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      accessorKey: "skills",
      header: "Skills",
      cell: ({ row }: any) => (
        <div className="flex flex-wrap gap-1">
          {row.original.skills.slice(0, 3).map((skill: string) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {row.original.skills.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{row.original.skills.length - 3}
            </Badge>
          )}
        </div>
      )
    },
    {
      accessorKey: "hourlyRate",
      header: "Rate",
      cell: ({ row }: any) => (
        <span className="font-medium">${row.original.hourlyRate}/hr</span>
      )
    },
    {
      accessorKey: "totalEvents",
      header: "Experience",
      cell: ({ row }: any) => (
        <div className="text-sm">
          <p>{row.original.totalEvents} events</p>
          <p className="text-muted-foreground">
            {getEventsWithStaff(row.original.id).length} with you
          </p>
        </div>
      )
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleFavorite(row.original.id)}
            className={favoriteStaffIds.includes(row.original.id) ? "border-red-200 bg-red-50 hover:bg-red-100" : ""}
          >
            <Heart className={`h-4 w-4 ${favoriteStaffIds.includes(row.original.id) ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedStaff(row.original);
              setShowProfileDialog(true);
            }}
          >
            View Profile
          </Button>
          {workedWithStaffIds.includes(row.original.id) && (
            <Button
              size="sm"
              onClick={() => {
                setSelectedStaff(row.original);
                setShowRatingDialog(true);
              }}
            >
              Rate
            </Button>
          )}
        </div>
      )
    }
  ];

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
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{workedWithStaff.length}</p>
                <p className="text-sm text-muted-foreground">Staff worked with</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{favoriteStaffIds.length}</p>
                <p className="text-sm text-muted-foreground">Favorite staff</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  {workedWithStaff.length > 0 ? 
                    (workedWithStaff.reduce((sum, staff) => sum + staff.rating, 0) / workedWithStaff.length).toFixed(1) : 
                    "0.0"}
                </p>
                <p className="text-sm text-muted-foreground">Average rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{clientEvents.length}</p>
                <p className="text-sm text-muted-foreground">Total events</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {allSkills.map((skill) => (
                  <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="4.5+">4.5+ Stars</SelectItem>
                <SelectItem value="4+">4+ Stars</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={favoriteFilter} onValueChange={setFavoriteFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                <SelectItem value="favorites">Favorites Only</SelectItem>
                <SelectItem value="worked-with">Worked With</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setSkillFilter("all");
              setRatingFilter("all");
              setFavoriteFilter("all");
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff Directory Table */}
      <DataTable
        columns={staffColumns}
        data={filteredStaff}
        searchKey="name"
        className="border-0 shadow-lg"
      />

      {/* Staff Profile Dialog */}
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
                    <span>{selectedStaff.rating}</span>
                    <span className="text-muted-foreground">({selectedStaff.totalEvents} events)</span>
                  </div>
                </div>
              </DialogTitle>
              <DialogDescription>
                View detailed information about this staff member including their experience, skills, and your history working together.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
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
                    <p>Favorite: <span className="font-medium">
                      {favoriteStaffIds.includes(selectedStaff.id) ? "Yes" : "No"}
                    </span></p>
                  </div>
                </div>
              </div>
              
              {/* Skills */}
              <div>
                <h4 className="font-semibold mb-2">Skills & Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStaff.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Recent Events */}
              <div>
                <h4 className="font-semibold mb-2">Recent Events Together</h4>
                <div className="space-y-2">
                  {getEventsWithStaff(selectedStaff.id).slice(0, 3).map((event) => (
                    <div key={event.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{event.date}</p>
                        </div>
                        <Badge className={event.status === 'completed' ? 'bg-success/10 text-success' : ''}>
                          {event.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => toggleFavorite(selectedStaff.id)}
                  variant={favoriteStaffIds.includes(selectedStaff.id) ? "default" : "outline"}
                  className="flex-1"
                >
                  <Heart className={`mr-2 h-4 w-4 ${favoriteStaffIds.includes(selectedStaff.id) ? "fill-current" : ""}`} />
                  {favoriteStaffIds.includes(selectedStaff.id) ? "Remove from Favorites" : "Add to Favorites"}
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </Button>
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
              <DialogDescription>
                Share your experience working with {selectedStaff.name}. Your feedback helps maintain our service quality and assists other clients in making informed decisions.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Rating Categories */}
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
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                          key={rating}
                          variant="ghost"
                          size="sm"
                          onClick={() => setRatingData({...ratingData, [key]: rating})}
                          className="p-1"
                        >
                          <Star 
                            className={`h-5 w-5 ${
                              rating <= (ratingData as any)[key] 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`} 
                          />
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Comments */}
              <div>
                <Label htmlFor="comment">Additional Comments (Optional)</Label>
                <Textarea
                  id="comment"
                  value={ratingData.comment}
                  onChange={(e) => setRatingData({...ratingData, comment: e.target.value})}
                  placeholder="Share your experience working with this staff member..."
                  rows={4}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={submitRating} className="flex-1">
                  Submit Rating
                </Button>
                <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}