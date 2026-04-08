import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Mail,
  Phone,
  Star,
  CreditCard,
  Receipt,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  XCircle,
  Circle,
  Edit,
  Download,
  FileText,
  Building,
  User,
  Plus
} from "lucide-react";
import { useNavigation } from "../contexts/NavigationContext";
import api from "../services/api";
import { unavailabilityService, UnavailabilityRecord } from "../services/unavailability.service";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

interface BookingDetailsProps {
  userRole: string;
  userId: string;
}

export function BookingDetails({ userRole, userId }: BookingDetailsProps) {
  const { setCurrentPage, pageParams } = useNavigation();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPendingActions, setShowPendingActions] = useState(false);
  const [apiInvoices, setApiInvoices] = useState<any[]>([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [availableStaff, setAvailableStaff] = useState<any[]>([]);
  const [staffUnavailability, setStaffUnavailability] = useState<UnavailabilityRecord[]>([]);
  const [loadingUnavailability, setLoadingUnavailability] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const bookingId = pageParams.bookingId;
    if (bookingId) {
      const fetchBooking = async () => {
        try {
          const res = await api.get(`/events/${bookingId}`);
          const raw = res.data;
          const e = raw?.data || raw;
          if (e && e.id) {
            setBooking({
              ...e,
              title: e.title || e.eventName || 'Event',
              location: e.location || e.venue || '',
              status: (e.status || 'pending').toLowerCase().replace('_', '-'),
              budget: e.budget || 0,
              deposit: e.deposit || 0,
              tips: e.tips || 0,
              startTime: e.startTime || '',
              endTime: e.endTime || '',
              assignedStaff: (e.shifts || []).map((s: any) => s.staff).filter(Boolean),
              staffRequired: e.staffRequired || 0,
            });
          } else {
            setError('Booking not found. The event may have been removed.');
          }
        } catch {
          setError('Unable to load booking details. Please check your connection and try again.');
        }
        try {
          const invRes = await api.get('/invoices');
          const invRaw = invRes.data;
          setApiInvoices(Array.isArray(invRaw) ? invRaw : (invRaw?.data || []));
        } catch { /* fallback handled below */ }
        setLoading(false);
      };
      fetchBooking();

      if (pageParams.focusArea === "pending-actions") {
        setShowPendingActions(true);
      }
    } else {
      setLoading(false);
    }
  }, [pageParams]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      case 'in-progress': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'in-progress': return <Circle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Get invoice data for booking
  const getBookingInvoice = (eventId: string) => {
    return apiInvoices.find(inv => inv.eventId === eventId) || null;
  };

  const handleAssignStaffClick = async () => {
    setIsAssignDialogOpen(true);
    
    // Fetch staff and unavailability data in parallel
    const fetchPromises: Promise<any>[] = [];
    
    if (availableStaff.length === 0) {
      fetchPromises.push(
        api.get('/staff').then(res => {
          setAvailableStaff(res.data.data || res.data || []);
        }).catch(() => {
          toast.error('Failed to load available staff');
        })
      );
    }
    
    // Fetch unavailability data to filter out staff on leave
    setLoadingUnavailability(true);
    fetchPromises.push(
      unavailabilityService.getAllUnavailability().then(data => {
        setStaffUnavailability(data);
      }).catch(err => {
        console.error('Failed to fetch unavailability:', err);
      }).finally(() => {
        setLoadingUnavailability(false);
      })
    );
    
    await Promise.all(fetchPromises);
  };

  const handleConfirmAssignment = async (staffId: string) => {
    setAssigning(true);
    try {
      const shiftData = {
        eventId: booking.id,
        staffId,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        role: booking.eventType || 'Server',
        hourlyRate: 25,
        guaranteedHours: 4,
      };

      await api.post('/shifts', shiftData);
      toast.success('Staff assigned successfully!');

      // Build a User-shaped object to match what e.shifts[].staff returns from API
      const profile = availableStaff.find(s => (s.user?.id || s.userId) === staffId);
      const newStaff = profile ? {
        id: staffId,
        name: profile.user?.name || profile.name || 'Staff',
        email: profile.user?.email || profile.email || '',
        phone: profile.user?.phone || profile.phone || '',
      } : { id: staffId, name: 'Staff', email: '', phone: '' };
      setBooking((prev: any) => ({
        ...prev,
        assignedStaff: [...prev.assignedStaff, newStaff],
      }));
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to assign staff');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="page-container">
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The requested booking could not be found.
          </p>
          <Button onClick={() => setCurrentPage("bookings")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bookings
          </Button>
        </div>
      </div>
    );
  }

  const invoice = getBookingInvoice(booking.id);
  const assignedStaff = booking.assignedStaff || [];

  return (
    <div className="page-container">
      {/* Header with Back Button */}
      <div className="desktop-first-header mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setCurrentPage("bookings")}
            className="h-10 w-10 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-foreground flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              {booking.title}
            </h1>
            <p className="text-muted-foreground mt-1">
              Booking Details • #{booking.id.split('-')[1]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1 px-3 py-1`}>
            {getStatusIcon(booking.status)}
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Booking
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Event Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Event Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Event Title</label>
                  <p className="mt-1 font-medium text-lg">{booking.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Event Type</label>
                  <p className="mt-1 flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    {booking.eventType || 'Special Event'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(booking.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Time</label>
                  <p className="mt-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {booking.startTime} - {booking.endTime}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Duration</label>
                  <p className="mt-1 text-muted-foreground">
                    {(() => {
                      const start = new Date(`2000-01-01 ${booking.startTime}`);
                      const end = new Date(`2000-01-01 ${booking.endTime}`);
                      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                      return `${duration} hours`;
                    })()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Booking Status</label>
                  <div className="mt-1">
                    <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1 w-fit`}>
                      {getStatusIcon(booking.status)}
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-muted-foreground">Location</label>
              <p className="mt-1 flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-base">{booking.location}</span>
              </p>
            </div>

            {booking.description && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Event Description</label>
                  <p className="mt-2 text-sm leading-relaxed bg-muted/30 p-4 rounded-lg">
                    {booking.description}
                  </p>
                </div>
              </>
            )}

            {booking.specialRequirements && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Special Requirements</label>
                  <p className="mt-2 text-sm leading-relaxed bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    {booking.specialRequirements}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Staff Assignment */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Staff Assignment ({booking.assignedStaff.length}/{booking.staffRequired})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedStaff.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignedStaff.map((staff: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{staff?.name || 'Staff Member'}</h4>
                          <p className="text-sm text-muted-foreground">Staff ID: {staff?.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{staff?.rating || 4.8}</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {staff?.email || 'staff@example.com'}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {staff?.phone || '+1-555-0000'}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        ${staff?.hourlyRate || 25}/hour
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {staff?.skills?.slice(0, 3).map((skill: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Staff Assigned</h3>
                <p className="text-muted-foreground mb-4">
                  {booking.staffRequired} staff members are required for this event
                </p>
                <Button onClick={handleAssignStaffClick}>
                  <Users className="mr-2 h-4 w-4" />
                  Assign Staff
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Budget Breakdown */}
              <div className="space-y-6">
                <h4 className="font-medium text-lg">Budget Breakdown</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Event Budget</span>
                    <span className="font-semibold text-lg">${booking.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-700">Deposit Paid</span>
                    <span className="font-semibold text-green-700">
                      ${(booking.deposit || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Tips (if applicable)</span>
                    <span className="font-medium">
                      ${(booking.tips || 0).toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <span className="font-semibold text-lg">Remaining Balance</span>
                    <span className="font-bold text-xl text-primary">
                      ${(booking.budget - (booking.deposit || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="space-y-6">
                {invoice ? (
                  <>
                    <h4 className="font-medium text-lg flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      Invoice Details
                    </h4>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Invoice Number</span>
                          <span className="font-mono text-sm font-medium">{invoice.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Issue Date</span>
                          <span>{new Date(invoice.issueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Due Date</span>
                          <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Amount</span>
                          <span className="font-semibold">${invoice.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Payment Status</span>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </div>
                        {invoice.paymentDate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Payment Date</span>
                            <span className="text-green-600 font-medium">
                              {new Date(invoice.paymentDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {invoice.paymentMethod && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Payment Method</span>
                            <span>{invoice.paymentMethod}</span>
                          </div>
                        )}
                      </div>

                      {invoice.lineItems && invoice.lineItems.length > 0 && (
                        <div className="space-y-3">
                          <h5 className="font-medium">Line Items</h5>
                          <div className="space-y-2">
                            {invoice.lineItems.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between text-sm p-2 bg-muted/20 rounded">
                                <span>{item.description}</span>
                                <span className="font-medium">${item.amount.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="font-medium text-lg">Invoice Status</h4>
                    <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                      <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h5 className="font-medium mb-2">No Invoice Generated</h5>
                      <p className="text-muted-foreground text-sm">
                        Invoice will be generated closer to the event date
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Modify Booking
                </Button>
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Invoice
                </Button>
                <Button>
                  <Receipt className="mr-2 h-4 w-4" />
                  View Full Invoice
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assign Staff Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Staff to Event</DialogTitle>
            <DialogDescription>
              Select qualified staff members for {booking?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {loadingUnavailability && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2" />
                <span className="text-sm text-muted-foreground">Checking staff availability...</span>
              </div>
            )}
            {availableStaff.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Loading available staff...</div>
            ) : availableStaff.filter((profile) => {
              const user = profile.user || {};
              const staffId = user.id || profile.userId;
              const staffProfileId = profile.id;

              // Exclude already assigned staff
              if (assignedStaff.some((assigned: any) => assigned.id === staffId)) {
                return false;
              }

              // Exclude staff on leave for the event date
              if (booking?.date && staffUnavailability.length > 0) {
                const eventDate = new Date(booking.date);
                const unavailableStaffIds = unavailabilityService.getUnavailableStaffIds(staffUnavailability, eventDate);
                if (unavailableStaffIds.has(staffId) || unavailableStaffIds.has(staffProfileId)) {
                  return false;
                }
              }

              return true;
            }).map((profile) => {
              const user = profile.user || {};
              const staffId = user.id || profile.userId;

              return (
                <div
                  key={staffId}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {(user.name || 'S').split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.name || 'Unknown Staff'}</span>
                        <Badge variant="outline" className="text-xs">{profile.hourlyRate ? `$${profile.hourlyRate}/hr` : 'Staff'}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {profile.skills?.slice(0, 3).map((skill: string, idx: number) => (
                          <span key={idx} className="bg-secondary px-1.5 py-0.5 rounded text-[10px]">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-primary"
                    disabled={assigning}
                    onClick={() => handleConfirmAssignment(staffId)}
                  >
                    Assign
                  </Button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
