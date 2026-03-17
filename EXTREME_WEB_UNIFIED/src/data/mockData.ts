// Mock data for the Event Staffing Management System

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'staff' | 'admin' | 'manager' | 'client' | 'sub-admin' | 'scheduler';
  avatar?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  clientId: string;
  managerId?: string;
  title: string;
  description: string;
  eventType?: string;
  venue?: string;
  date: string;
  startTime: string;
  endTime: string;
  time?: string;
  location: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  staffRequired: number;
  assignedStaff: string[];
  budget: number;
  deposit: number;
  tips?: number;
  specialRequirements?: string;
  requirements?: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  hourlyRate: number;
  rating: number;
  totalEvents: number;
  availability: { date: string; available: boolean }[];
  availabilityStatus: 'available' | 'busy' | 'unavailable';
  documents: { type: string; status: 'pending' | 'approved' | 'rejected' }[];
  isActive: boolean;
  joinDate: string;
}

export interface Shift {
  id: string;
  eventId: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'yet-to-start' | 'ongoing' | 'in-progress';
  clockIn?: string;
  clockOut?: string;
  location: string;
  role: string;
  hourlyRate: number;
  totalHours?: number;
  totalPay?: number;
  rate?: number; // For compatibility
}

export interface Rating {
  id: string;
  eventId: string;
  staffId: string;
  clientId: string;
  punctuality: number;
  professionalism: number;
  qualityOfWork: number;
  overall: number;
  comments: string;
  date: string;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  period: string;
  totalHours: number;
  grossPay: number;
  deductions: {
    insurance?: number;
    uniform?: number;
    other?: number;
  };
  netPay: number;
  status: 'pending' | 'processed' | 'paid';
  payDate?: string;
}

export interface PayStub {
  id: string;
  staffId: string;
  period: string;
  eventDetails: {
    eventId: string;
    eventName: string;
    date: string;
    hoursWorked: number;
    arrivedOnTime: boolean;
    minimumPayApplied?: boolean;
  }[];
  totalHours: number;
  regularPay: number;
  tips: number;
  deductions: {
    workersComp: number;
    uniform: number;
    parking: number;
    other: number;
  };
  grossPay: number;
  netPay: number;
  status: 'pending' | 'paid';
  payDate: string;
  downloadUrl?: string;
}

export interface StaffReview {
  id: string;
  staffId: string;
  eventId: string;
  clientId: string;
  clientName: string;
  eventName: string;
  date: string;
  venue: string;
  rating: number;
  review: string;
  isPositive: boolean;
  categories: {
    punctuality: number;
    professionalism: number;
    quality: number;
    communication: number;
  };
}

export interface TipRecord {
  id: string;
  staffId: string;
  eventId: string;
  clientName: string;
  eventName: string;
  date: string;
  venue: string;
  amount: number;
  payStubId: string;
}

export interface UnavailabilityRequest {
  id: string;
  staffId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  responseDate?: string;
}

export interface StaffDocument {
  id: string;
  staffId: string;
  type: 'id' | 'certification' | 'direct-deposit' | 'resume';
  fileName: string;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
  expiryDate?: string;
}

export interface TimesheetEntry {
  id: string;
  staffId: string;
  eventId: string;
  date: string;
  clockIn: string;
  clockOut: string;
  breakDuration: number;
  totalHours: number;
  location: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedBy?: string;
  notes?: string;
  auditLog: {
    action: string;
    by: string;
    at: string;
    changes: string;
  }[];
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'individual' | 'corporate';
  company?: string;
  address: string;
  creditLimit?: number;
  paymentTerms: string;
  preferredStaff: string[];
  favoriteEvents: FavoriteEvent[]; // Track events where staff were added to favorites
  totalEvents: number;
  totalSpent: number;
  rating: number;
  joinDate: string;
  isActive: boolean;
}

export interface FavoriteEvent {
  eventId: string;
  eventTitle: string;
  eventType: string;
  eventDate: string;
  staffIds: string[]; // All staff from this event that were marked as favorites
  addedDate: string; // When this event was marked as favorite
  rating: number; // Client's rating for this event
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  eventId: string;
  eventTitle: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  subtotal: number;
  serviceFee: number;
  tipAmount: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  lineItems: {
    description: string;
    quantity: number;
    rate: number;
    hours: number;
    amount: number;
  }[];
  paymentDate?: string;
  paymentMethod?: string;
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'staff-1',
    name: 'Emma Williams',
    email: 'emma.williams@email.com',
    phone: '+1-555-0125',
    role: 'staff',
    createdAt: '2024-01-10'
  },
  {
    id: 'staff-2',
    name: 'James Rodriguez',
    email: 'james.rodriguez@email.com',
    phone: '+1-555-0126',
    role: 'staff',
    createdAt: '2024-01-20'
  },
  {
    id: 'admin-1',
    name: 'Lisa Anderson',
    email: 'lisa@extremestaffing.com',
    phone: '+1-555-0127',
    role: 'admin',
    createdAt: '2024-01-01'
  },
  {
    id: 'manager-1',
    name: 'David Smith',
    email: 'david.smith@extremestaffing.com',
    phone: '+1-555-0128',
    role: 'manager',
    createdAt: '2024-01-05'
  },
  {
    id: 'subadmin-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@extremestaffing.com',
    phone: '+1-555-0129',
    role: 'sub-admin',
    createdAt: '2024-01-15'
  },
  {
    id: 'scheduler-1',
    name: 'Michael Chen',
    email: 'michael.chen@extremestaffing.com',
    phone: '+1-555-0130',
    role: 'scheduler',
    createdAt: '2024-02-01'
  },
  {
    id: 'client-1',
    name: 'Global Tech Solutions',
    email: 'contact@globaltech.com',
    phone: '+1-555-0201',
    role: 'client',
    createdAt: '2023-11-15'
  },
  {
    id: 'client-2',
    name: 'Elite Events Co.',
    email: 'planning@eliteevents.com',
    phone: '+1-555-0202',
    role: 'client',
    createdAt: '2023-12-01'
  }
];

