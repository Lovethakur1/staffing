import { useNavigation } from "../contexts/NavigationContext";
import type { EventData } from "../data/eventData";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import {
  ArrowLeft, Calendar, Clock, MapPin, Download, Edit, MoreVertical,
  AlertTriangle, Phone, Send, UserCheck, CreditCard, Activity, Star,
  Briefcase, ChevronRight, Users, Mail, DollarSign, Timer, Shield,
  CheckCircle, XCircle, AlertCircle, Ban, Search, Filter, X, CalendarClock,
  Coffee, MessageSquare, Pause, Navigation, RefreshCw, Radar, Locate
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { Textarea } from "../components/ui/textarea";
import { RescheduleEventDialog, type RescheduleData } from "../components/dialogs/RescheduleEventDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../components/ui/dropdown-menu";
import api from "../services/api";
import { chatService } from "../services/chat.service";
import { eventService } from "../services/event.service";
import { lazy, Suspense } from "react";
const LiveStaffMap = lazy(() => import("../components/map/LiveStaffMap"));
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

interface AdminEventDetailProps {
  userRole?: string;
}

export function AdminEventDetail({ userRole = 'admin' }: AdminEventDetailProps) {
  const { pageParams, goBack, setCurrentPage } = useNavigation();

  // Check if user is Admin - ONLY admins can see financial data
  const isAdmin = userRole.toLowerCase() === 'admin';

  // Get event from centralized data using pageParams (fallback)
  const eventId = pageParams?.eventId || 'evt-001';

  // Try API first, fall back to eventData
  const [apiEvent, setApiEvent] = useState<any>(null);
  const [apiStaff, setApiStaff] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, staffRes] = await Promise.all([
          api.get(`/events/${eventId}`),
          api.get('/staff'),
        ]);
        setApiEvent(evRes.data);
        const sd = staffRes.data;
        setApiStaff(Array.isArray(sd) ? sd : (sd?.data || sd?.staff || []));
      } catch (err) {
        console.log('Failed to load event detail via API, using fallback');
      }
    };
    fetchData();

    // Auto-refresh every 10 seconds to show real-time staff status (working, on-break, etc.)
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, [eventId]);

  // Build event object from API or fallback to default
  const eventDetails = apiEvent ? null : null;

  // Default event shape for when neither API nor eventData provide data
  const defaultEvent: EventData = {
    id: eventId,
    name: 'Loading...',
    client: '',
    clientId: '',
    date: '',
    time: '',
    startTime: '',
    endTime: '',
    duration: '',
    location: '',
    address: '',
    type: 'General',
    status: 'pending',
    attendees: 0,
    budget: 0,
    staffRequired: 0,
    staffAssigned: 0,
    staffCheckedIn: 0,
    description: '',
    paidAmount: 0,
    pendingAmount: 0,
    paymentStatus: 'pending',
    specialRequirements: [],
    clientEmail: '',
    clientPhone: '',
    clientCompany: '',
    clientRating: 0,
    clientTotalEvents: 0,
  };

  const baseEvent = defaultEvent;

  const event = apiEvent ? {
    ...baseEvent,
    id: apiEvent.id,
    name: apiEvent.title || apiEvent.eventName || 'Event',
    date: apiEvent.date || '',
    startTime: apiEvent.startTime || '',
    endTime: apiEvent.endTime || '',
    location: apiEvent.venue || apiEvent.location || '',
    address: apiEvent.address || apiEvent.location || '',
    status: apiEvent.status === 'CONFIRMED' ? 'in-progress' : (apiEvent.status?.toLowerCase() || 'upcoming'),
    type: apiEvent.eventType || 'General',
    client: apiEvent.client?.user?.name || 'Client',
    clientCompany: apiEvent.client?.companyName || '',
    clientEmail: apiEvent.client?.user?.email || '',
    clientPhone: apiEvent.client?.user?.phone || '',
    clientRating: 4.8,
    clientTotalEvents: 1,
    staffAssigned: apiEvent.shifts?.filter((s: any) => s.status !== 'REJECTED' && s.status !== 'CANCELLED').length || 0,
    staffCheckedIn: apiEvent.shifts?.filter((s: any) => ['IN_PROGRESS', 'BREAK', 'ONGOING', 'COMPLETED'].includes(s.status)).length || 0,
    staffRequired: apiEvent.staffRequired || 0,
    budget: apiEvent.budget || 0,
    paidAmount: 0,
    pendingAmount: apiEvent.budget || 0,
    attendees: apiEvent.guestCount || 0,
    duration: `${apiEvent.startTime || ''} - ${apiEvent.endTime || ''}`,
    description: apiEvent.notes || apiEvent.specialRequirements || '',
    specialRequirements: apiEvent.specialRequirements ? [apiEvent.specialRequirements] : [],
  } : (eventDetails || defaultEvent);

  // Reschedule dialog state
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);

  // Edit event dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    eventType: '',
    venue: '',
    location: '',
    locationLat: '' as string | number,
    locationLng: '' as string | number,
    date: '',
    startTime: '',
    endTime: '',
    staffRequired: 0,
    budget: 0,
    specialRequirements: '',
    dressCode: '',
    contactOnSite: '',
    contactOnSitePhone: '',
  });
  const [editSaving, setEditSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  // Used to show loading state if creating a conversation takes a moment
  const [navigatingToMsg, setNavigatingToMsg] = useState<string | null>(null);
  // Live tracking map
  const [selectedTrackStaff, setSelectedTrackStaff] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleNavigationToMessage = async (staffId: string) => {
    setNavigatingToMsg(staffId);
    try {
      const conv = await chatService.createConversation({ participantIds: [staffId] });
      const convId = conv?.id || conv?.conversationId;
      if (convId) {
        setCurrentPage('messages', { conversationId: convId });
      }
    } catch {
      toast.error('Failed to open messages');
    } finally {
      setNavigatingToMsg(null);
    }
  };

  const handleViewStaffDetail = (staff: any) => {
    setCurrentPage('event-staff-detail', { staffId: staff.id, eventId: event.id });
  };

  const handleRescheduleSubmit = async (data: RescheduleData) => {
    try {
      const updatePayload: any = {};
      if (data.rescheduleType === 'postpone') {
        updatePayload.status = 'POSTPONED';
      } else {
        if (data.newDate) updatePayload.date = data.newDate;
        if (data.newStartTime) updatePayload.startTime = data.newStartTime;
        if (data.newEndTime) updatePayload.endTime = data.newEndTime;
      }
      await eventService.updateEvent(event.id, updatePayload);
      toast.success(data.rescheduleType === 'postpone' ? 'Event postponed' : 'Event rescheduled successfully');
      setRescheduleDialogOpen(false);
      // Refresh data
      const evRes = await api.get(`/events/${eventId}`);
      setApiEvent(evRes.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to reschedule event');
    }
  };

  const handleOpenEditDialog = () => {
    setEditForm({
      title: event.name || '',
      eventType: event.type || '',
      venue: event.location || '',
      location: apiEvent?.location || '',
      locationLat: apiEvent?.locationLat ?? '',
      locationLng: apiEvent?.locationLng ?? '',
      date: apiEvent?.date ? new Date(apiEvent.date).toISOString().split('T')[0] : '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      staffRequired: event.staffRequired || 0,
      budget: event.budget || 0,
      specialRequirements: Array.isArray(event.specialRequirements) ? event.specialRequirements.join(', ') : (event.specialRequirements || ''),
      dressCode: apiEvent?.dressCode || '',
      contactOnSite: apiEvent?.contactOnSite || '',
      contactOnSitePhone: apiEvent?.contactOnSitePhone || '',
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    setEditSaving(true);
    try {
      await eventService.updateEvent(event.id, {
        title: editForm.title,
        eventType: editForm.eventType,
        venue: editForm.venue,
        location: editForm.location || undefined,
        locationLat: editForm.locationLat !== '' ? Number(editForm.locationLat) : undefined,
        locationLng: editForm.locationLng !== '' ? Number(editForm.locationLng) : undefined,
        date: editForm.date ? new Date(editForm.date).toISOString() : undefined,
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        staffRequired: editForm.staffRequired,
        budget: editForm.budget,
        specialRequirements: editForm.specialRequirements,
        dressCode: editForm.dressCode,
        contactOnSite: editForm.contactOnSite,
        contactOnSitePhone: editForm.contactOnSitePhone,
      });
      toast.success('Event updated successfully');
      setEditDialogOpen(false);
      // Refresh data
      const evRes = await api.get(`/events/${eventId}`);
      setApiEvent(evRes.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update event');
    } finally {
      setEditSaving(false);
    }
  };

  const handleExportReport = () => {
    const staffList = (apiEvent?.shifts || []).map((s: any, i: number) =>
      `${i + 1},${s.staff?.name || 'N/A'},${s.role || 'Staff'},${s.status || 'N/A'},${s.startTime || ''},${s.endTime || ''}`
    ).join('\n');

    const csvContent = [
      'Event Report',
      '',
      `Event Name,${event.name}`,
      `Event Type,${event.type}`,
      `Date,${event.date}`,
      `Time,${event.startTime} - ${event.endTime}`,
      `Venue,${event.location}`,
      `Client,${event.client}`,
      `Status,${event.status}`,
      `Staff Required,${event.staffRequired}`,
      `Staff Assigned,${event.staffAssigned}`,
      `Budget,${event.budget}`,
      '',
      'Assigned Staff',
      '#,Name,Role,Status,Start Time,End Time',
      staffList || 'No staff assigned',
      '',
      `Special Requirements,"${Array.isArray(event.specialRequirements) ? event.specialRequirements.join('; ') : event.specialRequirements || 'None'}"`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.name.replace(/[^a-zA-Z0-9]/g, '_')}_report.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  // Map shift status from API enum to UI display status
  const mapShiftStatus = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED': return 'confirmed';
      case 'PENDING': return 'pending';
      case 'REJECTED': return 'rejected';
      case 'IN_PROGRESS': return 'checked-in';
      case 'ONGOING': return 'checked-in';
      case 'BREAK': return 'on-break';
      case 'COMPLETED': return 'completed';
      case 'CANCELLED': return 'cancelled';
      case 'NO_SHOW': return 'not-arrived';
      case 'TRAVEL_TO_VENUE': return 'traveling';
      case 'ARRIVED': return 'arrived';
      case 'YET_TO_START': return 'pending';
      default: return 'pending';
    }
  };

  // Build staff members from API data or fallback to mock
  const staffMembers = (() => {
    // If we have API event data with shifts, use that
    if (apiEvent?.shifts?.length > 0) {
      return apiEvent.shifts.map((shift: any, index: number) => {
        const s = shift.staff || {};
        return {
          id: s.id || `s${index + 1}`,
          shiftId: shift.id,
          staffId: shift.staffId || s.id,
          name: s.name || s.user?.name || `Staff ${index + 1}`,
          role: shift.role || s.staffType || 'Staff',
          avatar: (s.name || s.user?.name || 'S').split(' ').map((n: string) => n[0]).join('').slice(0, 2),
          status: mapShiftStatus(shift.status),
          checkInTime: shift.clockIn ? new Date(shift.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
          hourlyRate: shift.hourlyRate || s.hourlyRate || 25,
          hoursWorked: shift.clockIn
            ? Math.round(((shift.clockOut ? new Date(shift.clockOut).getTime() : Date.now()) - new Date(shift.clockIn).getTime()) / 3600000 * 10) / 10
            : 0,
          rating: s.rating || 0,
          phone: s.phone || s.user?.phone || '',
          certifications: s.skills || [],
          travelEnabled: shift.travelEnabled || false,
        };
      });
    }
    // No shifts assigned yet
    return [];
  })();

  // Mock Excluded Staff for this client
  const clientExcludedStaff = [
    { id: 'staff-101', name: 'John Smitcoordinatorh', role: 'Server', reason: 'Unprofessional conduct' },
    { id: 'staff-105', name: 'Alice Cooper', role: 'Bartender', reason: 'Late arrival' },
    // Adding one simulated conflict for demo purposes if needed, 
    // but sticking to IDs not in the active list for clean state by default
  ];

  const eventTimeline = [
    { time: '5:30 PM', event: 'Event  checked in', status: 'completed', user: 'Thomas Moore' },
    { time: '5:45 PM', event: 'Head server checked in', status: 'completed', user: 'Michael Chen' },
    { time: '5:48 PM', event: 'Bartender checked in', status: 'completed', user: 'Lisa Anderson' },
    { time: '5:50 PM', event: 'Server checked in', status: 'completed', user: 'Emma Davis' },
    { time: '6:00 PM', event: 'Event started', status: 'completed', user: 'System' },
    { time: '6:15 PM', event: 'Sarah Martinez (Bartender) - Not arrived (ALERT)', status: 'alert', user: 'System' },
    { time: '7:00 PM', event: 'Dinner service begins (scheduled)', status: 'upcoming', user: 'System' },
    { time: '9:00 PM', event: 'Dancing & bar service (scheduled)', status: 'upcoming', user: 'System' },
    { time: '11:00 PM', event: 'Event end (scheduled)', status: 'upcoming', user: 'System' }
  ];

  const paymentHistory = [
    { id: 1, date: 'Sep 15, 2025', description: 'Initial Deposit', amount: 3000, status: 'completed', method: 'Credit Card' },
    { id: 2, date: 'Oct 1, 2025', description: 'Second Payment', amount: 3000, status: 'completed', method: 'Bank Transfer' },
    { id: 3, date: 'Oct 15, 2025', description: 'Final Payment (Due)', amount: 2500, status: 'pending', method: 'Credit Card' }
  ];

  const clientFeedback = {
    rating: null,
    review: null,
    status: 'Event in progress - feedback pending'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked-in':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'on-break':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'not-arrived':
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'traveling':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'arrived':
        return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'not-assigned':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checked-in':
        return <CheckCircle className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'on-break':
        return <Pause className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'not-arrived':
      case 'rejected':
      case 'cancelled':
        return <AlertTriangle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'traveling':
        return <MapPin className="w-4 h-4" />;
      case 'arrived':
        return <CheckCircle className="w-4 h-4" />;
      case 'not-assigned':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredStaff = staffMembers.filter((staff: any) => {
    const nameMatch = staff.name.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === 'all' || staff.status === filterStatus;
    return nameMatch && statusMatch;
  });

  // Add Staff Dialog State
  const [addStaffDialogOpen, setAddStaffDialogOpen] = useState(false);
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  // Available staff pool from API (not currently assigned to this event)
  // staffMembers uses User IDs from shifts; apiStaff has user.id nested
  const assignedUserIds = new Set(staffMembers.map((s: any) => s.staffId || s.id));
  const availableStaffPool = apiStaff
    .filter((s: any) => {
      const userId = s.user?.id || s.userId;
      return !assignedUserIds.has(userId) && !assignedUserIds.has(s.id) && s.isActive !== false;
    })
    .map((s: any) => ({
      id: s.id,
      userId: s.user?.id || s.userId,
      name: s.user?.name || s.name || 'Staff',
      role: s.staffType || 'Server',
      avatar: (s.user?.name || 'S').split(' ').map((n: string) => n[0]).join('').slice(0, 2),
      hourlyRate: s.hourlyRate || 25,
      rating: s.rating || 0,
      certifications: s.skills || [],
      availability: 'Available',
      experience: '',
      totalEvents: s.totalEvents || 0,
    }));

  // Filter available staff
  const filteredAvailableStaff = availableStaffPool.filter(staff => {
    const nameMatch = staff.name.toLowerCase().includes(staffSearchTerm.toLowerCase());
    const roleMatch = selectedRole === 'all' || staff.role === selectedRole;
    // Exclude staff that are on the client's exclusion list
    const notExcluded = !clientExcludedStaff.some(excluded => excluded.id === staff.id);
    return nameMatch && roleMatch && notExcluded;
  });

  // Get unique roles for filter
  const uniqueRoles = ['all', ...Array.from(new Set(availableStaffPool.map(s => s.role)))];

  const handleAddStaff = async (staff: any) => {
    try {
      const shiftData = {
        eventId: event.id,
        staffId: staff.userId || staff.id,
        date: apiEvent?.date || new Date().toISOString(),
        startTime: apiEvent?.startTime || '09:00',
        endTime: apiEvent?.endTime || '17:00',
        role: staff.role || 'Staff',
        hourlyRate: staff.hourlyRate || 25,
        guaranteedHours: 4,
      };
      const res = await api.post('/shifts', shiftData);
      // Update local apiEvent to include the new shift
      setApiEvent((prev: any) => ({
        ...prev,
        shifts: [...(prev?.shifts || []), { ...res.data, staff: { id: staff.userId || staff.id, name: staff.name } }]
      }));
      toast.success(`${staff.name} has been assigned to ${event.name}`, {
        description: `Role: ${staff.role} | Rate: $${staff.hourlyRate}/hr`
      });
      setAddStaffDialogOpen(false);
      setStaffSearchTerm('');
      setSelectedRole('all');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to assign staff');
    }
  };

  const handleRemoveStaff = async (staff: any) => {
    if (!staff.shiftId) {
      toast.error('Cannot remove: shift ID not found');
      return;
    }
    try {
      await api.delete(`/shifts/${staff.shiftId}`);
      // Update local apiEvent to remove the shift
      setApiEvent((prev: any) => ({
        ...prev,
        shifts: (prev?.shifts || []).filter((s: any) => s.id !== staff.shiftId)
      }));
      toast.success(`${staff.name} has been removed from ${event.name}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to remove staff');
    }
  };

  return (
    <div className="h-full overflow-auto">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            className="w-fit"
            onClick={goBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl font-bold truncate">{event.name}</h1>
                <Badge className={`w-fit ${event.status === 'in-progress' ? 'bg-primary' :
                  event.status === 'completed' ? 'bg-green-600' :
                    event.status === 'cancelled' ? 'bg-destructive' :
                      event.status === 'postponed' ? 'bg-amber-600' :
                        'bg-gray-600'
                  }`}>
                  {event.status === 'in-progress' ? 'In Progress' :
                    event.status === 'completed' ? 'Completed' :
                      event.status === 'cancelled' ? 'Cancelled' :
                        event.status === 'postponed' ? 'Postponed' :
                          'Upcoming'}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>{event.startTime} - {event.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="truncate max-w-[200px]">{event.location}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="hidden sm:flex" onClick={handleExportReport}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm" onClick={() => setRescheduleDialogOpen(true)} className="flex-1 sm:flex-none">
                <CalendarClock className="w-4 h-4 mr-2" />
                <span className="sm:hidden">Reschedule</span>
                <span className="hidden sm:inline">Reschedule Event</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={handleOpenEditDialog}>
                <Edit className="w-4 h-4 mr-2" />
                <span className="sm:hidden">Edit</span>
                <span className="hidden sm:inline">Edit Event</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="sm:hidden" onClick={handleExportReport}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRescheduleDialogOpen(true)}>
                    <CalendarClock className="w-4 h-4 mr-2" />
                    Reschedule Event
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleOpenEditDialog}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Postponed Alert */}
        {event.status === 'postponed' && (
          <Card className="border-amber-500/50 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-amber-800 mb-1">Event Postponed</h3>
                  <p className="text-amber-700 mb-3">
                    This event has been postponed. {event.postponementReason && `Reason: ${event.postponementReason}`}
                  </p>
                  {event.originalDate && (
                    <p className="text-sm text-amber-600">Original Date: {event.originalDate}</p>
                  )}
                  <div className="mt-3">
                    <Button size="sm" variant="outline" className="border-amber-200 hover:bg-amber-100 text-amber-800" onClick={() => setRescheduleDialogOpen(true)}>
                      Set New Date
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cancelled Alert */}
        {event.status === 'cancelled' && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-destructive mb-1">Event Cancelled</h3>
                  <p className="text-muted-foreground mb-3">
                    This event has been cancelled and is no longer active.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Critical Alerts */}
        {staffMembers.filter((s: any) => s.status === 'not-arrived').length > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-destructive mb-1">Critical Alert: Staff Not Arrived</h3>
                  <p className="text-muted-foreground mb-3">
                    {staffMembers.filter((s: any) => s.status === 'not-arrived').length} staff member(s) have not checked in yet. Event started 15 minutes ago.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="destructive">
                      <Phone className="w-4 h-4 mr-2" />
                      Contact Staff
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setAddStaffDialogOpen(true)}>
                      Find Replacement
                    </Button>
                    <Button size="sm" variant="outline">
                      <Send className="w-4 h-4 mr-2" />
                      Notify Client
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">Staff Check-in</p>
                  <p className="text-2xl">{event.staffCheckedIn}/{event.staffAssigned}</p>
                </div>
                <UserCheck className="w-8 h-8 text-primary" />
              </div>
              <Progress value={(event.staffCheckedIn / event.staffAssigned) * 100} className="mt-3" />
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground mb-1">Payment Status</p>
                    <p className="text-2xl">${(event.paidAmount / 1000).toFixed(1)}k</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-green-600" />
                </div>
                <Progress value={(event.paidAmount / event.budget) * 100} className="mt-3" />
                <p className="text-muted-foreground mt-2">${event.pendingAmount} pending</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">Event Progress</p>
                  <p className="text-2xl">42%</p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
              <Progress value={42} className="mt-3" />
              <p className="text-muted-foreground mt-2">2h 30m elapsed</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">Client Rating</p>
                  <p className="text-2xl">{event.clientRating} ⭐</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-muted-foreground mt-3">{event.clientTotalEvents} total events</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="staff">Staff Details</TabsTrigger>
            <TabsTrigger value="tracking" className="gap-1.5">
              <Radar className="w-4 h-4" />
              Live Tracking
            </TabsTrigger>
            {isAdmin && <TabsTrigger value="payments">Payments</TabsTrigger>}
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="feedback">Client Feedback</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-muted-foreground mb-1">Event Type</p>
                    <p className="font-medium">{event.type}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground mb-1">Location</p>
                    <p className="font-medium">{event.location}</p>
                    <p className="text-muted-foreground">{event.address}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground mb-1">Expected Attendees</p>
                    <p className="font-medium">{event.attendees} guests</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground mb-1">Duration</p>
                    <p className="font-medium">{event.duration}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground mb-2">Special Requirements</p>
                    <div className="space-y-1">
                      {event.specialRequirements.map((req, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm">{req}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{event.description}</p>
                  </div>
                  {event.hasBreaks && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-muted-foreground mb-2">Staff Break Policy</p>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Coffee className="w-4 h-4 text-blue-700" />
                            <span className="font-medium text-blue-900">Breaks Enabled</span>
                          </div>
                          <div className="space-y-1 text-sm text-blue-800">
                            <p>• Number of Breaks: <span className="font-medium">{event.breakCount}</span></p>
                            <p>• Duration per Break: <span className="font-medium">{event.breakDuration} minutes</span></p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {event.client.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{event.client}</p>
                      <p className="text-muted-foreground">{event.clientCompany}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{event.clientRating}</span>
                        <span className="text-muted-foreground">({event.clientTotalEvents} events)</span>
                      </div>
                    </div>
                  </div>

                  {/* Excluded Staff Alert in Overview */}
                  {clientExcludedStaff.length > 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-md p-3">
                      <div className="flex items-start gap-2">
                        <Ban className="w-4 h-4 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800">Excluded Staff Alert</p>
                          <p className="text-xs text-red-600 mt-1">
                            This client has {clientExcludedStaff.length} staff members on their exclusion list.
                            Do not assign: {clientExcludedStaff.map(s => s.name).join(", ")}.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${event.clientEmail}`} className="text-primary hover:underline">
                        {event.clientEmail}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${event.clientPhone}`} className="text-primary hover:underline">
                        {event.clientPhone}
                      </a>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Client
                    </Button>
                    <Button variant="outline" className="flex-1" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Staff Details Tab */}
          <TabsContent value="staff" className="space-y-4">
            {/* Excluded Staff Card */}
            {clientExcludedStaff.length > 0 && (
              <Card className="border-red-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                    <Ban className="w-4 h-4" />
                    Client Restrictions: Excluded Staff
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-3">
                    The following staff members should NOT be assigned to this event per client request.
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {clientExcludedStaff.map(staff => (
                      <Badge key={staff.id} variant="outline" className="border-red-200 bg-red-50 text-red-700 gap-1 pl-1 pr-2 py-1">
                        <XCircle className="w-3 h-3" />
                        {staff.name} ({staff.role})
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Assigned Staff ({staffMembers.length})</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setAddStaffDialogOpen(true)}>
                    <Users className="w-4 h-4 mr-2" />
                    Add Staff
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredStaff.map((staff: any) => (
                    <div
                      key={staff.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                      onClick={() => handleViewStaffDetail(staff)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {staff.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium group-hover:text-primary transition-colors">{staff.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {staff.role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {isAdmin && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${staff.hourlyRate}/hr
                              </span>
                            )}
                            {staff.checkInTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                In: {staff.checkInTime}
                              </span>
                            )}
                            {staff.hoursWorked > 0 && (
                              <span className="flex items-center gap-1">
                                <Timer className="w-3 h-3" />
                                {staff.hoursWorked}h worked
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {staff.rating}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {staff.certifications.map((cert: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(staff.status)}>
                          {getStatusIcon(staff.status)}
                          <span className="ml-1">
                            {staff.status === 'checked-in' ? 'Checked In' :
                              staff.status === 'on-break' ? 'On Break' :
                                staff.status === 'confirmed' ? 'Confirmed' :
                                  staff.status === 'pending' ? 'Pending' :
                                    staff.status === 'rejected' ? 'Rejected' :
                                      staff.status === 'completed' ? 'Completed' :
                                        staff.status === 'cancelled' ? 'Cancelled' :
                                          staff.status === 'not-arrived' ? 'Not Arrived' :
                                            staff.status === 'traveling' ? 'Traveling' :
                                              staff.status === 'arrived' ? 'Arrived' :
                                                'Pending'}
                          </span>
                        </Badge>

                        <Button variant="outline" size="sm" className="hidden group-hover:flex"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigationToMessage(staff.staffId || staff.id);
                          }}
                          disabled={navigatingToMsg === (staff.staffId || staff.id)}
                        >
                          {navigatingToMsg === (staff.staffId || staff.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1" />
                          ) : (
                            <MessageSquare className="w-4 h-4 mr-1" />
                          )}
                          Message
                        </Button>

                        <Button variant="ghost" size="sm" className="hidden group-hover:flex"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrackStaff(staff.staffId || staff.id);
                            setActiveTab('tracking');
                          }}
                        >
                          <Locate className="w-4 h-4 mr-1" />
                          Track
                        </Button>

                        <Button variant="ghost" size="sm" className="hidden group-hover:flex">
                          View Details <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>

                        <Button size="sm" variant="outline" className="hidden group-hover:flex text-red-600 hover:text-red-700 hover:bg-red-50" onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveStaff(staff);
                        }}>
                          <X className="w-4 h-4 mr-1" /> Remove
                        </Button>

                        <Button
                          size="sm"
                          variant={staff.travelEnabled ? 'default' : 'outline'}
                          className={`hidden group-hover:flex ${staff.travelEnabled ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'text-purple-600 hover:bg-purple-50'}`}
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const newVal = !staff.travelEnabled;
                              await api.put(`/shifts/${staff.shiftId}/toggle-travel`, { enabled: newVal });
                              setApiEvent((prev: any) => ({
                                ...prev,
                                shifts: (prev?.shifts || []).map((s: any) =>
                                  s.id === staff.shiftId ? { ...s, travelEnabled: newVal } : s
                                )
                              }));
                              toast.success(`Travel ${newVal ? 'enabled' : 'disabled'} for ${staff.name}`);
                            } catch {
                              toast.error('Failed to toggle travel');
                            }
                          }}
                        >
                          <Navigation className="w-4 h-4 mr-1" />
                          {staff.travelEnabled ? 'Travel On' : 'Travel Off'}
                        </Button>

                        {staff.status === 'not-arrived' && (
                          <Button size="sm" variant="destructive" onClick={(e) => {
                            e.stopPropagation();
                          }}>
                            <Phone className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-muted-foreground mb-1">Total Budget</p>
                      <p className="text-2xl font-medium">${event.budget?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-green-50">
                      <p className="text-muted-foreground mb-1">Paid Amount</p>
                      <p className="text-2xl font-medium text-green-700">${event.paidAmount?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-yellow-50">
                      <p className="text-muted-foreground mb-1">Pending Amount</p>
                      <p className="text-2xl font-medium text-yellow-700">${event.pendingAmount?.toLocaleString() || '0'}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment History */}
                  <div>
                    <h4 className="font-medium mb-3">Payment History</h4>
                    <div className="space-y-2">
                      {paymentHistory.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{payment.description}</p>
                              <Badge className={
                                payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  'bg-yellow-100 text-yellow-700'
                              }>
                                {payment.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{payment.date}</span>
                              <span>{payment.method}</span>
                            </div>
                          </div>
                          <p className="text-lg font-medium">${payment.amount.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Process Payment
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Event Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventTimeline.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.status === 'completed' ? 'bg-green-100' :
                          item.status === 'alert' ? 'bg-red-100' :
                            'bg-gray-100'
                          }`}>
                          {item.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-green-700" />
                          ) : item.status === 'alert' ? (
                            <AlertCircle className="w-4 h-4 text-red-700" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-700" />
                          )}
                        </div>
                        {idx < eventTimeline.length - 1 && (
                          <div className="w-0.5 h-12 bg-border"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{item.event}</p>
                          <p className="text-muted-foreground">{item.time}</p>
                        </div>
                        <p className="text-muted-foreground">{item.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Tracking Tab */}
          <TabsContent value="tracking" className="space-y-4">
            <Suspense fallback={
              <Card><CardContent className="py-12 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </CardContent></Card>
            }>
              <LiveStaffMap
                eventId={eventId}
                venueLat={apiEvent?.locationLat}
                venueLng={apiEvent?.locationLng}
                venueName={event.location || event.name}
                selectedStaffId={selectedTrackStaff}
              />
            </Suspense>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-4">
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Feedback Pending</h3>
                <p className="text-muted-foreground max-w-sm mb-6">
                  The client hasn't provided feedback for this event yet. Feedback is typically collected after the event concludes.
                </p>
                <Button variant="outline">
                  <Send className="w-4 h-4 mr-2" />
                  Request Feedback
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={addStaffDialogOpen} onOpenChange={setAddStaffDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>Add Staff to {event.name}</DialogTitle>
            <DialogDescription>
              Select staff members from the available pool to assign to this event.
            </DialogDescription>
          </DialogHeader>

          {/* Fixed Search/Filter Section */}
          <div className="px-6 space-y-3 py-4 border-b bg-muted/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search staff by name..."
                value={staffSearchTerm}
                onChange={(e) => setStaffSearchTerm(e.target.value)}
                className="pl-9"
              />
              {staffSearchTerm && (
                <button
                  onClick={() => setStaffSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full h-10 pl-9 pr-4 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>
                    {role === 'all' ? 'All Roles' : role}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Counter */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredAvailableStaff.length} of {availableStaffPool.length} available staff
            </div>
          </div>

          {/* Scrollable Staff List */}
          <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(90vh - 280px)' }}>
            {filteredAvailableStaff.length > 0 ? (
              <div className="space-y-3">
                {filteredAvailableStaff.map(staff => (
                  <div key={staff.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {staff.avatar}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{staff.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {staff.role}
                            </Badge>
                            {isAdmin && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${staff.hourlyRate}/hr
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddStaff(staff)}
                          className="shrink-0"
                        >
                          Add
                        </Button>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {staff.rating}
                        </span>
                        <span>{staff.experience}</span>
                        <span>{staff.totalEvents} events</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {staff.certifications.slice(0, 2).map((cert: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs py-0">
                            {cert}
                          </Badge>
                        ))}
                        {staff.certifications.length > 2 && (
                          <Badge variant="secondary" className="text-xs py-0">
                            +{staff.certifications.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">No Staff Found</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Try adjusting your search or filter criteria to find available staff members.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update event details</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="edit-title">Event Title</Label>
              <Input id="edit-title" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="edit-type">Event Type</Label>
              <Input id="edit-type" value={editForm.eventType} onChange={e => setEditForm(f => ({ ...f, eventType: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="edit-venue">Venue</Label>
              <Input id="edit-venue" value={editForm.venue} onChange={e => setEditForm(f => ({ ...f, venue: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="edit-location">Full Address</Label>
              <Input id="edit-location" placeholder="e.g. 123 Main St, City, State, ZIP" value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="edit-lat">Latitude</Label>
              <Input id="edit-lat" type="number" step="any" placeholder="e.g. 28.4744" value={editForm.locationLat} onChange={e => setEditForm(f => ({ ...f, locationLat: e.target.value }))} />
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label htmlFor="edit-lng">Longitude</Label>
                <Input id="edit-lng" type="number" step="any" placeholder="e.g. 77.5040" value={editForm.locationLng} onChange={e => setEditForm(f => ({ ...f, locationLng: e.target.value }))} />
              </div>
              <Button type="button" variant="outline" size="sm" disabled={geocoding} className="mb-0.5" onClick={async () => {
                const addr = editForm.location || editForm.venue;
                if (!addr) { toast.error('Enter an address or venue first'); return; }
                setGeocoding(true);
                try {
                  const res = await api.post(`/events/${event.id}/geocode`);
                  setEditForm(f => ({ ...f, locationLat: res.data.locationLat, locationLng: res.data.locationLng }));
                  toast.success('Coordinates found!');
                } catch { toast.error('Could not geocode this address'); }
                finally { setGeocoding(false); }
              }}>
                {geocoding ? <RefreshCw className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              </Button>
            </div>
            <div>
              <Label htmlFor="edit-date">Date</Label>
              <Input id="edit-date" type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="edit-start">Start Time</Label>
              <Input id="edit-start" type="time" value={editForm.startTime} onChange={e => setEditForm(f => ({ ...f, startTime: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="edit-end">End Time</Label>
              <Input id="edit-end" type="time" value={editForm.endTime} onChange={e => setEditForm(f => ({ ...f, endTime: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="edit-staff">Staff Required</Label>
              <Input id="edit-staff" type="number" value={editForm.staffRequired} onChange={e => setEditForm(f => ({ ...f, staffRequired: parseInt(e.target.value) || 0 }))} />
            </div>
            <div>
              <Label htmlFor="edit-budget">Budget</Label>
              <Input id="edit-budget" type="number" value={editForm.budget} onChange={e => setEditForm(f => ({ ...f, budget: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div>
              <Label htmlFor="edit-dress">Dress Code</Label>
              <Input id="edit-dress" value={editForm.dressCode} onChange={e => setEditForm(f => ({ ...f, dressCode: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="edit-contact">Contact On Site</Label>
              <Input id="edit-contact" value={editForm.contactOnSite} onChange={e => setEditForm(f => ({ ...f, contactOnSite: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="edit-phone">Contact Phone</Label>
              <Input id="edit-phone" value={editForm.contactOnSitePhone} onChange={e => setEditForm(f => ({ ...f, contactOnSitePhone: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="edit-requirements">Special Requirements</Label>
              <Textarea id="edit-requirements" value={editForm.specialRequirements} onChange={e => setEditForm(f => ({ ...f, specialRequirements: e.target.value }))} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={editSaving} className="bg-[#5E1916] hover:bg-[#5E1916]/90">
              {editSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Event Dialog */}
      <RescheduleEventDialog
        open={rescheduleDialogOpen}
        onOpenChange={setRescheduleDialogOpen}
        eventName={event.name}
        eventId={event.id}
        currentDate={event.date}
        currentStartTime={event.startTime}
        currentEndTime={event.endTime}
        onReschedule={handleRescheduleSubmit}
      />

    </div>
  );
}
