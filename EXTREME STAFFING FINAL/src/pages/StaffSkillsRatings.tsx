import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import { 
  Star, Search, Filter, TrendingUp, Award, Users, 
  ChevronDown, ChevronUp, Briefcase, Calendar, Trophy,
  Target, CheckCircle, Shield, BarChart3
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

  // Check if user is Admin for financial data visibility
  const isAdmin = userRole === 'admin';

  // Mock staff skills and ratings data
  const staffSkillsData = [
    {
      id: 'staff-001',
      name: 'Sarah Martinez',
      avatar: 'SM',
      role: 'Bartender',
      hourlyRate: 28,
      overallRating: 4.9,
      totalEvents: 142,
      totalHours: 856,
      joinDate: '2023-03-15',
      skills: [
        { name: 'Mixology', level: 95, certified: true },
        { name: 'Customer Service', level: 98, certified: false },
        { name: 'Speed & Efficiency', level: 92, certified: false },
        { name: 'Wine Knowledge', level: 88, certified: true },
        { name: 'Inventory Management', level: 85, certified: false }
      ],
      certifications: ['Mixology Professional', 'Responsible Beverage Service', 'Wine Sommelier Level 1'],
      performanceMetrics: {
        punctuality: 98,
        professionalism: 97,
        teamwork: 95,
        clientSatisfaction: 96
      },
      recentFeedback: [
        { date: '2025-01-10', event: 'Corporate Gala', rating: 5, comment: 'Exceptional service, guests loved the cocktails!' },
        { date: '2025-01-05', event: 'Wedding Reception', rating: 5, comment: 'Very professional and creative with drinks.' },
        { date: '2024-12-28', event: 'Holiday Party', rating: 4, comment: 'Great work, arrived a bit late due to traffic.' }
      ],
      strengths: ['Creative cocktail creation', 'Excellent customer interaction', 'High-volume efficiency'],
      areasForImprovement: ['Inventory documentation']
    },
    {
      id: 'staff-002',
      name: 'Michael Chen',
      avatar: 'MC',
      role: 'Head Server',
      hourlyRate: 32,
      overallRating: 4.8,
      totalEvents: 215,
      totalHours: 1290,
      joinDate: '2022-11-08',
      skills: [
        { name: 'Leadership', level: 94, certified: true },
        { name: 'Food Service', level: 96, certified: true },
        { name: 'Wine Pairing', level: 91, certified: true },
        { name: 'Team Coordination', level: 93, certified: false },
        { name: 'Guest Relations', level: 95, certified: false }
      ],
      certifications: ['Food Handler Certified', 'Wine Sommelier Level 2', 'ServSafe Manager'],
      performanceMetrics: {
        punctuality: 99,
        professionalism: 98,
        teamwork: 97,
        clientSatisfaction: 96
      },
      recentFeedback: [
        { date: '2025-01-12', event: 'Charity Fundraiser', rating: 5, comment: 'Outstanding team leadership and service quality.' },
        { date: '2025-01-08', event: 'Product Launch', rating: 5, comment: 'Flawless execution, very professional.' },
        { date: '2025-01-03', event: 'Anniversary Dinner', rating: 4, comment: 'Great service, minor timing issue with desserts.' }
      ],
      strengths: ['Strong leadership skills', 'Exceptional wine knowledge', 'Consistent reliability'],
      areasForImprovement: ['Communication with kitchen staff during peak times']
    },
    {
      id: 'staff-003',
      name: 'Emma Davis',
      avatar: 'ED',
      role: 'Server',
      hourlyRate: 25,
      overallRating: 4.7,
      totalEvents: 98,
      totalHours: 588,
      joinDate: '2023-07-20',
      skills: [
        { name: 'Customer Service', level: 92, certified: false },
        { name: 'Food Service', level: 89, certified: true },
        { name: 'Attention to Detail', level: 94, certified: false },
        { name: 'Multitasking', level: 88, certified: false },
        { name: 'POS Systems', level: 90, certified: false }
      ],
      certifications: ['Food Handler Certified', 'Allergen Awareness'],
      performanceMetrics: {
        punctuality: 96,
        professionalism: 95,
        teamwork: 94,
        clientSatisfaction: 94
      },
      recentFeedback: [
        { date: '2025-01-09', event: 'Networking Event', rating: 5, comment: 'Very attentive and professional.' },
        { date: '2025-01-02', event: 'Birthday Party', rating: 5, comment: 'Wonderful service, guests were very happy.' },
        { date: '2024-12-26', event: 'Family Gathering', rating: 4, comment: 'Good work, could be more proactive.' }
      ],
      strengths: ['Detail-oriented', 'Friendly demeanor', 'Quick learner'],
      areasForImprovement: ['Building confidence in high-pressure situations']
    },
    {
      id: 'staff-004',
      name: 'Lisa Anderson',
      avatar: 'LA',
      role: 'Bartender',
      hourlyRate: 28,
      overallRating: 4.9,
      totalEvents: 167,
      totalHours: 1002,
      joinDate: '2023-01-10',
      skills: [
        { name: 'Mixology', level: 97, certified: true },
        { name: 'Flair Bartending', level: 89, certified: false },
        { name: 'Customer Engagement', level: 96, certified: false },
        { name: 'Bar Management', level: 93, certified: true },
        { name: 'Craft Cocktails', level: 98, certified: false }
      ],
      certifications: ['Mixology Professional', 'Responsible Beverage Service', 'BarSmarts Advanced'],
      performanceMetrics: {
        punctuality: 97,
        professionalism: 98,
        teamwork: 96,
        clientSatisfaction: 98
      },
      recentFeedback: [
        { date: '2025-01-11', event: 'Cocktail Party', rating: 5, comment: 'Best bartender we\'ve had! Amazing cocktails.' },
        { date: '2025-01-06', event: 'Corporate Event', rating: 5, comment: 'Professional, creative, and efficient.' },
        { date: '2024-12-30', event: 'New Year\'s Eve', rating: 5, comment: 'Handled high volume perfectly!' }
      ],
      strengths: ['Craft cocktail expertise', 'Engaging personality', 'Efficient under pressure'],
      areasForImprovement: ['Mentoring junior bartenders']
    },
    {
      id: 'staff-005',
      name: 'Christopher Miller',
      avatar: 'CM',
      role: 'Event Coordinator',
      hourlyRate: 35,
      overallRating: 4.9,
      totalEvents: 189,
      totalHours: 1512,
      joinDate: '2022-05-12',
      skills: [
        { name: 'Event Planning', level: 98, certified: true },
        { name: 'Team Leadership', level: 96, certified: true },
        { name: 'Problem Solving', level: 97, certified: false },
        { name: 'Client Relations', level: 95, certified: false },
        { name: 'Budget Management', level: 92, certified: false }
      ],
      certifications: ['Event Management Professional', 'Safety Coordinator', 'First Aid & CPR'],
      performanceMetrics: {
        punctuality: 100,
        professionalism: 99,
        teamwork: 98,
        clientSatisfaction: 97
      },
      recentFeedback: [
        { date: '2025-01-13', event: 'Corporate Gala', rating: 5, comment: 'Exceptional planning and execution. Flawless event!' },
        { date: '2025-01-07', event: 'Product Launch', rating: 5, comment: 'Very organized and professional throughout.' },
        { date: '2025-01-01', event: 'New Year Celebration', rating: 5, comment: 'Managed a complex event with ease.' }
      ],
      strengths: ['Strategic planning', 'Crisis management', 'Client communication'],
      areasForImprovement: ['Delegation to allow for better work-life balance']
    },
    {
      id: 'staff-006',
      name: 'Amy Taylor',
      avatar: 'AT',
      role: 'Server',
      hourlyRate: 25,
      overallRating: 4.8,
      totalEvents: 123,
      totalHours: 738,
      joinDate: '2023-04-18',
      skills: [
        { name: 'Customer Service', level: 95, certified: false },
        { name: 'Food Service', level: 92, certified: true },
        { name: 'Allergen Knowledge', level: 96, certified: true },
        { name: 'Table Management', level: 91, certified: false },
        { name: 'Upselling', level: 89, certified: false }
      ],
      certifications: ['Food Handler Certified', 'Allergen Awareness Specialist', 'Wine Knowledge Level 1'],
      performanceMetrics: {
        punctuality: 98,
        professionalism: 97,
        teamwork: 96,
        clientSatisfaction: 97
      },
      recentFeedback: [
        { date: '2025-01-14', event: 'Wedding Reception', rating: 5, comment: 'Handled dietary restrictions perfectly!' },
        { date: '2025-01-09', event: 'Business Dinner', rating: 5, comment: 'Professional and knowledgeable about the menu.' },
        { date: '2025-01-04', event: 'Family Celebration', rating: 4, comment: 'Great service overall.' }
      ],
      strengths: ['Allergen expertise', 'Warm personality', 'Menu knowledge'],
      areasForImprovement: ['Speed during high-volume periods']
    },
    {
      id: 'staff-007',
      name: 'David Brown',
      avatar: 'DB',
      role: 'Busser',
      hourlyRate: 20,
      overallRating: 4.5,
      totalEvents: 37,
      totalHours: 222,
      joinDate: '2024-09-05',
      skills: [
        { name: 'Table Clearing', level: 88, certified: false },
        { name: 'Setup & Breakdown', level: 90, certified: false },
        { name: 'Attention to Detail', level: 85, certified: false },
        { name: 'Physical Stamina', level: 92, certified: false },
        { name: 'Team Support', level: 87, certified: false }
      ],
      certifications: ['Food Handler Certified'],
      performanceMetrics: {
        punctuality: 95,
        professionalism: 92,
        teamwork: 94,
        clientSatisfaction: 91
      },
      recentFeedback: [
        { date: '2025-01-10', event: 'Corporate Lunch', rating: 5, comment: 'Very efficient and helpful.' },
        { date: '2025-01-05', event: 'Dinner Event', rating: 4, comment: 'Good work, still learning the ropes.' },
        { date: '2024-12-28', event: 'Holiday Party', rating: 4, comment: 'Hardworking and eager to help.' }
      ],
      strengths: ['Strong work ethic', 'Fast learner', 'Team player'],
      areasForImprovement: ['Anticipating service needs', 'Building experience']
    },
    {
      id: 'staff-008',
      name: 'James Wilson',
      avatar: 'JW',
      role: 'Server',
      hourlyRate: 25,
      overallRating: 4.6,
      totalEvents: 54,
      totalHours: 324,
      joinDate: '2024-03-22',
      skills: [
        { name: 'Customer Service', level: 87, certified: false },
        { name: 'Food Service', level: 85, certified: true },
        { name: 'Communication', level: 89, certified: false },
        { name: 'Adaptability', level: 91, certified: false },
        { name: 'Conflict Resolution', level: 84, certified: false }
      ],
      certifications: ['Food Handler Certified'],
      performanceMetrics: {
        punctuality: 94,
        professionalism: 93,
        teamwork: 95,
        clientSatisfaction: 92
      },
      recentFeedback: [
        { date: '2025-01-11', event: 'Birthday Celebration', rating: 5, comment: 'Very friendly and accommodating.' },
        { date: '2025-01-06', event: 'Business Meeting', rating: 4, comment: 'Good service, minor timing issues.' },
        { date: '2024-12-29', event: 'Holiday Dinner', rating: 5, comment: 'Great attitude and helpful.' }
      ],
      strengths: ['Positive attitude', 'Good communicator', 'Adaptable'],
      areasForImprovement: ['Technical service skills', 'Wine knowledge']
    }
  ];

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
        <div>
          <h1 className="text-3xl flex items-center gap-2">
            <Star className="h-8 w-8 text-primary fill-primary" />
            Staff Skills & Ratings
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive view of staff skills, certifications, and performance ratings
          </p>
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