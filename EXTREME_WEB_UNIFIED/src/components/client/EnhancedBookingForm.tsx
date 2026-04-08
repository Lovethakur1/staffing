import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { TimeInput } from "../ui/time-input";
import { Calendar, Clock, MapPin, Users, DollarSign, Star, Plus, Minus, AlertCircle, CheckCircle2, Heart } from "lucide-react";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

import { toast } from "sonner";
import { Staff } from "../../data/mockData";
import api from "../../services/api";
import { staffService } from "../../services/staff.service";

interface EnhancedBookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
}

interface StaffRequest {
  role: string;
  quantity: number;
  hourlyRate: number;
  preferredStaff?: string[];
}

export function EnhancedBookingForm({ isOpen, onClose, clientId }: EnhancedBookingFormProps) {
  const [step, setStep] = useState(1);
  const [staffList, setStaffList] = useState<any[]>([]);

  useEffect(() => {
    staffService.getStaffList({ take: 200 }).then((res: any) => {
      setStaffList(Array.isArray(res) ? res : (res?.data || []));
    }).catch(() => {});
  }, []);
  const [eventDate, setEventDate] = useState<Date>();
  const [eventData, setEventData] = useState({
    title: "",
    eventType: "",
    description: "",
    venue: "",
    address: "",
    startTime: "",
    endTime: "",
    guestCount: "",
    specialRequirements: "",
    budget: "",
    deposits: true,
    tips: true,
    insurance: false,
    cancellationPolicy: true
  });
  
  const [staffRequests, setStaffRequests] = useState<StaffRequest[]>([
    { role: "Server", quantity: 1, hourlyRate: 25, preferredStaff: [] }
  ]);

  const eventTypes = [
    "Corporate Event", "Wedding", "Birthday Party", "Holiday Party", 
    "Cocktail Reception", "Dinner Party", "Conference", "Product Launch",
    "Fundraising Gala", "Restaurant Pop-up", "Private Chef Service", "Other"
  ];

  const staffRoles = [
    { role: "Server", baseRate: 25, description: "Food and beverage service" },
    { role: "Bartender", baseRate: 30, description: "Professional bar service" },
    { role: "Chef", baseRate: 45, description: "Professional cooking service" },
    { role: "Event Coordinator", baseRate: 35, description: "Event management and coordination" },
    { role: "Security", baseRate: 28, description: "Event security and crowd control" },
    { role: "Photographer", baseRate: 40, description: "Professional event photography" },
    { role: "DJ/Entertainment", baseRate: 50, description: "Music and entertainment services" },
    { role: "Cleaner", baseRate: 20, description: "Setup and cleanup services" }
  ];

  const timeSlots = [
    "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
    "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM"
  ];

  const addStaffRequest = () => {
    setStaffRequests([...staffRequests, { role: "Server", quantity: 1, hourlyRate: 25, preferredStaff: [] }]);
  };

  const removeStaffRequest = (index: number) => {
    setStaffRequests(staffRequests.filter((_, i) => i !== index));
  };

  const updateStaffRequest = (index: number, field: keyof StaffRequest, value: any) => {
    const updated = [...staffRequests];
    if (field === 'role') {
      const roleData = staffRoles.find(r => r.role === value);
      updated[index] = { ...updated[index], role: value, hourlyRate: roleData?.baseRate || 25 };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setStaffRequests(updated);
  };

  const calculateEstimate = () => {
    if (!eventData.startTime || !eventData.endTime) return 0;
    
    const start = parseInt(eventData.startTime.split(':')[0]);
    const end = parseInt(eventData.endTime.split(':')[0]);
    const hours = Math.max(5, end - start); // Minimum 5 hours
    
    return staffRequests.reduce((total, request) => {
      return total + (request.quantity * request.hourlyRate * hours);
    }, 0);
  };

  const handleSubmit = async () => {
    // Validation
    if (!eventData.title || !eventData.eventType || !eventDate || !eventData.startTime || !eventData.endTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (staffRequests.length === 0) {
      toast.error("Please add at least one staff request");
      return;
    }

    try {
      const totalStaff = staffRequests.reduce((sum, r) => sum + r.quantity, 0);
      const staffReqDescription = staffRequests
        .map(r => `${r.quantity}x ${r.role}`)
        .join(', ');

      await api.post('/events', {
        clientId,
        title: eventData.title,
        description: eventData.description || undefined,
        eventType: eventData.eventType,
        venue: eventData.venue || undefined,
        date: eventDate.toISOString(),
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        location: eventData.address || eventData.venue || undefined,
        staffRequired: totalStaff,
        guestCount: eventData.guestCount ? parseInt(eventData.guestCount) : undefined,
        budget: eventData.budget ? parseFloat(eventData.budget) : undefined,
        specialRequirements: [
          eventData.specialRequirements,
          staffReqDescription ? `Staff needed: ${staffReqDescription}` : '',
        ].filter(Boolean).join('\n') || undefined,
      });

      toast.success("Event booking submitted successfully! We'll contact you within 24 hours.");
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to submit booking. Please try again.");
      return;
    }
    
    // Reset form
    setStep(1);
    setEventData({
      title: "",
      eventType: "",
      description: "",
      venue: "",
      address: "",
      startTime: "",
      endTime: "",
      guestCount: "",
      specialRequirements: "",
      budget: "",
      deposits: true,
      tips: true,
      insurance: false,
      cancellationPolicy: true
    });
    setStaffRequests([{ role: "Server", quantity: 1, hourlyRate: 25, preferredStaff: [] }]);
    setEventDate(undefined);
  };

  const getAvailableStaff = (role: string) => {
    return staffList.filter(s =>
      (Array.isArray(s.skills) ? s.skills : []).some((skill: string) => skill.toLowerCase().includes(role.toLowerCase()))
    );
  };

  const togglePreferredStaff = (requestIndex: number, staffId: string) => {
    const updated = [...staffRequests];
    const currentPreferred = updated[requestIndex].preferredStaff || [];
    
    if (currentPreferred.includes(staffId)) {
      updated[requestIndex].preferredStaff = currentPreferred.filter(id => id !== staffId);
    } else {
      updated[requestIndex].preferredStaff = [...currentPreferred, staffId];
    }
    
    setStaffRequests(updated);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Book Event Staff - Step {step} of 3
          </DialogTitle>
          <DialogDescription>
            Complete this form to request professional staff for your event. We'll review your request and get back to you within 24 hours.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center space-x-4 mb-6">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                stepNumber === step ? 'bg-primary text-primary-foreground' :
                stepNumber < step ? 'bg-success text-success-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {stepNumber < step ? <CheckCircle2 className="h-4 w-4" /> : stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-12 h-1 mx-2 ${
                  stepNumber < step ? 'bg-success' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Event Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={eventData.title}
                    onChange={(e) => setEventData({...eventData, title: e.target.value})}
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <Label htmlFor="eventType">Event Type *</Label>
                  <Select value={eventData.eventType} onValueChange={(value) => setEventData({...eventData, eventType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="guestCount">Expected Guest Count</Label>
                  <Input
                    id="guestCount"
                    type="number"
                    value={eventData.guestCount}
                    onChange={(e) => setEventData({...eventData, guestCount: e.target.value})}
                    placeholder="Number of guests"
                  />
                </div>

                <div>
                  <Label htmlFor="budget">Estimated Budget</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="budget"
                      type="number"
                      value={eventData.budget}
                      onChange={(e) => setEventData({...eventData, budget: e.target.value})}
                      placeholder="Optional budget range"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Event Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {eventDate ? eventDate.toLocaleDateString() : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={eventDate}
                        onSelect={setEventDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time *</Label>
                    <TimeInput 
                      id="startTime"
                      value={eventData.startTime} 
                      onChange={(value) => setEventData({...eventData, startTime: value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endTime">End Time *</Label>
                    <TimeInput 
                      id="endTime"
                      value={eventData.endTime} 
                      onChange={(value) => setEventData({...eventData, endTime: value})}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="venue">Venue Name</Label>
                <Input
                  id="venue"
                  value={eventData.venue}
                  onChange={(e) => setEventData({...eventData, venue: e.target.value})}
                  placeholder="Venue or location name"
                />
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={eventData.address}
                  onChange={(e) => setEventData({...eventData, address: e.target.value})}
                  placeholder="Full event address"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="description">Event Description</Label>
                <Textarea
                  id="description"
                  value={eventData.description}
                  onChange={(e) => setEventData({...eventData, description: e.target.value})}
                  placeholder="Describe your event, style, and any specific requirements"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>
                Next: Staff Requirements
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Staff Requirements */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Staff Requirements</h3>
                <p className="text-sm text-muted-foreground">Specify the staff roles and quantities needed</p>
              </div>
              <Button onClick={addStaffRequest} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Role
              </Button>
            </div>

            <div className="space-y-4">
              {staffRequests.map((request, index) => (
                <Card key={index} className="border border-border">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">Staff Role #{index + 1}</CardTitle>
                      {staffRequests.length > 1 && (
                        <Button
                          onClick={() => removeStaffRequest(index)}
                          variant="outline"
                          size="sm"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Role Type</Label>
                        <Select 
                          value={request.role} 
                          onValueChange={(value) => updateStaffRequest(index, 'role', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {staffRoles.map((role) => (
                              <SelectItem key={role.role} value={role.role}>
                                <div className="flex flex-col">
                                  <span>{role.role}</span>
                                  <span className="text-xs text-muted-foreground">${role.baseRate}/hr</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={request.quantity}
                          onChange={(e) => updateStaffRequest(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>

                      <div>
                        <Label>Hourly Rate</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            value={request.hourlyRate}
                            onChange={(e) => updateStaffRequest(index, 'hourlyRate', parseInt(e.target.value) || 25)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preferred Staff Selection */}
                    <div>
                      <Label className="text-sm font-medium">Preferred Staff (Optional)</Label>
                      <p className="text-xs text-muted-foreground mb-3">Select staff members you've worked with before</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {getAvailableStaff(request.role).slice(0, 6).map((s) => (
                          <div
                            key={s.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              request.preferredStaff?.includes(s.id)
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => togglePreferredStaff(index, s.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div>
                                  <p className="text-sm font-medium">{s.user?.name || s.name || "Staff"}</p>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs">{parseFloat(s.rating) || 0}</span>
                                  </div>
                                </div>
                              </div>
                              {request.preferredStaff?.includes(s.id) && (
                                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Cost Estimate */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">Estimated Total Cost</h4>
                    <p className="text-sm text-muted-foreground">
                      Based on {eventData.startTime && eventData.endTime ? 
                        `${Math.max(5, parseInt(eventData.endTime.split(':')[0]) - parseInt(eventData.startTime.split(':')[0]))} hours` : 
                        'selected duration'} (5 hour minimum)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      ${calculateEstimate().toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Before taxes & fees</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button onClick={() => setStep(1)} variant="outline">
                Back: Event Details
              </Button>
              <Button onClick={() => setStep(3)}>
                Next: Review & Submit
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Options */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Review Your Booking</h3>
              <p className="text-sm text-muted-foreground">Confirm your event details and preferences</p>
            </div>

            {/* Event Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Event Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">{eventData.title}</h4>
                    <p className="text-sm text-muted-foreground">{eventData.eventType}</p>
                    {eventData.description && (
                      <p className="text-sm mt-2">{eventData.description}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      {eventDate ? eventDate.toLocaleDateString() : "Date not selected"}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      {eventData.startTime} - {eventData.endTime}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      {eventData.venue || "Venue"} - {eventData.address}
                    </div>
                    {eventData.guestCount && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-primary" />
                        {eventData.guestCount} guests expected
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Staff Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Staff Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {staffRequests.map((request, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{request.quantity}x {request.role}</p>
                        {request.preferredStaff && request.preferredStaff.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {request.preferredStaff.length} preferred staff selected
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${request.hourlyRate}/hr</p>
                        <p className="text-sm text-muted-foreground">
                          ${(request.quantity * request.hourlyRate * Math.max(5, parseInt(eventData.endTime?.split(':')[0] || '0') - parseInt(eventData.startTime?.split(':')[0] || '0'))).toLocaleString()} total
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Special Requests */}
            <div>
              <Label htmlFor="specialRequirements">Special Requirements or Notes</Label>
              <Textarea
                id="specialRequirements"
                value={eventData.specialRequirements}
                onChange={(e) => setEventData({...eventData, specialRequirements: e.target.value})}
                placeholder="Any special dietary restrictions, setup requirements, or other details..."
                rows={3}
              />
            </div>

            {/* Service Options */}
            <Card>
              <CardHeader>
                <CardTitle>Service Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Deposit Required</p>
                    <p className="text-sm text-muted-foreground">50% deposit to confirm booking</p>
                  </div>
                  <Switch
                    checked={eventData.deposits}
                    onCheckedChange={(checked) => setEventData({...eventData, deposits: checked})}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow Tips</p>
                    <p className="text-sm text-muted-foreground">Enable tip collection for staff</p>
                  </div>
                  <Switch
                    checked={eventData.tips}
                    onCheckedChange={(checked) => setEventData({...eventData, tips: checked})}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Event Insurance</p>
                    <p className="text-sm text-muted-foreground">Additional coverage (recommended)</p>
                  </div>
                  <Switch
                    checked={eventData.insurance}
                    onCheckedChange={(checked) => setEventData({...eventData, insurance: checked})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Final Cost Estimate */}
            <Card className="border-primary bg-primary/5">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Staff Services</span>
                    <span>${calculateEstimate().toLocaleString()}</span>
                  </div>
                  {eventData.insurance && (
                    <div className="flex justify-between">
                      <span>Event Insurance</span>
                      <span>$50</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Service Fee (8%)</span>
                    <span>${Math.round((calculateEstimate() + (eventData.insurance ? 50 : 0)) * 0.08).toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Estimate</span>
                    <span>${Math.round((calculateEstimate() + (eventData.insurance ? 50 : 0)) * 1.08).toLocaleString()}</span>
                  </div>
                  {eventData.deposits && (
                    <p className="text-sm text-muted-foreground">
                      Deposit required: ${Math.round((calculateEstimate() + (eventData.insurance ? 50 : 0)) * 1.08 * 0.5).toLocaleString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">What happens next?</p>
                  <ul className="mt-1 text-blue-700 space-y-1">
                    <li>• We'll review your request within 24 hours</li>
                    <li>• You'll receive confirmation with assigned staff details</li>
                    <li>• Payment link will be sent for deposit</li>
                    <li>• Final details will be confirmed 48 hours before event</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button onClick={() => setStep(2)} variant="outline">
                Back: Staff Requirements
              </Button>
              <Button onClick={handleSubmit} size="lg">
                Submit Booking Request
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
