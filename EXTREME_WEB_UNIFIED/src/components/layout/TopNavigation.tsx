import { useState, useEffect } from "react";
import api from "../../services/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "../ui/sheet";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  User,
  Shield,
  Zap,
  Command,
  Plus,
  Clock,
  MapPin,
  DollarSign,
  Play,
  Pause,
  Timer,
  AlertTriangle,
  X,
  CheckCircle,
  Info,
  BellRing,
  Menu,
  Phone,
  Mail,
  GraduationCap
} from "lucide-react";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";
import { useNavigation } from "../../contexts/NavigationContext";
import { useAppState } from "../../contexts/AppStateContext";
import { useNotifications, Notification } from "../../contexts/NotificationsContext";
import { useAlerts } from "../../contexts/AlertsContext";
import { XtremeLogo } from "../XtremeLogo";

function getNotificationTargetPage(notification: Notification, userRole: string): { page: string; params?: Record<string, any> } | null {
  const type = notification.type?.toLowerCase();
  const data = notification.data || {};
  switch (type) {
    case 'shift': case 'event': case 'schedule':
      if (data.eventId) return { page: userRole === 'admin' ? 'admin-event-detail' : 'shifts-schedule', params: { eventId: data.eventId } };
      return { page: 'shifts-schedule' };
    case 'payment': return { page: userRole === 'admin' ? 'financial-hub' : 'payroll' };
    case 'review': case 'feedback': return { page: userRole === 'admin' ? 'client-feedback' : 'performance' };
    case 'message': case 'msg': return { page: 'messages', params: data.conversationId ? { conversationId: data.conversationId } : undefined };
    case 'support': case 'ticket': return { page: 'help-support' };
    case 'timesheet': return { page: 'timesheets' };
    case 'training': return { page: 'training' };
    case 'compliance': return { page: 'certifications' };
    default: return null;
  }
}

interface TopNavigationProps {
  currentUser: {
    name: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
}

export function TopNavigation({
  currentUser,
  onLogout,
}: TopNavigationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isClockInDialogOpen, setIsClockInDialogOpen] = useState(false);
  const { setCurrentPage } = useNavigation();
  const {
    activeShift: contextActiveShift,
    currentTimer,
    setActiveShift,
    setTimerStartTime,
    setCurrentTimer,
    isAnyShiftActive,
    setIsAnyShiftActive,
    currentShiftStatus,
    setCurrentShiftStatus,
  } = useAppState();

  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { alerts, unreadCount: alertsUnreadCount, criticalCount, markAsRead: markAlertAsRead, dismissAlert } = useAlerts();
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // Real shift fetched from API (for staff only)
  const [todayShift, setTodayShift] = useState<any>(null);
  const [clockLoading, setClockLoading] = useState(false);

  // Fetch nearest active shift for staff on mount
  useEffect(() => {
    if (currentUser.role !== 'staff') return;
    const fetchTodayShift = async () => {
      try {
        const res = await api.get('/shifts');
        const shifts: any[] = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        if (shifts.length === 0) return;

        const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED', 'ARRIVED', 'IN_PROGRESS'];

        // Priority 1: Already clocked in
        const inProgress = shifts.find(s => s.status?.toUpperCase() === 'IN_PROGRESS');
        if (inProgress) { setTodayShift(inProgress); return; }

        // Priority 2: Any CONFIRMED/ARRIVED/PENDING shift within ±1 day
        const now = new Date();
        const oneDayMs = 24 * 60 * 60 * 1000;
        const nearby = shifts.find(s => {
          const d = new Date(s.date);
          const diffMs = d.getTime() - now.getTime();
          return ACTIVE_STATUSES.includes(s.status?.toUpperCase()) && diffMs >= -oneDayMs && diffMs <= oneDayMs;
        });
        if (nearby) { setTodayShift(nearby); return; }

        // Priority 3: First available active shift (same as StaffDashboard fallback)
        const any = shifts.find(s => ACTIVE_STATUSES.includes(s.status?.toUpperCase()));
        if (any) setTodayShift(any);
      } catch (err) {
        console.error('Failed to fetch active shift:', err);
      }
    };
    fetchTodayShift();
  }, [currentUser.role]);

