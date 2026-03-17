// Centralized client data
export interface ClientData {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  totalEvents: number;
  totalSpent: number;
  averageRating: number;
  status: 'platinum' | 'gold' | 'silver' | 'active';
  joinDate: string;
  lastEvent: string;
  outstandingBalance: number;
  lifetimeValue: number;
  upcomingEvents: number;
  accountManager: string;
  excludedStaff?: string[]; // Array of Staff IDs to exclude
}

export const clientData: ClientData[] = [
  {
    id: "client-001",
    name: "Sarah Johnson",
    company: "Innovate Corp",
    email: "sarah@innovatecorp.com",
    phone: "+1-555-0101",
    location: "New York, NY",
    totalEvents: 24,
    totalSpent: 185000,
    averageRating: 4.8,
    status: "platinum",
    joinDate: "2023-01-15",
    lastEvent: "2024-11-08",
    outstandingBalance: 28500,
    lifetimeValue: 185000,
    upcomingEvents: 2,
    accountManager: "Michael Chen",
    excludedStaff: ["st-005", "st-012"]
  },
  {
    id: "client-002",
    name: "David Martinez",
    company: "Tech Solutions Ltd",
    email: "david@techsolutions.com",
    phone: "+1-555-0102",
    location: "San Francisco, CA",
    totalEvents: 18,
    totalSpent: 142000,
    averageRating: 4.6,
    status: "platinum",
    joinDate: "2023-03-20",
    lastEvent: "2024-10-28",
    outstandingBalance: 12500,
    lifetimeValue: 142000,
    upcomingEvents: 1,
    accountManager: "Sarah Williams",
    excludedStaff: []
  },
  {
    id: "client-003",
    name: "Emily Chen",
    company: "Global Events Inc",
    email: "emily@globalevents.com",
    phone: "+1-555-0103",
    location: "Los Angeles, CA",
    totalEvents: 15,
    totalSpent: 98000,
    averageRating: 4.9,
    status: "gold",
    joinDate: "2023-05-10",
    lastEvent: "2024-11-01",
    outstandingBalance: 0,
    lifetimeValue: 98000,
    upcomingEvents: 3,
    accountManager: "Michael Chen",
    excludedStaff: ["st-008"]
  },
  {
    id: "client-004",
    name: "Michael Brown",
    company: "Corporate Dynamics",
    email: "michael@corpdynamics.com",
    phone: "+1-555-0104",
    location: "Chicago, IL",
    totalEvents: 12,
    totalSpent: 76000,
    averageRating: 4.5,
    status: "gold",
    joinDate: "2023-07-22",
    lastEvent: "2024-10-15",
    outstandingBalance: 8400,
    lifetimeValue: 76000,
    upcomingEvents: 0,
    accountManager: "Jennifer Lopez"
  },
  {
    id: "client-005",
    name: "Jennifer Wilson",
    company: "Horizon Hospitality",
    email: "jennifer@horizonhosp.com",
    phone: "+1-555-0105",
    location: "Miami, FL",
    totalEvents: 9,
    totalSpent: 54000,
    averageRating: 4.7,
    status: "silver",
    joinDate: "2023-09-05",
    lastEvent: "2024-09-20",
    outstandingBalance: 0,
    lifetimeValue: 54000,
    upcomingEvents: 1,
    accountManager: "Sarah Williams"
  },
  {
    id: "client-006",
    name: "Robert Taylor",
    company: "Prime Productions",
    email: "robert@primeprod.com",
    phone: "+1-555-0106",
    location: "Austin, TX",
    totalEvents: 7,
    totalSpent: 42000,
    averageRating: 4.4,
    status: "silver",
    joinDate: "2023-11-12",
    lastEvent: "2024-08-30",
    outstandingBalance: 5200,
    lifetimeValue: 42000,
    upcomingEvents: 0,
    accountManager: "Michael Chen"
  },
  {
    id: "client-007",
    name: "Amanda Garcia",
    company: "Stellar Events",
    email: "amanda@stellarevents.com",
    phone: "+1-555-0107",
    location: "Seattle, WA",
    totalEvents: 11,
    totalSpent: 68000,
    averageRating: 4.8,
    status: "gold",
    joinDate: "2023-06-18",
    lastEvent: "2024-11-05",
    outstandingBalance: 0,
    lifetimeValue: 68000,
    upcomingEvents: 2,
    accountManager: "Jennifer Lopez"
  },
  {
    id: "client-008",
    name: "Christopher Lee",
    company: "Metro Gatherings",
    email: "chris@metrogatherings.com",
    phone: "+1-555-0108",
    location: "Boston, MA",
    totalEvents: 5,
    totalSpent: 28000,
    averageRating: 4.3,
    status: "active",
    joinDate: "2024-02-14",
    lastEvent: "2024-07-12",
    outstandingBalance: 0,
    lifetimeValue: 28000,
    upcomingEvents: 1,
    accountManager: "Sarah Williams"
  },
  {
    id: "client-009",
    name: "Lisa Anderson",
    company: "Prestige Affairs",
    email: "lisa@prestigeaffairs.com",
    phone: "+1-555-0109",
    location: "Denver, CO",
    totalEvents: 14,
    totalSpent: 89000,
    averageRating: 4.6,
    status: "gold",
    joinDate: "2023-04-25",
    lastEvent: "2024-10-22",
    outstandingBalance: 15000,
    lifetimeValue: 89000,
    upcomingEvents: 1,
    accountManager: "Michael Chen"
  },
  {
    id: "client-010",
    name: "Daniel White",
    company: "Elite Experiences",
    email: "daniel@eliteexp.com",
    phone: "+1-555-0110",
    location: "Portland, OR",
    totalEvents: 8,
    totalSpent: 51000,
    averageRating: 4.9,
    status: "silver",
    joinDate: "2023-08-30",
    lastEvent: "2024-09-15",
    outstandingBalance: 0,
    lifetimeValue: 51000,
    upcomingEvents: 0,
    accountManager: "Jennifer Lopez"
  },
  {
    id: "client-011",
    name: "Michelle Thompson",
    company: "Apex Events Group",
    email: "michelle@apexevents.com",
    phone: "+1-555-0111",
    location: "Atlanta, GA",
    totalEvents: 6,
    totalSpent: 37000,
    averageRating: 4.5,
    status: "silver",
    joinDate: "2024-01-08",
    lastEvent: "2024-08-05",
    outstandingBalance: 0,
    lifetimeValue: 37000,
    upcomingEvents: 1,
    accountManager: "Sarah Williams"
  },
  {
    id: "client-012",
    name: "Kevin Rodriguez",
    company: "Quantum Conferences",
    email: "kevin@quantumconf.com",
    phone: "+1-555-0112",
    location: "Dallas, TX",
    totalEvents: 19,
    totalSpent: 156000,
    averageRating: 4.7,
    status: "platinum",
    joinDate: "2023-02-28",
    lastEvent: "2024-11-10",
    outstandingBalance: 0,
    lifetimeValue: 156000,
    upcomingEvents: 3,
    accountManager: "Michael Chen"
  }
];

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  eventName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
}

