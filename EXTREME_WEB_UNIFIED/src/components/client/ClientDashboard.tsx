import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Calendar, Clock, MapPin, Users, DollarSign, Star, Plus } from "lucide-react";
import { mockEvents, mockRatings, mockStaff, Event, Rating } from "../../data/mockData";
import { EventBookingForm } from "./EventBookingForm";
import { StaffRatingForm } from "./StaffRatingForm";

interface ClientDashboardProps {
  clientId: string;
}

export function ClientDashboard({ clientId }: ClientDashboardProps) {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const clientEvents = mockEvents.filter(event => event.clientId === clientId);
  const upcomingEvents = clientEvents.filter(event => new Date(event.date) >= new Date());
  const pastEvents = clientEvents.filter(event => new Date(event.date) < new Date());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStaffRating = (staffId: string) => {
    const staff = mockStaff.find(s => s.id === staffId);
    return staff?.rating || 0;
  };

  const getStaffName = (staffId: string) => {
    const staff = mockStaff.find(s => s.id === staffId);
    return staff?.name || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-red-50/30">
      <div className="p-6 space-y-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-foreground mb-2">Welcome back, Client!</h2>
          <p className="text-muted-foreground">Manage your events and track your bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Events</CardTitle>
              <Calendar className="h-5 w-5 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{clientEvents.length}</div>
              <p className="text-xs text-blue-200 mt-1">All time events</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-100">Upcoming Events</CardTitle>
              <Clock className="h-5 w-5 text-emerald-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{upcomingEvents.length}</div>
              <p className="text-xs text-emerald-200 mt-1">Next 30 days</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Total Investment</CardTitle>
              <DollarSign className="h-5 w-5 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${clientEvents.reduce((sum, event) => sum + event.budget, 0).toLocaleString()}
              </div>
              <p className="text-xs text-purple-200 mt-1">Event budget total</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-100">Staff Hired</CardTitle>
              <Users className="h-5 w-5 text-red-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {clientEvents.reduce((sum, event) => sum + event.assignedStaff.length, 0)}
              </div>
              <p className="text-xs text-red-200 mt-1">Professional staff</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px] bg-white shadow-md">
            <TabsTrigger value="events" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Events
            </TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              My Staff
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-foreground">Your Events</h3>
                <p className="text-muted-foreground">Manage and track your event bookings</p>
              </div>
              <Button onClick={() => setShowBookingForm(true)} className="shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Book New Event
              </Button>
            </div>

            <div className="grid gap-6">
              {clientEvents.map((event) => (
                <Card key={event.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                        <CardDescription className="text-base">{event.description}</CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(event.status)} px-3 py-1 text-sm font-medium`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Date</p>
                          <p className="text-sm text-blue-700">{event.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                        <Clock className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium text-emerald-900">Time</p>
                          <p className="text-sm text-emerald-700">{event.startTime} - {event.endTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <MapPin className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-purple-900">Location</p>
                          <p className="text-sm text-purple-700">{event.location}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                          <Users className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium">
                            {event.assignedStaff.length}/{event.staffRequired} Staff
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                          <DollarSign className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium">
                            ${event.budget.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      {event.status === 'completed' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowRatingForm(true);
                          }}
                          className="border-primary text-primary hover:bg-primary hover:text-white"
                        >
                          <Star className="mr-2 h-4 w-4" />
                          Rate Staff
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold text-foreground">Your Preferred Staff</h3>
              <p className="text-muted-foreground">Staff members you've worked with before</p>
            </div>
            <div className="grid gap-6">
              {mockStaff.map((staff) => (
                <Card key={staff.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-lg font-semibold">{staff.name}</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {staff.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {staff.skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{staff.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium text-yellow-700">{staff.rating}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{staff.totalEvents} events completed</span>
                        </div>
                      </div>
                      <div className="text-right space-y-3">
                        <div className="bg-green-50 px-3 py-2 rounded-lg">
                          <p className="text-lg font-semibold text-green-700">${staff.hourlyRate}</p>
                          <p className="text-xs text-green-600">per hour</p>
                        </div>
                        <Button size="sm" className="w-full">
                          Book Again
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold text-foreground">Billing History</h3>
              <p className="text-muted-foreground">Track your event expenses and payments</p>
            </div>
            <div className="grid gap-6">
              {clientEvents.map((event) => (
                <Card key={event.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h4 className="text-lg font-semibold">{event.title}</h4>
                        <p className="text-muted-foreground">{event.date}</p>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Event Budget:</span>
                            <span className="text-lg font-semibold text-foreground">
                              ${event.budget.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Deposit Paid:</span>
                            <span className="text-sm font-medium text-green-600">
                              ${event.deposit.toLocaleString()}
                            </span>
                          </div>
                          {event.tips && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Tips Added:</span>
                              <span className="text-sm font-medium text-blue-600">
                                ${event.tips.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          View Invoice
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
      </Tabs>

      {showBookingForm && (
        <EventBookingForm
          isOpen={showBookingForm}
          onClose={() => setShowBookingForm(false)}
          clientId={clientId}
        />
      )}

      {showRatingForm && selectedEvent && (
        <StaffRatingForm
          isOpen={showRatingForm}
          onClose={() => {
            setShowRatingForm(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
        />
      )}
      </div>
    </div>
  );
}