// Mock Events
export const mockEvents: Event[] = [
  // Today's events (ongoing)
  {
    id: 'event-today-1',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Corporate Team Building Summit',
    description: 'Full-day corporate team building event with workshops, lunch, and networking sessions for 120 executives',
    eventType: 'Corporate Event',
    venue: 'Downtown Convention Center',
    date: new Date().toISOString().split('T')[0],
    time: '09:00 - 18:00',
    startTime: '09:00',
    endTime: '18:00',
    location: 'Downtown Convention Center, Los Angeles',
    status: 'confirmed',
    staffRequired: 12,
    assignedStaff: ['staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5', 'staff-6', 'staff-7', 'staff-8', 'staff-9', 'staff-10', 'staff-11', 'staff-12'],
    budget: 8500,
    deposit: 2550,
    tips: 450,
    specialRequirements: 'Professional business attire required, experience with corporate events, ability to handle VIP clients',
    requirements: 'Professional business attire required, experience with corporate events, ability to handle VIP clients'
  },
  {
    id: 'event-today-2',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Luxury Wedding Reception',
    description: 'Elegant wedding reception for 180 guests with 5-course dinner, open bar, and live entertainment',
    eventType: 'Wedding Reception',
    venue: 'Hilton Hotel Grand Ballroom',
    date: new Date().toISOString().split('T')[0],
    time: '16:00 - 23:00',
    startTime: '16:00',
    endTime: '23:00',
    location: 'Hilton Hotel Grand Ballroom, Beverly Hills',
    status: 'confirmed',
    staffRequired: 18,
    assignedStaff: ['staff-1', 'staff-3', 'staff-4', 'staff-5', 'staff-6', 'staff-7', 'staff-8', 'staff-9', 'staff-10', 'staff-11', 'staff-12', 'staff-13', 'staff-14', 'staff-15', 'staff-16', 'staff-17', 'staff-18', 'staff-19'],
    budget: 12500,
    deposit: 3750,
    tips: 800,
    specialRequirements: 'Black tie attire mandatory, fine dining service experience, knowledge of wine service protocols'
  },
  {
    id: 'event-today-3',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Annual Charity Gala',
    description: 'Prestigious charity fundraising gala with auction, dinner service, and entertainment for 250 guests',
    eventType: 'Charity Gala',
    venue: 'Four Seasons Ballroom',
    date: new Date().toISOString().split('T')[0],
    time: '18:00 - 24:00',
    startTime: '18:00',
    endTime: '24:00',
    location: 'Four Seasons Hotel Ballroom, Beverly Hills',
    status: 'confirmed',
    staffRequired: 25,
    assignedStaff: ['staff-2', 'staff-4', 'staff-6', 'staff-8', 'staff-10', 'staff-12', 'staff-14', 'staff-16', 'staff-18', 'staff-20', 'staff-21', 'staff-22', 'staff-23', 'staff-24', 'staff-25', 'staff-26', 'staff-27', 'staff-28', 'staff-29', 'staff-30', 'staff-31', 'staff-32', 'staff-33', 'staff-34', 'staff-35'],
    budget: 18000,
    deposit: 5400,
    tips: 1200,
    specialRequirements: 'Formal attire required, experience with high-end events, auction support experience preferred'
  },
  {
    id: 'event-today-4',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Tech Conference Exhibition',
    description: 'Large-scale technology conference with multiple breakout sessions, lunch service, and networking areas for 400 attendees',
    eventType: 'Conference',
    venue: 'LA Convention Center',
    date: '2025-12-21',
    time: '08:00 - 19:00',
    startTime: '08:00',
    endTime: '19:00',
    location: 'Los Angeles Convention Center, Hall B',
    status: 'confirmed',
    staffRequired: 35,
    assignedStaff: ['staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5', 'staff-6', 'staff-7', 'staff-8', 'staff-9', 'staff-10', 'staff-11', 'staff-12', 'staff-13', 'staff-14', 'staff-15', 'staff-16', 'staff-17', 'staff-18', 'staff-19', 'staff-20', 'staff-21', 'staff-22', 'staff-23', 'staff-24', 'staff-25', 'staff-26', 'staff-27', 'staff-28', 'staff-29', 'staff-30', 'staff-31', 'staff-32', 'staff-33', 'staff-34', 'staff-35'],
    budget: 25000,
    deposit: 7500,
    tips: 1500,
    specialRequirements: 'Business casual attire, tech industry knowledge helpful, crowd management experience'
  },
  {
    id: 'event-today-5',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Product Launch Party',
    description: 'High-energy product launch event with demonstrations, cocktail service, and media coverage for 150 industry professionals',
    eventType: 'Product Launch',
    venue: 'Rooftop Venue Downtown',
    date: '2025-12-21',
    time: '19:00 - 23:00',
    startTime: '19:00',
    endTime: '23:00',
    location: 'Rooftop Venue, Downtown Los Angeles',
    status: 'confirmed',
    staffRequired: 15,
    assignedStaff: ['staff-5', 'staff-10', 'staff-15', 'staff-20', 'staff-25', 'staff-30', 'staff-35', 'staff-36', 'staff-37', 'staff-38', 'staff-39', 'staff-40', 'staff-41', 'staff-42', 'staff-43'],
    budget: 9500,
    deposit: 2850,
    tips: 600,
    specialRequirements: 'Modern cocktail service experience, tech-savvy, comfortable working with media and influencers'
  },
  // Pending events
  {
    id: 'event-pending-1',
    clientId: 'client-2',
    title: 'Art Gallery Opening Reception',
    description: 'Sophisticated art gallery opening with wine tasting, catered appetizers, and guided tours for 80 art enthusiasts',
    eventType: 'Cultural Event',
    venue: 'The Getty Center Museum',
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '23:00',
    location: 'The Getty Center Museum, Los Angeles',
    status: 'pending',
    staffRequired: 3,
    assignedStaff: ['staff-1'],
    budget: 2800,
    deposit: 840,
    specialRequirements: 'Knowledge of art and culture preferred, ability to engage with sophisticated clientele, wine service experience'
  },
  {
    id: 'event-pending-2',
    clientId: 'client-1',
    title: 'Corporate Baseball Event',
    description: 'Corporate hospitality event in premium suites with catered meal and beverage service for 60 executives',
    eventType: 'Corporate Event',
    venue: 'Dodger Stadium Premium Suites',
    date: '2025-12-26',
    startTime: '14:00',
    endTime: '20:00',
    location: 'Dodger Stadium Premium Suites, Los Angeles',
    status: 'pending',
    staffRequired: 5,
    assignedStaff: ['staff-1', 'staff-2'],
    budget: 4200,
    deposit: 1260,
    specialRequirements: 'Sports venue experience preferred, ability to work in fast-paced environment, knowledge of baseball helpful'
  },
  {
    id: 'event-pending-3',
    clientId: 'client-2',
    title: 'Technology Conference',
    description: 'Three-day technology conference with registration, information desk, and attendee assistance for 500+ participants',
    eventType: 'Conference',
    venue: 'LA Convention Center Hall A',
    date: '2025-12-28',
    startTime: '10:00',
    endTime: '16:00',
    location: 'Los Angeles Convention Center, Hall A',
    status: 'pending',
    staffRequired: 8,
    assignedStaff: ['staff-1'],
    budget: 6500,
    deposit: 1950,
    specialRequirements: 'Experience with large events, excellent communication skills, technology familiarity preferred'
  },
  {
    id: 'event-pending-4',
    clientId: 'client-1',
    title: 'Michelin Star Dining Experience',
    description: 'Exclusive 7-course tasting menu dinner for 40 guests with wine pairings and meet-the-chef experience',
    eventType: 'Fine Dining',
    venue: 'Four Seasons Hotel Beverly Hills',
    date: '2025-12-30',
    startTime: '17:30',
    endTime: '22:30',
    location: 'Four Seasons Hotel Los Angeles at Beverly Hills',
    status: 'pending',
    staffRequired: 6,
    assignedStaff: ['staff-1'],
    budget: 7200,
    deposit: 2160,
    specialRequirements: 'Fine dining experience mandatory, knowledge of wine service, ability to work with celebrity chef'
  },
  {
    id: 'event-pending-5',
    clientId: 'client-2',
    title: 'Private Pool Party',
    description: 'Intimate poolside gathering for 25 guests with BBQ, cocktails, and live DJ entertainment',
    eventType: 'Private Party',
    venue: 'Malibu Private Estate',
    date: '2026-01-02',
    startTime: '11:00',
    endTime: '17:00',
    location: 'Malibu Private Estate, Pacific Palisades',
    status: 'pending',
    staffRequired: 4,
    assignedStaff: ['staff-1'],
    budget: 3500,
    deposit: 1050,
    specialRequirements: 'Pool area service experience, casual but professional attire, ability to work outdoors'
  },
  // Future confirmed events
  {
    id: 'event-future-1',
    clientId: 'client-1',
    title: 'Symphony Orchestra Performance',
    description: 'Classical music performance with pre-show reception and intermission service for 200 patrons',
    eventType: 'Cultural Event',
    venue: 'Walt Disney Concert Hall',
    date: '2025-12-22',
    startTime: '19:00',
    endTime: '23:00',
    location: 'Walt Disney Concert Hall, Downtown LA',
    status: 'confirmed',
    staffRequired: 8,
    assignedStaff: ['staff-1', 'staff-3'],
    budget: 3800,
    deposit: 1140,
    specialRequirements: 'Formal attire required, experience with upscale cultural events, quiet and discreet service'
  },
  {
    id: 'event-future-2',
    clientId: 'client-2',
    title: 'Beach Festival Setup',
    description: 'Outdoor music festival setup including vendor coordination, security, and crowd management for 1000+ attendees',
    eventType: 'Festival',
    venue: 'Venice Beach Boardwalk',
    date: '2025-12-24',
    startTime: '12:00',
    endTime: '18:00',
    location: 'Venice Beach Boardwalk Event Space',
    status: 'confirmed',
    staffRequired: 15,
    assignedStaff: ['staff-1', 'staff-2', 'staff-4'],
    budget: 9500,
    deposit: 2850,
    specialRequirements: 'Outdoor event experience, physical stamina required, crowd control experience preferred'
  },
  {
    id: 'event-future-3',
    clientId: 'client-1',
    title: 'Astronomy Lecture Series',
    description: 'Educational astronomy event with planetarium show and reception for 150 science enthusiasts',
    eventType: 'Educational Event',
    venue: 'Griffith Observatory',
    date: '2025-12-27',
    startTime: '08:00',
    endTime: '13:00',
    location: 'Griffith Observatory, Los Angeles',
    status: 'confirmed',
    staffRequired: 5,
    assignedStaff: ['staff-1', 'staff-5'],
    budget: 4100,
    deposit: 1230,
    specialRequirements: 'Interest in science preferred, ability to assist with educational activities, morning availability'
  },
  {
    id: 'event-future-4',
    clientId: 'client-2',
    title: 'Concert Series',
    description: 'Multi-artist concert event with concession sales, merchandise, and guest services for 2500+ attendees',
    eventType: 'Concert',
    venue: 'Hollywood Bowl',
    date: '2026-01-05',
    startTime: '15:00',
    endTime: '21:00',
    location: 'Hollywood Bowl, Hollywood Hills',
    status: 'confirmed',
    staffRequired: 20,
    assignedStaff: ['staff-1', 'staff-2', 'staff-3', 'staff-4'],
    budget: 12000,
    deposit: 3600,
    specialRequirements: 'Large venue experience, cash handling skills, ability to work in loud environment'
  },
  {
    id: 'event-future-5',
    clientId: 'client-1',
    title: 'Celebrity VIP Lounge',
    description: 'Exclusive VIP lounge service for 30 high-profile guests with premium bar and personal attention',
    eventType: 'VIP Event',
    venue: 'Sunset Strip Private Club',
    date: '2026-01-08',
    startTime: '20:00',
    endTime: '01:00',
    location: 'Sunset Strip Private Club, West Hollywood',
    status: 'confirmed',
    staffRequired: 3,
    assignedStaff: ['staff-1'],
    budget: 5500,
    deposit: 1650,
    tips: 800,
    specialRequirements: 'Discretion and confidentiality mandatory, VIP service experience, late night availability'
  },
  // Past completed events
  {
    id: 'event-completed-1',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Corporate Gala 2024',
    description: 'Annual corporate gala event with 200+ attendees',
    eventType: 'Corporate Event',
    venue: 'Grand Hotel Ballroom',
    date: '2024-12-15',
    startTime: '18:00',
    endTime: '23:00',
    location: 'Grand Hotel Ballroom, New York',
    status: 'completed',
    staffRequired: 12,
    assignedStaff: ['staff-1', 'staff-2', 'staff-3', 'staff-5', 'staff-7', 'staff-9', 'staff-11', 'staff-13', 'staff-15', 'staff-17', 'staff-19', 'staff-21'],
    budget: 9000,
    deposit: 2700,
    tips: 650,
    specialRequirements: 'Black tie attire required, experience with formal dining service'
  },
  {
    id: 'event-completed-2',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Wedding Reception',
    description: 'Elegant wedding reception for 150 guests',
    eventType: 'Wedding',
    venue: 'Sunset Gardens',
    date: '2024-12-20',
    startTime: '17:30',
    endTime: '23:30',
    location: 'Sunset Gardens, California',
    status: 'completed',
    staffRequired: 10,
    assignedStaff: ['staff-1', 'staff-4', 'staff-6', 'staff-8', 'staff-10', 'staff-12', 'staff-14', 'staff-16', 'staff-18', 'staff-20'],
    budget: 8500,
    deposit: 2550,
    tips: 580,
    specialRequirements: 'Experience with wedding service, clean background check required'
  },
  // Additional completed events for client-1
  {
    id: 'event-completed-21',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Corporate Awards Ceremony',
    description: 'Annual company awards ceremony with dinner and entertainment for 200 employees',
    eventType: 'Corporate Event',
    venue: 'Grand Ballroom Hotel',
    date: '2024-11-15',
    startTime: '18:00',
    endTime: '23:00',
    location: 'Grand Ballroom Hotel, Beverly Hills',
    status: 'completed',
    staffRequired: 15,
    assignedStaff: ['staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5', 'staff-6', 'staff-7', 'staff-8', 'staff-9', 'staff-10', 'staff-11', 'staff-12', 'staff-13', 'staff-14', 'staff-15'],
    budget: 12000,
    deposit: 3600,
    tips: 900,
    specialRequirements: 'Formal attire required, experience with award ceremonies'
  },
  {
    id: 'event-completed-22',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Product Launch Gala',
    description: 'High-profile product launch event with cocktail reception and presentations',
    eventType: 'Product Launch',
    venue: 'Modern Art Museum',
    date: '2024-10-28',
    startTime: '19:00',
    endTime: '22:00',
    location: 'Modern Art Museum, Los Angeles',
    status: 'completed',
    staffRequired: 8,
    assignedStaff: ['staff-1', 'staff-3', 'staff-5', 'staff-7', 'staff-9', 'staff-11', 'staff-13', 'staff-15'],
    budget: 7500,
    deposit: 2250,
    tips: 450,
    specialRequirements: 'Modern cocktail service, tech-savvy staff'
  },
  {
    id: 'event-completed-23',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Charity Fundraising Dinner',
    description: 'Elegant charity dinner with silent auction and guest speakers',
    eventType: 'Charity Event',
    venue: 'Country Club',
    date: '2024-09-20',
    startTime: '17:00',
    endTime: '22:00',
    location: 'Riviera Country Club, Pacific Palisades',
    status: 'completed',
    staffRequired: 12,
    assignedStaff: ['staff-2', 'staff-4', 'staff-6', 'staff-8', 'staff-10', 'staff-12', 'staff-14', 'staff-16', 'staff-18', 'staff-20', 'staff-22', 'staff-24'],
    budget: 9500,
    deposit: 2850,
    tips: 650,
    specialRequirements: 'Fine dining experience, auction support'
  },
  {
    id: 'event-completed-4',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Tech Conference Summit',
    description: 'Two-day technology conference with exhibition and networking',
    eventType: 'Conference',
    venue: 'Convention Center',
    date: '2024-08-15',
    startTime: '08:00',
    endTime: '18:00',
    location: 'Los Angeles Convention Center, Downtown',
    status: 'completed',
    staffRequired: 20,
    assignedStaff: ['staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5', 'staff-6', 'staff-7', 'staff-8', 'staff-9', 'staff-10', 'staff-11', 'staff-12', 'staff-13', 'staff-14', 'staff-15', 'staff-16', 'staff-17', 'staff-18', 'staff-19', 'staff-20'],
    budget: 15000,
    deposit: 4500,
    tips: 1000,
    specialRequirements: 'Tech industry knowledge, crowd management'
  },
  {
    id: 'event-completed-5',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Executive Board Meeting',
    description: 'High-level executive board meeting with lunch service',
    eventType: 'Corporate Meeting',
    venue: 'Executive Conference Room',
    date: '2024-07-10',
    startTime: '09:00',
    endTime: '16:00',
    location: 'Executive Tower, Century City',
    status: 'completed',
    staffRequired: 4,
    assignedStaff: ['staff-1', 'staff-3', 'staff-5', 'staff-7'],
    budget: 2800,
    deposit: 840,
    tips: 200,
    specialRequirements: 'Executive level service, confidentiality'
  },
  {
    id: 'event-completed-6',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Holiday Party Celebration',
    description: 'Company holiday party with dinner, dancing, and entertainment',
    eventType: 'Holiday Party',
    venue: 'Rooftop Venue',
    date: '2024-12-18',
    startTime: '18:00',
    endTime: '24:00',
    location: 'Sunset Strip Rooftop, West Hollywood',
    status: 'completed',
    staffRequired: 18,
    assignedStaff: ['staff-2', 'staff-4', 'staff-6', 'staff-8', 'staff-10', 'staff-12', 'staff-14', 'staff-16', 'staff-18', 'staff-20', 'staff-22', 'staff-24', 'staff-26', 'staff-28', 'staff-30', 'staff-32', 'staff-34', 'staff-36'],
    budget: 13500,
    deposit: 4050,
    tips: 850,
    specialRequirements: 'Holiday themed service, party atmosphere'
  },
  {
    id: 'event-completed-7',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Client Appreciation Event',
    description: 'VIP client appreciation event with wine tasting and gourmet dinner',
    eventType: 'Client Event',
    venue: 'Wine Estate',
    date: '2024-06-25',
    startTime: '17:00',
    endTime: '21:00',
    location: 'Malibu Wine Estate, Malibu',
    status: 'completed',
    staffRequired: 10,
    assignedStaff: ['staff-1', 'staff-5', 'staff-9', 'staff-13', 'staff-17', 'staff-21', 'staff-25', 'staff-29', 'staff-33', 'staff-37'],
    budget: 8000,
    deposit: 2400,
    tips: 500,
    specialRequirements: 'Wine service knowledge, VIP client handling'
  },
  {
    id: 'event-completed-8',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Fashion Show Gala',
    description: 'High-end fashion show with cocktail reception and runway service',
    eventType: 'Fashion Show',
    venue: 'Fashion District Venue',
    date: '2024-05-20',
    startTime: '19:00',
    endTime: '23:00',
    location: 'Fashion District Gallery, Downtown LA',
    status: 'completed',
    staffRequired: 14,
    assignedStaff: ['staff-2', 'staff-6', 'staff-10', 'staff-14', 'staff-18', 'staff-22', 'staff-26', 'staff-30', 'staff-34', 'staff-38', 'staff-40', 'staff-42', 'staff-44', 'staff-46'],
    budget: 10500,
    deposit: 3150,
    tips: 700,
    specialRequirements: 'Fashion industry experience, runway coordination'
  },
  {
    id: 'event-completed-9',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Investment Conference',
    description: 'Financial investment conference with networking and presentations',
    eventType: 'Financial Conference',
    venue: 'Business Center',
    date: '2024-04-15',
    startTime: '08:00',
    endTime: '17:00',
    location: 'Downtown Business Center, Los Angeles',
    status: 'completed',
    staffRequired: 16,
    assignedStaff: ['staff-1', 'staff-3', 'staff-5', 'staff-7', 'staff-9', 'staff-11', 'staff-13', 'staff-15', 'staff-17', 'staff-19', 'staff-21', 'staff-23', 'staff-25', 'staff-27', 'staff-29', 'staff-31'],
    budget: 11000,
    deposit: 3300,
    tips: 800,
    specialRequirements: 'Financial industry knowledge, professional attire'
  },
  {
    id: 'event-completed-10',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Art Auction Gala',
    description: 'Prestigious art auction with live bidding and champagne service',
    eventType: 'Art Auction',
    venue: 'Art Gallery',
    date: '2024-03-30',
    startTime: '18:00',
    endTime: '22:00',
    location: 'Getty Center, Los Angeles',
    status: 'completed',
    staffRequired: 11,
    assignedStaff: ['staff-2', 'staff-4', 'staff-8', 'staff-12', 'staff-16', 'staff-20', 'staff-24', 'staff-28', 'staff-32', 'staff-36', 'staff-40'],
    budget: 9000,
    deposit: 2700,
    tips: 600,
    specialRequirements: 'Art knowledge helpful, auction support experience'
  },
  {
    id: 'event-completed-11',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Medical Conference Symposium',
    description: 'Medical professionals conference with continuing education sessions',
    eventType: 'Medical Conference',
    venue: 'Medical Center',
    date: '2024-02-28',
    startTime: '07:00',
    endTime: '18:00',
    location: 'UCLA Medical Center, Westwood',
    status: 'completed',
    staffRequired: 22,
    assignedStaff: ['staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5', 'staff-6', 'staff-7', 'staff-8', 'staff-9', 'staff-10', 'staff-11', 'staff-12', 'staff-13', 'staff-14', 'staff-15', 'staff-16', 'staff-17', 'staff-18', 'staff-19', 'staff-20', 'staff-21', 'staff-22'],
    budget: 16500,
    deposit: 4950,
    tips: 1100,
    specialRequirements: 'Medical industry familiarity, long hours capability'
  },
  {
    id: 'event-completed-12',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Real Estate Open House',
    description: 'Luxury real estate showcase with champagne reception',
    eventType: 'Real Estate Event',
    venue: 'Luxury Property',
    date: '2024-01-25',
    startTime: '14:00',
    endTime: '18:00',
    location: 'Beverly Hills Mansion, Beverly Hills',
    status: 'completed',
    staffRequired: 6,
    assignedStaff: ['staff-1', 'staff-7', 'staff-13', 'staff-19', 'staff-25', 'staff-31'],
    budget: 4500,
    deposit: 1350,
    tips: 300,
    specialRequirements: 'Luxury service experience, property knowledge'
  },
  {
    id: 'event-completed-13',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Sports Awards Banquet',
    description: 'Annual sports awards banquet with athlete recognition ceremony',
    eventType: 'Sports Event',
    venue: 'Sports Club',
    date: '2024-12-05',
    startTime: '18:00',
    endTime: '22:00',
    location: 'Los Angeles Athletic Club, Downtown',
    status: 'completed',
    staffRequired: 13,
    assignedStaff: ['staff-3', 'staff-6', 'staff-9', 'staff-12', 'staff-15', 'staff-18', 'staff-21', 'staff-24', 'staff-27', 'staff-30', 'staff-33', 'staff-36', 'staff-39'],
    budget: 9800,
    deposit: 2940,
    tips: 650,
    specialRequirements: 'Sports industry knowledge, athlete interaction'
  },
  {
    id: 'event-completed-14',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Book Launch Party',
    description: 'Literary book launch with author reading and book signing',
    eventType: 'Book Launch',
    venue: 'Literary Venue',
    date: '2024-11-08',
    startTime: '19:00',
    endTime: '21:30',
    location: 'Last Bookstore, Downtown LA',
    status: 'completed',
    staffRequired: 5,
    assignedStaff: ['staff-2', 'staff-8', 'staff-14', 'staff-20', 'staff-26'],
    budget: 3200,
    deposit: 960,
    tips: 250,
    specialRequirements: 'Literary event experience, quiet service'
  },
  {
    id: 'event-completed-15',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Gaming Tournament Finals',
    description: 'Esports gaming tournament with live streaming and audience',
    eventType: 'Gaming Event',
    venue: 'Gaming Arena',
    date: '2024-10-12',
    startTime: '12:00',
    endTime: '20:00',
    location: 'HyperX Esports Arena, Las Vegas',
    status: 'completed',
    staffRequired: 17,
    assignedStaff: ['staff-1', 'staff-4', 'staff-7', 'staff-10', 'staff-13', 'staff-16', 'staff-19', 'staff-22', 'staff-25', 'staff-28', 'staff-31', 'staff-34', 'staff-37', 'staff-40', 'staff-43', 'staff-46', 'staff-49'],
    budget: 12500,
    deposit: 3750,
    tips: 850,
    specialRequirements: 'Gaming industry knowledge, tech-savvy'
  },
  {
    id: 'event-completed-16',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Culinary Festival',
    description: 'Food and wine festival with multiple chef stations',
    eventType: 'Food Festival',
    venue: 'Outdoor Venue',
    date: '2024-09-14',
    startTime: '11:00',
    endTime: '19:00',
    location: 'Santa Monica Pier, Santa Monica',
    status: 'completed',
    staffRequired: 25,
    assignedStaff: ['staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5', 'staff-6', 'staff-7', 'staff-8', 'staff-9', 'staff-10', 'staff-11', 'staff-12', 'staff-13', 'staff-14', 'staff-15', 'staff-16', 'staff-17', 'staff-18', 'staff-19', 'staff-20', 'staff-21', 'staff-22', 'staff-23', 'staff-24', 'staff-25'],
    budget: 18000,
    deposit: 5400,
    tips: 1200,
    specialRequirements: 'Food service experience, outdoor event capability'
  },
  {
    id: 'event-completed-17',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Music Album Release Party',
    description: 'Record label album release party with live performance',
    eventType: 'Music Event',
    venue: 'Music Venue',
    date: '2024-08-22',
    startTime: '20:00',
    endTime: '24:00',
    location: 'The Troubadour, West Hollywood',
    status: 'completed',
    staffRequired: 9,
    assignedStaff: ['staff-3', 'staff-9', 'staff-15', 'staff-21', 'staff-27', 'staff-33', 'staff-39', 'staff-45', 'staff-47'],
    budget: 6500,
    deposit: 1950,
    tips: 450,
    specialRequirements: 'Music venue experience, late night capability'
  },
  {
    id: 'event-completed-18',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Film Premiere Gala',
    description: 'Movie premiere with red carpet and after-party reception',
    eventType: 'Film Premiere',
    venue: 'Theater Complex',
    date: '2024-07-18',
    startTime: '18:00',
    endTime: '23:00',
    location: 'TCL Chinese Theatre, Hollywood',
    status: 'completed',
    staffRequired: 19,
    assignedStaff: ['staff-2', 'staff-5', 'staff-8', 'staff-11', 'staff-14', 'staff-17', 'staff-20', 'staff-23', 'staff-26', 'staff-29', 'staff-32', 'staff-35', 'staff-38', 'staff-41', 'staff-44', 'staff-47', 'staff-48', 'staff-49', 'staff-50'],
    budget: 14500,
    deposit: 4350,
    tips: 950,
    specialRequirements: 'Red carpet experience, celebrity interaction'
  },
  {
    id: 'event-completed-19',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Wellness Retreat Workshop',
    description: 'Corporate wellness retreat with mindfulness and yoga sessions',
    eventType: 'Wellness Event',
    venue: 'Retreat Center',
    date: '2024-06-10',
    startTime: '09:00',
    endTime: '17:00',
    location: 'Malibu Wellness Center, Malibu',
    status: 'completed',
    staffRequired: 7,
    assignedStaff: ['staff-1', 'staff-8', 'staff-15', 'staff-22', 'staff-29', 'staff-36', 'staff-43'],
    budget: 5500,
    deposit: 1650,
    tips: 350,
    specialRequirements: 'Wellness industry knowledge, calming presence'
  },
  {
    id: 'event-completed-20',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Graduation Ceremony',
    description: 'University graduation ceremony with family reception',
    eventType: 'Graduation',
    venue: 'University Campus',
    date: '2024-05-15',
    startTime: '10:00',
    endTime: '16:00',
    location: 'UCLA Campus, Westwood',
    status: 'completed',
    staffRequired: 21,
    assignedStaff: ['staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5', 'staff-6', 'staff-7', 'staff-8', 'staff-9', 'staff-10', 'staff-11', 'staff-12', 'staff-13', 'staff-14', 'staff-15', 'staff-16', 'staff-17', 'staff-18', 'staff-19', 'staff-20', 'staff-21'],
    budget: 15500,
    deposit: 4650,
    tips: 1000,
    specialRequirements: 'Academic event experience, family-friendly service'
  },
  {
    id: 'event-completed-24-trade',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Trade Show Exhibition',
    description: 'Industry trade show with booth setup and networking',
    eventType: 'Trade Show',
    venue: 'Exhibition Hall',
    date: '2024-04-25',
    startTime: '08:00',
    endTime: '18:00',
    location: 'Anaheim Convention Center, Anaheim',
    status: 'completed',
    staffRequired: 24,
    assignedStaff: ['staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5', 'staff-6', 'staff-7', 'staff-8', 'staff-9', 'staff-10', 'staff-11', 'staff-12', 'staff-13', 'staff-14', 'staff-15', 'staff-16', 'staff-17', 'staff-18', 'staff-19', 'staff-20', 'staff-21', 'staff-22', 'staff-23', 'staff-24'],
    budget: 17000,
    deposit: 5100,
    tips: 1150,
    specialRequirements: 'Trade show experience, booth management'
  },
  {
    id: 'event-completed-25-bridal',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Bridal Shower Brunch',
    description: 'Elegant bridal shower with brunch service and activities',
    eventType: 'Bridal Shower',
    venue: 'Garden Venue',
    date: '2024-03-20',
    startTime: '11:00',
    endTime: '15:00',
    location: 'Beverly Hills Garden Club, Beverly Hills',
    status: 'completed',
    staffRequired: 8,
    assignedStaff: ['staff-2', 'staff-6', 'staff-12', 'staff-18', 'staff-24', 'staff-30', 'staff-36', 'staff-42'],
    budget: 6000,
    deposit: 1800,
    tips: 400,
    specialRequirements: 'Bridal event experience, elegant service'
  },
  {
    id: 'event-completed-26-training',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Corporate Training Seminar',
    description: 'Multi-day corporate training with catering and materials',
    eventType: 'Training Seminar',
    venue: 'Training Center',
    date: '2024-02-14',
    startTime: '08:00',
    endTime: '17:00',
    location: 'Corporate Training Center, Century City',
    status: 'completed',
    staffRequired: 12,
    assignedStaff: ['staff-1', 'staff-5', 'staff-9', 'staff-13', 'staff-17', 'staff-21', 'staff-25', 'staff-29', 'staff-33', 'staff-37', 'staff-41', 'staff-45'],
    budget: 9200,
    deposit: 2760,
    tips: 620,
    specialRequirements: 'Corporate training experience, professional demeanor'
  },
  {
    id: 'event-completed-24',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Anniversary Celebration',
    description: 'Golden anniversary celebration with family dinner',
    eventType: 'Anniversary',
    venue: 'Private Residence',
    date: '2024-01-18',
    startTime: '17:00',
    endTime: '21:00',
    location: 'Private Estate, Bel Air',
    status: 'completed',
    staffRequired: 6,
    assignedStaff: ['staff-3', 'staff-9', 'staff-15', 'staff-21', 'staff-27', 'staff-33'],
    budget: 4800,
    deposit: 1440,
    tips: 320,
    specialRequirements: 'Private residence experience, family event expertise'
  },
  {
    id: 'event-completed-25',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'International Summit',
    description: 'Global business summit with diplomatic protocol',
    eventType: 'International Event',
    venue: 'Diplomatic Center',
    date: '2024-12-08',
    startTime: '09:00',
    endTime: '18:00',
    location: 'World Trade Center, Los Angeles',
    status: 'completed',
    staffRequired: 28,
    assignedStaff: ['staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5', 'staff-6', 'staff-7', 'staff-8', 'staff-9', 'staff-10', 'staff-11', 'staff-12', 'staff-13', 'staff-14', 'staff-15', 'staff-16', 'staff-17', 'staff-18', 'staff-19', 'staff-20', 'staff-21', 'staff-22', 'staff-23', 'staff-24', 'staff-25', 'staff-26', 'staff-27', 'staff-28'],
    budget: 22000,
    deposit: 6600,
    tips: 1500,
    specialRequirements: 'International protocol knowledge, multilingual preferred'
  },
  {
    id: 'event-completed-26',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Startup Pitch Competition',
    description: 'Entrepreneurship pitch competition with investor networking',
    eventType: 'Startup Event',
    venue: 'Innovation Hub',
    date: '2024-11-22',
    startTime: '14:00',
    endTime: '20:00',
    location: 'Silicon Beach Innovation Hub, Santa Monica',
    status: 'completed',
    staffRequired: 10,
    assignedStaff: ['staff-4', 'staff-8', 'staff-12', 'staff-16', 'staff-20', 'staff-24', 'staff-28', 'staff-32', 'staff-36', 'staff-40'],
    budget: 7800,
    deposit: 2340,
    tips: 520,
    specialRequirements: 'Startup ecosystem knowledge, networking facilitation'
  },
  {
    id: 'event-completed-27',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Design Awards Ceremony',
    description: 'Annual design awards with exhibition and networking',
    eventType: 'Design Event',
    venue: 'Design Center',
    date: '2024-10-30',
    startTime: '18:00',
    endTime: '22:00',
    location: 'Pacific Design Center, West Hollywood',
    status: 'completed',
    staffRequired: 14,
    assignedStaff: ['staff-1', 'staff-6', 'staff-11', 'staff-16', 'staff-21', 'staff-26', 'staff-31', 'staff-36', 'staff-41', 'staff-46', 'staff-48', 'staff-49', 'staff-50', 'staff-47'],
    budget: 10200,
    deposit: 3060,
    tips: 680,
    specialRequirements: 'Design industry knowledge, aesthetic appreciation'
  },
  {
    id: 'event-completed-28',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Automotive Showcase',
    description: 'Luxury car showcase with test drives and presentations',
    eventType: 'Automotive Event',
    venue: 'Showroom',
    date: '2024-09-25',
    startTime: '10:00',
    endTime: '18:00',
    location: 'Beverly Hills Luxury Auto Gallery, Beverly Hills',
    status: 'completed',
    staffRequired: 16,
    assignedStaff: ['staff-2', 'staff-5', 'staff-8', 'staff-11', 'staff-14', 'staff-17', 'staff-20', 'staff-23', 'staff-26', 'staff-29', 'staff-32', 'staff-35', 'staff-38', 'staff-41', 'staff-44', 'staff-47'],
    budget: 11800,
    deposit: 3540,
    tips: 790,
    specialRequirements: 'Automotive knowledge, luxury service experience'
  },
  {
    id: 'event-completed-29',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Environmental Conference',
    description: 'Sustainability conference with eco-friendly catering',
    eventType: 'Environmental Event',
    venue: 'Green Building',
    date: '2024-08-28',
    startTime: '09:00',
    endTime: '17:00',
    location: 'LEED Certified Conference Center, Santa Monica',
    status: 'completed',
    staffRequired: 18,
    assignedStaff: ['staff-1', 'staff-3', 'staff-5', 'staff-7', 'staff-9', 'staff-11', 'staff-13', 'staff-15', 'staff-17', 'staff-19', 'staff-21', 'staff-23', 'staff-25', 'staff-27', 'staff-29', 'staff-31', 'staff-33', 'staff-35'],
    budget: 13200,
    deposit: 3960,
    tips: 880,
    specialRequirements: 'Environmental awareness, sustainable practices'
  },
  {
    id: 'event-completed-30',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Gaming Industry Awards',
    description: 'Video game industry awards ceremony with live streaming',
    eventType: 'Gaming Awards',
    venue: 'Theater',
    date: '2024-07-20',
    startTime: '19:00',
    endTime: '23:00',
    location: 'Microsoft Theater, Downtown LA',
    status: 'completed',
    staffRequired: 22,
    assignedStaff: ['staff-2', 'staff-4', 'staff-6', 'staff-8', 'staff-10', 'staff-12', 'staff-14', 'staff-16', 'staff-18', 'staff-20', 'staff-22', 'staff-24', 'staff-26', 'staff-28', 'staff-30', 'staff-32', 'staff-34', 'staff-36', 'staff-38', 'staff-40', 'staff-42', 'staff-44'],
    budget: 16800,
    deposit: 5040,
    tips: 1120,
    specialRequirements: 'Gaming industry familiarity, live stream coordination'
  },
  {
    id: 'event-completed-31',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Pharmaceutical Launch',
    description: 'Medical product launch with healthcare professionals',
    eventType: 'Medical Event',
    venue: 'Medical Center',
    date: '2024-06-15',
    startTime: '08:00',
    endTime: '16:00',
    location: 'Cedars-Sinai Medical Center, West Hollywood',
    status: 'completed',
    staffRequired: 15,
    assignedStaff: ['staff-1', 'staff-4', 'staff-7', 'staff-10', 'staff-13', 'staff-16', 'staff-19', 'staff-22', 'staff-25', 'staff-28', 'staff-31', 'staff-34', 'staff-37', 'staff-40', 'staff-43'],
    budget: 11500,
    deposit: 3450,
    tips: 770,
    specialRequirements: 'Medical industry knowledge, HIPAA awareness'
  },
  {
    id: 'event-completed-32',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Architecture Exhibition',
    description: 'Modern architecture exhibition with guided tours',
    eventType: 'Architecture Event',
    venue: 'Museum',
    date: '2024-05-22',
    startTime: '10:00',
    endTime: '18:00',
    location: 'Museum of Contemporary Art, Downtown LA',
    status: 'completed',
    staffRequired: 11,
    assignedStaff: ['staff-3', 'staff-7', 'staff-11', 'staff-15', 'staff-19', 'staff-23', 'staff-27', 'staff-31', 'staff-35', 'staff-39', 'staff-43'],
    budget: 8500,
    deposit: 2550,
    tips: 570,
    specialRequirements: 'Architecture knowledge, museum experience'
  },
  {
    id: 'event-completed-33',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Robotics Competition',
    description: 'Student robotics competition with family viewing',
    eventType: 'Educational Event',
    venue: 'School Gymnasium',
    date: '2024-04-28',
    startTime: '09:00',
    endTime: '17:00',
    location: 'UCLA Engineering Building, Westwood',
    status: 'completed',
    staffRequired: 13,
    assignedStaff: ['staff-2', 'staff-6', 'staff-10', 'staff-14', 'staff-18', 'staff-22', 'staff-26', 'staff-30', 'staff-34', 'staff-38', 'staff-42', 'staff-46', 'staff-50'],
    budget: 9600,
    deposit: 2880,
    tips: 640,
    specialRequirements: 'Educational event experience, family-friendly'
  },
  {
    id: 'event-completed-34',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Wine Tasting Gala',
    description: 'Premium wine tasting with sommelier presentations',
    eventType: 'Wine Event',
    venue: 'Winery',
    date: '2024-03-25',
    startTime: '18:00',
    endTime: '22:00',
    location: 'Malibu Family Wines, Malibu',
    status: 'completed',
    staffRequired: 9,
    assignedStaff: ['staff-1', 'staff-8', 'staff-15', 'staff-22', 'staff-29', 'staff-36', 'staff-43', 'staff-48', 'staff-49'],
    budget: 7200,
    deposit: 2160,
    tips: 480,
    specialRequirements: 'Wine service expertise, sommelier knowledge'
  },
  {
    id: 'event-completed-35',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Digital Marketing Summit',
    description: 'Digital marketing conference with tech demonstrations',
    eventType: 'Marketing Event',
    venue: 'Tech Campus',
    date: '2024-02-20',
    startTime: '09:00',
    endTime: '18:00',
    location: 'Google Campus, Venice',
    status: 'completed',
    staffRequired: 20,
    assignedStaff: ['staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5', 'staff-6', 'staff-7', 'staff-8', 'staff-9', 'staff-10', 'staff-11', 'staff-12', 'staff-13', 'staff-14', 'staff-15', 'staff-16', 'staff-17', 'staff-18', 'staff-19', 'staff-20'],
    budget: 14800,
    deposit: 4440,
    tips: 990,
    specialRequirements: 'Tech industry knowledge, digital marketing familiarity'
  },
  {
    id: 'event-completed-36',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Luxury Yacht Party',
    description: 'Exclusive yacht party with ocean views and gourmet service',
    eventType: 'Yacht Event',
    venue: 'Private Yacht',
    date: '2024-01-15',
    startTime: '16:00',
    endTime: '21:00',
    location: 'Marina del Rey Harbor, Marina del Rey',
    status: 'completed',
    staffRequired: 12,
    assignedStaff: ['staff-5', 'staff-10', 'staff-15', 'staff-20', 'staff-25', 'staff-30', 'staff-35', 'staff-40', 'staff-45', 'staff-47', 'staff-48', 'staff-49'],
    budget: 10500,
    deposit: 3150,
    tips: 700,
    specialRequirements: 'Yacht service experience, maritime safety knowledge'
  },
  {
    id: 'event-completed-37',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Crypto Currency Conference',
    description: 'Blockchain and cryptocurrency educational conference',
    eventType: 'Crypto Event',
    venue: 'Financial District',
    date: '2024-12-12',
    startTime: '10:00',
    endTime: '18:00',
    location: 'JPMorgan Chase Building, Downtown LA',
    status: 'completed',
    staffRequired: 17,
    assignedStaff: ['staff-3', 'staff-6', 'staff-9', 'staff-12', 'staff-15', 'staff-18', 'staff-21', 'staff-24', 'staff-27', 'staff-30', 'staff-33', 'staff-36', 'staff-39', 'staff-42', 'staff-45', 'staff-48', 'staff-50'],
    budget: 12800,
    deposit: 3840,
    tips: 850,
    specialRequirements: 'Financial technology knowledge, security awareness'
  },
  {
    id: 'event-completed-38',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Fitness Industry Expo',
    description: 'Health and fitness exposition with equipment demonstrations',
    eventType: 'Fitness Event',
    venue: 'Convention Center',
    date: '2024-11-18',
    startTime: '08:00',
    endTime: '19:00',
    location: 'Long Beach Convention Center, Long Beach',
    status: 'completed',
    staffRequired: 26,
    assignedStaff: ['staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5', 'staff-6', 'staff-7', 'staff-8', 'staff-9', 'staff-10', 'staff-11', 'staff-12', 'staff-13', 'staff-14', 'staff-15', 'staff-16', 'staff-17', 'staff-18', 'staff-19', 'staff-20', 'staff-21', 'staff-22', 'staff-23', 'staff-24', 'staff-25', 'staff-26'],
    budget: 19500,
    deposit: 5850,
    tips: 1300,
    specialRequirements: 'Fitness industry knowledge, physical stamina'
  },
  {
    id: 'event-completed-39',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Legal Conference Symposium',
    description: 'Legal professionals conference with continuing education',
    eventType: 'Legal Event',
    venue: 'Law Center',
    date: '2024-10-25',
    startTime: '08:00',
    endTime: '17:00',
    location: 'UCLA Law School, Westwood',
    status: 'completed',
    staffRequired: 19,
    assignedStaff: ['staff-2', 'staff-4', 'staff-6', 'staff-8', 'staff-10', 'staff-12', 'staff-14', 'staff-16', 'staff-18', 'staff-20', 'staff-22', 'staff-24', 'staff-26', 'staff-28', 'staff-30', 'staff-32', 'staff-34', 'staff-36', 'staff-38'],
    budget: 14200,
    deposit: 4260,
    tips: 950,
    specialRequirements: 'Legal industry familiarity, professional discretion'
  },
  {
    id: 'event-completed-40',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Space Technology Showcase',
    description: 'Aerospace technology exhibition with industry leaders',
    eventType: 'Aerospace Event',
    venue: 'Science Center',
    date: '2024-09-30',
    startTime: '09:00',
    endTime: '18:00',
    location: 'California Science Center, Downtown LA',
    status: 'completed',
    staffRequired: 23,
    assignedStaff: ['staff-1', 'staff-3', 'staff-5', 'staff-7', 'staff-9', 'staff-11', 'staff-13', 'staff-15', 'staff-17', 'staff-19', 'staff-21', 'staff-23', 'staff-25', 'staff-27', 'staff-29', 'staff-31', 'staff-33', 'staff-35', 'staff-37', 'staff-39', 'staff-41', 'staff-43', 'staff-45'],
    budget: 17800,
    deposit: 5340,
    tips: 1190,
    specialRequirements: 'Science/technology background, space industry knowledge'
  },
  {
    id: 'event-completed-41',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Luxury Brand Launch',
    description: 'High-end fashion brand launch with celebrity attendance',
    eventType: 'Luxury Event',
    venue: 'Luxury Hotel',
    date: '2024-08-18',
    startTime: '19:00',
    endTime: '23:00',
    location: 'The Peninsula Beverly Hills, Beverly Hills',
    status: 'completed',
    staffRequired: 16,
    assignedStaff: ['staff-2', 'staff-6', 'staff-10', 'staff-14', 'staff-18', 'staff-22', 'staff-26', 'staff-30', 'staff-34', 'staff-38', 'staff-42', 'staff-46', 'staff-47', 'staff-48', 'staff-49', 'staff-50'],
    budget: 13500,
    deposit: 4050,
    tips: 900,
    specialRequirements: 'Luxury service expertise, celebrity interaction experience'
  },
  {
    id: 'event-completed-42',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'Children\'s Charity Fundraiser',
    description: 'Family-friendly charity event with children\'s activities',
    eventType: 'Charity Event',
    venue: 'Community Center',
    date: '2024-07-25',
    startTime: '10:00',
    endTime: '16:00',
    location: 'Santa Monica Community Center, Santa Monica',
    status: 'completed',
    staffRequired: 14,
    assignedStaff: ['staff-1', 'staff-5', 'staff-9', 'staff-13', 'staff-17', 'staff-21', 'staff-25', 'staff-29', 'staff-33', 'staff-37', 'staff-41', 'staff-45', 'staff-48', 'staff-49'],
    budget: 10800,
    deposit: 3240,
    tips: 720,
    specialRequirements: 'Family event experience, child safety awareness'
  },
  {
    id: 'event-completed-43',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Energy Summit Conference',
    description: 'Renewable energy conference with sustainability focus',
    eventType: 'Energy Event',
    venue: 'Green Building',
    date: '2024-06-28',
    startTime: '08:00',
    endTime: '17:00',
    location: 'Solar Power Convention Center, Los Angeles',
    status: 'completed',
    staffRequired: 21,
    assignedStaff: ['staff-2', 'staff-4', 'staff-6', 'staff-8', 'staff-10', 'staff-12', 'staff-14', 'staff-16', 'staff-18', 'staff-20', 'staff-22', 'staff-24', 'staff-26', 'staff-28', 'staff-30', 'staff-32', 'staff-34', 'staff-36', 'staff-38', 'staff-40', 'staff-42'],
    budget: 15800,
    deposit: 4740,
    tips: 1050,
    specialRequirements: 'Environmental awareness, energy industry knowledge'
  },
  {
    id: 'event-completed-44',
    clientId: 'client-1',
    managerId: 'manager-2',
    title: 'International Food Festival',
    description: 'Multi-cultural food festival with diverse cuisine stations',
    eventType: 'Cultural Event',
    venue: 'Cultural Center',
    date: '2024-05-30',
    startTime: '12:00',
    endTime: '20:00',
    location: 'Los Angeles Cultural Center, Downtown LA',
    status: 'completed',
    staffRequired: 27,
    assignedStaff: ['staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5', 'staff-6', 'staff-7', 'staff-8', 'staff-9', 'staff-10', 'staff-11', 'staff-12', 'staff-13', 'staff-14', 'staff-15', 'staff-16', 'staff-17', 'staff-18', 'staff-19', 'staff-20', 'staff-21', 'staff-22', 'staff-23', 'staff-24', 'staff-25', 'staff-26', 'staff-27'],
    budget: 20500,
    deposit: 6150,
    tips: 1370,
    specialRequirements: 'Multi-cultural awareness, food service expertise'
  },
  {
    id: 'event-completed-45',
    clientId: 'client-1',
    managerId: 'manager-1',
    title: 'Innovation Awards Gala',
    description: 'Technology innovation awards with startup showcases',
    eventType: 'Innovation Event',
    venue: 'Tech Hub',
    date: '2024-04-22',
    startTime: '18:00',
    endTime: '22:00',
    location: 'Innovation District, Santa Monica',
    status: 'completed',
    staffRequired: 18,
    assignedStaff: ['staff-3', 'staff-6', 'staff-9', 'staff-12', 'staff-15', 'staff-18', 'staff-21', 'staff-24', 'staff-27', 'staff-30', 'staff-33', 'staff-36', 'staff-39', 'staff-42', 'staff-45', 'staff-47', 'staff-48', 'staff-50'],
    budget: 13800,
    deposit: 4140,
    tips: 920,
    specialRequirements: 'Innovation mindset, technology familiarity'
  }
];

