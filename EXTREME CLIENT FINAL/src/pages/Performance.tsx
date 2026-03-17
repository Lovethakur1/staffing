import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import { 
  Star, 
  TrendingUp, 
  Award, 
  Target,
  Calendar,
  Users,
  Clock,
  ThumbsUp,
  Trophy,
  MessageSquare
} from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { getReviewsByStaff } from "../data/mockData";

interface PerformanceProps {
  userRole: string;
  userId: string;
}

export function Performance({ userRole, userId }: PerformanceProps) {
  // Get staff-specific data if user is staff  
  const staffReviews = userRole === 'staff' ? getReviewsByStaff(userId) : [];
  const positiveStaffReviews = staffReviews.filter(review => review.isPositive);
  // Mock performance data
  const performanceMetrics = {
    overallRating: 4.8,
    totalEvents: 42,
    clientSatisfaction: 4.9,
    punctuality: 98,
    reliability: 96,
    eventCompletion: 100
  };

  const skillsData = [
    { skill: "Customer Service", current: 4.8, target: 5.0 },
    { skill: "Communication", current: 4.7, target: 5.0 },
    { skill: "Punctuality", current: 4.9, target: 5.0 },
    { skill: "Professionalism", current: 4.8, target: 5.0 },
    { skill: "Teamwork", current: 4.6, target: 5.0 },
    { skill: "Problem Solving", current: 4.5, target: 5.0 }
  ];

  const monthlyPerformance = [
    { month: "Jul", rating: 4.6, events: 8 },
    { month: "Aug", rating: 4.7, events: 10 },
    { month: "Sep", rating: 4.8, events: 12 },
    { month: "Oct", rating: 4.9, events: 14 }
  ];

  const recentReviews = [
    {
      id: "review-1",
      client: "Sarah Johnson",
      event: "Corporate Gala 2024",
      date: "2024-10-15",
      rating: 5,
      comment: "Emma was absolutely fantastic! Professional, punctual, and went above and beyond to ensure our event was perfect.",
      categories: {
        punctuality: 5,
        professionalism: 5,
        qualityOfWork: 5,
        communication: 5
      }
    },
    {
      id: "review-2",
      client: "Michael Chen",
      event: "Wedding Reception",
      date: "2024-10-08",
      rating: 4.8,
      comment: "Excellent service throughout the evening. Very attentive to details and guests were impressed.",
      categories: {
        punctuality: 5,
        professionalism: 5,
        qualityOfWork: 4,
        communication: 5
      }
    },
    {
      id: "review-3",
      client: "Jennifer Davis",
      event: "Birthday Celebration",
      date: "2024-09-28",
      rating: 4.6,
      comment: "Great work overall. Could improve on proactive communication during the event.",
      categories: {
        punctuality: 5,
        professionalism: 5,
        qualityOfWork: 4,
        communication: 4
      }
    }
  ];

  const achievements = [
    {
      id: "achievement-1",
      title: "Top Performer",
      description: "Achieved 4.8+ rating for 3 consecutive months",
      icon: Trophy,
      earnedDate: "2024-10-01",
      type: "performance"
    },
    {
      id: "achievement-2",
      title: "Perfect Attendance",
      description: "100% punctuality rate for 6 months",
      icon: Clock,
      earnedDate: "2024-09-15",
      type: "reliability"
    },
    {
      id: "achievement-3",
      title: "Client Favorite",
      description: "Requested by name for 5+ events",
      icon: ThumbsUp,
      earnedDate: "2024-08-20",
      type: "client_satisfaction"
    }
  ];

  const goals = [
    {
      id: "goal-1",
      title: "Achieve 5.0 Rating",
      target: 5.0,
      current: 4.8,
      deadline: "2024-12-31",
      progress: 96
    },
    {
      id: "goal-2",
      title: "Complete 50 Events",
      target: 50,
      current: 42,
      deadline: "2024-12-31",
      progress: 84
    },
    {
      id: "goal-3",
      title: "Perfect Punctuality",
      target: 100,
      current: 98,
      deadline: "2024-12-31",
      progress: 98
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Performance</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Track your performance metrics and client feedback
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-success text-success-foreground">
            Top Performer
          </Badge>
          <Badge variant="outline">
            Rating: {performanceMetrics.overallRating} ⭐
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card className="p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4" />
              Overall Rating
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">{performanceMetrics.overallRating}</div>
            <div className="flex items-center mt-1">
              {renderStars(performanceMetrics.overallRating)}
            </div>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">{performanceMetrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8</span> this month
            </p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Punctuality
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">{performanceMetrics.punctuality}%</div>
            <p className="text-xs text-muted-foreground">On-time arrivals</p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-2 px-0">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <ThumbsUp className="w-4 h-4" />
              Client Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-0">
            <div className="text-2xl font-semibold text-foreground">{performanceMetrics.clientSatisfaction}</div>
            <p className="text-xs text-muted-foreground">Average rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Overview */}
      <div className="space-y-4 sm:space-y-6">
        <div className="adaptive-content-grid">
          {/* Performance Summary */}
          <Card className="p-6">
            <CardHeader className="px-0 pb-4">
              <CardTitle className="text-lg">Performance Summary</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your overall rating and feedback
              </p>
            </CardHeader>
            <CardContent className="px-0">
              <div className="text-center p-4 bg-accent rounded-lg">
                <div className="text-3xl font-semibold text-foreground">{performanceMetrics.overallRating}</div>
                <div className="flex justify-center gap-1 my-2">
                  {renderStars(performanceMetrics.overallRating)}
                </div>
                <p className="text-sm text-muted-foreground">Overall Rating</p>
                <p className="text-xs text-muted-foreground mt-1">Based on {performanceMetrics.totalEvents} events</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card className="p-6">
            <CardHeader className="px-0 pb-4">
              <CardTitle className="text-lg">Recent Achievements</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest awards and recognitions
              </p>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-3">
                {achievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-warning rounded-full flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{achievement.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(achievement.earnedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Goals */}
          <Card className="p-6">
            <CardHeader className="px-0 pb-4">
              <CardTitle className="text-lg">Current Goals</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your progress towards targets
              </p>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-4">
                {goals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{goal.title}</span>
                      <span className="text-xs text-muted-foreground">{goal.current}/{goal.target}</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <CardHeader className="px-0 pb-4">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest updates and feedback
              </p>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                  <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">5-star review received</h4>
                    <p className="text-xs text-muted-foreground">Corporate Gala 2024</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2 days ago</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                  <div className="w-8 h-8 bg-warning rounded-full flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">Achievement unlocked</h4>
                    <p className="text-xs text-muted-foreground">Top Performer badge earned</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1 week ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Performance Data */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews">Client Reviews</TabsTrigger>
          <TabsTrigger value="goals">Goals & Achievements</TabsTrigger>
          <TabsTrigger value="skills">Skills Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[4, 5]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="rating" stroke="#5E1916" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Events</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="events" fill="#5E1916" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="p-4 border rounded-lg text-center">
                    <Award className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">Earned: {achievement.earnedDate}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          {userRole === 'staff' ? (
            // Staff-specific reviews view
            <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              <div className="lg:col-span-3 xl:col-span-4">
                <Card className="p-6">
                  <CardHeader className="px-0 pb-4">
                    <CardTitle className="text-lg">Client Reviews</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Feedback from your recent events
                    </p>
                  </CardHeader>
                  <CardContent className="px-0">
                    <div className="space-y-4">
                      {positiveStaffReviews.map((review) => (
                        <div key={review.id} className="p-4 border border-border rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium">{review.eventName}</h4>
                              <p className="text-sm text-muted-foreground">{review.clientName}</p>
                              <p className="text-sm text-muted-foreground">{review.venue}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(review.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'text-warning fill-current' : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-foreground">{review.review}</p>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3 pt-3 border-t">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Punctuality</p>
                              <p className="text-sm font-medium">{review.categories.punctuality}/5</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Professional</p>
                              <p className="text-sm font-medium">{review.categories.professionalism}/5</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Quality</p>
                              <p className="text-sm font-medium">{review.categories.quality}/5</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Communication</p>
                              <p className="text-sm font-medium">{review.categories.communication}/5</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="p-6">
                  <CardHeader className="px-0 pb-4">
                    <CardTitle className="text-lg">Performance Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="px-0">
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-accent rounded-lg">
                        <div className="text-3xl font-bold text-foreground">
                          {staffReviews.length > 0 ? (staffReviews.reduce((sum, review) => sum + review.rating, 0) / staffReviews.length).toFixed(1) : '0.0'}
                        </div>
                        <div className="flex justify-center gap-1 my-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.round(staffReviews.reduce((sum, review) => sum + review.rating, 0) / staffReviews.length) ? 'text-warning fill-current' : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">Overall Rating</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Positive Reviews</span>
                          <span className="text-sm font-medium">{positiveStaffReviews.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Total Reviews</span>
                          <span className="text-sm font-medium">{staffReviews.length}</span>
                        </div>
                      </div>

                      <Separator />

                      <Button variant="outline" className="w-full">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact Admin for Feedback
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            // Admin/Client view
            <Card>
              <CardHeader>
                <CardTitle>Recent Client Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{review.client.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.client}</p>
                            <p className="text-sm text-muted-foreground">{review.event}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                            <span className="ml-1 font-semibold">{review.rating}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      <p className="text-sm mb-3">{review.comment}</p>
                      <div className="grid grid-cols-4 gap-4 text-xs">
                        <div>
                          <p className="text-muted-foreground">Punctuality</p>
                          <div className="flex items-center">
                            {renderStars(review.categories.punctuality)}
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Professionalism</p>
                          <div className="flex items-center">
                            {renderStars(review.categories.professionalism)}
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quality</p>
                          <div className="flex items-center">
                            {renderStars(review.categories.qualityOfWork)}
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Communication</p>
                          <div className="flex items-center">
                            {renderStars(review.categories.communication)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{goal.title}</span>
                        <span className="text-sm text-muted-foreground">{goal.current}/{goal.target}</span>
                      </div>
                      <Progress value={goal.progress} />
                      <p className="text-xs text-muted-foreground">Deadline: {goal.deadline}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievements Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-2 border rounded">
                      <Award className="h-6 w-6 text-yellow-500" />
                      <div className="flex-1">
                        <p className="font-medium">{achievement.title}</p>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {achievement.earnedDate}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Skills Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={skillsData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis domain={[0, 5]} />
                    <Radar dataKey="current" stroke="#5E1916" fill="#5E1916" fillOpacity={0.1} />
                    <Radar dataKey="target" stroke="#7A1712" strokeDasharray="5 5" fill="transparent" />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillsData.map((skill) => (
                    <div key={skill.skill} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{skill.skill}</span>
                        <span className="text-sm">{skill.current}/5.0</span>
                      </div>
                      <Progress value={(skill.current / 5) * 100} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Current: {skill.current}</span>
                        <span>Target: {skill.target}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}