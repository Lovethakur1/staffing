import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { CalendarGridView } from "../components/schedule/CalendarGridView";
import { TooltipWrapper, IconTooltip, InfoTooltip } from "../components/ui/tooltip-wrapper";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "../components/ui/dialog";
import { 
  CalendarIcon,
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  AlertCircle,
  CalendarOff,
  Plus
} from "lucide-react";
import { toast } from "sonner";

interface ShiftsScheduleProps {
  userRole: string;
  userId: string;
}

export interface Unavailability {
  id: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export interface Shift {
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

export function ShiftsSchedule({ userRole, userId }: ShiftsScheduleProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isUnavailabilityDialogOpen, setIsUnavailabilityDialogOpen] = useState(false);
  const [newUnavailability, setNewUnavailability] = useState<Partial<Unavailability>>({
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    reason: ''
  });

  // Mock unavailability data
  const [unavailability, setUnavailability] = useState<Unavailability[]>([
    {
      id: "un-1",
      startDate: "2025-10-20",
      endDate: "2025-10-21",
      startTime: "00:00",
      endTime: "23:59",
      reason: "Family Wedding"
    }
  ]);

  // Mock shifts data
  const [shifts] = useState<Shift[]>([
    {
      id: "shift-1",
      title: "Corporate Gala Setup",
      client: "Sarah Johnson",
      clientPhone: "+1 (555) 123-4567",
      clientEmail: "sarah.johnson@email.com",
      date: "2025-10-08",
      startTime: "14:00",
      endTime: "18:00",
      location: "Grand Hotel Ballroom",
      address: "123 Grand Avenue, Downtown",
      status: "confirmed",
      type: "setup",
      role: "Event Coordinator",
      hourlyRate: 25,
      duration: 4,
      requirements: "Must wear black attire, arrive 30 minutes early",
      description: "High-profile corporate event setup requiring attention to detail"
    },
    {
      id: "shift-2", 
      title: "Wedding Reception Service",
      client: "Michael Chen",
      clientPhone: "+1 (555) 987-6543",
      clientEmail: "m.chen@email.com",
      date: "2025-10-12",
      startTime: "17:00",
      endTime: "22:00",
      location: "Sunset Gardens",
      address: "456 Garden Lane, Westside",
      status: "confirmed",
      type: "service",
      role: "Bartender",
      hourlyRate: 28,
      duration: 5,
      requirements: "Certified bartender with wedding experience",
      description: "Outdoor wedding reception, weather backup plan available"
    },
    {
      id: "shift-3",
      title: "Product Launch Setup",
      client: "Tech Innovations Inc",
      clientPhone: "+1 (555) 555-0123",
      clientEmail: "events@techinnovations.com",
      date: "2025-10-15",
      startTime: "09:00",
      endTime: "13:00",  
      location: "Innovation Center",
      address: "789 Tech Park Drive, Silicon Valley",
      status: "pending",
      type: "setup",
      role: "Event Setup",
      hourlyRate: 20,
      duration: 4,
      requirements: "Tech-savvy, experience with AV equipment",
      description: "Product launch event setup with interactive displays"
    },
    {
      id: "shift-4",
      title: "Corporate Training",
      client: "Global Corp",
      clientPhone: "+1 (555) 888-9999",
      clientEmail: "training@globalcorp.com",
      date: "2025-10-18",
      startTime: "09:00",
      endTime: "17:00",
      location: "Downtown Convention Center",
      address: "100 Convention Blvd, Downtown", 
      status: "confirmed",
      type: "service",  
      role: "AV Technician",
      hourlyRate: 30,
      duration: 8,
      requirements: "AV certification required, full day commitment",
      description: "Corporate training event with multiple breakout sessions"
    },
    {
      id: "shift-5",
      title: "Charity Fundraiser",
      client: "Hope Foundation",
      clientPhone: "+1 (555) 222-3333",
      clientEmail: "events@hopefoundation.org",
      date: "2025-10-22",
      startTime: "18:00",
      endTime: "22:00",
      location: "City Hall",
      address: "555 City Center Plaza, Downtown",
      status: "completed",
      type: "service",
      role: "Server",
      hourlyRate: 26,
      duration: 4,
      requirements: "Professional presentation, experience with fundraising events",
      description: "Formal charity dinner with auction component"
    },
    {
      id: "shift-6",
      title: "Fashion Show Setup",
      client: "Elite Fashion Events",
      clientPhone: "+1 (555) 666-7777",
      clientEmail: "production@elitefashion.com",
      date: "2025-10-25",
      startTime: "12:00",
      endTime: "17:00",
      location: "Fashion Week Venue",
      address: "100 Fashion Avenue, Uptown",
      status: "confirmed",
      type: "setup",
      role: "Stage Manager",
      hourlyRate: 35,
      duration: 5,
      requirements: "Fashion industry experience, attention to detail",
      description: "High-end fashion show requiring precise setup and coordination"
    }
  ]);

  // Calculate monthly statistics
  const monthlyStats = useMemo(() => {
    const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    
    const monthShifts = shifts.filter(shift => {
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
  }, [shifts, selectedMonth]);

  const handleAddUnavailability = () => {
    if (!newUnavailability.startDate || !newUnavailability.endDate || !newUnavailability.startTime || !newUnavailability.endTime) {
      toast.error("Please fill in all date and time fields");
      return;
    }

    const start = new Date(`${newUnavailability.startDate}T${newUnavailability.startTime}`);
    const end = new Date(`${newUnavailability.endDate}T${newUnavailability.endTime}`);

    if (end < start) {
      toast.error("End time cannot be before start time");
      return;
    }

    const entry: Unavailability = {
      id: `un-${Date.now()}`,
      startDate: newUnavailability.startDate!,
      endDate: newUnavailability.endDate!,
      startTime: newUnavailability.startTime!,
      endTime: newUnavailability.endTime!,
      reason: newUnavailability.reason || 'Unavailable'
    };

    setUnavailability([...unavailability, entry]);
    setIsUnavailabilityDialogOpen(false);
    setNewUnavailability({
      startDate: '',
      endDate: '',
      startTime: '09:00',
      endTime: '17:00',
      reason: ''
    });
    toast.success("Unavailability added successfully");
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Schedule Management</h1>
            <p className="text-muted-foreground">
              Manage your shifts and set your unavailability
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isUnavailabilityDialogOpen} onOpenChange={setIsUnavailabilityDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarOff className="h-4 w-4" />
                  Set Unavailability
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Set Unavailability</DialogTitle>
                  <DialogDescription>
                    Mark the dates and times you are not available for shifts.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={newUnavailability.startDate}
                        onChange={(e) => setNewUnavailability({...newUnavailability, startDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={newUnavailability.startTime}
                        onChange={(e) => setNewUnavailability({...newUnavailability, startTime: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={newUnavailability.endDate}
                        onChange={(e) => setNewUnavailability({...newUnavailability, endDate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-time">End Time</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={newUnavailability.endTime}
                        onChange={(e) => setNewUnavailability({...newUnavailability, endTime: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason (Optional)</Label>
                    <Textarea
                      id="reason"
                      placeholder="e.g., Vacation, Medical Appointment, Class"
                      value={newUnavailability.reason}
                      onChange={(e) => setNewUnavailability({...newUnavailability, reason: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUnavailabilityDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddUnavailability}>Save Unavailability</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Badge variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Staff Portal
            </Badge>
          </div>
        </div>
      </div>

      {/* Monthly Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{monthlyStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Shifts</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">{monthlyStats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{monthlyStats.confirmed}</div>
              <div className="text-sm text-muted-foreground">Confirmed</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{monthlyStats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{monthlyStats.totalHours}h</div>
              <div className="text-sm text-muted-foreground">Total Hours</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">${monthlyStats.totalEarnings}</div>
              <div className="text-sm text-muted-foreground">Earnings</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Calendar Grid View */}
      <CalendarGridView shifts={shifts} unavailability={unavailability} />
    </div>
  );
}
