# Comprehensive Tooltip Updates - Implementation Plan

## 🎯 Overview

This document provides COMPLETE tooltip implementation for ALL pages across ALL panels (Admin, Client, Staff, Manager) in the event staffing management system.

---

## 📦 Setup (Already Completed)

✅ Tooltip components created in `/components/ui/tooltip-wrapper.tsx`
✅ Documentation in `/TOOLTIP_IMPLEMENTATION_GUIDE.md`

---

## 🔧 Common Tooltip Patterns

### Pattern 1: Icon Buttons
**Where:** Throughout the system - Edit, Delete, View, More actions

```tsx
import { IconTooltip } from "../components/ui/tooltip-wrapper";

// View button
<IconTooltip content="View full details">
  <Button variant="ghost" size="icon" onClick={() => handleView(id)}>
    <Eye className="h-4 w-4" />
  </Button>
</IconTooltip>

// Edit button
<IconTooltip content="Edit event information">
  <Button variant="ghost" size="icon" onClick={() => handleEdit(id)}>
    <Edit className="h-4 w-4" />
  </Button>
</IconTooltip>

// Delete button
<IconTooltip content="Delete this event permanently">
  <Button variant="ghost" size="icon" onClick={() => handleDelete(id)}>
    <Trash className="h-4 w-4 text-destructive" />
  </Button>
</IconTooltip>

// More actions
<IconTooltip content="More actions">
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
</IconTooltip>
```

### Pattern 2: Status Badges
**Where:** Event cards, Staff cards, anywhere status is shown

```tsx
import { InfoTooltip } from "../components/ui/tooltip-wrapper";

// Event status
<InfoTooltip content="Event is currently in progress with staff on-site">
  <Badge variant="default" className="bg-green-100 text-green-700">
    Active
  </Badge>
</InfoTooltip>

// Staff availability
<InfoTooltip content="Staff member is available for new assignments">
  <Badge variant="success">Available</Badge>
</InfoTooltip>

// Certification status
<InfoTooltip content="All required certifications are up to date">
  <Badge variant="outline" className="gap-1">
    <CheckCircle className="h-3 w-3" />
    Certified
  </Badge>
</InfoTooltip>

// Count badges
<InfoTooltip content="You have 5 unread notifications">
  <Badge variant="destructive">5</Badge>
</InfoTooltip>
```

### Pattern 3: Action Buttons
**Where:** Form submissions, data exports, approvals

```tsx
import { TooltipWrapper } from "../components/ui/tooltip-wrapper";

// Primary actions
<TooltipWrapper content="Submit event request for admin approval">
  <Button onClick={handleSubmit}>Submit Request</Button>
</TooltipWrapper>

// Export/Download
<TooltipWrapper content="Download complete event report as PDF">
  <Button variant="outline">
    <Download className="h-4 w-4 mr-2" />
    Export Report
  </Button>
</TooltipWrapper>

// Approval actions
<TooltipWrapper content="Approve timesheet and process for payroll">
  <Button variant="default">
    <CheckCircle className="h-4 w-4 mr-2" />
    Approve
  </Button>
</TooltipWrapper>

// Rejection
<TooltipWrapper content="Reject request and send feedback to requester">
  <Button variant="destructive">
    <XCircle className="h-4 w-4 mr-2" />
    Reject
  </Button>
</TooltipWrapper>

// Disabled state with explanation
<TooltipWrapper content="Complete all required fields to enable submission">
  <Button disabled={!isValid}>Submit</Button>
</TooltipWrapper>
```

### Pattern 4: Navigation Items
**Where:** Sidebar, top navigation, breadcrumbs

```tsx
// Sidebar items (show on right side)
<TooltipWrapper content="View and manage all events" side="right">
  <Button variant="ghost" className="w-full justify-start">
    <Calendar className="mr-2 h-4 w-4" />
    Events
  </Button>
</TooltipWrapper>

// Top navigation icons (show on bottom)
<IconTooltip content="View notifications" side="bottom">
  <Button variant="ghost" size="icon">
    <Bell className="h-4 w-4" />
    {unreadCount > 0 && (
      <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
    )}
  </Button>
</IconTooltip>

// Settings
<IconTooltip content="Open settings and preferences" side="bottom">
  <Button variant="ghost" size="icon">
    <Settings className="h-4 w-4" />
  </Button>
</IconTooltip>
```

### Pattern 5: Form Help Icons
**Where:** Complex forms, payment info, calculations