// Mock Staff
export const mockStaff: Staff[] = [
  {
    id: 'staff-1',
    name: 'Emma Williams',
    email: 'emma.williams@email.com',
    phone: '+1-555-0125',
    location: 'New York, NY',
    skills: ['Bartending', 'Fine Dining Service', 'Event Setup', 'Customer Service'],
    hourlyRate: 25,
    rating: 4.8,
    totalEvents: 45,
    availability: [
      { date: '2024-10-15', available: true },
      { date: '2024-10-16', available: false },
      { date: '2024-10-17', available: true }
    ],
    availabilityStatus: 'available',
    documents: [
      { type: 'ID', status: 'approved' },
      { type: 'Food Handler License', status: 'approved' },
      { type: 'Background Check', status: 'pending' }
    ],
    isActive: true,
    joinDate: '2024-01-10'
  },
  {
    id: 'staff-2',
    name: 'James Rodriguez',
    email: 'james.rodriguez@email.com',
    phone: '+1-555-0126',
    location: 'Los Angeles, CA',
    skills: ['Security', 'Crowd Control', 'VIP Service', 'Emergency Response'],
    hourlyRate: 30,
    rating: 4.9,
    totalEvents: 38,
    availability: [
      { date: '2024-10-15', available: true },
      { date: '2024-10-16', available: true },
      { date: '2024-10-17', available: false }
    ],
    availabilityStatus: 'available',
    documents: [
      { type: 'ID', status: 'approved' },
      { type: 'Security License', status: 'approved' },
      { type: 'Background Check', status: 'approved' }
    ],
    isActive: true,
    joinDate: '2024-01-20'
  },
  {
    id: 'staff-3',
    name: 'Maria Garcia',
    email: 'maria.garcia@email.com',
    phone: '+1-555-0128',
    location: 'Chicago, IL',
    skills: ['Catering', 'Event Coordination', 'Food Preparation', 'Team Leadership'],
    hourlyRate: 28,
    rating: 4.7,
    totalEvents: 32,
    availability: [
      { date: '2024-10-15', available: false },
      { date: '2024-10-16', available: true },
      { date: '2024-10-17', available: true }
    ],
    availabilityStatus: 'busy',
    documents: [
      { type: 'ID', status: 'approved' },
      { type: 'Food Handler License', status: 'approved' },
      { type: 'Background Check', status: 'approved' }
    ],
    isActive: true,
    joinDate: '2024-02-15'
  },
  {
    id: 'staff-4',
    name: 'David Kim',
    email: 'david.kim@email.com',
    phone: '+1-555-0129',
    location: 'San Francisco, CA',
    skills: ['Photography', 'Videography', 'Equipment Setup', 'Live Streaming'],
    hourlyRate: 35,
    rating: 4.9,
    totalEvents: 28,
    availability: [
      { date: '2024-10-15', available: true },
      { date: '2024-10-16', available: true },
      { date: '2024-10-17', available: true }
    ],
    availabilityStatus: 'available',
    documents: [
      { type: 'ID', status: 'approved' },
      { type: 'Equipment License', status: 'approved' },
      { type: 'Background Check', status: 'approved' }
    ],
    isActive: true,
    joinDate: '2024-03-01'
  },
  {
    id: 'staff-5',
    name: 'Sophie Brown',
    email: 'sophie.brown@email.com',
    phone: '+1-555-0130',
    location: 'Miami, FL',
    skills: ['Event Planning', 'Client Relations', 'Vendor Coordination', 'Protocol Management'],
    hourlyRate: 32,
    rating: 4.8,
    totalEvents: 41,
    availability: [
      { date: '2024-10-15', available: false },
      { date: '2024-10-16', available: false },
      { date: '2024-10-17', available: true }
    ],
    availabilityStatus: 'unavailable',
    documents: [
      { type: 'ID', status: 'approved' },
      { type: 'Certification', status: 'approved' },
      { type: 'Background Check', status: 'approved' }
    ],
    isActive: true,
    joinDate: '2024-01-25'
  },
  {
    id: 'staff-6',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1-555-0127',
    location: 'Los Angeles, CA',
    skills: ['Fine Dining Service', 'Wine Service', 'Event Coordination'],
    hourlyRate: 28,
    rating: 4.7,
    totalEvents: 32,
    availability: [
      { date: '2025-01-06', available: true },
      { date: '2025-01-07', available: true },
      { date: '2025-01-08', available: false }
    ],
    availabilityStatus: 'available',
    documents: [
      { type: 'ID', status: 'approved' },
      { type: 'Food Handler License', status: 'approved' }
    ],
    isActive: true,
    joinDate: '2024-02-01'
  },
  {
    id: 'staff-7',
    name: 'Isabella Martinez',
    email: 'isabella.martinez@email.com',
    phone: '+1-555-0128',
    location: 'Los Angeles, CA',
    skills: ['Bartending', 'Cocktail Service', 'Customer Relations'],
    hourlyRate: 26,
    rating: 4.9,
    totalEvents: 41,
    availability: [
      { date: '2025-01-06', available: true },
      { date: '2025-01-07', available: true },
      { date: '2025-01-08', available: true }
    ],
    availabilityStatus: 'available',
    documents: [
      { type: 'ID', status: 'approved' },
      { type: 'Alcohol Service License', status: 'approved' }
    ],
    isActive: true,
    joinDate: '2024-01-15'
  },
  {
    id: 'staff-8',
    name: 'Tyler Johnson',
    email: 'tyler.johnson@email.com',
    phone: '+1-555-0129',
    location: 'Los Angeles, CA',
    skills: ['Event Setup', 'Audio/Visual', 'Equipment Management'],
    hourlyRate: 24,
    rating: 4.6,
    totalEvents: 28,
    availability: [
      { date: '2025-01-06', available: true },
      { date: '2025-01-07', available: false },
      { date: '2025-01-08', available: true }
    ],
    availabilityStatus: 'available',
    documents: [
      { type: 'ID', status: 'approved' },
      { type: 'Technical Certification', status: 'approved' }
    ],
    isActive: true,
    joinDate: '2024-03-10'
  },
  {
    id: 'staff-9',
    name: 'Olivia Thompson',
    email: 'olivia.thompson@email.com',
    phone: '+1-555-0130',
    location: 'Los Angeles, CA',
    skills: ['Guest Relations', 'Registration', 'Event Coordination'],
    hourlyRate: 25,
    rating: 4.8,
    totalEvents: 35,
    availability: [
      { date: '2025-01-06', available: true },
      { date: '2025-01-07', available: true },
      { date: '2025-01-08', available: true }
    ],
    availabilityStatus: 'available',
    documents: [
      { type: 'ID', status: 'approved' },
      { type: 'Background Check', status: 'approved' }
    ],
    isActive: true,
    joinDate: '2024-02-20'
  },
  {
    id: 'staff-10',
    name: 'Alexander Davis',
    email: 'alexander.davis@email.com',
    phone: '+1-555-0131',
    location: 'Los Angeles, CA',
    skills: ['Security', 'Crowd Management', 'Emergency Response'],
    hourlyRate: 32,
    rating: 4.9,
    totalEvents: 42,
    availability: [
      { date: '2025-01-06', available: true },
      { date: '2025-01-07', available: true },
      { date: '2025-01-08', available: false }
    ],
    availabilityStatus: 'available',
    documents: [
      { type: 'ID', status: 'approved' },
      { type: 'Security License', status: 'approved' },
      { type: 'Background Check', status: 'approved' }
    ],
    isActive: true,
    joinDate: '2024-01-05'
  },
  // Adding more staff for large events
  {
    id: 'staff-11', name: 'Rachel Wilson', email: 'rachel.wilson@email.com', phone: '+1-555-0132',
    location: 'Los Angeles, CA', skills: ['Catering Service', 'Food Service', 'Kitchen Support'],
    hourlyRate: 23, rating: 4.7, totalEvents: 29, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-03-15'
  },
  {
    id: 'staff-12', name: 'Daniel Moore', email: 'daniel.moore@email.com', phone: '+1-555-0133',
    location: 'Los Angeles, CA', skills: ['Bartending', 'Premium Service', 'Mixology'],
    hourlyRate: 29, rating: 4.8, totalEvents: 37, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-01-30'
  },
  {
    id: 'staff-13', name: 'Hannah Taylor', email: 'hannah.taylor@email.com', phone: '+1-555-0134',
    location: 'Los Angeles, CA', skills: ['Event Coordination', 'Guest Services', 'VIP Relations'],
    hourlyRate: 27, rating: 4.9, totalEvents: 33, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-02-10'
  },
  {
    id: 'staff-14', name: 'Christopher Anderson', email: 'christopher.anderson@email.com', phone: '+1-555-0135',
    location: 'Los Angeles, CA', skills: ['Audio/Visual', 'Technical Support', 'Equipment Setup'],
    hourlyRate: 26, rating: 4.6, totalEvents: 31, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-04-01'
  },
  {
    id: 'staff-15', name: 'Amanda Clark', email: 'amanda.clark@email.com', phone: '+1-555-0136',
    location: 'Los Angeles, CA', skills: ['Fine Dining Service', 'Wine Knowledge', 'Hospitality'],
    hourlyRate: 28, rating: 4.8, totalEvents: 39, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-01-12'
  },
  {
    id: 'staff-16', name: 'Kevin Rodriguez', email: 'kevin.rodriguez@email.com', phone: '+1-555-0137',
    location: 'Los Angeles, CA', skills: ['Security', 'Event Safety', 'Crowd Control'],
    hourlyRate: 31, rating: 4.7, totalEvents: 34, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-02-25'
  },
  {
    id: 'staff-17', name: 'Sarah Lewis', email: 'sarah.lewis@email.com', phone: '+1-555-0138',
    location: 'Los Angeles, CA', skills: ['Catering', 'Food Presentation', 'Service Excellence'],
    hourlyRate: 24, rating: 4.6, totalEvents: 26, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-03-20'
  },
  {
    id: 'staff-18', name: 'Matthew Walker', email: 'matthew.walker@email.com', phone: '+1-555-0139',
    location: 'Los Angeles, CA', skills: ['Bar Service', 'Cocktail Preparation', 'Customer Service'],
    hourlyRate: 25, rating: 4.8, totalEvents: 32, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-01-18'
  },
  {
    id: 'staff-19', name: 'Jessica Hall', email: 'jessica.hall@email.com', phone: '+1-555-0140',
    location: 'Los Angeles, CA', skills: ['Event Management', 'Registration', 'Guest Relations'],
    hourlyRate: 26, rating: 4.7, totalEvents: 30, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-04-05'
  },
  {
    id: 'staff-20', name: 'Joshua Allen', email: 'joshua.allen@email.com', phone: '+1-555-0141',
    location: 'Los Angeles, CA', skills: ['Setup', 'Logistics', 'Equipment Handling'],
    hourlyRate: 22, rating: 4.5, totalEvents: 28, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-03-01'
  },
  {
    id: 'staff-21', name: 'Ashley Young', email: 'ashley.young@email.com', phone: '+1-555-0142',
    location: 'Los Angeles, CA', skills: ['Hospitality', 'Customer Service', 'Event Support'],
    hourlyRate: 24, rating: 4.7, totalEvents: 31, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-02-14'
  },
  {
    id: 'staff-22', name: 'Brandon King', email: 'brandon.king@email.com', phone: '+1-555-0143',
    location: 'Los Angeles, CA', skills: ['Fine Dining', 'Wine Service', 'Premium Events'],
    hourlyRate: 29, rating: 4.9, totalEvents: 38, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-01-25'
  },
  {
    id: 'staff-23', name: 'Stephanie Wright', email: 'stephanie.wright@email.com', phone: '+1-555-0144',
    location: 'Los Angeles, CA', skills: ['Event Coordination', 'VIP Service', 'Protocol'],
    hourlyRate: 30, rating: 4.8, totalEvents: 35, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-01-08'
  },
  {
    id: 'staff-24', name: 'Ryan Lopez', email: 'ryan.lopez@email.com', phone: '+1-555-0145',
    location: 'Los Angeles, CA', skills: ['Security', 'Emergency Response', 'Safety Management'],
    hourlyRate: 33, rating: 4.8, totalEvents: 36, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-02-01'
  },
  {
    id: 'staff-25', name: 'Megan Hill', email: 'megan.hill@email.com', phone: '+1-555-0146',
    location: 'Los Angeles, CA', skills: ['Catering', 'Food Service', 'Kitchen Operations'],
    hourlyRate: 23, rating: 4.6, totalEvents: 27, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-03-10'
  },
  {
    id: 'staff-26', name: 'Justin Scott', email: 'justin.scott@email.com', phone: '+1-555-0147',
    location: 'Los Angeles, CA', skills: ['Bartending', 'Mixology', 'Bar Management'],
    hourlyRate: 27, rating: 4.7, totalEvents: 33, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-01-20'
  },
  {
    id: 'staff-27', name: 'Nicole Green', email: 'nicole.green@email.com', phone: '+1-555-0148',
    location: 'Los Angeles, CA', skills: ['Guest Services', 'Registration', 'Information'],
    hourlyRate: 25, rating: 4.8, totalEvents: 32, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-02-28'
  },
  {
    id: 'staff-28', name: 'Eric Adams', email: 'eric.adams@email.com', phone: '+1-555-0149',
    location: 'Los Angeles, CA', skills: ['Audio Visual', 'Technical Support', 'Equipment'],
    hourlyRate: 26, rating: 4.6, totalEvents: 29, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-04-10'
  },
  {
    id: 'staff-29', name: 'Kimberly Baker', email: 'kimberly.baker@email.com', phone: '+1-555-0150',
    location: 'Los Angeles, CA', skills: ['Fine Dining', 'Service Excellence', 'Hospitality'],
    hourlyRate: 28, rating: 4.9, totalEvents: 37, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-01-15'
  },
  {
    id: 'staff-30', name: 'Anthony Gonzalez', email: 'anthony.gonzalez@email.com', phone: '+1-555-0151',
    location: 'Los Angeles, CA', skills: ['Event Setup', 'Logistics', 'Coordination'],
    hourlyRate: 24, rating: 4.7, totalEvents: 30, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-03-05'
  },
  {
    id: 'staff-31', name: 'Jennifer Nelson', email: 'jennifer.nelson@email.com', phone: '+1-555-0152',
    location: 'Los Angeles, CA', skills: ['Customer Service', 'Event Support', 'Relations'],
    hourlyRate: 25, rating: 4.8, totalEvents: 34, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-02-12'
  },
  {
    id: 'staff-32', name: 'Andrew Carter', email: 'andrew.carter@email.com', phone: '+1-555-0153',
    location: 'Los Angeles, CA', skills: ['Security', 'Access Control', 'Safety'],
    hourlyRate: 32, rating: 4.7, totalEvents: 33, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-01-28'
  },
  {
    id: 'staff-33', name: 'Elizabeth Mitchell', email: 'elizabeth.mitchell@email.com', phone: '+1-555-0154',
    location: 'Los Angeles, CA', skills: ['Catering', 'Food Presentation', 'Service'],
    hourlyRate: 24, rating: 4.6, totalEvents: 28, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-03-18'
  },
  {
    id: 'staff-34', name: 'Thomas Perez', email: 'thomas.perez@email.com', phone: '+1-555-0155',
    location: 'Los Angeles, CA', skills: ['Bar Service', 'Beverage Management', 'Customer Care'],
    hourlyRate: 26, rating: 4.8, totalEvents: 31, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-02-05'
  },
  {
    id: 'staff-35', name: 'Michelle Roberts', email: 'michelle.roberts@email.com', phone: '+1-555-0156',
    location: 'Los Angeles, CA', skills: ['Event Management', 'Coordination', 'Guest Relations'],
    hourlyRate: 29, rating: 4.9, totalEvents: 36, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-01-10'
  },
  {
    id: 'staff-36', name: 'Charles Turner', email: 'charles.turner@email.com', phone: '+1-555-0157',
    location: 'Los Angeles, CA', skills: ['Setup', 'Equipment', 'Technical Support'],
    hourlyRate: 23, rating: 4.5, totalEvents: 26, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-04-01'
  },
  {
    id: 'staff-37', name: 'Lisa Campbell', email: 'lisa.campbell@email.com', phone: '+1-555-0158',
    location: 'Los Angeles, CA', skills: ['Hospitality', 'VIP Service', 'Premium Events'],
    hourlyRate: 30, rating: 4.8, totalEvents: 35, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-01-22'
  },
  {
    id: 'staff-38', name: 'Mark Parker', email: 'mark.parker@email.com', phone: '+1-555-0159',
    location: 'Los Angeles, CA', skills: ['Fine Dining', 'Wine Knowledge', 'Service Excellence'],
    hourlyRate: 28, rating: 4.7, totalEvents: 32, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-02-15'
  },
  {
    id: 'staff-39', name: 'Patricia Evans', email: 'patricia.evans@email.com', phone: '+1-555-0160',
    location: 'Los Angeles, CA', skills: ['Event Coordination', 'Guest Services', 'Protocol'],
    hourlyRate: 27, rating: 4.8, totalEvents: 33, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-03-01'
  },
  {
    id: 'staff-40', name: 'Steven Edwards', email: 'steven.edwards@email.com', phone: '+1-555-0161',
    location: 'Los Angeles, CA', skills: ['Security', 'Event Safety', 'Crowd Management'],
    hourlyRate: 31, rating: 4.6, totalEvents: 29, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-02-20'
  },
  {
    id: 'staff-41', name: 'Susan Collins', email: 'susan.collins@email.com', phone: '+1-555-0162',
    location: 'Los Angeles, CA', skills: ['Catering', 'Food Service', 'Kitchen Support'],
    hourlyRate: 24, rating: 4.7, totalEvents: 30, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-03-12'
  },
  {
    id: 'staff-42', name: 'Joseph Stewart', email: 'joseph.stewart@email.com', phone: '+1-555-0163',
    location: 'Los Angeles, CA', skills: ['Bartending', 'Mixology', 'Customer Service'],
    hourlyRate: 27, rating: 4.8, totalEvents: 34, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-01-30'
  },
  {
    id: 'staff-43', name: 'Karen Sanchez', email: 'karen.sanchez@email.com', phone: '+1-555-0164',
    location: 'Los Angeles, CA', skills: ['Guest Relations', 'Registration', 'Information Services'],
    hourlyRate: 25, rating: 4.9, totalEvents: 36, availabilityStatus: 'available',
    availability: [{ date: '2025-01-06', available: true }], documents: [{ type: 'ID', status: 'approved' }],
    isActive: true, joinDate: '2024-02-08'
  }];

