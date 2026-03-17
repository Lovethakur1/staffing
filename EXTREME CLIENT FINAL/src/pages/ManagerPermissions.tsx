import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  CheckCircle2,
  XCircle,
  Calendar,
  Users,
  DollarSign,
  MessageSquare,
  AlertTriangle,
  Shield,
  Settings,
} from "lucide-react";

interface ManagerPermissionsProps {
  userRole: string;
  userId: string;
}

export function ManagerPermissions({ userRole, userId }: ManagerPermissionsProps) {
  const permissionCategories = [
    {
      category: "Event Management",
      icon: Calendar,
      allowed: [
        "View all assigned events",
        "Check-in/check-out staff at events",
        "Rate staff performance (1-5 stars)",
        "Report issues to admin",
        "View event details and requirements",
        "Communicate with assigned staff",
        "Submit event completion reports",
        "Upload event photos and documentation",
        "Track event progress in real-time",
        "Mark event milestones (setup, service, cleanup)"
      ],
      denied: [
        "Create new events",
        "Modify event pricing or rates",
        "Delete or cancel events",
        "Assign events to other managers",
        "Override event schedules without admin approval",
        "Access events not assigned to them"
      ]
    },
    {
      category: "Staff Management",
      icon: Users,
      allowed: [
        "View profiles of staff assigned to their events",
        "Mark attendance and time tracking",
        "Rate staff performance after events",
        "Report staff issues or concerns",
        "Request staff replacements",
        "View staff certifications and qualifications",
        "Communicate with event-assigned staff",
        "Provide performance feedback",
        "Recommend staff for promotions",
        "Track staff arrival and departure times"
      ],
      denied: [
        "Hire or terminate staff",
        "Modify staff pay rates or compensation",
        "Access full staff database (unassigned staff)",
        "Change or approve staff certifications",
        "Override staff unavailability settings",
        "Modify staff personal information",
        "Process background checks",
        "Access staff tax documents"
      ]
    },
    {
      category: "Payroll & Financial",
      icon: DollarSign,
      allowed: [
        "Submit expense reports for assigned events",
        "View event budgets (assigned events only)",
        "Record tips received by staff",
        "Track event-specific costs",
        "Submit receipts for reimbursement",
        "View expense submission status",
        "Request expense approval for amounts under $500"
      ],
      denied: [
        "Process payroll or pay staff directly",
        "Modify staff pay rates or hourly wages",
        "Access company financial reports or P&L",
        "Approve other managers' expenses",
        "View company bank accounts or balances",
        "Modify client invoices or pricing",
        "Access accounting system",
        "View staff salary information"
      ]
    },
    {
      category: "Communication",
      icon: MessageSquare,
      allowed: [
        "Message staff assigned to their events",
        "Escalate issues to admin with priority levels",
        "Submit field reports and updates",
        "Request emergency support from admin",
        "Communicate with clients (event-specific)",
        "Use quick escalation templates",
        "Send event updates to assigned staff",
        "Receive admin notifications"
      ],
      denied: [
        "Send company-wide announcements",
        "Access admin-only communications",
        "Modify communication templates",
        "Message staff not assigned to their events",
        "Access client contact database",
        "Send marketing or promotional messages"
      ]
    }
  ];

  const escalationLevels = [
    {
      level: "Level 1 - Manager Handles",
      priority: "Normal",
      color: "green",
      responseTime: "Immediate",
      issues: [
        "Minor staff issues (tardiness, uniform violations)",
        "Basic client requests during event",
        "Routine schedule adjustments",
        "Standard expense submissions (under $100)",
        "Staff communication and coordination"
      ]
    },
    {
      level: "Level 2 - Escalate for Approval",
      priority: "Medium",
      color: "yellow",
      responseTime: "1-4 hours",
      issues: [
        "Staff replacement requests",
        "Schedule conflicts requiring override",
        "Client complaints or concerns",
        "Expenses over $500",
        "Equipment failures or issues",
        "Non-critical safety concerns"
      ]
    },
    {
      level: "Level 3 - Critical Escalation",
      priority: "Critical",
      color: "red",
      responseTime: "15 minutes",
      issues: [
        "Staff no-shows at active events",
        "Client emergencies or major issues",
        "Safety incidents or injuries",
        "Legal issues or threats",
        "Major equipment failure affecting event",
        "Event cancellation scenarios"
      ]
    }
  ];

  const managerAuthority = {
    canApprove: [
      { item: "Staff time adjustments (±15 minutes)", limit: "Yes" },
      { item: "Minor event detail changes", limit: "Yes" },
      { item: "Expenses under $100", limit: "Auto-approved" },
      { item: "Staff performance ratings", limit: "Yes" },
      { item: "Event status updates", limit: "Yes" }
    ],
    requiresApproval: [
      { item: "Expenses $100-$500", limit: "Admin approval within 24hrs" },
      { item: "Staff replacements", limit: "Admin approval required" },
      { item: "Schedule overrides", limit: "Admin approval required" },
      { item: "Overtime authorization", limit: "Admin approval required" },
      { item: "Expenses over $500", limit: "Senior admin + Finance review" }
    ]
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900">Manager Permissions & Authority</h1>
          <p className="text-slate-600">Complete permission matrix and escalation guidelines for field managers</p>
        </div>
        <Badge className="bg-blue-100 text-blue-700 px-4 py-2">
          <Shield className="w-4 h-4 mr-2" />
          Sub-Admin Role
        </Badge>
      </div>

      {/* Permission Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <Calendar className="w-8 h-8 text-blue-600 mb-2" />
            <div className="text-sm text-slate-600 mb-1">Event Management</div>
            <div className="text-2xl font-semibold text-green-600">10 Allowed</div>
            <div className="text-sm text-red-600">6 Restricted</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Users className="w-8 h-8 text-purple-600 mb-2" />
            <div className="text-sm text-slate-600 mb-1">Staff Management</div>
            <div className="text-2xl font-semibold text-green-600">10 Allowed</div>
            <div className="text-sm text-red-600">8 Restricted</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <DollarSign className="w-8 h-8 text-green-600 mb-2" />
            <div className="text-sm text-slate-600 mb-1">Financial Access</div>
            <div className="text-2xl font-semibold text-green-600">7 Allowed</div>
            <div className="text-sm text-red-600">8 Restricted</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <MessageSquare className="w-8 h-8 text-orange-600 mb-2" />
            <div className="text-sm text-slate-600 mb-1">Communication</div>
            <div className="text-2xl font-semibold text-green-600">8 Allowed</div>
            <div className="text-sm text-red-600">6 Restricted</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="permissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="permissions">Permissions Matrix</TabsTrigger>
          <TabsTrigger value="escalation">Escalation Workflow</TabsTrigger>
          <TabsTrigger value="authority">Authority Limits</TabsTrigger>
          <TabsTrigger value="guidelines">Best Practices</TabsTrigger>
        </TabsList>

        {/* Permissions Matrix */}
        <TabsContent value="permissions" className="space-y-4">
          {permissionCategories.map((category, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <category.icon className="w-6 h-6 text-sangria" />
                  <CardTitle>{category.category}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {/* Allowed */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-green-900">Allowed Actions</h3>
                    </div>
                    <ul className="space-y-2">
                      {category.allowed.map((permission, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{permission}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Denied */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <h3 className="font-semibold text-red-900">Restricted Actions</h3>
                    </div>
                    <ul className="space-y-2">
                      {category.denied.map((permission, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{permission}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Escalation Workflow */}
        <TabsContent value="escalation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Escalation Matrix & Response Times</CardTitle>
              <p className="text-sm text-slate-600 mt-2">
                Clear guidelines on when to escalate issues and expected response times
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {escalationLevels.map((level, index) => {
                  const borderColor = level.color === 'green' ? 'border-green-500 bg-green-50' :
                                     level.color === 'yellow' ? 'border-yellow-500 bg-yellow-50' :
                                     'border-red-500 bg-red-50';
                  const badgeColor = level.color === 'green' ? 'bg-green-100 text-green-700' :
                                    level.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700';
                  
                  return (
                  <div key={index} className={`border-l-4 ${borderColor} p-6 rounded-r-lg`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900 text-lg">{level.level}</h3>
                          <Badge className={badgeColor}>
                            {level.priority}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600">
                          Expected Response Time: <span className="font-semibold">{level.responseTime}</span>
                        </div>
                      </div>
                      {index === 2 && (
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-700 mb-2">Issues to Handle:</div>
                      <ul className="space-y-1">
                        {level.issues.map((issue, idx) => (
                          <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-slate-400">•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Escalation Process */}
          <Card>
            <CardHeader>
              <CardTitle>How to Escalate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-semibold text-blue-600">1</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">Assess Situation</h4>
                  <p className="text-sm text-slate-600">Determine priority level and urgency</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-semibold text-blue-600">2</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">Use Template</h4>
                  <p className="text-sm text-slate-600">Select quick escalation template</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-semibold text-blue-600">3</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">Send & Track</h4>
                  <p className="text-sm text-slate-600">Monitor response and follow up</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authority Limits */}
        <TabsContent value="authority" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Can Approve */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-lg">Manager Can Approve</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {managerAuthority.canApprove.map((item, index) => (
                    <div key={index} className="flex items-start justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-slate-900">{item.item}</span>
                      <Badge className="bg-green-100 text-green-700 text-xs">{item.limit}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requires Approval */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <CardTitle className="text-lg">Requires Admin Approval</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {managerAuthority.requiresApproval.map((item, index) => (
                    <div key={index} className="flex items-start justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm text-slate-900">{item.item}</span>
                      <Badge className="bg-orange-100 text-orange-700 text-xs whitespace-nowrap">{item.limit}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Guidelines */}
        <TabsContent value="guidelines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manager Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Do's
                  </h4>
                  <ul className="space-y-2">
                    <li className="text-sm text-slate-700">✓ Communicate proactively with admin</li>
                    <li className="text-sm text-slate-700">✓ Document all decisions and actions</li>
                    <li className="text-sm text-slate-700">✓ Escalate issues early when uncertain</li>
                    <li className="text-sm text-slate-700">✓ Follow up on escalated issues</li>
                    <li className="text-sm text-slate-700">✓ Keep detailed event notes</li>
                    <li className="text-sm text-slate-700">✓ Provide timely staff feedback</li>
                    <li className="text-sm text-slate-700">✓ Submit expenses with receipts promptly</li>
                    <li className="text-sm text-slate-700">✓ Arrive 30 minutes before event start</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    Don'ts
                  </h4>
                  <ul className="space-y-2">
                    <li className="text-sm text-slate-700">✗ Never promise clients what you can't deliver</li>
                    <li className="text-sm text-slate-700">✗ Don't modify staff pay without approval</li>
                    <li className="text-sm text-slate-700">✗ Don't ignore safety concerns</li>
                    <li className="text-sm text-slate-700">✗ Don't make financial commitments over $100</li>
                    <li className="text-sm text-slate-700">✗ Don't share confidential staff information</li>
                    <li className="text-sm text-slate-700">✗ Don't override system conflicts without approval</li>
                    <li className="text-sm text-slate-700">✗ Don't delay critical escalations</li>
                    <li className="text-sm text-slate-700">✗ Don't operate equipment you're not trained on</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manager Success Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <div className="text-2xl font-semibold text-blue-600 mb-1">95%+</div>
                  <div className="text-sm text-slate-600">On-Time Events</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <div className="text-2xl font-semibold text-green-600 mb-1">4.5+</div>
                  <div className="text-sm text-slate-600">Client Rating</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <div className="text-2xl font-semibold text-purple-600 mb-1">98%+</div>
                  <div className="text-sm text-slate-600">Staff Attendance</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg text-center">
                  <div className="text-2xl font-semibold text-orange-600 mb-1">&lt;15min</div>
                  <div className="text-sm text-slate-600">Escalation Response</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
