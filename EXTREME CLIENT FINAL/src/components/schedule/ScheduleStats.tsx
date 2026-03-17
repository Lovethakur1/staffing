import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
  Clock, 
  DollarSign, 
  CalendarDays, 
  CheckCircle, 
  AlertCircle, 
  CalendarX,
  TrendingUp,
  Users
} from "lucide-react";

interface Shift {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  hourlyRate: number;
  duration: number;
}

interface UnavailabilityRecord {
  id: string;
  date: Date;
  type: 'full-day' | 'time-range';
}

interface ScheduleStatsProps {
  shifts: Shift[];
  unavailabilityRecords: UnavailabilityRecord[];
}

export function ScheduleStats({ shifts, unavailabilityRecords }: ScheduleStatsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter shifts for current month
    const currentMonthShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate.getMonth() === currentMonth && shiftDate.getFullYear() === currentYear;
    });

    // Filter upcoming shifts (future)
    const upcomingShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= now && (shift.status === 'confirmed' || shift.status === 'pending');
    });

    // Filter pending shifts
    const pendingShifts = shifts.filter(shift => shift.status === 'pending');

    // Calculate earnings for confirmed/completed shifts this month
    const thisMonthEarnings = currentMonthShifts
      .filter(shift => shift.status === 'confirmed' || shift.status === 'completed')
      .reduce((total, shift) => total + (shift.hourlyRate * shift.duration), 0);

    // Calculate hours for confirmed/completed shifts this month
    const thisMonthHours = currentMonthShifts
      .filter(shift => shift.status === 'confirmed' || shift.status === 'completed')
      .reduce((total, shift) => total + shift.duration, 0);

    // Count confirmed shifts this month
    const confirmedShifts = currentMonthShifts.filter(shift => shift.status === 'confirmed');

    // Count completed shifts this month
    const completedShifts = currentMonthShifts.filter(shift => shift.status === 'completed');

    // Filter upcoming unavailability
    const upcomingUnavailability = unavailabilityRecords.filter(record => {
      return record.date >= now;
    });

    // Calculate next shift
    const nextShift = upcomingShifts
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    return {
      pendingCount: pendingShifts.length,
      confirmedCount: confirmedShifts.length,
      completedCount: completedShifts.length,
      thisMonthHours,
      thisMonthEarnings,
      unavailabilityCount: upcomingUnavailability.length,
      nextShift,
      upcomingShiftsCount: upcomingShifts.length
    };
  }, [shifts, unavailabilityRecords]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Shifts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Responses</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingCount === 1 ? 'shift awaiting' : 'shifts awaiting'} your response
            </p>
          </CardContent>
        </Card>

        {/* Confirmed Shifts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Shifts</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmedCount}</div>
            <p className="text-xs text-muted-foreground">
              this month
            </p>
          </CardContent>
        </Card>

        {/* Total Hours */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonthHours}h</div>
            <p className="text-xs text-muted-foreground">
              this month
            </p>
          </CardContent>
        </Card>

        {/* Total Earnings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.thisMonthEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              confirmed + completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Next Shift */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Next Shift
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.nextShift ? (
              <div className="space-y-2">
                <p className="font-medium">{stats.nextShift.title}</p>
                <div className="text-sm text-muted-foreground">
                  <p>{new Date(stats.nextShift.date).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric' 
                  })}</p>
                  <p>{stats.nextShift.startTime} - {stats.nextShift.endTime}</p>
                </div>
                <Badge variant={stats.nextShift.status === 'confirmed' ? 'default' : 'secondary'}>
                  {stats.nextShift.status}
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming shifts scheduled</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Shifts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Upcoming Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="text-2xl font-bold">{stats.upcomingShiftsCount}</div>
                <p className="text-xs text-muted-foreground">upcoming shifts</p>
              </div>
              {stats.upcomingShiftsCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  Keep checking for new opportunities!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Unavailability */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarX className="h-4 w-4" />
              Unavailability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="text-2xl font-bold">{stats.unavailabilityCount}</div>
                <p className="text-xs text-muted-foreground">upcoming periods</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {stats.unavailabilityCount === 0 
                  ? "Fully available for all shifts"
                  : "Some dates marked unavailable"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-accent/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.completedCount}</div>
              <p className="text-sm text-muted-foreground">Completed Shifts</p>
              <p className="text-xs text-muted-foreground mt-1">this month</p>
            </div>
            
            <div className="text-center p-4 bg-accent/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {stats.thisMonthHours > 0 ? (stats.thisMonthEarnings / stats.thisMonthHours).toFixed(0) : '0'}
              </div>
              <p className="text-sm text-muted-foreground">Avg Rate</p>
              <p className="text-xs text-muted-foreground mt-1">per hour this month</p>
            </div>
            
            <div className="text-center p-4 bg-accent/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {stats.confirmedCount + stats.completedCount}
              </div>
              <p className="text-sm text-muted-foreground">Total Shifts</p>
              <p className="text-xs text-muted-foreground mt-1">this month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}