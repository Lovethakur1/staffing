// Generate 50+ event requests for testing pagination

const clientNames = [
  "Emma Williams", "Michael Chen", "Sarah Johnson", "David Martinez", "Jennifer Rodriguez",
  "Robert Taylor", "Lisa Anderson", "James Wilson", "Maria Garcia", "Christopher Lee",
  "Amanda White", "Daniel Brown", "Jessica Davis", "Matthew Miller", "Ashley Moore",
  "Joseph Taylor", "Sophia Anderson", "Andrew Thomas", "Olivia Jackson", "Ryan Harris",
  "Emily Martin", "Kevin Thompson", "Michelle Garcia", "Brandon Martinez", "Stephanie Robinson",
  "Nicholas Clark", "Lauren Rodriguez", "Justin Lewis", "Rachel Lee", "Tyler Walker",
  "Nicole Hall", "Steven Allen", "Megan Young", "Eric Hernandez", "Kimberly King",
  "Jonathan Wright", "Amy Lopez", "Jacob Hill", "Elizabeth Scott", "Alexander Green",
  "Samantha Adams", "William Baker", "Rebecca Nelson", "Christian Carter", "Laura Mitchell",
  "Benjamin Perez", "Hannah Roberts", "Nathan Turner", "Victoria Phillips", "Joshua Campbell"
];

const companyNames = [
  "TechCorp Industries", "Chen Enterprises", "Johnson & Associates", "Martinez Wedding Co",
  "Community Foundation", "Startup Launch Events", "Elite Corporate Events", "Premier Celebrations",
  "Global Business Solutions", "Innovative Events LLC", "Luxury Gatherings Inc", "Event Masters Co",
  "Professional Services Group", "Metropolitan Events", "Coastal Celebrations", "Urban Events Hub",
  "Executive Planning Services", "Gala Specialists Inc", "Modern Event Solutions", "Premier Productions",
  "Corporate Connections", "Celebration Experts", "Event Excellence Group", "Prestige Events Co",
  "Dynamic Event Solutions", "Signature Celebrations", "Pinnacle Events Inc", "Elite Gatherings",
  "Premier Event Planning", "Stellar Events Group", "Visionary Events LLC", "Apex Celebrations",
  "Summit Event Services", "Horizon Events Co", "Nexus Event Planning", "Zenith Celebrations",
  "Momentum Events Inc", "Catalyst Event Group", "Fusion Events LLC", "Vertex Celebrations"
];

const eventTypes = [
  "Corporate Event", "Wedding", "Private Party", "Networking", "Fundraiser",
  "Conference", "Product Launch", "Holiday Party", "Retirement Celebration",
  "Anniversary", "Birthday Party", "Gala", "Trade Show", "Team Building",
  "Award Ceremony", "Seminar"
];

const venues = [
  "Grand Luxe Hotel Ballroom", "Sunset Rooftop Venue", "Downtown Conference Center",
  "Lakeside Garden Estate", "City Museum Grand Hall", "Tech Hub Lounge", "Harbor View Pavilion",
  "Metropolitan Convention Center", "Skyline Event Space", "Garden Terrace Venue",
  "Historic Mansion Estate", "Beachfront Resort", "Mountain Lodge", "Urban Loft Gallery",
  "Riverside Banquet Hall", "Country Club Ballroom", "Art Gallery Venue", "Winery Estate"
];

const priorities = ["urgent", "high", "medium", "low"];
const statuses = ["pending", "under-review", "approved", "rejected", "needs-modification"];

const roles = [
  { name: "Bartenders", tiers: ["JUNIOR", "STANDARD", "PREMIUM", "ELITE"] },
  { name: "Servers", tiers: ["JUNIOR", "STANDARD", "PREMIUM", "ELITE"] },
  { name: "Coordinators", tiers: ["STANDARD", "PREMIUM", "ELITE"] },
  { name: "Setup Crew", tiers: ["JUNIOR", "STANDARD", "PREMIUM"] },
  { name: "Supervisors", tiers: ["STANDARD", "PREMIUM", "ELITE"] }
];

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

const generateDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const generateEventDate = (daysFromNow: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

const generateTime = (startHour: number) => {
  const endHour = startHour + 5;
  return {
    start: `${String(startHour).padStart(2, '0')}:00`,
    end: `${String(endHour).padStart(2, '0')}:00`
  };
};

const cities = [
  { name: "Manhattan, NY", zip: "10022" },
  { name: "Brooklyn, NY", zip: "11201" },
  { name: "Chicago, IL", zip: "60601" },
  { name: "San Francisco, CA", zip: "94105" },
  { name: "Los Angeles, CA", zip: "90001" },
  { name: "Boston, MA", zip: "02108" },
  { name: "Miami, FL", zip: "33101" },
  { name: "Seattle, WA", zip: "98101" }
];

const equipmentOptions = [
  "Tables", "Chairs", "Linens", "Audio System", "Outdoor Heaters", "Lighting",
  "Tents", "Dance Floor", "Display Screens", "Stage", "Projector", "Microphones"
];

const specialRequests = [
  "Need staff experienced with formal dining service. Black tie event.",
  "Rooftop setting, need staff comfortable with heights and outdoor service.",
  "Casual networking atmosphere. Need staff familiar with tech industry events.",
  "Outdoor venue, need staff comfortable with garden setting. Weather contingency plan needed.",
  "Formal service required. Auction assistance needed during event.",
  "Tech-savvy staff needed. Interactive product demo stations.",
  "Family-friendly event. Need staff experienced with children.",
  "High-profile guests attending. Enhanced security clearance required.",
  "Multi-cultural event. Bilingual staff preferred.",
  "Late night event. Need staff available past midnight."
];

export const generateEventRequests = (): EventRequest[] => {
  const requests: EventRequest[] = [];

  for (let i = 0; i < 60; i++) {
    const clientName = clientNames[i % clientNames.length];
    const companyName = companyNames[i % companyNames.length];
    const eventType = eventTypes[i % eventTypes.length];
    const venue = venues[i % venues.length];
    const city = cities[i % cities.length];
    
    // Status distribution: more pending at start
    let status: EventRequest["status"];
    if (i < 20) {
      status = "pending";
    } else if (i < 35) {
      status = "under-review";
    } else if (i < 45) {
      status = "approved";
    } else if (i < 55) {
      status = statuses[i % statuses.length] as EventRequest["status"];
    } else {
      status = i % 2 === 0 ? "rejected" : "needs-modification";
    }

    // Priority distribution
    let priority: EventRequest["priority"];
    if (i < 10) {
      priority = "urgent";
    } else if (i < 25) {
      priority = "high";
    } else if (i < 45) {
      priority = "medium";
    } else {
      priority = "low";
    }

    const estimatedGuests = 50 + (i * 10);
    const totalStaffNeeded = Math.ceil(estimatedGuests / 15) + Math.floor(i / 10);
    const favoritesSelected = i % 8 === 0 ? Math.floor(Math.random() * 5) + 1 : 0;
    
    // Generate tier selections
    const numRoles = Math.min(2 + Math.floor(i / 15), 4);
    const selectedTiers = [];
    for (let j = 0; j < numRoles; j++) {
      const role = roles[j % roles.length];
      const tier = role.tiers[i % role.tiers.length];
      const quantity = Math.ceil(totalStaffNeeded / numRoles) + (j === 0 ? i % 3 : 0);
      selectedTiers.push({ role: role.name, tier, quantity });
    }

    // Calculate price based on tiers
    const basePricePerStaff = 200 + (i * 5);
    const totalPrice = totalStaffNeeded * basePricePerStaff + (i * 50);

    // Validation status - some have issues
    const validationStatus = {
      favoritesAvailable: i % 7 !== 0,
      tierStaffAvailable: i % 9 !== 0,
      noConflicts: i % 11 !== 0,
      pricingValid: i % 13 !== 0
    };

    const time = generateTime(14 + (i % 8));
    
    // Equipment needed
    const numEquipment = Math.min(Math.floor(i / 10) + 1, 5);
    const equipmentNeeded = equipmentOptions.slice(0, numEquipment);

    requests.push({
      id: `req-${String(i + 1).padStart(3, '0')}`,
      requestNumber: `REQ-2024-${String(i + 1).padStart(3, '0')}`,
      submittedDate: generateDate(i % 30),
      clientId: `client-${String(i + 1).padStart(3, '0')}`,
      clientName,
      clientEmail: `${clientName.toLowerCase().replace(/\s+/g, '.')}@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      clientPhone: `+1 (555) ${String(100 + i).padStart(3, '0')}-${String(1000 + i * 7).slice(0, 4)}`,
      clientCompany: companyName,
      eventName: `${eventType} - ${clientName.split(' ')[clientName.split(' ').length - 1]} ${new Date().getFullYear()}`,
      eventType,
      eventDate: generateEventDate(5 + (i * 2)),
      startTime: time.start,
      endTime: time.end,
      venue,
      address: `${100 + i * 5} ${['Luxury Ave', 'Sky Tower', 'Business Plaza', 'Garden Lane', 'Museum Plaza'][i % 5]}, ${city.name} ${city.zip}`,
      estimatedGuests,
      totalStaffNeeded,
      favoritesSelected,
      selectedTiers,
      totalPrice,
      specialRequirements: i % 3 === 0 ? specialRequests[i % specialRequests.length] : undefined,
      cateringNeeded: i % 2 === 0,
      equipmentNeeded,
      validationStatus,
      priority,
      status,
      adminNotes: status === "under-review" 
        ? `Currently reviewing availability for ${venue}` 
        : status === "needs-modification"
        ? "Pricing discrepancy - awaiting client confirmation"
        : status === "approved"
        ? "Approved - Event created and staff assignments in progress"
        : status === "rejected"
        ? "Rejected - Insufficient notice period for event date"
        : undefined
    });
  }

  return requests;
};

export const eventRequestsData = generateEventRequests();
