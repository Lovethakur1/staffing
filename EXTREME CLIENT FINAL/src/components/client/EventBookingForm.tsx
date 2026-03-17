import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "../ui/separator";
import { toast } from "sonner";

interface EventBookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
}

export function EventBookingForm({ isOpen, onClose, clientId }: EventBookingFormProps) {
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startHour: '9',
    startMinute: '00',
    startPeriod: 'AM' as 'AM' | 'PM',
    endHour: '5',
    endMinute: '00',
    endPeriod: 'PM' as 'AM' | 'PM',
    staffRequired: 1,
    budget: '',
    specialRequirements: ''
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Validation
    if (!formData.title || !startDate || !endDate || !formData.location || !formData.budget) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Convert 12-hour to 24-hour format for backend
    const start24Hour = formData.startPeriod === 'PM' && formData.startHour !== '12' 
      ? (parseInt(formData.startHour) + 12).toString() 
      : formData.startPeriod === 'AM' && formData.startHour === '12'
      ? '0'
      : formData.startHour;
    
    const end24Hour = formData.endPeriod === 'PM' && formData.endHour !== '12'
      ? (parseInt(formData.endHour) + 12).toString()
      : formData.endPeriod === 'AM' && formData.endHour === '12'
      ? '0'
      : formData.endHour;

    const startTime = `${start24Hour.padStart(2, '0')}:${formData.startMinute}`;
    const endTime = `${end24Hour.padStart(2, '0')}:${formData.endMinute}`;
    
    console.log('Event booking submitted:', { 
      ...formData, 
      startDate, 
      endDate,
      startTime,
      endTime,
      clientId 
    });
    
    toast.success("Booking request submitted successfully");
    onClose();
    
    // Reset form
    setStep(1);
    setFormData({
      title: '',
      description: '',
      location: '',
      startHour: '9',
      startMinute: '00',
      startPeriod: 'AM',
      endHour: '5',
      endMinute: '00',
      endPeriod: 'PM',
      staffRequired: 1,
      budget: '',
      specialRequirements: ''
    });
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const goToNextStep = () => {
    if (step === 1) {
      // Validate step 1
      if (!formData.title || !startDate || !endDate || !formData.location) {
        toast.error("Please complete all required fields");
        return;
      }
    }
    if (step === 2) {
      // Validate step 2
      if (!formData.budget || formData.staffRequired < 1) {
        toast.error("Please complete budget and staff requirements");
        return;
      }
    }
    setStep(step + 1);
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = ['00', '15', '30', '45'];

  const stepTitles = [
    { number: 1, title: "Event Details" },
    { number: 2, title: "Requirements" },
    { number: 3, title: "Review" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mobile-dialog-content max-w-2xl overflow-hidden flex flex-col max-h-[90vh] p-0">
        
        {/* Header Section */}
        <div className="px-6 pt-6 pb-4 border-b bg-white">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl tracking-tight">New Event Booking</DialogTitle>
            <DialogDescription className="text-base">
              Step {step} of 3
            </DialogDescription>
          </DialogHeader>

          {/* Minimalist Progress Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {stepTitles.map((s) => (
                <span 
                  key={s.number}
                  className={`${step >= s.number ? 'text-foreground font-medium' : ''}`}
                >
                  {s.title}
                </span>
              ))}
            </div>
            <div className="relative h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-foreground transition-all duration-300 ease-in-out"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Step 1: Event Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Event Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Annual Corporate Gala"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                    <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of the event..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium">
                    Venue Address
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Street address, city, state, ZIP"
                    className="h-11"
                  />
                </div>
              </div>

              <Separator className="my-6" />

              {/* Date Selection */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">Event Dates</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal h-11"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{startDate ? format(startDate, "MMM d, yyyy") : "Select date"}</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal h-11"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{endDate ? format(endDate, "MMM d, yyyy") : "Select date"}</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                            disabled={(date) => startDate ? date < startDate : date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Event Times</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Start Time</Label>
                      <div className="grid grid-cols-[1fr_1fr_100px] gap-2">
                        <Select
                          value={formData.startHour}
                          onValueChange={(value) => handleInputChange('startHour', value)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Hour" />
                          </SelectTrigger>
                          <SelectContent>
                            {hours.map(hour => (
                              <SelectItem key={hour} value={hour}>
                                {hour.padStart(2, '0')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={formData.startMinute}
                          onValueChange={(value) => handleInputChange('startMinute', value)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Min" />
                          </SelectTrigger>
                          <SelectContent>
                            {minutes.map(minute => (
                              <SelectItem key={minute} value={minute}>
                                {minute}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={formData.startPeriod}
                          onValueChange={(value) => handleInputChange('startPeriod', value)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">End Time</Label>
                      <div className="grid grid-cols-[1fr_1fr_100px] gap-2">
                        <Select
                          value={formData.endHour}
                          onValueChange={(value) => handleInputChange('endHour', value)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Hour" />
                          </SelectTrigger>
                          <SelectContent>
                            {hours.map(hour => (
                              <SelectItem key={hour} value={hour}>
                                {hour.padStart(2, '0')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={formData.endMinute}
                          onValueChange={(value) => handleInputChange('endMinute', value)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Min" />
                          </SelectTrigger>
                          <SelectContent>
                            {minutes.map(minute => (
                              <SelectItem key={minute} value={minute}>
                                {minute}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={formData.endPeriod}
                          onValueChange={(value) => handleInputChange('endPeriod', value)}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Requirements & Budget */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staffRequired" className="text-sm font-medium">
                    Staff Required
                  </Label>
                  <Select
                    value={formData.staffRequired.toString()}
                    onValueChange={(value) => handleInputChange('staffRequired', parseInt(value))}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'Person' : 'People'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-sm font-medium">
                    Budget (USD)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="budget"
                      type="number"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      placeholder="5,000"
                      className="pl-7 h-11"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="specialRequirements" className="text-sm font-medium">
                  Additional Requirements
                  <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
                </Label>
                <Textarea
                  id="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                  placeholder="Any specific requirements, certifications, attire, or special instructions..."
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  All staff are professionally vetted, background-checked, and insured. A 5-hour minimum applies to all bookings.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Review Booking</h3>
                <p className="text-sm text-muted-foreground">
                  Please verify all details before submitting
                </p>
              </div>

              <Separator />

              {/* Event Summary */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg tracking-tight mb-1">{formData.title}</h4>
                  {formData.description && (
                    <p className="text-sm text-muted-foreground">{formData.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground mb-0.5">Date</dt>
                    <dd className="font-medium">
                      {startDate && endDate ? (
                        startDate.toDateString() === endDate.toDateString() 
                          ? format(startDate, "MMMM d, yyyy")
                          : `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`
                      ) : "Not selected"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-muted-foreground mb-0.5">Time</dt>
                    <dd className="font-medium">
                      {formData.startHour}:{formData.startMinute} {formData.startPeriod} - {formData.endHour}:{formData.endMinute} {formData.endPeriod}
                    </dd>
                  </div>

                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground mb-0.5">Location</dt>
                    <dd className="font-medium">{formData.location}</dd>
                  </div>

                  <div>
                    <dt className="text-muted-foreground mb-0.5">Staff</dt>
                    <dd className="font-medium">
                      {formData.staffRequired} {formData.staffRequired === 1 ? 'Person' : 'People'}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-muted-foreground mb-0.5">Budget</dt>
                    <dd className="font-medium">${parseInt(formData.budget).toLocaleString()}</dd>
                  </div>

                  {formData.specialRequirements && (
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground mb-0.5">Additional Requirements</dt>
                      <dd className="font-medium text-sm">{formData.specialRequirements}</dd>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <p className="text-sm font-medium">Next Steps</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Request reviewed within 24 hours</li>
                  <li>• Detailed quote with staff profiles sent</li>
                  <li>• Confirmation upon approval</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t bg-muted/20">
          <div className="flex items-center justify-between gap-3">
            {step > 1 ? (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setStep(step - 1)}
                className="h-11"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            ) : (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose}
                className="h-11"
              >
                Cancel
              </Button>
            )}
            
            {step < 3 ? (
              <Button 
                type="button" 
                onClick={goToNextStep}
                className="h-11 min-w-[120px]"
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={handleSubmit}
                className="h-11 min-w-[120px]"
              >
                <Check className="h-4 w-4 mr-2" />
                Submit
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}