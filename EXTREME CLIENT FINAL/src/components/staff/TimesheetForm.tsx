import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Shift } from "../../data/mockData";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Timesheet submitted:', { ...formData, shiftId: shift.id });
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
  const totalPay = totalHours * shift.hourlyRate;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mobile-dialog-content max-w-md overflow-hidden flex flex-col">
        <DialogHeader className="mobile-dialog-header">
          <DialogTitle>Submit Timesheet</DialogTitle>
          <DialogDescription>
            Enter your actual work hours for this shift
          </DialogDescription>
        </DialogHeader>

        <div className="mobile-dialog-body">
          <form id="timesheet-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clockIn">Clock In Time *</Label>
            <Input
              id="clockIn"
              type="time"
              value={formData.clockIn}
              onChange={(e) => handleInputChange('clockIn', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clockOut">Clock Out Time *</Label>
            <Input
              id="clockOut"
              type="time"
              value={formData.clockOut}
              onChange={(e) => handleInputChange('clockOut', e.target.value)}
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

          {totalHours > 0 && (
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Total Hours:</span>
                <span>{totalHours.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Hourly Rate:</span>
                <span>${shift.hourlyRate}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-1 mt-1">
                <span>Total Pay:</span>
                <span>${totalPay.toFixed(2)}</span>
              </div>
            </div>
          )}

          </form>
        </div>

        <div className="mobile-dialog-footer">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" form="timesheet-form" className="w-full sm:w-auto">
              Submit Timesheet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}