// Helper function to get today's date in YYYY-MM-DD format
export const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper function to determine shift status based on current time
export const getShiftStatus = (shift: Shift): Shift['status'] => {
  const today = new Date();
  const currentTime = today.getHours() * 60 + today.getMinutes(); // Current time in minutes

  const [startHour, startMin] = shift.startTime.split(':').map(Number);
  const [endHour, endMin] = shift.endTime.split(':').map(Number);

  const startTimeMinutes = startHour * 60 + startMin;
  let endTimeMinutes = endHour * 60 + endMin;

  // Handle overnight shifts (ending after midnight)
  if (endTimeMinutes <= startTimeMinutes) {
    endTimeMinutes += 24 * 60; // Add 24 hours worth of minutes
  }

  // If shift is from a different date, return existing status
  if (shift.date !== getTodayDate()) {
    return shift.status;
  }

  // If already checked out, it's completed
  if (shift.clockOut) {
    return 'completed';
  }

  // If checked in, it's ongoing
  if (shift.clockIn) {
    return 'ongoing';
  }

  // If current time is before start time, yet to start
  if (currentTime < startTimeMinutes) {
    return 'yet-to-start';
  }

  // If current time is after end time and not checked out, still ongoing if was checked in
  if (currentTime > endTimeMinutes) {
    return shift.clockIn ? 'ongoing' : 'completed';
  }

  // If in the time window but not checked in
  return 'yet-to-start';
};

