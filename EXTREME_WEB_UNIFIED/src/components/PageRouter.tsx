import { useNavigation } from "../contexts/NavigationContext";
import { Dashboard } from "../pages/Dashboard";
import { Events } from "../pages/Events";
import { Staff } from "../pages/Staff";
import { Workforce } from "../pages/Workforce";
import { StaffDetail } from "../pages/StaffDetail";
import { EventStaffDetails } from "../pages/EventStaffDetails";
import { EventStaffDetail } from "../pages/EventStaffDetail";
import { ManagerEventDetail } from "../pages/ManagerEventDetail";
import { ManagerEventAttendanceDetail } from "../pages/ManagerEventAttendanceDetail";
import { Analytics } from "../pages/Analytics";
import { Billing } from "../pages/Billing";
import { Messages } from "../pages/Messages";
import { ShiftsSchedule } from "../pages/ShiftsSchedule";
import { Timesheets } from "../pages/Timesheets";
import { Payroll } from "../pages/Payroll";
import { Documents } from "../pages/Documents";
import { Performance } from "../pages/Performance";
import { Clients } from "../pages/Clients";
import { ClientDetail } from "../pages/ClientDetail";
import { Reports } from "../pages/Reports";
import { Settings } from "../pages/Settings";
import { Resources } from "../pages/Resources";
import { Notifications } from "../pages/Notifications";
import { Profile } from "../pages/Profile";
import { Preferences } from "../pages/Preferences";
import { Security } from "../pages/Security";
import { Manager } from "../pages/Manager";
import { BookEvent } from "../pages/BookEvent";
import { Bookings } from "../pages/Bookings";
import { BookingDetails } from "../pages/BookingDetails";
import { UpcomingEvents } from "../pages/UpcomingEvents";
import { OngoingEvents } from "../pages/OngoingEvents";
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
import { EventAttendanceDetail } from "../pages/EventAttendanceDetail";
import { StaffAvailability } from "../pages/StaffAvailability";
import { StaffSkillsRatings } from "../pages/StaffSkillsRatings";
import { Scheduler } from "../pages/Scheduler";
import { SubAdmin } from "../pages/SubAdmin";
import { EventRequestDetail } from "../pages/EventRequestDetail";
import { CreateEvent } from "../pages/CreateEvent";
import { StaffShiftDetail } from "../pages/StaffShiftDetail";
import { StaffEventHistoryDetail } from "../pages/StaffEventHistoryDetail";
import { FinancialHub } from "../pages/FinancialHub";
import { InvoiceDetail } from "../pages/InvoiceDetail";
import { StaffPayroll } from "../pages/StaffPayroll";
import { FinancialReports } from "../pages/FinancialReports";
import { SubmitPayroll } from "../pages/SubmitPayroll";
import { AdminPayrollReview } from "../pages/AdminPayrollReview";
import { Integrations } from "../pages/Integrations";
import { Database } from "../pages/Database";
import { Invoicing } from "../pages/Invoicing";
import { QualityAssurance } from "../pages/QualityAssurance";
import { Certifications } from "../pages/Certifications";
import { EquipmentInventory } from "../pages/EquipmentInventory";
import { TrainingPortal } from "../pages/TrainingPortal";
import { IncidentManagement } from "../pages/IncidentManagement";
import { ShiftMarketplace } from "../pages/ShiftMarketplace";
import { FindReplacement } from "../pages/FindReplacement";
import { VerifyPayment } from "../pages/VerifyPayment";
import { PaymentVerificationDetail } from "../pages/PaymentVerificationDetail";
import { IncidentDetail } from "../pages/IncidentDetail";
import { JobPostingDetail } from "../pages/JobPostingDetail";
import { InterviewDetail } from "../pages/InterviewDetail";
import { OnboardingDetail } from "../pages/OnboardingDetail";
import { EventRequestsQueue } from "../pages/EventRequestsQueue";
import { PricingConfiguration } from "../pages/PricingConfiguration";
import { StaffMyEvents } from "../pages/StaffMyEvents";
import { HelpSupport } from "../pages/HelpSupport";
import { Documentation } from "../pages/Documentation";
import { GettingStartedGuide } from "../pages/docs/GettingStartedGuide";
import { EventManagementGuide } from "../pages/docs/EventManagementGuide";
import { PayrollProcessingGuide } from "../pages/docs/PayrollProcessingGuide";
import { PrivacyPolicy } from "../pages/docs/PrivacyPolicy";
import { TermsOfService } from "../pages/docs/TermsOfService";
import { StaffWorkforceGuide } from "../pages/docs/StaffWorkforceGuide";
import { SchedulingDispatchGuide } from "../pages/docs/SchedulingDispatchGuide";
import { FinancialManagementGuide } from "../pages/docs/FinancialManagementGuide";
import { SystemSettingsGuide } from "../pages/docs/SystemSettingsGuide";
import { SecurityPermissionsGuide } from "../pages/docs/SecurityPermissionsGuide";
import { SecurityPolicy } from "../pages/docs/SecurityPolicy";
import { DataProcessingAgreement } from "../pages/docs/DataProcessingAgreement";
import { RolesPermissions } from "../pages/RolesPermissions";
import { SchedulingDispatch } from "../pages/SchedulingDispatch";
import { DeviceApprovals } from "../pages/DeviceApprovals";
// StaffTracker removed from admin portal

