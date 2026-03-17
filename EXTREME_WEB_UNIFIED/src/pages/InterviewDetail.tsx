import { useState } from "react";
import { useNavigation } from "../contexts/NavigationContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Briefcase,
  Phone,
  Mail,
  FileText,
  Star,
  CheckCircle,
  XCircle,
  MessageSquare,
  Video,
  Edit,
} from "lucide-react";

interface InterviewDetailProps {
  userRole: string;
  userId: string;
  interviewId?: string;
}

export function InterviewDetail({ userRole, userId, interviewId }: InterviewDetailProps) {
  const { setCurrentPage } = useNavigation();
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState("0");
  const [decision, setDecision] = useState("");

  // Mock interview data
  const interview = {
    id: interviewId || "int-001",
    candidate: {
      id: "cand-001",
      name: "Emily Rodriguez",
      email: "emily.r@example.com",
      phone: "+1 (555) 123-4567",
      avatar: null,
      experience: "3 years",
      currentRole: "Event Server",
    },
    position: {
      id: "job-001",
      title: "Event Server - Corporate Events",
      type: "Part-Time",
    },
    date: "2024-11-20",
    time: "10:00 AM",
    duration: "45 minutes",
    type: "In-Person",
    location: "Office - Conference Room A",
    status: "scheduled",
    interviewer: {
      id: "admin-1",
      name: "Lisa Anderson",
      role: "Hiring Manager",
    },
    applicationDate: "2024-11-05",
    resume: {
      url: "#",
      name: "emily_rodriguez_resume.pdf",
    },
    coverLetter: {
      url: "#",
      name: "emily_rodriguez_cover_letter.pdf",
    },
    previousInterviews: [
      {
        id: "int-000",
        date: "2024-11-10",
        type: "Phone Screen",
        interviewer: "Sarah Chen",
        rating: 4,
        notes: "Good communication skills. Enthusiastic about the role.",
        status: "completed",
      },
    ],
    interviewNotes: [],
    skills: [
      { name: "Food Service", level: 4 },
      { name: "Customer Service", level: 5 },
      { name: "Team Collaboration", level: 4 },
      { name: "Time Management", level: 4 },
    ],
    availability: {
      weekdays: true,
      weekends: true,
      evenings: true,
    },
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      scheduled: "default",
      completed: "secondary",
      cancelled: "destructive",
      "no-show": "destructive",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const handleSubmitFeedback = () => {
    // Submit interview feedback logic
    console.log({ notes, rating, decision });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setCurrentPage("interviews")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Interviews
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-slate-900">Interview with {interview.candidate.name}</h1>
              {getStatusBadge(interview.status)}
            </div>
            <p className="text-sm text-slate-600">Interview ID: {interview.id}</p>
          </div>
        </div>
        {userRole === "admin" && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Reschedule
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Add to Calendar
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interview Details */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Date</p>
                    <p className="text-sm text-slate-600">
                      {new Date(interview.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Time</p>
                    <p className="text-sm text-slate-600">
                      {interview.time} ({interview.duration})
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {interview.type === "Video" ? (
                    <Video className="h-5 w-5 text-slate-400 mt-0.5" />
                  ) : (
                    <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-900">Type & Location</p>
                    <p className="text-sm text-slate-600">{interview.type}</p>
                    <p className="text-sm text-slate-600">{interview.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Interviewer</p>
                    <p className="text-sm text-slate-600">{interview.interviewer.name}</p>
                    <p className="text-sm text-slate-500">{interview.interviewer.role}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Position</p>
                  <p className="text-sm text-slate-600">{interview.position.title}</p>
                  <Badge variant="outline" className="mt-1">
                    {interview.position.type}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Candidate Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Candidate Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {interview.candidate.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900">{interview.candidate.name}</h3>
                  <p className="text-sm text-slate-600">{interview.candidate.currentRole}</p>
                  <p className="text-sm text-slate-500">{interview.candidate.experience} experience</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <a href={`mailto:${interview.candidate.email}`} className="text-sangria hover:underline">
                    {interview.candidate.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <a href={`tel:${interview.candidate.phone}`} className="text-sangria hover:underline">
                    {interview.candidate.phone}
                  </a>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-3">Skills Assessment</h4>
                <div className="space-y-3">
                  {interview.skills.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-600">{skill.name}</span>
                        {renderStars(skill.level)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-2">Availability</h4>
                <div className="flex gap-2">
                  {interview.availability.weekdays && <Badge variant="outline">Weekdays</Badge>}
                  {interview.availability.weekends && <Badge variant="outline">Weekends</Badge>}
                  {interview.availability.evenings && <Badge variant="outline">Evenings</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Previous Interviews */}
          {interview.previousInterviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Interview History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {interview.previousInterviews.map((prev) => (
                    <div key={prev.id} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-slate-900">{prev.type}</p>
                          <p className="text-sm text-slate-600">
                            {new Date(prev.date).toLocaleDateString()} • {prev.interviewer}
                          </p>
                        </div>
                        {renderStars(prev.rating)}
                      </div>
                      <p className="text-sm text-slate-600">{prev.notes}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interview Feedback Form */}
          {userRole === "admin" && interview.status === "scheduled" && (
            <Card>
              <CardHeader>
                <CardTitle>Post-Interview Feedback</CardTitle>
                <p className="text-sm text-slate-600">Complete this form after the interview</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Overall Rating</label>
                  <Select value={rating} onValueChange={setRating}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 - Excellent</SelectItem>
                      <SelectItem value="4">4 - Good</SelectItem>
                      <SelectItem value="3">3 - Average</SelectItem>
                      <SelectItem value="2">2 - Below Average</SelectItem>
                      <SelectItem value="1">1 - Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Interview Notes</label>
                  <Textarea
                    placeholder="Add your notes about the candidate's performance, strengths, areas of concern, etc."
                    rows={6}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Decision</label>
                  <Select value={decision} onValueChange={setDecision}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select decision" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proceed">Proceed to Next Round</SelectItem>
                      <SelectItem value="offer">Make Job Offer</SelectItem>
                      <SelectItem value="hold">Put on Hold</SelectItem>
                      <SelectItem value="reject">Reject Application</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSubmitFeedback} className="w-full">
                  Submit Feedback
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Application Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Resume</p>
                    <p className="text-xs text-slate-600">{interview.resume.name}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View Resume
                </Button>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Cover Letter</p>
                    <p className="text-xs text-slate-600">{interview.coverLetter.name}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View Cover Letter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2" />
                Call Candidate
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              {userRole === "admin" && (
                <>
                  <Separator className="my-2" />
                  <Button variant="outline" className="w-full justify-start text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Candidate
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Candidate
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Application Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-sangria" />
                    <div className="w-px h-full bg-slate-200 mt-1" />
                  </div>
                  <div className="flex-1 pb-3">
                    <p className="text-sm font-medium text-slate-900">Interview Scheduled</p>
                    <p className="text-xs text-slate-600">
                      {new Date(interview.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {interview.previousInterviews.map((prev) => (
                  <div key={prev.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <div className="w-px h-full bg-slate-200 mt-1" />
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="text-sm font-medium text-slate-900">{prev.type}</p>
                      <p className="text-xs text-slate-600">
                        {new Date(prev.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-slate-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Application Submitted</p>
                    <p className="text-xs text-slate-600">
                      {new Date(interview.applicationDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
