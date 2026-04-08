import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Checkbox } from "../components/ui/checkbox";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { IconTooltip } from "../components/ui/tooltip-wrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertCircle,
  Save,
  Sparkles,
  Building2,
  Mail,
  Phone,
  Star,
  UserPlus,
  ShieldCheck,
  Clock,
  Package,
  Lock,
  UserX,
  AlertTriangle,
  PlusCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner";
import { eventService } from "../services/event.service";
import { clientService } from "../services/client.service";
import { staffService } from "../services/staff.service";

interface CreateEventProps {
  userRole: string;
  userId: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  rating: number;
  hourlyRate: number;
  certifications: string[];
  availability: string;
  isFavorite?: boolean;
}

interface EventRequest {
  id: string;
  requestNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany: string;
  eventName: string;
  eventType: string;
  isMultiDay: boolean;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  estimatedGuests: number;
  budget: number;
  staffNeeded: {
    servers: number;
    bartenders: number;
    coordinators: number;
    managers: number;
  };
  favoriteStaff: string[];
  excludedStaff?: string[];
  specialStaffingRequirements: string;
  specialRequirements: string;
  equipmentNeeded: string[];
  paymentMethod: string;
  paymentTiming: string;
  requiresFormalContract: boolean;
  depositRequired: boolean;
  emergencyContactName: string;
  emergencyContactPhone: string;
  additionalNotes: string;
}


