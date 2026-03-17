import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { ScrollArea } from "../components/ui/scroll-area";
import { Progress } from "../components/ui/progress";
import { Switch } from "../components/ui/switch";
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  DollarSign,
  FileText,
  CheckCircle2,
  Plus,
  X,
  Search,
  Upload,
  Clock,
  ChevronRight,
  AlertCircle,
  Save,
  Send,
  Copy,
  Sparkles,
  Building2,
  Mail,
  Phone,
  User,
  Briefcase,
  Star,
  Award,
  ShoppingCart
} from "lucide-react";
import { format } from "date-fns";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner@2.0.3";

interface CreateEventProps {
  userRole: string;
  userId: string;
}

interface StaffRequirement {
  id: string;
  role: string;
  quantity: number;
  hourlyRate: number;
  requiredSkills: string[];
  certifications: string[];
}

interface EventFormData {
  // Step 1: Event Details
  eventName: string;
  eventType: string;
  eventDate: Date | undefined;
  startTime: string;
  endTime: string;
  venue: string;
  venueAddress: string;
  estimatedGuests: string;
  
  // Step 2: Client Information
  clientType: 'existing' | 'new';
  existingClientId: string;
  newClientName: string;
  newClientEmail: string;
  newClientPhone: string;
  newClientCompany: string;
  
  // Step 3: Staff Requirements
  staffRequirements: StaffRequirement[];
  
  // Step 4: Pricing
  pricingModel: 'hourly' | 'flat' | 'package';
  depositPercentage: string;
  paymentTerms: string;
  additionalFees: { name: string; amount: number }[];
  
  // Step 5: Additional Details
  specialRequests: string;
  equipment: string[];
  documents: File[];
  internalNotes: string;
  
  // Settings
  status: 'draft' | 'pending' | 'confirmed';
  sendClientNotification: boolean;
}

