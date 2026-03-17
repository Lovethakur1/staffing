import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import { Progress } from "../components/ui/progress";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Star,
  User,
  MessageSquare,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  FileText,
  Briefcase
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";

interface StaffEventHistoryDetailProps {
  userRole: string;
  userId: string;
  staffId?: string;
  eventId?: string;
}

export function StaffEventHistoryDetail({ userRole, userId, staffId, eventId }: StaffEventHistoryDetailProps) {
  const { setCurrentPage, setPageParams } = useNavigation();

  // Mock Data - In a real app, fetch this based on staffId and eventId
  const eventDetails = {
    id: eventId || "evt-001",
    name: "Corporate Gala 2024",
    client: "Acme Corp",
    date: "October 28, 2024",
    time: "18:00 - 23:00",
    venue: "Grand Ballroom, Hilton Midtown",
    address: "1335 6th Ave, New York, NY 10019",
    status: "Completed",
    role: "Event Server",
    checkIn: "17:45",
    checkOut: "23:15",
    totalHours: 6.5,
    hourlyRate: 28,
    earnings: 182,
    tip: 50,
    manager: "Sarah Jenkins",
  };

  const staffDetails = {
    id: staffId || "staff-001",
    name: "Emma Williams",
    role: "Event Server",
    avatar: "/placeholder-avatar.jpg", // Placeholder
  };

  const performanceReview = {
    rating: 5,
    punctuality: 5,
    presentation: 5,
    attitude: 5,
    feedback: "Emma was exceptional tonight. She handled the VIP section with grace and efficiency. Arrived early and stayed late to help clean up.",
    reviewer: "Sarah Jenkins (Event Manager)",
    date: "Oct 29, 2024",
  };

  const clientFeedback = {
    rating: 5,
    tags: ["Professional", "Friendly", "Efficient"],
    comment: "The server assigned to our table (Emma) was wonderful. Very attentive without being intrusive.",
    clientName: "John Doe (Acme Corp)",
  };

  // Helper to render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setPageParams({ staffId: staffId });
            setCurrentPage('staff-detail');
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {eventDetails.name}
            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
              {eventDetails.status}
            </Badge>
          </h1>
          <p className="text-muted-foreground flex items-center gap-2 text-sm mt-1">
            <Calendar className="h-3.5 w-3.5" /> {eventDetails.date}
            <span className="text-gray-300">|</span>
            <MapPin className="h-3.5 w-3.5" /> {eventDetails.venue}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Event & Shift Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Shift Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5 text-primary" />
                Shift Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Role</p>
                  <p className="font-medium mt-1">{eventDetails.role}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Check In</p>
                  <p className="font-medium mt-1 text-green-700">{eventDetails.checkIn}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Check Out</p>
                  <p className="font-medium mt-1 text-blue-700">{eventDetails.checkOut}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Duration</p>
                  <p className="font-medium mt-1">{eventDetails.totalHours} hrs</p>
                </div>
              </div>

              {/* Earnings Section (Admin Only in real app, showing for now) */}
              <div className="bg-green-50/50 border border-green-100 rounded-xl p-4">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Financials
                </h4>
                <div className="grid grid-cols-3 gap-4">
                   <div>
                      <p className="text-sm text-muted-foreground">Hourly Rate</p>
                      <p className="font-bold text-lg">${eventDetails.hourlyRate}/hr</p>
                   </div>
                   <div>
                      <p className="text-sm text-muted-foreground">Base Earnings</p>
                      <p className="font-bold text-lg">${eventDetails.earnings}</p>
                   </div>
                   <div>
                      <p className="text-sm text-muted-foreground">Tips / Bonus</p>
                      <p className="font-bold text-lg text-green-700">+${eventDetails.tip}</p>
                   </div>
                </div>
                <Separator className="my-3 bg-green-200/50" />
                <div className="flex justify-between items-center">
                   <span className="font-semibold text-green-900">Total Payout</span>
                   <span className="font-bold text-xl text-green-900">${eventDetails.earnings + eventDetails.tip}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Review Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-yellow-500" />
                Performance Review
              </CardTitle>
              <CardDescription>Internal review by {performanceReview.reviewer}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border">
                <div>
                   <p className="font-semibold text-lg">Overall Rating</p>
                   <p className="text-sm text-muted-foreground">{performanceReview.date}</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="text-right">
                      <span className="block text-3xl font-bold text-primary leading-none">{performanceReview.rating}.0</span>
                      <span className="text-xs text-muted-foreground">out of 5</span>
                   </div>
                   {renderStars(performanceReview.rating)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                       <span>Punctuality</span>
                       <span className="font-medium">{performanceReview.punctuality}/5</span>
                    </div>
                    <Progress value={performanceReview.punctuality * 20} className="h-2" />
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                       <span>Presentation</span>
                       <span className="font-medium">{performanceReview.presentation}/5</span>
                    </div>
                    <Progress value={performanceReview.presentation * 20} className="h-2" />
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                       <span>Attitude</span>
                       <span className="font-medium">{performanceReview.attitude}/5</span>
                    </div>
                    <Progress value={performanceReview.attitude * 20} className="h-2" />
                 </div>
              </div>

              <div className="space-y-2">
                 <Label className="text-sm font-semibold text-gray-700">Manager Comments</Label>
                 <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-700 italic">
                    "{performanceReview.feedback}"
                 </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Client Feedback & Meta */}
        <div className="space-y-6">
          
          {/* Client Feedback */}
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
             <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                   <MessageSquare className="h-4 w-4 text-blue-500" />
                   Client Feedback
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                         <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                         <p className="text-sm font-semibold">{clientFeedback.clientName}</p>
                         <p className="text-xs text-muted-foreground">{eventDetails.client}</p>
                      </div>
                   </div>
                   {renderStars(clientFeedback.rating)}
                </div>
                
                <div className="bg-blue-50/50 p-3 rounded-lg text-sm text-slate-700">
                   "{clientFeedback.comment}"
                </div>

                <div className="flex flex-wrap gap-2">
                   {clientFeedback.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="bg-white">
                         {tag}
                      </Badge>
                   ))}
                </div>
             </CardContent>
          </Card>

          {/* Incident / Issues Report (Optional Section) */}
          <Card>
             <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                   <AlertTriangle className="h-4 w-4 text-orange-500" />
                   Incidents & Notes
                </CardTitle>
             </CardHeader>
             <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-gray-50 rounded-lg border border-dashed">
                   <CheckCircle className="h-4 w-4 text-green-500" />
                   No incidents reported for this shift.
                </div>
             </CardContent>
          </Card>
          
          {/* Actions */}
          <Card>
             <CardContent className="pt-6 space-y-3">
                <Button className="w-full" variant="outline">
                   <FileText className="h-4 w-4 mr-2" />
                   Download Timesheet
                </Button>
                <Button className="w-full" variant="outline">
                   <MessageSquare className="h-4 w-4 mr-2" />
                   Contact {staffDetails.name.split(' ')[0]}
                </Button>
             </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
