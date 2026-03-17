import { useState } from "react";
import { UnifiedChatSystem } from "../components/communication/UnifiedChatSystem";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import {
  AlertTriangle,
  MessageSquare,
  Clock,
  CheckCircle2,
  Phone,
  Video,
  FileText,
  Bell,
  Headphones,
  Send,
} from "lucide-react";

interface MessagesProps {
  userRole: string;
  userId: string;
}

export function Messages({ userRole, userId }: MessagesProps) {
  const [activeTab, setActiveTab] = useState("messages");

  // Get user name based on role and ID
  const getUserName = () => {
    if (userRole === 'admin') return 'Admin User';
    if (userRole === 'manager') return 'Manager User';
    if (userRole === 'client') return 'Client User';
    if (userRole === 'staff') return 'Staff User';
    return 'User';
  };

  // Quick escalation stats for managers
  const escalationStats = [
    {
      level: "Critical",
      count: 1,
      color: "red",
      icon: AlertTriangle,
      responseTime: "15 min",
    },
    {
      level: "High",
      count: 3,
      color: "orange",
      icon: Clock,
      responseTime: "1 hour",
    },
    {
      level: "Medium",
      count: 5,
      color: "yellow",
      icon: MessageSquare,
      responseTime: "4 hours",
    },
    {
      level: "Resolved",
      count: 24,
      color: "green",
      icon: CheckCircle2,
      responseTime: "N/A",
    },
  ];

  // Recent escalations for managers
  const recentEscalations = [
    {
      id: "ESC-001",
      priority: "Critical",
      subject: "Staff No-Show at Corporate Gala",
      event: "Corporate Gala - Tech Summit",
      submittedBy: "Sarah Mitchell",
      submittedAt: "2 hours ago",
      status: "In Progress",
      description: "Server Michael Chen did not show up for shift. Need immediate replacement.",
    },
    {
      id: "ESC-002",
      priority: "High",
      subject: "Equipment Malfunction",
      event: "Wedding Reception",
      submittedBy: "Sarah Mitchell",
      submittedAt: "5 hours ago",
      status: "Pending Admin Response",
      description: "AV equipment failed. Client is upset. Need admin support for replacement.",
    },
    {
      id: "ESC-003",
      priority: "Medium",
      subject: "Additional Staff Request",
      event: "Product Launch",
      submittedBy: "Sarah Mitchell",
      submittedAt: "1 day ago",
      status: "Resolved",
      description: "Client requested 2 additional servers. Admin approved and assigned staff.",
    },
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Critical":
        return <Badge className="bg-red-100 text-red-700">Critical</Badge>;
      case "High":
        return <Badge className="bg-orange-100 text-orange-700">High</Badge>;
      case "Medium":
        return <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Resolved":
        return <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />Resolved</Badge>;
      case "In Progress":
        return <Badge className="bg-blue-100 text-blue-700"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case "Pending Admin Response":
        return <Badge className="bg-orange-100 text-orange-700"><AlertTriangle className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Show unified chat for all users, with manager escalation tab for managers only
  if (userRole !== 'manager') {
    return (
      <div className="h-full">
        <UnifiedChatSystem 
          userRole={userRole} 
          userId={userId}
          userName={getUserName()}
        />
      </div>
    );
  }

  // Manager view with tabs
  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b bg-background">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="admin-escalation" className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              Admin Escalation
              {escalationStats.find(s => s.level === "Critical")?.count > 0 && (
                <Badge className="bg-red-500 text-white ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  {escalationStats.find(s => s.level === "Critical")?.count}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="messages" className="flex-1 m-0 p-0 h-full">
          <UnifiedChatSystem 
            userRole={userRole} 
            userId={userId}
            userName={getUserName()}
          />
        </TabsContent>

        <TabsContent value="admin-escalation" className="flex-1 m-0 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Admin Escalation Center</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Escalate urgent issues to admin for immediate support
                </p>
              </div>
              <Button className="bg-sangria hover:bg-merlot">
                <Send className="h-4 w-4 mr-2" />
                New Escalation
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {escalationStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.level} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">{stat.level}</p>
                        <p className="text-xl font-semibold">{stat.count}</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Response: {stat.responseTime}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Escalation Guidelines */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">When to Escalate</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Staff no-shows or critical staffing issues</li>
                      <li>• Equipment failures or venue problems</li>
                      <li>• Client complaints requiring admin intervention</li>
                      <li>• Safety concerns or emergency situations</li>
                      <li>• Budget overruns or payment issues</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Escalations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Escalations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentEscalations.map((escalation) => (
                  <div
                    key={escalation.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(escalation.priority)}
                        <span className="text-sm text-muted-foreground">{escalation.id}</span>
                      </div>
                      {getStatusBadge(escalation.status)}
                    </div>
                    <h4 className="font-semibold mb-1">{escalation.subject}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {escalation.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {escalation.event}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {escalation.submittedAt}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {escalation.status !== "Resolved" && (
                        <Button variant="outline" size="sm">
                          <Phone className="h-3 w-3 mr-1" />
                          Call Admin
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Critical Alert</p>
                    <p className="text-xs text-muted-foreground">Immediate response needed</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Call Admin</p>
                    <p className="text-xs text-muted-foreground">Direct phone support</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">General Inquiry</p>
                    <p className="text-xs text-muted-foreground">Non-urgent questions</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