  const handleClockAction = async () => {
    if (currentUser.role !== 'staff') return;
    setClockLoading(true);
    try {
      if (!contextActiveShift) {
        // --- CLOCK IN ---
        const shift = todayShift;
        if (!shift) {
          import('sonner').then(({ toast }) => toast.error('No confirmed shift found for today.'));
          setClockLoading(false);
          return;
        }
        const res = await api.post(`/shifts/${shift.id}/clock-in`);
        const updatedShift = res.data.shift || shift;
        // Map API shift to the shape AppStateContext expects
        const mappedShift = {
          id: updatedShift.id,
          eventId: updatedShift.eventId,
          staffId: updatedShift.staffId,
          date: updatedShift.date,
          startTime: updatedShift.startTime,
          endTime: updatedShift.endTime,
          status: 'ongoing' as const,
          location: updatedShift.event?.location || updatedShift.location || '',
          role: updatedShift.role || '',
          hourlyRate: updatedShift.hourlyRate || 0,
        };
        setActiveShift(mappedShift);
        setTimerStartTime(updatedShift.clockIn ? new Date(updatedShift.clockIn) : new Date());
        setCurrentTimer('00:00:00');
        setIsAnyShiftActive(true);
        setCurrentShiftStatus('in-progress');
        import('sonner').then(({ toast }) => toast.success('Clocked in successfully! Timer started.'));
      } else {
        // --- CLOCK OUT ---
        if (currentShiftStatus === 'in-progress' || currentShiftStatus === 'break') {
          const res = await api.post(`/shifts/${contextActiveShift.id}/clock-out`);
          const { totalHours, totalPay } = res.data;
          setActiveShift(null);
          setTimerStartTime(null);
          setCurrentTimer('00:00:00');
          setIsAnyShiftActive(false);
          setCurrentShiftStatus('not-started');
          import('sonner').then(({ toast }) =>
            toast.success(`Clocked out! Total: ${Number(totalHours || 0).toFixed(2)}h — $${Number(totalPay || 0).toFixed(2)}`)
          );
        }
      }
    } catch (err: any) {
      import('sonner').then(({ toast }) =>
        toast.error(err?.response?.data?.error || 'Clock action failed. Please try again.')
      );
    } finally {
      setClockLoading(false);
      setIsClockInDialogOpen(false);
    }
  };

  // Handle alert action buttons
  const handleAlertAction = (action: string, alertId: string, eventId?: string) => {
    console.log('Alert action:', action, alertId, eventId);

    // Navigate based on action type
    switch (action) {
      case 'view-event':
        if (eventId) {
          setCurrentPage('admin-event-detail');
        }
        break;
      case 'contact-staff':
      case 'contact-client':
      case 'contact-vendor':
        setCurrentPage('messages');
        break;
      case 'find-replacement':
        setCurrentPage('find-replacement');
        break;
      case 'verify-payment':
        setCurrentPage('verify-payment');
        break;
      case 'view-schedule':
        setCurrentPage('shifts-schedule');
        break;
      case 'adjust-hours':
        setCurrentPage('timesheet-manual');
        break;
      case 'post-job':
        setCurrentPage('hiring');
        break;
      case 'review-timesheets':
        setCurrentPage('timesheets');
        break;
      case 'bulk-approve':
        setCurrentPage('timesheets'); // Could add bulk approve mode
        break;
      case 'view-feedback':
        setCurrentPage('client-feedback');
        break;
      case 'view-staff':
        setCurrentPage('workforce');
        break;
      case 'send-reminders':
        // Open a send reminders dialog
        setCurrentPage('workforce'); // Navigate to workforce for now
        break;
      case 'run-backup':
        // Open backup dialog
        setCurrentPage('settings'); // Navigate to settings for now
        break;
      case 'view-history':
        setCurrentPage('settings');
        break;
      case 'approve-request':
        setCurrentPage('event-requests');
        break;
      default:
        console.warn('Unhandled action:', action);
    }

    // Mark alert as read when taking action
    markAlertAsRead(alertId);
    setIsAlertsOpen(false);
  };

