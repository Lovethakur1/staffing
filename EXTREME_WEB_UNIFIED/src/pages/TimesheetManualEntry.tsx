import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { 
  ArrowLeft,
  Plus,
  Trash2,
  Clock,
  Calendar,
  MapPin,
  Save,
  CheckCheck,
  AlertCircle,
  Info
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";

interface TimesheetManualEntryProps {
  userRole: string;
  userId: string;
}

interface ShiftEntry {
  id: string;
  date: string;
  eventId: string;
  eventName: string;
  position: string;
  clockIn: string;
  clockOut: string;
  breakDuration: string;
  notes: string;
}

export function TimesheetManualEntry({ userRole }: TimesheetManualEntryProps) {
  const { setCurrentPage } = useNavigation();
  
  const [shifts, setShifts] = useState<ShiftEntry[]>([
    {
      id: "1",
      date: "",
      eventId: "",
      eventName: "",
      position: "",
      clockIn: "",
      clockOut: "",
      breakDuration: "0",
      notes: ""
    }
  ]);

  const [timesheetInfo, setTimesheetInfo] = useState({
    weekEnding: "",
    notes: ""
  });

  // Mock events for selection
  const availableEvents = [
    { id: "EVT-1234", name: "Corporate Gala 2024", location: "Grand Ballroom" },
    { id: "EVT-1235", name: "Wedding Reception", location: "Riverside Venue" },
    { id: "EVT-1236", name: "Product Launch Event", location: "Tech Convention Center" },
    { id: "EVT-1237", name: "Corporate Training", location: "Business Center" },
    { id: "EVT-1238", name: "Charity Fundraiser", location: "Luxury Hotel" },
    { id: "EVT-1239", name: "Weekend Conference", location: "Convention Center" },
    { id: "EVT-1240", name: "Sunday Brunch Service", location: "Garden Restaurant" },
  ];

  const positions = [
    "Server",
    "Bartender",
    "Event Staff",
    "Setup Crew",
    "Registration Desk",
    "Coat Check",
    "Valet Attendant",
    "Security",
    "Catering Assistant"
  ];

  const addShift = () => {
    const newShift: ShiftEntry = {
      id: Date.now().toString(),
      date: "",
      eventId: "",
      eventName: "",
      position: "",
      clockIn: "",
      clockOut: "",
      breakDuration: "0",
      notes: ""
    };
    setShifts([...shifts, newShift]);
  };

  const removeShift = (id: string) => {
    if (shifts.length > 1) {
      setShifts(shifts.filter(shift => shift.id !== id));
    }
  };

  const updateShift = (id: string, field: keyof ShiftEntry, value: string) => {
    setShifts(shifts.map(shift => {
      if (shift.id === id) {
        const updatedShift = { ...shift, [field]: value };
        
        // If event is selected, auto-fill event name
        if (field === 'eventId') {
          const selectedEvent = availableEvents.find(e => e.id === value);
          if (selectedEvent) {
            updatedShift.eventName = selectedEvent.name;
          }
        }
        
        return updatedShift;
      }
      return shift;
    }));
  };

  const calculateHours = (clockIn: string, clockOut: string, breakMinutes: string) => {
    if (!clockIn || !clockOut) return 0;
    
    const [inHour, inMin] = clockIn.split(':').map(Number);
    const [outHour, outMin] = clockOut.split(':').map(Number);
    
    const inMinutes = inHour * 60 + inMin;
    let outMinutes = outHour * 60 + outMin;
    
    // Handle overnight shifts
    if (outMinutes < inMinutes) {
      outMinutes += 24 * 60;
    }
    
    const totalMinutes = outMinutes - inMinutes - Number(breakMinutes || 0);
    return (totalMinutes / 60).toFixed(2);
  };

  const getTotalHours = () => {
    return shifts.reduce((total, shift) => {
      const hours = Number(calculateHours(shift.clockIn, shift.clockOut, shift.breakDuration));
      return total + hours;
    }, 0).toFixed(2);
  };

  const handleSaveDraft = () => {
    console.log("Saving draft...", { timesheetInfo, shifts });
    // In real app, save to backend
    alert("Timesheet saved as draft!");
  };

  const handleSubmit = () => {
    // Validate all shifts have required fields
    const invalidShifts = shifts.filter(s => 
      !s.date || !s.eventId || !s.position || !s.clockIn || !s.clockOut
    );
    
    if (invalidShifts.length > 0) {
      alert("Please fill in all required fields for each shift");
      return;
    }

    if (!timesheetInfo.weekEnding) {
      alert("Please select week ending date");
      return;
    }
    
    console.log("Submitting timesheet...", { timesheetInfo, shifts });
    // In real app, submit to backend
    alert("Timesheet submitted successfully!");
    setCurrentPage('timesheets');
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage('timesheets')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Add Timesheet</h1>
            <p className="text-sm lg:text-base text-muted-foreground mt-1">
              Manually enter your work hours and shift details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button 
            size="sm" 
            className="bg-sangria hover:bg-merlot"
            onClick={handleSubmit}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Submit Timesheet
          </Button>
        </div>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-blue-900 mb-1">Manual Timesheet Entry</h4>
          <p className="text-sm text-blue-700">
            Use this form to manually enter hours for shifts where automatic time tracking wasn't available. 
            All entries must be verified by your manager before payment can be processed.
          </p>
        </div>
      </div>

      {/* Timesheet Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Timesheet Period
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weekEnding">Week Ending Date *</Label>
              <Input
                id="weekEnding"
                type="date"
                value={timesheetInfo.weekEnding}
                onChange={(e) => setTimesheetInfo({ ...timesheetInfo, weekEnding: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">Select the Sunday that ends your work week</p>
            </div>
            <div className="space-y-2">
              <Label>Total Hours (Calculated)</Label>
              <div className="h-10 px-3 rounded-md border border-input bg-muted flex items-center">
                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="font-semibold">{getTotalHours()} hours</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timesheetNotes">Timesheet Notes (Optional)</Label>
            <Textarea
              id="timesheetNotes"
              placeholder="Add any notes about this timesheet period..."
              value={timesheetInfo.notes}
              onChange={(e) => setTimesheetInfo({ ...timesheetInfo, notes: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Shifts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Shift Entries</h2>
          <Button onClick={addShift} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Shift
          </Button>
        </div>

        {shifts.map((shift, index) => (
          <Card key={shift.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Shift #{index + 1}
                  {shift.clockIn && shift.clockOut && (
                    <Badge className="ml-3" variant="outline">
                      {calculateHours(shift.clockIn, shift.clockOut, shift.breakDuration)} hours
                    </Badge>
                  )}
                </CardTitle>
                {shifts.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeShift(shift.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor={`date-${shift.id}`}>Date *</Label>
                  <Input
                    id={`date-${shift.id}`}
                    type="date"
                    value={shift.date}
                    onChange={(e) => updateShift(shift.id, 'date', e.target.value)}
                    required
                  />
                </div>

                {/* Event Selection */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`event-${shift.id}`}>Event *</Label>
                  <Select
                    value={shift.eventId}
                    onValueChange={(value) => updateShift(shift.id, 'eventId', value)}
                  >
                    <SelectTrigger id={`event-${shift.id}`}>
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEvents.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          <div className="flex items-center gap-2">
                            <span>{event.name}</span>
                            <span className="text-xs text-muted-foreground">• {event.location}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <Label htmlFor={`position-${shift.id}`}>Position *</Label>
                  <Select
                    value={shift.position}
                    onValueChange={(value) => updateShift(shift.id, 'position', value)}
                  >
                    <SelectTrigger id={`position-${shift.id}`}>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clock In */}
                <div className="space-y-2">
                  <Label htmlFor={`clockIn-${shift.id}`}>Clock In Time *</Label>
                  <Input
                    id={`clockIn-${shift.id}`}
                    type="time"
                    value={shift.clockIn}
                    onChange={(e) => updateShift(shift.id, 'clockIn', e.target.value)}
                    required
                  />
                </div>

                {/* Clock Out */}
                <div className="space-y-2">
                  <Label htmlFor={`clockOut-${shift.id}`}>Clock Out Time *</Label>
                  <Input
                    id={`clockOut-${shift.id}`}
                    type="time"
                    value={shift.clockOut}
                    onChange={(e) => updateShift(shift.id, 'clockOut', e.target.value)}
                    required
                  />
                </div>

                {/* Break Duration */}
                <div className="space-y-2">
                  <Label htmlFor={`break-${shift.id}`}>Break Duration (minutes)</Label>
                  <Input
                    id={`break-${shift.id}`}
                    type="number"
                    min="0"
                    step="15"
                    placeholder="0"
                    value={shift.breakDuration}
                    onChange={(e) => updateShift(shift.id, 'breakDuration', e.target.value)}
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`notes-${shift.id}`}>Shift Notes (Optional)</Label>
                  <Input
                    id={`notes-${shift.id}`}
                    placeholder="Any additional information about this shift..."
                    value={shift.notes}
                    onChange={(e) => updateShift(shift.id, 'notes', e.target.value)}
                  />
                </div>
              </div>

              {/* Calculated Hours Display */}
              {shift.clockIn && shift.clockOut && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Calculated Hours:</span>
                    <span className="font-semibold text-lg">
                      {calculateHours(shift.clockIn, shift.clockOut, shift.breakDuration)} hours
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Timesheet Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Shifts</p>
              <p className="text-2xl font-semibold">{shifts.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Hours</p>
              <p className="text-2xl font-semibold">{getTotalHours()}h</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Estimated Pay</p>
              <p className="text-2xl font-semibold text-sangria">
                ${(Number(getTotalHours()) * 25).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Based on $25/hour</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => setCurrentPage('timesheets')}
        >
          Cancel
        </Button>
        <Button
          variant="outline"
          onClick={handleSaveDraft}
        >
          <Save className="h-4 w-4 mr-2" />
          Save as Draft
        </Button>
        <Button
          className="bg-sangria hover:bg-merlot"
          onClick={handleSubmit}
        >
          <CheckCheck className="h-4 w-4 mr-2" />
          Submit Timesheet
        </Button>
      </div>
    </div>
  );
}