export const invoiceData: Invoice[] = [
  {
    id: "INV-2024-001",
    clientId: "client-001",
    clientName: "Innovate Corp",
    eventName: "Annual Tech Summit",
    amount: 28500,
    status: "pending",
    issueDate: "2024-11-09",
    dueDate: "2024-11-23"
  },
  {
    id: "INV-2024-002",
    clientId: "client-002",
    clientName: "Tech Solutions Ltd",
    eventName: "Q3 Review Meeting",
    amount: 12500,
    status: "overdue",
    issueDate: "2024-10-30",
    dueDate: "2024-11-13"
  },
  {
    id: "INV-2024-003",
    clientId: "client-003",
    clientName: "Global Events Inc",
    eventName: "Product Launch",
    amount: 45000,
    status: "paid",
    issueDate: "2024-11-02",
    dueDate: "2024-11-16",
    paidDate: "2024-11-05"
  },
  {
    id: "INV-2024-004",
    clientId: "client-004",
    clientName: "Corporate Dynamics",
    eventName: "Leadership Retreat",
    amount: 8400,
    status: "pending",
    issueDate: "2024-10-16",
    dueDate: "2024-10-30"
  },
  {
    id: "INV-2024-005",
    clientId: "client-006",
    clientName: "Prime Productions",
    eventName: "Film Festival Gala",
    amount: 5200,
    status: "overdue",
    issueDate: "2024-09-01",
    dueDate: "2024-09-15"
  },
  {
    id: "INV-2024-006",
    clientId: "client-009",
    clientName: "Prestige Affairs",
    eventName: "Wedding Expo",
    amount: 15000,
    status: "pending",
    issueDate: "2024-10-23",
    dueDate: "2024-11-06"
  },
  {
    id: "INV-2024-007",
    clientId: "client-012",
    clientName: "Quantum Conferences",
    eventName: "Science Symposium",
    amount: 32000,
    status: "paid",
    issueDate: "2024-11-11",
    dueDate: "2024-11-25",
    paidDate: "2024-11-14"
  },
  {
    id: "INV-2024-008",
    clientId: "client-001",
    clientName: "Innovate Corp",
    eventName: "Holiday Party Deposit",
    amount: 5000,
    status: "paid",
    issueDate: "2024-10-01",
    dueDate: "2024-10-15",
    paidDate: "2024-10-10"
  },
  {
    id: "INV-2024-009",
    clientId: "client-007",
    clientName: "Stellar Events",
    eventName: "Summer Concert Series",
    amount: 18000,
    status: "paid",
    issueDate: "2024-08-15",
    dueDate: "2024-08-29",
    paidDate: "2024-08-28"
  },
  {
    id: "INV-2024-010",
    clientId: "client-005",
    clientName: "Horizon Hospitality",
    eventName: "Hotel Grand Opening",
    amount: 22000,
    status: "paid",
    issueDate: "2024-09-21",
    dueDate: "2024-10-05",
    paidDate: "2024-10-01"
  }
];
