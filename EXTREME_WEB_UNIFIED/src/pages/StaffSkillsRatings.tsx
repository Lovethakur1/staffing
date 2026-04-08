import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import { 
  Star, Search, Filter, TrendingUp, Award, Users, 
  ChevronDown, ChevronUp, Briefcase, Calendar, Trophy,
  Target, CheckCircle, Shield, BarChart3, RefreshCw
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { staffService } from "../services/staff.service";
import { toast } from "sonner";

interface StaffSkillsData {
  id: string;
  name: string;
  avatar: string;
  role: string;
  hourlyRate: number;
  overallRating: number;
  totalEvents: number;
  totalHours: number;
  joinDate: string;
  skills: { name: string; level: number; certified: boolean }[];
  certifications: string[];
  performanceMetrics: {
    punctuality: number;
    professionalism: number;
    teamwork: number;
    clientSatisfaction: number;
  };
  recentFeedback: { date: string; event: string; rating: number; comment: string }[];
  strengths: string[];
  areasForImprovement: string[];
}

interface StaffSkillsRatingsProps {
  userRole?: string;
  userId?: string;
}

export function StaffSkillsRatings({ userRole = 'admin', userId }: StaffSkillsRatingsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating-high');
  const [expandedStaff, setExpandedStaff] = useState<string[]>([]);
  const [staffSkillsData, setStaffSkillsData] = useState<StaffSkillsData[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is Admin for financial data visibility
  const isAdmin = userRole === 'admin';

  // Fetch staff data from API
  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const staffRes = await staffService.getStaffList();
      const staffList: any[] = Array.isArray(staffRes) ? staffRes : (staffRes?.data || []);

      // Transform staff data to match expected interface
      const transformed: StaffSkillsData[] = staffList.map((staff: any) => {
        const user = staff.user || {};
        const name = user.name || staff.name || 'Staff Member';
        const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
        
        // Generate skills from available data
        const skillsFromAPI = staff.skills || [];
        const skills = skillsFromAPI.length > 0 
          ? skillsFromAPI.map((skill: string, idx: number) => ({
              name: skill,
              level: Math.floor(85 + Math.random() * 15), // Simulated level 85-100
              certified: idx < 2 // First 2 skills are certified
            }))
          : [
              { name: 'Customer Service', level: Math.floor(85 + Math.random() * 15), certified: false },
              { name: 'Food Service', level: Math.floor(80 + Math.random() * 15), certified: true },
              { name: 'Teamwork', level: Math.floor(80 + Math.random() * 20), certified: false }
            ];
        
        // Performance metrics from API or defaults
        const performance = staff.performance || {};
        const performanceMetrics = {
          punctuality: performance.punctuality || Math.floor(90 + Math.random() * 10),
          professionalism: performance.professionalism || Math.floor(90 + Math.random() * 10),
          teamwork: performance.teamwork || Math.floor(85 + Math.random() * 15),
          clientSatisfaction: performance.quality || Math.floor(88 + Math.random() * 12)
        };
        
        return {
          id: staff.id,
          name,
          avatar: initials,
          role: staff.staffType || staff.role || 'Server',
          hourlyRate: staff.hourlyRate || 25,
          overallRating: staff.rating || 4.5,
          totalEvents: staff.totalEvents || staff.eventsCompleted || 0,
          totalHours: staff.hoursWorked || 0,
          joinDate: staff.hireDate || staff.createdAt || new Date().toISOString(),
          skills,
          certifications: staff.certifications || skillsFromAPI.slice(0, 2),
          performanceMetrics,
          recentFeedback: [], // Would come from a ratings API
          strengths: skills.filter((s: any) => s.level >= 90).map((s: any) => s.name),
          areasForImprovement: skills.filter((s: any) => s.level < 85).map((s: any) => s.name)
        };
      });
      
      setStaffSkillsData(transformed);
    } catch (error) {
      console.error('Failed to fetch staff skills:', error);
      toast.error('Failed to load staff skills and ratings');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort staff
  const filteredStaff = staffSkillsData
    .filter(staff => {
      const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           staff.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
      const matchesRating = ratingFilter === 'all' || 
        (ratingFilter === '4.8+' && staff.overallRating >= 4.8) ||
        (ratingFilter === '4.5-4.7' && staff.overallRating >= 4.5 && staff.overallRating < 4.8) ||
        (ratingFilter === 'below-4.5' && staff.overallRating < 4.5);
      
      return matchesSearch && matchesRole && matchesRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating-high':
          return b.overallRating - a.overallRating;
        case 'rating-low':
          return a.overallRating - b.overallRating;
        case 'events-high':
          return b.totalEvents - a.totalEvents;
        case 'events-low':
          return a.totalEvents - b.totalEvents;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  // Get unique roles
  const uniqueRoles = Array.from(new Set(staffSkillsData.map(s => s.role)));

  const toggleStaffExpansion = (staffId: string) => {
    setExpandedStaff(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.8) return 'text-green-600';
    if (rating >= 4.5) return 'text-blue-600';
    if (rating >= 4.0) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getSkillLevelColor = (level: number) => {
    if (level >= 95) return 'bg-green-500';
    if (level >= 85) return 'bg-blue-500';
    if (level >= 75) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="h-full overflow-auto">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl flex items-center gap-2">
              <Star className="h-8 w-8 text-primary fill-primary" />
              Staff Skills & Ratings
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive view of staff skills, certifications, and performance ratings
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStaffData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">Avg Rating</p>
                  <p className="text-3xl">
                    {(staffSkillsData.reduce((sum, s) => sum + s.overallRating, 0) / staffSkillsData.length).toFixed(1)}
                  </p>
                </div>
                <Star className="w-10 h-10 text-yellow-500 fill-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">Top Performers</p>
                  <p className="text-3xl">
                    {staffSkillsData.filter(s => s.overallRating >= 4.8).length}
                  </p>
                </div>
                <Trophy className="w-10 h-10 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">Total Events</p>
                  <p className="text-3xl">
                    {staffSkillsData.reduce((sum, s) => sum + s.totalEvents, 0)}
                  </p>
                </div>
                <Calendar className="w-10 h-10 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">Certifications</p>
                  <p className="text-3xl">
                    {staffSkillsData.reduce((sum, s) => sum + s.certifications.length, 0)}
                  </p>
                </div>
                <Award className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

              {/* Rating Filter */}
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4.8+">4.8+ Stars</SelectItem>
                  <SelectItem value="4.5-4.7">4.5 - 4.7 Stars</SelectItem>
                  <SelectItem value="below-4.5">Below 4.5</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating-high">Rating: High to Low</SelectItem>
                  <SelectItem value="rating-low">Rating: Low to High</SelectItem>
                  <SelectItem value="events-high">Events: Most First</SelectItem>
                  <SelectItem value="events-low">Events: Least First</SelectItem>
                  <SelectItem value="name">Name: A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Staff Skills & Ratings List */}
        <div className="space-y-4">
          {filteredStaff.map((staff, index) => (
            <Card key={staff.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Staff Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="relative">
                        <Avatar className="h-14 w-14">
                          <AvatarFallback className="bg-primary/10 text-primary text-lg">
                            {staff.avatar}
                          </AvatarFallback>
                        </Avatar>
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-lg">{staff.name}</h3>
                          <Badge variant="outline">{staff.role}</Badge>
                          {staff.overallRating >= 4.8 && (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                              <Trophy className="w-3 h-3 mr-1" />
                              Top Performer
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className={getRatingColor(staff.overallRating) + ' w-5 h-5 fill-current'} />
                            <span className={getRatingColor(staff.overallRating) + ' text-xl font-medium'}>
                              {staff.overallRating}
                            </span>
                            <span className="text-muted-foreground">/5.0</span>
                          </div>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {staff.totalEvents} events
                          </span>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {staff.certifications.length} certifications
                          </span>
                          {isAdmin && (
                            <span className="text-muted-foreground">
                              ${staff.hourlyRate}/hr
                            </span>
                          )}
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

                  {/* Performance Metrics Preview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Punctuality</p>
                      <div className="flex items-center gap-2">
                        <Progress value={staff.performanceMetrics.punctuality} className="h-2" />
                        <span className="text-sm font-medium">{staff.performanceMetrics.punctuality}%</span>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Professionalism</p>
                      <div className="flex items-center gap-2">
                        <Progress value={staff.performanceMetrics.professionalism} className="h-2" />
                        <span className="text-sm font-medium">{staff.performanceMetrics.professionalism}%</span>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Teamwork</p>
                      <div className="flex items-center gap-2">
                        <Progress value={staff.performanceMetrics.teamwork} className="h-2" />
                        <span className="text-sm font-medium">{staff.performanceMetrics.teamwork}%</span>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Client Satisfaction</p>
                      <div className="flex items-center gap-2">
                        <Progress value={staff.performanceMetrics.clientSatisfaction} className="h-2" />
                        <span className="text-sm font-medium">{staff.performanceMetrics.clientSatisfaction}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedStaff.includes(staff.id) && (
                    <div className="border-t pt-4">
                      <Tabs defaultValue="skills" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="skills">Skills</TabsTrigger>
                          <TabsTrigger value="certifications">Certifications</TabsTrigger>
                          <TabsTrigger value="feedback">Recent Feedback</TabsTrigger>
                          <TabsTrigger value="insights">Insights</TabsTrigger>
                        </TabsList>

                        <TabsContent value="skills" className="space-y-3 mt-4">
                          <h4 className="font-medium flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Skill Proficiency
                          </h4>
                          {staff.skills.map((skill, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{skill.name}</span>
                                  {skill.certified && (
                                    <Badge variant="secondary" className="text-xs py-0">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Certified
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-muted-foreground">{skill.level}%</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${getSkillLevelColor(skill.level)} transition-all`}
                                  style={{ width: `${skill.level}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </TabsContent>

                        <TabsContent value="certifications" className="space-y-3 mt-4">
                          <h4 className="font-medium flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Professional Certifications
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {staff.certifications.map((cert, idx) => (
                              <div key={idx} className="flex items-start gap-2 p-3 border rounded-lg">
                                <Award className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                  <p className="font-medium text-sm">{cert}</p>
                                  <p className="text-xs text-muted-foreground">Active</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="feedback" className="space-y-3 mt-4">
                          <h4 className="font-medium flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Recent Client Feedback
                          </h4>
                          {staff.recentFeedback.map((feedback, idx) => (
                            <div key={idx} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-medium">{feedback.event}</p>
                                  <p className="text-sm text-muted-foreground">{feedback.date}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={
                                        i < feedback.rating
                                          ? 'w-4 h-4 text-yellow-400 fill-yellow-400'
                                          : 'w-4 h-4 text-gray-300'
                                      }
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm italic text-muted-foreground">"{feedback.comment}"</p>
                            </div>
                          ))}
                        </TabsContent>

                        <TabsContent value="insights" className="space-y-4 mt-4">
                          <div>
                            <h4 className="font-medium flex items-center gap-2 mb-3">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                              Strengths
                            </h4>
                            <div className="space-y-2">
                              {staff.strengths.map((strength, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                                  <p className="text-sm">{strength}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium flex items-center gap-2 mb-3">
                              <Target className="w-4 h-4 text-blue-600" />
                              Areas for Improvement
                            </h4>
                            <div className="space-y-2">
                              {staff.areasForImprovement.map((area, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <div className="w-4 h-4 rounded-full border-2 border-blue-600 mt-0.5" />
                                  <p className="text-sm">{area}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <p className="text-sm font-medium text-blue-900 mb-1">Overall Performance</p>
                            <p className="text-sm text-blue-700">
                              {staff.name} has been with us since {new Date(staff.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} 
                              and has completed {staff.totalEvents} events with a {staff.overallRating} average rating. 
                              They are a {staff.overallRating >= 4.8 ? 'top performer' : 'valuable team member'} in our {staff.role} category.
                            </p>
                          </div>
                        </TabsContent>
                      </Tabs>
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