// Mock Shifts - All set to today with different times and statuses
export const mockShifts: Shift[] = [
  // Early morning shift (completed)
  {
    id: 'shift-today-1',
    eventId: 'event-today-1',
    staffId: 'staff-1',
    date: getTodayDate(),
    startTime: '06:00',
    endTime: '10:00',
    status: 'completed',
    clockIn: '05:58',
    clockOut: '10:05',
    location: 'Downtown Convention Center, Los Angeles',
    role: 'Setup Coordinator',
    hourlyRate: 28,
    rate: 28,
    totalHours: 4,
    totalPay: 112
  },

  // Morning shift (ongoing)
  {
    id: 'shift-today-2',
    eventId: 'event-today-2',
    staffId: 'staff-1',
    date: getTodayDate(),
    startTime: '09:00',
    endTime: '14:00',
    status: 'ongoing',
    clockIn: '08:55',
    location: 'Hilton Hotel Grand Ballroom, Beverly Hills',
    role: 'Event Coordinator',
    hourlyRate: 30,
    rate: 30,
    totalHours: 5,
    totalPay: 150
  },

  // Afternoon shift (yet to start)
  {
    id: 'shift-today-3',
    eventId: 'event-today-3',
    staffId: 'staff-1',
    date: getTodayDate(),
    startTime: '15:00',
    endTime: '19:00',
    status: 'yet-to-start',
    location: 'Beverly Hills Country Club',
    role: 'Senior Server',
    hourlyRate: 32,
    rate: 32,
    totalHours: 4,
    totalPay: 128
  },

  // Evening shift (yet to start)
  {
    id: 'shift-today-4',
    eventId: 'event-today-4',
    staffId: 'staff-1',
    date: getTodayDate(),
    startTime: '18:00',
    endTime: '23:00',
    status: 'yet-to-start',
    location: 'Rooftop Terrace, Santa Monica',
    role: 'Bartender',
    hourlyRate: 35,
    rate: 35,
    totalHours: 5,
    totalPay: 175
  },

  // Late night shift (yet to start)
  {
    id: 'shift-today-5',
    eventId: 'event-today-5',
    staffId: 'staff-1',
    date: getTodayDate(),
    startTime: '22:00',
    endTime: '02:00',
    status: 'yet-to-start',
    location: 'Hollywood Bowl VIP Area',
    role: 'VIP Host',
    hourlyRate: 40,
    rate: 40,
    totalHours: 4,
    totalPay: 200
  },
  // Pending shifts needing response
  {
    id: 'shift-pending-1',
    eventId: 'event-pending-1',
    staffId: 'staff-1',
    date: '2025-10-05',
    startTime: '18:00',
    endTime: '23:00',
    status: 'pending',
    location: 'The Getty Center Museum, Los Angeles',
    role: 'Gallery Attendant',
    hourlyRate: 26,
    totalHours: 5,
    totalPay: 130
  },
  {
    id: 'shift-pending-2',
    eventId: 'event-pending-2',
    staffId: 'staff-1',
    date: '2025-10-08',
    startTime: '14:00',
    endTime: '20:00',
    status: 'pending',
    location: 'Dodger Stadium Premium Suites, Los Angeles',
    role: 'VIP Server',
    hourlyRate: 35,
    totalHours: 6,
    totalPay: 210
  },
  {
    id: 'shift-pending-3',
    eventId: 'event-pending-3',
    staffId: 'staff-1',
    date: '2025-10-12',
    startTime: '10:00',
    endTime: '16:00',
    status: 'pending',
    location: 'Los Angeles Convention Center, Hall A',
    role: 'Registration Assistant',
    hourlyRate: 24,
    totalHours: 6,
    totalPay: 144
  },
  {
    id: 'shift-pending-4',
    eventId: 'event-pending-4',
    staffId: 'staff-1',
    date: '2025-10-15',
    startTime: '17:30',
    endTime: '22:30',
    status: 'pending',
    location: 'Four Seasons Hotel Los Angeles at Beverly Hills',
    role: 'Fine Dining Server',
    hourlyRate: 38,
    totalHours: 5,
    totalPay: 190
  },
  {
    id: 'shift-pending-5',
    eventId: 'event-pending-5',
    staffId: 'staff-1',
    date: '2025-10-20',
    startTime: '11:00',
    endTime: '17:00',
    status: 'pending',
    location: 'Malibu Private Estate, Pacific Palisades',
    role: 'Poolside Server',
    hourlyRate: 29,
    totalHours: 6,
    totalPay: 174
  },
  // Future confirmed shifts
  {
    id: 'shift-future-1',
    eventId: 'event-future-1',
    staffId: 'staff-1',
    date: '2025-10-03',
    startTime: '19:00',
    endTime: '23:00',
    status: 'confirmed',
    location: 'Walt Disney Concert Hall, Downtown LA',
    role: 'Usher',
    hourlyRate: 22,
    totalHours: 4,
    totalPay: 88
  },
  {
    id: 'shift-future-2',
    eventId: 'event-future-2',
    staffId: 'staff-1',
    date: '2025-10-07',
    startTime: '12:00',
    endTime: '18:00',
    status: 'confirmed',
    location: 'Venice Beach Boardwalk Event Space',
    role: 'Event Setup Crew',
    hourlyRate: 25,
    totalHours: 6,
    totalPay: 150
  },
  {
    id: 'shift-future-3',
    eventId: 'event-future-3',
    staffId: 'staff-1',
    date: '2025-10-10',
    startTime: '08:00',
    endTime: '13:00',
    status: 'confirmed',
    location: 'Griffith Observatory, Los Angeles',
    role: 'Morning Setup Coordinator',
    hourlyRate: 27,
    totalHours: 5,
    totalPay: 135
  },
  {
    id: 'shift-future-4',
    eventId: 'event-future-4',
    staffId: 'staff-1',
    date: '2025-10-18',
    startTime: '15:00',
    endTime: '21:00',
    status: 'confirmed',
    location: 'Hollywood Bowl, Hollywood Hills',
    role: 'Concession Stand Attendant',
    hourlyRate: 23,
    totalHours: 6,
    totalPay: 138
  },
  {
    id: 'shift-future-5',
    eventId: 'event-future-5',
    staffId: 'staff-1',
    date: '2025-10-25',
    startTime: '20:00',
    endTime: '01:00',
    status: 'confirmed',
    location: 'Sunset Strip Private Club, West Hollywood',
    role: 'VIP Lounge Server',
    hourlyRate: 40,
    totalHours: 5,
    totalPay: 200
  },
  // Past completed shifts
  {
    id: 'shift-completed-1',
    eventId: 'event-completed-1',
    staffId: 'staff-1',
    date: '2024-12-15',
    startTime: '18:00',
    endTime: '23:00',
    status: 'completed',
    clockIn: '17:55',
    clockOut: '23:10',
    location: 'Grand Hotel Ballroom, New York',
    role: 'Server',
    hourlyRate: 25,
    totalHours: 5.25,
    totalPay: 131.25
  },
  {
    id: 'shift-completed-2',
    eventId: 'event-completed-2',
    staffId: 'staff-1',
    date: '2024-12-20',
    startTime: '17:30',
    endTime: '23:30',
    status: 'completed',
    clockIn: '17:25',
    clockOut: '23:35',
    location: 'Sunset Gardens, California',
    role: 'Bartender',
    hourlyRate: 28,
    totalHours: 6.17,
    totalPay: 172.76
  }
];

