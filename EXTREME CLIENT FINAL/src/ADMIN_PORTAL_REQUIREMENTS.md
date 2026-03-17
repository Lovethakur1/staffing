# 🔴 ADMIN PORTAL AUTOMATION REQUIREMENTS

## 📋 Overview

This document outlines the complete admin portal functionality needed to support the automated event booking system. The admin portal receives event requests from clients (with tier-based pricing + favorites) and provides one-click approval with automatic staff assignment.

---

## 🎯 Core Workflow

```
CLIENT SUBMITS REQUEST
         ↓
[Saved to event_requests table with all pricing]
         ↓
ADMIN SEES REQUEST IN QUEUE
         ↓
[Reviews pre-calculated pricing, staff availability, favorites]
         ↓
ADMIN CLICKS "APPROVE"
         ↓
SYSTEM AUTO-CREATES:
  1. Event record
  2. Staff assignments (favorites + tier auto-fill)
  3. Invoice with locked pricing
  4. Notifications to client + staff
         ↓
EVENT CONFIRMED ✅
```

---

## 📊 DATABASE SCHEMA NEEDED

### Table: `event_requests`
Stores all pending event requests from clients before admin approval.

```sql
CREATE TABLE event_requests (
  id VARCHAR(50) PRIMARY KEY,
  client_id VARCHAR(50) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  
  -- Event Details
  event_title VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration DECIMAL(4,2) NOT NULL,
  
  -- Location
  venue_name VARCHAR(255),
  venue_address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  distance_miles INT,
  
  -- Guest Count
  expected_guests INT,
  
  -- Staff Requirements (JSON)
  staff_requirements JSON NOT NULL,
  /* Example JSON structure:
  [
    {
      "role": "Bartender",
      "quantity": 15,
      "selectedFavorites": ["staff_123", "staff_456"],
      "selectedTier": "STANDARD",
      "tierRate": 41,
      "favoritesCost": 500,
      "tierCost": 2665,
      "totalCost": 3165
    },
    {
      "role": "Server (Plated)",
      "quantity": 25,
      "selectedFavorites": [],
      "selectedTier": "STANDARD",
      "tierRate": 35,
      "favoritesCost": 0,
      "tierCost": 4375,
      "totalCost": 4375
    }
  ]
  */
  
  -- Pricing Breakdown (JSON)
  pricing_breakdown JSON NOT NULL,
  /* Example JSON structure:
  {
    "staffSubtotal": 8415,
    "minimumApplied": false,
    "weekendFee": 1683,
    "holidayFee": 0,
    "rushFee": 0,
    "travelFee": 75,
    "platformFee": 1526,
    "finalTotal": 11699,
    "paymentOptions": {
      "fullPaymentDiscount": 584,
      "fullPaymentTotal": 11115,
      "depositAmount": 5849
    }
  }
  */
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  /* Values: 'pending', 'approved', 'declined', 'needs_changes' */
  
  -- Admin Actions
  reviewed_by VARCHAR(50),
  reviewed_at TIMESTAMP,
  admin_notes TEXT,
  
  -- Special Requirements
  special_requirements TEXT,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients(id)
);
```

### Table: `staff_assignments`
Stores which staff are assigned to which events (after approval).

```sql
CREATE TABLE staff_assignments (
  id VARCHAR(50) PRIMARY KEY,
  event_id VARCHAR(50) NOT NULL,
  staff_id VARCHAR(50) NOT NULL,
  role VARCHAR(100) NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  hours DECIMAL(4,2) NOT NULL,
  total_pay DECIMAL(10,2) NOT NULL,
  
  -- Assignment Type
  assignment_type VARCHAR(50) NOT NULL,
  /* Values: 'CLIENT_FAVORITE', 'AUTO_ASSIGNED' */
  
  -- Assignment Metadata
  tier VARCHAR(50),
  /* Values: 'JUNIOR', 'STANDARD', 'PREMIUM', 'ELITE', NULL for favorites */
  
  is_guaranteed BOOLEAN DEFAULT FALSE,
  /* TRUE for client favorites, FALSE for auto-assigned */
  
  -- Status
  status VARCHAR(50) DEFAULT 'assigned',
  /* Values: 'assigned', 'accepted', 'declined', 'completed' */
  
  -- Notifications
  notified_at TIMESTAMP,
  accepted_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (staff_id) REFERENCES staff(id),
  UNIQUE KEY unique_event_staff (event_id, staff_id)
);
```