```tsx
// Next to labels
<Label htmlFor="rate" className="flex items-center gap-2">
  Hourly Rate
  <InfoTooltip content="Base hourly rate before overtime multipliers">
    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
  </InfoTooltip>
</Label>

// Next to calculations
<div className="flex items-center justify-between">
  <span>Total Cost</span>
  <div className="flex items-center gap-2">
    <span className="font-bold">${totalCost}</span>
    <InfoTooltip content="Includes staff cost, service fees, and taxes">
      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
    </InfoTooltip>
  </div>
</div>
```

### Pattern 6: Data Table Actions
**Where:** All tables with row actions

```tsx
// In action column
<TableCell className="text-right">
  <div className="flex items-center justify-end gap-2">
    <IconTooltip content="View event details">
      <Button variant="ghost" size="icon" onClick={() => handleView(row.id)}>
        <Eye className="h-4 w-4" />
      </Button>
    </IconTooltip>
    
    <IconTooltip content="Edit event">
      <Button variant="ghost" size="icon" onClick={() => handleEdit(row.id)}>
        <Edit className="h-4 w-4" />
      </Button>
    </IconTooltip>
    
    <IconTooltip content="More options">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </IconTooltip>
  </div>
</TableCell>
```

---

## 📄 Page-by-Page Implementation

### 🔴 ADMIN PANEL

#### 1. SuperAdminCommandCenter.tsx (✅ Partially Done)
Add these tooltips:

```tsx
// Status card actions
<TooltipWrapper content="Go to live operations dashboard">
  <Button variant="ghost" size="sm" onClick={() => setCurrentPage('live-ops')}>
    View Live
  </Button>
</TooltipWrapper>

// Tab navigation
<TooltipWrapper content="View all events happening right now">
  <TabsTrigger value="live">
    <Radio className="w-4 h-4 mr-2" />
    Live Operations
  </TabsTrigger>
</TooltipWrapper>

// Event cards (click to view)
<TooltipWrapper content="Click to view full event details">
  <div className="cursor-pointer hover:bg-accent/50">
    {/* event content */}
  </div>
</TooltipWrapper>

// Bottom stats
<TooltipWrapper content="Review pending overtime approval requests">
  <Button variant="outline" size="sm" className="w-full mt-2">
    Review Approvals
  </Button>
</TooltipWrapper>
```

#### 2. Events.tsx (⏳ To Do)
```tsx
// Import tooltips
import { TooltipWrapper, IconTooltip } from "../components/ui/tooltip-wrapper";

// Create event button
<TooltipWrapper content="Create a new event booking">
  <Button onClick={() => setCurrentPage('create-event')}>
    <Plus className="h-4 w-4 mr-2" />
    New Event
  </Button>
</TooltipWrapper>

// View mode toggle
<div className="flex gap-1 border rounded-lg p-1">
  <IconTooltip content="List view">
    <Button
      variant={viewMode === 'list' ? 'default' : 'ghost'}
      size="icon"
      onClick={() => setViewMode('list')}
    >
      <List className="h-4 w-4" />
    </Button>
  </IconTooltip>
  <IconTooltip content="Grid view">
    <Button
      variant={viewMode === 'grid' ? 'default' : 'ghost'}
      size="icon"
      onClick={() => setViewMode('grid')}
    >
      <Grid className="h-4 w-4" />
    </Button>
  </IconTooltip>
</div>

// Filter button
<TooltipWrapper content="Filter events by status, date, or type">
  <Button variant="outline">
    <Filter className="h-4 w-4 mr-2" />
    Filters
  </Button>
</TooltipWrapper>

// Export button
<TooltipWrapper content="Export event data to Excel or PDF">
  <Button variant="outline">
    <Download className="h-4 w-4 mr-2" />
    Export
  </Button>
</TooltipWrapper>

// Event card actions
<IconTooltip content="View complete event details and staff assignments">
  <Button variant="ghost" size="icon">
    <Eye className="h-4 w-4" />
  </Button>
</IconTooltip>

<IconTooltip content="Edit event information">
  <Button variant="ghost" size="icon">
    <Edit className="h-4 w-4" />
  </Button>
</IconTooltip>

<IconTooltip content="Download event summary report">
  <Button variant="ghost" size="icon">
    <Download className="h-4 w-4" />
  </Button>
</IconTooltip>

// Status badges in event cards
<InfoTooltip content="Event is confirmed and staff assigned">
  <Badge variant="success">Confirmed</Badge>
</InfoTooltip>

<InfoTooltip content="Event is currently in progress">
  <Badge className="bg-green-100 text-green-700">In Progress</Badge>
</InfoTooltip>

<InfoTooltip content="Event awaiting final confirmation">
  <Badge variant="outline">Pending</Badge>
</InfoTooltip>
```

