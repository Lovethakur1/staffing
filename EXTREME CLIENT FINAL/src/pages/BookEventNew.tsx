import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Info,
  Heart,
  Sparkles,
  Star,
  AlertCircle,
  Briefcase,
  User,
  ChevronDown,
  Ban,
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner@2.0.3";

interface FavoriteStaff {
  id: string;
  name: string;
  role: string;
  ratePerHour: number;
  rating: number;
  experience: number;
  available: boolean;
}

export function BookEventNew() {
  const { navigateTo } = useNavigation();
  
  // Event Information State
  const [dateTitle, setDateTitle] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDuration, setEventDuration] = useState("single");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  
  // Event Location State
  const [venueName, setVenueName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  
  // Client Details State
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  
  // Favorite Staff State
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Mock favorite staff data
  const favoriteStaff: FavoriteStaff[] = [
    {
      id: "1",
      name: "Emma Williams",
      role: "Bartending",
      ratePerHour: 25,
      rating: 4.8,
      experience: 45,
      available: true,
    },
    {
      id: "2",
      name: "Michael Chen",
      role: "Server",
      ratePerHour: 22,
      rating: 4.9,
      experience: 52,
      available: false,
    },
    {
      id: "3",
      name: "Sarah Johnson",
      role: "Server",
      ratePerHour: 20,
      rating: 4.7,
      experience: 38,
      available: false,
    },
  ];
  
  const availableStaff = favoriteStaff.filter(s => s.available);
  const unavailableCount = favoriteStaff.length - availableStaff.length;
  
  // Staffing Requirements State
  const [expectedGuests, setExpectedGuests] = useState("");
  const [numberOfStaff, setNumberOfStaff] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [staffTypes, setStaffTypes] = useState<string[]>([]);
  const [staffCounts, setStaffCounts] = useState<Record<string, number>>({});
  const [specialStaffingReqs, setSpecialStaffingReqs] = useState("");
  
  // Payment Options State
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentTiming, setPaymentTiming] = useState("");
  const [formalContract, setFormalContract] = useState(false);
  
  // Additional Information State
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  
  // Budget
  const [budgetRange, setBudgetRange] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Event request submitted successfully!");
    setIsSubmitting(false);
    
    // Navigate back to bookings
    navigateTo("my-bookings");
  };
  
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedStaff(availableStaff.map(s => s.id));
    } else {
      setSelectedStaff([]);
    }
  };
  
  const handleStaffSelect = (staffId: string, checked: boolean) => {
    if (checked) {
      setSelectedStaff([...selectedStaff, staffId]);
    } else {
      setSelectedStaff(selectedStaff.filter(id => id !== staffId));
      setSelectAll(false);
    }
  };
  
  // Staff type options
  const staffTypeOptions = [
    { value: "servers", label: "Servers" },
    { value: "bartenders", label: "Bartenders" },
    { value: "security", label: "Security" },
    { value: "valetparking", label: "Valet Parking" },
    { value: "eventcoordinators", label: "Event Coordinators" },
  ];
  
  // Calculate total allocated staff
  const totalAllocated = Object.values(staffCounts).reduce((sum, count) => sum + count, 0);
  const remainingStaff = numberOfStaff ? parseInt(numberOfStaff) - totalAllocated : 0;
  const isOverAllocated = remainingStaff < 0;
  
  // Handle staff type selection
  const handleStaffTypeToggle = (type: string, checked: boolean) => {
    if (checked) {
      setStaffTypes([...staffTypes, type]);
      // Initialize count to 0
      setStaffCounts({ ...staffCounts, [type]: 0 });
    } else {
      setStaffTypes(staffTypes.filter(t => t !== type));
      // Remove count
      const newCounts = { ...staffCounts };
      delete newCounts[type];
      setStaffCounts(newCounts);
    }
  };
  
  // Handle staff count change
  const handleStaffCountChange = (type: string, value: string) => {
    const count = parseInt(value) || 0;
    setStaffCounts({ ...staffCounts, [type]: count });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-sangria" />
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Book New Event</h1>
          </div>
          <p className="text-sm text-slate-600">Easily request professional staff and services</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Form - Left Column - Fixed with Scroll on Desktop */}
          <div className="lg:col-span-2">
            <div className="lg:h-[calc(100vh-180px)] lg:overflow-y-auto lg:pr-4 space-y-4 md:space-y-6">
            
            {/* Event Information Section */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-sangria" />
                <h2 className="font-medium text-slate-900">Event Information</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date-title" className="text-sm text-slate-700">
                      Date Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date-title"
                      placeholder="e.g., Summer Gala 2025"
                      value={dateTitle}
                      onChange={(e) => setDateTitle(e.target.value)}
                      className="border-slate-200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event-type" className="text-sm text-slate-700">
                      Event Type <span className="text-red-500">*</span>
                    </Label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger className="border-slate-200">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corporate">Corporate Event</SelectItem>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="festival">Festival</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="gala">Gala</SelectItem>
                        <SelectItem value="party">Private Party</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-slate-700">Event Duration</Label>
                  <RadioGroup value={eventDuration} onValueChange={setEventDuration} className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="single-day" />
                      <Label htmlFor="single-day" className="font-normal cursor-pointer">Single Day</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="multi" id="multi-day" />
                      <Label htmlFor="multi-day" className="font-normal cursor-pointer">Multi-Day Event</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date" className="text-sm text-slate-700">
                      Start Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border-slate-200"
                    />
                  </div>
                  
                  {eventDuration === "multi" && (
                    <div className="space-y-2">
                      <Label htmlFor="end-date" className="text-sm text-slate-700">
                        End Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border-slate-200"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time" className="text-sm text-slate-700">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="border-slate-200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="end-time" className="text-sm text-slate-700">End Time</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="border-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-description" className="text-sm text-slate-700">Event Description</Label>
                  <Textarea
                    id="event-description"
                    placeholder="Describe your event, its purpose, and any specific requirements..."
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    className="border-slate-200 min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            {/* Event Location Section */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <MapPin className="w-5 h-5 text-sangria" />
                <h2 className="font-medium text-slate-900">Event Location</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="venue-name" className="text-sm text-slate-700">Venue Name</Label>
                  <Input
                    id="venue-name"
                    placeholder="e.g., The Grand Ballroom or Staff Setting..."
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street-address" className="text-sm text-slate-700">Street Address</Label>
                  <Input
                    id="street-address"
                    placeholder="Enter street address..."
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="sm:col-span-1 lg:col-span-2 space-y-2">
                    <Label htmlFor="city" className="text-sm text-slate-700">City</Label>
                    <Input
                      id="city"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="border-slate-200"
                    />
                  </div>
                  
                  <div className="sm:col-span-1 lg:col-span-2 space-y-2">
                    <Label htmlFor="state" className="text-sm text-slate-700">State</Label>
                    <Input
                      id="state"
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="border-slate-200"
                    />
                  </div>
                  
                  <div className="sm:col-span-1 lg:col-span-2 space-y-2">
                    <Label htmlFor="zip-code" className="text-sm text-slate-700">ZIP Code</Label>
                    <Input
                      id="zip-code"
                      placeholder="ZIP Code"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="border-slate-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Client Details Section */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <User className="w-5 h-5 text-sangria" />
                <h2 className="font-medium text-slate-900">Client Details</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-name" className="text-sm text-slate-700">Client Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="client-name"
                    placeholder="Enter client name..."
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-email" className="text-sm text-slate-700">Client Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="client-email"
                    type="email"
                    placeholder="Enter client email..."
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-phone" className="text-sm text-slate-700">Client Phone <span className="text-red-500">*</span></Label>
                  <Input
                    id="client-phone"
                    type="tel"
                    placeholder="Enter client phone..."
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-name" className="text-sm text-slate-700">Company Name</Label>
                  <Input
                    id="company-name"
                    placeholder="Enter company name..."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-title" className="text-sm text-slate-700">Job Title</Label>
                  <Input
                    id="job-title"
                    placeholder="Enter job title..."
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alternate-phone" className="text-sm text-slate-700">Alternate Phone</Label>
                  <Input
                    id="alternate-phone"
                    type="tel"
                    placeholder="Enter alternate phone..."
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    className="border-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Your Favorite Staff Section */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-sangria" />
                <h2 className="font-medium text-slate-900">Your Favorite Staff ({favoriteStaff.length})</h2>
              </div>
              
              <p className="text-sm text-slate-600 mb-4 md:mb-6">
                Select your favorite staff members to add them to your event
              </p>

              {/* Filter and Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-sm text-slate-700">Filter by Role:</span>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[200px] border-slate-200">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          All Roles ({favoriteStaff.length})
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          All Roles ({favoriteStaff.length})
                        </div>
                      </SelectItem>
                      <SelectItem value="bartending">Bartending</SelectItem>
                      <SelectItem value="server">Server</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span className="text-sm text-slate-600">{selectedStaff.length} selected</span>
                  <Button 
                    variant="default"
                    className="bg-sangria hover:bg-merlot text-white text-sm px-3 py-2"
                    disabled={selectedStaff.length === 0}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Add Selected ({selectedStaff.length})</span>
                    <span className="sm:hidden">Add ({selectedStaff.length})</span>
                  </Button>
                </div>
              </div>

              {/* Desktop Table View - Hidden on Mobile */}
              <div className="hidden md:block border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={selectAll}
                            onCheckedChange={handleSelectAll}
                          />
                          <span>Select All Available ({availableStaff.length})</span>
                        </div>
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Role</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Rate/hr</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Rating</th>
                      <th className="text-left p-3 text-sm font-medium text-slate-700">Experience</th>
                    </tr>
                  </thead>
                  <tbody>
                    {favoriteStaff.map((staff) => (
                      <tr key={staff.id} className={`border-b border-slate-200 ${!staff.available ? 'opacity-50' : ''}`}>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <Checkbox 
                              checked={selectedStaff.includes(staff.id)}
                              onCheckedChange={(checked) => handleStaffSelect(staff.id, checked as boolean)}
                              disabled={!staff.available}
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-900">{staff.name}</span>
                              {staff.available && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Available
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-slate-700">{staff.role}</td>
                        <td className="p-3 text-sm font-medium text-slate-900">${staff.ratePerHour}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium text-slate-900">{staff.rating}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-sm text-slate-700">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            {staff.experience}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View - Visible on Mobile Only */}
              <div className="md:hidden space-y-3">
                {/* Select All Option */}
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Checkbox 
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label className="text-sm font-medium cursor-pointer flex-1">
                    Select All Available ({availableStaff.length})
                  </Label>
                </div>

                {/* Staff Cards */}
                {favoriteStaff.map((staff) => (
                  <div 
                    key={staff.id} 
                    className={`border border-slate-200 rounded-lg p-3 ${!staff.available ? 'opacity-50 bg-slate-50' : 'bg-white'}`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={selectedStaff.includes(staff.id)}
                        onCheckedChange={(checked) => handleStaffSelect(staff.id, checked as boolean)}
                        disabled={!staff.available}
                        className="mt-1"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h4 className="font-medium text-slate-900 truncate">{staff.name}</h4>
                          {staff.available && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs shrink-0">
                              Available
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-slate-500">Role:</span>
                            <div className="text-slate-900">{staff.role}</div>
                          </div>
                          <div>
                            <span className="text-slate-500">Rate/hr:</span>
                            <div className="font-medium text-slate-900">${staff.ratePerHour}</div>
                          </div>
                          <div>
                            <span className="text-slate-500">Rating:</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium text-slate-900">{staff.rating}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500">Experience:</span>
                            <div className="flex items-center gap-1 text-slate-900">
                              <Briefcase className="w-3 h-3 text-slate-400" />
                              {staff.experience}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Unavailable Warning */}
              {unavailableCount > 0 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-orange-800">
                    <span className="font-medium">{unavailableCount} favorite staff</span> currently unavailable for this date
                  </p>
                </div>
              )}

              {/* Summary Stats */}
              <div className="mt-4 grid grid-cols-3 gap-3 md:gap-4">
                <div className="text-center p-3 md:p-4 bg-slate-50 rounded-lg">
                  <div className="text-xl md:text-2xl font-semibold text-slate-900">{favoriteStaff.length}</div>
                  <div className="text-xs md:text-sm text-slate-600">Total Favorites</div>
                </div>
                <div className="text-center p-3 md:p-4 bg-green-50 rounded-lg">
                  <div className="text-xl md:text-2xl font-semibold text-green-700">{availableStaff.length}</div>
                  <div className="text-xs md:text-sm text-green-700">Available Now</div>
                </div>
                <div className="text-center p-3 md:p-4 bg-blue-50 rounded-lg">
                  <div className="text-xl md:text-2xl font-semibold text-blue-700">{selectedStaff.length}</div>
                  <div className="text-xs md:text-sm text-blue-700">Selected</div>
                </div>
              </div>
            </div>

            {/* Excluded Staff Section */}
            <div className="bg-white rounded-lg border border-red-100 p-4 md:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Ban className="w-5 h-5 text-red-600" />
                <h2 className="font-medium text-slate-900">Excluded Staff</h2>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg border border-red-100 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 w-full">
                  <h3 className="text-sm font-semibold text-red-900">
                    The following staff members are blocked from this event:
                  </h3>
                  
                  {/* Mock Excluded List */}
                  <div className="space-y-2">
                     <div className="flex items-center justify-between p-2 bg-white rounded border border-red-100 text-sm">
                        <span className="font-medium text-slate-700">John Doe (Bartender)</span>
                        <span className="text-red-600 text-xs italic">Reason: No call no show</span>
                     </div>
                  </div>

                  <p className="text-xs text-red-700 mt-2">
                    These individuals will not be assigned to your event under any circumstances. 
                    You can manage this list in your Staff Preferences.
                  </p>
                </div>
              </div>
            </div>

            {/* Staffing Requirements Section */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <Users className="w-5 h-5 text-sangria" />
                <h2 className="font-medium text-slate-900">Staffing Requirements</h2>
              </div>
              
              <p className="text-sm text-slate-600 mb-4">
                Configure your staffing needs with detailed specifications and flexible options
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-slate-900 mb-4">Event Size & Basic Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expected-guests" className="text-sm text-slate-700">
                        Expected Guests <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="expected-guests"
                        type="number"
                        placeholder="Total guest count"
                        value={expectedGuests}
                        onChange={(e) => setExpectedGuests(e.target.value)}
                        className="border-slate-200"
                      />
                      <p className="text-xs text-slate-500">Total number of attendees expected</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="number-of-staff" className="text-sm text-slate-700">
                        Number of Staff <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="number-of-staff"
                        type="number"
                        placeholder="Total staff needed"
                        value={numberOfStaff}
                        onChange={(e) => setNumberOfStaff(e.target.value)}
                        className="border-slate-200"
                      />
                      <p className="text-xs text-slate-500">Estimated total staff required</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="experience-level" className="text-sm text-slate-700">Experience Level</Label>
                      <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                        <SelectTrigger className="border-slate-200">
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="experienced">Experienced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-slate-700">
                    Staff Types <span className="text-red-500">*</span>
                  </Label>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between border-slate-200 hover:bg-slate-50"
                      >
                        <span className="text-sm text-slate-700">
                          {staffTypes.length > 0
                            ? `${staffTypes.length} staff type${staffTypes.length > 1 ? 's' : ''} selected`
                            : 'Select staff types...'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-3" align="start">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-900 mb-2">Select Staff Types</p>
                        {staffTypeOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={option.value}
                              checked={staffTypes.includes(option.value)}
                              onCheckedChange={(checked) =>
                                handleStaffTypeToggle(option.value, checked as boolean)
                              }
                            />
                            <Label
                              htmlFor={option.value}
                              className="text-sm font-normal cursor-pointer flex-1"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  {staffTypes.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {staffTypes.map((type) => {
                        const option = staffTypeOptions.find(o => o.value === type);
                        return (
                          <Badge
                            key={type}
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {option?.label}
                          </Badge>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">
                      No staff types selected. Click above to select staff types.
                    </p>
                  )}
                </div>

                {/* Dynamic Staff Count Inputs */}
                {staffTypes.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-900">Staff Allocation</h4>
                      <div className="text-sm">
                        <span className="text-slate-600">Allocated: </span>
                        <span className={`font-medium ${isOverAllocated ? 'text-red-600' : 'text-slate-900'}`}>
                          {totalAllocated}
                        </span>
                        <span className="text-slate-600"> / {numberOfStaff || '0'}</span>
                      </div>
                    </div>

                    {!numberOfStaff && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-orange-800">
                          Please enter the <span className="font-medium">Number of Staff</span> first to allocate staff by type
                        </p>
                      </div>
                    )}

                    {isOverAllocated && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">
                          <span className="font-medium">Over-allocated!</span> You've allocated {Math.abs(remainingStaff)} more staff than available. Please adjust the counts or increase the total number of staff.
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      {staffTypes.map((type) => {
                        const option = staffTypeOptions.find(o => o.value === type);
                        const maxAllowed = numberOfStaff 
                          ? parseInt(numberOfStaff) - (totalAllocated - (staffCounts[type] || 0))
                          : 0;
                        
                        return (
                          <div key={type} className="space-y-2">
                            <Label htmlFor={`count-${type}`} className="text-sm text-slate-700">
                              {option?.label} <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id={`count-${type}`}
                                type="number"
                                min="0"
                                max={maxAllowed}
                                placeholder="0"
                                value={staffCounts[type] || ''}
                                onChange={(e) => handleStaffCountChange(type, e.target.value)}
                                className={`border-slate-200 ${!numberOfStaff ? 'bg-slate-50' : ''}`}
                                disabled={!numberOfStaff}
                              />
                              <span className="text-sm text-slate-600 whitespace-nowrap">
                                {numberOfStaff ? `(max: ${maxAllowed})` : ''}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {remainingStaff > 0 && numberOfStaff && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">{remainingStaff} staff</span> remaining to allocate
                        </p>
                      </div>
                    )}

                    {remainingStaff === 0 && numberOfStaff && totalAllocated > 0 && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-sm text-green-800 font-medium">
                          All staff allocated successfully!
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="special-staffing-reqs" className="text-sm text-slate-700">
                    Special Staffing Requirements
                  </Label>
                  <Textarea
                    id="special-staffing-reqs"
                    placeholder="e.g., bilingual staff, specific certifications, uniform requirements etc."
                    value={specialStaffingReqs}
                    onChange={(e) => setSpecialStaffingReqs(e.target.value)}
                    className="border-slate-200 min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            {/* Payment Options Section */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <DollarSign className="w-5 h-5 text-sangria" />
                <h2 className="font-medium text-slate-900">Payment Options</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment-method" className="text-sm text-slate-700">Preferred Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="border-slate-200">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="creditcard">Credit Card</SelectItem>
                        <SelectItem value="banktransfer">Bank Transfer</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="invoice">Invoice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="payment-timing" className="text-sm text-slate-700">Payment Timing</Label>
                    <Select value={paymentTiming} onValueChange={setPaymentTiming}>
                      <SelectTrigger className="border-slate-200">
                        <SelectValue placeholder="Select payment timing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upfront">Full Payment Upfront</SelectItem>
                        <SelectItem value="deposit">Deposit + Balance</SelectItem>
                        <SelectItem value="after">After Event</SelectItem>
                        <SelectItem value="net30">Net 30</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="formal-contract"
                    checked={formalContract}
                    onCheckedChange={(checked) => setFormalContract(checked as boolean)}
                  />
                  <Label htmlFor="formal-contract" className="font-normal cursor-pointer text-sm">
                    This event requires a formal contract
                  </Label>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="font-medium text-sm text-slate-900 mb-2">Payment Information</p>
                  <ul className="text-xs text-slate-600 space-y-1 ml-4">
                    <li className="list-disc">All payments are processed securely through our platform</li>
                    <li className="list-disc">Deposits are required to secure your booking</li>
                    <li className="list-disc">Cancellation policies apply based on event timing</li>
                    <li className="list-disc">Complete pricing review held for 30 payment terms</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <Info className="w-5 h-5 text-sangria" />
                <h2 className="font-medium text-slate-900">Additional Information</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="special-requirements" className="text-sm text-slate-700">Special Requirements</Label>
                  <Textarea
                    id="special-requirements"
                    placeholder="Any special requirements (dietary restrictions, accessibility needs, etc.)"
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    className="border-slate-200 min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency-contact-name" className="text-sm text-slate-700">Emergency Contact Name</Label>
                    <Input
                      id="emergency-contact-name"
                      placeholder="Emergency contact name"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      className="border-slate-200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emergency-contact-phone" className="text-sm text-slate-700">Emergency Contact Phone</Label>
                    <Input
                      id="emergency-contact-phone"
                      type="tel"
                      placeholder="Emergency contact phone"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      className="border-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional-notes" className="text-sm text-slate-700">Additional Notes</Label>
                  <Textarea
                    id="additional-notes"
                    placeholder="Any additional information you'd like us to know..."
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    className="border-slate-200 min-h-[80px]"
                  />
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Right Sidebar - Cost Breakdown */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-4">
              {/* Estimated Cost Card */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-sangria" />
                    <h3 className="font-medium text-slate-900">Estimated Cost</h3>
                  </div>
                </div>

                <div className="text-center py-8">
                  <p className="text-sm text-slate-500 mb-2">Add staff types to see cost breakdown</p>
                  <div className="text-3xl font-semibold text-slate-900 mb-1">$0</div>
                  <p className="text-xs text-slate-500">Estimated Total</p>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-600 mb-2">Your deposit is calculated based on requirements and preferences.</p>
                  
                  <div className="space-y-2">
                    <Label htmlFor="budget-range" className="text-sm text-slate-700">Your Budget Range</Label>
                    <Input
                      id="budget-range"
                      placeholder="Enter your budget..."
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      className="border-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6 space-y-3">
                <Button 
                  className="w-full bg-sangria hover:bg-merlot text-white"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Submit Event Request
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-slate-300 hover:bg-slate-50"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pay Now
                </Button>

                <p className="text-xs text-center text-slate-500 pt-2">
                  We'll require a deposit once we've confirmed the order (+24 hours)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}