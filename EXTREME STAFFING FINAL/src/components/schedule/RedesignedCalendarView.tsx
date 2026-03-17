import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Grid3X3,
  List,
  Eye,
  MoreHorizontal,
  Filter,
  CheckCircle2
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

interface RedesignedCalendarViewProps {
  shifts: Shift[];
  viewMode: 'week' | 'month';
  onViewModeChange: (mode: 'week' | 'month') => void;
}

export function RedesignedCalendarView({ shifts, viewMode, onViewModeChange }: RedesignedCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<'grid' | 'list'>('grid');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showConfirmedOnly, setShowConfirmedOnly] = useState(false);

  // Get shifts for a specific date (with optional confirmed filter)
  const getShiftsForDate = (date: Date): Shift[] => {
    const dateStr = date.toISOString().split('T')[0];
    let filteredShifts = shifts.filter(shift => shift.date === dateStr);
    
    if (showConfirmedOnly) {
      filteredShifts = filteredShifts.filter(shift => shift.status === 'confirmed');
    }
    
    return filteredShifts;
  };

  // Get all dates that have shifts (with optional confirmed filter)
  const shiftsMap = useMemo(() => {
    const map = new Map<string, Shift[]>();
    let filteredShifts = shifts;
    
    if (showConfirmedOnly) {
      filteredShifts = shifts.filter(shift => shift.status === 'confirmed');
    }
    
    filteredShifts.forEach(shift => {
      const dateStr = shift.date;
      if (!map.has(dateStr)) {
        map.set(dateStr, []);
      }
      map.get(dateStr)!.push(shift);
    });
    return map;
  }, [shifts, showConfirmedOnly]);

  // Calendar modifiers for different shift statuses
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
    },
    hasCancelled: (date: Date) => {
      const dateShifts = getShiftsForDate(date);
      return dateShifts.some(shift => shift.status === 'cancelled');
    }
  };

  const modifiersClassNames = {
    hasShifts: 'relative',
    hasConfirmed: 'bg-primary/10 text-primary border-primary/20 font-semibold',
    hasPending: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
    hasCompleted: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
    hasCancelled: 'bg-red-50 text-red-700 border-red-200 font-medium opacity-60'
  };

  const selectedDateShifts = getShiftsForDate(selectedDate);

  // Calculate monthly statistics
  const monthlyStats = useMemo(() => {
    const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    
    let monthShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= monthStart && shiftDate <= monthEnd;
    });

    if (showConfirmedOnly) {
      monthShifts = monthShifts.filter(s => s.status === 'confirmed');
    }

    return {
      total: monthShifts.length,
      confirmed: monthShifts.filter(s => s.status === 'confirmed').length,
      pending: monthShifts.filter(s => s.status === 'pending').length,
      completed: monthShifts.filter(s => s.status === 'completed').length,
      totalEarnings: monthShifts
        .filter(s => s.status === 'confirmed' || s.status === 'completed')
        .reduce((sum, s) => sum + (s.hourlyRate * s.duration), 0),
      totalHours: monthShifts
        .filter(s => s.status === 'confirmed' || s.status === 'completed')
        .reduce((sum, s) => sum + s.duration, 0)
    };
  }, [shifts, selectedMonth, showConfirmedOnly]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { 
          badge: <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 text-xs">Confirmed</Badge>,
          color: 'text-primary'
        };
      case 'pending':
        return { 
          badge: <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 text-xs">Pending</Badge>,
          color: 'text-amber-600'
        };
      case 'completed':
        return { 
          badge: <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 text-xs">Completed</Badge>,
          color: 'text-emerald-600'
        };
      case 'cancelled':
        return { 
          badge: <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200 text-xs">Cancelled</Badge>,
          color: 'text-red-600'
        };
      default:
        return { 
          badge: <Badge variant="secondary" className="text-xs">{status}</Badge>,
          color: 'text-muted-foreground'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-medium">
            {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Calendar
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(selectedMonth);
                newDate.setMonth(newDate.getMonth() - 1);
                setSelectedMonth(newDate);
                setSelectedDate(newDate);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                setSelectedMonth(today);
                setSelectedDate(today);
              }}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(selectedMonth);
                newDate.setMonth(newDate.getMonth() + 1);
                setSelectedMonth(newDate);
                setSelectedDate(newDate);
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* View Controls */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={calendarView === 'grid' ? "default" : "ghost"}
              size="sm"
              onClick={() => setCalendarView('grid')}
              className="h-8 px-3"
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Calendar</span>
            </Button>
            <Button
              variant={calendarView === 'list' ? "default" : "ghost"}
              size="sm"
              onClick={() => setCalendarView('list')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">List</span>
            </Button>
          </div>
          
          {/* Filter Controls */}
          <Separator orientation="vertical" className="h-8" />
          <Button
            variant={showConfirmedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowConfirmedOnly(!showConfirmedOnly)}
            className="flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">
              {showConfirmedOnly ? "Confirmed Only" : "All Shifts"}
            </span>
            <span className="sm:hidden">
              {showConfirmedOnly ? "Confirmed" : "All"}
            </span>
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="text-center p-4 bg-background rounded-lg border">
          <div className="text-2xl font-bold text-foreground">{monthlyStats.total}</div>
          <div className="text-sm text-muted-foreground">Total Shifts</div>
        </div>
        <div className="text-center p-4 bg-background rounded-lg border">
          <div className="text-2xl font-bold text-emerald-600">{monthlyStats.completed}</div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </div>
        <div className="text-center p-4 bg-background rounded-lg border">
          <div className="text-2xl font-bold text-primary">{monthlyStats.confirmed}</div>
          <div className="text-sm text-muted-foreground">Confirmed</div>
        </div>
        <div className="text-center p-4 bg-background rounded-lg border">
          <div className="text-2xl font-bold text-amber-600">{monthlyStats.pending}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
        <div className="text-center p-4 bg-background rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{monthlyStats.totalHours}h</div>
          <div className="text-sm text-muted-foreground">Total Hours</div>
        </div>
        <div className="text-center p-4 bg-background rounded-lg border">
          <div className="text-2xl font-bold text-green-600">${monthlyStats.totalEarnings}</div>
          <div className="text-sm text-muted-foreground">Earnings</div>
        </div>
      </div>



      {calendarView === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card className="w-full">
            <CardHeader className="pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-lg font-medium">
                  {selectedMonth.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })} Calendar
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(selectedMonth);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setSelectedMonth(newDate);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMonth(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(selectedMonth);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setSelectedMonth(newDate);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Legend */}
              <div className="flex items-center justify-center gap-8 text-sm p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary/20 border border-primary/30 rounded"></div>
                  <span>Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-100 border border-amber-200 rounded"></div>
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-100 border border-emerald-200 rounded"></div>
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                  <span>Cancelled</span>
                </div>
              </div>

              {/* Full Width Calendar */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Large Calendar Display */}
                <div className="lg:col-span-3 flex justify-center">
                  <div className="w-full max-w-4xl">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      month={selectedMonth}
                      onMonthChange={setSelectedMonth}
                      modifiers={modifiers}
                      modifiersClassNames={modifiersClassNames}
                      className="rounded-lg border bg-background calendar-improved w-full scale-125 transform-gpu origin-center"
                    />
                  </div>
                </div>


              </div>
            </CardContent>
          </Card>

          {/* Selected Date Details */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {selectedDateShifts.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="font-medium text-muted-foreground mb-1">
                      No shifts scheduled
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your day is free for new opportunities
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDateShifts
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((shift) => {
                        const statusInfo = getStatusInfo(shift.status);
                        return (
                          <div key={shift.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate mb-1">{shift.title}</h4>
                                <p className="text-xs text-muted-foreground mb-2">{shift.role}</p>
                                
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs">
                                      {shift.startTime} - {shift.endTime}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground truncate">
                                      {shift.location}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs font-medium">
                                      ${shift.hourlyRate * shift.duration} total
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              {statusInfo.badge}
                              <span className="text-xs text-muted-foreground">{shift.client}</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* List View - Integrated with Calendar Filters */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {showConfirmedOnly ? "Confirmed Shifts" : "All Shifts"}
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {(showConfirmedOnly ? shifts.filter(s => s.status === 'confirmed') : shifts).length} shifts
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {(showConfirmedOnly ? shifts.filter(s => s.status === 'confirmed') : shifts).length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium text-muted-foreground mb-2">
                      {showConfirmedOnly ? "No confirmed shifts found" : "No shifts found"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {showConfirmedOnly 
                        ? "You don't have any confirmed shifts in your schedule yet"
                        : "Your schedule is currently empty"
                      }
                    </p>
                  </div>
                ) : (
                  (showConfirmedOnly ? shifts.filter(s => s.status === 'confirmed') : shifts)
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((shift) => {
                      const statusInfo = getStatusInfo(shift.status);
                      return (
                        <div key={shift.id} className="group p-4 border rounded-lg hover:shadow-sm transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="text-center min-w-[40px]">
                                <div className="text-sm font-bold text-primary">
                                  {new Date(shift.date).getDate()}
                                </div>
                                <div className="text-xs text-muted-foreground uppercase">
                                  {new Date(shift.date).toLocaleDateString('en-US', { month: 'short' })}
                                </div>
                              </div>
                              <Separator orientation="vertical" className="h-10" />
                              <div className="flex-1">
                                <h4 className="font-medium mb-1">{shift.title}</h4>
                                <p className="text-sm text-muted-foreground">{shift.role} • {shift.client}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {statusInfo.badge}
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{shift.startTime} - {shift.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{shift.location}</span>
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                              <DollarSign className="h-4 w-4 text-emerald-600" />
                              <span className="font-medium text-emerald-600">
                                ${shift.hourlyRate * shift.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}