#### 3. Staff.tsx (⏳ To Do)
```tsx
// Add staff button
<TooltipWrapper content="Add new staff member to the system">
  <Button>
    <Plus className="h-4 w-4 mr-2" />
    Add Staff
  </Button>
</TooltipWrapper>

// Bulk actions
<TooltipWrapper content="Send message to all selected staff members">
  <Button variant="outline" disabled={selectedStaff.length === 0}>
    <Mail className="h-4 w-4 mr-2" />
    Message Selected
  </Button>
</TooltipWrapper>

// Staff status badges
<InfoTooltip content="Staff member is actively working an event">
  <Badge variant="default" className="bg-green-100 text-green-700">
    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
    Active
  </Badge>
</InfoTooltip>

<InfoTooltip content="Staff member is available for booking">
  <Badge variant="success">Available</Badge>
</InfoTooltip>

<InfoTooltip content="Staff member is on leave until {date}">
  <Badge variant="secondary">On Leave</Badge>
</InfoTooltip>

// Rating stars
<InfoTooltip content="Average client rating: 4.8/5 from 24 events">
  <div className="flex items-center gap-1">
    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
    <span>4.8</span>
  </div>
</InfoTooltip>

// Action buttons
<IconTooltip content="View staff profile and performance history">
  <Button variant="ghost" size="icon">
    <Eye className="h-4 w-4" />
  </Button>
</IconTooltip>

<IconTooltip content="Send direct message to staff member">
  <Button variant="ghost" size="icon">
    <MessageSquare className="h-4 w-4" />
  </Button>
</IconTooltip>

<IconTooltip content="Add to favorite staff list">
  <Button variant="ghost" size="icon">
    <Heart className="h-4 w-4" />
  </Button>
</IconTooltip>
```

#### 4. Clients.tsx (⏳ To Do)
```tsx
// Add client button
<TooltipWrapper content="Add new client to the system">
  <Button>
    <Plus className="h-4 w-4 mr-2" />
    Add Client
  </Button>
</TooltipWrapper>

// Client tier badges
<InfoTooltip content="Premium tier client with priority booking">
  <Badge variant="default" className="bg-amber-100 text-amber-700">
    <Award className="h-3 w-3 mr-1" />
    Premium
  </Badge>
</InfoTooltip>

// Contact buttons
<IconTooltip content="Send email to client">
  <Button variant="ghost" size="icon">
    <Mail className="h-4 w-4" />
  </Button>
</IconTooltip>

<IconTooltip content="Call client">
  <Button variant="ghost" size="icon">
    <Phone className="h-4 w-4" />
  </Button>
</IconTooltip>

// Revenue indicator
<InfoTooltip content="Total revenue from this client: $45,000 (12 events)">
  <div className="flex items-center gap-1">
    <DollarSign className="h-4 w-4 text-green-600" />
    <span className="font-semibold">$45K</span>
  </div>
</InfoTooltip>
```

#### 5. Payroll.tsx (⏳ To Do)
```tsx
// Process payroll button
<TooltipWrapper content="Process payroll for all approved timesheets">
  <Button>
    <Play className="h-4 w-4 mr-2" />
    Process Payroll
  </Button>
</TooltipWrapper>

// Review button
<TooltipWrapper content="Review and approve all pending timesheets">
  <Button variant="outline">
    <CheckCircle className="h-4 w-4 mr-2" />
    Review Pending
  </Button>
</TooltipWrapper>

// Overtime indicator
<InfoTooltip content="Staff member exceeded 40 hours this week">
  <Badge variant="destructive" className="text-xs">
    <Clock className="h-3 w-3 mr-1" />
    OT
  </Badge>
</InfoTooltip>

// Calculation info
<InfoTooltip content="Includes base rate + overtime (1.5x) + bonuses">
  <div className="flex items-center gap-1">
    <span>${totalPay}</span>
    <Info className="h-3 w-3 text-muted-foreground" />
  </div>
</InfoTooltip>

// Export payroll
<TooltipWrapper content="Export payroll data to Excel for accounting">
  <Button variant="outline">
    <Download className="h-4 w-4 mr-2" />
    Export to Excel
  </Button>
</TooltipWrapper>
```