### Table: `pricing_configurations`
Stores admin-configurable pricing rules.

```sql
CREATE TABLE pricing_configurations (
  id VARCHAR(50) PRIMARY KEY,
  
  -- Tier Rates by Role
  role VARCHAR(100) NOT NULL,
  
  junior_rate DECIMAL(10,2) NOT NULL,
  standard_rate DECIMAL(10,2) NOT NULL,
  premium_rate DECIMAL(10,2) NOT NULL,
  elite_rate DECIMAL(10,2) NOT NULL,
  
  -- Tier Criteria (JSON)
  tier_criteria JSON,
  /* Example:
  {
    "JUNIOR": { "experience": "0-1 years", "rating": "4.0-4.3", "available": 25 },
    "STANDARD": { "experience": "2-4 years", "rating": "4.4-4.7", "available": 40 },
    "PREMIUM": { "experience": "5-8 years", "rating": "4.8-4.9", "available": 18 },
    "ELITE": { "experience": "8+ years", "rating": "5.0", "available": 8 }
  }
  */
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_role (role)
);
```

### Table: `multiplier_rules`
Stores dynamic pricing multipliers.

```sql
CREATE TABLE multiplier_rules (
  id VARCHAR(50) PRIMARY KEY,
  rule_name VARCHAR(100) NOT NULL,
  rule_type VARCHAR(50) NOT NULL,
  /* Values: 'WEEKEND', 'HOLIDAY', 'RUSH_BOOKING', 'PEAK_SEASON', 'LARGE_EVENT' */
  
  multiplier DECIMAL(5,2) NOT NULL,
  /* Example: 1.20 for 20% markup, 0.95 for 5% discount */
  
  conditions JSON,
  /* Example for WEEKEND:
  { "days": ["Friday", "Saturday", "Sunday"] }
  
  Example for RUSH_BOOKING:
  { "daysBeforeEvent": 7 }
  
  Example for LARGE_EVENT:
  { "minGuests": 200, "multiplier": 1.10 }
  */
  
  is_active BOOLEAN DEFAULT TRUE,
  priority INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🖥️ ADMIN PORTAL PAGES TO BUILD

### 1. **Event Requests Queue** (Main Page)

**Route:** `/admin/event-requests`

**Purpose:** Central hub for reviewing and approving event requests

**UI Components:**

```
┌────────────────────────────────────────────────────────────┐
│ 📥 EVENT REQUESTS QUEUE                    [Settings ⚙️]  │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ Filters: [All Status ▼] [Date Range ▼] [Client ▼]        │
│ Sort by: [Date ▼] Search: [____________🔍]                │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 🔴 PENDING (12)    🟢 APPROVED (45)    ❌ DECLINED  │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Request #1234                        🔴 PENDING      │  │
│ │ Emma Williams - Corporate Gala                       │  │
│ │ Jan 15, 2025 • 6:00 PM - 11:00 PM • 200 guests      │  │
│ │                                                       │  │
│ │ 💰 Total: $11,699                                    │  │
│ │ 👥 Staff: 43 total (3 favorites selected)           │  │
│ │ 📍 Distance: 15 miles                                │  │
│ │                                                       │  │
│ │ ✅ All Checks Passed:                                │  │
│ │ ├─ ✓ All favorite staff available                   │  │
│ │ ├─ ✓ Sufficient tier staff available                │  │
│ │ ├─ ✓ No scheduling conflicts                        │  │
│ │ └─ ✓ Pricing calculated correctly                   │  │
│ │                                                       │  │
│ │ Submitted: 2 hours ago                               │  │
│ │                                                       │  │
│ │ [✅ Approve & Auto-Create] [👁️ Review] [❌ Decline]  │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Request #1235                        ⚠️ NEEDS REVIEW │  │
│ │ John Smith - Wedding Reception                       │  │
│ │ Jan 20, 2025 • 5:00 PM - 12:00 AM • 150 guests      │  │
│ │                                                       │  │
│ │ 💰 Total: $9,450                                     │  │
│ │ 👥 Staff: 28 total (2 favorites selected)           │  │
│ │                                                       │  │
│ │ ⚠️ ISSUES DETECTED:                                  │  │
│ │ ├─ ❌ Sarah Johnson (favorite) unavailable          │  │
│ │ │    → Suggest: Maria Garcia (4.8★) instead         │  │
│ │ └─ ⚠️ Only 3 Elite bartenders available (needs 5)   │  │
│ │      → Recommend Premium tier instead               │  │
│ │                                                       │  │
│ │ Submitted: 5 hours ago                               │  │
│ │                                                       │  │
│ │ [👁️ Review & Modify] [✉️ Contact Client]            │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ [Load More...] Showing 1-10 of 57 requests                │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

