# Create Event Page - Full Documentation

## Overview

The **Create Event** page is a comprehensive, multi-step wizard designed for administrators to create new events with complete details, staff assignments, and pricing information. This page replaces the need for multiple forms and provides a guided, professional experience for event creation.

## Access

**Route:** `/create-event`  
**User Role:** Admin  
**Navigation:** Events page → "Create Event" button

## Page Structure

### Multi-Step Wizard (6 Steps)

```
Step 1: Event Details
Step 2: Client Information  
Step 3: Staff Requirements
Step 4: Pricing & Billing
Step 5: Additional Details
Step 6: Review & Confirm
```

---

## Step-by-Step Breakdown

### **Step 1: Event Details**
Basic information about the event

#### Fields:
- **Event Name*** (Text)
  - Example: "Johnson Wedding Reception"
  - Required field
  
- **Event Type*** (Dropdown)
  - Options: Wedding, Corporate Event, Birthday Party, Anniversary, Conference, Gala, Fundraiser, Product Launch, Team Building, Holiday Party, Other
  - Required field
  
- **Estimated Guests** (Number)
  - Optional field
  - Helps with staff planning
  
- **Event Date*** (Date Picker)
  - Calendar interface
  - Required field
  - Cannot select past dates
  
- **Start Time*** (Time Picker)
  - 24-hour format
  - Required field
  
- **End Time*** (Time Picker)
  - 24-hour format
  - Required field
  - Must be after start time
  
- **Venue Name*** (Text)
  - Example: "Grand Hotel Ballroom"
  - Required field
  
- **Venue Address** (Textarea)
  - Full address
  - Optional but recommended

#### Features:
- **Duration Calculator**: Automatically calculates event duration
- **5-Hour Minimum Alert**: Shows warning if event is less than 5 hours
- Real-time validation

---

### **Step 2: Client Information**
Select existing client or add a new one

#### Toggle Switch:
- **Existing Client** (Default)
- **New Client**

#### For Existing Client:
- **Client Selection*** (Dropdown)
  - Shows all existing clients
  - Displays number of previous events
  - Shows client email
  
- **Client Preview Card**
  - Company/Name
  - Email address
  - Previous event count
  - Auto-populates when selected

#### For New Client:
- **Client Name*** (Text)
  - Full name or company name
  - Required field
  
- **Email*** (Email)
  - Valid email format
  - Required field
  
- **Phone** (Tel)
  - Optional
  - Format: (555) 123-4567
  
- **Company** (Text)
  - Optional
  - For corporate clients

#### Features:
- Easy toggle between existing/new
- Client data validation
- Auto-creates client record if new

---

### **Step 3: Staff Requirements**
Define roles and quantities needed for the event

#### Dynamic Staff Requirement Cards:

Each requirement includes:
- **Role*** (Dropdown)
  - Options: Bartender, Server, Event Coordinator, Catering Manager, Setup Crew, Chef, Sous Chef, Busser, Captain, Valet
  - Required field
  
- **Quantity*** (Number)
  - Minimum: 1
  - Required field
  
- **Hourly Rate** (Number)
  - Default: $25/hr
  - Can be customized per role
  - Step: $0.50
  
- **Total Cost** (Auto-calculated)
  - Quantity × Hourly Rate × Event Duration
  - Applies 5-hour minimum rule
  - Read-only field

#### Actions:
- **Add Role** button - Add multiple staff requirements
- **Remove** button - Delete a requirement
- Empty state with call-to-action

#### Features:
- Unlimited staff roles
- Real-time cost calculation
- Automatic 5-hour minimum application
- Cost preview for each role

---

### **Step 4: Pricing & Billing**
Set pricing model and payment terms

#### Pricing Configuration:

- **Pricing Model** (Dropdown)
  - Hourly Rate (default)
  - Flat Fee
  - Package Deal
  
- **Deposit Percentage** (Dropdown)
  - 25%, 50%, 75%, 100% (Full Payment)
  - Default: 50%
  
- **Payment Terms** (Dropdown)
  - Due on Event Day
  - Net 7 Days
  - Net 15 Days
  - Net 30 Days (default)

#### Additional Fees:

Dynamic fee builder:
- **Fee Name** (Text)
  - Example: "Service Fee", "Equipment Rental", "Travel Charge"
  
