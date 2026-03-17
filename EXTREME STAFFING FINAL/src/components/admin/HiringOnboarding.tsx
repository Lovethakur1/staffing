import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Checkbox } from "../ui/checkbox";
import { TimeInput } from "../ui/time-input";
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Calendar,
  Download,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Mail,
  Phone,
  MapPin,
  Star,
  PlusCircle,
  Send,
  Globe,
  Briefcase,
  GraduationCap,
  Building,
  Link,
  ClipboardList,
  Shield,
  DollarSign,
  Shirt,
  Key,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Award,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  skills: string[];
  status: 'pending' | 'reviewing' | 'interview' | 'approved' | 'rejected';
  appliedDate: string;
  resumeUrl?: string;
  coverLetterUrl?: string;
  notes?: string;
  interviewDate?: string;
  rating?: number;
  source: 'company_website' | 'indeed' | 'linkedin' | 'referral' | 'other';
  referredBy?: string;
  location: string;
  availability: string;
  salary_expectation?: string;
  education?: string;
  certifications?: string[];
  backgroundCheckStatus?: 'not_started' | 'in_progress' | 'completed' | 'failed';
  onboardingProgress?: number;
}

interface Contract {
  id: string;
  applicantId: string;
  applicantName: string;
  contractType: string;
  status: 'draft' | 'sent' | 'signed' | 'completed';
  sentDate?: string;
  signedDate?: string;
  hourlyRate: number;
}

interface OnboardingTask {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  required: boolean;
  category: 'documents' | 'background' | 'equipment' | 'access' | 'training';
}

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'seasonal';
  salary_range: string;
  status: 'active' | 'paused' | 'closed';
  posted_date: string;
  applications_count: number;
  description: string;
  requirements: string[];
  responsibilities: string[];
}