**Features:**
- ✅ Real-time status badges (Pending, Approved, Declined)
- ✅ Smart conflict detection (shows warnings before approval)
- ✅ One-click approve button (triggers auto-creation)
- ✅ Batch approval (select multiple, approve all)
- ✅ Priority sorting (urgent requests at top)
- ✅ Quick filters (by status, date, client)
- ✅ Auto-refresh every 30 seconds

---

### 2. **Request Detail View** (Modal or Page)

**Route:** `/admin/event-requests/:requestId`

**Purpose:** Detailed view of a single event request for review

**UI Components:**

```
┌─────────────────────────────────────────────────────────────┐
│ REQUEST #1234 - Emma Williams                    [← Back]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 📅 EVENT DETAILS                                     │   │
│ │                                                       │   │
│ │ Title: Corporate Gala                                │   │
│ │ Type: Corporate Event                                │   │
│ │ Date: January 15, 2025 (Wednesday)                   │   │
│ │ Time: 6:00 PM - 11:00 PM (5 hours)                   │   │
│ │ Guests: 200 expected                                 │   │
│ │                                                       │   │
│ │ Venue: Grand Luxe Hotel Ballroom                     │   │
│ │        159 Grand Avenue, Los Angeles, CA 90071       │   │
│ │        📍 15 miles from office                       │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 👥 STAFF REQUIREMENTS (43 total staff)               │   │
│ │                                                       │   │
│ │ ┌────────────────────────────────────────────────┐   │   │
│ │ │ 🍸 BARTENDERS (15 needed)                      │   │   │
│ │ │                                                 │   │   │
│ │ │ CLIENT SELECTED FAVORITES (2):                 │   │   │
│ │ │ ✅ Sarah Martinez (Elite - $55/hr)             │   │   │
│ │ │    ✓ Available Jan 15                          │   │   │
│ │ │    142 events • 5.0★ rating                    │   │   │
│ │ │                                                 │   │   │
│ │ │ ✅ Mike Johnson (Premium - $45/hr)             │   │   │
│ │ │    ✓ Available Jan 15                          │   │   │
│ │ │    89 events • 4.8★ rating                     │   │   │
│ │ │                                                 │   │   │
│ │ │ AUTO-ASSIGN REMAINING (13 from Standard Tier): │   │   │
│ │ │ → Target avg: $41/hr                           │   │   │
│ │ │ → Available pool: 38 qualified staff           │   │   │
│ │ │ → [Preview Auto-Assignments]                   │   │   │
│ │ │                                                 │   │   │
│ │ │ COST: $3,165 (matches client quote ✓)         │   │   │
│ │ └────────────────────────────────────────────────┘   │   │
│ │                                                       │   │
│ │ ┌────────────────────────────────────────────────┐   │   │
│ │ │ 👔 SERVERS (25 needed - All Standard Tier)     │   │   │
│ │ │                                                 │   │   │
│ │ │ NO FAVORITES SELECTED                           │   │   │
│ │ │                                                 │   │   │
│ │ │ AUTO-ASSIGN ALL (25 from Standard Tier):       │   │   │
│ │ │ → Target avg: $35/hr                           │   │   │
│ │ │ → Available pool: 40 qualified staff           │   │   │
│ │ │ → [Preview Auto-Assignments]                   │   │   │
│ │ │                                                 │   │   │
│ │ │ COST: $4,375 (matches client quote ✓)         │   │   │
│ │ └────────────────────────────────────────────────┘   │   │
│ │                                                       │   │
│ │ ┌────────────────────────────────────────────────┐   │   │
│ │ │ 👨‍💼 SUPERVISORS (3 needed)                      │   │   │
│ │ │                                                 │   │   │
│ │ │ CLIENT SELECTED FAVORITES (1):                 │   │   │
│ │ │ ✅ Linda Chen (Elite - $65/hr)                 │   │   │
│ │ │    ✓ Available Jan 15                          │   │   │
│ │ │    98 events • 5.0★ rating                     │   │   │
│ │ │                                                 │   │   │
│ │ │ AUTO-ASSIGN REMAINING (2 from Premium Tier):   │   │   │
│ │ │ → Target avg: $55/hr                           │   │   │
│ │ │ → Available pool: 8 qualified staff            │   │   │
│ │ │                                                 │   │   │
│ │ │ COST: $875 (matches client quote ✓)           │   │   │
│ │ └────────────────────────────────────────────────┘   │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 💰 PRICING BREAKDOWN                                 │   │
│ │                                                       │   │
│ │ Staff Costs:                                         │   │
│ │ ├─ Bartenders: $3,165                                │   │
│ │ ├─ Servers: $4,375                                   │   │
│ │ └─ Supervisors: $875                                 │   │
│ │ Subtotal: $8,415                                     │   │
│ │                                                       │   │
│ │ Additional Fees:                                     │   │
│ │ ├─ Weekend Premium (+20%): $1,683                    │   │
│ │ ├─ Travel Fee (15 miles): $75                        │   │
│ │ └─ Platform Fee (15%): $1,526                        │   │
│ │                                                       │   │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │   │
│ │ FINAL TOTAL: $11,699                                 │   │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │   │
│ │                                                       │   │
│ │ Client Selected Payment: 50% Deposit                 │   │
│ │ ├─ Deposit: $5,849.50                                │   │
│ │ └─ Before Event: $5,849.50                           │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ ✅ VALIDATION CHECKS                                 │   │
│ │                                                       │   │
│ │ ✓ All favorite staff available                       │   │
│ │ ✓ Sufficient tier staff (91 total available)         │   │
│ │ ✓ No scheduling conflicts detected                   │   │
│ │ ✓ Pricing matches client quote exactly               │   │
│ │ ✓ All staff certified for event type                 │   │
│ │ ✓ Venue distance within acceptable range             │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 📝 ADMIN NOTES                                       │   │
│ │ [Add notes for this request...]                      │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ ACTIONS                                              │   │
│ │                                                       │   │
│ │ [✅ Approve & Auto-Create Event]                     │   │
│ │ [✏️ Modify Request]                                  │   │
│ │ [✉️ Contact Client]                                  │   │
│ │ [❌ Decline Request]                                 │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- ✅ Complete request details
- ✅ Staff breakdown with favorites highlighted
- ✅ Real-time availability checks
- ✅ Pricing validation
- ✅ Conflict detection
- ✅ Preview auto-assignment results
- ✅ Admin notes field
- ✅ Action buttons (approve, modify, decline)

---

### 3. **Auto-Assignment Preview Modal**

**Opens when:** Admin clicks "Preview Auto-Assignments" button

**Purpose:** Show exactly which staff will be assigned before approving

```
┌────────────────────────────────────────────────────────┐
│ PREVIEW: Bartender Auto-Assignments              [✕]  │
├────────────────────────────────────────────────────────┤
│                                                         │
│ System will assign these 13 Standard Tier bartenders:  │
│                                                         │
│ ┌──────────────────────────────────────────────────┐  │
│ │ 1. Jessica Rodriguez      ⭐ 4.7★    $43/hr     │  │
│ │    5 yrs exp • Worked with Emma 3 times before   │  │
│ │    🏆 Priority: Repeat client favorite           │  │
│ │                                                   │  │
│ │ 2. Marcus Thompson        ⭐ 4.6★    $42/hr     │  │
│ │    4 yrs exp • 6 miles from venue                │  │
│ │    📍 Priority: Close proximity                  │  │
│ │                                                   │  │
│ │ 3. Amy Chen               ⭐ 4.5★    $40/hr     │  │
│ │    3 yrs exp • High performance score            │  │
│ │                                                   │  │
│ │ 4. David Martinez         ⭐ 4.6★    $41/hr     │  │
│ │    3 yrs exp • Available all day                 │  │
│ │                                                   │  │
│ │ ... (showing top 4 of 13)                        │  │
│ │                                                   │  │
│ │ [View Full List (13)]                            │  │
│ └──────────────────────────────────────────────────┘  │
│                                                         │
│ ✓ Average Rate: $41.08/hr (target: $41/hr)            │
│ ✓ All staff available and qualified                    │
│ ✓ Balanced team (mix of experience levels)             │
│                                                         │
│ [Looks Good] [Manual Override]                         │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

