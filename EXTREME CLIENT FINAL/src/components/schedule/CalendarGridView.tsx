import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../ui/dialog";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Eye,
  Search,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  XCircle
} from "lucide-react";

interface Shift {
  id: string;
  title: string;
  client: string;
  clientPhone?: string;
  clientEmail?: string;
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
}

interface CalendarGridViewProps {
  shifts: Shift[];
}

export function CalendarGridView({ shifts }: CalendarGridViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  // Get first day of current month and calculate calendar grid
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const days = [];
    const today = new Date();
    
    // Add previous month's trailing days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(firstDayOfMonth);
      day.setDate(day.getDate() - (i + 1));
      days.push({
        date: day,
        isCurrentMonth: false,
        isToday: day.toDateString() === today.toDateString()
      });
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString()
      });
    }

    // Add next month's leading days to complete the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.toDateString() === today.toDateString()
      });
    }

    return days;
  }, [currentDate, firstDayOfWeek, daysInMonth]);

  // Get shifts for a specific date
  const getShiftsForDate = (date: Date): Shift[] => {
    const dateStr = date.toISOString().split('T')[0];
    let filteredShifts = shifts.filter(shift => shift.date === dateStr);
    
    if (searchQuery) {
      filteredShifts = filteredShifts.filter(shift => 
        shift.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shift.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shift.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shift.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filteredShifts.sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-primary text-primary-foreground border-primary';
      case 'pending':
        return 'bg-amber-500 text-white border-amber-500';
      case 'completed':
        return 'bg-emerald-500 text-white border-emerald-500';
      case 'cancelled':
        return 'bg-red-500 text-white border-red-500';
      default:
        return 'bg-gray-500 text-white border-gray-500';
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { 
          badge: <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 text-xs">Confirmed</Badge>,
          color: 'text-primary',
          icon: <CheckCircle2 className="h-4 w-4 text-primary" />
        };
      case 'pending':
        return { 
          badge: <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 text-xs">Pending</Badge>,
          color: 'text-amber-600',
          icon: <AlertCircle className="h-4 w-4 text-amber-600" />
        };
      case 'completed':
        return { 
          badge: <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 text-xs">Completed</Badge>,
          color: 'text-emerald-600',
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        };
      case 'cancelled':
        return { 
          badge: <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200 text-xs">Cancelled</Badge>,
          color: 'text-red-600',
          icon: <XCircle className="h-4 w-4 text-red-600" />
        };
      default:
        return { 
          badge: <Badge variant="secondary" className="text-xs">{status}</Badge>,
          color: 'text-muted-foreground',
          icon: <AlertCircle className="h-4 w-4 text-muted-foreground" />
        };
    }
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get upcoming shifts for sidebar
  const upcomingShifts = useMemo(() => {
    const now = new Date();
    return shifts
      .filter(shift => new Date(shift.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10);
  }, [shifts]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Left Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search shifts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Mini Calendar */}
        <Card className="p-4">
          <h3 className="font-medium mb-3">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {weekDays.map(day => (
              <div key={day} className="text-center p-2 text-muted-foreground font-medium">
                {day}
              </div>
            ))}
            {calendarDays.slice(0, 35).map((day, index) => {
              const hasShifts = getShiftsForDate(day.date).length > 0;
              return (
                <button
                  key={index}
                  className={`
                    p-2 text-center rounded text-xs transition-colors
                    ${day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                    ${day.isToday ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}
                    ${hasShifts ? 'font-semibold' : ''}
                  `}
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Upcoming Shifts */}
        <Card className="p-4">
          <h3 className="font-medium mb-3">Upcoming Shifts</h3>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {upcomingShifts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming shifts</p>
              ) : (
                upcomingShifts.map((shift) => {
                  const statusInfo = getStatusInfo(shift.status);
                  return (
                    <div key={shift.id} className="p-2 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium truncate">{shift.title}</h4>
                          <p className="text-xs text-muted-foreground">{shift.client}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(shift.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor: getStatusColor(shift.status).split(' ')[0].replace('bg-', '')}}>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Main Calendar */}
      <div className="lg:col-span-3">
        <Card className="h-full">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-xl">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardTitle>
              
              <div className="flex items-center gap-2">
                {/* View Mode Buttons */}
                <div className="flex items-center gap-1 border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'day' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('day')}
                    className="h-8 px-3"
                  >
                    Day
                  </Button>
                  <Button
                    variant={viewMode === 'week' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('week')}
                    className="h-8 px-3"
                  >
                    Week
                  </Button>
                  <Button
                    variant={viewMode === 'month' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('month')}
                    className="h-8 px-3"
                  >
                    Month
                  </Button>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Calendar Grid */}
            <div className="border-t">
              {/* Week Headers */}
              <div className="grid grid-cols-7 border-b">
                {weekDays.map(day => (
                  <div key={day} className="p-4 text-center font-medium text-muted-foreground border-r last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Body */}
              <div className="grid grid-cols-7 auto-rows-fr min-h-[600px]">
                {calendarDays.map((day, index) => {
                  const dayShifts = getShiftsForDate(day.date);
                  return (
                    <div
                      key={index}
                      className={`
                        border-r border-b last:border-r-0 p-2 min-h-[120px] relative
                        ${day.isCurrentMonth ? 'bg-background' : 'bg-muted/20'}
                        ${day.isToday ? 'bg-primary/5' : ''}
                      `}
                    >
                      {/* Date Number */}
                      <div className={`
                        text-sm font-medium mb-2
                        ${day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                        ${day.isToday ? 'text-primary font-bold' : ''}
                      `}>
                        {day.date.getDate()}
                      </div>

                      {/* Shift Events */}
                      <div className="space-y-1">
                        {dayShifts.slice(0, 3).map((shift) => (
                          <Dialog key={shift.id}>
                            <DialogTrigger asChild>
                              <div
                                className={`
                                  px-2 py-1 rounded text-xs font-medium cursor-pointer
                                  transition-all hover:scale-105 hover:shadow-sm
                                  ${getStatusColor(shift.status)}
                                  truncate
                                `}
                                onClick={() => setSelectedShift(shift)}
                              >
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{shift.startTime} {shift.title}</span>
                                </div>
                              </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  {getStatusInfo(shift.status).icon}
                                  {shift.title}
                                </DialogTitle>
                                <DialogDescription>
                                  View complete details about this shift including event information, timing, and status.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Event Details</h4>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>{shift.startTime} - {shift.endTime}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>{shift.location}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span>{shift.role}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <span>${shift.hourlyRate}/hour • {shift.duration}h total • ${shift.hourlyRate * shift.duration}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Client Information</h4>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span>{shift.client}</span>
                                      </div>
                                      {shift.clientPhone && (
                                        <div className="flex items-center gap-2">
                                          <Phone className="h-4 w-4 text-muted-foreground" />
                                          <span>{shift.clientPhone}</span>
                                        </div>
                                      )}
                                      {shift.clientEmail && (
                                        <div className="flex items-center gap-2">
                                          <Mail className="h-4 w-4 text-muted-foreground" />
                                          <span>{shift.clientEmail}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {shift.description && (
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Description</h4>
                                    <p className="text-sm text-muted-foreground">{shift.description}</p>
                                  </div>
                                )}
                                
                                {shift.requirements && (
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Requirements</h4>
                                    <p className="text-sm text-muted-foreground">{shift.requirements}</p>
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between pt-4 border-t">
                                  {getStatusInfo(shift.status).badge}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ))}
                        
                        {/* Show +X more if there are more than 3 shifts */}
                        {dayShifts.length > 3 && (
                          <div className="text-xs text-muted-foreground px-2 py-1">
                            +{dayShifts.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}