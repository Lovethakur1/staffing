# Shift Marketplace - Workflow Diagrams

## 🔄 Complete Workflows by User Role

---

## 1️⃣ STAFF WORKFLOW: Posting a Shift

```
┌─────────────────────────────────────────────────────────────────┐
│                    STAFF POSTS A SHIFT                          │
└─────────────────────────────────────────────────────────────────┘

Step 1: Staff Initiates
┌──────────────┐
│  Staff User  │
│   Logs In    │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Navigate to:         │
│ "Shift Marketplace"  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Click:               │
│ "Post My Shift"      │
└──────┬───────────────┘

Step 2: Select Shift
       │
       ▼
┌────────────────────────────────┐
│ Dialog Opens - Select from:    │
│                                │
│ ○ Server - Holiday Party       │
│   Dec 15, 6:00 PM - 11:00 PM  │
│   Pay: $175.00                │
│                                │
│ ○ Bartender - Wedding          │
│   Oct 25, 5:00 PM - 10:00 PM  │
│   Pay: $150.00                │
│                                │
│ ○ Setup Crew - Conference      │
│   Nov 1, 8:00 AM - 4:00 PM    │
│   Pay: $320.00                │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Provide Reason (Required)      │
│ ┌────────────────────────────┐ │
│ │ "Family emergency - need   │ │
│ │  to be out of town"        │ │
│ └────────────────────────────┘ │
│                                │
│ ⚠️ Visible to managers only    │
└────────┬───────────────────────┘

Step 3: System Validation
         │
         ▼
┌────────────────────────────────┐
│   SYSTEM VALIDATIONS:          │
│                                │
│ ✓ Shift ownership confirmed   │
│ ✓ Event date in future         │
│ ✓ < 3 active postings          │
│ ✓ No pending claims            │
└────────┬───────────────────────┘
         │
         ▼
    ┌────┴────┐
    │ Urgent? │ (Within 48 hours)
    └────┬────┘
         │
    ┌────┴────────────┐
    │                 │
    │ YES             │ NO
    │                 │
    ▼                 ▼
┌─────────┐      ┌────────────┐
│ Add:    │      │ Standard   │
│ • Urgent│      │ Posting    │
│   Badge │      │            │
│ • $25   │      │ No fees    │
│   Bonus │      └─────┬──────┘
│ • $10   │            │
│   Fee   │            │
└────┬────┘            │
     │                 │
     └────────┬────────┘
              │
              ▼
┌────────────────────────────────┐
│   SHIFT POSTED!                │
│                                │
│ Status: Available              │
│ Listed in marketplace          │
└────────┬───────────────────────┘

Step 4: Notifications Sent
         │
         ├─────────────────────┐
         │                     │
         ▼                     ▼
┌──────────────────┐   ┌──────────────────┐
│  To Manager:     │   │ To All Staff:    │
│                  │   │                  │
│ "David Martinez  │   │ "New Server      │
│  posted Server   │   │  shift available │
│  shift for       │   │  Dec 15, 6PM"    │
│  Dec 15"         │   │                  │
│                  │   │  Pay: $175       │
│ [Approve] [View] │   │  + $25 bonus!    │
└──────────────────┘   └──────────────────┘
```

---

## 2️⃣ STAFF WORKFLOW: Claiming a Shift

