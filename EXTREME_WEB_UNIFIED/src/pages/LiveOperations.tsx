import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import {
  Radio,
  MapPin,
  Clock,
  Users,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Timer,
  Activity,
  Phone,
  MapPinned,
  RefreshCw,
  Loader2,
  Eye,
  Navigation,
} from "lucide-react";

import { LiveTrackingMap } from "../components/dashboards/LiveTrackingMap";
import api from "../services/api";
import { toast } from "sonner";

// Types for API response
interface LiveStaff {
  id: string;
  name: string;
  role: string;
  status: string;
  checkedIn: string | null;
  location: string;
  phone: string | null;
  lat?: number;
  lng?: number;
}

interface LiveIssue {
  id: string;
  type: string;
  description: string;
  priority: string;
  reportedAt: string;
}

interface LiveEvent {
  id: string;
  name: string;
  client: string;
  clientPhone: string | null;
  venue: string;
  address: string;
  status: string;
  progress: number;
  startTime: string;
  currentTime: string;
  endTime: string;
  staff: LiveStaff[];
  staffCount: number;
  checkedInCount: number;
  issues: LiveIssue[];
  issueCount: number;
  tasks?: { id: string; task: string; assignedTo: string; completed: boolean }[];
  budget: number;
  actualSpend: number;
  revenue: number;
}

interface LiveOperationsSummary {
  activeEvents: number;
  totalStaff: number;
  checkedIn: number;
  activeIssues: number;
  overallProgress: number;
}