export function HiringOnboarding() {
  const [activeTab, setActiveTab] = useState('applications');
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const [isScheduleInterviewOpen, setIsScheduleInterviewOpen] = useState(false);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [isJobPostingDialogOpen, setIsJobPostingDialogOpen] = useState(false);
  const [isOnboardingDialogOpen, setIsOnboardingDialogOpen] = useState(false);
  const [selectedJobPosting, setSelectedJobPosting] = useState<JobPosting | null>(null);

  // Mock job postings data
  const [jobPostings] = useState<JobPosting[]>([
    {
      id: "job-1",
      title: "Event Coordinator",
      department: "Operations",
      location: "New York, NY",
      type: "full-time",
      salary_range: "$45,000 - $55,000",
      status: "active",
      posted_date: "2024-12-15",
      applications_count: 12,
      description: "We are seeking an experienced Event Coordinator to join our dynamic team and help deliver exceptional events for our clients.",
      requirements: [
        "3+ years of event planning experience",
        "Strong organizational and multitasking skills",
        "Excellent communication and interpersonal abilities",
        "Proficiency in event management software",
        "Ability to work flexible hours including evenings and weekends"
      ],
      responsibilities: [
        "Coordinate all aspects of event planning and execution",
        "Manage event timelines and vendor relationships",
        "Lead on-site event setup and breakdown teams",
        "Ensure exceptional client satisfaction",
        "Train and supervise event staff"
      ]
    },
    {
      id: "job-2",
      title: "Bartender",
      department: "Service",
      location: "Multiple Locations",
      type: "part-time",
      salary_range: "$25 - $35/hour + tips",
      status: "active",
      posted_date: "2025-01-02",
      applications_count: 18,
      description: "Join our team of professional bartenders serving premium events. Must have mixology experience and excellent customer service skills.",
      requirements: [
        "5+ years bartending experience",
        "TIPS or equivalent certification",
        "Knowledge of craft cocktails and mixology",
        "Professional appearance and demeanor",
        "Ability to work in fast-paced environments"
      ],
      responsibilities: [
        "Prepare and serve alcoholic and non-alcoholic beverages",
        "Provide exceptional customer service",
        "Maintain clean and organized bar area",
        "Monitor inventory and restock as needed",
        "Follow all safety and compliance regulations"
      ]
    },
    {
      id: "job-3",
      title: "Server",
      department: "Service",
      location: "Multiple Locations",
      type: "part-time",
      salary_range: "$22 - $28/hour + tips",
      status: "active",
      posted_date: "2024-12-20",
      applications_count: 25,
      description: "Experienced servers needed for upscale corporate and social events. Fine dining experience preferred.",
      requirements: [
        "2+ years serving experience",
        "Food handler certification",
        "Knowledge of fine dining service standards",
        "Ability to carry heavy trays",
        "Professional appearance"
      ],
      responsibilities: [
        "Provide attentive table service",
        "Explain menu items and answer questions",
        "Ensure guest satisfaction throughout event",
        "Maintain clean dining areas",
        "Collaborate with kitchen and bar staff"
      ]
    },
    {
      id: "job-4",
      title: "Setup Crew",
      department: "Operations",
      location: "Multiple Locations",
      type: "part-time",
      salary_range: "$20 - $24/hour",
      status: "active",
      posted_date: "2025-01-05",
      applications_count: 8,
      description: "Physical laborers needed for event setup and breakdown. Must be reliable and able to lift heavy equipment.",
      requirements: [
        "Ability to lift 50+ lbs",
        "Reliable transportation",
        "Punctuality and professionalism",
        "Team player attitude",
        "Basic tool knowledge helpful"
      ],
      responsibilities: [
        "Set up tables, chairs, and equipment",
        "Load and unload trucks",
        "Follow setup diagrams and instructions",
        "Break down events after completion",
        "Maintain equipment in good condition"
      ]
    }
  ]);

  // Expanded mock applications data
  const [applications] = useState<Application[]>([
    {
      id: "app-1",
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      position: "Event Coordinator",
      experience: "3 years",
      skills: ["Event Planning", "Customer Service", "Team Leadership", "Budget Management"],
      status: "pending",
      appliedDate: "2025-01-05",
      resumeUrl: "/resume-sarah.pdf",
      notes: "Strong background in corporate events. Previously worked at Marriott Events.",
      source: "company_website",
      location: "New York, NY",
      availability: "Immediate",
      salary_expectation: "$52,000",
      education: "Bachelor's in Hospitality Management",
      certifications: ["CMP - Certified Meeting Professional"],
      backgroundCheckStatus: "not_started"
    },
    {
      id: "app-2",
      name: "Michael Chen",
      email: "m.chen@email.com",
      phone: "+1 (555) 987-6543",
      position: "Bartender",
      experience: "5 years",
      skills: ["Mixology", "Customer Service", "Cash Handling", "Craft Cocktails"],
      status: "interview",
      appliedDate: "2025-01-03",
      interviewDate: "2025-01-12",
      rating: 4,
      notes: "Excellent references from previous employers. Specializes in craft cocktails.",
      source: "linkedin",
      location: "Brooklyn, NY",
      availability: "2 weeks notice",
      salary_expectation: "$30/hour",
      education: "Mixology Certificate",
      certifications: ["TIPS Certified", "ServSafe Alcohol"],
      backgroundCheckStatus: "in_progress"
    },
    {
      id: "app-3",
      name: "Emily Rodriguez",
      email: "emily.r@email.com",
      phone: "+1 (555) 456-7890",
      position: "Server",
      experience: "2 years",
      skills: ["Food Service", "Multitasking", "Communication", "Fine Dining"],
      status: "approved",
      appliedDate: "2025-01-01",
      rating: 5,
      notes: "Outstanding interview performance. Excellent personality for client-facing role.",
      source: "company_website",
      location: "Manhattan, NY",
      availability: "Immediate",
      salary_expectation: "$25/hour",
      education: "High School Diploma",
      certifications: ["Food Handler Certification", "NYC Food Protection"],
      backgroundCheckStatus: "completed",
      onboardingProgress: 45
    },
    {
      id: "app-4",
      name: "David Wilson",
      email: "d.wilson@email.com",
      phone: "+1 (555) 321-0987",
      position: "Setup Crew",
      experience: "1 year",
      skills: ["Physical Labor", "Equipment Setup", "Teamwork", "Time Management"],
      status: "reviewing",
      appliedDate: "2025-01-04",
      notes: "Good attitude, willing to learn. Reliable transportation.",
      source: "indeed",
      location: "Queens, NY",
      availability: "Immediate",
      salary_expectation: "$22/hour",
      education: "High School Diploma",
      backgroundCheckStatus: "not_started"
    },
    {
      id: "app-5",
      name: "Jessica Martinez",
      email: "jessica.martinez@email.com",
      phone: "+1 (555) 234-5678",
      position: "Event Coordinator",
      experience: "5 years",
      skills: ["Event Management", "Vendor Relations", "Client Communication", "Budget Control", "Team Leadership"],
      status: "interview",
      appliedDate: "2024-12-28",
      interviewDate: "2025-01-10",
      rating: 5,
      notes: "Exceptional candidate with extensive event portfolio. Strong references.",
      source: "referral",
      referredBy: "Current Manager - Amy Chen",
      location: "New York, NY",
      availability: "3 weeks notice",
      salary_expectation: "$58,000",
      education: "Master's in Event Management",
      certifications: ["CMP", "CSEP - Certified Special Events Professional"],
      backgroundCheckStatus: "in_progress"
    },
    {
      id: "app-6",
      name: "Robert Taylor",
      email: "r.taylor@email.com",
      phone: "+1 (555) 345-6789",
      position: "Bartender",
      experience: "7 years",
      skills: ["Mixology", "Wine Service", "Customer Relations", "Inventory Management"],
      status: "approved",
      appliedDate: "2024-12-30",
      rating: 4,
      notes: "Experienced bartender with sommelier certification. Great for upscale events.",
      source: "company_website",
      location: "Manhattan, NY",
      availability: "2 weeks notice",
      salary_expectation: "$32/hour",
      education: "Bachelor's in Hospitality",
      certifications: ["Advanced Sommelier", "TIPS", "ServSafe"],
      backgroundCheckStatus: "completed",
      onboardingProgress: 80
    },
    {
      id: "app-7",
      name: "Amanda Brooks",
      email: "amanda.brooks@email.com",
      phone: "+1 (555) 456-7891",
      position: "Server",
      experience: "4 years",
      skills: ["Fine Dining", "Wine Service", "Guest Relations", "Team Collaboration"],
      status: "reviewing",
      appliedDate: "2025-01-06",
      notes: "Worked at multiple Michelin-starred restaurants. Professional demeanor.",
      source: "linkedin",
      location: "Brooklyn, NY",
      availability: "1 week notice",
      salary_expectation: "$27/hour",
      education: "Culinary Arts Degree",
      certifications: ["Food Handler", "Wine Certification Level 2"],
      backgroundCheckStatus: "not_started"
    },
    {
      id: "app-8",
      name: "Carlos Ramirez",
      email: "carlos.r@email.com",
      phone: "+1 (555) 567-8912",
      position: "Setup Crew",
      experience: "3 years",
      skills: ["Equipment Setup", "Technical Skills", "Leadership", "Problem Solving"],
      status: "pending",
      appliedDate: "2025-01-07",
      notes: "Experience with AV equipment. Could potentially lead setup teams.",
      source: "indeed",
      location: "Bronx, NY",
      availability: "Immediate",
      salary_expectation: "$24/hour",
      education: "Technical Certification",
      backgroundCheckStatus: "not_started"
    },
    {
      id: "app-9",
      name: "Lisa Anderson",
      email: "lisa.anderson@email.com",
      phone: "+1 (555) 678-9123",
      position: "Bartender",
      experience: "3 years",
      skills: ["Bartending", "Customer Service", "Event Coordination", "POS Systems"],
      status: "rejected",
      appliedDate: "2024-12-22",
      notes: "Did not meet experience requirements for premium events.",
      source: "other",
      location: "Staten Island, NY",
      availability: "Immediate",
      salary_expectation: "$26/hour",
      education: "High School Diploma",
      backgroundCheckStatus: "not_started"
    },
    {
      id: "app-10",
      name: "James Cooper",
      email: "james.cooper@email.com",
      phone: "+1 (555) 789-0124",
      position: "Server",
      experience: "6 years",
      skills: ["Fine Dining", "Banquet Service", "Training", "Quality Control"],
      status: "interview",
      appliedDate: "2024-12-18",
      interviewDate: "2025-01-09",
      notes: "Could be potential team lead. Extensive banquet experience.",
      source: "referral",
      referredBy: "Current Staff - Maria Santos",
      location: "Manhattan, NY",
      availability: "Immediate",
      salary_expectation: "$29/hour",
      education: "Associate's in Hospitality",
      certifications: ["Food Safety Manager", "ServSafe"],
      backgroundCheckStatus: "not_started"
    }
  ]);

  // Mock contracts data
  const [contracts] = useState<Contract[]>([
    {
      id: "contract-1",
      applicantId: "app-3",
      applicantName: "Emily Rodriguez",
      contractType: "Part-time Server Agreement",
      status: "signed",
      sentDate: "2025-01-02",
      signedDate: "2025-01-03",
      hourlyRate: 24
    },
    {
      id: "contract-2",
      applicantId: "app-2",
      applicantName: "Michael Chen",
      contractType: "Bartender Service Agreement",
      status: "sent",
      sentDate: "2025-01-06",
      hourlyRate: 28
    },
    {
      id: "contract-3",
      applicantId: "app-6",
      applicantName: "Robert Taylor",
      contractType: "Premium Bartender Agreement",
      status: "signed",
      sentDate: "2025-01-04",
      signedDate: "2025-01-05",
      hourlyRate: 32
    },
    {
      id: "contract-4",
      applicantId: "app-5",
      applicantName: "Jessica Martinez",
      contractType: "Event Coordinator - Full Time",
      status: "draft",
      hourlyRate: 28
    }
  ]);

  // Mock onboarding tasks
  const [onboardingTasks] = useState<OnboardingTask[]>([
    {
      id: "task-1",
      name: "I-9 Employment Eligibility Verification",
      description: "Complete Section 1 and provide required identification documents",
      completed: true,
      required: true,
      category: "documents"
    },
    {
      id: "task-2",
      name: "W-4 Tax Withholding Form",
      description: "Complete federal tax withholding information",
      completed: true,
      required: true,
      category: "documents"
    },
    {
      id: "task-3",
      name: "Direct Deposit Authorization",
      description: "Provide bank account information for payroll",
      completed: false,
      required: true,
      category: "documents"
    },
    {
      id: "task-4",
      name: "Emergency Contact Information",
      description: "Provide emergency contact details",
      completed: true,
      required: true,
      category: "documents"
    },
    {
      id: "task-5",
      name: "Background Check",
      description: "Criminal background check completion",
      completed: true,
      required: true,
      category: "background"
    },
    {
      id: "task-6",
      name: "Reference Verification",
      description: "Verify employment references",
      completed: false,
      required: true,
      category: "background"
    },
    {
      id: "task-7",
      name: "Uniform Assignment",
      description: "Receive and sign for uniform items",
      completed: false,
      required: true,
      category: "equipment"
    },
    {
      id: "task-8",
      name: "Equipment Training",
      description: "Complete training on POS systems and equipment",
      completed: false,
      required: false,
      category: "equipment"
    },
    {
      id: "task-9",
      name: "System Access Setup",
      description: "Create employee portal login credentials",
      completed: false,
      required: true,
      category: "access"
    },
    {
      id: "task-10",
      name: "Email Account Setup",
      description: "Set up company email account",
      completed: false,
      required: false,
      category: "access"
    },
    {
      id: "task-11",
      name: "Safety & Compliance Training",
      description: "Complete OSHA safety training module",
      completed: false,
      required: true,
      category: "training"
    },
    {
      id: "task-12",
      name: "Customer Service Training",
      description: "Complete customer service excellence course",
      completed: false,
      required: true,
      category: "training"
    },
    {
      id: "task-13",
      name: "Event Procedures Training",
      description: "Learn company event protocols and procedures",
      completed: false,
      required: true,
      category: "training"
    },
    {
      id: "task-14",
      name: "Sexual Harassment Prevention",
      description: "Complete mandatory harassment prevention training",
      completed: false,
      required: true,
      category: "training"
    }
  ]);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesSource = sourceFilter === "all" || app.source === sourceFilter;
    const matchesPosition = positionFilter === "all" || app.position === positionFilter;
    return matchesSearch && matchesStatus && matchesSource && matchesPosition;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'reviewing': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'interview': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      case 'draft': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'sent': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'signed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'completed': return 'bg-primary/10 text-primary border-primary/20';
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'paused': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'closed': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'reviewing': return <Eye className="h-4 w-4" />;
      case 'interview': return <Calendar className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'company_website': return <Globe className="h-4 w-4" />;
      case 'linkedin': return <Link className="h-4 w-4" />;
      case 'indeed': return <Briefcase className="h-4 w-4" />;
      case 'referral': return <Users className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getBackgroundCheckColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'failed': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleStatusUpdate = (applicationId: string, newStatus: string) => {
    toast.success(`Application status updated to ${newStatus}!`);
  };

  const handleScheduleInterview = () => {
    toast.success("Interview scheduled successfully!");
    setIsScheduleInterviewOpen(false);
  };

  const handleSendContract = () => {
    toast.success("Contract sent successfully!");
    setIsContractDialogOpen(false);
  };

  const handleCreateJobPosting = () => {
    toast.success("Job posting created and published!");
    setIsJobPostingDialogOpen(false);
  };

  const getApplicationStats = () => {
    return {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      reviewing: applications.filter(a => a.status === 'reviewing').length,
      interviews: applications.filter(a => a.status === 'interview').length,
      approved: applications.filter(a => a.status === 'approved').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
    };
  };

  const getSourceStats = () => {
    return {
      company_website: applications.filter(a => a.source === 'company_website').length,
      linkedin: applications.filter(a => a.source === 'linkedin').length,
      indeed: applications.filter(a => a.source === 'indeed').length,
      referral: applications.filter(a => a.source === 'referral').length,
      other: applications.filter(a => a.source === 'other').length,
    };
  };

  const stats = getApplicationStats();
  const sourceStats = getSourceStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl text-foreground">Hiring & Onboarding</h2>
          <p className="text-muted-foreground">
            Manage job postings, applications, interviews, and onboarding workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Dialog open={isJobPostingDialogOpen} onOpenChange={setIsJobPostingDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Post New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Job Posting</DialogTitle>
                <DialogDescription>
                  Create a new job posting that will appear on your company careers page
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Job Title *</Label>
                    <Input placeholder="e.g., Event Coordinator" />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="admin">Administration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Location *</Label>
                    <Input placeholder="e.g., New York, NY" />
                  </div>
                  <div className="space-y-2">
                    <Label>Employment Type *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="seasonal">Seasonal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Salary Range</Label>
                  <Input placeholder="e.g., $45,000 - $55,000 or $25 - $35/hour" />
                </div>

                <div className="space-y-2">
                  <Label>Job Description *</Label>
                  <Textarea 
                    placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Requirements</Label>
                  <Textarea 
                    placeholder="List required skills, experience, certifications... (one per line)"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Responsibilities</Label>
                  <Textarea 
                    placeholder="List key responsibilities... (one per line)"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsJobPostingDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="outline">
                    Save as Draft
                  </Button>
                  <Button onClick={handleCreateJobPosting}>
                    <Send className="h-4 w-4 mr-2" />
                    Publish Job
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Interviews</p>
                <p className="text-2xl">{stats.interviews}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Website Apps</p>
                <p className="text-2xl">{sourceStats.company_website}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Referrals</p>
                <p className="text-2xl">{sourceStats.referral}</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="career-site">Career Site</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="company_website">Website</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="indeed">Indeed</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="Event Coordinator">Event Coordinator</SelectItem>
                <SelectItem value="Bartender">Bartender</SelectItem>
                <SelectItem value="Server">Server</SelectItem>
                <SelectItem value="Setup Crew">Setup Crew</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Job Applications ({filteredApplications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Background</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm text-primary">
                                {application.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{application.name}</p>
                              <p className="text-sm text-muted-foreground">{application.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>{application.position}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getSourceIcon(application.source)}
                            <span className="text-sm capitalize">
                              {application.source.replace('_', ' ')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{application.experience}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(application.status)}
                            <Badge className={getStatusColor(application.status)}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getBackgroundCheckColor(application.backgroundCheckStatus)}>
                            {application.backgroundCheckStatus?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{application.appliedDate}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedApplication(application);
                                setIsApplicationDialogOpen(true);
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            {application.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedApplication(application);
                                  setIsScheduleInterviewOpen(true);
                                }}
                              >
                                <Calendar className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Career Site Tab */}
        <TabsContent value="career-site" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg text-foreground">Career Site Preview</h3>
              <p className="text-sm text-muted-foreground">
                This is what candidates see when they visit your careers page
              </p>
            </div>
            <Button variant="outline">
              <Globe className="h-4 w-4 mr-2" />
              View Live Site
            </Button>
          </div>

          {/* Job Postings */}
          <div className="grid grid-cols-1 gap-6">
            {jobPostings.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle>{job.title}</CardTitle>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {job.department}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {job.type}
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          {job.salary_range}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {job.applications_count} applicants
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedJobPosting(job);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">About the Role</h4>
                      <p className="text-sm text-muted-foreground">{job.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Requirements
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {job.requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <ClipboardList className="h-4 w-4" />
                          Responsibilities
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {job.responsibilities.map((resp, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <p className="text-sm text-muted-foreground">Posted on {job.posted_date}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit Posting
                        </Button>
                        <Button size="sm">
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Application Form Preview */}
          <Card className="border-2 border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Application Form Preview
              </CardTitle>
              <CardDescription>
                This is the form candidates fill out when applying through your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 p-6 bg-muted/30 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input placeholder="John Doe" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address *</Label>
                    <Input type="email" placeholder="john.doe@email.com" disabled />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <Input placeholder="+1 (555) 123-4567" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Position Applying For *</Label>
                    <Select disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Years of Experience *</Label>
                    <Input placeholder="e.g., 5 years" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Location *</Label>
                    <Input placeholder="City, State" disabled />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Resume/CV Upload *</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cover Letter (Optional)</Label>
                  <Textarea placeholder="Tell us why you'd be a great fit..." disabled className="min-h-[100px]" />
                </div>

                <div className="space-y-2">
                  <Label>How did you hear about us?</Label>
                  <Select disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Company Website</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="indeed">Indeed</SelectItem>
                      <SelectItem value="referral">Employee Referral</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button disabled className="w-full">Submit Application</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interviews Tab */}
        <TabsContent value="interviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduled Interviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.filter(app => app.status === 'interview').map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary">
                          {application.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">{application.name}</h4>
                        <p className="text-sm text-muted-foreground">{application.position}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {application.interviewDate}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {application.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {application.rating && (
                        <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 rounded-full">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm">{application.rating}/5</span>
                        </div>
                      )}
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Reschedule
                      </Button>
                      <Button size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}

                {applications.filter(app => app.status === 'interview').length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No scheduled interviews</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Interview Evaluation Template */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Interview Evaluation Template
              </CardTitle>
              <CardDescription>
                Standard evaluation criteria for candidate interviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Evaluation Criteria</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Professional Appearance</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4 text-muted-foreground" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Communication Skills</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4 text-muted-foreground" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Relevant Experience</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4 text-muted-foreground" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Additional Factors</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Cultural Fit</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4 text-muted-foreground" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Enthusiasm & Motivation</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4 text-muted-foreground" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Availability & Flexibility</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4 text-muted-foreground" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Interview Notes</Label>
                  <Textarea 
                    placeholder="Record key observations, strengths, concerns, and overall impressions..."
                    className="min-h-[100px]"
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onboarding Tab */}
        <TabsContent value="onboarding" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg text-foreground">Onboarding Pipeline</h3>
              <p className="text-sm text-muted-foreground">
                Track new hire onboarding progress and completion
              </p>
            </div>
            <Dialog open={isOnboardingDialogOpen} onOpenChange={setIsOnboardingDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Start Onboarding
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Start New Employee Onboarding</DialogTitle>
                  <DialogDescription>
                    Select an approved candidate to begin the onboarding process
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Select Employee</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose approved candidate" />
                      </SelectTrigger>
                      <SelectContent>
                        {applications
                          .filter(app => app.status === 'approved')
                          .map(app => (
                            <SelectItem key={app.id} value={app.id}>
                              {app.name} - {app.position}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsOnboardingDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      toast.success("Onboarding process initiated!");
                      setIsOnboardingDialogOpen(false);
                    }}>
                      Start Onboarding
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Active Onboarding */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {applications
              .filter(app => app.onboardingProgress !== undefined)
              .map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary">
                            {application.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-base">{application.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{application.position}</p>
                        </div>
                      </div>
                      <Badge className={application.onboardingProgress === 100 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}>
                        {application.onboardingProgress}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Overall Progress</span>
                          <span className="font-medium">{application.onboardingProgress}% Complete</span>
                        </div>
                        <Progress value={application.onboardingProgress} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button size="sm">
                          Update Progress
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Onboarding Checklist Template */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Standard Onboarding Checklist
              </CardTitle>
              <CardDescription>
                Complete all required tasks for new employee onboarding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="documents" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="background">Background</TabsTrigger>
                  <TabsTrigger value="equipment">Equipment</TabsTrigger>
                  <TabsTrigger value="access">Access</TabsTrigger>
                  <TabsTrigger value="training">Training</TabsTrigger>
                </TabsList>

                {['documents', 'background', 'equipment', 'access', 'training'].map((category) => (
                  <TabsContent key={category} value={category} className="space-y-3">
                    {onboardingTasks
                      .filter(task => task.category === category)
                      .map((task) => (
                        <div key={task.id} className="flex items-start gap-3 p-4 border rounded-lg">
                          <Checkbox checked={task.completed} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{task.name}</p>
                              {task.required && (
                                <Badge variant="outline" className="text-xs">Required</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          </div>
                          {task.completed && (
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                          )}
                        </div>
                      ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg text-foreground">Digital Contracts</h3>
              <p className="text-sm text-muted-foreground">
                Manage employment contracts and digital signatures
              </p>
            </div>
            <Dialog open={isContractDialogOpen} onOpenChange={setIsContractDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Contract
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Employment Contract</DialogTitle>
                  <DialogDescription>
                    Generate a digital contract for approved applicants
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Select Applicant</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose approved applicant" />
                        </SelectTrigger>
                        <SelectContent>
                          {applications
                            .filter(app => app.status === 'approved')
                            .map(app => (
                              <SelectItem key={app.id} value={app.id}>
                                {app.name} - {app.position}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Contract Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contract type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="part-time">Part-time Agreement</SelectItem>
                          <SelectItem value="full-time">Full-time Agreement</SelectItem>
                          <SelectItem value="contractor">Independent Contractor</SelectItem>
                          <SelectItem value="seasonal">Seasonal Employment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Hourly Rate ($)</Label>
                      <Input type="number" placeholder="25.00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Contract Terms</Label>
                    <Textarea 
                      placeholder="Enter specific terms, conditions, and requirements..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsContractDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSendContract}>
                      <Send className="h-4 w-4 mr-2" />
                      Send Contract
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Contract Type</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent Date</TableHead>
                      <TableHead>Signed Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell>
                          <div className="font-medium">{contract.applicantName}</div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{contract.contractType}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">${contract.hourlyRate}/hr</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(contract.status)}>
                            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{contract.sentDate || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{contract.signedDate || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            {contract.status === 'draft' && (
                              <Button size="sm">
                                <Send className="h-3 w-3" />
                              </Button>
                            )}
                            {contract.status === 'signed' && (
                              <Button size="sm" variant="outline">
                                <Download className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Application Details Dialog */}
      <Dialog open={isApplicationDialogOpen} onOpenChange={setIsApplicationDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-3">Personal Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedApplication.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedApplication.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedApplication.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedApplication.location}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Position & Experience</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Position:</span> {selectedApplication.position}</p>
                      <p><span className="font-medium">Experience:</span> {selectedApplication.experience}</p>
                      <p><span className="font-medium">Availability:</span> {selectedApplication.availability}</p>
                      {selectedApplication.salary_expectation && (
                        <p><span className="font-medium">Salary:</span> {selectedApplication.salary_expectation}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Education</h3>
                    <p className="text-sm">{selectedApplication.education}</p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Skills</h3>
                    <div className="flex gap-2 flex-wrap">
                      {selectedApplication.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {selectedApplication.certifications && selectedApplication.certifications.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Certifications
                      </h3>
                      <div className="flex gap-2 flex-wrap">
                        {selectedApplication.certifications.map((cert) => (
                          <Badge key={cert} className="bg-blue-50 text-blue-700 border-blue-200">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-3">Application Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedApplication.status)}
                        <Badge className={getStatusColor(selectedApplication.status)}>
                          {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Update Status</Label>
                        <Select 
                          defaultValue={selectedApplication.status}
                          onValueChange={(value) => handleStatusUpdate(selectedApplication.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewing">Reviewing</SelectItem>
                            <SelectItem value="interview">Interview</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Application Source</h3>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      {getSourceIcon(selectedApplication.source)}
                      <span className="text-sm capitalize">
                        {selectedApplication.source.replace('_', ' ')}
                      </span>
                    </div>
                    {selectedApplication.referredBy && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Referred by: {selectedApplication.referredBy}
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Background Check
                    </h3>
                    <Badge className={getBackgroundCheckColor(selectedApplication.backgroundCheckStatus)}>
                      {selectedApplication.backgroundCheckStatus?.replace('_', ' ')}
                    </Badge>
                  </div>

                  {selectedApplication.rating && (
                    <div>
                      <h3 className="font-medium mb-3">Interview Rating</h3>
                      <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{selectedApplication.rating}/5</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium mb-3">Documents</h3>
                    <div className="space-y-2">
                      {selectedApplication.resumeUrl && (
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <FileText className="h-4 w-4 mr-2" />
                          Download Resume
                        </Button>
                      )}
                      {selectedApplication.coverLetterUrl && (
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <FileText className="h-4 w-4 mr-2" />
                          Download Cover Letter
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {selectedApplication.notes && (
                <div>
                  <h3 className="font-medium mb-3">Notes</h3>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{selectedApplication.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsScheduleInterviewOpen(true);
                      setIsApplicationDialogOpen(false);
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Interview
                  </Button>
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </div>
                <Button onClick={() => setIsApplicationDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Interview Dialog */}
      <Dialog open={isScheduleInterviewOpen} onOpenChange={setIsScheduleInterviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Applicant</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedApplication?.name} - {selectedApplication?.position}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <TimeInput />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Interview Type</Label>
              <Select defaultValue="video">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="in-person">In Person</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea placeholder="Interview notes or special instructions..." />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsScheduleInterviewOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleScheduleInterview}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
