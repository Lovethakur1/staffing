import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Progress } from "../components/ui/progress";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle,
  Send,
  Calendar,
  Users,
  MapPin
} from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

interface ClientFeedbackProps {
  userRole: string;
  userId: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  staffCount: number;
  status: 'pending-feedback' | 'feedback-submitted';
}

interface StaffRating {
  staffId: string;
  staffName: string;
  role: string;
  punctuality: number;
  professionalism: number;
  appearance: number;
  serviceQuality: number;
  communication: number;
  overallRating: number;
  comments: string;
}

export function ClientFeedback({ userRole, userId }: ClientFeedbackProps) {
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentStaffIndex, setCurrentStaffIndex] = useState(0);
  const [staffRatings, setStaffRatings] = useState<Record<string, StaffRating>>({});
  const [eventsNeedingFeedback, setEventsNeedingFeedback] = useState<Event[]>([]);
  const [eventStaff, setEventStaff] = useState<{id: string; name: string; role: string}[]>([]);
  const [submittedFeedback, setSubmittedFeedback] = useState<{eventName: string; date: string; averageRating: number; totalStaff: number; submittedAt: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/events', { params: { clientId: userId } });
        const events = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const pending: Event[] = [];
        const submitted: any[] = [];
        for (const e of events) {
          if (e.status !== 'COMPLETED') continue;
          const ev = {
            id: e.id,
            name: e.title || e.eventName || '',
            date: e.date || '',
            venue: e.venue || e.location || '',
            staffCount: e.shifts?.length || e.staffRequired || 0,
            status: 'pending-feedback' as const,
          };
          const hasReviews = (e.clientReviews && e.clientReviews.length > 0);
          if (hasReviews) {
            const avgRating = e.clientReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / e.clientReviews.length;
            submitted.push({ eventName: ev.name, date: ev.date, averageRating: avgRating, totalStaff: ev.staffCount, submittedAt: e.clientReviews[0]?.createdAt || '' });
          } else {
            pending.push(ev);
          }
        }
        setEventsNeedingFeedback(pending);
        setSubmittedFeedback(submitted);
      } catch { /* No feedback endpoint yet */ }
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  const initializeRatingForStaff = (staffId: string, staffName: string, role: string) => {
    if (!staffRatings[staffId]) {
      setStaffRatings({
        ...staffRatings,
        [staffId]: {
          staffId,
          staffName,
          role,
          punctuality: 0,
          professionalism: 0,
          appearance: 0,
          serviceQuality: 0,
          communication: 0,
          overallRating: 0,
          comments: ""
        }
      });
    }
  };

  const updateRating = (staffId: string, field: keyof StaffRating, value: any) => {
    setStaffRatings({
      ...staffRatings,
      [staffId]: {
        ...staffRatings[staffId],
        [field]: value
      }
    });
  };

  const startRating = async (event: Event) => {
    setSelectedEvent(event);
    setCurrentStaffIndex(0);
    setStaffRatings({});
    try {
      const res = await api.get(`/events/${event.id}`);
      const ev = res.data;
      const shifts = ev.shifts || [];
      const staff = shifts.map((s: any) => ({
        id: s.staffId || s.staff?.id || s.id,
        name: s.staff?.name || 'Staff',
        role: s.role || 'Staff',
      }));
      setEventStaff(staff);
      if (staff.length > 0) {
        initializeRatingForStaff(staff[0].id, staff[0].name, staff[0].role);
      }
      setShowRatingDialog(true);
    } catch {
      toast.error("Failed to load event staff");
    }
  };

  const nextStaff = () => {
    if (currentStaffIndex < eventStaff.length - 1) {
      const nextIndex = currentStaffIndex + 1;
      setCurrentStaffIndex(nextIndex);
      initializeRatingForStaff(eventStaff[nextIndex].id, eventStaff[nextIndex].name, eventStaff[nextIndex].role);
    }
  };

  const previousStaff = () => {
    if (currentStaffIndex > 0) {
      setCurrentStaffIndex(currentStaffIndex - 1);
    }
  };

  const submitAllRatings = async () => {
    if (!selectedEvent) return;
    try {
      for (const staffId of Object.keys(staffRatings)) {
        const r = staffRatings[staffId];
        const avgRating = Math.round(
          (r.punctuality + r.professionalism + r.appearance + r.serviceQuality + r.communication) / 5
        );
        await api.post('/reviews', {
          staffId,
          eventId: selectedEvent.id,
          rating: avgRating || r.overallRating || 1,
          feedback: r.comments || '',
        });
      }
      toast.success("Thank you! Your feedback has been submitted.");
      // Move event from pending to submitted
      setEventsNeedingFeedback(prev => prev.filter(e => e.id !== selectedEvent.id));
      setSubmittedFeedback(prev => [
        ...prev,
        {
          eventName: selectedEvent.name,
          date: selectedEvent.date,
          averageRating: Object.values(staffRatings).reduce((sum, r) => sum + (r.punctuality + r.professionalism + r.appearance + r.serviceQuality + r.communication) / 5, 0) / Object.keys(staffRatings).length,
          totalStaff: Object.keys(staffRatings).length,
          submittedAt: new Date().toISOString(),
        },
      ]);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to submit review");
    }
    setShowRatingDialog(false);
    setStaffRatings({});
    setCurrentStaffIndex(0);
  };

  const currentStaff = eventStaff[currentStaffIndex];
  const currentRating = staffRatings[currentStaff?.id] || {
    punctuality: 0,
    professionalism: 0,
    appearance: 0,
    serviceQuality: 0,
    communication: 0,
    overallRating: 0,
    comments: ""
  };

  const renderStars = (category: keyof StaffRating, currentValue: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => updateRating(currentStaff.id, category, star)}
            className="transition-all hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= currentValue
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Client Feedback & Ratings</h1>
          <Badge variant="outline" className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            Sub-Admin
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Monitor client satisfaction and staff ratings across events
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventsNeedingFeedback.length}</div>
            <p className="text-xs text-muted-foreground">Events awaiting your review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted Reviews</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submittedFeedback.length}</div>
            <p className="text-xs text-muted-foreground">Past event ratings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating Given</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              4.7
            </div>
            <p className="text-xs text-muted-foreground">Your average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impact Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">High</div>
            <p className="text-xs text-muted-foreground">Your feedback helps improve service</p>
          </CardContent>
        </Card>
      </div>

      {/* Events Needing Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Events Awaiting Your Feedback
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Please take a moment to rate the staff who worked at your recent events
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {eventsNeedingFeedback.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 border-orange-200"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{event.name}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {event.venue}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {event.staffCount} staff members
                    </div>
                  </div>
                </div>
                <Button onClick={() => startRating(event)}>
                  <Star className="h-4 w-4 mr-2" />
                  Rate Staff
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submitted Feedback History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Your Feedback History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {submittedFeedback.map((feedback, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{feedback.eventName}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{new Date(feedback.date).toLocaleDateString()}</span>
                    <span>{feedback.totalStaff} staff rated</span>
                    <span className="text-xs">
                      Submitted: {new Date(feedback.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-lg">{feedback.averageRating}</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Submitted
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rate Event Staff</DialogTitle>
            <DialogDescription>
              {selectedEvent?.name} - Rating {currentStaffIndex + 1} of {eventStaff.length}
            </DialogDescription>
          </DialogHeader>

          {currentStaff && (
            <div className="space-y-6">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{currentStaffIndex + 1} / {eventStaff.length}</span>
                </div>
                <Progress value={((currentStaffIndex + 1) / eventStaff.length) * 100} />
              </div>

              {/* Staff Info */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {currentStaff.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{currentStaff.name}</h3>
                  <Badge variant="outline">{currentStaff.role}</Badge>
                </div>
              </div>

              {/* Rating Categories */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Punctuality</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Arrived on time and ready to work
                  </p>
                  {renderStars('punctuality', currentRating.punctuality)}
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">Professionalism</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Professional attitude and behavior
                  </p>
                  {renderStars('professionalism', currentRating.professionalism)}
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">Appearance</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Proper dress code and grooming
                  </p>
                  {renderStars('appearance', currentRating.appearance)}
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">Service Quality</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Quality of work and attention to detail
                  </p>
                  {renderStars('serviceQuality', currentRating.serviceQuality)}
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">Communication</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Clear communication with you and guests
                  </p>
                  {renderStars('communication', currentRating.communication)}
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">Overall Rating</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Overall experience with this staff member
                  </p>
                  {renderStars('overallRating', currentRating.overallRating)}
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">Additional Comments (Optional)</Label>
                  <Textarea
                    placeholder="Share any specific feedback or suggestions..."
                    value={currentRating.comments}
                    onChange={(e) => updateRating(currentStaff.id, 'comments', e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={previousStaff}
                  disabled={currentStaffIndex === 0}
                >
                  Previous Staff
                </Button>
                {currentStaffIndex < eventStaff.length - 1 ? (
                  <Button onClick={nextStaff}>
                    Next Staff
                  </Button>
                ) : (
                  <Button onClick={submitAllRatings} className="bg-green-600 hover:bg-green-700">
                    <Send className="h-4 w-4 mr-2" />
                    Submit All Ratings
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Why Feedback Matters */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Why Your Feedback Matters</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ThumbsUp className="h-4 w-4 mt-0.5 text-blue-600" />
                  <span>Helps staff members improve their performance and advance their careers</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 mt-0.5 text-blue-600" />
                  <span>Ensures you get the best staff for your future events</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 mt-0.5 text-blue-600" />
                  <span>Contributes to overall service quality improvement</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
