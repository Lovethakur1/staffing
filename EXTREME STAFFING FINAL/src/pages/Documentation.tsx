import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  BookOpen,
  Search,
  FileText,
  Code,
  Zap,
  Users,
  DollarSign,
  Calendar,
  Settings,
  Download,
  ExternalLink,
  ChevronRight,
  Book,
  Video,
  FileCode,
  Shield,
  TrendingUp
} from "lucide-react";

interface DocumentationProps {
  userRole: string;
  userId: string;
  onNavigate: (page: string) => void;
}

export function Documentation({ userRole, onNavigate }: DocumentationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("user-guides");

  const userGuides = [
    {
      title: "Getting Started Guide",
      description: "Complete guide to set up your account and start using the platform",
      icon: BookOpen,
      pages: 12,
      lastUpdated: "2024-11-10",
      category: "Getting Started"
    },
    {
      title: "Event Management",
      description: "Learn how to create, manage, and track events",
      icon: Calendar,
      pages: 18,
      lastUpdated: "2024-11-12",
      category: "Core Features"
    },
    {
      title: "Staff & Workforce Management",
      description: "Complete guide to managing your staff and workforce",
      icon: Users,
      pages: 24,
      lastUpdated: "2024-11-08",
      category: "Core Features"
    },
    {
      title: "Scheduling & Dispatch",
      description: "Master the scheduling system and dispatch operations",
      icon: Calendar,
      pages: 20,
      lastUpdated: "2024-11-14",
      category: "Core Features"
    },
    {
      title: "Payroll Processing",
      description: "Step-by-step guide to payroll processing and management",
      icon: DollarSign,
      pages: 16,
      lastUpdated: "2024-11-09",
      category: "Financial"
    },
    {
      title: "Financial Management",
      description: "Complete financial management and reporting guide",
      icon: TrendingUp,
      pages: 22,
      lastUpdated: "2024-11-11",
      category: "Financial"
    },
    {
      title: "System Settings & Configuration",
      description: "Configure your system settings and preferences",
      icon: Settings,
      pages: 14,
      lastUpdated: "2024-11-07",
      category: "Administration"
    },
    {
      title: "Security & Permissions",
      description: "Manage security settings and user permissions",
      icon: Shield,
      pages: 10,
      lastUpdated: "2024-11-13",
      category: "Administration"
    }
  ];

  const apiDocs = [
    {
      title: "API Overview",
      description: "Introduction to the Extreme Staffing API",
      endpoint: "Overview",
      method: "INFO"
    },
    {
      title: "Authentication",
      description: "API authentication using OAuth 2.0",
      endpoint: "/auth/token",
      method: "POST"
    },
    {
      title: "Events API",
      description: "Create, read, update, and delete events",
      endpoint: "/api/v1/events",
      method: "GET/POST/PUT/DELETE"
    },
    {
      title: "Staff API",
      description: "Manage staff members and their information",
      endpoint: "/api/v1/staff",
      method: "GET/POST/PUT/DELETE"
    },
    {
      title: "Scheduling API",
      description: "Manage schedules and assignments",
      endpoint: "/api/v1/schedules",
      method: "GET/POST/PUT"
    },
    {
      title: "Timesheets API",
      description: "Submit and retrieve timesheet data",
      endpoint: "/api/v1/timesheets",
      method: "GET/POST"
    },
    {
      title: "Payroll API",
      description: "Access payroll information",
      endpoint: "/api/v1/payroll",
      method: "GET"
    },
    {
      title: "Webhooks",
      description: "Set up webhooks for real-time updates",
      endpoint: "/api/v1/webhooks",
      method: "POST"
    }
  ];

  const videoTutorials = [
    {
      title: "Platform Overview - Getting Started",
      duration: "15:30",
      views: 3421,
      category: "Getting Started"
    },
    {
      title: "Creating and Managing Events",
      duration: "22:45",
      views: 2156,
      category: "Events"
    },
    {
      title: "Staff Management Best Practices",
      duration: "18:20",
      views: 1987,
      category: "Staff"
    },
    {
      title: "Automated Scheduling Workflow",
      duration: "25:10",
      views: 2543,
      category: "Scheduling"
    },
    {
      title: "Payroll Processing Step-by-Step",
      duration: "20:15",
      views: 1876,
      category: "Payroll"
    },
    {
      title: "Financial Reporting & Analytics",
      duration: "17:40",
      views: 1654,
      category: "Financial"
    }
  ];

  const policyDocs = [
    {
      title: "Terms of Service",
      description: "Platform terms and conditions",
      icon: FileText,
      lastUpdated: "2024-10-01"
    },
    {
      title: "Privacy Policy",
      description: "How we handle your data",
      icon: Shield,
      lastUpdated: "2024-10-01"
    },
    {
      title: "Security Policy",
      description: "Our security practices and protocols",
      icon: Shield,
      lastUpdated: "2024-10-15"
    },
    {
      title: "Data Processing Agreement",
      description: "GDPR and data protection compliance",
      icon: FileText,
      lastUpdated: "2024-10-01"
    }
  ];

  const filteredUserGuides = userGuides.filter(guide =>
    guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApiDocs = apiDocs.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      'GET': 'bg-blue-100 text-blue-700',
      'POST': 'bg-green-100 text-green-700',
      'PUT': 'bg-yellow-100 text-yellow-700',
      'DELETE': 'bg-red-100 text-red-700',
      'INFO': 'bg-purple-100 text-purple-700',
      'GET/POST/PUT/DELETE': 'bg-gray-100 text-gray-700',
      'GET/POST/PUT': 'bg-gray-100 text-gray-700',
      'GET/POST': 'bg-gray-100 text-gray-700'
    };

    return <Badge className={colors[method] || 'bg-gray-100 text-gray-700'}>{method}</Badge>;
  };

  const getGuideRoute = (title: string): string | null => {
    const routes: Record<string, string> = {
      'Getting Started Guide': 'getting-started-guide',
      'Event Management': 'event-management-guide',
      'Payroll Processing': 'payroll-processing-guide'
    };
    return routes[title] || null;
  };

  const getPolicyRoute = (title: string): string | null => {
    const routes: Record<string, string> = {
      'Terms of Service': 'terms-of-service',
      'Privacy Policy': 'privacy-policy'
    };
    return routes[title] || null;
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-[#5E1916]">Documentation</h1>
          <p className="text-muted-foreground">
            Comprehensive guides, API references, and tutorials
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="user-guides">
            <BookOpen className="h-4 w-4 mr-2" />
            User Guides
          </TabsTrigger>
          <TabsTrigger value="api">
            <Code className="h-4 w-4 mr-2" />
            API Reference
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Video className="h-4 w-4 mr-2" />
            Video Tutorials
          </TabsTrigger>
          <TabsTrigger value="policies">
            <Shield className="h-4 w-4 mr-2" />
            Policies
          </TabsTrigger>
        </TabsList>

        {/* User Guides Tab */}
        <TabsContent value="user-guides" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUserGuides.map((guide, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <guide.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-2 text-xs">
                          {guide.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-base mt-2">{guide.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {guide.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span>{guide.pages} pages</span>
                    <span>Updated {guide.lastUpdated}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const route = getGuideRoute(guide.title);
                      if (route) {
                        onNavigate(route);
                      }
                    }}
                  >
                    Read Guide
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUserGuides.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No guides found matching your search</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* API Reference Tab */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>REST API Documentation</CardTitle>
              <CardDescription>
                Complete API reference for integrating with Extreme Staffing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredApiDocs.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{doc.title}</h4>
                      {getMethodBadge(doc.method)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{doc.endpoint}</code>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Code Example */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                Quick Start Example
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre>{`// Initialize API client
const client = new ExtremeStaffingAPI({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.extremestaffing.com/v1'
});

// Fetch events
const events = await client.events.list({
  status: 'upcoming',
  limit: 10
});

// Create a new event
const newEvent = await client.events.create({
  title: 'Corporate Gala',
  date: '2024-12-15',
  venue: 'Grand Hotel',
  staffRequired: 20
});`}</pre>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline">
                  <Code className="h-4 w-4 mr-2" />
                  View Full Docs
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download SDK
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Tutorials Tab */}
        <TabsContent value="videos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videoTutorials.map((video, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <Badge variant="outline" className="mb-2">
                    {video.category}
                  </Badge>
                  <h4 className="font-semibold mb-2">{video.title}</h4>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{video.duration}</span>
                    <span>{video.views.toLocaleString()} views</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policyDocs.map((policy, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <policy.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base mb-2">{policy.title}</CardTitle>
                      <CardDescription>{policy.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Updated {policy.lastUpdated}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const route = getPolicyRoute(policy.title);
                        if (route) {
                          onNavigate(route);
                        }
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button variant="outline" className="justify-start">
              <Zap className="h-4 w-4 mr-2" />
              API Status & Uptime
            </Button>
            <Button variant="outline" className="justify-start">
              <Book className="h-4 w-4 mr-2" />
              Release Notes
            </Button>
            <Button variant="outline" className="justify-start">
              <ExternalLink className="h-4 w-4 mr-2" />
              Developer Community
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}