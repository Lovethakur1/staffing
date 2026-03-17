import { useNavigation } from "../contexts/NavigationContext";
import { Dashboard } from "../pages/Dashboard";
import { Events } from "../pages/Events";
import { Staff } from "../pages/Staff";
import { Workforce } from "../pages/Workforce";
import { StaffDetail } from "../pages/StaffDetail";
import { EventStaffDetails } from "../pages/EventStaffDetails";
import { ManagerEventDetail } from "../pages/ManagerEventDetail";
import { Analytics } from "../pages/Analytics";
import { Billing } from "../pages/Billing";
import { ShiftsSchedule } from "../pages/ShiftsSchedule";
import { Timesheets } from "../pages/Timesheets";
import { Payroll } from "../pages/Payroll";
import { Documents } from "../pages/Documents";
import { Performance } from "../pages/Performance";
import { Clients } from "../pages/Clients";
import { Reports } from "../pages/Reports";
import { Settings } from "../pages/Settings";
import { Resources } from "../pages/Resources";
import { Notifications } from "../pages/Notifications";
import { Profile } from "../pages/Profile";
import { Preferences } from "../pages/Preferences";
import { Security } from "../pages/Security";
import { Manager } from "../pages/Manager";
import { BookEventNew } from "../pages/BookEventNew";
import { Bookings } from "../pages/Bookings";
import { BookingDetails } from "../pages/BookingDetails";
import { UpcomingEvents } from "../pages/UpcomingEvents";
import { Favorites } from "../pages/Favorites";
import { Hiring } from "../pages/Hiring";
import { Applications } from "../pages/Applications";
import { Careers } from "../pages/Careers";
import { Interviews } from "../pages/Interviews";
import { Onboarding } from "../pages/Onboarding";
import { AdminEventDetail } from "../pages/AdminEventDetail";
import { LiveOperations } from "../pages/LiveOperations";
import { ClientFeedback } from "../pages/ClientFeedback";
import { FinancialManagement } from "../pages/FinancialManagement";
import { ShiftConflicts } from "../pages/ShiftConflicts";
import { ManagerAdminCommunication } from "../pages/ManagerAdminCommunication";
import { AccountingSystem } from "../pages/AccountingSystem";
import { AdvancedPayroll } from "../pages/AdvancedPayroll";
import { ManagerPermissions } from "../pages/ManagerPermissions";
import { TimesheetDetail } from "../pages/TimesheetDetail";
import { TimesheetManualEntry } from "../pages/TimesheetManualEntry";
import { Attendance } from "../pages/Attendance";
import { Invoicing } from "../pages/Invoicing";
import { QualityAssurance } from "../pages/QualityAssurance";
import { Certifications } from "../pages/Certifications";
import { EquipmentInventory } from "../pages/EquipmentInventory";
import { TrainingPortal } from "../pages/TrainingPortal";
import { IncidentManagement } from "../pages/IncidentManagement";
import { ShiftMarketplace } from "../pages/ShiftMarketplace";
import { FindReplacement } from "../pages/FindReplacement";
import { VerifyPayment } from "../pages/VerifyPayment";
import { FinancialHub } from "../pages/FinancialHub";
import { CreateEvent } from "../pages/CreateEvent";
import { EventRequests } from "../pages/EventRequests";
import { SubmitPayroll } from "../pages/SubmitPayroll";
import { AdminPayrollReview } from "../pages/AdminPayrollReview";
import { InvoiceDetail } from "../pages/InvoiceDetail";

interface PageRouterProps {
  userRole: string;
  userId: string;
}

