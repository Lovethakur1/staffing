import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  GraduationCap,
  BookOpen,
  Video,
  CheckCircle,
  Clock,
  Award,
  Play,
  FileText,
  Users,
  TrendingUp,
  Star,
  Lock,
  Search,
  Filter
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner";
import api from "../services/api";

interface TrainingPortalProps {
  userRole: string;
  userId: string;
}

interface Course {
  id: string;
  title: string;
  category: string;
  duration: number; // minutes
  modules: number;
  completionRate: number;
  status: 'not-started' | 'in-progress' | 'completed';
  required: boolean;
  thumbnail?: string;
  instructor?: string;
  description: string;
}

interface StaffProgress {
  staffId: string;
  staffName: string;
  coursesCompleted: number;
  coursesInProgress: number;
  overallCompletion: number;
  badges: string[];
}

export function TrainingPortal({ userRole, userId }: TrainingPortalProps) {
  const { setCurrentPage } = useNavigation();
  const [selectedTab, setSelectedTab] = useState("my-courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [staffProgress, setStaffProgress] = useState<StaffProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/training/courses');
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setCourses(data.map((c: any) => ({
          id: c.id,
          title: c.title || '',
          category: c.category || '',
          duration: c.duration || 0,
          modules: c.modules || 0,
          completionRate: c.completionRate || 0,
          status: (c.status || 'not-started').toLowerCase() as Course['status'],
          required: c.required ?? false,
          instructor: c.instructor || undefined,
          description: c.description || '',
        })));
      } catch { /* No training endpoint yet */ }
      try {
        const res = await api.get('/training/progress');
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setStaffProgress(data.map((p: any) => ({
          staffId: p.staffId || '',
          staffName: p.staffName || p.staff?.user?.name || '',
          coursesCompleted: p.coursesCompleted || 0,
          coursesInProgress: p.coursesInProgress || 0,
          overallCompletion: p.overallCompletion || 0,
          badges: p.badges || [],
        })));
      } catch { /* No training progress endpoint yet */ }
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  // Summary stats
  const stats = {
    totalCourses: courses.length,
    completed: courses.filter(c => c.status === 'completed').length,
    inProgress: courses.filter(c => c.status === 'in-progress').length,
    avgCompletion: (courses.reduce((sum, c) => sum + c.completionRate, 0) / courses.length).toFixed(0)
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case "not-started":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100"><Lock className="h-3 w-3 mr-1" />Not Started</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(courses.map(c => c.category)));

  const handleStartCourse = (course: Course) => {
    toast.success(`Starting course: ${course.title}`);
  };

  const handleContinueCourse = (course: Course) => {
    toast.success(`Continuing course: ${course.title}`);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Training Portal</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              {userRole === 'sub-admin' ? 'Sub-Admin' : userRole === 'manager' ? 'Manager' : 'Staff'}
            </Badge>
          </div>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Staff development and certification courses
          </p>
        </div>
        <div className="flex items-center gap-3">
          {userRole === 'admin' && (
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Manage Courses
            </Button>
          )}
          <Button className="bg-sangria hover:bg-merlot">
            <TrendingUp className="h-4 w-4 mr-2" />
            My Progress
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Courses</p>
              <p className="text-xl font-semibold">{stats.totalCourses}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-xl font-semibold">{stats.completed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-xl font-semibold">{stats.inProgress}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Completion</p>
              <p className="text-xl font-semibold">{stats.avgCompletion}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="my-courses">My Courses</TabsTrigger>
          <TabsTrigger value="browse">Browse Courses</TabsTrigger>
          {userRole === 'admin' && <TabsTrigger value="team-progress">Team Progress</TabsTrigger>}
        </TabsList>

        <TabsContent value="my-courses" className="space-y-4">
          {/* Required Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Required Training
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {courses.filter(c => c.required).map((course) => (
                <div key={course.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{course.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{course.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {course.modules} modules
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          {course.instructor}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(course.status)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{course.completionRate}%</span>
                    </div>
                    <Progress value={course.completionRate} className="h-2" />
                  </div>
                  <div className="mt-3">
                    {course.status === 'not-started' && (
                      <Button 
                        size="sm" 
                        className="bg-sangria hover:bg-merlot"
                        onClick={() => handleStartCourse(course)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Course
                      </Button>
                    )}
                    {course.status === 'in-progress' && (
                      <Button 
                        size="sm" 
                        className="bg-sangria hover:bg-merlot"
                        onClick={() => handleContinueCourse(course)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Continue Learning
                      </Button>
                    )}
                    {course.status === 'completed' && (
                      <Button size="sm" variant="outline">
                        <Award className="h-4 w-4 mr-2" />
                        View Certificate
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Optional Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Training</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {courses.filter(c => !c.required).map((course) => (
                <div key={course.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{course.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{course.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {course.modules} modules
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(course.status)}
                  </div>
                  {course.status !== 'not-started' && (
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{course.completionRate}%</span>
                      </div>
                      <Progress value={course.completionRate} className="h-2" />
                    </div>
                  )}
                  <div className="mt-3">
                    {course.status === 'not-started' && (
                      <Button size="sm" variant="outline" onClick={() => handleStartCourse(course)}>
                        <Play className="h-4 w-4 mr-2" />
                        Start Course
                      </Button>
                    )}
                    {course.status === 'in-progress' && (
                      <Button size="sm" variant="outline" onClick={() => handleContinueCourse(course)}>
                        <Play className="h-4 w-4 mr-2" />
                        Continue
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="browse" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>All Courses</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full sm:w-[250px]"
                    />
                  </div>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCourses.map((course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="aspect-video bg-gradient-to-br from-sangria to-merlot rounded-lg mb-3 flex items-center justify-center">
                        <Video className="h-12 w-12 text-white" />
                      </div>
                      {course.required && (
                        <Badge className="mb-2 bg-yellow-100 text-yellow-700">Required</Badge>
                      )}
                      <h4 className="font-semibold mb-2">{course.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.duration}m
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {course.modules} modules
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full bg-sangria hover:bg-merlot"
                        onClick={() => course.status === 'not-started' ? handleStartCourse(course) : handleContinueCourse(course)}
                      >
                        {course.status === 'completed' ? 'Review' : course.status === 'in-progress' ? 'Continue' : 'Start'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {userRole === 'admin' && (
          <TabsContent value="team-progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Staff Training Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staffProgress.map((staff) => (
                    <div key={staff.staffId} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{staff.staffName}</h4>
                          <p className="text-sm text-muted-foreground">{staff.staffId}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-semibold text-sangria">{staff.overallCompletion}%</p>
                          <p className="text-xs text-muted-foreground">Overall</p>
                        </div>
                      </div>
                      <div className="space-y-2 mb-3">
                        <Progress value={staff.overallCompletion} className="h-2" />
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{staff.coursesCompleted} completed</span>
                          <span>{staff.coursesInProgress} in progress</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {staff.badges.map((badge, idx) => (
                          <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700">
                            <Award className="h-3 w-3 mr-1" />
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