### 4. **Pricing Configuration Dashboard**

**Route:** `/admin/pricing-config`

**Purpose:** Configure tier rates, multipliers, and pricing rules

```
┌────────────────────────────────────────────────────────────┐
│ ⚙️ PRICING CONFIGURATION                                   │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ [Tier Rates] [Multipliers] [Travel Fees] [Platform Fees]  │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ TIER RATES BY ROLE                                   │  │
│ │                                                       │  │
│ │ BARTENDERS:                                          │  │
│ │ ├─ 🥉 Junior:   [$32/hr] (0-1 yrs, 4.0-4.3★)       │  │
│ │ ├─ 🥈 Standard: [$41/hr] (2-4 yrs, 4.4-4.7★)       │  │
│ │ ├─ 🥇 Premium:  [$53/hr] (5-8 yrs, 4.8-4.9★)       │  │
│ │ └─ 💎 Elite:    [$68/hr] (8+ yrs, 5.0★)            │  │
│ │                                                       │  │
│ │ [Edit Bartender Rates] [Clone to All Servers]       │  │
│ │                                                       │  │
│ │ SERVERS (PLATED):                                    │  │
│ │ ├─ Junior: [$28/hr]   Standard: [$35/hr]           │  │
│ │ ├─ Premium: [$45/hr]  Elite: [$58/hr]              │  │
│ │                                                       │  │
│ │ [+ Add New Role]                                     │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ MULTIPLIER RULES                                     │  │
│ │                                                       │  │
│ │ ☑️ Weekend Premium:     +20% (Fri-Sun)              │  │
│ │ ☑️ Holiday Premium:     +30% (Major holidays)       │  │
│ │ ☑️ Rush Booking:        +25% (<7 days notice)       │  │
│ │ ☑️ Large Event:         +10% (200+ guests)          │  │
│ │ ☐ Peak Season:          +15% (May-Sept)             │  │
│ │                                                       │  │
│ │ [+ Add Custom Rule]                                  │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ TRAVEL FEE SCHEDULE                                  │  │
│ │                                                       │  │
│ │ 0-10 miles:    $0                                    │  │
│ │ 11-25 miles:   $75                                   │  │
│ │ 26-50 miles:   $150                                  │  │
│ │ 51+ miles:     $250 (or custom quote)                │  │
│ │                                                       │  │
│ │ [Edit Travel Fees]                                   │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ [Save All Changes] [Reset to Defaults]                     │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

**Features:**
- ✅ Edit tier rates per role
- ✅ Enable/disable multipliers
- ✅ Configure travel fee thresholds
- ✅ Set platform fee percentage
- ✅ Clone rates across similar roles
- ✅ View pricing history
- ✅ Test pricing calculator with sample data

---

### 5. **Auto-Approval Settings**

**Route:** `/admin/auto-approval`

**Purpose:** Configure which clients/requests can be auto-approved

```
┌────────────────────────────────────────────────────────────┐
│ 🤖 AUTO-APPROVAL SETTINGS                                  │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ ☑️ Enable Auto-Approval (for qualified requests)           │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ AUTO-APPROVE IF:                                     │  │
│ │                                                       │  │
│ │ ☑️ Client has 5+ completed events                    │  │
│ │ ☑️ Client has no payment issues                      │  │
│ │ ☑️ Client rating ≥ 4.5★ (from staff reviews)        │  │
│ │ ☑️ Event total < $10,000                             │  │
│ │ ☑️ All favorite staff available                      │  │
│ │ ☑️ Sufficient tier staff available                   │  │
│ │ ☑️ No scheduling conflicts                           │  │
│ │                                                       │  │
│ │ Still notify admin for review: ☑️                   │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ TRUSTED CLIENTS (Auto-Approved)                      │  │
│ │                                                       │  │
│ │ • Emma Williams         ✓ 12 events, 5.0★           │  │
│ │ • John Smith            ✓ 8 events, 4.8★            │  │
│ │ • Sarah Anderson        ✓ 15 events, 4.9★           │  │
│ │                                                       │  │
│ │ [Add Client] [Remove]                                │  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ [Save Settings]                                             │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 🔧 BACKEND API ENDPOINTS NEEDED