export function PageRouter({ userRole, userId }: PageRouterProps) {
  const { currentPage, pageParams } = useNavigation();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard userRole={userRole} userId={userId} />;
      case 'manager':
        return <Manager userRole={userRole} userId={userId} />;
      case 'events':
        return <Events userRole={userRole} userId={userId} />;
      case 'event-requests':
        return <EventRequests userRole={userRole} userId={userId} />;
      case 'create-event':
        return <CreateEvent userRole={userRole} userId={userId} />;
      case 'staff':
        // Admin and managers see Workforce management, clients see their event staff history
        if (userRole === 'admin') {
          return <Workforce userRole={userRole} userId={userId} />;
        }
        return <Staff userRole={userRole} userId={userId} />;
      case 'staff-detail':
        return <StaffDetail userRole={userRole} userId={userId} staffId={pageParams?.staffId} />;
      case 'event-staff-details':
        return <EventStaffDetails userRole={userRole} userId={userId} eventId={pageParams?.eventId} />;
      case 'analytics':
        return <Analytics userRole={userRole} userId={userId} />;
      case 'billing':
      case 'financial-hub':
      case 'accounting-system':
      case 'advanced-payroll':
      case 'financial-management':
        // Admin sees Financial Hub, Client sees Invoicing page
        if (userRole === 'client') {
          return <Invoicing userRole={userRole} userId={userId} />;
        }
        return <FinancialHub userRole={userRole} userId={userId} />;
      case 'invoicing':
        // Client sees their invoicing page, Admin sees Financial Hub
        if (userRole === 'client') {
          return <Invoicing userRole={userRole} userId={userId} />;
        }
        return <FinancialHub userRole={userRole} userId={userId} />;
      case 'invoice-detail':
        return <InvoiceDetail userRole={userRole} userId={userId} />;
      case 'shifts':
        return <ShiftsSchedule userRole={userRole} userId={userId} />;
      case 'schedule':
      case 'shifts-schedule':
        return <ShiftsSchedule userRole={userRole} userId={userId} />;
      case 'timesheets':
        return <Timesheets userRole={userRole} userId={userId} />;
      case 'payroll':
        return <Payroll userRole={userRole} userId={userId} />;
      case 'submit-payroll':
        return <SubmitPayroll userRole={userRole} userId={userId} />;
      case 'admin-payroll-review':
        return <AdminPayrollReview userRole={userRole} userId={userId} submissionId={pageParams?.submissionId} />;
      case 'documents':
        return <Documents userRole={userRole} userId={userId} />;
      case 'performance':
        return <Performance userRole={userRole} userId={userId} />;
      case 'clients':
        return <Clients userRole={userRole} userId={userId} />;
      case 'reports':
        return <Reports userRole={userRole} userId={userId} />;
      case 'settings':
        return <Settings userRole={userRole} userId={userId} />;
      case 'resources':
        return <Resources userRole={userRole} userId={userId} />;
      case 'notifications':
        return <Notifications userRole={userRole} userId={userId} />;
      case 'profile':
        return <Profile userRole={userRole} userId={userId} />;
      case 'preferences':
        return <Preferences userRole={userRole} userId={userId} />;
      case 'security':
        return <Security userRole={userRole} userId={userId} />;
      case 'book-event':
        return <BookEventNew userRole={userRole} userId={userId} />;
      case 'bookings':
        return <Bookings userRole={userRole} userId={userId} />;
      case 'booking-details':
        return <BookingDetails userRole={userRole} userId={userId} />;
      case 'upcoming-events':
        return <UpcomingEvents userRole={userRole} userId={userId} />;
      case 'favorites':
        return <Favorites userRole={userRole} userId={userId} />;
      case 'hiring':
        return <Hiring userRole={userRole} userId={userId} />;
      case 'applications':
        return <Applications userRole={userRole} userId={userId} />;
      case 'careers':
        return <Careers userRole={userRole} userId={userId} />;
      case 'interviews':
        return <Interviews userRole={userRole} userId={userId} />;
      case 'onboarding':
        return <Onboarding userRole={userRole} userId={userId} />;
      case 'admin-event-detail':
        return <AdminEventDetail />;
      case 'live-ops':
      case 'live-operations':
        return <LiveOperations />;
      case 'manager-event-detail':
        return <ManagerEventDetail userRole={userRole} userId={userId} eventId={pageParams?.eventId} />;
      case 'scheduling':
        return <ShiftsSchedule userRole={userRole} userId={userId} />;
      case 'integrations':
        return <Settings userRole={userRole} userId={userId} />;
      case 'database':
        return <Settings userRole={userRole} userId={userId} />;
      case 'client-feedback':
        return <ClientFeedback userRole={userRole} userId={userId} />;
      case 'financial-management':
        return <FinancialManagement userRole={userRole} userId={userId} />;
      case 'shift-conflicts':
        return <ShiftConflicts userRole={userRole} userId={userId} />;
      case 'manager-admin-communication':
        return <ManagerAdminCommunication userRole={userRole} userId={userId} />;
      case 'accounting-system':
        return <AccountingSystem userRole={userRole} userId={userId} />;
      case 'advanced-payroll':
        return <AdvancedPayroll userRole={userRole} userId={userId} />;
      case 'manager-permissions':
        return <ManagerPermissions userRole={userRole} userId={userId} />;
      case 'timesheet-detail':
        return <TimesheetDetail userRole={userRole} userId={userId} />;
      case 'timesheet-manual-entry':
        return <TimesheetManualEntry userRole={userRole} userId={userId} />;
      case 'attendance':
        return <Attendance userRole={userRole} userId={userId} />;
      case 'quality-assurance':
        return <QualityAssurance userRole={userRole} userId={userId} />;
      case 'certifications':
        return <Certifications userRole={userRole} userId={userId} />;
      case 'equipment-inventory':
        return <EquipmentInventory userRole={userRole} userId={userId} />;
      case 'training-portal':
        return <TrainingPortal userRole={userRole} userId={userId} />;
      case 'incident-management':
        return <IncidentManagement userRole={userRole} userId={userId} />;
      case 'shift-marketplace':
        return <ShiftMarketplace userRole={userRole} userId={userId} />;
      case 'find-replacement':
        return <FindReplacement />;
      case 'verify-payment':
        return <VerifyPayment />;
      default:
        return <Dashboard userRole={userRole} userId={userId} />;
    }
  };

  return renderPage();
}