# Tooltip Implementation Guide

## Overview
Comprehensive tooltips have been added throughout the system to improve user experience during testing and demonstration. This guide explains the tooltip strategy and implementation.

---

## 📦 Tooltip Components Available

### 1. **TooltipWrapper** - General Purpose
For wrapping any button or interactive element with a tooltip.

```tsx
import { TooltipWrapper } from "../components/ui/tooltip-wrapper";

<TooltipWrapper content="Click to save changes">
  <Button>Save</Button>
</TooltipWrapper>
```

**Props:**
- `content`: string - The tooltip text
- `side`: "top" | "right" | "bottom" | "left" - Position (default: "top")
- `delayDuration`: number - Delay before showing (default: 300ms)
- `disabled`: boolean - Disable tooltip (default: false)

### 2. **IconTooltip** - For Icon Buttons
Specifically designed for icon-only buttons with accessibility support.

```tsx
import { IconTooltip } from "../components/ui/tooltip-wrapper";

<IconTooltip content="Delete item">
  <Button variant="ghost" size="icon">
    <Trash className="h-4 w-4" />
  </Button>
</IconTooltip>
```

**Features:**
- Adds `aria-label` for screen readers
- Shorter delay (200ms)
- Auto-wraps in span for proper positioning

### 3. **TooltipWithShortcut** - With Keyboard Shortcuts
For actions that have keyboard shortcuts.

```tsx
import { TooltipWithShortcut } from "../components/ui/tooltip-wrapper";

<TooltipWithShortcut content="Search" shortcut="⌘K">
  <Button variant="outline">
    <Search className="h-4 w-4 mr-2" />
    Search
  </Button>
</TooltipWithShortcut>
```

### 4. **InfoTooltip** - For Badges and Labels
For providing additional context to badges, labels, and static elements.

```tsx
import { InfoTooltip } from "../components/ui/tooltip-wrapper";

<InfoTooltip content="Staff member has completed all required certifications">
  <Badge variant="success">Certified</Badge>
</InfoTooltip>
```

**Features:**
- Shorter delay (200ms)
- Max width for longer descriptions
- Optimized for small elements

---

## 🎯 Tooltip Strategy by Element Type

### Buttons

#### Primary/CTA Buttons
```tsx
<TooltipWrapper content="Submit the event request for admin approval">
  <Button>Submit Request</Button>
</TooltipWrapper>
```

#### Icon Buttons
```tsx
<IconTooltip content="Edit event details">
  <Button variant="ghost" size="icon">
    <Edit className="h-4 w-4" />
  </Button>
</IconTooltip>
```

#### Action Buttons in Dropdowns
```tsx
<DropdownMenuItem>
  <TooltipWrapper content="Download complete event report as PDF" side="right">
    <div className="flex items-center w-full">
      <Download className="mr-2 h-4 w-4" />
      <span>Download Report</span>
    </div>
  </TooltipWrapper>
</DropdownMenuItem>
```

### Badges

#### Status Badges
```tsx
<InfoTooltip content="Event is currently in progress with staff checked in">
  <Badge variant="default" className="bg-green-100 text-green-700">
    Active
  </Badge>
</InfoTooltip>
```

#### Count Badges
```tsx
<InfoTooltip content="You have 5 pending notifications that require attention">
  <Badge variant="destructive">5</Badge>
</InfoTooltip>
```

### Icons (Standalone)

```tsx
<TooltipWrapper content="This event has unresolved issues">
  <AlertCircle className="h-4 w-4 text-red-500" />
</TooltipWrapper>
```

### Form Elements

```tsx
<div className="space-y-2">
  <Label htmlFor="rate" className="flex items-center gap-2">
    Hourly Rate
    <TooltipWrapper content="Base hourly rate before overtime or bonuses">
      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
    </TooltipWrapper>
  </Label>
  <Input id="rate" type="number" />
</div>
```

### Navigation Items

```tsx
<TooltipWrapper content="View and manage all events" side="right">
  <Button variant="ghost" className="w-full justify-start">
    <Calendar className="mr-2 h-4 w-4" />
    Events
  </Button>
</TooltipWrapper>
```

---

## 📋 Tooltip Content Guidelines

### ✅ DO:
- **Be concise** - 5-10 words ideal
- **Be specific** - Explain what will happen
- **Use action verbs** - "View details", "Download report"
- **Add context** - Why this action matters
- **Include numbers** - "5 pending items", "Last 30 days"

