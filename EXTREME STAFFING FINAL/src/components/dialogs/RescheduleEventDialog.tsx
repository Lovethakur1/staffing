import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { TimeInput } from "../ui/time-input";
import { Calendar as CalendarIcon, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { cn } from "../ui/utils";

interface RescheduleEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventName: string;
  eventId: string;
  currentDate: string;
  currentStartTime: string;
  currentEndTime: string;
  onReschedule?: (data: RescheduleData) => void;
}

export interface RescheduleData {
  eventId: string;
  rescheduleType: 'reschedule' | 'postpone';
  newDate?: string;
  newStartTime?: string;
  newEndTime?: string;
  reason: string;
  notifyClient: boolean;
  notifyStaff: boolean;
}

export function RescheduleEventDialog({
  open,
  onOpenChange,
  eventName,
  eventId,
  currentDate,
  currentStartTime,
  currentEndTime,
  onReschedule
}: RescheduleEventDialogProps) {
  const [rescheduleType, setRescheduleType] = useState<'reschedule' | 'postpone'>('reschedule');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState(currentStartTime || "18:00");
  const [endTime, setEndTime] = useState(currentEndTime || "23:00");
  const [reason, setReason] = useState("");
  const [notifyClient, setNotifyClient] = useState(true);
  const [notifyStaff, setNotifyStaff] = useState(true);

  const handleSubmit = () => {
    // Validate inputs
    if (rescheduleType === 'reschedule') {
      if (!selectedDate) {
        toast.error("Please select a new date for the event");
        return;
      }
      if (!startTime || !endTime) {
        toast.error("Please select start and end times");
        return;
      }
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for rescheduling");
      return;
    }

    const data: RescheduleData = {
      eventId,
      rescheduleType,
      newDate: selectedDate ? selectedDate.toISOString().split('T')[0] : undefined,
      newStartTime: rescheduleType === 'reschedule' ? startTime : undefined,
      newEndTime: rescheduleType === 'reschedule' ? endTime : undefined,
      reason: reason.trim(),
      notifyClient,
      notifyStaff
    };

    // Call the callback
    if (onReschedule) {
      onReschedule(data);
    }

    // Show success message
    if (rescheduleType === 'postpone') {
      toast.success(`Event postponed`, {
        description: `${eventName} has been marked as postponed. Client and staff will be notified.`
      });
    } else {
      toast.success(`Event rescheduled`, {
        description: `${eventName} has been rescheduled to ${selectedDate?.toLocaleDateString()}. Notifications sent.`
      });
    }

    // Reset form and close
    handleClose();
  };

  const handleClose = () => {
    setRescheduleType('reschedule');
    setSelectedDate(undefined);
    setStartTime(currentStartTime || "18:00");
    setEndTime(currentEndTime || "23:00");
    setReason("");
    setNotifyClient(true);
    setNotifyStaff(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reschedule Event</DialogTitle>
          <DialogDescription>
            Update the date and time for <span className="font-semibold">{eventName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Event Details */}
          <div className="bg-slate-50 p-4 rounded-lg space-y-2">
            <h3 className="text-sm font-medium text-slate-900">Current Schedule</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <CalendarIcon className="w-4 h-4 text-slate-500" />
                <span>{new Date(currentDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>{currentStartTime} - {currentEndTime}</span>
              </div>
            </div>
          </div>

          {/* Reschedule Type Selection */}
          <div className="space-y-3">
            <Label>Reschedule Type</Label>
            <RadioGroup value={rescheduleType} onValueChange={(value: 'reschedule' | 'postpone') => setRescheduleType(value)}>
              <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <RadioGroupItem value="reschedule" id="reschedule" />
                <div className="flex-1">
                  <Label htmlFor="reschedule" className="cursor-pointer">
                    <div className="font-medium">Reschedule to New Date</div>
                    <div className="text-sm text-slate-600 font-normal">
                      Set a specific new date and time for this event
                    </div>
                  </Label>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                <RadioGroupItem value="postpone" id="postpone" />
                <div className="flex-1">
                  <Label htmlFor="postpone" className="cursor-pointer">
                    <div className="font-medium flex items-center gap-2">
                      Postpone (Date TBD)
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-sm text-slate-600 font-normal">
                      Mark event as postponed when new date is not yet confirmed
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* New Date & Time Selection (Only for Reschedule) */}
          {rescheduleType === 'reschedule' && (
            <>
              <div className="space-y-3">
                <Label htmlFor="new-date">New Event Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-slate-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      ) : (
                        <span>Select new date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="start-time">Start Time *</Label>
                  <TimeInput
                    value={startTime}
                    onChange={setStartTime}
                    className="w-full"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="end-time">End Time *</Label>
                  <TimeInput
                    value={endTime}
                    onChange={setEndTime}
                    className="w-full"
                  />
                </div>
              </div>
            </>
          )}

          {/* Reason for Rescheduling */}
          <div className="space-y-3">
            <Label htmlFor="reason">
              Reason for {rescheduleType === 'postpone' ? 'Postponing' : 'Rescheduling'} *
            </Label>
            <Textarea
              id="reason"
              placeholder={rescheduleType === 'postpone' 
                ? "e.g., Client requested postponement due to venue availability issues. New date to be confirmed." 
                : "e.g., Client requested change due to conflict with another event. All parties have agreed to the new date."}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-slate-600">
              This reason will be included in notifications to the client and staff
            </p>
          </div>

          {/* Notification Options */}
          <div className="space-y-3">
            <Label>Notifications</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  id="notify-client"
                  checked={notifyClient}
                  onChange={(e) => setNotifyClient(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <Label htmlFor="notify-client" className="cursor-pointer flex-1 font-normal">
                  Send notification to client
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  id="notify-staff"
                  checked={notifyStaff}
                  onChange={(e) => setNotifyStaff(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <Label htmlFor="notify-staff" className="cursor-pointer flex-1 font-normal">
                  Send notification to assigned staff
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-sangria hover:bg-merlot"
          >
            {rescheduleType === 'postpone' ? 'Mark as Postponed' : 'Confirm Reschedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