```
┌─────────────────────────────────────────────────────────────────┐
│                   STAFF CLAIMS A SHIFT                          │
└─────────────────────────────────────────────────────────────────┘

Step 1: Browse Available Shifts
┌──────────────┐
│  Staff User  │
│   Logs In    │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Navigate to:         │
│ "Shift Marketplace"  │
└──────┬───────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Tab: "Available Shifts"            │
│                                     │
│  🔍 Search: "Server"                │
│  🏷️ Filter: [All Roles ▼]          │
│                                     │
│  ┌────────────────────────────┐    │
│  │ ⚠️ URGENT - Bonus $25!     │    │
│  │ Server - Holiday Party      │    │
│  │ Dec 15, 6:00 PM - 11:00 PM │    │
│  │ Downtown Convention Center  │    │
│  │ Pay: $175 + $25 = $200     │    │
│  │                             │    │
│  │ Posted by: David Martinez   │    │
│  │ Rating: ⭐⭐⭐⭐☆ 4.5        │    │
│  │                             │    │
│  │ Requirements:               │    │
│  │ • Food Handler Cert         │    │
│  │ • 2+ years experience       │    │
│  │                             │    │
│  │ [Claim Shift]               │    │
│  └────────────────────────────┘    │
└─────────────────────────────────────┘
       │
       ▼
┌──────────────────────┐
│ Click:               │
│ "Claim Shift"        │
└──────┬───────────────┘

Step 2: System Validation
       │
       ▼
┌────────────────────────────────┐
│   QUALIFICATION CHECK:         │
│                                │
│ ✓ Has Food Handler Cert        │
│ ✓ 3 years experience (meets 2+)│
│ ✓ Rating 4.8 (urgent OK)       │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│   SCHEDULE CONFLICT CHECK:     │
│                                │
│ ✓ No conflicts on Dec 15       │
│ ✓ Available 6:00 PM - 11:00 PM│
└────────┬───────────────────────┘

Step 3: Confirmation Dialog
         │
         ▼
┌────────────────────────────────┐
│   CONFIRM CLAIM                │
│                                │
│   Event: Holiday Party         │
│   Date: Dec 15, 2024           │
│   Time: 6:00 PM - 11:00 PM    │
│   Role: Server                 │
│   Pay: $200 (incl. bonus)      │
│                                │
│   ℹ️ Your claim will be        │
│   reviewed by the manager.     │
│   You'll be notified within    │
│   24 hours.                    │
│                                │
│   [Cancel] [Confirm Claim]     │
└────────┬───────────────────────┘
         │
         ▼ (Clicks Confirm)
┌────────────────────────────────┐
│   CLAIM SUBMITTED!             │
│                                │
│ ✅ Claim sent to manager       │
│    for approval                │
│                                │
│ 📱 You'll receive notification │
│    when reviewed               │
└────────┬───────────────────────┘

Step 4: Status Changes
         │
         ├─────────────────────────┐
         │                         │
         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│ Shift Status:    │      │ In Staff View:   │
│ Available →      │      │                  │
│ PENDING          │      │ Tab: "My Claims" │
│                  │      │                  │
│ Shows:           │      │ Shows:           │
│ "1 staff         │      │ "Holiday Party"  │
│  interested"     │      │ Status: Pending  │
└──────────────────┘      └──────────────────┘

Step 5: Notifications Sent
         │
         ├──────────────┬──────────────┐
         │              │              │
         ▼              ▼              ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│To Original  │  │To Manager:  │  │To Claimant: │
│Poster:      │  │             │  │             │
│             │  │"Amanda White│  │"Claim       │
│"Amanda White│  │ claimed your│  │ submitted   │
│ claimed your│  │ Server shift│  │ for Holiday │
│ shift"      │  │ for Dec 15" │  │ Party"      │
│             │  │             │  │             │
│[View]       │  │[Approve]    │  │Status:      │
│             │  │[Reject]     │  │Pending      │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## 3️⃣ MANAGER WORKFLOW: Approving Claims

```
┌─────────────────────────────────────────────────────────────────┐
│                  MANAGER APPROVES CLAIM                         │
└─────────────────────────────────────────────────────────────────┘

Step 1: Manager Receives Notification
┌──────────────┐
│   Manager    │
│  Logs In     │
└──────┬───────┘
       │
       ▼
┌────────────────────────────────┐
│  🔔 Notification:              │
│                                │
│  "Amanda White claimed Server  │
│   shift for Dec 15"            │
│                                │
│  [View in Marketplace]         │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Navigate to:                   │
│ "Shift Marketplace"            │
└────────┬───────────────────────┘

Step 2: Review Claim Details
         │
         ▼
