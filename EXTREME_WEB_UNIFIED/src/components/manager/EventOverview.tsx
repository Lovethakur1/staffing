import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../ui/dialog";
import {
  Calendar,
  Search,
  MapPin,
  Users,
  Clock,
  DollarSign,
  Eye,
  Navigation,
  Phone,
  Mail,
  CheckCircle,
  AlertTriangle,
  Filter
} from "lucide-react";

interface EventOverviewProps {
  managerId: string;
  events: any[];
}

export function EventOverview({ managerId, events }: EventOverviewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const filteredEvents = useMemo(() =>
    events.filter(event => {
      const title = (event.title || event.eventName || '').toLowerCase();
      const location = (event.venue || event.location || '').toLowerCase();
      const matchesSearch = title.includes(searchTerm.toLowerCase()) ||
                            location.includes(searchTerm.toLowerCase());
      const eventStatus = (event.status || '').toLowerCase();
      const matchesStatus = statusFilter === "all" || eventStatus === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    }), [events, searchTerm, statusFilter]
  );

  const getStatusColor = (status: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'confirmed': return 'bg-primary/10 text-primary border-primary/20';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      case 'in-progress':
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getClientName = (event: any) => {
    return event.client?.user?.name
      || event.client?.companyName
      || event.clientName
      || 'Unknown Client';
  };

  const getClientEmail = (event: any) => {
    return event.client?.user?.email || event.clientEmail || '';
  };

  const getClientPhone = (event: any) => {
    return event.client?.user?.phone || event.contactOnSitePhone || '';
  };

  const getStatusIcon = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'confirmed') return <CheckCircle className="h-4 w-4" />;
    if (s === 'in-progress' || s === 'in_progress') return <Clock className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const getEventProgress = (event: any) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const eventEndTime = new Date(eventDate.getTime() + (8 * 60 * 60 * 1000));
    if (now < eventDate) return { status: 'upcoming', progress: 0 };
    if (now > eventEndTime) return { status: 'completed', progress: 100 };
    const totalDuration = eventEndTime.getTime() - eventDate.getTime();
    const elapsed = now.getTime() - eventDate.getTime();
    return { status: 'in-progress', progress: Math.min(100, Math.round((elapsed / totalDuration) * 100)) };
  };

  const getStaffCount = (event: any) => {
    const active = (event.shifts || []).filter((s: any) => s.status !== 'REJECTED');
    return active.length;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBA';
    try { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return dateStr; }
  };

  const formatTime = (event: any) => {
    const start = event.startTime || '';
    const end = event.endTime || '';
    if (!start && !end) return 'Time TBA';
    return `${start} - ${end}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Event Overview</h2>
          <p className="text-muted-foreground">Manage all events under your supervision</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const eventProgress = getEventProgress(event);
          const staffAssigned = getStaffCount(event);
          const staffRequired = event.staffRequired || 0;
          const staffingComplete = staffRequired > 0 && staffAssigned >= staffRequired;
          const venue = event.venue || event.location || 'TBA';
          const budget = parseFloat(event.budget) || 0;

          return (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{event.title || event.eventName || 'Event'}</CardTitle>
                    <p className="text-sm text-muted-foreground">{getClientName(event)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(event.status)}
                    <Badge className={getStatusColor(event.status)}>
                      {(event.status || 'unknown').toLowerCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatTime(event)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{venue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className={staffingComplete ? "text-emerald-600" : "text-amber-600"}>
                      {staffAssigned}/{staffRequired} staff
                    </span>
                    {staffingComplete
                      ? <CheckCircle className="h-4 w-4 text-emerald-600" />
                      : <AlertTriangle className="h-4 w-4 text-amber-600" />}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${budget.toLocaleString()}</span>
                  </div>
                </div>

                {eventProgress.status === 'in-progress' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Event Progress</span>
                      <span className="font-medium">{eventProgress.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${eventProgress.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          {getStatusIcon(event.status)}
                          {event.title || event.eventName}
                        </DialogTitle>
                        <DialogDescription>
                          View comprehensive event details including client information and requirements.
                        </DialogDescription>
                      </DialogHeader>
                      {selectedEvent && (
                        <div className="space-y-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-semibold mb-3">Event Information</h3>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>{formatDate(selectedEvent.date)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{formatTime(selectedEvent)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{selectedEvent.venue || selectedEvent.location || 'TBA'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>{getStaffCount(selectedEvent)}/{selectedEvent.staffRequired || 0} staff assigned</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span>${(parseFloat(selectedEvent.budget) || 0).toLocaleString()} budget</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h3 className="font-semibold mb-3">Event Description</h3>
                                <p className="text-sm text-muted-foreground">
                                  {selectedEvent.description || "No description provided."}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <h3 className="font-semibold mb-3">Client Information</h3>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>{getClientName(selectedEvent)}</span>
                                  </div>
                                  {getClientEmail(selectedEvent) && (
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-4 w-4 text-muted-foreground" />
                                      <span>{getClientEmail(selectedEvent)}</span>
                                    </div>
                                  )}
                                  {getClientPhone(selectedEvent) && (
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-4 w-4 text-muted-foreground" />
                                      <span>{getClientPhone(selectedEvent)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h3 className="font-semibold mb-3">Special Requirements</h3>
                                <p className="text-sm text-muted-foreground">
                                  {selectedEvent.specialRequirements || "No special requirements."}
                                </p>
                              </div>
                              {(selectedEvent.contactOnSite || selectedEvent.contactOnSitePhone) && (
                                <div>
                                  <h3 className="font-semibold mb-3">On-Site Contact</h3>
                                  <div className="p-3 bg-muted rounded-lg text-sm">
                                    {selectedEvent.contactOnSite && <p className="font-medium">{selectedEvent.contactOnSite}</p>}
                                    {selectedEvent.contactOnSitePhone && <p className="text-muted-foreground">{selectedEvent.contactOnSitePhone}</p>}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between pt-4 border-t">
                            <Button variant="outline">
                              <Navigation className="h-4 w-4 mr-2" />
                              View Location
                            </Button>
                            <div className="flex gap-2">
                              <Button variant="outline">
                                <Phone className="h-4 w-4 mr-2" />
                                Call Client
                              </Button>
                              <Button variant="outline">
                                <Users className="h-4 w-4 mr-2" />
                                Manage Staff
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="sm">
                    <Navigation className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">No Events Found</h3>
              <p className="text-muted-foreground">No events match your current search criteria</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
