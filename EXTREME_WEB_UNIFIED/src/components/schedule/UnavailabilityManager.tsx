import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { Separator } from "../ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TimeInput } from "../ui/time-input";
import { 
  CalendarX, 
  Clock, 
  Plus, 
  Trash2, 
  Save,
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle,
  X,
  Zap,
  Coffee,
  GraduationCap,
  Plane,
  Heart,
  Briefcase,
  Moon,
  Sun,
  RefreshCw,
  Eye,
  Edit3,
  Copy
} from "lucide-react";
import { toast } from "sonner";

interface TimeSlot {
  startTime: string;
  endTime: string;
  reason?: string;
}

interface UnavailabilityRecord {
  id: string;
  date: Date;
  type: 'full-day' | 'time-range';
  timeSlots?: TimeSlot[];
  reason?: string;
  createdAt: Date;
  category?: string;
}

interface UnavailabilityManagerProps {
  records: UnavailabilityRecord[];
  onRecordsChange: (records: UnavailabilityRecord[]) => void;
}

// Quick reason templates
const REASON_TEMPLATES = [
  { icon: Coffee, label: "Personal Time", category: "personal" },
  { icon: GraduationCap, label: "School/Classes", category: "education" },
  { icon: Heart, label: "Medical Appointment", category: "medical" },
  { icon: Plane, label: "Vacation/Travel", category: "vacation" },
  { icon: Briefcase, label: "Other Work", category: "work" },
  { icon: Moon, label: "Family Commitment", category: "family" }
];

// Quick time templates
const TIME_TEMPLATES = [
  { label: "Morning", start: "09:00", end: "12:00" },
  { label: "Afternoon", start: "13:00", end: "17:00" },
  { label: "Evening", start: "18:00", end: "22:00" },
  { label: "Custom", start: "", end: "" }
];

