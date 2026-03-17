import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
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
import { mockUsers } from "../../data/mockData";

interface EventOverviewProps {
  managerId: string;
  events: any[];
}

export function EventOverview({ managerId, events }: EventOverviewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  const filteredEvents = useMemo(() => 
    events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || event.status === statusFilter;
      return matchesSearch && matchesStatus;
    }), [events, searchTerm, statusFilter]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-primary/10 text-primary border-primary/20';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      case 'in-progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getClientName = (clientId: string) => {
    const client = mockUsers.find(user => user.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEventProgress = (event: any) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const eventEndTime = new Date(eventDate.getTime() + (8 * 60 * 60 * 1000)); // Assume 8-hour events

    if (now < eventDate) return { status: 'upcoming', progress: 0 };
    if (now > eventEndTime) return { status: 'completed', progress: 100 };
    
    const totalDuration = eventEndTime.getTime() - eventDate.getTime();
    const elapsed = now.getTime() - eventDate.getTime();
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    
    return { status: 'in-progress', progress: Math.round(progress) };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Event Overview</h2>
          <p className="text-muted-foreground">
            Manage all events under your supervision
          </p>
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
        
        <div className="flex gap-2">
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
      </div>

      {/* Events Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const eventProgress = getEventProgress(event);
          const staffingComplete = event.assignedStaff.length >= event.staffRequired;
          
          return (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{event.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{getClientName(event.clientId)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(event.status)}
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Event Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className={staffingComplete ? "text-emerald-600" : "text-amber-600"}>
                      {event.assignedStaff.length}/{event.staffRequired} staff
                    </span>
                    {staffingComplete ? (
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${event.budget.toLocaleString()}</span>
                  </div>
                </div>

                {/* Event Progress */}
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

                {/* Action Buttons */}
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
                          {event.title}
                        </DialogTitle>
                        <DialogDescription>
                          View comprehensive event details including client information, requirements, and emergency contacts.
                        </DialogDescription>
                      </DialogHeader>
                      {selectedEvent && (
                        <div className="space-y-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Event Information */}
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-semibold mb-3">Event Information</h3>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>{selectedEvent.date}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{selectedEvent.time}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{selectedEvent.location}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>{selectedEvent.assignedStaff.length}/{selectedEvent.staffRequired} staff assigned</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span>${selectedEvent.budget.toLocaleString()} budget</span>
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

                            {/* Client Information */}
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-semibold mb-3">Client Information</h3>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>{getClientName(selectedEvent.clientId)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>client@example.com</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>+1 (555) 123-4567</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h3 className="font-semibold mb-3">Special Requirements</h3>
                                <p className="text-sm text-muted-foreground">
                                  {selectedEvent.requirements || "No special requirements."}
                                </p>
                              </div>

                              <div>
                                <h3 className="font-semibold mb-3">Emergency Contacts</h3>
                                <div className="space-y-2 text-sm">
                                  <div className="p-3 bg-muted rounded-lg">
                                    <p className="font-medium">Venue Manager</p>
                                    <p className="text-muted-foreground">+1 (555) 987-6543</p>
                                  </div>
                                  <div className="p-3 bg-muted rounded-lg">
                                    <p className="font-medium">Client Emergency</p>
                                    <p className="text-muted-foreground">+1 (555) 456-7890</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
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

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">No Events Found</h3>
              <p className="text-muted-foreground">
                No events match your current search criteria
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}