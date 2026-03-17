import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Progress } from "../components/ui/progress";
import { 
  Star,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Clock,
  Send,
  Eye,
  BarChart3,
  Users,
  Calendar,
  Award,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  FileText
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner@2.0.3";

interface QualityAssuranceProps {
  userRole: string;
  userId: string;
}

interface EventFeedback {
  id: string;
  eventId: string;
  eventName: string;
  clientId: string;
  clientName: string;
  eventDate: string;
  feedbackDate: string;
  overallRating: number;
  status: 'pending' | 'completed' | 'reviewing' | 'action-required';
  responses: {
    staffQuality: number;
    professionalism: number;
    punctuality: number;
    communication: number;
    valueForMoney: number;
  };
  staffRatings: StaffRating[];
  comments: string;
  issues: string[];
  wouldRecommend: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface StaffRating {
  staffId: string;
  staffName: string;
  role: string;
  rating: number;
  comments: string;
}

export function QualityAssurance({ userRole }: QualityAssuranceProps) {
  const { setCurrentPage } = useNavigation();
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPageNum] = useState(1);
  const [selectedFeedback, setSelectedFeedback] = useState<EventFeedback | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const itemsPerPage = 10;

  // Mock feedback data
  const allFeedback: EventFeedback[] = [
    {
      id: "FB-001",
      eventId: "EVT-1234",
      eventName: "Corporate Gala 2024",
      clientId: "CL-001",
      clientName: "Innovate Corp",
      eventDate: "2024-10-10",
      feedbackDate: "2024-10-11",
      overallRating: 4.8,
      status: "completed",
      responses: {
        staffQuality: 5,
        professionalism: 5,
        punctuality: 4,
        communication: 5,
        valueForMoney: 5
      },
      staffRatings: [
        { staffId: "ST-101", staffName: "Michael Chen", role: "Server", rating: 5, comments: "Excellent service, very attentive" },
        { staffId: "ST-102", staffName: "Sarah Johnson", role: "Bartender", rating: 5, comments: "Professional and efficient" },
        { staffId: "ST-103", staffName: "David Martinez", role: "Event Staff", rating: 4, comments: "Good work, slightly slow at setup" }
      ],
      comments: "Overall fantastic experience. Staff were professional and the event ran smoothly. Minor delay in setup but everything was perfect by start time.",
      issues: ["Setup delay (15 minutes)"],
      wouldRecommend: true,
      sentiment: "positive"
    },
    {
      id: "FB-002",
      eventId: "EVT-1235",
      eventName: "Wedding Reception",
      clientDate: "2024-10-12",
      feedbackDate: "2024-10-13",
      clientId: "CL-002",
      clientName: "Elite Events LLC",
      overallRating: 3.2,
      status: "action-required",
      responses: {
        staffQuality: 4,
        professionalism: 3,
        punctuality: 2,
        communication: 3,
        valueForMoney: 4
      },
      staffRatings: [
        { staffId: "ST-104", staffName: "Emma Davis", role: "Server", rating: 4, comments: "Good service" },
        { staffId: "ST-105", staffName: "James Wilson", role: "Setup Crew", rating: 1, comments: "No show - unacceptable" },
        { staffId: "ST-106", staffName: "Lisa Anderson", role: "Coordinator", rating: 4, comments: "Handled the no-show situation well" }
      ],
      comments: "Had issues with staff no-show which caused stress. Coordinator handled it professionally but this should not have happened. Otherwise service was good.",
      issues: ["Staff no-show (Setup Crew)", "Last minute replacement needed", "Communication gap"],
      wouldRecommend: false,
      sentiment: "negative"
    },
    {
      id: "FB-003",
      eventId: "EVT-1236",
      eventName: "Product Launch Party",
      clientId: "CL-003",
      clientName: "TechStart Inc",
      eventDate: "2024-10-15",
      feedbackDate: "2024-10-16",
      overallRating: 4.5,
      status: "completed",
      responses: {
        staffQuality: 5,
        professionalism: 5,
        punctuality: 5,
        communication: 4,
        valueForMoney: 4
      },
      staffRatings: [
        { staffId: "ST-107", staffName: "Robert Taylor", role: "Security", rating: 5, comments: "Very professional" },
        { staffId: "ST-108", staffName: "Jennifer Lee", role: "Registration", rating: 5, comments: "Efficient and friendly" },
        { staffId: "ST-109", staffName: "Christopher Brown", role: "AV Tech", rating: 4, comments: "Good technical support" }
      ],
      comments: "Great team, very professional. Event was a success thanks to your staff!",
      issues: [],
      wouldRecommend: true,
      sentiment: "positive"
    },
    {
      id: "FB-004",
      eventId: "EVT-1237",
      eventName: "Annual Conference",
      clientId: "CL-001",
      clientName: "Innovate Corp",
      eventDate: "2024-10-18",
      feedbackDate: "",
      overallRating: 0,
      status: "pending",
      responses: {
        staffQuality: 0,
        professionalism: 0,
        punctuality: 0,
        communication: 0,
        valueForMoney: 0
      },
      staffRatings: [],
      comments: "",
      issues: [],
      wouldRecommend: false,
      sentiment: "neutral"
    },
    {
      id: "FB-005",
      eventId: "EVT-1238",
      eventName: "Charity Fundraiser",
      clientId: "CL-004",
      clientName: "Luxury Hotels Group",
      eventDate: "2024-10-20",
      feedbackDate: "",
      overallRating: 0,
      status: "pending",
      responses: {
        staffQuality: 0,
        professionalism: 0,
        punctuality: 0,
        communication: 0,
        valueForMoney: 0
      },
      staffRatings: [],
      comments: "",
      issues: [],
      wouldRecommend: false,
      sentiment: "neutral"
    }
  ];

  // Summary stats
  const stats = {
    totalFeedback: allFeedback.filter(f => f.status !== 'pending').length,
    avgRating: (allFeedback.filter(f => f.overallRating > 0).reduce((sum, f) => sum + f.overallRating, 0) / 
                allFeedback.filter(f => f.overallRating > 0).length).toFixed(1),
    pending: allFeedback.filter(f => f.status === 'pending').length,
    actionRequired: allFeedback.filter(f => f.status === 'action-required').length,
    positive: allFeedback.filter(f => f.sentiment === 'positive').length,
    recommendRate: ((allFeedback.filter(f => f.wouldRecommend).length / 
                     allFeedback.filter(f => f.status !== 'pending').length) * 100).toFixed(0)
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "reviewing":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><Eye className="h-3 w-3 mr-1" />Reviewing</Badge>;
      case "action-required":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><AlertTriangle className="h-3 w-3 mr-1" />Action Needed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <Badge className="bg-green-100 text-green-700"><ThumbsUp className="h-3 w-3 mr-1" />Positive</Badge>;
      case "negative":
        return <Badge className="bg-red-100 text-red-700"><ThumbsDown className="h-3 w-3 mr-1" />Negative</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">Neutral</Badge>;
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Filter feedback
  const filteredFeedback = allFeedback.filter(feedback => {
    const matchesSearch = feedback.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feedback.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feedback.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || feedback.status === statusFilter;
    const matchesTab = selectedTab === "all" || feedback.status === selectedTab;
    return matchesSearch && matchesStatus && matchesTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFeedback = filteredFeedback.slice(startIndex, startIndex + itemsPerPage);

  const handleSendSurvey = (feedback: EventFeedback) => {
    toast.success(`Survey sent to ${feedback.clientName}`);
  };

  const handleViewDetail = (feedback: EventFeedback) => {
    setSelectedFeedback(feedback);
    setShowDetailDialog(true);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Quality Assurance & Feedback</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Post-event surveys and client satisfaction tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button className="bg-sangria hover:bg-merlot">
            <Send className="h-4 w-4 mr-2" />
            Send Bulk Surveys
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Responses</p>
              <p className="text-xl font-semibold">{stats.totalFeedback}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
              <p className="text-xl font-semibold">{stats.avgRating} / 5.0</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Would Recommend</p>
              <p className="text-xl font-semibold">{stats.recommendRate}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Action Needed</p>
              <p className="text-xl font-semibold">{stats.actionRequired}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All Feedback</TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {stats.pending > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-white h-5 w-5 p-0 flex items-center justify-center">
                {stats.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="action-required">
            Action Required
            {stats.actionRequired > 0 && (
              <Badge className="ml-2 bg-red-500 text-white h-5 w-5 p-0 flex items-center justify-center">
                {stats.actionRequired}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {/* Feedback Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Event Feedback</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search feedback..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full sm:w-[250px]"
                    />
                  </div>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="action-required">Action Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Feedback ID</TableHead>
                      <TableHead className="font-semibold">Event</TableHead>
                      <TableHead className="font-semibold">Client</TableHead>
                      <TableHead className="font-semibold">Event Date</TableHead>
                      <TableHead className="font-semibold">Rating</TableHead>
                      <TableHead className="font-semibold">Sentiment</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedFeedback.length > 0 ? (
                      paginatedFeedback.map((feedback) => (
                        <TableRow key={feedback.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono font-medium">{feedback.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{feedback.eventName}</p>
                              <p className="text-xs text-muted-foreground">{feedback.eventId}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{feedback.clientName}</p>
                              <p className="text-xs text-muted-foreground">{feedback.clientId}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(feedback.eventDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {feedback.overallRating > 0 ? (
                              renderStarRating(feedback.overallRating)
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{getSentimentBadge(feedback.sentiment)}</TableCell>
                          <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {feedback.status === 'pending' ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSendSurvey(feedback)}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetail(feedback)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No feedback found</p>
                          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredFeedback.length)} of {filteredFeedback.length} responses
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageNum(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPageNum(page)}
                          className={currentPage === page ? "bg-sangria hover:bg-merlot" : ""}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageNum(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feedback Detail Dialog */}
      {selectedFeedback && selectedFeedback.status !== 'pending' && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Feedback Details - {selectedFeedback.eventName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Overall Rating */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h4 className="font-semibold mb-1">Overall Rating</h4>
                  {renderStarRating(selectedFeedback.overallRating)}
                </div>
                <div className="text-right">
                  {getSentimentBadge(selectedFeedback.sentiment)}
                  <p className="text-sm text-muted-foreground mt-1">
                    Submitted: {new Date(selectedFeedback.feedbackDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Category Ratings */}
              <div>
                <h4 className="font-semibold mb-3">Category Ratings</h4>
                <div className="space-y-3">
                  {Object.entries(selectedFeedback.responses).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-sm font-medium">{value}/5</span>
                      </div>
                      <Progress value={(value / 5) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Staff Ratings */}
              {selectedFeedback.staffRatings.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Individual Staff Ratings</h4>
                  <div className="space-y-3">
                    {selectedFeedback.staffRatings.map((staff, idx) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{staff.staffName}</p>
                            <p className="text-sm text-muted-foreground">{staff.role}</p>
                          </div>
                          {renderStarRating(staff.rating)}
                        </div>
                        {staff.comments && (
                          <p className="text-sm text-muted-foreground italic">"{staff.comments}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              {selectedFeedback.comments && (
                <div>
                  <h4 className="font-semibold mb-2">Client Comments</h4>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm">{selectedFeedback.comments}</p>
                  </div>
                </div>
              )}

              {/* Issues */}
              {selectedFeedback.issues.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Reported Issues</h4>
                  <div className="space-y-2">
                    {selectedFeedback.issues.map((issue, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-900">{issue}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendation */}
              <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                {selectedFeedback.wouldRecommend ? (
                  <>
                    <ThumbsUp className="h-5 w-5 text-green-600" />
                    <p className="font-medium text-green-900">Client would recommend your services</p>
                  </>
                ) : (
                  <>
                    <ThumbsDown className="h-5 w-5 text-red-600" />
                    <p className="font-medium text-red-900">Client would not recommend your services</p>
                  </>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                Close
              </Button>
              {selectedFeedback.status === 'action-required' && (
                <Button className="bg-sangria hover:bg-merlot">
                  Create Action Plan
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