// Mock Ratings
export const mockRatings: Rating[] = [
  {
    id: 'rating-1',
    eventId: 'event-3',
    staffId: 'staff-2',
    clientId: 'client-1',
    punctuality: 5,
    professionalism: 5,
    qualityOfWork: 4,
    overall: 5,
    comments: 'Excellent service, very professional and punctual. Would definitely book again.',
    date: '2024-11-06'
  },
  {
    id: 'rating-2',
    eventId: 'event-1',
    staffId: 'staff-1',
    clientId: 'client-1',
    punctuality: 5,
    professionalism: 4,
    qualityOfWork: 5,
    overall: 5,
    comments: 'Great bartending skills and very friendly with guests.',
    date: '2024-10-16'
  }
];

// Mock Payroll Records
export const mockPayrollRecords: PayrollRecord[] = [
  {
    id: 'payroll-1',
    staffId: 'staff-1',
    period: '2024-09',
    totalHours: 42.5,
    grossPay: 1062.50,
    deductions: {
      insurance: 50,
      uniform: 25
    },
    netPay: 987.50,
    status: 'paid',
    payDate: '2024-10-01'
  },
  {
    id: 'payroll-2',
    staffId: 'staff-2',
    period: '2024-09',
    totalHours: 38,
    grossPay: 1140,
    deductions: {
      insurance: 50
    },
    netPay: 1090,
    status: 'paid',
    payDate: '2024-10-01'
  },
  {
    id: 'payroll-3',
    staffId: 'staff-1',
    period: '2024-10',
    totalHours: 35.25,
    grossPay: 881.25,
    deductions: {
      insurance: 50,
      uniform: 25
    },
    netPay: 806.25,
    status: 'processed'
  }
];

