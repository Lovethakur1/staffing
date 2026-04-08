import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Star,
  Briefcase,
  ShieldCheck,
  FileText,
  User,
  Building2,
  Mail,
  Phone,
  Sparkles,
  Send,
  UserPlus,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { eventService } from "../services/event.service";
import { staffService } from "../services/staff.service";
import { invoiceService } from "../services/invoice.service";
import api from "../services/api";

interface EventRequestDetailProps {
  userRole: string;
  userId: string;
}

interface StaffMember {
  staffId: string;
  staffName: string;
  rate: number;
  rating: number;
  available: boolean;
  role: string;
}

interface SelectedStaff {
  staffId: string;
  staffName: string;
  rate: number;
  rating: number;
}

interface StaffAssignment {
  role: string;
  quantity: number;
  favoriteStaff: Array<{
    staffId: string;
    staffName: string;
    rate: number;
    rating: number;
  }>;
  assignedStaff: SelectedStaff[];
}





export function EventRequestDetail({ userRole, userId }: EventRequestDetailProps) {
  const { setCurrentPage, pageParams } = useNavigation();
  const [adminNotes, setAdminNotes] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [selectedManager, setSelectedManager] = useState<string>("");
  const [createdEventId, setCreatedEventId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [hasBreaks, setHasBreaks] = useState(false);
  const [apiEvent, setApiEvent] = useState<any>(null);
  const [realStaff, setRealStaff] = useState<any[]>([]);
  const [realManagersList, setRealManagersList] = useState<any[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  // Pricing fields
  const [staffCosts, setStaffCosts] = useState("");
  const [travelFee, setTravelFee] = useState("");
  const [platformFee, setPlatformFee] = useState("");
  const [additionalFees, setAdditionalFees] = useState("");
  const [depositPercentage, setDepositPercentage] = useState("50");

  const isScheduler = userRole === 'scheduler';

  // Fetch real staff for staff assignment
  useEffect(() => {
    const fetchStaff = async () => {
      setIsLoadingStaff(true);
      try {
        const response = await staffService.getStaffList({ take: 100 });
        setRealStaff(response.data || []);
      } catch (err) {
        console.error('Failed to fetch staff', err);
      } finally {
        setIsLoadingStaff(false);
      }
    };
    fetchStaff();
  }, []);

  // Fetch managers from users API
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await api.get('/users', { params: { role: 'MANAGER' } });
        const managers = response.data?.data || response.data || [];
        setRealManagersList(managers);
      } catch (err) {
        console.error('Failed to fetch managers', err);
      }
    };
    fetchManagers();
  }, []);

  // Fetch real event data from API
  useEffect(() => {
    const fetchEvent = async () => {
      const eventId = pageParams?.requestId;
      if (!eventId) return;
      try {
        const data = await eventService.getEvent(eventId);
        setApiEvent(data);
      } catch (err) {
        console.error('Failed to fetch event detail', err);
        toast.error('Failed to load event details');
      } finally {
        setIsLoadingEvent(false);
      }
    };
    fetchEvent();
  }, [pageParams?.requestId]);

  // Sync API event data to local state for editing
  useEffect(() => {
    if (apiEvent) {
      if (apiEvent.managerId) setSelectedManager(apiEvent.managerId);
      if (apiEvent.staffCosts) setStaffCosts(String(apiEvent.staffCosts));
      if (apiEvent.travelFee) setTravelFee(String(apiEvent.travelFee));
      if (apiEvent.platformFee) setPlatformFee(String(apiEvent.platformFee));
      if (apiEvent.additionalFees) setAdditionalFees(String(apiEvent.additionalFees));
      if (apiEvent.adminNotes) setAdminNotes(apiEvent.adminNotes);
    }
  }, [apiEvent]);

  const [isLoadingEvent, setIsLoadingEvent] = useState(true);

  // Build request from API data
  const request = apiEvent ? {
    id: apiEvent.id,
    requestNumber: `REQ-${apiEvent.id?.substring(0, 4).toUpperCase() || '0000'}`,
    submittedDate: apiEvent.createdAt || apiEvent.date || new Date().toISOString(),
    status: (apiEvent.status || 'PENDING').toLowerCase(),
    client: {
      id: apiEvent.client?.id || apiEvent.clientId || '',
      name: apiEvent.client?.user?.name || '',
      company: apiEvent.client?.company || '',
      email: apiEvent.client?.user?.email || '',
      phone: apiEvent.client?.user?.phone || '',
      accountType: apiEvent.client?.company ? 'Corporate' : 'Individual',
      totalBookings: apiEvent.client?.totalEvents || 0,
      favoriteStaff: 0,
    },
    event: {
      name: apiEvent.title || '',
      type: apiEvent.eventType || '',
      date: apiEvent.date || '',
      startTime: apiEvent.startTime || '',
      endTime: apiEvent.endTime || '',
      proposedBudget: apiEvent.budget || 0,
      duration: apiEvent.startTime && apiEvent.endTime ? (() => {
        const [h1, m1] = apiEvent.startTime.split(':').map(Number);
        const [h2, m2] = apiEvent.endTime.split(':').map(Number);
        let diff = (h2 + m2/60) - (h1 + m1/60);
        if (diff < 0) diff += 24;
        return parseFloat(diff.toFixed(1));
      })() : 0,
      venue: apiEvent.venue || apiEvent.location || '',
      address: apiEvent.location || '',
      expectedGuests: apiEvent.guestCount || 0,
      description: apiEvent.description || apiEvent.specialRequirements || '',
      specialRequirements: apiEvent.specialRequirements || '',
    },
    staffRequirements: [
      {
        role: "Requested Staff",
        quantity: apiEvent.staffRequired || 0,
        favoriteStaff: [],
      }
    ],
  } : null;

  // Staff assignments - initialize with favorites
  const [staffAssignments, setStaffAssignments] = useState<StaffAssignment[]>([]);

  useEffect(() => {
    if (apiEvent && request) {
      // Map API shifts into the existing role requirements
      const mappedAssignments = request.staffRequirements.map(req => {
        // Find shifts that match this requirement role (defaulting to the first requirement)
        const relevantShifts = apiEvent.shifts?.filter((s: any) => 
          (s.role || "Requested Staff").toLowerCase() === req.role.toLowerCase() || 
          req.role === "Requested Staff"
        ) || [];

        return {
          role: req.role,
          quantity: req.quantity,
          favoriteStaff: req.favoriteStaff || [],
          assignedStaff: relevantShifts.map((s: any) => ({
            staffId: s.staffId,
            staffName: s.staff?.name || 'Staff Member',
            rate: s.hourlyRate || s.staff?.staffProfile?.hourlyRate || 0,
            rating: s.staff?.staffProfile?.rating || 0,
          }))
        };
      });

      setStaffAssignments(mappedAssignments);
    }
  }, [apiEvent]);

  const [showStaffSelector, setShowStaffSelector] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(-1);

  const handleSelectStaff = (roleIndex: number, role: string) => {
    setSelectedRoleIndex(roleIndex);
    setSelectedRole(role);
    setShowStaffSelector(true);
  };

  const handleAddStaff = (staff: StaffMember) => {
    const updatedAssignments = [...staffAssignments];
    const assignment = updatedAssignments[selectedRoleIndex];

    // Check if already assigned
    if (assignment.assignedStaff.some(s => s.staffId === staff.staffId)) {
      toast.error(`${staff.staffName} is already assigned`);
      return;
    }

    // Check if we've reached the quantity limit
    if (assignment.assignedStaff.length >= assignment.quantity) {
      toast.error(`Maximum ${assignment.quantity} staff members allowed for ${assignment.role}`);
      return;
    }

    assignment.assignedStaff.push({
      staffId: staff.staffId,
      staffName: staff.staffName,
      rate: staff.rate,
      rating: staff.rating,
    });

    setStaffAssignments(updatedAssignments);
    toast.success(`${staff.staffName} added to ${assignment.role}`);
  };

  const handleRemoveStaff = (roleIndex: number, staffId: string) => {
    const updatedAssignments = [...staffAssignments];
    const assignment = updatedAssignments[roleIndex];
    assignment.assignedStaff = assignment.assignedStaff.filter(s => s.staffId !== staffId);
    setStaffAssignments(updatedAssignments);
    toast.success("Staff member removed");
  };

  const calculateTotal = () => {
    const costs = parseFloat(staffCosts) || 0;
    const travel = parseFloat(travelFee) || 0;
    const platform = parseFloat(platformFee) || 0;
    const additional = parseFloat(additionalFees) || 0;
    return costs + travel + platform + additional;
  };

  const calculateDeposit = () => {
    const total = calculateTotal();
    const percentage = parseFloat(depositPercentage) || 0;
    return (total * percentage) / 100;
  };

  const validateForm = () => {
    // Check if all staff positions are filled
    const allStaffAssigned = staffAssignments.every(
      assignment => assignment.assignedStaff.length === assignment.quantity
    );

    if (!allStaffAssigned) {
      toast.error("Please assign all required staff members");
      return false;
    }

    if (!selectedManager) {
      toast.error("Please assign an on-ground manager");
      return false;
    }

    // Only check pricing if not scheduler (since they don't see pricing)
    if (!isScheduler) {
      if (!staffCosts || parseFloat(staffCosts) <= 0) {
        toast.error("Please enter staff costs");
        return false;
      }
    }

    return true;
  };

  const handleApprove = async () => {
    if (!validateForm()) return;
    if (!request) return;
    setIsCreating(true);
    try {
      await eventService.updateEvent(request.id, { 
        status: 'CONFIRMED',
        managerId: selectedManager || undefined,
        budget: total,
        deposit: deposit,
        staffCosts: parseFloat(staffCosts) || 0,
        travelFee: parseFloat(travelFee) || 0,
        platformFee: parseFloat(platformFee) || 0,
        additionalFees: parseFloat(additionalFees) || 0,
        adminNotes: adminNotes
      });

      // Auto-create invoice for the client
      try {
        const staffCost = parseFloat(staffCosts) || 0;
        const travel = parseFloat(travelFee) || 0;
        const platform = parseFloat(platformFee) || 0;
        const additional = parseFloat(additionalFees) || 0;
        const subtotal = staffCost + travel + platform + additional;

        const lineItems: { description: string; quantity: number; unitPrice: number }[] = [];
        if (staffCost > 0) lineItems.push({ description: 'Staff Costs', quantity: 1, unitPrice: staffCost });
        if (travel > 0) lineItems.push({ description: 'Travel Fee', quantity: 1, unitPrice: travel });
        if (platform > 0) lineItems.push({ description: 'Platform Fee', quantity: 1, unitPrice: platform });
        if (additional > 0) lineItems.push({ description: 'Additional Fees', quantity: 1, unitPrice: additional });

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14); // 14 days to pay

        await api.post('/invoices', {
          clientId: request.client.id,
          eventId: request.id,
          subtotal,
          taxRate: 0,
          status: 'SENT',
          dueDate: dueDate.toISOString(),
          notes: `Invoice for ${request.event.name}`,
          lineItems,
        });
        toast.success("Invoice created and sent to client!");
      } catch (invoiceErr) {
        console.error('Failed to auto-create invoice', invoiceErr);
        toast.warning("Event approved but invoice creation failed. Create manually.");
      }

      setCreatedEventId(request.id);
      setShowSuccessDialog(true);
      toast.success("Event approved successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to approve event');
    } finally {
      setIsCreating(false);
    }
  };

  const handleReject = async () => {
    if (!adminNotes.trim()) {
      toast.error("Please add admin notes explaining the rejection reason");
      return;
    }
    if (!request) return;
    try {
      await eventService.updateEvent(request.id, { 
        status: 'CANCELLED',
        adminNotes: adminNotes
      });
      toast.success(`Request ${request.requestNumber} rejected. Client will be notified.`);
      setCurrentPage("event-requests-queue");
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to reject event');
    }
  };

  const handleDone = () => {
    setShowSuccessDialog(false);
    setCurrentPage("event-requests-queue");
  };

  // Map managers from users API
  const availableManagers = realManagersList.map((m: any) => ({
    staffId: m.id,
    staffName: m.name || 'Unknown',
    role: 'Manager',
    available: m.isActive !== false,
    rating: m.staffProfile?.rating || 5.0,
    rate: m.staffProfile?.hourlyRate || 0,
  }));
  
  const availableStaffForRole: StaffMember[] = realStaff.map(s => ({
    staffId: s.user?.id || s.userId || s.id,
    staffName: s.user?.name || s.name || 'Unknown',
    rate: parseFloat(s.hourlyRate) || 0,
    rating: parseFloat(s.rating) || 0,
    available: s.availabilityStatus !== 'UNAVAILABLE' && s.availabilityStatus !== 'ON_LEAVE',
    role: s.specialty || s.role || 'Staff',
  }));

  const totalStaffNeeded = staffAssignments.reduce((acc, r) => acc + r.quantity, 0);
  const totalStaffAssigned = staffAssignments.reduce((acc, r) => acc + r.assignedStaff.length, 0);
  const total = calculateTotal();
  const deposit = calculateDeposit();

  // Loading state while fetching event data
  if (isLoadingEvent || !request) {
    return (
      <div className="space-y-6 w-full pb-12">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage('event-requests-queue')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Queue
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          {isLoadingEvent ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <Sparkles className="h-8 w-8 text-[#5E1916]" />
              </motion.div>
              <p className="text-gray-600">Loading event details...</p>
            </>
          ) : (
            <>
              <AlertTriangle className="h-8 w-8 text-red-500 mb-4" />
              <p className="text-gray-600">Failed to load event details</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setCurrentPage('event-requests-queue')}
              >
                Return to Queue
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage('event-requests-queue')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Queue
          </Button>
          <div>
            <h1 className="text-[#5E1916]">Request {request.requestNumber}</h1>
            <p className="text-gray-500">
              Submitted {format(new Date(request.submittedDate), 'MMM dd, yyyy • HH:mm')}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleReject}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject Request
          </Button>
          <Button
            className="bg-[#5E1916] hover:bg-[#4E0707]"
            disabled={isCreating}
            onClick={handleApprove}
          >
            {isCreating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
                Creating Event...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve & Create Event
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Validation Status Banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-blue-900">Manual Assignment Required</p>
              <p className="text-sm text-blue-700 mt-1">
                Please assign all required staff members{!isScheduler && " and fill in pricing details"} before approving this request.
                Staff assigned: {totalStaffAssigned}/{totalStaffNeeded}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Client Name</p>
                    <p className="font-medium">{request.client.name}</p>
                    <Badge variant="outline" className="mt-1">{request.client.accountType}</Badge>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="font-medium">{request.client.company}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{request.client.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{request.client.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                    <p className="font-medium">{request.client.totalBookings} events</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Favorite Staff</p>
                    <p className="font-medium">{request.client.favoriteStaff} members</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Event Name</p>
                <p className="font-medium text-lg">{request.event.name}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Type</p>
                  <div className="p-2 bg-slate-100 rounded-md inline-block">
                    <p className="font-medium text-sm">{request.event.type}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Expected Guests</p>
                  <p className="font-medium">{request.event.expectedGuests} guests</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Proposed Budget</p>
                  <p className="font-semibold text-green-700 font-mono text-lg">${request.event.proposedBudget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="font-medium">{format(new Date(request.event.date), "MMMM dd, yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Time</p>
                  <p className="font-medium">{request.event.startTime} - {request.event.endTime}</p>
                  <p className="text-xs text-gray-500">{request.event.duration} hours</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Venue</p>
                <p className="font-medium">{request.event.venue}</p>
                <p className="text-sm text-gray-600 mt-1">{request.event.address}</p>
              </div>

              {/* Break Configuration Section - Updated feature */}
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <h4 className="font-medium text-sm">Break Configuration</h4>
                </div>

                <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Enable Staff Breaks</Label>
                    <p className="text-xs text-gray-500">Allow staff to take breaks during this event</p>
                  </div>
                  <Switch
                    checked={hasBreaks}
                    onCheckedChange={setHasBreaks}
                  />
                </div>

                {hasBreaks && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Break Count (per staff)</Label>
                      <Select defaultValue="1">
                        <SelectTrigger>
                          <SelectValue placeholder="Select count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Break</SelectItem>
                          <SelectItem value="2">2 Breaks</SelectItem>
                          <SelectItem value="3">3 Breaks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Break Duration (minutes)</Label>
                      <Select defaultValue="15">
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 Minutes</SelectItem>
                          <SelectItem value="30">30 Minutes</SelectItem>
                          <SelectItem value="45">45 Minutes</SelectItem>
                          <SelectItem value="60">60 Minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {request.event.specialRequirements && (
                <>
                  <Separator />
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900 mb-1">Special Requirements</p>
                    <p className="text-sm text-yellow-800">{request.event.specialRequirements}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Staff Assignment Section */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Staff Assignment
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Assign staff members to fulfill client requirements
                  </CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-700 w-fit">
                  {totalStaffAssigned}/{totalStaffNeeded} Assigned
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {staffAssignments.map((assignment, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-lg">{assignment.role}</h4>
                      <Badge variant="outline" className="text-xs">
                        {assignment.assignedStaff.length}/{assignment.quantity} assigned
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectStaff(index, assignment.role)}
                      disabled={assignment.assignedStaff.length >= assignment.quantity}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Staff
                    </Button>
                  </div>

                  {/* Show Favorite Staff */}
                  {assignment.favoriteStaff.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        <p className="text-sm font-medium">Client's Favorite Staff ({assignment.favoriteStaff.length})</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {assignment.favoriteStaff.map((fav, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded bg-amber-50 border border-amber-200 text-sm"
                          >
                            <span className="font-medium text-amber-900">{fav.staffName}</span>
                            <div className="flex items-center gap-2 text-xs text-amber-700">
                              <span>⭐ {fav.rating}</span>
                              <span>•</span>
                              <span>${fav.rate}/hr</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assigned Staff */}
                  {assignment.assignedStaff.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Assigned Staff</p>
                      <div className="space-y-2">
                        {assignment.assignedStaff.map((staff, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-green-900">{staff.staffName}</p>
                              <div className="flex items-center gap-2 text-xs text-green-700">
                                <span>⭐ {staff.rating}</span>
                                <span>•</span>
                                <span>${staff.rate}/hr</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveStaff(index, staff.staffId)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {assignment.assignedStaff.length === 0 && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded text-center">
                      <p className="text-sm text-gray-600">No staff assigned yet</p>
                      <p className="text-xs text-gray-500 mt-1">Click "Add Staff" to assign {assignment.quantity} staff members</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Manager Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                On-Ground Manager Assignment
              </CardTitle>
              <CardDescription>Select a manager to oversee this event</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label>Assign Manager *</Label>
                <Select value={selectedManager} onValueChange={setSelectedManager}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableManagers.map((manager) => (
                      <SelectItem
                        key={manager.staffId}
                        value={manager.staffId}
                        disabled={!manager.available}
                      >
                        {manager.staffName} - ⭐ {manager.rating} - ${manager.rate}/hr
                        {!manager.available && " (Unavailable)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedManager && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <p className="text-sm font-medium text-green-900">
                        Manager assigned: {availableManagers.find(m => m.staffId === selectedManager)?.staffName}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Admin Notes
              </CardTitle>
              <CardDescription>Add internal notes about this request</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any notes about this request (required for rejection)..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Section - HIDDEN FOR SCHEDULER */}
          {!isScheduler && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Event Pricing
                </CardTitle>
                <CardDescription>Manually enter pricing details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staffCosts">Staff Costs *</Label>
                  <Input
                    id="staffCosts"
                    type="number"
                    placeholder="0.00"
                    value={staffCosts}
                    onChange={(e) => setStaffCosts(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travelFee">Travel Fee</Label>
                  <Input
                    id="travelFee"
                    type="number"
                    placeholder="0.00"
                    value={travelFee}
                    onChange={(e) => setTravelFee(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platformFee">Platform Fee</Label>
                  <Input
                    id="platformFee"
                    type="number"
                    placeholder="0.00"
                    value={platformFee}
                    onChange={(e) => setPlatformFee(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalFees">Additional Fees</Label>
                  <Input
                    id="additionalFees"
                    type="number"
                    placeholder="0.00"
                    value={additionalFees}
                    onChange={(e) => setAdditionalFees(e.target.value)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="depositPercentage">Deposit Percentage (%)</Label>
                  <Input
                    id="depositPercentage"
                    type="number"
                    placeholder="50"
                    value={depositPercentage}
                    onChange={(e) => setDepositPercentage(e.target.value)}
                  />
                </div>

                <Separator />

                <div className="pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Total Amount:</span>
                    <span className="text-xl font-bold text-green-600">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Deposit ({depositPercentage}%):</span>
                    <span className="font-bold text-gray-900">
                      ${deposit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Event Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Staff Needed:</span>
                <span className="font-medium">{totalStaffNeeded}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Staff Assigned:</span>
                <span className={`font-medium ${totalStaffAssigned === totalStaffNeeded ? 'text-green-600' : 'text-orange-600'}`}>
                  {totalStaffAssigned}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Manager:</span>
                <span className={`font-medium ${selectedManager ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedManager ? '✓ Assigned' : '✗ Not Assigned'}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Event Duration:</span>
                <span className="font-medium">{request.event.duration} hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Expected Guests:</span>
                <span className="font-medium">{request.event.expectedGuests}</span>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <Card className="border-2 border-sangria/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleReject}
              className="w-full sm:w-auto"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Request
            </Button>
            <Button
              className="bg-[#5E1916] hover:bg-[#4E0707] w-full sm:w-auto"
              disabled={isCreating}
              onClick={handleApprove}
            >
              {isCreating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                  Creating Event...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve & Create Event
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff Selector Dialog */}
      <Dialog open={showStaffSelector} onOpenChange={setShowStaffSelector}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select {selectedRole}</DialogTitle>
            <DialogDescription>
              Choose from available staff members
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 overflow-y-auto flex-1 px-1">
            {isLoadingStaff && (
              <p className="text-sm text-muted-foreground text-center py-6">Loading staff...</p>
            )}
            {!isLoadingStaff && availableStaffForRole.map((staff) => (
              <div
                key={staff.staffId}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleAddStaff(staff)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{staff.staffName}</p>
                    {!staff.available && (
                      <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded">Busy</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>⭐ {staff.rating}</span>
                    <span>•</span>
                    <span>${staff.rate}/hr</span>
                    <span>•</span>
                    <span>{staff.role}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            ))}

            {!isLoadingStaff && availableStaffForRole.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No staff members found</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowStaffSelector(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
          <div className="overflow-y-auto flex-1 px-6 pt-6">
            <DialogHeader className="mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="flex justify-center mb-4"
              >
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </motion.div>
              <DialogTitle className="text-center text-2xl">Event Created Successfully!</DialogTitle>
              <DialogDescription className="text-center">
                The event has been created and all notifications have been sent
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pb-6">
              {/* Event Details Summary */}
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-900">Event ID:</span>
                    <Badge className="bg-green-600">{createdEventId}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-900">Event Name:</span>
                    <span className="text-sm text-green-800 text-right">{request.event.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-900">Event Date:</span>
                    <span className="text-sm text-green-800">
                      {format(new Date(request.event.date), "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-900">Total Staff:</span>
                    <span className="text-sm text-green-800">{totalStaffAssigned} members</span>
                  </div>
                  {!isScheduler && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-900">Total Revenue:</span>
                      <span className="text-sm font-bold text-green-800">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Email Notifications */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Email Notifications Sent
                </h4>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900 text-sm">Client Confirmation</p>
                    <p className="text-sm text-blue-700">
                      Sent to {request.client.name}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      ✓ Event details, invoice, payment instructions
                    </p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg"
                >
                  <Users className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-purple-900 text-sm">Staff Assignments</p>
                    <p className="text-sm text-purple-700">
                      Sent to {totalStaffAssigned} staff members
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      ✓ Event details, schedule, venue, dress code
                    </p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <ShieldCheck className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-orange-900 text-sm">Manager Notification</p>
                    <p className="text-sm text-orange-700">
                      Sent to on-ground manager
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      ✓ Full event briefing, staff roster, client info
                    </p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                </motion.div>
              </div>

              {/* Success Message */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-900 mb-2">
                  <Sparkles className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium text-sm">Everything is set!</span>
                </div>
                <p className="text-sm text-green-800">
                  The event is now live in the system. Staff can view their assignments in their portal,
                  and the client will receive a confirmation email with all event details.
                </p>
              </div>
            </div>
          </div>

          {/* Done Button - Fixed at bottom */}
          <div className="border-t p-6 bg-white">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleDone}
                className="w-full bg-[#5E1916] hover:bg-[#4E0707] h-12"
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 10, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                  className="mr-2"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </motion.div>
                Done - Return to Queue
              </Button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