  const getClockButtonText = () => {
    if (currentUser.role !== 'staff') return 'Quick Action';

    if (!contextActiveShift) return 'Clock In';

    switch (currentShiftStatus) {
      case 'traveling-to': return 'Traveling';
      case 'arrived': return 'Arrived';
      case 'in-progress': return 'Clock Out';
      case 'break': return 'Resume';
      case 'traveling-back': return 'Returning';
      default: return 'Clock Out';
    }
  };

  const getClockButtonIcon = () => {
    if (currentUser.role !== 'staff') return Zap;

    if (!contextActiveShift) return Play;

    switch (currentShiftStatus) {
      case 'traveling-to': return MapPin;
      case 'arrived': return MapPin;
      case 'in-progress': return Pause;
      case 'break': return Play;
      case 'traveling-back': return MapPin;
      default: return Pause;
    }
  };

  const getQuickAction = () => {
    switch (currentUser.role) {
      case "staff":
        return {
          label: getClockButtonText(),
          icon: getClockButtonIcon(),
          isClockAction: true
        };
      case "admin":
        return null; // No quick action for admin
      default:
        return { label: "Quick Action", icon: Zap };
    }
  };

  const quickAction = getQuickAction();

  // Get the shift to display in clock dialog
  const activeShift = contextActiveShift || todayShift;

