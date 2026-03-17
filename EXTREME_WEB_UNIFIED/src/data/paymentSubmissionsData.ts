// Generate 50+ payment submissions for testing pagination

const clientNames = [
  "Robert Smith", "TechCorp Inc", "Sarah Johnson", "Marketing Agency", "Corporate Events Ltd",
  "James Wilson", "EventPro Solutions", "Lisa Anderson", "Global Enterprises", "Michael Brown",
  "Premium Events Co", "Jennifer Davis", "Elite Catering Group", "David Martinez", "Luxury Venues Inc",
  "Emily Rodriguez", "Business Solutions LLC", "Christopher Lee", "Wedding Planners Co", "Amanda White",
  "Innovation Corp", "Matthew Taylor", "Celebration Services", "Ashley Thomas", "Fortune 500 Inc",
  "Daniel Jackson", "Party Perfect LLC", "Sophia Harris", "Enterprise Holdings", "Joseph Martin",
  "Eventful Experiences", "Olivia Thompson", "Corporate Affairs Inc", "William Garcia", "Special Events Co",
  "Isabella Moore", "Business Events Ltd", "Ethan Clark", "VIP Services Inc", "Mia Lewis",
  "Executive Events", "Alexander Walker", "Premium Catering", "Charlotte Hall", "Global Business Inc",
  "Benjamin Allen", "Elite Events Co", "Amelia Young", "Corporate Gatherings", "Lucas King",
  "Event Excellence", "Harper Wright", "Business Ventures Inc", "Henry Lopez", "Celebration Central"
];

const eventTypes = [
  "Birthday Party", "Wedding Reception", "Corporate Conference", "Annual Gala",
  "Product Launch", "Team Building Event", "Charity Fundraiser", "Holiday Party",
  "Retirement Celebration", "Graduation Party", "Networking Event", "Trade Show",
  "Award Ceremony", "Company Picnic", "Client Appreciation Event", "Anniversary Celebration"
];

const paymentMethods = [
  "Bank Transfer", "Credit Card", "Wire Transfer", "Check", "ACH Transfer"
];

const paymentTypes = [
  "Deposit Payment", "Final Payment", "Full Payment", "Partial Payment"
];

const statuses = ["pending", "approved", "rejected"];

