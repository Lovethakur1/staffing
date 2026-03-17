import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Checkbox } from "../components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Users,
  CheckCircle,
  Clock,
  FileText,
  Shield,
  AlertCircle,
  Eye,
  Download,
  Send,
  Calendar,
  Award,
  ArrowLeft,
  Shirt,
  Key,
  GraduationCap
} from "lucide-react";
import { toast } from "sonner";
import { useNavigation } from "../contexts/NavigationContext";
import { staffService } from "../services/staff.service";

interface PageProps {
  userRole: string;
  userId: string;
}

interface OnboardingTask {
  id: string;
  title: string;
  category: 'documents' | 'background' | 'equipment' | 'access' | 'training';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string;
  completedDate?: string;
  assignedTo?: string;
  notes?: string;
}

interface NewHire {
  id: string;
  name: string;
  email: string;
  position: string;
  startDate: string;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
  tasks: OnboardingTask[];
  hireDate: string;
  department: string;
}

export function Onboarding({ userRole, userId }: PageProps) {
  const { setCurrentPage } = useNavigation();
  const [activeTab, setActiveTab] = useState('active');
  const [selectedHire, setSelectedHire] = useState<NewHire | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const onboardingTemplate: Omit<OnboardingTask, 'id'>[] = [
    { title: 'Complete I-9 Form', category: 'documents', status: 'pending', dueDate: '2025-10-15' },
    { title: 'Submit W-4 Tax Form', category: 'documents', status: 'pending', dueDate: '2025-10-15' },
    { title: 'Direct Deposit Setup', category: 'documents', status: 'pending', dueDate: '2025-10-15' },
    { title: 'Emergency Contact Information', category: 'documents', status: 'pending', dueDate: '2025-10-15' },
    { title: 'Sign Employee Handbook', category: 'documents', status: 'pending', dueDate: '2025-10-16' },
    { title: 'Background Check Initiation', category: 'background', status: 'pending', dueDate: '2025-10-12' },
    { title: 'Background Check Completion', category: 'background', status: 'pending', dueDate: '2025-10-18' },
    { title: 'Uniform Fitting & Assignment', category: 'equipment', status: 'pending', dueDate: '2025-10-17' },
    { title: 'Equipment Assignment', category: 'equipment', status: 'pending', dueDate: '2025-10-17' },
    { title: 'ID Badge Creation', category: 'equipment', status: 'pending', dueDate: '2025-10-17' },
    { title: 'Email Account Setup', category: 'access', status: 'pending', dueDate: '2025-10-16' },
    { title: 'System Access Provisioning', category: 'access', status: 'pending', dueDate: '2025-10-16' },
    { title: 'Safety Training', category: 'training', status: 'pending', dueDate: '2025-10-19' },
    { title: 'Company Orientation', category: 'training', status: 'pending', dueDate: '2025-10-19' },
    { title: 'Position-Specific Training', category: 'training', status: 'pending', dueDate: '2025-10-20' },
    { title: 'Customer Service Training', category: 'training', status: 'pending', dueDate: '2025-10-20' },
  ];

  const [newHires, setNewHires] = useState<NewHire[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOnboardingData = async () => {
    try {
      setIsLoading(true);
      // For onboarding, we typically want staff who are recently hired or 'onboarding' status
      const res = await staffService.getStaffList({ take: 50 });
      const rawStaff = Array.isArray(res) ? res : (res?.data || []);

      const mappedHires: NewHire[] = await Promise.all(rawStaff.map(async (s: any) => {
        // Fetch documents for each staff member to calculate progress
        let tasks: OnboardingTask[] = [];
        try {
          const docs = await staffService.getDocuments(s.user?.id || s.id);
          const rawDocs = Array.isArray(docs) ? docs : (docs?.data || []);

          tasks = [...onboardingTemplate].map((t, idx) => {
            // Check if there's a matching document
            const match = rawDocs.find((d: any) => d.category.toLowerCase().includes(t.category));
            if (match) {
              return { ...t, id: `task-${idx}`, status: 'completed', completedDate: new Date(match.createdAt).toLocaleDateString() };
            }
            return { ...t, id: `task-${idx}` };
          });
        } catch (e) {
          // Fallback if unable to fetch docs
          tasks = [...onboardingTemplate].map((t, idx) => ({ ...t, id: `task-${idx}` }));
        }

        const completedCount = tasks.filter(t => t.status === 'completed').length;
        const progress = Math.round((completedCount / tasks.length) * 100);

        return {
          id: s.id,
          name: s.user?.name || s.name || 'Unknown',
          email: s.user?.email || s.email || '',
          position: s.staffType || s.role || 'Staff',
          startDate: s.hireDate ? new Date(s.hireDate).toLocaleDateString() : new Date().toLocaleDateString(),
          status: progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'not-started',
          progress: progress,
          hireDate: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          department: 'General',
          tasks: tasks
        };
      }));

      // Only show people who actually need onboarding (we'll show all for demo purposes)
      setNewHires(mappedHires);
    } catch (err) {
      toast.error('Failed to load onboarding data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOnboardingData();
  }, []);

  const activeOnboarding = newHires.filter(h => h.status === 'in-progress');
  const completedOnboarding = newHires.filter(h => h.status === 'completed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in-progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'not-started': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'documents': return <FileText className="h-4 w-4" />;
      case 'background': return <Shield className="h-4 w-4" />;
      case 'equipment': return <Shirt className="h-4 w-4" />;
      case 'access': return <Key className="h-4 w-4" />;
      case 'training': return <GraduationCap className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleTaskToggle = (taskId: string) => {
    toast.success("Task status updated!");
  };

  const handleViewDetails = (hire: NewHire) => {
    setSelectedHire(hire);
    setIsDetailsDialogOpen(true);
  };

  const stats = {
    total: newHires.length,
    active: activeOnboarding.length,
    completed: completedOnboarding.length,
    avgProgress: Math.round(newHires.reduce((sum, h) => sum + h.progress, 0) / newHires.length)
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage('hiring')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold text-foreground">New Hire Onboarding</h1>
              <Badge variant="outline" className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                Admin
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Track and manage the onboarding process for new employees
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total New Hires</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Onboarding</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Progress</p>
                <p className="text-2xl font-bold">{stats.avgProgress}%</p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Onboarding ({activeOnboarding.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedOnboarding.length})</TabsTrigger>
        </TabsList>

        {/* Active Onboarding */}
        <TabsContent value="active" className="space-y-4 mt-6">
          {activeOnboarding.map((hire) => (
            <Card key={hire.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <CardTitle>{hire.name}</CardTitle>
                      <Badge className={getStatusColor(hire.status)}>
                        {hire.status.split('-').map(word =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{hire.position}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Start Date: {hire.startDate}
                      </span>
                      <span>•</span>
                      <span>Hired: {hire.hireDate}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(hire)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-muted-foreground">{hire.progress}%</span>
                    </div>
                    <Progress value={hire.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {['documents', 'background', 'equipment', 'access', 'training'].map((category) => {
                      const categoryTasks = hire.tasks.filter(t => t.category === category);
                      const completedTasks = categoryTasks.filter(t => t.status === 'completed').length;
                      const progress = (completedTasks / categoryTasks.length) * 100;

                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(category)}
                            <span className="text-sm font-medium capitalize">{category}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {completedTasks}/{categoryTasks.length} completed
                          </div>
                          <Progress value={progress} className="h-1.5" />
                        </div>
                      );
                    })}
                  </div>

                  {/* Show pending tasks */}
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Pending Tasks</h4>
                    <div className="space-y-2">
                      {hire.tasks
                        .filter(t => t.status === 'pending' || t.status === 'in-progress')
                        .slice(0, 3)
                        .map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(task.category)}
                              <span className="text-sm">{task.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {task.dueDate && (
                                <span className="text-xs text-muted-foreground">
                                  Due: {task.dueDate}
                                </span>
                              )}
                              <Badge className={getStatusColor(task.status)} variant="outline">
                                {task.status.split('-').join(' ')}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Completed Onboarding */}
        <TabsContent value="completed" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                <p>No completed onboarding processes yet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Onboarding Details</DialogTitle>
          </DialogHeader>
          {selectedHire && (
            <div className="space-y-6 py-4">
              {/* Header Info */}
              <div className="flex items-start justify-between p-4 bg-muted rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">{selectedHire.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedHire.position}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span>Start Date: {selectedHire.startDate}</span>
                    <span>•</span>
                    <span>Hired: {selectedHire.hireDate}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{selectedHire.progress}%</div>
                  <p className="text-sm text-muted-foreground">Complete</p>
                </div>
              </div>

              {/* Tasks by Category */}
              <div className="space-y-6">
                {['documents', 'background', 'equipment', 'access', 'training'].map((category) => {
                  const categoryTasks = selectedHire.tasks.filter(t => t.category === category);
                  const completedCount = categoryTasks.filter(t => t.status === 'completed').length;

                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category)}
                          <h4 className="font-semibold capitalize">{category}</h4>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {completedCount}/{categoryTasks.length} completed
                        </span>
                      </div>
                      <div className="space-y-2">
                        {categoryTasks.map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3 flex-1">
                              <Checkbox
                                checked={task.status === 'completed'}
                                onCheckedChange={() => handleTaskToggle(task.id)}
                              />
                              <div className="flex-1">
                                <p className={`text-sm ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.title}
                                </p>
                                {task.completedDate && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Completed: {task.completedDate}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {task.dueDate && task.status !== 'completed' && (
                                <span className="text-xs text-muted-foreground">
                                  Due: {task.dueDate}
                                </span>
                              )}
                              <Badge className={getStatusColor(task.status)} variant="outline">
                                {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setIsDetailsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
