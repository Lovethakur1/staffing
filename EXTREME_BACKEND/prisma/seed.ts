import 'dotenv/config';
import prisma from '../src/config/database';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('🌱 Seeding database...');

    // ── Clean slate (order matters for FK constraints) ──────────────────────
    await prisma.loginLog.deleteMany();
    await prisma.backupLog.deleteMany();
    await prisma.supportTicket.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversationParticipant.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.incidentReport.deleteMany();
    await prisma.payrollItem.deleteMany();
    await prisma.payrollRun.deleteMany();
    await prisma.invoiceLineItem.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.timesheet.deleteMany();
    await prisma.shiftBreak.deleteMany();
    await prisma.shift.deleteMany();
    await prisma.clientReview.deleteMany();
    await prisma.favoriteStaff.deleteMany();
    await prisma.event.deleteMany();
    await prisma.assessment.deleteMany();
    await prisma.interview.deleteMany();
    await prisma.certification.deleteMany();
    await prisma.application.deleteMany();
    await prisma.document.deleteMany();
    await prisma.jobPosting.deleteMany();
    await prisma.staffUnavailability.deleteMany();
    await prisma.userPreferences.deleteMany();
    await prisma.staffProfile.deleteMany();
    await prisma.clientProfile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.pricingConfig.deleteMany();
    await prisma.integration.deleteMany();
    await prisma.companySettings.deleteMany();
    await prisma.rolePermissionConfig.deleteMany();

    const password = await bcrypt.hash('password123', 12);
    const now = new Date();

    // ── 1. USERS ─────────────────────────────────────────────────────────────
    console.log('Creating users...');

    const admin = await prisma.user.create({ data: {
        name: 'Alex Admin', email: 'admin@extremestaffing.com', password, role: 'ADMIN',
        phone: '+1-555-0100', city: 'New York', state: 'NY', country: 'USA',
        isActive: true, lastLogin: now,
    }});

    const subAdmin = await prisma.user.create({ data: {
        name: 'Sarah Sub-Admin', email: 'subadmin@extremestaffing.com', password, role: 'SUB_ADMIN',
        phone: '+1-555-0101', city: 'Los Angeles', state: 'CA', country: 'USA', isActive: true,
    }});

    const manager = await prisma.user.create({ data: {
        name: 'Mike Manager', email: 'manager@extremestaffing.com', password, role: 'MANAGER',
        phone: '+1-555-0102', city: 'Chicago', state: 'IL', country: 'USA', isActive: true,
        staffProfile: { create: {
            skills: ['Event Management', 'Team Leadership', 'Security'],
            hourlyRate: 45.0, rating: 4.8, totalEvents: 32,
            location: 'Chicago, IL', locationLat: 41.8781, locationLng: -87.6298,
            availabilityStatus: 'available',
        }},
    }});

    const scheduler = await prisma.user.create({ data: {
        name: 'Casey Scheduler', email: 'scheduler@extremestaffing.com', password, role: 'SCHEDULER',
        phone: '+1-555-0103', city: 'Houston', state: 'TX', country: 'USA', isActive: true,
    }});

    // Clients
    const clientUser1 = await prisma.user.create({ data: {
        name: 'Jennifer Corp', email: 'jennifer@techcorp.com', password, role: 'CLIENT',
        phone: '+1-555-0200', city: 'New York', state: 'NY', country: 'USA', isActive: true,
        clientProfile: { create: {
            company: 'TechCorp Inc.', type: 'corporate',
            address: '100 Park Ave, New York, NY 10001',
            creditLimit: 50000, paymentTerms: 'NET30',
            totalEvents: 12, totalSpent: 28500, rating: 4.5, isActive: true,
        }},
    }});

    const clientUser2 = await prisma.user.create({ data: {
        name: 'Robert Venues', email: 'robert@grandvenue.com', password, role: 'CLIENT',
        phone: '+1-555-0201', city: 'Miami', state: 'FL', country: 'USA', isActive: true,
        clientProfile: { create: {
            company: 'Grand Venue LLC', type: 'venue',
            address: '500 Ocean Dr, Miami, FL 33139',
            creditLimit: 100000, paymentTerms: 'NET60',
            totalEvents: 28, totalSpent: 75000, rating: 4.9, isActive: true,
        }},
    }});

    const clientUser3 = await prisma.user.create({ data: {
        name: 'Emily Events', email: 'emily@privateevents.com', password, role: 'CLIENT',
        phone: '+1-555-0202', city: 'Los Angeles', state: 'CA', country: 'USA', isActive: true,
        clientProfile: { create: {
            company: 'Private Events Co.', type: 'individual',
            creditLimit: 20000, paymentTerms: 'NET30',
            totalEvents: 5, totalSpent: 12000, rating: 4.2, isActive: true,
        }},
    }});

    // Staff members
    const staffUsers = await Promise.all([
        prisma.user.create({ data: {
            name: 'John Bartender', email: 'john@staff.com', password, role: 'STAFF',
            phone: '+1-555-0301', city: 'New York', state: 'NY', isActive: true,
            staffProfile: { create: {
                skills: ['Bartending', 'Mixology', 'Customer Service'],
                hourlyRate: 28.0, rating: 4.7, totalEvents: 45,
                location: 'New York, NY', locationLat: 40.7128, locationLng: -74.0060,
                availabilityStatus: 'available', emergencyContact: 'Jane Bartender',
                emergencyPhone: '+1-555-0302',
            }},
        }}),
        prisma.user.create({ data: {
            name: 'Maria Server', email: 'maria@staff.com', password, role: 'STAFF',
            phone: '+1-555-0303', city: 'New York', state: 'NY', isActive: true,
            staffProfile: { create: {
                skills: ['Serving', 'Catering', 'Event Setup'],
                hourlyRate: 22.0, rating: 4.5, totalEvents: 38,
                location: 'New York, NY', locationLat: 40.7580, locationLng: -73.9855,
                availabilityStatus: 'available',
            }},
        }}),
        prisma.user.create({ data: {
            name: 'David Security', email: 'david@staff.com', password, role: 'STAFF',
            phone: '+1-555-0305', city: 'Chicago', state: 'IL', isActive: true,
            staffProfile: { create: {
                skills: ['Security', 'Crowd Control', 'First Aid'],
                hourlyRate: 32.0, rating: 4.6, totalEvents: 60,
                location: 'Chicago, IL', locationLat: 41.8781, locationLng: -87.6298,
                availabilityStatus: 'available',
            }},
        }}),
        prisma.user.create({ data: {
            name: 'Lisa Hostess', email: 'lisa@staff.com', password, role: 'STAFF',
            phone: '+1-555-0307', city: 'Miami', state: 'FL', isActive: true,
            staffProfile: { create: {
                skills: ['Hosting', 'Guest Relations', 'VIP Service'],
                hourlyRate: 25.0, rating: 4.8, totalEvents: 22,
                location: 'Miami, FL', locationLat: 25.7617, locationLng: -80.1918,
                availabilityStatus: 'available',
            }},
        }}),
        prisma.user.create({ data: {
            name: 'Carlos Chef', email: 'carlos@staff.com', password, role: 'STAFF',
            phone: '+1-555-0309', city: 'Los Angeles', state: 'CA', isActive: true,
            staffProfile: { create: {
                skills: ['Cooking', 'Food Safety', 'Catering'],
                hourlyRate: 35.0, rating: 4.9, totalEvents: 17,
                location: 'Los Angeles, CA', locationLat: 34.0522, locationLng: -118.2437,
                availabilityStatus: 'busy',
            }},
        }}),
    ]);

    const [staff1, staff2, staff3, staff4, staff5] = staffUsers;

    // Applicant (no profile yet)
    const applicant = await prisma.user.create({ data: {
        name: 'Tom Applicant', email: 'tom@gmail.com', password, role: 'STAFF',
        phone: '+1-555-0400', city: 'Seattle', state: 'WA', isActive: true,
    }});

    // ── 2. CLIENT PROFILES (get them for event creation) ─────────────────────
    const clientProfile1 = await prisma.clientProfile.findUnique({ where: { userId: clientUser1.id } });
    const clientProfile2 = await prisma.clientProfile.findUnique({ where: { userId: clientUser2.id } });
    const clientProfile3 = await prisma.clientProfile.findUnique({ where: { userId: clientUser3.id } });

    // ── 3. STAFF UNAVAILABILITY ──────────────────────────────────────────────
    console.log('Creating unavailabilities...');
    const staffProfile1 = await prisma.staffProfile.findUnique({ where: { userId: staff1.id } });
    const staffProfile2 = await prisma.staffProfile.findUnique({ where: { userId: staff2.id } });

    await prisma.staffUnavailability.createMany({ data: [
        { staffProfileId: staffProfile1!.id, startDate: new Date('2026-04-10'), endDate: new Date('2026-04-12'), reason: 'Family vacation' },
        { staffProfileId: staffProfile2!.id, startDate: new Date('2026-04-15'), endDate: new Date('2026-04-15'), reason: 'Medical appointment', startTime: '09:00', endTime: '14:00' },
    ]});

    // ── 4. EVENTS ─────────────────────────────────────────────────────────────
    console.log('Creating events...');

    const event1 = await prisma.event.create({ data: {
        clientId: clientProfile1!.id, managerId: manager.id,
        title: 'TechCorp Annual Gala 2026', description: 'Annual corporate gala for 300 guests',
        eventType: 'Corporate', venue: 'The Grand Ballroom', date: new Date('2026-04-15'),
        startTime: '18:00', endTime: '23:00',
        location: '100 Park Ave, New York, NY', locationLat: 40.7549, locationLng: -73.9840,
        status: 'CONFIRMED', staffRequired: 12, guestCount: 300,
        budget: 15000, deposit: 5000, tips: 800,
        dressCode: 'Black Tie', contactOnSite: 'Jennifer Corp', contactOnSitePhone: '+1-555-0200',
        staffCosts: 9600, travelFee: 200, platformFee: 1440, additionalFees: 500,
        specialRequirements: 'Need 4 bartenders, 6 servers, 2 security',
    }});

    const event2 = await prisma.event.create({ data: {
        clientId: clientProfile2!.id, managerId: manager.id,
        title: 'Grand Venue New Year Concert', description: 'New Year Eve concert with 500 guests',
        eventType: 'Concert', venue: 'Grand Arena', date: new Date('2026-04-20'),
        startTime: '20:00', endTime: '02:00',
        location: '500 Ocean Dr, Miami, FL', locationLat: 25.7617, locationLng: -80.1918,
        status: 'IN_PROGRESS', staffRequired: 20, guestCount: 500,
        budget: 30000, deposit: 12000, tips: 1500,
        dressCode: 'Smart Casual', contactOnSite: 'Robert Venues', contactOnSitePhone: '+1-555-0201',
        staffCosts: 22000, travelFee: 800, platformFee: 3300, additionalFees: 1200,
    }});

    const event3 = await prisma.event.create({ data: {
        clientId: clientProfile3!.id,
        title: 'Private Wedding Reception', description: 'Intimate wedding for 80 guests',
        eventType: 'Wedding', venue: 'Sunset Garden', date: new Date('2026-05-01'),
        startTime: '16:00', endTime: '22:00',
        location: '200 Sunset Blvd, Los Angeles, CA', locationLat: 34.0980, locationLng: -118.3298,
        status: 'PENDING', staffRequired: 8, guestCount: 80,
        budget: 8000, deposit: 3000,
        dressCode: 'Formal', staffCosts: 5600, platformFee: 840,
    }});

    const event4 = await prisma.event.create({ data: {
        clientId: clientProfile1!.id, managerId: manager.id,
        title: 'Q1 Product Launch', description: 'Product launch event for press and VIPs',
        eventType: 'Corporate', venue: 'Innovation Hub', date: new Date('2026-03-10'),
        startTime: '10:00', endTime: '18:00',
        location: '50 Tech Square, New York, NY', locationLat: 40.7580, locationLng: -73.9855,
        status: 'COMPLETED', staffRequired: 6, guestCount: 150,
        budget: 10000, deposit: 4000, tips: 400,
        staffCosts: 7200, platformFee: 1080,
    }});

    // ── 5. SHIFTS ─────────────────────────────────────────────────────────────
    console.log('Creating shifts...');

    const [shift1, shift2, shift3, shift4, shift5, shift6] = await Promise.all([
        prisma.shift.create({ data: {
            eventId: event1.id, staffId: staff1.id, date: new Date('2026-04-15'),
            startTime: '17:00', endTime: '23:30', role: 'Bartender',
            status: 'CONFIRMED', hourlyRate: 28, guaranteedHours: 6,
            travelEnabled: true,
        }}),
        prisma.shift.create({ data: {
            eventId: event1.id, staffId: staff2.id, date: new Date('2026-04-15'),
            startTime: '17:00', endTime: '23:30', role: 'Server',
            status: 'CONFIRMED', hourlyRate: 22, guaranteedHours: 6,
            travelEnabled: true,
        }}),
        prisma.shift.create({ data: {
            eventId: event2.id, staffId: staff3.id, date: new Date('2026-04-20'),
            startTime: '19:00', endTime: '03:00', role: 'Security',
            status: 'ONGOING', hourlyRate: 32, guaranteedHours: 8,
            travelEnabled: true,
            clockIn: new Date('2026-04-20T19:05:00Z'),
            travelStartTime: new Date('2026-04-20T18:30:00Z'),
            travelArrivalTime: new Date('2026-04-20T19:00:00Z'),
        }}),
        prisma.shift.create({ data: {
            eventId: event2.id, staffId: staff4.id, date: new Date('2026-04-20'),
            startTime: '19:00', endTime: '03:00', role: 'Hostess',
            status: 'TRAVEL_TO_VENUE', hourlyRate: 25,
            travelEnabled: true,
            travelStartTime: new Date('2026-04-20T18:20:00Z'),
            travelLat: 25.7650, travelLng: -80.1900,
        }}),
        prisma.shift.create({ data: {
            eventId: event4.id, staffId: staff1.id, date: new Date('2026-03-10'),
            startTime: '09:00', endTime: '18:30', role: 'Bartender',
            status: 'COMPLETED', hourlyRate: 28, totalHours: 9.5, totalPay: 266,
            clockIn: new Date('2026-03-10T09:02:00Z'),
            clockOut: new Date('2026-03-10T18:28:00Z'),
            travelEnabled: true,
            travelStartTime: new Date('2026-03-10T08:30:00Z'),
            travelArrivalTime: new Date('2026-03-10T09:00:00Z'),
            travelHomeStart: new Date('2026-03-10T18:30:00Z'),
            travelHomeEnd: new Date('2026-03-10T19:10:00Z'),
            travelDuration: 80, parkingAmount: 15,
            tipsReceived: 45,
        }}),
        prisma.shift.create({ data: {
            eventId: event4.id, staffId: staff5.id, date: new Date('2026-03-10'),
            startTime: '09:00', endTime: '18:30', role: 'Chef',
            status: 'COMPLETED', hourlyRate: 35, totalHours: 9.5, totalPay: 332.5,
            clockIn: new Date('2026-03-10T08:58:00Z'),
            clockOut: new Date('2026-03-10T18:32:00Z'),
        }}),
    ]);

    // ── 6. SHIFT BREAKS ───────────────────────────────────────────────────────
    console.log('Creating shift breaks...');
    await prisma.shiftBreak.createMany({ data: [
        { shiftId: shift3.id, startTime: new Date('2026-04-20T21:00:00Z'), endTime: new Date('2026-04-20T21:20:00Z'), durationMinutes: 20 },
        { shiftId: shift5.id, startTime: new Date('2026-03-10T13:00:00Z'), endTime: new Date('2026-03-10T13:30:00Z'), durationMinutes: 30 },
    ]});

    // ── 7. TIMESHEETS ─────────────────────────────────────────────────────────
    console.log('Creating timesheets...');
    const [ts1, ts2] = await Promise.all([
        prisma.timesheet.create({ data: {
            shiftId: shift5.id, staffId: staff1.id,
            clockInTime: new Date('2026-03-10T09:02:00Z'),
            clockOutTime: new Date('2026-03-10T18:28:00Z'),
            totalHours: 9.5, regularHours: 9.5, additionalWork: 0,
            breakMinutes: 30, driveTime: 1.3, parkingAmount: 15, tipsAmount: 45,
            workersCompRate: 2.5, workersCompAmount: 6.65, status: 'APPROVED',
            approvedById: admin.id, notes: 'All hours verified. Travel reimbursement included.',
        }}),
        prisma.timesheet.create({ data: {
            shiftId: shift6.id, staffId: staff5.id,
            clockInTime: new Date('2026-03-10T08:58:00Z'),
            clockOutTime: new Date('2026-03-10T18:32:00Z'),
            totalHours: 9.57, regularHours: 9.57, additionalWork: 0,
            breakMinutes: 30, status: 'PENDING',
        }}),
    ]);

    // ── 8. INVOICES ───────────────────────────────────────────────────────────
    console.log('Creating invoices...');
    const invoice1 = await prisma.invoice.create({ data: {
        invoiceNumber: 'INV-2026-001', clientId: clientProfile1!.id, eventId: event4.id,
        subtotal: 8760, taxRate: 8.875, taxAmount: 777.45, amount: 9537.45,
        status: 'PAID', dueDate: new Date('2026-03-25'),
        paidDate: new Date('2026-03-22'), paymentMethod: 'Bank Transfer',
        notes: 'Q1 Product Launch - Full payment received',
        lineItems: { create: [
            { description: 'Bartender (9.5 hrs × $28)', quantity: 9.5, unitPrice: 28, amount: 266 },
            { description: 'Chef (9.5 hrs × $35)', quantity: 9.5, unitPrice: 35, amount: 332.5 },
            { description: 'Platform Fee (15%)', quantity: 1, unitPrice: 1080, amount: 1080 },
            { description: 'Travel Reimbursement', quantity: 1, unitPrice: 200, amount: 200 },
        ]},
    }});

    const invoice2 = await prisma.invoice.create({ data: {
        invoiceNumber: 'INV-2026-002', clientId: clientProfile1!.id, eventId: event1.id,
        subtotal: 11200, taxRate: 8.875, taxAmount: 994, amount: 12194,
        status: 'SENT', dueDate: new Date('2026-04-30'),
        notes: 'TechCorp Annual Gala - Deposit paid, balance due after event',
        lineItems: { create: [
            { description: 'Bartender Service (4 staff × 6.5 hrs × $28)', quantity: 26, unitPrice: 28, amount: 728 },
            { description: 'Server Service (6 staff × 6.5 hrs × $22)', quantity: 39, unitPrice: 22, amount: 858 },
            { description: 'Security (2 staff × 6.5 hrs × $32)', quantity: 13, unitPrice: 32, amount: 416 },
            { description: 'Platform Fee', quantity: 1, unitPrice: 1440, amount: 1440 },
        ]},
    }});

    const invoice3 = await prisma.invoice.create({ data: {
        invoiceNumber: 'INV-2026-003', clientId: clientProfile2!.id, eventId: event2.id,
        subtotal: 24800, taxRate: 7.0, taxAmount: 1736, amount: 26536,
        status: 'DRAFT', dueDate: new Date('2026-05-05'),
        lineItems: { create: [
            { description: 'Security (8 staff × 8 hrs × $32)', quantity: 64, unitPrice: 32, amount: 2048 },
            { description: 'Hostess (4 staff × 8 hrs × $25)', quantity: 32, unitPrice: 25, amount: 800 },
            { description: 'Platform Fee', quantity: 1, unitPrice: 3300, amount: 3300 },
        ]},
    }});

    // ── 9. PAYROLL ────────────────────────────────────────────────────────────
    console.log('Creating payroll...');
    const payrollRun = await prisma.payrollRun.create({ data: {
        periodStart: new Date('2026-03-01'), periodEnd: new Date('2026-03-31'),
        processedBy: admin.id, totalAmount: 1850.75,
        status: 'COMPLETED', notes: 'March 2026 payroll - all timesheets approved',
        items: { create: [
            {
                staffId: staff1.id, staffName: staff1.name,
                regularHours: 9.5, additionalHours: 0, hourlyRate: 28,
                regularPay: 266, additionalPay: 0, driveTimePay: 36.4,
                parkingReimbursement: 15, tipsAmount: 45,
                workersCompDeduction: 6.65, otherDeductions: 0,
                grossPay: 362.4, netPay: 355.75,
            },
            {
                staffId: staff5.id, staffName: staff5.name,
                regularHours: 9.57, additionalHours: 0, hourlyRate: 35,
                regularPay: 334.95, additionalPay: 0, driveTimePay: 0,
                parkingReimbursement: 0, tipsAmount: 0,
                workersCompDeduction: 8.37, otherDeductions: 0,
                grossPay: 334.95, netPay: 326.58,
            },
        ]},
    }});

    // ── 10. INCIDENT REPORTS ──────────────────────────────────────────────────
    console.log('Creating incidents...');
    await prisma.incidentReport.createMany({ data: [
        {
            eventId: event4.id, reportedBy: staff3.id,
            severity: 'LOW', description: 'Guest slipped near bar area, no injury. Floor was wet due to spilled drink. Area was immediately cleaned and cordoned off.',
            status: 'RESOLVED', resolution: 'Area cleaned, wet floor sign placed. No medical attention required.',
        },
        {
            eventId: event2.id, reportedBy: manager.id,
            severity: 'MEDIUM', description: 'Unauthorised person attempted to enter VIP section. Was escorted out by security.',
            status: 'RESOLVED', resolution: 'Individual escorted from premises. Client notified.',
        },
        {
            eventId: event1.id, reportedBy: staff3.id,
            severity: 'HIGH', description: 'Equipment failure — sound system shut down for 8 minutes during the main speech.',
            status: 'INVESTIGATING',
        },
    ]});

    // ── 11. HR — APPLICATIONS ─────────────────────────────────────────────────
    console.log('Creating applications...');
    await prisma.application.createMany({ data: [
        { applicantId: applicant.id, position: 'Bartender', status: 'REVIEWING', source: 'Website', coverLetter: 'I have 5 years bartending experience in high-end venues.', notes: 'Strong candidate, advance to interview.' },
        { applicantId: staff1.id, position: 'Lead Bartender', status: 'HIRED', source: 'Referral' },
        { applicantId: staff2.id, position: 'Event Server', status: 'HIRED', source: 'QR code' },
        { applicantId: staff5.id, position: 'Chef de Partie', status: 'INTERVIEWED', source: 'Website' },
    ]});

    // ── 12. CERTIFICATIONS ────────────────────────────────────────────────────
    console.log('Creating certifications...');
    await prisma.certification.createMany({ data: [
        { staffId: staff1.id, name: 'TIPS Certification', issuer: 'TIPS Program', issueDate: new Date('2024-01-15'), expiryDate: new Date('2027-01-15'), verified: true },
        { staffId: staff1.id, name: 'Food Handler Certificate', issuer: 'NYC Health Dept', issueDate: new Date('2023-06-01'), expiryDate: new Date('2026-06-01'), verified: true },
        { staffId: staff3.id, name: 'Security Guard License', issuer: 'IL State', issueDate: new Date('2023-03-10'), expiryDate: new Date('2026-03-10'), verified: true },
        { staffId: staff3.id, name: 'CPR / First Aid', issuer: 'Red Cross', issueDate: new Date('2024-08-20'), expiryDate: new Date('2026-08-20'), verified: true },
        { staffId: staff5.id, name: 'ServSafe Food Handler', issuer: 'ServSafe', issueDate: new Date('2024-02-14'), expiryDate: new Date('2027-02-14'), verified: true },
    ]});

    // ── 13. INTERVIEWS ────────────────────────────────────────────────────────
    console.log('Creating interviews...');
    await prisma.interview.createMany({ data: [
        { candidateId: applicant.id, interviewerId: manager.id, scheduledAt: new Date('2026-04-10T14:00:00Z'), location: 'https://meet.google.com/abc-def-ghi', status: 'SCHEDULED', notes: 'First round — skills & experience check.' },
        { candidateId: staff5.id, interviewerId: admin.id, scheduledAt: new Date('2026-02-20T10:00:00Z'), status: 'COMPLETED', rating: 5, notes: 'Excellent culinary skills. Offered position.' },
    ]});

    // ── 14. JOB POSTINGS ──────────────────────────────────────────────────────
    console.log('Creating job postings...');
    await prisma.jobPosting.createMany({ data: [
        {
            title: 'Senior Bartender', department: 'Operations', type: 'contractor',
            location: 'New York, NY', salaryRange: '$25-$35/hr', status: 'active',
            description: 'Experienced bartender for corporate and private events.',
            requirements: ['3+ years experience', 'TIPS certified', 'Flexible schedule'],
            responsibilities: ['Prepare cocktails', 'Manage bar inventory', 'Ensure customer satisfaction'],
            benefits: ['Flexible hours', 'Competitive pay', 'Performance tips'],
            applicationsCount: 8, viewsCount: 142,
        },
        {
            title: 'Event Server', department: 'Operations', type: 'part-time',
            location: 'New York, NY', salaryRange: '$20-$25/hr', status: 'active',
            description: 'Servers for upscale corporate and social events.',
            requirements: ['1+ years serving experience', 'Professional appearance', 'Team player'],
            responsibilities: ['Food & beverage service', 'Table setup', 'Guest assistance'],
            benefits: ['Flexible schedule', 'Tips included'],
            applicationsCount: 15, viewsCount: 238,
        },
        {
            title: 'Head of Security', department: 'Security', type: 'full-time',
            location: 'Chicago, IL', salaryRange: '$35-$45/hr', status: 'active',
            description: 'Lead security operations for large-scale events.',
            requirements: ['Security license required', '5+ years experience', 'Leadership skills'],
            responsibilities: ['Team coordination', 'Risk assessment', 'Incident reporting'],
            benefits: ['Health insurance', 'Overtime pay'],
            applicationsCount: 3, viewsCount: 89,
        },
    ]});

    // ── 15. ASSESSMENTS ───────────────────────────────────────────────────────
    console.log('Creating assessments...');
    await prisma.assessment.createMany({ data: [
        {
            candidateId: staff1.id, candidateName: staff1.name, position: 'Senior Bartender',
            type: 'skills', status: 'completed',
            overallScore: 88, communication: 90, teamwork: 85, problemSolving: 82, leadership: 78, technical: 95,
            completedDate: new Date('2026-02-10'),
        },
        {
            candidateId: applicant.id, candidateName: applicant.name, position: 'Bartender',
            type: 'both', status: 'scheduled',
            overallScore: 0, communication: 0, teamwork: 0, problemSolving: 0, leadership: 0, technical: 0,
        },
    ]});

    // ── 16. DOCUMENTS ─────────────────────────────────────────────────────────
    console.log('Creating documents...');
    await prisma.document.createMany({ data: [
        { userId: staff1.id, name: 'National ID', category: 'ID', fileUrl: '/uploads/docs/staff1-id.pdf', status: 'VERIFIED', verifiedAt: new Date('2025-09-01') },
        { userId: staff1.id, name: 'Employment Contract', category: 'CONTRACT', fileUrl: '/uploads/docs/staff1-contract.pdf', status: 'VERIFIED' },
        { userId: staff3.id, name: 'Security Guard License', category: 'CERTIFICATION', fileUrl: '/uploads/docs/staff3-license.pdf', status: 'VERIFIED', expiresAt: new Date('2027-03-10') },
        { userId: applicant.id, name: 'Resume', category: 'OTHER', fileUrl: '/uploads/docs/applicant-resume.pdf', status: 'PENDING' },
        { userId: staff2.id, name: 'NDA Agreement', category: 'NDA', fileUrl: '/uploads/docs/staff2-nda.pdf', status: 'VERIFIED' },
    ]});

    // ── 17. CLIENT REVIEWS ────────────────────────────────────────────────────
    console.log('Creating reviews...');
    await prisma.clientReview.createMany({ data: [
        { clientId: clientProfile1!.id, staffId: staff1.id, eventId: event4.id, rating: 5, feedback: 'John was exceptional! Professional, fast, and every guest loved him.' },
        { clientId: clientProfile1!.id, staffId: staff5.id, eventId: event4.id, rating: 5, feedback: 'Carlos delivered outstanding food quality. Will definitely request him again.' },
    ]});

    // ── 18. FAVORITE STAFF ────────────────────────────────────────────────────
    await prisma.favoriteStaff.createMany({ data: [
        { clientId: clientUser1.id, staffId: staff1.id, notes: 'Always request for corporate events' },
        { clientId: clientUser1.id, staffId: staff5.id, notes: 'Best chef we have worked with' },
        { clientId: clientUser2.id, staffId: staff3.id, notes: 'Top security pick for large events' },
    ]});

    // ── 19. CONVERSATIONS & MESSAGES ──────────────────────────────────────────
    console.log('Creating conversations...');
    const conv1 = await prisma.conversation.create({ data: {
        isGroup: true, name: 'TechCorp Gala Team', eventId: event1.id,
        participants: { create: [
            { userId: manager.id }, { userId: staff1.id }, { userId: staff2.id }, { userId: clientUser1.id },
        ]},
    }});

    await prisma.message.createMany({ data: [
        { conversationId: conv1.id, senderId: manager.id, content: 'Hi team! Event is in 2 weeks. Please confirm availability.', type: 'TEXT' },
        { conversationId: conv1.id, senderId: staff1.id, content: 'Confirmed! Ready for the gala.', type: 'TEXT' },
        { conversationId: conv1.id, senderId: staff2.id, content: 'All confirmed from my side too.', type: 'TEXT' },
        { conversationId: conv1.id, senderId: clientUser1.id, content: 'Great! Looking forward to a wonderful event.', type: 'TEXT' },
    ]});

    // ── 20. NOTIFICATIONS ─────────────────────────────────────────────────────
    console.log('Creating notifications...');
    await prisma.notification.createMany({ data: [
        { userId: staff1.id, title: 'Shift Confirmed', message: 'Your shift for TechCorp Annual Gala on Apr 15 has been confirmed.', type: 'shift', priority: 'high', unread: true, actionRequired: false },
        { userId: staff1.id, title: 'Payment Processed', message: 'Your payment of $355.75 for the Q1 Product Launch has been issued.', type: 'payment', priority: 'medium', unread: false },
        { userId: staff2.id, title: 'New Shift Assigned', message: 'You have been assigned to TechCorp Annual Gala on Apr 15 as Server.', type: 'shift', priority: 'high', unread: true, actionRequired: true },
        { userId: manager.id, title: 'Incident Reported', message: 'A HIGH severity incident has been reported for TechCorp Annual Gala.', type: 'system', priority: 'high', unread: true, actionRequired: true },
        { userId: admin.id, title: 'Invoice Paid', message: 'Invoice INV-2026-001 from TechCorp Inc. has been paid ($9,537.45).', type: 'payment', priority: 'medium', unread: false },
        { userId: admin.id, title: 'New Support Ticket', message: 'Staff member John Bartender submitted a ticket: "App login issue".', type: 'ticket', priority: 'medium', unread: true, actionRequired: true },
        { userId: staff3.id, title: 'Travel Approved', message: 'Travel mode enabled for your shift at Grand Venue Concert on Apr 20.', type: 'shift', priority: 'low', unread: true },
        { userId: clientUser1.id, title: 'Invoice Sent', message: 'Invoice INV-2026-002 for TechCorp Annual Gala has been sent. Amount: $12,194.', type: 'payment', priority: 'medium', unread: true, actionRequired: true },
    ]});

    // ── 21. SUPPORT TICKETS ───────────────────────────────────────────────────
    console.log('Creating support tickets...');
    await prisma.supportTicket.createMany({ data: [
        { userId: staff1.id, subject: 'App login issue on new phone', category: 'Technical', message: 'I recently changed my phone and now I cannot log into the mobile app. It says device not recognized.', status: 'IN_PROGRESS', updatedAt: now },
        { userId: staff2.id, subject: 'Payment not received', category: 'Payroll', message: 'I completed my shift on Mar 10 but payment has not been deposited yet. Please advise.', status: 'RESOLVED', resolutionNotes: 'Payment confirmed issued on Mar 22. Bank transfer may take 2-3 days.', resolvedById: admin.id, updatedAt: now },
        { userId: clientUser2.id, subject: 'Request additional staff for concert', category: 'General', message: 'We may need 5 additional security staff for the concert. Capacity has increased.', status: 'OPEN', updatedAt: now },
    ]});

    // ── 22. PRICING CONFIG ────────────────────────────────────────────────────
    console.log('Creating pricing config...');
    const pricing = await prisma.pricingConfig.create({ data: {
        platformFeePercentage: 15, minimumHours: 5,
        tierRates: { create: [
            { role: 'Bartender', junior: 18, standard: 25, premium: 32, elite: 45 },
            { role: 'Server', junior: 16, standard: 22, premium: 28, elite: 38 },
            { role: 'Security', junior: 20, standard: 28, premium: 35, elite: 50 },
            { role: 'Hostess', junior: 18, standard: 25, premium: 32, elite: 42 },
            { role: 'Chef', junior: 25, standard: 35, premium: 48, elite: 65 },
        ]},
        multiplierRules: { create: [
            { name: 'Weekend Premium', type: 'weekend', percentage: 15, enabled: true, description: 'Additional 15% for weekend shifts' },
            { name: 'Holiday Premium', type: 'holiday', percentage: 25, enabled: true, description: 'Additional 25% for public holidays' },
            { name: 'Late Night Premium', type: 'late_night', percentage: 10, enabled: true, description: 'Additional 10% for shifts past midnight' },
            { name: 'Short Notice', type: 'short_notice', percentage: 20, enabled: false, description: 'Additional 20% for bookings under 48 hours' },
        ]},
        travelFeeRules: { create: [
            { minMiles: 0, maxMiles: 10, fee: 0 },
            { minMiles: 10, maxMiles: 25, fee: 25 },
            { minMiles: 25, maxMiles: 50, fee: 50 },
            { minMiles: 50, maxMiles: 999, fee: 100 },
        ]},
    }});

    // ── 23. INTEGRATIONS ──────────────────────────────────────────────────────
    console.log('Creating integrations...');
    await prisma.integration.createMany({ data: [
        { key: 'quickbooks', name: 'QuickBooks', category: 'accounting', description: 'Sync invoices and payroll with QuickBooks.', isActive: false },
        { key: 'slack', name: 'Slack', category: 'communication', description: 'Send shift alerts and notifications to Slack.', isActive: true, lastSyncAt: new Date('2026-04-01') },
        { key: 'google_calendar', name: 'Google Calendar', category: 'calendar', description: 'Sync events and shift schedules to Google Calendar.', isActive: true, lastSyncAt: new Date('2026-04-03') },
        { key: 'stripe', name: 'Stripe', category: 'payroll', description: 'Process payments and payroll via Stripe.', isActive: false },
        { key: 'dropbox', name: 'Dropbox', category: 'storage', description: 'Store and retrieve documents from Dropbox.', isActive: false },
    ]});

    // ── 24. USER PREFERENCES ──────────────────────────────────────────────────
    console.log('Creating user preferences...');
    await prisma.userPreferences.createMany({ data: [
        { userId: admin.id, notificationPrefs: { email: true, sms: true, push: true, marketing: false }, systemPrefs: { language: 'en', timezone: 'America/New_York', currency: 'USD', twoFactor: true } },
        { userId: manager.id, notificationPrefs: { email: true, sms: true, push: true, marketing: false }, systemPrefs: { language: 'en', timezone: 'America/Chicago', currency: 'USD', twoFactor: false } },
        { userId: staff1.id, notificationPrefs: { email: false, sms: true, push: true, marketing: false }, systemPrefs: { language: 'en', timezone: 'America/New_York', currency: 'USD' } },
        { userId: clientUser1.id, notificationPrefs: { email: true, sms: false, push: false, marketing: true }, systemPrefs: { language: 'en', timezone: 'America/New_York', currency: 'USD' } },
    ]});

    // ── 25. COMPANY SETTINGS ──────────────────────────────────────────────────
    await prisma.companySettings.upsert({
        where: { key: 'default' },
        update: {},
        create: {
            key: 'default',
            data: {
                name: 'Extreme Staffing Solutions',
                email: 'info@extremestaffing.com',
                phone: '+1-800-EXT-STAFF',
                address: '123 Business Ave, New York, NY 10001',
                website: 'https://extremestaffing.com',
                taxId: '12-3456789',
                billingPrefs: { defaultPaymentTerms: 'NET30', taxRate: 8.875, currency: 'USD' },
            },
        },
    });

    // ── 26. ROLE PERMISSIONS ──────────────────────────────────────────────────
    await prisma.rolePermissionConfig.createMany({ data: [
        { role: 'ADMIN', permissions: ['*'] },
        { role: 'SUB_ADMIN', permissions: ['events:read', 'events:write', 'staff:read', 'staff:write', 'shifts:read', 'shifts:write', 'timesheets:read', 'timesheets:write'] },
        { role: 'MANAGER', permissions: ['events:read', 'events:write', 'staff:read', 'shifts:read', 'shifts:write', 'timesheets:read'] },
        { role: 'SCHEDULER', permissions: ['events:read', 'shifts:read', 'shifts:write', 'staff:read'] },
        { role: 'STAFF', permissions: ['shifts:read', 'timesheets:read', 'profile:read', 'profile:write'] },
        { role: 'CLIENT', permissions: ['events:read', 'invoices:read', 'profile:read', 'profile:write'] },
    ]});

    // ── 27. BACKUP LOGS ───────────────────────────────────────────────────────
    await prisma.backupLog.createMany({ data: [
        { type: 'FULL', status: 'COMPLETED', sizeBytes: 52428800n, filePath: '/backups/full-2026-03-01.dump', initiatedBy: admin.id },
        { type: 'INCREMENTAL', status: 'COMPLETED', sizeBytes: 10485760n, filePath: '/backups/inc-2026-04-01.dump', initiatedBy: 'SYSTEM' },
        { type: 'FULL', status: 'FAILED', errorMsg: 'Disk space insufficient during backup.', initiatedBy: 'SYSTEM' },
    ]});

    // ── 28. LOGIN LOGS ────────────────────────────────────────────────────────
    await prisma.loginLog.createMany({ data: [
        { userId: admin.id, success: true, ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0 Chrome/120' },
        { userId: manager.id, success: true, ipAddress: '10.0.0.5', userAgent: 'Mozilla/5.0 Firefox/118' },
        { userId: staff1.id, success: true, ipAddress: '172.16.0.10', userAgent: 'Expo App/1.0 Android' },
        { userId: staff1.id, success: false, ipAddress: '203.0.113.55', userAgent: 'unknown' },
        { userId: clientUser1.id, success: true, ipAddress: '192.168.2.20', userAgent: 'Safari/17.0 Mac' },
    ]});

    console.log('\n✅ Seed completed successfully!');
    console.log('─────────────────────────────────────────');
    console.log('Accounts (password: password123)');
    console.log('  admin@extremestaffing.com     → ADMIN');
    console.log('  subadmin@extremestaffing.com  → SUB_ADMIN');
    console.log('  manager@extremestaffing.com   → MANAGER');
    console.log('  scheduler@extremestaffing.com → SCHEDULER');
    console.log('  john@staff.com                → STAFF (Bartender)');
    console.log('  maria@staff.com               → STAFF (Server)');
    console.log('  david@staff.com               → STAFF (Security)');
    console.log('  lisa@staff.com                → STAFF (Hostess)');
    console.log('  carlos@staff.com              → STAFF (Chef)');
    console.log('  jennifer@techcorp.com         → CLIENT');
    console.log('  robert@grandvenue.com         → CLIENT');
    console.log('  emily@privateevents.com       → CLIENT');
    console.log('─────────────────────────────────────────');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
