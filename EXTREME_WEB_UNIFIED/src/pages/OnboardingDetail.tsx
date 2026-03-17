import { useState } from "react";
import { useNavigation } from "../contexts/NavigationContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Checkbox } from "../components/ui/checkbox";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Upload,
  Download,
  MessageSquare,
  Send,
  XCircle,
} from "lucide-react";

interface OnboardingDetailProps {
  userRole: string;
  userId: string;
  onboardingId?: string;
}

export function OnboardingDetail({ userRole, userId, onboardingId }: OnboardingDetailProps) {
  const { setCurrentPage } = useNavigation();

  // Mock onboarding data
  const onboarding = {
    id: onboardingId || "onb-001",
    candidate: {
      id: "cand-001",
      name: "Emily Rodriguez",
      email: "emily.r@extremestaffing.com",
      phone: "+1 (555) 123-4567",
      avatar: null,
    },
    position: {
      id: "job-001",
      title: "Event Server - Corporate Events",
      type: "Part-Time",
      startDate: "2024-11-25",
    },
    hiredDate: "2024-11-15",
    onboardingStarted: "2024-11-16",
    status: "in-progress",
    overallProgress: 65,
    sections: [
      {
        id: "sec-1",
        title: "Personal Information",
        description: "Basic personal details and emergency contacts",
        progress: 100,
        status: "completed",
        tasks: [
          {
            id: "task-1-1",
            title: "Complete personal information form",
            completed: true,
            completedDate: "2024-11-16",
          },
          {
            id: "task-1-2",
            title: "Provide emergency contact details",
            completed: true,
            completedDate: "2024-11-16",
          },
          {
            id: "task-1-3",
            title: "Upload profile photo",
            completed: true,
            completedDate: "2024-11-16",
          },
        ],
      },
      {
        id: "sec-2",
        title: "Legal Documents",
        description: "Required employment documents and tax forms",
        progress: 67,
        status: "in-progress",
        tasks: [
          {
            id: "task-2-1",
            title: "Sign employment agreement",
            completed: true,
            completedDate: "2024-11-17",
          },
          {
            id: "task-2-2",
            title: "Complete W-4 tax form",
            completed: true,
            completedDate: "2024-11-17",
          },
          {
            id: "task-2-3",
            title: "Upload proof of eligibility to work (I-9)",
            completed: false,
            completedDate: null,
          },
        ],
      },
      {
        id: "sec-3",
        title: "Banking & Payment",
        description: "Direct deposit and payment information",
        progress: 100,
        status: "completed",
        tasks: [
          {
            id: "task-3-1",
            title: "Set up direct deposit",
            completed: true,
            completedDate: "2024-11-18",
          },
          {
            id: "task-3-2",
            title: "Review payment schedule",
            completed: true,
            completedDate: "2024-11-18",
          },
        ],
      },
      {
        id: "sec-4",
        title: "Training & Certifications",
        description: "Required training modules and certifications",
        progress: 33,
        status: "in-progress",
        tasks: [
          {
            id: "task-4-1",
            title: "Complete food safety training",
            completed: true,
            completedDate: "2024-11-19",
          },
          {
            id: "task-4-2",
            title: "Watch orientation video",
            completed: false,
            completedDate: null,
          },
          {
            id: "task-4-3",
            title: "Complete workplace safety quiz",
            completed: false,
            completedDate: null,
          },
        ],
      },
      {
        id: "sec-5",
        title: "Uniform & Equipment",
        description: "Uniform sizing and equipment assignment",
        progress: 0,
        status: "pending",
        tasks: [
          {
            id: "task-5-1",
            title: "Provide uniform size information",
            completed: false,
            completedDate: null,
          },
          {
            id: "task-5-2",
            title: "Collect uniform",
            completed: false,
            completedDate: null,
          },
          {
            id: "task-5-3",
            title: "Sign equipment checklist",
            completed: false,
            completedDate: null,
          },
        ],
      },
    ],
    documents: [
      {
        id: "doc-1",
        name: "Employment Agreement",
        type: "PDF",
        status: "signed",
        uploadedDate: "2024-11-17",
      },
      {
        id: "doc-2",
        name: "W-4 Tax Form",
        type: "PDF",
        status: "completed",
        uploadedDate: "2024-11-17",
      },
      {
        id: "doc-3",
        name: "Direct Deposit Form",
        type: "PDF",
        status: "completed",
        uploadedDate: "2024-11-18",
      },
      {
        id: "doc-4",
        name: "Food Safety Certificate",
        type: "PDF",
        status: "verified",
        uploadedDate: "2024-11-19",
      },
    ],
    notes: [
      {
        id: "note-1",
        author: "Lisa Anderson",
        role: "Hiring Manager",
        content: "Emily is very responsive and completing tasks ahead of schedule. Great hire!",
        timestamp: "2024-11-18T14:30:00",
      },
      {
        id: "note-2",
        author: "Admin Team",
        role: "HR",
        content: "Reminder sent for I-9 documentation. Needs to be completed before start date.",
        timestamp: "2024-11-19T10:00:00",
      },
    ],
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      completed: { variant: "secondary", label: "Completed", icon: CheckCircle },
      "in-progress": { variant: "default", label: "In Progress", icon: Clock },
      pending: { variant: "outline", label: "Pending", icon: AlertCircle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getDocumentStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      signed: { variant: "default", label: "Signed" },
      completed: { variant: "default", label: "Completed" },
      verified: { variant: "default", label: "Verified" },
      pending: { variant: "outline", label: "Pending" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setCurrentPage("onboarding")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Onboarding
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-slate-900">{onboarding.candidate.name}</h1>
              {getStatusBadge(onboarding.status)}
            </div>
            <p className="text-sm text-slate-600">{onboarding.position.title}</p>
          </div>
        </div>
        {userRole === "admin" && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Send className="h-4 w-4 mr-2" />
              Send Reminder
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        )}
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-900">Overall Onboarding Progress</h3>
                <p className="text-sm text-slate-600">
                  {onboarding.sections.filter((s) => s.status === "completed").length} of{" "}
                  {onboarding.sections.length} sections completed
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-slate-900">{onboarding.overallProgress}%</p>
                <p className="text-sm text-slate-600">Complete</p>
              </div>
            </div>
            <Progress value={onboarding.overallProgress} className="h-3" />
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Started {new Date(onboarding.onboardingStarted).toLocaleDateString()}</span>
              <span>Start Date: {new Date(onboarding.position.startDate).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Onboarding Sections */}
          {onboarding.sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">{section.description}</p>
                  </div>
                  {getStatusBadge(section.status)}
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                    <span>
                      {section.tasks.filter((t) => t.completed).length} of {section.tasks.length}{" "}
                      tasks completed
                    </span>
                    <span>{section.progress}%</span>
                  </div>
                  <Progress value={section.progress} className="h-2" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox checked={task.completed} disabled />
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              task.completed ? "text-slate-600 line-through" : "text-slate-900"
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.completed && task.completedDate && (
                            <p className="text-xs text-slate-500">
                              Completed {new Date(task.completedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      {task.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Candidate Info */}
          <Card>
            <CardHeader>
              <CardTitle>Candidate Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {onboarding.candidate.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-slate-900">{onboarding.candidate.name}</h3>
                  <p className="text-sm text-slate-600">{onboarding.position.type}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <a
                    href={`mailto:${onboarding.candidate.email}`}
                    className="text-sangria hover:underline"
                  >
                    {onboarding.candidate.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <a
                    href={`tel:${onboarding.candidate.phone}`}
                    className="text-sangria hover:underline"
                  >
                    {onboarding.candidate.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">
                    Start Date: {new Date(onboarding.position.startDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Separator />

              <Button variant="outline" className="w-full gap-2">
                <MessageSquare className="h-4 w-4" />
                Message Candidate
              </Button>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {onboarding.documents.map((doc) => (
                  <div key={doc.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-slate-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                          <p className="text-xs text-slate-600">
                            {new Date(doc.uploadedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {getDocumentStatusBadge(doc.status)}
                    </div>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>

              {userRole === "admin" && (
                <>
                  <Separator className="my-4" />
                  <Button variant="outline" className="w-full gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Document
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes & Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {onboarding.notes.map((note) => (
                  <div key={note.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{note.author}</p>
                        <p className="text-xs text-slate-600">{note.role}</p>
                      </div>
                      <p className="text-xs text-slate-600">
                        {new Date(note.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">{note.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {userRole === "admin" && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Send className="h-4 w-4 mr-2" />
                  Send Task Reminder
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Orientation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Separator className="my-2" />
                <Button className="w-full justify-start bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Onboarding
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600">
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Onboarding
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
