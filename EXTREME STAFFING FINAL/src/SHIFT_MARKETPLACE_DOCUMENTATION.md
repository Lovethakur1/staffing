# Shift Marketplace - Complete System Documentation

## 📋 Overview

The **Shift Marketplace** is a peer-to-peer shift trading platform that allows staff members to trade or swap shifts with other qualified team members. It provides flexibility for staff while maintaining manager oversight and ensuring qualified coverage for all events.

---

## 🎯 Business Need & Purpose

### **Why It Exists:**

1. **Staff Flexibility** - Life happens. Staff may need to trade shifts due to:
   - Family emergencies
   - Medical appointments
   - Scheduling conflicts
   - Better opportunities
   - Personal obligations

2. **Operational Continuity** - Instead of staff calling out or no-showing:
   - Shifts get filled by qualified replacements
   - Events maintain proper staffing levels
   - Clients receive consistent service quality

3. **Manager Efficiency** - Reduces administrative burden:
   - Staff find their own replacements
   - Manager only approves qualified trades
   - Less last-minute scrambling

4. **Financial Incentives** - Urgent shifts can offer bonuses:
   - Motivates staff to pick up last-minute shifts
   - Ensures critical positions get filled
   - Maintains event profitability

---

## 👥 User Roles & Permissions

### **1. STAFF Role**

**Can:**
- ✅ View all available shifts in marketplace
- ✅ Post their own shifts for trade
- ✅ Claim shifts they're qualified for
- ✅ See their posted shifts
- ✅ Track their claimed shifts
- ✅ Cancel their own postings (if no claims yet)
- ✅ View shift requirements and qualifications
- ✅ See bonus incentives for urgent shifts

**Cannot:**
- ❌ Approve shift trades (requires manager)
- ❌ Post shifts they don't own
- ❌ Claim shifts they're not qualified for
- ❌ See other staff's private information
- ❌ View financial details beyond shift pay

**Key Features for Staff:**
```typescript
// Tabs visible to staff:
- Available Shifts    // All open shifts they can claim
- Urgent Shifts      // High-priority shifts with bonuses
- My Posted          // Shifts they've posted
- My Claims          // Shifts they've claimed
```

---

### **2. MANAGER Role**

**Can:**
- ✅ View all marketplace activity
- ✅ Approve or reject shift claims
- ✅ See who posted and who claimed shifts
- ✅ Review qualifications before approval
- ✅ Post shifts on behalf of staff (if needed)
- ✅ Cancel problematic postings
- ✅ Set bonus incentives for urgent shifts
- ✅ View staff ratings and history

