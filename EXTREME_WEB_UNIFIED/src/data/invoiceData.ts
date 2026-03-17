// Centralized invoice data for consistent use across the application
export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  notes?: string;
}

export interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  hours: number;
  total: number;
}

export const invoiceData: Invoice[] = [
  {
    id: "INV-2024-145",
    clientId: "client-001",
    clientName: "Sarah Johnson",
    clientEmail: "sarah@innovatecorp.com",
    clientPhone: "+1-555-0101",
    clientAddress: "123 Innovation Drive, New York, NY 10001",
    eventName: "Annual Conference 2024",
    eventDate: "2024-11-25",
    eventLocation: "Grand Conference Center",
    amount: 28500,
    status: "pending",
    issueDate: "2024-11-15",
    dueDate: "2024-12-01",
    lineItems: [
      { description: "15x Servers - 8 hours @ $35/hr", quantity: 15, rate: 35, hours: 8, total: 4200 },
      { description: "12x Bartenders - 8 hours @ $45/hr", quantity: 12, rate: 45, hours: 8, total: 4320 },
      { description: "4x Event Coordinators - 8 hours @ $55/hr", quantity: 4, rate: 55, hours: 8, total: 1760 },
      { description: "Premium Service Fee", quantity: 1, rate: 500, hours: 1, total: 500 },
    ],
    subtotal: 10780,
    tax: 1940,
    taxRate: 18,
    total: 28500,
    notes: "Annual conference staffing - payment due within 16 days of event completion."
  },
  {
    id: "INV-2024-144",
    clientId: "client-002",
    clientName: "David Martinez",
    clientEmail: "david@techsolutions.com",
    clientPhone: "+1-555-0102",
    clientAddress: "456 Tech Park, San Francisco, CA 94105",
    eventName: "Product Launch",
    eventDate: "2024-10-28",
    eventLocation: "Innovation Hub",
    amount: 12500,
    status: "overdue",
    issueDate: "2024-10-01",
    dueDate: "2024-10-15",
    lineItems: [
      { description: "10x Servers - 8 hours @ $35/hr", quantity: 10, rate: 35, hours: 8, total: 2800 },
      { description: "8x Bartenders - 8 hours @ $45/hr", quantity: 8, rate: 45, hours: 8, total: 2880 },
      { description: "3x Event Coordinators - 8 hours @ $55/hr", quantity: 3, rate: 55, hours: 8, total: 1320 },
      { description: "Equipment Rental", quantity: 1, rate: 400, hours: 1, total: 400 },
    ],
    subtotal: 7400,
    tax: 1332,
    taxRate: 18,
    total: 12500,
    notes: "OVERDUE: This invoice is past due. Please remit payment immediately to avoid service interruption."
  },
  {
    id: "INV-2024-143",
    clientId: "client-001",
    clientName: "Sarah Johnson",
    clientEmail: "sarah@innovatecorp.com",
    clientPhone: "+1-555-0101",
    clientAddress: "123 Innovation Drive, New York, NY 10001",
    eventName: "Product Launch Party",
    eventDate: "2024-10-20",
    eventLocation: "Rooftop Venue",
    amount: 12200,
    status: "paid",
    issueDate: "2024-11-01",
    dueDate: "2024-11-15",
    paidDate: "2024-11-10",
    paymentMethod: "Bank Transfer",
    lineItems: [
      { description: "8x Servers - 6 hours @ $35/hr", quantity: 8, rate: 35, hours: 6, total: 1680 },
      { description: "6x Bartenders - 6 hours @ $45/hr", quantity: 6, rate: 45, hours: 6, total: 1620 },
      { description: "2x Event Coordinators - 6 hours @ $55/hr", quantity: 2, rate: 55, hours: 6, total: 660 },
      { description: "Service Fee", quantity: 1, rate: 200, hours: 1, total: 200 },
    ],
    subtotal: 4160,
    tax: 749,
    taxRate: 18,
    total: 12200,
    notes: "Payment received via bank transfer. Thank you for your continued business!"
  },
  {
    id: "INV-2024-142",
    clientId: "client-003",
    clientName: "Emily Chen",
    clientEmail: "emily@globalevents.com",
    clientPhone: "+1-555-0103",
    clientAddress: "789 Event Plaza, Los Angeles, CA 90001",
    eventName: "Corporate Gala",
    eventDate: "2024-11-01",
    eventLocation: "Metropolitan Ballroom",
    amount: 18900,
    status: "paid",
    issueDate: "2024-10-25",
    dueDate: "2024-11-08",
    paidDate: "2024-11-05",
    paymentMethod: "Credit Card",
    lineItems: [
      { description: "12x Servers - 8 hours @ $35/hr", quantity: 12, rate: 35, hours: 8, total: 3360 },
      { description: "10x Bartenders - 8 hours @ $45/hr", quantity: 10, rate: 45, hours: 8, total: 3600 },
      { description: "3x Event Coordinators - 8 hours @ $55/hr", quantity: 3, rate: 55, hours: 8, total: 1320 },
      { description: "Weekend Premium (20%)", quantity: 1, rate: 1656, hours: 1, total: 1656 },
    ],
    subtotal: 9936,
    tax: 1789,
    taxRate: 18,
    total: 18900,
    notes: "Payment received on time. Excellent partnership!"
  },
  {
    id: "INV-2024-141",
    clientId: "client-004",
    clientName: "Michael Brown",
    clientEmail: "michael@corpdynamics.com",
    clientPhone: "+1-555-0104",
    clientAddress: "321 Corporate Way, Chicago, IL 60601",
    eventName: "Networking Event",
    eventDate: "2024-11-18",
    eventLocation: "Business Center",
    amount: 8400,
    status: "pending",
    issueDate: "2024-11-10",
    dueDate: "2024-11-24",
    lineItems: [
      { description: "6x Servers - 8 hours @ $35/hr", quantity: 6, rate: 35, hours: 8, total: 1680 },
      { description: "5x Bartenders - 8 hours @ $45/hr", quantity: 5, rate: 45, hours: 8, total: 1800 },
      { description: "2x Event Coordinators - 8 hours @ $55/hr", quantity: 2, rate: 55, hours: 8, total: 880 },
      { description: "Service Fee", quantity: 1, rate: 150, hours: 1, total: 150 },
    ],
    subtotal: 4510,
    tax: 812,
    taxRate: 18,
    total: 8400,
    notes: "Payment due 14 days after invoice date. Thank you!"
  },
  {
    id: "INV-2024-140",
    clientId: "client-007",
    clientName: "Amanda Garcia",
    clientEmail: "amanda@stellarevents.com",
    clientPhone: "+1-555-0107",
    clientAddress: "654 Summit Road, Seattle, WA 98101",
    eventName: "Tech Summit",
    eventDate: "2024-11-05",
    eventLocation: "Convention Center",
    amount: 15600,
    status: "paid",
    issueDate: "2024-10-28",
    dueDate: "2024-11-11",
    paidDate: "2024-11-08",
    paymentMethod: "ACH Transfer",
    lineItems: [
      { description: "10x Servers - 8 hours @ $35/hr", quantity: 10, rate: 35, hours: 8, total: 2800 },
      { description: "8x Bartenders - 8 hours @ $45/hr", quantity: 8, rate: 45, hours: 8, total: 2880 },
      { description: "3x Event Coordinators - 8 hours @ $55/hr", quantity: 3, rate: 55, hours: 8, total: 1320 },
      { description: "Technology Setup Fee", quantity: 1, rate: 350, hours: 1, total: 350 },
    ],
    subtotal: 7350,
    tax: 1323,
    taxRate: 18,
    total: 15600,
    notes: "Prompt payment received. Thank you for your business!"
  },
  {
    id: "INV-2024-139",
    clientId: "client-009",
    clientName: "Lisa Anderson",
    clientEmail: "lisa@prestigeaffairs.com",
    clientPhone: "+1-555-0109",
    clientAddress: "987 Prestige Lane, Denver, CO 80201",
    eventName: "Industry Conference",
    eventDate: "2024-09-22",
    eventLocation: "Conference Hall",
    amount: 15000,
    status: "overdue",
    issueDate: "2024-09-15",
    dueDate: "2024-09-29",
    lineItems: [
      { description: "12x Servers - 8 hours @ $35/hr", quantity: 12, rate: 35, hours: 8, total: 3360 },
      { description: "9x Bartenders - 8 hours @ $45/hr", quantity: 9, rate: 45, hours: 8, total: 3240 },
      { description: "3x Event Coordinators - 8 hours @ $55/hr", quantity: 3, rate: 55, hours: 8, total: 1320 },
      { description: "Service Fee", quantity: 1, rate: 300, hours: 1, total: 300 },
    ],
    subtotal: 8220,
    tax: 1480,
    taxRate: 18,
    total: 15000,
    notes: "OVERDUE: Payment is significantly past due. Late fees may apply. Please contact our billing department."
  },
  {
    id: "INV-2024-138",
    clientId: "client-001",
    clientName: "Sarah Johnson",
    clientEmail: "sarah@innovatecorp.com",
    clientPhone: "+1-555-0101",
    clientAddress: "123 Innovation Drive, New York, NY 10001",
    eventName: "Summer Gala",
    eventDate: "2024-08-15",
    eventLocation: "Garden Estate",
    amount: 35600,
    status: "paid",
    issueDate: "2024-08-08",
    dueDate: "2024-08-22",
    paidDate: "2024-08-20",
    paymentMethod: "Wire Transfer",
    lineItems: [
      { description: "20x Servers - 10 hours @ $35/hr", quantity: 20, rate: 35, hours: 10, total: 7000 },
      { description: "15x Bartenders - 10 hours @ $45/hr", quantity: 15, rate: 45, hours: 10, total: 6750 },
      { description: "5x Event Coordinators - 10 hours @ $55/hr", quantity: 5, rate: 55, hours: 10, total: 2750 },
      { description: "Premium Service Package", quantity: 1, rate: 1000, hours: 1, total: 1000 },
    ],
    subtotal: 17500,
    tax: 3150,
    taxRate: 18,
    total: 35600,
    notes: "Large event - payment received on time. Excellent partnership!"
  },
  {
    id: "INV-2024-137",
    clientId: "client-012",
    clientName: "Kevin Rodriguez",
    clientEmail: "kevin@quantumconf.com",
    clientPhone: "+1-555-0112",
    clientAddress: "456 Quantum Blvd, Dallas, TX 75201",
    eventName: "Annual Meeting",
    eventDate: "2024-11-10",
    eventLocation: "Business Tower",
    amount: 22400,
    status: "paid",
    issueDate: "2024-11-08",
    dueDate: "2024-11-22",
    paidDate: "2024-11-15",
    paymentMethod: "Corporate Account",
    lineItems: [
      { description: "14x Servers - 8 hours @ $35/hr", quantity: 14, rate: 35, hours: 8, total: 3920 },
      { description: "11x Bartenders - 8 hours @ $45/hr", quantity: 11, rate: 45, hours: 8, total: 3960 },
      { description: "4x Event Coordinators - 8 hours @ $55/hr", quantity: 4, rate: 55, hours: 8, total: 1760 },
      { description: "Premium Equipment Package", quantity: 1, rate: 600, hours: 1, total: 600 },
    ],
    subtotal: 10240,
    tax: 1843,
    taxRate: 18,
    total: 22400,
    notes: "Corporate account payment processed. Thank you!"
  },
  {
    id: "INV-2024-136",
    clientId: "client-006",
    clientName: "Robert Taylor",
    clientEmail: "robert@primeprod.com",
    clientPhone: "+1-555-0106",
    clientAddress: "789 Production Ave, Austin, TX 78701",
    eventName: "Product Demo",
    eventDate: "2024-11-20",
    eventLocation: "Tech Center",
    amount: 5200,
    status: "pending",
    issueDate: "2024-11-12",
    dueDate: "2024-11-26",
    lineItems: [
      { description: "4x Event Staff - 6 hours @ $35/hr", quantity: 4, rate: 35, hours: 6, total: 840 },
      { description: "2x Bartenders - 6 hours @ $45/hr", quantity: 2, rate: 45, hours: 6, total: 540 },
      { description: "1x Event Coordinator - 6 hours @ $55/hr", quantity: 1, rate: 55, hours: 6, total: 330 },
      { description: "Setup Fee", quantity: 1, rate: 120, hours: 1, total: 120 },
    ],
    subtotal: 1830,
    tax: 329,
    taxRate: 18,
    total: 5200,
    notes: "Small event staffing - payment due within 14 days."
  },
  {
    id: "INV-2024-135",
    clientId: "client-003",
    clientName: "Emily Chen",
    clientEmail: "emily@globalevents.com",
    clientPhone: "+1-555-0103",
    clientAddress: "789 Event Plaza, Los Angeles, CA 90001",
    eventName: "Team Building",
    eventDate: "2024-09-28",
    eventLocation: "Adventure Park",
    amount: 9800,
    status: "paid",
    issueDate: "2024-09-20",
    dueDate: "2024-10-04",
    paidDate: "2024-10-02",
    paymentMethod: "Check",
    lineItems: [
      { description: "6x Event Staff - 8 hours @ $35/hr", quantity: 6, rate: 35, hours: 8, total: 1680 },
      { description: "4x Activity Coordinators - 8 hours @ $45/hr", quantity: 4, rate: 45, hours: 8, total: 1440 },
      { description: "2x Event Managers - 8 hours @ $55/hr", quantity: 2, rate: 55, hours: 8, total: 880 },
      { description: "Equipment & Materials", quantity: 1, rate: 300, hours: 1, total: 300 },
    ],
    subtotal: 4300,
    tax: 774,
    taxRate: 18,
    total: 9800,
    notes: "Team building event - payment received by check."
  },
  {
    id: "INV-2024-134",
    clientId: "client-007",
    clientName: "Amanda Garcia",
    clientEmail: "amanda@stellarevents.com",
    clientPhone: "+1-555-0107",
    clientAddress: "654 Summit Road, Seattle, WA 98101",
    eventName: "Charity Fundraiser",
    eventDate: "2024-08-22",
    eventLocation: "Grand Ballroom",
    amount: 11200,
    status: "paid",
    issueDate: "2024-08-15",
    dueDate: "2024-08-29",
    paidDate: "2024-08-28",
    paymentMethod: "Credit Card",
    lineItems: [
      { description: "8x Servers - 8 hours @ $35/hr", quantity: 8, rate: 35, hours: 8, total: 2240 },
      { description: "6x Bartenders - 8 hours @ $45/hr", quantity: 6, rate: 45, hours: 8, total: 2160 },
      { description: "2x Event Coordinators - 8 hours @ $55/hr", quantity: 2, rate: 55, hours: 8, total: 880 },
      { description: "Charity Event Discount (10%)", quantity: 1, rate: -528, hours: 1, total: -528 },
    ],
    subtotal: 4752,
    tax: 855,
    taxRate: 18,
    total: 11200,
    notes: "Charity event with special discount. Payment received on time!"
  }
];