**Good Examples:**
- ✅ "Create a new event request for client booking"
- ✅ "Filter results by date range (last 30 days)"
- ✅ "View detailed staff performance metrics"
- ✅ "Download invoice as PDF for client"

### ❌ DON'T:
- **Be redundant** - Don't repeat visible text
- **Be too long** - Over 15 words gets hard to read
- **State the obvious** - "Click this button"
- **Use jargon** - Keep language simple

**Bad Examples:**
- ❌ "Click this button to save" (obvious)
- ❌ "This button will open a dialog that allows you to..." (too long)
- ❌ "Save" (redundant with button text)
- ❌ "Initiate payroll reconciliation process" (jargon)

---

## 🎨 Tooltip Positioning Guide

### Default Positions by Context

**Top Navigation:** `side="bottom"`
```tsx
<TooltipWrapper content="View notifications" side="bottom">
  <Button variant="ghost" size="icon">
    <Bell className="h-4 w-4" />
  </Button>
</TooltipWrapper>
```

**Sidebar Navigation:** `side="right"`
```tsx
<TooltipWrapper content="Dashboard overview" side="right">
  <NavItem icon={Home} label="Dashboard" />
</TooltipWrapper>
```

**Bottom Action Bar:** `side="top"`
```tsx
<TooltipWrapper content="Submit for approval" side="top">
  <Button>Submit</Button>
</TooltipWrapper>
```

**Right Panel Actions:** `side="left"`
```tsx
<TooltipWrapper content="Close panel" side="left">
  <Button variant="ghost" size="icon">
    <X className="h-4 w-4" />
  </Button>
</TooltipWrapper>
```

---

## 📱 Pages With Tooltips Implemented

### ✅ Admin Panel
- [x] **SuperAdminCommandCenter.tsx** - Activity log button, all action cards
- [ ] Events.tsx - View, edit, delete buttons
- [ ] Staff.tsx - Action buttons, status badges  
- [ ] Clients.tsx - Contact buttons, status indicators
- [ ] Payroll.tsx - Approval buttons, calculation info
- [ ] Invoices.tsx - Send, download, status badges
- [ ] Settings.tsx - Save buttons, configuration options

### ⏳ Client Portal
- [ ] ClientDashboard.tsx - Quick action buttons
- [ ] RequestEvent.tsx - Form help icons, submit button
- [ ] ClientFavorites.tsx - Add to favorites, remove buttons
- [ ] ClientEvents.tsx - View details, modify buttons

### ⏳ Staff Portal  
- [ ] StaffDashboard.tsx - Clock in/out, view shifts
- [ ] StaffSchedule.tsx - Availability toggles, shift actions
- [ ] StaffEarnings.tsx - Download statements, view details

### ⏳ Manager Portal
- [ ] ManagerDashboard.tsx - Approval buttons, quick actions
- [ ] ManagerEventDetail.tsx - Staff assignment, messaging
- [ ] StaffRoster.tsx - Contact staff, view profiles

---

## 🔧 Implementation Checklist

When adding tooltips to a new page:

1. **Import Components**
   ```tsx
   import { TooltipWrapper, IconTooltip, InfoTooltip } from "../components/ui/tooltip-wrapper";
   ```

2. **Identify Tooltip Targets**
   - [ ] All icon buttons
   - [ ] Action buttons (edit, delete, save, submit)
   - [ ] Navigation items
   - [ ] Status badges
   - [ ] Form help icons
   - [ ] Truncated text
   - [ ] Disabled elements (explain why)

3. **Write Clear Content**
   - [ ] Action-oriented
   - [ ] Specific to context
   - [ ] Under 10 words
   - [ ] No redundancy

4. **Set Correct Position**
   - [ ] Top navigation: bottom
   - [ ] Sidebar: right
   - [ ] Footer: top
   - [ ] Right panel: left
   - [ ] Default: top

5. **Test on All Devices**
   - [ ] Desktop (hover)
   - [ ] Tablet (hover)
   - [ ] Mobile (touch/tap)
   - [ ] Keyboard navigation

---

## 🎯 Priority Tooltip Areas

### HIGH PRIORITY
1. **Icon-only buttons** - Users can't see what they do
2. **Destructive actions** - Confirm what will be deleted
3. **Status badges** - Explain what each status means
4. **Disabled buttons** - Explain why they're disabled
5. **Complex forms** - Help users fill correctly

