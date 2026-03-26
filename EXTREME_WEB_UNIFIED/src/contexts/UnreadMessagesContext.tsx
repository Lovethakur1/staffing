import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import api from "../services/api";

interface UnreadMessagesContextType {
  unreadCount: number;
  refresh: () => void;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextType>({ unreadCount: 0, refresh: () => {} });

export function UnreadMessagesProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchUnread = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await api.get("/chat/unread-count");
      setUnreadCount(res.data?.unreadCount ?? 0);
    } catch {
      // silently ignore – user may not be logged in
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    // Poll every 30 seconds
    intervalRef.current = setInterval(fetchUnread, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchUnread]);

  return (
    <UnreadMessagesContext.Provider value={{ unreadCount, refresh: fetchUnread }}>
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  return useContext(UnreadMessagesContext);
}