### 1. **Create Event Request** (Client Portal)
```
POST /api/event-requests

Request Body:
{
  "clientId": "client_123",
  "eventDetails": {
    "title": "Corporate Gala",
    "type": "Corporate Event",
    "date": "2025-01-15",
    "startTime": "18:00",
    "endTime": "23:00",
    "venue": {...},
    "expectedGuests": 200
  },
  "staffRequirements": [
    {
      "role": "Bartender",
      "quantity": 15,
      "selectedFavorites": ["staff_123", "staff_456"],
      "selectedTier": "STANDARD"
    }
  ],
  "pricingBreakdown": {
    "staffSubtotal": 8415,
    "finalTotal": 11699,
    ...
  }
}

Response:
{
  "success": true,
  "requestId": "req_789",
  "message": "Event request submitted successfully",
  "estimatedReviewTime": "2-4 hours"
}
```

### 2. **Get Event Requests** (Admin Portal)
```
GET /api/admin/event-requests?status=pending&sort=createdAt&order=desc

Response:
{
  "success": true,
  "requests": [
    {
      "id": "req_789",
      "clientName": "Emma Williams",
      "eventTitle": "Corporate Gala",
      "eventDate": "2025-01-15",
      "totalCost": 11699,
      "status": "pending",
      "validationChecks": {
        "favoritesAvailable": true,
        "tierStaffAvailable": true,
        "noConflicts": true,
        "pricingValid": true
      },
      "createdAt": "2025-01-10T14:30:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "pageSize": 10
}
```

