// Centralized event data for consistent use across the application
export interface EventData {
  id: string;
  name: string;
  client: string;
  clientId: string;
  date: string;
  time: string;
  startTime: string;
  endTime: string;
  duration: string;
  location: string;
  address: string;
  type: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'postponed';
  attendees: number;
  budget: number;
  staffRequired: number;
  staffAssigned: number;
  staffCheckedIn: number;
  rating?: number;
  description: string;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: 'paid' | 'partial' | 'pending' | 'overdue';
  specialRequirements: string[];
  clientEmail: string;
  clientPhone: string;
  clientCompany: string;
  clientRating: number;
  clientTotalEvents: number;
  postponementReason?: string;
  originalDate?: string;
  hasBreaks?: boolean;
  breakCount?: number;
  breakDuration?: number; // in minutes
}

export const eventData: EventData[] = [];
