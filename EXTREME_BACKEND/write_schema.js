const fs = require('fs');

const schema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  STAFF
  ADMIN
  MANAGER
  CLIENT
  SUB_ADMIN
  SCHEDULER
}

enum EventStatus {
  PENDING
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum ShiftStatus {
  PENDING
  CONFIRMED
  REJECTED
  YET_TO_START
  ONGOING
  IN_PROGRESS
  COMPLETED
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  phone     String?
  password  String
  role      Role
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relationships
  staffProfile  StaffProfile?
  clientProfile ClientProfile?
  managedEvents Event[]        @relation("EventManager")
  shifts        Shift[]
  applications  Application[]
  certifications Certification[] @relation("StaffCertifications")
  interviews    Interview[]
  interviewsConducted Interview[] @relation("Interviewer")
  approvedTimesheets Timesheet[] @relation("TimesheetApprover")
  payrollsProcessed PayrollRun[] @relation("PayrollProcessor")
  incidentsReported IncidentReport[] @relation("IncidentReporter")
  conversations ConversationParticipant[]
  messagesSent      Message[]
  notifications     Notification[]
  timesheets        Timesheet[]
}

model StaffProfile {
  id                 String  @id @default(uuid())
  userId             String  @unique
  user               User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  location           String?
  skills             String[]
  hourlyRate         Float   @default(0)
  rating             Float   @default(0)
  totalEvents        Int     @default(0)
  availabilityStatus String  @default("available")
  isActive           Boolean @default(true)
  joinDate           DateTime @default(now())
}

model ClientProfile {
  id           String  @id @default(uuid())
  userId       String  @unique
  user         User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  type         String  @default("corporate")
  company      String?
  address      String?
  creditLimit  Float?
  paymentTerms String?
  totalEvents  Int     @default(0)
  totalSpent   Float   @default(0)
  rating       Float   @default(0)
  isActive     Boolean @default(true)
  
  events       Event[] @relation("ClientEvents")
  invoices     Invoice[]
}

model Event {
  id                  String      @id @default(uuid())
  clientId            String
  client              ClientProfile @relation("ClientEvents", fields: [clientId], references: [id])
  managerId           String?
  manager             User?       @relation("EventManager", fields: [managerId], references: [id])
  
  title               String
  description         String
  eventType           String?
  venue               String?
  date                DateTime
  startTime           String
  endTime             String
  location            String
  locationLat         Float?
  locationLng         Float?
  status              EventStatus @default(PENDING)
  staffRequired       Int
  budget              Float       @default(0)
  deposit             Float       @default(0)
  tips                Float       @default(0)
  specialRequirements String?
  
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt

  shifts              Shift[]
  invoices            Invoice[]
  incidents           IncidentReport[]
  conversations       Conversation[]
}

model Shift {
  id         String      @id @default(uuid())
  eventId    String
  event      Event       @relation(fields: [eventId], references: [id], onDelete: Cascade)
  staffId    String
  staff      User        @relation(fields: [staffId], references: [id])
  
  date       DateTime
  startTime  String
  endTime    String
  status     ShiftStatus @default(PENDING)
  clockIn    DateTime?
  clockOut   DateTime?
  location   String?
  role       String?
  hourlyRate Float       @default(0)
  totalHours Float?
  totalPay   Float?
  
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  
  timesheet  Timesheet?
}

// -- HR & Staff Models --
model Application {
  id          String   @id @default(uuid())
  applicantId String
  applicant   User     @relation(fields: [applicantId], references: [id])
  status      String   @default("PENDING") // PENDING, REVIEWING, INTERVIEWED, HIRED, REJECTED
  resumeUrl   String?
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Certification {
  id           String   @id @default(uuid())
  staffId      String
  staff        User     @relation("StaffCertifications", fields: [staffId], references: [id])
  name         String
  issuer       String?
  issueDate    DateTime?
  expiryDate   DateTime?
  documentUrl  String?
  verified     Boolean  @default(false)
  createdAt    DateTime @default(now())
}

model Interview {
  id           String   @id @default(uuid())
  candidateId  String
  candidate    User     @relation(fields: [candidateId], references: [id])
  interviewerId String?
  interviewer  User?    @relation("Interviewer", fields: [interviewerId], references: [id])
  scheduledAt  DateTime
  status       String   @default("SCHEDULED") // SCHEDULED, COMPLETED, CANCELLED
  notes        String?
  rating       Int?
  createdAt    DateTime @default(now())
}

// -- Financial Models --
model Timesheet {
  id             String   @id @default(uuid())
  shiftId        String   @unique
  shift          Shift    @relation(fields: [shiftId], references: [id])
  staffId        String
  staff          User     @relation(fields: [staffId], references: [id])
  clockInTime    DateTime
  clockOutTime   DateTime?
  totalHours     Float?
  regularHours   Float?
  additionalWork Float?   // Replaces 'overtime'
  status         String   @default("PENDING") // PENDING, APPROVED, REJECTED
  approvedById   String?
  approvedBy     User?    @relation("TimesheetApprover", fields: [approvedById], references: [id])
  notes          String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Invoice {
  id          String   @id @default(uuid())
  clientId    String
  client      ClientProfile @relation(fields: [clientId], references: [id])
  eventId     String?
  event       Event?   @relation(fields: [eventId], references: [id])
  amount      Float
  status      String   @default("DRAFT") // DRAFT, SENT, PAID, OVERDUE, CANCELLED
  dueDate     DateTime
  paidDate    DateTime?
  stripeId    String?  // For payment gateway
  pdfUrl      String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model PayrollRun {
  id          String   @id @default(uuid())
  periodStart DateTime
  periodEnd   DateTime
  processedBy String
  processor   User     @relation("PayrollProcessor", fields: [processedBy], references: [id])
  totalAmount Float
  status      String   @default("DRAFT") // DRAFT, PROCESSING, COMPLETED
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// -- Operations Models --
model IncidentReport {
  id          String   @id @default(uuid())
  eventId     String
  event       Event    @relation(fields: [eventId], references: [id])
  reportedBy  String
  reporter    User     @relation("IncidentReporter", fields: [reportedBy], references: [id])
  severity    String   @default("LOW") // LOW, MEDIUM, HIGH, CRITICAL
  description String
  status      String   @default("OPEN") // OPEN, INVESTIGATING, RESOLVED
  resolution  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// -- Chat & Communication Models --
model Conversation {
  id            String   @id @default(uuid())
  isGroup       Boolean  @default(false)
  name          String?  // For group chats
  eventId       String?  // Optional link to event group chat
  event         Event?   @relation(fields: [eventId], references: [id])
  lastMessageAt DateTime @default(now())
  
  participants  ConversationParticipant[]
  messages      Message[]
  createdAt     DateTime @default(now())
}

model ConversationParticipant {
  id             String   @id @default(uuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  joinedAt       DateTime @default(now())
  lastReadAt     DateTime @default(now())
  
  @@unique([conversationId, userId])
}

model Message {
  id             String   @id @default(uuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId       String
  sender         User     @relation(fields: [senderId], references: [id])
  content        String
  type           String   @default("TEXT") // TEXT, FILE, IMAGE
  fileUrl        String?
  fileName       String?
  isSystem       Boolean  @default(false)
  createdAt      DateTime @default(now())
}

model Notification {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  body        String
  type        String   @default("INFO") // INFO, ALERT, MESSAGE, SYSTEM
  isRead      Boolean  @default(false)
  linkUrl     String?
  createdAt   DateTime @default(now())
}
`;

fs.writeFileSync('prisma/schema.prisma', schema, 'utf8');
console.log('Schema written successfully');