### MEDIUM PRIORITY
6. **Navigation items** - Quick preview of section
7. **Filter buttons** - Show current filter state
8. **Export/Download** - Specify format and content
9. **Bulk actions** - Clarify what happens to selected items
10. **Dropdown menus** - Preview of nested actions

### LOW PRIORITY
11. **Text links** - Usually self-explanatory
12. **Primary buttons** - Text usually clear
13. **Simple labels** - Already descriptive

---

## 💡 Advanced Patterns

### Conditional Tooltips
```tsx
<TooltipWrapper 
  content={isEditing ? "Save changes" : "Edit event details"}
  disabled={!canEdit}
>
  <Button>
    {isEditing ? "Save" : "Edit"}
  </Button>
</TooltipWrapper>
```

### Dynamic Content
```tsx
<TooltipWrapper content={`${selectedCount} items selected`}>
  <Badge>{selectedCount}</Badge>
</TooltipWrapper>
```

### Disabled State Explanation
```tsx
<TooltipWrapper content="Complete all required fields to enable submission">
  <Button disabled={!isFormValid}>
    Submit
  </Button>
</TooltipWrapper>
```

### Status with Details
```tsx
<InfoTooltip content={`Last updated ${formatDate(event.updatedAt)} by ${event.updatedBy}`}>
  <Badge variant="outline">
    <Clock className="h-3 w-3 mr-1" />
    Recently Updated
  </Badge>
</InfoTooltip>
```

---

## 🧪 Testing Tooltips

### Manual Testing
1. **Hover Test** - Tooltip appears after delay
2. **Position Test** - Doesn't go off-screen
3. **Content Test** - Text is readable and helpful
4. **Focus Test** - Works with keyboard navigation
5. **Mobile Test** - Works with tap/touch

### Accessibility Testing
- [ ] Screen reader announces tooltip content
- [ ] Keyboard focus shows tooltip
- [ ] Sufficient color contrast
- [ ] Not essential information (also in aria-label)

---

## 📝 Tooltip Content Library

### Common Action Verbs
- View, Edit, Delete, Save, Submit, Cancel
- Download, Export, Print, Share
- Add, Remove, Update, Modify
- Approve, Reject, Review, Verify
- Filter, Sort, Search, Refresh

### Staff Actions
- "View complete staff profile and performance history"
- "Send direct message to staff member"
- "Mark staff member as favorite for future events"
- "Download staff availability calendar"
- "Assign staff member to this event shift"

### Event Actions
- "View full event details and assigned staff"
- "Edit event date, time, and requirements"
- "Cancel event and notify all assigned staff"
- "Download event summary report as PDF"
- "Duplicate event to create similar booking"

### Financial Actions  
- "Download invoice as PDF for accounting"
- "Send invoice to client via email"
- "Mark invoice as paid and update records"
- "View detailed payment breakdown"
- "Export payroll data to Excel"

### Approval Actions
- "Approve timesheet and process for payroll"
- "Reject with feedback for staff correction"
- "Review overtime hours and justification"
- "Approve event request and create booking"

---

## 🎨 Styling Customization

The tooltip component uses default Tailwind classes but can be customized:

```tsx
<TooltipContent 
  side="top" 
  sideOffset={4}
  className="bg-primary text-primary-foreground text-xs px-3 py-1.5"
>
  {content}
</TooltipContent>
```

### Brand Colors
Current: Primary background with white text
Alternative options:
- Dark mode: `bg-gray-900 text-white`
- Info: `bg-blue-600 text-white`
- Success: `bg-green-600 text-white`
- Warning: `bg-yellow-600 text-white`

---

## ✅ Completion Status

**Current Status:** 🟡 In Progress

- ✅ Tooltip components created
- ✅ Documentation complete
- ✅ SuperAdminCommandCenter updated (partial)
- ⏳ Remaining admin pages
- ⏳ Client portal pages
- ⏳ Staff portal pages
- ⏳ Manager portal pages

**Next Steps:**
1. Complete SuperAdminCommandCenter tooltips
2. Add tooltips to EventRequestDetail page
3. Update all admin panel pages systematically
4. Test on mobile devices
5. Gather user feedback

---

**Last Updated:** November 10, 2024
**Version:** 1.0
**Status:** Active Implementation
