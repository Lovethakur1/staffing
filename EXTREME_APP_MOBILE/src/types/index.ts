export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'STAFF' | 'ADMIN' | 'MANAGER' | 'CLIENT' | 'SUB_ADMIN' | 'SCHEDULER';
  avatar?: string;
  isActive: boolean;
  staffProfile?: StaffProfile;
}

export interface StaffProfile {
  id: string;
  skills: string[];
  hourlyRate: number;
  rating: number;
  totalEvents: number;
  availabilityStatus: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  eventType?: string;
  venue?: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  locationLat?: number;
  locationLng?: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  staffRequired: number;
  dressCode?: string;
  contactOnSite?: string;
  contactOnSitePhone?: string;
  specialRequirements?: string;
}

export type ShiftStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'YET_TO_START'
  | 'TRAVEL_TO_VENUE'
  | 'ARRIVED'
  | 'ONGOING'
  | 'IN_PROGRESS'
  | 'BREAK'
  | 'COMPLETED'
  | 'TRAVEL_HOME';

export interface ShiftBreak {
  id: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
}

export interface Shift {
  id: string;
  eventId: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  reportTime?: string;
  status: ShiftStatus;
  role?: string;
  hourlyRate: number;
  guaranteedHours?: number;
  travelEnabled: boolean;
  clockIn?: string;
  clockOut?: string;
  totalHours?: number;
  totalPay?: number;
  travelStartTime?: string;
  travelArrivalTime?: string;
  travelHomeStart?: string;
  travelHomeEnd?: string;
  travelLat?: number;
  travelLng?: number;
  tipsReceived: number;
  parkingAmount?: number;
  event?: Event;
  staff?: Pick<User, 'id' | 'name' | 'phone' | 'avatar'>;
  breaks?: ShiftBreak[];
}

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  ManagerMain: undefined;
  ShiftWorkflow: { shiftId: string };
  LiveMap: {
    shiftId: string;
    eventLat?: number;
    eventLng?: number;
    eventTitle?: string;
    eventAddress?: string;
  };
  ChatDetail: { conversationId: string; conversationName: string };
  NewChat: undefined;
  Notifications: undefined;
  // Drawer screens
  Timesheets: undefined;
  Payroll: undefined;
  TrainingPortal: undefined;
  Certifications: undefined;
  Performance: undefined;
  Documents: undefined;
  Analytics: undefined;
  Resources: undefined;
  HelpSupport: undefined;
  Documentation: undefined;
  Equipment: undefined;
  IncidentReport: undefined;
  // Manager screens
  ManagerEvents: undefined;
  ManagerEventDetail: { eventId: string };
  ManagerStaff: undefined;
  ManagerStaffDetail: { staffId: string };
  ManagerReports: undefined;
  ManagerTimesheets: undefined;
  ManagerIncidents: undefined;
  ManagerIncidentDetail: { incidentId: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  MyShifts: undefined;
  Inbox: undefined;
  Profile: undefined;
};

export type ManagerTabParamList = {
  ManagerDashboard: undefined;
  ManagerMyShifts: undefined;
  ManagerInbox: undefined;
  ManagerProfile: undefined;
};
