import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { useNavigation } from "./NavigationContext";
import api from "../services/api";

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: string;
  unread: boolean;
  priority: string;
  actionRequired: boolean;
  category?: string;
  userId?: string;
  data?: any;
  createdAt?: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  actionRequiredCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  refreshNotifications: () => void;
  getFilteredNotifications: (filter: 'all' | 'unread' | 'read') => Notification[];
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { setCurrentPage } = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications?take=50');
      const raw = res.data?.data || res.data || [];
      const mapped: Notification[] = raw.map((n: any) => ({
        id: n.id,
        title: n.title || '',
        message: n.message || '',
        time: n.createdAt ? timeAgo(n.createdAt) : '',
        type: (n.type || 'system').toLowerCase(),
        unread: n.unread ?? true,
        priority: n.priority || 'medium',
        actionRequired: n.actionRequired ?? false,
        category: n.category,
        userId: n.userId,
        data: n.data,
        createdAt: n.createdAt,
      }));
      setNotifications(mapped);
    } catch {
      // Not logged in or API unavailable — keep empty
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Request browser notification permission
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Real-time: new notification from backend
    socket.on('notification:new', (data: any) => {
      const newNotif: Notification = {
        id: data.id || crypto.randomUUID(),
        title: data.title || '',
        message: data.message || '',
        time: 'Just now',
        type: (data.type || 'system').toLowerCase(),
        unread: true,
        priority: data.priority || 'medium',
        actionRequired: data.actionRequired ?? false,
        category: data.category,
        data: data.data,
        createdAt: data.createdAt || new Date().toISOString(),
      };

      setNotifications(prev => [newNotif, ...prev]);

      toast.info(newNotif.title, { description: newNotif.message });

      if (document.hidden && "Notification" in window && Notification.permission === "granted") {
        new window.Notification(newNotif.title, { body: newNotif.message, icon: "/favicon.ico" });
      }
    });

    socket.on('notification:message', (data: { conversationId: string, senderName: string, preview: string }) => {
      const isViewingChat = window.location.pathname.includes('/messages');
      
      if (!isViewingChat) {
        toast.info(`New message from ${data.senderName}`, {
          description: data.preview,
          action: {
            label: "Reply",
            onClick: () => {
              setCurrentPage('messages', { conversationId: data.conversationId });
            }
          }
        });

        if (document.hidden && "Notification" in window && Notification.permission === "granted") {
          new window.Notification(`New message from ${data.senderName}`, {
            body: data.preview,
            icon: "/favicon.ico",
          });
        }
      }

      // Add to notification list
      setNotifications(prev => [{
        id: crypto.randomUUID(),
        title: `New message from ${data.senderName}`,
        message: data.preview,
        time: "Just now",
        type: "message",
        unread: true,
        priority: "medium",
        actionRequired: false,
        category: "communication",
        data: { conversationId: data.conversationId },
        createdAt: new Date().toISOString(),
      }, ...prev]);
    });

    // Refresh periodically (every 60s)
    const interval = setInterval(fetchNotifications, 60000);

    return () => {
      socket.disconnect();
      socketRef.current = null;
      clearInterval(interval);
    };
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired && n.unread).length;

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    try { await api.put(`/notifications/${id}/read`); } catch {}
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    try { await api.put('/notifications/read-all'); } catch {}
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try { await api.delete(`/notifications/${id}`); } catch {}
  };

  const getFilteredNotifications = (filter: 'all' | 'unread' | 'read') => {
    switch (filter) {
      case 'unread': return notifications.filter(n => n.unread);
      case 'read': return notifications.filter(n => !n.unread);
      default: return notifications;
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        actionRequiredCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications: fetchNotifications,
        getFilteredNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
