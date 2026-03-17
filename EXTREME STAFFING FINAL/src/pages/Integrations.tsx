import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Zap,
  Search,
  Check,
  X,
  Settings,
  Download,
  Upload,
  Calendar,
  DollarSign,
  MessageSquare,
  Mail,
  FileText,
  Users,
  Database,
  Cloud,
  Globe,
  Lock,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface IntegrationsProps {
  userRole: string;
  userId: string;
}

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any;
  status: 'active' | 'inactive' | 'available';
  lastSync?: string;
  features: string[];
}

export function Integrations({ userRole }: IntegrationsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const integrations: Integration[] = [
    {
      id: "quickbooks",
      name: "QuickBooks Online",
      category: "accounting",
      description: "Sync invoices, expenses, and financial data automatically",
      icon: DollarSign,
      status: "active",
      lastSync: "2 minutes ago",
      features: ["Invoice Sync", "Expense Tracking", "Payroll Integration"]
    },
    {
      id: "xero",
      name: "Xero",
      category: "accounting",
      description: "Cloud-based accounting software integration",
      icon: Cloud,
      status: "available",
      features: ["Bank Reconciliation", "Invoice Management", "Financial Reports"]
    },
    {
      id: "adp",
      name: "ADP Workforce",
      category: "payroll",
      description: "Automated payroll processing and tax compliance",
      icon: Users,
      status: "active",
      lastSync: "1 hour ago",
      features: ["Payroll Automation", "Tax Filing", "Benefits Management"]
    },
    {
      id: "gusto",
      name: "Gusto",
      category: "payroll",
      description: "Modern payroll, benefits, and HR platform",
      icon: TrendingUp,
      status: "available",
      features: ["Payroll", "Benefits", "HR Tools"]
    },
    {
      id: "google-calendar",
      name: "Google Calendar",
      category: "calendar",
      description: "Sync event schedules with Google Calendar",
      icon: Calendar,
      status: "active",
      lastSync: "5 minutes ago",
      features: ["Event Sync", "Reminders", "Team Calendars"]
    },
    {
      id: "outlook",
      name: "Microsoft Outlook",
      category: "calendar",
      description: "Integrate with Outlook calendar and email",
      icon: Mail,
      status: "inactive",
      features: ["Calendar Sync", "Email Integration", "Meeting Scheduling"]
    },
    {
      id: "slack",
      name: "Slack",
      category: "communication",
      description: "Team communication and notifications",
      icon: MessageSquare,
      status: "active",
      lastSync: "Just now",
      features: ["Notifications", "Team Chat", "File Sharing"]
    },
    {
      id: "teams",
      name: "Microsoft Teams",
      category: "communication",
      description: "Collaboration and video conferencing",
      icon: Users,
      status: "available",
      features: ["Video Calls", "Chat", "File Collaboration"]
    },
    {
      id: "zapier",
      name: "Zapier",
      category: "automation",
      description: "Connect with 5,000+ apps via automated workflows",
      icon: Zap,
      status: "active",
      lastSync: "30 minutes ago",
      features: ["Workflow Automation", "Multi-app Integration", "Custom Triggers"]
    },
    {
      id: "google-drive",
      name: "Google Drive",
      category: "storage",
      description: "Cloud storage for documents and files",
      icon: Cloud,
      status: "active",
      lastSync: "10 minutes ago",
      features: ["File Storage", "Document Sharing", "Real-time Collaboration"]
    },
    {
      id: "dropbox",
      name: "Dropbox",
      category: "storage",
      description: "Secure file storage and sharing",
      icon: Database,
      status: "inactive",
      features: ["File Sync", "Team Folders", "Version History"]
    },
    {
      id: "docusign",
      name: "DocuSign",
      category: "documents",
      description: "Electronic signature and document management",
      icon: FileText,
      status: "available",
      features: ["E-Signatures", "Document Templates", "Audit Trail"]
    }
  ];

  const categories = [
    { id: "all", name: "All Integrations" },
    { id: "accounting", name: "Accounting" },
    { id: "payroll", name: "Payroll" },
    { id: "calendar", name: "Calendar" },
    { id: "communication", name: "Communication" },
    { id: "automation", name: "Automation" },
    { id: "storage", name: "Storage" },
    { id: "documents", name: "Documents" }
  ];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleIntegration = (integrationId: string, currentStatus: string) => {
    if (currentStatus === "available") {
      toast.success("Integration connected successfully!");
    } else if (currentStatus === "active") {
      toast.info("Integration disconnected");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>;
      case "available":
        return <Badge className="bg-blue-100 text-blue-700">Available</Badge>;
      default:
        return null;
    }
  };

  const stats = {
    active: integrations.filter(i => i.status === "active").length,
    available: integrations.filter(i => i.status === "available").length,
    total: integrations.length
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-[#5E1916]">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your favorite tools and automate your workflow
          </p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Integration Settings
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Integrations</p>
                <p className="text-2xl font-bold text-[#5E1916]">{stats.active}</p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-[#5E1916]">{stats.available}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Available</p>
                <p className="text-2xl font-bold text-[#5E1916]">{stats.total}</p>
              </div>
              <Globe className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full grid grid-cols-4 md:grid-cols-8 lg:flex lg:w-auto">
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIntegrations.map(integration => (
              <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <integration.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        {getStatusBadge(integration.status)}
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {integration.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Features */}
                    <div>
                      <p className="text-sm font-medium mb-2">Features:</p>
                      <div className="space-y-1">
                        {integration.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-3 w-3 text-green-600" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Last Sync */}
                    {integration.lastSync && (
                      <p className="text-xs text-muted-foreground">
                        Last synced: {integration.lastSync}
                      </p>
                    )}

                    {/* Action Button */}
                    <div className="flex gap-2">
                      {integration.status === "available" && (
                        <Button 
                          className="w-full"
                          onClick={() => handleToggleIntegration(integration.id, integration.status)}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                      {integration.status === "active" && (
                        <>
                          <Button variant="outline" className="flex-1">
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                          <Button 
                            variant="destructive" 
                            className="flex-1"
                            onClick={() => handleToggleIntegration(integration.id, integration.status)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Disconnect
                          </Button>
                        </>
                      )}
                      {integration.status === "inactive" && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleToggleIntegration(integration.id, "available")}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Reconnect
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredIntegrations.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No integrations found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* API Access Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            API Access
          </CardTitle>
          <CardDescription>
            Build custom integrations using our REST API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">API Documentation</p>
              <p className="text-sm text-muted-foreground">View complete API reference and guides</p>
            </div>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              View Docs
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Webhooks</p>
              <p className="text-sm text-muted-foreground">Configure webhooks for real-time updates</p>
            </div>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