- **Amount** (Number)
  - Dollar amount
  
- **Add Fee** button
- **Remove** button per fee

#### Cost Summary Panel:

Displays:
- **Staff Costs** - Sum of all staff requirements
- **Additional Fees** - Line items for each fee
- **Total Cost** - Grand total
- **Deposit Amount** - Based on percentage
- **Remaining Balance** - Total minus deposit

#### Features:
- Real-time cost calculations
- Visual cost breakdown
- Highlighted totals
- Professional summary card

---

### **Step 5: Additional Details**
Special requests, equipment, and notes

#### Fields:

- **Special Requests** (Textarea)
  - Client's special requirements
  - Dietary restrictions
  - Accessibility needs
  - Optional field
  
- **Equipment Needed** (Multi-select checkboxes)
  - Grid layout with clickable cards
  - Options: Tables, Chairs, Linens, Glassware, Silverware, Sound System, Microphones, Lighting, Projector, Dance Floor, Bar Equipment, Warming Trays
  - Multiple selections allowed
  - Visual selected state
  
- **Internal Notes** (Textarea)
  - Notes for internal team only
  - Not visible to client
  - Optional field
  
- **Document Attachments** (File upload)
  - Drag and drop area
  - Accepts: Contracts, floor plans, menus, etc.
  - Multiple files allowed

#### Features:
- Equipment selector with visual feedback
- Clear distinction between client-facing and internal notes
- File upload placeholder (ready for backend integration)

---

### **Step 6: Review & Confirm**
Comprehensive summary of all event details

#### Sections:

**1. Event Information Card**
- Event Name
- Event Type
- Date (formatted)
- Time range
- Venue
- Estimated guests

**2. Client Information Card**
- Client name (existing or new)
- Email
- Phone (if provided)
- Company (if provided)

**3. Staff Requirements Table**
- All staff roles
- Quantities
- Hourly rates
- Calculated totals
- Full table view

**4. Pricing & Payment Card**
- Total event cost (highlighted)
- Deposit required
- Remaining balance
- Payment terms

**5. Equipment List** (if any)
- Badge display of selected equipment

#### Features:
- Read-only summary view
- Clear, organized presentation
- Easy to scan layout
- Professional formatting

---

## Navigation Features

### Progress Indicator

**Visual Progress Bar:**
- Shows current step number
- Percentage complete
- Color-coded progress

**Step Indicators:**
- Interactive step buttons
- Click to jump to any step
- Icons for each step
- Completed steps show checkmark
- Current step highlighted
- Mobile-responsive labels

### Navigation Buttons

**Previous Button:**
- Always visible (except step 1)
- Returns to previous step
- No validation required

**Next Button:**
- Validates current step
- Shows error if required fields missing
- Advances to next step

**Final Step Buttons:**
- **Save as Draft** - Saves without completing
- **Create Event** - Final submission

---

## Right Sidebar Features

### Event Summary Card

Real-time summary showing:
- **Event Date** - From step 1
- **Duration** - Auto-calculated hours
- **Total Staff** - Sum of all staff quantities
- **Total Cost** - Grand total with highlighting

### Event Status Selector

Dropdown to set initial status:
- **Draft** (Default)
- **Pending Approval**
- **Confirmed**

### Client Notification Toggle

Switch to control:
- **Notify Client** (On by default)
- Sends email notification when event is created

### Validation Warnings

Yellow alert card showing:
- Missing required fields
- Checklist format
- Updates in real-time
- Disappears when complete

---

## Top Action Buttons

### Quick Actions:

**1. Duplicate Event**
- Opens event selection dialog
- Copies all details from existing event
- Saves time for recurring events

**2. Use Template**
- Opens template library
- Pre-fills common event types
- Faster setup for standard events

**3. Save Draft**
- Saves current progress
- Can return later to complete
- No validation required

---

## Validation & Error Handling

### Required Field Validation

**Step 1 Requirements:**
- Event Name
- Event Type
- Event Date
- Start Time
- End Time
- Venue Name

**Step 2 Requirements:**
- Existing client: Client selection
- New client: Name and Email

**Step 3 Requirements:**
- At least one staff requirement
- Each requirement must have role and quantity

**Step 4 Requirements:**
- Pricing model
- Deposit percentage

