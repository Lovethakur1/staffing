import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { TimeInput } from "../ui/time-input";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import api from "../../services/api";

interface EventBookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
}

export function EventBookingForm({ isOpen, onClose, clientId }: EventBookingFormProps) {
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    staffRequired: 1,
    budget: '',
    specialRequirements: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast.error("Please select an event date.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/events', {
        clientId,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        venue: formData.location,
        date: date.toISOString(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        staffRequired: formData.staffRequired,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        specialRequirements: formData.specialRequirements,
      });

      toast.success("Event booking request submitted successfully!");
      // Reset form
      setFormData({ title: '', description: '', location: '', startTime: '', endTime: '', staffRequired: 1, budget: '', specialRequirements: '' });
      setDate(undefined);
      onClose();
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || "Failed to submit booking. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mobile-dialog-content max-w-2xl overflow-hidden flex flex-col">
        <DialogHeader className="mobile-dialog-header">
          <DialogTitle>Book New Event</DialogTitle>
          <DialogDescription>
            Fill out the details for your event and we'll find the perfect staff for you.
          </DialogDescription>
        </DialogHeader>

        <div className="mobile-dialog-body">
          <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Corporate Gala 2024"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget *</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="5000"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your event..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Grand Hotel Ballroom, New York"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Event Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <TimeInput
                  id="startTime"
                  value={formData.startTime}
                  onChange={(value) => handleInputChange('startTime', value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <TimeInput
                  id="endTime"
                  value={formData.endTime}
                  onChange={(value) => handleInputChange('endTime', value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="staffRequired">Number of Staff Required *</Label>
              <Select
                value={formData.staffRequired.toString()}
                onValueChange={(value) => handleInputChange('staffRequired', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} Staff Member{num > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequirements">Special Requirements</Label>
              <Textarea
                id="specialRequirements"
                value={formData.specialRequirements}
                onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                placeholder="Black tie attire required, experience with formal dining service..."
                rows={3}
              />
            </div>

          </form>
        </div>

        <div className="mobile-dialog-footer">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" form="booking-form" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