### 3. **Approve Event Request** (Admin Portal)
```
POST /api/admin/event-requests/:requestId/approve

Request Body:
{
  "adminId": "admin_001",
  "adminNotes": "Approved - all checks passed"
}

Response:
{
  "success": true,
  "eventId": "event_456",
  "message": "Event created successfully",
  "assignedStaff": [
    {
      "staffId": "staff_123",
      "role": "Bartender",
      "assignmentType": "CLIENT_FAVORITE",
      "rate": 55,
      "notificationSent": true
    },
    {
      "staffId": "staff_789",
      "role": "Bartender",
      "assignmentType": "AUTO_ASSIGNED",
      "tier": "STANDARD",
      "rate": 41,
      "notificationSent": true
    }
  ],
  "invoiceId": "inv_321",
  "clientNotified": true
}
```

### 4. **Preview Auto-Assignments** (Admin Portal)
```
POST /api/admin/event-requests/:requestId/preview-assignments

Request Body:
{
  "role": "Bartender"
}

Response:
{
  "success": true,
  "assignments": [
    {
      "staffId": "staff_789",
      "name": "Jessica Rodriguez",
      "rating": 4.7,
      "experience": "5 years",
      "rate": 43,
      "distance": 6,
      "priorityReason": "Worked with client before"
    }
  ],
  "averageRate": 41.08,
  "targetRate": 41,
  "allAvailable": true
}
```