export function LiveOperations() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [trackingStaff, setTrackingStaff] = useState<any | null>(null);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [summary, setSummary] = useState<LiveOperationsSummary>({
    activeEvents: 0,
    totalStaff: 0,
    checkedIn: 0,
    activeIssues: 0,
    overallProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchLiveOperations = useCallback(async () => {
    try {
      const response = await api.get('/dashboard/live-operations');
      setLiveEvents(response.data.events || []);
      setSummary(response.data.summary || {
        activeEvents: 0,
        totalStaff: 0,
        checkedIn: 0,
        activeIssues: 0,
        overallProgress: 0,
      });
      setLastUpdated(new Date(response.data.lastUpdated).toLocaleTimeString());
    } catch (err) {
      console.error("Failed to load live event data", err);
      toast.error("Failed to load live operations data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveOperations();
  }, [fetchLiveOperations]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLiveOperations();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchLiveOperations]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-progress":
        return "text-green-600 bg-green-100 border-green-200";
      case "setup":
        return "text-blue-600 bg-blue-100 border-blue-200";
      case "active":
        return "text-green-600 bg-green-100";
      case "travelling":
        return "text-blue-600 bg-blue-100 animate-pulse";
      case "late":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const selectedEventData = selectedEvent
    ? liveEvents.find((e) => e.id === selectedEvent)
    : null;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading operations dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl tracking-tight flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            Live Operations
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring of {summary.activeEvents} active events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Radio className="w-3 h-3" />
            Live
          </Badge>
          <Badge variant="outline">
            Last updated: {lastUpdated || 'Just now'}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchLiveOperations}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl">{summary.activeEvents}</p>
              <p className="text-sm text-muted-foreground mt-1">Active Events</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl">{summary.totalStaff}</p>
              <p className="text-sm text-muted-foreground mt-1">Staff On Duty</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl">{summary.activeIssues}</p>
              <p className="text-sm text-muted-foreground mt-1">Active Issues</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl text-green-600">{summary.overallProgress}%</p>
              <p className="text-sm text-muted-foreground mt-1">Overall Progress</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Events List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Active Events</CardTitle>
              <CardDescription>Click to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {liveEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedEvent === event.id
                        ? "border-primary bg-accent"
                        : "hover:bg-accent/50"
                        }`}
                      onClick={() => setSelectedEvent(event.id)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-1">
                            <p className="font-medium text-sm leading-tight">{event.name}</p>
                            <p className="text-xs text-muted-foreground">{event.client}</p>
                          </div>
                          <Badge className={`${getStatusColor(event.status)} text-xs shrink-0`}>
                            {event.status === "in-progress" ? "Live" : "Setup"}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{event.progress}%</span>
                          </div>
                          <Progress value={event.progress} className="h-1.5" />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>{event.staff.length} staff</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{event.currentTime}</span>
                          </div>
                        </div>

                        {event.issues.length > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {event.issues.length} issue{event.issues.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Event Details */}
        <div className="lg:col-span-2">
          {selectedEventData ? (
            <div className="space-y-4">
              {/* Event Header Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{selectedEventData.name}</CardTitle>
                      <CardDescription>{selectedEventData.client}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(selectedEventData.status)}>
                      {selectedEventData.status === "in-progress" ? "LIVE" : "SETUP"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{selectedEventData.venue}</p>
                          <p className="text-xs text-muted-foreground">{selectedEventData.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm">
                          {selectedEventData.startTime} - {selectedEventData.endTime}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm">Current: {selectedEventData.currentTime}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Event Progress</span>
                        <span className="font-medium">{selectedEventData.progress}%</span>
                      </div>
                      <Progress value={selectedEventData.progress} />
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="text-center p-2 bg-muted rounded">
                          <p className="text-xs text-muted-foreground">Staff</p>
                          <p className="font-medium">{selectedEventData.staff.length}</p>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <p className="text-xs text-muted-foreground">Issues</p>
                          <p className="font-medium">{selectedEventData.issues.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedEventData.issues.length > 0 && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-destructive">Active Issues</p>
                          {selectedEventData.issues.map((issue: any) => (
                            <p key={issue.id} className="text-sm text-muted-foreground mt-1">
                              {issue.description}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tabs for Details */}
              <Tabs defaultValue="staff" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="staff">
                    Staff ({selectedEventData.staff.length})
                  </TabsTrigger>
                  <TabsTrigger value="tasks">
                    Tasks ({(selectedEventData.tasks || []).filter((t: any) => t.completed).length}/{(selectedEventData.tasks || []).length})
                  </TabsTrigger>
                  <TabsTrigger value="budget">Budget</TabsTrigger>
                </TabsList>

                {/* Staff Tab */}
                <TabsContent value="staff">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Staff On-Site</CardTitle>
                      <CardDescription>
                        Real-time staff status and location tracking
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-3">
                          {selectedEventData.staff.map((member: any) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>
                                    {member.name
                                      .split(" ")
                                      .map((n: any) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">{member.name}</p>
                                  <p className="text-xs text-muted-foreground">{member.role}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge className={`${getStatusColor(member.status)} text-xs`}>
                                      {member.status === 'travelling' ? 'Travelling' : member.status}
                                    </Badge>
                                    {member.checkedIn && (
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        {member.checkedIn}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right flex flex-col items-end">
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <MapPinned className="w-3 h-3" />
                                    {member.location}
                                  </p>
                                  {member.status === 'travelling' && (
                                    <Button
                                      variant="link"
                                      className="h-auto p-0 text-xs text-blue-600 mt-1"
                                      onClick={() => setTrackingStaff(member)}
                                    >
                                      View Live Map
                                    </Button>
                                  )}
                                </div>
                                <Button variant="ghost" size="icon">
                                  <Phone className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tasks Tab */}
                <TabsContent value="tasks">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Event Tasks</CardTitle>
                      <CardDescription>
                        Track task completion and assignments
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(selectedEventData.tasks || []).map((task: any) => (
                          <div
                            key={task.id}
                            className={`flex items-center justify-between p-3 border rounded-lg ${task.completed ? "bg-muted/50" : ""
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                              )}
                              <div>
                                <p
                                  className={`text-sm ${task.completed ? "line-through text-muted-foreground" : "font-medium"
                                    }`}
                                >
                                  {task.task}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Assigned to: {task.assignedTo}
                                </p>
                              </div>
                            </div>
                            <Badge variant={task.completed ? "secondary" : "outline"}>
                              {task.completed ? "Completed" : "In Progress"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Budget Tab */}
                <TabsContent value="budget">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Budget Tracking</CardTitle>
                      <CardDescription>Real-time financial overview</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Budget</p>
                          <p className="text-2xl">${selectedEventData.budget.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Actual Spend</p>
                          <p className="text-2xl">${selectedEventData.actualSpend.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Revenue</p>
                          <p className="text-2xl text-green-600">
                            ${selectedEventData.revenue.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Budget Utilization</span>
                          <span className="font-medium">
                            {Math.round((selectedEventData.actualSpend / selectedEventData.budget) * 100)}%
                          </span>
                        </div>
                        <Progress
                          value={(selectedEventData.actualSpend / selectedEventData.budget) * 100}
                        />
                      </div>

                      <Separator />

                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-900">Projected Profit</p>
                            <p className="text-xs text-green-700">Based on current metrics</p>
                          </div>
                          <p className="text-2xl font-medium text-green-600">
                            ${(selectedEventData.revenue - selectedEventData.actualSpend).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 md:grid-cols-4">
                    <Button variant="outline" className="justify-start">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message All Staff
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Manager
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Eye className="w-4 h-4 mr-2" />
                      View Full Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[600px]">
              <CardContent className="text-center">
                <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Select an Event</h3>
                <p className="text-sm text-muted-foreground">
                  Choose an event from the list to view real-time details and monitoring
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Tracking Dialog */}
      <Dialog open={!!trackingStaff} onOpenChange={(open) => !open && setTrackingStaff(null)}>
        <DialogContent className="sm:max-w-[950px] p-0 overflow-hidden bg-[#f8fafc]">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Live Tracking: {trackingStaff?.name}</DialogTitle>
            <DialogDescription>
              Tracking travel progress to {selectedEventData?.venue}
            </DialogDescription>
          </DialogHeader>

          <div className="w-full h-[600px]">
            {trackingStaff && (
              <LiveTrackingMap
                staff={trackingStaff}
                destinationName={selectedEventData?.venue || "Event Venue"}
                eta="15 mins"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