// Mock Pay Stubs
export const mockPayStubs: PayStub[] = [
  {
    id: 'paystub-1',
    staffId: 'staff-1',
    period: '2024-10-01 to 2024-10-15',
    eventDetails: [
      {
        eventId: 'event-1',
        eventName: 'Corporate Gala 2024',
        date: '2024-10-15',
        hoursWorked: 5.25,
        arrivedOnTime: true,
        minimumPayApplied: true
      }
    ],
    totalHours: 5.25,
    regularPay: 131.25,
    tips: 45,
    deductions: {
      workersComp: 5.25,
      uniform: 0,
      parking: 15,
      other: 0
    },
    grossPay: 176.25,
    netPay: 156.00,
    status: 'paid',
    payDate: '2024-10-18',
    downloadUrl: '/paystubs/paystub-1.pdf'
  },
  {
    id: 'paystub-2',
    staffId: 'staff-1',
    period: '2024-09-16 to 2024-09-30',
    eventDetails: [
      {
        eventId: 'event-3',
        eventName: 'Product Launch Event',
        date: '2024-09-28',
        hoursWorked: 4,
        arrivedOnTime: true,
        minimumPayApplied: true
      }
    ],
    totalHours: 5,
    regularPay: 125,
    tips: 30,
    deductions: {
      workersComp: 5,
      uniform: 25,
      parking: 12,
      other: 0
    },
    grossPay: 155,
    netPay: 113,
    status: 'paid',
    payDate: '2024-10-02'
  }
];

// Mock Staff Reviews
export const mockStaffReviews: StaffReview[] = [
  {
    id: 'review-1',
    staffId: 'staff-1',
    eventId: 'event-1',
    clientId: 'client-1',
    clientName: 'Sarah Johnson',
    eventName: 'Corporate Gala 2024',
    date: '2024-10-15',
    venue: 'Grand Hotel Ballroom',
    rating: 5,
    review: 'Emma was absolutely fantastic! Her bartending skills were top-notch and she was very professional throughout the entire event. Guests complimented her service multiple times.',
    isPositive: true,
    categories: {
      punctuality: 5,
      professionalism: 5,
      quality: 5,
      communication: 5
    }
  },
  {
    id: 'review-2',
    staffId: 'staff-1',
    eventId: 'event-3',
    clientId: 'client-1',
    clientName: 'Sarah Johnson',
    eventName: 'Product Launch Event',
    date: '2024-09-28',
    venue: 'Innovation Center',
    rating: 4,
    review: 'Great service overall. Emma was punctual and professional. The only minor issue was during the networking session - could have been more proactive in refilling drinks.',
    isPositive: false,
    categories: {
      punctuality: 5,
      professionalism: 4,
      quality: 4,
      communication: 4
    }
  }
];

// Mock Tip Records
export const mockTipRecords: TipRecord[] = [
  {
    id: 'tip-1',
    staffId: 'staff-1',
    eventId: 'event-1',
    clientName: 'Sarah Johnson',
    eventName: 'Corporate Gala 2024',
    date: '2024-10-15',
    venue: 'Grand Hotel Ballroom',
    amount: 45,
    payStubId: 'paystub-1'
  },
  {
    id: 'tip-2',
    staffId: 'staff-1',
    eventId: 'event-3',
    clientName: 'Sarah Johnson',
    eventName: 'Product Launch Event',
    date: '2024-09-28',
    venue: 'Innovation Center',
    amount: 30,
    payStubId: 'paystub-2'
  }
];

// Mock Unavailability Requests
export const mockUnavailabilityRequests: UnavailabilityRequest[] = [
  {
    id: 'unavail-1',
    staffId: 'staff-1',
    startDate: '2024-11-15',
    endDate: '2024-11-17',
    reason: 'Family vacation',
    status: 'approved',
    submittedAt: '2024-10-20T10:30:00Z',
    responseDate: '2024-10-21T14:15:00Z'
  },
  {
    id: 'unavail-2',
    staffId: 'staff-1',
    startDate: '2024-12-24',
    endDate: '2024-12-26',
    reason: 'Holiday with family',
    status: 'pending',
    submittedAt: '2024-10-25T09:00:00Z'
  }
];

// Mock Staff Documents
export const mockStaffDocuments: StaffDocument[] = [
  {
    id: 'doc-1',
    staffId: 'staff-1',
    type: 'id',
    fileName: 'drivers_license.pdf',
    uploadDate: '2024-01-10',
    status: 'approved'
  },
  {
    id: 'doc-2',
    staffId: 'staff-1',
    type: 'certification',
    fileName: 'food_handler_cert.pdf',
    uploadDate: '2024-01-10',
    status: 'approved',
    expiryDate: '2025-01-10'
  },
  {
    id: 'doc-3',
    staffId: 'staff-1',
    type: 'direct-deposit',
    fileName: 'direct_deposit_form.pdf',
    uploadDate: '2024-10-20',
    status: 'pending'
  }
];

// Mock Timesheet Entries
export const mockTimesheetEntries: TimesheetEntry[] = [
  {
    id: 'timesheet-1',
    staffId: 'staff-1',
    eventId: 'event-1',
    date: '2024-10-15',
    clockIn: '17:55',
    clockOut: '23:10',
    breakDuration: 15,
    totalHours: 5.00,
    location: 'Grand Hotel Ballroom, New York',
    status: 'approved',
    submittedAt: '2024-10-16T08:00:00Z',
    approvedBy: 'admin-1',
    notes: 'Great performance, arrived early',
    auditLog: [
      {
        action: 'Submitted',
        by: 'staff-1',
        at: '2024-10-16T08:00:00Z',
        changes: 'Initial submission'
      },
      {
        action: 'Approved',
        by: 'admin-1',
        at: '2024-10-16T14:30:00Z',
        changes: 'Approved without changes'
      }
    ]
  },
  {
    id: 'timesheet-2',
    staffId: 'staff-1',
    eventId: 'event-3',
    date: '2024-09-28',
    clockIn: '16:00',
    clockOut: '20:15',
    breakDuration: 0,
    totalHours: 4.25,
    location: 'Innovation Center, San Francisco',
    status: 'approved',
    submittedAt: '2024-09-29T09:15:00Z',
    approvedBy: 'admin-1',
    auditLog: [
      {
        action: 'Submitted',
        by: 'staff-1',
        at: '2024-09-29T09:15:00Z',
        changes: 'Initial submission'
      },
      {
        action: 'Modified',
        by: 'admin-1',
        at: '2024-09-29T11:00:00Z',
        changes: 'Adjusted break duration from 15 minutes to 0'
      },
      {
        action: 'Approved',
        by: 'admin-1',
        at: '2024-09-29T11:30:00Z',
        changes: 'Approved with modifications'
      }
    ]
  }
];

// Helper functions
export const getUserById = (id: string) => mockUsers.find(user => user.id === id);
export const getEventsByClient = (clientId: string) => mockEvents.filter(event => event.clientId === clientId);
export const getShiftsByStaff = (staffId: string) => mockShifts.filter(shift => shift.staffId === staffId);
export const getPayrollByStaff = (staffId: string) => mockPayrollRecords.filter(record => record.staffId === staffId);
export const getRatingsByStaff = (staffId: string) => mockRatings.filter(rating => rating.staffId === staffId);
export const getPayStubsByStaff = (staffId: string) => mockPayStubs.filter(stub => stub.staffId === staffId);
export const getReviewsByStaff = (staffId: string) => mockStaffReviews.filter(review => review.staffId === staffId);
export const getTipsByStaff = (staffId: string) => mockTipRecords.filter(tip => tip.staffId === staffId);
export const getUnavailabilityByStaff = (staffId: string) => mockUnavailabilityRequests.filter(req => req.staffId === staffId);
export const getDocumentsByStaff = (staffId: string) => mockStaffDocuments.filter(doc => doc.staffId === staffId);
export const getTimesheetsByStaff = (staffId: string) => mockTimesheetEntries.filter(entry => entry.staffId === staffId);