### 5. **Get Pricing Configuration** (Admin Portal)
```
GET /api/admin/pricing-config

Response:
{
  "success": true,
  "tierRates": {
    "Bartender": {
      "JUNIOR": 32,
      "STANDARD": 41,
      "PREMIUM": 53,
      "ELITE": 68
    }
  },
  "multipliers": {
    "WEEKEND": { "active": true, "rate": 1.20 },
    "HOLIDAY": { "active": true, "rate": 1.30 },
    "RUSH_BOOKING": { "active": true, "rate": 1.25 }
  },
  "travelFees": [
    { "minMiles": 0, "maxMiles": 10, "fee": 0 },
    { "minMiles": 11, "maxMiles": 25, "fee": 75 }
  ],
  "platformFee": 0.15
}
```

### 6. **Update Pricing Configuration** (Admin Portal)
```
PUT /api/admin/pricing-config

Request Body:
{
  "tierRates": {
    "Bartender": {
      "STANDARD": 42  // Updated from 41
    }
  }
}

Response:
{
  "success": true,
  "message": "Pricing configuration updated",
  "affectedRequests": 3  // Number of pending requests affected
}
```

---

## 🤖 AUTO-ASSIGNMENT ALGORITHM

### Pseudo-Code Logic:

```javascript
async function autoAssignStaff(eventRequest) {
  const assignedStaff = [];
  
  for (const requirement of eventRequest.staffRequirements) {
    
    // 1. ASSIGN FAVORITES FIRST (Guaranteed)
    for (const favoriteStaffId of requirement.selectedFavorites) {
      const staff = await getStaffById(favoriteStaffId);
      
      await createAssignment({
        eventId: eventRequest.eventId,
        staffId: staff.id,
        role: requirement.role,
        rate: staff.hourlyRate,
        assignmentType: 'CLIENT_FAVORITE',
        isGuaranteed: true,
      });
      
      await sendNotification(staff.id, {
        type: 'FAVORITE_ASSIGNMENT',
        message: `${eventRequest.clientName} specifically requested you!`,
        eventId: eventRequest.eventId,
      });
      
      assignedStaff.push(staff);
    }
    
    // 2. AUTO-ASSIGN REMAINING FROM TIER
    const remainingCount = requirement.quantity - requirement.selectedFavorites.length;
    
    if (remainingCount > 0) {
      // Get available staff in selected tier
      const availableStaff = await getAvailableStaffInTier({
        role: requirement.role,
        tier: requirement.selectedTier,
        eventDate: eventRequest.eventDate,
        excludeStaffIds: requirement.selectedFavorites,
      });
      
      // Smart prioritization
      const prioritizedStaff = availableStaff.sort((a, b) => {
        
        // Priority 1: Previously worked with this client
        const aWorkedWithClient = hasWorkedWithClient(a.id, eventRequest.clientId);
        const bWorkedWithClient = hasWorkedWithClient(b.id, eventRequest.clientId);
        if (aWorkedWithClient && !bWorkedWithClient) return -1;
        if (!aWorkedWithClient && bWorkedWithClient) return 1;
        
        // Priority 2: Higher rating within tier
        if (a.rating !== b.rating) return b.rating - a.rating;
        
        // Priority 3: More experience within tier
        if (a.experience !== b.experience) return b.experience - a.experience;
        
        // Priority 4: Closer proximity to venue
        const aDistance = calculateDistance(a.location, eventRequest.venue);
        const bDistance = calculateDistance(b.location, eventRequest.venue);
        if (aDistance !== bDistance) return aDistance - bDistance;
        
        // Priority 5: Better performance score
        return b.performanceScore - a.performanceScore;
      });
      
      // Take top N staff
      const selectedStaff = prioritizedStaff.slice(0, remainingCount);
      
      // Balance rates to hit target average
      const balancedStaff = balanceRatesToTarget(
        selectedStaff,
        requirement.tierRate,
        remainingCount
      );
      
      // Create assignments
      for (const staff of balancedStaff) {
        await createAssignment({
          eventId: eventRequest.eventId,
          staffId: staff.id,
          role: requirement.role,
          rate: staff.hourlyRate,
          assignmentType: 'AUTO_ASSIGNED',
          tier: requirement.selectedTier,
          isGuaranteed: false,
        });
        
        await sendNotification(staff.id, {
          type: 'EVENT_ASSIGNMENT',
          message: `You've been assigned to ${eventRequest.eventTitle}`,
          eventId: eventRequest.eventId,
        });
        
        assignedStaff.push(staff);
      }
    }
  }
  
  return assignedStaff;
}

