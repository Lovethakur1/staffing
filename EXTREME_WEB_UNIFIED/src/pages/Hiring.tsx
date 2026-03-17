import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { useNavigation } from "../contexts/NavigationContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { TooltipWrapper, IconTooltip, InfoTooltip } from "../components/ui/tooltip-wrapper";
import {
  Users,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  UserPlus,
  DollarSign,
  Star,
  Briefcase,
  Send,
  Eye,
  Download,
  Activity,
  Bell,
  Settings,
  ArrowLeft,
  Award,
  GraduationCap,
  Video,
  Plus,
  Edit,
  Trash2,
  Link as LinkIcon,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { staffService } from "../services/staff.service";

interface PageProps {
  userRole: string;
  userId: string;
}

interface JobPosting {
  id: string;
  title: string;
  department: string;
  type: 'full-time' | 'part-time' | 'contract';
  location: string;
  salary: string;
  status: 'active' | 'paused' | 'closed';
  postedDate: string;
  applications: number;
  views: number;
  description: string;
}

interface Assessment {
  id: string;
  candidateName: string;
  position: string;
  type: 'personality' | 'skills' | 'both';
  completedDate: string;
  scores: {
    communication: number;
    teamwork: number;
    problemSolving: number;
    leadership: number;
    technical: number;
  };
  overallScore: number;
  status: 'completed' | 'pending' | 'scheduled';
}

export function Hiring({ userRole, userId }: PageProps) {
  const { setCurrentPage } = useNavigation();
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Live statistics from API
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingReview: 0,
    interviewsScheduled: 0,
    approved: 0,
    activeJobPostings: 4,
    contractsSigned: 15,
    onboardingInProgress: 0,
    avgTimeToHire: 14,
    applicationConversionRate: 35,
    candidateSatisfaction: 4.6
  });

  const [recentActivity, setRecentActivity] = useState<Array<{
    id: number;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    icon: any;
    color: string;
  }>>([]);

  const [hiringPipeline, setHiringPipeline] = useState([
    { stage: 'Applications', count: 0, percentage: 100 },
    { stage: 'Screening', count: 0, percentage: 0 },
    { stage: 'Interviews', count: 0, percentage: 0 },
    { stage: 'Offers', count: 0, percentage: 0 },
    { stage: 'Hired', count: 0, percentage: 0 }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);

        // Fetch independently so one failure doesn't block the other
        let apps: any[] = [];
        let interviews: any[] = [];

        try {
          const appsRes = await staffService.getApplications();
          apps = Array.isArray(appsRes) ? appsRes : (appsRes?.data || []);
        } catch {
          // Applications endpoint unavailable — use empty
        }

        try {
          const interviewsRes = await staffService.getInterviews();
          interviews = Array.isArray(interviewsRes) ? interviewsRes : (interviewsRes?.data || []);
        } catch {
          // Interviews endpoint unavailable — use empty
        }

        const pending = apps.filter((a: any) => (a.status || '').toLowerCase() === 'pending').length;
        const reviewing = apps.filter((a: any) => (a.status || '').toLowerCase() === 'reviewing').length;
        const inInterview = apps.filter((a: any) => (a.status || '').toLowerCase() === 'interview').length;
        const approved = apps.filter((a: any) => (a.status || '').toLowerCase() === 'approved').length;
        const scheduled = interviews.filter((i: any) => (i.status || '').toLowerCase() === 'scheduled').length;

        const total = apps.length || 1;
        setHiringPipeline([
          { stage: 'Applications', count: apps.length, percentage: 100 },
          { stage: 'Screening', count: reviewing, percentage: Math.round((reviewing / total) * 100) },
          { stage: 'Interviews', count: inInterview + scheduled, percentage: Math.round(((inInterview + scheduled) / total) * 100) },
          { stage: 'Offers', count: approved, percentage: Math.round((approved / total) * 100) },
          { stage: 'Hired', count: Math.floor(approved * 0.6), percentage: Math.round((Math.floor(approved * 0.6) / total) * 100) }
        ]);

        setStats(prev => ({
          ...prev,
          totalApplications: apps.length,
          pendingReview: pending,
          interviewsScheduled: scheduled,
          approved,
          onboardingInProgress: Math.floor(approved * 0.6),
          applicationConversionRate: apps.length > 0 ? Math.round((approved / apps.length) * 100) : 0
        }));

        // Build activity from recent applications and interviews
        const activity: typeof recentActivity = [];
        apps.slice(0, 3).forEach((a: any, i: number) => {
          activity.push({
            id: i + 1,
            type: 'application',
            title: 'Application Received',
            description: `${a.applicant?.name || a.name || 'Candidate'} applied for ${a.position || 'a position'}`,
            timestamp: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Recently',
            icon: UserPlus,
            color: 'text-blue-600'
          });
        });
        interviews.slice(0, 2).forEach((i: any, idx: number) => {
          activity.push({
            id: 10 + idx,
            type: 'interview',
            title: i.status === 'COMPLETED' ? 'Interview Completed' : 'Interview Scheduled',
            description: `${i.candidate?.name || 'Candidate'} — ${i.position || 'General'}`,
            timestamp: i.scheduledAt ? new Date(i.scheduledAt).toLocaleDateString() : 'Recently',
            icon: Calendar,
            color: 'text-purple-600'
          });
        });
        if (activity.length === 0) {
          activity.push(
            { id: 1, type: 'info', title: 'Getting Started', description: 'Post job openings to start receiving applications', timestamp: 'Now', icon: Briefcase, color: 'text-indigo-600' }
          );
        }
        setRecentActivity(activity);
      } catch {
        toast.error('Failed to load hiring data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Pending Reviews',
      message: `${stats.pendingReview} applications need review`,
      icon: AlertTriangle,
      color: 'text-amber-600'
    },
    {
      id: 2,
      type: 'info',
      title: 'Interviews',
      message: `${stats.interviewsScheduled} interviews scheduled`,
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'success',
      title: 'Onboarding',
      message: `${stats.onboardingInProgress} in onboarding pipeline`,
      icon: CheckCircle,
      color: 'text-emerald-600'
    }
  ];

  const topPerformingChannels = [
    { name: 'Company Website', applications: 12, hires: 2, rate: 16.7 },
    { name: 'LinkedIn', applications: 8, hires: 1, rate: 12.5 },
    { name: 'Indeed', applications: 6, hires: 1, rate: 16.7 },
    { name: 'Referrals', applications: 4, hires: 2, rate: 50 }
  ];

  // Job Postings Mock Data
  const jobPostings: JobPosting[] = [
    {
      id: 'job-001',
      title: 'Event Bartender',
      department: 'Beverage Service',
      type: 'part-time',
      location: 'Multiple Locations',
      salary: '$25-35/hr + Tips',
      status: 'active',
      postedDate: '2025-09-28',
      applications: 24,
      views: 156,
      description: 'Experienced bartender for upscale events. Must have mixology skills and excellent customer service.'
    },
    {
      id: 'job-002',
      title: 'Event Server',
      department: 'Service',
      type: 'part-time',
      location: 'Los Angeles, CA',
      salary: '$20-28/hr + Tips',
      status: 'active',
      postedDate: '2025-09-25',
      applications: 38,
      views: 242,
      description: 'Professional servers needed for corporate and private events. Weekend availability required.'
    },
    {
      id: 'job-003',
      title: 'Event Coordinator',
      department: 'Management',
      type: 'full-time',
      location: 'New York, NY',
      salary: '$55,000-70,000/year',
      status: 'active',
      postedDate: '2025-09-20',
      applications: 12,
      views: 89,
      description: 'Coordinate all aspects of events from planning to execution. 3+ years experience required.'
    },
    {
      id: 'job-004',
      title: 'Catering Manager',
      department: 'Food Service',
      type: 'full-time',
      location: 'Chicago, IL',
      salary: '$50,000-65,000/year',
      status: 'paused',
      postedDate: '2025-09-15',
      applications: 8,
      views: 67,
      description: 'Oversee catering operations for multiple events. Strong leadership and organizational skills required.'
    }
  ];

  // Assessments Mock Data
  const assessments: Assessment[] = [
    {
      id: 'assess-001',
      candidateName: 'Sarah Johnson',
      position: 'Event Coordinator',
      type: 'both',
      completedDate: '2025-10-08',
      scores: {
        communication: 92,
        teamwork: 88,
        problemSolving: 85,
        leadership: 90,
        technical: 87
      },
      overallScore: 88,
      status: 'completed'
    },
    {
      id: 'assess-002',
      candidateName: 'Michael Chen',
      position: 'Bartender',
      type: 'skills',
      completedDate: '2025-10-09',
      scores: {
        communication: 85,
        teamwork: 80,
        problemSolving: 78,
        leadership: 75,
        technical: 95
      },
      overallScore: 83,
      status: 'completed'
    },
    {
      id: 'assess-003',
      candidateName: 'Jessica Martinez',
      position: 'Event Coordinator',
      type: 'both',
      completedDate: '2025-10-10',
      scores: {
        communication: 95,
        teamwork: 92,
        problemSolving: 90,
        leadership: 93,
        technical: 89
      },
      overallScore: 92,
      status: 'completed'
    },
    {
      id: 'assess-004',
      candidateName: 'Daniel Garcia',
      position: 'Server',
      type: 'personality',
      completedDate: '',
      scores: {
        communication: 0,
        teamwork: 0,
        problemSolving: 0,
        leadership: 0,
        technical: 0
      },
      overallScore: 0,
      status: 'scheduled'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-700">Paused</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-700">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading hiring data...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setCurrentPage('dashboard')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold text-foreground">Hiring Management</h1>
              <Badge variant="outline" className="flex items-center gap-1">
                <Settings className="h-3 w-3" />
                Admin
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Comprehensive recruitment and onboarding dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={() => setCurrentPage('careers')}>
            <Briefcase className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{stats.totalApplications}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-emerald-600">+18% this month</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pendingReview}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-amber-600">Needs attention</span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Interviews</p>
                <p className="text-2xl font-bold">{stats.interviewsScheduled}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-purple-600">This week</span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Onboarding</p>
                <p className="text-2xl font-bold">{stats.onboardingInProgress}</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-emerald-600">In progress</span>
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Job Postings</p>
                <p className="text-xl font-semibold">{stats.activeJobPostings}</p>
              </div>
              <Briefcase className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Time to Hire</p>
                <p className="text-xl font-semibold">{stats.avgTimeToHire} days</p>
              </div>
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-xl font-semibold">{stats.applicationConversionRate}%</p>
              </div>
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Candidate Rating</p>
                <p className="text-xl font-semibold">{stats.candidateSatisfaction}/5</p>
              </div>
              <Star className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hiring Pipeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Hiring Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hiringPipeline.map((stage) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{stage.stage}</span>
                      <Badge variant="secondary">{stage.count} candidates</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{stage.percentage}%</span>
                  </div>
                  <Progress value={stage.percentage} className="h-2" />
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-4">Top Performing Channels</h4>
              <div className="space-y-3">
                {topPerformingChannels.map((channel) => (
                  <div key={channel.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{channel.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {channel.applications} applications • {channel.hires} hired
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">{channel.rate}%</p>
                      <p className="text-xs text-muted-foreground">Conversion</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Activity */}
        <div className="space-y-6">
          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <alert.icon className={`h-4 w-4 mt-0.5 ${alert.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comprehensive Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="inline-flex lg:grid grid-cols-2 lg:grid-cols-5 w-full lg:w-auto min-w-max lg:min-w-0">
            <TabsTrigger value="overview" className="whitespace-nowrap">Overview</TabsTrigger>
            <TabsTrigger value="postings" className="whitespace-nowrap">Job Postings</TabsTrigger>
            <TabsTrigger value="applications" className="whitespace-nowrap">Applications</TabsTrigger>
            <TabsTrigger value="assessments" className="whitespace-nowrap">Assessments</TabsTrigger>
            <TabsTrigger value="contracts" className="whitespace-nowrap">Contracts</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Already rendered content above */}
        </TabsContent>

        {/* Job Postings Tab */}
        <TabsContent value="postings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Active Job Postings
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage job listings and track application metrics
                  </p>
                </div>
                <Button onClick={() => { setSelectedJob(null); setShowJobDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Salary Range</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobPostings.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <p className="text-sm text-muted-foreground">{job.location}</p>
                        </div>
                      </TableCell>
                      <TableCell>{job.department}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.type}</Badge>
                      </TableCell>
                      <TableCell>{job.salary}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{job.applications}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span>{job.views}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedJob(job); setShowJobDialog(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setCurrentPage('applications')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                All Applications
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Review and manage candidate applications
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  View detailed applications in the Applications page
                </p>
                <Button onClick={() => setCurrentPage('applications')}>
                  Go to Applications
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skills & Personality Assessments
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track candidate assessment results and performance scores
                  </p>
                </div>
                <Button variant="outline" onClick={() => toast.info('Send assessment link to candidates')}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Assessment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Assessment Type</TableHead>
                    <TableHead>Overall Score</TableHead>
                    <TableHead>Communication</TableHead>
                    <TableHead>Teamwork</TableHead>
                    <TableHead>Technical</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{assessment.candidateName}</p>
                          {assessment.completedDate && (
                            <p className="text-sm text-muted-foreground">
                              {new Date(assessment.completedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{assessment.position}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {assessment.type === 'both' ? 'Skills & Personality' : 
                           assessment.type === 'skills' ? 'Skills Only' : 'Personality Only'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {assessment.status === 'completed' ? (
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold text-lg ${getScoreColor(assessment.overallScore)}`}>
                              {assessment.overallScore}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {assessment.status === 'completed' ? (
                          <Progress value={assessment.scores.communication} className="w-16" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {assessment.status === 'completed' ? (
                          <Progress value={assessment.scores.teamwork} className="w-16" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {assessment.status === 'completed' ? (
                          <Progress value={assessment.scores.technical} className="w-16" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={assessment.status === 'completed' ? 'default' : 'secondary'}>
                          {assessment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => { setSelectedAssessment(assessment); setShowAssessmentDialog(true); }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Digital Contracts & Documents
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage employment contracts and signed documents
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Emily Rodriguez', position: 'Server', status: 'signed', date: '2025-10-08', type: 'Employment Contract' },
                  { name: 'James Wilson', position: 'Bartender', status: 'pending', date: '2025-10-09', type: 'Employment Contract' },
                  { name: 'Maria Garcia', position: 'Event Coordinator', status: 'signed', date: '2025-10-05', type: 'Employment Contract' },
                  { name: 'David Chen', position: 'Server', status: 'sent', date: '2025-10-10', type: 'Employment Contract' }
                ].map((contract, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{contract.name}</p>
                        <p className="text-sm text-muted-foreground">{contract.position} • {contract.type}</p>
                        <p className="text-xs text-muted-foreground">Sent: {contract.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        contract.status === 'signed' ? 'default' : 
                        contract.status === 'sent' ? 'secondary' : 'outline'
                      }>
                        {contract.status === 'signed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {contract.status === 'signed' ? 'Signed' : 
                         contract.status === 'sent' ? 'Sent' : 'Pending'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      {contract.status !== 'signed' && (
                        <Button variant="ghost" size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Resend
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Job Posting Dialog */}
      <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedJob ? 'Edit Job Posting' : 'Create New Job Posting'}</DialogTitle>
            <DialogDescription>
              {selectedJob ? 'Update job posting details and requirements' : 'Post a new job opening to attract top talent'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input placeholder="Event Coordinator" defaultValue={selectedJob?.title} />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select defaultValue={selectedJob?.department || 'service'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="beverage">Beverage Service</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="culinary">Culinary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employment Type</Label>
                <Select defaultValue={selectedJob?.type || 'part-time'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-Time</SelectItem>
                    <SelectItem value="part-time">Part-Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="Los Angeles, CA" defaultValue={selectedJob?.location} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Salary Range</Label>
              <Input placeholder="$50,000 - $65,000/year" defaultValue={selectedJob?.salary} />
            </div>
            <div className="space-y-2">
              <Label>Job Description</Label>
              <Textarea 
                placeholder="Describe the role, responsibilities, and requirements..." 
                rows={6}
                defaultValue={selectedJob?.description}
              />
            </div>
            <div className="space-y-2">
              <Label>Posting Links</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Indeed
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Company Site
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowJobDialog(false)}>Cancel</Button>
              <Button onClick={() => { 
                toast.success(selectedJob ? 'Job posting updated!' : 'Job posted successfully!'); 
                setShowJobDialog(false); 
              }}>
                {selectedJob ? 'Update Posting' : 'Publish Job'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assessment Details Dialog */}
      <Dialog open={showAssessmentDialog} onOpenChange={setShowAssessmentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assessment Results</DialogTitle>
            <DialogDescription>
              Detailed scores and evaluation for {selectedAssessment?.candidateName}
            </DialogDescription>
          </DialogHeader>
          {selectedAssessment && selectedAssessment.status === 'completed' && (
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <div className={`text-5xl font-bold ${getScoreColor(selectedAssessment.overallScore)}`}>
                      {selectedAssessment.overallScore}%
                    </div>
                    <p className="text-muted-foreground mt-2">Overall Score</p>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(selectedAssessment.scores).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                          <span className={`font-semibold ${getScoreColor(value)}`}>{value}%</span>
                        </div>
                        <Progress value={value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => toast.info('Sending assessment results...')}>
                  <Send className="h-4 w-4 mr-2" />
                  Share Results
                </Button>
                <Button onClick={() => setCurrentPage('interviews')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
              </div>
            </div>
          )}
          {selectedAssessment && selectedAssessment.status !== 'completed' && (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Assessment is {selectedAssessment.status}. Results will appear here once completed.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