┌─────────────────────────────────────────────┐
│  SHIFT DETAILS:                             │
│  ═══════════════════════════════════        │
│  Event: Holiday Corporate Party             │
│  Date: Dec 15, 2024                         │
│  Time: 6:00 PM - 11:00 PM                  │
│  Role: Server                               │
│  Location: Downtown Convention Center       │
│  Pay: $200 (includes $25 urgent bonus)      │
│                                             │
│  ORIGINAL POSTER:                           │
│  ───────────────────                        │
│  Name: David Martinez                       │
│  Rating: ⭐⭐⭐⭐☆ 4.5                      │
│  Reason: "Family emergency - need to        │
│           be out of town"                   │
│                                             │
│  CLAIMANT:                                  │
│  ─────────                                  │
│  Name: Amanda White                         │
│  Rating: ⭐⭐⭐⭐⭐ 4.8                      │
│  Experience: 3 years                        │
│  Performance: Excellent (0 no-shows)        │
│                                             │
│  QUALIFICATIONS:                            │
│  ──────────────                             │
│  ✅ Food Handler Certification (verified)   │
│  ✅ 3 years experience (exceeds 2+ req)     │
│  ✅ High rating (4.8 vs 4.0 urgent min)     │
│  ✅ No schedule conflicts                   │
│  ✅ Previous server shifts: 47 completed    │
│                                             │
│  OTHER CLAIMANTS: None                      │
│                                             │
│  [Approve Claim] [Reject] [Contact Staff]  │
└─────────────────────────────────────────────┘
         │
         ▼
    ┌────┴────┐
    │Decision?│
    └────┬────┘
         │
    ┌────┴────────────┐
    │                 │
    │ APPROVE         │ REJECT
    │                 │
    ▼                 ▼
┌─────────────┐  ┌────────────────┐
│ Confirm     │  │ Provide Reason:│
│ Approval    │  │ ┌────────────┐ │
│             │  │ │"Schedule   │ │
│ ✓ Approve   │  │ │ conflict   │ │
│   Amanda    │  │ │ detected"  │ │
│   White     │  │ └────────────┘ │
└──────┬──────┘  └────┬───────────┘
       │              │
       │              │

Step 3A: APPROVAL Path          Step 3B: REJECTION Path
       │                               │
       ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│ System Updates:  │          │ System Updates:  │
│                  │          │                  │
│ • Shift status:  │          │ • Remove claim   │
│   FILLED         │          │ • Status back to │
│                  │          │   AVAILABLE      │
│ • Remove David's │          │                  │
│   shift from     │          │ • Keep listing   │
│   schedule       │          │   active         │
│                  │          │                  │
│ • Add to         │          │ • Notify Amanda  │
│   Amanda's       │          │   with reason    │
│   schedule       │          └──────────────────┘
│                  │
│ • Record         │
│   approval       │
│                  │
│ • Remove from    │
│   marketplace    │
└──────┬───────────┘

Step 4A: APPROVAL Notifications
       │
       ├─────────────┬─────────────┐
       │             │             │
       ▼             ▼             ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│To David: │   │To Amanda:│   │To Admin: │
│          │   │          │   │          │
│"Your     │   │"✅ SHIFT │   │"Shift    │
│ Server   │   │ APPROVED!│   │ trade    │
│ shift for│   │          │   │ completed│
│ Dec 15   │   │Holiday   │   │          │
│ was      │   │Party     │   │David →   │
│ claimed  │   │Dec 15    │   │Amanda"   │
│ by Amanda│   │6PM-11PM  │   │          │
│ White"   │   │          │   │[View]    │
│          │   │Added to  │   └──────────┘
│Thank you!│   │schedule" │
└──────────┘   └──────────┘

Step 4B: REJECTION Notifications
       │
       ├─────────────┐
       │             │
       ▼             ▼
┌──────────┐   ┌──────────┐
│To Amanda:│   │To David: │
│          │   │          │
│"Claim    │   │"Your     │
│ rejected │   │ shift is │
│ for:     │   │ still    │
│          │   │ available│
│Holiday   │   │ in       │
│Party     │   │ market"  │
│          │   └──────────┘
│Reason:   │
│Schedule  │
│conflict  │
│detected" │
└──────────┘
```

---

## 4️⃣ ADMIN WORKFLOW: Managing Marketplace

```
┌─────────────────────────────────────────────────────────────────┐
│                  ADMIN MANAGES MARKETPLACE                      │
└─────────────────────────────────────────────────────────────────┘