### Validation Behavior:

- **On Next Click:** Validates current step
- **Toast Notification:** Shows error message
- **Field Highlighting:** Invalid fields outlined in red
- **Cannot Proceed:** Blocks navigation until fixed

### Success Messages:

- **Draft Saved:** "Event saved as draft"
- **Event Created:** "Event created successfully!"
- **Auto-redirect:** Returns to Events page after 1.5 seconds

---

## Smart Calculations

### 5-Hour Minimum Rule

Automatically applied to all cost calculations:
```javascript
actualHours = endTime - startTime
billedHours = Math.max(actualHours, 5)
staffCost = quantity × hourlyRate × billedHours
```

Visual indicator shown when event < 5 hours

### Duration Calculator

```javascript
hours = endHour - startHour
minutes = endMinute - startMinute
totalHours = hours + (minutes / 60)
```

Displayed in real-time as times are entered

### Total Cost Calculator

```javascript
staffCosts = sum(all staff requirements)
additionalFees = sum(all additional fees)
totalCost = staffCosts + additionalFees
deposit = totalCost × (depositPercentage / 100)
remaining = totalCost - deposit
```

Updates in real-time as values change

---

## Mobile Responsiveness

### Adaptive Layout:

- **Desktop:** Two-column layout (form + sidebar)
- **Tablet:** Stacked layout, wider form
- **Mobile:** Single column, full width

### Mobile Optimizations:

- Step labels hidden on small screens
- Step icons remain visible
- Touch-friendly buttons
- Optimized form inputs
- Scrollable content areas
- Sticky navigation buttons

---

## Data Flow

### On Create Event:

```javascript
1. Validate all required fields
2. Construct event object
3. If new client: Create client record
4. Create event record
5. Create staff assignments
6. Generate invoice (if confirmed)
7. Send notification (if enabled)
8. Redirect to Events page
```

### On Save Draft:

```javascript
1. Save current form state
2. Create draft event record
3. No validation required
4. Show success message
5. Redirect to Events page
```

---

## Integration Points

### Client Management:
- Creates new client if selected
- Links to existing client
- Updates client event count

### Staff Assignment:
- Creates staff requirement records
- Ready for staff assignment workflow
- Integrates with Find Replacement system

### Financial System:
- Creates invoice
- Calculates deposit
- Sets payment terms
- Links to Financial Hub

### Notifications:
- Email to client (optional)
- Internal team notifications
- Alert system integration

---

## Technical Implementation

### State Management:

```typescript
interface EventFormData {
  // Step 1
  eventName: string;
  eventType: string;
  eventDate: Date | undefined;
  startTime: string;
  endTime: string;
  venue: string;
  venueAddress: string;
  estimatedGuests: string;
  
  // Step 2
  clientType: 'existing' | 'new';
  existingClientId: string;
  newClientName: string;
  newClientEmail: string;
  newClientPhone: string;
  newClientCompany: string;
  
  // Step 3
  staffRequirements: StaffRequirement[];
  
  // Step 4
  pricingModel: 'hourly' | 'flat' | 'package';
  depositPercentage: string;
  paymentTerms: string;
  additionalFees: AdditionalFee[];
  
  // Step 5
  specialRequests: string;
  equipment: string[];
  documents: File[];
  internalNotes: string;
  
  // Settings
  status: 'draft' | 'pending' | 'confirmed';
  sendClientNotification: boolean;
}
```

### Key Functions:

- `updateFormData()` - Updates single field
- `addStaffRequirement()` - Adds new staff role
- `updateStaffRequirement()` - Modifies staff requirement
- `removeStaffRequirement()` - Deletes staff requirement
- `addAdditionalFee()` - Adds new fee
- `updateAdditionalFee()` - Modifies fee
- `removeAdditionalFee()` - Deletes fee
- `calculateTotalCost()` - Computes total cost
- `calculateHours()` - Computes event duration
- `calculateDeposit()` - Computes deposit amount
- `validateStep()` - Validates current step
- `nextStep()` - Advances to next step
- `prevStep()` - Returns to previous step
- `goToStep()` - Jumps to specific step
- `handleSaveDraft()` - Saves as draft
- `handleCreateEvent()` - Final submission

---

## UI Components Used

