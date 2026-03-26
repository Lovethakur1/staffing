import api from './api';

export interface SubmitReviewData {
  staffId: string;
  eventId: string;
  rating: number;
  feedback?: string;
}

export const reviewService = {
  // Submit a new review
  submitReview: async (data: SubmitReviewData) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  // Get reviews for a specific staff member
  getStaffReviews: async (staffId: string) => {
    const response = await api.get(`/reviews/staff/${staffId}`);
    return response.data;
  }
};
