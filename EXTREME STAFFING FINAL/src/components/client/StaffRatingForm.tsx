import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Star } from "lucide-react";
import { Event, mockStaff } from "../../data/mockData";

interface StaffRatingFormProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
}

export function StaffRatingForm({ isOpen, onClose, event }: StaffRatingFormProps) {
  const [ratings, setRatings] = useState<{[staffId: string]: {
    punctuality: number;
    professionalism: number;
    qualityOfWork: number;
    comments: string;
  }}>({});

  const handleRatingChange = (staffId: string, category: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [category]: rating
      }
    }));
  };

  const handleCommentsChange = (staffId: string, comments: string) => {
    setRatings(prev => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        comments
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Staff ratings submitted:', ratings);
    onClose();
  };

  const RatingStars = ({ 
    rating, 
    onRatingChange 
  }: { 
    rating: number; 
    onRatingChange: (rating: number) => void; 
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className="hover:scale-110 transition-transform"
        >
          <Star
            className={`h-5 w-5 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mobile-dialog-content max-w-2xl overflow-hidden flex flex-col">
        <DialogHeader className="mobile-dialog-header">
          <DialogTitle>Rate Staff Performance</DialogTitle>
          <DialogDescription>
            Rate the staff who worked at {event.title} on {event.date}
          </DialogDescription>
        </DialogHeader>

        <div className="mobile-dialog-body">
          <form id="rating-form" onSubmit={handleSubmit} className="space-y-6">
          {event.assignedStaff.map((staffId) => {
            const staff = mockStaff.find(s => s.id === staffId);
            if (!staff) return null;

            const staffRating = ratings[staffId] || {
              punctuality: 0,
              professionalism: 0,
              qualityOfWork: 0,
              comments: ''
            };

            return (
              <div key={staffId} className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium">{staff.name}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Punctuality</Label>
                    <RatingStars
                      rating={staffRating.punctuality}
                      onRatingChange={(rating) => 
                        handleRatingChange(staffId, 'punctuality', rating)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Professionalism</Label>
                    <RatingStars
                      rating={staffRating.professionalism}
                      onRatingChange={(rating) => 
                        handleRatingChange(staffId, 'professionalism', rating)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quality of Work</Label>
                    <RatingStars
                      rating={staffRating.qualityOfWork}
                      onRatingChange={(rating) => 
                        handleRatingChange(staffId, 'qualityOfWork', rating)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Comments</Label>
                  <Textarea
                    value={staffRating.comments}
                    onChange={(e) => handleCommentsChange(staffId, e.target.value)}
                    placeholder="Share your feedback about this staff member's performance..."
                    rows={3}
                  />
                </div>
              </div>
            );
          })}

          </form>
        </div>

        <div className="mobile-dialog-footer">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" form="rating-form" className="w-full sm:w-auto">
              Submit Ratings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}