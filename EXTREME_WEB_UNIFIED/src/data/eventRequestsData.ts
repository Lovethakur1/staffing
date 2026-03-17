// Removed mock data variables

export interface EventRequest {
  id: string;
  requestNumber: string;
  submittedDate: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany: string;
  eventName: string;
  eventType: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  estimatedGuests: number;
  totalStaffNeeded: number;
  favoritesSelected: number;
  selectedTiers: {
    role: string;
    tier: string;
    quantity: number;
  }[];
  totalPrice: number;
  specialRequirements?: string;
  cateringNeeded: boolean;
  equipmentNeeded: string[];
  validationStatus: {
    favoritesAvailable: boolean;
    tierStaffAvailable: boolean;
    noConflicts: boolean;
    pricingValid: boolean;
  };
  priority: "urgent" | "high" | "medium" | "low";
  status: "pending" | "under-review" | "approved" | "rejected" | "needs-modification";
  adminNotes?: string;
}

export const eventRequestsData: EventRequest[] = [];
