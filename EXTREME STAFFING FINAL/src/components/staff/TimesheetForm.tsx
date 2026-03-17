import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { TimeInput } from "../ui/time-input";
import { Checkbox } from "../ui/checkbox";
import { Shift } from "../../data/mockData";

// Define a default travel config since settings might not be loaded
const travelConfig = {
  amount: 15.00,
  active: true
};

interface TimesheetFormProps {
  isOpen: boolean;
  onClose: () => void;
  shift: Shift;
}

export function TimesheetForm({ isOpen, onClose, shift }: TimesheetFormProps) {
  const [formData, setFormData] = useState({
    clockIn: shift.clockIn || '',
    clockOut: shift.clockOut || '',
    breakTime: '30',
    notes: ''
  });
  
  const [travelTo, setTravelTo] = useState(false);
  const [travelFrom, setTravelFrom] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Timesheet submitted:', { 
      ...formData, 
      shiftId: shift.id,
      travelTo,
      travelFrom,
      travelStipend: (travelTo ? travelConfig.amount : 0) + (travelFrom ? travelConfig.amount : 0)
    });
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateHours = () => {
    if (formData.clockIn && formData.clockOut) {
      const clockIn = new Date(`2024-01-01 ${formData.clockIn}`);
      const clockOut = new Date(`2024-01-01 ${formData.clockOut}`);
      const diff = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
      const breakHours = parseInt(formData.breakTime) / 60;
      return Math.max(0, diff - breakHours);
    }
    return 0;
  };

  const totalHours = calculateHours();
  const hourlyPay = totalHours * shift.hourlyRate;
  
  const calculateTravelPay = () => {
    let pay = 0;
    if (travelConfig.active) {
      if (travelTo) pay += travelConfig.amount;
      if (travelFrom) pay += travelConfig.amount;
    }
    return pay;
  };

  const travelPay = calculateTravelPay();
  const totalPay = hourlyPay + travelPay;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mobile-dialog-content max-w-md overflow-hidden flex flex-col">
        <DialogHeader className="mobile-dialog-header">
          <DialogTitle>Submit Timesheet</DialogTitle>
          <DialogDescription>
            Enter your actual work hours for this shift. 
            <span className="block mt-1 text-xs text-muted-foreground">
              Note: Overtime is not applicable for contractor shifts.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="mobile-dialog-body">
          <form id="timesheet-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clockIn">Clock In Time *</Label>
            <TimeInput
              id="clockIn"
              value={formData.clockIn}
              onChange={(value) => handleInputChange('clockIn', value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clockOut">Clock Out Time *</Label>
            <TimeInput
              id="clockOut"
              value={formData.clockOut}
              onChange={(value) => handleInputChange('clockOut', value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="breakTime">Break Time (minutes)</Label>
            <Input
              id="breakTime"
              type="number"
              value={formData.breakTime}
              onChange={(e) => handleInputChange('breakTime', e.target.value)}
              placeholder="30"
            />
          </div>

          {/* Travel Stipend Section */}
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-base font-semibold">Travel Stipend Eligibility</Label>
            <p className="text-xs text-muted-foreground -mt-1">
              Check applicable travel to/from venue. Each way adds ${travelConfig.amount.toFixed(2)}.
            </p>
            
            <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setTravelTo(!travelTo)}>
              <Checkbox 
                id="travelTo" 
                checked={travelTo}
                onCheckedChange={(c) => setTravelTo(!!c)}
                className="data-[state=checked]:bg-[#5E1916] data-[state=checked]:border-[#5E1916]"
              />
              <Label htmlFor="travelTo" className="cursor-pointer flex-1">
                Travel To Venue (+${travelConfig.amount.toFixed(2)})
              </Label>
            </div>

            <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setTravelFrom(!travelFrom)}>
              <Checkbox 
                id="travelFrom" 
                checked={travelFrom}
                onCheckedChange={(c) => setTravelFrom(!!c)}
                className="data-[state=checked]:bg-[#5E1916] data-[state=checked]:border-[#5E1916]"
              />
              <Label htmlFor="travelFrom" className="cursor-pointer flex-1">
                Travel From Venue (+${travelConfig.amount.toFixed(2)})
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes about this shift..."
              rows={3}
            />
          </div>

          <div className="bg-muted p-3 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Hours:</span>
              <span>{totalHours.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Hourly Rate:</span>
              <span>${shift.hourlyRate.toFixed(2)}</span>
            </div>
            
            {travelPay > 0 && (
              <div className="flex justify-between text-sm text-blue-700 font-medium">
                <span>Travel Stipend:</span>
                <span>+${travelPay.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between font-bold border-t border-gray-300 pt-2 mt-2 text-[#5E1916]">
              <span>Total Pay:</span>
              <span>${totalPay.toFixed(2)}</span>
            </div>
          </div>

          </form>
        </div>

        <div className="mobile-dialog-footer">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" form="timesheet-form" className="w-full sm:w-auto bg-[#5E1916] hover:bg-[#4a1210]">
              Submit Timesheet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}