export function CreateEvent({ userRole, userId }: CreateEventProps) {
  const { setCurrentPage } = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EventFormData>({
    eventName: "",
    eventType: "",
    eventDate: undefined,
    startTime: "",
    endTime: "",
    venue: "",
    venueAddress: "",
    estimatedGuests: "",
    clientType: 'existing',
    existingClientId: "",
    newClientName: "",
    newClientEmail: "",
    newClientPhone: "",
    newClientCompany: "",
    staffRequirements: [],
    pricingModel: 'hourly',
    depositPercentage: "50",
    paymentTerms: "net-30",
    additionalFees: [],
    specialRequests: "",
    equipment: [],
    internalNotes: "",
    status: 'draft',
    sendClientNotification: true,
    documents: []
  });

  // Mock data
  const existingClients = [
    { id: "client-1", name: "TechCorp Inc", email: "contact@techcorp.com", events: 12 },
    { id: "client-2", name: "Wedding - Johnson", email: "johnson@example.com", events: 1 },
    { id: "client-3", name: "Corporate Events Ltd", email: "events@corporate.com", events: 8 },
    { id: "client-4", name: "Smith Foundation", email: "info@smithfound.org", events: 5 }
  ];

  const eventTypes = [
    "Wedding", "Corporate Event", "Birthday Party", "Anniversary", 
    "Conference", "Gala", "Fundraiser", "Product Launch", 
    "Team Building", "Holiday Party", "Other"
  ];

  const staffRoles = [
    "Bartender", "Server", "Event Coordinator", "Catering Manager",
    "Setup Crew", "Chef", "Sous Chef", "Busser", "Captain", "Valet"
  ];

  const availableEquipment = [
    "Tables", "Chairs", "Linens", "Glassware", "Silverware",
    "Sound System", "Microphones", "Lighting", "Projector",
    "Dance Floor", "Bar Equipment", "Warming Trays"
  ];

  const steps = [
    { number: 1, name: "Event Details", icon: CalendarIcon },
    { number: 2, name: "Client Info", icon: User },
    { number: 3, name: "Staff Needs", icon: Users },
    { number: 4, name: "Pricing", icon: DollarSign },
    { number: 5, name: "Additional", icon: FileText },
    { number: 6, name: "Review", icon: CheckCircle2 }
  ];

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addStaffRequirement = () => {
    const newReq: StaffRequirement = {
      id: `staff-req-${Date.now()}`,
      role: "",
      quantity: 1,
      hourlyRate: 25,
      requiredSkills: [],
      certifications: []
    };
    setFormData(prev => ({
      ...prev,
      staffRequirements: [...prev.staffRequirements, newReq]
    }));
  };

  const updateStaffRequirement = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      staffRequirements: prev.staffRequirements.map(req =>
        req.id === id ? { ...req, [field]: value } : req
      )
    }));
  };

  const removeStaffRequirement = (id: string) => {
    setFormData(prev => ({
      ...prev,
      staffRequirements: prev.staffRequirements.filter(req => req.id !== id)
    }));
  };

  const addAdditionalFee = () => {
    setFormData(prev => ({
      ...prev,
      additionalFees: [...prev.additionalFees, { name: "", amount: 0 }]
    }));
  };

  const updateAdditionalFee = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      additionalFees: prev.additionalFees.map((fee, i) =>
        i === index ? { ...fee, [field]: value } : fee
      )
    }));
  };

  const removeAdditionalFee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalFees: prev.additionalFees.filter((_, i) => i !== index)
    }));
  };

  const calculateTotalCost = () => {
    let total = 0;
    
    // Calculate staff costs
    formData.staffRequirements.forEach(req => {
      if (formData.startTime && formData.endTime) {
        const hours = calculateHours(formData.startTime, formData.endTime);
        total += req.quantity * req.hourlyRate * hours;
      }
    });
    
    // Add additional fees
    formData.additionalFees.forEach(fee => {
      total += fee.amount;
    });
    
    return total;
  };

  const calculateHours = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    let hours = endHour - startHour;
    let minutes = endMin - startMin;
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }
    // Apply 5-hour minimum
    const totalHours = hours + minutes / 60;
    return Math.max(totalHours, 5);
  };

  const calculateDeposit = () => {
    const total = calculateTotalCost();
    const percentage = parseFloat(formData.depositPercentage) || 0;
    return (total * percentage) / 100;
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.eventName && formData.eventType && formData.eventDate && 
               formData.startTime && formData.endTime && formData.venue;
      case 2:
        if (formData.clientType === 'existing') {
          return formData.existingClientId;
        } else {
          return formData.newClientName && formData.newClientEmail;
        }
      case 3:
        return formData.staffRequirements.length > 0 && 
               formData.staffRequirements.every(req => req.role && req.quantity > 0);
      case 4:
        return formData.pricingModel && formData.depositPercentage;
      case 5:
        return true; // Optional step
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleSaveDraft = () => {
    toast.success("Event saved as draft");
    setTimeout(() => setCurrentPage('events'), 1000);
  };

  const handleCreateEvent = () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      toast.error("Please complete all required steps");
      return;
    }
    
    toast.success("Event created successfully!");
    setTimeout(() => setCurrentPage('events'), 1500);
  };

  const handleDuplicateEvent = () => {
    toast.info("Select an event to duplicate");
  };

  const handleUseTemplate = () => {
    toast.info("Loading event templates");
  };

  const progressPercentage = (currentStep / 6) * 100;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage('events')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl">Create New Event</h1>
              <p className="text-muted-foreground mt-1">
                Set up a new event with staff assignments and pricing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleDuplicateEvent}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate Event
            </Button>
            <Button variant="outline" onClick={handleUseTemplate}>
              <Sparkles className="h-4 w-4 mr-2" />
              Use Template
            </Button>
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Step {currentStep} of 6</span>
                <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              
              {/* Step Indicators */}
              <div className="flex items-center justify-between pt-4">
                {steps.map((step, idx) => (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <button
                        onClick={() => goToStep(step.number)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          currentStep === step.number
                            ? 'bg-primary text-primary-foreground'
                            : currentStep > step.number
                            ? 'bg-green-100 text-green-700'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {currentStep > step.number ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <step.icon className="h-5 w-5" />
                        )}
                      </button>
                      <span className={`text-xs mt-2 text-center hidden sm:block ${
                        currentStep === step.number ? 'font-medium' : 'text-muted-foreground'
                      }`}>
                        {step.name}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`h-0.5 flex-1 ${
                        currentStep > step.number ? 'bg-green-300' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Steps */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Step 1: Event Details */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                  <CardDescription>Basic information about the event</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="eventName">Event Name *</Label>
                      <Input
                        id="eventName"
                        placeholder="e.g., Johnson Wedding Reception"
                        value={formData.eventName}
                        onChange={(e) => updateFormData('eventName', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventType">Event Type *</Label>
                      <Select
                        value={formData.eventType}
                        onValueChange={(value) => updateFormData('eventType', value)}
                      >
                        <SelectTrigger id="eventType">
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          {eventTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estimatedGuests">Estimated Guests</Label>
                      <Input
                        id="estimatedGuests"
                        type="number"
                        placeholder="100"
                        value={formData.estimatedGuests}
                        onChange={(e) => updateFormData('estimatedGuests', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Event Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.eventDate ? format(formData.eventDate, 'PPP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.eventDate}
                            onSelect={(date) => updateFormData('eventDate', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time *</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => updateFormData('startTime', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time *</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => updateFormData('endTime', e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="venue">Venue Name *</Label>
                      <Input
                        id="venue"
                        placeholder="e.g., Grand Hotel Ballroom"
                        value={formData.venue}
                        onChange={(e) => updateFormData('venue', e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="venueAddress">Venue Address</Label>
                      <Textarea
                        id="venueAddress"
                        placeholder="123 Main Street, City, State, ZIP"
                        value={formData.venueAddress}
                        onChange={(e) => updateFormData('venueAddress', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>

                  {formData.startTime && formData.endTime && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Event Duration</p>
                          <p className="text-sm text-blue-700">
                            {calculateHours(formData.startTime, formData.endTime).toFixed(1)} hours
                            {calculateHours(formData.startTime, formData.endTime) < 5 && 
                              " (5-hour minimum applies)"
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Client Information */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                  <CardDescription>Select existing client or add new one</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="clientType"
                        checked={formData.clientType === 'new'}
                        onCheckedChange={(checked) => 
                          updateFormData('clientType', checked ? 'new' : 'existing')
                        }
                      />
                      <Label htmlFor="clientType">
                        {formData.clientType === 'new' ? 'Adding New Client' : 'Selecting Existing Client'}
                      </Label>
                    </div>
                  </div>

                  {formData.clientType === 'existing' ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Select Client *</Label>
                        <Select
                          value={formData.existingClientId}
                          onValueChange={(value) => updateFormData('existingClientId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a client..." />
                          </SelectTrigger>
                          <SelectContent>
                            {existingClients.map(client => (
                              <SelectItem key={client.id} value={client.id}>
                                <div className="flex items-center justify-between gap-4">
                                  <span>{client.name}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {client.events} events
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.existingClientId && (
                        <div className="p-4 bg-muted rounded-lg">
                          {existingClients
                            .filter(c => c.id === formData.existingClientId)
                            .map(client => (
                              <div key={client.id} className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{client.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  <span>{client.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Star className="h-3 w-3" />
                                  <span>{client.events} previous events</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="newClientName">Client Name *</Label>
                        <Input
                          id="newClientName"
                          placeholder="Full name or company name"
                          value={formData.newClientName}
                          onChange={(e) => updateFormData('newClientName', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newClientEmail">Email *</Label>
                        <Input
                          id="newClientEmail"
                          type="email"
                          placeholder="email@example.com"
                          value={formData.newClientEmail}
                          onChange={(e) => updateFormData('newClientEmail', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newClientPhone">Phone</Label>
                        <Input
                          id="newClientPhone"
                          type="tel"
                          placeholder="(555) 123-4567"
                          value={formData.newClientPhone}
                          onChange={(e) => updateFormData('newClientPhone', e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="newClientCompany">Company (Optional)</Label>
                        <Input
                          id="newClientCompany"
                          placeholder="Company name"
                          value={formData.newClientCompany}
                          onChange={(e) => updateFormData('newClientCompany', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Staff Requirements */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Staff Requirements</CardTitle>
                      <CardDescription>Define roles and quantities needed</CardDescription>
                    </div>
                    <Button onClick={addStaffRequirement}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Role
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.staffRequirements.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2">No Staff Requirements Added</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add staff roles and quantities for this event
                      </p>
                      <Button onClick={addStaffRequirement}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Role
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.staffRequirements.map((req, index) => (
                        <Card key={req.id} className="border-2">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-4">
                              <Badge variant="outline">Role #{index + 1}</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeStaffRequirement(req.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Role *</Label>
                                <Select
                                  value={req.role}
                                  onValueChange={(value) => 
                                    updateStaffRequirement(req.id, 'role', value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select role..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {staffRoles.map(role => (
                                      <SelectItem key={role} value={role}>{role}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Quantity *</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={req.quantity}
                                  onChange={(e) => 
                                    updateStaffRequirement(req.id, 'quantity', parseInt(e.target.value) || 1)
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Hourly Rate ($)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={req.hourlyRate}
                                  onChange={(e) => 
                                    updateStaffRequirement(req.id, 'hourlyRate', parseFloat(e.target.value) || 0)
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Total Cost</Label>
                                <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
                                  <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                                  <span className="font-medium">
                                    {(req.quantity * req.hourlyRate * 
                                      calculateHours(formData.startTime, formData.endTime)
                                    ).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 4: Pricing & Billing */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Billing</CardTitle>
                  <CardDescription>Set pricing model and payment terms</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Pricing Model</Label>
                      <Select
                        value={formData.pricingModel}
                        onValueChange={(value: any) => updateFormData('pricingModel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly Rate</SelectItem>
                          <SelectItem value="flat">Flat Fee</SelectItem>
                          <SelectItem value="package">Package Deal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Deposit Percentage</Label>
                      <Select
                        value={formData.depositPercentage}
                        onValueChange={(value) => updateFormData('depositPercentage', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25">25%</SelectItem>
                          <SelectItem value="50">50%</SelectItem>
                          <SelectItem value="75">75%</SelectItem>
                          <SelectItem value="100">100% (Full Payment)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Terms</Label>
                      <Select
                        value={formData.paymentTerms}
                        onValueChange={(value) => updateFormData('paymentTerms', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="due-on-event">Due on Event Day</SelectItem>
                          <SelectItem value="net-7">Net 7 Days</SelectItem>
                          <SelectItem value="net-15">Net 15 Days</SelectItem>
                          <SelectItem value="net-30">Net 30 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Additional Fees</Label>
                      <Button variant="outline" size="sm" onClick={addAdditionalFee}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Fee
                      </Button>
                    </div>

                    {formData.additionalFees.map((fee, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <Input
                          placeholder="Fee name (e.g., Service Fee)"
                          value={fee.name}
                          onChange={(e) => updateAdditionalFee(index, 'name', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={fee.amount}
                          onChange={(e) => updateAdditionalFee(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-32"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAdditionalFee(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Cost Summary */}
                  <div className="space-y-3 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium">Cost Summary</h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Staff Costs:</span>
                        <span className="font-medium">
                          ${(calculateTotalCost() - formData.additionalFees.reduce((sum, fee) => sum + fee.amount, 0)).toFixed(2)}
                        </span>
                      </div>
                      
                      {formData.additionalFees.map((fee, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-muted-foreground">{fee.name}:</span>
                          <span className="font-medium">${fee.amount.toFixed(2)}</span>
                        </div>
                      ))}
                      
                      <Separator />
                      
                      <div className="flex justify-between text-base">
                        <span className="font-medium">Total Cost:</span>
                        <span className="font-semibold text-primary">
                          ${calculateTotalCost().toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Deposit ({formData.depositPercentage}%):
                        </span>
                        <span className="font-medium">
                          ${calculateDeposit().toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Remaining Balance:</span>
                        <span className="font-medium">
                          ${(calculateTotalCost() - calculateDeposit()).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Additional Details */}
            {currentStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Details</CardTitle>
                  <CardDescription>Special requests, equipment, and notes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="specialRequests">Special Requests</Label>
                    <Textarea
                      id="specialRequests"
                      placeholder="Any special requirements or requests from the client..."
                      value={formData.specialRequests}
                      onChange={(e) => updateFormData('specialRequests', e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Equipment Needed</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availableEquipment.map(item => (
                        <div
                          key={item}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            formData.equipment.includes(item)
                              ? 'border-primary bg-primary/10'
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => {
                            if (formData.equipment.includes(item)) {
                              updateFormData('equipment', formData.equipment.filter(e => e !== item));
                            } else {
                              updateFormData('equipment', [...formData.equipment, item]);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 border-2 rounded ${
                              formData.equipment.includes(item)
                                ? 'bg-primary border-primary'
                                : 'border-muted-foreground'
                            }`}>
                              {formData.equipment.includes(item) && (
                                <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                              )}
                            </div>
                            <span className="text-sm">{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="internalNotes">Internal Notes</Label>
                    <Textarea
                      id="internalNotes"
                      placeholder="Notes for internal team (not visible to client)..."
                      value={formData.internalNotes}
                      onChange={(e) => updateFormData('internalNotes', e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Document Attachments</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">
                        Contracts, floor plans, menu details, etc.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 6: Review & Confirm */}
            {currentStep === 6 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Event Details</CardTitle>
                  <CardDescription>Verify all information before creating the event</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Event Details Summary */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Event Information</h3>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 p-4 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Event Name</p>
                        <p className="font-medium">{formData.eventName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium">{formData.eventType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">
                          {formData.eventDate ? format(formData.eventDate, 'PPP') : 'Not set'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p className="font-medium">{formData.startTime} - {formData.endTime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Venue</p>
                        <p className="font-medium">{formData.venue}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Guests</p>
                        <p className="font-medium">{formData.estimatedGuests || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Client Summary */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Client Information</h3>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      {formData.clientType === 'existing' ? (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Selected Client</p>
                          <p className="font-medium">
                            {existingClients.find(c => c.id === formData.existingClientId)?.name}
                          </p>
                        </div>
                      ) : (
                        <div className="grid gap-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{formData.newClientName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{formData.newClientEmail}</p>
                          </div>
                          {formData.newClientPhone && (
                            <div>
                              <p className="text-sm text-muted-foreground">Phone</p>
                              <p className="font-medium">{formData.newClientPhone}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Staff Requirements Summary */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Staff Requirements ({formData.staffRequirements.length})</h3>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Role</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.staffRequirements.map((req) => (
                          <TableRow key={req.id}>
                            <TableCell className="font-medium">{req.role}</TableCell>
                            <TableCell>{req.quantity}</TableCell>
                            <TableCell>${req.hourlyRate}/hr</TableCell>
                            <TableCell className="font-medium">
                              ${(req.quantity * req.hourlyRate * 
                                calculateHours(formData.startTime, formData.endTime)
                              ).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <Separator />

                  {/* Pricing Summary */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Pricing & Payment</h3>
                    </div>
                    <div className="p-4 bg-primary/10 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Event Cost:</span>
                        <span className="text-xl font-semibold text-primary">
                          ${calculateTotalCost().toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Deposit Required ({formData.depositPercentage}%):</span>
                        <span className="font-medium">${calculateDeposit().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Remaining Balance:</span>
                        <span className="font-medium">
                          ${(calculateTotalCost() - calculateDeposit()).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Payment Terms:</span>
                        <span className="font-medium capitalize">
                          {formData.paymentTerms.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {formData.equipment.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">Equipment Needed</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.equipment.map(item => (
                            <Badge key={item} variant="secondary">{item}</Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Quick Info */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-base">Event Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {formData.eventDate ? format(formData.eventDate, 'MMM dd, yyyy') : 'Not set'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">
                      {formData.startTime && formData.endTime
                        ? `${calculateHours(formData.startTime, formData.endTime).toFixed(1)} hrs`
                        : 'Not set'
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Staff:</span>
                    <span className="font-medium">
                      {formData.staffRequirements.reduce((sum, req) => sum + req.quantity, 0) || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium text-primary">
                      ${calculateTotalCost().toFixed(2)}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Event Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => updateFormData('status', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending Approval</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <Label htmlFor="notify" className="text-sm cursor-pointer">
                    Notify Client
                  </Label>
                  <Switch
                    id="notify"
                    checked={formData.sendClientNotification}
                    onCheckedChange={(checked) => 
                      updateFormData('sendClientNotification', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Validation Warnings */}
            {currentStep < 6 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-yellow-900">Required Fields</p>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        {!formData.eventName && <li>• Event name</li>}
                        {!formData.eventType && <li>• Event type</li>}
                        {!formData.eventDate && <li>• Event date</li>}
                        {!formData.startTime && <li>• Start time</li>}
                        {!formData.endTime && <li>• End time</li>}
                        {!formData.venue && <li>• Venue</li>}
                        {formData.clientType === 'existing' && !formData.existingClientId && <li>• Client selection</li>}
                        {formData.clientType === 'new' && !formData.newClientName && <li>• Client name</li>}
                        {formData.clientType === 'new' && !formData.newClientEmail && <li>• Client email</li>}
                        {formData.staffRequirements.length === 0 && <li>• Staff requirements</li>}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-3">
                {currentStep < 6 ? (
                  <Button onClick={nextStep}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleSaveDraft}>
                      <Save className="h-4 w-4 mr-2" />
                      Save as Draft
                    </Button>
                    <Button onClick={handleCreateEvent}>
                      <Send className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