export function UnavailabilityManager({ records, onRecordsChange }: UnavailabilityManagerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [unavailabilityType, setUnavailabilityType] = useState<'full-day' | 'time-range'>('full-day');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([{ startTime: '', endTime: '', reason: '' }]);
  const [fullDayReason, setFullDayReason] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Check if a date has unavailability
  const getUnavailabilityForDate = (date: Date): UnavailabilityRecord | undefined => {
    return records.find(record => 
      record.date.toDateString() === date.toDateString()
    );
  };

  const addTimeSlot = () => {
    setTimeSlots(prev => [...prev, { startTime: '', endTime: '', reason: '' }]);
  };

  const removeTimeSlot = (index: number) => {
    if (timeSlots.length > 1) {
      setTimeSlots(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string) => {
    setTimeSlots(prev => prev.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    ));
  };

  const applyTimeTemplate = (template: typeof TIME_TEMPLATES[0]) => {
    if (template.label === "Custom") return;
    
    setTimeSlots(prev => prev.map((slot, index) => 
      index === 0 ? { ...slot, startTime: template.start, endTime: template.end } : slot
    ));
  };

  const applyReasonTemplate = (template: typeof REASON_TEMPLATES[0]) => {
    setSelectedCategory(template.category);
    if (unavailabilityType === 'full-day') {
      setFullDayReason(template.label);
    } else {
      setTimeSlots(prev => prev.map((slot, index) => 
        index === 0 ? { ...slot, reason: template.label } : slot
      ));
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate) return;

    setIsSubmitting(true);

    try {
      // Check if there's already an unavailability record for this date
      const existingRecord = getUnavailabilityForDate(selectedDate);
      
      if (existingRecord) {
        // Update existing record
        const updatedRecords = records.map(record => 
          record.id === existingRecord.id ? {
            ...record,
            type: unavailabilityType,
            category: selectedCategory,
            ...(unavailabilityType === 'full-day' 
              ? { reason: fullDayReason, timeSlots: undefined }
              : { timeSlots: timeSlots.filter(slot => slot.startTime && slot.endTime), reason: undefined }
            )
          } : record
        );
        onRecordsChange(updatedRecords);
        toast.success("Unavailability updated successfully!");
      } else {
        // Create new record
        const newRecord: UnavailabilityRecord = {
          id: `unavail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: selectedDate,
          type: unavailabilityType,
          category: selectedCategory,
          ...(unavailabilityType === 'full-day' 
            ? { reason: fullDayReason }
            : { timeSlots: timeSlots.filter(slot => slot.startTime && slot.endTime) }
          ),
          createdAt: new Date()
        };
        onRecordsChange([...records, newRecord]);
        toast.success("Unavailability marked successfully!");
      }

      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error saving unavailability:', error);
      toast.error("Failed to save unavailability. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeRecord = (recordId: string) => {
    onRecordsChange(records.filter(record => record.id !== recordId));
    toast.success("Unavailability removed successfully!");
  };

  const duplicateRecord = (record: UnavailabilityRecord) => {
    setSelectedDate(record.date);
    setUnavailabilityType(record.type);
    setSelectedCategory(record.category || '');
    
    if (record.type === 'full-day') {
      setFullDayReason(record.reason || '');
    } else {
      setTimeSlots(record.timeSlots || [{ startTime: '', endTime: '', reason: '' }]);
    }
    
    toast.success("Record loaded for editing!");
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setUnavailabilityType('full-day');
    setTimeSlots([{ startTime: '', endTime: '', reason: '' }]);
    setFullDayReason('');
    setSelectedCategory('');
    setSelectedTemplate('');
  };

  // Load existing data when date is selected
  useEffect(() => {
    if (selectedDate) {
      const existing = getUnavailabilityForDate(selectedDate);
      if (existing) {
        setUnavailabilityType(existing.type);
        setSelectedCategory(existing.category || '');
        if (existing.type === 'full-day') {
          setFullDayReason(existing.reason || '');
        } else {
          setTimeSlots(existing.timeSlots || [{ startTime: '', endTime: '', reason: '' }]);
        }
      } else {
        setUnavailabilityType('full-day');
        setTimeSlots([{ startTime: '', endTime: '', reason: '' }]);
        setFullDayReason('');
        setSelectedCategory('');
      }
    }
  }, [selectedDate, records]);

  const formatTimeSlot = (slot: TimeSlot) => {
    return `${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}`;
  };

  const getCategoryIcon = (category: string) => {
    const template = REASON_TEMPLATES.find(t => t.category === category);
    return template?.icon || CalendarX;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      personal: 'bg-blue-100 text-blue-800',
      education: 'bg-green-100 text-green-800',
      medical: 'bg-red-100 text-red-800',
      vacation: 'bg-purple-100 text-purple-800',
      work: 'bg-yellow-100 text-yellow-800',
      family: 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const canSubmit = selectedDate && (
    unavailabilityType === 'full-day' || 
    timeSlots.some(slot => slot.startTime && slot.endTime)
  );

  const upcomingRecords = records
    .filter(record => record.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const pastRecords = records
    .filter(record => record.date < new Date())
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <CalendarX className="h-5 w-5 text-primary" />
            Availability Management
          </h3>
          <p className="text-sm text-muted-foreground">
            Mark dates and times when you're not available to work
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="h-8"
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              Calendar
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8"
            >
              <Eye className="h-4 w-4 mr-1" />
              List
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={resetForm}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Select Date</span>
                {selectedDate && (
                  <Badge variant="outline" className="text-xs">
                    {selectedDate.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-lg border bg-background"
                  modifiersStyles={{
                    selected: {
                      backgroundColor: 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))'
                    }
                  }}
                  modifiers={{
                    unavailable: (date) => !!getUnavailabilityForDate(date),
                    hasFullDay: (date) => {
                      const record = getUnavailabilityForDate(date);
                      return record?.type === 'full-day';
                    },
                    hasPartial: (date) => {
                      const record = getUnavailabilityForDate(date);
                      return record?.type === 'time-range';
                    }
                  }}
                  modifiersClassNames={{
                    unavailable: 'font-semibold',
                    hasFullDay: 'bg-red-100 text-red-900 hover:bg-red-200',
                    hasPartial: 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200'
                  }}
                />
              </div>
              
              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                  <span>Full Day</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
                  <span>Partial Day</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
                  <span>Selected</span>
                </div>
              </div>
              
              {selectedDate && (
                <div className="mt-4 p-3 bg-accent/50 rounded-lg">
                  <p className="text-sm font-medium">Selected Date:</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  {getUnavailabilityForDate(selectedDate) && (
                    <Badge variant="secondary" className="mt-2">
                      <Edit3 className="h-3 w-3 mr-1" />
                      Editing existing record
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Unavailability Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedDate ? (
                <>
                  {/* Quick Reason Templates */}
                  <div className="space-y-3">
                    <Label>Quick Templates</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {REASON_TEMPLATES.map((template) => {
                        const Icon = template.icon;
                        return (
                          <Button
                            key={template.category}
                            variant="outline"
                            size="sm"
                            onClick={() => applyReasonTemplate(template)}
                            className={`justify-start h-auto p-3 ${
                              selectedCategory === template.category ? 'border-primary bg-primary/5' : ''
                            }`}
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            <span className="text-xs">{template.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  {/* Type Selection */}
                  <div className="space-y-3">
                    <Label>Unavailability Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={unavailabilityType === 'full-day' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setUnavailabilityType('full-day')}
                        className="justify-start"
                      >
                        <Sun className="h-4 w-4 mr-2" />
                        Full Day
                      </Button>
                      <Button
                        variant={unavailabilityType === 'time-range' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setUnavailabilityType('time-range')}
                        className="justify-start"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Time Range
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Full Day Configuration */}
                  {unavailabilityType === 'full-day' && (
                    <div className="space-y-3">
                      <Label htmlFor="reason">Reason (Optional)</Label>
                      <Textarea
                        id="reason"
                        placeholder="e.g., Personal appointment, vacation, medical..."
                        value={fullDayReason}
                        onChange={(e) => setFullDayReason(e.target.value)}
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Time Range Configuration */}
                  {unavailabilityType === 'time-range' && (
                    <div className="space-y-4">
                      {/* Time Templates */}
                      <div className="space-y-2">
                        <Label>Quick Times</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {TIME_TEMPLATES.map((template) => (
                            <Button
                              key={template.label}
                              variant="outline"
                              size="sm"
                              onClick={() => applyTimeTemplate(template)}
                              className="justify-start text-xs"
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              {template.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Time Periods</Label>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={addTimeSlot}
                          className="h-8"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Period
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {timeSlots.map((slot, index) => (
                          <div key={index} className="p-3 border rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Period {index + 1}</span>
                              {timeSlots.length > 1 && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeTimeSlot(index)}
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Start Time</Label>
                                <TimeInput
                                  value={slot.startTime}
                                  onChange={(value) => updateTimeSlot(index, 'startTime', value)}
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">End Time</Label>
                                <TimeInput
                                  value={slot.endTime}
                                  onChange={(value) => updateTimeSlot(index, 'endTime', value)}
                                  className="text-sm"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-xs">Reason (Optional)</Label>
                              <Input
                                placeholder="e.g., Doctor appointment"
                                value={slot.reason}
                                onChange={(e) => updateTimeSlot(index, 'reason', e.target.value)}
                                className="text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={!canSubmit || isSubmitting}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Saving...' : getUnavailabilityForDate(selectedDate) ? 'Update' : 'Save'} Unavailability
                    </Button>
                    <Button variant="outline" onClick={resetForm}>
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Select a date from the calendar to mark unavailability
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* List View */
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarX className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Total Records</span>
                </div>
                <div className="text-2xl font-semibold">{records.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Upcoming</span>
                </div>
                <div className="text-2xl font-semibold">{upcomingRecords.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Past</span>
                </div>
                <div className="text-2xl font-semibold">{pastRecords.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Records */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Upcoming Unavailability
                </span>
                <Badge variant="secondary">{upcomingRecords.length} records</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingRecords.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No upcoming unavailability periods. You're available for all shifts!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingRecords.map((record) => (
                    <UnavailabilityRecordCard 
                      key={record.id} 
                      record={record} 
                      onRemove={removeRecord}
                      onDuplicate={duplicateRecord}
                      getCategoryIcon={getCategoryIcon}
                      getCategoryColor={getCategoryColor}
                      formatTimeSlot={formatTimeSlot}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Past Records */}
          {pastRecords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Past Unavailability
                  </span>
                  <Badge variant="outline">{pastRecords.length} records</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {pastRecords.map((record) => (
                    <UnavailabilityRecordCard 
                      key={record.id} 
                      record={record} 
                      onRemove={removeRecord}
                      onDuplicate={duplicateRecord}
                      getCategoryIcon={getCategoryIcon}
                      getCategoryColor={getCategoryColor}
                      formatTimeSlot={formatTimeSlot}
                      isPast={true}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// Extracted record card component
function UnavailabilityRecordCard({ 
  record, 
  onRemove, 
  onDuplicate, 
  getCategoryIcon, 
  getCategoryColor, 
  formatTimeSlot,
  isPast = false
}: {
  record: UnavailabilityRecord;
  onRemove: (id: string) => void;
  onDuplicate: (record: UnavailabilityRecord) => void;
  getCategoryIcon: (category: string) => any;
  getCategoryColor: (category: string) => string;
  formatTimeSlot: (slot: TimeSlot) => string;
  isPast?: boolean;
}) {
  const CategoryIcon = getCategoryIcon(record.category || '');
  
  return (
    <div className={`p-4 border rounded-lg ${isPast ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-medium">
              {record.date.toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
            <Badge variant={record.type === 'full-day' ? 'default' : 'secondary'}>
              {record.type === 'full-day' ? 'Full Day' : 'Partial'}
            </Badge>
            {record.category && (
              <Badge className={getCategoryColor(record.category)}>
                <CategoryIcon className="h-3 w-3 mr-1" />
                {record.category.charAt(0).toUpperCase() + record.category.slice(1)}
              </Badge>
            )}
            {isPast && (
              <Badge variant="outline" className="text-xs">
                Past
              </Badge>
            )}
          </div>
          
          {record.type === 'full-day' ? (
            <div>
              <p className="text-sm text-muted-foreground">Unavailable all day</p>
              {record.reason && (
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium">Reason:</span> {record.reason}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {record.timeSlots?.map((slot, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {formatTimeSlot(slot)}
                  </span>
                  {slot.reason && (
                    <span className="text-xs text-muted-foreground">
                      • {slot.reason}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mt-2">
            Added {record.createdAt.toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(record)}
            className="h-8 w-8 p-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(record.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