interface PageRouterProps {
    userRole: string;
    userId: string;
}

export function PageRouter({ userRole, userId }: PageRouterProps) {
    const { currentPage, pageParams, setCurrentPage } = useNavigation();

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                // Route users to their role-specific dashboards
                if (userRole === 'sub-admin') {
                    return <SubAdmin userRole={userRole} userId={userId} />;
                } else if (userRole === 'scheduler') {
                    return <Scheduler userRole={userRole} userId={userId} />;
                } else if (userRole === 'manager') {
                    return <Manager userRole={userRole} userId={userId} />;
                }
                return <Dashboard userRole={userRole} userId={userId} />;
            case 'manager':
                return <Manager userRole={userRole} userId={userId} />;
            case 'events':
                return <Events userRole={userRole} userId={userId} />;
            case 'event-request-detail':
                return <EventRequestDetail userRole={userRole} userId={userId} />;
            case 'create-event':
                return <CreateEvent userRole={userRole} userId={userId} />;
            case 'shift-details':
                return <StaffShiftDetail userId={userId} shiftId={pageParams?.shiftId} />;
            case 'staff':
                // Admin and Sub-Admin see Workforce management, clients see their event staff history
                if (userRole === 'admin' || userRole === 'sub-admin') {
                    return <Workforce userRole={userRole} userId={userId} />;
                }
                return <Staff userRole={userRole} userId={userId} />;
            case 'staff-detail':
                return <StaffDetail userRole={userRole} userId={userId} staffId={pageParams?.staffId} />;
            case 'staff-event-detail':
                return <StaffEventHistoryDetail userRole={userRole} userId={userId} staffId={pageParams?.staffId} eventId={pageParams?.eventId} />;
            case 'event-staff-details':
                return <EventStaffDetails userRole={userRole} userId={userId} eventId={pageParams?.eventId} />;
            case 'event-staff-detail':
                return <EventStaffDetail userRole={userRole} />;
            case 'analytics':
                return <Analytics userRole={userRole} userId={userId} />;
            case 'billing':
                return userRole === 'client' 
                    ? <Billing userRole={userRole} userId={userId} />
                    : <FinancialHub userRole={userRole} userId={userId} />;
            case 'financial-hub':
            case 'invoicing':
            case 'accounting-system':
            case 'advanced-payroll':
            case 'financial-management':
                return <FinancialHub userRole={userRole} userId={userId} />;
            case 'invoice-detail':
                return <InvoiceDetail userRole={userRole} userId={userId} />;
            case 'staff-payroll':
                return <StaffPayroll userRole={userRole} userId={userId} />;
            case 'financial-reports':
                return <FinancialReports userRole={userRole} userId={userId} />;
            case 'messages':
                return <Messages userRole={userRole} userId={userId} />;
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
            case 'client-detail':
                return <ClientDetail userRole={userRole} userId={userId} clientId={pageParams?.clientId} />;
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
                return <BookEvent userRole={userRole} userId={userId} />;
            case 'bookings':
                return <Bookings userRole={userRole} userId={userId} />;
            case 'booking-details':
                return <BookingDetails userRole={userRole} userId={userId} />;
            case 'upcoming-events':
                return <UpcomingEvents userRole={userRole} userId={userId} />;
            case 'ongoing-events':
                return <OngoingEvents userRole={userRole} userId={userId} />;
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
                return <AdminEventDetail userRole={userRole} />;
            case 'live-ops':
            case 'live-operations':
                return <LiveOperations />;
            case 'manager-event-detail':
                return <ManagerEventDetail userRole={userRole} userId={userId} eventId={pageParams?.eventId} />;
            case 'manager-event-attendance-detail':
                return <ManagerEventAttendanceDetail userRole={userRole} userId={userId} eventId={pageParams?.eventId} />;
            case 'scheduling':
            case 'scheduling-dispatch':
                // Admin sees Scheduling & Dispatch, others see ShiftsSchedule
                if (userRole === 'admin') {
                    return <SchedulingDispatch userRole={userRole} userId={userId} />;
                }
                return <ShiftsSchedule userRole={userRole} userId={userId} />;
            case 'integrations':
                return <Integrations userRole={userRole} userId={userId} />;
            case 'database':
                return <Database userRole={userRole} userId={userId} />;
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
            case 'event-attendance-detail':
                return <EventAttendanceDetail userRole={userRole} userId={userId} eventId={pageParams?.eventId} />;
            case 'staff-availability':
                return <StaffAvailability userRole={userRole} userId={userId} />;
            case 'staff-skills':
                return <StaffSkillsRatings userRole={userRole} userId={userId} />;
            case 'invoicing':
                return <Invoicing userRole={userRole} userId={userId} />;
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
                return <VerifyPayment userRole={userRole} userId={userId} />;
            case 'payment-verification-detail':
                return <PaymentVerificationDetail userRole={userRole} userId={userId} />;
            case 'incident-detail':
                return <IncidentDetail userRole={userRole} userId={userId} incidentId={pageParams?.incidentId} />;
            case 'job-posting-detail':
                return <JobPostingDetail userRole={userRole} userId={userId} jobId={pageParams?.jobId} />;
            case 'interview-detail':
                return <InterviewDetail userRole={userRole} userId={userId} interviewId={pageParams?.interviewId} />;
            case 'onboarding-detail':
                return <OnboardingDetail userRole={userRole} userId={userId} onboardingId={pageParams?.onboardingId} />;
            case 'event-requests-queue':
                return <EventRequestsQueue userRole={userRole} userId={userId} />;
            case 'pricing-configuration':
                return <PricingConfiguration userRole={userRole} userId={userId} />;
            case 'my-events':
                return <StaffMyEvents userId={userId} />;
            case 'help-support':
                return <HelpSupport userRole={userRole} userId={userId} />;
            case 'documentation':
                return <Documentation userRole={userRole} userId={userId} onNavigate={setCurrentPage} />;
            case 'getting-started-guide':
                return <GettingStartedGuide onNavigate={setCurrentPage} userRole={userRole} />;
            case 'event-management-guide':
                return <EventManagementGuide onNavigate={setCurrentPage} userRole={userRole} />;
            case 'payroll-processing-guide':
                return <PayrollProcessingGuide onNavigate={setCurrentPage} userRole={userRole} />;
            case 'privacy-policy':
                return <PrivacyPolicy onNavigate={setCurrentPage} userRole={userRole} />;
            case 'terms-of-service':
                return <TermsOfService onNavigate={setCurrentPage} userRole={userRole} />;
            case 'staff-workforce-guide':
                return <StaffWorkforceGuide onNavigate={setCurrentPage} userRole={userRole} />;
            case 'scheduling-dispatch-guide':
                return <SchedulingDispatchGuide onNavigate={setCurrentPage} userRole={userRole} />;
            case 'financial-management-guide':
                return <FinancialManagementGuide onNavigate={setCurrentPage} userRole={userRole} />;
            case 'system-settings-guide':
                return <SystemSettingsGuide onNavigate={setCurrentPage} userRole={userRole} />;
            case 'security-permissions-guide':
                return <SecurityPermissionsGuide onNavigate={setCurrentPage} userRole={userRole} />;
            case 'security-policy':
                return <SecurityPolicy onNavigate={setCurrentPage} userRole={userRole} />;
            case 'data-processing-agreement':
                return <DataProcessingAgreement onNavigate={setCurrentPage} userRole={userRole} />;
            case 'roles-permissions':
                return <RolesPermissions userRole={userRole} userId={userId} />;
            case 'device-approvals':
                return <DeviceApprovals userRole={userRole} userId={userId} />;
            case 'sub-admin':
                return <SubAdmin userRole={userRole} userId={userId} />;
            case 'scheduler':
                return <Scheduler userRole={userRole} userId={userId} />;
            default:
                return <Dashboard userRole={userRole} userId={userId} />;
        }
    };

    return renderPage();
}
