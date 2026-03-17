import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { TimeInput } from "../components/ui/time-input";
import {
  Calendar,
  Clock,
  Users,
  Video,
  Phone,
  MapPin,
  Star,
  Plus,
  Eye,
  Edit,
  Send,
  CheckCircle,
  XCircle,
  FileText,
  Mail,
  Award,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { useNavigation } from "../contexts/NavigationContext";

interface PageProps {
  userRole: string;
  userId: string;
}

interface Interview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  position: string;
  date: string;
  time: string;
  type: 'video' | 'phone' | 'in-person';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  interviewer: string;
  location?: string;
  notes?: string;
  evaluation?: {
    professionalAppearance: number;
    communication: number;
    experience: number;
    culturalFit: number;
    enthusiasm: number;
    overallRating: number;
    feedback: string;
    recommendation: 'strongly-recommend' | 'recommend' | 'neutral' | 'not-recommend';
  };
}

export function Interviews({ userRole, userId }: PageProps) {
  const { setCurrentPage } = useNavigation();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isEvaluationDialogOpen, setIsEvaluationDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  const [interviews] = useState<Interview[]>([
    {
      id: "int-001",
      candidateName: "Michael Chen",
      candidateEmail: "m.chen@email.com",
      position: "Bartender",
      date: "2025-10-10",
      time: "10:00 AM",
      type: "video",
      status: "scheduled",
      interviewer: "Sarah Williams",
      notes: "Experienced bartender with strong references"
    },
    {
      id: "int-002",
      candidateName: "Jessica Martinez",
      candidateEmail: "jessica.m@email.com",
      position: "Event Coordinator",
      date: "2025-10-10",
      time: "2:00 PM",
      type: "video",
      status: "scheduled",
      interviewer: "David Johnson",
      notes: "Exceptional credentials, managed Fortune 500 events"
    },
    {
      id: "int-003",
      candidateName: "Daniel Garcia",
      candidateEmail: "daniel.g@email.com",
      position: "Bartender",
      date: "2025-10-11",
      time: "11:00 AM",
      type: "in-person",
      status: "scheduled",
      interviewer: "Sarah Williams",
      location: "Downtown Office - Conference Room A",
      notes: "Certified mixologist with bar management experience"
    },
    {
      id: "int-004",
      candidateName: "Emily Rodriguez",
      candidateEmail: "emily.r@email.com",
      position: "Server",
      date: "2025-10-08",
      time: "3:00 PM",
      type: "video",
      status: "completed",
      interviewer: "David Johnson",
      evaluation: {
        professionalAppearance: 5,
        communication: 5,
        experience: 4,
        culturalFit: 5,
        enthusiasm: 5,
        overallRating: 5,
        feedback: "Outstanding interview performance. Emily demonstrated excellent communication skills, professional demeanor, and genuine enthusiasm for the role. Her experience in fine dining perfectly aligns with our high-end events. Highly recommend immediate hiring.",
        recommendation: "strongly-recommend"
      }
    },
    {
      id: "int-005",
      candidateName: "Amanda Lee",
      candidateEmail: "amanda.lee@email.com",
      position: "Server",
      date: "2025-10-07",
      time: "1:00 PM",
      type: "video",
      status: "completed",
      interviewer: "Sarah Williams",
      evaluation: {
        professionalAppearance: 5,
        communication: 5,
        experience: 5,
        culturalFit: 5,
        enthusiasm: 5,
        overallRating: 5,
        feedback: "Exceptional candidate with extensive fine dining experience and culinary arts background. Perfect fit for our high-end events. Strong recommend for hire.",
        recommendation: "strongly-recommend"
      }
    },
    {
      id: "int-006",
      candidateName: "Christopher Brown",
      candidateEmail: "c.brown@email.com",
      position: "Setup Crew",
      date: "2025-10-11",
      time: "9:00 AM",
      type: "phone",
      status: "scheduled",
      interviewer: "Mike Thompson",
      notes: "Previous stage and event setup experience"
    },
    {
      id: "int-007",
      candidateName: "Robert Wilson",
      candidateEmail: "r.wilson@email.com",
      position: "Event Coordinator",
      date: "2025-10-06",
      time: "10:00 AM",
      type: "video",
      status: "cancelled",
      interviewer: "David Johnson",
      notes: "Candidate withdrew application"
    }
  ]);

  const upcomingInterviews = interviews.filter(i => i.status === 'scheduled');
  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const pastInterviews = interviews.filter(i => ['completed', 'cancelled', 'no-show'].includes(i.status));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'no-show': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'in-person': return <MapPin className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'strongly-recommend': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'recommend': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'neutral': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'not-recommend': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleScheduleInterview = () => {
    toast.success("Interview scheduled successfully!");
    setIsScheduleDialogOpen(false);
  };

  const handleSubmitEvaluation = () => {
    toast.success("Interview evaluation submitted!");
    setIsEvaluationDialogOpen(false);
  };

  const handleViewEvaluation = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsEvaluationDialogOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setCurrentPage('hiring')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Interview Management</h1>
            <p className="text-muted-foreground">
              Schedule, conduct, and evaluate candidate interviews
            </p>
          </div>
        </div>
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule New Interview</DialogTitle>
              <DialogDescription>
                Set up an interview with a candidate for an open position
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Candidate *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select candidate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sarah">Sarah Johnson - Event Coordinator</SelectItem>
                      <SelectItem value="robert">Robert Taylor - Bartender</SelectItem>
                      <SelectItem value="david">David Wilson - Setup Crew</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Interviewer *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sarah">Sarah Williams</SelectItem>
                      <SelectItem value="david">David Johnson</SelectItem>
                      <SelectItem value="mike">Mike Thompson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Time *</Label>
                  <TimeInput />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Interview Type *</Label>
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
                <Label>Location / Meeting Link</Label>
                <Input placeholder="Zoom link or physical location" />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  placeholder="Interview notes or special instructions..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleScheduleInterview}>
                  <Send className="h-4 w-4 mr-2" />
                  Schedule & Send Invite
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
                <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingInterviews.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">6</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedInterviews.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Rating</p>
                <p className="text-2xl font-bold">4.8</p>
              </div>
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming Interviews</TabsTrigger>
          <TabsTrigger value="past">Past Interviews</TabsTrigger>
        </TabsList>

        {/* Upcoming Interviews */}
        <TabsContent value="upcoming" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduled Interviews ({upcomingInterviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingInterviews.map((interview) => (
                  <div key={interview.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-primary">
                          {interview.candidateName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{interview.candidateName}</h4>
                        <p className="text-sm text-muted-foreground">{interview.position}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {interview.date}
                          </span>
                          <span className="text-sm flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {interview.time}
                          </span>
                          <span className="text-sm flex items-center gap-1">
                            {getTypeIcon(interview.type)}
                            {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)}
                          </span>
                        </div>
                        {interview.location && (
                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {interview.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(interview.status)}>
                        {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm">
                        <Video className="h-3 w-3 mr-1" />
                        Join
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Past Interviews */}
        <TabsContent value="past" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Completed Interviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Interviewer</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Recommendation</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastInterviews.map((interview) => (
                      <TableRow key={interview.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{interview.candidateName}</p>
                            <p className="text-sm text-muted-foreground">{interview.candidateEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>{interview.position}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{interview.date}</p>
                            <p className="text-muted-foreground">{interview.time}</p>
                          </div>
                        </TableCell>
                        <TableCell>{interview.interviewer}</TableCell>
                        <TableCell>
                          {interview.evaluation ? (
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{interview.evaluation.overallRating}/5</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {interview.evaluation ? (
                            <Badge className={getRecommendationColor(interview.evaluation.recommendation)}>
                              {interview.evaluation.recommendation.split('-').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewEvaluation(interview)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            {interview.evaluation ? 'View' : 'Evaluate'}
                          </Button>
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

      {/* Evaluation Dialog */}
      <Dialog open={isEvaluationDialogOpen} onOpenChange={setIsEvaluationDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Interview Evaluation</DialogTitle>
            <DialogDescription>
              {selectedInterview && `${selectedInterview.candidateName} - ${selectedInterview.position}`}
            </DialogDescription>
          </DialogHeader>
          {selectedInterview && (
            <div className="space-y-6 py-4">
              {selectedInterview.evaluation ? (
                // View Mode
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Rating Breakdown</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Professional Appearance', value: selectedInterview.evaluation.professionalAppearance },
                        { label: 'Communication Skills', value: selectedInterview.evaluation.communication },
                        { label: 'Experience & Qualifications', value: selectedInterview.evaluation.experience },
                        { label: 'Cultural Fit', value: selectedInterview.evaluation.culturalFit },
                        { label: 'Enthusiasm & Interest', value: selectedInterview.evaluation.enthusiasm }
                      ].map((item) => (
                        <div key={item.label} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>{item.label}</Label>
                            <span className="font-medium">{item.value}/5</span>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < item.value
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Overall Rating</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-6 w-6 ${
                                i < selectedInterview.evaluation!.overallRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xl font-bold">{selectedInterview.evaluation.overallRating}/5</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Recommendation</h3>
                    <Badge className={getRecommendationColor(selectedInterview.evaluation.recommendation)}>
                      {selectedInterview.evaluation.recommendation.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Feedback</h3>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm">{selectedInterview.evaluation.feedback}</p>
                    </div>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Rate Candidate Performance</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Professional Appearance', key: 'professionalAppearance' },
                        { label: 'Communication Skills', key: 'communication' },
                        { label: 'Experience & Qualifications', key: 'experience' },
                        { label: 'Cultural Fit', key: 'culturalFit' },
                        { label: 'Enthusiasm & Interest', key: 'enthusiasm' }
                      ].map((item) => (
                        <div key={item.key} className="space-y-2">
                          <Label>{item.label}</Label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <Button
                                key={rating}
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-12"
                              >
                                {rating}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Hiring Recommendation *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recommendation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strongly-recommend">Strongly Recommend</SelectItem>
                        <SelectItem value="recommend">Recommend</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="not-recommend">Do Not Recommend</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Interview Feedback *</Label>
                    <Textarea 
                      placeholder="Provide detailed feedback about the candidate's performance, strengths, concerns, and overall fit..."
                      className="min-h-[150px]"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsEvaluationDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitEvaluation}>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Evaluation
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}