export interface PaymentSubmission {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany: string;
  clientAddress: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventType: string;
  guestCount: number;
  staffCount: number;
  amount: number;
  paymentType: string;
  submittedDate: string;
  submittedTime: string;
  status: "pending" | "approved" | "rejected";
  paymentMethod: string;
  reference: string;
  accountLast4: string;
  submittedBy: string;
  deposit: number;
  remaining: number;
  totalContract: number;
  attachments: number;
  breakdown: Array<{
    item: string;
    quantity: number;
    rate: number;
    hours: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  attachmentDetails: Array<{
    id: number;
    name: string;
    size: string;
    type: string;
    uploadedAt: string;
    url: string;
  }>;
  notes: string;
}

const generateReference = (method: string, index: number) => {
  switch (method) {
    case "Bank Transfer":
      return `TXN-${(9876543210 - index * 123).toString()}`;
    case "Credit Card":
      return `CC-${Math.floor(1000 + Math.random() * 9000)}-****-${Math.floor(1000 + Math.random() * 9000)}`;
    case "Wire Transfer":
      return `WIRE-${(987654321 - index * 111).toString()}`;
    case "Check":
      return `CHK-#${(45678 + index).toString()}`;
    case "ACH Transfer":
      return `ACH-${(1122334455 + index).toString()}`;
    default:
      return `REF-${index}`;
  }
};

const generateDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const generateEventDate = (daysFromNow: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

const generateTime = (hour: number) => {
  const startHour = hour % 12 || 12;
  const endHour = (hour + 5) % 12 || 12;
  const startPeriod = hour < 12 ? "AM" : "PM";
  const endPeriod = (hour + 5) < 12 ? "AM" : "PM";
  return `${startHour}:00 ${startPeriod} - ${endHour}:00 ${endPeriod}`;
};

export const generatePaymentSubmissions = (): PaymentSubmission[] => {
  const submissions: PaymentSubmission[] = [];

  for (let i = 0; i < 55; i++) {
    const clientName = clientNames[i % clientNames.length];
    const paymentMethod = paymentMethods[i % paymentMethods.length];
    const paymentType = paymentTypes[i % paymentTypes.length];
    const eventType = eventTypes[i % eventTypes.length];
    
    // More pending at the start, mix of approved/rejected later
    let status: "pending" | "approved" | "rejected";
    if (i < 20) {
      status = "pending";
    } else if (i < 40) {
      status = i % 3 === 0 ? "rejected" : "approved";
    } else {
      status = statuses[i % statuses.length] as "pending" | "approved" | "rejected";
    }

    const baseAmount = 1000 + (i * 150);
    const guestCount = 25 + (i * 5);
    const staffCount = 3 + Math.floor(i / 5);
    
    const subtotal = baseAmount;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;
    
    const deposit = paymentType === "Final Payment" ? Math.round(total * 0.4) : 0;
    const remaining = paymentType === "Final Payment" ? total - deposit : total;

    const breakdown = [
      {
        item: `Bartenders (${Math.ceil(staffCount / 4)})`,
        quantity: Math.ceil(staffCount / 4),
        rate: 45,
        hours: 5,
        total: Math.ceil(staffCount / 4) * 45 * 5,
      },
      {
        item: `Servers (${Math.ceil(staffCount / 2)})`,
        quantity: Math.ceil(staffCount / 2),
        rate: 35,
        hours: 5,
        total: Math.ceil(staffCount / 2) * 35 * 5,
      },
      {
        item: "Event Coordinator (1)",
        quantity: 1,
        rate: 55,
        hours: 6,
        total: 330,
      },
      {
        item: `Setup Crew (${Math.floor(staffCount / 3)})`,
        quantity: Math.floor(staffCount / 3),
        rate: 30,
        hours: 3,
        total: Math.floor(staffCount / 3) * 30 * 3,
      },
    ];

    const numAttachments = 1 + (i % 3);
    const attachmentDetails = [];
    for (let j = 0; j < numAttachments; j++) {
      attachmentDetails.push({
        id: j + 1,
        name: j === 0 
          ? `${paymentMethod.toLowerCase().replace(' ', '_')}_receipt.pdf`
          : j === 1
          ? "payment_confirmation.png"
          : "authorization_letter.pdf",
        size: `${150 + j * 100} KB`,
        type: j === 1 ? "image/png" : "application/pdf",
        uploadedAt: `${10 + j}:${20 + j * 5} AM`,
        url: "#",
      });
    }

    submissions.push({
      id: `PAY-2024-${String(i + 1).padStart(3, '0')}`,
      clientName,
      clientEmail: `${clientName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      clientPhone: `+1 (555) ${String(100 + i).padStart(3, '0')}-${String(1000 + i * 7).slice(0, 4)}`,
      clientCompany: clientName.includes('Inc') || clientName.includes('Corp') || clientName.includes('LLC') || clientName.includes('Ltd') || clientName.includes('Co') ? clientName : `${clientName} Enterprises`,
      clientAddress: `${100 + i * 5} ${['Main St', 'Oak Ave', 'Park Blvd', 'Elm Street', 'Broadway'][i % 5]}, ${['Los Angeles', 'San Francisco', 'San Diego', 'Santa Monica', 'Pasadena'][i % 5]}, CA ${90001 + i}`,
      eventName: `${eventType} - ${clientName.split(' ')[clientName.split(' ').length - 1]}`,
      eventDate: generateEventDate(i * 2),
      eventTime: generateTime(9 + (i % 12)),
      eventLocation: `${['Grand Ballroom', 'Sunset Gardens', 'Conference Center', 'Beach Club', 'Historic Mansion'][i % 5]}, ${100 + i * 10} ${['Convention Blvd', 'Beach Ave', 'Garden Lane', 'Harbor Drive', 'Mountain View'][i % 5]}, CA`,
      eventType,
      guestCount,
      staffCount,
      amount: remaining,
      paymentType,
      submittedDate: generateDate(i % 30),
      submittedTime: `${(9 + (i % 8))}:${String((i * 5) % 60).padStart(2, '0')} ${(9 + (i % 8)) < 12 ? 'AM' : 'PM'}`,
      status,
      paymentMethod,
      reference: generateReference(paymentMethod, i),
      accountLast4: String(1000 + i * 111).slice(-4),
      submittedBy: clientName + (i % 3 === 0 ? " - Finance Manager" : ""),
      deposit,
      remaining,
      totalContract: total,
      attachments: numAttachments,
      breakdown,
      subtotal,
      tax,
      total,
      attachmentDetails,
      notes: i % 4 === 0 
        ? `Client submitted payment proof via ${paymentMethod.toLowerCase()}. Please verify the transaction reference number matches our records.`
        : i % 4 === 1
        ? `Corporate payment requiring authorization verification.`
        : i % 4 === 2
        ? `Payment includes processing fees. Please confirm total matches invoice.`
        : `Standard payment submission for ${eventType.toLowerCase()}.`,
    });
  }

  return submissions;
};

export const paymentSubmissions = generatePaymentSubmissions();