// Export alias for compatibility
export const mockReviews = mockStaffReviews;

// Mock Clients
export const mockClients: Client[] = [
  {
    id: 'client-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    type: 'individual',
    address: '123 Beverly Hills Drive, Beverly Hills, CA 90210',
    paymentTerms: 'Net 15',
    preferredStaff: ['staff-1', 'staff-3', 'staff-5'],
    favoriteEvents: [
      {
        eventId: 'event-1',
        eventTitle: 'Sarah\'s Birthday Celebration',
        eventType: 'Private Event',
        eventDate: '2024-01-15',
        staffIds: ['staff-1', 'staff-3', 'staff-5'],
        addedDate: '2024-01-16',
        rating: 5
      },
      {
        eventId: 'event-5',
        eventTitle: 'Anniversary Dinner Party',
        eventType: 'Private Event',
        eventDate: '2024-02-28',
        staffIds: ['staff-2', 'staff-4', 'staff-6'],
        addedDate: '2024-03-01',
        rating: 4.8
      },
      {
        eventId: 'event-12',
        eventTitle: 'Corporate Holiday Gala',
        eventType: 'Corporate Event',
        eventDate: '2023-12-15',
        staffIds: ['staff-1', 'staff-2', 'staff-7', 'staff-8'],
        addedDate: '2023-12-16',
        rating: 4.9
      },
      {
        eventId: 'event-18',
        eventTitle: 'Summer Garden Wedding',
        eventType: 'Wedding Event',
        eventDate: '2024-06-22',
        staffIds: ['staff-3', 'staff-5', 'staff-9', 'staff-10', 'staff-11'],
        addedDate: '2024-06-23',
        rating: 4.7
      },
      {
        eventId: 'event-25',
        eventTitle: 'Charity Fundraising Dinner',
        eventType: 'Fund Raiser',
        eventDate: '2024-04-10',
        staffIds: ['staff-1', 'staff-4', 'staff-6', 'staff-12'],
        addedDate: '2024-04-11',
        rating: 4.6
      },
      {
        eventId: 'event-31',
        eventTitle: 'Product Launch Event',
        eventType: 'Corporate Event',
        eventDate: '2024-03-18',
        staffIds: ['staff-2', 'staff-7', 'staff-13', 'staff-14', 'staff-15'],
        addedDate: '2024-03-19',
        rating: 4.8
      },
      {
        eventId: 'event-42',
        eventTitle: 'Intimate Wine Tasting',
        eventType: 'Private Event',
        eventDate: '2024-05-14',
        staffIds: ['staff-3', 'staff-8', 'staff-16'],
        addedDate: '2024-05-15',
        rating: 4.9
      },
      {
        eventId: 'event-56',
        eventTitle: 'Family Reunion BBQ',
        eventType: 'Home Event',
        eventDate: '2024-07-04',
        staffIds: ['staff-5', 'staff-9', 'staff-17', 'staff-18'],
        addedDate: '2024-07-05',
        rating: 4.5
      },
      {
        eventId: 'event-63',
        eventTitle: 'Graduation Celebration',
        eventType: 'Private Event',
        eventDate: '2024-05-28',
        staffIds: ['staff-1', 'staff-6', 'staff-11', 'staff-19'],
        addedDate: '2024-05-29',
        rating: 4.7
      },
      {
        eventId: 'event-71',
        eventTitle: 'Executive Board Meeting Catering',
        eventType: 'Corporate Event',
        eventDate: '2024-08-12',
        staffIds: ['staff-2', 'staff-4', 'staff-12', 'staff-20'],
        addedDate: '2024-08-13',
        rating: 4.8
      }
    ],
    totalEvents: 12,
    totalSpent: 28500,
    rating: 4.8,
    joinDate: '2023-03-15',
    isActive: true
  },
  {
    id: 'client-2',
    name: 'Marcus Thompson',
    email: 'marcus.thompson@email.com',
    phone: '(555) 234-5678',
    type: 'individual',
    address: '456 Sunset Boulevard, West Hollywood, CA 90069',
    paymentTerms: 'Net 30',
    preferredStaff: ['staff-2', 'staff-4'],
    favoriteEvents: [
      {
        eventId: 'event-3',
        eventTitle: 'Corporate Holiday Party',
        eventType: 'Fund Raiser',
        eventDate: '2024-01-20',
        staffIds: ['staff-2', 'staff-4', 'staff-7'],
        addedDate: '2024-01-21',
        rating: 4.5
      },
      {
        eventId: 'event-8',
        eventTitle: 'Business Networking Mixer',
        eventType: 'Corporate Event',
        eventDate: '2024-03-05',
        staffIds: ['staff-1', 'staff-3', 'staff-6'],
        addedDate: '2024-03-06',
        rating: 4.7
      },
      {
        eventId: 'event-14',
        eventTitle: 'Client Appreciation Dinner',
        eventType: 'Corporate Event',
        eventDate: '2024-04-22',
        staffIds: ['staff-2', 'staff-5', 'staff-8', 'staff-9'],
        addedDate: '2024-04-23',
        rating: 4.6
      },
      {
        eventId: 'event-19',
        eventTitle: 'Awards Ceremony Gala',
        eventType: 'Corporate Event',
        eventDate: '2024-06-15',
        staffIds: ['staff-4', 'staff-7', 'staff-10', 'staff-11'],
        addedDate: '2024-06-16',
        rating: 4.8
      },
      {
        eventId: 'event-27',
        eventTitle: 'Team Building Retreat',
        eventType: 'Corporate Event',
        eventDate: '2024-05-08',
        staffIds: ['staff-1', 'staff-6', 'staff-12'],
        addedDate: '2024-05-09',
        rating: 4.4
      }
    ],
    totalEvents: 8,
    totalSpent: 19200,
    rating: 4.6,
    joinDate: '2023-07-22',
    isActive: true
  },
  {
    id: 'client-3',
    name: 'TechFlow Corporation',
    email: 'events@techflow.com',
    phone: '(555) 345-6789',
    type: 'corporate',
    company: 'TechFlow Corporation',
    address: '789 Corporate Plaza, Century City, CA 90067',
    creditLimit: 50000,
    paymentTerms: 'Net 30',
    preferredStaff: ['staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5'],
    favoriteEvents: [
      {
        eventId: 'event-2',
        eventTitle: 'Tech Launch Event',
        eventType: 'Corporate Event',
        eventDate: '2024-01-18',
        staffIds: ['staff-1', 'staff-2', 'staff-3', 'staff-4', 'staff-5'],
        addedDate: '2024-01-19',
        rating: 5
      },
      {
        eventId: 'event-4',
        eventTitle: 'Company Annual Meeting',
        eventType: 'Corporate Event',
        eventDate: '2024-02-15',
        staffIds: ['staff-1', 'staff-3', 'staff-6', 'staff-8'],
        addedDate: '2024-02-16',
        rating: 4.7
      },
      {
        eventId: 'event-10',
        eventTitle: 'Q1 Board Meeting Catering',
        eventType: 'Corporate Event',
        eventDate: '2024-03-28',
        staffIds: ['staff-2', 'staff-4', 'staff-7', 'staff-9'],
        addedDate: '2024-03-29',
        rating: 4.8
      },
      {
        eventId: 'event-16',
        eventTitle: 'Customer Summit 2024',
        eventType: 'Corporate Event',
        eventDate: '2024-05-16',
        staffIds: ['staff-1', 'staff-5', 'staff-10', 'staff-11', 'staff-12'],
        addedDate: '2024-05-17',
        rating: 4.9
      },
      {
        eventId: 'event-23',
        eventTitle: 'Partnership Announcement',
        eventType: 'Corporate Event',
        eventDate: '2024-04-25',
        staffIds: ['staff-3', 'staff-6', 'staff-13', 'staff-14'],
        addedDate: '2024-04-26',
        rating: 4.6
      },
      {
        eventId: 'event-35',
        eventTitle: 'Innovation Showcase',
        eventType: 'Corporate Event',
        eventDate: '2024-06-08',
        staffIds: ['staff-2', 'staff-8', 'staff-15', 'staff-16'],
        addedDate: '2024-06-09',
        rating: 4.8
      },
      {
        eventId: 'event-48',
        eventTitle: 'Executive Retreat Catering',
        eventType: 'Corporate Event',
        eventDate: '2024-07-20',
        staffIds: ['staff-1', 'staff-4', 'staff-9', 'staff-17'],
        addedDate: '2024-07-21',
        rating: 4.7
      },
      {
        eventId: 'event-58',
        eventTitle: 'IPO Celebration Gala',
        eventType: 'Corporate Event',
        eventDate: '2024-08-30',
        staffIds: ['staff-3', 'staff-5', 'staff-7', 'staff-11', 'staff-18', 'staff-19'],
        addedDate: '2024-08-31',
        rating: 5
      }
    ],
    totalEvents: 24,
    totalSpent: 85000,
    rating: 4.9,
    joinDate: '2022-11-08',
    isActive: true
  }
];

// Mock Invoices
export const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2024-001',
    clientId: 'client-1',
    eventId: 'event-1',
    eventTitle: 'Corporate Holiday Party',
    issueDate: '2024-01-16',
    dueDate: '2024-01-31',
    amount: 2450,
    subtotal: 2200,
    serviceFee: 176,
    tipAmount: 74,
    status: 'pending',
    lineItems: [
      {
        description: '2x Server - Professional service staff',
        quantity: 2,
        rate: 25,
        hours: 5,
        amount: 250
      },
      {
        description: '1x Bartender - Professional bar service',
        quantity: 1,
        rate: 30,
        hours: 5,
        amount: 150
      },
      {
        description: '1x Event Coordinator - Event management',
        quantity: 1,
        rate: 35,
        hours: 6,
        amount: 210
      }
    ]
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2024-002',
    clientId: 'client-1',
    eventId: 'event-2',
    eventTitle: 'Birthday Celebration',
    issueDate: '2024-01-10',
    dueDate: '2024-01-25',
    amount: 1890,
    subtotal: 1750,
    serviceFee: 140,
    tipAmount: 0,
    status: 'paid',
    lineItems: [
      {
        description: '3x Server - Dinner service staff',
        quantity: 3,
        rate: 25,
        hours: 5,
        amount: 375
      },
      {
        description: '1x Chef - Private cooking service',
        quantity: 1,
        rate: 45,
        hours: 6,
        amount: 270
      }
    ],
    paymentDate: '2024-01-20',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2024-003',
    clientId: 'client-2',
    eventId: 'event-3',
    eventTitle: 'Wedding Reception',
    issueDate: '2024-01-05',
    dueDate: '2024-01-20',
    amount: 4250,
    subtotal: 3950,
    serviceFee: 316,
    tipAmount: -16,
    status: 'overdue',
    lineItems: [
      {
        description: '4x Server - Wedding reception service',
        quantity: 4,
        rate: 25,
        hours: 8,
        amount: 800
      },
      {
        description: '2x Bartender - Full bar service',
        quantity: 2,
        rate: 30,
        hours: 8,
        amount: 480
      },
      {
        description: '1x Event Coordinator - Wedding coordination',
        quantity: 1,
        rate: 35,
        hours: 10,
        amount: 350
      }
    ]
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2024-004',
    clientId: 'client-3',
    eventId: 'event-4',
    eventTitle: 'Corporate Conference',
    issueDate: '2024-01-12',
    dueDate: '2024-01-27',
    amount: 3680,
    subtotal: 3400,
    serviceFee: 272,
    tipAmount: 8,
    status: 'paid',
    lineItems: [
      {
        description: '6x Server - Conference catering service',
        quantity: 6,
        rate: 25,
        hours: 6,
        amount: 900
      },
      {
        description: '2x Event Coordinator - Conference management',
        quantity: 2,
        rate: 35,
        hours: 8,
        amount: 560
      }
    ],
    paymentDate: '2024-01-25',
    paymentMethod: 'Corporate Credit'
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-2024-005',
    clientId: 'client-1',
    eventId: 'event-5',
    eventTitle: 'Anniversary Dinner',
    issueDate: '2024-01-18',
    dueDate: '2024-02-02',
    amount: 1650,
    subtotal: 1520,
    serviceFee: 122,
    tipAmount: 8,
    status: 'draft',
    lineItems: [
      {
        description: '2x Server - Intimate dinner service',
        quantity: 2,
        rate: 25,
        hours: 4,
        amount: 200
      },
      {
        description: '1x Chef - Private chef service',
        quantity: 1,
        rate: 45,
        hours: 5,
        amount: 225
      }
    ]
  }
];

// Additional helper functions for new data
export const getInvoicesByClient = (clientId: string) => mockInvoices.filter(invoice => invoice.clientId === clientId);
export const getClientById = (clientId: string) => mockClients.find(client => client.id === clientId);