  const isClockOutEnabled = contextActiveShift && (currentShiftStatus === 'in-progress' || currentShiftStatus === 'break');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-3">
          {/* Left Side - Menu & Logo (Mobile Only) */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Trigger with custom icon */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => {
                const trigger = document.querySelector('[data-sidebar="trigger"]') as HTMLElement;
                trigger?.click();
              }}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Hidden default trigger for functionality */}
            <SidebarTrigger className="hidden" data-sidebar="trigger" />

            {/* Logo - visible on mobile only */}
            <div className="flex items-center lg:hidden">
              <XtremeLogo size="sm" className="h-6 sm:h-7" />
            </div>
          </div>

          {/* Desktop Search - hidden on mobile */}
          <div className="hidden lg:flex flex-1 max-w-md xl:max-w-lg">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events, staff, clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-12 bg-muted/50 border-0 focus:bg-background transition-colors text-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden xl:block">
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-background border text-xs text-muted-foreground">
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Active Shift Timer - Only shown when checked in */}
            {contextActiveShift && currentUser.role === 'staff' && (
              <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-primary">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium">ACTIVE</span>
                </div>
                <div className="text-sm font-mono font-medium">
                  {currentTimer}
                </div>
                <Timer className="w-4 h-4" />
              </div>
            )}

            {/* Quick Actions - Enhanced Clock In/Out for Staff */}
            {quickAction && (
              <div className="hidden lg:flex items-center gap-2">
                {quickAction.isClockAction ? (
                  <Dialog open={isClockInDialogOpen} onOpenChange={setIsClockInDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant={isClockOutEnabled ? 'destructive' : 'default'}
                        size="sm"
                        className={`text-sm ${contextActiveShift ? 'animate-pulse' : ''}`}
                      >
                        <quickAction.icon className="h-4 w-4 mr-2" />
                        {quickAction.label}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] sm:max-w-md max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {isClockOutEnabled ? 'Clock Out from Shift' : 'Shift Status'}
                        </DialogTitle>
                        <DialogDescription>
                          {isClockOutEnabled ? 'End your current shift and record completion' : 'Current status of your active shift'}
                        </DialogDescription>
                      </DialogHeader>
                      {activeShift ? (
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium">{activeShift.role || 'Shift'}</h3>
                              <Badge variant={contextActiveShift ? 'default' : 'outline'}>
                                {contextActiveShift ? 'Active' : 'Confirmed'}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{activeShift.startTime} - {activeShift.endTime}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span>{activeShift.event?.location || activeShift.location || 'See event details'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <DollarSign className="w-4 h-4" />
                                <span>${activeShift.hourlyRate}/hour</span>
                              </div>
                            </div>

                            {contextActiveShift && (
                              <div className="p-3 bg-primary/10 rounded-lg">
                                <div className="flex items-center gap-2 text-sm text-primary">
                                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                  <span>Currently {currentShiftStatus.replace('-', ' ')} - {currentTimer}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => setIsClockInDialogOpen(false)}
                            >
                              Close
                            </Button>
                            {(!contextActiveShift || isClockOutEnabled) && (
                              <Button
                                className={`flex-1 ${isClockOutEnabled ? 'bg-destructive hover:bg-destructive/90' : ''}`}
                                onClick={handleClockAction}
                                disabled={clockLoading}
                              >
                                {clockLoading ? (
                                  <span className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 animate-spin" />
                                    Processing...
                                  </span>
                                ) : isClockOutEnabled ? (
                                  <>
                                    <Pause className="w-4 h-4 mr-2" />
                                    Clock Out
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Clock In
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-6 border rounded-lg text-center space-y-3">
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                              <Clock className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">No shift scheduled for today</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                You don't have a confirmed shift for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full" onClick={() => setIsClockInDialogOpen(false)}>
                            Close
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button variant="outline" size="sm" className="text-sm">
                    <quickAction.icon className="h-4 w-4 mr-2" />
                    {quickAction.label}
                  </Button>
                )}
              </div>
            )}

            {/* Alerts - Only for Admin - Hidden on Mobile */}
            {currentUser.role === 'admin' && (
              <Sheet open={isAlertsOpen} onOpenChange={setIsAlertsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant={criticalCount > 0 ? "destructive" : "outline"}
                    size="sm"
                    className={`hidden lg:flex relative text-sm ${criticalCount > 0 ? 'animate-pulse' : ''}`}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span>Alerts</span>
                    {alertsUnreadCount > 0 && (
                      <Badge className={`ml-2 px-1.5 min-w-5 h-5 desktop-text-xs ${criticalCount > 0
                        ? 'bg-white text-destructive border-white'
                        : 'bg-primary text-primary-foreground border-primary'
                        }`}>
                        {alertsUnreadCount > 9 ? '9+' : alertsUnreadCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-xl p-0">
                  <SheetHeader className="p-6 pb-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <SheetTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                          Critical Alerts
                        </SheetTitle>
                        <SheetDescription className="mt-1">
                          {alertsUnreadCount > 0 ? `${alertsUnreadCount} alerts require attention` : 'All alerts reviewed'}
                        </SheetDescription>
                      </div>
                      {criticalCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {criticalCount} Critical
                        </Badge>
                      )}
                    </div>
                  </SheetHeader>

                  <ScrollArea className="h-[calc(100vh-8rem)]">
                    <div className="p-6 space-y-4">
                      {alerts.length === 0 ? (
                        <div className="text-center py-12">
                          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                          <h4 className="font-medium mb-2">All Clear!</h4>
                          <p className="text-muted-foreground">No alerts at the moment.</p>
                        </div>
                      ) : (
                        alerts.map((alert) => {
                          const getSeverityColor = (severity: string) => {
                            switch (severity) {
                              case 'critical':
                                return 'border-l-destructive bg-destructive/5';
                              case 'warning':
                                return 'border-l-yellow-500 bg-yellow-50';
                              case 'info':
                                return 'border-l-blue-500 bg-blue-50';
                              default:
                                return 'border-l-gray-300';
                            }
                          };

                          const getSeverityIcon = (severity: string) => {
                            switch (severity) {
                              case 'critical':
                                return <AlertTriangle className="w-5 h-5 text-destructive" />;
                              case 'warning':
                                return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
                              case 'info':
                                return <Info className="w-5 h-5 text-blue-600" />;
                              default:
                                return <Info className="w-5 h-5 text-gray-600" />;
                            }
                          };

                          return (
                            <div
                              key={alert.id}
                              className={`relative border-l-4 rounded-lg border p-4 ${getSeverityColor(alert.severity)} ${alert.unread ? '' : 'opacity-60'
                                }`}
                            >
                              {/* Dismiss button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6"
                                onClick={() => dismissAlert(alert.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>

                              {/* Alert Header */}
                              <div className="flex items-start gap-3 mb-3">
                                {getSeverityIcon(alert.severity)}
                                <div className="flex-1 pr-6">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium">{alert.title}</h4>
                                    {alert.unread && (
                                      <div className="w-2 h-2 bg-destructive rounded-full"></div>
                                    )}
                                  </div>
                                  {alert.eventName && (
                                    <Badge variant="outline" className="text-xs mb-2">
                                      {alert.eventName}
                                    </Badge>
                                  )}
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {alert.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Clock className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                                    <Badge variant="secondary" className="text-xs ml-auto">
                                      {alert.type}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              {/* Alert Actions */}
                              {alert.actions && alert.actions.length > 0 && (
                                <>
                                  <Separator className="my-3" />
                                  <div className="flex flex-wrap gap-2">
                                    {alert.actions.map((action, idx) => (
                                      <Button
                                        key={idx}
                                        size="sm"
                                        variant={action.variant}
                                        onClick={() => handleAlertAction(action.action, alert.id, alert.eventId)}
                                      >
                                        {action.label}
                                      </Button>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            )}

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 px-1 min-w-5 h-5 desktop-text-xs bg-primary border-2 border-background animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[95vw] sm:w-96 max-w-96 p-0">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.slice(0, 6).map((notification) => {
                    const getNotificationIcon = (type: string) => {
                      switch (type) {
                        case 'shift':
                        case 'schedule':
                          return Clock;
                        case 'payment':
                          return DollarSign;
                        case 'reminder':
                          return Bell;
                        case 'review':
                          return '⭐';
                        default:
                          return Bell;
                      }
                    };

                    const getTypeColor = (type: string) => {
                      switch (type) {
                        case 'shift':
                          return 'bg-primary/10 text-primary';
                        case 'payment':
                          return 'bg-green-100 text-green-700';
                        case 'reminder':
                          return 'bg-yellow-100 text-yellow-700';
                        case 'review':
                          return 'bg-blue-100 text-blue-700';
                        case 'schedule':
                          return 'bg-purple-100 text-purple-700';
                        default:
                          return 'bg-muted text-muted-foreground';
                      }
                    };

                    const IconComponent = getNotificationIcon(notification.type);
                    const isIconString = typeof IconComponent === 'string';

                    return (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`p-4 cursor-pointer border-l-4 transition-colors ${notification.unread
                          ? 'border-l-primary bg-accent/30 hover:bg-accent/50'
                          : 'border-l-transparent hover:bg-accent/30'
                          }`}
                        onClick={() => {
                          if (notification.unread) {
                            markAsRead(notification.id);
                          }
                          const target = getNotificationTargetPage(notification, currentUser.role);
                          if (target) setCurrentPage(target.page, target.params);
                        }}
                      >
                        <div className="flex gap-3 w-full">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(notification.type)}`}>
                            {isIconString ? (
                              <span className="text-sm">{IconComponent}</span>
                            ) : (
                              <IconComponent className="w-4 h-4" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-medium text-sm text-foreground truncate">
                                {notification.title}
                              </h4>
                              {notification.unread && (
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2 mt-1"></div>
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {notification.message}
                            </p>

                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {notification.time}
                              </span>
                              {notification.priority === 'high' && (
                                <Badge variant="destructive" className="text-xs px-2 py-0">
                                  Urgent
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    );
                  })}

                  {notifications.length === 0 && (
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">No notifications yet</p>
                    </div>
                  )}
                </div>

                <div className="p-2 border-t bg-muted/20">
                  <Button variant="ghost" className="w-full text-xs h-8" onClick={() => setCurrentPage('notifications')}>
                    View all notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <Avatar className="h-8 w-8 transition-opacity hover:opacity-90">
                    <AvatarFallback className="bg-primary text-primary-foreground font-medium text-xs">
                      {currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                    <div className="mt-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 uppercase">{currentUser.role}</Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setCurrentPage('profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentPage('settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