export function CreateEvent({ userRole, userId }: CreateEventProps) {
  const { setCurrentPage, pageParams } = useNavigation();

  
  const fromRequestId = pageParams?.fromRequestId;
  const isManualMode = !fromRequestId;

  const [eventRequest, setEventRequest] = useState<EventRequest | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [onGroundManager, setOnGroundManager] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdEventId, setCreatedEventId] = useState("");
  const [hasBreaks, setHasBreaks] = useState(false);
  const [breakCount, setBreakCount] = useState(1);
  const [breakDuration, setBreakDuration] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual creation form state
  const [clients, setClients] = useState<{ id: string; name: string; company: string }[]>([]);
  const [availableStaff, setAvailableStaff] = useState<StaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [manualForm, setManualForm] = useState({
    title: "",
    clientId: "",
    eventType: "Corporate Event",
    dateType: "single" as "single" | "multi",
    date: "",
    endDate: "",
    startTime: "",
    endTime: "",
    venue: "",
    location: "",
    estimatedGuests: 0,
    budget: 0,
    staffRequired: 1,
    specialRequirements: "",
    contactOnSite: "",
    contactOnSitePhone: "",
    dressCode: "",
    description: "",
  });

  // Fetch clients for manual mode dropdown
  useEffect(() => {
    if (isManualMode) {
      clientService.getClients({ limit: 100 }).then((res: any) => {
        const list = Array.isArray(res) ? res : (res?.data || res?.clients || []);
        setClients(list.map((c: any) => ({
          id: c.id,
          name: c.user?.name || c.name || "Client",
          company: c.company || "",
        })));
      }).catch(() => {
        // silently fail, admin can still type
      });
    }
  }, [isManualMode]);

  // Fetch real staff from API
  useEffect(() => {
    setStaffLoading(true);
    staffService.getStaffList({ take: 200 }).then((res: any) => {
      const list: any[] = Array.isArray(res) ? res : (res?.data || []);
      setAvailableStaff(list.map((s: any) => ({
        id: s.id,
        name: s.user?.name || s.name || "Staff",
        role: s.specialty || s.user?.role || "Staff",
        rating: parseFloat(s.rating) || 0,
        hourlyRate: parseFloat(s.hourlyRate) || 0,
        certifications: Array.isArray(s.certifications) ? s.certifications.map((c: any) => typeof c === "string" ? c : c.name || c.type || "") : (Array.isArray(s.skills) ? s.skills : []),
        availability: s.availabilityStatus === "AVAILABLE" ? "Available" : (s.availabilityStatus || "Available"),
      })));
    }).catch(() => {}).finally(() => setStaffLoading(false));
  }, []);

  // Load event request data (auto-populated mode)
  useEffect(() => {
    if (fromRequestId) {
      const fetchEvent = async () => {
        try {
          const ev = await eventService.getEvent(fromRequestId);
          const request: EventRequest = {
            id: ev.id,
            requestNumber: `REQ-${ev.id.substring(0, 4).toUpperCase()}`,
            clientId: ev.clientId || '',
            clientName: ev.client?.user?.name || ev.client?.company || 'Client',
            clientEmail: ev.client?.user?.email || '',
            clientPhone: ev.client?.user?.phone || '',
            clientCompany: ev.client?.company || '',
            eventName: ev.title || 'Untitled Event',
            eventType: ev.eventType || 'General',
            isMultiDay: false,
            startDate: ev.date || new Date().toISOString(),
            endDate: ev.date || new Date().toISOString(),
            startTime: ev.startTime || '09:00',
            endTime: ev.endTime || '17:00',
            venue: ev.venue || ev.location || '',
            address: ev.location || '',
            city: '',
            state: '',
            zipCode: '',
            estimatedGuests: ev.guestCount || 0,
            budget: ev.budget || 0,
            staffNeeded: {
              servers: ev.staffRequired || 0,
              bartenders: 0,
              coordinators: 0,
              managers: 0
            },
            favoriteStaff: [],
            specialStaffingRequirements: ev.specialRequirements || '',
            specialRequirements: ev.specialRequirements || '',
            equipmentNeeded: [],
            paymentMethod: 'Credit Card',
            paymentTiming: 'Before Event',
            requiresFormalContract: false,
            depositRequired: false,
            emergencyContactName: ev.contactOnSite || '',
            emergencyContactPhone: ev.contactOnSitePhone || '',
            additionalNotes: ''
          };
          setEventRequest(request);
          setSelectedStaff([]);
          toast.success(`Loaded event details for review.`);
        } catch (err) {
          toast.error("Failed to load event request.");
        }
      };
      fetchEvent();
    }
  }, [fromRequestId]);

  const toggleStaffSelection = (staffId: string) => {
    setSelectedStaff(prev =>
      prev.includes(staffId)
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleManualCreate = async () => {
    if (!manualForm.title.trim()) {
      toast.error("Please enter an event name");
      return;
    }
    if (!manualForm.clientId) {
      toast.error("Please select a client");
      return;
    }
    if (!manualForm.date && manualForm.dateType === "single") {
      toast.error("Please select an event date");
      return;
    }
    if (manualForm.dateType === "multi") {
      if (!manualForm.date) { toast.error("Please select a start date"); return; }
      if (!manualForm.endDate) { toast.error("Please select an end date"); return; }
      if (new Date(manualForm.endDate) <= new Date(manualForm.date)) {
        toast.error("End date must be after start date");
        return;
      }
    }
    if (!manualForm.venue.trim()) {
      toast.error("Please enter a venue");
      return;
    }
    if (!onGroundManager) {
      toast.error("Please assign an on-ground manager");
      return;
    }

    setIsSubmitting(true);
    try {
      const isMultiDay = manualForm.dateType === "multi";
      const payload = {
        clientId: manualForm.clientId,
        title: manualForm.title,
        description: manualForm.description,
        eventType: manualForm.eventType,
        venue: manualForm.venue,
        date: manualForm.date,
        startTime: manualForm.startTime || "09:00",
        endTime: manualForm.endTime || "17:00",
        location: manualForm.location || manualForm.venue,
        staffRequired: manualForm.staffRequired,
        budget: manualForm.budget,
        specialRequirements: manualForm.specialRequirements,
        dressCode: manualForm.dressCode,
        contactOnSite: manualForm.contactOnSite,
        contactOnSitePhone: manualForm.contactOnSitePhone,
        adminNotes,
        managerId: onGroundManager,
        isMultiDay,
        ...(isMultiDay && manualForm.endDate && { endDate: manualForm.endDate }),
      };
      const created = await eventService.createEvent(payload);
      setCreatedEventId(created?.id || `EVT-${Date.now()}`);
      setShowSuccessDialog(true);
      toast.success("Event created successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateEvent = async () => {
    if (selectedStaff.length === 0) {
      toast.error("Please assign at least one staff member");
      return;
    }

    if (!onGroundManager) {
      toast.error("Please assign an on-ground manager");
      return;
    }

    try {
      if (fromRequestId) {
        await eventService.updateEvent(fromRequestId, {
          managerId: onGroundManager,
          status: 'CONFIRMED'
        });
        setCreatedEventId(fromRequestId);
      } else {
        const eventId = `EVT-${Date.now()}`;
        setCreatedEventId(eventId);
      }
      setShowSuccessDialog(true);
      toast.success("Event created successfully!");
    } catch (err) {
      toast.error("Failed to approve event.");
    }
  };

  const calculateEstimatedCost = () => {
    if (!eventRequest) return 0;

    let total = 0;
    selectedStaff.forEach(staffId => {
      const staff = availableStaff.find(s => s.id === staffId);
      if (staff) {
        const hours = calculateEventHours();
        total += staff.hourlyRate * Math.max(hours, 5);
      }
    });
    return total;
  };

  const calculateEventHours = () => {
    if (!eventRequest) return 5;

    const start = new Date(`2024-01-01 ${eventRequest.startTime}`);
    const end = new Date(`2024-01-01 ${eventRequest.endTime}`);
    let hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    if (hours < 0) hours += 24;
    return hours;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM dd, yyyy");
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const estimatedCost = calculateEstimatedCost();
  const estimatedProfit = eventRequest ? eventRequest.budget - estimatedCost : 0;
  const profitMargin = eventRequest ? ((estimatedProfit / eventRequest.budget) * 100).toFixed(1) : 0;

  const totalStaffNeeded = eventRequest
    ? eventRequest.staffNeeded.servers + eventRequest.staffNeeded.bartenders +
    eventRequest.staffNeeded.coordinators + eventRequest.staffNeeded.managers
    : 0;

  const favoriteStaff = availableStaff.filter(s =>
    eventRequest?.favoriteStaff.includes(s.id)
  );

  const excludedStaff = availableStaff.filter(s =>
    eventRequest?.excludedStaff?.includes(s.id)
  );

  // ─── MANUAL CREATION MODE ──────────────────────────────────────────────────
  if (isManualMode) {
    const manualCreatedEventName = manualForm.title || "New Event";
    return (
      <div className="space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage('events')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
            <div>
              <h1>Create New Event</h1>
              <p className="text-sm text-muted-foreground">
                Fill in the event details to create a new event
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentPage('events')}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#5E1916] hover:bg-[#4E0707]"
              onClick={handleManualCreate}
              disabled={isSubmitting}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Event Information
                </CardTitle>
                <CardDescription>Basic details about the event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="title">Event Name *</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Annual Corporate Gala 2025"
                      value={manualForm.title}
                      onChange={e => setManualForm(p => ({ ...p, title: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="eventType">Event Type *</Label>
                    <Select
                      value={manualForm.eventType}
                      onValueChange={val => setManualForm(p => ({ ...p, eventType: val }))}
                    >
                      <SelectTrigger id="eventType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Corporate Event">Corporate Event</SelectItem>
                        <SelectItem value="Wedding">Wedding</SelectItem>
                        <SelectItem value="Birthday Party">Birthday Party</SelectItem>
                        <SelectItem value="Conference">Conference</SelectItem>
                        <SelectItem value="Gala">Gala</SelectItem>
                        <SelectItem value="Private Party">Private Party</SelectItem>
                        <SelectItem value="Concert">Concert</SelectItem>
                        <SelectItem value="Exhibition">Exhibition</SelectItem>
                        <SelectItem value="Charity Event">Charity Event</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="estimatedGuests">Estimated Guests</Label>
                    <Input
                      id="estimatedGuests"
                      type="number"
                      min="0"
                      placeholder="e.g. 200"
                      value={manualForm.estimatedGuests || ""}
                      onChange={e => setManualForm(p => ({ ...p, estimatedGuests: parseInt(e.target.value) || 0 }))}
                    />
                  </div>

                  {/* Event Duration - radio toggle matching the image */}
                  <div className="col-span-2">
                    <Label className="text-base font-medium">Event Duration</Label>
                    <div className="flex items-center gap-6 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="dateType"
                          value="single"
                          checked={manualForm.dateType === "single"}
                          onChange={() => setManualForm(p => ({ ...p, dateType: "single", endDate: "" }))}
                          className="w-4 h-4 accent-[#5E1916] cursor-pointer"
                        />
                        <span className="text-sm font-medium">Single Day Event</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="dateType"
                          value="multi"
                          checked={manualForm.dateType === "multi"}
                          onChange={() => setManualForm(p => ({ ...p, dateType: "multi" }))}
                          className="w-4 h-4 accent-[#5E1916] cursor-pointer"
                        />
                        <span className="text-sm font-medium">Multi-Day Event</span>
                      </label>
                    </div>
                  </div>

                  {manualForm.dateType === "single" ? (
                    <>
                      <div>
                        <Label htmlFor="date">Date *</Label>
                        <div className="relative mt-1">
                          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <Input
                            id="date"
                            type="date"
                            value={manualForm.date}
                            onChange={e => setManualForm(p => ({ ...p, date: e.target.value }))}
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Start Time</Label>
                            <Input
                              type="time"
                              value={manualForm.startTime}
                              onChange={e => setManualForm(p => ({ ...p, startTime: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>End Time</Label>
                            <Input
                              type="time"
                              value={manualForm.endTime}
                              onChange={e => setManualForm(p => ({ ...p, endTime: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Start Date + End Date */}
                      <div>
                        <Label htmlFor="startDate">Start Date *</Label>
                        <div className="relative mt-1">
                          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <Input
                            id="startDate"
                            type="date"
                            placeholder="Pick a date"
                            value={manualForm.date}
                            onChange={e => setManualForm(p => ({ ...p, date: e.target.value }))}
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date *</Label>
                        <div className="relative mt-1">
                          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <Input
                            id="endDate"
                            type="date"
                            placeholder="Pick end date"
                            value={manualForm.endDate}
                            min={manualForm.date || undefined}
                            onChange={e => setManualForm(p => ({ ...p, endDate: e.target.value }))}
                            className="pl-9"
                          />
                        </div>
                      </div>
                      {/* Daily Start Time + Daily End Time */}
                      <div>
                        <Label>Daily Start Time</Label>
                        <Input
                          type="time"
                          value={manualForm.startTime}
                          onChange={e => setManualForm(p => ({ ...p, startTime: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Daily End Time</Label>
                        <Input
                          type="time"
                          value={manualForm.endTime}
                          onChange={e => setManualForm(p => ({ ...p, endTime: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      {/* Duration badge */}
                      {manualForm.date && manualForm.endDate && (() => {
                        const days = Math.round((new Date(manualForm.endDate).getTime() - new Date(manualForm.date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                        return days > 0 ? (
                          <div className="col-span-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {days} day{days !== 1 ? "s" : ""} total
                            </Badge>
                          </div>
                        ) : null;
                      })()}
                    </>
                  )}

                  <div>
                    <Label htmlFor="dressCode">Dress Code</Label>
                    <Input
                      id="dressCode"
                      placeholder="e.g. Formal, Smart Casual"
                      value={manualForm.dressCode}
                      onChange={e => setManualForm(p => ({ ...p, dressCode: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Venue Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Venue Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="venue">Venue Name *</Label>
                  <Input
                    id="venue"
                    placeholder="e.g. Grand Ballroom Hotel"
                    value={manualForm.venue}
                    onChange={e => setManualForm(p => ({ ...p, venue: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Full Address</Label>
                  <Input
                    id="location"
                    placeholder="e.g. 123 Main Street, New York, NY 10001"
                    value={manualForm.location}
                    onChange={e => setManualForm(p => ({ ...p, location: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clientId">Select Client *</Label>
                  <Select
                    value={manualForm.clientId}
                    onValueChange={val => setManualForm(p => ({ ...p, clientId: val }))}
                  >
                    <SelectTrigger id="clientId">
                      <SelectValue placeholder="Choose a client..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.length === 0 ? (
                        <SelectItem value="loading" disabled>Loading clients...</SelectItem>
                      ) : (
                        clients.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}{c.company ? ` — ${c.company}` : ""}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Additional Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="specialRequirements">Special Requirements</Label>
                  <Textarea
                    id="specialRequirements"
                    placeholder="e.g. Premium bar service, valet parking coordination..."
                    value={manualForm.specialRequirements}
                    onChange={e => setManualForm(p => ({ ...p, specialRequirements: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description / Notes</Label>
                  <Textarea
                    id="description"
                    placeholder="Any additional notes about the event..."
                    value={manualForm.description}
                    onChange={e => setManualForm(p => ({ ...p, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactOnSite">Contact On Site</Label>
                    <Input
                      id="contactOnSite"
                      placeholder="Contact person name"
                      value={manualForm.contactOnSite}
                      onChange={e => setManualForm(p => ({ ...p, contactOnSite: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactOnSitePhone">Contact Phone</Label>
                    <Input
                      id="contactOnSitePhone"
                      placeholder="+1 (555) 123-4567"
                      value={manualForm.contactOnSitePhone}
                      onChange={e => setManualForm(p => ({ ...p, contactOnSitePhone: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Financial */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="budget">Client Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    placeholder="e.g. 25000"
                    value={manualForm.budget || ""}
                    onChange={e => setManualForm(p => ({ ...p, budget: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="staffRequired">Staff Required</Label>
                  <Input
                    id="staffRequired"
                    type="number"
                    min="1"
                    placeholder="e.g. 10"
                    value={manualForm.staffRequired || ""}
                    onChange={e => setManualForm(p => ({ ...p, staffRequired: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Staff Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Assign Staff
                </CardTitle>
                <CardDescription>Select staff members for this event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {staffLoading ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">Loading staff...</p>
                  ) : availableStaff.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No staff available</p>
                  ) : availableStaff.map((staff) => (
                      <div
                        key={staff.id}
                        className="flex items-center gap-3 p-3 bg-muted/50 border rounded-lg hover:bg-muted transition-colors"
                      >
                        <Checkbox
                          checked={selectedStaff.includes(staff.id)}
                          onCheckedChange={() => toggleStaffSelection(staff.id)}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{staff.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{staff.role}</span>
                            <span>•</span>
                            <span>⭐ {staff.rating}</span>
                            <span>•</span>
                            <span>${staff.hourlyRate}/hr</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">Total Selected</span>
                    <Badge className="bg-blue-600">{selectedStaff.length} staff</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* On-Ground Manager */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  On-Ground Manager
                </CardTitle>
                <CardDescription>Assign event manager (Required)</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={onGroundManager} onValueChange={setOnGroundManager}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager..." />
                  </SelectTrigger>
                  <SelectContent>
                  {availableStaff
                      .filter(s => s.role === "Manager" || s.role === "Event Coordinator" || s.role === "MANAGER")
                      .map((manager) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.name} - {manager.role}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Staff Breaks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Staff Breaks
                </CardTitle>
                <CardDescription>Configure break policy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasBreaks"
                    checked={hasBreaks}
                    onCheckedChange={(checked) => setHasBreaks(checked as boolean)}
                  />
                  <Label htmlFor="hasBreaks" className="cursor-pointer text-sm">
                    Client will provide breaks for staff
                  </Label>
                </div>
                {hasBreaks && (
                  <div className="space-y-4 pl-6 border-l-2 border-[#5E1916]">
                    <div className="space-y-2">
                      <Label htmlFor="breakCount">Number of Breaks</Label>
                      <Input
                        id="breakCount"
                        type="number"
                        min="1"
                        max="5"
                        value={breakCount}
                        onChange={(e) => setBreakCount(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Break Duration</Label>
                      <Select
                        value={breakDuration.toString()}
                        onValueChange={(value) => setBreakDuration(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="20">20 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admin Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Notes</CardTitle>
                <CardDescription>Internal notes (optional)</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add any internal notes about this event..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
                Event Created Successfully!
              </DialogTitle>
              <DialogDescription>
                The event has been created and is now active.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Event ID:</span>
                    <span className="text-sm text-muted-foreground">{createdEventId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Event Name:</span>
                    <span className="text-sm text-muted-foreground">{manualCreatedEventName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Staff Assigned:</span>
                    <span className="text-sm text-muted-foreground">{selectedStaff.length} members</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCurrentPage('create-event')}>
                Create Another
              </Button>
              <Button onClick={() => setCurrentPage('events')} className="bg-[#5E1916] hover:bg-[#4E0707]">
                View All Events
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ─── AUTO-POPULATED MODE (from request) ───────────────────────────────────
  if (!eventRequest) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5E1916] mx-auto mb-4" />
          Loading event request...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage('event-requests-queue')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Button>
          <div>
            <h1>Create Event from Request</h1>
            <p className="text-sm text-muted-foreground">
              Auto-populated from client request {eventRequest.requestNumber}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCurrentPage('event-requests-queue')}>
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button
            className="bg-[#5E1916] hover:bg-[#4E0707]"
            onClick={handleCreateEvent}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Auto-populated Notice */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-1">
                All Event Details Auto-Populated from Client Request
              </h3>
              <p className="text-sm text-green-800 mb-3">
                All event information below has been automatically filled from the client's submitted event request form.
                Review the details and assign staff to complete event creation.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Event Details Loaded
                </Badge>
                <Badge className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Client Info Loaded
                </Badge>
                <Badge className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {eventRequest.favoriteStaff.length} Favorites Pre-Selected
                </Badge>
                <Badge className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Payment Terms Loaded
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Request Number</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventRequest.requestNumber}</div>
            <p className="text-xs text-muted-foreground">Client approved request</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${eventRequest.budget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Client budget</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Required</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaffNeeded}</div>
            <p className="text-xs text-muted-foreground">{eventRequest.favoriteStaff.length} favorites selected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventRequest.estimatedGuests}</div>
            <p className="text-xs text-muted-foreground">Expected attendance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Event Information (Read-Only) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Event Information
                  </CardTitle>
                  <CardDescription>Auto-populated from client request</CardDescription>
                </div>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    Event Name <Badge variant="outline" className="text-xs">Auto-filled</Badge>
                  </Label>
                  <div className="mt-1.5 p-3 bg-muted/50 rounded-md border">
                    <p className="font-medium">{eventRequest.eventName}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    Event Type <Badge variant="outline" className="text-xs">Auto-filled</Badge>
                  </Label>
                  <div className="mt-1.5 p-3 bg-muted/50 rounded-md border">
                    <p>{eventRequest.eventType}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    Estimated Guests <Badge variant="outline" className="text-xs">Auto-filled</Badge>
                  </Label>
                  <div className="mt-1.5 p-3 bg-muted/50 rounded-md border">
                    <p>{eventRequest.estimatedGuests} guests</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    Event Date <Badge variant="outline" className="text-xs">Auto-filled</Badge>
                  </Label>
                  <div className="mt-1.5 p-3 bg-muted/50 rounded-md border">
                    <p>{formatDate(eventRequest.startDate)}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    Event Time <Badge variant="outline" className="text-xs">Auto-filled</Badge>
                  </Label>
                  <div className="mt-1.5 p-3 bg-muted/50 rounded-md border">
                    <p>{formatTime(eventRequest.startTime)} - {formatTime(eventRequest.endTime)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {calculateEventHours()} hours
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Venue Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Venue Information
                  </CardTitle>
                  <CardDescription>Auto-populated from client request</CardDescription>
                </div>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    Venue Name <Badge variant="outline" className="text-xs">Auto-filled</Badge>
                  </Label>
                  <div className="mt-1.5 p-3 bg-muted/50 rounded-md border">
                    <p className="font-medium">{eventRequest.venue}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    Address <Badge variant="outline" className="text-xs">Auto-filled</Badge>
                  </Label>
                  <div className="mt-1.5 p-3 bg-muted/50 rounded-md border">
                    <p>{eventRequest.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {eventRequest.city}, {eventRequest.state} {eventRequest.zipCode}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Client Information
                  </CardTitle>
                  <CardDescription>Auto-populated from client request</CardDescription>
                </div>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    Client Name <Badge variant="outline" className="text-xs">Auto-filled</Badge>
                  </Label>
                  <div className="mt-1.5 p-3 bg-muted/50 rounded-md border">
                    <p className="font-medium">{eventRequest.clientName}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    Company <Badge variant="outline" className="text-xs">Auto-filled</Badge>
                  </Label>
                  <div className="mt-1.5 p-3 bg-muted/50 rounded-md border">
                    <p>{eventRequest.clientCompany}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    Email <Badge variant="outline" className="text-xs">Auto-filled</Badge>
                  </Label>
                  <div className="mt-1.5 p-3 bg-muted/50 rounded-md border flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{eventRequest.clientEmail}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    Phone <Badge variant="outline" className="text-xs">Auto-filled</Badge>
                  </Label>
                  <div className="mt-1.5 p-3 bg-muted/50 rounded-md border flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p>{eventRequest.clientPhone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Requirements */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Staffing Requirements
                  </CardTitle>
                  <CardDescription>Auto-populated from client request</CardDescription>
                </div>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-muted-foreground">Servers</p>
                  <p className="text-2xl font-bold text-blue-700">{eventRequest.staffNeeded.servers}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-muted-foreground">Bartenders</p>
                  <p className="text-2xl font-bold text-purple-700">{eventRequest.staffNeeded.bartenders}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-muted-foreground">Coordinators</p>
                  <p className="text-2xl font-bold text-green-700">{eventRequest.staffNeeded.coordinators}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-muted-foreground">Managers</p>
                  <p className="text-2xl font-bold text-orange-700">{eventRequest.staffNeeded.managers}</p>
                </div>
              </div>

              {eventRequest.specialStaffingRequirements && (
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    Special Staffing Requirements <Badge variant="outline" className="text-xs">Auto-filled</Badge>
                  </Label>
                  <div className="mt-1.5 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                    <p className="text-sm">{eventRequest.specialStaffingRequirements}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Additional Requirements
                  </CardTitle>
                  <CardDescription>Auto-populated from client request</CardDescription>
                </div>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {eventRequest.specialRequirements && (
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    Special Requirements <Badge variant="outline" className="text-xs">Auto-filled</Badge>
                  </Label>
                  <div className="mt-1.5 p-3 bg-muted/50 rounded-md border">
                    <p className="text-sm">{eventRequest.specialRequirements}</p>
                  </div>
                </div>
              )}

              {eventRequest.equipmentNeeded.length > 0 && (
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    Equipment Needed <Badge variant="outline" className="text-xs">Auto-filled</Badge>
                  </Label>
                  <div className="mt-1.5 flex gap-2 flex-wrap">
                    {eventRequest.equipmentNeeded.map((item, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        <Package className="h-3 w-3" />
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {eventRequest.additionalNotes && (
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    Client Notes <Badge variant="outline" className="text-xs">Auto-filled</Badge>
                  </Label>
                  <div className="mt-1.5 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-sm">{eventRequest.additionalNotes}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    Emergency Contact <Badge variant="outline" className="text-xs">Auto-filled</Badge>
                  </Label>
                  <div className="mt-1.5 p-3 bg-muted/50 rounded-md border">
                    <p className="font-medium">{eventRequest.emergencyContactName}</p>
                    <p className="text-sm text-muted-foreground">{eventRequest.emergencyContactPhone}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    Payment Terms <Badge variant="outline" className="text-xs">Auto-filled</Badge>
                  </Label>
                  <div className="mt-1.5 p-3 bg-muted/50 rounded-md border">
                    <p className="font-medium">{eventRequest.paymentMethod}</p>
                    <p className="text-sm text-muted-foreground">{eventRequest.paymentTiming}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Staff Assignment (Admin Action Required) */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Summary
              </CardTitle>
              <CardDescription>Admin-only financial overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Client Budget</span>
                  <span className="font-medium text-green-600">${eventRequest.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Estimated Cost</span>
                  <span className="font-medium text-orange-600">${estimatedCost.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Estimated Profit</span>
                  <span className={`font-bold ${estimatedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${estimatedProfit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Profit Margin</span>
                  <Badge className={estimatedProfit >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {profitMargin}%
                  </Badge>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Payment Details</span>
                </div>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>• {eventRequest.paymentTiming}</p>
                  {eventRequest.depositRequired && <p>• Deposit Required</p>}
                  {eventRequest.requiresFormalContract && <p>• Formal Contract Required</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Assign Staff
              </CardTitle>
              <CardDescription>Select staff members for this event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Client's Favorite Staff - Pre-selected */}
              {favoriteStaff.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <Label className="font-medium">Client's Favorite Staff (Pre-selected)</Label>
                  </div>
                  <div className="space-y-2">
                    {favoriteStaff.map((staff) => (
                      <div
                        key={staff.id}
                        className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                      >
                        <Checkbox
                          checked={selectedStaff.includes(staff.id)}
                          onCheckedChange={() => toggleStaffSelection(staff.id)}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-yellow-100 text-yellow-700">
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{staff.name}</p>
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{staff.role}</span>
                            <span>•</span>
                            <span>⭐ {staff.rating}</span>
                            <span>•</span>
                            <span>${staff.hourlyRate}/hr</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Client's Excluded Staff - Warning Section */}
              {excludedStaff.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <UserX className="h-4 w-4 text-red-600" />
                    <Label className="font-medium text-red-900">Client Excluded Staff</Label>
                    <IconTooltip content="These staff members have been blacklisted by this client and cannot be assigned to their events">
                      <AlertCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </IconTooltip>
                  </div>
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3 mb-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-900 mb-1">⚠️ Do Not Assign</p>
                          <p className="text-xs text-red-800">
                            The client {eventRequest.clientName} has specifically excluded these staff members.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {excludedStaff.map((staff) => (
                          <div
                            key={staff.id}
                            className="flex items-center gap-3 p-3 bg-red-100 border border-red-300 rounded-lg"
                          >
                            <UserX className="h-5 w-5 text-red-600 flex-shrink-0" />
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-red-200 text-red-800">
                                {staff.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-red-900">{staff.name}</p>
                              <div className="flex items-center gap-2 text-xs text-red-700">
                                <span>{staff.role}</span>
                                <span>•</span>
                                <span>Excluded by client</span>
                              </div>
                            </div>
                            <Badge variant="destructive" className="text-xs">
                              Blocked
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Separator />

              {/* Additional Available Staff */}
              <div className="space-y-3">
                <Label>Additional Available Staff</Label>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {staffLoading ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">Loading staff...</p>
                  ) : availableStaff
                    .filter(staff => !eventRequest.favoriteStaff.includes(staff.id))
                    .map((staff) => (
                      <div
                        key={staff.id}
                        className="flex items-center gap-3 p-3 bg-muted/50 border rounded-lg hover:bg-muted transition-colors"
                      >
                        <Checkbox
                          checked={selectedStaff.includes(staff.id)}
                          onCheckedChange={() => toggleStaffSelection(staff.id)}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{staff.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{staff.role}</span>
                            <span>•</span>
                            <span>⭐ {staff.rating}</span>
                            <span>•</span>
                            <span>${staff.hourlyRate}/hr</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Total Selected</span>
                  <Badge className="bg-blue-600">{selectedStaff.length} / {totalStaffNeeded}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* On-Ground Manager Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                On-Ground Manager
              </CardTitle>
              <CardDescription>Assign event manager (Required)</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={onGroundManager} onValueChange={setOnGroundManager}>
                <SelectTrigger>
                  <SelectValue placeholder="Select manager..." />
                </SelectTrigger>
                <SelectContent>
                  {availableStaff
                    .filter(s => s.role === "Manager" || s.role === "Event Coordinator" || s.role === "MANAGER")
                    .map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name} - {manager.role}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Staff Break Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Staff Breaks
              </CardTitle>
              <CardDescription>Configure break policy for staff members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasBreaks"
                  checked={hasBreaks}
                  onCheckedChange={(checked) => setHasBreaks(checked as boolean)}
                />
                <Label
                  htmlFor="hasBreaks"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Client will provide breaks for staff
                </Label>
              </div>

              {hasBreaks && (
                <div className="space-y-4 pl-6 border-l-2 border-[#5E1916]">
                  <div className="space-y-2">
                    <Label htmlFor="breakCount">Number of Breaks</Label>
                    <Input
                      id="breakCount"
                      type="number"
                      min="1"
                      max="5"
                      value={breakCount}
                      onChange={(e) => setBreakCount(parseInt(e.target.value) || 1)}
                      placeholder="e.g., 2"
                    />
                    <p className="text-xs text-muted-foreground">
                      How many breaks each staff member can take during the event
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
                    <Select
                      value={breakDuration.toString()}
                      onValueChange={(value) => setBreakDuration(parseInt(value))}
                    >
                      <SelectTrigger id="breakDuration">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="20">20 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Duration for each break
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Break Summary</span>
                    </div>
                    <p className="text-xs text-green-800">
                      Staff members can take {breakCount} break{breakCount > 1 ? 's' : ''} of {breakDuration} minute{breakDuration > 1 ? 's' : ''} each during this event.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Notes</CardTitle>
              <CardDescription>Internal notes (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any internal notes about this event..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
              Event Created Successfully!
            </DialogTitle>
            <DialogDescription>
              Event has been created and staff assignments are being processed
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Event ID:</span>
                  <span className="text-sm text-muted-foreground">{createdEventId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Event Name:</span>
                  <span className="text-sm text-muted-foreground">{eventRequest.eventName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Staff Assigned:</span>
                  <span className="text-sm text-muted-foreground">{selectedStaff.length} members</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className="bg-green-600">Confirmed</Badge>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCurrentPage('event-requests-queue')}>
              Back to Requests
            </Button>
            <Button onClick={() => setCurrentPage('events')} className="bg-[#5E1916] hover:bg-[#4E0707]">
              View All Events
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
