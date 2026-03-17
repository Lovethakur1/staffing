# Client Portal - File Manifest
**Date:** December 3, 2024

The following files constitute the core of the Client Portal application. Files not listed here may be related to legacy Admin/Manager/Staff portals and are considered deprecated for this specific delivery.

## Core Application
- `/App.tsx` - Main entry point.
- `/components/PageRouter.tsx` - Routing logic (Client routes).
- `/components/layout/AppLayout.tsx` - Main layout wrapper.
- `/components/layout/AppSidebar.tsx` - Navigation sidebar.
- `/components/layout/TopNavigation.tsx` - Top header area.

## Pages (Client Views)
### Dashboard
- `/pages/Dashboard.tsx` (Wrapper)
- `/components/client/ClientDashboard.tsx`
- `/components/client/SimplifiedClientDashboard.tsx`

### Events
- `/pages/Events.tsx` - Active events list.
- `/pages/BookEventNew.tsx` - New event booking wizard.
- `/pages/BookingDetails.tsx` - Event specific details.
- `/pages/EventRequests.tsx` - Status of requested events.

### Financials (Invoicing & Billing)
- `/pages/Invoicing.tsx` - **[UPDATED]** Main invoice list with filters/summary.
- `/pages/InvoiceDetail.tsx` - **[NEW]** Detailed invoice view with line items.
- `/components/client/FinancialManagement.tsx` - Financial overview components.

### Staffing
- `/pages/Staff.tsx` - Staff history/directory.
- `/pages/Favorites.tsx` - Saved staff members.
- `/components/client/FavoriteStaffOverview.tsx`
- `/components/client/StaffDirectoryRatings.tsx`

### Communication
- `/pages/Messages.tsx` - Messaging center.
- `/pages/Notifications.tsx` - System alerts.

### Settings & Profile
- `/pages/Profile.tsx` - User profile.
- `/pages/Settings.tsx` - Application settings.

## UI Components (Shared)
- `/components/ui/*.tsx` - ShadCN UI component library (Buttons, Cards, Inputs, etc.).

## Contexts & State
- `/contexts/NavigationContext.tsx`
- `/contexts/AppStateContext.tsx`
- `/contexts/NotificationsContext.tsx`

## Styles
- `/styles/globals.css` - Tailwind & Global styles (Sangria/Merlot variables).

---
*End of Manifest*
