# Client Portal - Master Documentation
**Version:** 1.0.0 (Final Consolidation)
**Date:** December 3, 2024

## 1. Executive Summary
The Client Portal is a comprehensive event staffing management system designed to replace legacy tools like QuickBooks and ADP for event clients. It provides a centralized hub for booking events, managing staff, handling invoices, and communicating with the agency.

**Key Objectives:**
- **Streamlined Booking:** Intuitive event request process.
- **Financial Transparency:** Real-time invoicing, payment tracking, and detailed breakdowns.
- **Staff Management:** access to favorite staff and performance tracking.
- **Professional Aesthetic:** A "Sangria" and "Merlot" branded interface suitable for corporate clients.

---

## 2. Brand & Design System

### Color Palette
The application uses a professional, wine-inspired palette to convey sophistication and reliability.
- **Primary (Sangria):** `#98002E` (Used for primary buttons, active states, key highlights)
- **Secondary (Merlot):** `#5D001D` (Used for headers, sidebars, deep accents)
- **Backgrounds:** Clean white (`#FFFFFF`) and light slate (`#F8FAFC`) for content areas.
- **Text:** Slate-900 for headings, Slate-600 for body text.

### Typography
- **Font Family:** Inter / Sans-serif.
- **Hierarchy:** Clear distinction between Page Titles (24px+), Section Headers (18-20px), and Body Text (14-16px).

### UI/UX Principles
- **Subtlety:** Avoid overly bright colors. Use "Sangria" sparingly for calls to action.
- **Clarity:** High contrast for readability.
- **Feedback:** Interactive elements have hover states; forms provide validation.

---

## 3. Core Features & Business Logic

### A. Dashboard (`ClientDashboard.tsx`)
The central hub for the client.
- **Metrics:** Total Active Events, Pending Invoices (Count & Value), Staff on Site.
- **Action Items:** Quick links to "Book Event" or "Pay Invoice".
- **Recent Activity:** Stream of latest updates (e.g., "Staff Confirmed for [Event Name]").

### B. Event Management
**1. Booking Events (`BookEventNew.tsx`):**
- A multi-step form to request staffing.
- **Inputs:** Event Type, Date/Time, Location, Staff Roles (e.g., Bartender, Server), Quantity, Uniform Requirements.
- **Logic:** Auto-calculates estimated cost based on role rates.

**2. Active Events (`Events.tsx`):**
- List of upcoming, current, and past events.
- **Filtering:** By Status (Upcoming, Completed, Cancelled), Date Range.
- **Search:** By Event Name or Location.

**3. Event Details:**
- Specifics for a single event.
- **Tabs:** Overview, Staff List, Timeline, Financials.

### C. Financial System (`Invoicing.tsx` & `InvoiceDetail.tsx`)
**1. Invoice List:**
- Comprehensive table of all invoices.
- **Columns:** Invoice ID, Event Name, Date, Location, Staff Count, Total Amount, Paid, Balance, Status, Actions.
- **Status Logic:**
  - `Pending`: No payment made.
  - `Partial`: Some payment made, balance > 0.
  - `Paid`: Balance = 0.
  - `Overdue`: Due date passed.
- **Summary Cards:** Total Billed, Total Paid, Pending Amount, Overdue Amount.

**2. Invoice Details:**
- Deep dive into a specific invoice.
- **Line Items:** Breakdown by staff role, hours, and rate.
- **5-Hour Minimum Rule:** The system automatically enforces a 5-hour minimum pay for shifts. If a shift is < 5 hours, it is billed as 5 hours.
- **Download:** Ability to download PDF (mock).
- **Pay:** Integration with payment modal.

**3. Payment Modal:**
- Review summary before confirming.
- Mock payment processing with success toast.

### D. Staffing (`Staff.tsx` / `Favorites.tsx`)
- **Favorites List:** Clients can "heart" staff they prefer.
- **Directory:** Browse available staff profiles (read-only for clients).
- **Profiles:** View skills, rating, and past events worked for this client.

### E. Communication (`Messages.tsx`)
- **Chat Interface:** Direct line to Agency Admins or Event Managers.
- **Context:** Chats can be linked to specific events.

---

## 4. Architecture & Navigation

### Routing (`PageRouter.tsx`)
The routing logic has been simplified to focus on the Client experience.

| Route Key | Component | Description |
|-----------|-----------|-------------|
| `dashboard` | `ClientDashboard` | Main landing page. |
| `events` | `Events` | List of all events. |
| `book-event` | `BookEventNew` | New event request form. |
| `invoicing` | `Invoicing` | Financial overview. |
| `invoice-detail` | `InvoiceDetail` | Specific invoice view. |
| `staff` | `Staff` | Staff directory/history. |
| `favorites` | `Favorites` | Saved staff members. |
| `messages` | `Messages` | Chat system. |
| `profile` | `Profile` | User account settings. |
| `settings` | `Settings` | App preferences. |

### Data Management
- **Mock Data:** Centralized in `mockData.ts` (or component-level mocks for specific features like Invoicing).
- **State:** `AppStateContext` manages global state (User, Theme). `NavigationContext` handles routing.

---

## 5. Recent Updates & Final Polish
**Invoicing Module Overhaul:**
- **New Page:** `InvoiceDetail.tsx` added for granular billing views.
- **Enhanced List:** `Invoicing.tsx` updated with sophisticated filtering (Search, Status Dropdown) and summary cards using the "Sangria" palette.
- **Interaction:** "Pay" button triggers a modal summary; "View" navigates to details.
- **Design:** Aligned with the professional "Merlot" aesthetic—subtle backgrounds, crisp borders, clear typography.

---

## 6. Future Roadmap (Post-Consolidation)
- **Backend Integration:** Connect `Invoicing` to Supabase for real payment processing (Stripe).
- **Real-time Chat:** Implement WebSocket support for `Messages`.
- **PDF Generation:** Real PDF generation for Invoices.

---

*This document represents the final state of the Client Portal codebase as of the latest consolidation.*
