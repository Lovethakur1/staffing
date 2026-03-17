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
} from "lucide-react";

interface ManagerAdminCommunicationProps {
  userRole: string;
  userId: string;
}

export function ManagerAdminCommunication({ userRole, userId }: ManagerAdminCommunicationProps) {
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

  // Quick escalation templates
  const quickTemplates = [
    {
      title: "Staff No-Show",
      priority: "Critical",
      template: "URGENT: Staff member has not arrived at event. Need immediate replacement.",
      icon: AlertTriangle,
    },
    {
      title: "Client Complaint",
      priority: "High",
      template: "Client has expressed concern about service. Immediate action needed.",
      icon: MessageSquare,
    },
    {
      title: "Equipment Issue",
      priority: "High",
      template: "Equipment failure at event. Need backup or guidance.",
      icon: FileText,
    },
    {
      title: "Staff Shortage",
      priority: "Medium",
      template: "Short staffed for upcoming event. Need admin support for reassignment.",
      icon: Clock,
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 bg-white border-b">
        <h1 className="text-slate-900">Manager-Admin Communication</h1>
        <p className="text-slate-600">Real-time communication with escalation support</p>
      </div>

      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <div className="px-6 pt-4 bg-white border-b">
          <TabsList>
            <TabsTrigger value="chat">
              <MessageSquare className="w-4 h-4 mr-2" />
              Live Chat
            </TabsTrigger>
            <TabsTrigger value="escalations">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Quick Escalations
            </TabsTrigger>
            <TabsTrigger value="stats">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Statistics
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 m-0">
          <UnifiedChatSystem 
            userRole={userRole} 
            userId={userId}
            userName="Manager User"
          />
        </TabsContent>

        {/* Quick Escalations Tab */}
        <TabsContent value="escalations" className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Escalation Templates</CardTitle>
                <p className="text-sm text-slate-600">
                  Use these templates to quickly escalate common issues to admin
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickTemplates.map((template, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            template.priority === 'Critical' ? 'bg-red-100' :
                            template.priority === 'High' ? 'bg-orange-100' :
                            'bg-yellow-100'
                          }`}>
                            <template.icon className={`w-5 h-5 ${
                              template.priority === 'Critical' ? 'text-red-600' :
                              template.priority === 'High' ? 'text-orange-600' :
                              'text-yellow-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-slate-900">{template.title}</h4>
                              <Badge className={
                                template.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                                template.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                'bg-yellow-100 text-yellow-700'
                              }>
                                {template.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">{template.template}</p>
                            <Button size="sm" className="w-full bg-sangria hover:bg-merlot">
                              Use Template
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Communication Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Escalation Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <h4 className="font-semibold text-red-900">Critical (15 min response)</h4>
                    </div>
                    <ul className="text-sm text-red-800 space-y-1 ml-7">
                      <li>• Staff no-shows at active events</li>
                      <li>• Client emergencies</li>
                      <li>• Safety incidents</li>
                      <li>• Major equipment failures</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <h4 className="font-semibold text-orange-900">High (1 hour response)</h4>
                    </div>
                    <ul className="text-sm text-orange-800 space-y-1 ml-7">
                      <li>• Staff shortage for upcoming events</li>
                      <li>• Client complaints</li>
                      <li>• Schedule conflicts</li>
                      <li>• Equipment issues before events</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-5 h-5 text-yellow-600" />
                      <h4 className="font-semibold text-yellow-900">Medium (4 hour response)</h4>
                    </div>
                    <ul className="text-sm text-yellow-800 space-y-1 ml-7">
                      <li>• Staff performance concerns</li>
                      <li>• Event clarifications</li>
                      <li>• Expense approvals</li>
                      <li>• Schedule adjustments</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {escalationStats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className={`w-5 h-5 ${
                        stat.color === 'red' ? 'text-red-600' :
                        stat.color === 'orange' ? 'text-orange-600' :
                        stat.color === 'yellow' ? 'text-yellow-600' :
                        'text-green-600'
                      }`} />
                      <Badge className={
                        stat.color === 'red' ? 'bg-red-100 text-red-700' :
                        stat.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                        stat.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }>
                        {stat.level}
                      </Badge>
                    </div>
                    <div className="text-2xl font-semibold text-slate-900 mb-1">
                      {stat.count}
                    </div>
                    <div className="text-xs text-slate-600">
                      Response: {stat.responseTime}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Response Time Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Your Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Average Response Time</span>
                    <span className="font-semibold text-green-600">12 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Messages Sent This Week</span>
                    <span className="font-semibold text-slate-900">47</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Issues Resolved</span>
                    <span className="font-semibold text-slate-900">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Admin Satisfaction</span>
                    <span className="font-semibold text-green-600">4.8/5.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
