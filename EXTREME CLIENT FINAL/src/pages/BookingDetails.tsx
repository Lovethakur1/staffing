import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
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
  Heart,
  Ban
} from "lucide-react";
import { mockEvents, mockStaff, mockInvoices, Staff } from "../data/mockData";
import { useNavigation } from "../contexts/NavigationContext";
import { toast } from "sonner@2.0.3";

interface BookingDetailsProps {
  userRole: string;
  userId: string;
}

export function BookingDetails({ userRole, userId }: BookingDetailsProps) {
  const { setCurrentPage, pageParams } = useNavigation();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPendingActions, setShowPendingActions] = useState(false);
  
  // Staff Management State
  const [favoriteStaff, setFavoriteStaff] = useState<string[]>(["staff-1", "staff-3"]);
  const [excludeDialogOpen, setExcludeDialogOpen] = useState(false);
  const [selectedStaffForExclusion, setSelectedStaffForExclusion] = useState<any>(null);
  const [exclusionReason, setExclusionReason] = useState("");
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedStaffForRating, setSelectedStaffForRating] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  useEffect(() => {
    // Get booking ID from page parameters
    const bookingId = pageParams.bookingId;
    if (bookingId) {
      // Find the booking in mock data
      const foundBooking = mockEvents.find(event => event.id === bookingId);
      setBooking(foundBooking || null);
      
      // Check if we should highlight pending actions
      if (pageParams.focusArea === "pending-actions") {
        setShowPendingActions(true);
      }
    }
    setLoading(false);
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
    return mockInvoices.find(invoice => invoice.eventId === eventId);
  };

  // Get assigned staff details
  const getAssignedStaffDetails = (staffIds: string[]) => {
    return staffIds.map(id => mockStaff.find(staff => staff.id === id)).filter(Boolean);
  };

  const toggleFavorite = (staffId: string) => {
    setFavoriteStaff(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
    
    if (!favoriteStaff.includes(staffId)) {
      toast.success("Staff member added to favorites");
    } else {
      toast.success("Staff member removed from favorites");
    }
  };

  const handleExcludeClick = (staff: any) => {
    setSelectedStaffForExclusion(staff);
    setExclusionReason("");
    setExcludeDialogOpen(true);
  };

  const confirmExclusion = () => {
    if (!selectedStaffForExclusion) return;
    
    if (!exclusionReason.trim()) {
      toast.error("Please provide a reason for exclusion");
      return;
    }

    toast.success(`${selectedStaffForExclusion.name} has been added to your exclusion list.`);
    setExcludeDialogOpen(false);
    setSelectedStaffForExclusion(null);
  };

  const handleRateClick = (staff: any) => {
    setSelectedStaffForRating(staff);
    setRating(5);
    setReview("");
    setRatingDialogOpen(true);
  };

  const submitRating = () => {
    toast.success(`Rating submitted for ${selectedStaffForRating?.name}`);
    setRatingDialogOpen(false);
    setSelectedStaffForRating(null);
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
  const assignedStaff = getAssignedStaffDetails(booking.assignedStaff);

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
                {assignedStaff.map((staff: any, index: number) => {
                  const isFavorite = favoriteStaff.includes(staff.id);
                  
                  return (
                    <div key={index} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{staff?.name || 'Staff Member'}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {/* Favorites & Exclude Actions in Header */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFavorite(staff.id)}
                                className="h-6 w-6 p-0 hover:bg-red-50"
                                title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                              >
                                <Heart 
                                  className={`w-3.5 h-3.5 ${
                                    isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                                  }`} 
                                />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleExcludeClick(staff)}
                                className="h-6 w-6 p-0 hover:bg-red-50"
                                title="Exclude Staff"
                              >
                                <Ban className="w-3.5 h-3.5 text-muted-foreground hover:text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{staff?.rating || 4.8}</span>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2 text-sm">
                        {/* Contact details removed as requested */}
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
                      
                      {/* Review Action */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => handleRateClick(staff)}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Rate Performance
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Staff Assigned</h3>
                <p className="text-muted-foreground mb-4">
                  {booking.staffRequired} staff members are required for this event
                </p>
                <Button>
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
                <Button variant="outline" onClick={() => setCurrentPage("messages", { defaultSubject: `Support Request: ${booking.title}`, eventId: booking.id })}>
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {invoice && (
                  <Button variant="outline" onClick={() => {
                    // In a real app, this would download the PDF
                    alert(`Downloading invoice ${invoice.invoiceNumber}`);
                  }}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Invoice
                  </Button>
                )}
                {invoice ? (
                  <Button onClick={() => setCurrentPage("invoicing", { invoiceId: invoice.id })}>
                    <Receipt className="mr-2 h-4 w-4" />
                    View Full Invoice
                  </Button>
                ) : (
                  <Button onClick={() => setCurrentPage("invoicing")}>
                    <Receipt className="mr-2 h-4 w-4" />
                    Create Invoice
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Exclusion Dialog */}
      <Dialog open={excludeDialogOpen} onOpenChange={setExcludeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="h-5 w-5" />
              Exclude Staff Member
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to exclude {selectedStaffForExclusion?.name}? They will not be assigned to your future events.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for Exclusion</Label>
              <Textarea 
                placeholder="Please explain why you want to exclude this staff member..."
                value={exclusionReason}
                onChange={(e) => setExclusionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setExcludeDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmExclusion}>Confirm Exclusion</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              Rate {selectedStaffForRating?.name}
            </DialogTitle>
            <DialogDescription>
              Share your experience working with this staff member.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none"
                  >
                    <Star 
                      className={`w-6 h-6 ${
                        star <= rating 
                          ? 'fill-yellow-500 text-yellow-500' 
                          : 'text-gray-300'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Review (Optional)</Label>
              <Textarea 
                placeholder="Write a brief review..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRatingDialogOpen(false)}>Cancel</Button>
            <Button onClick={submitRating}>Submit Rating</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}