import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  DollarSign, 
  Users, 
  FileText, 
  Star,
  Check,
  X,
  Play,
  Pause
} from "lucide-react";
import { Shift } from "../../data/mockData";
import { mockEvents } from "../../data/mockData";

interface ShiftDetailsDialogProps {
  shift: Shift | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept?: (shiftId: string) => void;
  onDecline?: (shiftId: string) => void;
  onCheckIn?: (shiftId: string) => void;
  onCheckOut?: (shiftId: string) => void;
}

export function ShiftDetailsDialog({
  shift,
  open,
  onOpenChange,
  onAccept,
  onDecline,
  onCheckIn,
  onCheckOut
}: ShiftDetailsDialogProps) {
  if (!shift) return null;

  const event = mockEvents.find(e => e.id === shift.eventId);
  const duration = calculateShiftDuration(shift.startTime, shift.endTime);
  const isCompleted = shift.status === 'completed';
  const isPending = shift.status === 'pending';
  const isCurrent = shift.status === 'in-progress';
  const isConfirmed = shift.status === 'confirmed';

  function calculateShiftDuration(startTime: string, endTime: string): number {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startTimeMinutes = startHour * 60 + startMinute;
    let endTimeMinutes = endHour * 60 + endMinute;
    
    // Handle overnight shifts
    if (endTimeMinutes < startTimeMinutes) {
      endTimeMinutes += 24 * 60;
    }
    
    return (endTimeMinutes - startTimeMinutes) / 60;
  }

  function getStatusBadge() {
    switch (shift.status) {
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">Pending Response</Badge>;
      case 'confirmed':
        return <Badge variant="outline">Confirmed</Badge>;
      case 'in-progress':
        return <Badge className="bg-primary text-primary-foreground animate-pulse">Currently Active</Badge>;
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive text-destructive-foreground">Declined</Badge>;
      default:
        return <Badge variant="outline">{shift.status}</Badge>;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mobile-dialog-content max-w-2xl h-[90vh] sm:max-h-[90vh] p-0 gap-0">
        <div className="flex flex-col h-full">
          <DialogHeader className="mobile-dialog-header p-4 sm:p-6 border-b">
            <DialogTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg pr-8">
              <span className="truncate">{event?.title || 'Shift Details'}</span>
              {getStatusBadge()}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Complete information about your shift
            </DialogDescription>
          </DialogHeader>

          <div className="mobile-dialog-body p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Event Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Your Role
                </h4>
                <p className="font-medium text-base">{shift.role}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Date & Time
                </h4>
                <div className="space-y-1">
                  <div className="text-sm">
                    {new Date(shift.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span>{shift.startTime} - {shift.endTime}</span>
                    <span className="text-muted-foreground">({duration}h)</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Compensation
                </h4>
                <div className="space-y-1">
                  <div className="font-medium text-primary">${shift.hourlyRate}/hour</div>
                  <div className="text-sm text-muted-foreground">
                    Total: ${(shift.hourlyRate * duration).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </h4>
                    <p className="text-sm leading-relaxed">{shift.location}</p>
                  </div>

                  {event && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Event Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Staff Required:</span>
                          <span className="font-medium">{event.staffRequired}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Event Budget:</span>
                          <span className="font-medium">${event.budget.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {shift.clockIn && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Attendance
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Check In:</span>
                          <span className="font-medium">{shift.clockIn}</span>
                        </div>
                        {shift.clockOut && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Check Out:</span>
                            <span className="font-medium">{shift.clockOut}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
          </div>

          <Separator />

              <Separator />

              {/* Event Description */}
              {event && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Event Description
                  </h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">{event.description}</p>
                </div>
              )}

              {/* Special Requirements */}
              {event?.specialRequirements && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Special Requirements
                  </h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">{event.specialRequirements}</p>
                </div>
              )}

              {/* Contact Information */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Contact Information
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="font-medium text-foreground">Event Coordinator:</span>
                    <span className="text-muted-foreground">Sarah Johnson</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="font-medium text-foreground">Phone:</span>
                    <span className="text-muted-foreground">(555) 123-4567</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="font-medium text-foreground">Email:</span>
                    <span className="text-muted-foreground break-all">sarah@eventcompany.com</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="font-medium text-foreground">Emergency Contact:</span>
                    <span className="text-muted-foreground">(555) 987-6543</span>
                  </div>
                </div>
              </div>

              {/* Payment Summary for completed shifts */}
              {isCompleted && shift.totalPay && (
                <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-success mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Payment Summary
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hours Worked:</span>
                      <span className="font-medium">{shift.totalHours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Pay:</span>
                      <span className="font-medium text-success">${shift.totalPay}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="mobile-dialog-footer border-t p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              {isPending && onAccept && onDecline && (
                <>
                  <Button 
                    className="w-full sm:flex-1 bg-success hover:bg-success/90"
                    onClick={() => onAccept(shift.id)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accept Shift
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full sm:flex-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => onDecline(shift.id)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Decline Shift
                  </Button>
                </>
              )}

              {isCurrent && onCheckOut && (
                <Button 
                  className="w-full sm:flex-1 bg-destructive hover:bg-destructive/90"
                  onClick={() => onCheckOut(shift.id)}
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Check Out
                </Button>
              )}

              {isConfirmed && onCheckIn && (
                <Button 
                  className="w-full sm:flex-1"
                  onClick={() => onCheckIn(shift.id)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Check In
                </Button>
              )}

              <Button 
                variant="outline" 
                className="w-full sm:w-auto" 
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}