#### 6. EventRequestsQueue.tsx (⏳ To Do)
```tsx
// Priority badge
<InfoTooltip content="High priority: Client requires response within 24 hours">
  <Badge variant="destructive">
    <AlertTriangle className="h-3 w-3 mr-1" />
    High Priority
  </Badge>
</InfoTooltip>

// Validation status
<InfoTooltip content="All favorite staff are available for this event">
  <CheckCircle className="h-4 w-4 text-green-600" />
</InfoTooltip>

<InfoTooltip content="Some requested staff are unavailable">
  <AlertTriangle className="h-4 w-4 text-yellow-600" />
</InfoTooltip>

// View request button
<TooltipWrapper content="View complete request details and staff requirements">
  <Button variant="outline" size="sm">
    <Eye className="h-4 w-4 mr-2" />
    View Details
  </Button>
</TooltipWrapper>

// Auto-create event
<TooltipWrapper content="Create event with all client details auto-populated">
  <Button>
    <CheckCircle className="h-4 w-4 mr-2" />
    Create Event
  </Button>
</TooltipWrapper>
```

#### 7. FinancialHub.tsx (⏳ To Do)
```tsx
// Revenue cards
<InfoTooltip content="Total revenue from all completed events this month">
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        Monthly Revenue
        <Info className="h-4 w-4 text-muted-foreground" />
      </CardTitle>
    </CardHeader>
    {/* content */}
  </Card>
</InfoTooltip>

// Download statements
<TooltipWrapper content="Download comprehensive financial report for this period">
  <Button variant="outline">
    <Download className="h-4 w-4 mr-2" />
    Download Report
  </Button>
</TooltipWrapper>

// Profit margin indicator
<InfoTooltip content="Profit margin calculated after staff costs and expenses">
  <div className="flex items-center gap-1">
    <TrendingUp className="h-4 w-4 text-green-600" />
    <span>32% margin</span>
  </div>
</InfoTooltip>
```

---

### 🔵 CLIENT PORTAL

#### 8. ClientDashboard.tsx (⏳ To Do)
```tsx
// Request event button
<TooltipWrapper content="Create a new event booking request">
  <Button size="lg">
    <Plus className="h-5 w-5 mr-2" />
    Request Event
  </Button>
</TooltipWrapper>

// View favorites
<TooltipWrapper content="View and manage your favorite staff members">
  <Button variant="outline">
    <Heart className="h-4 w-4 mr-2" />
    My Favorites
  </Button>
</TooltipWrapper>

// Upcoming events count
<InfoTooltip content="You have 3 confirmed events in the next 30 days">
  <Badge variant="default">3 Upcoming</Badge>
</InfoTooltip>
```

#### 9. RequestEvent.tsx (⏳ To Do)
```tsx
// Staff tier selection
<InfoTooltip content="Standard tier: $25-35/hr, experienced staff with good ratings">
  <Badge variant="outline">Standard Tier</Badge>
</InfoTooltip>

<InfoTooltip content="Premium tier: $40-55/hr, senior staff with excellent ratings">
  <Badge variant="default">Premium Tier</Badge>
</InfoTooltip>

// Favorite staff checkbox
<TooltipWrapper content="Select staff members you've worked with before">
  <Label className="flex items-center gap-2">
    <Checkbox />
    Include Favorite Staff
  </Label>
</TooltipWrapper>

// Price estimation
<InfoTooltip content="Estimated cost based on selected staff tiers and event duration">
  <div className="flex items-center gap-1">
    <span className="text-2xl font-bold">${estimatedCost}</span>
    <Info className="h-4 w-4 text-muted-foreground" />
  </div>
</InfoTooltip>

// Submit button
<TooltipWrapper content="Submit request for admin review and approval">
  <Button size="lg">
    Submit Request
  </Button>
</TooltipWrapper>
```

#### 10. ClientFavorites.tsx (⏳ To Do)
```tsx
// Add to favorites
<IconTooltip content="Add staff member to your favorites list">
  <Button variant="ghost" size="icon">
    <Heart className="h-4 w-4" />
  </Button>
</IconTooltip>

// Remove from favorites
<IconTooltip content="Remove from favorites">
  <Button variant="ghost" size="icon">
    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
  </Button>
</IconTooltip>

// Staff performance indicator
<InfoTooltip content="Worked 5 events for you with 5-star ratings">
  <div className="flex items-center gap-1">
    <Trophy className="h-4 w-4 text-yellow-500" />
    <span>Top Performer</span>
  </div>
</InfoTooltip>
```

---

### 🟢 STAFF PORTAL

