import { createContext, useContext, useState, ReactNode } from "react";

export interface Alert {
  id: string;
  eventId?: string;
  eventName?: string;
  title: string;
  description: string;
  time: string;
  type: 'event' | 'staff' | 'payment' | 'compliance' | 'system' | 'critical';
  severity: 'critical' | 'warning' | 'info';
  unread: boolean;
  actionRequired: boolean;
  actions?: {
    label: string;
    variant: 'default' | 'destructive' | 'outline' | 'secondary';
    action: string; // Action type like 'contact-staff', 'view-event', 'approve-payment'
  }[];
}

interface AlertsContextType {
  alerts: Alert[];
  unreadCount: number;
  criticalCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissAlert: (id: string) => void;
  addAlert: (alert: Omit<Alert, 'id'>) => void;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

// Mock alerts data - comprehensive admin alerts
const initialAlerts: Alert[] = [
  {
    id: 'alert-1',
    eventId: 'evt-001',
    eventName: 'Wedding Reception - Johnson',
    title: 'Staff Member Not Arrived',
    description: 'Sarah Martinez (Bartender) has not checked in yet. Event started 15 minutes ago.',
    time: '15 min ago',
    type: 'event',
    severity: 'critical',
    unread: true,
    actionRequired: true,
    actions: [
      { label: 'Contact Staff', variant: 'default', action: 'contact-staff' },
      { label: 'Find Replacement', variant: 'outline', action: 'find-replacement' },
      { label: 'View Event', variant: 'outline', action: 'view-event' }
    ]
  },
  {
    id: 'alert-2',
    eventId: 'evt-003',
    eventName: 'Corporate Gala - TechCorp',
    title: 'Last Minute Cancellation',
    description: 'Michael Chen (Server) cancelled 2 hours before event start. Replacement needed urgently.',
    time: '45 min ago',
    type: 'staff',
    severity: 'critical',
    unread: true,
    actionRequired: true,
    actions: [
      { label: 'Find Replacement', variant: 'destructive', action: 'find-replacement' },
      { label: 'Contact Client', variant: 'outline', action: 'contact-client' },
      { label: 'View Event', variant: 'outline', action: 'view-event' }
    ]
  },
  {
    id: 'alert-3',
    eventId: 'evt-012',
    eventName: 'Birthday Party - Smith',
    title: 'Payment Verification Required',
    description: 'Final payment of $2,450 is pending verification. Event is in 3 days.',
    time: '2 hours ago',
    type: 'payment',
    severity: 'warning',
    unread: true,
    actionRequired: true,
    actions: [
      { label: 'Verify Payment', variant: 'default', action: 'verify-payment' },
      { label: 'Contact Client', variant: 'outline', action: 'contact-client' },
      { label: 'View Event', variant: 'outline', action: 'view-event' }
    ]
  },
  {
    id: 'alert-4',
    eventId: 'evt-007',
    eventName: 'Charity Fundraiser - Hope Foundation',
    title: 'Staff Overtime Alert',
    description: 'Emma Davis has worked 45 hours this week. Approaching overtime threshold.',
    time: '3 hours ago',
    type: 'compliance',
    severity: 'warning',
    unread: true,
    actionRequired: false,
    actions: [
      { label: 'View Schedule', variant: 'outline', action: 'view-schedule' },
      { label: 'Adjust Hours', variant: 'outline', action: 'adjust-hours' }
    ]
  },
  {
    id: 'alert-5',
    eventId: 'evt-015',
    eventName: 'Product Launch - Innovation Inc',
    title: 'Insufficient Staff Coverage',
    description: 'Only 8 of 12 required staff positions filled. Event is tomorrow.',
    time: '5 hours ago',
    type: 'event',
    severity: 'warning',
    unread: true,
    actionRequired: true,
    actions: [
      { label: 'Post Job Opening', variant: 'default', action: 'post-job' },
      { label: 'Contact Available Staff', variant: 'outline', action: 'contact-staff' },
      { label: 'View Event', variant: 'outline', action: 'view-event' }
    ]
  },
  {
    id: 'alert-6',
    title: 'Multiple Pending Timesheets',
    description: '23 timesheets from last week are pending approval. Payroll deadline in 24 hours.',
    time: '6 hours ago',
    type: 'payment',
    severity: 'warning',
    unread: false,
    actionRequired: true,
    actions: [
      { label: 'Review Timesheets', variant: 'default', action: 'review-timesheets' },
      { label: 'Bulk Approve', variant: 'outline', action: 'bulk-approve' }
    ]
  },
  {
    id: 'alert-7',
    eventId: 'evt-009',
    eventName: 'Anniversary Dinner - Martinez',
    title: 'Low Client Rating Received',
    description: 'Client rated service 2/5 stars. Immediate follow-up recommended.',
    time: '1 day ago',
    type: 'event',
    severity: 'warning',
    unread: false,
    actionRequired: true,
    actions: [
      { label: 'View Feedback', variant: 'default', action: 'view-feedback' },
      { label: 'Contact Client', variant: 'outline', action: 'contact-client' },
      { label: 'View Event', variant: 'outline', action: 'view-event' }
    ]
  },
  {
    id: 'alert-8',
    title: 'Certificate Expiring Soon',
    description: '5 staff members have food handler certificates expiring within 30 days.',
    time: '1 day ago',
    type: 'compliance',
    severity: 'warning',
    unread: false,
    actionRequired: true,
    actions: [
      { label: 'View Staff List', variant: 'default', action: 'view-staff' },
      { label: 'Send Reminders', variant: 'outline', action: 'send-reminders' }
    ]
  },
  {
    id: 'alert-9',
    title: 'System Backup Required',
    description: 'Weekly system backup needs to be initiated and verified.',
    time: '2 days ago',
    type: 'system',
    severity: 'info',
    unread: false,
    actionRequired: true,
    actions: [
      { label: 'Run Backup', variant: 'default', action: 'run-backup' },
      { label: 'View Backup History', variant: 'outline', action: 'view-history' }
    ]
  },
  {
    id: 'alert-10',
    eventId: 'evt-018',
    eventName: 'Conference - Business Summit',
    title: 'Equipment Request Pending',
    description: 'Client requested additional sound equipment. Requires approval and vendor coordination.',
    time: '3 days ago',
    type: 'event',
    severity: 'info',
    unread: false,
    actionRequired: false,
    actions: [
      { label: 'Approve Request', variant: 'default', action: 'approve-request' },
      { label: 'Contact Vendor', variant: 'outline', action: 'contact-vendor' },
      { label: 'View Event', variant: 'outline', action: 'view-event' }
    ]
  }
];

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  const unreadCount = alerts.filter(a => a.unread).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.unread).length;

  const markAsRead = (id: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === id ? { ...alert, unread: false } : alert
      )
    );
  };

  const markAllAsRead = () => {
    setAlerts(prev =>
      prev.map(alert => ({ ...alert, unread: false }))
    );
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const addAlert = (newAlert: Omit<Alert, 'id'>) => {
    const id = `alert-${Date.now()}`;
    setAlerts(prev => [{ id, ...newAlert }, ...prev]);
  };

  return (
    <AlertsContext.Provider
      value={{
        alerts,
        unreadCount,
        criticalCount,
        markAsRead,
        markAllAsRead,
        dismissAlert,
        addAlert,
      }}
    >
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertsContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
}
