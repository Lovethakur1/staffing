import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  CheckCircle,
  Download,
  LayoutDashboard,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  CreditCard,
  Mail,
  FileText,
  Sparkles,
} from "lucide-react";

interface BookingSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingDetails: {
    eventId: string;
    eventName: string;
    eventType: string;
    eventDate: Date;
    startTime: string;
    endTime: string;
    venueName: string;
    venueAddress: string;
    expectedGuests: number;
    staffCount: number;
    staffBreakdown: { role: string; count: number }[];
    totalCost: number;
    paymentMethod: "full" | "deposit";
    amountPaid: number;
    balanceDue: number;
    discount: number;
    clientName: string;
    clientEmail: string;
  };
  onGoToDashboard: () => void;
}

export function BookingSuccessDialog({
  open,
  onOpenChange,
  bookingDetails,
  onGoToDashboard,
}: BookingSuccessDialogProps) {
  
  const handleDownloadInvoice = () => {
    // Generate a simple text-based invoice
    const invoice = `
=====================================
       EVENT BOOKING INVOICE
=====================================

Booking ID: ${bookingDetails.eventId}
Date Issued: ${new Date().toLocaleDateString()}

-------------------------------------
CLIENT INFORMATION
-------------------------------------
Name: ${bookingDetails.clientName}
Email: ${bookingDetails.clientEmail}

-------------------------------------
EVENT DETAILS
-------------------------------------
Event Name: ${bookingDetails.eventName}
Event Type: ${bookingDetails.eventType}
Date: ${bookingDetails.eventDate.toLocaleDateString()}
Time: ${bookingDetails.startTime} - ${bookingDetails.endTime}

Venue: ${bookingDetails.venueName}
Address: ${bookingDetails.venueAddress}

Expected Guests: ${bookingDetails.expectedGuests}

-------------------------------------
STAFF REQUIREMENTS
-------------------------------------
${bookingDetails.staffBreakdown.map(s => `${s.role}: ${s.count}`).join('\n')}

Total Staff: ${bookingDetails.staffCount}

-------------------------------------
PRICING SUMMARY
-------------------------------------
Total Amount: $${bookingDetails.totalCost.toLocaleString()}
${bookingDetails.discount > 0 ? `Discount Applied: -$${bookingDetails.discount.toLocaleString()}\n` : ''}
Amount Paid: $${bookingDetails.amountPaid.toLocaleString()}
Balance Due: $${bookingDetails.balanceDue.toLocaleString()}

Payment Method: ${bookingDetails.paymentMethod === 'full' ? 'Full Payment (5% Discount)' : '50% Deposit'}

-------------------------------------
TERMS & CONDITIONS
-------------------------------------
- Final payment due 48 hours before event
- Cancellation policy applies
- Staff assignments confirmed 24h before event
- Price lock guarantee applied

=====================================
Thank you for choosing our services!
=====================================

Questions? Contact us at support@eventstaffing.com
    `;

    // Create and download the file
    const blob = new Blob([invoice], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${bookingDetails.eventId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            🎉 Event Booking Confirmed!
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            Your event has been successfully booked. Confirmation email sent to{" "}
            <span className="font-medium text-foreground">{bookingDetails.clientEmail}</span>
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Booking ID */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
            <p className="text-2xl font-mono tracking-wider">
              {bookingDetails.eventId}
            </p>
          </div>

          <Separator />

          {/* Event Details */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Event Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Event Name</p>
                  <p className="font-medium">{bookingDetails.eventName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Event Type</p>
                  <Badge variant="outline">{bookingDetails.eventType}</Badge>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{
                      typeof bookingDetails.eventDate === 'string' 
                        ? new Date(bookingDetails.eventDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                        : bookingDetails.eventDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                    }</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">{bookingDetails.startTime} - {bookingDetails.endTime}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Venue</p>
                    <p className="font-medium">{bookingDetails.venueName}</p>
                    <p className="text-sm text-muted-foreground">{bookingDetails.venueAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Guests</p>
                    <p className="font-medium">{bookingDetails.expectedGuests} people</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Staff Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Staff Assigned ({bookingDetails.staffCount} total)
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {bookingDetails.staffBreakdown.map((staff, index) => (
                <div key={index} className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">{staff.role}</p>
                  <p className="text-lg font-semibold">{staff.count}</p>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <Mail className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-900">
                <p className="font-semibold mb-1">Staff assignments will be finalized 24 hours before your event</p>
                <p>You'll receive individual staff profiles and contact information via email.</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Payment Summary
            </h3>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="text-xl font-semibold">${bookingDetails.totalCost.toLocaleString()}</span>
              </div>

              {bookingDetails.discount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Discount Applied (5% Full Payment)</span>
                  <span className="text-sm text-green-700 font-medium">-${bookingDetails.discount.toLocaleString()}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-green-700" />
                  <span className="text-sm font-medium">Amount Paid Today</span>
                </div>
                <span className="text-lg font-bold text-green-700">${bookingDetails.amountPaid.toLocaleString()}</span>
              </div>

              {bookingDetails.balanceDue > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Balance Due (before event)</span>
                    <span className="text-sm font-medium">${bookingDetails.balanceDue.toLocaleString()}</span>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded p-2 text-xs text-orange-900">
                    ⏰ Final payment due 48 hours before event date
                  </div>
                </>
              )}

              {bookingDetails.balanceDue === 0 && (
                <div className="bg-green-100 border border-green-300 rounded p-2 text-xs text-green-900 flex items-center gap-2">
                  <CheckCircle className="h-3 w-3" />
                  <span>✅ Fully paid! You saved ${bookingDetails.discount.toLocaleString()} with upfront payment</span>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Payment method: {bookingDetails.paymentMethod === 'full' ? 'Full Payment' : '50% Deposit'}
            </div>
          </div>

          <Separator />

          {/* Next Steps */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">📋 What Happens Next?</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Confirmation email sent to {bookingDetails.clientEmail}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Staff assignments finalized 24 hours before event</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>You'll receive staff profiles and contact information</span>
              </li>
              {bookingDetails.balanceDue > 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">⏰</span>
                  <span>Final payment reminder sent 72 hours before event</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Real-time attendance tracking on event day</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleDownloadInvoice}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Download className="h-4 w-4" />
              Download Invoice
            </Button>
            <Button
              onClick={onGoToDashboard}
              className="flex-1 gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Questions? Contact us at{" "}
            <a href="mailto:support@eventstaffing.com" className="text-primary hover:underline">
              support@eventstaffing.com
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}