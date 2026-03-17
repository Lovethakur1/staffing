import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Filter,
  Eye,
  Grid3X3,
  List,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap,
  TrendingUp,
  Search,
  MoreHorizontal
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

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

interface EnhancedCalendarViewProps {
  shifts: Shift[];
  viewMode: 'week' | 'month';
  onViewModeChange: (mode: 'week' | 'month') => void;
}

export function EnhancedCalendarView({ shifts, viewMode, onViewModeChange }: EnhancedCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Filter shifts based on search and status
  const filteredShifts = useMemo(() => {
    return shifts.filter(shift => {
      const matchesSearch = searchQuery === '' || 
        shift.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shift.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shift.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || shift.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [shifts, searchQuery, filterStatus]);

  // Get shifts for a specific date
  const getShiftsForDate = (date: Date): Shift[] => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredShifts.filter(shift => shift.date === dateStr);
  };

  // Get all dates that have shifts
  const shiftsMap = useMemo(() => {
    const map = new Map<string, Shift[]>();
    filteredShifts.forEach(shift => {
      const dateStr = shift.date;
      if (!map.has(dateStr)) {
        map.set(dateStr, []);
      }
      map.get(dateStr)!.push(shift);
    });
    return map;
  }, [filteredShifts]);

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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { 
          badge: <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">Confirmed</Badge>,
          icon: <CheckCircle className="h-3 w-3 text-primary" />,
          color: 'text-primary'
        };
      case 'pending':
        return { 
          badge: <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">Pending</Badge>,
          icon: <AlertCircle className="h-3 w-3 text-amber-600" />,
          color: 'text-amber-600'
        };
      case 'completed':
        return { 
          badge: <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Completed</Badge>,
          icon: <CheckCircle className="h-3 w-3 text-emerald-600" />,
          color: 'text-emerald-600'
        };
      case 'cancelled':
        return { 
          badge: <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200">Cancelled</Badge>,
          icon: <XCircle className="h-3 w-3 text-red-600" />,
          color: 'text-red-600'
        };
      default:
        return { 
          badge: <Badge variant="secondary">{status}</Badge>,
          icon: <AlertCircle className="h-3 w-3" />,
          color: 'text-muted-foreground'
        };
    }
  };

  const selectedDateShifts = getShiftsForDate(selectedDate);

  // Calculate calendar statistics
  const calendarStats = useMemo(() => {
    const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    
    const monthShifts = filteredShifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= monthStart && shiftDate <= monthEnd;
    });

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
  }, [filteredShifts, selectedMonth]);

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 mb-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Enhanced Calendar View
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage your schedule with an advanced calendar interface
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
            <Input
              placeholder="Search shifts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full sm:w-[200px]"
            />
          </div>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={calendarView === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCalendarView('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={calendarView === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCalendarView('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Monthly Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Overview
            </CardTitle>
            <div className="flex items-center gap-2">
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
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="text-xl font-bold text-primary">{calendarStats.total}</div>
              <div className="text-xs text-muted-foreground">Total Shifts</div>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="text-xl font-bold text-emerald-600">{calendarStats.completed}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="text-xl font-bold text-primary">{calendarStats.confirmed}</div>
              <div className="text-xs text-muted-foreground">Confirmed</div>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="text-xl font-bold text-amber-600">{calendarStats.pending}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xl font-bold text-blue-600">{calendarStats.totalHours}h</div>
              <div className="text-xs text-muted-foreground">Total Hours</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-xl font-bold text-green-600">${calendarStats.totalEarnings}</div>
              <div className="text-xs text-muted-foreground">Earnings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={calendarView} onValueChange={(value) => setCalendarView(value as 'grid' | 'list')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grid" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Calendar Grid
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            List View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Enhanced Calendar */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
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
                        setSelectedMonth(newDate);
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date();
                        setSelectedDate(today);
                        setSelectedMonth(today);
                      }}
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
                        setSelectedMonth(newDate);
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
                  <div className="flex flex-wrap gap-4 text-xs p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary/20 border border-primary/30 rounded"></div>
                      <span>Confirmed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-amber-100 border border-amber-200 rounded"></div>
                      <span>Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-100 border border-emerald-200 rounded"></div>
                      <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                      <span>Cancelled</span>
                    </div>
                  </div>

                  {/* Calendar */}
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      month={selectedMonth}
                      onMonthChange={(month) => {
                        setSelectedMonth(month);
                        setSelectedDate(month);
                      }}
                      modifiers={modifiers}
                      modifiersClassNames={modifiersClassNames}
                      className="rounded-lg border-0 bg-background calendar-improved"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Selected Date Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  {selectedDateShifts.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {selectedDateShifts.length} shift{selectedDateShifts.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  {selectedDateShifts.length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-sm text-muted-foreground mb-2">
                        No shifts scheduled
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Your day is free for new opportunities
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDateShifts
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((shift) => {
                          const statusInfo = getStatusInfo(shift.status);
                          return (
                            <div key={shift.id} className="group p-4 border rounded-xl hover:shadow-md transition-all duration-200 bg-card">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm truncate mb-1">{shift.title}</h4>
                                  <p className="text-xs text-muted-foreground mb-2">{shift.role}</p>
                                  
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-xs font-medium">
                                        {shift.startTime} - {shift.endTime}
                                      </span>
                                      <Badge variant="outline" className="text-xs py-0">
                                        {shift.duration}h
                                      </Badge>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground truncate">
                                        {shift.location}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-xs font-medium text-emerald-600">
                                        ${shift.hourlyRate * shift.duration}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        (${shift.hourlyRate}/hr)
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <CalendarIcon className="h-5 w-5 text-primary" />
                                        Shift Details
                                      </DialogTitle>
                                    </DialogHeader>
                                    {/* Detailed shift information dialog content would go here */}
                                    <div className="space-y-6">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Event</label>
                                          <p className="font-semibold">{shift.title}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Client</label>
                                          <p className="font-semibold">{shift.client}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Role</label>
                                          <p className="font-semibold">{shift.role}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Status</label>
                                          <div className="mt-1">{statusInfo.badge}</div>
                                        </div>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                {statusInfo.badge}
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  <span>{shift.client}</span>
                                </div>
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
        </TabsContent>

        <TabsContent value="list" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Shifts</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredShifts.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium text-muted-foreground mb-2">No shifts found</p>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  ) : (
                    filteredShifts
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((shift) => {
                        const statusInfo = getStatusInfo(shift.status);
                        return (
                          <div key={shift.id} className="group p-4 border rounded-xl hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="text-center">
                                  <div className="text-sm font-bold text-primary">
                                    {new Date(shift.date).getDate()}
                                  </div>
                                  <div className="text-xs text-muted-foreground uppercase">
                                    {new Date(shift.date).toLocaleDateString('en-US', { month: 'short' })}
                                  </div>
                                </div>
                                <Separator orientation="vertical" className="h-10" />
                                <div className="flex-1">
                                  <h4 className="font-semibold mb-1">{shift.title}</h4>
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
                                <span className="font-semibold text-emerald-600">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