**Cannot:**
- ❌ Claim shifts themselves (managers don't work events)
- ❌ Auto-approve without qualification review
- ❌ Edit payment amounts (set by system)

**Approval Process:**
1. Staff claims shift → Manager gets notification
2. Manager reviews:
   - Claimant's qualifications
   - Claimant's rating/history
   - Shift requirements match
3. Manager approves or rejects with reason
4. Both parties get notified

---

### **3. ADMIN Role**

**Can:**
- ✅ Everything managers can do
- ✅ Override manager decisions if needed
- ✅ Set marketplace policies and fees
- ✅ View financial impacts
- ✅ Generate marketplace analytics
- ✅ Manage urgent shift bonus budgets
- ✅ Handle disputes

**Special Considerations:**
- Can see financial impact of shift trades
- Can enforce policies (e.g., late posting fees)
- Has access to full marketplace history and analytics

---

## 📊 Data Structure & Flow

### **Shift Listing Data Model:**

```typescript
interface ShiftListing {
  // Identification
  id: string;                      // "SH-001"
  
  // Original Owner Info
  originalStaffId: string;         // Who is posting
  originalStaffName: string;       // "David Martinez"
  originalStaffRating: number;     // 4.5 (quality indicator)
  
  // Event Details
  eventId: string;                 // Links to event
  eventName: string;               // "Holiday Corporate Party"
  date: string;                    // "2024-12-15"
  startTime: string;               // "18:00"
  endTime: string;                 // "23:00"
  
  // Shift Requirements
  role: string;                    // "Server", "Bartender", etc.
  location: string;                // "Downtown Convention Center"
  requirements: string[];          // ["Food Handler Cert", "2+ years exp"]
  
  // Financial
  pay: number;                     // 175.00 (5-hour minimum applies)
  bonusIncentive?: number;         // 25.00 (for urgent shifts)
  
  // Status & Metadata
  status: 'available' | 'pending' | 'filled' | 'cancelled';
  isUrgent: boolean;               // If within 48 hours
  postedDate: string;              // When listed
  reason: string;                  // Why posting (manager-only)
  
  // Claims & Approvals
  interestedStaff?: Array<{        // Who wants it
    id: string;
    name: string;
    rating: number;
  }>;
  approvedBy?: string;             // Manager who approved
}
```

---

## 🔄 Data Flow & Workflow

### **1. Staff Posts Shift**

```
Staff Action:
├─ Select shift from their schedule
├─ Provide reason (visible to manager only)
└─ Submit to marketplace

System Actions:
├─ Validates shift ownership
├─ Checks if event is in future
├─ Determines if urgent (< 48 hours)
├─ Creates ShiftListing with status: 'available'
├─ Notifies manager for approval
└─ Displays in marketplace
```

### **2. Staff Claims Shift**

```
Staff Action:
├─ Browse available shifts
├─ Click "Claim Shift"
└─ Confirm claim

System Actions:
├─ Validates qualifications
├─ Checks for schedule conflicts
├─ Adds to interestedStaff array
├─ Changes status to 'pending'
├─ Notifies manager
└─ Waits for manager approval
```

### **3. Manager Approval**

```
Manager Reviews:
├─ Original staff's reason
├─ Claimant's qualifications
├─ Claimant's rating/history
├─ Event requirements
└─ Makes decision

If APPROVED:
├─ Updates status to 'filled'
├─ Removes shift from original staff schedule
├─ Adds shift to claimant's schedule
├─ Records approvedBy
├─ Notifies both parties
└─ Removes from marketplace

If REJECTED:
├─ Status returns to 'available'
├─ Removes specific claimant
├─ Notifies claimant with reason
└─ Keeps listing active for others
```

---

## 💰 Financial Logic

### **Pay Calculation:**

```typescript
// Base pay follows 5-hour minimum rule
const calculatePay = (shift: Shift) => {
  const actualHours = calculateHours(shift.startTime, shift.endTime);
  const payableHours = Math.max(actualHours, 5); // 5-hour minimum
  const payRate = shift.role.hourlyRate; // Role-based rate
  const basePay = payableHours * payRate;
  const bonusPay = shift.isUrgent ? shift.bonusIncentive || 0 : 0;
  
  return basePay + bonusPay;
};

// Example:
// Server shift: 6pm - 11pm = 5 hours
// Pay rate: $35/hour
// Base: 5 hours × $35 = $175
// Urgent bonus: +$25
// Total: $200
```

### **Fees & Policies:**

```typescript
interface MarketplacePolicies {
  // Late posting fees (admin-configurable)
  latePostingFee: {
    within48Hours: 10,    // $10 fee
    within24Hours: 25,    // $25 fee
  };
  
  // Approval requirements
  minRatingToClaimUrgent: 4.0,  // Only high-rated for urgent
  maxActivePostings: 3,          // Per staff member
  
  // Cancellation rules
  canCancelIfNoClaims: true,
  cancellationFeeIfClaimed: 15,
}
```

---

## 🔍 Where Data Comes From

### **Data Sources:**

1. **Staff Schedules** (from ShiftsSchedule page)
   ```typescript
   // Staff can only post shifts they're assigned to
   const staffUpcomingShifts = allShifts.filter(
     shift => shift.staffId === currentUserId &&
              shift.date >= today
   );
   ```

2. **Event Information** (from Events database)
   ```typescript
   // Links to full event for context
   eventId: "EVT-1240",
   eventName: "Holiday Corporate Party",
   location: "Downtown Convention Center",
   ```

3. **Staff Profiles** (from Workforce database)
   ```typescript
   // Qualification matching
   staffQualifications: ["Food Handler Cert", "TIPS Certified"],
   staffRating: 4.5,
   experienceYears: 3,
   ```

4. **Role Requirements** (from system configuration)
   ```typescript
   roleRequirements: {
     "Server": ["Food Handler Cert", "2+ years experience"],
     "Bartender": ["TIPS Certification", "Mixology experience"],
     "AV Technician": ["AV equipment experience", "Technical skills"],
   }
   ```

---

## 📈 Key Statistics Tracked

```typescript
const marketplaceStats = {
  // Overview metrics
  available: 4,              // Open shifts available now
  urgent: 2,                 // Within 48 hours
  totalValue: 1032.50,       // Sum of all available shift pay
  avgPay: 258.12,            // Average shift pay
  
  // Activity metrics (admin-only)
  totalTrades: 156,          // All-time trades
  successRate: 0.89,         // 89% fill rate
  avgApprovalTime: "4.2 hours",
  topTraders: [...],         // Most active staff
  
  // Financial metrics (admin-only)
  totalFeesCollected: 450,   // Late posting fees
  totalBonusesPaid: 1200,    // Urgent bonuses
}
```

---

## 🎨 UI Components & Features

### **Tabs & Filters:**

**Available for All Users:**
- 🔍 Search by event name, role, or location
- 🏷️ Filter by role (Server, Bartender, etc.)
- 📊 Sort by date, pay, urgency

**Staff-Specific Tabs:**
- **Available Shifts** - All claimable shifts
- **Urgent** - High-priority with bonuses
- **My Posted** - Shifts they've listed
- **My Claims** - Shifts they've claimed

**Manager/Admin Views:**
- All tabs plus approval queue
- Pending approvals with one-click actions
- Staff qualification comparison

---

## ⚠️ Business Rules & Validations

### **Posting Rules:**

```typescript
// Staff can post a shift if:
✅ They own the shift (assigned to them)
✅ Event is in the future
✅ Not within 4 hours of start (too late)
✅ Haven't exceeded max active postings (3)
✅ No existing pending claim

// Fees apply if:
⚠️ Posted within 48 hours of event
⚠️ Posted within 24 hours of event (higher fee)
```

### **Claiming Rules:**

```typescript
// Staff can claim a shift if:
✅ They meet all qualifications
✅ No schedule conflict with existing shifts
✅ Rating meets minimum (if urgent shift)
✅ Not their own posting
✅ Shift still available (not pending/filled)

// Auto-reject if:
❌ Schedule conflict detected
❌ Missing required certifications
❌ Rating too low for urgent shift
❌ Shift already filled
```

### **Approval Rules:**

```typescript
// Manager should approve if:
✅ Claimant meets all requirements
✅ Claimant has good rating/history
✅ No red flags in background
✅ Proper certifications verified

// Manager should reject if:
❌ Qualifications not met
❌ Poor performance history
❌ Recent disciplinary issues
❌ Better qualified candidate available
```

---

## 🚨 Edge Cases & Scenarios

### **Scenario 1: Multiple Claims**

```
Situation:
└─ 3 staff members claim the same shift

Resolution:
├─ Manager sees all 3 candidates
├─ Can compare ratings, qualifications
├─ Approves best match
├─ Auto-rejects others with notification
└─ Shift filled, removed from marketplace
```

### **Scenario 2: Last-Minute Cancellation**

```
Situation:
└─ Staff posts shift 23 hours before event

System Response:
├─ Marks as "URGENT"
├─ Charges late posting fee ($25)
├─ Offers bonus incentive (+$50)
├─ Sends priority notifications
├─ Only allows high-rated staff (4.0+) to claim
└─ Requires faster manager approval (<2 hours)
```

### **Scenario 3: No Takers**

```
Situation:
└─ Shift posted but no one claims it

Escalation Path:
├─ Day 1: Normal listing
├─ Day 2: Add small bonus (+$25)
├─ Day 3: Increase bonus (+$50)
├─ 24hrs before: Manager notified
├─ Manager options:
│   ├─ Force assign from pool
│   ├─ Require original staff to work
│   ├─ Find external temp
│   └─ Adjust event staffing
```

### **Scenario 4: Claim After Approval**

```
Situation:
└─ Shift filled, but another qualified staff wants it

System Response:
├─ Status: Filled (not claimable)
├─ Option: "Notify me if available"
├─ If approved staff cancels:
│   ├─ Notify waiting staff
│   └─ Re-open to marketplace
```

---

## 🔗 Integration Points

### **With Other System Components:**

1. **ShiftsSchedule** (Scheduling System)
   - Source of shifts available to post
   - Destination when shift claimed and approved
   - Conflict detection

2. **Workforce** (Staff Management)
   - Staff qualifications and certifications
   - Staff ratings and performance history
   - Availability and preferences

3. **Events** (Event Management)
   - Event details and requirements
   - Client expectations
   - Venue information

4. **Payroll** (Financial System)
   - Shift pay calculations
   - Bonus tracking
   - Fee deductions

5. **Notifications** (Alert System)
   - New posting alerts
   - Claim notifications
   - Approval/rejection messages

6. **Analytics** (Reporting)
   - Marketplace metrics
   - Staff trading patterns
   - Financial impact analysis

---

## 📱 Notification Flow

```
Staff Posts Shift:
├─ Manager: "New shift posted by [Name] for approval"
└─ All Qualified Staff: "New shift available: [Event]"

Staff Claims Shift:
├─ Original Poster: "[Name] claimed your shift"
├─ Manager: "Pending approval: [Name] for [Event]"
└─ Claimant: "Claim submitted, awaiting approval"

Manager Approves:
├─ Original Poster: "Your shift was claimed by [Name]"
├─ Claimant: "Shift approved! Added to your schedule"
└─ Admin: "Shift trade completed: [Event]"

Manager Rejects:
├─ Claimant: "Claim rejected: [Reason]"
└─ Shift status: Back to 'available'
```

---

## 🎯 Success Metrics

### **Key Performance Indicators:**

```typescript
const kpis = {
  // Operational
  fillRate: 89%,              // % of posted shifts that get filled
  avgTimeToFill: "18 hours",  // How fast shifts get claimed
  
  // Quality
  approvalRate: 94%,          // % of claims approved
  cancelRate: 3%,             // % of approved shifts later cancelled
  
  // Satisfaction
  staffSatisfaction: 4.6,     // Rating of marketplace experience
  managerSatisfaction: 4.4,   // Manager ease-of-use rating
  
  // Financial
  feesCollected: "$450/month",
  bonusesPaid: "$1200/month",
  netImpact: "+$3400/month",  // Reduced no-shows, overtime
}
```

---

## 🔮 Future Enhancements

### **Planned Features:**

1. **Auto-Matching Algorithm**
   - Suggest best matches based on qualifications
   - Predict acceptance likelihood
   - Optimize for ratings and proximity

2. **Shift Swapping (Not Just Posting)**
   - Direct swaps between two staff
   - "I'll take your Sunday if you take my Friday"
   - Reduces one-way trades

3. **Recurring Shift Trades**
   - "Take all my Mondays in exchange for Fridays"
   - Long-term arrangements
   - Manager pre-approval

4. **Mobile App Integration**
   - Push notifications for new shifts
   - Quick claim from phone
   - Location-based suggestions

5. **Reputation System**
   - Reliability score for traders
   - Badges for helpful staff
   - Priority access for top traders

---

## ⚙️ Technical Implementation

### **Current State (Demo Data):**

```typescript
// Mock data in ShiftMarketplace.tsx
const shiftListings: ShiftListing[] = [
  // Hardcoded array of 5 sample shifts
  // Demonstrates all features and states
];

// In production, this would be:
const fetchShiftListings = async () => {
  const response = await supabase
    .from('shift_listings')
    .select(`
      *,
      original_staff:staff!original_staff_id(*),
      event:events!event_id(*),
      interested_staff:shift_claims(
        staff:staff!staff_id(*)
      )
    `)
    .eq('status', 'available')
    .order('posted_date', { ascending: false });
    
  return response.data;
};
```

### **Database Schema (Production):**

```sql
-- Shift Listings Table
CREATE TABLE shift_listings (
  id UUID PRIMARY KEY,
  original_staff_id UUID REFERENCES staff(id),
  event_id UUID REFERENCES events(id),
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  role VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  pay DECIMAL(10,2) NOT NULL,
  bonus_incentive DECIMAL(10,2),
  is_urgent BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'available',
  posted_date TIMESTAMP DEFAULT NOW(),
  reason TEXT,
  requirements JSONB,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Shift Claims Table
CREATE TABLE shift_claims (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES shift_listings(id),
  staff_id UUID REFERENCES staff(id),
  claimed_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_shift_listings_status ON shift_listings(status);
CREATE INDEX idx_shift_listings_urgent ON shift_listings(is_urgent);
CREATE INDEX idx_shift_claims_staff ON shift_claims(staff_id);
```

---

## 📞 Support & FAQs

### **For Staff:**

**Q: Can I post a shift I just got assigned?**
A: Yes, as long as it's in the future and you haven't exceeded the 3 active posting limit.

**Q: Why was my claim rejected?**
A: Possible reasons: Missing qualifications, schedule conflict, or better qualified candidate selected.

**Q: What happens if no one claims my shift?**
A: You're still responsible for the shift unless a manager makes other arrangements.

### **For Managers:**

**Q: Can I reject a claim without a reason?**
A: No, you must provide feedback for rejected claims.

**Q: Can I manually assign a shift instead of waiting for claims?**
A: Yes, you can approve a specific staff member even if they haven't claimed it.

**Q: What if the shift is urgent and no one qualified is claiming?**
A: You can increase the bonus incentive or manually assign from the staff pool.

---

## 📊 Summary

The Shift Marketplace is a **self-service shift trading platform** that:

✅ Empowers staff to manage their schedules flexibly
✅ Maintains manager oversight and quality control  
✅ Reduces administrative burden on managers
✅ Ensures qualified coverage for all events
✅ Provides financial incentives for urgent coverage
✅ Tracks all trades with full audit trail
✅ Integrates seamlessly with scheduling and payroll

It transforms shift management from a **manager-intensive process** to a **staff-driven marketplace** while maintaining quality and accountability.
