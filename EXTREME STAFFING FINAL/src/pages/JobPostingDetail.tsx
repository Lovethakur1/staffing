import { useState } from "react";
import { useNavigation } from "../contexts/NavigationContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  Users,
  Star,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Share2,
  Edit,
  Trash2,
} from "lucide-react";

interface JobPostingDetailProps {
  userRole: string;
  userId: string;
  jobId?: string;
}

export function JobPostingDetail({ userRole, userId, jobId }: JobPostingDetailProps) {
  const { setCurrentPage } = useNavigation();
  const [selectedTab, setSelectedTab] = useState<"overview" | "applications">("overview");

  // Mock job posting data
  const job = {
    id: jobId || "job-001",
    title: "Event Server - Corporate Events",
    type: "Part-Time",
    category: "Servers",
    status: "active",
    postedDate: "2024-11-01",
    closingDate: "2024-12-15",
    location: "Downtown, CA",
    payRate: {
      min: 28,
      max: 35,
      type: "hourly",
    },
    positions: {
      available: 5,
      filled: 2,
    },
    description:
      "We are seeking experienced event servers to join our team for high-end corporate events. The ideal candidate has excellent customer service skills, professional appearance, and the ability to work in fast-paced environments.",
    responsibilities: [
      "Provide exceptional food and beverage service to guests",
      "Set up and break down event spaces",
      "Follow all safety and sanitation procedures",
      "Maintain professional appearance and demeanor",
      "Work collaboratively with event team",
    ],
    requirements: [
      "Minimum 1 year of event serving experience",
      "Excellent communication skills",
      "Ability to stand for long periods",
      "Weekend and evening availability",
      "Food Handler's Certificate (or willingness to obtain)",
    ],
    benefits: [
      "Competitive hourly rates",
      "Flexible scheduling",
      "Career advancement opportunities",
      "Professional training provided",
    ],
    views: 324,
    applications: [
      {
        id: "app-001",
        candidate: {
          id: "cand-001",
          name: "Emily Rodriguez",
          email: "emily.r@example.com",
          phone: "+1 (555) 123-4567",
          avatar: null,
        },
        appliedDate: "2024-11-05",
        status: "under-review",
        experience: "3 years",
        rating: 4.8,
        notes: "Strong background in fine dining service. Available immediately.",
      },
      {
        id: "app-002",
        candidate: {
          id: "cand-002",
          name: "Marcus Johnson",
          email: "marcus.j@example.com",
          phone: "+1 (555) 234-5678",
          avatar: null,
        },
        appliedDate: "2024-11-03",
        status: "shortlisted",
        experience: "5 years",
        rating: 4.9,
        notes: "Excellent references. Specializes in corporate events.",
      },
      {
        id: "app-003",
        candidate: {
          id: "cand-003",
          name: "Sarah Chen",
          email: "sarah.c@example.com",
          phone: "+1 (555) 345-6789",
          avatar: null,
        },
        appliedDate: "2024-11-08",
        status: "new",
        experience: "2 years",
        rating: 4.5,
        notes: "",
      },
    ],
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: "default",
      closed: "secondary",
      draft: "outline",
      paused: "secondary",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getApplicationStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      new: { variant: "default", label: "New" },
      "under-review": { variant: "default", label: "Under Review" },
      shortlisted: { variant: "default", label: "Shortlisted" },
      interviewed: { variant: "default", label: "Interviewed" },
      accepted: { variant: "default", label: "Accepted" },
      rejected: { variant: "destructive", label: "Rejected" },
    };
    const config = variants[status] || variants.new;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const progressPercentage = (job.positions.filled / job.positions.available) * 100;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setCurrentPage("hiring")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Hiring
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-slate-900">{job.title}</h1>
              {getStatusBadge(job.status)}
            </div>
            <p className="text-sm text-slate-600">Job ID: {job.id}</p>
          </div>
        </div>
        {userRole === "admin" && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2 text-red-600" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Applications</p>
                <p className="text-2xl font-semibold text-slate-900">{job.applications.length}</p>
              </div>
              <Users className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Views</p>
                <p className="text-2xl font-semibold text-slate-900">{job.views}</p>
              </div>
              <Eye className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Positions Filled</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {job.positions.filled}/{job.positions.available}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Days Remaining</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {Math.ceil(
                    (new Date(job.closingDate).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <Button
          variant="ghost"
          className={selectedTab === "overview" ? "border-b-2 border-sangria rounded-none" : ""}
          onClick={() => setSelectedTab("overview")}
        >
          Job Overview
        </Button>
        <Button
          variant="ghost"
          className={selectedTab === "applications" ? "border-b-2 border-sangria rounded-none" : ""}
          onClick={() => setSelectedTab("applications")}
        >
          Applications ({job.applications.length})
        </Button>
      </div>

      {/* Content */}
      {selectedTab === "overview" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">{job.description}</p>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-slate-900 mb-2">Responsibilities</h4>
                  <ul className="space-y-2">
                    {job.responsibilities.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-slate-900 mb-2">Requirements</h4>
                  <ul className="space-y-2">
                    {job.requirements.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-sangria mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-slate-900 mb-2">Benefits</h4>
                  <ul className="space-y-2">
                    {job.benefits.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                        <Star className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Job Type</p>
                    <p className="text-sm text-slate-600">{job.type}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Location</p>
                    <p className="text-sm text-slate-600">{job.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Pay Rate</p>
                    <p className="text-sm text-slate-600">
                      ${job.payRate.min} - ${job.payRate.max}/{job.payRate.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Posted Date</p>
                    <p className="text-sm text-slate-600">
                      {new Date(job.postedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Closing Date</p>
                    <p className="text-sm text-slate-600">
                      {new Date(job.closingDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hiring Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-600">Positions Filled</p>
                    <p className="text-sm font-medium text-slate-900">
                      {job.positions.filled} / {job.positions.available}
                    </p>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                <p className="text-xs text-slate-600">
                  {job.positions.available - job.positions.filled} position
                  {job.positions.available - job.positions.filled !== 1 ? "s" : ""} remaining
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {job.applications.map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {application.candidate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-slate-900">{application.candidate.name}</p>
                        {getApplicationStatusBadge(application.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>{application.experience} experience</span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {application.rating}
                        </span>
                        <span>Applied {new Date(application.appliedDate).toLocaleDateString()}</span>
                      </div>
                      {application.notes && (
                        <p className="text-sm text-slate-600 mt-1">{application.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Application
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                    {userRole === "admin" && application.status === "shortlisted" && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