#### 11. StaffDashboard.tsx (⏳ To Do)
```tsx
// Clock in/out button
<TooltipWrapper content="Clock in to your current shift">
  <Button size="lg">
    <Play className="h-5 w-5 mr-2" />
    Clock In
  </Button>
</TooltipWrapper>

// Active shift indicator
<InfoTooltip content="You are currently working: Bartender shift at Grand Hotel">
  <Badge className="bg-green-100 text-green-700">
    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
    Active Shift
  </Badge>
</InfoTooltip>

// Earnings this week
<InfoTooltip content="Total earnings from completed shifts this week">
  <Card>
    <CardTitle className="flex items-center gap-2">
      Weekly Earnings
      <Info className="h-4 w-4 text-muted-foreground" />
    </CardTitle>
    {/* content */}
  </Card>
</InfoTooltip>
```

#### 12. StaffSchedule.tsx (⏳ To Do)
```tsx
// Accept shift
<TooltipWrapper content="Accept this shift and add to your schedule">
  <Button variant="default" size="sm">
    <CheckCircle className="h-4 w-4 mr-2" />
    Accept
  </Button>
</TooltipWrapper>

// Decline shift
<TooltipWrapper content="Decline this shift offer">
  <Button variant="outline" size="sm">
    <XCircle className="h-4 w-4 mr-2" />
    Decline
  </Button>
</TooltipWrapper>

// Availability toggle
<TooltipWrapper content="Mark yourself as available for new shifts">
  <div className="flex items-center gap-2">
    <Switch />
    <Label>Available</Label>
  </div>
</TooltipWrapper>
```

#### 13. StaffEarnings.tsx (⏳ To Do)
```tsx
// Download statement
<TooltipWrapper content="Download detailed earnings statement for this period">
  <Button variant="outline">
    <Download className="h-4 w-4 mr-2" />
    Download Statement
  </Button>
</TooltipWrapper>

// Overtime hours
<InfoTooltip content="Overtime hours paid at 1.5x hourly rate">
  <div className="flex items-center gap-1">
    <Clock className="h-4 w-4 text-blue-600" />
    <span>{overtimeHours}h OT</span>
  </div>
</InfoTooltip>
```

---

### 🟡 MANAGER PORTAL

#### 14. ManagerDashboard.tsx (⏳ To Do)
```tsx
// Assign staff button
<TooltipWrapper content="Assign staff members to upcoming events">
  <Button>
    <Users className="h-4 w-4 mr-2" />
    Assign Staff
  </Button>
</TooltipWrapper>

// Approve timesheet
<TooltipWrapper content="Review and approve timesheet for payroll processing">
  <Button variant="default" size="sm">
    <CheckCircle className="h-4 w-4 mr-2" />
    Approve
  </Button>
</TooltipWrapper>
```

#### 15. StaffRoster.tsx (⏳ To Do)
```tsx
// Contact staff
<IconTooltip content="Send message to staff member">
  <Button variant="ghost" size="icon">
    <MessageSquare className="h-4 w-4" />
  </Button>
</IconTooltip>

// View profile
<IconTooltip content="View complete staff profile and history">
  <Button variant="ghost" size="icon">
    <Eye className="h-4 w-4" />
  </Button>
</IconTooltip>
```

---

## ✅ Implementation Progress

### Completed:
- ✅ Tooltip wrapper components created
- ✅ Documentation written
- ✅ SuperAdminCommandCenter (partial)

### In Progress:
- 🔄 SuperAdminCommandCenter (complete tooltips)
- 🔄 EventRequestDetail
- 🔄 TopNavigation

### To Do (Priority Order):
1. Events.tsx - High usage
2. Staff.tsx - High usage
3. EventRequestsQueue.tsx - Critical workflow
4. ClientDashboard.tsx - Client entry point
5. StaffDashboard.tsx - Staff entry point
6. ManagerDashboard.tsx - Manager entry point
7. All remaining pages

---

## 🎯 Testing Checklist

For each page with tooltips:
- [ ] All icon buttons have descriptive tooltips
- [ ] All status badges explain their meaning
- [ ] All action buttons describe what will happen
- [ ] Form help icons provide useful context
- [ ] Disabled elements explain why they're disabled
- [ ] Tooltips don't obstruct important content
- [ ] Tooltips work on hover (desktop)
- [ ] Tooltips work on focus (keyboard)
- [ ] Text is clear and action-oriented

---

**Status:** 🟡 In Progress - 10% Complete
**Last Updated:** November 10, 2024
**Next Priority:** Complete SuperAdminCommandCenter, then Events.tsx
