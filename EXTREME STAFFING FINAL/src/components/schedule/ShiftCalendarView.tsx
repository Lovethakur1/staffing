import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Filter,
  Eye
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

interface Shift {
  id: string;
  title: string;
  client: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  address: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  type: string;
  role: string;
  hourlyRate: number;
  duration: number;
  requirements?: string;
  description?: string;
  clientPhone?: string;
  clientEmail?: string;
}

interface ShiftCalendarViewProps {
  shifts: Shift[];
  viewMode: 'week' | 'month';
  onViewModeChange: (mode: 'week' | 'month') => void;
}

export function ShiftCalendarView({ shifts, viewMode, onViewModeChange }: ShiftCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  // Get shifts for a specific date
  const getShiftsForDate = (date: Date): Shift[] => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter(shift => shift.date === dateStr);
  };

  // Get all dates that have shifts
  const shiftsMap = useMemo(() => {
    const map = new Map<string, Shift[]>();
    shifts.forEach(shift => {
      const dateStr = shift.date;
      if (!map.has(dateStr)) {
        map.set(dateStr, []);
      }
      map.get(dateStr)!.push(shift);
    });
    return map;
  }, [shifts]);

  // Calendar modifiers
  const modifiers = {
    hasShifts: (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      return shiftsMap.has(dateStr);
    },
    hasConfirmed: (date: Date) => {
      const dateShifts = getShiftsForDate(date);
      return dateShifts.some(shift => shift.status === 'confirmed');
    },
    hasPending: (date: Date) => {
      const dateShifts = getShiftsForDate(date);
      return dateShifts.some(shift => shift.status === 'pending');
    },
    hasCompleted: (date: Date) => {
      const dateShifts = getShiftsForDate(date);
      return dateShifts.some(shift => shift.status === 'completed');
    }
  };

  const modifiersClassNames = {
    hasShifts: 'font-semibold',
    hasConfirmed: 'bg-blue-100 text-blue-900',
    hasPending: 'bg-yellow-100 text-yellow-900',
    hasCompleted: 'bg-green-100 text-green-900'
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="text-xs">Cancelled</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  const selectedDateShifts = getShiftsForDate(selectedDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Calendar View
          </h3>
          <p className="text-sm text-muted-foreground">
            View your shifts in calendar format
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('month')}
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('week')}
            >
              Week
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {selectedDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setSelectedDate(newDate);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setSelectedDate(newDate);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-100 rounded"></div>
                  <span>Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 rounded"></div>
                  <span>Completed</span>
                </div>
              </div>

              {/* Calendar */}
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  month={selectedDate}
                  onMonthChange={setSelectedDate}
                  modifiers={modifiers}
                  modifiersClassNames={modifiersClassNames}
                  className="rounded-lg border bg-background"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateShifts.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No shifts scheduled for this date
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateShifts
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((shift) => (
                  <div key={shift.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{shift.title}</p>
                        <p className="text-xs text-muted-foreground">{shift.role}</p>
                        
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {shift.startTime} - {shift.endTime}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground truncate">
                            {shift.location}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 mt-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            ${shift.hourlyRate}/hr • ${shift.hourlyRate * shift.duration} total
                          </span>
                        </div>
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Shift Details</DialogTitle>
                            <DialogDescription>
                              View comprehensive information about this shift including event details, timing, and requirements.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            {/* Event Information */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-primary" />
                                Event Information
                              </h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Event:</span>
                                  <p className="font-medium">{shift.title}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Client:</span>
                                  <p className="font-medium">{shift.client}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Role:</span>
                                  <p className="font-medium">{shift.role}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Status:</span>
                                  <div className="mt-1">{getStatusBadge(shift.status)}</div>
                                </div>
                              </div>
                            </div>

                            {/* Schedule */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                Schedule
                              </h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Date:</span>
                                  <p className="font-medium">{new Date(shift.date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Time:</span>
                                  <p className="font-medium">{shift.startTime} - {shift.endTime}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Duration:</span>
                                  <p className="font-medium">{shift.duration} hours</p>
                                </div>
                              </div>
                            </div>

                            {/* Location */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                Location
                              </h4>
                              <div className="text-sm">
                                <p className="font-medium">{shift.location}</p>
                                <p className="text-muted-foreground">{shift.address}</p>
                              </div>
                            </div>

                            {/* Financial */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-primary" />
                                Payment
                              </h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Hourly Rate:</span>
                                  <p className="font-medium">${shift.hourlyRate}/hour</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Total Earnings:</span>
                                  <p className="font-medium">${shift.hourlyRate * shift.duration}</p>
                                </div>
                              </div>
                            </div>

                            {/* Additional Info */}
                            {(shift.requirements || shift.description) && (
                              <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                  <Users className="h-4 w-4 text-primary" />
                                  Additional Information
                                </h4>
                                <div className="space-y-3 text-sm">
                                  {shift.requirements && (
                                    <div>
                                      <span className="text-muted-foreground">Requirements:</span>
                                      <p>{shift.requirements}</p>
                                    </div>
                                  )}
                                  {shift.description && (
                                    <div>
                                      <span className="text-muted-foreground">Description:</span>
                                      <p>{shift.description}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {getStatusBadge(shift.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}