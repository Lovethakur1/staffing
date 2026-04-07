import React, { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../config/api';
import { useAuth } from './AuthContext';

const SOCKET_URL = API_BASE_URL.replace('/api', '');

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority?: string;
  actionRequired?: boolean;
  data?: any;
  createdAt: string;
}

interface SocketContextType {
  /** Whether the socket is currently connected */
  isConnected: boolean;
  /** Count of unread notifications (updated via socket events) */
  unreadNotifCount: number;
  /** Latest notifications received via socket this session */
  recentNotifications: InAppNotification[];
  /** Reset the unread count (e.g. when user opens Notifications screen) */
  clearUnreadCount: () => void;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  unreadNotifCount: 0,
  recentNotifications: [],
  clearUnreadCount: () => {},
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<InAppNotification[]>([]);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const clearUnreadCount = useCallback(() => setUnreadNotifCount(0), []);

  useEffect(() => {
    if (!user || !token) {
      // Disconnect if logged out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    let socket: Socket;

    const connect = async () => {
      const storedToken = await SecureStore.getItemAsync('authToken');
      if (!storedToken) return;

      socket = io(SOCKET_URL, {
        auth: { token: storedToken },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000,
      });

      socket.on('connect', () => {
        console.log('[Socket] Global connection established');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('[Socket] Global connection lost');
        setIsConnected(false);
      });

      // ─── New message notification ──────────────────────────
      socket.on('notification:message', (data: {
        conversationId: string;
        senderName: string;
        preview: string;
      }) => {
        setUnreadNotifCount(prev => prev + 1);

        const notif: InAppNotification = {
          id: `msg-${Date.now()}`,
          title: `New message from ${data.senderName}`,
          message: data.preview,
          type: 'message',
          data: { conversationId: data.conversationId, senderName: data.senderName },
          createdAt: new Date().toISOString(),
        };
        setRecentNotifications(prev => [notif, ...prev.slice(0, 49)]);

        // Show alert only when app is in foreground
        if (appStateRef.current === 'active') {
          Alert.alert(
            `💬 ${data.senderName}`,
            data.preview,
            [
              { text: 'Dismiss', style: 'cancel' },
              { text: 'View', style: 'default', onPress: () => {
                // Navigation is handled by the consumer via recentNotifications
              }},
            ],
            { cancelable: true }
          );
        }
      });

      // ─── General notification (shift, payment, review, etc.) ─
      socket.on('notification:new', (data: any) => {
        setUnreadNotifCount(prev => prev + 1);

        const notif: InAppNotification = {
          id: data.id || `notif-${Date.now()}`,
          title: data.title || 'New Notification',
          message: data.message || '',
          type: (data.type || 'system').toLowerCase(),
          priority: data.priority,
          actionRequired: data.actionRequired,
          data: data.data,
          createdAt: data.createdAt || new Date().toISOString(),
        };
        setRecentNotifications(prev => [notif, ...prev.slice(0, 49)]);

        if (appStateRef.current === 'active') {
          Alert.alert(
            notif.title,
            notif.message,
            [{ text: 'OK' }],
            { cancelable: true }
          );
        }
      });

      socketRef.current = socket;
    };

    connect();

    // Reconnect when app comes back to foreground
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        if (socketRef.current && !socketRef.current.connected) {
          socketRef.current.connect();
        }
      }
      appStateRef.current = nextState;
    });

    return () => {
      subscription.remove();
      if (socket) {
        socket.disconnect();
      }
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user?.id, token]);

  return (
    <SocketContext.Provider value={{ isConnected, unreadNotifCount, recentNotifications, clearUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
