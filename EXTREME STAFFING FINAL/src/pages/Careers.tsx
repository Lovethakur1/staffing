import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  Briefcase,
  Plus,
  Edit,
  Eye,
  Trash2,
  MapPin,
  DollarSign,
  Clock,
  Users,
  ExternalLink,
  Globe,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Send,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { useNavigation } from "../contexts/NavigationContext";

interface PageProps {
  userRole: string;
  userId: string;
}

interface JobPosting {
  id: string;
  title: string;
  department: string;
  type: 'full-time' | 'part-time' | 'contractor' | 'seasonal';
  status: 'active' | 'paused' | 'closed';
  location: string;
  salaryRange: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  postedDate: string;
  applicationsCount: number;
  viewsCount: number;
}

export function Careers({ userRole, userId }: PageProps) {
  const { setCurrentPage } = useNavigation();
  const [activeTab, setActiveTab] = useState('postings');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPosting, setSelectedPosting] = useState<JobPosting | null>(null);

  const [jobPostings] = useState<JobPosting[]>([
    {
      id: "job-001",
      title: "Event Coordinator",
      department: "Operations",
      type: "full-time",
      status: "active",
      location: "Los Angeles, CA",
      salaryRange: "$50,000 - $65,000/year",
      description: "We're seeking an experienced Event Coordinator to join our dynamic team. You'll be responsible for planning and executing high-profile events for our premium clients, managing vendor relationships, and ensuring exceptional client satisfaction.",
      requirements: [
        "3+ years of event planning experience",
        "Bachelor's degree in Hospitality Management or related field",
        "Strong organizational and multitasking skills",
        "Excellent communication and client relations abilities",
        "Proficiency in event management software",
        "Ability to work flexible hours including evenings and weekends"
      ],
      responsibilities: [
        "Plan and coordinate corporate events, weddings, and special occasions",
        "Manage vendor relationships and negotiate contracts",
        "Develop event timelines and ensure seamless execution",
        "Oversee event budgets and maintain cost controls",
        "Lead on-site event teams and troubleshoot issues",
        "Build and maintain strong client relationships"
      ],
      benefits: [
        "Competitive salary with performance bonuses",
        "Health, dental, and vision insurance",
        "401(k) with company match",
        "Paid time off and holidays",
        "Professional development opportunities",
        "Employee wellness programs"
      ],
      postedDate: "2025-09-25",
      applicationsCount: 12,
      viewsCount: 234
    },
    {
      id: "job-002",
      title: "Bartender",
      department: "Service",
      type: "part-time",
      status: "active",
      location: "Los Angeles, CA",
      salaryRange: "$26 - $35/hour + tips",
      description: "Join our team of professional bartenders servicing high-end events and corporate functions. We're looking for skilled mixologists who can deliver exceptional service while maintaining professionalism in fast-paced environments.",
      requirements: [
        "Minimum 3 years bartending experience",
        "Valid bartending license/certification",
        "Knowledge of craft cocktails and mixology",
        "Strong customer service skills",
        "Ability to work nights and weekends",
        "Reliable transportation"
      ],
      responsibilities: [
        "Prepare and serve alcoholic and non-alcoholic beverages",
        "Maintain bar cleanliness and organization",
        "Interact professionally with event guests",
        "Manage bar inventory and supplies",
        "Follow all safety and alcohol service regulations",
        "Collaborate with event teams for smooth service"
      ],
      benefits: [
        "Competitive hourly rate plus tips",
        "Flexible scheduling",
        "Training and certification opportunities",
        "Access to premium events",
        "Team environment",
        "Growth opportunities"
      ],
      postedDate: "2025-09-28",
      applicationsCount: 8,
      viewsCount: 189
    },
    {
      id: "job-003",
      title: "Server",
      department: "Service",
      type: "part-time",
      status: "active",
      location: "Los Angeles, CA",
      salaryRange: "$24 - $30/hour + tips",
      description: "We're hiring experienced servers for upscale events and functions. The ideal candidate has fine dining experience and excels at providing white-glove service to discerning clientele.",
      requirements: [
        "2+ years serving experience, preferably fine dining",
        "Knowledge of formal service techniques",
        "Professional appearance and demeanor",
        "Strong communication skills",
        "Ability to stand for extended periods",
        "Weekend and evening availability"
      ],
      responsibilities: [
        "Provide exceptional table service at events",
        "Take orders and serve food and beverages",
        "Maintain professional presentation",
        "Ensure guest satisfaction throughout events",
        "Assist with event setup and breakdown",
        "Work collaboratively with event teams"
      ],
      benefits: [
        "Competitive hourly wages plus tips",
        "Flexible scheduling options",
        "Work at prestigious venues",
        "Professional development",
        "Supportive team culture",
        "Advancement opportunities"
      ],
      postedDate: "2025-09-30",
      applicationsCount: 15,
      viewsCount: 312
    },
    {
      id: "job-004",
      title: "Setup Crew",
      department: "Operations",
      type: "part-time",
      status: "active",
      location: "Los Angeles, CA",
      salaryRange: "$20 - $26/hour",
      description: "Looking for reliable, hardworking individuals to join our event setup crew. You'll be responsible for transforming venues through setup and breakdown of event equipment, staging, and decor.",
      requirements: [
        "Ability to lift 50+ pounds regularly",
        "Previous event or construction experience preferred",
        "Strong work ethic and reliability",
        "Team player mentality",
        "Valid driver's license",
        "Flexibility with scheduling"
      ],
      responsibilities: [
        "Load and unload event equipment and materials",
        "Set up tables, chairs, staging, and decor",
        "Follow setup diagrams and instructions",
        "Ensure safe handling of all equipment",
        "Complete event breakdown efficiently",
        "Maintain equipment and report damages"
      ],
      benefits: [
        "Competitive hourly pay",
        "Consistent work opportunities",
        "Physical fitness",
        "Variety of event types",
        "Team environment",
        "Skill development"
      ],
      postedDate: "2025-10-02",
      applicationsCount: 6,
      viewsCount: 156
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'paused': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'closed': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'full-time': 'Full-Time',
      'part-time': 'Part-Time',
      'contractor': 'Contractor',
      'seasonal': 'Seasonal'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleCreatePosting = () => {
    toast.success("Job posting created successfully!");
    setIsCreateDialogOpen(false);
  };

  const handleToggleStatus = (postingId: string) => {
    toast.success("Job posting status updated!");
  };

  const totalApplications = jobPostings.reduce((sum, job) => sum + job.applicationsCount, 0);
  const totalViews = jobPostings.reduce((sum, job) => sum + job.viewsCount, 0);
  const activePostings = jobPostings.filter(job => job.status === 'active').length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setCurrentPage('hiring')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Career Site & Job Postings</h1>
            <p className="text-muted-foreground">
              Manage job postings and preview your company careers page
            </p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Job Posting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Job Posting</DialogTitle>
              <DialogDescription>
                Fill out the details for your new job opening
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Title *</Label>
                  <Input placeholder="e.g., Event Coordinator" />
                </div>
                <div className="space-y-2">
                  <Label>Department *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Employment Type *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-Time</SelectItem>
                      <SelectItem value="part-time">Part-Time</SelectItem>
                      <SelectItem value="contractor">Contractor</SelectItem>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Input placeholder="e.g., Los Angeles, CA" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Salary Range *</Label>
                <Input placeholder="e.g., $50,000 - $65,000/year or $25 - $35/hour" />
              </div>

              <div className="space-y-2">
                <Label>Job Description *</Label>
                <Textarea 
                  placeholder="Describe the role, responsibilities, and what makes it exciting..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Requirements</Label>
                <Textarea 
                  placeholder="List required qualifications (one per line)..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Responsibilities</Label>
                <Textarea 
                  placeholder="List key responsibilities (one per line)..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Benefits</Label>
                <Textarea 
                  placeholder="List benefits and perks (one per line)..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePosting}>
                  <Send className="h-4 w-4 mr-2" />
                  Publish Job Posting
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Postings</p>
                <p className="text-2xl font-bold">{activePostings}</p>
              </div>
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{totalApplications}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                <p className="text-2xl font-bold">{totalViews}</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Time to Fill</p>
                <p className="text-2xl font-bold">14 days</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="postings">Job Postings Management</TabsTrigger>
          <TabsTrigger value="preview">Career Site Preview</TabsTrigger>
        </TabsList>

        {/* Job Postings Management */}
        <TabsContent value="postings" className="space-y-4 mt-6">
          {jobPostings.map((posting) => (
            <Card key={posting.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <CardTitle>{posting.title}</CardTitle>
                      <Badge className={getStatusColor(posting.status)}>
                        {posting.status.charAt(0).toUpperCase() + posting.status.slice(1)}
                      </Badge>
                      <Badge variant="outline">{getTypeLabel(posting.type)}</Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {posting.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {posting.salaryRange}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Posted {posting.postedDate}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleStatus(posting.id)}
                    >
                      {posting.status === 'active' ? 'Pause' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">{posting.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Requirements</h4>
                      <ul className="text-sm space-y-1">
                        {posting.requirements.slice(0, 3).map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{req}</span>
                          </li>
                        ))}
                        {posting.requirements.length > 3 && (
                          <li className="text-muted-foreground">
                            +{posting.requirements.length - 3} more...
                          </li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Responsibilities</h4>
                      <ul className="text-sm space-y-1">
                        {posting.responsibilities.slice(0, 3).map((resp, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{resp}</span>
                          </li>
                        ))}
                        {posting.responsibilities.length > 3 && (
                          <li className="text-muted-foreground">
                            +{posting.responsibilities.length - 3} more...
                          </li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Performance Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Applications:</span>
                          <Badge variant="secondary">{posting.applicationsCount}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Views:</span>
                          <Badge variant="secondary">{posting.viewsCount}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Conversion:</span>
                          <Badge variant="secondary">
                            {((posting.applicationsCount / posting.viewsCount) * 100).toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Career Site Preview */}
        <TabsContent value="preview" className="mt-6">
          <div className="space-y-6">
            {/* Preview Header */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-12 text-center">
                <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
                <p className="text-xl mb-6 opacity-90">
                  Build your career in the exciting world of event staffing
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Globe className="h-5 w-5" />
                  <span>careers.extremestaffing.com</span>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-4">Why Work With Us?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Career Growth</h3>
                    <p className="text-sm text-muted-foreground">
                      Clear advancement paths and professional development opportunities
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Competitive Pay</h3>
                    <p className="text-sm text-muted-foreground">
                      Industry-leading wages with performance bonuses and benefits
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Great Culture</h3>
                    <p className="text-sm text-muted-foreground">
                      Supportive team environment and work-life balance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Open Positions */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Open Positions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobPostings
                  .filter(job => job.status === 'active')
                  .map((posting) => (
                    <Card key={posting.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">{posting.title}</CardTitle>
                            <CardDescription className="mt-2">
                              <div className="flex flex-col gap-1">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {posting.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {posting.salaryRange}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" />
                                  {getTypeLabel(posting.type)}
                                </span>
                              </div>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {posting.description.substring(0, 150)}...
                        </p>
                        <div className="flex items-center gap-2">
                          <Button className="w-full">
                            Apply Now
                          </Button>
                          <Button variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}