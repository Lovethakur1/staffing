import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { TooltipWrapper, IconTooltip, InfoTooltip } from "../components/ui/tooltip-wrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  CreditCard,
  Shield,
  Heart,
  Star,
  UserCheck,
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner";
import type { Client } from "../data/mockData";
import api from "../services/api";
import { LocationMapPicker } from "../components/LocationMapPicker";

interface BookEventProps {
  userRole: string;
  userId: string;
}

export function BookEvent({
  userRole,
  userId,
}: BookEventProps) {
  const { setCurrentPage, pageParams } = useNavigation();
  const [formData, setFormData] = useState({
    eventTitle: "",
    eventType: "",
    customEventType: "",
    eventDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    isMultiDay: false,
    startTime: "",
    endTime: "",
    location: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    latitude: null as number | null,
    longitude: null as number | null,
    expectedGuests: "",
    staffRequired: "",
    staffRequirements: {} as Record<string, number>,
    experienceLevel: "",
    specialStaffingRequirements: "",
    budget: "",
    description: "",
    specialRequirements: "",
    emergencyContact: "",
    emergencyPhone: "",
    preferredStaff: [] as string[],
    selectedFavoriteEventId: "" as string,
    notes: "",
    paymentMethod: "",
    paymentTiming: "",
    requiresContract: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  const [selectedStaffTypes, setSelectedStaffTypes] = useState<string[]>([]);
  const editEventId = pageParams?.editEventId as string | undefined;
  const isEditMode = !!editEventId;

  // Load existing event data for edit mode
  useEffect(() => {
    if (!editEventId) return;
    const loadEvent = async () => {
      try {
        const res = await api.get(`/events/${editEventId}`);
        const ev = res.data;
        const locationParts = (ev.location || '').split(', ');
        setFormData(prev => ({
          ...prev,
          eventTitle: ev.title || '',
          eventType: eventTypes.includes(ev.eventType) ? ev.eventType : (ev.eventType ? 'Other' : ''),
          customEventType: !eventTypes.includes(ev.eventType) ? (ev.eventType || '') : '',
          eventDate: ev.date ? new Date(ev.date) : undefined,
          startTime: ev.startTime || '',
          endTime: ev.endTime || '',
          location: ev.venue || '',
          address: locationParts[0] || '',
          city: locationParts[1] || '',
          state: locationParts[2] || '',
          zipCode: locationParts[3] || '',
          latitude: ev.locationLat || null,
          longitude: ev.locationLng || null,
          expectedGuests: ev.guestCount ? String(ev.guestCount) : '',
          budget: ev.budget ? String(ev.budget) : '',
          description: ev.description || '',
          specialRequirements: ev.specialRequirements || '',
          emergencyContact: ev.contactOnSite || '',
          emergencyPhone: ev.contactOnSitePhone || '',
        }));
      } catch {
        toast.error('Failed to load event for editing');
      }
    };
    loadEvent();
  }, [editEventId]);

  const eventTypes = [
    "Wedding Event",
    "Mitzvah",
    "Fund Raiser",
    "Private Event",
    "Home Event",
    "Other",
  ];

  const staffTypes = [
    "Brand Ambassador",
    "Bartender",
    "Barback",
    "Server (Plated)",
    "Server (Cocktail)",
    "Server (Buffet)",
    "Chef Attendant",
    "Production Assistant",
    "Busser",
    "Event Coordinator",
    "Catering Manager",
    "Host/Hostess",
    "Security Guard",
    "Valet Attendant",
    "Coat Check Attendant",
    // Additional Services now included as staff types
    "Catering Services",
    "Audio/Video Tech",
    "Decoration Services",
    "Photography Services",
    "Setup Crew",
    "Cleanup Services",
    "Equipment Manager",
    "Event Planning Services"
  ];

  const paymentMethods = [
    "Credit Card",
    "Bank Transfer (ACH)",
    "Wire Transfer",
    "Check",
    "Corporate Account",
    "Split Payment",
  ];

  const paymentTimingOptions = [
    "Full Payment Upfront",
    "50% Deposit + 50% Before Event",
    "25% Deposit + 75% Before Event",
    "Payment After Event",
    "Net 30 Terms",
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStaffQuantityChange = (staffType: string, quantity: string) => {
    const numQuantity = parseInt(quantity) || 0;
    setFormData((prev) => ({
      ...prev,
      staffRequirements: numQuantity > 0
        ? { ...prev.staffRequirements, [staffType]: numQuantity }
        : Object.fromEntries(Object.entries(prev.staffRequirements).filter(([key]) => key !== staffType))
    }));
  };

  const addStaffType = (staffType: string) => {
    if (staffType && !formData.staffRequirements[staffType]) {
      setFormData((prev) => ({
        ...prev,
        staffRequirements: { ...prev.staffRequirements, [staffType]: 1 }
      }));
    }
  };

  // Multi-select handlers
  const handleStaffTypeSelect = (staffType: string) => {
    if (selectedStaffTypes.includes(staffType)) {
      setSelectedStaffTypes(prev => prev.filter(type => type !== staffType));
    } else {
      setSelectedStaffTypes(prev => [...prev, staffType]);
    }
  };

  const handleAddSelectedStaff = () => {
    const newRequirements = { ...formData.staffRequirements };
    selectedStaffTypes.forEach(staffType => {
      if (!newRequirements[staffType]) {
        newRequirements[staffType] = 1;
      }
    });

    setFormData(prev => ({
      ...prev,
      staffRequirements: newRequirements
    }));

    // Reset selection state
    setSelectedStaffTypes([]);
    setStaffSearchQuery("");
    setIsStaffDropdownOpen(false);
  };

  const filteredStaffTypes = staffTypes.filter(type =>
    !formData.staffRequirements[type] &&
    type.toLowerCase().includes(staffSearchQuery.toLowerCase())
  );

  // Client data for favorite events (fetched from API)  
  const [currentClient, setCurrentClient] = useState<Client | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const meRes = await api.get('/auth/me');
        const profile = meRes.data?.clientProfile;
        if (profile) {
          setCurrentClient({
            id: profile.id,
            name: meRes.data.name || '',
            company: profile.companyName || '',
            favoriteEvents: [],
          } as unknown as Client);
        }
      } catch { /* optional */ }
    };
    fetchClient();
  }, [userId]);

  // Handle "Book Again" flow from Staff Directory
  useEffect(() => {
    if (pageParams?.bookAgainEventId) {
      const favoriteEvent = currentClient?.favoriteEvents?.find(
        fav => fav.eventId === pageParams.bookAgainEventId
      );

      if (favoriteEvent) {
        setFormData(prev => ({
          ...prev,
          selectedFavoriteEventId: favoriteEvent.eventId,
          eventTitle: `${favoriteEvent.eventTitle} (Repeat)`,
          eventType: favoriteEvent.eventType,
        }));

        // Auto-select staff from favorite event
        handleFavoriteEventSelect(favoriteEvent.eventId);

        toast.success(`Pre-filled booking form with "${favoriteEvent.eventTitle}" details`);
      }
    }
  }, [pageParams?.bookAgainEventId, currentClient]);

  // Handle favorite event selection
  const handleFavoriteEventSelect = (eventId: string) => {
    const favoriteEvent = currentClient?.favoriteEvents?.find(fav => fav.eventId === eventId);

    if (favoriteEvent) {
      setFormData(prev => ({
        ...prev,
        selectedFavoriteEventId: eventId,
        preferredStaff: favoriteEvent.staffIds,
      }));

      // Show success message
      toast.success(`Selected ${favoriteEvent.staffIds.length} staff members from "${favoriteEvent.eventTitle}"`);
    } else {
      // Clear selection
      setFormData(prev => ({
        ...prev,
        selectedFavoriteEventId: "",
        preferredStaff: [],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.eventTitle ||
      !formData.eventType ||
      !formData.eventDate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate custom event type if "Other" is selected
    if (
      formData.eventType === "Other" &&
      !formData.customEventType
    ) {
      toast.error("Please specify the custom event type");
      return;
    }

    // Validate staff requirements
    if (Object.keys(formData.staffRequirements).length === 0) {
      toast.error("Please select at least one staff type");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get the client profile ID from the current user
      const meRes = await api.get('/auth/me');
      const clientProfileId = meRes.data?.clientProfile?.id;

      if (!clientProfileId) {
        toast.error("Client profile not found. Please contact support.");
        return;
      }

      const totalStaff = Object.values(formData.staffRequirements).reduce(
        (sum: number, qty) => sum + (qty as number), 0
      );

      const staffReqDescription = Object.entries(formData.staffRequirements)
        .map(([type, qty]) => `${qty}x ${type}`)
        .join(', ');

      const payload = {
        clientId: clientProfileId,
        title: formData.eventTitle,
        description: formData.description || undefined,
        eventType: formData.eventType === 'Other' ? formData.customEventType : formData.eventType,
        venue: formData.location || undefined,
        date: formData.eventDate.toISOString(),
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined,
        isMultiDay: formData.isMultiDay || false,
        endDate: formData.isMultiDay && formData.endDate ? formData.endDate.toISOString() : undefined,
        location: [formData.address, formData.city, formData.state, formData.zipCode].filter(Boolean).join(', ') || formData.location || undefined,
        locationLat: formData.latitude || undefined,
        locationLng: formData.longitude || undefined,
        staffRequired: totalStaff || undefined,
        guestCount: formData.expectedGuests ? parseInt(formData.expectedGuests) : undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        specialRequirements: [
          formData.specialRequirements,
          formData.specialStaffingRequirements,
          staffReqDescription ? `Staff needed: ${staffReqDescription}` : '',
          formData.notes,
        ].filter(Boolean).join('\n') || undefined,
        contactOnSite: formData.emergencyContact || undefined,
        contactOnSitePhone: formData.emergencyPhone || undefined,
      };

      if (isEditMode) {
        await api.put(`/events/${editEventId}`, payload);
        toast.success("Event updated successfully!");
      } else {
        await api.post('/events', payload);
        toast.success(
          "Event booking request submitted! You'll receive confirmation within 24 hours.",
        );
      }

      setTimeout(() => {
        setCurrentPage("bookings");
      }, 2000);
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || "Failed to submit booking. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateEstimatedCost = () => {
    // Calculate event duration
    let eventDuration = 6; // Default 6 hours for single day
    let numberOfDays = 1;

    // Calculate daily hours if start and end times are provided
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      const diffInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      eventDuration = Math.max(diffInHours, 5); // Minimum 5 hours per day
    }

    // Calculate number of days for multi-day events
    if (formData.isMultiDay && formData.eventDate && formData.endDate) {
      numberOfDays = Math.ceil((formData.endDate.getTime() - formData.eventDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    // Staff type hourly rates
    const staffTypeRates = {
      "Brand Ambassador": 35,
      "Bartender": 40,
      "Barback": 25,
      "Server (Plated)": 30,
      "Server (Cocktail)": 28,
      "Server (Buffet)": 25,
      "Chef Attendant": 45,
      "Production Assistant": 22,
      "Busser": 20,
      "Event Coordinator": 50,
      "Catering Manager": 55,
      "Host/Hostess": 25,
      "Security Guard": 35,
      "Valet Attendant": 23,
      "Coat Check Attendant": 20,
      // Additional Services (flat rates per event)
      "Catering Services": 200,
      "Audio/Video Tech": 150,
      "Decoration Services": 100,
      "Photography Services": 180,
      "Setup Crew": 120,
      "Cleanup Services": 80,
      "Equipment Manager": 160,
      "Event Planning Services": 300
    };

    // Calculate total cost
    let totalCost = 0;
    Object.entries(formData.staffRequirements).forEach(([staffType, quantity]) => {
      const rate = staffTypeRates[staffType as keyof typeof staffTypeRates] || 25;

      // Service-based staff are flat rates, others are hourly
      if (staffType.includes("Services") || staffType.includes("Tech") || staffType === "Equipment Manager") {
        totalCost += rate * quantity * numberOfDays;
      } else {
        totalCost += rate * quantity * eventDuration * numberOfDays;
      }
    });

    // Experience level multipliers
    const experienceLevelMultipliers = {
      "entry": 0.8,
      "mixed": 1.0,
      "experienced": 1.3,
      "expert": 1.6
    };

    const experienceMultiplier = experienceLevelMultipliers[formData.experienceLevel as keyof typeof experienceLevelMultipliers] || 1.0;

    return Math.round(totalCost * experienceMultiplier);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="desktop-first-header mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage("dashboard")}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              {isEditMode ? 'Edit Event' : 'Book New Event'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Plan your perfect event with our professional
              staff and services
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Event Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Event Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventTitle">
                      Event Title *
                    </Label>
                    <Input
                      id="eventTitle"
                      value={formData.eventTitle}
                      onChange={(e) =>
                        handleInputChange(
                          "eventTitle",
                          e.target.value,
                        )
                      }
                      placeholder="Enter event title"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventType">
                      Event Type *
                    </Label>
                    <Select
                      value={formData.eventType}
                      onValueChange={(value) =>
                        handleInputChange("eventType", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom Event Type - Full Width */}
                {formData.eventType === "Other" && (
                  <div className="w-full">
                    <Label htmlFor="customEventType">
                      Custom Event Type *
                    </Label>
                    <Input
                      id="customEventType"
                      value={formData.customEventType}
                      onChange={(e) =>
                        handleInputChange(
                          "customEventType",
                          e.target.value,
                        )
                      }
                      placeholder="Please specify your event type"
                      className="mt-1 w-full"
                    />
                  </div>
                )}

                {/* Event Duration Type Selection */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">
                      Event Duration
                    </Label>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="singleDay"
                          name="eventDuration"
                          checked={!formData.isMultiDay}
                          onChange={() =>
                            handleInputChange(
                              "isMultiDay",
                              false,
                            )
                          }
                          className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                        />
                        <Label
                          htmlFor="singleDay"
                          className="text-sm font-normal cursor-pointer"
                        >
                          Single Day Event
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="multiDay"
                          name="eventDuration"
                          checked={formData.isMultiDay}
                          onChange={() =>
                            handleInputChange(
                              "isMultiDay",
                              true,
                            )
                          }
                          className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                        />
                        <Label
                          htmlFor="multiDay"
                          className="text-sm font-normal cursor-pointer"
                        >
                          Multi-Day Event
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>
                        {formData.isMultiDay
                          ? "Start Date *"
                          : "Event Date *"}
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal mt-1",
                              !formData.eventDate &&
                              "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-full" />
                            {formData.eventDate
                              ? formData.eventDate.toLocaleDateString()
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.eventDate}
                            onSelect={(date) => {
                              handleInputChange(
                                "eventDate",
                                date,
                              );
                              // If multi-day and no end date set, set end date to same as start date
                              if (
                                formData.isMultiDay &&
                                !formData.endDate &&
                                date
                              ) {
                                handleInputChange(
                                  "endDate",
                                  date,
                                );
                              }
                              // If switching to single day, clear end date
                              if (
                                !formData.isMultiDay &&
                                formData.endDate
                              ) {
                                handleInputChange(
                                  "endDate",
                                  undefined,
                                );
                              }
                            }}
                            disabled={(date) =>
                              date <
                              new Date(
                                new Date().setHours(0, 0, 0, 0),
                              )
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {formData.isMultiDay && (
                      <div>
                        <Label>End Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal mt-1",
                                !formData.endDate &&
                                "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.endDate
                                ? formData.endDate.toLocaleDateString()
                                : "Pick end date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.endDate}
                              onSelect={(date) =>
                                handleInputChange(
                                  "endDate",
                                  date,
                                )
                              }
                              disabled={(date) => {
                                const today = new Date(
                                  new Date().setHours(
                                    0,
                                    0,
                                    0,
                                    0,
                                  ),
                                );
                                const startDate =
                                  formData.eventDate || today;
                                return date < startDate;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>

                  {/* Time Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">
                        {formData.isMultiDay
                          ? "Daily Start Time"
                          : "Start Time"}
                      </Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) =>
                          handleInputChange(
                            "startTime",
                            e.target.value,
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">
                        {formData.isMultiDay
                          ? "Daily End Time"
                          : "End Time"}
                      </Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) =>
                          handleInputChange(
                            "endTime",
                            e.target.value,
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Event Duration Display */}
                  {formData.isMultiDay &&
                    formData.eventDate &&
                    formData.endDate && (
                      <div className="bg-muted p-3 rounded-md">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarIcon className="h-4 w-4" />
                          <span>
                            Event Duration:{" "}
                            {Math.ceil(
                              (formData.endDate.getTime() -
                                formData.eventDate.getTime()) /
                              (1000 * 60 * 60 * 24),
                            ) + 1}{" "}
                            days
                            {formData.startTime &&
                              formData.endTime && (
                                <span className="ml-2">
                                  • Daily: {formData.startTime}{" "}
                                  - {formData.endTime}
                                </span>
                              )}
                          </span>
                        </div>
                      </div>
                    )}
                </div>

                <div>
                  <Label htmlFor="description">
                    Event Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange(
                        "description",
                        e.target.value,
                      )
                    }
                    placeholder="Describe your event, its purpose, and any specific requirements"
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Event Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="location">Venue Name</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange(
                        "location",
                        e.target.value,
                      )
                    }
                    placeholder="Enter venue name"
                    className="mt-1"
                  />
                </div>

                {/* Map Location Picker */}
                <div className="space-y-2">
                  <Label>Select Location on Map</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Search for an address or click on the map to set the exact location
                  </p>
                  <LocationMapPicker
                    initialLatitude={formData.latitude || 40.7128}
                    initialLongitude={formData.longitude || -74.0060}
                    onLocationSelect={(locationData) => {
                      setFormData((prev) => ({
                        ...prev,
                        address: locationData.address || prev.address,
                        city: locationData.city || prev.city,
                        state: locationData.state || prev.state,
                        zipCode: locationData.zipCode || prev.zipCode,
                        latitude: locationData.latitude,
                        longitude: locationData.longitude,
                      }));
                    }}
                  />
                </div>

                <Separator className="my-4" />

                <div>
                  <Label htmlFor="address">
                    Street Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange(
                        "address",
                        e.target.value,
                      )
                    }
                    placeholder="Enter street address"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange(
                          "city",
                          e.target.value,
                        )
                      }
                      placeholder="City"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) =>
                        handleInputChange(
                          "state",
                          e.target.value,
                        )
                      }
                      placeholder="State"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) =>
                        handleInputChange(
                          "zipCode",
                          e.target.value,
                        )
                      }
                      placeholder="ZIP"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Coordinates Display */}
                {formData.latitude && formData.longitude && (
                  <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label className="text-xs text-muted-foreground">Latitude</Label>
                      <p className="text-sm font-medium">{formData.latitude.toFixed(6)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Longitude</Label>
                      <p className="text-sm font-medium">{formData.longitude.toFixed(6)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Favorite Events Selection */}
            <FavoriteEventsSelection
              userId={userId}
              onEventSelect={handleFavoriteEventSelect}
              selectedEventId={formData.selectedFavoriteEventId}
            />

            {/* Comprehensive Staffing Requirements */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Staffing Requirements
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure your staffing needs with detailed specifications and flexible options
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Event Size & Basic Requirements */}
                <div className="space-y-4">
                  <h4 className="font-medium text-base">Event Size & Basic Requirements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="expectedGuests">Expected Guests *</Label>
                      <Input
                        id="expectedGuests"
                        type="number"
                        value={formData.expectedGuests}
                        onChange={(e) => handleInputChange("expectedGuests", e.target.value)}
                        placeholder="Number of guests"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Total number of attendees expected
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="staffRequired">Number of Staff</Label>
                      <Input
                        id="staffRequired"
                        type="number"
                        value={formData.staffRequired}
                        onChange={(e) => handleInputChange("staffRequired", e.target.value)}
                        placeholder="Total staff needed"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Estimated total staff required
                      </p>
                    </div>
                    <div>
                      <Label>Experience Level</Label>
                      <Select value={formData.experienceLevel} onValueChange={(value) => handleInputChange("experienceLevel", value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="mixed">Mixed Experience</SelectItem>
                          <SelectItem value="experienced">Experienced Only</SelectItem>
                          <SelectItem value="expert">Expert Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Staff Requirements & Services */}
                <div className="space-y-4">
                  <h4 className="font-medium text-base">Staff Requirements *</h4>

                  {/* Multi-Select Staff Type Dropdown */}
                  <div className="space-y-2">
                    <Popover open={isStaffDropdownOpen} onOpenChange={setIsStaffDropdownOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={isStaffDropdownOpen}
                          className="w-full justify-between"
                        >
                          {selectedStaffTypes.length > 0
                            ? `${selectedStaffTypes.length} staff type(s) selected`
                            : "Select staff types & services..."
                          }
                          <Users className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <div className="flex flex-col max-h-80">
                          {/* Search Bar */}
                          <div className="p-3 border-b">
                            <Input
                              placeholder="Search staff types..."
                              value={staffSearchQuery}
                              onChange={(e) => setStaffSearchQuery(e.target.value)}
                              className="h-9"
                            />
                          </div>

                          {/* Staff Types List */}
                          <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {filteredStaffTypes.length > 0 ? (
                              filteredStaffTypes.map((staffType) => (
                                <div
                                  key={staffType}
                                  className="flex items-center space-x-2 p-2 hover:bg-muted rounded-sm cursor-pointer"
                                  onClick={() => handleStaffTypeSelect(staffType)}
                                >
                                  <Checkbox
                                    checked={selectedStaffTypes.includes(staffType)}
                                    onChange={() => handleStaffTypeSelect(staffType)}
                                  />
                                  <Label className="flex-1 cursor-pointer text-sm">
                                    {staffType}
                                  </Label>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-muted-foreground text-sm">
                                {staffSearchQuery ? "No staff types found" : "All staff types already added"}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="p-3 border-t space-y-2">

                            <div className="flex gap-2">
                              <Button
                                onClick={handleAddSelectedStaff}
                                disabled={selectedStaffTypes.length === 0}
                                size="sm"
                                className="flex-1"
                              >
                                Add Selected ({selectedStaffTypes.length})
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedStaffTypes([]);
                                  setStaffSearchQuery("");
                                  setIsStaffDropdownOpen(false);
                                }}
                                size="sm"
                              >
                                Done
                              </Button>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Selected Staff with Quantities */}
                  {Object.keys(formData.staffRequirements).length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Selected Staff & Quantities</Label>
                      <div className="border rounded-lg">
                        <div className="max-h-64 overflow-y-auto p-4 space-y-2">
                          {Object.entries(formData.staffRequirements).map(([staffType, quantity]) => (
                            <div key={staffType} className="flex items-center justify-between gap-4 p-2 bg-muted rounded-md">
                              <div className="flex-1">
                                <span className="text-sm font-medium">{staffType}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`quantity-${staffType}`} className="text-xs">Qty:</Label>
                                <Input
                                  id={`quantity-${staffType}`}
                                  type="number"
                                  min="1"
                                  max="50"
                                  value={quantity}
                                  onChange={(e) => handleStaffQuantityChange(staffType, e.target.value)}
                                  className="w-16 h-8 text-center"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStaffQuantityChange(staffType, "0")}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Staff Summary */}
                      <div className="text-sm text-muted-foreground">
                        Total Staff: {Object.values(formData.staffRequirements).reduce((sum, qty) => sum + qty, 0)}
                        {formData.expectedGuests && (
                          <span className="ml-2">
                            • Ratio: 1:{Math.round(parseInt(formData.expectedGuests) / Object.values(formData.staffRequirements).reduce((sum, qty) => sum + qty, 0))}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {Object.keys(formData.staffRequirements).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                      No staff selected. Use the dropdown above to add staff types.
                    </div>
                  )}
                </div>

                {/* Special Requirements */}
                <div>
                  <Label>Special Staffing Requirements</Label>
                  <Textarea
                    value={formData.specialStaffingRequirements || ""}
                    onChange={(e) => handleInputChange("specialStaffingRequirements", e.target.value)}
                    placeholder="e.g., bilingual staff, specific certifications, uniform requirements, etc."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Options */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Payment Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentMethod">
                      Preferred Payment Method
                    </Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) =>
                        handleInputChange(
                          "paymentMethod",
                          value,
                        )
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem
                            key={method}
                            value={method}
                          >
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="paymentTiming">
                      Payment Timing
                    </Label>
                    <Select
                      value={formData.paymentTiming}
                      onValueChange={(value) =>
                        handleInputChange(
                          "paymentTiming",
                          value,
                        )
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select payment timing" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentTimingOptions.map((timing) => (
                          <SelectItem
                            key={timing}
                            value={timing}
                          >
                            {timing}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requiresContract"
                    checked={formData.requiresContract}
                    onCheckedChange={(checked) =>
                      handleInputChange(
                        "requiresContract",
                        checked as boolean,
                      )
                    }
                  />
                  <Label
                    htmlFor="requiresContract"
                    className="text-sm"
                  >
                    This event requires a formal contract
                  </Label>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">
                    Payment Information
                  </h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      • All payments are processed securely
                      through our platform
                    </p>
                    <p>
                      • Deposits are required to secure your
                      booking
                    </p>
                    <p>
                      • Cancellation policies apply based on
                      event timing
                    </p>
                    <p>
                      • Corporate accounts receive Net 30
                      payment terms
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Requirements and Emergency Contact */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="specialRequirements">
                    Special Requirements
                  </Label>
                  <Textarea
                    id="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={(e) =>
                      handleInputChange(
                        "specialRequirements",
                        e.target.value,
                      )
                    }
                    placeholder="Any special requirements, dietary restrictions, accessibility needs, etc."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContact">
                      Emergency Contact Name
                    </Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContact",
                          e.target.value,
                        )
                      }
                      placeholder="Emergency contact person"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">
                      Emergency Contact Phone
                    </Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyPhone",
                          e.target.value,
                        )
                      }
                      placeholder="Emergency contact phone"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      handleInputChange("notes", e.target.value)
                    }
                    placeholder="Any additional information you'd like us to know"
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-4 self-start">
            {/* Estimated Cost */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Estimated Cost
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Event Duration Info */}
                {formData.isMultiDay &&
                  formData.eventDate &&
                  formData.endDate && (
                    <div className="bg-muted p-3 rounded-md text-sm">
                      <div className="font-medium text-primary mb-1">
                        Multi-Day Event
                      </div>
                      <div className="text-muted-foreground">
                        {Math.ceil(
                          (formData.endDate.getTime() -
                            formData.eventDate.getTime()) /
                          (1000 * 60 * 60 * 24),
                        ) + 1}{" "}
                        days
                        {formData.startTime &&
                          formData.endTime && (
                            <span className="block">
                              Daily: {formData.startTime} -{" "}
                              {formData.endTime}
                            </span>
                          )}
                      </div>
                    </div>
                  )}

                <div className="space-y-2">
                  {Object.keys(formData.staffRequirements).length > 0 ? (
                    <>
                      {Object.entries(formData.staffRequirements).map(([staffType, quantity]) => (
                        <div key={staffType} className="flex justify-between text-sm">
                          <span>{staffType} ({quantity})</span>
                          <span>
                            ${((() => {
                              const staffTypeRates = {
                                "Brand Ambassador": 35, "Bartender": 40, "Barback": 25,
                                "Server (Plated)": 30, "Server (Cocktail)": 28, "Server (Buffet)": 25,
                                "Chef Attendant": 45, "Production Assistant": 22, "Busser": 20,
                                "Event Coordinator": 50, "Catering Manager": 55, "Host/Hostess": 25,
                                "Security Guard": 35, "Valet Attendant": 23, "Coat Check Attendant": 20,
                                "Catering Services": 200, "Audio/Video Tech": 150, "Decoration Services": 100,
                                "Photography Services": 180, "Setup Crew": 120, "Cleanup Services": 80,
                                "Equipment Manager": 160, "Event Planning Services": 300
                              };
                              const rate = staffTypeRates[staffType as keyof typeof staffTypeRates] || 25;
                              const eventDuration = formData.startTime && formData.endTime ?
                                Math.max(Math.ceil((new Date(`2000-01-01T${formData.endTime}`).getTime() - new Date(`2000-01-01T${formData.startTime}`).getTime()) / (1000 * 60 * 60)), 5) : 6;

                              if (staffType.includes("Services") || staffType.includes("Tech") || staffType === "Equipment Manager") {
                                return (rate * quantity).toLocaleString();
                              } else {
                                return (rate * quantity * eventDuration).toLocaleString();
                              }
                            })())}
                          </span>
                        </div>
                      ))}
                      <Separator />
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      Add staff types to see cost breakdown
                    </div>
                  )}

                  <div className="flex justify-between font-medium">
                    <span>Estimated Total</span>
                    <span className="text-primary">
                      $
                      {calculateEstimatedCost().toLocaleString()}
                    </span>
                  </div>
                </div>

                {Object.keys(formData.staffRequirements).length > 0 && (
                  <div className="mt-3">
                    <Label className="text-xs font-medium">
                      Selected Staff & Services:
                    </Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(formData.staffRequirements).map(([type, quantity]) => (
                        <Badge
                          key={type}
                          variant="outline"
                          className="text-xs"
                        >
                          {type} ({quantity})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {formData.paymentMethod && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        Payment Details
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Method: {formData.paymentMethod}</p>
                      {formData.paymentTiming && (
                        <p>Timing: {formData.paymentTiming}</p>
                      )}
                      {formData.requiresContract && (
                        <div className="flex items-center gap-1 text-primary">
                          <Shield className="h-3 w-3" />
                          <span>Contract Required</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  *Final cost may vary based on actual
                  requirements and negotiations
                </p>

                <div>
                  <Label htmlFor="budget">
                    Your Budget Range
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) =>
                      handleInputChange(
                        "budget",
                        e.target.value,
                      )
                    }
                    placeholder="Enter your budget"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Actions */}
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6 space-y-3">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      {isEditMode ? 'Update Event' : 'Submit Event Request'}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    toast.info("Redirecting to payment gateway...");
                    // In development phase, this will redirect to payment link
                    setTimeout(() => {
                      toast.success("Payment gateway integration will be added in development phase");
                    }, 1500);
                  }}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Pay Now
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  We'll review your request and contact you
                  within 24 hours
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

// Favorite Events Selection Component
interface FavoriteEventsSelectionProps {
  userId: string;
  onEventSelect: (eventId: string) => void;
  selectedEventId: string;
}

function FavoriteEventsSelection({ userId, onEventSelect, selectedEventId }: FavoriteEventsSelectionProps) {
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const meRes = await api.get('/auth/me');
        const profile = meRes.data?.clientProfile;
        if (profile) {
          setCurrentClient({
            id: profile.id,
            name: meRes.data.name || '',
            company: profile.companyName || '',
            favoriteEvents: [],
          } as unknown as Client);
        }
      } catch { /* optional */ }
    };
    fetchClient();
  }, [userId]);

  const favoriteEvents = currentClient?.favoriteEvents || [];

  if (favoriteEvents.length === 0) {
    return null; // Don't show section if no favorite events
  }

  const selectedFavoriteEvent = favoriteEvents.find(fav => fav.eventId === selectedEventId);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Select from Your Favorite Events
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Choose from events where you previously loved the staff performance to quickly book similar teams
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dropdown Selection */}
        <div className="space-y-3">
          <Label htmlFor="favoriteEvent">Choose a Favorite Event</Label>
          <Select
            value={selectedEventId}
            onValueChange={(value) => onEventSelect(value === "none" ? "" : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select from your successful events..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-muted-foreground" />
                  <span>No selection</span>
                </div>
              </SelectItem>
              {favoriteEvents.map((favoriteEvent) => {
                const staffNames = favoriteEvent.staffIds
                  .map(staffId => staffId)
                  .filter(Boolean)
                  .slice(0, 2); // Show only first 2 names for dropdown

                return (
                  <SelectItem key={favoriteEvent.eventId} value={favoriteEvent.eventId}>
                    <div className="flex items-center justify-between w-full max-w-[400px]">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{favoriteEvent.eventTitle}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {favoriteEvent.eventType}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-muted-foreground">
                              {favoriteEvent.rating}/5
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            • {favoriteEvent.staffIds.length} staff
                          </span>
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Event Details */}
        {selectedFavoriteEvent && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-primary font-medium">
              <CheckCircle className="h-4 w-4" />
              <span>Selected: {selectedFavoriteEvent.eventTitle}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="h-3 w-3" />
                  <span>{new Date(selectedFavoriteEvent.eventDate).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <UserCheck className="h-3 w-3" />
                  <span>{selectedFavoriteEvent.staffIds.length} staff members will be selected</span>
                </div>
              </div>

              {/* Staff Preview */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Favorite Staff:
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedFavoriteEvent.staffIds
                    .map(staffId => staffId)
                    .filter(Boolean)
                    .slice(0, 3)
                    .map((name, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {name}
                      </Badge>
                    ))}
                  {selectedFavoriteEvent.staffIds.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedFavoriteEvent.staffIds.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Clear Selection Button */}
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEventSelect("")}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear Selection
              </Button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">How this works:</p>
              <p>Selecting a favorite event will automatically choose the same staff members who made that event successful. You can still modify staff requirements in the next section if needed.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