Admin Dashboard View:
┌─────────────────────────────────────────────────────────────────┐
│  SHIFT MARKETPLACE - ADMIN VIEW                                 │
│  ═══════════════════════════════════════════════════════        │
│                                                                 │
│  📊 STATISTICS:                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐             │
│  │Available│ │ Urgent  │ │  Total  │ │ Avg Pay │             │
│  │    4    │ │    2    │ │  Value  │ │  $258   │             │
│  │ shifts  │ │ shifts  │ │ $1,032  │ │per shift│             │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘             │
│                                                                 │
│  📈 PERFORMANCE METRICS (Admin Only):                           │
│  ┌─────────────────────────────────────────────────┐           │
│  │ Fill Rate: 89% ████████████████████░░░          │           │
│  │ Avg Approval Time: 4.2 hours                     │           │
│  │ Success Rate: 94% (156/166 trades)               │           │
│  │ Fees Collected: $450 this month                  │           │
│  │ Bonuses Paid: $1,200 this month                  │           │
│  │ Net Impact: +$3,400/month (saved costs)          │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                 │
│  🎯 PENDING APPROVALS: 2                                        │
│  ┌──────────────────────────────────────────────┐              │
│  │ Amanda White → Server (Dec 15)                │              │
│  │ Manager: Pending review                       │              │
│  │ [Override Approve] [Override Reject]          │              │
│  └──────────────────────────────────────────────┘              │
│                                                                 │
│  ⚠️ ATTENTION NEEDED:                                           │
│  ┌──────────────────────────────────────────────┐              │
│  │ • Bartender shift (Nov 5) - No claims yet     │              │
│  │   Suggestion: Increase bonus to $50           │              │
│  │   [Increase Bonus] [Find Replacement]         │              │
│  │                                                │              │
│  │ • Setup Crew (Oct 30) - 2 claims pending      │              │
│  │   Manager delayed (>24hrs)                    │              │
│  │   [Notify Manager] [Take Action]              │              │
│  └──────────────────────────────────────────────┘              │
│                                                                 │
│  🔧 ADMIN ACTIONS:                                              │
│  [Adjust Policies] [Set Bonus Budgets] [View Analytics]        │
│  [Manage Fees] [Override Trade] [Generate Report]              │
└─────────────────────────────────────────────────────────────────┘

Admin Policy Management:
┌─────────────────────────────────────────────────────────────────┐
│  MARKETPLACE POLICIES                                           │
│  ═══════════════════════════════════════════════════════        │
│                                                                 │
│  LATE POSTING FEES:                                             │
│  ┌──────────────────────────────────┐                          │
│  │ Within 48 hours: $10            │                          │
│  │ Within 24 hours: $25            │                          │
│  │ Within 12 hours: Not allowed    │                          │
│  └──────────────────────────────────┘                          │
│                                                                 │
│  URGENT SHIFT BONUSES:                                          │
│  ┌──────────────────────────────────┐                          │
│  │ Default bonus: $25              │                          │
│  │ Max bonus: $100                 │                          │
│  │ Auto-increase: Enabled          │                          │
│  │  (adds $25 every 12 hours)      │                          │
│  └──────────────────────────────────┘                          │
│                                                                 │
│  QUALIFICATION REQUIREMENTS:                                    │
│  ┌──────────────────────────────────┐                          │
│  │ Min rating for urgent: 4.0 ⭐   │                          │
│  │ Max active postings: 3          │                          │
│  │ Require certifications: Yes     │                          │
│  │ Allow same-day claims: No       │                          │
│  └──────────────────────────────────┘                          │
│                                                                 │
│  [Save Changes] [Reset to Defaults]                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5️⃣ EDGE CASE WORKFLOWS

### Scenario: No One Claims Urgent Shift

```
Timeline:
─────────────────────────────────────────────────────

Day 1 (72 hours before event):
│
├─ Shift posted
│  Status: Available
│  Bonus: $25
│
└─ Notifications sent to qualified staff

Day 2 (48 hours before event):
│
├─ Still no claims
│  System: Auto-increase bonus → $50
│  Mark as: URGENT
│
└─ Send priority notifications

Day 3 (24 hours before event):
│
├─ Still no claims
│  System: Auto-increase bonus → $75
│  
├─ Escalation:
│  └─ Alert manager via SMS/call
│  └─ Alert admin
│
└─ Manager actions available:
    ├─ Increase bonus further
    ├─ Force assign from pool
    ├─ Require original staff
    └─ Contact temp agencies

Event Day (4 hours before):
│
├─ If still unfilled:
│  └─ CRITICAL ALERT
│
└─ Emergency protocols:
    ├─ Call all qualified staff
    ├─ Offer emergency rate (+100%)
    └─ Adjust event staffing plan
```

### Scenario: Multiple Claims on Same Shift

