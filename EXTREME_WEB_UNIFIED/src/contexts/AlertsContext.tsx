import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { io, Socket } from "socket.io-client";
import api from "../services/api";

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

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function mapPriorityToSeverity(priority: string): 'critical' | 'warning' | 'info' {
  switch (priority) {
    case 'high': return 'critical';
    case 'medium': return 'warning';
    default: return 'info';
  }
}

function mapType(type: string): Alert['type'] {
  const valid: Alert['type'][] = ['event', 'staff', 'payment', 'compliance', 'system', 'critical'];
  const t = type?.toLowerCase() as Alert['type'];
  return valid.includes(t) ? t : 'system';
}

function buildActions(type: string, data?: any): Alert['actions'] {
  switch (type) {
    case 'event':
    case 'shift':
      return [
        { label: 'View Event', variant: 'default', action: 'view-event' },
      ];
    case 'payment':
      return [
        { label: 'View Payment', variant: 'default', action: 'view-payment' },
      ];
    case 'staff':
      return [
        { label: 'View Staff', variant: 'default', action: 'view-staff' },
      ];
    case 'support':
      return [
        { label: 'View Ticket', variant: 'default', action: 'view-ticket' },
      ];
    default:
      return [];
  }
}

function mapNotificationToAlert(n: any): Alert {
  const nType = (n.type || 'system').toLowerCase();
  return {
    id: n.id,
    eventId: n.data?.eventId,
    eventName: n.data?.eventName || n.data?.eventTitle,
    title: n.title || '',
    description: n.message || '',
    time: n.createdAt ? timeAgo(n.createdAt) : '',
    type: mapType(nType),
    severity: mapPriorityToSeverity(n.priority || 'medium'),
    unread: n.unread ?? true,
    actionRequired: n.actionRequired ?? false,
    actions: buildActions(nType, n.data),
  };
}

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      // Fetch notifications that are high priority or action-required — these qualify as alerts
      const res = await api.get('/notifications?take=50');
      const raw = res.data?.data || res.data || [];
      // Filter for alert-worthy notifications: high priority, action required, or alert type
      const alertItems = (raw as any[]).filter(
        (n: any) =>
          n.priority === 'high' ||
          n.actionRequired === true ||
          n.type === 'alert' ||
          n.type === 'critical'
      );
      setAlerts(alertItems.map(mapNotificationToAlert));
    } catch {
      // Not logged in or API unavailable
    }
  }, []);

  useEffect(() => {
    fetchAlerts();

    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('notification:new', (data: any) => {
      // Only surface high-priority / action-required as alerts
      if (data.priority === 'high' || data.actionRequired || data.type === 'alert' || data.type === 'critical') {
        setAlerts(prev => [mapNotificationToAlert(data), ...prev]);
      }
    });

    const interval = setInterval(fetchAlerts, 60000);

    return () => {
      socket.disconnect();
      socketRef.current = null;
      clearInterval(interval);
    };
  }, []);

  const unreadCount = alerts.filter(a => a.unread).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.unread).length;

  const markAsRead = async (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, unread: false } : a));
    try { await api.put(`/notifications/${id}/read`); } catch {}
  };

  const markAllAsRead = async () => {
    setAlerts(prev => prev.map(a => ({ ...a, unread: false })));
    try { await api.put('/notifications/read-all'); } catch {}
  };

  const dismissAlert = async (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    try { await api.delete(`/notifications/${id}`); } catch {}
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
