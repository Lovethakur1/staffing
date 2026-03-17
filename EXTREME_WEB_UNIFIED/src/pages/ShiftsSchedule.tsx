import { useState, useMemo, useEffect } from "react";
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
  Plus,
  Shield,
  Settings,
  UserCheck,
  FileSpreadsheet
} from "lucide-react";
import { toast } from "sonner";
import { useNavigation } from "../contexts/NavigationContext";
import { shiftService } from "../services/shift.service";

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
  const { setCurrentPage } = useNavigation();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isUnavailabilityDialogOpen, setIsUnavailabilityDialogOpen] = useState(false);
  const [newUnavailability, setNewUnavailability] = useState<Partial<Unavailability>>({
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    reason: ''
  });

  // Unavailability starts empty (set by user in-session; backend endpoint can be added later)
  const [unavailability, setUnavailability] = useState<Unavailability[]>([]);

  // Live shifts from API
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(true);

  // Role-specific configuration
  const getRoleConfig = () => {
    switch (userRole) {
      case 'staff':
        return {
          title: 'Shifts & Schedule',
          description: 'View your upcoming shifts, track your hours, and set your availability',
          badgeText: 'Staff Portal',
          badgeIcon: <Users className="h-4 w-4" />,
          showEarnings: true,
          showUnavailability: true,
          showManagementActions: false,
          showExportReport: false,
        };
      case 'manager':
        return {
          title: 'My Shifts & Schedule',
          description: 'Manage your shifts and monitor team scheduling overview',
          badgeText: 'Manager View',
          badgeIcon: <UserCheck className="h-4 w-4" />,
          showEarnings: true,
          showUnavailability: true,
          showManagementActions: false,
          showExportReport: true,
        };
      case 'sub-admin':
        return {
          title: 'Scheduling',
          description: 'Oversee all staff schedules, manage shift assignments, and handle scheduling operations',
          badgeText: 'Operations',
          badgeIcon: <Shield className="h-4 w-4" />,
          showEarnings: false,
          showUnavailability: false,
          showManagementActions: true,
          showExportReport: true,
        };
      case 'scheduler':
        return {
          title: 'Schedule Management',
          description: 'Assign staff to shifts, resolve conflicts, and manage the overall scheduling pipeline',
          badgeText: 'Scheduler',
          badgeIcon: <Settings className="h-4 w-4" />,
          showEarnings: false,
          showUnavailability: false,
          showManagementActions: true,
          showExportReport: true,
        };
      default:
        return {
          title: 'Schedule Management',
          description: 'Manage your shifts and set your unavailability',
          badgeText: 'Staff Portal',
          badgeIcon: <Users className="h-4 w-4" />,
          showEarnings: true,
          showUnavailability: true,
          showManagementActions: false,
          showExportReport: false,
        };
    }
  };

  const roleConfig = getRoleConfig();

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const raw = await shiftService.getShifts();
        const mapped: Shift[] = raw.map((s: any) => {
          const ev = s.event || {};
          const startTime = s.startTime || ev.startTime || '';
          const endTime = s.endTime || ev.endTime || '';
          let duration = 0;
          if (startTime && endTime) {
            const [sh, sm] = startTime.split(':').map(Number);
            const [eh, em] = endTime.split(':').map(Number);
            duration = Math.abs((eh * 60 + em) - (sh * 60 + sm)) / 60;
          }
          return {
            id: s.id,
            title: ev.title || ev.name || 'Shift',
            client: ev.client?.name || ev.clientId || '',
            clientPhone: ev.client?.phone || '',
            clientEmail: ev.client?.email || '',
            date: s.date ? new Date(s.date).toISOString().split('T')[0] : (ev.date ? new Date(ev.date).toISOString().split('T')[0] : ''),
            startTime,
            endTime,
            location: ev.venue || ev.location || '',
            address: ev.address || ev.location || '',
            status: (s.status || 'pending').toLowerCase().replace(/_/g, '-') as Shift['status'],
            type: ev.eventType || ev.type || 'event',
            role: s.role || 'Staff',
            hourlyRate: s.hourlyRate || 0,
            duration,
            requirements: s.requirements || ev.dressCode || '',
            description: ev.description || '',
          };
        });
        setShifts(mapped);
      } catch {
        toast.error('Failed to load shifts');
      } finally {
        setShiftsLoading(false);
      }
    };
    fetchShifts();
  }, [userId]);

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

  if (shiftsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">{roleConfig.title}</h1>
            <p className="text-muted-foreground">
              {roleConfig.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {roleConfig.showUnavailability && (
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
                        onChange={(e) => setNewUnavailability({ ...newUnavailability, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={newUnavailability.startTime}
                        onChange={(e) => setNewUnavailability({ ...newUnavailability, startTime: e.target.value })}
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
                        onChange={(e) => setNewUnavailability({ ...newUnavailability, endDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-time">End Time</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={newUnavailability.endTime}
                        onChange={(e) => setNewUnavailability({ ...newUnavailability, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason (Optional)</Label>
                    <Textarea
                      id="reason"
                      placeholder="e.g., Vacation, Medical Appointment, Class"
                      value={newUnavailability.reason}
                      onChange={(e) => setNewUnavailability({ ...newUnavailability, reason: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUnavailabilityDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddUnavailability}>Save Unavailability</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            )}
            {roleConfig.showManagementActions && (
              <>
                <Button variant="outline" className="gap-2" onClick={() => setCurrentPage('shift-conflicts')}>
                  <AlertCircle className="h-4 w-4" />
                  Conflicts
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => setCurrentPage('staff-availability')}>
                  <UserCheck className="h-4 w-4" />
                  Staff Availability
                </Button>
              </>
            )}
            {roleConfig.showExportReport && (
              <Button variant="outline" className="gap-2" onClick={() => toast.success('Schedule report exported')}>
                <FileSpreadsheet className="h-4 w-4" />
                Export
              </Button>
            )}
            <Badge variant="outline" className="flex items-center gap-2">
              {roleConfig.badgeIcon}
              {roleConfig.badgeText}
            </Badge>
          </div>
        </div>
      </div>

      {/* Monthly Statistics */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 ${roleConfig.showEarnings ? 'lg:grid-cols-6' : 'lg:grid-cols-4'} gap-4`}>
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

        {roleConfig.showEarnings && (
          <>
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
          </>
        )}
      </div>

      {/* Calendar Grid View */}
      <CalendarGridView shifts={shifts} unavailability={unavailability} />
    </div>
  );
}