### Shadcn/UI:
- Card, CardContent, CardHeader, CardTitle
- Button
- Input, Textarea
- Label
- Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- Calendar
- Popover, PopoverContent, PopoverTrigger
- Badge
- Progress
- Switch
- Table, TableBody, TableCell, TableHead, TableHeader, TableRow
- ScrollArea
- Separator

### Icons (Lucide React):
- ArrowLeft, ArrowRight
- Calendar, Clock, MapPin, Users, DollarSign, FileText
- CheckCircle2, Plus, X, Search, Upload
- AlertCircle, Save, Send, Copy, Sparkles
- Building2, Mail, Phone, User, Briefcase, Star, Award, ShoppingCart

---

## Future Enhancements

### Planned Features:
1. **Auto-save** - Save draft every 30 seconds
2. **Template Management** - Create and save event templates
3. **Staff Auto-assignment** - Suggest staff based on availability
4. **Conflict Detection** - Check for scheduling conflicts
5. **Cost Estimation** - AI-powered cost suggestions
6. **Calendar Integration** - Sync with Google/Outlook
7. **Document Management** - Full file upload and preview
8. **Email Templates** - Customizable client notifications
9. **Recurring Events** - Create series of events
10. **Budget Alerts** - Warning if over/under budget

### Backend Integration:
- API endpoints for event creation
- File upload to cloud storage
- Real-time validation
- Duplicate detection
- Client lookup autocomplete
- Staff availability checking

---

## Best Practices

### For Admins:
1. **Fill all steps completely** for best results
2. **Review summary** before creating event
3. **Save drafts frequently** for complex events
4. **Use templates** for recurring event types
5. **Add internal notes** for team coordination
6. **Verify client information** before submitting
7. **Double-check dates and times**
8. **Review cost calculations**

### For Developers:
1. **Validate on both frontend and backend**
2. **Handle all edge cases** (same start/end time, past dates, etc.)
3. **Provide clear error messages**
4. **Maintain form state** across navigation
5. **Optimize for performance** with large staff lists
6. **Test on all screen sizes**
7. **Implement proper loading states**
8. **Add analytics tracking** for conversion optimization

---

## Accessibility

### WCAG Compliance:
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Proper ARIA labels
- ✅ Color contrast ratios
- ✅ Focus indicators
- ✅ Error announcements
- ✅ Form field labels

### Keyboard Shortcuts (Planned):
- `Ctrl/Cmd + S` - Save draft
- `Ctrl/Cmd + Enter` - Next step
- `Escape` - Cancel/Go back
- `Tab` - Navigate fields
- `Space/Enter` - Toggle checkboxes

---

## Performance Metrics

### Target Performance:
- **Initial Load:** < 1 second
- **Step Navigation:** < 100ms
- **Calculation Update:** < 50ms
- **Form Submission:** < 2 seconds

### Optimization:
- Lazy load calendar component
- Debounce calculation functions
- Memoize complex calculations
- Virtual scrolling for large lists

---

## Testing Checklist

### Functional Tests:
- [ ] All fields accept valid input
- [ ] Validation catches invalid input
- [ ] Step navigation works correctly
- [ ] Calculations are accurate
- [ ] Draft save works
- [ ] Final submission works
- [ ] Client toggle works
- [ ] Staff requirements can be added/removed
- [ ] Additional fees can be added/removed
- [ ] Equipment selection works
- [ ] All dropdowns populate correctly

### Edge Cases:
- [ ] Event spanning midnight
- [ ] Same start and end time
- [ ] Past date selection
- [ ] Zero staff requirements
- [ ] Negative costs
- [ ] Very large events (1000+ guests)
- [ ] Very long event names
- [ ] Special characters in fields
- [ ] Very short events (<1 hour)
- [ ] Decimal quantities

### Browser Testing:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## Conclusion

The Create Event page is a comprehensive, user-friendly solution for event creation that:
- ✅ Guides admins through the complete process
- ✅ Validates data at every step
- ✅ Calculates costs automatically
- ✅ Provides clear visual feedback
- ✅ Integrates with all system modules
- ✅ Maintains professional design standards
- ✅ Works seamlessly on all devices

This page serves as the foundation for all events in the system and ensures data quality, completeness, and consistency across the entire platform.