```
Situation:
┌────────────────────────────────────┐
│  Server Shift - Holiday Party      │
│  Posted by: David Martinez         │
│                                    │
│  CLAIMS RECEIVED:                  │
│  ├─ Amanda White   ⭐4.8  (1st)   │
│  ├─ Kevin Brown    ⭐4.2  (2nd)   │
│  └─ Sarah Johnson  ⭐4.9  (3rd)   │
└────────────────────────────────────┘
           │
           ▼
Manager sees all 3 candidates side-by-side:
┌────────────────────────────────────────────────┐
│ COMPARE CANDIDATES                             │
│                                                │
│ ┌──────────┬──────────┬──────────┐            │
│ │ Amanda   │ Kevin    │ Sarah    │            │
│ │ White    │ Brown    │ Johnson  │            │
│ ├──────────┼──────────┼──────────┤            │
│ │ ⭐4.8    │ ⭐4.2    │ ⭐4.9    │            │
│ │ 3 years  │ 2 years  │ 5 years  │            │
│ │ 47 shifts│ 28 shifts│ 89 shifts│            │
│ │ 0 issues │ 1 late   │ 0 issues │            │
│ │ Claimed  │ Claimed  │ Claimed  │            │
│ │ 1st      │ 2nd      │ 3rd      │            │
│ └──────────┴──────────┴──────────┘            │
│                                                │
│ [Approve Amanda] [Approve Kevin] [Approve Sarah]│
└────────────────────────────────────────────────┘
           │
           ▼ (Manager selects Sarah - highest rating)
┌────────────────────────────────────┐
│ RESULTS:                           │
│                                    │
│ ✅ Sarah Johnson: APPROVED         │
│    └─ Shift added to schedule      │
│    └─ Notification: "Approved!"    │
│                                    │
│ ❌ Amanda White: Auto-rejected     │
│    └─ Notification: "Another       │
│       qualified candidate selected"│
│                                    │
│ ❌ Kevin Brown: Auto-rejected      │
│    └─ Notification: "Another       │
│       qualified candidate selected"│
└────────────────────────────────────┘
```

---

## 📱 Notification Timing & Channels

```
EVENT                    │ RECIPIENT      │ CHANNEL        │ TIMING
─────────────────────────┼────────────────┼────────────────┼────────────
Shift Posted             │ Manager        │ In-app + Email │ Immediate
                         │ Qualified Staff│ In-app + Push  │ Immediate
                         │                │                │
Shift Claimed            │ Poster         │ In-app         │ Immediate
                         │ Manager        │ In-app + Email │ Immediate
                         │ Claimant       │ In-app         │ Immediate
                         │                │                │
Claim Approved           │ Poster         │ In-app + Email │ Immediate
                         │ Claimant       │ In-app + SMS   │ Immediate
                         │ Admin          │ In-app         │ Immediate
                         │ Other Claimants│ In-app         │ Immediate
                         │                │                │
Claim Rejected           │ Claimant       │ In-app + Email │ Immediate
                         │                │                │
No Claims (24hrs)        │ Poster         │ Email          │ 24hrs after
                         │ Manager        │ Email + SMS    │ 24hrs after
                         │                │                │
Urgent Shift (12hrs)     │ All Staff      │ Push + SMS     │ Every 6hrs
                         │ Manager        │ SMS + Call     │ Immediate
```

---

## 🔄 System State Transitions

```
Shift Listing States:
═══════════════════════

┌──────────┐
│  DRAFT   │ (Staff filling out form)
└────┬─────┘
     │ Submit
     ▼
┌───────────┐
│ AVAILABLE │ (Live in marketplace)
└─────┬─────┘
      │
      ├─ Staff claims ───────┐
      │                      ▼
      │              ┌──────────┐
      │              │ PENDING  │ (Awaiting approval)
      │              └────┬─────┘
      │                   │
      │                   ├─ Manager approves ──┐
      │                   │                     ▼
      │                   │              ┌──────────┐
      │                   │              │  FILLED  │ (Complete)
      │                   │              └──────────┘
      │                   │
      │                   └─ Manager rejects ─────┐
      │                                            │
      ├─ Staff cancels (no claims) ───────────────┤
      │                                            ▼
      │                                    ┌──────────┐
      └─ Admin cancels ──────────────────▶│CANCELLED │
                                           └──────────┘
```

This comprehensive documentation covers all workflows, edge cases, and system behaviors for the Shift Marketplace!
