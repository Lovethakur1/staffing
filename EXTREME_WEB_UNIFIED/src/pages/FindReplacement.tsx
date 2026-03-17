import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { ScrollArea } from "../components/ui/scroll-area";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Search,
  Clock,
  MapPin,
  DollarSign,
  Star,
  CheckCircle2,
  AlertCircle,
  Send,
  Phone,
  Mail,
  Calendar,
  User,
  Filter,
  ArrowLeft,
  Award,
  Briefcase
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  rating: number;
  completedEvents: number;
  hourlyRate: number;
  availability: 'available' | 'busy' | 'unavailable';
  distance: string;
  lastActive: string;
  skills: string[];
  certifications: string[];
  responseTime: string;
  phone: string;
  email: string;
}

export function FindReplacement() {
  const { setCurrentPage } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    availableOnly: true,
    certified: false,
    highRated: false,
    nearby: false
  });
  const [message, setMessage] = useState("");
  const [urgentRequest, setUrgentRequest] = useState(true);

  // Mock data for the urgent replacement need
  const urgentShift = {
    eventName: "Wedding Reception - Johnson",
    role: "Bartender",
    date: "Today",
    time: "6:00 PM - 2:00 AM",
    location: "Grand Hotel Ballroom",
    hourlyRate: 28,
    missingStaff: "Sarah Martinez",
    eventStartsIn: "2 hours 15 minutes"
  };

  // Mock available staff
  const availableStaff: StaffMember[] = [
    {
      id: "staff-1",
      name: "Marcus Johnson",
      role: "Bartender",
      rating: 4.9,
      completedEvents: 156,
      hourlyRate: 28,
      availability: 'available',
      distance: "2.3 miles",
      lastActive: "Online now",
      skills: ["Mixology", "Wine Service", "Flair Bartending"],
      certifications: ["TIPS Certified", "ServSafe Alcohol"],
      responseTime: "< 5 min",
      phone: "(555) 234-5678",
      email: "marcus.j@example.com"
    },
    {
      id: "staff-2",
      name: "Emily Rodriguez",
      role: "Bartender",
      rating: 4.8,
      completedEvents: 142,
      hourlyRate: 26,
      availability: 'available',
      distance: "3.7 miles",
      lastActive: "2 min ago",
      skills: ["Cocktail Making", "Beer Service", "Customer Service"],
      certifications: ["TIPS Certified", "Responsible Serving"],
      responseTime: "< 10 min",
      phone: "(555) 345-6789",
      email: "emily.r@example.com"
    },
    {
      id: "staff-3",
      name: "David Kim",
      role: "Bartender",
      rating: 4.7,
      completedEvents: 98,
      hourlyRate: 25,
      availability: 'available',
      distance: "5.1 miles",
      lastActive: "15 min ago",
      skills: ["Bar Service", "POS Systems", "Inventory"],
      certifications: ["TIPS Certified"],
      responseTime: "< 15 min",
      phone: "(555) 456-7890",
      email: "david.k@example.com"
    },
    {
      id: "staff-4",
      name: "Jessica Taylor",
      role: "Bartender",
      rating: 4.6,
      completedEvents: 87,
      hourlyRate: 25,
      availability: 'busy',
      distance: "4.2 miles",
      lastActive: "1 hour ago",
      skills: ["Bar Service", "Event Experience"],
      certifications: ["TIPS Certified"],
      responseTime: "< 30 min",
      phone: "(555) 567-8901",
      email: "jessica.t@example.com"
    }
  ];

  const filteredStaff = availableStaff.filter(staff => {
    if (searchQuery && !staff.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.availableOnly && staff.availability !== 'available') {
      return false;
    }
    if (filters.highRated && staff.rating < 4.8) {
      return false;
    }
    if (filters.certified && staff.certifications.length < 2) {
      return false;
    }
    if (filters.nearby && parseFloat(staff.distance) > 5) {
      return false;
    }
    return true;
  });

  const toggleStaffSelection = (staffId: string) => {
    setSelectedStaff(prev =>
      prev.includes(staffId)
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleSendRequest = () => {
    if (selectedStaff.length === 0) {
      toast.error("Please select at least one staff member");
      return;
    }

    const selectedNames = availableStaff
      .filter(s => selectedStaff.includes(s.id))
      .map(s => s.name)
      .join(", ");

    toast.success(`Replacement request sent to ${selectedNames}`);
    
    setTimeout(() => {
      setCurrentPage('live-operations');
    }, 1500);
  };

  const handleCallStaff = (staff: StaffMember) => {
    toast.info(`Calling ${staff.name} at ${staff.phone}`);
  };

  const handleEmailStaff = (staff: StaffMember) => {
    toast.info(`Opening email to ${staff.email}`);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage('live-operations')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl">Find Replacement Staff</h1>
              <p className="text-muted-foreground">
                Quickly find and contact available staff for urgent needs
              </p>
            </div>
          </div>
        </div>

        {/* Urgent Alert */}
        <Alert className="border-destructive bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <span className="text-destructive">Urgent Replacement Needed:</span>
              <span className="ml-2">{urgentShift.missingStaff} has not arrived for {urgentShift.eventName}</span>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Event starts in {urgentShift.eventStartsIn}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {urgentShift.role}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {urgentShift.location}
                </span>
              </div>
            </div>
            <Badge variant="destructive" className="animate-pulse">
              URGENT
            </Badge>
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Staff List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Available Staff</CardTitle>
                    <CardDescription>
                      {filteredStaff.length} qualified {urgentShift.role.toLowerCase()}(s) available
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {selectedStaff.length} selected
                  </Badge>
                </div>

                {/* Search and Filters */}
                <div className="space-y-4 pt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="available"
                        checked={filters.availableOnly}
                        onCheckedChange={(checked) =>
                          setFilters({ ...filters, availableOnly: checked as boolean })
                        }
                      />
                      <Label htmlFor="available" className="text-sm cursor-pointer">
                        Available only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="certified"
                        checked={filters.certified}
                        onCheckedChange={(checked) =>
                          setFilters({ ...filters, certified: checked as boolean })
                        }
                      />
                      <Label htmlFor="certified" className="text-sm cursor-pointer">
                        Fully certified
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="highRated"
                        checked={filters.highRated}
                        onCheckedChange={(checked) =>
                          setFilters({ ...filters, highRated: checked as boolean })
                        }
                      />
                      <Label htmlFor="highRated" className="text-sm cursor-pointer">
                        4.8+ rating
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="nearby"
                        checked={filters.nearby}
                        onCheckedChange={(checked) =>
                          setFilters({ ...filters, nearby: checked as boolean })
                        }
                      />
                      <Label htmlFor="nearby" className="text-sm cursor-pointer">
                        Within 5 miles
                      </Label>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {filteredStaff.map((staff) => (
                      <Card
                        key={staff.id}
                        className={`cursor-pointer transition-all ${
                          selectedStaff.includes(staff.id)
                            ? 'border-primary bg-primary/5'
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => toggleStaffSelection(staff.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Checkbox
                              checked={selectedStaff.includes(staff.id)}
                              onCheckedChange={() => toggleStaffSelection(staff.id)}
                              onClick={(e) => e.stopPropagation()}
                            />

                            <Avatar className="h-12 w-12">
                              <AvatarFallback>
                                {staff.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium">{staff.name}</h4>
                                  <p className="text-sm text-muted-foreground">{staff.role}</p>
                                </div>
                                <Badge
                                  variant={
                                    staff.availability === 'available'
                                      ? 'default'
                                      : staff.availability === 'busy'
                                      ? 'secondary'
                                      : 'outline'
                                  }
                                >
                                  {staff.availability}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span>{staff.rating} ({staff.completedEvents} events)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3 text-green-600" />
                                  <span>${staff.hourlyRate}/hr</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span>{staff.distance} away</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span>{staff.responseTime} response</span>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1">
                                {staff.skills.slice(0, 3).map((skill, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>

                              <div className="flex items-center gap-2">
                                {staff.certifications.map((cert, idx) => (
                                  <div key={idx} className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Award className="h-3 w-3 text-primary" />
                                    {cert}
                                  </div>
                                ))}
                              </div>

                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCallStaff(staff);
                                  }}
                                >
                                  <Phone className="h-3 w-3 mr-1" />
                                  Call
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEmailStaff(staff);
                                  }}
                                >
                                  <Mail className="h-3 w-3 mr-1" />
                                  Email
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right: Send Request */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Send Request</CardTitle>
                <CardDescription>
                  Contact selected staff members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Shift Details</Label>
                  <div className="rounded-lg border p-3 space-y-2 bg-muted/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Event:</span>
                      <span>{urgentShift.eventName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Role:</span>
                      <span>{urgentShift.role}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{urgentShift.date}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Time:</span>
                      <span>{urgentShift.time}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Rate:</span>
                      <span>${urgentShift.hourlyRate}/hr</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Selected Staff ({selectedStaff.length})</Label>
                  {selectedStaff.length > 0 ? (
                    <div className="space-y-2">
                      {availableStaff
                        .filter(s => selectedStaff.includes(s.id))
                        .map(staff => (
                          <div
                            key={staff.id}
                            className="flex items-center gap-2 text-sm p-2 rounded-lg bg-primary/10"
                          >
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span className="flex-1">{staff.name}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleStaffSelection(staff.id)}
                              className="h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No staff selected
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Add a message to the replacement request..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="urgent"
                    checked={urgentRequest}
                    onCheckedChange={(checked) => setUrgentRequest(checked as boolean)}
                  />
                  <Label htmlFor="urgent" className="text-sm cursor-pointer">
                    Mark as urgent (SMS + Email + Push notification)
                  </Label>
                </div>

                <Button
                  className="w-full"
                  onClick={handleSendRequest}
                  disabled={selectedStaff.length === 0}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Request{selectedStaff.length > 0 && ` to ${selectedStaff.length} Staff`}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setCurrentPage('live-operations')}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