// Smart balancing to ensure average rate matches tier
function balanceRatesToTarget(staffList, targetAvgRate, quantity) {
  let currentAvg = staffList.reduce((sum, s) => sum + s.hourlyRate, 0) / quantity;
  
  // If within 2% of target, it's acceptable
  if (Math.abs(currentAvg - targetAvgRate) / targetAvgRate <= 0.02) {
    return staffList;
  }
  
  // If too high, swap highest-paid with lower-paid
  if (currentAvg > targetAvgRate) {
    // Find replacement logic...
    // Swap and recalculate...
  }
  
  // If too low, swap lowest-paid with higher-paid
  if (currentAvg < targetAvgRate) {
    // Find replacement logic...
    // Swap and recalculate...
  }
  
  return staffList;
}
```

---

## 🎯 ADMIN PORTAL MVP CHECKLIST

### Phase 1: Core Functionality (Build First)
- [ ] Event Requests Queue page
- [ ] Request Detail View modal/page
- [ ] Approve button with auto-creation logic
- [ ] Basic conflict detection
- [ ] Email notifications (to client + staff)
- [ ] Database schema implementation
- [ ] API endpoints (create request, approve, decline)

### Phase 2: Smart Features
- [ ] Auto-assignment algorithm
- [ ] Preview assignments modal
- [ ] Staff availability checks
- [ ] Rate balancing logic
- [ ] Batch approval
- [ ] Pricing configuration dashboard

### Phase 3: Advanced
- [ ] Auto-approval settings
- [ ] Analytics dashboard (request trends)
- [ ] Modify request feature
- [ ] Client communication tools
- [ ] Staff replacement suggestions
- [ ] Historical pricing data

---

## 📧 NOTIFICATION TEMPLATES

### To Client (Approval):
```
Subject: ✅ Your event request has been approved!

Hi Emma,

Great news! Your Corporate Gala on January 15, 2025 has been confirmed.

Event Details:
- Date: January 15, 2025
- Time: 6:00 PM - 11:00 PM
- Venue: Grand Luxe Hotel Ballroom
- Staff: 43 professionals assigned

Your Favorite Staff:
✓ Sarah Martinez (Bartender)
✓ Mike Johnson (Bartender)
✓ Linda Chen (Supervisor)

Total Cost: $11,699
Payment: 50% deposit ($5,849.50) due now

[View Full Event Details] [Make Payment]

Questions? Reply to this email or call us at (555) 123-4567.
```

### To Staff (Assignment):
```
Subject: 🎉 You've been assigned to an event!

Hi Sarah,

Good news! You've been assigned to a new event.

Emma Williams specifically requested you as their favorite bartender! 🌟

Event: Corporate Gala
Date: January 15, 2025
Time: 6:00 PM - 11:00 PM (5 hours)
Location: Grand Luxe Hotel Ballroom, Los Angeles
Your Rate: $55/hr
Estimated Pay: $275

[Accept Assignment] [View Event Details] [Decline]

Please confirm your availability by January 13th.
```

---

## ✅ SUMMARY

**What Admin Portal Needs:**
1. ✅ Event Requests Queue (main page)
2. ✅ Request Detail View (comprehensive review)
3. ✅ One-click Approve button (triggers automation)
4. ✅ Auto-assignment algorithm (smart staff selection)
5. ✅ Pricing Configuration dashboard
6. ✅ Validation & conflict detection
7. ✅ Email notifications system
8. ✅ Database schema with 4 new tables

**Key Automation Features:**
- ✅ Favorites automatically assigned (guaranteed)
- ✅ Remaining staff auto-filled from selected tier
- ✅ Smart prioritization (rating, proximity, history)
- ✅ Rate balancing (ensure tier average maintained)
- ✅ Conflict detection (scheduling, availability)
- ✅ Invoice generation with locked pricing
- ✅ Instant notifications to all parties

**Admin Just Needs To:**
1. Review request (2 minutes)
2. Check validation (automatic)
3. Click "Approve" (1 second)
4. ✅ Done! System handles everything else

---

This gives you the complete specification for building the admin portal! Would you like me to start implementing any specific parts?
