# Event Workflow Correction

## Problem Identified
The original design had admins creating events from scratch using a "Create Event" page, which doesn't reflect the real-world workflow of an event staffing management system.

## Corrected Workflow

### Client Workflow
1. **Client submits event request** via:
   - Client Portal → "Book New Event" page (`/pages/BookEvent.tsx`)
   - Public website form (external)
   - Email/phone request (entered by admin on client's behalf)

2. **Client receives updates** on their request:
   - Pending approval
   - Approved (with staff assignments)
   - Needs modification
   - Rejected (with reason)

3. **Client views confirmed events**:
   - "My Bookings" page shows all approved events
   - "Upcoming Events" shows events happening soon

### Admin Workflow
1. **Review incoming event requests**:
   - New page: **Event Requests** (`/pages/EventRequests.tsx`)
   - Shows all client-submitted requests with status:
     - ⏰ Pending - Awaiting initial review
     - 👁️ Under Review - Being evaluated
     - ✅ Approved - Confirmed and ready for scheduling
     - ⚠️ Needs Modification - Client needs to update details
     - ❌ Rejected - Cannot accommodate

2. **Admin actions on requests**:
   - **View Details** - See full event information
   - **Approve** - Confirm the event and move to scheduling
   - **Reject** - Decline with reason sent to client
   - **Request Modifications** - Ask client to update budget, dates, or requirements
   - **Message Client** - Direct communication about the request

3. **Manage approved events**:
   - Approved events appear in "Event Management" (`/pages/Events.tsx`)
   - Admin can:
     - Assign staff to positions
     - Create detailed schedules
     - Monitor event progress
     - Handle day-of operations

4. **Manual event creation** (edge cases only):
   - "Create Event" page (`/pages/CreateEvent.tsx`) still exists for:
     - Walk-in clients
     - Phone requests
     - Emergency/rush bookings
     - Internal company events

## Key Features of Event Requests Page

### Statistics Dashboard
- Total Requests
- Pending Count
- Under Review Count
- Approved Count
- Total Budget (active requests)
- Total Staff Needed

### Filtering & Organization
- Search by event name, client, request number
- Filter by status (pending, approved, rejected, etc.)
- Filter by priority (urgent, high, medium, low)
- Tabbed view for quick access

### Request Details
- **Client Information**: Name, company, email, phone
- **Event Details**: Name, type, date, time, venue, guests
- **Staffing Requirements**: Servers, bartenders, coordinators, managers
- **Budget**: Total event budget
- **Special Requirements**: Custom requests, dietary needs, etc.
- **Equipment**: Tables, chairs, linens, audio, etc.
- **Priority Level**: Auto-calculated or manually set

### Admin Response System
- **Approve**: Moves event to active management
- **Reject**: Declines with admin notes sent to client
- **Request Changes**: Sends modification request to client
- **Message**: Direct communication thread

## Navigation Update

### Admin Sidebar (New Order)
1. Dashboard
2. Live Operations
3. **Event Requests** ← NEW (badge shows pending count)
4. Event Management (approved events only)
5. Scheduling & Dispatch
6. Workforce
7. ... (rest of navigation)

## Benefits of This Approach

1. **Accurate Workflow**: Mirrors real event staffing operations
2. **Client Empowerment**: Clients submit their own requests
3. **Admin Efficiency**: Centralized request review and approval
4. **Clear Status Tracking**: Everyone knows where each event stands
5. **Better Communication**: Built-in messaging for clarifications
6. **Audit Trail**: Complete history of request → approval → execution

## Migration Notes

- **CreateEvent page**: Kept for edge cases but de-emphasized
- **BookEvent page**: Primary event submission for clients
- **Events page**: Now shows only approved/active events
- **EventRequests page**: New admin-only review center

## Future Enhancements

- Automated pricing calculator based on staff count and duration
- Client can see request status in real-time
- Email notifications for status changes
- Calendar view of all pending requests by date
- Availability checker before approval
- Integration with contract generation
- Automated staff suggestions based on requirements
