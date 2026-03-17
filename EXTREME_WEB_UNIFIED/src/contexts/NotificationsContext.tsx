import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'shift' | 'payment' | 'reminder' | 'schedule' | 'review' | 'training' | 'profile' | 'system';
  unread: boolean;
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  category?: string;
  userId?: string;
  data?: any; // Additional data for the notification
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  actionRequiredCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  getFilteredNotifications: (filter: 'all' | 'unread' | 'read') => Notification[];
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// Mock notifications data - in a real app this would come from an API
const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "New shift assigned",
    message: "You have been assigned to work at Wedding Reception on Oct 30, 2024 from 6:00 PM to 11:00 PM",
    time: "2 minutes ago",
    type: "shift",
    unread: true,
    priority: "high",
    actionRequired: true,
    category: "work"
  },
  {
    id: 2,
    title: "Payment received",
    message: "$350 has been deposited to your account for last week's shifts",
    time: "1 hour ago",
    type: "payment",
    unread: true,
    priority: "medium",
    actionRequired: false,
    category: "finance"
  },
  {
    id: 3,
    title: "Shift reminder",
    message: "Corporate Event tomorrow at Grand Plaza, 10:00 AM - 6:00 PM. Don't forget to bring your uniform!",
    time: "3 hours ago",
    type: "reminder",
    unread: false,
    priority: "high",
    actionRequired: false,
    category: "work"
  },
  {
    id: 4,
    title: "Schedule updated",
    message: "Your availability for next week has been confirmed. Check your schedule for details.",
    time: "5 hours ago",
    type: "schedule",
    unread: false,
    priority: "low",
    actionRequired: false,
    category: "work"
  },
  {
    id: 5,
    title: "New review received",
    message: "You received a 5-star rating from Grand Hotel event client with positive feedback",
    time: "1 day ago",
    type: "review",
    unread: false,
    priority: "medium",
    actionRequired: false,
    category: "feedback"
  },
  {
    id: 6,
    title: "Timesheet reminder",
    message: "Please submit your timesheet for the week ending Oct 20, 2024",
    time: "2 days ago",
    type: "reminder",
    unread: false,
    priority: "high",
    actionRequired: true,
    category: "admin"
  },
  {
    id: 7,
    title: "Profile update required",
    message: "Please update your emergency contact information in your profile settings",
    time: "3 days ago",
    type: "profile",
    unread: false,
    priority: "medium",
    actionRequired: true,
    category: "account"
  },
  {
    id: 8,
    title: "Training opportunity",
    message: "New wine service training available. Register by Oct 25 to secure your spot.",
    time: "1 week ago",
    type: "training",
    unread: false,
    priority: "low",
    actionRequired: false,
    category: "development"
  },
  {
    id: 9,
    title: "System maintenance",
    message: "Scheduled maintenance tonight from 2:00 AM to 4:00 AM. Service may be temporarily unavailable.",
    time: "1 week ago",
    type: "system",
    unread: false,
    priority: "medium",
    actionRequired: false,
    category: "system"
  },
  {
    id: 10,
    title: "Welcome to Extreme Staffing",
    message: "Welcome to the team! Complete your profile setup to get started with your first shifts.",
    time: "2 weeks ago",
    type: "system",
    unread: false,
    priority: "low",
    actionRequired: false,
    category: "onboarding"
  }
];

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
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

    socket.on('notification:message', (data: { conversationId: string, senderName: string, preview: string }) => {
      // Only show notification if not currently viewing that conversation
      // We can check the URL, or simply show a toast and add to the notifications list
      
      const isViewingChat = window.location.pathname.includes('/messages');
      
      if (!isViewingChat) {
        toast.info(`New message from ${data.senderName}`, {
          description: data.preview,
          action: {
            label: "Reply",
            onClick: () => {
              // Navigation would ideally go here, but context depends on routing logic
              // Since this is a global context, we just show the message
            }
          }
        });

        // Show browser notification if tab is inactive
        if (document.hidden && "Notification" in window && Notification.permission === "granted") {
          new window.Notification(`New message from ${data.senderName}`, {
            body: data.preview,
            icon: "/favicon.ico", // Or appropriate icon path
          });
        }
      }

      setNotifications(prev => [{
        id: Math.max(...prev.map(n => n.id), 0) + 1,
        title: `New message from ${data.senderName}`,
        message: data.preview,
        time: "Just now",
        type: "system", // Or a new "message" type
        unread: true,
        priority: "high",
        actionRequired: true,
        category: "communication",
        data: { conversationId: data.conversationId }
      }, ...prev]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired && n.unread).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, unread: false }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const addNotification = (newNotification: Omit<Notification, 'id'>) => {
    const id = Math.max(...notifications.map(n => n.id), 0) + 1;
    setNotifications(prev => [{ id, ...newNotification }, ...prev]);
  };

  const getFilteredNotifications = (filter: 'all' | 'unread' | 'read') => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => n.unread);
      case 'read':
        return notifications.filter(n => !n.unread);
      default:
        return notifications;
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
        addNotification,
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
